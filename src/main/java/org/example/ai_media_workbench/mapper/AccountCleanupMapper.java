package org.example.ai_media_workbench.mapper;

import org.example.ai_media_workbench.entity.AccountCleanupJobEntity;
import java.time.LocalDateTime;
import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface AccountCleanupMapper {
    /** 清理迁移前历史项目的归档元数据，新业务不创建项目。 */
    void markLegacyProjectsDeleted(@Param("userId") String userId, @Param("now") LocalDateTime now);
    /** 逻辑删除本人素材。 */
    void markMediaDeleted(@Param("userId") String userId, @Param("now") LocalDateTime now);
    /** 逻辑删除本人操作方案。 */
    void markPlansDeleted(@Param("userId") String userId, @Param("now") LocalDateTime now);
    /** 逻辑删除用户任务，并将未完成任务标记为取消。 */
    void markTasksDeleted(@Param("userId") String userId, @Param("now") LocalDateTime now);
    /** 逻辑删除用户的输出文件记录。 */
    void markOutputsDeleted(@Param("userId") String userId, @Param("now") LocalDateTime now);
    /** 保存文件清理任务。 */
    void insertJob(AccountCleanupJobEntity job);
    /** 查询当前可执行且未超过重试次数的清理任务。 */
    List<AccountCleanupJobEntity> findPending(LocalDateTime now);
    /** 抢占清理任务并增加尝试次数，返回受影响行数。 */
    int claim(@Param("id") String id, @Param("now") LocalDateTime now);
    /** 将执行超时的清理任务恢复为可重试状态。 */
    int recoverExpired(@Param("cutoff") LocalDateTime cutoff, @Param("now") LocalDateTime now);
    /** 检查用户是否已注销，已注销返回 1，否则返回 0。 */
    int isDeletedAccount(String userId);
    /** 查询用户所属媒体和输出文件的存储键。 */
    List<String> findStorageKeys(String userId);
    /** 将清理任务标记为完成。 */
    void complete(@Param("id") String id, @Param("now") LocalDateTime now);
    /** 记录清理失败并设置下次重试时间。 */
    void fail(@Param("id") String id, @Param("now") LocalDateTime now,
              @Param("retryAt") LocalDateTime retryAt);
}
