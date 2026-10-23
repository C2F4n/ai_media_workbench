package org.example.ai_media_workbench.service;

import org.example.ai_media_workbench.dto.transcript.TranslateTranscriptRequest;
import org.example.ai_media_workbench.vo.transcript.TranscriptTranslationVO;

public interface TranscriptTranslationService {
    TranscriptTranslationVO translate(String userId, String transcriptId, TranslateTranscriptRequest input);
}
