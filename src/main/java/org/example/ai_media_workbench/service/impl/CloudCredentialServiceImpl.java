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

/** 个人/服务端/关闭三种来源隔离；deepseek沿用文字配置槽位，textProvider在密文内区分实际供应商。 */
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
    /** 通过构造器接收 Spring 注入的数据库访问、模型、加密和限流等依赖。 */
    public CloudCredentialServiceImpl(CloudCredentialMapper mapper,UserMapper users,LocalAiClient local,CloudCredentialCipher cipher,
                                      ObjectMapper json,Clock clock,AuthRateLimiter limiter) {
        this.mapper=mapper; this.users=users; this.local=local; this.cipher=cipher; this.json=json; this.clock=clock; this.limiter=limiter;
    }
    /** 查询该用户各项服务的配置状态，不返回密钥；未配置的项目也会返回默认状态。 */
    @Override public List<CloudCredentialVO> list(String userId) {
        active(userId,false); return PROVIDERS.stream().map(provider->view(provider,mapper.find(userId,provider))).toList();
    }
    /**
     * 保存或更新用户的服务来源、模型和凭据：个人配置加密入库，切换为服务端或停用时清空旧密文。
     * 校验账号、格式及版本后写库，返回不含密钥的状态；不调用云端验证权限或余额。
     */
    @Override @Transactional public CloudCredentialVO save(String userId,String provider,SaveCloudCredentialRequest input) {
        provider(provider); active(userId,true); limiter.check("cloud-credentials:user:"+userId,20);
        var old=mapper.find(userId,provider); version(old,input.expectedVersion());
        String encrypted=null;
        if(input.mode()==SaveCloudCredentialRequest.Mode.PERSONAL) {
            if((!provider.equals("tencent") && (input.appId()!=null || input.secretId()!=null || input.secretKey()!=null))
                    || (provider.equals("tencent") && (input.apiKey()!=null || input.workspaceId()!=null || input.model()!=null))
                    || (provider.equals("aliyun") && input.model()!=null) || (!provider.equals("deepseek") && input.textProvider()!=null)) invalid();
            AiProperties previous=old!=null && "PERSONAL".equals(old.getMode()) ? decode(old) : EMPTY;
            var personal=switch(provider) {
                case "tencent" -> new AiProperties(value(input.appId(),previous.tencentAppId()),value(input.secretId(),previous.tencentSecretId()),value(input.secretKey(),previous.tencentSecretKey()),"","","","deepseek-flash");
                case "aliyun" -> new AiProperties("","","",value(input.apiKey(),previous.aliyunApiKey()),value(input.workspaceId(),previous.aliyunWorkspaceId()),"","deepseek-flash");
                default -> textSettings(input, previous);
            };
            if(!ready(personal,provider)) invalid();
            encrypted=cipher.encrypt(userId,provider,json.writeValueAsString(personal),mapper.encryptedCount()==0);
        } else if(input.appId()!=null || input.secretId()!=null || input.secretKey()!=null || input.apiKey()!=null || input.workspaceId()!=null || input.model()!=null || input.textProvider()!=null) invalid();
        var item=old==null ? new CloudCredentialEntity() : old;
        item.setUserId(userId); item.setProvider(provider); item.setMode(input.mode().name()); item.setEncryptedPayload(encrypted);
        item.setVersion(old==null ? 1 : Math.addExact(old.getVersion(),1)); item.setUpdatedAt(LocalDateTime.ofInstant(clock.instant(),ZoneOffset.UTC));
        if(old==null) mapper.insert(item); else if(mapper.update(item)!=1) throw new BusinessException(ErrorCode.CLOUD_CREDENTIALS_CONFLICT);
        return view(provider,item);
    }
    /**
     * 删除个人凭据并停用服务：复用 save 清空密文、将来源设为 OFF 并递增版本。
     * 保留数据库中的停用记录，不物理删行，也不自动切换到服务端模型。
     */
    @Override @Transactional public CloudCredentialVO delete(String userId,String provider,int expectedVersion) {
        return save(userId,provider,new SaveCloudCredentialRequest(expectedVersion,SaveCloudCredentialRequest.Mode.OFF,null,null,null,null,null,null));
    }
    /** 供后端调用云端时读取并解密个人配置；未使用个人来源时返回空配置。 */
    @Override public AiProperties effective(String userId,String provider) {
        provider(provider);
        if(userId==null) return EMPTY;
        active(userId,false); var item=mapper.find(userId,provider);
        if(item==null || "SERVER".equals(item.getMode())) return EMPTY;
        if("OFF".equals(item.getMode())) return EMPTY;
        var settings=decode(item); if(!ready(settings,provider)) throw new BusinessException(ErrorCode.CLOUD_CREDENTIALS_UNAVAILABLE);
        return settings;
    }
    /** 判断服务可用状态：服务端模型检查健康，个人云端仅检查配置完整性，不发云端验证请求。 */
    @Override public boolean available(String userId,String provider) {
        if(source(userId,provider)==SaveCloudCredentialRequest.Mode.SERVER) return provider.equals("deepseek") && local.isAvailable();
        try { return ready(effective(userId,provider),provider); }
        catch(BusinessException failure) {
            if(failure.code()==ErrorCode.CLOUD_CREDENTIALS_UNAVAILABLE) return false;
            throw failure;
        }
    }
    /** 查询服务来源：服务端、个人或停用；没有保存过配置时默认使用服务端来源。 */
    @Override public SaveCloudCredentialRequest.Mode source(String userId,String provider) {
        provider(provider);
        if(userId==null) return SaveCloudCredentialRequest.Mode.SERVER;
        active(userId,false);
        var item=mapper.find(userId,provider);
        return item==null ? SaveCloudCredentialRequest.Mode.SERVER : SaveCloudCredentialRequest.Mode.valueOf(item.getMode());
    }
    /** 汇总当前文字 AI 的来源、供应商、模型及不可用原因，供前端显示。 */
    @Override public org.example.ai_media_workbench.vo.system.TextAiStatusVO textStatus(String userId) {
        if(userId!=null) active(userId,false);
        var item=view("deepseek",userId==null ? null : mapper.find(userId,"deepseek"));
        return new org.example.ai_media_workbench.vo.system.TextAiStatusVO(item.mode(),item.model(),item.available(),item.unavailableReason(),
                "SERVER".equals(item.mode()) ? "local" : item.textProvider());
    }
    /** 将数据库配置转成可返回前端的 VO，只保留允许展示的字段和状态，不包含密钥或密文。 */
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
                "PERSONAL".equals(mode) && (provider.equals("aliyun") || text && "bailian".equals(settings.textProvider())) ? settings.aliyunWorkspaceId() : null,
                text ? localMode ? local.model() : settings.deepseekModel() : null,item==null ? null : item.getUpdatedAt().toInstant(ZoneOffset.UTC),available,reason,
                text && !localMode ? settings.textProvider() : null);
    }
    /** 合并文字 AI 的新旧配置；只有同一供应商可以沿用旧密钥，切换供应商必须重新填写。 */
    private static AiProperties textSettings(SaveCloudCredentialRequest input, AiProperties previous) {
        String selected = input.textProvider() == null ? previous.textProvider() : input.textProvider();
        if (!Set.of("deepseek", "openai", "bailian", "doubao").contains(selected)) invalid();
        // 换供应商必须重新填写密钥；省略字段只允许保留同一供应商的旧凭据。
        boolean same = selected.equals(previous.textProvider());
        String defaultModel = "bailian".equals(selected) ? "qwen-plus" : "deepseek".equals(selected) ? "deepseek-flash" : "";
        String model = value(input.model(), same ? previous.deepseekModel() : defaultModel);
        String workspace = value(input.workspaceId(), same ? previous.aliyunWorkspaceId() : "");
        if (!"bailian".equals(selected) && input.workspaceId() != null) invalid();
        return new AiProperties("", "", "", "", workspace, value(input.apiKey(), same ? previous.deepseekApiKey() : ""), model, selected);
    }
    /** 解密并还原配置对象；密文或主密钥异常时统一报告凭据不可用。 */
    private AiProperties decode(CloudCredentialEntity item) {
        try { return json.readValue(cipher.decrypt(item.getUserId(),item.getProvider(),item.getEncryptedPayload()),AiProperties.class); }
        catch(Exception failure) { throw new BusinessException(ErrorCode.CLOUD_CREDENTIALS_UNAVAILABLE); }
    }
    /** 确认账号存在且启用；写配置时可同时锁定用户记录，避免与注销操作冲突。 */
    private void active(String userId,boolean lock) {
        var user=lock ? users.findByIdForUpdate(userId) : users.findById(userId);
        if(user==null || user.getStatus()!=UserStatus.ACTIVE) throw new BusinessException(ErrorCode.UNAUTHENTICATED);
    }
    /** 未传字段时沿用旧值；传入新内容时去除首尾空白，空字符串不视为未传。 */
    private static String value(String input,String previous) { return input==null ? previous : input.strip(); }
    /** 只允许本系统预定义的服务配置标识。 */
    private static void provider(String provider) { if(!PROVIDERS.contains(provider)) invalid(); }
    /** 按服务类型检查调用所需配置是否完整，不验证云端权限或余额。 */
    private static boolean ready(AiProperties value,String provider) { return switch(provider) { case "tencent" -> value.tencentReady(); case "aliyun" -> value.aliyunReady(); case "deepseek" -> value.textReady(); default -> false; }; }
    /** 核对预期版本号，防止覆盖其他请求刚保存的新配置；首次保存要求版本为 0。 */
    private static void version(CloudCredentialEntity row,int expected) { if((row==null ? 0 : row.getVersion())!=expected) throw new BusinessException(ErrorCode.CLOUD_CREDENTIALS_CONFLICT); }
    /** 将不合法的配置输入统一转换为参数错误。 */
    private static void invalid() { throw new BusinessException(ErrorCode.INVALID_PARAMETERS); }
}
