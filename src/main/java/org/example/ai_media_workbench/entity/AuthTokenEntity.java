package org.example.ai_media_workbench.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDateTime;
import lombok.Data;
import lombok.ToString;

@Data
public class AuthTokenEntity {
    private String id;
    private String userId;
    private String purpose;
    @JsonIgnore
    @ToString.Exclude
    private String tokenHash;
    private LocalDateTime expiresAt;
    private LocalDateTime consumedAt;
    private LocalDateTime createdAt;
}
