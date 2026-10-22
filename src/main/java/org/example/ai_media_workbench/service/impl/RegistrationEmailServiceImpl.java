package org.example.ai_media_workbench.service.impl;

import java.security.SecureRandom;
import java.time.Clock;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Locale;
import java.util.UUID;
import org.example.ai_media_workbench.common.exception.BusinessException;
import org.example.ai_media_workbench.common.exception.EmailVerificationException;
import org.example.ai_media_workbench.common.exception.ErrorCode;
import org.example.ai_media_workbench.common.security.AuthRateLimiter;
import org.example.ai_media_workbench.entity.RegistrationEmailEntity;
import org.example.ai_media_workbench.mapper.RegistrationEmailMapper;
import org.example.ai_media_workbench.properties.AuthProperties;
import org.example.ai_media_workbench.properties.RegistrationMailProperties;
import org.example.ai_media_workbench.service.RegistrationEmailService;
import org.example.ai_media_workbench.service.RegistrationMailSender;
import org.example.ai_media_workbench.vo.auth.RegistrationEmailVO;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RegistrationEmailServiceImpl implements RegistrationEmailService {
    private final RegistrationEmailMapper mapper;
    private final RegistrationMailSender mail;
    private final PasswordEncoder encoder;
    private final AuthRateLimiter limiter;
    private final AuthProperties auth;
    private final RegistrationMailProperties properties;
    private final Clock clock;
    private final SecureRandom random = new SecureRandom();

    public RegistrationEmailServiceImpl(RegistrationEmailMapper mapper, RegistrationMailSender mail,
            PasswordEncoder encoder, AuthRateLimiter limiter, AuthProperties auth,
            RegistrationMailProperties properties, Clock clock) {
        this.mapper = mapper;
        this.mail = mail;
        this.encoder = encoder;
        this.limiter = limiter;
        this.auth = auth;
        this.properties = properties;
        this.clock = clock;
    }

    /** 发送六位验证码，只保存加盐哈希；发送失败时回滚申请记录。 */
    @Override
    @Transactional
    public RegistrationEmailVO send(String email) {
        if (!auth.registrationEnabled()) throw new BusinessException(ErrorCode.REGISTRATION_DISABLED);
        if (!mail.isAvailable()) throw new BusinessException(ErrorCode.EMAIL_DELIVERY_UNAVAILABLE);
        String canonical = email.strip().toLowerCase(Locale.ROOT);
        try (var permit = limiter.reserve("registration-mail:email:" + canonical, properties.sendAttempts(), java.time.Duration.ofMinutes(1))) {
            String code = String.format(Locale.ROOT, "%06d", random.nextInt(1_000_000));
            var challenge = new RegistrationEmailEntity();
            challenge.setId(UUID.randomUUID().toString());
            challenge.setEmail(canonical);
            challenge.setCodeHash(encoder.encode(code));
            challenge.setMaxAttempts(properties.maxAttempts());
            challenge.setCreatedAt(now());
            challenge.setExpiresAt(now().plus(properties.codeTtl()));
            mapper.insert(challenge);
            mail.sendCode(canonical, code, properties.codeTtl());
            permit.commit();
            return new RegistrationEmailVO(challenge.getId(), challenge.getExpiresAt().toInstant(ZoneOffset.UTC));
        }
    }

    /** 独立事务累计尝试次数，避免注册失败回滚后可以无限猜验证码。 */
    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW, noRollbackFor = EmailVerificationException.class)
    public void verify(String challengeId, String email, String code) {
        if (mapper.attempt(challengeId, email, now()) != 1) throw new EmailVerificationException();
        var challenge = mapper.findById(challengeId);
        if (!encoder.matches(code, challenge.getCodeHash())) throw new EmailVerificationException();
    }

    /** 与用户插入共享事务：插入失败时恢复验证码，成功后则不能再次使用。 */
    @Override
    @Transactional(propagation = Propagation.MANDATORY)
    public void consume(String challengeId, String email) {
        if (mapper.consume(challengeId, email, now()) != 1) throw new EmailVerificationException();
    }

    /** 定期删除已过期的验证码记录，避免长期保留临时邮箱数据。 */
    @Scheduled(fixedDelay = 3600000, initialDelay = 3600000)
    public void deleteExpired() {
        mapper.deleteExpired(now().minusDays(1));
    }

    /** 获取数据库使用的 UTC 时间。 */
    private LocalDateTime now() {
        return LocalDateTime.ofInstant(clock.instant(), ZoneOffset.UTC);
    }
}
