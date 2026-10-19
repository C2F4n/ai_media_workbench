package org.example.ai_media_workbench.common.security;

import org.example.ai_media_workbench.common.exception.RateLimitException;
import org.example.ai_media_workbench.properties.AuthProperties;
import java.time.Clock;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import org.springframework.stereotype.Component;

/** 单实例内存固定窗口限流：重启后计数归零；多实例部署时需换成共享限流存储。 */
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

    /**
     * 检查并累计指定对象的请求次数，超过窗口限额时拒绝请求。
     *
     * @param key 计数标识，区分操作和对象，例如发送注册邮件的来源 IP
     * @param limit 当前时间窗口内允许的请求次数上限
     */
    // key 区分操作和对象（例如 login:ip:...）；同步保证并发请求不会漏计，限制键数防止内存无限增长。
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
