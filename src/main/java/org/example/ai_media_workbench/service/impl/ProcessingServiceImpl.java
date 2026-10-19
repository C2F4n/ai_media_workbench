package org.example.ai_media_workbench.service.impl;

import java.time.Clock;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Set;
import java.util.UUID;
import org.example.ai_media_workbench.common.exception.BusinessException;
import org.example.ai_media_workbench.common.exception.ErrorCode;
import org.example.ai_media_workbench.common.storage.LocalMediaStorage;
import org.example.ai_media_workbench.dto.common.PageQuery;
import org.example.ai_media_workbench.dto.processing.CreatePlanRequest;
import org.example.ai_media_workbench.dto.processing.UpdatePlanRequest;
import org.example.ai_media_workbench.dto.processing.VideoParameters;
import org.example.ai_media_workbench.dto.processing.OperationParameters;
import org.example.ai_media_workbench.dto.processing.ExtractAudioParameters;
import org.example.ai_media_workbench.dto.processing.CompressionParameters;
import org.example.ai_media_workbench.entity.MediaEntity;
import org.example.ai_media_workbench.vo.media.MediaMetadataVO;
import org.example.ai_media_workbench.entity.OperationPlanEntity;
import org.example.ai_media_workbench.entity.TaskEntity;
import org.example.ai_media_workbench.entity.UserStatus;
import org.example.ai_media_workbench.entity.enums.*;
import org.example.ai_media_workbench.mapper.MediaMapper;
import org.example.ai_media_workbench.mapper.ProcessingMapper;
import org.example.ai_media_workbench.mapper.UserMapper;
import org.example.ai_media_workbench.properties.TranscodeProperties;
import org.example.ai_media_workbench.service.MediaProbe;
import org.example.ai_media_workbench.service.MediaTranscoder;
import org.example.ai_media_workbench.service.ProcessingService;
import org.example.ai_media_workbench.vo.common.PageVO;
import org.example.ai_media_workbench.vo.processing.PlanVO;
import org.example.ai_media_workbench.vo.processing.TaskVO;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

@Service
public class ProcessingServiceImpl implements ProcessingService {
    private final ProcessingMapper mapper;
    private final MediaMapper media;
    private final UserMapper users;
    private final LocalMediaStorage storage;
    private final MediaTranscoder transcoder;
    private final MediaProbe probe;
    private final TranscodeProperties properties;
    private final ProcessingViews views;
    private final ObjectMapper json;
    private final Clock clock;

    public ProcessingServiceImpl(ProcessingMapper mapper, MediaMapper media, UserMapper users, LocalMediaStorage storage,
                                 MediaTranscoder transcoder, MediaProbe probe, TranscodeProperties properties,
                                 ProcessingViews views, ObjectMapper json, Clock clock) {
        this.mapper = mapper; this.media = media; this.users = users; this.storage = storage;
        this.transcoder = transcoder; this.probe = probe; this.properties = properties;
        this.views = views; this.json = json; this.clock = clock;
    }

    @Override
    @Transactional
    public PlanVO create(String userId, CreatePlanRequest input) {
        var parameters = parameters(input.parameters(), input.instruction());
        lockUser(userId);
        validateOperation(parameters, requireReady(userId, input.mediaId().toString()));
        requireTool(parameters);
        var plan = new OperationPlanEntity();
        plan.setId(UUID.randomUUID().toString()); plan.setUserId(userId); plan.setMediaId(input.mediaId().toString());
        plan.setVersion(1); plan.setStatus(PlanStatus.READY);
        apply(plan, parameters); plan.setCreatedAt(now());
        mapper.insertPlan(plan);
        return views.plan(plan);
    }

    @Override
    @Transactional
    public PlanVO update(String userId, String id, UpdatePlanRequest input) {
        lockUser(userId);
        var plan = lockedPlan(userId, id);
        if (plan.getVersion() != input.expectedVersion()) throw new BusinessException(ErrorCode.PLAN_VERSION_CONFLICT);
        if (plan.getStatus() != PlanStatus.READY) throw new BusinessException(ErrorCode.RESOURCE_CONFLICT);
        var parameters = parameters(input.parameters(), input.instruction());
        validateOperation(parameters, requireReady(userId, plan.getMediaId())); requireTool(parameters);
        apply(plan, parameters);
        plan.setVersion(Math.addExact(plan.getVersion(), 1)); mapper.updatePlan(plan);
        return views.plan(plan);
    }

