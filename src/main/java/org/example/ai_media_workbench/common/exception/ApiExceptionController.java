package org.example.ai_media_workbench.common.exception;

import jakarta.servlet.RequestDispatcher;
import jakarta.servlet.http.HttpServletRequest;
import org.example.ai_media_workbench.common.result.Result;
import org.springframework.boot.webmvc.error.ErrorController;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** 容器转发到 /error 的失败也返回 Result，避免出现另一种默认错误 JSON 或 HTML。 */
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
