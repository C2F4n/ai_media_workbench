package org.example.ai_media_workbench.dto.user;

import org.example.ai_media_workbench.common.validation.CodePointLength;
import jakarta.validation.constraints.NotNull;

public record ChangePasswordRequest(
        @NotNull(message = "请输入当前密码。") @CodePointLength(min = 1, max = 128, message = "当前密码需要1–128个字符。") String currentPassword,
        @NotNull(message = "请输入新密码。") @CodePointLength(min = 6, max = 16, message = "新密码需要6–16个字符。") String newPassword) {

    @Override
    public String toString() { return "ChangePasswordRequest[redacted]"; }
}
