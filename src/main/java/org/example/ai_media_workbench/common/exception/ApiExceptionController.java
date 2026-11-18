package org.example.ai_media_workbench.common.exception;

import jakarta.servlet.RequestDispatcher;
import jakarta.servlet.http.HttpServletRequest;
import org.example.ai_media_workbench.common.result.Result;
import org.springframework.boot.webmvc.error.ErrorController;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Servlet 容器错误转发的兜底入口，默认路径为 /error；读取原错误状态并转换成统一 Result。
 * 与 GlobalExceptionHandler 互补：后者处理业务/控制器调用抛出的异常，本类接住容器转发的错误请求。
 * 不承载业务 Service，也不暴露容器原始异常，避免返回另一套默认错误 JSON 或 HTML 页面。
 */
@RestController
public class ApiExceptionController implements ErrorController {
    /** 将容器转发的错误转换为统一响应。 */
    @RequestMapping("${server.error.path:${error.path:/error}}")
    public ResponseEntity<Result<Void>> error(HttpServletRequest request) {
        Object value = request.getAttribute(RequestDispatcher.ERROR_STATUS_CODE);
        int status = value instanceof Integer number && number >= 400 && number <= 599 ? number : 500;
        return ResponseEntity.status(status).body(Result.error(ErrorCode.forStatus(status)));
    }
}
