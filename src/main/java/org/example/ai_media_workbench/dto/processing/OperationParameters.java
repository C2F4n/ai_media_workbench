package org.example.ai_media_workbench.dto.processing;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

/** 处理参数按 operation 分型，不给音频操作增加无关的视频字段。 */
@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.EXISTING_PROPERTY, property = "operation", visible = true)
@JsonSubTypes({@JsonSubTypes.Type(value = TranscodeParameters.class, name = "transcode"),
        @JsonSubTypes.Type(value = CompressionParameters.class, name = "compress"),
        @JsonSubTypes.Type(value = TrimParameters.class, name = "trim"),
        @JsonSubTypes.Type(value = MuteParameters.class, name = "mute"),
        @JsonSubTypes.Type(value = BurnSubtitleParameters.class, name = "burn_subtitles"),
        @JsonSubTypes.Type(value = JoinClipsParameters.class, name = "join_clips"),
        @JsonSubTypes.Type(value = ExtractAudioParameters.class, name = "extract_audio"),
        @JsonSubTypes.Type(value = ExportParameters.class, name = "export"),
        @JsonSubTypes.Type(value = WorkflowParameters.class, name = "workflow")})
public sealed interface OperationParameters permits VideoParameters, ExtractAudioParameters, ExportParameters, WorkflowParameters {
    String operation();
    String outputFormat();
}
