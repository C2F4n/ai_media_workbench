package org.example.ai_media_workbench.config;

import org.example.ai_media_workbench.common.exception.ErrorCode;
import org.example.ai_media_workbench.common.security.SessionExpirationFilter;
import org.example.ai_media_workbench.common.security.SessionPolicy;
import org.example.ai_media_workbench.common.exception.ApiErrorWriter;
import org.example.ai_media_workbench.entity.UserStatus;
import org.example.ai_media_workbench.mapper.UserMapper;
import org.example.ai_media_workbench.service.UserService;
import org.example.ai_media_workbench.properties.AuthProperties;
import java.time.Clock;
import java.util.List;
import java.util.Locale;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.argon2.Argon2PasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextHolderFilter;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.security.web.csrf.HttpSessionCsrfTokenRepository;
import org.springframework.security.web.authentication.session.ChangeSessionIdAuthenticationStrategy;
import org.springframework.security.web.authentication.session.SessionAuthenticationStrategy;
import org.springframework.session.web.http.CookieSerializer;
import org.springframework.session.web.http.DefaultCookieSerializer;

/** 统一安全配置：密码哈希、登录会话、Cookie、CSRF 和接口访问权限都在这里组装。 */
@Configuration
public class SecurityConfig {
    /** 提供统一的 UTC 时钟。 */
    @Bean
    Clock clock() { return Clock.systemUTC(); }

    /** 创建用于生成和校验密码哈希的 Argon2id 编码器。 */
    @Bean
    PasswordEncoder passwordEncoder() {
        // Argon2id 是不可逆的加盐哈希，不是可解密密文；参数依次为盐/哈希字节数、并行度、内存 KiB、迭代次数。
        return new Argon2PasswordEncoder(16, 32, 1, 19456, 2);
    }

    /** 创建读取数据库账号并校验密码及状态的认证管理器。 */
    @Bean
    AuthenticationManager authenticationManager(UserMapper mapper, PasswordEncoder encoder) {
        // 框架读取数据库中的哈希并调用 encoder.matches 校验密码，同时拒绝非 ACTIVE 账号。
        var provider = new DaoAuthenticationProvider(username -> {
            var account = mapper.findByUsername(username.toLowerCase(Locale.ROOT));
            if (account == null) {
                throw new UsernameNotFoundException("Invalid credentials");
            }
            return User.withUsername(account.getUsername()).password(account.getPasswordHash())
                    .roles("USER").disabled(account.getStatus() != UserStatus.ACTIVE).build();
        });
        provider.setPasswordEncoder(encoder);
        return new ProviderManager(List.of(provider));
    }

    /** 配置 CSRF 令牌的会话存储和请求头名称。 */
    @Bean
    HttpSessionCsrfTokenRepository csrfRepository() {
        var repository = new HttpSessionCsrfTokenRepository();
        repository.setHeaderName("X-CSRF-Token");
        return repository;
    }

    /** 创建用于保存和恢复登录身份的会话存储组件。 */
    @Bean
    SecurityContextRepository securityContextRepository() {
        // 不把会话 ID 拼进 URL，避免它随链接、历史记录或访问日志泄露。
        var repository = new HttpSessionSecurityContextRepository();
        repository.setDisableUrlRewriting(true);
        return repository;
    }

    /** 配置登录成功后更换会话 ID 的策略。 */
    @Bean
    SessionAuthenticationStrategy sessionAuthenticationStrategy() {
        return new ChangeSessionIdAuthenticationStrategy();
    }

