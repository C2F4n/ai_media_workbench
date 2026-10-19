package org.example.ai_media_workbench.common.exception;

import org.springframework.http.HttpStatus;

public enum ErrorCode {
    INVALID_REQUEST(HttpStatus.BAD_REQUEST, "请求格式错误或缺少必要参数"),
    INVALID_PARAMETERS(HttpStatus.UNPROCESSABLE_CONTENT, "参数值不符合要求"),
    INVALID_CREDENTIALS(HttpStatus.UNAUTHORIZED, "用户名或密码不正确"),
    UNAUTHENTICATED(HttpStatus.UNAUTHORIZED, "请先登录"),
    CSRF_INVALID(HttpStatus.FORBIDDEN, "安全验证已失效，请刷新令牌后重试"),
    ACCESS_DENIED(HttpStatus.FORBIDDEN, "无权访问"),
    CURRENT_PASSWORD_INVALID(HttpStatus.FORBIDDEN, "当前密码不正确"),
    RESOURCE_NOT_FOUND(HttpStatus.NOT_FOUND, "资源不存在"),
    METHOD_NOT_ALLOWED(HttpStatus.METHOD_NOT_ALLOWED, "不支持此请求方法"),
    RESOURCE_CONFLICT(HttpStatus.CONFLICT, "资源与现有数据冲突"),
    PAYLOAD_TOO_LARGE(HttpStatus.CONTENT_TOO_LARGE, "请求内容过大"),
    UNSUPPORTED_CONTENT_TYPE(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "不支持此请求内容类型"),
    ACCOUNT_ALREADY_EXISTS(HttpStatus.CONFLICT, "用户名或邮箱已被使用"),
    PASSWORD_UNCHANGED(HttpStatus.UNPROCESSABLE_CONTENT, "新密码不能与当前密码相同"),
    WEAK_PASSWORD(HttpStatus.UNPROCESSABLE_CONTENT, "密码过于简单，请使用更强的密码"),
    RATE_LIMITED(HttpStatus.TOO_MANY_REQUESTS, "请求过于频繁，请稍后重试"),
    REGISTRATION_DISABLED(HttpStatus.SERVICE_UNAVAILABLE, "当前暂未开放注册"),
    EMAIL_DELIVERY_UNAVAILABLE(HttpStatus.SERVICE_UNAVAILABLE, "验证邮件暂时无法发送，请稍后重试"),
    EMAIL_VERIFICATION_INVALID(HttpStatus.UNPROCESSABLE_CONTENT, "邮箱验证码无效、已过期或尝试次数已用尽，请重新获取"),
    MEDIA_TOOL_UNAVAILABLE(HttpStatus.SERVICE_UNAVAILABLE, "视频检测工具暂不可用"),
    FILE_TOO_LARGE(HttpStatus.CONTENT_TOO_LARGE, "上传文件超过大小限制"),
    STORAGE_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "文件存储暂不可用"),
    MEDIA_PROBE_FAILED(HttpStatus.UNPROCESSABLE_CONTENT, "无法读取有效的视频信息"),
    MEDIA_PROBE_TIMEOUT(HttpStatus.UNPROCESSABLE_CONTENT, "视频检测超时，请重试或更换文件"),
    MEDIA_DURATION_EXCEEDED(HttpStatus.UNPROCESSABLE_CONTENT, "视频时长超过限制"),
    UNSUPPORTED_MEDIA(HttpStatus.UNPROCESSABLE_CONTENT, "当前仅支持MP4、MOV、MKV或WebM视频"),
    TRANSCODE_UNAVAILABLE(HttpStatus.SERVICE_UNAVAILABLE, "视频转换工具暂不可用"),
    AI_UNAVAILABLE(HttpStatus.SERVICE_UNAVAILABLE, "自然语言处理尚未开放，请使用明确参数"),
    QUEUE_FULL(HttpStatus.SERVICE_UNAVAILABLE, "处理队列已满，请稍后重试"),
    PLAN_VERSION_CONFLICT(HttpStatus.CONFLICT, "方案版本已变化，请刷新后重试"),
    TASK_NOT_CANCELLABLE(HttpStatus.CONFLICT, "当前任务不能取消"),
    TASK_CANCELLED(HttpStatus.CONFLICT, "任务已取消"),
    TRANSCODE_FAILED(HttpStatus.UNPROCESSABLE_CONTENT, "视频转换失败，请检查素材后重试"),
    TRANSCODE_TIMEOUT(HttpStatus.UNPROCESSABLE_CONTENT, "媒体处理超时"),
    COMPRESSION_TARGET_UNREACHABLE(HttpStatus.UNPROCESSABLE_CONTENT, "目标体积无法达成，请增大目标或降低分辨率"),
    SOURCE_HAS_NO_AUDIO(HttpStatus.UNPROCESSABLE_CONTENT, "素材没有可提取的音轨"),
    AUDIO_EXTRACTION_UNAVAILABLE(HttpStatus.SERVICE_UNAVAILABLE, "MP3编码工具暂不可用"),
    AUDIO_EXTRACTION_FAILED(HttpStatus.UNPROCESSABLE_CONTENT, "提取音频失败，请检查素材后重试"),
    OUTPUT_TOO_LARGE(HttpStatus.UNPROCESSABLE_CONTENT, "处理结果超过大小限制"),
    TASK_INTERRUPTED(HttpStatus.CONFLICT, "处理因服务中断而停止，请重新提交"),
    OUTPUT_UNAVAILABLE(HttpStatus.GONE, "结果文件已丢失或不可用"),
    RANGE_NOT_SATISFIABLE(HttpStatus.REQUESTED_RANGE_NOT_SATISFIABLE, "请求范围超出文件大小"),
    INTERNAL_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "服务器内部错误");

    private final HttpStatus status;
    private final String message;

    ErrorCode(HttpStatus status, String message) {
        this.status = status;
        this.message = message;
    }

    public HttpStatus status() { return status; }
    public String message() { return message; }

    /** MVC 和容器级错误也映射为稳定错误码，不向前端泄漏框架内部描述。 */
    public static ErrorCode forStatus(int status) {
        return switch (status) {
            case 400 -> INVALID_REQUEST;
            case 401 -> UNAUTHENTICATED;
            case 403 -> ACCESS_DENIED;
            case 404 -> RESOURCE_NOT_FOUND;
            case 405 -> METHOD_NOT_ALLOWED;
            case 409 -> RESOURCE_CONFLICT;
            case 413 -> PAYLOAD_TOO_LARGE;
            case 415 -> UNSUPPORTED_CONTENT_TYPE;
            case 422 -> INVALID_PARAMETERS;
            case 429 -> RATE_LIMITED;
            default -> INTERNAL_ERROR;
        };
    }
}
