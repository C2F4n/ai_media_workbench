package org.example.ai_media_workbench.common.web;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.UUID;
import org.slf4j.MDC;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class RequestIdFilter extends OncePerRequestFilter {
    public static final String ATTRIBUTE = RequestIdFilter.class.getName() + ".requestId";

    /** 让错误转发请求也执行请求编号过滤。 */
    @Override
    protected boolean shouldNotFilterErrorDispatch() {
        return false;
    }

    /** 为请求、响应头和日志设置同一请求编号，并在结束后清理日志上下文。 */
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        // 容器转发 /error 时恢复同一 requestId，使 Result、响应头及日志保持一致。
        String id = get(request);
        request.setAttribute(ATTRIBUTE, id);
        response.setHeader("X-Request-Id", id);
        MDC.put("requestId", id);
        try {
            chain.doFilter(request, response);
        } finally {
            MDC.remove("requestId");
        }
    }

    /** 获取已有请求编号，不存在时生成新编号。 */
    public static String get(HttpServletRequest request) {
        Object id = request.getAttribute(ATTRIBUTE);
        return id == null ? UUID.randomUUID().toString() : id.toString();
    }
}
