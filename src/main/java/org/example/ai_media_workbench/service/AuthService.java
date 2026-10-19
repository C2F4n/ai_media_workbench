package org.example.ai_media_workbench.service;

import org.example.ai_media_workbench.dto.auth.LoginRequest;
import org.example.ai_media_workbench.dto.auth.RegisterRequest;
import org.example.ai_media_workbench.entity.UserEntity;

/** 注册和凭证校验的业务契约。Controller 依赖本接口，Spring 注入实现，测试可替换为接口替身。 */
public interface AuthService {
    /** 创建账号并返回用户记录。 */
    UserEntity register(RegisterRequest request);
    /** 校验用户名、密码和账号状态，返回通过认证的用户。 */
    UserEntity authenticate(LoginRequest request);
}
