package org.example.ai_media_workbench.dto.processing;

import com.fasterxml.jackson.annotation.JsonIgnore;

/** 时间为源视频上的整毫秒，固定原分辨率；外部快照仅保留五个明确参数。 */
public record TrimParameters(String operation, String outputFormat, long startMs, long endMs,
                             String audioMode) implements VideoParameters {
    @Override @JsonIgnore public String resolutionPreset() { return "source"; }

    public boolean fitsWithin(long durationMs) {
        return startMs >= 0 && endMs <= durationMs && endMs > startMs && endMs - startMs >= 500;
    }
}
