package org.example.ai_media_workbench.service.impl;

import java.time.Clock;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.UUID;
import org.example.ai_media_workbench.common.exception.BusinessException;
import org.example.ai_media_workbench.common.exception.ErrorCode;
import org.example.ai_media_workbench.common.storage.LocalMediaStorage;
import org.example.ai_media_workbench.entity.enums.MediaKind;
import org.example.ai_media_workbench.entity.enums.MediaStatus;
import org.example.ai_media_workbench.mapper.MediaMapper;
import org.example.ai_media_workbench.properties.MediaProperties;
import org.example.ai_media_workbench.properties.MediaToolProperties;
import org.example.ai_media_workbench.service.MediaProbe;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import tools.jackson.databind.ObjectMapper;

/** 数据库中的 PROBING 即待处理工作；有界串行执行，租约到期可恢复，注销后不能重新写入 READY。 */
@Component
public class MediaProbeWorker {
    private final MediaMapper mapper;
    private final MediaProbe probe;
    private final LocalMediaStorage storage;
    private final MediaToolProperties tool;
    private final MediaProperties media;
    private final Clock clock;
    private final ObjectMapper json;

    public MediaProbeWorker(MediaMapper mapper, MediaProbe probe, LocalMediaStorage storage, MediaToolProperties tool,
                             MediaProperties media, Clock clock, ObjectMapper json) {
        this.mapper=mapper; this.probe=probe; this.storage=storage; this.tool=tool;
        this.media=media; this.clock=clock; this.json=json;
    }

    @Scheduled(fixedDelayString="${app.media-tool.interval-ms:1000}")
    public void scheduledRun() { if(tool.workerEnabled()) runOne(); }

    public boolean runOne() {
        var cutoff=now().minus(tool.lease());
        var pending=mapper.findPending(cutoff);
        if(pending.isEmpty()) return false;
        var item=pending.getFirst();
        String token=UUID.randomUUID().toString();
        if(mapper.claim(item.getId(),token,cutoff,now())!=1) return false;
        item.setProbeToken(token);
        try {
            var metadata=probe.inspect(storage.resolve(item.getStorageKey()));
            if(metadata.durationMs()>media.maxDuration().toMillis()) throw new BusinessException(ErrorCode.MEDIA_DURATION_EXCEEDED);
            item.setMetadataJson(json.writeValueAsString(metadata));
            item.setKind(MediaKind.VIDEO); item.setStatus(MediaStatus.READY);
            item.setErrorCode(null); item.setErrorMessage(null);
        } catch (Exception exception) {
            // 后台任务没有 HTTP 上下文，必须持久化失败；不记录文件路径或进程原始输出。
            ErrorCode code=exception instanceof BusinessException business ? business.code() : ErrorCode.MEDIA_PROBE_FAILED;
            item.setStatus(MediaStatus.FAILED); item.setMetadataJson(null);
            item.setErrorCode(code.name()); item.setErrorMessage(code.message());
        }
        item.setUpdatedAt(now());
        mapper.complete(item);
        return true;
    }

    private LocalDateTime now() { return LocalDateTime.ofInstant(clock.instant(),ZoneOffset.UTC); }
}
