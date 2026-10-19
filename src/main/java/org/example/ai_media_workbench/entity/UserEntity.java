package org.example.ai_media_workbench.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDateTime;
import lombok.Data;
import lombok.ToString;

/** app_user 表的内存映射；Lombok @Data 在编译期生成 getter/setter 等方法。 */
@Data
public class UserEntity {
    private String id;
    private String username;
    private String email;
    private String displayName;
    // 两层保护：JSON 序列化不输出密码哈希，Lombok 的 toString 也不打印它。
    @JsonIgnore
    @ToString.Exclude
    private String passwordHash;
    private boolean emailVerified;
    private UserStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;
}
