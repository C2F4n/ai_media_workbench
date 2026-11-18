package org.example.ai_media_workbench.vo.media;

/** 码率单位为 bit/s，采样率为 Hz，帧率为 fps。旧记录及探测不到的扩展字段为 null。 */
public record MediaMetadataVO(String container, long durationMs, Integer width, Integer height,
                              String videoCodec, boolean hasAudio, String audioCodec,
                              Long bitRate, Long videoBitRate, Long audioBitRate, Double frameRate,
                              Integer sampleRate, Integer channels, String channelLayout, String pixelFormat) {
    /** 保留历史调用方的构造方式；纯音频结果的尺寸和视频编码仍为 null。 */
    public MediaMetadataVO(String container, long durationMs, Integer width, Integer height,
                           String videoCodec, boolean hasAudio, String audioCodec) {
        this(container, durationMs, width, height, videoCodec, hasAudio, audioCodec,
                null, null, null, null, null, null, null, null);
    }
}
