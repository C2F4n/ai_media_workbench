package org.example.ai_media_workbench.common.exception;

import org.example.ai_media_workbench.common.result.Result;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import tools.jackson.databind.ObjectMapper;

/** 安全过滤器发生在 Controller 之前，不能依靠 ControllerAdvice；这里统一写出 Result.error。 */
@Component
public class ApiErrorWriter {
    private final ObjectMapper objectMapper;

    public ApiErrorWriter(ObjectMapper objectMapper) { this.objectMapper = objectMapper; }

    /** 将安全过滤器产生的错误直接写成统一 JSON 响应。 */
    public void write(HttpServletRequest request, HttpServletResponse response, ErrorCode code)
            throws IOException {
        response.setStatus(code.status().value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        objectMapper.writeValue(response.getOutputStream(), Result.error(code));
    }
}