    @Override
    public PlanVO plan(String userId, String id) {
        var plan = mapper.plan(userId, id);
        if (plan == null) throw new BusinessException(ErrorCode.RESOURCE_NOT_FOUND);
        return views.plan(plan);
    }

    @Override
    public PageVO<PlanVO> plans(String userId, String mediaId, PageQuery query) {
        filter(userId, mediaId);
        return new PageVO<>(mapper.plans(userId, mediaId, query.offset(), query.getPageSize()).stream().map(views::plan).toList(),
                query.getPage(), query.getPageSize(), mapper.countPlans(userId, mediaId));
    }

    @Override
    @Transactional
    public TaskVO execute(String userId, String id, int expectedVersion) {
        lockUser(userId);
        var plan = lockedPlan(userId, id);
        if (plan.getVersion() != expectedVersion) throw new BusinessException(ErrorCode.PLAN_VERSION_CONFLICT);
        var existing = mapper.taskForPlan(userId, id);
        if (existing != null) return views.task(existing);
        if (plan.getStatus() != PlanStatus.READY) throw new BusinessException(ErrorCode.RESOURCE_CONFLICT);
        var parameters = json.readValue(plan.getParametersJson(), OperationParameters.class);
        validateOperation(parameters, requireReady(userId, plan.getMediaId())); requireTool(parameters);
        mapper.lockQueue();
        if (mapper.activeCount() >= properties.queueLimit()) throw new BusinessException(ErrorCode.QUEUE_FULL);
        var task = new TaskEntity();
        task.setId(UUID.randomUUID().toString()); task.setUserId(userId); task.setMediaId(plan.getMediaId());
        task.setPlanId(id); task.setPlanVersion(expectedVersion); task.setKind(TaskKind.MEDIA_PROCESSING);
        task.setSourceId(id); task.setSourceVersion(expectedVersion); task.setParametersJson(plan.getParametersJson());
        task.setStatus(TaskStatus.QUEUED); task.setStage(TaskStage.WAITING); task.setCreatedAt(now());
        mapper.insertTask(task);
        plan.setStatus(PlanStatus.EXECUTED); plan.setUpdatedAt(now()); mapper.updatePlan(plan);
        return views.task(task);
    }

    @Override
    public TaskVO task(String userId, String id) {
        var task = mapper.task(userId, id);
        if (task == null) throw new BusinessException(ErrorCode.RESOURCE_NOT_FOUND);
        return views.task(task);
    }

    @Override
    public PageVO<TaskVO> tasks(String userId, String mediaId, PageQuery query) {
        filter(userId, mediaId);
        return new PageVO<>(mapper.tasks(userId, mediaId, query.offset(), query.getPageSize()).stream().map(views::task).toList(),
                query.getPage(), query.getPageSize(), mapper.countTasks(userId, mediaId));
    }

    @Override
    @Transactional
    public TaskVO cancel(String userId, String id) {
        lockUser(userId);
        var task = mapper.lockTask(userId, id);
        if (task == null) throw new BusinessException(ErrorCode.RESOURCE_NOT_FOUND);
        if (task.getStatus() == TaskStatus.CANCELLED || task.getStatus() == TaskStatus.CANCELLING) return views.task(task);
        if (task.getStatus() != TaskStatus.QUEUED && task.getStatus() != TaskStatus.RUNNING)
            throw new BusinessException(ErrorCode.TASK_NOT_CANCELLABLE);
        mapper.cancel(userId, id, now());
        return task(userId, id);
    }

    private void apply(OperationPlanEntity plan, OperationParameters parameters) {
        plan.setParametersJson(json.writeValueAsString(parameters));
        if (parameters instanceof VideoParameters video)
            plan.setSummary("MP4 / " + (video.resolutionPreset().equals("720p") ? "720p" : "原分辨率") + " / 保留音轨");
        else plan.setSummary("MP3 / 提取第一条音轨 / 192 kbps");
        if (parameters instanceof CompressionParameters compression)
            plan.setSummary(plan.getSummary() + " / 压缩至最多 " + compression.targetSizeBytes() + " 字节");
        plan.setUpdatedAt(now());
    }

