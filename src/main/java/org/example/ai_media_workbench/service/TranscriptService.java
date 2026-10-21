package org.example.ai_media_workbench.service;

import org.example.ai_media_workbench.dto.transcript.TranscriptionRequest;
import org.example.ai_media_workbench.dto.transcript.UpdateTranscriptRequest;
import org.example.ai_media_workbench.vo.processing.TaskVO;
import org.example.ai_media_workbench.vo.transcript.TranscriptVO;

public interface TranscriptService {
    TaskVO transcribe(String userId, String mediaId, TranscriptionRequest input);
    TranscriptVO latest(String userId, String mediaId);
    TranscriptVO get(String userId, String id, Integer version);
    TranscriptVO update(String userId, String id, UpdateTranscriptRequest input);
    org.example.ai_media_workbench.vo.transcript.TranscriptCorrectionVO correct(String userId, String id,
            org.example.ai_media_workbench.dto.transcript.CorrectTranscriptRequest input);
    SrtFile srt(String userId, String id, Integer version);
    record SrtFile(String filename, byte[] content) {}
}
