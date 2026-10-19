package org.example.ai_media_workbench.properties;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.time.Duration;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.util.unit.DataSize;
import org.springframework.validation.annotation.Validated;

/** Server-controlled executable and resource limits; never supplied by a client. */
@Validated
@ConfigurationProperties("app.transcode")
public record TranscodeProperties(@NotBlank String ffmpeg, @NotNull Duration timeout, @NotNull Duration lease,
                                  @Positive int queueLimit, @NotNull DataSize maxOutputSize,
                                  boolean workerEnabled) {
    @AssertTrue(message = "Transcode timeout/output limit must be positive and lease must exceed timeout plus verification")
    public boolean isValidLimits() {
        return timeout != null && timeout.toMillis() > 0 && lease != null
                && lease.compareTo(timeout.plusMinutes(1)) > 0
                && maxOutputSize != null && maxOutputSize.toBytes() > 0;
    }
}
