package org.example.ai_media_workbench.vo.processing;

import java.time.Instant;
import java.util.List;
import org.example.ai_media_workbench.dto.processing.OperationParameters;
import org.example.ai_media_workbench.entity.enums.PlanStatus;

public record PlanVO(String id, String mediaId, int version, PlanStatus status, String instruction,
                     OperationParameters parameters, String summary, List<Object> questions, List<Object> warnings,
                     String taskId, Instant createdAt, Instant updatedAt) {}
