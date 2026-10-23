package org.example.ai_media_workbench.dto.auth;

import org.example.ai_media_workbench.common.validation.CodePointLength;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

/** 登录入参；rememberMe 未传时按 false 处理，密码不会出现在 toString 中。 */
public record LoginRequest(
        @NotNull(message = "请输入用户名。")
        @Pattern(regexp = "[a-zA-Z0-9_]{4,32}", message = "用户名需要4–32位英文字母、数字或下划线，不能包含空格或中文。") String username,
        @NotNull(message = "请输入密码。") @CodePointLength(min = 1, max = 128, message = "登录密码需要1–128个字符。") String password,
        Boolean rememberMe) {

    public boolean remember() { return Boolean.TRUE.equals(rememberMe); }

    @Override
    public String toString() {
        return "LoginRequest[username=" + username + ", rememberMe=" + rememberMe + "]";
    }
}
