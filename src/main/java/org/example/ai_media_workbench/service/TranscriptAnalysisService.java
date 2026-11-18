package org.example.ai_media_workbench.service;

import org.example.ai_media_workbench.dto.transcript.RecommendClipsRequest;
import org.example.ai_media_workbench.dto.transcript.SearchTranscriptRequest;
import org.example.ai_media_workbench.vo.transcript.ClipRecommendationsVO;
import org.example.ai_media_workbench.vo.transcript.TranscriptSearchVO;

public interface TranscriptAnalysisService {
    TranscriptSearchVO search(String userId,String mediaId,SearchTranscriptRequest input);
    ClipRecommendationsVO recommend(String userId,String mediaId,RecommendClipsRequest input);
}
