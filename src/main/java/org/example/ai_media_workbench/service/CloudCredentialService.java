package org.example.ai_media_workbench.service;

import java.util.List;
import org.example.ai_media_workbench.dto.cloud.*;
import org.example.ai_media_workbench.vo.cloud.CloudCredentialVO;
import org.example.ai_media_workbench.properties.AiProperties;

public interface CloudCredentialService {
    List<CloudCredentialVO> list(String userId);
    CloudCredentialVO save(String userId,String provider,SaveCloudCredentialRequest input);
    CloudCredentialVO delete(String userId,String provider,int expectedVersion);
    /** userId=null仅用于匿名能力查询或协议测试，业务调用必须显式提供账号。 */
    AiProperties effective(String userId,String provider);
    boolean available(String userId,String provider);
}
