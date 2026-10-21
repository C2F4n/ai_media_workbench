package org.example.ai_media_workbench.entity;

import java.time.LocalDateTime;
import lombok.Data;

@Data
public class CloudCredentialEntity {
    private String userId;
    private String provider;
    private String mode;
    private String encryptedPayload;
    private int version;
    private LocalDateTime updatedAt;
    @Override public String toString() { return "CloudCredentialEntity[REDACTED]"; }
}
