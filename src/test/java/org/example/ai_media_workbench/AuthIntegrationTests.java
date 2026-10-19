package org.example.ai_media_workbench;

import jakarta.servlet.http.Cookie;
import java.time.Instant;
import java.time.Clock;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import org.junit.jupiter.api.BeforeEach;
import org.example.ai_media_workbench.service.RegistrationEmailService;
import org.example.ai_media_workbench.service.RegistrationMailSender;
import org.example.ai_media_workbench.service.AuthService;
import org.example.ai_media_workbench.dto.auth.RegisterRequest;
import org.example.ai_media_workbench.entity.UserEntity;
import org.example.ai_media_workbench.entity.UserStatus;
import org.example.ai_media_workbench.common.exception.BusinessException;
import org.example.ai_media_workbench.common.exception.ErrorCode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.Callable;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executors;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.example.ai_media_workbench.common.security.SessionPolicy;
import org.example.ai_media_workbench.mapper.UserMapper;
import org.example.ai_media_workbench.mapper.AccountCleanupMapper;
import org.example.ai_media_workbench.properties.AccountCleanupProperties;
import org.example.ai_media_workbench.properties.StorageProperties;
import org.example.ai_media_workbench.service.impl.AccountCleanupServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.session.jdbc.JdbcIndexedSessionRepository;
import org.springframework.session.FindByIndexNameSessionRepository;
import org.springframework.session.Session;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import tools.jackson.databind.ObjectMapper;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.doThrow;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthIntegrationTests {
    private static final String PASSWORD = "Testing-2026!";
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;
    @Autowired UserMapper userMapper;
    @Autowired PasswordEncoder encoder;
    @Autowired JdbcIndexedSessionRepository sessions;
    @Autowired AccountCleanupMapper cleanupMapper;
    @Autowired JdbcTemplate jdbc;
    @TempDir Path storage;
    @Autowired RegistrationEmailService registrationEmails;
    @Autowired AuthService authService;
    @MockitoBean RegistrationMailSender mail;
    @MockitoBean org.example.ai_media_workbench.service.MediaTranscoder transcoder;
    private final Map<String, String> deliveredCodes = new ConcurrentHashMap<>();

    @BeforeEach
    void captureTestMail() {
        when(mail.isAvailable()).thenReturn(true);
        doAnswer(call -> {
            deliveredCodes.put(call.getArgument(0), call.getArgument(1));
            return null;
        }).when(mail).sendCode(anyString(), anyString(), any());
    }

    @Test
    void registrationRequiresAnEmailCodeAndDoesNotReserveUnverifiedEmail() throws Exception {
        String username = username();
        String email = username + "@example.com";
        Browser browser = csrf(null);
        mvc.perform(post("/api/auth/register").cookie(browser.cookie()).header("X-CSRF-Token", browser.csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(json.writeValueAsString(Map.of("username", username, "email", email, "password", PASSWORD))))
                .andExpect(status().isBadRequest());
        assertThat(userMapper.findByUsername(username)).isNull();
        var proof = requestCode(email, browser);
        assertThat(userCount(email)).isZero();
        String wrong = "000000".equals(proof.code()) ? "000001" : "000000";
        mvc.perform(post("/api/auth/register").cookie(browser.cookie()).header("X-CSRF-Token", browser.csrf())
                .contentType(MediaType.APPLICATION_JSON).content(registrationBody(username, email, proof.id(), wrong)))
                .andExpect(status().isUnprocessableEntity()).andExpect(jsonPath("code").value("EMAIL_VERIFICATION_INVALID"));
        assertThat(userCount(email)).isZero();
        postRegistration(username, email.toUpperCase(), proof, browser).andExpect(status().isCreated())
                .andExpect(jsonPath("data.emailVerified").value(true));
    }

    @Test
    void codeIsBoundToEmailExpiresAndCannotBeReplayed() throws Exception {
        Browser browser = csrf(null);
        String email = username() + "@example.com";
        var proof = requestCode(email, browser);
        postRegistration(username(), "different_" + email, proof, browser).andExpect(status().isUnprocessableEntity());
        jdbc.update("UPDATE registration_email_challenge SET expires_at=? WHERE id=?",
                LocalDateTime.ofInstant(Instant.now().minusSeconds(60), java.time.ZoneOffset.UTC), proof.id());
        postRegistration(username(), email, proof, browser).andExpect(status().isUnprocessableEntity());
        assertThat(userCount(email)).isZero();
        var next = requestCode(email, browser);
        postRegistration(username(), email, next, browser).andExpect(status().isCreated());
        postRegistration(username(), email, next, browser).andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("code").value("EMAIL_VERIFICATION_INVALID"));
        assertThat(userCount(email)).isEqualTo(1);
    }

    @Test
    void wrongAttemptsPersistDespiteRegistrationTransactionRollback() throws Exception {
        Browser browser = csrf(null);
        String email = username() + "@example.com";
        var proof = requestCode(email, browser);
        String wrong = "000000".equals(proof.code()) ? "000001" : "000000";
        for (int i = 0; i < 5; i++) {
            postRegistration(username(), email, new Proof(proof.id(), wrong), browser)
                    .andExpect(status().isUnprocessableEntity());
        }
        assertThat(jdbc.queryForObject("SELECT attempts FROM registration_email_challenge WHERE id=?", Integer.class, proof.id())).isEqualTo(5);
        postRegistration(username(), email, proof, browser).andExpect(status().isUnprocessableEntity());
        assertThat(userCount(email)).isZero();
    }

    @Test
    void missingMailConfigurationAndDeliveryFailuresDoNotCreateChallengesOrAccounts() throws Exception {
        Browser browser = csrf(null);
        String email = username() + "@example.com";
        when(mail.isAvailable()).thenReturn(false);
        mvc.perform(get("/api/system/capabilities")).andExpect(jsonPath("data.registration").value(false))
                .andExpect(jsonPath("data.emailVerification").value(false));
        mvc.perform(post("/api/auth/registration-email-code").cookie(browser.cookie()).header("X-CSRF-Token", browser.csrf())
                .contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(Map.of("email", email))))
                .andExpect(status().isServiceUnavailable()).andExpect(jsonPath("code").value("EMAIL_DELIVERY_UNAVAILABLE"));
        when(mail.isAvailable()).thenReturn(true);
        doThrow(new BusinessException(ErrorCode.EMAIL_DELIVERY_UNAVAILABLE)).when(mail).sendCode(anyString(), anyString(), any());
        mvc.perform(post("/api/auth/registration-email-code").cookie(browser.cookie()).header("X-CSRF-Token", browser.csrf())
                .contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(Map.of("email", email))))
                .andExpect(status().isServiceUnavailable());
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM registration_email_challenge WHERE email=?", Integer.class, email)).isZero();
        assertThat(userCount(email)).isZero();
    }

    @Test
    void verifiedOwnerCanRegisterDespiteLegacyUnverifiedEmailWithoutTakingOverOldAccount() throws Exception {
        String email = username() + "@example.com";
        var legacy = new UserEntity();
        legacy.setId(UUID.randomUUID().toString());
        legacy.setUsername(username());
        legacy.setEmail(email);
        legacy.setEmailVerified(false);
        legacy.setDisplayName("Legacy");
        legacy.setPasswordHash(encoder.encode(PASSWORD));
        legacy.setStatus(UserStatus.ACTIVE);
        legacy.setCreatedAt(LocalDateTime.now());
        legacy.setUpdatedAt(legacy.getCreatedAt());
        userMapper.insert(legacy);
        Browser browser = csrf(null);
        var proof = requestCode(email, browser);
        String owner = username();
        postRegistration(owner, email, proof, browser).andExpect(status().isCreated());
        assertThat(userMapper.findByUsername(owner).isEmailVerified()).isTrue();
        assertThat(userMapper.findByUsername(legacy.getUsername()).getId()).isEqualTo(legacy.getId());
        assertThat(userMapper.findByUsername(legacy.getUsername()).getPasswordHash()).isEqualTo(legacy.getPasswordHash());
        postRegistration(username(), email, requestCode(email, browser), browser).andExpect(status().isConflict());
        assertThat(userCount(email)).isEqualTo(2);
    }

    @Test
    void usernameConflictRollsBackCodeConsumptionSoTheOwnerCanRetry() throws Exception {
        Browser browser = csrf(null);
        String occupied = username();
        register(occupied, browser);
        String email = username() + "@example.com";
        var proof = requestCode(email, browser);
        postRegistration(occupied, email, proof, browser).andExpect(status().isConflict());
        assertThat(jdbc.queryForObject("SELECT consumed_at FROM registration_email_challenge WHERE id=?", LocalDateTime.class, proof.id())).isNull();
        postRegistration(username(), email, proof, browser).andExpect(status().isCreated());
    }

    @Test
    void concurrentUseOfOneCodeCreatesOnlyOneAccount() throws Exception {
        String email = username() + "@example.com";
        var proof = requestCode(email, csrf(null));
        var start = new CountDownLatch(1);
        Callable<Boolean> register = () -> {
            start.await();
            try {
                authService.register(new RegisterRequest(username(), email, PASSWORD, null, proof.id(), proof.code()));
                return true;
            } catch (BusinessException exception) {
                assertThat(exception.code()).isEqualTo(ErrorCode.EMAIL_VERIFICATION_INVALID);
                return false;
            }
        };
        try (var executor = Executors.newFixedThreadPool(2)) {
            var first = executor.submit(register);
            var second = executor.submit(register);
            start.countDown();
            assertThat(List.of(first.get(), second.get())).containsExactlyInAnyOrder(true, false);
        }
        assertThat(userCount(email)).isEqualTo(1);
    }

    @Test
    void requestingEmailCodeRequiresCsrf() throws Exception {
        mvc.perform(post("/api/auth/registration-email-code").contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"owner@example.com\"}"))
                .andExpect(status().isForbidden()).andExpect(jsonPath("code").value("CSRF_INVALID"));
    }

    private Proof requestCode(String email, Browser browser) throws Exception {
        var response = mvc.perform(post("/api/auth/registration-email-code").cookie(browser.cookie())
                .header("X-CSRF-Token", browser.csrf()).contentType(MediaType.APPLICATION_JSON)
                .content(json.writeValueAsString(Map.of("email", email))))
                .andExpect(status().isOk()).andExpect(jsonPath("data.code").doesNotExist())
                .andExpect(jsonPath("data.codeHash").doesNotExist()).andReturn().getResponse();
        var data = json.readTree(response.getContentAsString()).get("data");
        String code = deliveredCodes.get(email.toLowerCase());
        assertThat(response.getContentAsString()).doesNotContain(code);
        return new Proof(data.get("challengeId").asText(), code);
    }

    private org.springframework.test.web.servlet.ResultActions postRegistration(String username, String email, Proof proof, Browser browser) throws Exception {
        return mvc.perform(post("/api/auth/register").cookie(browser.cookie()).header("X-CSRF-Token", browser.csrf())
                .contentType(MediaType.APPLICATION_JSON).content(registrationBody(username, email, proof.id(), proof.code())));
    }

    private String registrationBody(String username, String email, String challengeId, String code) throws Exception {
        return json.writeValueAsString(Map.of("username", username, "email", email, "password", PASSWORD,
                "emailChallengeId", challengeId, "emailCode", code));
    }

    private int userCount(String email) {
        return jdbc.queryForObject("SELECT COUNT(*) FROM app_user WHERE email=?", Integer.class, email);
    }

    private record Proof(String id, String code) {
        @Override public String toString() { return "EmailProof[redacted]"; }
    }

    @Test
    void registrationHashesPasswordAndLoginRotatesSessionAndCsrf() throws Exception {
        String username = username();
        Browser anonymous = csrf(null);
        register(username, anonymous);
        var saved = userMapper.findByUsername(username);
        assertThat(saved.isEmailVerified()).isTrue();
        assertThat(saved.getPasswordHash()).startsWith("$argon2id$").isNotEqualTo(PASSWORD);
        assertThat(encoder.matches(PASSWORD, saved.getPasswordHash())).isTrue();
        mvc.perform(get("/api/users/me").cookie(anonymous.cookie())).andExpect(status().isUnauthorized());
        Browser loggedIn = login(username, PASSWORD, false, anonymous);
        assertThat(loggedIn.cookie().getValue()).isNotEqualTo(anonymous.cookie().getValue());
        assertThat(loggedIn.csrf()).isNotEqualTo(anonymous.csrf());
        mvc.perform(get("/api/users/me").cookie(loggedIn.cookie()))
                .andExpect(status().isOk()).andExpect(jsonPath("code").value("SUCCESS"))
                .andExpect(jsonPath("data.username").value(username))
                .andExpect(jsonPath("data.passwordHash").doesNotExist())
                .andExpect(jsonPath("requestId").isNotEmpty());
        mvc.perform(get("/api/users/me").cookie(anonymous.cookie())).andExpect(status().isUnauthorized());
        mvc.perform(post("/api/auth/logout").cookie(loggedIn.cookie())
                .header("X-CSRF-Token", anonymous.csrf())).andExpect(status().isForbidden());
        mvc.perform(post("/api/auth/logout").cookie(loggedIn.cookie())
                .header("X-CSRF-Token", loggedIn.csrf())).andExpect(status().isOk()).andExpect(jsonPath("code").value("SUCCESS"))
                .andExpect(jsonPath("data").isEmpty());
        mvc.perform(get("/api/users/me").cookie(loggedIn.cookie())).andExpect(status().isUnauthorized());
    }

    @Test
    void securityAndValidationErrorsUseTheSameResultEnvelope() throws Exception {
        mvc.perform(get("/api/users/me"))
                .andExpect(status().isUnauthorized()).andExpect(jsonPath("code").value("UNAUTHENTICATED"))
                .andExpect(jsonPath("data").isEmpty()).andExpect(jsonPath("details").isArray())
                .andExpect(jsonPath("requestId").isNotEmpty());
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isForbidden()).andExpect(jsonPath("code").value("CSRF_INVALID"))
                .andExpect(jsonPath("data").isEmpty()).andExpect(jsonPath("details").isArray());
        Browser anonymous = csrf(null);
        mvc.perform(post("/api/auth/login").cookie(anonymous.cookie()).header("X-CSRF-Token", anonymous.csrf())
                .contentType(MediaType.APPLICATION_JSON).content("{\"username\":\"!\",\"password\":\"secret-input\"}"))
                .andExpect(status().isUnprocessableEntity()).andExpect(jsonPath("code").value("INVALID_PARAMETERS"))
                .andExpect(jsonPath("data").isEmpty()).andExpect(jsonPath("details[0].field").value("username"));
    }

    @Test
    void duplicateAccountWrongCredentialsAndMissingCsrfHaveStableErrors() throws Exception {
        String username = username();
        Browser anonymous = csrf(null);
        register(username, anonymous);
        mvc.perform(post("/api/auth/register").cookie(anonymous.cookie())
                .header("X-CSRF-Token", anonymous.csrf()).contentType(MediaType.APPLICATION_JSON)
                .content(registerBody(username)))
                .andExpect(status().isConflict()).andExpect(jsonPath("code").value("ACCOUNT_ALREADY_EXISTS"));
        for (String account : new String[]{username, username()}) {
            mvc.perform(post("/api/auth/login").cookie(anonymous.cookie())
                    .header("X-CSRF-Token", anonymous.csrf()).contentType(MediaType.APPLICATION_JSON)
                    .content(json.writeValueAsString(Map.of("username", account, "password", "Wrong-passphrase-2026!"))))
                    .andExpect(status().isUnauthorized()).andExpect(jsonPath("code").value("INVALID_CREDENTIALS"));
        }
        mvc.perform(post("/api/auth/login").cookie(anonymous.cookie()).contentType(MediaType.APPLICATION_JSON)
                .content(json.writeValueAsString(Map.of("username", username, "password", PASSWORD))))
                .andExpect(status().isForbidden()).andExpect(jsonPath("code").value("CSRF_INVALID"));
        mvc.perform(post("/api/auth/logout")).andExpect(status().isOk()).andExpect(jsonPath("code").value("SUCCESS"))
                .andExpect(jsonPath("data").isEmpty());
    }

    @Test
    void registrationEnforcesBothNewPasswordLengthBoundaries() throws Exception {
        for (String accepted : new String[]{"Abc123", "Abcd1234Efgh5678"}) {
            String username = username();
            String email = username + "@example.com";
            Browser browser = csrf(null);
            var proof = requestCode(email, browser);
            for (String rejected : new String[]{"Ab12!", "Abcd1234Efgh56789"}) {
                mvc.perform(post("/api/auth/register").cookie(browser.cookie())
                        .header("X-CSRF-Token", browser.csrf()).contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(Map.of("username", username, "email", email, "password", rejected,
                                "emailChallengeId", proof.id(), "emailCode", proof.code()))))
                        .andExpect(status().isUnprocessableEntity())
                        .andExpect(jsonPath("code").value("INVALID_PARAMETERS"));
                assertThat(userMapper.findByUsername(username)).isNull();
            }
            mvc.perform(post("/api/auth/register").cookie(browser.cookie())
                    .header("X-CSRF-Token", browser.csrf()).contentType(MediaType.APPLICATION_JSON)
                    .content(json.writeValueAsString(Map.of("username", username, "email", email, "password", accepted,
                            "emailChallengeId", proof.id(), "emailCode", proof.code()))))
                    .andExpect(status().isCreated());
            login(username, accepted, false, browser);
        }
    }

    @Test
    void passwordChangeInvalidatesAllDevicesAndOldPassword() throws Exception {
        String username = username();
        Browser firstAnonymous = csrf(null);
        register(username, firstAnonymous);
        // 兼容调整策略前创建的长密码，仍能登录并按新规则改密。
        String oldPassword = "Legacy-Testing-Passphrase-2026!";
        jdbc.update("UPDATE app_user SET password_hash=? WHERE username=?", encoder.encode(oldPassword), username);
        Browser first = login(username, oldPassword, false, firstAnonymous);
        Browser second = login(username, oldPassword, true, csrf(null));
        for (String rejected : new String[]{"Ab12!", "Abcd1234Efgh56789"}) {
            mvc.perform(put("/api/users/me/password").cookie(first.cookie())
                    .header("X-CSRF-Token", first.csrf()).contentType(MediaType.APPLICATION_JSON)
                    .content(json.writeValueAsString(Map.of("currentPassword", oldPassword, "newPassword", rejected))))
                    .andExpect(status().isUnprocessableEntity())
                    .andExpect(jsonPath("code").value("INVALID_PARAMETERS"));
            mvc.perform(get("/api/users/me").cookie(second.cookie())).andExpect(status().isOk());
        }
        String nextPassword = "Abcd1234Efgh5678";
        mvc.perform(put("/api/users/me/password").cookie(first.cookie())
                .header("X-CSRF-Token", first.csrf()).contentType(MediaType.APPLICATION_JSON)
                .content(json.writeValueAsString(Map.of("currentPassword", oldPassword, "newPassword", nextPassword))))
                .andExpect(status().isOk()).andExpect(jsonPath("code").value("SUCCESS"))
                .andExpect(jsonPath("data").isEmpty());
        mvc.perform(get("/api/users/me").cookie(first.cookie())).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/users/me").cookie(second.cookie())).andExpect(status().isUnauthorized());
        Browser retry = csrf(null);
        mvc.perform(post("/api/auth/login").cookie(retry.cookie()).header("X-CSRF-Token", retry.csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(json.writeValueAsString(Map.of("username", username, "password", oldPassword))))
                .andExpect(status().isUnauthorized());
        login(username, nextPassword, false, retry);
    }

    @Test
    void absoluteSessionExpiryIsEnforcedEvenWhenIdleTimeRemains() throws Exception {
        String username = username();
        Browser anonymous = csrf(null);
        register(username, anonymous);
        Browser browser = login(username, PASSWORD, true, anonymous);
        String userId = userMapper.findByUsername(username).getId();
        expireSession(sessions, userId);
        mvc.perform(get("/api/users/me").cookie(browser.cookie()))
                .andExpect(status().isUnauthorized()).andExpect(jsonPath("code").value("UNAUTHENTICATED"));
    }

    @Test
    void nicknameUpdateAndLogoutAllApplyToBothDevices() throws Exception {
        String username = username();
        Browser anonymous = csrf(null);
        register(username, anonymous);
        Browser first = login(username, PASSWORD, false, anonymous);
        Browser second = login(username, PASSWORD, false, csrf(null));
        mvc.perform(patch("/api/users/me").cookie(first.cookie()).header("X-CSRF-Token", first.csrf())
                .contentType(MediaType.APPLICATION_JSON).content("{\"displayName\":\"  Creator  \"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("data.displayName").value("Creator"));
        mvc.perform(get("/api/users/me").cookie(second.cookie()))
                .andExpect(status().isOk()).andExpect(jsonPath("data.displayName").value("Creator"));
        mvc.perform(post("/api/auth/logout-all").cookie(first.cookie()).header("X-CSRF-Token", first.csrf()))
                .andExpect(status().isOk()).andExpect(jsonPath("code").value("SUCCESS"))
                .andExpect(jsonPath("data").isEmpty());
        mvc.perform(get("/api/users/me").cookie(first.cookie())).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/users/me").cookie(second.cookie())).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/system/capabilities")).andExpect(status().isOk())
                .andExpect(jsonPath("data.registration").value(true)).andExpect(jsonPath("data.passwordRecovery").value(false))
                .andExpect(jsonPath("data.supportedOperations").isEmpty());
    }

    @Test
    void malformedAndUnknownFieldsAreRejectedWithoutReturningSensitiveValues() throws Exception {
        Browser anonymous = csrf(null);
        mvc.perform(post("/api/auth/login").cookie(anonymous.cookie()).header("X-CSRF-Token", anonymous.csrf())
                .contentType(MediaType.APPLICATION_JSON).content("{\"username\":\"creator\"}"))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("code").value("INVALID_REQUEST"));
        mvc.perform(post("/api/auth/login").cookie(anonymous.cookie()).header("X-CSRF-Token", anonymous.csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(json.writeValueAsString(Map.of("username", "creator", "password", PASSWORD, "userId", "forged"))))
                .andExpect(status().isBadRequest());
    }

    @Test
    void accountDeletionRevokesEveryTokenAndMarksOnlyOwnedResources() throws Exception {
        String username = username();
        Browser anonymous = csrf(null);
        register(username, anonymous);
        String ownerId = userMapper.findByUsername(username).getId();
        String otherUsername = username();
        register(otherUsername, csrf(null));
        String otherOwnerId = userMapper.findByUsername(otherUsername).getId();
        String projectId = UUID.randomUUID().toString();
        String otherProjectId = UUID.randomUUID().toString();
        String mediaId = UUID.randomUUID().toString();
        String taskId = UUID.randomUUID().toString();
        String key = "owned-" + UUID.randomUUID() + ".mp4";
        Path owned = Files.writeString(storage.resolve(key), "actual fixture");
        Path unrelated = Files.writeString(storage.resolve("unrelated.mp4"), "keep");
        jdbc.update("INSERT INTO legacy_project(id,user_id,name,created_at,updated_at) VALUES(?,?,?,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)", projectId, ownerId, "owned");
        jdbc.update("INSERT INTO legacy_project(id,user_id,name,created_at,updated_at) VALUES(?,?,?,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)", otherProjectId, otherOwnerId, "unrelated");
        jdbc.update("INSERT INTO media(id,user_id,original_filename,storage_key,size_bytes,kind,status,created_at,updated_at) VALUES(?,?,?,?,1,'VIDEO','READY',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)", mediaId, ownerId, "video.mp4", key);
        jdbc.update("INSERT INTO media_task(id,user_id,media_id,kind,source_id,status,stage,created_at) VALUES(?,?,?,'TRANSCRIPTION',?,'RUNNING','TRANSCRIBING',CURRENT_TIMESTAMP)", taskId, ownerId, mediaId, mediaId);
        Browser first = login(username, PASSWORD, false, anonymous);
        Browser second = login(username, PASSWORD, true, csrf(null));
        mvc.perform(delete("/api/users/me").cookie(first.cookie()).header("X-CSRF-Token", first.csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(json.writeValueAsString(Map.of("currentPassword", PASSWORD, "confirmUsername", username))))
                .andExpect(status().isOk()).andExpect(jsonPath("code").value("SUCCESS"))
                .andExpect(jsonPath("data").isEmpty());
        assertThat(userMapper.findById(ownerId).getStatus().name()).isEqualTo("DELETED");
        assertThat(userMapper.findById(ownerId).getPasswordHash()).isEqualTo("!DELETED");
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM legacy_project WHERE id=? AND deleted_at IS NOT NULL", Integer.class, projectId)).isEqualTo(1);
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM legacy_project WHERE id=? AND deleted_at IS NULL", Integer.class, otherProjectId)).isEqualTo(1);
        assertThat(jdbc.queryForObject("SELECT status FROM media_task WHERE id=?", String.class, taskId)).isEqualTo("CANCELLED");
        assertThat(jdbc.queryForObject("SELECT stage FROM media_task WHERE id=?", String.class, taskId)).isEqualTo("CANCELLED");
        mvc.perform(get("/api/users/me").cookie(first.cookie())).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/users/me").cookie(second.cookie())).andExpect(status().isUnauthorized());
        Browser retry = csrf(null);
        mvc.perform(post("/api/auth/login").cookie(retry.cookie()).header("X-CSRF-Token", retry.csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(json.writeValueAsString(Map.of("username", username, "password", PASSWORD))))
                .andExpect(status().isUnauthorized()).andExpect(jsonPath("code").value("INVALID_CREDENTIALS"));
        var cleanup = new AccountCleanupServiceImpl(cleanupMapper, Clock.systemUTC(),
                new StorageProperties(storage.toString()), new AccountCleanupProperties(false, 5000));
        assertThat(cleanup.runPending()).isGreaterThan(0);
        assertThat(owned).doesNotExist();
        assertThat(unrelated).exists();
        assertThat(jdbc.queryForObject("SELECT status FROM account_cleanup_job WHERE user_id=?", String.class, ownerId)).isEqualTo("DONE");
    }

    @Test
    void deletionRequiresPasswordAndUsernameAndCsrf() throws Exception {
        String username = username();
        Browser anonymous = csrf(null);
        register(username, anonymous);
        Browser browser = login(username, PASSWORD, false, anonymous);
        String validBody = json.writeValueAsString(Map.of("currentPassword", PASSWORD, "confirmUsername", username));
        mvc.perform(delete("/api/users/me").cookie(browser.cookie()).contentType(MediaType.APPLICATION_JSON)
                .content(validBody)).andExpect(status().isForbidden());
        mvc.perform(delete("/api/users/me").cookie(browser.cookie()).header("X-CSRF-Token", browser.csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(json.writeValueAsString(Map.of("currentPassword", "Incorrect-passphrase", "confirmUsername", username))))
                .andExpect(status().isForbidden()).andExpect(jsonPath("code").value("CURRENT_PASSWORD_INVALID"));
        mvc.perform(delete("/api/users/me").cookie(browser.cookie()).header("X-CSRF-Token", browser.csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(json.writeValueAsString(Map.of("currentPassword", PASSWORD, "confirmUsername", "different_user"))))
                .andExpect(status().isUnprocessableEntity());
        assertThat(userMapper.findByUsername(username).getStatus().name()).isEqualTo("ACTIVE");
        mvc.perform(get("/api/users/me").cookie(browser.cookie())).andExpect(status().isOk());
    }

    @Test
    void forgedTokensAndInactiveAccountsCannotAccessProtectedRoutes() throws Exception {
        mvc.perform(get("/api/users/me").cookie(new Cookie("AMW_SESSION", "dG90YWxseS1mYWtl")))
                .andExpect(status().isUnauthorized());
        String username = username();
        Browser anonymous = csrf(null);
        register(username, anonymous);
        Browser browser = login(username, PASSWORD, false, anonymous);
        jdbc.update("UPDATE app_user SET status='DISABLED' WHERE username=?", username);
        mvc.perform(get("/api/users/me").cookie(browser.cookie())).andExpect(status().isUnauthorized());
        mvc.perform(get("/").cookie(browser.cookie())).andExpect(status().isOk());
    }

    @Test
    void cleanupRejectsPathsOutsideConfiguredStorageRoot() throws Exception {
        String username = username();
        Browser anonymous = csrf(null);
        register(username, anonymous);
        String ownerId = userMapper.findByUsername(username).getId();
        String projectId = UUID.randomUUID().toString();
        String mediaId = UUID.randomUUID().toString();
        Path root = Files.createDirectories(storage.resolve("root"));
        Path outside = Files.writeString(storage.resolve("outside.mp4"), "do not delete");
        jdbc.update("INSERT INTO legacy_project(id,user_id,name,created_at,updated_at) VALUES(?,?,?,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)", projectId, ownerId, "owned");
        jdbc.update("INSERT INTO media(id,user_id,original_filename,storage_key,size_bytes,kind,status,created_at,updated_at) VALUES(?,?,?,?,1,'VIDEO','READY',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)", mediaId, ownerId, "video.mp4", "../outside.mp4");
        Browser browser = login(username, PASSWORD, false, anonymous);
        mvc.perform(delete("/api/users/me").cookie(browser.cookie()).header("X-CSRF-Token", browser.csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(json.writeValueAsString(Map.of("currentPassword", PASSWORD, "confirmUsername", username))))
                .andExpect(status().isOk()).andExpect(jsonPath("code").value("SUCCESS"))
                .andExpect(jsonPath("data").isEmpty());
        var cleanup = new AccountCleanupServiceImpl(cleanupMapper, Clock.systemUTC(),
                new StorageProperties(root.toString()), new AccountCleanupProperties(false, 5000));
        cleanup.runPending();
        assertThat(outside).exists();
        assertThat(jdbc.queryForObject("SELECT status FROM account_cleanup_job WHERE user_id=?", String.class, ownerId)).isEqualTo("FAILED");
    }

    private Browser csrf(Cookie existing) throws Exception {
        var builder = get("/api/auth/csrf");
        if (existing != null) builder.cookie(existing);
        MvcResult result = mvc.perform(builder).andExpect(status().isOk()).andReturn();
        String token = json.readTree(result.getResponse().getContentAsString()).get("data").get("token").asText();
        return new Browser(cookie(result, existing), token);
    }

    private <S extends Session> void expireSession(FindByIndexNameSessionRepository<S> repository, String userId) {
        S session = repository.findByPrincipalName(userId).values().iterator().next();
        session.setAttribute(SessionPolicy.ABSOLUTE_EXPIRY, Instant.now().minusSeconds(1));
        repository.save(session);
    }

    private void register(String username, Browser browser) throws Exception {
        mvc.perform(post("/api/auth/register").cookie(browser.cookie()).header("X-CSRF-Token", browser.csrf())
                .contentType(MediaType.APPLICATION_JSON).content(registerBody(username)))
                .andExpect(status().isCreated()).andExpect(jsonPath("data.password").doesNotExist());
    }

    private String registerBody(String username) throws Exception {
        String email = username + "@example.com";
        var challenge = registrationEmails.send(email);
        return json.writeValueAsString(Map.of("username", username, "email", email, "password", PASSWORD,
                "emailChallengeId", challenge.challengeId(), "emailCode", deliveredCodes.get(email)));
    }

    private Browser login(String username, String password, boolean remember, Browser browser) throws Exception {
        MvcResult result = mvc.perform(post("/api/auth/login").cookie(browser.cookie())
                .header("X-CSRF-Token", browser.csrf()).contentType(MediaType.APPLICATION_JSON)
                .content(json.writeValueAsString(Map.of("username", username, "password", password, "rememberMe", remember))))
                .andExpect(status().isOk()).andReturn();
        String header = result.getResponse().getHeader("Set-Cookie");
        assertThat(header).contains("HttpOnly", "SameSite=Lax", "Path=/");
        if (remember) assertThat(header).contains("Max-Age=");
        else assertThat(header).doesNotContain("Max-Age=");
        String token = json.readTree(result.getResponse().getContentAsString()).get("data").get("csrfToken").asText();
        return new Browser(cookie(result, null), token);
    }

    private Cookie cookie(MvcResult result, Cookie fallback) {
        String header = result.getResponse().getHeaders("Set-Cookie").stream()
                .filter(value -> value.startsWith("AMW_SESSION=")).findFirst().orElse(null);
        if (header == null) return fallback;
        return new Cookie("AMW_SESSION", header.substring("AMW_SESSION=".length()).split(";", 2)[0]);
    }

    private String username() { return "u_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16); }
    private record Browser(Cookie cookie, String csrf) {}
}
