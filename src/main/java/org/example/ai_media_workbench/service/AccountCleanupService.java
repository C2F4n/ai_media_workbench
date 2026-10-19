package org.example.ai_media_workbench.service;

public interface AccountCleanupService {
    /** 为已注销用户创建文件清理任务。 */
    void enqueue(String userId);
    /** 执行一批待清理任务，返回成功完成的任务数。 */
    int runPending();
}
