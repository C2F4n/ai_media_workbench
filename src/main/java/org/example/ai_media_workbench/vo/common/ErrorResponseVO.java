package org.example.ai_media_workbench.vo.common;

import java.util.List;

public record ErrorResponseVO(String code, String message, String requestId, List<ErrorDetailVO> details) {}
