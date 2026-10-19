package org.example.ai_media_workbench.common.result;

import java.util.List;
import java.util.UUID;
import org.example.ai_media_workbench.common.exception.ErrorCode;
import org.example.ai_media_workbench.vo.common.ErrorDetailVO;
import org.slf4j.MDC;

/** 所有业务 JSON 响应的统一外层；VO 仅承载 data，HTTP 状态码仍由接口或异常处理器设置。 */
public record Result<T>(String code, String message, T data, String requestId, List<ErrorDetailVO> details) {
    /** 创建不带业务数据的成功响应。 */
    public static Result<Void> success() {
        return success(null);
    }

    /** 将业务数据包装成成功响应。 */
    public static <T> Result<T> success(T data) {
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
