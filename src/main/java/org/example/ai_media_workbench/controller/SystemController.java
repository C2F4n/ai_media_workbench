package org.example.ai_media_workbench.controller;

import org.example.ai_media_workbench.common.result.Result;
import org.example.ai_media_workbench.service.SystemService;
import org.example.ai_media_workbench.vo.system.CapabilitiesVO;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/system")
public class SystemController {
    private final SystemService systemService;

    public SystemController(SystemService systemService) { this.systemService = systemService; }

    /** 获取当前可用功能及上传限制。 */
    @GetMapping("/capabilities")
    public Result<CapabilitiesVO> capabilities() {
        return Result.success(systemService.getCapabilities());
    }
}
