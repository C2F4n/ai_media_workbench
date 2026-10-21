package org.example.ai_media_workbench.service;

import java.nio.file.Path;
import org.example.ai_media_workbench.dto.common.PageQuery;
import org.example.ai_media_workbench.vo.common.PageVO;
import org.example.ai_media_workbench.vo.media.MediaVO;
import org.springframework.web.multipart.MultipartFile;

/** 素材直接归属于已认证用户，不创建默认项目。 */
public interface MediaService {
    MediaVO upload(String userId, MultipartFile file);
    PageVO<MediaVO> list(String userId, PageQuery query);
    MediaVO get(String userId, String mediaId);
    /** 先检查归属、检测状态、编码和受控文件，再交由Controller流式返回。 */
    MediaFile preview(String userId, String mediaId);
    MediaVO retryProbe(String userId, String mediaId);
    /** 原子撤销素材及关联资源，取消活动任务并安排持久化文件清理。 */
    void delete(String userId, String mediaId);

    record MediaFile(Path path, long sizeBytes, String filename, String contentType) {}
}
