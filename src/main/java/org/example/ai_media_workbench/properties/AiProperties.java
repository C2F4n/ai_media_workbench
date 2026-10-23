package org.example.ai_media_workbench.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;

/** 解密后的单次个人云端配置；不进入能力接口、任务快照或日志，不作为站点公共额度。 */
@ConfigurationProperties("app.ai")
public record AiProperties(String tencentAppId, String tencentSecretId, String tencentSecretKey,
                           String aliyunApiKey, String aliyunWorkspaceId, String deepseekApiKey, String deepseekModel,
                           String textProvider) {
    @org.springframework.boot.context.properties.bind.ConstructorBinding
    public AiProperties {
        textProvider = textProvider == null ? "deepseek" : textProvider;
    }
    public AiProperties(String appId, String secretId, String secretKey, String aliyunKey, String workspaceId, String textKey, String model) {
        this(appId, secretId, secretKey, aliyunKey, workspaceId, textKey, model, "deepseek");
    }
    public boolean tencentReady() {
        return safe(tencentAppId, "[0-9]{1,20}") && safe(tencentSecretId, "[A-Za-z0-9]{1,128}")
                && safe(tencentSecretKey, "[A-Za-z0-9+/=_-]{1,256}");
    }
    public boolean aliyunReady() {
        return token(aliyunApiKey) && (aliyunWorkspaceId == null || aliyunWorkspaceId.isBlank()
                || safe(aliyunWorkspaceId, "[A-Za-z0-9-]{1,80}"));
    }
    public boolean deepseekReady() { return token(deepseekApiKey) && safe(deepseekModel, "[A-Za-z0-9_.-]{1,80}"); }
    /** 兼容旧密文的字段名；文字调用必须按所选供应商验证和路由，不能把同一密钥跨厂商复用。 */
    public boolean textReady() {
        return java.util.Set.of("deepseek", "openai", "bailian", "doubao").contains(textProvider)
                && token(deepseekApiKey) && safe(deepseekModel, "[A-Za-z0-9_.:/-]{1,80}")
                && (!"bailian".equals(textProvider) || aliyunWorkspaceId == null || aliyunWorkspaceId.isBlank()
                    || safe(aliyunWorkspaceId, "[A-Za-z0-9][A-Za-z0-9-]{0,79}"));
    }
    private static boolean token(String value) { return safe(value, "[A-Za-z0-9_.-]{1,512}"); }
    private static boolean safe(String value, String pattern) { return value != null && value.matches(pattern); }
    @Override public String toString() { return "AiProperties[credentials=REDACTED]"; }
}
