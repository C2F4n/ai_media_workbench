package org.example.ai_media_workbench.service;

import org.example.ai_media_workbench.dto.user.ChangePasswordRequest;
import org.example.ai_media_workbench.dto.user.UpdateUserRequest;
import org.example.ai_media_workbench.dto.user.DeleteUserRequest;
import org.example.ai_media_workbench.entity.UserEntity;

/** 账号业务契约；实现类负责事务，接口不依赖 Servlet 请求或具体存储实现。 */
public interface UserService {
    /** 查询有效账号，不存在或不可用时拒绝访问。 */
    UserEntity getActiveUser(String userId);
    /** 修改昵称并返回更新后的用户记录。 */
    UserEntity updateProfile(String userId, UpdateUserRequest request);
    /** 校验旧密码、保存新密码哈希并撤销全部登录会话和业务令牌。 */
    void changePassword(String userId, ChangePasswordRequest request);
    /** 核验注销信息、逻辑删除账号及资源，并创建文件清理任务。 */
    void deleteAccount(String userId, DeleteUserRequest request);
}
