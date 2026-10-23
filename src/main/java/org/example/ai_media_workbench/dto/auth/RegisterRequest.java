package org.example.ai_media_workbench.dto.auth;

import org.example.ai_media_workbench.common.validation.CodePointLength;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

/** 注册入参 DTO：record 自动提供构造器和访问器；约束由 Controller 的 @Valid 触发。 */
public record RegisterRequest(
        @NotNull(message = "请输入用户名。")
        @Pattern(regexp = "[a-zA-Z0-9_]{4,32}", message = "用户名需要4–32位英文字母、数字或下划线，不能包含空格或中文。") String username,
        @NotNull(message = "请输入邮箱。") @Email(message = "请输入有效的邮箱地址，例如 name@example.com。")
        @CodePointLength(min = 3, max = 254, message = "邮箱需要3–254个字符。")
        @Pattern(regexp = "[\\x00-\\x7F]+", message = "邮箱只支持英文字符，请检查是否使用了中文或全角符号。") String email,
        @NotNull(message = "请输入密码。") @CodePointLength(min = 6, max = 16, message = "密码需要6–16个字符。") String password,
        @CodePointLength(min = 1, max = 50, message = "昵称需要1–50个字符；不填写时请省略该字段。") String displayName,
        // 验证码申请返回的标识，必须与当前邮箱匹配。
        @NotNull(message = "请先获取当前邮箱的验证码。")
        @Pattern(regexp = "[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}", message = "验证码申请已失效，请重新获取。")
        String emailChallengeId,
        // 从邮箱收到的六位验证码，不能通过日志输出。
        @NotNull(message = "请输入邮箱验证码。") @Pattern(regexp = "[0-9]{6}", message = "邮箱验证码需要6位数字。") String emailCode) {

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
