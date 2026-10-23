package org.example.ai_media_workbench.service.impl;

import jakarta.validation.Validation;
import org.example.ai_media_workbench.common.exception.BusinessException;
import org.example.ai_media_workbench.common.exception.ErrorCode;
import org.example.ai_media_workbench.dto.auth.RegisterRequest;
import org.example.ai_media_workbench.dto.auth.LoginRequest;
import org.example.ai_media_workbench.dto.auth.RegistrationEmailRequest;
import org.example.ai_media_workbench.dto.user.ChangePasswordRequest;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class PasswordPolicyTests {
    @Test
    void accountValidationMessagesExplainTheRuleWithoutEchoingSubmittedSecrets() {
        try (var factory = Validation.buildDefaultValidatorFactory()) {
            var validator = factory.getValidator();
            var registration = new RegisterRequest("!", "not-an-email", "Ab12!", "x".repeat(51), "bad-id", "abc");
            assertThat(validator.validateProperty(registration, "username")).extracting(error -> error.getMessage())
                    .containsExactly("用户名需要4–32位英文字母、数字或下划线，不能包含空格或中文。");
            assertThat(validator.validateProperty(registration, "password")).extracting(error -> error.getMessage())
                    .containsExactly("密码需要6–16个字符。");
            assertThat(validator.validateProperty(registration, "emailCode")).extracting(error -> error.getMessage())
                    .containsExactly("邮箱验证码需要6位数字。");
            assertThat(validator.validateProperty(registration, "displayName")).extracting(error -> error.getMessage())
                    .containsExactly("昵称需要1–50个字符；不填写时请省略该字段。");
            assertThat(validator.validate(new LoginRequest(null, null, false))).extracting(error -> error.getMessage())
                    .containsExactlyInAnyOrder("请输入用户名。", "请输入密码。");
            assertThat(validator.validate(new RegistrationEmailRequest("not-an-email"))).extracting(error -> error.getMessage())
                    .containsExactly("请输入有效的邮箱地址，例如 name@example.com。");
            assertThat(validator.validate(new ChangePasswordRequest(null, "Ab12!"))).extracting(error -> error.getMessage())
                    .containsExactlyInAnyOrder("请输入当前密码。", "新密码需要6–16个字符。");
            assertThat(validator.validate(registration)).allSatisfy(error -> assertThat(error.getMessage()).doesNotContain("Ab12!", "bad-id", "not-an-email"));
        }
    }

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
