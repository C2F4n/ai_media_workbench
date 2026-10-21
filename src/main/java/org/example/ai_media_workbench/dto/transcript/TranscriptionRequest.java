package org.example.ai_media_workbench.dto.transcript;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record TranscriptionRequest(@NotNull @Pattern(regexp = "zh-CN") String language, Boolean force,
                                   @Pattern(regexp = "tencent|aliyun") String provider) {
    public TranscriptionRequest { if (provider == null) provider = "tencent"; if (force == null) force = false; }
}
