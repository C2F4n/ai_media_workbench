package org.example.ai_media_workbench.dto.processing;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;
import org.example.ai_media_workbench.common.validation.CodePointLength;
import tools.jackson.databind.JsonNode;

public record CreatePlanRequest(@NotNull UUID mediaId, JsonNode parameters,
                                @CodePointLength(min = 1, max = 2000) String instruction) {}
