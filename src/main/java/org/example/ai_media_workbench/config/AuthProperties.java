package org.example.ai_media_workbench.config;

import java.time.Duration;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties("app.auth")
public record AuthProperties(
        boolean cookieSecure,
        Duration sessionIdleTimeout,
        Duration sessionAbsoluteTimeout,
        Duration rememberIdleTimeout,
        Duration rememberAbsoluteTimeout,
        boolean registrationEnabled,
        int loginAttempts,
        int registrationAttempts,
        Duration rateLimitWindow) {}
