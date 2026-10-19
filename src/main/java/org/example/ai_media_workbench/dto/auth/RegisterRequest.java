package org.example.ai_media_workbench.dto.auth;

import org.example.ai_media_workbench.common.validation.CodePointLength;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

/** 注册入参 DTO：record 自动提供构造器和访问器；约束由 Controller 的 @Valid 触发。 */
public record RegisterRequest(
        @NotNull @Pattern(regexp = "[a-zA-Z0-9_]{4,32}") String username,
        @NotNull @Email @CodePointLength(min = 3, max = 254)
        @Pattern(regexp = "[\\x00-\\x7F]+") String email,
        @NotNull @CodePointLength(min = 6, max = 16) String password,
        @CodePointLength(min = 1, max = 50) String displayName,
        // 验证码申请返回的标识，必须与当前邮箱匹配。
        @NotNull @Pattern(regexp = "[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}")
        String emailChallengeId,
        // 从邮箱收到的六位验证码，不能通过日志输出。
        @NotNull @Pattern(regexp = "[0-9]{6}") String emailCode) {

    public RegisterRequest {
        // 只清理邮箱和昵称两端空白；密码的空格也是密码的一部分，不能擅自裁剪。
        if (email != null) email = email.strip();
        if (displayName != null) displayName = displayName.strip();
    }

    @Override
    public String toString() {
        // record 默认 toString 会打印全部字段，因此必须覆盖，防止密码被带入日志。
        return "RegisterRequest[username=" + username + "]";
    }
}
