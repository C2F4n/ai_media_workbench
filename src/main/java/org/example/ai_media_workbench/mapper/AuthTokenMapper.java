package org.example.ai_media_workbench.mapper;

import org.example.ai_media_workbench.entity.AuthTokenEntity;
import java.time.LocalDateTime;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface AuthTokenMapper {
    /** 保存邮箱验证或密码重置等业务令牌。 */
    void insert(AuthTokenEntity token);
    /** 根据令牌哈希查询令牌记录。 */
    AuthTokenEntity findByHash(String tokenHash);
    /** 将未使用且未过期的令牌标记为已使用，返回受影响行数。 */
    int consume(@Param("id") String id, @Param("consumedAt") LocalDateTime consumedAt);
    /** 作废指定用户所有未使用的业务令牌。 */
    int revokeAll(@Param("userId") String userId, @Param("consumedAt") LocalDateTime consumedAt);
}
