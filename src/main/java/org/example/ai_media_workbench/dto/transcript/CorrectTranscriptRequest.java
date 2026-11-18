package org.example.ai_media_workbench.dto.transcript;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.util.UUID;

public record CorrectTranscriptRequest(@NotNull @Positive Integer expectedVersion, @NotNull UUID segmentId) {}
