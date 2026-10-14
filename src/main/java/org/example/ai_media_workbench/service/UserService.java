package org.example.ai_media_workbench.service;

import org.example.ai_media_workbench.dto.user.ChangePasswordRequest;
import org.example.ai_media_workbench.dto.user.UpdateUserRequest;
import org.example.ai_media_workbench.dto.user.DeleteUserRequest;
import org.example.ai_media_workbench.entity.UserEntity;

public interface UserService {
    UserEntity getActiveUser(String userId);
    UserEntity updateProfile(String userId, UpdateUserRequest request);
    void changePassword(String userId, ChangePasswordRequest request);
    void deleteAccount(String userId, DeleteUserRequest request);
}
