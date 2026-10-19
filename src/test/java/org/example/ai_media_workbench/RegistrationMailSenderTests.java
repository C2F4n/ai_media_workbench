package org.example.ai_media_workbench;

import java.time.Duration;
import org.example.ai_media_workbench.common.exception.BusinessException;
import org.example.ai_media_workbench.common.exception.ErrorCode;
import org.example.ai_media_workbench.properties.RegistrationMailProperties;
import org.example.ai_media_workbench.service.impl.SmtpRegistrationMailSender;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.support.StaticListableBeanFactory;
import org.springframework.mail.MailSendException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;

class RegistrationMailSenderTests {
    @Test
    void unconfiguredMailNeverPretendsToSend() {
        var transport = mock(JavaMailSender.class);
        var sender = sender(transport, false);
        assertThat(sender.isAvailable()).isFalse();
        assertThatThrownBy(() -> sender.sendCode("owner@example.com", "123456", Duration.ofMinutes(10)))
                .isInstanceOfSatisfying(BusinessException.class,
                        error -> assertThat(error.code()).isEqualTo(ErrorCode.EMAIL_DELIVERY_UNAVAILABLE));
        verifyNoInteractions(transport);
    }

    @Test
    void smtpReceivesTheRecipientAndCodeButFailuresNeverLeakTransportDetails() {
        var transport = mock(JavaMailSender.class);
        var sender = sender(transport, true);
        assertThat(sender.isAvailable()).isTrue();
        sender.sendCode("owner@example.com", "123456", Duration.ofMinutes(10));
        var message = ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(transport).send(message.capture());
        assertThat(message.getValue().getTo()).containsExactly("owner@example.com");
        assertThat(message.getValue().getFrom()).isEqualTo("workbench@example.com");
        assertThat(message.getValue().getText()).contains("123456", "10");
        doThrow(new MailSendException("private SMTP details")).when(transport).send(any(SimpleMailMessage.class));
        assertThatThrownBy(() -> sender.sendCode("owner@example.com", "123456", Duration.ofMinutes(10)))
                .isInstanceOf(BusinessException.class).hasMessageNotContaining("private SMTP details");
    }

    private SmtpRegistrationMailSender sender(JavaMailSender transport, boolean enabled) {
        var beans = new StaticListableBeanFactory();
        beans.addBean("mail", transport);
        return new SmtpRegistrationMailSender(beans.getBeanProvider(JavaMailSender.class),
                new RegistrationMailProperties(enabled, "workbench@example.com", Duration.ofMinutes(10), 5, 3));
    }
}
