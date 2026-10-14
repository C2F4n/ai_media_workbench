package org.example.ai_media_workbench.dto.auth;

import org.example.ai_media_workbench.common.validation.CodePointLength;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record RegisterRequest(
        @NotNull @Pattern(regexp = "[a-zA-Z0-9_]{4,32}") String username,
        @NotNull @Email @CodePointLength(min = 3, max = 254)
        @Pattern(regexp = "[\\x00-\\x7F]+") String email,
        @NotNull @CodePointLength(min = 15, max = 128) String password,
        @CodePointLength(min = 1, max = 50) String displayName) {

    public RegisterRequest {
        if (email != null) email = email.strip();
        if (displayName != null) displayName = displayName.strip();
    }

    @Override
    public String toString() {
        return "RegisterRequest[username=" + username + "]";
    }
}
