package org.example.ai_media_workbench.service.impl;

import java.time.Clock;
import java.io.IOException;
import java.nio.file.Files;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.UUID;
import org.example.ai_media_workbench.common.exception.BusinessException;
import org.example.ai_media_workbench.common.exception.ErrorCode;
import org.example.ai_media_workbench.common.storage.LocalMediaStorage;
import org.example.ai_media_workbench.dto.common.PageQuery;
import org.example.ai_media_workbench.entity.MediaEntity;
import org.example.ai_media_workbench.entity.UserStatus;
import org.example.ai_media_workbench.entity.enums.MediaStatus;
import org.example.ai_media_workbench.entity.enums.MediaKind;
import org.example.ai_media_workbench.mapper.MediaMapper;
import org.example.ai_media_workbench.mapper.UserMapper;
import org.example.ai_media_workbench.service.MediaProbe;
import org.example.ai_media_workbench.service.MediaService;
import org.example.ai_media_workbench.service.AccountCleanupService;
import org.example.ai_media_workbench.vo.common.PageVO;
import org.example.ai_media_workbench.vo.media.MediaMetadataVO;
import org.example.ai_media_workbench.vo.media.MediaVO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.web.multipart.MultipartFile;
import tools.jackson.databind.ObjectMapper;

@Service
public class MediaServiceImpl implements MediaService {
    private static final Logger log = LoggerFactory.getLogger(MediaServiceImpl.class);
    private final MediaMapper mapper;
    private final UserMapper users;
    private final LocalMediaStorage storage;
    private final MediaProbe probe;
    private final Clock clock;
    private final ObjectMapper json;
    private final TransactionTemplate transactions;
    private final AccountCleanupService cleanup;

    public MediaServiceImpl(MediaMapper mapper, UserMapper users, LocalMediaStorage storage, MediaProbe probe,
                            Clock clock, ObjectMapper json, PlatformTransactionManager manager, AccountCleanupService cleanup) {
        this.mapper=mapper; this.users=users; this.storage=storage; this.probe=probe;
        this.clock=clock; this.json=json; this.transactions=new TransactionTemplate(manager);
        this.cleanup=cleanup;
    }

    @Override
    public MediaVO upload(String userId, MultipartFile file) {
        requireTool();
        var stored = storage.store(userId, file);
        var media = new MediaEntity();
        media.setId(UUID.randomUUID().toString()); media.setUserId(userId);
        media.setOriginalFilename(displayName(file.getOriginalFilename()));
        media.setStorageKey(stored.key()); media.setSizeBytes(stored.sizeBytes()); media.setStatus(MediaStatus.PROBING);
        media.setCreatedAt(now()); media.setUpdatedAt(media.getCreatedAt());
        try {
            // 文件先落盘，短事务再锁账号写记录，避免整个大文件复制期间持有数据库行锁。
            transactions.executeWithoutResult(status -> {
                var account = users.findByIdForUpdate(userId);
                if (account == null || account.getStatus()!=UserStatus.ACTIVE) throw new BusinessException(ErrorCode.UNAUTHENTICATED);
                mapper.insert(media);
            });
        } catch (RuntimeException exception) {
            // 仅补偿文件系统操作，不在 Service 吞异常或组装 HTTP 返回结果。
            try { storage.discard(stored.key()); } catch (Exception cleanup) { log.warn("Upload rollback cleanup failed"); }
            throw exception;
        }
        return view(media);
    }

    @Override
    public PageVO<MediaVO> list(String userId, PageQuery query) {
        return new PageVO<>(mapper.listOwned(userId,query.offset(),query.getPageSize()).stream().map(this::view).toList(),
                query.getPage(),query.getPageSize(),mapper.countOwned(userId));
    }

    @Override
    public MediaVO get(String userId, String id) { return view(owned(userId,id)); }

