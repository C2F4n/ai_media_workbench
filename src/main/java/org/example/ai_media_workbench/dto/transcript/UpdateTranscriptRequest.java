package org.example.ai_media_workbench.dto.transcript;

import java.util.List;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record UpdateTranscriptRequest(@NotNull @Positive Integer expectedVersion,
                                      @NotNull @Size(min = 1, max = 3000) List<@NotNull @Valid TranscriptSegment> segments) {}
