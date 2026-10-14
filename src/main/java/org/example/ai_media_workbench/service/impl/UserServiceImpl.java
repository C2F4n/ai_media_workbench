package org.example.ai_media_workbench.service.impl;

import org.example.ai_media_workbench.common.error.BusinessException;
import org.example.ai_media_workbench.common.error.ErrorCode;
import org.example.ai_media_workbench.dto.user.ChangePasswordRequest;
import org.example.ai_media_workbench.dto.user.UpdateUserRequest;
import org.example.ai_media_workbench.dto.user.DeleteUserRequest;
import org.example.ai_media_workbench.entity.UserEntity;
import org.example.ai_media_workbench.entity.UserStatus;
import org.example.ai_media_workbench.mapper.AuthTokenMapper;
import org.example.ai_media_workbench.mapper.UserMapper;
import org.example.ai_media_workbench.mapper.AccountCleanupMapper;
import org.example.ai_media_workbench.service.AccountCleanupService;
import org.example.ai_media_workbench.service.SessionService;
import org.example.ai_media_workbench.service.UserService;
import java.time.Clock;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Locale;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserServiceImpl implements UserService {
    private final UserMapper userMapper;
    private final AuthTokenMapper tokenMapper;
    private final PasswordEncoder passwordEncoder;
    private final SessionService sessionService;
    private final Clock clock;
    private final AccountCleanupMapper cleanupMapper;
    private final AccountCleanupService cleanupService;

    public UserServiceImpl(UserMapper userMapper, AuthTokenMapper tokenMapper,
                           PasswordEncoder passwordEncoder, SessionService sessionService, Clock clock,
                           AccountCleanupMapper cleanupMapper, AccountCleanupService cleanupService) {
        this.userMapper = userMapper;
        this.tokenMapper = tokenMapper;
        this.passwordEncoder = passwordEncoder;
        this.sessionService = sessionService;
        this.clock = clock;
        this.cleanupMapper = cleanupMapper;
        this.cleanupService = cleanupService;
    }

    @Override
    public UserEntity getActiveUser(String userId) {
        UserEntity user = userMapper.findById(userId);
        if (user == null || user.getStatus() != UserStatus.ACTIVE) {
            throw new BusinessException(ErrorCode.UNAUTHENTICATED);
        }
        return user;
    }

    @Override
    @Transactional
    public UserEntity updateProfile(String userId, UpdateUserRequest request) {
        String name = request.displayName().strip();
        if (name.isEmpty()) {
            throw new BusinessException(ErrorCode.INVALID_PARAMETERS);
        }
        if (userMapper.updateDisplayName(userId, name, now()) != 1) {
            throw new BusinessException(ErrorCode.UNAUTHENTICATED);
        }
        return getActiveUser(userId);
    }

    @Override
    @Transactional
    public void changePassword(String userId, ChangePasswordRequest request) {
        UserEntity user = getActiveUser(userId);
        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            throw new BusinessException(ErrorCode.CURRENT_PASSWORD_INVALID);
        }
        PasswordPolicy.check(request.newPassword());
        if (passwordEncoder.matches(request.newPassword(), user.getPasswordHash())) {
            throw new BusinessException(ErrorCode.PASSWORD_UNCHANGED);
        }
        if (userMapper.updatePassword(userId, passwordEncoder.encode(request.newPassword()), now()) != 1) {
            throw new BusinessException(ErrorCode.UNAUTHENTICATED);
        }
        tokenMapper.revokeAll(userId, now());
        sessionService.revokeAll(userId);
    }

    private LocalDateTime now() {
        return LocalDateTime.ofInstant(clock.instant(), ZoneOffset.UTC);
    }

    @Override
    @Transactional
    public void deleteAccount(String userId, DeleteUserRequest request) {
        UserEntity user = userMapper.findByIdForUpdate(userId);
        if (user == null || user.getStatus() != UserStatus.ACTIVE) {
            throw new BusinessException(ErrorCode.UNAUTHENTICATED);
        }
        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            throw new BusinessException(ErrorCode.CURRENT_PASSWORD_INVALID);
        }
        if (!user.getUsername().equals(request.confirmUsername().toLowerCase(Locale.ROOT))) {
            throw new BusinessException(ErrorCode.INVALID_PARAMETERS);
        }
        LocalDateTime timestamp = now();
        cleanupMapper.markTasksDeleted(userId, timestamp);
        cleanupMapper.markOutputsDeleted(userId, timestamp);
        cleanupMapper.markPlansDeleted(userId, timestamp);
        cleanupMapper.markMediaDeleted(userId, timestamp);
        cleanupMapper.markWorkspaceDeleted(userId, timestamp);
        if (userMapper.deleteAccount(userId, timestamp) != 1) {
            throw new BusinessException(ErrorCode.UNAUTHENTICATED);
        }
        tokenMapper.revokeAll(userId, timestamp);
        cleanupService.enqueue(userId);
        sessionService.revokeAll(userId);
    }
}
