package org.example.ai_media_workbench.dto.processing;

/** 视频输出的尺寸与音轨策略；裁切固定原分辨率，静音固定移除音轨，历史快照形状不变。 */
public sealed interface VideoParameters extends OperationParameters permits TranscodeParameters, CompressionParameters, TrimParameters, MuteParameters, BurnSubtitleParameters, JoinClipsParameters {
    String resolutionPreset();
    String audioMode();
}
