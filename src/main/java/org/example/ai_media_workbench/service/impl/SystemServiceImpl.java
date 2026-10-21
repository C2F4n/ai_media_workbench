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
    private final org.example.ai_media_workbench.service.SpeechRecognizer recognizer;
    private final org.example.ai_media_workbench.service.SubtitleCorrector corrector;
    private final org.example.ai_media_workbench.service.OperationPlanner planner;
    private final org.example.ai_media_workbench.service.TranscriptAnalyzer analyzer;

    public SystemServiceImpl(AuthProperties auth, MediaProperties media, RegistrationMailSender mail, MediaProbe probe, MediaTranscoder transcoder,
                             org.example.ai_media_workbench.service.SpeechRecognizer recognizer,
                             org.example.ai_media_workbench.service.SubtitleCorrector corrector,
                             org.example.ai_media_workbench.service.OperationPlanner planner,
                             org.example.ai_media_workbench.service.TranscriptAnalyzer analyzer) {
        this.auth = auth;
        this.media = media;
        this.mail = mail;
        this.probe = probe;
        this.transcoder = transcoder;
        this.recognizer = recognizer; this.corrector = corrector;
        this.planner=planner;
        this.analyzer=analyzer;
    }

    /** 返回已开放功能和配置中的上传大小、时长限制。 */
    @Override
    public CapabilitiesVO getCapabilities(String userId) {
        // 配置完成才开放对应云端能力；不以“已有接口路径”代替真实配置状态。
        boolean registration = auth.registrationEnabled() && mail.isAvailable();
        var operations = new java.util.ArrayList<String>();
        if (probe.isAvailable() && transcoder.isAvailable()) operations.addAll(List.of("transcode", "compress", "trim", "mute", "join_clips"));
        if (probe.isAvailable() && transcoder.isAudioExtractionAvailable()) operations.add("extract_audio");
        if (probe.isAvailable() && transcoder.isSubtitleBurnAvailable()) operations.add("burn_subtitles");
        var providers = probe.isAvailable() && transcoder.isAudioExtractionAvailable() ? recognizer.providers(userId) : List.<String>of();
        return new CapabilitiesVO(registration, registration, false, planner.isAvailable(userId) && !operations.isEmpty(), !providers.isEmpty(), analyzer.isAvailable(userId),
                analyzer.isAvailable(userId), probe.isAvailable(), media.maxUploadSize().toBytes(), media.maxDuration().toMillis(),
                List.copyOf(operations), providers, corrector.isAvailable(userId));
    }
}
