package org.example.ai_media_workbench.entity;

import java.time.LocalDateTime;
import lombok.Data;
import org.example.ai_media_workbench.entity.enums.TaskKind;
import org.example.ai_media_workbench.entity.enums.TaskStage;
import org.example.ai_media_workbench.entity.enums.TaskStatus;

@Data
public class TaskEntity {
    private String id;
    private String projectId;
    private String mediaId;
    private String planId;
    private Integer planVersion;
    private TaskKind kind;
    private String sourceId;
    private Integer sourceVersion;
    private String parametersJson;
    private TaskStatus status;
    private TaskStage stage;
    private Integer progressPercent;
    private String errorCode;
    private String errorMessage;
    private LocalDateTime createdAt;
    private LocalDateTime startedAt;
    private LocalDateTime finishedAt;
    private LocalDateTime deletedAt;
}
