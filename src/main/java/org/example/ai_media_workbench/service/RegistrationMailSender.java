package org.example.ai_media_workbench.service;

import java.time.Duration;

public interface RegistrationMailSender {
    /** 判断是否已配置真实发信服务。 */
    boolean isAvailable();
    /** 将验证码发送至指定邮箱；失败必须抛出异常，不得假装发送成功。 */
    void sendCode(String email, String code, Duration ttl);
}
