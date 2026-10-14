package org.example.ai_media_workbench.config;

import org.example.ai_media_workbench.common.error.ErrorCode;
import org.example.ai_media_workbench.common.security.SessionExpirationFilter;
import org.example.ai_media_workbench.common.security.SessionPolicy;
import org.example.ai_media_workbench.common.web.ApiErrorWriter;
import org.example.ai_media_workbench.entity.UserStatus;
import org.example.ai_media_workbench.mapper.UserMapper;
import org.example.ai_media_workbench.service.UserService;
import java.time.Clock;
import java.util.List;
import java.util.Locale;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
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

@Configuration
@EnableConfigurationProperties(AuthProperties.class)
public class SecurityConfig {
    @Bean
    Clock clock() { return Clock.systemUTC(); }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new Argon2PasswordEncoder(16, 32, 1, 19456, 2);
    }

    @Bean
    AuthenticationManager authenticationManager(UserMapper mapper, PasswordEncoder encoder) {
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

    @Bean
    HttpSessionCsrfTokenRepository csrfRepository() {
        var repository = new HttpSessionCsrfTokenRepository();
        repository.setHeaderName("X-CSRF-Token");
        return repository;
    }

    @Bean
    SecurityContextRepository securityContextRepository() {
        var repository = new HttpSessionSecurityContextRepository();
        repository.setDisableUrlRewriting(true);
        return repository;
    }

    @Bean
    SessionAuthenticationStrategy sessionAuthenticationStrategy() {
        return new ChangeSessionIdAuthenticationStrategy();
    }

    @Bean
    CookieSerializer cookieSerializer(AuthProperties properties, Clock clock) {
        var serializer = new DefaultCookieSerializer() {
            @Override
            public void writeCookieValue(CookieValue value) {
                if (!value.getCookieValue().isEmpty()) {
                    var session = value.getRequest().getSession(false);
                    if (session != null && Boolean.TRUE.equals(session.getAttribute(SessionPolicy.REMEMBER))) {
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
        serializer.setCookieName("AMW_SESSION");
        serializer.setCookiePath("/");
        serializer.setUseHttpOnlyCookie(true);
        serializer.setUseSecureCookie(properties.cookieSecure());
        serializer.setSameSite("Lax");
        return serializer;
    }

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http, HttpSessionCsrfTokenRepository csrfRepository,
                                           SecurityContextRepository contextRepository,
                                           ApiErrorWriter writer, Clock clock, UserService userService) throws Exception {
        http.authorizeHttpRequests(auth -> auth
                    .requestMatchers(HttpMethod.GET, "/", "/index.html", "/assets/**",
                            "/api/auth/csrf", "/api/system/capabilities", "/actuator/health").permitAll()
                    .requestMatchers(HttpMethod.POST, "/api/auth/register", "/api/auth/login", "/api/auth/logout").permitAll()
                    .requestMatchers("/error").permitAll()
                    .anyRequest().authenticated())
                .securityContext(context -> context.securityContextRepository(contextRepository))
                .csrf(csrf -> csrf.csrfTokenRepository(csrfRepository)
                    .csrfTokenRequestHandler(new CsrfTokenRequestAttributeHandler())
                    .ignoringRequestMatchers(request -> {
                        var authentication = org.springframework.security.core.context.SecurityContextHolder
                                .getContext().getAuthentication();
                        return "POST".equals(request.getMethod())
                                && "/api/auth/logout".equals(request.getRequestURI())
                                && (authentication == null || !(authentication.getPrincipal()
                                    instanceof org.example.ai_media_workbench.common.security.AccountPrincipal));
                    }))
                .requestCache(cache -> cache.disable())
                .formLogin(form -> form.disable())
                .httpBasic(basic -> basic.disable())
                .logout(logout -> logout.disable())
                .headers(headers -> headers.contentSecurityPolicy(csp -> csp.policyDirectives(
                    "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; "
                    + "font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'")))
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
                .addFilterAfter(new SessionExpirationFilter(clock, writer, userService), SecurityContextHolderFilter.class);
        return http.build();
    }
}
