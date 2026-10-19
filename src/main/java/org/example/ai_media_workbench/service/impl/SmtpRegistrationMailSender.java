package org.example.ai_media_workbench.service.impl;

import java.time.Duration;
import org.example.ai_media_workbench.common.exception.BusinessException;
import org.example.ai_media_workbench.common.exception.ErrorCode;
import org.example.ai_media_workbench.properties.RegistrationMailProperties;
import org.example.ai_media_workbench.service.RegistrationMailSender;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.stereotype.Service;

/** 真实 SMTP 发信；生产环境没有打印验证码或模拟成功的后门。 */
@Service
public class SmtpRegistrationMailSender implements RegistrationMailSender {
    private final ObjectProvider<JavaMailSender> senders;
    private final RegistrationMailProperties properties;

    public SmtpRegistrationMailSender(ObjectProvider<JavaMailSender> senders, RegistrationMailProperties properties) {
        this.senders = senders;
        this.properties = properties;
    }

    /** 检查发信开关、发件地址和 SMTP 主机是否已配置。 */
    @Override
    public boolean isAvailable() {
        var sender = senders.getIfAvailable();
        return properties.enabled() && properties.from() != null && !properties.from().isBlank()
                && sender != null && (!(sender instanceof JavaMailSenderImpl smtp)
                || (smtp.getHost() != null && !smtp.getHost().isBlank()));
    }

    /** 发送验证码，传输失败时向上返回明确错误。 */
    @Override
    public void sendCode(String email, String code, Duration ttl) {
        if (!isAvailable()) throw new BusinessException(ErrorCode.EMAIL_DELIVERY_UNAVAILABLE);
        var message = new SimpleMailMessage();
        message.setFrom(properties.from());
        message.setTo(email);
        message.setSubject("音视频工作台 - 注册邮箱验证码");
        message.setText("注册验证码：" + code + "\n有效期 " + ttl.toMinutes()
                + " 分钟。请勿向他人透露验证码。\n如果不是您本人操作，请忽略此邮件，账号尚未创建。");
        try {
            senders.getObject().send(message);
        } catch (MailException exception) {
            // 不记录邮件正文、验证码、SMTP 授权码或服务商返回的敏感详情。
            throw new BusinessException(ErrorCode.EMAIL_DELIVERY_UNAVAILABLE);
        }
    }
}
