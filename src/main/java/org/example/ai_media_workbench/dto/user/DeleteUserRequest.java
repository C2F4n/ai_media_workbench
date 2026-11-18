package org.example.ai_media_workbench.dto.user;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import org.example.ai_media_workbench.common.validation.CodePointLength;

public record DeleteUserRequest(
        @NotNull @CodePointLength(min = 1, max = 128) String currentPassword,
        @NotNull @Pattern(regexp = "[a-zA-Z0-9_]{4,32}") String confirmUsername) {
    @Override
    public String toString() { return "DeleteUserRequest[redacted]"; }
}
