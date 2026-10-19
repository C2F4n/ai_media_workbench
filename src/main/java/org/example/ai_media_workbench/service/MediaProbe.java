package org.example.ai_media_workbench.service;

import java.nio.file.Path;
import org.example.ai_media_workbench.vo.media.MediaMetadataVO;

public interface MediaProbe {
    boolean isAvailable();
    MediaMetadataVO inspect(Path file);
    /** 核验第一条音轨及其时长；输出MP3同时要求没有视频流。 */
    MediaMetadataVO inspectAudio(Path file);
}
