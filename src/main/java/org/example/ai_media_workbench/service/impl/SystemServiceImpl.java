package org.example.ai_media_workbench.service.impl;

import java.util.List;
import org.example.ai_media_workbench.properties.AuthProperties;
import org.example.ai_media_workbench.properties.MediaProperties;
import org.example.ai_media_workbench.service.SystemService;
import org.example.ai_media_workbench.service.RegistrationMailSender;
import org.example.ai_media_workbench.service.MediaProbe;
import org.example.ai_media_workbench.service.MediaTranscoder;
import org.example.ai_media_workbench.vo.system.CapabilitiesVO;
import org.springframework.stereotype.Service;

@Service
public class SystemServiceImpl implements SystemService {
    private final AuthProperties auth;
    private final MediaProperties media;
    private final RegistrationMailSender mail;
    private final MediaProbe probe;
    private final MediaTranscoder transcoder;

    public SystemServiceImpl(AuthProperties auth, MediaProperties media, RegistrationMailSender mail, MediaProbe probe, MediaTranscoder transcoder) {
        this.auth = auth;
        this.media = media;
        this.mail = mail;
        this.probe = probe;
        this.transcoder = transcoder;
    }

    /** 返回已开放功能和配置中的上传大小、时长限制。 */
    @Override
    public CapabilitiesVO getCapabilities() {
        // 工具探测成功才开放转换；AI 等尚未接入的能力保持关闭。
        boolean registration = auth.registrationEnabled() && mail.isAvailable();
        return new CapabilitiesVO(registration, registration, false, false, false, false,
                false, probe.isAvailable(), media.maxUploadSize().toBytes(), media.maxDuration().toMillis(),
                probe.isAvailable() && transcoder.isAvailable() ? List.of("transcode", "compress") : List.of());
    }
}
