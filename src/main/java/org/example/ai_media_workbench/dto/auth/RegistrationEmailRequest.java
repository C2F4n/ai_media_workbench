package org.example.ai_media_workbench.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import org.example.ai_media_workbench.common.validation.CodePointLength;

/** 申请注册验证码的邮箱，不创建账号或占用邮箱。 */
public record RegistrationEmailRequest(
        @NotNull(message = "请输入邮箱。") @Email(message = "请输入有效的邮箱地址，例如 name@example.com。")
        @CodePointLength(min = 3, max = 254, message = "邮箱需要3–254个字符。")
        @Pattern(regexp = "[\\x00-\\x7F]+", message = "邮箱只支持英文字符，请检查是否使用了中文或全角符号。") String email) {
    public RegistrationEmailRequest {
        if (email != null) email = email.strip();
    }
}
