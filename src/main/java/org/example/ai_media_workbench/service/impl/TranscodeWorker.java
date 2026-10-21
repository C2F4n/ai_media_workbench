package org.example.ai_media_workbench.service.impl;

import java.nio.file.Files;
import java.time.Clock;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.UUID;
import org.example.ai_media_workbench.common.exception.BusinessException;
import org.example.ai_media_workbench.common.exception.ErrorCode;
import org.example.ai_media_workbench.common.storage.LocalMediaStorage;
import org.example.ai_media_workbench.dto.processing.VideoParameters;
import org.example.ai_media_workbench.dto.processing.OperationParameters;
import org.example.ai_media_workbench.dto.processing.ExtractAudioParameters;
import org.example.ai_media_workbench.dto.processing.CompressionParameters;
import org.example.ai_media_workbench.dto.processing.TrimParameters;
import org.example.ai_media_workbench.dto.processing.MuteParameters;
import org.example.ai_media_workbench.dto.processing.BurnSubtitleParameters;
import org.example.ai_media_workbench.dto.processing.JoinClipsParameters;
import org.example.ai_media_workbench.dto.processing.ExportParameters;
import org.example.ai_media_workbench.dto.processing.WorkflowParameters;
import org.example.ai_media_workbench.entity.OutputEntity;
import org.example.ai_media_workbench.entity.TaskEntity;
import org.example.ai_media_workbench.entity.UserStatus;
import org.example.ai_media_workbench.entity.enums.TaskStage;
import org.example.ai_media_workbench.entity.enums.TaskStatus;
import org.example.ai_media_workbench.mapper.MediaMapper;
import org.example.ai_media_workbench.mapper.ProcessingMapper;
import org.example.ai_media_workbench.mapper.UserMapper;
import org.example.ai_media_workbench.properties.TranscodeProperties;
import org.example.ai_media_workbench.service.MediaProbe;
import org.example.ai_media_workbench.service.MediaTranscoder;
import org.example.ai_media_workbench.vo.media.MediaMetadataVO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import tools.jackson.databind.ObjectMapper;

/** One conversion per worker. No database locks are held while FFmpeg is running. */
@Component
public class TranscodeWorker {
    private static final Logger log = LoggerFactory.getLogger(TranscodeWorker.class);
    private final ProcessingMapper mapper;
    private final MediaMapper media;
    private final UserMapper users;
    private final LocalMediaStorage storage;
    private final MediaTranscoder transcoder;
    private final MediaProbe probe;
    private final TranscodeProperties properties;
    private final ObjectMapper json;
    private final Clock clock;
    private final TransactionTemplate transactions;
    private final TranscriptionWorker transcription;
    private final org.example.ai_media_workbench.service.TranscriptService transcripts;

    public TranscodeWorker(ProcessingMapper mapper, MediaMapper media, UserMapper users, LocalMediaStorage storage,
                           MediaTranscoder transcoder, MediaProbe probe, TranscodeProperties properties,
                           ObjectMapper json, Clock clock, PlatformTransactionManager manager, TranscriptionWorker transcription,
                           org.example.ai_media_workbench.service.TranscriptService transcripts) {
        this.mapper = mapper; this.media = media; this.users = users; this.storage = storage;
        this.transcoder = transcoder; this.probe = probe; this.properties = properties;
        this.json = json; this.clock = clock; this.transactions = new TransactionTemplate(manager);
        this.transcription = transcription;
        this.transcripts = transcripts;
    }

    @Scheduled(fixedDelay = 1000)
    public void scheduledRun() { if (properties.workerEnabled()) runOne(); }

