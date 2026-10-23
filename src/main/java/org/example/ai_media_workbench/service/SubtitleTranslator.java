package org.example.ai_media_workbench.service;

import java.util.List;
import java.util.UUID;
import org.example.ai_media_workbench.dto.transcript.TranscriptSegment;

public interface SubtitleTranslator {
    boolean isAvailable(String userId);
    List<Translation> translate(List<TranscriptSegment> segments, String targetLanguage, String userId);
    record Translation(UUID id, String text) {}
}
