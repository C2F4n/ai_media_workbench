package org.example.ai_media_workbench.vo.transcript;

import java.util.UUID;

/** 建议不自动保存，调用方确认后使用既有 PATCH 和 expectedVersion 写入。 */
public record TranscriptCorrectionVO(String transcriptId,int version,UUID segmentId,String originalText,String correctedText) {}
