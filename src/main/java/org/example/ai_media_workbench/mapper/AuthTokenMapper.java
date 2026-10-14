package org.example.ai_media_workbench.mapper;

import org.example.ai_media_workbench.entity.AuthTokenEntity;
import java.time.LocalDateTime;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface AuthTokenMapper {
    void insert(AuthTokenEntity token);
    AuthTokenEntity findByHash(String tokenHash);
    int consume(@Param("id") String id, @Param("consumedAt") LocalDateTime consumedAt);
    int revokeAll(@Param("userId") String userId, @Param("consumedAt") LocalDateTime consumedAt);
}
