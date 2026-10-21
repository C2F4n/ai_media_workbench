package org.example.ai_media_workbench.service;

import java.util.List;
import org.example.ai_media_workbench.dto.processing.OperationParameters;
import org.example.ai_media_workbench.vo.media.MediaMetadataVO;
import tools.jackson.databind.JsonNode;

/** 只生成候选参数或固定补充问题，不执行命令、不创建任务。 */
public interface OperationPlanner {
    boolean isAvailable(String userId);
    Proposal propose(String instruction, Context context,String userId);
    record Context(MediaMetadataVO metadata, long sizeBytes, List<String> supportedOperations,
                   OperationParameters previousParameters, String previousInstruction,
                   List<String> exportFormats, List<String> exportVideoCodecs, long maxOutputBytes) {}
    record Proposal(JsonNode parameters, List<Question> questions) {}
    enum Question {
        OPERATION_REQUIRED("请明确要进行的处理，例如裁切、转换、压缩、静音、提取音频或同源拼接。"),
        TARGET_SIZE_REQUIRED("请补充压缩后的目标体积，例如20MB。"),
        TRIM_RANGE_REQUIRED("请明确要保留的开始和结束时间。"),
        CLIP_RANGES_REQUIRED("请明确各片段要保留的时间区间和拼接顺序。"),
        UNSUPPORTED_REQUEST("当前要求超出已支持的操作，请修改处理要求。"),
        CONFLICTING_REQUIREMENTS("当前参数互相冲突，请明确需要保留的设置。");
        private final String message;
        Question(String message) { this.message=message.strip(); }
        public String message() { return message; }
    }
}
