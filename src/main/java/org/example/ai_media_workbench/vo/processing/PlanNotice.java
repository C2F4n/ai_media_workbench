package org.example.ai_media_workbench.vo.processing;

/** 由服务端固定文案生成，不直接展示模型任意输出。 */
public record PlanNotice(String code, String message) {}
