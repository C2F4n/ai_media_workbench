package org.example.ai_media_workbench.vo.transcript;

import java.time.Instant;
import java.util.List;
import org.example.ai_media_workbench.dto.transcript.TranscriptSegment;

public record TranscriptVO(String id, String mediaId, int version, String language, List<TranscriptSegment> segments,
                            List<TranscriptSegment> originalSegments, Instant createdAt, Instant updatedAt) {}
