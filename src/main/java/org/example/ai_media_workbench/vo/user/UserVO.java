package org.example.ai_media_workbench.vo.user;

import org.example.ai_media_workbench.entity.UserEntity;
import java.time.Instant;
import java.time.ZoneOffset;

/** Result.data 中的账号资料：不含敏感字段，日期转换为 UTC Instant，requestId 统一放在外层。 */
public record UserVO(String id, String username, String displayName, String email,
                     boolean emailVerified, Instant createdAt, Instant updatedAt) {
    /** 将数据库用户记录转换为不含敏感字段的响应资料。 */
    public static UserVO from(UserEntity user) {
        return new UserVO(user.getId(), user.getUsername(), user.getDisplayName(), user.getEmail(),
                user.isEmailVerified(), user.getCreatedAt().toInstant(ZoneOffset.UTC),
                user.getUpdatedAt().toInstant(ZoneOffset.UTC));
    }
}
