package org.example.ai_media_workbench.vo.media;

import java.time.Instant;
import org.example.ai_media_workbench.entity.enums.MediaKind;
import org.example.ai_media_workbench.entity.enums.MediaStatus;

/** 不暴露 userId、存储键或探测租约；预览尚未实现，previewUrl 始终为 null。 */
public record MediaVO(String id, String originalFilename, long sizeBytes, MediaKind kind, MediaStatus status,
                      MediaMetadataVO metadata, String previewUrl, ResourceError error,
                      Instant createdAt, Instant updatedAt) {
    public record ResourceError(String code, String message) {}
}
