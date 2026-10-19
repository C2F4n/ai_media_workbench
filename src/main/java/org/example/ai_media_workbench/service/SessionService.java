package org.example.ai_media_workbench.service;

/** 撤销服务端保存的账号会话；当前 HTTP 上下文的清理由 LoginSessionManager 统一处理。 */
public interface SessionService {
    /** 撤销指定用户在所有设备上的登录会话。 */
    void revokeAll(String userId);
}
