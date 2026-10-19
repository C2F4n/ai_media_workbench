package org.example.ai_media_workbench.common.security;

import java.io.Serializable;
import java.security.Principal;

/** 存入会话的最小身份信息；可序列化以便 Spring Session 持久化到数据库，不含密码。 */
public record AccountPrincipal(String userId, String username) implements Principal, Serializable {
    @Override
    // 使用稳定的用户 ID 作为会话索引，支持按账号撤销所有设备的会话。
    public String getName() { return userId; }
}
