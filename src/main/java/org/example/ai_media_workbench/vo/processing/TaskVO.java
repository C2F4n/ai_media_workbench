package org.example.ai_media_workbench.vo.processing;

import java.time.Instant;
import java.util.List;
import org.example.ai_media_workbench.dto.processing.OperationParameters;
import org.example.ai_media_workbench.entity.enums.TaskKind;
import org.example.ai_media_workbench.entity.enums.TaskStage;
import org.example.ai_media_workbench.entity.enums.TaskStatus;

public record TaskVO(String id, String planId, Integer planVersion, String mediaId, OperationParameters parameters,
                     TaskStatus status, TaskStage stage, Integer progressPercent, List<OutputVO> outputs,
                     ResourceError error, Instant createdAt, Instant startedAt, Instant finishedAt,
                     TaskKind kind, String sourceId, Integer sourceVersion, Object transcript) {
    public record ResourceError(String code, String message) {}
    public boolean active() { return status == TaskStatus.QUEUED || status == TaskStatus.RUNNING || status == TaskStatus.CANCELLING; }
}
