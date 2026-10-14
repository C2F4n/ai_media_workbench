package org.example.ai_media_workbench.controller;

import org.example.ai_media_workbench.common.security.AccountPrincipal;
import org.example.ai_media_workbench.common.security.AuthRateLimiter;
import org.example.ai_media_workbench.common.security.SessionPolicy;
import org.example.ai_media_workbench.common.web.RequestIdFilter;
import org.example.ai_media_workbench.config.AuthProperties;
import org.example.ai_media_workbench.dto.auth.LoginRequest;
import org.example.ai_media_workbench.dto.auth.RegisterRequest;
import org.example.ai_media_workbench.service.impl.AuthServiceImpl;
import org.example.ai_media_workbench.service.impl.SessionServiceImpl;
import org.example.ai_media_workbench.vo.auth.CsrfVO;
import org.example.ai_media_workbench.vo.auth.LoginVO;
import org.example.ai_media_workbench.vo.user.UserVO;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import java.time.Clock;
import java.util.List;
import java.util.Locale;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.security.web.authentication.session.SessionAuthenticationStrategy;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.security.web.csrf.HttpSessionCsrfTokenRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthServiceImpl authService;
    private final SessionServiceImpl sessionService;
    private final AuthRateLimiter rateLimiter;
    private final AuthProperties properties;
    private final Clock clock;
    private final SessionAuthenticationStrategy sessionStrategy;
    private final SecurityContextRepository contextRepository;
    private final HttpSessionCsrfTokenRepository csrfRepository;

    public AuthController(AuthServiceImpl authService, SessionServiceImpl sessionService, AuthRateLimiter rateLimiter,
                          AuthProperties properties, Clock clock, SessionAuthenticationStrategy sessionStrategy,
                          SecurityContextRepository contextRepository, HttpSessionCsrfTokenRepository csrfRepository) {
        this.authService = authService;
        this.sessionService = sessionService;
        this.rateLimiter = rateLimiter;
        this.properties = properties;
        this.clock = clock;
        this.sessionStrategy = sessionStrategy;
        this.contextRepository = contextRepository;
        this.csrfRepository = csrfRepository;
    }

    @GetMapping("/csrf")
    public ResponseEntity<CsrfVO> csrf(HttpServletRequest request) {
        CsrfToken token = (CsrfToken) request.getAttribute(CsrfToken.class.getName());
        return ResponseEntity.ok().header("Cache-Control", "no-store")
                .body(new CsrfVO(token.getToken(), token.getHeaderName(), RequestIdFilter.get(request)));
    }

    @PostMapping("/register")
    public ResponseEntity<UserVO> register(@Valid @RequestBody RegisterRequest input,
                                          HttpServletRequest request) {
        rateLimiter.check("register:ip:" + request.getRemoteAddr(), properties.registrationAttempts());
        var user = authService.register(input);
        return ResponseEntity.status(201).body(UserVO.from(user, RequestIdFilter.get(request)));
    }

    @PostMapping("/login")
    public LoginVO login(@Valid @RequestBody LoginRequest input,
                         HttpServletRequest request, HttpServletResponse response) {
        rateLimiter.check("login:ip:" + request.getRemoteAddr(), properties.loginAttempts());
        rateLimiter.check("login:user:" + input.username().toLowerCase(Locale.ROOT), properties.loginAttempts());
        var user = authService.authenticate(input);
        var principal = new AccountPrincipal(user.getId(), user.getUsername());
        var authentication = UsernamePasswordAuthenticationToken.authenticated(principal, null,
                List.of(new SimpleGrantedAuthority("ROLE_USER")));
        sessionStrategy.onAuthentication(authentication, request, response);
        var session = request.getSession(true);
        var idle = input.remember() ? properties.rememberIdleTimeout() : properties.sessionIdleTimeout();
        var absolute = input.remember() ? properties.rememberAbsoluteTimeout() : properties.sessionAbsoluteTimeout();
        session.setMaxInactiveInterval(Math.toIntExact(idle.toSeconds()));
        session.setAttribute(SessionPolicy.REMEMBER, input.remember());
        session.setAttribute(SessionPolicy.ABSOLUTE_EXPIRY, clock.instant().plus(absolute));
        var context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);
        contextRepository.saveContext(context, request, response);
        CsrfToken csrf = csrfRepository.generateToken(request);
        csrfRepository.saveToken(csrf, request, response);
        String requestId = RequestIdFilter.get(request);
        return new LoginVO(UserVO.from(user, requestId), clock.instant().plus(idle.compareTo(absolute) < 0 ? idle : absolute),
                csrf.getToken(), requestId);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request, HttpServletResponse response) {
        new SecurityContextLogoutHandler().logout(request, response,
                SecurityContextHolder.getContext().getAuthentication());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/logout-all")
    public ResponseEntity<Void> logoutAll(@AuthenticationPrincipal AccountPrincipal principal,
                                         HttpServletRequest request, HttpServletResponse response) {
        sessionService.revokeAll(principal.userId());
        return logout(request, response);
    }
}
