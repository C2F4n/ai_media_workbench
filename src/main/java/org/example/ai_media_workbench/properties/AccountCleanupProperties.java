package org.example.ai_media_workbench.properties;

import jakarta.validation.constraints.Positive;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

/** 注销后的清理任务配置；Scheduled 从同一 app.account-cleanup.interval-ms 属性读取调度间隔。 */
@Validated
@ConfigurationProperties("app.account-cleanup")
public record AccountCleanupProperties(boolean enabled, @Positive long intervalMs) {}
