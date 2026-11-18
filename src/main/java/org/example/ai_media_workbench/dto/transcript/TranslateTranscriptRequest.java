package org.example.ai_media_workbench.dto.transcript;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.util.List;
import java.util.UUID;

/** 每批只引用已保存字幕；不接收调用者伪造的原文、时间轴或模型提示词。 */
public record TranslateTranscriptRequest(@NotNull @Positive Integer expectedVersion,
        @NotNull @Pattern(regexp="zh-CN|zh-TW|en|ja|ko|fr|de|es|ru|pt") String targetLanguage,
        @NotEmpty @Size(max=20) List<@NotNull UUID> segmentIds, boolean useOriginal) {}
