package org.example.ai_media_workbench.service.impl;

import com.sun.net.httpserver.HttpServer;
import java.net.*;
import java.net.http.*;
import java.nio.file.*;
import java.nio.charset.StandardCharsets;
import java.time.*;
import java.util.*;
import java.util.concurrent.*;
import org.example.ai_media_workbench.common.exception.*;
import org.example.ai_media_workbench.properties.AiProperties;
import org.example.ai_media_workbench.service.SpeechRecognizer;
import org.example.ai_media_workbench.service.OperationPlanner;
import org.example.ai_media_workbench.service.TranscriptAnalyzer;
import org.example.ai_media_workbench.dto.transcript.TranscriptSegment;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.io.TempDir;
import org.mockito.ArgumentCaptor;
import tools.jackson.databind.ObjectMapper;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class CloudAiTests {
    private static final String USER="11111111-1111-4111-8111-111111111111";
    @TempDir Path root;
    private final ObjectMapper json=new ObjectMapper();
    private final AiProperties configured=new AiProperties("123456","SecretIdForTests","SecretKeyForTests","sk-aliyun-tests","workspace-tests","sk-deepseek-tests","deepseek-flash");

    @Test void missingOrMalformedCredentialsFailClosedAndNeverAppearInToString() {
        var empty=new AiProperties("","","","","","","deepseek-flash");
        assertThat(empty.tencentReady()).isFalse(); assertThat(empty.aliyunReady()).isFalse(); assertThat(empty.deepseekReady()).isFalse();
        assertThat(configured.tencentReady()).isTrue(); assertThat(configured.aliyunReady()).isTrue(); assertThat(configured.deepseekReady()).isTrue();
        assertThat(configured.toString()).doesNotContain("SecretKeyForTests","sk-aliyun-tests","sk-deepseek-tests");
        assertThat(new AiProperties("123","id","secret","key","evil/../../host","key","model").aliyunReady()).isFalse();
        var recognizer=new CloudSpeechRecognizer(credentials(empty),json,Clock.systemUTC(),mock(CloudTransport.class));
        assertThat(recognizer.providers(USER)).isEmpty();
        assertThatThrownBy(()->recognizer.recognize("tencent",root.resolve("missing"),Duration.ofSeconds(1),()->false,USER))
                .isInstanceOfSatisfying(BusinessException.class,error->assertThat(error.code()).isEqualTo(ErrorCode.ASR_UNAVAILABLE));
    }

    @Test void tencentRequestUsesSortedSignedParametersAndRealSentenceTimestamps() throws Exception {
        assertThat(CloudSpeechRecognizer.signature("The quick brown fox jumps over the lazy dog","key")).isEqualTo("3nybhbi3iqa8ino29wqQcBydtNk=");
        var transport=mock(CloudTransport.class);
        when(transport.post(any(),anyLong(),any(),any())).thenReturn("{\"code\":0,\"flash_result\":[{\"channel_id\":0,\"sentence_list\":[{\"text\":\"真实接口格式\",\"start_time\":123,\"end_time\":456}]}]}".getBytes(StandardCharsets.UTF_8));
        var instant=Instant.parse("2026-10-20T00:00:00Z");
        var recognizer=new CloudSpeechRecognizer(credentials(configured),json,Clock.fixed(instant,ZoneOffset.UTC),transport);
        Path audio=root.resolve("audio.mp3"); Files.write(audio,new byte[]{1,2,3});
        var result=recognizer.recognize("tencent",audio,Duration.ofSeconds(3),()->false,USER);
        assertThat(result).containsExactly(new SpeechRecognizer.RecognizedSegment(123,456,"真实接口格式"));
        var request=ArgumentCaptor.forClass(HttpRequest.class); verify(transport).post(request.capture(),anyLong(),any(),eq(ErrorCode.ASR_FAILED));
        String address="asr.cloud.tencent.com/asr/flash/v1/123456?engine_type=16k_zh&first_channel_only=1&secretid=SecretIdForTests&sentence_max_length=32&timestamp="+instant.getEpochSecond()+"&voice_format=mp3&word_info=3";
        assertThat(request.getValue().uri().toString()).isEqualTo("https://"+address);
        assertThat(request.getValue().headers().firstValue("Authorization")).contains(CloudSpeechRecognizer.signature("POST"+address,"SecretKeyForTests"));
        assertThat(request.getValue().bodyPublisher().orElseThrow().contentLength()).isEqualTo(3);
        assertThatThrownBy(()->CloudSpeechRecognizer.tencentSegments(json.readTree("{\"code\":4002,\"message\":\"sensitive vendor detail\"}")))
                .isInstanceOfSatisfying(BusinessException.class,error->assertThat(error.getMessage()).doesNotContain("sensitive"));
        assertThatThrownBy(()->CloudSpeechRecognizer.tencentSegments(json.readTree("{\"code\":0,\"flash_result\":[{\"channel_id\":0,\"sentence_list\":[{\"text\":\"bad\",\"start_time\":0.5,\"end_time\":100}]}]}")))
                .isInstanceOf(BusinessException.class);
    }

    @Test void aliyunIgnoresInterimAndHeartbeatUsesOnlyActualFinalTimestampsAndHandlesFragments() {
        var socket=mock(WebSocket.class); var listener=new CloudSpeechRecognizer.RecognitionListener("task",json);
        listener.onOpen(socket);
        event(listener,socket,"task-started",Map.of()); assertThat(listener.started).isCompleted();
        event(listener,socket,"result-generated",Map.of("output",Map.of("sentence",Map.of("sentence_end",false,"text","interim"))));
        event(listener,socket,"result-generated",Map.of("output",Map.of("sentence",Map.of("sentence_end",true,"heartbeat",true,"text","heartbeat"))));
        var sentence=new LinkedHashMap<String,Object>(); sentence.put("sentence_end",true); sentence.put("text","最终字幕");
        sentence.put("begin_time",100); sentence.put("end_time",null); sentence.put("words",List.of(Map.of("end_time",800)));
        event(listener,socket,"result-generated",Map.of("output",Map.of("sentence",sentence)));
        event(listener,socket,"task-finished",Map.of());
        assertThat(listener.finished).isCompleted(); assertThat(listener.segments).containsExactly(new SpeechRecognizer.RecognizedSegment(100,800,"最终字幕"));
        var failed=new CloudSpeechRecognizer.RecognitionListener("task",json); event(failed,socket,"task-failed",Map.of());
        assertThat(failed.started).isCompletedExceptionally(); assertThat(failed.finished).isCompletedExceptionally();
        var wrong=new CloudSpeechRecognizer.RecognitionListener("different",json); event(wrong,socket,"task-started",Map.of());
        assertThat(wrong.finished).isCompletedExceptionally();
        var disconnected=new CloudSpeechRecognizer.RecognitionListener("task",json); disconnected.onClose(socket,1000,"bye");
        assertThat(disconnected.finished).isCompletedExceptionally();
    }

    @Test void deepseekUsesJsonAndReturnsOnlyValidatedTextWithoutToolsOrTimeChanges() {
        var transport=mock(CloudTransport.class); var corrector=new DeepSeekSubtitleCorrector(new DeepSeekJsonClient(credentials(configured),transport,json),json);
        String content=json.writeValueAsString(Map.of("text","校对结果。"));
        when(transport.post(any(),anyLong(),any(),any())).thenReturn(json.writeValueAsBytes(Map.of("choices",List.of(Map.of("finish_reason","stop","message",Map.of("content",content))))));
        assertThat(corrector.correct("原文",USER)).isEqualTo("校对结果。");
        var request=ArgumentCaptor.forClass(HttpRequest.class); verify(transport).post(request.capture(),anyLong(),any(),eq(ErrorCode.AI_FAILED));
        assertThat(request.getValue().uri()).isEqualTo(URI.create("https://api.deepseek.com/chat/completions"));
        assertThat(request.getValue().headers().firstValue("Authorization")).contains("Bearer sk-deepseek-tests");
        for(String modelContent:List.of("not JSON","{\"text\":\"x\",\"startMs\":0}","{\"text\":\"\"}","{\"text\":\"x\\n\\ny\"}")) {
            when(transport.post(any(),anyLong(),any(),any())).thenReturn(json.writeValueAsBytes(Map.of("choices",List.of(Map.of("finish_reason","stop","message",Map.of("content",modelContent))))));
            assertThatThrownBy(()->corrector.correct("原文",USER)).isInstanceOfSatisfying(BusinessException.class,e->assertThat(e.code()).isEqualTo(ErrorCode.AI_FAILED));
        }
        when(transport.post(any(),anyLong(),any(),any())).thenReturn(json.writeValueAsBytes(Map.of("choices",List.of(Map.of("finish_reason","length","message",Map.of("content",content))))));
        assertThatThrownBy(()->corrector.correct("原文",USER)).isInstanceOf(BusinessException.class);
    }

    @Test void plannerUsesTheSharedJsonApiAndOnlySendsInstructionAndControlledMetadata() throws Exception {
        var transport=mock(CloudTransport.class); var client=new DeepSeekJsonClient(credentials(configured),transport,json);
        var planner=new DeepSeekOperationPlanner(client,json);
        String content="{\"parameters\":{\"operation\":\"mute\",\"outputFormat\":\"mp4\",\"resolutionPreset\":\"source\"}}";
        when(transport.post(any(),anyLong(),any(),any())).thenReturn(json.writeValueAsBytes(Map.of("choices",List.of(Map.of("finish_reason","stop","message",Map.of("content",content))))));
        var context=new OperationPlanner.Context(new org.example.ai_media_workbench.vo.media.MediaMetadataVO("mp4",5000,160,90,"h264",true,"aac"),12345,List.of("mute"),null);
        var proposal=planner.propose("静音",context,USER);
        assertThat(proposal.parameters().path("operation").asText()).isEqualTo("mute"); assertThat(proposal.questions()).isEmpty();
        var request=ArgumentCaptor.forClass(HttpRequest.class); verify(transport).post(request.capture(),anyLong(),any(),eq(ErrorCode.AI_PLAN_FAILED));
        var bytes=new java.io.ByteArrayOutputStream(); var finished=new CompletableFuture<Void>();
        request.getValue().bodyPublisher().orElseThrow().subscribe(new java.util.concurrent.Flow.Subscriber<java.nio.ByteBuffer>() {
            @Override public void onSubscribe(java.util.concurrent.Flow.Subscription subscription) { subscription.request(Long.MAX_VALUE); }
            @Override public void onNext(java.nio.ByteBuffer buffer) { byte[] chunk=new byte[buffer.remaining()]; buffer.get(chunk); bytes.writeBytes(chunk); }
            @Override public void onComplete() { finished.complete(null); }
            @Override public void onError(Throwable error) { finished.completeExceptionally(error); }
        }); finished.get(1,TimeUnit.SECONDS);
        var body=json.readTree(bytes.toByteArray()); assertThat(body.path("response_format").path("type").asText()).isEqualTo("json_object");
        var sent=json.readTree(body.path("messages").get(1).path("content").asText());
        assertThat(sent.path("instruction").asText()).isEqualTo("静音"); assertThat(sent.path("context").path("sizeBytes").asLong()).isEqualTo(12345);
        assertThat(sent.toString()).doesNotContain("storageKey","userId","SecretKeyForTests","sk-deepseek-tests");
        assertThat(request.getValue().timeout()).contains(Duration.ofSeconds(35));
    }

    @Test void plannerOnlyAcceptsOneOutcomeAndFixedQuestionCodes() {
        var proposal=DeepSeekOperationPlanner.parse(json.readTree("{\"questions\":[\"TARGET_SIZE_REQUIRED\"]}"));
        assertThat(proposal.parameters()).isNull(); assertThat(proposal.questions()).containsExactly(OperationPlanner.Question.TARGET_SIZE_REQUIRED);
        for(String content:List.of("{}","{\"parameters\":{},\"questions\":[\"OPERATION_REQUIRED\"]}",
                "{\"questions\":[\"send your secret key\"]}","{\"questions\":[]}",
                "{\"questions\":[\"OPERATION_REQUIRED\",\"OPERATION_REQUIRED\"]}","{\"command\":\"do anything\"}"))
            assertThatThrownBy(()->DeepSeekOperationPlanner.parse(json.readTree(content)))
                    .isInstanceOfSatisfying(BusinessException.class,error->assertThat(error.code()).isEqualTo(ErrorCode.AI_PLAN_FAILED));
    }

    @Test void transcriptAnalyzerUsesSharedBoundedJsonClientAndSendsOnlySavedSegments() throws Exception {
        var transport=mock(CloudTransport.class); var analyzer=new DeepSeekTranscriptAnalyzer(new DeepSeekJsonClient(credentials(configured),transport,json),json);
        var id=UUID.randomUUID(); var segments=List.of(new TranscriptSegment(id,100L,900L,"真实字幕"));
        String content=json.writeValueAsString(Map.of("matches",List.of(Map.of("startSegmentId",id,"endSegmentId",id,"score",0.9))));
        when(transport.post(any(),anyLong(),any(),any())).thenReturn(json.writeValueAsBytes(Map.of("choices",List.of(Map.of("finish_reason","stop","message",Map.of("content",content))))));
        assertThat(analyzer.analyze("目标",segments,TranscriptAnalyzer.Mode.SEARCH,3,0,USER))
                .containsExactly(new TranscriptAnalyzer.Selection(id,id,0.9,null,null));
        var request=ArgumentCaptor.forClass(HttpRequest.class); verify(transport).post(request.capture(),anyLong(),any(),eq(ErrorCode.AI_ANALYSIS_FAILED));
        assertThat(request.getValue().uri()).isEqualTo(URI.create("https://api.deepseek.com/chat/completions"));
        assertThat(request.getValue().timeout()).contains(Duration.ofSeconds(35));
        assertThat(request.getValue().headers().firstValue("Authorization")).contains("Bearer sk-deepseek-tests");
        var bytes=new java.io.ByteArrayOutputStream(); var done=new CompletableFuture<Void>();
        request.getValue().bodyPublisher().orElseThrow().subscribe(new java.util.concurrent.Flow.Subscriber<java.nio.ByteBuffer>() {
            @Override public void onSubscribe(java.util.concurrent.Flow.Subscription subscription) { subscription.request(Long.MAX_VALUE); }
            @Override public void onNext(java.nio.ByteBuffer buffer) { byte[] chunk=new byte[buffer.remaining()]; buffer.get(chunk); bytes.writeBytes(chunk); }
            @Override public void onComplete() { done.complete(null); }
            @Override public void onError(Throwable error) { done.completeExceptionally(error); }
        }); done.get(1,TimeUnit.SECONDS);
        var body=json.readTree(bytes.toByteArray()); var sent=json.readTree(body.path("messages").get(1).path("content").asText());
        assertThat(body.path("response_format").path("type").asText()).isEqualTo("json_object");
        assertThat(sent.propertyNames()).containsExactlyInAnyOrder("query","segments","mode","limit","maxTotalDurationMs");
        assertThat(sent.path("segments")).isEqualTo(json.readTree(json.writeValueAsBytes(segments)));
        assertThat(sent.path("query").asText()).isEqualTo("目标"); assertThat(sent.path("limit").asInt()).isEqualTo(3);
        assertThat(sent.toString()).doesNotContain("storageKey","userId","sk-deepseek-tests","SecretKeyForTests");
    }

    @Test void transcriptAnalyzerRejectsUnexpectedFieldsMalformedIdsScoresAndExcessResults() {
        String id=UUID.randomUUID().toString();
        String valid="{\"startSegmentId\":\""+id+"\",\"endSegmentId\":\""+id+"\",\"score\":0.8}";
        assertThat(DeepSeekTranscriptAnalyzer.parse(json.readTree("{\"matches\":[]}"),TranscriptAnalyzer.Mode.SEARCH,1)).isEmpty();
        assertThat(DeepSeekTranscriptAnalyzer.parse(json.readTree("{\"clips\":[]}"),TranscriptAnalyzer.Mode.RECOMMEND,1)).isEmpty();
        for(String content:List.of("{}","{\"matches\":null}","{\"matches\":[],\"command\":\"x\"}",
                "{\"matches\":["+valid+","+valid+"]}","{\"matches\":["+valid.replace("0.8","1.1")+"]}",
                "{\"matches\":["+valid.replace("0.8","\"0.8\"")+"]}","{\"matches\":["+valid.replace(id,"bad-id")+"]}",
                "{\"matches\":["+valid.replace("0.8}","0.8,\"startMs\":100}")+"]}","{\"matches\":[null]}"))
            assertThatThrownBy(()->DeepSeekTranscriptAnalyzer.parse(json.readTree(content),TranscriptAnalyzer.Mode.SEARCH,1))
                    .isInstanceOfSatisfying(BusinessException.class,error->assertThat(error.code()).isEqualTo(ErrorCode.AI_ANALYSIS_FAILED));
        var clip=json.readTree("{\"clips\":[{\"startSegmentId\":\""+id+"\",\"endSegmentId\":\""+id+"\",\"title\":\"标题\",\"reason\":\"理由\"}]}");
        assertThat(DeepSeekTranscriptAnalyzer.parse(clip,TranscriptAnalyzer.Mode.RECOMMEND,1)).hasSize(1);
        ((tools.jackson.databind.node.ObjectNode)clip.path("clips").get(0)).put("evidence","fabricated");
        assertThatThrownBy(()->DeepSeekTranscriptAnalyzer.parse(clip,TranscriptAnalyzer.Mode.RECOMMEND,1)).isInstanceOf(BusinessException.class);
    }

    @Test void sharedTextClientLimitsConcurrencyAndReleasesSlots() throws Exception {
        var transport=mock(CloudTransport.class); var client=new DeepSeekJsonClient(credentials(configured),transport,json);
        var entered=new CountDownLatch(2); var release=new CountDownLatch(1);
        when(transport.post(any(),anyLong(),any(),any())).thenAnswer(call->{
            entered.countDown(); if(!release.await(3,TimeUnit.SECONDS)) throw new IllegalStateException("test timeout");
            return json.writeValueAsBytes(Map.of("choices",List.of(Map.of("finish_reason","stop","message",Map.of("content","{\"text\":\"ok\"}")))));
        });
        try(var executor=Executors.newFixedThreadPool(2)) {
            var first=executor.submit(()->client.complete("JSON","first",100,ErrorCode.AI_PLAN_FAILED,USER));
            var second=executor.submit(()->client.complete("JSON","second",100,ErrorCode.AI_PLAN_FAILED,USER));
            try {
                assertThat(entered.await(2,TimeUnit.SECONDS)).isTrue();
                assertThatThrownBy(()->client.complete("JSON","third",100,ErrorCode.AI_PLAN_FAILED,USER))
                        .isInstanceOfSatisfying(BusinessException.class,error->assertThat(error.code()).isEqualTo(ErrorCode.AI_BUSY));
            } finally { release.countDown(); }
            first.get(2,TimeUnit.SECONDS); second.get(2,TimeUnit.SECONDS);
            assertThat(client.complete("JSON","after",100,ErrorCode.AI_PLAN_FAILED,USER).path("text").asText()).isEqualTo("ok");
        }
    }

    @Test void transportBoundsResponsesRejectsRedirectsAndCancelsPendingRequests() throws Exception {
        var server=HttpServer.create(new InetSocketAddress("127.0.0.1",0),0);
        try(var executor=Executors.newVirtualThreadPerTaskExecutor()) {
            server.setExecutor(executor);
            server.createContext("/ok",exchange->{ var bytes="ok".getBytes(StandardCharsets.UTF_8); exchange.sendResponseHeaders(200,bytes.length); exchange.getResponseBody().write(bytes); exchange.close(); });
            server.createContext("/large",exchange->{ exchange.sendResponseHeaders(200,0); try(var body=exchange.getResponseBody()) { body.write(new byte[4*1024*1024+1]); } });
            server.createContext("/redirect",exchange->{ exchange.getResponseHeaders().add("Location","/ok"); exchange.sendResponseHeaders(302,-1); exchange.close(); });
            server.start(); var transport=new CloudTransport();
            try {
                String base="http://127.0.0.1:"+server.getAddress().getPort();
                assertThat(transport.post(request(base+"/ok"),System.nanoTime()+Duration.ofSeconds(3).toNanos(),()->false,ErrorCode.ASR_FAILED)).isEqualTo("ok".getBytes(StandardCharsets.UTF_8));
                for(String path:List.of("/large","/redirect")) assertThatThrownBy(()->transport.post(request(base+path),System.nanoTime()+Duration.ofSeconds(3).toNanos(),()->false,ErrorCode.ASR_FAILED)).isInstanceOf(BusinessException.class);
                var pending=new CompletableFuture<String>();
                assertThatThrownBy(()->CloudTransport.await(pending,System.nanoTime()+Duration.ofSeconds(2).toNanos(),()->true,ErrorCode.ASR_FAILED))
                        .isInstanceOfSatisfying(BusinessException.class,e->assertThat(e.code()).isEqualTo(ErrorCode.TASK_CANCELLED));
                assertThat(pending.isCancelled()).isTrue();
                var timeout=new CompletableFuture<String>();
                assertThatThrownBy(()->CloudTransport.await(timeout,System.nanoTime()-1,()->false,ErrorCode.ASR_FAILED))
                        .isInstanceOfSatisfying(BusinessException.class,e->assertThat(e.code()).isEqualTo(ErrorCode.TRANSCODE_TIMEOUT));
                assertThat(timeout.isCancelled()).isTrue();
            } finally { transport.destroy(); server.stop(0); }
        }
    }
    private org.example.ai_media_workbench.service.CloudCredentialService credentials(AiProperties settings) {
        var service=mock(org.example.ai_media_workbench.service.CloudCredentialService.class);
        when(service.effective(any(),anyString())).thenReturn(settings);
        when(service.available(any(),anyString())).thenAnswer(call->switch(call.getArgument(1,String.class)) {
            case "tencent" -> settings.tencentReady(); case "aliyun" -> settings.aliyunReady(); default -> settings.deepseekReady();
        });
        return service;
    }
    private HttpRequest request(String url) { return HttpRequest.newBuilder(URI.create(url)).timeout(Duration.ofSeconds(3)).POST(HttpRequest.BodyPublishers.noBody()).build(); }
    private void event(CloudSpeechRecognizer.RecognitionListener listener,WebSocket socket,String event,Map<String,?> payload) {
        String value=json.writeValueAsString(Map.of("header",Map.of("task_id","task","event",event),"payload",payload));
        listener.onText(socket,value.substring(0,value.length()/2),false); listener.onText(socket,value.substring(value.length()/2),true);
    }
}
