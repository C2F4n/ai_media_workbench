package org.example.ai_media_workbench.dto.cloud;

import jakarta.validation.constraints.*;

public record DeleteCloudCredentialRequest(@NotNull @Min(0) Integer expectedVersion) {}
