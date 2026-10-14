package org.example.ai_media_workbench.vo.auth;

import org.example.ai_media_workbench.vo.user.UserVO;
import java.time.Instant;

public record LoginVO(UserVO user, Instant expiresAt, String csrfToken, String requestId) {}
