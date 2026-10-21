package org.example.ai_media_workbench.service.impl;

import java.net.URI;
import java.net.http.HttpRequest;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.concurrent.Semaphore;
import org.example.ai_media_workbench.common.exception.*;
import org.example.ai_media_workbench.service.CloudCredentialService;
import org.springframework.stereotype.Component;
import tools.jackson.databind.*;

/** 文字类云端调用共用的固定域名、有界并发和JSON边界；不自动重试付费请求。 */
@Component
public class DeepSeekJsonClient {
    private final CloudCredentialService credentials;
    private final CloudTransport transport;
    private final ObjectMapper json;
    private final Semaphore requests=new Semaphore(2);
    public DeepSeekJsonClient(CloudCredentialService credentials,CloudTransport transport,ObjectMapper json) {
        this.credentials=credentials; this.transport=transport; this.json=json;
    }
    public boolean isAvailable(String userId) { return credentials.available(userId,"deepseek"); }
    JsonNode complete(String prompt,String content,int maxTokens,ErrorCode failure,String userId) {
        if(userId==null) throw new BusinessException(ErrorCode.UNAUTHENTICATED);
        var properties=credentials.effective(userId,"deepseek");
        if (!properties.deepseekReady()) throw new BusinessException(ErrorCode.AI_UNAVAILABLE);
        if (!requests.tryAcquire()) throw new BusinessException(ErrorCode.AI_BUSY);
        try {
            var body=Map.of("model",properties.deepseekModel(),"stream",false,"max_tokens",maxTokens,
                    "thinking",Map.of("type","disabled"),"response_format",Map.of("type","json_object"),
                    "messages",List.of(Map.of("role","system","content",prompt),Map.of("role","user","content",content)));
            var request=HttpRequest.newBuilder(URI.create("https://api.deepseek.com/chat/completions")).timeout(Duration.ofSeconds(35))
                    .header("Authorization","Bearer "+properties.deepseekApiKey()).header("Content-Type","application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(json.writeValueAsString(body))).build();
            var response=json.readTree(transport.post(request,System.nanoTime()+Duration.ofSeconds(35).toNanos(),()->false,failure));
            var choice=response.path("choices").path(0);
            if (!"stop".equals(choice.path("finish_reason").asText()) || !choice.path("message").path("content").isString())
                throw new BusinessException(failure);
            var result=json.readTree(choice.path("message").path("content").asText());
            if (!result.isObject()) throw new BusinessException(failure);
            return result;
        } catch (Exception exception) { throw new BusinessException(failure); }
        finally { requests.release(); }
    }
}
