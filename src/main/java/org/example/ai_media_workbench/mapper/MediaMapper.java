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
    List<MediaEntity> listOwned(@Param("userId") String userId, @Param("offset") long offset, @Param("limit") int limit);
    long countOwned(String userId);
    int retry(@Param("userId") String userId, @Param("id") String id, @Param("now") LocalDateTime now);
    List<MediaEntity> findPending(@Param("cutoff") LocalDateTime cutoff);
    int claim(@Param("id") String id, @Param("token") String token, @Param("cutoff") LocalDateTime cutoff,
              @Param("now") LocalDateTime now);
    int complete(MediaEntity media);
}
