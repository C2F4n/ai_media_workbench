package org.example.ai_media_workbench.controller;

import org.example.ai_media_workbench.common.result.Result;
import org.example.ai_media_workbench.service.SystemService;
import org.example.ai_media_workbench.vo.system.CapabilitiesVO;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 系统能力查询入口（/api/system/capabilities），供前端决定哪些功能、格式和模型选项可以显示或启用。
 * SystemService 汇总上传限制、媒体工具能力和 AI 服务状态；登录后结合当前账号的凭据计算结果。
 * 这里只报告能力，不修改配置或执行处理；前端按钮状态不能代替后端每次请求的权限与参数校验。
 */
@RestController
@RequestMapping("/api/system")
public class SystemController {
    private final SystemService systemService;

    public SystemController(SystemService systemService) { this.systemService = systemService; }

    /** 获取当前可用功能及上传限制。 */
    @GetMapping("/capabilities")
    public Result<CapabilitiesVO> capabilities(@org.springframework.security.core.annotation.AuthenticationPrincipal org.example.ai_media_workbench.common.security.AccountPrincipal user,
                                              jakarta.servlet.http.HttpServletResponse response) {
        response.setHeader("Cache-Control","no-store");
        return Result.success(systemService.getCapabilities(user==null ? null : user.userId()));
    }
}
