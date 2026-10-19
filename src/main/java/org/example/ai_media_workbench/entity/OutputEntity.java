package org.example.ai_media_workbench.entity;

import java.time.LocalDateTime;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Data
public class OutputEntity {
    private String id;
    private String userId;
    private String taskId;
    private String filename;
    @JsonIgnore
    private String storageKey;
    private String contentType;
    private long sizeBytes;
    private String metadataJson;
    private LocalDateTime createdAt;
    private LocalDateTime deletedAt;
}
