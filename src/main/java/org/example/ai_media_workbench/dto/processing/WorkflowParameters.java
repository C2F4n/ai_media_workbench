package org.example.ai_media_workbench.dto.processing;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import java.util.List;

/** 有序处理方案；所有区间相对于上一步结果，export 只能出现在最后。 */
public record WorkflowParameters(String operation, String outputFormat, List<Step> steps) implements OperationParameters {
    @JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.EXISTING_PROPERTY, property = "operation", visible = true)
    @JsonSubTypes({@JsonSubTypes.Type(value = Trim.class, name = "trim"),
            @JsonSubTypes.Type(value = Resize.class, name = "resize"),
            @JsonSubTypes.Type(value = Join.class, name = "join_clips"),
            @JsonSubTypes.Type(value = Mute.class, name = "mute"),
            @JsonSubTypes.Type(value = Export.class, name = "export")})
    public sealed interface Step permits Trim, Resize, Join, Mute, Export { String operation(); }
    public record Trim(String operation, long startMs, long endMs) implements Step {}
    public record Resize(String operation, String resolutionPreset, Integer width, Integer height) implements Step {}
    public record Join(String operation, List<JoinClipsParameters.ClipRange> clips) implements Step {}
    public record Mute(String operation) implements Step {}
    public record Export(String operation, String outputFormat, String videoCodec, Long targetSizeBytes, boolean extractAudio) implements Step {}
}
