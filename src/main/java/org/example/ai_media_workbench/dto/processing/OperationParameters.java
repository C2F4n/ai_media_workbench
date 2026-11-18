package org.example.ai_media_workbench.dto.processing;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

/**
 * 所有处理参数的共同接口。Jackson 根据 JSON 中的 operation 选择具体实现，如 trim 对应 TrimParameters。
 * Service 可以统一接收 OperationParameters，再用 instanceof 处理各类差异，不给音频操作强加视频字段。
 * sealed/permits 限制 Java 中的实现类型；外部输入还必须通过业务白名单和素材边界校验。
 */
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
