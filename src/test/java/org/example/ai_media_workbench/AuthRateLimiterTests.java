package org.example.ai_media_workbench;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import org.example.ai_media_workbench.common.exception.RateLimitException;
import org.example.ai_media_workbench.common.security.AuthRateLimiter;
import org.example.ai_media_workbench.properties.AuthProperties;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class AuthRateLimiterTests {
    @Test
    void limitExpiresAndSeparateKeysDoNotShareCounts() {
        Clock clock = mock(Clock.class);
        Instant now = Instant.parse("2026-10-14T00:00:00Z");
        when(clock.instant()).thenReturn(now);
        AuthProperties properties = new AuthProperties(false, Duration.ofMinutes(30), Duration.ofHours(12),
                Duration.ofDays(7), Duration.ofDays(30), true, 10, 5, Duration.ofMinutes(5));
        AuthRateLimiter limiter = new AuthRateLimiter(clock, properties);
        limiter.check("user:a", 1);
        limiter.check("user:b", 1);
        assertThatThrownBy(() -> limiter.check("user:a", 1)).isInstanceOfSatisfying(
                RateLimitException.class, error -> assertThat(error.retryAfter()).isEqualTo(300));
        when(clock.instant()).thenReturn(now.plusSeconds(300));
        limiter.check("user:a", 1);
    }
}
