package org.example.ai_media_workbench.vo.transcript;

import java.util.List;

public record TranscriptSearchVO(String mediaId,String transcriptId,int transcriptVersion,List<Match> matches,String message) {
    public record Match(long startMs,long endMs,double score,List<TranscriptEvidence> evidence) {}
}
