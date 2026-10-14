package org.example.ai_media_workbench.dto.user;

import org.example.ai_media_workbench.common.validation.CodePointLength;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record UpdateUserRequest(
        @NotNull @NotBlank @CodePointLength(min = 1, max = 50) String displayName) {
    public UpdateUserRequest {
        if (displayName != null) displayName = displayName.strip();
    }
}
