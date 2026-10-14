package org.example.ai_media_workbench.service.impl;

import org.example.ai_media_workbench.common.error.BusinessException;
import org.example.ai_media_workbench.common.error.ErrorCode;
import java.util.Locale;
import java.util.Set;

final class PasswordPolicy {
    private static final Set<String> WEAK = Set.of(
            "passwordpassword", "password123456789", "123456789012345", "qwertyuiopasdfgh");

    private PasswordPolicy() {}

    static void check(String password) {
        int count = password.codePointCount(0, password.length());
        if (count < 15 || count > 128) {
            throw new BusinessException(ErrorCode.INVALID_PARAMETERS);
        }
        if (password.isBlank() || password.codePoints().distinct().count() < 3
                || WEAK.contains(password.toLowerCase(Locale.ROOT))) {
            throw new BusinessException(ErrorCode.WEAK_PASSWORD);
        }
    }
}
