package org.example.ai_media_workbench.properties;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Max;
import java.time.Duration;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

/** 注册验证码的发送配置；没有配置真实发信服务时不开放注册。 */
@Validated
@ConfigurationProperties("app.registration-mail")
public record RegistrationMailProperties(
        // 是否启用真实邮件发送。
        boolean enabled,
        // 验证邮件的发件地址。
        String from,
        // 验证码有效期。
        @NotNull Duration codeTtl,
        // 同一验证码最多允许尝试次数。
        @Positive @Max(10) int maxAttempts,
        // 每一分钟，同一邮箱最多成功交给 SMTP 的发送次数；发送失败返还配额。
        @Positive int sendAttempts) {
    /** 验证码有效期必须在一分钟到一小时之间。 */
    @AssertTrue(message = "Registration code TTL must be between one minute and one hour")
    public boolean isValidCodeTtl() {
        return codeTtl != null && codeTtl.compareTo(Duration.ofMinutes(1)) >= 0
                && codeTtl.compareTo(Duration.ofHours(1)) <= 0;
    }
}
