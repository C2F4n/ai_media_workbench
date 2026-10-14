package org.example.ai_media_workbench.vo.user;

import org.example.ai_media_workbench.entity.UserEntity;
import java.time.Instant;
import java.time.ZoneOffset;

public record UserVO(String id, String username, String displayName, String email,
                     boolean emailVerified, Instant createdAt, Instant updatedAt, String requestId) {
    public static UserVO from(UserEntity user, String requestId) {
        return new UserVO(user.getId(), user.getUsername(), user.getDisplayName(), user.getEmail(),
                user.isEmailVerified(), user.getCreatedAt().toInstant(ZoneOffset.UTC),
                user.getUpdatedAt().toInstant(ZoneOffset.UTC), requestId);
    }
}
