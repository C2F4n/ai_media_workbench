package org.example.ai_media_workbench.vo.system;

/** SERVER沿用已有来源值，现表示本地千问，不再表示站点云端额度。 */
public record TextAiStatusVO(String source, String model, boolean available, String unavailableReason) {}
