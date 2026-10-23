package org.example.ai_media_workbench.vo.system;

import java.util.List;

public record CapabilitiesVO(
        boolean registration, boolean emailVerification, boolean passwordRecovery,
        boolean aiPlans, boolean asr, boolean semanticSearch, boolean clipRecommendations,
        boolean mediaTool, long maxUploadBytes, long maxDurationMs,
        List<String> supportedOperations, List<String> asrProviders, boolean subtitleCorrection,
        List<String> exportFormats, List<String> exportVideoCodecs, TextAiStatusVO textAi, boolean subtitleTranslation) {}
