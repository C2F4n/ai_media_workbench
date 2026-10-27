package org.example.ai_media_workbench.service.impl;

import java.net.URI;
import java.net.http.HttpRequest;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.concurrent.Semaphore;
import org.example.ai_media_workbench.common.exception.*;
import org.example.ai_media_workbench.service.CloudCredentialService;
import org.example.ai_media_workbench.common.ai.MediaPlanTools;
import org.example.ai_media_workbench.service.OperationPlanner;
import org.springframework.stereotype.Component;
import tools.jackson.databind.*;

/** 个人文字模型适配：固定官方接口；JSON与原生工具调用共享双并发，不回退或重试。 */
@Component
public class CloudTextJsonClient {
    private final CloudCredentialService credentials;
    private final CloudTransport transport;
    private final ObjectMapper json;
    private final Semaphore requests=new Semaphore(2);
    public CloudTextJsonClient(CloudCredentialService credentials,CloudTransport transport,ObjectMapper json) {
        this.credentials=credentials; this.transport=transport; this.json=json;
    }
    public boolean isAvailable(String userId) { return credentials.available(userId,"deepseek"); }
    JsonNode complete(String prompt,String content,int maxTokens,ErrorCode failure,String userId) {
        return complete(prompt,content,maxTokens,failure,userId,null);
    }
    JsonNode plan(String prompt,String content,OperationPlanner.Context context,String userId) {
        return complete(prompt + "\n本次通过提供的function工具提交结果：必须且只能调用submit_media_plan或request_clarification一次，不输出普通JSON消息。",
                content,3072,ErrorCode.AI_PLAN_FAILED,userId,MediaPlanTools.definitions(context));
    }
    private JsonNode complete(String prompt,String content,int maxTokens,ErrorCode failure,String userId,List<Map<String,Object>> tools) {
        if(userId==null) throw new BusinessException(ErrorCode.UNAUTHENTICATED);
        var properties=credentials.effective(userId,"deepseek");
        if (!properties.textReady()) throw new BusinessException(ErrorCode.AI_UNAVAILABLE);
        if (!requests.tryAcquire()) throw new BusinessException(ErrorCode.AI_BUSY);
        try {
            var body=new java.util.LinkedHashMap<String,Object>();
            body.put("model",properties.deepseekModel()); body.put("stream",false);
            if (tools == null) body.put("response_format",Map.of("type","json_object"));
            else {
                body.put("tools",tools); body.put("tool_choice","auto"); body.put("parallel_tool_calls",false);
            }
            body.put("messages",List.of(Map.of("role","system","content",prompt),Map.of("role","user","content",content)));
            if ("openai".equals(properties.textProvider())) {
                body.put("max_completion_tokens",maxTokens); body.put("store",false);
                // 已核对的GPT预设限制思考开销；未知自定义型号不强加可能不兼容的参数。
                if (java.util.Set.of("gpt-6-sol","gpt-5.6-sol","gpt-5.6-luna","gpt-5.6").contains(properties.deepseekModel()))
                    body.put("reasoning_effort","none");
                else if ("gpt-6-astra".equals(properties.deepseekModel())) body.put("reasoning_effort","low");
            } else {
                body.put("max_tokens",maxTokens);
                if ("deepseek".equals(properties.textProvider()) || "doubao".equals(properties.textProvider()))
                    body.put("thinking",Map.of("type","disabled"));
                else body.put("enable_thinking",false);
            }
            var request=HttpRequest.newBuilder(endpoint(properties)).timeout(Duration.ofSeconds(35))
                    .header("Authorization","Bearer "+properties.deepseekApiKey()).header("Content-Type","application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(json.writeValueAsString(body))).build();
            var response=json.readTree(transport.post(request,System.nanoTime()+Duration.ofSeconds(35).toNanos(),()->false,failure));
            if (tools != null) return MediaPlanTools.readResponse(response,json);
            var choice=response.path("choices").path(0);
            if (!"stop".equals(choice.path("finish_reason").asText()) || !choice.path("message").path("content").isString())
                throw new BusinessException(failure);
            var refusal=choice.path("message").path("refusal");
            if (!refusal.isMissingNode() && !refusal.isNull()) throw new BusinessException(failure);
            var result=json.readTree(choice.path("message").path("content").asText());
            if (!result.isObject()) throw new BusinessException(failure);
            return result;
        } catch (BusinessException exception) { throw exception; }
        catch (Exception exception) { throw new BusinessException(failure); }
        finally { requests.release(); }
    }
    private static URI endpoint(org.example.ai_media_workbench.properties.AiProperties settings) {
        return switch (settings.textProvider()) {
            case "deepseek" -> URI.create("https://api.deepseek.com/chat/completions");
            case "openai" -> URI.create("https://api.openai.com/v1/chat/completions");
            case "doubao" -> URI.create("https://ark.cn-beijing.volces.com/api/v3/chat/completions");
            case "bailian" -> URI.create("https://" + (settings.aliyunWorkspaceId() == null || settings.aliyunWorkspaceId().isBlank()
                    ? "dashscope.aliyuncs.com" : settings.aliyunWorkspaceId() + ".cn-beijing.maas.aliyuncs.com") + "/compatible-mode/v1/chat/completions");
            default -> throw new BusinessException(ErrorCode.AI_UNAVAILABLE);
        };
    }
}
