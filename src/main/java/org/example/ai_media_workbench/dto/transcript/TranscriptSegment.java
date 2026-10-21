package org.example.ai_media_workbench.dto.transcript;

import java.util.UUID;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import org.example.ai_media_workbench.common.validation.CodePointLength;

/** 时间统一整毫秒，段ID在人工修改时保留；原稿与各版本分别保存。 */
public record TranscriptSegment(@NotNull UUID id, @NotNull @PositiveOrZero Long startMs,
                                @NotNull @Positive Long endMs,
                                @NotNull @CodePointLength(min = 1, max = 2000) String text) {}
