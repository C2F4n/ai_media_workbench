package org.example.ai_media_workbench.dto.processing;

/** 同一素材的最终导出设置；可组合裁切、缩放、压缩、静音，并另存原始音轨。 */
public record ExportParameters(String operation, String outputFormat, String videoCodec,
        String resolutionPreset, Integer width, Integer height, String audioMode,
        Long startMs, Long endMs, Long targetSizeBytes, boolean extractAudio) implements OperationParameters {
    public boolean audioOnly() { return java.util.Set.of("mp3", "m4a", "wav", "flac").contains(outputFormat); }
    public long duration(long sourceDuration) { return startMs == null ? sourceDuration : endMs - startMs; }
}