    /** 配置登录 Cookie 的名称、安全属性和有效期。 */
    @Bean
    CookieSerializer cookieSerializer(AuthProperties properties, Clock clock) {
        var serializer = new DefaultCookieSerializer() {
            /** 写入会话 Cookie，并限制“记住我”的有效期。 */
            @Override
            public void writeCookieValue(CookieValue value) {
                if (!value.getCookieValue().isEmpty()) {
                    var session = value.getRequest().getSession(false);
                    if (session != null && Boolean.TRUE.equals(session.getAttribute(SessionPolicy.REMEMBER))) {
                        // “记住我”使用持久 Cookie，但它的寿命仍不能超过会话绝对期限。
                        var expiry = SessionPolicy.absoluteExpiry(session);
                        if (expiry != null) {
                            long remaining = expiry.getEpochSecond() - clock.instant().getEpochSecond();
                            value.setCookieMaxAge((int) Math.max(0, Math.min(Integer.MAX_VALUE, remaining)));
                        }
                    }
                }
                super.writeCookieValue(value);
            }
        };
        // 登录令牌不是 JWT，而是服务端会话 ID；浏览器自动携带，HttpOnly 禁止 JS 读取。
        // Spring Session JDBC 保存会话及身份；HTTPS 部署时还需启用 Secure。
        serializer.setCookieName("AMW_SESSION");
        serializer.setCookiePath("/");
        serializer.setUseHttpOnlyCookie(true);
        serializer.setUseSecureCookie(properties.cookieSecure());
        serializer.setSameSite("Lax");
        return serializer;
    }

    /** 配置接口权限、CSRF 校验、安全响应头及会话检查过滤器。 */
    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http, HttpSessionCsrfTokenRepository csrfRepository,
                                           SecurityContextRepository contextRepository,
                                           ApiErrorWriter writer, Clock clock, UserService userService) throws Exception {
        // permitAll 只表示不要求登录，不表示跳过 CSRF；注册、登录仍需携带 CSRF 头。
        http.authorizeHttpRequests(auth -> auth
                    .requestMatchers(HttpMethod.GET, "/", "/index.html", "/assets/**",
                            "/api/auth/csrf", "/api/system/capabilities", "/actuator/health").permitAll()
                    .requestMatchers(HttpMethod.POST, "/api/auth/register", "/api/auth/login", "/api/auth/logout",
                            "/api/auth/registration-email-code").permitAll()
                    .requestMatchers("/error").permitAll()
                    .anyRequest().authenticated())
                .securityContext(context -> context.securityContextRepository(contextRepository))
                .csrf(csrf -> csrf.csrfTokenRepository(csrfRepository)
                    .csrfTokenRequestHandler(new CsrfTokenRequestAttributeHandler())
                    .ignoringRequestMatchers(request -> {
                        // 未登录时允许幂等退出；已登录的退出请求仍要校验 CSRF，防止被跨站强制退出。
                        var authentication = org.springframework.security.core.context.SecurityContextHolder
                                .getContext().getAuthentication();
                        return "POST".equals(request.getMethod())
                                && "/api/auth/logout".equals(request.getRequestURI())
                                && (authentication == null || !(authentication.getPrincipal()
                                    instanceof org.example.ai_media_workbench.common.security.AccountPrincipal));
                    }))
                // 使用 JSON 接口登录，不启用框架默认登录页、Basic 认证或默认退出地址。
                .requestCache(cache -> cache.disable())
                .formLogin(form -> form.disable())
                .httpBasic(basic -> basic.disable())
                .logout(logout -> logout.disable())
                .headers(headers -> headers.contentSecurityPolicy(csp -> csp.policyDirectives(
                    "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; "
                    + "font-src 'self'; media-src 'self' blob:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'")))
                .exceptionHandling(errors -> errors
                    .authenticationEntryPoint((request, response, exception) ->
                        writer.write(request, response, ErrorCode.UNAUTHENTICATED))
                    .accessDeniedHandler((request, response, exception) -> {
                        var auth = org.springframework.security.core.context.SecurityContextHolder
                                .getContext().getAuthentication();
                        boolean signedIn = auth != null
                                && auth.getPrincipal() instanceof org.example.ai_media_workbench.common.security.AccountPrincipal;
                        boolean publicAuth = request.getRequestURI().startsWith("/api/auth/");
                        writer.write(request, response,
                                signedIn || publicAuth ? ErrorCode.CSRF_INVALID : ErrorCode.UNAUTHENTICATED);
                    }))
                // 必须先从会话恢复身份，再检查绝对过期时间和账号是否仍然有效。
                .addFilterAfter(new SessionExpirationFilter(clock, writer, userService), SecurityContextHolderFilter.class);
        return http.build();
    }
}
