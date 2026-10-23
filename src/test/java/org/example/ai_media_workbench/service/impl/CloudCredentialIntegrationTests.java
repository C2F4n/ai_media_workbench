package org.example.ai_media_workbench.service.impl;

import jakarta.servlet.http.Cookie;
import java.net.http.HttpRequest;
import java.nio.file.*;
import java.util.*;
import org.example.ai_media_workbench.common.exception.*;
import org.example.ai_media_workbench.dto.cloud.*;
import org.example.ai_media_workbench.dto.user.DeleteUserRequest;
import org.example.ai_media_workbench.mapper.CloudCredentialMapper;
import org.example.ai_media_workbench.service.*;
import org.example.ai_media_workbench.service.impl.CloudTransport;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.*;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.*;
import tools.jackson.databind.*;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties={"spring.datasource.url=jdbc:h2:mem:cloud_credential_tests;MODE=MySQL;DB_CLOSE_DELAY=-1;DATABASE_TO_LOWER=TRUE",
        "app.ai.deepseek-api-key=sk-site-tests"})
@AutoConfigureMockMvc @ActiveProfiles("test")
class CloudCredentialIntegrationTests {
    @TempDir static Path root;
    @DynamicPropertySource static void properties(DynamicPropertyRegistry registry) { registry.add("app.cloud-credentials.key-file",()->root.resolve("private/key").toString()); }
    @Autowired MockMvc mvc; @Autowired ObjectMapper json; @Autowired JdbcTemplate jdbc; @Autowired PasswordEncoder passwords;
    @Autowired CloudCredentialService credentials; @Autowired CloudCredentialMapper mapper; @Autowired SubtitleCorrector corrector; @Autowired UserService users;
    @Autowired SpeechRecognizer recognizer;
    @Autowired org.example.ai_media_workbench.common.security.CloudCredentialCipher cipher;
    @MockitoBean CloudTransport transport;
    @MockitoBean LocalAiClient local;
    private static final String PASSWORD="Testing-2026!";
    @BeforeEach void response() {
        when(transport.post(any(),anyLong(),any(),any())).thenReturn(json.writeValueAsBytes(Map.of("choices",List.of(Map.of("finish_reason","stop","message",Map.of("content","{\"text\":\"原文\"}"))))));
    }
    @Test void openaiAndBailianSelectionsAreEncryptedRoutedAndReportedWithoutExposingSecrets() throws Exception {
        var owner=login();
        save(owner,"deepseek",Map.of("expectedVersion",0,"mode","PERSONAL","textProvider","openai","apiKey","sk-openai-personal","model","gpt-model-tests"));
        mvc.perform(get("/api/system/capabilities").cookie(owner.cookie)).andExpect(jsonPath("data.textAi.provider").value("openai"))
                .andExpect(jsonPath("data.textAi.model").value("gpt-model-tests")).andExpect(jsonPath("data.subtitleTranslation").value(true));
        assertThat(corrector.correct("原文",owner.id)).isEqualTo("原文");
        save(owner,"deepseek",Map.of("expectedVersion",1,"mode","PERSONAL","textProvider","bailian","apiKey","sk-bailian-personal","model","qwen-plus","workspaceId","workspace-tests"));
        assertThat(corrector.correct("原文",owner.id)).isEqualTo("原文");
        var requests=org.mockito.ArgumentCaptor.forClass(HttpRequest.class); verify(transport,times(2)).post(requests.capture(),anyLong(),any(),any());
        assertThat(requests.getAllValues().get(0).uri().getHost()).isEqualTo("api.openai.com");
        assertThat(requests.getAllValues().get(0).headers().firstValue("Authorization")).contains("Bearer sk-openai-personal");
        assertThat(requests.getAllValues().get(1).uri().getHost()).isEqualTo("workspace-tests.cn-beijing.maas.aliyuncs.com");
        assertThat(requests.getAllValues().get(1).headers().firstValue("Authorization")).contains("Bearer sk-bailian-personal");
        var response=mvc.perform(get("/api/users/me/cloud-credentials").cookie(owner.cookie)).andExpect(jsonPath("data[2].textProvider").value("bailian"))
                .andExpect(jsonPath("data[2].workspaceId").value("workspace-tests")).andReturn();
        assertThat(response.getResponse().getContentAsString()).doesNotContain("sk-openai-personal","sk-bailian-personal","encryptedPayload");
        assertThat(mapper.find(owner.id,"deepseek").getEncryptedPayload()).doesNotContain("sk-bailian-personal","qwen-plus");
        assertThat(recognizer.providers(owner.id)).isEmpty();
    }

