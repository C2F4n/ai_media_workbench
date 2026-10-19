package org.example.ai_media_workbench.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDateTime;
import lombok.Data;
import lombok.ToString;

@Data
public class RegistrationEmailEntity {
    private String id;
    private String email;
    @JsonIgnore
    @ToString.Exclude
    private String codeHash;
    private int attempts;
    private int maxAttempts;
    private LocalDateTime expiresAt;
    private LocalDateTime consumedAt;
    private LocalDateTime createdAt;
}
