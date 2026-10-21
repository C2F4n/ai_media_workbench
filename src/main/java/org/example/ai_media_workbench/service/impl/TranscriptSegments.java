package org.example.ai_media_workbench.service.impl;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.UUID;
import org.example.ai_media_workbench.common.exception.BusinessException;
import org.example.ai_media_workbench.common.exception.ErrorCode;
import org.example.ai_media_workbench.dto.transcript.TranscriptSegment;
import tools.jackson.databind.ObjectMapper;

/** ASR与人工修改共用边界校验；禁止空白段、重叠和会破坏SRT段边界的空行。 */
public final class TranscriptSegments {
    public static final int MAX_JSON_BYTES = 2 * 1024 * 1024;
    private TranscriptSegments() {}

    public static List<TranscriptSegment> checked(List<TranscriptSegment> input, long durationMs, ObjectMapper json) {
        if (input == null || input.isEmpty() || input.size() > 3000) invalid();
        var ids = new HashSet<UUID>(); var result = new ArrayList<TranscriptSegment>(); long previousEnd = 0;
        for (var segment : input) {
            if (segment == null || segment.id() == null || !ids.add(segment.id()) || segment.startMs() == null || segment.endMs() == null
                    || segment.startMs() < previousEnd || segment.endMs() <= segment.startMs() || segment.endMs() > durationMs || segment.text() == null) invalid();
            String text = segment.text().replace("\r\n", "\n").replace('\r', '\n').strip();
            if (text.isBlank() || text.codePointCount(0, text.length()) > 2000
                    || text.lines().anyMatch(String::isBlank)
                    || text.codePoints().anyMatch(value -> Character.isISOControl(value) && value != '\n' && value != '\t')) invalid();
            result.add(new TranscriptSegment(segment.id(), segment.startMs(), segment.endMs(), text));
            previousEnd = segment.endMs();
        }
        if (json.writeValueAsBytes(result).length > MAX_JSON_BYTES) invalid();
        return List.copyOf(result);
    }

    private static void invalid() { throw new BusinessException(ErrorCode.INVALID_PARAMETERS); }
}
