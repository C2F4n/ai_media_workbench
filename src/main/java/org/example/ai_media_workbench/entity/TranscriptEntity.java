package org.example.ai_media_workbench.entity;

import java.time.LocalDateTime;
import lombok.Data;

@Data
public class TranscriptEntity {
    private String id;
    private String userId;
    private String mediaId;
    private String sourceTaskId;
    private int version;
    private String language;
    private String originalSegmentsJson;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
