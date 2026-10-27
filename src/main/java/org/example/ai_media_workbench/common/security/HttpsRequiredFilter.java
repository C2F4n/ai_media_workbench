package org.example.ai_media_workbench.common.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.example.ai_media_workbench.common.exception.ApiErrorWriter;
import org.example.ai_media_workbench.common.exception.ErrorCode;
import org.springframework.web.filter.OncePerRequestFilter;

/** HTTPS 入口由 Nginx 负责；后端拒绝明文请求，不使用不可信 Host 构造跳转链接。 */
public final class HttpsRequiredFilter extends OncePerRequestFilter {
    private final ApiErrorWriter writer;

    public HttpsRequiredFilter(ApiErrorWriter writer) { this.writer = writer; }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        if (!request.isSecure()) {
            writer.write(request, response, ErrorCode.HTTPS_REQUIRED);
            return;
        }
        chain.doFilter(request, response);
    }
}
