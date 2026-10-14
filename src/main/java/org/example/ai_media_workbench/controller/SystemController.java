package org.example.ai_media_workbench.controller;

import org.example.ai_media_workbench.common.web.RequestIdFilter;
import org.example.ai_media_workbench.config.AuthProperties;
import org.example.ai_media_workbench.vo.system.CapabilitiesVO;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/system")
public class SystemController {
    private final AuthProperties properties;

    public SystemController(AuthProperties properties) { this.properties = properties; }

    @GetMapping("/capabilities")
    public CapabilitiesVO capabilities(HttpServletRequest request) {
        return new CapabilitiesVO(properties.registrationEnabled(), false, false, false, false, false, false,
                false, 1073741824L, 900000L, List.of(), RequestIdFilter.get(request));
    }
}