    public synchronized boolean runOne() {
        var cutoff = now().minus(properties.lease());
        for (var old : mapper.expired(cutoff)) {
            if (old.getRunToken() != null && !discardExpired(old)) continue;
            mapper.expire(old.getId(), cutoff, now());
        }
        var pending = mapper.pending();
        if (pending.isEmpty()) return false;
        var task = pending.getFirst();
        task.setRunToken(UUID.randomUUID().toString());
        if (mapper.claim(task.getId(), task.getRunToken(), now()) != 1) return false;
        if (task.getKind() == org.example.ai_media_workbench.entity.enums.TaskKind.TRANSCRIPTION) {
            transcription.process(task); return true;
        }
        LocalMediaStorage.OutputTarget target = null;
        LocalMediaStorage.OutputTarget audioTarget = null;
        boolean published = false;
        boolean extractingAudio = false;
        boolean trimming = false;
        boolean muting = false;
        boolean burning = false;
        boolean joining = false;
        boolean exporting = false;
        try {
            var source = media.findOwned(task.getUserId(), task.getMediaId());
            if (source == null) throw new BusinessException(ErrorCode.TASK_CANCELLED);
            var original = json.readValue(source.getMetadataJson(), MediaMetadataVO.class);
            var parameters = json.readValue(task.getParametersJson(), OperationParameters.class);
            extractingAudio = parameters instanceof ExtractAudioParameters || parameters instanceof ExportParameters e && e.audioOnly()
                    || parameters instanceof WorkflowParameters && java.util.Set.of("mp3", "m4a", "wav", "flac").contains(parameters.outputFormat());
            exporting = parameters instanceof ExportParameters || parameters instanceof WorkflowParameters;
            trimming = parameters instanceof TrimParameters;
            muting = parameters instanceof MuteParameters;
            burning = parameters instanceof BurnSubtitleParameters;
            joining = parameters instanceof JoinClipsParameters;
            var input = storage.resolve(source.getStorageKey());
            if (extractingAudio && !(parameters instanceof WorkflowParameters)) original = probe.inspectAudio(input);
            target = storage.createOutput(task.getUserId(), task.getId(), task.getRunToken(), parameters.outputFormat());
            MediaMetadataVO originalAudio = null;
            if (parameters instanceof WorkflowParameters workflow) {
                var compiled = WorkflowSettings.compile(workflow, original, source.getSizeBytes(), properties.maxOutputSize().toBytes());
                if (compiled.export().extractAudio()) {
                    originalAudio = probe.inspectAudio(input);
                    audioTarget = storage.createOutput(task.getUserId(), task.getId(), task.getRunToken(), "mp3");
                }
                transcoder.workflow(input, target.path(), audioTarget == null ? null : audioTarget.path(), original, workflow,
                        () -> mapper.running(task.getId(), task.getRunToken()) != 1);
                storage.discardOutputAuxiliary(target.key());
            } else if (parameters instanceof ExportParameters export) {
                ExportSettings.validateSource(export, original, source.getSizeBytes(), properties.maxOutputSize().toBytes());
                if (export.extractAudio()) {
                    originalAudio = probe.inspectAudio(input);
                    audioTarget = storage.createOutput(task.getUserId(), task.getId(), task.getRunToken(), "mp3");
                }
                transcoder.export(input, target.path(), audioTarget == null ? null : audioTarget.path(), original, export,
                        () -> mapper.running(task.getId(), task.getRunToken()) != 1);
                storage.discardOutputAuxiliary(target.key());
            } else if(parameters instanceof BurnSubtitleParameters burn) {
                var revision=transcripts.get(task.getUserId(),burn.transcriptId().toString(),burn.transcriptVersion());
                if(!revision.mediaId().equals(task.getMediaId())) throw new BusinessException(ErrorCode.RESOURCE_NOT_FOUND);
                var size=FfmpegMediaTranscoder.dimensions(original,burn);
                var subtitleFile=java.nio.file.Path.of(target.path()+".ass");
                Files.writeString(subtitleFile,AssSubtitles.render(revision.segments(),size[0],size[1]),
                        java.nio.charset.StandardCharsets.UTF_8,java.nio.file.StandardOpenOption.CREATE_NEW);
                transcoder.burnSubtitles(input,target.path(),original,burn,subtitleFile,
                        () -> mapper.running(task.getId(),task.getRunToken())!=1);
                // 在清空运行令牌前删除私有字幕，避免崩溃后失去辅助文件的清理线索。
                storage.discardOutputAuxiliary(target.key());
            } else transcoder.convert(input, target.path(), original, parameters,
                    () -> mapper.running(task.getId(), task.getRunToken()) != 1);
            if(joining) storage.discardOutputAuxiliary(target.key());
            if (mapper.verifying(task.getId(), task.getRunToken()) != 1) throw new BusinessException(ErrorCode.TASK_CANCELLED);
            var metadata = extractingAudio ? probe.inspectAudio(target.path()) : probe.inspect(target.path());
            verify(original, metadata, parameters);
            long size = Files.size(target.path());
            if (size <= 0 || size > properties.maxOutputSize().toBytes()) throw new BusinessException(ErrorCode.OUTPUT_TOO_LARGE);
            if (parameters instanceof CompressionParameters compression
                    && (size > compression.targetSizeBytes() || size >= source.getSizeBytes()))
                throw new BusinessException(ErrorCode.COMPRESSION_TARGET_UNREACHABLE);
            if (parameters instanceof ExportParameters export && export.targetSizeBytes() != null
                    && (size > export.targetSizeBytes() || size >= source.getSizeBytes()))
                throw new BusinessException(ErrorCode.COMPRESSION_TARGET_UNREACHABLE);
            if (parameters instanceof WorkflowParameters workflow) {
                Long limit = ((WorkflowParameters.Export) workflow.steps().getLast()).targetSizeBytes();
                if (limit != null && (size > limit || size >= source.getSizeBytes())) throw new BusinessException(ErrorCode.COMPRESSION_TARGET_UNREACHABLE);
            }
            var output = new OutputEntity();
            output.setId(UUID.randomUUID().toString()); output.setUserId(task.getUserId()); output.setTaskId(task.getId());
            String name = source.getOriginalFilename().replaceFirst("\\.[^.]*$", "");
            if (name.codePointCount(0, name.length()) > 120) name = name.substring(0, name.offsetByCodePoints(0, 120));
            output.setFilename(name + (extractingAudio ? "-audio.mp3" : trimming ? "-trimmed.mp4" : muting ? "-muted.mp4" : burning ? "-subtitled.mp4" : joining ? "-joined.mp4" : parameters instanceof CompressionParameters ? "-compressed.mp4" : "-converted.mp4")); output.setStorageKey(target.key());
            output.setContentType(extractingAudio ? "audio/mpeg" : "video/mp4"); output.setSizeBytes(size); output.setMetadataJson(json.writeValueAsString(metadata));
            if (parameters instanceof ExportParameters export) {
                output.setFilename(name + "-export." + export.outputFormat()); output.setContentType(ExportSettings.contentType(export.outputFormat()));
            }
            if (parameters instanceof WorkflowParameters workflow) {
                output.setFilename(name + "-workflow." + workflow.outputFormat()); output.setContentType(ExportSettings.contentType(workflow.outputFormat()));
            }
            output.setCreatedAt(now());
            var outputs = new java.util.ArrayList<OutputEntity>(); outputs.add(output);
            if (audioTarget != null) {
                var audioMetadata = probe.inspectAudio(audioTarget.path());
                verify(originalAudio, audioMetadata, new ExtractAudioParameters("extract_audio", "mp3"));
                long audioSize = Files.size(audioTarget.path());
                if (audioSize <= 0 || audioSize > properties.maxOutputSize().toBytes()) throw new BusinessException(ErrorCode.OUTPUT_TOO_LARGE);
                var audio = new OutputEntity(); audio.setId(UUID.randomUUID().toString()); audio.setUserId(task.getUserId()); audio.setTaskId(task.getId());
                audio.setFilename(name + "-original-audio.mp3"); audio.setStorageKey(audioTarget.key()); audio.setContentType("audio/mpeg");
                audio.setSizeBytes(audioSize); audio.setMetadataJson(json.writeValueAsString(audioMetadata)); audio.setCreatedAt(now()); outputs.add(audio);
            }
            // 同一任务的多个结果在一个事务中发布，任意一个验收失败都不会暴露半成品。
            published = Boolean.TRUE.equals(transactions.execute(status -> finish(task, outputs, null)));
        } catch (Exception exception) {
            // Background work has no HTTP response: persist a safe failure, never raw tool output or disk paths.
            ErrorCode error = exception instanceof BusinessException business ? business.code() : ErrorCode.TRANSCODE_FAILED;
            if (extractingAudio && error == ErrorCode.TRANSCODE_FAILED) error = ErrorCode.AUDIO_EXTRACTION_FAILED;
            if (trimming && error == ErrorCode.TRANSCODE_FAILED) error = ErrorCode.TRIM_FAILED;
            if (muting && error == ErrorCode.TRANSCODE_FAILED) error = ErrorCode.MUTE_FAILED;
            if (burning && error == ErrorCode.TRANSCODE_FAILED) error = ErrorCode.SUBTITLE_BURN_FAILED;
            if (joining && error == ErrorCode.TRANSCODE_FAILED) error = ErrorCode.CLIP_JOIN_FAILED;
            ErrorCode failure = error;
            boolean cleaned=true;
            if((burning || joining || exporting) && target!=null) try { storage.discardOutput(target.key()); if (audioTarget != null) storage.discardOutput(audioTarget.key()); }
            catch(Exception cleanupFailure) { cleaned=false; log.warn("Private subtitle cleanup deferred"); }
            if(cleaned) transactions.executeWithoutResult(status -> finish(task, null, failure));
        } finally {
            // Unpublished/partial outputs must not become accessible after cancellation, deletion or a stale lease.
            if (!published && target != null) discard(target.key());
            if (!published && audioTarget != null) discard(audioTarget.key());
        }
        return true;
    }

