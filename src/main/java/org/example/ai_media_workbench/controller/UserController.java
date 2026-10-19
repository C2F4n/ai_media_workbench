package org.example.ai_media_workbench.controller;

import org.example.ai_media_workbench.common.security.AccountPrincipal;
import org.example.ai_media_workbench.common.security.AuthRateLimiter;
import org.example.ai_media_workbench.common.security.LoginSessionManager;
import org.example.ai_media_workbench.common.result.Result;
import org.example.ai_media_workbench.properties.AuthProperties;
import org.example.ai_media_workbench.dto.user.ChangePasswordRequest;
import org.example.ai_media_workbench.dto.user.UpdateUserRequest;
import org.example.ai_media_workbench.dto.user.DeleteUserRequest;
import org.example.ai_media_workbench.service.UserService;
import org.example.ai_media_workbench.vo.user.UserVO;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** 当前账号接口依赖 UserService 接口；只组织请求、VO 与 Result，不直接调用 Mapper 或实现类。 */
@RestController
@RequestMapping("/api/users/me")
public class UserController {
    private final UserService userService;
    private final AuthRateLimiter rateLimiter;
    private final AuthProperties properties;
    private final LoginSessionManager loginSessions;

    public UserController(UserService userService, AuthRateLimiter rateLimiter, AuthProperties properties,
                          LoginSessionManager loginSessions) {
        this.userService = userService;
        this.rateLimiter = rateLimiter;
        this.properties = properties;
        this.loginSessions = loginSessions;
    }

    /** 获取当前登录用户的资料。 */
    @GetMapping
    public Result<UserVO> current(@AuthenticationPrincipal AccountPrincipal principal) {
        // 用户 ID 来自安全上下文，不接受前端指定账号；前端通过此接口恢复登录状态。
        return Result.success(UserVO.from(userService.getActiveUser(principal.userId())));
    }

    /** 修改当前用户的昵称并返回更新后的资料。 */
    @PatchMapping
    public Result<UserVO> update(@AuthenticationPrincipal AccountPrincipal principal,
                                @Valid @RequestBody UpdateUserRequest input) {
        return Result.success(UserVO.from(userService.updateProfile(principal.userId(), input)));
    }

    /** 修改密码并退出所有设备，要求重新登录。 */
    @PutMapping("/password")
    public Result<Void> changePassword(@AuthenticationPrincipal AccountPrincipal principal,
                                        @Valid @RequestBody ChangePasswordRequest input,
                                        HttpServletRequest request, HttpServletResponse response) {
        rateLimiter.check("password:user:" + principal.userId(), properties.loginAttempts());
        // 业务层修改密码并撤销全部设备会话；这里再清除当前请求上下文，要求重新登录。
        userService.changePassword(principal.userId(), input);
        loginSessions.clear(request, response);
        return Result.success();
    }

    /** 注销当前账号并清除登录状态。 */
    @DeleteMapping
    public Result<Void> deleteAccount(@AuthenticationPrincipal AccountPrincipal principal,
            @Valid @RequestBody DeleteUserRequest input, HttpServletRequest request, HttpServletResponse response) {
        rateLimiter.check("delete:user:" + principal.userId(), properties.loginAttempts());
        // 注销账号不可恢复，与 /api/auth/logout 的“退出登录”不同。
        userService.deleteAccount(principal.userId(), input);
        loginSessions.clear(request, response);
        return Result.success();
    }
}
