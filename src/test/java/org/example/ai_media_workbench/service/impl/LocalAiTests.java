package org.example.ai_media_workbench.service.impl;

import com.sun.net.httpserver.HttpServer;
import java.net.*;
import java.net.http.*;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.*;
import java.util.concurrent.*;
import org.example.ai_media_workbench.common.exception.*;
import org.example.ai_media_workbench.dto.cloud.SaveCloudCredentialRequest.Mode;
import org.example.ai_media_workbench.properties.LocalAiProperties;
import org.example.ai_media_workbench.service.CloudCredentialService;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import tools.jackson.databind.ObjectMapper;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class LocalAiTests {
    private final ObjectMapper json = new ObjectMapper();
    private LocalAiClient local(CloudTransport transport) {
        return new LocalAiClient(new LocalAiProperties(true,18565,"qwen3.5-4b","local-test-key"),transport,json);
    }
    private byte[] completion(String content, String finish) {
        return json.writeValueAsBytes(Map.of("choices",List.of(Map.of("finish_reason",finish,"message",Map.of("content",content)))));
    }
    private CloudTransport readyTransport() {
        var transport=mock(CloudTransport.class);
        when(transport.get(any(),anyLong(),any())).thenReturn("{\"status\":\"ok\"}".getBytes(StandardCharsets.UTF_8));
        return transport;
    }
    @Test void healthIsBoundedCachedAndDoesNotCallInferenceOrExposeSecrets() {
        var transport=readyTransport(); var local=local(transport);
        assertThat(local.isAvailable()).isTrue(); assertThat(local.isAvailable()).isTrue();
        var request=ArgumentCaptor.forClass(HttpRequest.class);
        verify(transport,times(1)).get(request.capture(),anyLong(),eq(ErrorCode.LOCAL_AI_UNAVAILABLE));
        assertThat(request.getValue().uri()).isEqualTo(URI.create("http://127.0.0.1:18565/health"));
        assertThat(request.getValue().timeout()).contains(Duration.ofMillis(700));
        verify(transport,never()).post(any(),anyLong(),any(),any(),any());
        assertThat(new LocalAiProperties(true,18565,"qwen3.5-4b","local-test-key").toString()).doesNotContain("local-test-key");
        for(var invalid:List.of(new LocalAiProperties(false,18565,"qwen",""),new LocalAiProperties(true,80,"qwen",""),
                new LocalAiProperties(true,18565,"../../model",""))) {
            assertThat(new LocalAiClient(invalid,transport,json).isAvailable()).isFalse();
        }
    }
    @Test void stoppedLoadingOrMalformedHealthIsUnavailableWithoutInference() {
        for(byte[] body:List.of("{\"status\":\"loading model\"}".getBytes(),"not JSON".getBytes(),"{}".getBytes())) {
            var transport=readyTransport(); when(transport.get(any(),anyLong(),any())).thenReturn(body);
            var local=local(transport); assertThat(local.isAvailable()).isFalse();
            assertThatThrownBy(()->local.complete("JSON","text",100,ErrorCode.AI_FAILED))
                    .isInstanceOfSatisfying(BusinessException.class,e->assertThat(e.code()).isEqualTo(ErrorCode.LOCAL_AI_UNAVAILABLE));
            verify(transport,never()).post(any(),anyLong(),any(),any(),any());
        }
        var transport=readyTransport(); when(transport.get(any(),anyLong(),any())).thenThrow(new BusinessException(ErrorCode.LOCAL_AI_UNAVAILABLE));
        assertThat(local(transport).isAvailable()).isFalse();
    }
    @Test void localRequestsRequireJsonDisableThinkingAndRejectMarkdownTruncationAndNonObjects() throws Exception {
        var transport=readyTransport(); var local=local(transport);
        when(transport.post(any(),anyLong(),any(),any(),any())).thenReturn(completion("{\"text\":\"正确\"}","stop"));
        assertThat(local.complete("只输出JSON","字幕",200,ErrorCode.AI_FAILED).path("text").asText()).isEqualTo("正确");
        var request=ArgumentCaptor.forClass(HttpRequest.class);
        verify(transport).post(request.capture(),anyLong(),any(),eq(ErrorCode.LOCAL_AI_UNAVAILABLE),eq(ErrorCode.AI_FAILED));
        assertThat(request.getValue().uri()).isEqualTo(URI.create("http://127.0.0.1:18565/v1/chat/completions"));
        assertThat(request.getValue().headers().firstValue("Authorization")).contains("Bearer local-test-key");
        var body=json.readTree(body(request.getValue()));
        assertThat(body.path("model").asText()).isEqualTo("qwen3.5-4b");
        assertThat(body.path("response_format").path("type").asText()).isEqualTo("json_object");
        assertThat(body.path("chat_template_kwargs").path("enable_thinking").asBoolean()).isFalse();
        assertThat(body.path("stream").asBoolean()).isFalse();
        for(String invalid:List.of("```json\n{\"text\":\"x\"}\n```","[]","not JSON")) {
            when(transport.post(any(),anyLong(),any(),any(),any())).thenReturn(completion(invalid,"stop"));
            assertThatThrownBy(()->local.complete("JSON","text",100,ErrorCode.AI_FAILED))
                    .isInstanceOfSatisfying(BusinessException.class,e->assertThat(e.code()).isEqualTo(ErrorCode.AI_FAILED));
        }
        when(transport.post(any(),anyLong(),any(),any(),any())).thenReturn(completion("{}","length"));
        assertThatThrownBy(()->local.complete("JSON","text",100,ErrorCode.AI_FAILED)).isInstanceOf(BusinessException.class);
        when(transport.post(any(),anyLong(),any(),any(),any())).thenReturn(completion("{}","stop"));
        assertThat(local.complete("JSON","text",100,ErrorCode.AI_FAILED).isObject()).isTrue();
    }
    @Test void connectionFailureInvalidatesReadinessAndNeverFallsBackToCloud() {
        var transport=readyTransport(); var local=local(transport);
        when(transport.post(any(),anyLong(),any(),any(),any())).thenThrow(new BusinessException(ErrorCode.LOCAL_AI_UNAVAILABLE));
        var credentials=mock(CloudCredentialService.class); when(credentials.source("user","deepseek")).thenReturn(Mode.SERVER);
        var cloud=mock(DeepSeekJsonClient.class); var client=new TextAiJsonClient(credentials,cloud,local);
        assertThatThrownBy(()->client.complete("JSON","text",100,ErrorCode.AI_PLAN_FAILED,"user"))
                .isInstanceOfSatisfying(BusinessException.class,e->assertThat(e.code()).isEqualTo(ErrorCode.LOCAL_AI_UNAVAILABLE));
        assertThat(local.isAvailable()).isFalse(); verifyNoInteractions(cloud);
    }
    @Test void sourcesAreExclusiveAndNeverRetryTheOtherSource() {
        var credentials=mock(CloudCredentialService.class); var cloud=mock(DeepSeekJsonClient.class); var local=mock(LocalAiClient.class);
        var client=new TextAiJsonClient(credentials,cloud,local);
        when(credentials.source("user","deepseek")).thenReturn(Mode.PERSONAL);
        when(cloud.complete(any(),any(),anyInt(),any(),any())).thenThrow(new BusinessException(ErrorCode.AI_PLAN_FAILED));
        assertThatThrownBy(()->client.complete("JSON","text",100,ErrorCode.AI_PLAN_FAILED,"user")).isInstanceOf(BusinessException.class);
        verifyNoInteractions(local);
        when(credentials.source("user","deepseek")).thenReturn(Mode.OFF);
        assertThatThrownBy(()->client.complete("JSON","text",100,ErrorCode.AI_PLAN_FAILED,"user"))
                .isInstanceOfSatisfying(BusinessException.class,e->assertThat(e.code()).isEqualTo(ErrorCode.AI_UNAVAILABLE));
        assertThatThrownBy(()->client.complete("JSON","text",100,ErrorCode.AI_PLAN_FAILED,null))
                .isInstanceOfSatisfying(BusinessException.class,e->assertThat(e.code()).isEqualTo(ErrorCode.UNAUTHENTICATED));
        verify(cloud,times(1)).complete(any(),any(),anyInt(),any(),any());
    }
    @Test void localConcurrencyIsOneAndPermitIsReleasedAfterCompletion() throws Exception {
        var transport=readyTransport(); var local=local(transport);
        var entered=new CountDownLatch(1); var release=new CountDownLatch(1);
        when(transport.post(any(),anyLong(),any(),any(),any())).thenAnswer(call->{
            entered.countDown(); if(!release.await(3,TimeUnit.SECONDS)) throw new IllegalStateException("test timeout");
            return completion("{}","stop");
        });
        try(var pool=Executors.newSingleThreadExecutor()) {
            var first=pool.submit(()->local.complete("JSON","text",100,ErrorCode.AI_FAILED));
            try {
                assertThat(entered.await(2,TimeUnit.SECONDS)).isTrue();
                assertThatThrownBy(()->local.complete("JSON","second",100,ErrorCode.AI_FAILED))
                        .isInstanceOfSatisfying(BusinessException.class,e->assertThat(e.code()).isEqualTo(ErrorCode.AI_BUSY));
            } finally { release.countDown(); }
            assertThat(first.get(2,TimeUnit.SECONDS).isObject()).isTrue();
            assertThat(local.complete("JSON","third",100,ErrorCode.AI_FAILED).isObject()).isTrue();
        }
    }
    @Test void realLoopbackTransportHandlesGetSuccessAndRefusesRedirectsAndInputRejections() throws Exception {
        var server=HttpServer.create(new InetSocketAddress("127.0.0.1",0),0);
        try(var pool=Executors.newVirtualThreadPerTaskExecutor()) {
            server.setExecutor(pool);
            server.createContext("/health",exchange->{ var bytes="{\"status\":\"ok\"}".getBytes(); exchange.sendResponseHeaders(200,bytes.length); exchange.getResponseBody().write(bytes); exchange.close(); });
            server.createContext("/reject",exchange->{exchange.sendResponseHeaders(400,-1);exchange.close();});
            server.createContext("/redirect",exchange->{exchange.getResponseHeaders().add("Location","/health");exchange.sendResponseHeaders(302,-1);exchange.close();});
            server.start(); var transport=new CloudTransport();
            try {
                String base="http://127.0.0.1:"+server.getAddress().getPort();
                assertThat(new String(transport.get(HttpRequest.newBuilder(URI.create(base+"/health")).GET().build(),
                        System.nanoTime()+Duration.ofSeconds(3).toNanos(),ErrorCode.LOCAL_AI_UNAVAILABLE))).contains("ok");
                for(String path:List.of("/reject","/redirect")) {
                    assertThatThrownBy(()->transport.post(HttpRequest.newBuilder(URI.create(base+path)).POST(HttpRequest.BodyPublishers.noBody()).build(),
                            System.nanoTime()+Duration.ofSeconds(3).toNanos(),()->false,ErrorCode.LOCAL_AI_UNAVAILABLE,ErrorCode.AI_PLAN_FAILED))
                            .isInstanceOfSatisfying(BusinessException.class,e->assertThat(e.code()).isEqualTo(path.equals("/reject") ? ErrorCode.AI_PLAN_FAILED : ErrorCode.LOCAL_AI_UNAVAILABLE));
                }
            } finally { transport.destroy(); server.stop(0); }
        }
    }
    private byte[] body(HttpRequest request) throws Exception {
        var bytes=new java.io.ByteArrayOutputStream(); var finished=new CompletableFuture<Void>();
        request.bodyPublisher().orElseThrow().subscribe(new Flow.Subscriber<ByteBuffer>() {
            public void onSubscribe(Flow.Subscription subscription) { subscription.request(Long.MAX_VALUE); }
            public void onNext(ByteBuffer buffer) { var chunk=new byte[buffer.remaining()]; buffer.get(chunk); bytes.writeBytes(chunk); }
            public void onComplete() { finished.complete(null); }
            public void onError(Throwable error) { finished.completeExceptionally(error); }
        });
        finished.get(1,TimeUnit.SECONDS); return bytes.toByteArray();
    }
}
