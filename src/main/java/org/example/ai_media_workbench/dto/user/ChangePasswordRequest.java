package org.example.ai_media_workbench.dto.user;

import org.example.ai_media_workbench.common.validation.CodePointLength;
import jakarta.validation.constraints.NotNull;

public record ChangePasswordRequest(
        @NotNull @CodePointLength(min = 1, max = 128) String currentPassword,
        @NotNull @CodePointLength(min = 15, max = 128) String newPassword) {

    @Override
    public String toString() { return "ChangePasswordRequest[redacted]"; }
}
