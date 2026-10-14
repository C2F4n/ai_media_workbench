package org.example.ai_media_workbench.service;

public interface AccountCleanupService {
    void enqueue(String userId);
    int runPending();
}
