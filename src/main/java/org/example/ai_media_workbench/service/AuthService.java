package org.example.ai_media_workbench.service;

import org.example.ai_media_workbench.dto.auth.LoginRequest;
import org.example.ai_media_workbench.dto.auth.RegisterRequest;
import org.example.ai_media_workbench.entity.UserEntity;

public interface AuthService {
    UserEntity register(RegisterRequest request);
    UserEntity authenticate(LoginRequest request);
}
