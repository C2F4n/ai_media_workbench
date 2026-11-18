package org.example.ai_media_workbench.dto.cloud;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record DeleteCloudCredentialRequest(@NotNull @Min(0) Integer expectedVersion) {}
