package org.example.ai_media_workbench.service.impl;

import org.example.ai_media_workbench.common.exception.BusinessException;
import org.example.ai_media_workbench.common.exception.ErrorCode;
import org.example.ai_media_workbench.properties.AuthProperties;
import org.example.ai_media_workbench.dto.auth.LoginRequest;
import org.example.ai_media_workbench.dto.auth.RegisterRequest;
import org.example.ai_media_workbench.entity.UserEntity;
import org.example.ai_media_workbench.entity.UserStatus;
import org.example.ai_media_workbench.mapper.UserMapper;
import org.example.ai_media_workbench.service.AuthService;
import org.example.ai_media_workbench.service.RegistrationEmailService;
import java.time.Clock;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Locale;
import java.util.UUID;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** 注册和凭证校验的业务实现；异常向上抛给统一处理器，不在业务层组装 Result 或 HTTP 响应。 */
@Service
public class AuthServiceImpl implements AuthService {
    // 用户数据访问对象：查询和保存用户记录。
    private final UserMapper userMapper;
    // 密码编码器：生成和校验密码哈希。
    private final PasswordEncoder passwordEncoder;
    // 认证配置：读取注册开关、会话时长和限流设置。
    private final AuthProperties properties;
    // 时钟对象：获取当前时间。
    private final Clock clock;
    // 认证管理器：校验登录用户名、密码和账号状态。
    private final AuthenticationManager authenticationManager;
    // 邮箱校验服务：验证邮箱归属并消费一次性验证码。
    private final RegistrationEmailService registrationEmails;

    public AuthServiceImpl(UserMapper userMapper, PasswordEncoder passwordEncoder,
                           AuthProperties properties, Clock clock, AuthenticationManager authenticationManager,
                           RegistrationEmailService registrationEmails) {
        this.userMapper = userMapper;
        this.passwordEncoder = passwordEncoder;
        this.properties = properties;
        this.clock = clock;
        this.authenticationManager = authenticationManager;
        this.registrationEmails = registrationEmails;
    }

    /** 校验注册信息，将密码哈希后保存账号。 */
    @Override
    @Transactional
    public UserEntity register(RegisterRequest request) {
        if (!properties.registrationEnabled()) {
            throw new BusinessException(ErrorCode.REGISTRATION_DISABLED);
        }
        PasswordPolicy.check(request.password());
        String email = request.email().strip().toLowerCase(Locale.ROOT);
        // 先核验邮箱归属，失败不会创建用户，也不会占用邮箱。
        registrationEmails.verify(request.emailChallengeId(), email, request.emailCode());
        var user = new UserEntity();
        // UUID.randomUUID() 生成随机 UUID 对象，toString() 转成字符串，再由 setId() 写入 user 的 id 属性。
        user.setId(UUID.randomUUID().toString());
        // 账号名和邮箱统一大小写，避免把大小写不同的同一身份当成不同账号；密码保持原样。
        // toLowerCase() 将字母转成小写；参数 Locale.ROOT 指定语言中立的转换规则，不受系统默认语言影响。
        user.setUsername(request.username().toLowerCase(Locale.ROOT));
        user.setEmail(email);
        String displayName = request.displayName() == null ? user.getUsername() : request.displayName().strip();
        // isEmpty() 是 Java 字符串自带的方法：长度为 0 时返回 true，防止保存处理后没有内容的昵称。
        if (displayName.isEmpty()) {
            throw new BusinessException(ErrorCode.INVALID_PARAMETERS);
        }
        user.setDisplayName(displayName);
        // 设置密码哈希，不保存明文。
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        // 验证码已通过，设置邮箱为已验证。
        user.setEmailVerified(true);
        // 设置账号为启用状态。
        user.setStatus(UserStatus.ACTIVE);
        var now = LocalDateTime.ofInstant(clock.instant(), ZoneOffset.UTC);
        // 设置账号创建时间。
        user.setCreatedAt(now);
        // 设置账号更新时间。
        user.setUpdatedAt(now);
        // 唯一约束保证并发安全；重复账号的数据库异常由 GlobalExceptionHandler 转成 409 Result。
        // 消费验证码和插入用户一起提交，保证同一个验证码不能被并发重复使用。
        registrationEmails.consume(request.emailChallengeId(), email);
        userMapper.insert(user);
        return user;
    }

    /** 校验用户名、密码及账号状态，返回用户记录。 */
    @Override
    public UserEntity authenticate(LoginRequest request) {
        String username = request.username().toLowerCase(Locale.ROOT);
        // 凭证错误和账号停用异常由 GlobalExceptionHandler 统一转成 401 INVALID_CREDENTIALS。
        authenticationManager.authenticate(
                UsernamePasswordAuthenticationToken.unauthenticated(username, request.password()));
        UserEntity user = userMapper.findByUsername(username);
        if (user == null || user.getStatus() != UserStatus.ACTIVE) {
            throw new BusinessException(ErrorCode.INVALID_CREDENTIALS);
        }
        return user;
    }
}
