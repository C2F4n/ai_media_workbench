package org.example.ai_media_workbench.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;

/** 公网模式要求 HTTPS；是否安全由容器及受信任代理判断，不直接读取客户端请求头。 */
@ConfigurationProperties("app.transport")
public record TransportProperties(boolean requireHttps) {}
