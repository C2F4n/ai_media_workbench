package org.example.ai_media_workbench.service;

import org.example.ai_media_workbench.vo.system.CapabilitiesVO;

/** 查询实际能力及配置限制；Controller 不自行拼装能力开关。 */
public interface SystemService {
    /** 返回当前可用功能及上传限制。 */
    CapabilitiesVO getCapabilities();
}
