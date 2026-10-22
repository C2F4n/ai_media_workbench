package org.example.ai_media_workbench.vo.cloud;

import java.time.Instant;

/** 本地available来自健康检查；个人云端仅声明配置就绪。不返回密钥、SecretId或密文。 */
public record CloudCredentialVO(String provider,String mode,int version,boolean configured,boolean personalStored,
                                 String appId,String workspaceId,String model,Instant updatedAt,
                                 boolean available,String unavailableReason) {}
