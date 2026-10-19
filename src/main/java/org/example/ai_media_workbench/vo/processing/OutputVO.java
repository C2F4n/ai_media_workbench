package org.example.ai_media_workbench.vo.processing;

import java.time.Instant;
import org.example.ai_media_workbench.vo.media.MediaMetadataVO;

public record OutputVO(String id, String taskId, String filename, String contentType, long sizeBytes,
                       MediaMetadataVO metadata, String previewUrl, String downloadUrl, Instant createdAt) {}