    @Test void doubaoRequiresAnExplicitModelEncryptsItsKeyAndRoutesOnlyToArk() throws Exception {
        var owner=login();
        save(owner,"deepseek",Map.of("expectedVersion",0,"mode","PERSONAL","textProvider","bailian","apiKey","sk-qwen-before-switch","workspaceId","old-workspace"));
        for(var input:List.of(
                Map.of("expectedVersion",1,"mode","PERSONAL","textProvider","doubao","model","ep-tests"),
                Map.of("expectedVersion",1,"mode","PERSONAL","textProvider","doubao","apiKey","ark-personal-tests"),
                Map.of("expectedVersion",1,"mode","PERSONAL","textProvider","doubao","apiKey","ark-personal-tests","model","ep-tests","workspaceId","wrong-provider"))) {
            mvc.perform(put("/api/users/me/cloud-credentials/deepseek").cookie(owner.cookie).header("X-CSRF-Token",owner.csrf).contentType(MediaType.APPLICATION_JSON)
                    .content(json.writeValueAsBytes(input))).andExpect(status().isUnprocessableEntity());
        }
        assertThat(credentials.effective(owner.id,"deepseek").textProvider()).isEqualTo("bailian");
        verifyNoInteractions(transport);
        save(owner,"deepseek",Map.of("expectedVersion",1,"mode","PERSONAL","textProvider","doubao","apiKey","ark-personal-tests","model","ep-tests"));
        mvc.perform(get("/api/system/capabilities").cookie(owner.cookie)).andExpect(jsonPath("data.textAi.provider").value("doubao"))
                .andExpect(jsonPath("data.textAi.model").value("ep-tests")).andExpect(jsonPath("data.textAi.available").value(true));
        assertThat(corrector.correct("原文",owner.id)).isEqualTo("原文");
        save(owner,"deepseek",Map.of("expectedVersion",2,"mode","PERSONAL","model","doubao-model-tests"));
        assertThat(credentials.effective(owner.id,"deepseek").deepseekApiKey()).isEqualTo("ark-personal-tests");
        assertThat(corrector.correct("原文",owner.id)).isEqualTo("原文");
        var requests=org.mockito.ArgumentCaptor.forClass(HttpRequest.class); verify(transport,times(2)).post(requests.capture(),anyLong(),any(),any());
        for(var request:requests.getAllValues()) {
            assertThat(request.uri().toString()).isEqualTo("https://ark.cn-beijing.volces.com/api/v3/chat/completions");
            assertThat(request.headers().firstValue("Authorization")).contains("Bearer ark-personal-tests");
        }
        var response=mvc.perform(get("/api/users/me/cloud-credentials").cookie(owner.cookie)).andExpect(jsonPath("data[2].textProvider").value("doubao"))
                .andExpect(jsonPath("data[2].workspaceId").isEmpty()).andReturn();
        assertThat(response.getResponse().getContentAsString()).doesNotContain("ark-personal-tests","sk-qwen-before-switch","encryptedPayload");
        assertThat(mapper.find(owner.id,"deepseek").getEncryptedPayload()).doesNotContain("ark-personal-tests","doubao-model-tests");
        assertThat(recognizer.providers(owner.id)).isEmpty();
    }

