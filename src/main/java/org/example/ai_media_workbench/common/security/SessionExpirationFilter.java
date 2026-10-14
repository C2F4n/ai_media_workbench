package org.example.ai_media_workbench.common.security;

import org.example.ai_media_workbench.common.error.ErrorCode;
import org.example.ai_media_workbench.common.error.BusinessException;
import org.example.ai_media_workbench.service.UserService;
import org.example.ai_media_workbench.common.web.ApiErrorWriter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.Clock;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

public class SessionExpirationFilter extends OncePerRequestFilter {
    private final Clock clock;
    private final ApiErrorWriter writer;
    private final UserService userService;

    public SessionExpirationFilter(Clock clock, ApiErrorWriter writer, UserService userService) {
        this.clock = clock;
        this.writer = writer;
        this.userService = userService;
    }

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
