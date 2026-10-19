package org.example.ai_media_workbench.mapper;

import java.time.LocalDateTime;
import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.example.ai_media_workbench.entity.MediaEntity;

@Mapper
public interface MediaMapper {
    void insert(MediaEntity media);
    MediaEntity findOwned(@Param("userId") String userId, @Param("id") String id);
    /** 删除专用：包含已删除记录，以便重复请求幂等成功。 */
    MediaEntity lockOwnedIncludingDeleted(@Param("userId") String userId, @Param("id") String id);
    void markDeleted(@Param("userId") String userId, @Param("id") String id, @Param("now") LocalDateTime now);
    void markPlansDeleted(@Param("userId") String userId, @Param("id") String id, @Param("now") LocalDateTime now);
    void markTasksDeleted(@Param("userId") String userId, @Param("id") String id, @Param("now") LocalDateTime now);
    void markOutputsDeleted(@Param("userId") String userId, @Param("id") String id, @Param("now") LocalDateTime now);
    List<MediaEntity> listOwned(@Param("userId") String userId, @Param("offset") long offset, @Param("limit") int limit);
    long countOwned(String userId);
    int retry(@Param("userId") String userId, @Param("id") String id, @Param("now") LocalDateTime now);
    List<MediaEntity> findPending(@Param("cutoff") LocalDateTime cutoff);
    int claim(@Param("id") String id, @Param("token") String token, @Param("cutoff") LocalDateTime cutoff,
              @Param("now") LocalDateTime now);
    int complete(MediaEntity media);
}
