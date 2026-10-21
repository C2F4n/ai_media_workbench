package org.example.ai_media_workbench.service.impl;

import java.nio.file.Files;
import java.time.*;
import java.util.*;
import java.util.function.BooleanSupplier;
import org.example.ai_media_workbench.common.exception.*;
import org.example.ai_media_workbench.common.storage.LocalMediaStorage;
import org.example.ai_media_workbench.dto.transcript.*;
import org.example.ai_media_workbench.entity.*;
import org.example.ai_media_workbench.entity.enums.*;
import org.example.ai_media_workbench.mapper.*;
import org.example.ai_media_workbench.properties.TranscodeProperties;
import org.example.ai_media_workbench.service.*;
import org.springframework.stereotype.Component;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import tools.jackson.databind.ObjectMapper;

/** 由同一个有界队列串行调度；云端 I/O 不持有数据库锁，字幕与成功状态原子发布。 */
@Component
public class TranscriptionWorker {
    private static final org.slf4j.Logger log=org.slf4j.LoggerFactory.getLogger(TranscriptionWorker.class);
    private final ProcessingMapper tasks;
    private final TranscriptMapper transcripts;
    private final MediaMapper media;
    private final UserMapper users;
    private final LocalMediaStorage storage;
    private final MediaTranscoder transcoder;
    private final MediaProbe probe;
    private final SpeechRecognizer recognizer;
    private final TranscodeProperties limits;
    private final ObjectMapper json;
    private final Clock clock;
    private final TransactionTemplate transactions;

