package org.example.ai_media_workbench.entity;

import java.time.LocalDateTime;
import lombok.Data;

@Data
public class AccountCleanupJobEntity {
    private String id;
    private String userId;
    private String mediaId;
    private String outputId;
    private String scopeKey;
    private String status;
    private int attempts;
    private LocalDateTime nextAttemptAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
