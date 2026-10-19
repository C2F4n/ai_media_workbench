package org.example.ai_media_workbench.vo.media;

public record MediaMetadataVO(String container, long durationMs, int width, int height,
                              String videoCodec, boolean hasAudio, String audioCodec) {}
