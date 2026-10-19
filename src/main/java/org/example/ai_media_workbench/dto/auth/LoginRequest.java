package org.example.ai_media_workbench.dto.auth;

import org.example.ai_media_workbench.common.validation.CodePointLength;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

/** 登录入参；rememberMe 未传时按 false 处理，密码不会出现在 toString 中。 */
public record LoginRequest(
        @NotNull @Pattern(regexp = "[a-zA-Z0-9_]{4,32}") String username,
        @NotNull @CodePointLength(min = 1, max = 128) String password,
        Boolean rememberMe) {

    public boolean remember() { return Boolean.TRUE.equals(rememberMe); }

    @Override
    public String toString() {
        return "LoginRequest[username=" + username + ", rememberMe=" + rememberMe + "]";
    }
}
