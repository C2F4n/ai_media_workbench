package org.example.ai_media_workbench.service;

public interface AccountCleanupService {
    /** 为已注销用户创建文件清理任务。 */
    void enqueue(String userId);
    /** 为已删除素材创建清理任务，等待现有工具租约结束后删除受控文件。 */
    void enqueueMedia(String userId, String mediaId);
    /** 执行一批待清理任务，返回成功完成的任务数。 */
    int runPending();
}
