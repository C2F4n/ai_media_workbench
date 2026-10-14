package org.example.ai_media_workbench.service.impl;

import org.example.ai_media_workbench.common.error.BusinessException;
import org.example.ai_media_workbench.common.error.ErrorCode;
import org.example.ai_media_workbench.config.AuthProperties;
import org.example.ai_media_workbench.dto.auth.LoginRequest;
import org.example.ai_media_workbench.dto.auth.RegisterRequest;
import org.example.ai_media_workbench.entity.UserEntity;
import org.example.ai_media_workbench.entity.UserStatus;
import org.example.ai_media_workbench.mapper.UserMapper;
import org.example.ai_media_workbench.service.AuthService;
import java.time.Clock;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Locale;
import java.util.UUID;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthServiceImpl implements AuthService {
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final AuthProperties properties;
    private final Clock clock;
    private final AuthenticationManager authenticationManager;

    public AuthServiceImpl(UserMapper userMapper, PasswordEncoder passwordEncoder,
                           AuthProperties properties, Clock clock, AuthenticationManager authenticationManager) {
        this.userMapper = userMapper;
        this.passwordEncoder = passwordEncoder;
        this.properties = properties;
        this.clock = clock;
        this.authenticationManager = authenticationManager;
    }

    @Override
    @Transactional
    public UserEntity register(RegisterRequest request) {
        if (!properties.registrationEnabled()) {
            throw new BusinessException(ErrorCode.REGISTRATION_DISABLED);
        }
        PasswordPolicy.check(request.password());
        var user = new UserEntity();
        user.setId(UUID.randomUUID().toString());
        user.setUsername(request.username().toLowerCase(Locale.ROOT));
        user.setEmail(request.email().strip().toLowerCase(Locale.ROOT));
        String displayName = request.displayName() == null ? user.getUsername() : request.displayName().strip();
        if (displayName.isEmpty()) {
            throw new BusinessException(ErrorCode.INVALID_PARAMETERS);
        }
        user.setDisplayName(displayName);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setEmailVerified(false);
        user.setStatus(UserStatus.ACTIVE);
        var now = LocalDateTime.ofInstant(clock.instant(), ZoneOffset.UTC);
        user.setCreatedAt(now);
        user.setUpdatedAt(now);
        try {
            userMapper.insert(user);
        } catch (DuplicateKeyException exception) {
            throw new BusinessException(ErrorCode.ACCOUNT_ALREADY_EXISTS);
        }
        return user;
    }

    @Override
    public UserEntity authenticate(LoginRequest request) {
        String username = request.username().toLowerCase(Locale.ROOT);
        try {
            authenticationManager.authenticate(
                    UsernamePasswordAuthenticationToken.unauthenticated(username, request.password()));
        } catch (AuthenticationException exception) {
            throw new BusinessException(ErrorCode.INVALID_CREDENTIALS);
        }
        UserEntity user = userMapper.findByUsername(username);
        if (user == null || user.getStatus() != UserStatus.ACTIVE) {
            throw new BusinessException(ErrorCode.INVALID_CREDENTIALS);
        }
        return user;
    }
}
