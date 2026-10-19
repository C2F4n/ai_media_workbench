package org.example.ai_media_workbench.service.impl;

import java.math.BigDecimal;
import java.math.RoundingMode;
import org.example.ai_media_workbench.common.exception.BusinessException;
import org.example.ai_media_workbench.common.exception.ErrorCode;
import org.example.ai_media_workbench.vo.media.MediaMetadataVO;

/** 为容器头和音轨预留空间，再计算两遍编码的视频平均码率；结果仍须按实际字节数验收。 */
public record CompressionBudget(long videoBitsPerSecond, long audioBitsPerSecond) {
    public static final long MIN_TARGET_BYTES = 32 * 1024;

    public static CompressionBudget calculate(MediaMetadataVO source, long targetBytes) {
        if (targetBytes < MIN_TARGET_BYTES || source.durationMs() <= 0)
            throw new BusinessException(ErrorCode.COMPRESSION_TARGET_UNREACHABLE);
        long reserve = Math.max(16 * 1024, targetBytes / 10);
        long totalBitrate = BigDecimal.valueOf(targetBytes - reserve).multiply(BigDecimal.valueOf(8000))
                .divide(BigDecimal.valueOf(source.durationMs()), 0, RoundingMode.FLOOR).longValueExact();
        long audioBitrate = source.hasAudio() ? 96_000 : 0;
        long videoBitrate = totalBitrate - audioBitrate;
        if (videoBitrate < 32_000) throw new BusinessException(ErrorCode.COMPRESSION_TARGET_UNREACHABLE);
        return new CompressionBudget(Math.min(videoBitrate, 50_000_000), audioBitrate);
    }
}
