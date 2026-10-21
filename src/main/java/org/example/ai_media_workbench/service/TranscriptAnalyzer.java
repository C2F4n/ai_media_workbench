package org.example.ai_media_workbench.service;

import java.util.List;
import java.util.UUID;
import org.example.ai_media_workbench.dto.transcript.TranscriptSegment;

/** 只选择真实字幕段ID，时间和证据由业务层重建；不执行裁切或创建任务。 */
public interface TranscriptAnalyzer {
    boolean isAvailable(String userId);
    List<Selection> analyze(String query,List<TranscriptSegment> segments,Mode mode,int limit,long maxTotalDurationMs,String userId);
    enum Mode { SEARCH, RECOMMEND }
    record Selection(UUID startSegmentId,UUID endSegmentId,Double score,String title,String reason) {}
}
