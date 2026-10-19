package org.example.ai_media_workbench;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;
import org.example.ai_media_workbench.common.exception.GlobalExceptionHandler;
import org.example.ai_media_workbench.common.security.AccountPrincipal;
import org.example.ai_media_workbench.common.security.AuthRateLimiter;
import org.example.ai_media_workbench.common.security.LoginSessionManager;
import org.example.ai_media_workbench.controller.AuthController;
import org.example.ai_media_workbench.controller.UserController;
import org.example.ai_media_workbench.dto.user.ChangePasswordRequest;
import org.example.ai_media_workbench.entity.UserEntity;
import org.example.ai_media_workbench.properties.AuthProperties;
import org.example.ai_media_workbench.service.AuthService;
import org.example.ai_media_workbench.service.SessionService;
import org.example.ai_media_workbench.service.UserService;
import org.example.ai_media_workbench.service.RegistrationEmailService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** 使用 Service 接口的测试替身，不启动数据库或绑定具体实现，验证 Controller 的替换能力。 */
class ControllerContractTests {
    private final AuthService auth = mock(AuthService.class);
    private final SessionService sessions = mock(SessionService.class);
    private final UserService users = mock(UserService.class);
    private final AuthRateLimiter limiter = mock(AuthRateLimiter.class);
    private final LoginSessionManager loginSessions = mock(LoginSessionManager.class);
    private final RegistrationEmailService registrationEmails = mock(RegistrationEmailService.class);
    private final AuthProperties properties = new AuthProperties(false, Duration.ofMinutes(30), Duration.ofHours(12),
            Duration.ofDays(7), Duration.ofDays(30), true, 10, 5, Duration.ofMinutes(5));
    private MockMvc mvc;

    @BeforeEach
    void setup() {
        mvc = MockMvcBuilders.standaloneSetup(new AuthController(auth, sessions, limiter, properties, loginSessions, registrationEmails))
                .setControllerAdvice(new GlobalExceptionHandler()).build();
    }

    @Test
    void registrationWorksWithAnAlternativeServiceAndOnlyReturnsPublicData() throws Exception {
        when(auth.register(any())).thenReturn(user());
        var response = mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON)
                .content("{\"username\":\"creator\",\"email\":\"creator@example.com\",\"password\":\"ExamplePass2026!\","
                        + "\"emailChallengeId\":\"00000000-0000-4000-8000-000000000001\",\"emailCode\":\"123456\"}"))
                .andExpect(status().isCreated()).andExpect(jsonPath("code").value("SUCCESS"))
                .andExpect(jsonPath("data.username").value("creator"))
                .andExpect(jsonPath("data.passwordHash").doesNotExist()).andReturn().getResponse();
        assertThat(response.getContentAsString()).doesNotContain("private-hash");
        verify(auth).register(any());
    }

    @Test
    void loginAndLogoutDelegateToTheSameSessionLifecycleComponent() throws Exception {
        when(auth.authenticate(any())).thenReturn(user());
        when(loginSessions.start(eq(new AccountPrincipal("user-id", "creator")), eq(true), any(), any()))
                .thenReturn(new LoginSessionManager.SessionDetails(Instant.parse("2026-10-15T12:00:00Z"), "new-csrf"));
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                .content("{\"username\":\"creator\",\"password\":\"Example-Passphrase-2026!\",\"rememberMe\":true}"))
                .andExpect(status().isOk()).andExpect(jsonPath("data.user.username").value("creator"))
                .andExpect(jsonPath("data.csrfToken").value("new-csrf"));
        verify(loginSessions).start(eq(new AccountPrincipal("user-id", "creator")), eq(true), any(), any());
        mvc.perform(post("/api/auth/logout")).andExpect(status().isOk())
                .andExpect(jsonPath("code").value("SUCCESS")).andExpect(jsonPath("data").isEmpty());
        verify(loginSessions).clear(any(), any());
    }

    @Test
    void profileAndPasswordEndpointsDependOnTheUserServiceInterface() {
        var controller = new UserController(users, limiter, properties, loginSessions);
        var principal = new AccountPrincipal("user-id", "creator");
        when(users.getActiveUser(principal.userId())).thenReturn(user());
        assertThat(controller.current(principal).data().username()).isEqualTo("creator");
        var request = new MockHttpServletRequest();
        var response = new MockHttpServletResponse();
        var change = new ChangePasswordRequest("Example-Passphrase-2026!", "NextPass2026!");
        assertThat(controller.changePassword(principal, change, request, response).code()).isEqualTo("SUCCESS");
        verify(users).changePassword(principal.userId(), change);
        verify(loginSessions).clear(request, response);
    }

    private UserEntity user() {
        var user = new UserEntity();
        user.setId("user-id");
        user.setUsername("creator");
        user.setDisplayName("Creator");
        user.setEmail("creator@example.com");
        user.setPasswordHash("private-hash");
        user.setCreatedAt(LocalDateTime.of(2026, 10, 15, 0, 0));
        user.setUpdatedAt(user.getCreatedAt());
        return user;
    }
}