    private boolean finish(TaskEntity task, java.util.List<OutputEntity> outputs, ErrorCode error) {
        var user = users.findByIdForUpdate(task.getUserId());
        if (user == null || user.getStatus() != UserStatus.ACTIVE) return false;
        var current = mapper.lockTask(task.getUserId(), task.getId());
        if (current == null || !task.getRunToken().equals(current.getRunToken())) return false;
        boolean cancelled = current.getStatus() == TaskStatus.CANCELLING || error == ErrorCode.TASK_CANCELLED;
        task.setStatus(cancelled ? TaskStatus.CANCELLED : error != null ? TaskStatus.FAILED : TaskStatus.SUCCEEDED);
        task.setStage(cancelled ? TaskStage.CANCELLED : error != null ? TaskStage.FAILED : TaskStage.DONE);
        task.setProgressPercent(task.getStatus() == TaskStatus.SUCCEEDED ? 100 : null);
        task.setErrorCode(cancelled || error == null ? null : error.name());
        task.setErrorMessage(cancelled || error == null ? null : error.message()); task.setFinishedAt(now());
        if (mapper.finish(task, now().minus(properties.lease())) != 1) return false;
        if (task.getStatus() == TaskStatus.SUCCEEDED && outputs != null) { outputs.forEach(mapper::insertOutput); return true; }
        return false;
    }

