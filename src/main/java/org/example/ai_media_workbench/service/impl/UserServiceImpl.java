package org.example.ai_media_workbench.service.impl;

import org.example.ai_media_workbench.common.exception.BusinessException;
import org.example.ai_media_workbench.common.exception.ErrorCode;
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

/** 账号资料、改密和注销业务；事务将同一次操作涉及的数据库修改作为一个整体提交或回滚。 */
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

    /** 查询有效用户，账号不可用时抛出未登录异常。 */
    @Override
    public UserEntity getActiveUser(String userId) {
        UserEntity user = userMapper.findById(userId);
        if (user == null || user.getStatus() != UserStatus.ACTIVE) {
            throw new BusinessException(ErrorCode.UNAUTHENTICATED);
        }
        return user;
    }

    /** 修改昵称并返回更新后的用户资料。 */
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

    /** 核验旧密码、保存新密码哈希，并撤销所有登录会话和业务令牌。 */
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
        // auth_token 用于邮箱验证/重置密码等业务，不是登录会话；改密时两类凭证都需作废。
        tokenMapper.revokeAll(userId, now());
        sessionService.revokeAll(userId);
    }

    /** 获取当前 UTC 时间，用于记录数据库更新时间。 */
    private LocalDateTime now() {
        return LocalDateTime.ofInstant(clock.instant(), ZoneOffset.UTC);
    }

    /** 核验注销信息，逻辑删除账号及资源、撤销凭证，并创建文件清理任务。 */
    @Override
    @Transactional
    public void deleteAccount(String userId, DeleteUserRequest request) {
        // 行锁配合事务，防止并发注销重复修改账号及创建清理任务。
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
        // 先核验密码和确认用户名，再按账号归属逻辑删除资源、取消未完成任务。
        LocalDateTime timestamp = now();
        cleanupMapper.markTasksDeleted(userId, timestamp);
        cleanupMapper.markOutputsDeleted(userId, timestamp);
        cleanupMapper.markPlansDeleted(userId, timestamp);
        cleanupMapper.markMediaDeleted(userId, timestamp);
        cleanupMapper.markLegacyProjectsDeleted(userId, timestamp);
        if (userMapper.deleteAccount(userId, timestamp) != 1) {
            throw new BusinessException(ErrorCode.UNAUTHENTICATED);
        }
        tokenMapper.revokeAll(userId, timestamp);
        // 文件删除无法随数据库事务回滚：这里只持久化清理任务，由后台提交后处理并支持重试。
        // 账号记录保留，用户名和邮箱仍被占用；逻辑删除不等于物理删掉数据库行。
        cleanupService.enqueue(userId);
        sessionService.revokeAll(userId);
    }
}
