package org.example.ai_media_workbench.vo.auth;

import org.example.ai_media_workbench.vo.user.UserVO;
import java.time.Instant;

/** 登录资料和新的 CSRF 令牌；真正的登录令牌只通过 HttpOnly Cookie 下发，不放在 JSON 中。 */
public record LoginVO(UserVO user, Instant expiresAt, String csrfToken) {}