    @Test void switchingTextVendorsRequiresAFreshKeyButSameVendorUpdatesKeepOmittedFields() throws Exception {
        var owner=login(); save(owner,"deepseek",Map.of("expectedVersion",0,"mode","PERSONAL","apiKey","sk-old-deepseek","model","deepseek-flash"));
        mvc.perform(put("/api/users/me/cloud-credentials/deepseek").cookie(owner.cookie).header("X-CSRF-Token",owner.csrf).contentType(MediaType.APPLICATION_JSON)
                .content(json.writeValueAsBytes(Map.of("expectedVersion",1,"mode","PERSONAL","textProvider","openai","model","gpt-test"))))
                .andExpect(status().isUnprocessableEntity());
        assertThat(credentials.effective(owner.id,"deepseek").textProvider()).isEqualTo("deepseek");
        save(owner,"deepseek",Map.of("expectedVersion",1,"mode","PERSONAL","textProvider","openai","apiKey","sk-new-openai","model","gpt-test"));
        save(owner,"deepseek",Map.of("expectedVersion",2,"mode","PERSONAL","model","gpt-test-updated"));
        var settings=credentials.effective(owner.id,"deepseek"); assertThat(settings.textProvider()).isEqualTo("openai");
        assertThat(settings.deepseekApiKey()).isEqualTo("sk-new-openai"); assertThat(settings.deepseekModel()).isEqualTo("gpt-test-updated");
        mvc.perform(put("/api/users/me/cloud-credentials/deepseek").cookie(owner.cookie).header("X-CSRF-Token",owner.csrf).contentType(MediaType.APPLICATION_JSON)
                .content(json.writeValueAsBytes(Map.of("expectedVersion",3,"mode","PERSONAL","textProvider","bailian","model","qwen-plus"))))
                .andExpect(status().isUnprocessableEntity());
        assertThat(credentials.effective(owner.id,"deepseek").textProvider()).isEqualTo("openai"); verifyNoInteractions(transport);
    }

    @Test void legacyEncryptedDeepseekRowsWithoutAVendorFieldRemainReadable() throws Exception {
        var owner=login(); save(owner,"deepseek",Map.of("expectedVersion",0,"mode","PERSONAL","apiKey","sk-legacy-deepseek","model","deepseek-flash"));
        var old=Map.of("tencentAppId","","tencentSecretId","","tencentSecretKey","","aliyunApiKey","","aliyunWorkspaceId","","deepseekApiKey","sk-legacy-deepseek","deepseekModel","deepseek-flash");
        String encrypted=cipher.encrypt(owner.id,"deepseek",json.writeValueAsString(old),false);
        jdbc.update("UPDATE cloud_credential SET encrypted_payload=? WHERE user_id=? AND provider='deepseek'",encrypted,owner.id);
        assertThat(credentials.effective(owner.id,"deepseek").textProvider()).isEqualTo("deepseek");
        assertThat(corrector.correct("原文",owner.id)).isEqualTo("原文");
        save(owner,"deepseek",Map.of("expectedVersion",1,"mode","PERSONAL","model","deepseek-v4-pro"));
        assertThat(credentials.effective(owner.id,"deepseek").deepseekApiKey()).isEqualTo("sk-legacy-deepseek");
    }

    @Test void vendorWhitelistWorkspaceValidationAndProviderSpecificFieldsCannotBeBypassed() throws Exception {
        var owner=login();
        for(var input:List.of(
                Map.of("expectedVersion",0,"mode","PERSONAL","textProvider","proxy","apiKey","sk-test","model","m"),
                Map.of("expectedVersion",0,"mode","PERSONAL","textProvider","bailian","apiKey","sk-test","model","qwen-plus","workspaceId","evil.example"),
                Map.of("expectedVersion",0,"mode","PERSONAL","textProvider","openai","apiKey","sk-test","model","gpt-test","workspaceId","wrong-provider"),
                Map.of("expectedVersion",0,"mode","SERVER","textProvider","openai"))) {
            mvc.perform(put("/api/users/me/cloud-credentials/deepseek").cookie(owner.cookie).header("X-CSRF-Token",owner.csrf).contentType(MediaType.APPLICATION_JSON)
                    .content(json.writeValueAsBytes(input))).andExpect(status().isUnprocessableEntity());
        }
        mvc.perform(put("/api/users/me/cloud-credentials/aliyun").cookie(owner.cookie).header("X-CSRF-Token",owner.csrf).contentType(MediaType.APPLICATION_JSON)
                .content(json.writeValueAsBytes(Map.of("expectedVersion",0,"mode","PERSONAL","apiKey","sk-test","textProvider","bailian"))))
                .andExpect(status().isUnprocessableEntity());
        assertThat(mapper.find(owner.id,"deepseek")).isNull(); verifyNoInteractions(transport);
    }

