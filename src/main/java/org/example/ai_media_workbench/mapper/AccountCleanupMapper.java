package org.example.ai_media_workbench.mapper;

import org.example.ai_media_workbench.entity.AccountCleanupJobEntity;
import java.time.LocalDateTime;
import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface AccountCleanupMapper {
    void markWorkspaceDeleted(@Param("userId") String userId, @Param("now") LocalDateTime now);
    void markMediaDeleted(@Param("userId") String userId, @Param("now") LocalDateTime now);
    void markPlansDeleted(@Param("userId") String userId, @Param("now") LocalDateTime now);
    void markTasksDeleted(@Param("userId") String userId, @Param("now") LocalDateTime now);
    void markOutputsDeleted(@Param("userId") String userId, @Param("now") LocalDateTime now);
    void insertJob(AccountCleanupJobEntity job);
    List<AccountCleanupJobEntity> findPending(LocalDateTime now);
    int claim(@Param("id") String id, @Param("now") LocalDateTime now);
    int recoverExpired(@Param("cutoff") LocalDateTime cutoff, @Param("now") LocalDateTime now);
    int isDeletedAccount(String userId);
    List<String> findStorageKeys(String userId);
    void complete(@Param("id") String id, @Param("now") LocalDateTime now);
    void fail(@Param("id") String id, @Param("now") LocalDateTime now,
              @Param("retryAt") LocalDateTime retryAt);
}
