package org.example.ai_media_workbench.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDateTime;
import lombok.Data;
import lombok.ToString;

@Data
public class UserEntity {
    private String id;
    private String username;
    private String email;
    private String displayName;
    @JsonIgnore
    @ToString.Exclude
    private String passwordHash;
    private boolean emailVerified;
    private UserStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;
}
