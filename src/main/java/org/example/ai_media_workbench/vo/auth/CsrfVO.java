package org.example.ai_media_workbench.vo.auth;

public record CsrfVO(String token, String headerName, String requestId) {}
