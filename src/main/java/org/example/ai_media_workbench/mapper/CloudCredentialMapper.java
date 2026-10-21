package org.example.ai_media_workbench.mapper;

import org.apache.ibatis.annotations.*;
import org.example.ai_media_workbench.entity.CloudCredentialEntity;

@Mapper
public interface CloudCredentialMapper {
    CloudCredentialEntity find(@Param("userId") String userId,@Param("provider") String provider);
    void insert(CloudCredentialEntity item);
    int update(CloudCredentialEntity item);
    void deleteUser(@Param("userId") String userId);
    int encryptedCount();
}
