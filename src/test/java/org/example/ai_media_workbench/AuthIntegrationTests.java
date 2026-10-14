package org.example.ai_media_workbench;

import jakarta.servlet.http.Cookie;
import java.time.Instant;
import java.time.Clock;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;
import java.util.UUID;
import org.example.ai_media_workbench.common.security.SessionPolicy;
import org.example.ai_media_workbench.mapper.UserMapper;
import org.example.ai_media_workbench.mapper.AccountCleanupMapper;
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
    private static final String PASSWORD = "Testing-Passphrase-2026!";
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;
    @Autowired UserMapper userMapper;
    @Autowired PasswordEncoder encoder;
    @Autowired JdbcIndexedSessionRepository sessions;
    @Autowired AccountCleanupMapper cleanupMapper;
    @Autowired JdbcTemplate jdbc;
    @TempDir Path storage;

    @Test
    void registrationHashesPasswordAndLoginRotatesSessionAndCsrf() throws Exception {
        String username = username();
        Browser anonymous = csrf(null);
        register(username, anonymous);
        var saved = userMapper.findByUsername(username);
        assertThat(saved.getPasswordHash()).startsWith("$argon2id$").isNotEqualTo(PASSWORD);
        assertThat(encoder.matches(PASSWORD, saved.getPasswordHash())).isTrue();
        mvc.perform(get("/api/users/me").cookie(anonymous.cookie())).andExpect(status().isUnauthorized());
        Browser loggedIn = login(username, PASSWORD, false, anonymous);
        assertThat(loggedIn.cookie().getValue()).isNotEqualTo(anonymous.cookie().getValue());
        assertThat(loggedIn.csrf()).isNotEqualTo(anonymous.csrf());
        mvc.perform(get("/api/users/me").cookie(loggedIn.cookie()))
                .andExpect(status().isOk()).andExpect(jsonPath("username").value(username))
                .andExpect(jsonPath("passwordHash").doesNotExist())
                .andExpect(jsonPath("requestId").isNotEmpty());
        mvc.perform(get("/api/users/me").cookie(anonymous.cookie())).andExpect(status().isUnauthorized());
        mvc.perform(post("/api/auth/logout").cookie(loggedIn.cookie())
                .header("X-CSRF-Token", anonymous.csrf())).andExpect(status().isForbidden());
        mvc.perform(post("/api/auth/logout").cookie(loggedIn.cookie())
                .header("X-CSRF-Token", loggedIn.csrf())).andExpect(status().isNoContent());
        mvc.perform(get("/api/users/me").cookie(loggedIn.cookie())).andExpect(status().isUnauthorized());
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
        mvc.perform(post("/api/auth/logout")).andExpect(status().isNoContent());
    }

    @Test
    void passwordChangeInvalidatesAllDevicesAndOldPassword() throws Exception {
        String username = username();
        Browser firstAnonymous = csrf(null);
        register(username, firstAnonymous);
        Browser first = login(username, PASSWORD, false, firstAnonymous);
        Browser second = login(username, PASSWORD, true, csrf(null));
        String nextPassword = "Another-Testing-Passphrase-2026!";
        mvc.perform(put("/api/users/me/password").cookie(first.cookie())
                .header("X-CSRF-Token", first.csrf()).contentType(MediaType.APPLICATION_JSON)
                .content(json.writeValueAsString(Map.of("currentPassword", PASSWORD, "newPassword", nextPassword))))
                .andExpect(status().isNoContent());
        mvc.perform(get("/api/users/me").cookie(first.cookie())).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/users/me").cookie(second.cookie())).andExpect(status().isUnauthorized());
        Browser retry = csrf(null);
        mvc.perform(post("/api/auth/login").cookie(retry.cookie()).header("X-CSRF-Token", retry.csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(json.writeValueAsString(Map.of("username", username, "password", PASSWORD))))
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
                .andExpect(status().isOk()).andExpect(jsonPath("displayName").value("Creator"));
        mvc.perform(get("/api/users/me").cookie(second.cookie()))
                .andExpect(status().isOk()).andExpect(jsonPath("displayName").value("Creator"));
        mvc.perform(post("/api/auth/logout-all").cookie(first.cookie()).header("X-CSRF-Token", first.csrf()))
                .andExpect(status().isNoContent());
        mvc.perform(get("/api/users/me").cookie(first.cookie())).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/users/me").cookie(second.cookie())).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/system/capabilities")).andExpect(status().isOk())
                .andExpect(jsonPath("registration").value(true)).andExpect(jsonPath("passwordRecovery").value(false))
                .andExpect(jsonPath("supportedOperations").isEmpty());
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
        jdbc.update("INSERT INTO project(id,user_id,name,created_at,updated_at) VALUES(?,?,?,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)", projectId, ownerId, "owned");
        jdbc.update("INSERT INTO project(id,user_id,name,created_at,updated_at) VALUES(?,?,?,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)", otherProjectId, otherOwnerId, "unrelated");
        jdbc.update("INSERT INTO media(id,project_id,original_filename,storage_key,size_bytes,kind,status,created_at,updated_at) VALUES(?,?,?,?,1,'VIDEO','READY',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)", mediaId, projectId, "video.mp4", key);
        jdbc.update("INSERT INTO media_task(id,project_id,media_id,kind,source_id,status,stage,created_at) VALUES(?,?,?,'TRANSCRIPTION',?,'RUNNING','TRANSCRIBING',CURRENT_TIMESTAMP)", taskId, projectId, mediaId, mediaId);
        Browser first = login(username, PASSWORD, false, anonymous);
        Browser second = login(username, PASSWORD, true, csrf(null));
        mvc.perform(delete("/api/users/me").cookie(first.cookie()).header("X-CSRF-Token", first.csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(json.writeValueAsString(Map.of("currentPassword", PASSWORD, "confirmUsername", username))))
                .andExpect(status().isNoContent());
        assertThat(userMapper.findById(ownerId).getStatus().name()).isEqualTo("DELETED");
        assertThat(userMapper.findById(ownerId).getPasswordHash()).isEqualTo("!DELETED");
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM project WHERE id=? AND deleted_at IS NOT NULL", Integer.class, projectId)).isEqualTo(1);
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM project WHERE id=? AND deleted_at IS NULL", Integer.class, otherProjectId)).isEqualTo(1);
        assertThat(jdbc.queryForObject("SELECT status FROM media_task WHERE id=?", String.class, taskId)).isEqualTo("CANCELLED");
        assertThat(jdbc.queryForObject("SELECT stage FROM media_task WHERE id=?", String.class, taskId)).isEqualTo("CANCELLED");
        mvc.perform(get("/api/users/me").cookie(first.cookie())).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/users/me").cookie(second.cookie())).andExpect(status().isUnauthorized());
        Browser retry = csrf(null);
        mvc.perform(post("/api/auth/login").cookie(retry.cookie()).header("X-CSRF-Token", retry.csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(json.writeValueAsString(Map.of("username", username, "password", PASSWORD))))
                .andExpect(status().isUnauthorized()).andExpect(jsonPath("code").value("INVALID_CREDENTIALS"));
        var cleanup = new AccountCleanupServiceImpl(cleanupMapper, Clock.systemUTC(), storage.toString(), false);
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
        jdbc.update("INSERT INTO project(id,user_id,name,created_at,updated_at) VALUES(?,?,?,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)", projectId, ownerId, "owned");
        jdbc.update("INSERT INTO media(id,project_id,original_filename,storage_key,size_bytes,kind,status,created_at,updated_at) VALUES(?,?,?,?,1,'VIDEO','READY',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)", mediaId, projectId, "video.mp4", "../outside.mp4");
        Browser browser = login(username, PASSWORD, false, anonymous);
        mvc.perform(delete("/api/users/me").cookie(browser.cookie()).header("X-CSRF-Token", browser.csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(json.writeValueAsString(Map.of("currentPassword", PASSWORD, "confirmUsername", username))))
                .andExpect(status().isNoContent());
        var cleanup = new AccountCleanupServiceImpl(cleanupMapper, Clock.systemUTC(), root.toString(), false);
        cleanup.runPending();
        assertThat(outside).exists();
        assertThat(jdbc.queryForObject("SELECT status FROM account_cleanup_job WHERE user_id=?", String.class, ownerId)).isEqualTo("FAILED");
    }

    private Browser csrf(Cookie existing) throws Exception {
        var builder = get("/api/auth/csrf");
        if (existing != null) builder.cookie(existing);
        MvcResult result = mvc.perform(builder).andExpect(status().isOk()).andReturn();
        String token = json.readTree(result.getResponse().getContentAsString()).get("token").asText();
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
                .andExpect(status().isCreated()).andExpect(jsonPath("password").doesNotExist());
    }

    private String registerBody(String username) throws Exception {
        return json.writeValueAsString(Map.of("username", username, "email", username + "@example.com", "password", PASSWORD));
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
        String token = json.readTree(result.getResponse().getContentAsString()).get("csrfToken").asText();
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
