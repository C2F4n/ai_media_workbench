package org.example.ai_media_workbench.controller;

import org.example.ai_media_workbench.common.security.AccountPrincipal;
import org.example.ai_media_workbench.common.security.AuthRateLimiter;
import org.example.ai_media_workbench.common.web.RequestIdFilter;
import org.example.ai_media_workbench.config.AuthProperties;
import org.example.ai_media_workbench.dto.user.ChangePasswordRequest;
import org.example.ai_media_workbench.dto.user.UpdateUserRequest;
import org.example.ai_media_workbench.dto.user.DeleteUserRequest;
import org.example.ai_media_workbench.service.impl.UserServiceImpl;
import org.example.ai_media_workbench.vo.user.UserVO;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users/me")
public class UserController {
    private final UserServiceImpl userService;
    private final AuthRateLimiter rateLimiter;
    private final AuthProperties properties;

    public UserController(UserServiceImpl userService, AuthRateLimiter rateLimiter, AuthProperties properties) {
        this.userService = userService;
        this.rateLimiter = rateLimiter;
        this.properties = properties;
    }

    @GetMapping
    public UserVO current(@AuthenticationPrincipal AccountPrincipal principal, HttpServletRequest request) {
        return UserVO.from(userService.getActiveUser(principal.userId()), RequestIdFilter.get(request));
    }

    @PatchMapping
    public UserVO update(@AuthenticationPrincipal AccountPrincipal principal,
                         @Valid @RequestBody UpdateUserRequest input, HttpServletRequest request) {
        return UserVO.from(userService.updateProfile(principal.userId(), input), RequestIdFilter.get(request));
    }

    @PutMapping("/password")
    public ResponseEntity<Void> changePassword(@AuthenticationPrincipal AccountPrincipal principal,
                                               @Valid @RequestBody ChangePasswordRequest input,
                                               HttpServletRequest request, HttpServletResponse response) {
        rateLimiter.check("password:user:" + principal.userId(), properties.loginAttempts());
        userService.changePassword(principal.userId(), input);
        new SecurityContextLogoutHandler().logout(request, response,
                SecurityContextHolder.getContext().getAuthentication());
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping
    public ResponseEntity<Void> deleteAccount(@AuthenticationPrincipal AccountPrincipal principal,
            @Valid @RequestBody DeleteUserRequest input, HttpServletRequest request, HttpServletResponse response) {
        rateLimiter.check("delete:user:" + principal.userId(), properties.loginAttempts());
        userService.deleteAccount(principal.userId(), input);
        new SecurityContextLogoutHandler().logout(request, response,
                SecurityContextHolder.getContext().getAuthentication());
        return ResponseEntity.noContent().build();
    }
}
