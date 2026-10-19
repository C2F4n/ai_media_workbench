package org.example.ai_media_workbench.dto.processing;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

/** 通过 operation 区分转换与压缩；旧的四字段转换快照保持兼容。 */
@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.EXISTING_PROPERTY, property = "operation", visible = true)
@JsonSubTypes({@JsonSubTypes.Type(value = TranscodeParameters.class, name = "transcode"),
        @JsonSubTypes.Type(value = CompressionParameters.class, name = "compress")})
public sealed interface VideoParameters permits TranscodeParameters, CompressionParameters {
    String operation();
    String outputFormat();
    String resolutionPreset();
    String audioMode();
}
