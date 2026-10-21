package org.example.ai_media_workbench.dto.transcript;

import java.util.UUID;
import jakarta.validation.constraints.*;

public record CorrectTranscriptRequest(@NotNull @Positive Integer expectedVersion, @NotNull UUID segmentId) {}
