package org.example.ai_media_workbench.vo.auth;

/** CSRF 令牌不是登录令牌；requestId 位于统一 Result 外层。 */
public record CsrfVO(String token, String headerName) {}
