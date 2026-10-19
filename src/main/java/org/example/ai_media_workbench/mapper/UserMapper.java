package org.example.ai_media_workbench.mapper;

import org.example.ai_media_workbench.entity.UserEntity;
import java.time.LocalDateTime;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

/** 数据访问接口，由 MyBatis 生成实现；方法名对应 resources/mapper/UserMapper.xml 的 SQL id。 */
@Mapper
public interface UserMapper {
    /** 按用户 ID 查询账号。 */
    UserEntity findById(String id);
    /** 按用户 ID 查询并锁定账号行。 */
    UserEntity findByIdForUpdate(String id);
    /** 按用户名查询账号。 */
    UserEntity findByUsername(String username);
    /** 插入新账号。 */
    void insert(UserEntity user);
    /** 修改有效账号的昵称，返回受影响行数。 */
    // @Param 指定 XML 中 #{...} 的名称；更新返回受影响行数，业务层据此判断是否成功。
    int updateDisplayName(@Param("id") String id, @Param("displayName") String displayName,
                          @Param("updatedAt") LocalDateTime updatedAt);
    /** 更新有效账号的密码哈希，返回受影响行数。 */
    int updatePassword(@Param("id") String id, @Param("passwordHash") String passwordHash,
                       @Param("updatedAt") LocalDateTime updatedAt);
    /** 将账号标记为已注销并销毁密码哈希，返回受影响行数。 */
    int deleteAccount(@Param("id") String id, @Param("now") LocalDateTime now);
}
