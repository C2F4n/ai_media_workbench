package org.example.ai_media_workbench.vo.transcript;

import java.util.List;

public record ClipRecommendationsVO(String mediaId,String transcriptId,int transcriptVersion,List<Clip> clips,String message) {
    public record Clip(String title,String reason,long startMs,long endMs,List<TranscriptEvidence> evidence) {}
}
