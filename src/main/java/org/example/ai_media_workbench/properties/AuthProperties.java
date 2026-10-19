package org.example.ai_media_workbench.properties;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.time.Duration;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

/** 认证参数集中绑定；无效时长或限流次数会在启动时被拒绝，而不是等到登录时才报错。 */
@Validated
@ConfigurationProperties("app.auth")
public record AuthProperties(
        // 是否仅允许通过 HTTPS 发送登录 Cookie。
        boolean cookieSecure,
        // 普通登录：连续多久未访问后，会话失效。
        @NotNull Duration sessionIdleTimeout,
        // 普通登录：从登录时起，会话最长有效多久。
        @NotNull Duration sessionAbsoluteTimeout,
        // 勾选“记住我”：连续多久未访问后，会话失效。
        @NotNull Duration rememberIdleTimeout,
        // 勾选“记住我”：从登录时起，会话最长有效多久。
        @NotNull Duration rememberAbsoluteTimeout,
        // 是否开放新账号注册。
        boolean registrationEnabled,
        // 每个限流时间窗口内，同一 IP 或同一用户名允许的登录尝试次数。
        @Positive int loginAttempts,
        // 每个限流时间窗口内，同一 IP 允许的注册尝试次数。
        @Positive int registrationAttempts,
        // 统计注册、登录等请求次数的时间窗口长度。
        @NotNull Duration rateLimitWindow) {
    /** 检查所有会话时长和限流窗口是否有效。 */
    @AssertTrue(message = "Authentication timeouts and rate-limit window must be positive")
    public boolean isValidDurations() {
        return positiveSeconds(sessionIdleTimeout) && positiveSeconds(sessionAbsoluteTimeout)
                && positiveSeconds(rememberIdleTimeout) && positiveSeconds(rememberAbsoluteTimeout)
                && positiveSeconds(rateLimitWindow);
    }

    /** 检查时长是否至少一秒，且整秒数不超过 int 上限。 */
    private static boolean positiveSeconds(Duration duration) {
        return duration != null && duration.getSeconds() > 0 && duration.getSeconds() <= Integer.MAX_VALUE;
    }
}
