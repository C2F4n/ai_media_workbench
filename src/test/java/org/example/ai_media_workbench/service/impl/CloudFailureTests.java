package org.example.ai_media_workbench.service.impl;

import com.sun.net.httpserver.HttpServer;
import java.net.*;
import java.net.http.*;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.*;
import java.util.concurrent.*;
import org.example.ai_media_workbench.common.exception.*;
import org.example.ai_media_workbench.dto.cloud.SaveCloudCredentialRequest;
import org.example.ai_media_workbench.dto.transcript.TranscriptSegment;
import org.example.ai_media_workbench.properties.AiProperties;
import org.example.ai_media_workbench.service.*;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.ObjectMapper;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class CloudFailureTests {
    private final ObjectMapper json = new ObjectMapper();
    private static final List<ErrorCode> FAILURES = List.of(ErrorCode.CLOUD_AUTH_FAILED, ErrorCode.CLOUD_PERMISSION_DENIED,
            ErrorCode.CLOUD_QUOTA_EXCEEDED, ErrorCode.CLOUD_MODEL_UNAVAILABLE, ErrorCode.CLOUD_RATE_LIMITED,
            ErrorCode.CLOUD_REQUEST_REJECTED, ErrorCode.CLOUD_NETWORK_ERROR, ErrorCode.CLOUD_TIMEOUT, ErrorCode.CLOUD_SERVICE_UNAVAILABLE);

    @Test void classifiesHttpErrorsWithoutLeakingVendorBodiesOrChangingLoginState() {
        var statuses = Map.of(401, ErrorCode.CLOUD_AUTH_FAILED, 402, ErrorCode.CLOUD_QUOTA_EXCEEDED,
                403, ErrorCode.CLOUD_PERMISSION_DENIED, 404, ErrorCode.CLOUD_MODEL_UNAVAILABLE,
                429, ErrorCode.CLOUD_RATE_LIMITED, 400, ErrorCode.CLOUD_REQUEST_REJECTED,
                408, ErrorCode.CLOUD_TIMEOUT, 503, ErrorCode.CLOUD_SERVICE_UNAVAILABLE, 504, ErrorCode.CLOUD_TIMEOUT);
        statuses.forEach((status, code) -> {
            assertThat(CloudFailures.http(status, bytes("secret-key <html>private prompt</html>"))).isEqualTo(code);
            assertThat(code.status().value()).isNotEqualTo(401);
            assertThat(new BusinessException(code).getMessage()).doesNotContain("secret-key", "private prompt");
        });
        assertThat(CloudFailures.http(401, bytes("{\"error\":{\"code\":\"insufficient_quota\"}}"))).isEqualTo(ErrorCode.CLOUD_AUTH_FAILED);
        assertThat(CloudFailures.http(429, bytes("{\"error\":{\"code\":\"insufficient_quota\"}}"))).isEqualTo(ErrorCode.CLOUD_QUOTA_EXCEEDED);
        assertThat(CloudFailures.http(400, bytes("{\"code\":\"Arrearage\"}"))).isEqualTo(ErrorCode.CLOUD_QUOTA_EXCEEDED);
        assertThat(CloudFailures.http(403, bytes("{\"error\":{\"code\":\"Model.AccessDenied\"}}"))).isEqualTo(ErrorCode.CLOUD_MODEL_UNAVAILABLE);
        assertThat(CloudFailures.http(404, bytes("{\"error\":{\"code\":\"InvalidEndpointOrModel.NotFound\"}}"))).isEqualTo(ErrorCode.CLOUD_MODEL_UNAVAILABLE);
        assertThat(CloudFailures.http(400, bytes("{\"message\":\"invalid_api_key\",\"error\":{\"code\":\"unknown\"}}"))).isEqualTo(ErrorCode.CLOUD_REQUEST_REJECTED);
        assertThat(CloudFailures.http(429, bytes("{\"error\":{\"type\":\"insufficient_quota\"}}"))).isEqualTo(ErrorCode.CLOUD_QUOTA_EXCEEDED);
        assertThat(CloudFailures.http(429, bytes("{\"error\":{\"code\":\"credit_balance_exhausted\"}}"))).isEqualTo(ErrorCode.CLOUD_QUOTA_EXCEEDED);
        assertThat(CloudFailures.http(403, bytes("{\"error\":{\"code\":\"OperationDenied.ServiceOverdue\"}}"))).isEqualTo(ErrorCode.CLOUD_QUOTA_EXCEEDED);
    }

    @Test void httpTransportMapsErrorsOnceAndKeepsLocalModelErrorsSeparate() throws Exception {
        var server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        var hits = new java.util.concurrent.atomic.AtomicInteger();
        server.createContext("/", exchange -> {
            hits.incrementAndGet(); var body = bytes("{\"error\":{\"code\":\"invalid_api_key\",\"message\":\"secret-key\"}}");
            exchange.sendResponseHeaders(401, body.length);
            try (var output = exchange.getResponseBody()) { output.write(body); }
            exchange.close();
        });
        server.start(); var transport = new CloudTransport();
        try {
            var request = HttpRequest.newBuilder(URI.create("http://127.0.0.1:" + server.getAddress().getPort())).GET().build();
            expectCode(() -> transport.post(request, deadline(), () -> false, ErrorCode.AI_PLAN_FAILED), ErrorCode.CLOUD_AUTH_FAILED);
            assertThat(hits.get()).isEqualTo(1);
            expectCode(() -> transport.get(request, deadline(), ErrorCode.LOCAL_AI_UNAVAILABLE), ErrorCode.LOCAL_AI_UNAVAILABLE);
            assertThat(hits.get()).isEqualTo(2);
            expectCode(() -> transport.post(request, deadline(), () -> true, ErrorCode.AI_PLAN_FAILED), ErrorCode.TASK_CANCELLED);
            expectCode(() -> transport.post(request, System.nanoTime()-1, () -> false, ErrorCode.AI_PLAN_FAILED), ErrorCode.CLOUD_TIMEOUT);
            assertThat(hits.get()).isEqualTo(2);
        } finally { transport.destroy(); server.stop(0); }
    }

    @Test void cloudAwaitClassifiesNetworkTimeoutHandshakeAndPreservesCancellation() {
        expectCode(() -> CloudTransport.awaitCloud(CompletableFuture.failedFuture(new java.io.IOException("secret-url")), deadline(), () -> false, ErrorCode.ASR_FAILED), ErrorCode.CLOUD_NETWORK_ERROR);
        expectCode(() -> CloudTransport.awaitCloud(CompletableFuture.failedFuture(new CompletionException(new HttpTimeoutException("private"))), deadline(), () -> false, ErrorCode.ASR_FAILED), ErrorCode.CLOUD_TIMEOUT);
        var response = mock(HttpResponse.class); when(response.statusCode()).thenReturn(401);
        expectCode(() -> CloudTransport.awaitCloud(CompletableFuture.failedFuture(new WebSocketHandshakeException(response)), deadline(), () -> false, ErrorCode.ASR_FAILED), ErrorCode.CLOUD_AUTH_FAILED);
        var pending = new CompletableFuture<Void>();
        expectCode(() -> CloudTransport.awaitCloud(pending, System.nanoTime()-1, () -> false, ErrorCode.ASR_FAILED), ErrorCode.CLOUD_TIMEOUT);
        assertThat(pending.isCancelled()).isTrue();
        var cancelled = new CompletableFuture<Void>();
        expectCode(() -> CloudTransport.awaitCloud(cancelled, deadline(), () -> true, ErrorCode.ASR_FAILED), ErrorCode.TASK_CANCELLED);
        assertThat(cancelled.isCancelled()).isTrue();
        expectCode(() -> CloudTransport.awaitCloud(CompletableFuture.failedFuture(new BusinessException(ErrorCode.CLOUD_QUOTA_EXCEEDED)), deadline(), () -> false, ErrorCode.ASR_FAILED), ErrorCode.CLOUD_QUOTA_EXCEEDED);
    }

    @Test void everyTextFeaturePreservesCloudFailuresAndNeverRetriesOrFallsBack() {
        for (var failure : FAILURES) {
            var credentials = mock(CloudCredentialService.class); var local = mock(LocalAiClient.class); var transport = mock(CloudTransport.class);
            when(credentials.source("owner", "deepseek")).thenReturn(SaveCloudCredentialRequest.Mode.PERSONAL);
            when(credentials.available("owner", "deepseek")).thenReturn(true);
            when(credentials.effective("owner", "deepseek")).thenReturn(new AiProperties("", "", "", "", "", "sk-test", "deepseek-flash"));
            when(transport.post(any(), anyLong(), any(), any())).thenThrow(new BusinessException(failure));
            var client = new TextAiJsonClient(credentials, new CloudTextJsonClient(credentials, transport, json), local);
            var segments = List.of(new TranscriptSegment(UUID.randomUUID(), 0L, 1000L, "字幕"));
            var context = new OperationPlanner.Context(new org.example.ai_media_workbench.vo.media.MediaMetadataVO("mp4", 5000, 160, 90, "h264", true, "aac"),
                    12345, List.of("mute"), null, null, List.of(), List.of(), 1073741824L);
            expectCode(() -> new DeepSeekSubtitleCorrector(client, json).correct("字幕", "owner"), failure);
            expectCode(() -> new DeepSeekOperationPlanner(client, json).propose("静音", context, "owner"), failure);
            expectCode(() -> new DeepSeekTranscriptAnalyzer(client, json).analyze("主题", segments, TranscriptAnalyzer.Mode.SEARCH, 1, 1000, "owner"), failure);
            expectCode(() -> new AiSubtitleTranslator(client, json).translate(segments, "en", "owner"), failure);
            verify(transport, times(4)).post(any(), anyLong(), any(), any()); verifyNoInteractions(local);
        }
    }

    @Test void tencentNumericErrorsAndAliyunTaskFailuresRetainUsefulSafeCodes() {
        var codes = Map.of(4002, ErrorCode.CLOUD_AUTH_FAILED, 4003, ErrorCode.CLOUD_PERMISSION_DENIED,
                4004, ErrorCode.CLOUD_QUOTA_EXCEEDED, 4005, ErrorCode.CLOUD_QUOTA_EXCEEDED,
                4006, ErrorCode.CLOUD_RATE_LIMITED, 4008, ErrorCode.CLOUD_TIMEOUT, 5003, ErrorCode.CLOUD_TIMEOUT);
        codes.forEach((code, expected) -> expectCode(() -> CloudSpeechRecognizer.tencentSegments(json.readTree("{\"code\":" + code + ",\"message\":\"secret-key\"}")), expected));
        expectCode(() -> CloudSpeechRecognizer.tencentSegments(json.readTree("{\"code\":4294967296}")), ErrorCode.ASR_FAILED);
        for (var entry : Map.of("InvalidApiKey", ErrorCode.CLOUD_AUTH_FAILED, "Arrearage", ErrorCode.CLOUD_QUOTA_EXCEEDED,
                "Throttling", ErrorCode.CLOUD_RATE_LIMITED, "unknown", ErrorCode.ASR_FAILED).entrySet()) {
            var socket = mock(WebSocket.class); var listener = new CloudSpeechRecognizer.RecognitionListener("task", json);
            listener.onText(socket, json.writeValueAsString(Map.of("header", Map.of("task_id", "task", "event", "task-failed",
                    "error_code", entry.getKey(), "error_message", "secret-key"))), true);
            expectCode(() -> CloudTransport.awaitCloud(listener.started, deadline(), () -> false, ErrorCode.ASR_FAILED), entry.getValue());
            expectCode(() -> CloudTransport.awaitCloud(listener.finished, deadline(), () -> false, ErrorCode.ASR_FAILED), entry.getValue());
            verify(socket).abort();
        }
    }

    private static void expectCode(org.assertj.core.api.ThrowableAssert.ThrowingCallable call, ErrorCode code) {
        assertThatThrownBy(call).isInstanceOfSatisfying(BusinessException.class, error -> {
            assertThat(error.code()).isEqualTo(code);
            assertThat(error.getMessage()).doesNotContain("secret-key", "secret-url", "private");
        });
    }
    private static long deadline() { return System.nanoTime() + Duration.ofSeconds(3).toNanos(); }
    private static byte[] bytes(String value) { return value.getBytes(StandardCharsets.UTF_8); }
}
