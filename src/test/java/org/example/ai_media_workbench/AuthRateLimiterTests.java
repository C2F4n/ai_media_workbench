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
    void reservationsRefundFailuresBlockConcurrentExcessAndKeepCommittedCounts() {
        Clock clock = mock(Clock.class); Instant now = Instant.parse("2026-10-14T00:00:00Z"); when(clock.instant()).thenReturn(now);
        var properties = new AuthProperties(false, Duration.ofMinutes(30), Duration.ofHours(12), Duration.ofDays(7), Duration.ofDays(30), true, 10, 5, Duration.ofMinutes(5));
        var limiter = new AuthRateLimiter(clock, properties);
        for (int i = 0; i < 10; i++) {
            try (var pending = limiter.reserve("mail:email:a", 1, Duration.ofMinutes(1))) {
                assertThatThrownBy(() -> limiter.reserve("mail:email:a", 1, Duration.ofMinutes(1))).isInstanceOf(RateLimitException.class);
            }
        }
        try (var sent = limiter.reserve("mail:email:a", 1, Duration.ofMinutes(1))) { sent.commit(); }
        assertThatThrownBy(() -> limiter.reserve("mail:email:a", 1, Duration.ofMinutes(1))).isInstanceOfSatisfying(RateLimitException.class, e -> assertThat(e.retryAfter()).isEqualTo(60));
        when(clock.instant()).thenReturn(now.plusSeconds(60));
        try (var next = limiter.reserve("mail:email:a", 1, Duration.ofMinutes(1))) { next.commit(); }
    }

    @Test
    void closingAnExpiredReservationCannotRefundItsReplacementWindow() {
        Clock clock = mock(Clock.class); Instant now = Instant.parse("2026-10-14T00:00:00Z"); when(clock.instant()).thenReturn(now);
        var properties = new AuthProperties(false, Duration.ofMinutes(30), Duration.ofHours(12), Duration.ofDays(7), Duration.ofDays(30), true, 10, 5, Duration.ofMinutes(5));
        var limiter = new AuthRateLimiter(clock, properties);
        var stale = limiter.reserve("mail:a", 1, Duration.ofMinutes(1));
        when(clock.instant()).thenReturn(now.plusSeconds(60));
        try (var current = limiter.reserve("mail:a", 1, Duration.ofMinutes(1))) { current.commit(); }
        stale.close(); stale.close();
        assertThatThrownBy(() -> limiter.reserve("mail:a", 1, Duration.ofMinutes(1))).isInstanceOf(RateLimitException.class);
    }

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
