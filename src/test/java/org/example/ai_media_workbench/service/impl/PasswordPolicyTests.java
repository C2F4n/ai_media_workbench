package org.example.ai_media_workbench.service.impl;

import jakarta.validation.Validation;
import org.example.ai_media_workbench.common.exception.BusinessException;
import org.example.ai_media_workbench.common.exception.ErrorCode;
import org.example.ai_media_workbench.dto.auth.RegisterRequest;
import org.example.ai_media_workbench.dto.user.ChangePasswordRequest;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class PasswordPolicyTests {
    @Test
    void acceptsSixThroughSixteenCodePointsWithoutRequiringCharacterTypes() {
        for (String password : new String[]{"Abc123", "Abcd1234Efgh5678", "abcdef", " Ab12 ",
                "\u5bc6\u7801Ab12", "\uD83D\uDE00".repeat(13) + "Ab1"}) {
            assertThatCode(() -> PasswordPolicy.check(password)).doesNotThrowAnyException();
        }
    }

    @Test
    void rejectsOutOfBoundsAndKeepsExistingWeakPasswordChecks() {
        for (String password : new String[]{"Ab12!", "Abcd1234Efgh56789", "\uD83D\uDE00".repeat(15) + "Ab"}) {
            assertThatThrownBy(() -> PasswordPolicy.check(password))
                    .isInstanceOfSatisfying(BusinessException.class,
                            error -> assertThat(error.code()).isEqualTo(ErrorCode.INVALID_PARAMETERS));
        }
        for (String password : new String[]{"      ", "aaaaaa", "ababab", "passwordpassword"}) {
            assertThatThrownBy(() -> PasswordPolicy.check(password))
                    .isInstanceOfSatisfying(BusinessException.class,
                            error -> assertThat(error.code()).isEqualTo(ErrorCode.WEAK_PASSWORD));
        }
    }

    @Test
    void registrationAndChangeDtosUseTheSameCodePointBounds() {
        try (var factory = Validation.buildDefaultValidatorFactory()) {
            var validator = factory.getValidator();
            for (String password : new String[]{"Ab12!", "Abc123", "Abcd1234Efgh5678", "Abcd1234Efgh56789",
                    "\uD83D\uDE00".repeat(13) + "Ab1", "\uD83D\uDE00".repeat(15) + "Ab"}) {
                int length = password.codePointCount(0, password.length());
                boolean validLength = length >= 6 && length <= 16;
                var registration = new RegisterRequest("valid_user", "user@example.com", password, null,
                        "00000000-0000-4000-8000-000000000001", "123456");
                var change = new ChangePasswordRequest("Legacy-Password-2026!", password);
                assertThat(validator.validateProperty(registration, "password").isEmpty()).isEqualTo(validLength);
                assertThat(validator.validateProperty(change, "newPassword").isEmpty()).isEqualTo(validLength);
                assertThat(validator.validateProperty(change, "currentPassword")).isEmpty();
            }
        }
    }
}
