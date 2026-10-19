package org.example.ai_media_workbench.service;

import org.example.ai_media_workbench.vo.auth.RegistrationEmailVO;

public interface RegistrationEmailService {
    /** 发送注册验证码，不占用账号或邮箱归属。 */
    RegistrationEmailVO send(String email);
    /** 校验验证码并累计尝试次数。 */
    void verify(String challengeId, String email, String code);
    /** 消费已通过校验的验证码，防止重放。 */
    void consume(String challengeId, String email);
}
