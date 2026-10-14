package org.example.ai_media_workbench.dto.project;

import org.example.ai_media_workbench.common.validation.CodePointLength;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateProjectRequest(@NotNull @NotBlank @CodePointLength(min = 1, max = 100) String name) {}
