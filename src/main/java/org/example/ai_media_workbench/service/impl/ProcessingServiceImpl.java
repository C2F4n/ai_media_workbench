package org.example.ai_media_workbench.service.impl;

import java.time.Clock;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import org.example.ai_media_workbench.common.exception.BusinessException;
import org.example.ai_media_workbench.common.exception.ErrorCode;
import org.example.ai_media_workbench.common.security.AuthRateLimiter;
import org.example.ai_media_workbench.common.storage.LocalMediaStorage;
import org.example.ai_media_workbench.dto.common.PageQuery;
import org.example.ai_media_workbench.dto.processing.BurnSubtitleParameters;
import org.example.ai_media_workbench.dto.processing.CompressionParameters;
import org.example.ai_media_workbench.dto.processing.CreatePlanRequest;
import org.example.ai_media_workbench.dto.processing.ExportParameters;
import org.example.ai_media_workbench.dto.processing.ExtractAudioParameters;
import org.example.ai_media_workbench.dto.processing.JoinClipsParameters;
import org.example.ai_media_workbench.dto.processing.MuteParameters;
import org.example.ai_media_workbench.dto.processing.OperationParameters;
import org.example.ai_media_workbench.dto.processing.TrimParameters;
import org.example.ai_media_workbench.dto.processing.UpdatePlanRequest;
import org.example.ai_media_workbench.dto.processing.VideoParameters;
import org.example.ai_media_workbench.dto.processing.WorkflowParameters;
import org.example.ai_media_workbench.entity.MediaEntity;
import org.example.ai_media_workbench.entity.OperationPlanEntity;
import org.example.ai_media_workbench.entity.TaskEntity;
import org.example.ai_media_workbench.entity.UserStatus;
import org.example.ai_media_workbench.entity.enums.MediaStatus;
import org.example.ai_media_workbench.entity.enums.PlanStatus;
import org.example.ai_media_workbench.entity.enums.TaskKind;
import org.example.ai_media_workbench.entity.enums.TaskStage;
import org.example.ai_media_workbench.entity.enums.TaskStatus;
import org.example.ai_media_workbench.mapper.MediaMapper;
import org.example.ai_media_workbench.mapper.ProcessingMapper;
import org.example.ai_media_workbench.mapper.UserMapper;
import org.example.ai_media_workbench.properties.TranscodeProperties;
import org.example.ai_media_workbench.service.MediaProbe;
import org.example.ai_media_workbench.service.MediaTranscoder;
import org.example.ai_media_workbench.service.OperationPlanner;
import org.example.ai_media_workbench.service.ProcessingService;
import org.example.ai_media_workbench.service.TranscriptService;
import org.example.ai_media_workbench.vo.common.PageVO;
import org.example.ai_media_workbench.vo.media.MediaMetadataVO;
import org.example.ai_media_workbench.vo.processing.PlanNotice;
import org.example.ai_media_workbench.vo.processing.PlanVO;
import org.example.ai_media_workbench.vo.processing.TaskVO;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

