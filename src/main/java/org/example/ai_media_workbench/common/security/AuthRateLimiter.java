package org.example.ai_media_workbench.common.security;

import org.example.ai_media_workbench.common.error.RateLimitException;
import org.example.ai_media_workbench.config.AuthProperties;
import java.time.Clock;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import org.springframework.stereotype.Component;

@Component
public class AuthRateLimiter {
    private static final int MAX_KEYS = 5000;
    private final Map<String, Window> windows = new HashMap<>();
    private final Clock clock;
    private final AuthProperties properties;

    public AuthRateLimiter(Clock clock, AuthProperties properties) {
        this.clock = clock;
        this.properties = properties;
    }

    public synchronized void check(String key, int limit) {
        Instant now = clock.instant();
        windows.entrySet().removeIf(e -> !now.isBefore(e.getValue().expiresAt));
        Window window = windows.get(key);
        if (window == null) {
            if (windows.size() >= MAX_KEYS) {
                throw new RateLimitException(60);
            }
            window = new Window(now.plus(properties.rateLimitWindow()));
            windows.put(key, window);
        }
        if (window.count >= limit) {
            throw new RateLimitException(Math.max(1, window.expiresAt.getEpochSecond() - now.getEpochSecond()));
        }
        window.count++;
    }

    private static final class Window {
        private final Instant expiresAt;
        private int count;
        private Window(Instant expiresAt) { this.expiresAt = expiresAt; }
    }
}
