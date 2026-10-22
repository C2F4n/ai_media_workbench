package org.example.ai_media_workbench.common.security;

import org.example.ai_media_workbench.common.exception.RateLimitException;
import org.example.ai_media_workbench.properties.AuthProperties;
import java.time.Clock;
import java.time.Instant;
import java.time.Duration;
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
        acquire(key, limit, properties.rateLimitWindow());
    }

    /** 先占位防止并发穿透；只有实际完成操作才确认配额，异常退出自动返还。 */
    public synchronized Permit reserve(String key, int limit, Duration duration) {
        return new Permit(key, acquire(key, limit, duration));
    }

    private Window acquire(String key, int limit, Duration duration) {
        if (limit < 1 || duration == null || duration.isZero() || duration.isNegative()) throw new IllegalArgumentException();
        Instant now = clock.instant();
        windows.entrySet().removeIf(e -> !now.isBefore(e.getValue().expiresAt));
        Window window = windows.get(key);
        if (window == null) {
            if (windows.size() >= MAX_KEYS) {
                throw new RateLimitException(60);
            }
            window = new Window(now.plus(duration));
            windows.put(key, window);
        }
        if (window.count >= limit) {
            throw new RateLimitException(Math.max(1, window.expiresAt.getEpochSecond() - now.getEpochSecond()));
        }
        window.count++;
        return window;
    }

    public final class Permit implements AutoCloseable {
        private final String key;
        private final Window window;
        private boolean committed, closed;
        private Permit(String key, Window window) { this.key = key; this.window = window; }
        public void commit() {
            synchronized (AuthRateLimiter.this) { if (!closed) committed = true; }
        }
        @Override public void close() {
            synchronized (AuthRateLimiter.this) {
                if (closed) return;
                closed = true;
                // 不能退还到已经过期后被同名新窗口替换的计数中。
                if (!committed && windows.get(key) == window && --window.count == 0) windows.remove(key);
            }
        }
    }

    private static final class Window {
        private final Instant expiresAt;
        private int count;
        private Window(Instant expiresAt) { this.expiresAt = expiresAt; }
    }
}
