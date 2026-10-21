package org.example.ai_media_workbench.dto.transcript;

import java.util.UUID;
import jakarta.validation.constraints.*;
import org.example.ai_media_workbench.common.validation.CodePointLength;

public record SearchTranscriptRequest(@NotBlank @CodePointLength(min=1,max=500) String query,
                                      @NotNull UUID transcriptId, @NotNull @Positive Integer transcriptVersion,
                                      @Min(1) @Max(20) Integer limit) {
    public SearchTranscriptRequest { if(limit==null) limit=10; }
}
