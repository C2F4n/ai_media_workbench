package org.example.ai_media_workbench.properties;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotNull;
import java.time.Duration;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.util.unit.DataSize;
import org.springframework.validation.annotation.Validated;

/** 媒体限制的唯一配置来源，供能力查询及后续真实上传、检测业务共同使用。 */
@Validated
@ConfigurationProperties("app.media")
public record MediaProperties(@NotNull DataSize maxUploadSize, @NotNull Duration maxDuration) {
    @AssertTrue(message = "Media upload size and duration must be positive")
    public boolean isValidLimits() {
        return maxUploadSize != null && maxUploadSize.toBytes() > 0
                && maxDuration != null && maxDuration.toMillis() > 0;
    }
}
