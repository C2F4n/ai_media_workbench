package org.example.ai_media_workbench.service;

import java.util.List;
import org.example.ai_media_workbench.dto.cloud.*;
import org.example.ai_media_workbench.vo.cloud.CloudCredentialVO;
import org.example.ai_media_workbench.properties.AiProperties;

public interface CloudCredentialService {
    List<CloudCredentialVO> list(String userId);
    CloudCredentialVO save(String userId,String provider,SaveCloudCredentialRequest input);
    CloudCredentialVO delete(String userId,String provider,int expectedVersion);
    /** 仅PERSONAL返回可调用云端的凭据；SERVER/OFF返回空配置，业务调用必须显式提供账号。 */
    AiProperties effective(String userId,String provider);
    boolean available(String userId,String provider);
    SaveCloudCredentialRequest.Mode source(String userId,String provider);
    org.example.ai_media_workbench.vo.system.TextAiStatusVO textStatus(String userId);
}
