package org.example.ai_media_workbench.common.exception;

import org.example.ai_media_workbench.common.result.Result;
import org.example.ai_media_workbench.vo.common.ErrorDetailVO;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.authentication.AccountStatusException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.ErrorResponse;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.MultipartException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

/** 集中捕获 Controller 和业务调用的异常，统一返回 Result；过滤器错误使用相同 Result 结构。 */
@RestControllerAdvice
public class GlobalExceptionHandler {
    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    /** 返回业务错误；限流时附带建议等待秒数。 */
    @ExceptionHandler(BusinessException.class)
    ResponseEntity<Result<Void>> business(BusinessException exception) {
        var builder = ResponseEntity.status(exception.code().status());
        if (exception instanceof RateLimitException limit) {
            builder.header("Retry-After", Long.toString(limit.retryAfter()));
        }
        if (exception instanceof RangeNotSatisfiableException range) {
            builder.header("Content-Range", "bytes */" + range.size());
        }
        return builder.body(Result.error(exception.code()));
    }

    /** 返回请求参数的校验错误及字段明细。 */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<Result<Void>> validation(MethodArgumentNotValidException exception) {
        List<ErrorDetailVO> details = exception.getBindingResult().getFieldErrors().stream()
                .map(e -> new ErrorDetailVO(e.getField(), e.getDefaultMessage())).toList();
        boolean missing = exception.getBindingResult().getFieldErrors().stream()
                .anyMatch(e -> "NotNull".equals(e.getCode()));
        ErrorCode code = missing ? ErrorCode.INVALID_REQUEST : ErrorCode.INVALID_PARAMETERS;
        return ResponseEntity.status(code.status()).body(Result.error(code, details.toArray(ErrorDetailVO[]::new)));
    }

    /** 处理请求体缺失或 JSON 无法解析的情况。 */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    ResponseEntity<Result<Void>> malformed() {
        return ResponseEntity.badRequest().body(Result.error(ErrorCode.INVALID_REQUEST));
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    ResponseEntity<Result<Void>> uploadTooLarge() {
        return ResponseEntity.status(HttpStatus.CONTENT_TOO_LARGE).body(Result.error(ErrorCode.FILE_TOO_LARGE));
    }

    @ExceptionHandler({MultipartException.class, MethodArgumentTypeMismatchException.class})
    ResponseEntity<Result<Void>> invalidMultipart() {
        return ResponseEntity.badRequest().body(Result.error(ErrorCode.INVALID_REQUEST));
    }

    /** 处理不支持的请求内容类型。 */
    @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
    ResponseEntity<Result<Void>> mediaType() {
        return ResponseEntity.status(HttpStatus.UNSUPPORTED_MEDIA_TYPE)
                .body(Result.error(ErrorCode.UNSUPPORTED_CONTENT_TYPE));
    }

    /** 返回资源不存在的错误。 */
    @ExceptionHandler(NoResourceFoundException.class)
    ResponseEntity<Result<Void>> notFound() {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Result.error(ErrorCode.RESOURCE_NOT_FOUND));
    }

    /** 统一返回用户名、密码或账号状态不符合要求的认证错误。 */
    @ExceptionHandler({BadCredentialsException.class, UsernameNotFoundException.class, AccountStatusException.class})
    ResponseEntity<Result<Void>> credentials() {
        // 不区分用户不存在、密码错误或账号停用，避免泄露账号存在性；Service 无需为此 try-catch。
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Result.error(ErrorCode.INVALID_CREDENTIALS));
    }

    /** 将数据库唯一键冲突转换为账号重复或资源冲突错误。 */
    @ExceptionHandler(DuplicateKeyException.class)
    ResponseEntity<Result<Void>> duplicate(HttpServletRequest request) {
        // 并发注册最终由数据库唯一约束兜底；其他业务的重复键不能误报为账号重复。
        ErrorCode code = "POST".equals(request.getMethod()) && "/api/auth/register".equals(request.getRequestURI())
                ? ErrorCode.ACCOUNT_ALREADY_EXISTS : ErrorCode.RESOURCE_CONFLICT;
        return ResponseEntity.status(code.status()).body(Result.error(code));
    }

    /** 处理剩余异常，保留框架错误状态，未知错误返回 500。 */
    @ExceptionHandler(Exception.class)
    ResponseEntity<Result<Void>> internal(Exception exception) {
        if (exception instanceof ErrorResponse error) {
            // 保留框架的 405、413 等状态及 Allow 等响应头，不让它们被兜底处理误判为 500。
            return ResponseEntity.status(error.getStatusCode()).headers(error.getHeaders())
                    .body(Result.error(ErrorCode.forStatus(error.getStatusCode().value())));
        }
        // 不把 SQL、堆栈或异常详情返回给前端；requestId 用于关联请求排查问题。
        log.error("Request failed: {}", exception.getClass().getSimpleName());
        return ResponseEntity.internalServerError()
                .body(Result.error(ErrorCode.INTERNAL_ERROR));
    }
}
