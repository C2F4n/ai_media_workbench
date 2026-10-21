package org.example.ai_media_workbench.dto.cloud;

import jakarta.validation.constraints.*;
import org.example.ai_media_workbench.common.validation.CodePointLength;

public record SaveCloudCredentialRequest(@NotNull @Min(0) Integer expectedVersion,@NotNull Mode mode,
        @CodePointLength(max=20) String appId,@CodePointLength(max=128) String secretId,
        @CodePointLength(max=256) String secretKey,@CodePointLength(max=512) String apiKey,
        @CodePointLength(max=80) String workspaceId,@CodePointLength(max=80) String model) {
    public enum Mode { SERVER, PERSONAL, OFF }
    @Override public String toString() { return "SaveCloudCredentialRequest[REDACTED]"; }
}
