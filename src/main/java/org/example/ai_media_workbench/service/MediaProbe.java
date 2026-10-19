package org.example.ai_media_workbench.service;

import java.nio.file.Path;
import org.example.ai_media_workbench.vo.media.MediaMetadataVO;

public interface MediaProbe {
    boolean isAvailable();
    MediaMetadataVO inspect(Path file);
}
