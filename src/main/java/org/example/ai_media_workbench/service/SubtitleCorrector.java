package org.example.ai_media_workbench.service;

/** 只生成文字建议，不修改持久化字幕或时间轴。 */
public interface SubtitleCorrector {
    boolean isAvailable(String userId);
    String correct(String text,String userId);
}
