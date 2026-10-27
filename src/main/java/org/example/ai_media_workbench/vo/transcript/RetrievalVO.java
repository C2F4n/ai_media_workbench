package org.example.ai_media_workbench.vo.transcript;

/** 本次字幕召回统计；不包含索引路径、账号或密钥。contextBytes仅统计候选字幕JSON。 */
public record RetrievalVO(String method, int totalSegments, int indexedChunks, int retrievedSegments, int contextBytes) {}
