package org.example.ai_media_workbench.entity;

import java.time.LocalDateTime;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonIgnore;
import org.example.ai_media_workbench.entity.enums.MediaKind;
import org.example.ai_media_workbench.entity.enums.MediaStatus;

@Data
public class MediaEntity {
    private String id;
    @JsonIgnore
    private String userId;
    private String originalFilename;
    @JsonIgnore
    private String storageKey;
    private long sizeBytes;
    private MediaKind kind;
    private MediaStatus status;
    private String metadataJson;
    private String errorCode;
    private String errorMessage;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;
    private String probeToken;
    private LocalDateTime probeStartedAt;
}
