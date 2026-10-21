package org.example.ai_media_workbench.common.web;

import java.util.Set;
import org.example.ai_media_workbench.vo.media.MediaMetadataVO;

/** 保守的浏览器播放白名单；实际播放还受浏览器、系统解码器影响。 */
public final class MediaPreview {
    private MediaPreview() {}
    public static boolean supported(MediaMetadataVO m) {
        if (m == null || m.container() == null) return false;
        if (m.videoCodec() == null) return m.hasAudio() && Set.of("mp3", "aac", "pcm_s16le", "flac").contains(m.audioCodec());
        if (m.container().contains("mov")) return "h264".equals(m.videoCodec()) && (!m.hasAudio() || "aac".equals(m.audioCodec()));
        return m.container().contains("webm") && Set.of("vp8", "vp9", "av1").contains(m.videoCodec())
                && (!m.hasAudio() || Set.of("opus", "vorbis").contains(m.audioCodec()));
    }
    public static String videoType(MediaMetadataVO m) { return m.container().contains("webm") ? "video/webm" : "video/mp4"; }
}
