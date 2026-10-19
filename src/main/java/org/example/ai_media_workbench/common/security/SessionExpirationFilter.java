package org.example.ai_media_workbench.common.security;

import org.example.ai_media_workbench.common.exception.ErrorCode;
import org.example.ai_media_workbench.common.exception.BusinessException;
import org.example.ai_media_workbench.service.UserService;
import org.example.ai_media_workbench.common.exception.ApiErrorWriter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.Clock;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

/** 补充 Spring Session 的空闲过期检查：每次已认证请求还要验证绝对期限与账号状态。 */
public class SessionExpirationFilter extends OncePerRequestFilter {
    private final Clock clock;
    private final ApiErrorWriter writer;
    private final UserService userService;

    public SessionExpirationFilter(Clock clock, ApiErrorWriter writer, UserService userService) {
        this.clock = clock;
        this.writer = writer;
        this.userService = userService;
    }

    /** 检查会话绝对期限和账号状态，失效时清除身份并拦截私有接口。 */
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof AccountPrincipal principal) {
            var session = request.getSession(false);
            var expiry = session == null ? null : SessionPolicy.absoluteExpiry(session);
            boolean invalid = expiry == null || !clock.instant().isBefore(expiry);
            if (!invalid) {
                try {
                    // 即使某个旧会话因并发等原因暂时残留，停用/注销的账号也不能继续访问。
                    userService.getActiveUser(principal.userId());
                } catch (BusinessException exception) {
                    if (exception.code() != ErrorCode.UNAUTHENTICATED) throw exception;
                    invalid = true;
                } catch (org.springframework.dao.DataAccessException exception) {
                    writer.write(request, response, ErrorCode.INTERNAL_ERROR);
                    return;
                }
            }
            if (invalid) {
                if (session != null) {
                    session.invalidate();
                }
                SecurityContextHolder.clearContext();
                String uri = request.getRequestURI();
                // 私有 API 直接报未登录；页面和公共入口继续处理，让用户仍能打开登录页。
                if (uri.startsWith("/api/") && !uri.startsWith("/api/auth/")
                        && !"/api/system/capabilities".equals(uri)) {
                    writer.write(request, response, ErrorCode.UNAUTHENTICATED);
                    return;
                }
            }
        }
        chain.doFilter(request, response);
    }
}
