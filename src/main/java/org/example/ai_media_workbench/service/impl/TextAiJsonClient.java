package org.example.ai_media_workbench.service.impl;

import org.example.ai_media_workbench.common.exception.*;
import org.example.ai_media_workbench.service.CloudCredentialService;
import org.example.ai_media_workbench.service.OperationPlanner;
import org.springframework.stereotype.Component;
import tools.jackson.databind.JsonNode;

/** 来源互斥：SERVER调用服务端千问，PERSONAL按本人选择调用官方供应商，失败不自动切换。 */
@Component
public class TextAiJsonClient {
    private final CloudCredentialService credentials;
    private final CloudTextJsonClient cloud;
    private final LocalAiClient local;
    public TextAiJsonClient(CloudCredentialService credentials, CloudTextJsonClient cloud, LocalAiClient local) {
        this.credentials = credentials; this.cloud = cloud; this.local = local;
    }
    public boolean isAvailable(String userId) { return credentials.available(userId, "deepseek"); }
    JsonNode plan(String prompt, String content, OperationPlanner.Context context, String userId) {
        if (userId == null) throw new BusinessException(ErrorCode.UNAUTHENTICATED);
        return switch (credentials.source(userId, "deepseek")) {
            // 本地推理保留已验证的JSON约束；不冒充模型未配置的原生工具协议。
            case SERVER -> local.complete(prompt, content, 3072, ErrorCode.AI_PLAN_FAILED);
            case PERSONAL -> cloud.plan(prompt, content, context, userId);
            case OFF -> throw new BusinessException(ErrorCode.AI_UNAVAILABLE);
        };
    }
    JsonNode complete(String prompt, String content, int maxTokens, ErrorCode failure, String userId) {
        if (userId == null) throw new BusinessException(ErrorCode.UNAUTHENTICATED);
        return switch (credentials.source(userId, "deepseek")) {
            case SERVER -> local.complete(prompt, content, maxTokens, failure);
            case PERSONAL -> cloud.complete(prompt, content, maxTokens, failure, userId);
            case OFF -> throw new BusinessException(ErrorCode.AI_UNAVAILABLE);
        };
    }
}
