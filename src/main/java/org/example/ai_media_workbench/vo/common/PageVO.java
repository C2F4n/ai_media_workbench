package org.example.ai_media_workbench.vo.common;

import java.util.List;

public record PageVO<T>(List<T> items, int page, int pageSize, long total, String requestId) {}
