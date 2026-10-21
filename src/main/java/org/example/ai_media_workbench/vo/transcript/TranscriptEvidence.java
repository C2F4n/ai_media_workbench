package org.example.ai_media_workbench.vo.transcript;

import java.util.UUID;

/** 文本和时间必须来自指定字幕快照，不采用模型生成的引文或时间戳。 */
public record TranscriptEvidence(UUID segmentId,long startMs,long endMs,String text) {}
