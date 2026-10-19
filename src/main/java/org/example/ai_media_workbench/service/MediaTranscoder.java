package org.example.ai_media_workbench.service;

import java.nio.file.Path;
import java.util.function.BooleanSupplier;
import org.example.ai_media_workbench.dto.processing.OperationParameters;
import org.example.ai_media_workbench.vo.media.MediaMetadataVO;

public interface MediaTranscoder {
    boolean isAvailable();
    boolean isAudioExtractionAvailable();
    void convert(Path source, Path target, MediaMetadataVO metadata, OperationParameters parameters, BooleanSupplier cancelled);
}
