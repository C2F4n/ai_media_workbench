package org.example.ai_media_workbench.properties;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.time.Duration;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

/** 工具路径只由服务器配置；租约大于进程超时，调度每次处理一个文件，避免无界并发。 */
@Validated
@ConfigurationProperties("app.media-tool")
public record MediaToolProperties(@NotBlank String ffprobe, @NotNull Duration timeout,
                                  @NotNull Duration lease, @Positive long intervalMs, boolean workerEnabled) {
    @AssertTrue(message = "Probe timeout must be positive and lease must exceed timeout")
    public boolean isValidTimeout() {
        return timeout != null && timeout.toMillis() > 0 && lease != null && lease.compareTo(timeout) > 0;
    }
}
