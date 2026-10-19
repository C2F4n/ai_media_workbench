package org.example.ai_media_workbench.dto.processing;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import org.example.ai_media_workbench.common.validation.CodePointLength;
import tools.jackson.databind.JsonNode;

public record UpdatePlanRequest(@NotNull @Min(1) Integer expectedVersion, JsonNode parameters,
                                @CodePointLength(min = 1, max = 2000) String instruction) {}
