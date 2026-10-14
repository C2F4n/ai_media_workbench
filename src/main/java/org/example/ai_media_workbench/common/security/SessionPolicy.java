package org.example.ai_media_workbench.common.security;

import jakarta.servlet.http.HttpSession;
import java.time.Instant;

public final class SessionPolicy {
    public static final String ABSOLUTE_EXPIRY = "AMW_ABSOLUTE_EXPIRY";
    public static final String REMEMBER = "AMW_REMEMBER";

    private SessionPolicy() {}

    public static Instant absoluteExpiry(HttpSession session) {
        Object value = session.getAttribute(ABSOLUTE_EXPIRY);
        return value instanceof Instant expiry ? expiry : null;
    }
}
