package org.example.ai_media_workbench.service.impl;

import java.io.IOException;
import java.nio.file.Files;
import java.time.Clock;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import org.example.ai_media_workbench.common.exception.BusinessException;
import org.example.ai_media_workbench.common.exception.ErrorCode;
import org.example.ai_media_workbench.common.storage.LocalMediaStorage;
import org.example.ai_media_workbench.dto.common.PageQuery;
import org.example.ai_media_workbench.entity.OutputEntity;
import org.example.ai_media_workbench.mapper.MediaMapper;
import org.example.ai_media_workbench.mapper.ProcessingMapper;
import org.example.ai_media_workbench.mapper.UserMapper;
import org.example.ai_media_workbench.entity.UserStatus;
import org.example.ai_media_workbench.service.AccountCleanupService;
import org.example.ai_media_workbench.service.OutputService;
import org.example.ai_media_workbench.vo.common.PageVO;
import org.example.ai_media_workbench.vo.processing.OutputVO;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OutputServiceImpl implements OutputService {
    private final ProcessingMapper mapper;
    private final MediaMapper media;
    private final LocalMediaStorage storage;
    private final ProcessingViews views;
    private final UserMapper users;
    private final AccountCleanupService cleanup;
    private final Clock clock;
    public OutputServiceImpl(ProcessingMapper mapper, MediaMapper media, LocalMediaStorage storage, ProcessingViews views,
                             UserMapper users, AccountCleanupService cleanup, Clock clock) {
        this.mapper = mapper; this.media = media; this.storage = storage; this.views = views;
        this.users = users; this.cleanup = cleanup; this.clock = clock;
    }
    @Override public OutputVO get(String userId, String id) { return file(userId, id).info(); }
    @Override
    public PageVO<OutputVO> list(String userId, String mediaId, PageQuery query) {
        if (mediaId != null && media.findOwned(userId, mediaId) == null) throw new BusinessException(ErrorCode.RESOURCE_NOT_FOUND);
        return new PageVO<>(mapper.outputs(userId, mediaId, query.offset(), query.getPageSize()).stream().map(views::output).toList(),
                query.getPage(), query.getPageSize(), mapper.countOutputs(userId, mediaId));
    }
    @Override
    public OutputFile file(String userId, String id) {
        OutputEntity output = mapper.output(userId, id);
        if (output == null) throw new BusinessException(ErrorCode.RESOURCE_NOT_FOUND);
        try {
            var path = storage.resolve(output.getStorageKey());
            if (Files.size(path) != output.getSizeBytes()) throw new IOException("Output size mismatch");
            return new OutputFile(views.output(output), path);
        } catch (IOException exception) {
            // Translate file availability before writing HTTP headers, not after starting the stream.
            throw new BusinessException(ErrorCode.OUTPUT_UNAVAILABLE);
        }
    }

    @Override
    @Transactional
    public void delete(String userId, String id) {
        // 与素材删除、发布和注销保持相同的账号锁顺序；短事务内同时撤销访问并提交清理任务。
        var account = users.findByIdForUpdate(userId);
        if (account == null || account.getStatus() != UserStatus.ACTIVE) throw new BusinessException(ErrorCode.UNAUTHENTICATED);
        var output = mapper.lockOutputIncludingDeleted(userId, id);
        if (output == null) throw new BusinessException(ErrorCode.RESOURCE_NOT_FOUND);
        if (output.getDeletedAt() != null) return;
        mapper.markOutputDeleted(userId, id, LocalDateTime.ofInstant(clock.instant(), ZoneOffset.UTC));
        cleanup.enqueueOutput(userId, id);
    }
}
