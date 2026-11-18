package org.example.ai_media_workbench.dto.transcript;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.util.UUID;
import org.example.ai_media_workbench.common.validation.CodePointLength;

public record RecommendClipsRequest(@NotBlank @CodePointLength(min=1,max=500) String query,
                                    @NotNull UUID transcriptId, @NotNull @Positive Integer transcriptVersion,
                                    @NotNull @Min(1000) @Max(900000) Long maxTotalDurationMs,
                                    @Min(1) @Max(10) Integer limit) {
    public RecommendClipsRequest { if(limit==null) limit=3; }
}
