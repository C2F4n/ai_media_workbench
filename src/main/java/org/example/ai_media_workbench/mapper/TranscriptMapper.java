package org.example.ai_media_workbench.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.example.ai_media_workbench.entity.TranscriptEntity;
import org.example.ai_media_workbench.entity.TranscriptRevisionEntity;
import org.example.ai_media_workbench.entity.TaskEntity;
import org.example.ai_media_workbench.vo.transcript.TranscriptReference;

@Mapper
public interface TranscriptMapper {
    TranscriptEntity latest(@Param("userId") String userId, @Param("mediaId") String mediaId);
    TranscriptEntity owned(@Param("userId") String userId, @Param("id") String id);
    TranscriptEntity lockOwned(@Param("userId") String userId, @Param("id") String id);
    TranscriptRevisionEntity revision(@Param("userId") String userId, @Param("id") String id, @Param("version") int version);
    TaskEntity active(@Param("userId") String userId, @Param("mediaId") String mediaId);
    void insert(TranscriptEntity entity);
    void insertRevision(TranscriptRevisionEntity entity);
    int update(TranscriptEntity entity);
    TranscriptReference taskTranscript(@Param("userId") String userId, @Param("taskId") String taskId);
}
