package org.example.ai_media_workbench.entity;

import java.time.LocalDateTime;
import lombok.Data;

@Data
public class TranscriptRevisionEntity {
    private String userId;
    private String transcriptId;
    private int version;
    private String segmentsJson;
    private LocalDateTime createdAt;
}
