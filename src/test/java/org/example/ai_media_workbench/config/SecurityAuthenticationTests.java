package org.example.ai_media_workbench.config;

import org.example.ai_media_workbench.entity.UserEntity;
import org.example.ai_media_workbench.entity.UserStatus;
import org.example.ai_media_workbench.mapper.UserMapper;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.startsWith;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.spy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class SecurityAuthenticationTests {
    @Test
    void deletedAccountsUseUnknownUserTimingProtectionInsteadOfParsingDestroyedHashes() {
        var config = new SecurityConfig();
        var encoder = spy(config.passwordEncoder());
        var mapper = mock(UserMapper.class);
        var account = new UserEntity();
        account.setUsername("deleted");
        account.setPasswordHash("!DELETED");
        account.setStatus(UserStatus.DELETED);
        when(mapper.findByUsername("deleted")).thenReturn(account);

        var manager = config.authenticationManager(mapper, encoder);
        assertThatThrownBy(() -> manager.authenticate(
                UsernamePasswordAuthenticationToken.unauthenticated("DELETED", "Br2026")))
                .isInstanceOf(BadCredentialsException.class);
        verify(encoder, never()).matches(any(), eq("!DELETED"));
        verify(encoder).matches(any(), startsWith("$argon2id$"));
    }

    @Test
    void activeAccountsStillRequireTheirActualPasswordHash() {
        var config = new SecurityConfig();
        var encoder = config.passwordEncoder();
        var mapper = mock(UserMapper.class);
        var account = new UserEntity();
        account.setUsername("active");
        account.setPasswordHash(encoder.encode("Br2026"));
        account.setStatus(UserStatus.ACTIVE);
        when(mapper.findByUsername("active")).thenReturn(account);
        var manager = config.authenticationManager(mapper, encoder);

        assertThat(manager.authenticate(UsernamePasswordAuthenticationToken.unauthenticated(
                "ACTIVE", "Br2026")).isAuthenticated()).isTrue();
        assertThatThrownBy(() -> manager.authenticate(
                UsernamePasswordAuthenticationToken.unauthenticated("active", "wrong-password")))
                .isInstanceOf(BadCredentialsException.class);
    }
}
