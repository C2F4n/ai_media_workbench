package org.example.ai_media_workbench.dto.processing;

/** 仅视频转换和压缩需要分辨率与音轨保留选项；历史快照形状不变。 */
public sealed interface VideoParameters extends OperationParameters permits TranscodeParameters, CompressionParameters {
    String resolutionPreset();
    String audioMode();
}
