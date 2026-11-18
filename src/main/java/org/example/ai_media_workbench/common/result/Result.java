package org.example.ai_media_workbench.common.result;

import java.util.List;
import java.util.UUID;
import org.example.ai_media_workbench.common.exception.ErrorCode;
import org.example.ai_media_workbench.vo.common.ErrorDetailVO;
import org.slf4j.MDC;

/**
 * 所有业务 JSON 响应的统一外层；T 是 data 的类型，如 {@code Result<UserVO>} 或 {@code Result<PageVO<TaskVO>>}。
 * code 供程序判断，message 是安全的提示，details 承载字段校验错误，requestId 用于关联日志。
 * HTTP 状态码仍由接口或异常处理器设置；视频播放、文件下载成功时直接返回文件流，不套 JSON。
 */
public record Result<T>(String code, String message, T data, String requestId, List<ErrorDetailVO> details) {
    /** 创建不带业务数据的成功响应。 */
    public static Result<Void> success() {
        return success(null);
    }

    /** 将业务数据包装成成功响应。 */
    public static <T> Result<T> success(T data) {
        // 同一次 HTTP 请求复用过滤器写入 MDC 的编号，便于把前端报错与后端日志对应起来。
        String requestId = MDC.get("requestId");
        return new Result<>("SUCCESS", "Success", data,
                requestId == null ? UUID.randomUUID().toString() : requestId, List.of());
    }

    /** 根据错误码和字段明细创建失败响应。 */
    public static Result<Void> error(ErrorCode code, ErrorDetailVO... details) {
        String requestId = MDC.get("requestId");
        return new Result<>(code.name(), code.message(), null,
                requestId == null ? UUID.randomUUID().toString() : requestId, List.of(details));
    }
}
