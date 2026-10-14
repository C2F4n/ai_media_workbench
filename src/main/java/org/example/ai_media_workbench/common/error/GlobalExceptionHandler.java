package org.example.ai_media_workbench.common.error;

import org.example.ai_media_workbench.common.web.RequestIdFilter;
import org.example.ai_media_workbench.vo.common.ErrorDetailVO;
import org.example.ai_media_workbench.vo.common.ErrorResponseVO;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;

@RestControllerAdvice
public class GlobalExceptionHandler {
    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(BusinessException.class)
    ResponseEntity<ErrorResponseVO> business(BusinessException exception, HttpServletRequest request) {
        var builder = ResponseEntity.status(exception.code().status());
        if (exception instanceof RateLimitException limit) {
            builder.header("Retry-After", Long.toString(limit.retryAfter()));
        }
        return builder.body(error(exception.code(), request, List.of()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<ErrorResponseVO> validation(MethodArgumentNotValidException exception,
                                               HttpServletRequest request) {
        List<ErrorDetailVO> details = exception.getBindingResult().getFieldErrors().stream()
                .map(e -> new ErrorDetailVO(e.getField(), e.getDefaultMessage())).toList();
        boolean missing = exception.getBindingResult().getFieldErrors().stream()
                .anyMatch(e -> "NotNull".equals(e.getCode()));
        ErrorCode code = missing ? ErrorCode.INVALID_REQUEST : ErrorCode.INVALID_PARAMETERS;
        return ResponseEntity.status(code.status()).body(error(code, request, details));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    ResponseEntity<ErrorResponseVO> malformed(HttpServletRequest request) {
        return ResponseEntity.badRequest().body(error(ErrorCode.INVALID_REQUEST, request, List.of()));
    }

    @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
    ResponseEntity<ErrorResponseVO> mediaType(HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.UNSUPPORTED_MEDIA_TYPE)
                .body(new ErrorResponseVO("UNSUPPORTED_CONTENT_TYPE", "Unsupported request content type",
                        RequestIdFilter.get(request), List.of()));
    }

    @ExceptionHandler(NoResourceFoundException.class)
    ResponseEntity<ErrorResponseVO> notFound(HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(error(ErrorCode.RESOURCE_NOT_FOUND, request, List.of()));
    }

    @ExceptionHandler({DataAccessException.class, Exception.class})
    ResponseEntity<ErrorResponseVO> internal(Exception exception, HttpServletRequest request) {
        log.error("Request failed: {}", exception.getClass().getSimpleName());
        return ResponseEntity.internalServerError()
                .body(error(ErrorCode.INTERNAL_ERROR, request, List.of()));
    }

    private ErrorResponseVO error(ErrorCode code, HttpServletRequest request, List<ErrorDetailVO> details) {
        return new ErrorResponseVO(code.name(), code.message(), RequestIdFilter.get(request), details);
    }
}
