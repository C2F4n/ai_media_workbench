package org.example.ai_media_workbench.service.impl;

import java.net.URI;
import java.net.http.*;
import java.nio.file.*;
import java.time.*;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicReference;
import org.example.ai_media_workbench.common.ai.AsrModel;
import org.example.ai_media_workbench.common.exception.*;
import org.example.ai_media_workbench.dto.transcript.TranscriptionRequest;
import org.example.ai_media_workbench.properties.AiProperties;
import org.example.ai_media_workbench.service.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import tools.jackson.databind.*;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class AsrModelTests {
    @TempDir Path root;
    private final ObjectMapper json=new ObjectMapper();

    @Test void legacyRequestsKeepTheirOriginalModelAndInvalidModelsAreRejected() {
        assertThat(AsrModel.resolve("aliyun",null)).isEqualTo(AsrModel.ALIYUN_PARAFORMER);
        assertThat(AsrModel.resolve("tencent",null)).isEqualTo(AsrModel.TENCENT_ZH);
        assertThat(json.readValue("{\"language\":\"zh-CN\",\"provider\":\"aliyun\"}",TranscriptionRequest.class).model()).isNull();
        for (String id:List.of("", "qwen-plus", "16k_zh", "qwen-audio-3.1-asr-flash-filetrans", "https://example.com"))
            assertThatThrownBy(()->AsrModel.resolve("aliyun",id)).isInstanceOfSatisfying(BusinessException.class,
                    error->assertThat(error.code()).isEqualTo(ErrorCode.INVALID_PARAMETERS));
        assertThatThrownBy(()->AsrModel.resolve("tencent",AsrModel.ALIYUN_QWEN.id())).isInstanceOf(BusinessException.class);
    }

    @Test void selectedAliyunModelsAreActuallySentAndUseOnlyFinalRealTimestamps() throws Exception {
        Path audio=root.resolve("audio.mp3"); Files.write(audio,new byte[]{1,2,3});
        for (var model:List.of(AsrModel.ALIYUN_QWEN,AsrModel.ALIYUN_FUN,AsrModel.ALIYUN_PARAFORMER)) {
            var credentials=mock(CloudCredentialService.class); var transport=mock(CloudTransport.class);
            var client=mock(HttpClient.class); var builder=mock(WebSocket.Builder.class,RETURNS_SELF); var socket=mock(WebSocket.class);
            when(credentials.effective("owner","aliyun")).thenReturn(new AiProperties("","","","sk-test","workspace-test","","deepseek-flash"));
            when(transport.client()).thenReturn(client); when(client.newWebSocketBuilder()).thenReturn(builder);
            var listener=new AtomicReference<WebSocket.Listener>(); var payload=new AtomicReference<JsonNode>();
            when(builder.buildAsync(any(URI.class),any())).thenAnswer(call->{
                listener.set(call.getArgument(1)); return CompletableFuture.completedFuture(socket);
            });
            when(socket.sendBinary(any(),eq(true))).thenReturn(CompletableFuture.completedFuture(socket));
            when(socket.sendText(any(),eq(true))).thenAnswer(call->{
                var message=json.readTree(call.getArgument(0,CharSequence.class).toString());
                String taskId=message.path("header").path("task_id").asText();
                if (message.path("header").path("action").asText().equals("run-task")) {
                    payload.set(message.path("payload"));
                    event(listener.get(),socket,taskId,"task-started",Map.of());
                } else {
                    event(listener.get(),socket,taskId,"result-generated",Map.of("output",Map.of("sentence",Map.of("text","中间结果","sentence_end",false))));
                    event(listener.get(),socket,taskId,"result-generated",Map.of("output",Map.of("sentence",Map.of("text","学而时习之。","begin_time",120,"end_time",980,"sentence_end",true))));
                    event(listener.get(),socket,taskId,"task-finished",Map.of());
                }
                return CompletableFuture.completedFuture(socket);
            });
            var recognizer=new CloudSpeechRecognizer(credentials,json,Clock.systemUTC(),transport);
            assertThat(recognizer.recognize("aliyun",model.id(),audio,Duration.ofSeconds(3),()->false,"owner"))
                    .containsExactly(new SpeechRecognizer.RecognizedSegment(120,980,"学而时习之。"));
            assertThat(payload.get().path("model").asText()).isEqualTo(model.id());
            assertThat(payload.get().path("parameters").path("format").asText()).isEqualTo("mp3");
            assertThat(payload.get().path("parameters").path("sample_rate").asInt()).isEqualTo(16000);
            assertThat(payload.get().path("input").isEmpty()).isTrue();
            assertThat(payload.get().path("parameters").path("language_hints").size()).isEqualTo(model==AsrModel.ALIYUN_PARAFORMER ? 2 : 1);
            verify(builder,times(1)).buildAsync(eq(URI.create("wss://workspace-test.cn-beijing.maas.aliyuncs.com/api-ws/v1/inference")),any());
            verify(socket,times(2)).sendText(any(),eq(true)); verify(socket).sendBinary(any(),eq(true)); verify(socket).abort();
            verify(transport,never()).post(any(),anyLong(),any(),any());
        }
    }

    @Test void invalidModelNeverOpensAConnectionOrReadsAudio() {
        var credentials=mock(CloudCredentialService.class); var transport=mock(CloudTransport.class);
        var recognizer=new CloudSpeechRecognizer(credentials,json,Clock.systemUTC(),transport);
        assertThatThrownBy(()->recognizer.recognize("tencent",AsrModel.ALIYUN_QWEN.id(),root.resolve("missing"),Duration.ofSeconds(3),()->false,"owner"))
                .isInstanceOfSatisfying(BusinessException.class,error->assertThat(error.code()).isEqualTo(ErrorCode.INVALID_PARAMETERS));
        verifyNoInteractions(credentials,transport);
    }

    private void event(WebSocket.Listener listener,WebSocket socket,String id,String name,Map<String,?> payload) {
        listener.onText(socket,json.writeValueAsString(Map.of("header",Map.of("task_id",id,"event",name),"payload",payload)),true);
    }
}
