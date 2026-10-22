package org.example.ai_media_workbench.service.impl;

import java.time.*;
import java.util.*;
import org.example.ai_media_workbench.common.exception.*;
import org.example.ai_media_workbench.common.security.*;
import org.example.ai_media_workbench.dto.cloud.*;
import org.example.ai_media_workbench.entity.*;
import org.example.ai_media_workbench.mapper.*;
import org.example.ai_media_workbench.properties.AiProperties;
import org.example.ai_media_workbench.service.CloudCredentialService;
import org.example.ai_media_workbench.vo.cloud.CloudCredentialVO;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.ObjectMapper;

/** 个人/本地/关闭三种来源明确隔离；SERVER不再使用云端环境凭据，失败不自动回退。 */
@Service
public class CloudCredentialServiceImpl implements CloudCredentialService {
    private static final List<String> PROVIDERS=List.of("tencent","aliyun","deepseek");
    private static final AiProperties EMPTY=new AiProperties("","","","","","","deepseek-flash");
    private final CloudCredentialMapper mapper;
    private final UserMapper users;
    private final LocalAiClient local;
    private final CloudCredentialCipher cipher;
    private final ObjectMapper json;
    private final Clock clock;
    private final AuthRateLimiter limiter;
    public CloudCredentialServiceImpl(CloudCredentialMapper mapper,UserMapper users,LocalAiClient local,CloudCredentialCipher cipher,
                                      ObjectMapper json,Clock clock,AuthRateLimiter limiter) {
        this.mapper=mapper; this.users=users; this.local=local; this.cipher=cipher; this.json=json; this.clock=clock; this.limiter=limiter;
    }
    @Override public List<CloudCredentialVO> list(String userId) {
        active(userId,false); return PROVIDERS.stream().map(provider->view(provider,mapper.find(userId,provider))).toList();
    }
    @Override @Transactional public CloudCredentialVO save(String userId,String provider,SaveCloudCredentialRequest input) {
        provider(provider); active(userId,true); limiter.check("cloud-credentials:user:"+userId,20);
        var old=mapper.find(userId,provider); version(old,input.expectedVersion());
        String encrypted=null;
        if(input.mode()==SaveCloudCredentialRequest.Mode.PERSONAL) {
            if((!provider.equals("tencent") && (input.appId()!=null || input.secretId()!=null || input.secretKey()!=null))
                    || (provider.equals("tencent") && (input.apiKey()!=null || input.workspaceId()!=null || input.model()!=null))
                    || (provider.equals("aliyun") && input.model()!=null) || (provider.equals("deepseek") && input.workspaceId()!=null)) invalid();
            AiProperties previous=old!=null && "PERSONAL".equals(old.getMode()) ? decode(old) : EMPTY;
            var personal=switch(provider) {
                case "tencent" -> new AiProperties(value(input.appId(),previous.tencentAppId()),value(input.secretId(),previous.tencentSecretId()),value(input.secretKey(),previous.tencentSecretKey()),"","","","deepseek-flash");
                case "aliyun" -> new AiProperties("","","",value(input.apiKey(),previous.aliyunApiKey()),value(input.workspaceId(),previous.aliyunWorkspaceId()),"","deepseek-flash");
                default -> new AiProperties("","","","","",value(input.apiKey(),previous.deepseekApiKey()),value(input.model(),previous.deepseekModel()));
            };
            if(!ready(personal,provider)) invalid();
            encrypted=cipher.encrypt(userId,provider,json.writeValueAsString(personal),mapper.encryptedCount()==0);
        } else if(input.appId()!=null || input.secretId()!=null || input.secretKey()!=null || input.apiKey()!=null || input.workspaceId()!=null || input.model()!=null) invalid();
        var item=old==null ? new CloudCredentialEntity() : old;
        item.setUserId(userId); item.setProvider(provider); item.setMode(input.mode().name()); item.setEncryptedPayload(encrypted);
        item.setVersion(old==null ? 1 : Math.addExact(old.getVersion(),1)); item.setUpdatedAt(LocalDateTime.ofInstant(clock.instant(),ZoneOffset.UTC));
        if(old==null) mapper.insert(item); else if(mapper.update(item)!=1) throw new BusinessException(ErrorCode.CLOUD_CREDENTIALS_CONFLICT);
        return view(provider,item);
    }
    @Override @Transactional public CloudCredentialVO delete(String userId,String provider,int expectedVersion) {
        return save(userId,provider,new SaveCloudCredentialRequest(expectedVersion,SaveCloudCredentialRequest.Mode.OFF,null,null,null,null,null,null));
    }
    @Override public AiProperties effective(String userId,String provider) {
        provider(provider);
        if(userId==null) return EMPTY;
        active(userId,false); var item=mapper.find(userId,provider);
        if(item==null || "SERVER".equals(item.getMode())) return EMPTY;
        if("OFF".equals(item.getMode())) return EMPTY;
        var settings=decode(item); if(!ready(settings,provider)) throw new BusinessException(ErrorCode.CLOUD_CREDENTIALS_UNAVAILABLE);
        return settings;
    }
    @Override public boolean available(String userId,String provider) {
        if(source(userId,provider)==SaveCloudCredentialRequest.Mode.SERVER) return provider.equals("deepseek") && local.isAvailable();
        try { return ready(effective(userId,provider),provider); }
        catch(BusinessException failure) {
            if(failure.code()==ErrorCode.CLOUD_CREDENTIALS_UNAVAILABLE) return false;
            throw failure;
        }
    }
    @Override public SaveCloudCredentialRequest.Mode source(String userId,String provider) {
        provider(provider);
        if(userId==null) return SaveCloudCredentialRequest.Mode.SERVER;
        active(userId,false);
        var item=mapper.find(userId,provider);
        return item==null ? SaveCloudCredentialRequest.Mode.SERVER : SaveCloudCredentialRequest.Mode.valueOf(item.getMode());
    }
    @Override public org.example.ai_media_workbench.vo.system.TextAiStatusVO textStatus(String userId) {
        if(userId!=null) active(userId,false);
        var item=view("deepseek",userId==null ? null : mapper.find(userId,"deepseek"));
        return new org.example.ai_media_workbench.vo.system.TextAiStatusVO(item.mode(),item.model(),item.available(),item.unavailableReason());
    }
    private CloudCredentialVO view(String provider,CloudCredentialEntity item) {
        String mode=item==null ? "SERVER" : item.getMode(); AiProperties settings=EMPTY;
        boolean stored=item!=null && item.getEncryptedPayload()!=null;
        if(stored) try { settings=decode(item); } catch(BusinessException locked) { settings=EMPTY; }
        boolean localMode="SERVER".equals(mode), text=provider.equals("deepseek");
        boolean configured=localMode ? text && local.configured() : !"OFF".equals(mode) && ready(settings,provider);
        boolean available=localMode ? text && local.isAvailable() : configured;
        String reason=available ? null : "OFF".equals(mode) ? "已停用" : localMode
                ? text ? ErrorCode.LOCAL_AI_UNAVAILABLE.message() : "本地模型不支持语音识别，请配置我的凭据"
                : stored ? "个人凭据不可读取，请重新配置" : "个人凭据尚未配置";
        return new CloudCredentialVO(provider,mode,item==null ? 0 : item.getVersion(),configured,stored,
                "PERSONAL".equals(mode) && provider.equals("tencent") ? settings.tencentAppId() : null,
                "PERSONAL".equals(mode) && provider.equals("aliyun") ? settings.aliyunWorkspaceId() : null,
                text ? localMode ? local.model() : settings.deepseekModel() : null,item==null ? null : item.getUpdatedAt().toInstant(ZoneOffset.UTC),available,reason);
    }
    private AiProperties decode(CloudCredentialEntity item) {
        try { return json.readValue(cipher.decrypt(item.getUserId(),item.getProvider(),item.getEncryptedPayload()),AiProperties.class); }
        catch(Exception failure) { throw new BusinessException(ErrorCode.CLOUD_CREDENTIALS_UNAVAILABLE); }
    }
    private void active(String userId,boolean lock) {
        var user=lock ? users.findByIdForUpdate(userId) : users.findById(userId);
        if(user==null || user.getStatus()!=UserStatus.ACTIVE) throw new BusinessException(ErrorCode.UNAUTHENTICATED);
    }
    private static String value(String input,String previous) { return input==null ? previous : input.strip(); }
    private static void provider(String provider) { if(!PROVIDERS.contains(provider)) invalid(); }
    private static boolean ready(AiProperties value,String provider) { return switch(provider) { case "tencent" -> value.tencentReady(); case "aliyun" -> value.aliyunReady(); case "deepseek" -> value.deepseekReady(); default -> false; }; }
    private static void version(CloudCredentialEntity row,int expected) { if((row==null ? 0 : row.getVersion())!=expected) throw new BusinessException(ErrorCode.CLOUD_CREDENTIALS_CONFLICT); }
    private static void invalid() { throw new BusinessException(ErrorCode.INVALID_PARAMETERS); }
}
