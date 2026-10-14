package org.example.ai_media_workbench.entity;

import java.time.LocalDateTime;
import lombok.Data;

@Data
public class ProjectEntity {
    private String id;
    private String userId;
    private String name;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;
}
