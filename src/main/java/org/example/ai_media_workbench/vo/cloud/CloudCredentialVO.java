package org.example.ai_media_workbench.vo.cloud;

import java.time.Instant;

/** 只返回状态和非秘密元信息；不返回密钥、SecretId、密文或掩码后缀。 */
public record CloudCredentialVO(String provider,String mode,int version,boolean configured,boolean personalStored,
                                 String appId,String workspaceId,String model,Instant updatedAt) {}
