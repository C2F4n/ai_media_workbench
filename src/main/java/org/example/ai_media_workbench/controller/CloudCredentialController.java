package org.example.ai_media_workbench.controller;

import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import java.util.List;
import org.example.ai_media_workbench.common.result.Result;
import org.example.ai_media_workbench.common.security.AccountPrincipal;
import org.example.ai_media_workbench.dto.cloud.DeleteCloudCredentialRequest;
import org.example.ai_media_workbench.dto.cloud.SaveCloudCredentialRequest;
import org.example.ai_media_workbench.service.CloudCredentialService;
import org.example.ai_media_workbench.vo.cloud.CloudCredentialVO;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 当前账号的云端配置入口（/api/users/me/cloud-credentials）：查询、保存和删除供应商凭据及服务来源。
 * CloudCredentialService 负责格式/版本校验、凭据加密和账号隔离；响应只返回配置状态，不回显密钥。
 * 保存配置不会发起付费验证，也不保证密钥有权限或余额；响应禁止缓存，避免保留个人配置状态。
 */
@RestController
@RequestMapping("/api/users/me/cloud-credentials")
public class CloudCredentialController {
    private final CloudCredentialService service;
    public CloudCredentialController(CloudCredentialService service) { this.service=service; }
    @GetMapping public Result<List<CloudCredentialVO>> list(@AuthenticationPrincipal AccountPrincipal user,HttpServletResponse response) {
        response.setHeader("Cache-Control","no-store"); return Result.success(service.list(user.userId()));
    }
    @PutMapping("/{provider}") public Result<CloudCredentialVO> save(@AuthenticationPrincipal AccountPrincipal user,@PathVariable String provider,
            @Valid @RequestBody SaveCloudCredentialRequest input,HttpServletResponse response) {
        response.setHeader("Cache-Control","no-store"); return Result.success(service.save(user.userId(),provider,input));
    }
    @DeleteMapping("/{provider}") public Result<CloudCredentialVO> delete(@AuthenticationPrincipal AccountPrincipal user,@PathVariable String provider,
            @Valid @RequestBody DeleteCloudCredentialRequest input,HttpServletResponse response) {
        response.setHeader("Cache-Control","no-store"); return Result.success(service.delete(user.userId(),provider,input.expectedVersion()));
    }
}
