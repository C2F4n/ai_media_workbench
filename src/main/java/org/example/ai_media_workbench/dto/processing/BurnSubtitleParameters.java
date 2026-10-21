package org.example.ai_media_workbench.dto.processing;

import java.util.UUID;

/** 绑定已保存字幕身份与版本；任务使用不可变历史稿，不接收字幕文件路径或样式命令。 */
public record BurnSubtitleParameters(String operation, String outputFormat, UUID transcriptId,
                                     int transcriptVersion, String resolutionPreset, String audioMode) implements VideoParameters {}
