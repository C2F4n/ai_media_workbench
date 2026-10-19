package org.example.ai_media_workbench.common.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.time.Clock;
import java.time.Instant;
import java.util.List;
import org.example.ai_media_workbench.properties.AuthProperties;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.security.web.authentication.session.SessionAuthenticationStrategy;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.security.web.csrf.HttpSessionCsrfTokenRepository;
import org.springframework.stereotype.Component;

/**
 * HTTP 登录会话的统一生命周期入口，不负责校验密码或修改业务数据。
 * 登录建立会话；退出、改密、注销共用清除逻辑，避免不同 Controller 维护不同的安全规则。
 */
@Component
public class LoginSessionManager {
    private final AuthProperties properties;
    private final Clock clock;
    private final SessionAuthenticationStrategy sessionStrategy;
    private final SecurityContextRepository contextRepository;
    private final HttpSessionCsrfTokenRepository csrfRepository;
    private final SecurityContextLogoutHandler logoutHandler = new SecurityContextLogoutHandler();

    public LoginSessionManager(AuthProperties properties, Clock clock, SessionAuthenticationStrategy sessionStrategy,
                               SecurityContextRepository contextRepository, HttpSessionCsrfTokenRepository csrfRepository) {
        this.properties = properties;
        this.clock = clock;
        this.sessionStrategy = sessionStrategy;
        this.contextRepository = contextRepository;
        this.csrfRepository = csrfRepository;
        logoutHandler.setSecurityContextRepository(contextRepository);
    }

    /** 为已认证用户建立登录会话，返回过期时间和新 CSRF 令牌。 */
    public SessionDetails start(AccountPrincipal principal, boolean remember,
                                HttpServletRequest request, HttpServletResponse response) {
        var authentication = UsernamePasswordAuthenticationToken.authenticated(principal, null,
                List.of(new SimpleGrantedAuthority("ROLE_USER")));
        // 1. 登录成功后更换会话 ID，防止登录前的匿名 ID 被继续利用。
        sessionStrategy.onAuthentication(authentication, request, response);
        var session = request.getSession(true);
        var idle = remember ? properties.rememberIdleTimeout() : properties.sessionIdleTimeout();
        var absolute = remember ? properties.rememberAbsoluteTimeout() : properties.sessionAbsoluteTimeout();
        Instant now = clock.instant();
        // 2. 空闲时间可续期，但绝对期限固定；Spring Session JDBC 保存状态及过期信息。
        session.setMaxInactiveInterval(Math.toIntExact(idle.toSeconds()));
        session.setAttribute(SessionPolicy.REMEMBER, remember);
        session.setAttribute(SessionPolicy.ABSOLUTE_EXPIRY, now.plus(absolute));
        // 3. Holder 供本次请求使用，Repository 保存身份供后续请求恢复，不生成 JWT。
        var context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);
        contextRepository.saveContext(context, request, response);
        // 4. 同时旋转 CSRF；真正的登录令牌只通过 AMW_SESSION HttpOnly Cookie 携带。
        CsrfToken csrf = csrfRepository.generateToken(request);
        csrfRepository.saveToken(csrf, request, response);
        return new SessionDetails(now.plus(idle.compareTo(absolute) < 0 ? idle : absolute), csrf.getToken());
    }

    /** 销毁当前会话并清除当前请求的登录身份。 */
    public void clear(HttpServletRequest request, HttpServletResponse response) {
        logoutHandler.logout(request, response, SecurityContextHolder.getContext().getAuthentication());
    }

    public record SessionDetails(Instant expiresAt, String csrfToken) {}
}
