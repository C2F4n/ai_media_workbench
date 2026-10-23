package org.example.ai_media_workbench.service.impl;

import java.net.URI;
import java.net.http.HttpRequest;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.concurrent.Semaphore;
import org.example.ai_media_workbench.common.exception.*;
import org.example.ai_media_workbench.properties.LocalAiProperties;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import tools.jackson.databind.*;

/** llama.cpp文字接口：健康检查不推理；单并发、关闭思考、JSON约束，不执行模型命令。 */
@Component
public class LocalAiClient {
    private final LocalAiProperties properties;
    private final CloudTransport transport;
    private final ObjectMapper json;
    private final Semaphore requests = new Semaphore(1);
    private long checkedAt;
    private boolean ready;
    /** 单次推理超时；更大的本地模型预填更慢，部署者可放宽，未配置时与既有35秒一致。 */
    @Value("${app.local-ai.timeout-seconds:35}")
    private int timeoutSeconds = 35;

    public LocalAiClient(LocalAiProperties properties, CloudTransport transport, ObjectMapper json) {
        this.properties = properties; this.transport = transport; this.json = json;
    }
    public boolean configured() { return properties.configured(); }
    public String model() { return properties.model(); }
    public synchronized boolean isAvailable() {
        if (!configured()) return false;
        if (checkedAt != 0 && System.nanoTime() - checkedAt < Duration.ofSeconds(2).toNanos()) return ready;
        try {
            var request = request("/health", Duration.ofMillis(700)).GET().build();
            var response = json.readTree(transport.get(request, System.nanoTime() + Duration.ofMillis(700).toNanos(), ErrorCode.LOCAL_AI_UNAVAILABLE));
            ready = "ok".equals(response.path("status").asText());
        } catch (Exception unavailable) { ready = false; }
        checkedAt = System.nanoTime();
        return ready;
    }
    JsonNode complete(String prompt, String content, int maxTokens, ErrorCode failure) {
        if (!isAvailable()) throw new BusinessException(ErrorCode.LOCAL_AI_UNAVAILABLE);
        if (!requests.tryAcquire()) throw new BusinessException(ErrorCode.AI_BUSY);
        try {
            var body = Map.of("model", properties.model(), "stream", false, "max_tokens", maxTokens,
                    "temperature", 0, "chat_template_kwargs", Map.of("enable_thinking", false),
                    "response_format", Map.of("type", "json_object"),
                    "messages", List.of(Map.of("role", "system", "content", prompt), Map.of("role", "user", "content", content)));
            var request = request("/v1/chat/completions", Duration.ofSeconds(timeoutSeconds))
                    .POST(HttpRequest.BodyPublishers.ofString(json.writeValueAsString(body))).build();
            var response = json.readTree(transport.post(request, System.nanoTime() + Duration.ofSeconds(timeoutSeconds).toNanos(),
                    () -> false, ErrorCode.LOCAL_AI_UNAVAILABLE, failure));
            var choice = response.path("choices").path(0);
            if (!"stop".equals(choice.path("finish_reason").asText()) || !choice.path("message").path("content").isString())
                throw new BusinessException(failure);
            var result = json.readTree(choice.path("message").path("content").asText());
            if (!result.isObject()) throw new BusinessException(failure);
            return result;
        } catch (BusinessException exception) {
            if (exception.code() == ErrorCode.LOCAL_AI_UNAVAILABLE || exception.code() == ErrorCode.TRANSCODE_TIMEOUT) {
                synchronized (this) { ready = false; checkedAt = System.nanoTime(); }
                throw new BusinessException(ErrorCode.LOCAL_AI_UNAVAILABLE);
            }
            throw exception;
        } catch (Exception invalid) { throw new BusinessException(failure); }
        finally { requests.release(); }
    }
    private HttpRequest.Builder request(String path, Duration timeout) {
        var builder = HttpRequest.newBuilder(URI.create("http://127.0.0.1:" + properties.port() + path))
                .timeout(timeout).header("Content-Type", "application/json");
        if (properties.apiKey() != null && !properties.apiKey().isEmpty()) builder.header("Authorization", "Bearer " + properties.apiKey());
        return builder;
    }
}
