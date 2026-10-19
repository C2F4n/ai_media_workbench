package org.example.ai_media_workbench.vo.media;

/** 纯音频结果的宽、高和视频编码为 null，不伪造尺寸。 */
public record MediaMetadataVO(String container, long durationMs, Integer width, Integer height,
                              String videoCodec, boolean hasAudio, String audioCodec) {}
