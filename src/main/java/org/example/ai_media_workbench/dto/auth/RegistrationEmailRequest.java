package org.example.ai_media_workbench.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import org.example.ai_media_workbench.common.validation.CodePointLength;

/** 申请注册验证码的邮箱，不创建账号或占用邮箱。 */
public record RegistrationEmailRequest(
        @NotNull @Email @CodePointLength(min = 3, max = 254)
        @Pattern(regexp = "[\\x00-\\x7F]+") String email) {
    public RegistrationEmailRequest {
        if (email != null) email = email.strip();
    }
}
