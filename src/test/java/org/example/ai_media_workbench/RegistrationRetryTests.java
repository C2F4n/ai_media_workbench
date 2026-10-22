package org.example.ai_media_workbench;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import org.example.ai_media_workbench.common.exception.BusinessException;
import org.example.ai_media_workbench.common.exception.ErrorCode;
import org.example.ai_media_workbench.common.exception.RateLimitException;
import org.example.ai_media_workbench.common.security.AuthRateLimiter;
import org.example.ai_media_workbench.common.security.LoginSessionManager;
import org.example.ai_media_workbench.controller.AuthController;
import org.example.ai_media_workbench.dto.auth.RegistrationEmailRequest;
import org.example.ai_media_workbench.mapper.RegistrationEmailMapper;
import org.example.ai_media_workbench.properties.AuthProperties;
import org.example.ai_media_workbench.properties.RegistrationMailProperties;
import org.example.ai_media_workbench.service.*;
import org.example.ai_media_workbench.service.impl.RegistrationEmailServiceImpl;
import org.example.ai_media_workbench.vo.auth.RegistrationEmailVO;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.*;

class RegistrationRetryTests {
    private final Clock clock = Clock.fixed(Instant.parse("2026-10-21T00:00:00Z"), ZoneOffset.UTC);
    private final AuthProperties auth = new AuthProperties(false, Duration.ofMinutes(30), Duration.ofHours(12), Duration.ofDays(7), Duration.ofDays(30), true, 10, 1, Duration.ofMinutes(5));

    @Test void smtpFailuresRefundEmailQuotaButSuccessfulSendsStillUseIt() {
        var mapper = mock(RegistrationEmailMapper.class); var mail = mock(RegistrationMailSender.class);
        var encoder = mock(PasswordEncoder.class); when(encoder.encode(any())).thenReturn("fixture-hash"); when(mail.isAvailable()).thenReturn(true);
        var service = new RegistrationEmailServiceImpl(mapper, mail, encoder, new AuthRateLimiter(clock, auth), auth,
                new RegistrationMailProperties(true, "sender@example.com", Duration.ofMinutes(10), 5, 1), clock);
        doThrow(new BusinessException(ErrorCode.EMAIL_DELIVERY_UNAVAILABLE)).when(mail).sendCode(anyString(), anyString(), any());
        for (int i = 0; i < 8; i++) assertThatThrownBy(() -> service.send("owner@example.com"))
                .isInstanceOfSatisfying(BusinessException.class, e -> assertThat(e.code()).isEqualTo(ErrorCode.EMAIL_DELIVERY_UNAVAILABLE));
        doNothing().when(mail).sendCode(anyString(), anyString(), any());
        assertThat(service.send("owner@example.com").challengeId()).isNotBlank();
        assertThatThrownBy(() -> service.send("owner@example.com")).isInstanceOfSatisfying(RateLimitException.class, e -> assertThat(e.retryAfter()).isEqualTo(60));
        verify(mail, times(9)).sendCode(eq("owner@example.com"), anyString(), any());
    }

    @Test void controllerRefundsFailedIpReservationsAndRetainsSuccessfulOnes() {
        var emails = mock(RegistrationEmailService.class);
        var controller = new AuthController(mock(AuthService.class), mock(SessionService.class), new AuthRateLimiter(clock, auth), auth, mock(LoginSessionManager.class), emails);
        var request = new MockHttpServletRequest(); request.setRemoteAddr("127.0.0.2");
        var input = new RegistrationEmailRequest("owner@example.com");
        when(emails.send(anyString())).thenThrow(new BusinessException(ErrorCode.EMAIL_DELIVERY_UNAVAILABLE));
        for (int i = 0; i < 8; i++) assertThatThrownBy(() -> controller.sendRegistrationCode(input, request))
                .isInstanceOfSatisfying(BusinessException.class, e -> assertThat(e.code()).isEqualTo(ErrorCode.EMAIL_DELIVERY_UNAVAILABLE));
        doReturn(new RegistrationEmailVO("fixture", clock.instant().plusSeconds(600))).when(emails).send(anyString());
        assertThat(controller.sendRegistrationCode(input, request).getStatusCode().value()).isEqualTo(200);
        assertThatThrownBy(() -> controller.sendRegistrationCode(input, request)).isInstanceOfSatisfying(RateLimitException.class, e -> assertThat(e.retryAfter()).isEqualTo(60));
    }
}