    public TranscriptionWorker(ProcessingMapper tasks, TranscriptMapper transcripts, MediaMapper media, UserMapper users,
                               LocalMediaStorage storage, MediaTranscoder transcoder, MediaProbe probe, SpeechRecognizer recognizer,
                               TranscodeProperties limits, ObjectMapper json, Clock clock, PlatformTransactionManager manager) {
        this.tasks=tasks; this.transcripts=transcripts; this.media=media; this.users=users; this.storage=storage;
        this.transcoder=transcoder; this.probe=probe; this.recognizer=recognizer; this.limits=limits; this.json=json;
        this.clock=clock; this.transactions=new TransactionTemplate(manager);
    }
    public void process(TaskEntity task) {
        LocalMediaStorage.OutputTarget audio=null;
        long deadline=System.nanoTime()+limits.timeout().toNanos();
        BooleanSupplier cancelled=()->tasks.running(task.getId(),task.getRunToken())!=1;
        try {
            var source=media.findOwned(task.getUserId(),task.getMediaId());
            if (source==null) throw new BusinessException(ErrorCode.TASK_CANCELLED);
            var input=storage.resolve(source.getStorageKey());
            var metadata=probe.inspectAudio(input);
            long duration=Math.min(metadata.durationMs(),json.readValue(source.getMetadataJson(),org.example.ai_media_workbench.vo.media.MediaMetadataVO.class).durationMs());
            metadata=new org.example.ai_media_workbench.vo.media.MediaMetadataVO(metadata.container(),duration,null,null,null,metadata.hasAudio(),metadata.audioCodec());
            var request=json.readValue(task.getParametersJson(),TranscriptionRequest.class);
            audio=storage.createOutput(task.getUserId(),task.getId(),task.getRunToken(),"mp3");
            transcoder.prepareSpeechAudio(input,audio.path(),metadata,cancelled);
            CloudTransport.check(deadline,cancelled);
            var verified=probe.inspectAudio(audio.path());
            if (!verified.hasAudio() || !"mp3".equals(verified.audioCodec()) || verified.videoCodec()!=null
                    || Math.abs(verified.durationMs()-metadata.durationMs())>Math.max(250,metadata.durationMs()/1000)
                    || Files.size(audio.path())<=0 || Files.size(audio.path())>Math.min(limits.maxOutputSize().toBytes(),100L*1024*1024))
                throw new BusinessException(ErrorCode.ASR_FAILED);
            CloudTransport.check(deadline,cancelled);
            var recognized=recognizer.recognize(request.provider(),audio.path(),Duration.ofNanos(deadline-System.nanoTime()),cancelled,task.getUserId());
            CloudTransport.check(deadline,cancelled);
            if (recognized==null || recognized.isEmpty()) throw new BusinessException(ErrorCode.ASR_NO_SPEECH);
            var segments=new ArrayList<TranscriptSegment>();
            for (var segment:recognized) {
                long end=segment.endMs();
                if (end>metadata.durationMs() && end-metadata.durationMs()<=250) end=metadata.durationMs();
                segments.add(new TranscriptSegment(UUID.randomUUID(),segment.startMs(),end,segment.text()));
            }
            List<TranscriptSegment> checked;
            try { checked=TranscriptSegments.checked(segments,metadata.durationMs(),json); }
            catch (BusinessException invalidProviderData) { throw new BusinessException(ErrorCode.ASR_FAILED); }
            if (tasks.verifying(task.getId(),task.getRunToken())!=1) throw new BusinessException(ErrorCode.TASK_CANCELLED);
            var item=new TranscriptEntity(); item.setId(UUID.randomUUID().toString()); item.setUserId(task.getUserId());
            item.setMediaId(task.getMediaId()); item.setSourceTaskId(task.getId()); item.setLanguage(request.language());
            item.setVersion(1); item.setOriginalSegmentsJson(json.writeValueAsString(checked)); item.setCreatedAt(now()); item.setUpdatedAt(item.getCreatedAt());
            // 先删临时音轨再提交终态：即使发布后进程崩溃，也不会丢失临时文件的清理线索。
            storage.discardOutput(audio.key()); audio=null;
            transactions.executeWithoutResult(status->finish(task,item,null));
        } catch (Exception exception) {
            // 后台任务无 HTTP 请求可交给异常处理器；仅落库稳定错误码，不记录供应商响应/识别原文/密钥。
            ErrorCode error=exception instanceof BusinessException business ? business.code() : ErrorCode.ASR_FAILED;
            boolean cleaned=true;
            if (audio!=null) try { storage.discardOutput(audio.key()); audio=null; }
            catch (Exception cleanupFailure) { cleaned=false; }
            // 删除失败时保留运行令牌，由过期租约重试清理后结束，不能先清空令牌。
            if (cleaned) transactions.executeWithoutResult(status->finish(task,null,error));
        } finally {
            if (audio!=null) try { storage.discardOutput(audio.key()); }
            catch (Exception cleanupFailure) { log.warn("Private transcription audio cleanup deferred"); }
        }
    }
    private void finish(TaskEntity task,TranscriptEntity item,ErrorCode error) {
        var user=users.findByIdForUpdate(task.getUserId());
        if (user==null || user.getStatus()!=UserStatus.ACTIVE) return;
        var current=tasks.lockTask(task.getUserId(),task.getId());
        if (current==null || !task.getRunToken().equals(current.getRunToken())) return;
        boolean cancelled=current.getStatus()==TaskStatus.CANCELLING || error==ErrorCode.TASK_CANCELLED;
        task.setStatus(cancelled ? TaskStatus.CANCELLED : error!=null ? TaskStatus.FAILED : TaskStatus.SUCCEEDED);
        task.setStage(cancelled ? TaskStage.CANCELLED : error!=null ? TaskStage.FAILED : TaskStage.DONE);
        task.setProgressPercent(task.getStatus()==TaskStatus.SUCCEEDED ? 100 : null);
        task.setErrorCode(cancelled||error==null ? null : error.name()); task.setErrorMessage(cancelled||error==null ? null : error.message()); task.setFinishedAt(now());
        if (tasks.finish(task,now().minus(limits.lease()))!=1 || task.getStatus()!=TaskStatus.SUCCEEDED) return;
        transcripts.insert(item);
        var revision=new TranscriptRevisionEntity(); revision.setUserId(item.getUserId()); revision.setTranscriptId(item.getId());
        revision.setVersion(1); revision.setSegmentsJson(item.getOriginalSegmentsJson()); revision.setCreatedAt(item.getCreatedAt()); transcripts.insertRevision(revision);
    }
    private LocalDateTime now() { return LocalDateTime.ofInstant(clock.instant(),ZoneOffset.UTC).truncatedTo(java.time.temporal.ChronoUnit.MICROS); }
}
