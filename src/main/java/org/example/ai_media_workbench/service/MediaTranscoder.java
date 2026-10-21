package org.example.ai_media_workbench.service;

import java.nio.file.Path;
import java.util.function.BooleanSupplier;
import org.example.ai_media_workbench.dto.processing.OperationParameters;
import org.example.ai_media_workbench.vo.media.MediaMetadataVO;

public interface MediaTranscoder {
    boolean isAvailable();
    boolean isAudioExtractionAvailable();
    boolean isSubtitleBurnAvailable();
    default boolean isWorkflowAvailable() { return false; }
    java.util.List<String> exportFormats();
    java.util.List<String> exportVideoCodecs();
    void export(Path source, Path target, Path originalAudio, MediaMetadataVO metadata,
                org.example.ai_media_workbench.dto.processing.ExportParameters parameters, BooleanSupplier cancelled);
    default void workflow(Path source, Path target, Path originalAudio, MediaMetadataVO metadata,
                          org.example.ai_media_workbench.dto.processing.WorkflowParameters parameters, BooleanSupplier cancelled) {
        throw new org.example.ai_media_workbench.common.exception.BusinessException(org.example.ai_media_workbench.common.exception.ErrorCode.TRANSCODE_UNAVAILABLE);
    }
    void burnSubtitles(Path source, Path target, MediaMetadataVO metadata,
                       org.example.ai_media_workbench.dto.processing.BurnSubtitleParameters parameters,
                       Path subtitleFile, BooleanSupplier cancelled);
    void prepareSpeechAudio(Path source, Path target, MediaMetadataVO metadata, BooleanSupplier cancelled);
    void convert(Path source, Path target, MediaMetadataVO metadata, OperationParameters parameters, BooleanSupplier cancelled);
}
