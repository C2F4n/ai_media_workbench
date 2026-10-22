package org.example.ai_media_workbench.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;

/** 本地推理服务只连接回环地址；端口和模型由部署者设置，不接收用户提交的URL。 */
@ConfigurationProperties("app.local-ai")
public record LocalAiProperties(boolean enabled, int port, String model, String apiKey) {
    public boolean configured() {
        return enabled && port >= 1024 && port <= 65535 && model != null
                && model.matches("[A-Za-z0-9_.-]{1,80}")
                && (apiKey == null || apiKey.isEmpty() || apiKey.matches("[A-Za-z0-9_.-]{1,512}"));
    }
    @Override public String toString() { return "LocalAiProperties[credentials=REDACTED]"; }
}
