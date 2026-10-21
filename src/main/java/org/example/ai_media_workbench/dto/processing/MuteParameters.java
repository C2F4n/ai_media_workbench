package org.example.ai_media_workbench.dto.processing;

import com.fasterxml.jackson.annotation.JsonIgnore;

/** 静音固定移除全部音轨，外部参数只包含操作、格式和分辨率。 */
public record MuteParameters(String operation, String outputFormat, String resolutionPreset) implements VideoParameters {
    @Override @JsonIgnore public String audioMode() { return "drop"; }
}
