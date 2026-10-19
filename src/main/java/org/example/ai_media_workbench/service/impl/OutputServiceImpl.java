package org.example.ai_media_workbench.service.impl;

import java.io.IOException;
import java.nio.file.Files;
import org.example.ai_media_workbench.common.exception.BusinessException;
import org.example.ai_media_workbench.common.exception.ErrorCode;
import org.example.ai_media_workbench.common.storage.LocalMediaStorage;
import org.example.ai_media_workbench.dto.common.PageQuery;
import org.example.ai_media_workbench.entity.OutputEntity;
import org.example.ai_media_workbench.mapper.MediaMapper;
import org.example.ai_media_workbench.mapper.ProcessingMapper;
import org.example.ai_media_workbench.service.OutputService;
import org.example.ai_media_workbench.vo.common.PageVO;
import org.example.ai_media_workbench.vo.processing.OutputVO;
import org.springframework.stereotype.Service;

@Service
public class OutputServiceImpl implements OutputService {
    private final ProcessingMapper mapper;
    private final MediaMapper media;
    private final LocalMediaStorage storage;
    private final ProcessingViews views;
    public OutputServiceImpl(ProcessingMapper mapper, MediaMapper media, LocalMediaStorage storage, ProcessingViews views) {
        this.mapper = mapper; this.media = media; this.storage = storage; this.views = views;
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
}
