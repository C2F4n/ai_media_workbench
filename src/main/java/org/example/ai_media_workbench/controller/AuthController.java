package org.example.ai_media_workbench.controller;

import org.example.ai_media_workbench.common.security.AccountPrincipal;
import org.example.ai_media_workbench.common.security.AuthRateLimiter;
import org.example.ai_media_workbench.common.security.LoginSessionManager;
import org.example.ai_media_workbench.common.result.Result;
import org.example.ai_media_workbench.properties.AuthProperties;
import org.example.ai_media_workbench.dto.auth.LoginRequest;
import org.example.ai_media_workbench.dto.auth.RegisterRequest;
import org.example.ai_media_workbench.dto.auth.RegistrationEmailRequest;
import org.example.ai_media_workbench.service.AuthService;
import org.example.ai_media_workbench.service.SessionService;
import org.example.ai_media_workbench.service.RegistrationEmailService;
import org.example.ai_media_workbench.vo.auth.CsrfVO;
import org.example.ai_media_workbench.vo.auth.LoginVO;
import org.example.ai_media_workbench.vo.auth.RegistrationEmailVO;
import org.example.ai_media_workbench.vo.user.UserVO;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import java.util.Locale;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 认证接口入口：校验请求、调用 Service 接口、包装 Result；具体业务实现由 Spring 注入。
 * 阅读登录流程可依次看：login -> AuthService.authenticate -> LoginSessionManager.start。
 * 会话轮换、身份保存和退出交给安全组件，Controller 不重复实现安全生命周期。
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    // 认证服务：创建账号、校验登录信息。
    private final AuthService authService;
    // 会话服务：撤销用户在所有设备上的登录会话。
    private final SessionService sessionService;
    // 限流器：限制注册、登录等请求的次数。
    private final AuthRateLimiter rateLimiter;
    // 认证配置：读取请求次数限制和会话有效期等设置。
    private final AuthProperties properties;
    // 登录会话管理器：建立和清除当前登录会话。
    private final LoginSessionManager loginSessions;
    // 注册邮箱服务：发送验证码，不创建账号。
    private final RegistrationEmailService registrationEmails;

    public AuthController(AuthService authService, SessionService sessionService, AuthRateLimiter rateLimiter,
                          AuthProperties properties, LoginSessionManager loginSessions,
                          RegistrationEmailService registrationEmails) {
        this.authService = authService;
        this.sessionService = sessionService;
        this.rateLimiter = rateLimiter;
        this.properties = properties;
        this.loginSessions = loginSessions;
        this.registrationEmails = registrationEmails;
    }

    /** 获取写请求所需的 CSRF 令牌。 */
    @GetMapping("/csrf")
    public ResponseEntity<Result<CsrfVO>> csrf(HttpServletRequest request) {
        // CSRF 令牌用于保护写请求，不是登录凭证；未登录时也可以获取。
        CsrfToken token = (CsrfToken) request.getAttribute(CsrfToken.class.getName());
        return ResponseEntity.ok().header("Cache-Control", "no-store")
                .body(Result.success(new CsrfVO(token.getToken(), token.getHeaderName())));
    }

    /**
     * 发送注册验证码，不创建账号或占用邮箱，仍然需要 CSRF 校验。
     *
     * @param input 输入数据，接收前端传来的邮箱
     * @param request HTTP 请求对象，获取来源 IP，用于限制验证码发送频率
     */
    @PostMapping("/registration-email-code")
    public ResponseEntity<Result<RegistrationEmailVO>> sendRegistrationCode(
            @Valid @RequestBody RegistrationEmailRequest input, HttpServletRequest request) {
        try (var permit = rateLimiter.reserve("registration-mail:ip:" + request.getRemoteAddr(),
                properties.registrationAttempts(), java.time.Duration.ofMinutes(1))) {
            var result = registrationEmails.send(input.email());
            permit.commit();
            return ResponseEntity.ok().header("Cache-Control", "no-store").body(Result.success(result));
        }
    }

    /** 通过邮箱验证码后注册账号并返回资料，不自动登录。 */
    @PostMapping("/register")
    public ResponseEntity<Result<UserVO>> register(@Valid @RequestBody RegisterRequest input,
                                                    HttpServletRequest request) {
        // 检查并累计当前 IP 的注册次数，超过限额时拒绝本次请求。
        rateLimiter.check("register:ip:" + request.getRemoteAddr(), properties.registrationAttempts());
        // @Valid 先检查 DTO 上的约束；注册成功只返回资料，不自动登录。
        var user = authService.register(input);
        return ResponseEntity.status(201).body(Result.success(UserVO.from(user)));
    }

    /** 校验登录信息并建立会话，返回用户资料和新 CSRF 令牌。 */
    @PostMapping("/login")
    public Result<LoginVO> login(@Valid @RequestBody LoginRequest input,
                                  HttpServletRequest request, HttpServletResponse response) {
        rateLimiter.check("login:ip:" + request.getRemoteAddr(), properties.loginAttempts());
        rateLimiter.check("login:user:" + input.username().toLowerCase(Locale.ROOT), properties.loginAttempts());
        // 业务层先校验用户名、密码及账号状态，通过后才建立会话。
        var user = authService.authenticate(input);
        var session = loginSessions.start(new AccountPrincipal(user.getId(), user.getUsername()), input.remember(),
                request, response);
        return Result.success(new LoginVO(UserVO.from(user), session.expiresAt(), session.csrfToken()));
    }

    /** 退出当前设备的登录。 */
    @PostMapping("/logout")
    public Result<Void> logout(HttpServletRequest request, HttpServletResponse response) {
        // 退出仅销毁当前会话，不删除账号；200 返回 Result.success()，data 为 null。
        loginSessions.clear(request, response);
        return Result.success();
    }

    /** 退出当前账号在所有设备上的登录。 */
    @PostMapping("/logout-all")
    public Result<Void> logoutAll(@AuthenticationPrincipal AccountPrincipal principal,
                                   HttpServletRequest request, HttpServletResponse response) {
        // 先撤销此账号在所有设备上的会话，再清除当前请求的认证状态。
        sessionService.revokeAll(principal.userId());
        return logout(request, response);
    }
}