    @Test void endpointsEncryptAllProvidersAndNeverReturnSecretsOrCiphertexts() throws Exception {
        var owner=login();
        save(owner,"tencent",Map.of("expectedVersion",0,"mode","PERSONAL","appId","123456","secretId","SecretIdTests","secretKey","SecretKeyTests"));
        save(owner,"aliyun",Map.of("expectedVersion",0,"mode","PERSONAL","apiKey","sk-aliyun-personal","workspaceId","workspace-tests"));
        save(owner,"deepseek",Map.of("expectedVersion",0,"mode","PERSONAL","apiKey","sk-deepseek-personal","model","deepseek-flash"));
        var response=mvc.perform(get("/api/users/me/cloud-credentials").cookie(owner.cookie)).andExpect(status().isOk()).andExpect(header().string("Cache-Control","no-store"))
                .andExpect(jsonPath("data.length()").value(3)).andReturn();
        assertThat(response.getResponse().getContentAsString()).doesNotContain("SecretIdTests","SecretKeyTests","sk-aliyun-personal","sk-deepseek-personal","encryptedPayload","userId");
        for(String provider:List.of("tencent","aliyun","deepseek")) {
            var row=mapper.find(owner.id,provider); assertThat(row.getEncryptedPayload()).startsWith("v1:")
                    .doesNotContain("SecretIdTests","SecretKeyTests","sk-aliyun-personal","sk-deepseek-personal");
            assertThat(row.toString()).doesNotContain(row.getEncryptedPayload());
        }
        assertThat(Files.size(root.resolve("private/key"))).isEqualTo(32);
    }
    @Test void personalCallsUseOnlyTheRequestingUsersKeyAndAreIsolatedFromSiteConfiguration() throws Exception {
        var first=login(); var second=login();
        save(first,"deepseek",Map.of("expectedVersion",0,"mode","PERSONAL","apiKey","sk-first-personal","model","deepseek-flash"));
        save(second,"deepseek",Map.of("expectedVersion",0,"mode","PERSONAL","apiKey","sk-second-personal","model","deepseek-flash"));
        assertThat(corrector.correct("原文",first.id)).isEqualTo("原文"); assertThat(corrector.correct("原文",second.id)).isEqualTo("原文");
        var requests=org.mockito.ArgumentCaptor.forClass(HttpRequest.class); verify(transport,times(2)).post(requests.capture(),anyLong(),any(),any());
        assertThat(requests.getAllValues().get(0).headers().firstValue("Authorization")).contains("Bearer sk-first-personal");
        assertThat(requests.getAllValues().get(1).headers().firstValue("Authorization")).contains("Bearer sk-second-personal");
        assertThat(credentials.effective(null,"deepseek").deepseekReady()).isFalse();
        mvc.perform(get("/api/users/me/cloud-credentials").cookie(second.cookie)).andExpect(jsonPath("data[2].version").value(1));
    }
    @Test void speechRecognitionUsesTheTaskOwnersPersonalTencentSignature() throws Exception {
        var first=login(); var second=login();
        save(first,"tencent",Map.of("expectedVersion",0,"mode","PERSONAL","appId","123456","secretId","FirstId","secretKey","FirstKey"));
        save(second,"tencent",Map.of("expectedVersion",0,"mode","PERSONAL","appId","654321","secretId","SecondId","secretKey","SecondKey"));
        when(transport.post(any(),anyLong(),any(),any())).thenReturn(json.writeValueAsBytes(Map.of("code",0,"flash_result",List.of())));
        var audio=Files.createTempFile(root,"private-speech-",".mp3"); Files.write(audio,new byte[]{1,2,3});
        try {
            recognizer.recognize("tencent",audio,java.time.Duration.ofSeconds(5),()->false,first.id);
            recognizer.recognize("tencent",audio,java.time.Duration.ofSeconds(5),()->false,second.id);
        } finally { Files.delete(audio); }
        var requests=org.mockito.ArgumentCaptor.forClass(HttpRequest.class); verify(transport,times(2)).post(requests.capture(),anyLong(),any(),any());
        for(int index=0;index<2;index++) {
            var request=requests.getAllValues().get(index); String secret=index==0 ? "FirstKey" : "SecondKey";
            assertThat(request.uri().getPath()).endsWith(index==0 ? "/123456" : "/654321");
            assertThat(request.uri().getQuery()).contains(index==0 ? "secretid=FirstId" : "secretid=SecondId");
            assertThat(request.headers().firstValue("Authorization")).contains(CloudSpeechRecognizer.signature("POST"+request.uri().getHost()+request.uri().getRawPath()+"?"+request.uri().getRawQuery(),secret));
        }
    }
    @Test void concurrentUsersNeverExchangeCredentialsWhileSharingTheTextConcurrencyBudget() throws Exception {
        var first=login(); var second=login();
        save(first,"deepseek",Map.of("expectedVersion",0,"mode","PERSONAL","apiKey","sk-parallel-first","model","deepseek-flash"));
        save(second,"deepseek",Map.of("expectedVersion",0,"mode","PERSONAL","apiKey","sk-parallel-second","model","deepseek-flash"));
        var entered=new java.util.concurrent.CountDownLatch(2); var seen=java.util.concurrent.ConcurrentHashMap.<String>newKeySet();
        when(transport.post(any(),anyLong(),any(),any())).thenAnswer(call->{
            seen.add(call.getArgument(0,HttpRequest.class).headers().firstValue("Authorization").orElseThrow()); entered.countDown();
            if(!entered.await(5,java.util.concurrent.TimeUnit.SECONDS)) throw new IllegalStateException("test timeout");
            return json.writeValueAsBytes(Map.of("choices",List.of(Map.of("finish_reason","stop","message",Map.of("content","{\"text\":\"原文\"}")))));
        });
        try(var pool=java.util.concurrent.Executors.newFixedThreadPool(2)) {
            var a=pool.submit(()->corrector.correct("原文",first.id)); var b=pool.submit(()->corrector.correct("原文",second.id));
            assertThat(a.get(6,java.util.concurrent.TimeUnit.SECONDS)).isEqualTo("原文"); assertThat(b.get(6,java.util.concurrent.TimeUnit.SECONDS)).isEqualTo("原文");
        }
        assertThat(seen).containsExactlyInAnyOrder("Bearer sk-parallel-first","Bearer sk-parallel-second");
    }

