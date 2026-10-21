package org.example.ai_media_workbench.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;

/** 站点环境配置或解密后的单次个人配置；不进入能力接口、任务快照或日志。 */
@ConfigurationProperties("app.ai")
public record AiProperties(String tencentAppId, String tencentSecretId, String tencentSecretKey,
                           String aliyunApiKey, String aliyunWorkspaceId, String deepseekApiKey, String deepseekModel) {
    public boolean tencentReady() {
        return safe(tencentAppId, "[0-9]{1,20}") && safe(tencentSecretId, "[A-Za-z0-9]{1,128}")
                && safe(tencentSecretKey, "[A-Za-z0-9+/=_-]{1,256}");
    }
    public boolean aliyunReady() {
        return token(aliyunApiKey) && (aliyunWorkspaceId == null || aliyunWorkspaceId.isBlank()
                || safe(aliyunWorkspaceId, "[A-Za-z0-9-]{1,80}"));
    }
    public boolean deepseekReady() { return token(deepseekApiKey) && safe(deepseekModel, "[A-Za-z0-9_.-]{1,80}"); }
    private static boolean token(String value) { return safe(value, "[A-Za-z0-9_.-]{1,512}"); }
    private static boolean safe(String value, String pattern) { return value != null && value.matches(pattern); }
    @Override public String toString() { return "AiProperties[credentials=REDACTED]"; }
}
