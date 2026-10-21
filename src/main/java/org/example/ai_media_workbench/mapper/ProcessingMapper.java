package org.example.ai_media_workbench.mapper;

import java.time.LocalDateTime;
import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.example.ai_media_workbench.entity.OperationPlanEntity;
import org.example.ai_media_workbench.entity.TaskEntity;
import org.example.ai_media_workbench.entity.OutputEntity;

@Mapper
public interface ProcessingMapper {
    void insertPlan(OperationPlanEntity plan);
    OperationPlanEntity plan(@Param("userId") String userId, @Param("id") String id);
    OperationPlanEntity lockPlan(@Param("userId") String userId, @Param("id") String id);
    int updatePlan(OperationPlanEntity plan);
    List<OperationPlanEntity> plans(@Param("userId") String userId, @Param("mediaId") String mediaId,
                                   @Param("offset") long offset, @Param("limit") int limit);
    long countPlans(@Param("userId") String userId, @Param("mediaId") String mediaId);
    int lockQueue();
    long activeCount();
    void insertTask(TaskEntity task);
    TaskEntity task(@Param("userId") String userId, @Param("id") String id);
    TaskEntity lockTask(@Param("userId") String userId, @Param("id") String id);
    TaskEntity taskForPlan(@Param("userId") String userId, @Param("planId") String planId);
    List<TaskEntity> tasks(@Param("userId") String userId, @Param("mediaId") String mediaId,
                           @Param("offset") long offset, @Param("limit") int limit);
    long countTasks(@Param("userId") String userId, @Param("mediaId") String mediaId);
    int cancel(@Param("userId") String userId, @Param("id") String id, @Param("now") LocalDateTime now);
    List<TaskEntity> pending();
    int claim(@Param("id") String id, @Param("token") String token, @Param("now") LocalDateTime now);
    int running(@Param("id") String id, @Param("token") String token);
    int verifying(@Param("id") String id, @Param("token") String token);
    List<TaskEntity> expired(@Param("cutoff") LocalDateTime cutoff);
    int expire(@Param("id") String id, @Param("cutoff") LocalDateTime cutoff, @Param("now") LocalDateTime now);
    int finish(@Param("task") TaskEntity task, @Param("cutoff") LocalDateTime cutoff);
    void insertOutput(OutputEntity output);
    OutputEntity output(@Param("userId") String userId, @Param("id") String id);
    /** 删除专用查询，包含已逻辑删除记录，不要求磁盘文件仍存在。 */
    OutputEntity lockOutputIncludingDeleted(@Param("userId") String userId, @Param("id") String id);
    void markOutputDeleted(@Param("userId") String userId, @Param("id") String id, @Param("now") LocalDateTime now);
    List<OutputEntity> taskOutputs(@Param("userId") String userId, @Param("taskId") String taskId);
    List<OutputEntity> outputs(@Param("userId") String userId, @Param("mediaId") String mediaId,
                               @Param("offset") long offset, @Param("limit") int limit);
    long countOutputs(@Param("userId") String userId, @Param("mediaId") String mediaId);
}