/**
 * 方案/任务的业务协调层：解析要求、校验权限与参数、保存方案、确认后入队，不在 HTTP 请求中转码。
 * Plan 是可核对的处理配方，Task 是一次已确认的执行记录；FFmpeg 实际由 TranscodeWorker 调用。
 * 普通业务异常向上交给统一处理器；模型输出解析异常仅在信任边界转成安全的业务错误。
 */
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
    private final OperationPlanner planner;
    private final AuthRateLimiter limiter;
    private final TransactionTemplate transactions;
    private final TranscriptService transcripts;

    public ProcessingServiceImpl(ProcessingMapper mapper, MediaMapper media, UserMapper users, LocalMediaStorage storage,
                                 MediaTranscoder transcoder, MediaProbe probe, TranscodeProperties properties,
                                 ProcessingViews views, ObjectMapper json, Clock clock, OperationPlanner planner,
                                 AuthRateLimiter limiter, PlatformTransactionManager manager,
                                 TranscriptService transcripts) {
        this.mapper = mapper; this.media = media; this.users = users; this.storage = storage;
        this.transcoder = transcoder; this.probe = probe; this.properties = properties;
        this.views = views; this.json = json; this.clock = clock;
        this.planner=planner; this.limiter=limiter; this.transactions=new TransactionTemplate(manager);
        this.transcripts=transcripts;
    }

    /** 手动填写 parameters 与自然语言 instruction 二选一，最终收敛为同一套受控参数。 */
    @Override
    public PlanVO create(String userId, CreatePlanRequest input) {
        choice(input.parameters(),input.instruction());
        var source=requireReady(userId,input.mediaId().toString());
        var resolved=resolve(userId,input.parameters(),checkedInstruction(input.instruction()),source,null,null);
        // 云端调用不持有事务/账号锁；持久化前重新鉴权和校验素材，防止等待期间被删除。
        return transactions.execute(status->{
            lockUser(userId);
            verify(resolved,requireReady(userId,input.mediaId().toString()));
            var plan=new OperationPlanEntity();
            plan.setId(UUID.randomUUID().toString()); plan.setUserId(userId); plan.setMediaId(input.mediaId().toString());
            plan.setVersion(1); plan.setCreatedAt(now());
            apply(plan,resolved,input.instruction()); mapper.insertPlan(plan); return views.plan(plan);
        });
    }

    @Override
    public PlanVO update(String userId, String id, UpdatePlanRequest input) {
        choice(input.parameters(),input.instruction());
        var current=mapper.plan(userId,id);
        if(current==null) throw new BusinessException(ErrorCode.RESOURCE_NOT_FOUND);
        editable(current,input.expectedVersion());
        String instruction=checkedInstruction(input.instruction());
        // 重新生成是完整替换要求，不拼接旧输入，也不让旧参数暗中影响新方案。
        var resolved=resolve(userId,input.parameters(),instruction,requireReady(userId,current.getMediaId()),null,null);
        return transactions.execute(status->{
            // AI 调用期间可能已有另一请求改过方案；入库前再次锁定并核对 expectedVersion。
            lockUser(userId); var plan=lockedPlan(userId,id); editable(plan,input.expectedVersion());
            verify(resolved,requireReady(userId,plan.getMediaId())); apply(plan,resolved,instruction);
            plan.setVersion(Math.addExact(plan.getVersion(),1)); mapper.updatePlan(plan); return views.plan(plan);
        });
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
    public void deletePlan(String userId, String id) {
        lockUser(userId);
        lockedPlan(userId, id);
        mapper.markPlanDeleted(userId, id, now());
    }

    @Override
    @Transactional
    public void deleteTaskHistory(String userId, String id) {
        lockUser(userId);
        var task = mapper.lockTask(userId, id);
        if (task == null) throw new BusinessException(ErrorCode.RESOURCE_NOT_FOUND);
        if (task.getStatus() == TaskStatus.QUEUED || task.getStatus() == TaskStatus.RUNNING || task.getStatus() == TaskStatus.CANCELLING)
            throw new BusinessException(ErrorCode.RESOURCE_CONFLICT);
        // 只从处理记录移除；保留执行幂等和结果权限，文件仍由单独的结果删除入口清理。
        mapper.hideTaskHistory(userId, id, now());
    }

    @Override
    @Transactional
    public TaskVO execute(String userId, String id, int expectedVersion) {
        lockUser(userId);
        var plan = lockedPlan(userId, id);
        if (plan.getVersion() != expectedVersion) throw new BusinessException(ErrorCode.PLAN_VERSION_CONFLICT);
        var existing = mapper.taskForPlan(userId, id);
        // 相同方案重复确认返回同一个任务，避免用户因网络超时再次点击时重复转码。
        if (existing != null) return views.task(existing);
        if (plan.getStatus() != PlanStatus.READY) throw new BusinessException(ErrorCode.RESOURCE_CONFLICT);
        var parameters = json.readValue(plan.getParametersJson(), OperationParameters.class);
        validateOperation(parameters, requireReady(userId, plan.getMediaId())); requireTool(parameters);
        // “检查容量 + 插入任务”放在队列锁内，避免多个并发请求同时通过容量检查。
        mapper.lockQueue();
        if (mapper.activeCount() >= properties.queueLimit()) throw new BusinessException(ErrorCode.QUEUE_FULL);
        var task = new TaskEntity();
        task.setId(UUID.randomUUID().toString()); task.setUserId(userId); task.setMediaId(plan.getMediaId());
        task.setPlanId(id); task.setPlanVersion(expectedVersion); task.setKind(TaskKind.MEDIA_PROCESSING);
        // 任务复制已确认版本的参数快照，后台执行不再读取表单或重新询问模型。
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
            plan.setSummary("MP4 / " + (video.resolutionPreset().equals("720p") ? "720p" : "原分辨率")
                    + (parameters instanceof MuteParameters ? " / 移除音轨" : " / 保留音轨"));
        else plan.setSummary("MP3 / 提取第一条音轨 / 192 kbps");
        if (parameters instanceof ExportParameters export) {
            plan.setSummary(export.outputFormat().toUpperCase(Locale.ROOT)
                    + (export.audioOnly() ? " / 提取音轨" : " / " + export.videoCodec() + " / " + export.resolutionPreset())
                    + (export.startMs() == null ? "" : " / 裁切 " + export.startMs() + "-" + export.endMs() + " 毫秒")
                    + (export.targetSizeBytes() == null ? "" : " / 最多 " + export.targetSizeBytes() + " 字节")
                    + ("mute".equals(export.audioMode()) ? " / 静音" : "")
                    + (export.extractAudio() ? " / 另存原始音轨 MP3" : ""));
        }
        if (parameters instanceof WorkflowParameters workflow)
            plan.setSummary("顺序处理 / " + workflow.steps().size() + " 步 / " + workflow.outputFormat().toUpperCase(Locale.ROOT));
        if (parameters instanceof CompressionParameters compression)
            plan.setSummary(plan.getSummary() + " / 压缩至最多 " + compression.targetSizeBytes() + " 字节");
        if (parameters instanceof TrimParameters trim)
            plan.setSummary(plan.getSummary() + " / 裁切 " + trim.startMs() + "-" + trim.endMs() + " 毫秒");
        if (parameters instanceof BurnSubtitleParameters burn)
            plan.setSummary(plan.getSummary()+" / 烧录字幕 v"+burn.transcriptVersion());
        if (parameters instanceof JoinClipsParameters join)
            plan.setSummary(plan.getSummary()+" / 拼接 "+join.clips().size()+" 段 / "+join.totalDurationMs()+" 毫秒");
        plan.setUpdatedAt(now());
    }

    private void apply(OperationPlanEntity plan, Resolved resolved, String instruction) {
        plan.setInstruction(instruction==null ? null : instruction.strip());
        plan.setQuestionsJson(json.writeValueAsString(resolved.questions())); plan.setWarningsJson("[]");
        plan.setStatus(resolved.parameters()==null ? PlanStatus.NEEDS_INPUT : PlanStatus.READY);
        if(resolved.parameters()!=null) apply(plan,resolved.parameters());
        else { plan.setParametersJson(null); plan.setSummary("请补充处理要求"); plan.setUpdatedAt(now()); }
    }

    private static String checkedInstruction(String instruction) {
        if(instruction==null) return null;
        String value=instruction.strip();
        if(value.codePointCount(0,value.length())>2000) throw new BusinessException(ErrorCode.INVALID_PARAMETERS);
        return value;
    }

    /** 模型只提交候选参数或澄清问题；这里再按服务器能力、素材时长和格式白名单进行验收。 */
    private Resolved resolve(String userId,JsonNode node,String instruction,MediaEntity source,OperationParameters previous,String previousInstruction) {
        if(instruction==null) return new Resolved(parameters(node),List.of());
        if(instruction.isBlank()) throw new BusinessException(ErrorCode.INVALID_PARAMETERS);
        if(!planner.isAvailable(userId)) throw new BusinessException(ErrorCode.AI_UNAVAILABLE);
        var operations=new ArrayList<String>();
        if(probe.isAvailable() && transcoder.isAvailable()) operations.addAll(List.of("transcode","compress","trim","mute","join_clips"));
        var metadata=json.readValue(source.getMetadataJson(),MediaMetadataVO.class);
        if(probe.isAvailable() && transcoder.isAudioExtractionAvailable() && metadata.hasAudio()) operations.add("extract_audio");
        var formats=probe.isAvailable() ? transcoder.exportFormats().stream()
                .filter(format->metadata.hasAudio() || !Set.of("mp3","m4a","wav","flac").contains(format)).toList() : List.<String>of();
        var codecs=probe.isAvailable() ? transcoder.exportVideoCodecs() : List.<String>of();
        if(!formats.isEmpty()) operations.add("export");
        if(probe.isAvailable() && transcoder.isWorkflowAvailable()) operations.add("workflow");
        if(operations.isEmpty()) throw new BusinessException(ErrorCode.TRANSCODE_UNAVAILABLE);
        limiter.check("ai-plan:user:"+userId,20);
        var proposal=planner.propose(instruction.strip(),new OperationPlanner.Context(metadata,source.getSizeBytes(),List.copyOf(operations),
                previous,previousInstruction,formats,codecs,properties.maxOutputSize().toBytes()),userId);
        try {
            if(proposal==null || proposal.questions()==null) throw new IllegalArgumentException();
            if(proposal.parameters()!=null) {
                if(!proposal.questions().isEmpty()) throw new IllegalArgumentException();
                var parameters=parameters(proposal.parameters());
                if(!operations.contains(parameters.operation())) throw new IllegalArgumentException();
                if(parameters instanceof ExportParameters export && (!formats.contains(export.outputFormat())
                        || !export.audioOnly() && !codecs.contains(export.videoCodec()))) throw new IllegalArgumentException();
                validateOperation(parameters,source);
                if (parameters instanceof WorkflowParameters) requireTool(parameters);
                return new Resolved(parameters,List.of());
            }
            if(proposal.questions().isEmpty() || proposal.questions().size()>3 || new HashSet<>(proposal.questions()).size()!=proposal.questions().size())
                throw new IllegalArgumentException();
            return new Resolved(null,proposal.questions().stream().map(question->new PlanNotice(question.name(),question.message())).toList());
        // 模型 JSON 即使能解析，也不代表可执行；不能把内部解析异常或模型原文直接返回用户。
        } catch(RuntimeException invalidModelOutput) { throw new BusinessException(ErrorCode.AI_PLAN_FAILED); }
    }
    private void verify(Resolved resolved,MediaEntity source) {
        if(resolved.parameters()!=null) { validateOperation(resolved.parameters(),source); requireTool(resolved.parameters()); }
    }
    private static void choice(JsonNode node,String instruction) {
        if((node==null)==(instruction==null)) throw new BusinessException(ErrorCode.INVALID_PARAMETERS);
    }
    private static void editable(OperationPlanEntity plan,int expectedVersion) {
        if(plan.getVersion()!=expectedVersion) throw new BusinessException(ErrorCode.PLAN_VERSION_CONFLICT);
        if(plan.getStatus()==PlanStatus.EXECUTED) throw new BusinessException(ErrorCode.RESOURCE_CONFLICT);
    }
    private record Resolved(OperationParameters parameters,List<PlanNotice> questions) {}

    /** 按 operation 转成对应 DTO，并拒绝多余字段；这些字段不是任意 FFmpeg 命令行选项。 */
    private OperationParameters parameters(JsonNode node) {
        if ("workflow".equals(node.path("operation").asText())) return WorkflowSettings.parse(node);
        if ("export".equals(node.path("operation").asText())) return ExportSettings.parse(node);
        if("join_clips".equals(node.path("operation").asText())) {
            if(!node.isObject() || node.size()!=4 || !node.path("outputFormat").isString() || !"mp4".equals(node.path("outputFormat").asText())
                    || !node.path("audioMode").isString() || !"keep".equals(node.path("audioMode").asText())
                    || !node.path("clips").isArray() || node.path("clips").isEmpty() || node.path("clips").size()>JoinClipsParameters.MAX_CLIPS)
                throw new BusinessException(ErrorCode.INVALID_PARAMETERS);
            for(var clip:node.path("clips")) {
                if(!clip.isObject() || clip.size()!=2) throw new BusinessException(ErrorCode.INVALID_PARAMETERS);
                for(String key:Set.of("startMs","endMs")) if(!clip.path(key).isIntegralNumber() || !clip.path(key).canConvertToLong())
                    throw new BusinessException(ErrorCode.INVALID_PARAMETERS);
            }
            return json.treeToValue(node,OperationParameters.class);
        }
        if ("burn_subtitles".equals(node.path("operation").asText())) {
            if(!node.isObject() || node.size()!=6 || !node.path("outputFormat").isString() || !"mp4".equals(node.path("outputFormat").asText())
                    || !node.path("transcriptId").isString() || !node.path("transcriptVersion").isIntegralNumber()
                    || !node.path("transcriptVersion").canConvertToInt() || node.path("transcriptVersion").asInt()<1
                    || !node.path("resolutionPreset").isString() || !Set.of("source","720p").contains(node.path("resolutionPreset").asText())
                    || !node.path("audioMode").isString() || !"keep".equals(node.path("audioMode").asText()))
                throw new BusinessException(ErrorCode.INVALID_PARAMETERS);
            try { UUID.fromString(node.path("transcriptId").asText()); }
            catch(IllegalArgumentException invalidId) { throw new BusinessException(ErrorCode.INVALID_PARAMETERS); }
            return json.treeToValue(node,OperationParameters.class);
        }
        if ("extract_audio".equals(node.path("operation").asText())) {
            if (!node.isObject() || node.size() != 2 || !node.path("outputFormat").isString() || !"mp3".equals(node.path("outputFormat").asText()))
                throw new BusinessException(ErrorCode.INVALID_PARAMETERS);
            return json.treeToValue(node, OperationParameters.class);
        }
        if ("mute".equals(node.path("operation").asText())) {
            if (!node.isObject() || node.size() != 3 || !node.path("outputFormat").isString()
                    || !"mp4".equals(node.path("outputFormat").asText()) || !node.path("resolutionPreset").isString()
                    || !Set.of("source", "720p").contains(node.path("resolutionPreset").asText()))
                throw new BusinessException(ErrorCode.INVALID_PARAMETERS);
            return json.treeToValue(node, OperationParameters.class);
        }
        boolean compression = "compress".equals(node.path("operation").asText());
        boolean trim = "trim".equals(node.path("operation").asText());
        if (!node.isObject() || node.size() != (compression || trim ? 5 : 4)) throw new BusinessException(ErrorCode.INVALID_PARAMETERS);
        for (String key : Set.of("operation", "outputFormat", "audioMode"))
            if (!node.path(key).isString()) throw new BusinessException(ErrorCode.INVALID_PARAMETERS);
        if (!Set.of("transcode", "compress", "trim").contains(node.path("operation").asText()) || !node.path("outputFormat").asText().equals("mp4")
                || (!trim && (!node.path("resolutionPreset").isString() || !Set.of("source", "720p").contains(node.path("resolutionPreset").asText())))
                || !node.path("audioMode").asText().equals("keep")) throw new BusinessException(ErrorCode.INVALID_PARAMETERS);
        if (trim) for (String key : Set.of("startMs", "endMs"))
            if (!node.path(key).isIntegralNumber() || !node.path(key).canConvertToLong()) throw new BusinessException(ErrorCode.INVALID_PARAMETERS);
        if (compression && (!node.path("targetSizeBytes").isIntegralNumber() || !node.path("targetSizeBytes").canConvertToLong()
                || node.path("targetSizeBytes").asLong() <= 0)) throw new BusinessException(ErrorCode.INVALID_PARAMETERS);
        return json.treeToValue(node, OperationParameters.class);
    }

    private void validateOperation(OperationParameters parameters, MediaEntity source) {
        if (parameters instanceof WorkflowParameters workflow) {
            WorkflowSettings.compile(workflow, json.readValue(source.getMetadataJson(), MediaMetadataVO.class), source.getSizeBytes(), properties.maxOutputSize().toBytes());
            return;
        }
        if (parameters instanceof ExportParameters export) {
            ExportSettings.validateSource(export, json.readValue(source.getMetadataJson(), MediaMetadataVO.class), source.getSizeBytes(), properties.maxOutputSize().toBytes());
            return;
        }
        if(parameters instanceof JoinClipsParameters join && !join.fitsWithin(json.readValue(source.getMetadataJson(),MediaMetadataVO.class).durationMs()))
            throw new BusinessException(ErrorCode.INVALID_PARAMETERS);
        if(parameters instanceof BurnSubtitleParameters burn) {
            var selected=transcripts.get(source.getUserId(),burn.transcriptId().toString(),null);
            if(!selected.mediaId().equals(source.getId())) throw new BusinessException(ErrorCode.RESOURCE_NOT_FOUND);
            var latest=transcripts.latest(source.getUserId(),source.getId());
            if(!latest.id().equals(burn.transcriptId().toString()) || latest.version()!=burn.transcriptVersion())
                throw new BusinessException(ErrorCode.TRANSCRIPT_VERSION_CONFLICT);
        }
        if (parameters instanceof TrimParameters trim && !trim.fitsWithin(json.readValue(source.getMetadataJson(), MediaMetadataVO.class).durationMs()))
            throw new BusinessException(ErrorCode.INVALID_PARAMETERS);
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
        if (parameters instanceof WorkflowParameters workflow) {
            if (!probe.isAvailable() || !transcoder.isWorkflowAvailable()) throw new BusinessException(ErrorCode.TRANSCODE_UNAVAILABLE);
            var last = (WorkflowParameters.Export) workflow.steps().getLast();
            if (!transcoder.exportFormats().contains(last.outputFormat())
                    || last.videoCodec() != null && !transcoder.exportVideoCodecs().contains(last.videoCodec())
                    || last.extractAudio() && !transcoder.isAudioExtractionAvailable()) throw new BusinessException(ErrorCode.TRANSCODE_UNAVAILABLE);
            return;
        }
        if (parameters instanceof ExportParameters export) {
            if (!probe.isAvailable() || !transcoder.exportFormats().contains(export.outputFormat())
                    || !export.audioOnly() && !transcoder.exportVideoCodecs().contains(export.videoCodec())
                    || export.extractAudio() && !transcoder.isAudioExtractionAvailable())
                throw new BusinessException(ErrorCode.TRANSCODE_UNAVAILABLE);
            return;
        }
        if(parameters instanceof BurnSubtitleParameters) {
            if(!probe.isAvailable() || !transcoder.isSubtitleBurnAvailable()) throw new BusinessException(ErrorCode.SUBTITLE_BURN_UNAVAILABLE);
            return;
        }
        boolean audio = parameters instanceof ExtractAudioParameters;
        if (!probe.isAvailable() || !(audio ? transcoder.isAudioExtractionAvailable() : transcoder.isAvailable()))
            throw new BusinessException(audio ? ErrorCode.AUDIO_EXTRACTION_UNAVAILABLE : ErrorCode.TRANSCODE_UNAVAILABLE);
    }
    private LocalDateTime now() { return LocalDateTime.ofInstant(clock.instant(), ZoneOffset.UTC); }
}
