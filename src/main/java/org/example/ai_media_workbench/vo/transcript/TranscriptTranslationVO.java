package org.example.ai_media_workbench.vo.transcript;

import java.util.List;
import org.example.ai_media_workbench.dto.transcript.TranscriptSegment;

/** 仅返回待确认译文，不写入版本；时间及段ID由服务器绑定原稿。 */
public record TranscriptTranslationVO(String transcriptId, int transcriptVersion, String targetLanguage,
                                      List<TranscriptSegment> segments) {}
