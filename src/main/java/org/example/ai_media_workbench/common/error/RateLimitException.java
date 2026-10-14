package org.example.ai_media_workbench.common.error;

public class RateLimitException extends BusinessException {
    private final long retryAfter;

    public RateLimitException(long retryAfter) {
        super(ErrorCode.RATE_LIMITED);
        this.retryAfter = Math.max(1, retryAfter);
    }

    public long retryAfter() { return retryAfter; }
}
