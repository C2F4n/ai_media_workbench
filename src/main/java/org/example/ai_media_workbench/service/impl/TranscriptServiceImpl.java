package org.example.ai_media_workbench.service.impl;

import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import org.example.ai_media_workbench.common.exception.BusinessException;
import org.example.ai_media_workbench.common.exception.ErrorCode;
import org.example.ai_media_workbench.common.storage.LocalMediaStorage;
import org.example.ai_media_workbench.dto.transcript.*;
import org.example.ai_media_workbench.entity.*;
import org.example.ai_media_workbench.entity.enums.*;
import org.example.ai_media_workbench.mapper.*;
import org.example.ai_media_workbench.properties.TranscodeProperties;
import org.example.ai_media_workbench.service.SpeechRecognizer;
import org.example.ai_media_workbench.service.TranscriptService;
import org.example.ai_media_workbench.service.MediaProbe;
import org.example.ai_media_workbench.service.MediaTranscoder;
import org.example.ai_media_workbench.vo.media.MediaMetadataVO;
import org.example.ai_media_workbench.vo.processing.TaskVO;
import org.example.ai_media_workbench.vo.transcript.TranscriptVO;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.ObjectMapper;

@Service
public class TranscriptServiceImpl implements TranscriptService {
    private final TranscriptMapper transcripts;
    private final MediaMapper media;
    private final UserMapper users;
    private final ProcessingMapper tasks;
    private final ProcessingViews views;
    private final SpeechRecognizer recognizer;
    private final MediaProbe probe;
    private final MediaTranscoder transcoder;
    private final org.example.ai_media_workbench.service.SubtitleCorrector corrector;
    private final org.example.ai_media_workbench.common.security.AuthRateLimiter limiter;
    private final LocalMediaStorage storage;
    private final TranscodeProperties limits;
    private final ObjectMapper json;
    private final Clock clock;

    public TranscriptServiceImpl(TranscriptMapper transcripts, MediaMapper media, UserMapper users, ProcessingMapper tasks,
                                  ProcessingViews views, SpeechRecognizer recognizer, LocalMediaStorage storage,
                                  TranscodeProperties limits, ObjectMapper json, Clock clock, MediaProbe probe, MediaTranscoder transcoder,
                                  org.example.ai_media_workbench.service.SubtitleCorrector corrector,
                                  org.example.ai_media_workbench.common.security.AuthRateLimiter limiter) {
        this.transcripts=transcripts; this.media=media; this.users=users; this.tasks=tasks; this.views=views;
        this.recognizer=recognizer; this.storage=storage; this.limits=limits; this.json=json; this.clock=clock;
        this.probe=probe; this.transcoder=transcoder;
        this.corrector=corrector; this.limiter=limiter;
    }

    @Override @Transactional
    public TaskVO transcribe(String userId, String mediaId, TranscriptionRequest input) {
        lockUser(userId); var source = source(userId, mediaId);
        if (source.getStatus() != MediaStatus.READY || source.getMetadataJson() == null || !storage.exists(source.getStorageKey()))
            throw new BusinessException(ErrorCode.RESOURCE_CONFLICT);
        if (!metadata(source).hasAudio()) throw new BusinessException(ErrorCode.SOURCE_HAS_NO_AUDIO);
        var active = transcripts.active(userId, mediaId);
        if (active != null) return views.task(active);
        if (!input.force() && transcripts.latest(userId, mediaId) != null) throw new BusinessException(ErrorCode.TRANSCRIPT_ALREADY_EXISTS);
        if (!probe.isAvailable() || !transcoder.isAudioExtractionAvailable() || !recognizer.isAvailable(input.provider(),userId))
            throw new BusinessException(ErrorCode.ASR_UNAVAILABLE);
        limiter.check("transcription:user:"+userId,10);
        tasks.lockQueue();
        if (tasks.activeCount() >= limits.queueLimit()) throw new BusinessException(ErrorCode.QUEUE_FULL);
        var task = new TaskEntity(); task.setId(UUID.randomUUID().toString()); task.setUserId(userId); task.setMediaId(mediaId);
        task.setKind(TaskKind.TRANSCRIPTION); task.setSourceId(mediaId); task.setParametersJson(json.writeValueAsString(input));
        task.setStatus(TaskStatus.QUEUED); task.setStage(TaskStage.WAITING); task.setCreatedAt(now()); tasks.insertTask(task);
        return views.task(task);
    }

    @Override public TranscriptVO latest(String userId, String mediaId) {
        source(userId, mediaId);
        var item=transcripts.latest(userId, mediaId);
        if(item==null) throw new BusinessException(ErrorCode.RESOURCE_NOT_FOUND);
        return view(item, null);
    }

    @Override public TranscriptVO get(String userId, String id, Integer version) {
        var item=transcripts.owned(userId, id);
        if(item==null) throw new BusinessException(ErrorCode.RESOURCE_NOT_FOUND);
        return view(item, version);
    }

