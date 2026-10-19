package org.example.ai_media_workbench.dto.processing;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record ExecutePlanRequest(@NotNull @Min(1) Integer expectedVersion) {}