    private void verify(MediaMetadataVO source, MediaMetadataVO output, OperationParameters parameters) {
        if (parameters instanceof WorkflowParameters workflow) {
            var compiled = WorkflowSettings.compile(workflow, source, Long.MAX_VALUE, properties.maxOutputSize().toBytes());
            verifyExport(compiled.metadata(), output, compiled.export()); return;
        }
        if (parameters instanceof ExportParameters export) {
            verifyExport(source, output, export); return;
        }
        if (parameters instanceof ExtractAudioParameters) {
            if (!"mp3".equals(output.container()) || !output.hasAudio() || !"mp3".equals(output.audioCodec())
                    || output.width() != null || output.height() != null || output.videoCodec() != null
                    || Math.abs(output.durationMs() - source.durationMs()) > Math.max(250, source.durationMs() / 1000))
                throw new BusinessException(ErrorCode.AUDIO_EXTRACTION_FAILED);
            return;
        }
        int[] size = FfmpegMediaTranscoder.dimensions(source, (VideoParameters) parameters);
        boolean trim = parameters instanceof TrimParameters;
        long expectedDuration = parameters instanceof JoinClipsParameters join ? join.totalDurationMs()
                : trim ? ((TrimParameters) parameters).endMs() - ((TrimParameters) parameters).startMs() : source.durationMs();
        // 首条音轨可能在所选区间开始前已结束；不补静音，也不要求裁切结果一定有声音。
        boolean invalidAudio = parameters instanceof MuteParameters ? output.hasAudio() || output.audioCodec() != null
                : trim ? output.hasAudio() && !source.hasAudio() : output.hasAudio() != source.hasAudio();
        if (output.width() != size[0] || output.height() != size[1] || !"h264".equals(output.videoCodec())
                || invalidAudio || (output.hasAudio() && !"aac".equals(output.audioCodec()))
                || Math.abs(output.durationMs() - expectedDuration) > Math.max(250, expectedDuration / 1000))
            throw new BusinessException(ErrorCode.TRANSCODE_FAILED);
    }

    private void verifyExport(MediaMetadataVO source, MediaMetadataVO output, ExportParameters p) {
        long duration = p.duration(source.durationMs());
        boolean bad = Math.abs(output.durationMs() - duration) > Math.max(300, duration / 1000);
        String container = output.container();
        boolean containerMatches = switch (p.outputFormat()) {
            case "mp4", "mov", "m4a" -> container != null && container.contains("mov");
            case "mkv", "webm" -> container != null && container.contains("matroska");
            default -> p.outputFormat().equals(container);
        };
        if (p.audioOnly()) bad |= output.videoCodec() != null || !output.hasAudio() || !ExportSettings.audioCodec(p.outputFormat()).equals(output.audioCodec());
        else {
            int[] size = ExportSettings.dimensions(source, p);
            bad |= !java.util.Objects.equals(output.width(), size[0]) || !java.util.Objects.equals(output.height(), size[1]) || !p.videoCodec().equals(output.videoCodec());
            bad |= "mute".equals(p.audioMode()) ? output.hasAudio() : p.startMs() == null ? output.hasAudio() != source.hasAudio() : output.hasAudio() && !source.hasAudio();
            bad |= output.hasAudio() && !ExportSettings.audioCodec(p.outputFormat()).equals(output.audioCodec());
        }
        if (bad || !containerMatches) throw new BusinessException(ErrorCode.TRANSCODE_FAILED);
    }

    private void discard(String key) {
        try { storage.discardOutput(key); }
        catch (Exception exception) { log.warn("Unpublished conversion cleanup failed"); }
    }
    private boolean discardExpired(TaskEntity task) {
        try {
            String prefix=task.getUserId()+"/"+task.getId()+"-"+task.getRunToken();
            for (String format : LocalMediaStorage.OUTPUT_FORMATS) storage.discardOutput(prefix+"."+format);
            return true;
        } catch (Exception exception) { log.warn("Expired task file cleanup will be retried"); return false; }
    }
    private LocalDateTime now() { return LocalDateTime.ofInstant(clock.instant(), ZoneOffset.UTC); }
}