    @Override @Transactional
    public TranscriptVO update(String userId, String id, UpdateTranscriptRequest input) {
        lockUser(userId);
        var item=transcripts.lockOwned(userId, id);
        if(item==null) throw new BusinessException(ErrorCode.RESOURCE_NOT_FOUND);
        if(item.getVersion()!=input.expectedVersion()) throw new BusinessException(ErrorCode.TRANSCRIPT_VERSION_CONFLICT);
        var segments=TranscriptSegments.checked(input.segments(), metadata(source(userId,item.getMediaId())).durationMs(), json);
        item.setVersion(Math.addExact(item.getVersion(),1)); item.setUpdatedAt(now());
        var revision=new TranscriptRevisionEntity(); revision.setUserId(userId); revision.setTranscriptId(id);
        revision.setVersion(item.getVersion()); revision.setSegmentsJson(json.writeValueAsString(segments)); revision.setCreatedAt(item.getUpdatedAt());
        transcripts.insertRevision(revision); transcripts.update(item);
        return view(item, null);
    }

    @Override public org.example.ai_media_workbench.vo.transcript.TranscriptCorrectionVO correct(String userId,String id,CorrectTranscriptRequest input) {
        var item=get(userId,id,null);
        if(item.version()!=input.expectedVersion()) throw new BusinessException(ErrorCode.TRANSCRIPT_VERSION_CONFLICT);
        var segment=item.segments().stream().filter(value->value.id().equals(input.segmentId())).findFirst()
                .orElseThrow(()->new BusinessException(ErrorCode.RESOURCE_NOT_FOUND));
        if(!corrector.isAvailable(userId)) throw new BusinessException(ErrorCode.AI_UNAVAILABLE);
        limiter.check("subtitle-correction:user:"+userId,20);
        String corrected=corrector.correct(segment.text(),userId);
        // 云端等待期间不持锁；返回建议前重新检查归属、删除状态和版本，避免过时结果。
        if(get(userId,id,null).version()!=input.expectedVersion()) throw new BusinessException(ErrorCode.TRANSCRIPT_VERSION_CONFLICT);
        return new org.example.ai_media_workbench.vo.transcript.TranscriptCorrectionVO(id,item.version(),segment.id(),segment.text(),corrected);
    }

    @Override public SrtFile srt(String userId, String id, Integer version) {
        var item=get(userId,id,version); var source=source(userId,item.mediaId());
        var result=new StringBuilder(); int index=1;
        for(var segment:item.segments()) result.append(index++).append("\r\n")
                .append(timestamp(segment.startMs())).append(" --> ").append(timestamp(segment.endMs())).append("\r\n")
                .append(segment.text().replace("\n","\r\n")).append("\r\n\r\n");
        String name=source.getOriginalFilename().replaceFirst("\\.[^.]*$", "");
        if(name.codePointCount(0,name.length())>100) name=name.substring(0,name.offsetByCodePoints(0,100));
        return new SrtFile(name+"-subtitles-v"+item.version()+".srt",result.toString().getBytes(StandardCharsets.UTF_8));
    }

    private TranscriptVO view(TranscriptEntity item, Integer requested) {
        int version=requested==null?item.getVersion():requested;
        var revision=transcripts.revision(item.getUserId(),item.getId(),version);
        if(revision==null) throw new BusinessException(ErrorCode.RESOURCE_NOT_FOUND);
        return new TranscriptVO(item.getId(),item.getMediaId(),version,item.getLanguage(),segments(revision.getSegmentsJson()),
                segments(item.getOriginalSegmentsJson()),item.getCreatedAt().toInstant(ZoneOffset.UTC),revision.getCreatedAt().toInstant(ZoneOffset.UTC));
    }
    private List<TranscriptSegment> segments(String value) { return List.copyOf(Arrays.asList(json.readValue(value,TranscriptSegment[].class))); }
    private MediaMetadataVO metadata(MediaEntity item) { return json.readValue(item.getMetadataJson(),MediaMetadataVO.class); }
    private MediaEntity source(String userId,String id) {
        var item=media.findOwned(userId,id);
        if(item==null) throw new BusinessException(ErrorCode.RESOURCE_NOT_FOUND);
        return item;
    }
    private void lockUser(String userId) {
        var user=users.findByIdForUpdate(userId);
        if(user==null||user.getStatus()!=UserStatus.ACTIVE) throw new BusinessException(ErrorCode.UNAUTHENTICATED);
    }
    private static String timestamp(long ms) { return String.format(Locale.ROOT,"%02d:%02d:%02d,%03d",ms/3600000,ms/60000%60,ms/1000%60,ms%1000); }
    private LocalDateTime now() { return LocalDateTime.ofInstant(clock.instant(),ZoneOffset.UTC).truncatedTo(java.time.temporal.ChronoUnit.MICROS); }
}
