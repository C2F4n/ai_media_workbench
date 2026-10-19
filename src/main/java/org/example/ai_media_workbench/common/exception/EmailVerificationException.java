package org.example.ai_media_workbench.common.exception;

/** 统一隐藏错误、过期、邮箱不匹配、已消费等验证码状态。 */
public class EmailVerificationException extends BusinessException {
    public EmailVerificationException() {
        super(ErrorCode.EMAIL_VERIFICATION_INVALID);
    }
}
