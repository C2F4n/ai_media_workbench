package org.example.ai_media_workbench.service;

import java.nio.file.Path;
import org.example.ai_media_workbench.dto.common.PageQuery;
import org.example.ai_media_workbench.vo.common.PageVO;
import org.example.ai_media_workbench.vo.processing.OutputVO;

public interface OutputService {
    OutputVO get(String userId, String id);
    PageVO<OutputVO> list(String userId, String mediaId, PageQuery query);
    OutputFile file(String userId, String id);
    record OutputFile(OutputVO info, Path path) {}
}
