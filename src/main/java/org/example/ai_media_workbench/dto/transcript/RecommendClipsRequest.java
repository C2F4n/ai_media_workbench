package org.example.ai_media_workbench.dto.transcript;

import java.util.UUID;
import jakarta.validation.constraints.*;
import org.example.ai_media_workbench.common.validation.CodePointLength;

public record RecommendClipsRequest(@NotBlank @CodePointLength(min=1,max=500) String query,
                                    @NotNull UUID transcriptId, @NotNull @Positive Integer transcriptVersion,
                                    @NotNull @Min(1000) @Max(900000) Long maxTotalDurationMs,
                                    @Min(1) @Max(10) Integer limit) {
    public RecommendClipsRequest { if(limit==null) limit=3; }
}