    @Test void failedPersonalCallsNeverFallBackAndDeletionDisablesRatherThanSwitchesToSiteQuota() throws Exception {
        var owner=login(); save(owner,"deepseek",Map.of("expectedVersion",0,"mode","PERSONAL","apiKey","sk-own-quota","model","deepseek-flash"));
        when(transport.post(any(),anyLong(),any(),any())).thenThrow(new BusinessException(ErrorCode.AI_FAILED));
        assertThatThrownBy(()->corrector.correct("原文",owner.id)).isInstanceOf(BusinessException.class); verify(transport,times(1)).post(any(),anyLong(),any(),any());
        mvc.perform(delete("/api/users/me/cloud-credentials/deepseek").cookie(owner.cookie).header("X-CSRF-Token",owner.csrf)
                .contentType(MediaType.APPLICATION_JSON).content("{\"expectedVersion\":1}"))
                .andExpect(status().isOk()).andExpect(jsonPath("data.mode").value("OFF")).andExpect(jsonPath("data.configured").value(false));
        assertThat(mapper.find(owner.id,"deepseek").getEncryptedPayload()).isNull(); assertThat(corrector.isAvailable(owner.id)).isFalse();
        mvc.perform(get("/api/system/capabilities").cookie(owner.cookie)).andExpect(header().string("Cache-Control","no-store"))
                .andExpect(jsonPath("data.subtitleCorrection").value(false));
        mvc.perform(get("/api/system/capabilities")).andExpect(jsonPath("data.subtitleCorrection").value(false))
                .andExpect(jsonPath("data.textAi.source").value("SERVER"))
                .andExpect(jsonPath("data.textAi.unavailableReason").value(ErrorCode.LOCAL_AI_UNAVAILABLE.message()));
        save(owner,"deepseek",Map.of("expectedVersion",2,"mode","SERVER"));
        assertThat(credentials.effective(owner.id,"deepseek").deepseekReady()).isFalse();
        assertThat(credentials.list(owner.id).get(2).available()).isFalse();
        when(local.configured()).thenReturn(true); when(local.isAvailable()).thenReturn(true); when(local.model()).thenReturn("qwen3.5-4b");
        assertThat(credentials.list(owner.id).get(2).available()).isTrue();
        mvc.perform(get("/api/system/capabilities").cookie(owner.cookie)).andExpect(jsonPath("data.subtitleCorrection").value(true))
                .andExpect(jsonPath("data.textAi.model").value("qwen3.5-4b"));
        verify(transport,times(1)).post(any(),anyLong(),any(),any());
    }
    @Test void blankSecretUpdatesKeepTheSavedValueOnlyWhenOmittedAndConcurrentVersionsConflict() throws Exception {
        var owner=login(); save(owner,"deepseek",Map.of("expectedVersion",0,"mode","PERSONAL","apiKey","sk-kept-secret","model","deepseek-flash"));
        String old=mapper.find(owner.id,"deepseek").getEncryptedPayload();
        save(owner,"deepseek",Map.of("expectedVersion",1,"mode","PERSONAL","model","deepseek-v4-pro"));
        assertThat(credentials.effective(owner.id,"deepseek").deepseekApiKey()).isEqualTo("sk-kept-secret");
        assertThat(mapper.find(owner.id,"deepseek").getEncryptedPayload()).isNotEqualTo(old);
        mvc.perform(put("/api/users/me/cloud-credentials/deepseek").cookie(owner.cookie).header("X-CSRF-Token",owner.csrf)
                .contentType(MediaType.APPLICATION_JSON).content("{\"expectedVersion\":1,\"mode\":\"OFF\"}"))
                .andExpect(status().isConflict()).andExpect(jsonPath("code").value("CLOUD_CREDENTIALS_CONFLICT"));
        assertThat(credentials.effective(owner.id,"deepseek").deepseekModel()).isEqualTo("deepseek-v4-pro");
    }
    @Test void ownerAuthenticationCsrfProviderWhitelistAndSafeValidationAreEnforced() throws Exception {
        var owner=login(); mvc.perform(get("/api/users/me/cloud-credentials")).andExpect(status().isUnauthorized());
        mvc.perform(put("/api/users/me/cloud-credentials/deepseek").cookie(owner.cookie).contentType(MediaType.APPLICATION_JSON).content("{\"expectedVersion\":0,\"mode\":\"OFF\"}"))
                .andExpect(status().isForbidden());
        for(var input:List.of(Map.of("expectedVersion",0,"mode","PERSONAL","apiKey","key\nInjected"),
                Map.of("expectedVersion",0,"mode","PERSONAL","apiKey",""),Map.of("expectedVersion",0,"mode","SERVER","apiKey","do-not-discard-silently"),
                Map.of("expectedVersion",0,"mode","PERSONAL","secretKey","wrong-provider"))) {
            var result=mvc.perform(put("/api/users/me/cloud-credentials/deepseek").cookie(owner.cookie).header("X-CSRF-Token",owner.csrf)
                    .contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsBytes(input))).andExpect(status().isUnprocessableEntity()).andReturn();
            assertThat(result.getResponse().getContentAsString()).doesNotContain("Injected","do-not-discard-silently","wrong-provider");
        }
        mvc.perform(put("/api/users/me/cloud-credentials/custom").cookie(owner.cookie).header("X-CSRF-Token",owner.csrf)
                .contentType(MediaType.APPLICATION_JSON).content("{\"expectedVersion\":0,\"mode\":\"OFF\"}")).andExpect(status().isUnprocessableEntity());
        mvc.perform(put("/api/users/me/cloud-credentials/deepseek").cookie(owner.cookie).header("X-CSRF-Token",owner.csrf).contentType(MediaType.APPLICATION_JSON)
                .content("{\"expectedVersion\":0,\"mode\":\"PERSONAL\",\"apiKey\":\"sk-key\",\"baseUrl\":\"http://127.0.0.1\"}"))
                .andExpect(status().isBadRequest());
        verifyNoInteractions(transport);
    }
    @Test void copiedOrTamperedCiphertextCannotBeUsedByAnotherUserOrFallBackToSite() throws Exception {
        var first=login(); var second=login();
        save(first,"deepseek",Map.of("expectedVersion",0,"mode","PERSONAL","apiKey","sk-first","model","deepseek-flash"));
        save(second,"deepseek",Map.of("expectedVersion",0,"mode","PERSONAL","apiKey","sk-second","model","deepseek-flash"));
        jdbc.update("UPDATE cloud_credential SET encrypted_payload=? WHERE user_id=? AND provider='deepseek'",mapper.find(first.id,"deepseek").getEncryptedPayload(),second.id);
        assertThat(credentials.available(second.id,"deepseek")).isFalse();
        assertThatThrownBy(()->credentials.effective(second.id,"deepseek")).isInstanceOfSatisfying(BusinessException.class,error->assertThat(error.code()).isEqualTo(ErrorCode.CLOUD_CREDENTIALS_UNAVAILABLE));
        assertThat(credentials.list(second.id).get(2).personalStored()).isTrue();
        verifyNoInteractions(transport);
    }
    @Test void defaultLocalModelRoutesTextOnlyAndDoesNotUseSiteCloudKeys() throws Exception {
        var owner=login(); when(local.configured()).thenReturn(true); when(local.isAvailable()).thenReturn(true);
        when(local.model()).thenReturn("qwen3.5-4b");
        when(local.complete(any(),any(),anyInt(),any())).thenReturn(json.readTree("{\"text\":\"本地结果\"}"));
        assertThat(corrector.correct("原文",owner.id)).isEqualTo("本地结果");
        assertThat(recognizer.providers(owner.id)).isEmpty();
        mvc.perform(get("/api/users/me/cloud-credentials").cookie(owner.cookie))
                .andExpect(jsonPath("data[0].available").value(false))
                .andExpect(jsonPath("data[0].unavailableReason").value("本地模型不支持语音识别，请配置我的凭据"))
                .andExpect(jsonPath("data[2].available").value(true));
        when(local.complete(any(),any(),anyInt(),any())).thenThrow(new BusinessException(ErrorCode.LOCAL_AI_UNAVAILABLE));
        assertThatThrownBy(()->corrector.correct("原文",owner.id))
                .isInstanceOfSatisfying(BusinessException.class,e->assertThat(e.code()).isEqualTo(ErrorCode.LOCAL_AI_UNAVAILABLE));
        verifyNoInteractions(transport);
    }
    @Test void accountDeletionPhysicallyRemovesPersonalCredentialRows() throws Exception {
        var owner=login(); save(owner,"deepseek",Map.of("expectedVersion",0,"mode","PERSONAL","apiKey","sk-delete-me","model","deepseek-flash"));
        users.deleteAccount(owner.id,new DeleteUserRequest(PASSWORD,owner.name));
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM cloud_credential WHERE user_id=?",Integer.class,owner.id)).isZero();
        assertThatThrownBy(()->credentials.effective(owner.id,"deepseek")).isInstanceOf(BusinessException.class);
    }
    private void save(Browser user,String provider,Map<String,?> body) throws Exception {
        var result=mvc.perform(put("/api/users/me/cloud-credentials/"+provider).cookie(user.cookie).header("X-CSRF-Token",user.csrf)
                .contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsBytes(body))).andExpect(status().isOk()).andReturn();
        assertThat(result.getResponse().getContentAsString()).doesNotContain("encryptedPayload","sk-first","sk-second","sk-own-quota","SecretKeyTests");
    }
    private Browser login() throws Exception {
        String id=UUID.randomUUID().toString(),name="c_"+id.replace("-","").substring(0,16);
        jdbc.update("INSERT INTO app_user(id,username,email,password_hash,display_name,email_verified,status,created_at,updated_at) VALUES(?,?,?,?,?,TRUE,'ACTIVE',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)",id,name,name+"@example.com",passwords.encode(PASSWORD),name);
        var csrf=mvc.perform(get("/api/auth/csrf")).andReturn();
        var login=mvc.perform(post("/api/auth/login").cookie(cookie(csrf)).header("X-CSRF-Token",data(csrf).path("token").asText()).contentType(MediaType.APPLICATION_JSON)
                .content(json.writeValueAsBytes(Map.of("username",name,"password",PASSWORD)))).andExpect(status().isOk()).andReturn();
        return new Browser(id,name,cookie(login),data(login).path("csrfToken").asText());
    }
    private JsonNode data(MvcResult result) { return json.readTree(result.getResponse().getContentAsByteArray()).path("data"); }
    private Cookie cookie(MvcResult result) {
        String header=result.getResponse().getHeaders("Set-Cookie").stream().filter(value->value.startsWith("AMW_SESSION=")).findFirst().orElseThrow();
        return new Cookie("AMW_SESSION",header.substring(12).split(";",2)[0]);
    }
    private record Browser(String id,String name,Cookie cookie,String csrf) {}
}
