package org.example.ai_media_workbench.service.impl;

import java.time.Clock;
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
import org.example.ai_media_workbench.mapper.MediaMapper;
import org.example.ai_media_workbench.mapper.UserMapper;
import org.example.ai_media_workbench.service.MediaProbe;
import org.example.ai_media_workbench.service.MediaService;
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

    public MediaServiceImpl(MediaMapper mapper, UserMapper users, LocalMediaStorage storage, MediaProbe probe,
                            Clock clock, ObjectMapper json, PlatformTransactionManager manager) {
        this.mapper=mapper; this.users=users; this.storage=storage; this.probe=probe;
        this.clock=clock; this.json=json; this.transactions=new TransactionTemplate(manager);
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
    public MediaVO retryProbe(String userId, String id) {
        var media=owned(userId,id);
        if(media.getStatus()==MediaStatus.PROBING) return view(media);
        if(media.getStatus()!=MediaStatus.FAILED) throw new BusinessException(ErrorCode.RESOURCE_CONFLICT);
        requireTool();
        if(!storage.exists(media.getStorageKey())) throw new BusinessException(ErrorCode.RESOURCE_CONFLICT);
        mapper.retry(userId,id,now());
        return get(userId,id);
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
                metadata,null,error,media.getCreatedAt().toInstant(ZoneOffset.UTC),media.getUpdatedAt().toInstant(ZoneOffset.UTC));
    }

    private String displayName(String input) {
        String name=input==null ? "video" : input.replace('\\','/');
        name=name.substring(name.lastIndexOf('/')+1).replaceAll("[\\p{Cntrl}]", "").strip();
        if(name.isEmpty()) name="video";
        return name.codePointCount(0,name.length())>255 ? name.substring(0,name.offsetByCodePoints(0,255)) : name;
    }

    private LocalDateTime now() { return LocalDateTime.ofInstant(clock.instant(),ZoneOffset.UTC); }
}
