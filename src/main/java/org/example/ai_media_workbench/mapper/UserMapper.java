package org.example.ai_media_workbench.mapper;

import org.example.ai_media_workbench.entity.UserEntity;
import java.time.LocalDateTime;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface UserMapper {
    UserEntity findById(String id);
    UserEntity findByIdForUpdate(String id);
    UserEntity findByUsername(String username);
    void insert(UserEntity user);
    int updateDisplayName(@Param("id") String id, @Param("displayName") String displayName,
                          @Param("updatedAt") LocalDateTime updatedAt);
    int updatePassword(@Param("id") String id, @Param("passwordHash") String passwordHash,
                       @Param("updatedAt") LocalDateTime updatedAt);
    int deleteAccount(@Param("id") String id, @Param("now") LocalDateTime now);
}