    private OperationParameters parameters(JsonNode node, String instruction) {
        if ((node == null) == (instruction == null)) throw new BusinessException(ErrorCode.INVALID_PARAMETERS);
        if (instruction != null) throw new BusinessException(ErrorCode.AI_UNAVAILABLE);
        if ("extract_audio".equals(node.path("operation").asText())) {
            if (!node.isObject() || node.size() != 2 || !node.path("outputFormat").isString() || !"mp3".equals(node.path("outputFormat").asText()))
                throw new BusinessException(ErrorCode.INVALID_PARAMETERS);
            return json.treeToValue(node, OperationParameters.class);
        }
        boolean compression = "compress".equals(node.path("operation").asText());
        if (!node.isObject() || node.size() != (compression ? 5 : 4)) throw new BusinessException(ErrorCode.INVALID_PARAMETERS);
        for (String key : Set.of("operation", "outputFormat", "resolutionPreset", "audioMode"))
            if (!node.path(key).isString()) throw new BusinessException(ErrorCode.INVALID_PARAMETERS);
        if (!Set.of("transcode", "compress").contains(node.path("operation").asText()) || !node.path("outputFormat").asText().equals("mp4")
                || !Set.of("source", "720p").contains(node.path("resolutionPreset").asText())
                || !node.path("audioMode").asText().equals("keep")) throw new BusinessException(ErrorCode.INVALID_PARAMETERS);
        if (compression && (!node.path("targetSizeBytes").isIntegralNumber() || !node.path("targetSizeBytes").canConvertToLong()
                || node.path("targetSizeBytes").asLong() <= 0)) throw new BusinessException(ErrorCode.INVALID_PARAMETERS);
        return json.treeToValue(node, OperationParameters.class);
    }

    private void validateOperation(OperationParameters parameters, MediaEntity source) {
        if (parameters instanceof ExtractAudioParameters && !json.readValue(source.getMetadataJson(), MediaMetadataVO.class).hasAudio())
            throw new BusinessException(ErrorCode.SOURCE_HAS_NO_AUDIO);
        if (parameters instanceof CompressionParameters compression) {
            if (compression.targetSizeBytes() >= source.getSizeBytes()
                    || compression.targetSizeBytes() > properties.maxOutputSize().toBytes())
                throw new BusinessException(ErrorCode.INVALID_PARAMETERS);
            CompressionBudget.calculate(json.readValue(source.getMetadataJson(), MediaMetadataVO.class), compression.targetSizeBytes());
        }
    }

    private MediaEntity requireReady(String userId, String mediaId) {
        var source = media.findOwned(userId, mediaId);
        if (source == null) throw new BusinessException(ErrorCode.RESOURCE_NOT_FOUND);
        if (source.getStatus() != MediaStatus.READY || source.getMetadataJson() == null || !storage.exists(source.getStorageKey()))
            throw new BusinessException(ErrorCode.RESOURCE_CONFLICT);
        return source;
    }
    private void filter(String userId, String mediaId) {
        if (mediaId != null && media.findOwned(userId, mediaId) == null) throw new BusinessException(ErrorCode.RESOURCE_NOT_FOUND);
    }
    private OperationPlanEntity lockedPlan(String userId, String id) {
        var plan = mapper.lockPlan(userId, id);
        if (plan == null) throw new BusinessException(ErrorCode.RESOURCE_NOT_FOUND);
        return plan;
    }
    private void lockUser(String userId) {
        var user = users.findByIdForUpdate(userId);
        if (user == null || user.getStatus() != UserStatus.ACTIVE) throw new BusinessException(ErrorCode.UNAUTHENTICATED);
    }
    private void requireTool(OperationParameters parameters) {
        boolean audio = parameters instanceof ExtractAudioParameters;
        if (!probe.isAvailable() || !(audio ? transcoder.isAudioExtractionAvailable() : transcoder.isAvailable()))
            throw new BusinessException(audio ? ErrorCode.AUDIO_EXTRACTION_UNAVAILABLE : ErrorCode.TRANSCODE_UNAVAILABLE);
    }
    private LocalDateTime now() { return LocalDateTime.ofInstant(clock.instant(), ZoneOffset.UTC); }
}
