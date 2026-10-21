package org.example.ai_media_workbench.service;

import org.example.ai_media_workbench.dto.transcript.*;
import org.example.ai_media_workbench.vo.transcript.*;

public interface TranscriptAnalysisService {
    TranscriptSearchVO search(String userId,String mediaId,SearchTranscriptRequest input);
    ClipRecommendationsVO recommend(String userId,String mediaId,RecommendClipsRequest input);
}
