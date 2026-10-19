package org.example.ai_media_workbench.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDateTime;
import lombok.Data;
import lombok.ToString;

/** 预留给邮箱验证、密码重置等用途的令牌记录，不是 AMW_SESSION 登录会话。 */
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
