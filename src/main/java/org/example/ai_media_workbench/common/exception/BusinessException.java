package org.example.ai_media_workbench.common.exception;

/** 业务层抛出错误码，由全局异常处理器转换为 Result，不在业务层生成 HTTP 响应。 */
public class BusinessException extends RuntimeException {
    private final ErrorCode code;

    public BusinessException(ErrorCode code) {
        super(code.message());
        this.code = code;
    }

    public ErrorCode code() { return code; }
}
