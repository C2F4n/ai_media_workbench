package org.example.ai_media_workbench.service;

import java.util.List;
import org.example.ai_media_workbench.dto.transcript.TranscriptSegment;
import org.example.ai_media_workbench.vo.transcript.RetrievalVO;

/** 针对已鉴权的不可变字幕快照召回，不自行加载其他素材或跨用户搜索。 */
public interface TranscriptRetriever {
    Candidates retrieve(List<TranscriptSegment> segments, String query, boolean recommend);
    record Candidates(List<TranscriptSegment> segments, RetrievalVO retrieval) {}
}
