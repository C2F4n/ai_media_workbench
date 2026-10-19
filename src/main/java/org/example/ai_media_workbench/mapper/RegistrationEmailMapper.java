package org.example.ai_media_workbench.mapper;

import java.time.LocalDateTime;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.example.ai_media_workbench.entity.RegistrationEmailEntity;

@Mapper
public interface RegistrationEmailMapper {
    /** 保存验证码哈希，不保存明文，也不创建用户。 */
    void insert(RegistrationEmailEntity challenge);
    /** 查询验证码申请。 */
    RegistrationEmailEntity findById(String id);
    /** 原子累计一次尝试，过期、已使用或次数耗尽时返回 0。 */
    int attempt(@Param("id") String id, @Param("email") String email, @Param("now") LocalDateTime now);
    /** 将验证码标记为已使用，防止重复使用；注册失败时一同回滚。 */
    int consume(@Param("id") String id, @Param("email") String email, @Param("now") LocalDateTime now);
    /** 删除过期超过一天的验证码记录。 */
    void deleteExpired(LocalDateTime cutoff);
}
