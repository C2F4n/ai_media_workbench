package org.example.ai_media_workbench.entity;

import java.time.LocalDateTime;
import lombok.Data;
import org.example.ai_media_workbench.entity.enums.PlanStatus;

@Data
public class OperationPlanEntity {
    private String id;
    private String userId;
    private String mediaId;
    private int version;
    private PlanStatus status;
    private String instruction;
    private String parametersJson;
    private String summary;
    private String questionsJson;
    private String warningsJson;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;
}
