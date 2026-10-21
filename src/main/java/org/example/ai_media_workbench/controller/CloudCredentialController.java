package org.example.ai_media_workbench.controller;

import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import java.util.List;
import org.example.ai_media_workbench.common.result.Result;
import org.example.ai_media_workbench.common.security.AccountPrincipal;
import org.example.ai_media_workbench.dto.cloud.*;
import org.example.ai_media_workbench.service.CloudCredentialService;
import org.example.ai_media_workbench.vo.cloud.CloudCredentialVO;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

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