    @Override
    public MediaFile preview(String userId, String id) {
        var item = owned(userId, id);
        var metadata = item.getMetadataJson() == null ? null : json.readValue(item.getMetadataJson(), MediaMetadataVO.class);
        if (!previewable(item, metadata)) throw new BusinessException(ErrorCode.MEDIA_PREVIEW_UNAVAILABLE);
        try {
            var path = storage.resolve(item.getStorageKey());
            if (item.getSizeBytes() <= 0 || Files.size(path) != item.getSizeBytes() || !Files.isReadable(path))
                throw new IOException("Source file unavailable");
            return new MediaFile(path, item.getSizeBytes(), item.getOriginalFilename(), org.example.ai_media_workbench.common.web.MediaPreview.videoType(metadata));
        } catch (IOException exception) {
            // 在发送响应头前统一文件不可用错误；不返回磁盘路径，也不修改检测状态。
            throw new BusinessException(ErrorCode.MEDIA_PREVIEW_UNAVAILABLE);
        }
    }

    @Override
    public MediaVO retryProbe(String userId, String id) {
        var media=owned(userId,id);
        if(media.getStatus()==MediaStatus.PROBING) return view(media);
        if(media.getStatus()!=MediaStatus.FAILED) throw new BusinessException(ErrorCode.RESOURCE_CONFLICT);
        requireTool();
        if(!storage.exists(media.getStorageKey())) throw new BusinessException(ErrorCode.RESOURCE_CONFLICT);
        mapper.retry(userId,id,now());
        return get(userId,id);
    }

    @Override
    public void delete(String userId, String id) {
        transactions.executeWithoutResult(status -> {
            // 与建方案、执行、发布及注销采用相同的账号锁顺序，删除与新任务不能交错提交。
            var account = users.findByIdForUpdate(userId);
            if (account == null || account.getStatus() != UserStatus.ACTIVE) throw new BusinessException(ErrorCode.UNAUTHENTICATED);
            var item = mapper.lockOwnedIncludingDeleted(userId, id);
            if (item == null) throw new BusinessException(ErrorCode.RESOURCE_NOT_FOUND);
            if (item.getDeletedAt() != null) return;
            var time = now();
            mapper.markDeleted(userId, id, time);
            mapper.markPlansDeleted(userId, id, time);
            mapper.markTasksDeleted(userId, id, time);
            mapper.markOutputsDeleted(userId, id, time);
            cleanup.enqueueMedia(userId, id);
        });
    }

    private MediaEntity owned(String userId,String id) {
        var media=mapper.findOwned(userId,id);
        if(media==null) throw new BusinessException(ErrorCode.RESOURCE_NOT_FOUND);
        return media;
    }

    private void requireTool() {
        if(!probe.isAvailable()) throw new BusinessException(ErrorCode.MEDIA_TOOL_UNAVAILABLE);
    }

    private MediaVO view(MediaEntity media) {
        MediaMetadataVO metadata=media.getMetadataJson()==null ? null : json.readValue(media.getMetadataJson(),MediaMetadataVO.class);
        var error=media.getErrorCode()==null ? null : new MediaVO.ResourceError(media.getErrorCode(),media.getErrorMessage());
        return new MediaVO(media.getId(),media.getOriginalFilename(),media.getSizeBytes(),media.getKind(),media.getStatus(),
                metadata,previewable(media, metadata) ? "/api/media/" + media.getId() + "/preview" : null,
                error,media.getCreatedAt().toInstant(ZoneOffset.UTC),media.getUpdatedAt().toInstant(ZoneOffset.UTC));
    }

    private boolean previewable(MediaEntity item, MediaMetadataVO metadata) {
        // 根据实际检测的容器与编码决定预览，不信任文件扩展名。
        return item.getStatus() == MediaStatus.READY && item.getKind() == MediaKind.VIDEO && metadata != null
                && org.example.ai_media_workbench.common.web.MediaPreview.supported(metadata);
    }

    private String displayName(String input) {
        String name=input==null ? "video" : input.replace('\\','/');
        name=name.substring(name.lastIndexOf('/')+1).replaceAll("[\\p{Cntrl}]", "").strip();
        if(name.isEmpty()) name="video";
        return name.codePointCount(0,name.length())>255 ? name.substring(0,name.offsetByCodePoints(0,255)) : name;
    }

    private LocalDateTime now() { return LocalDateTime.ofInstant(clock.instant(),ZoneOffset.UTC); }
}
