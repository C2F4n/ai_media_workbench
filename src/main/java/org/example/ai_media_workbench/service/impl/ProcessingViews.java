package org.example.ai_media_workbench.service.impl;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;
import org.example.ai_media_workbench.dto.processing.OperationParameters;
import org.example.ai_media_workbench.entity.OperationPlanEntity;
import org.example.ai_media_workbench.entity.OutputEntity;
import org.example.ai_media_workbench.entity.TaskEntity;
import org.example.ai_media_workbench.entity.enums.TaskStatus;
import org.example.ai_media_workbench.mapper.ProcessingMapper;
import org.example.ai_media_workbench.mapper.TranscriptMapper;
import org.example.ai_media_workbench.entity.enums.TaskKind;
import org.example.ai_media_workbench.vo.media.MediaMetadataVO;
import org.example.ai_media_workbench.vo.processing.OutputVO;
import org.example.ai_media_workbench.vo.processing.PlanVO;
import org.example.ai_media_workbench.vo.processing.PlanNotice;
import org.example.ai_media_workbench.vo.processing.TaskVO;
import org.springframework.stereotype.Component;
import tools.jackson.databind.ObjectMapper;

/** Public response mapping: never return entities, storage keys or execution leases. */
@Component
public class ProcessingViews {
    private final ProcessingMapper mapper;
    private final ObjectMapper json;
    private final TranscriptMapper transcripts;
    public ProcessingViews(ProcessingMapper mapper, ObjectMapper json, TranscriptMapper transcripts) { this.mapper = mapper; this.json = json; this.transcripts=transcripts; }

    public PlanVO plan(OperationPlanEntity p) {
        var task = mapper.taskForPlan(p.getUserId(), p.getId());
        return new PlanVO(p.getId(), p.getMediaId(), p.getVersion(), p.getStatus(), p.getInstruction(),
                parameters(p.getParametersJson()), p.getSummary(), notices(p.getQuestionsJson()), notices(p.getWarningsJson()), task == null ? null : task.getId(),
                instant(p.getCreatedAt()), instant(p.getUpdatedAt()));
    }

    public TaskVO task(TaskEntity t) {
        var outputs = t.getStatus() == TaskStatus.SUCCEEDED
                ? mapper.taskOutputs(t.getUserId(), t.getId()).stream().map(this::output).toList() : List.<OutputVO>of();
        var error = t.getErrorCode() == null ? null : new TaskVO.ResourceError(t.getErrorCode(), t.getErrorMessage());
        return new TaskVO(t.getId(), t.getPlanId(), t.getPlanVersion(), t.getMediaId(), t.getKind()==TaskKind.TRANSCRIPTION?null:parameters(t.getParametersJson()),
                t.getStatus(), t.getStage(), t.getProgressPercent(), outputs, error, instant(t.getCreatedAt()),
                instant(t.getStartedAt()), instant(t.getFinishedAt()), t.getKind(), t.getSourceId(), t.getSourceVersion(),
                t.getKind()==TaskKind.TRANSCRIPTION&&t.getStatus()==TaskStatus.SUCCEEDED?transcripts.taskTranscript(t.getUserId(),t.getId()):null);
    }

    public OutputVO output(OutputEntity o) {
        return new OutputVO(o.getId(), o.getTaskId(), o.getFilename(), o.getContentType(), o.getSizeBytes(),
                o.getMetadataJson() == null ? null : json.readValue(o.getMetadataJson(), MediaMetadataVO.class),
                "/api/outputs/" + o.getId() + "/preview", "/api/outputs/" + o.getId() + "/download", instant(o.getCreatedAt()));
    }

    private OperationParameters parameters(String value) {
        return value == null ? null : json.readValue(value, OperationParameters.class);
    }
    private List<PlanNotice> notices(String value) {
        return value==null ? List.of() : List.of(json.readValue(value,PlanNotice[].class));
    }
    private Instant instant(LocalDateTime value) { return value == null ? null : value.toInstant(ZoneOffset.UTC); }
}
