package org.example.ai_media_workbench.service.impl;

import java.util.List;
import java.util.Map;
import java.util.Set;
import org.example.ai_media_workbench.common.exception.BusinessException;
import org.example.ai_media_workbench.common.exception.ErrorCode;
import org.example.ai_media_workbench.dto.processing.ExportParameters;
import org.example.ai_media_workbench.vo.media.MediaMetadataVO;
import tools.jackson.databind.JsonNode;

/** 容器、编码和资源限制白名单，供计划校验与执行共同使用。 */
public final class ExportSettings {
    private ExportSettings() {}
    public static final List<String> FORMATS = List.of("mp4", "mkv", "mov", "webm", "mp3", "m4a", "wav", "flac");
    public static final Map<String, String> ENCODERS = Map.of("h264", "libx264", "hevc", "libx265", "vp9", "libvpx-vp9", "av1", "libaom-av1");
    private static final Map<String, List<String>> CODECS = Map.of("mp4", List.of("h264", "hevc", "av1"),
            "mov", List.of("h264", "hevc"), "mkv", List.of("h264", "hevc", "vp9", "av1"), "webm", List.of("vp9", "av1"));
    private static final Set<String> FIELDS = Set.of("operation", "outputFormat", "videoCodec", "resolutionPreset", "width", "height", "audioMode", "startMs", "endMs", "targetSizeBytes", "extractAudio");

    public static ExportParameters parse(JsonNode node) {
        if (!node.isObject()) throw invalid();
        node.propertyNames().forEach(key -> { if (!FIELDS.contains(key)) throw invalid(); });
        for (String key : List.of("operation", "outputFormat")) if (!node.path(key).isString()) throw invalid();
        for (String key : List.of("videoCodec", "resolutionPreset", "audioMode"))
            if (node.hasNonNull(key) && !node.path(key).isString()) throw invalid();
        for (String key : List.of("startMs", "endMs", "targetSizeBytes", "width", "height"))
            if (node.hasNonNull(key) && (!node.path(key).isIntegralNumber() || !node.path(key).canConvertToLong())) throw invalid();
        for (String key : List.of("width", "height")) if (node.hasNonNull(key) && !node.path(key).canConvertToInt()) throw invalid();
        if (node.has("extractAudio") && !node.path("extractAudio").isBoolean()) throw invalid();
        String format = node.path("outputFormat").asText();
        boolean audio = Set.of("mp3", "m4a", "wav", "flac").contains(format);
        var p = new ExportParameters("export", format, text(node, "videoCodec", audio ? null : "h264"),
                text(node, "resolutionPreset", audio ? null : "source"), integer(node, "width"), integer(node, "height"),
                text(node, "audioMode", "keep"), number(node, "startMs"), number(node, "endMs"), number(node, "targetSizeBytes"), node.path("extractAudio").asBoolean(false));
        validate(p); return p;
    }

    public static void validate(ExportParameters p) {
        if (!FORMATS.contains(p.outputFormat()) || !Set.of("keep", "mute").contains(p.audioMode())) throw invalid();
        if ((p.startMs() == null) != (p.endMs() == null) || p.startMs() != null && (p.startMs() < 0 || p.endMs() <= p.startMs() || p.endMs() - p.startMs() < 100)) throw invalid();
        if (p.audioOnly()) {
            if (p.videoCodec() != null || p.resolutionPreset() != null || p.width() != null || p.height() != null
                    || !"keep".equals(p.audioMode()) || p.extractAudio() || p.targetSizeBytes() != null) throw invalid();
            return;
        }
        if (!CODECS.get(p.outputFormat()).contains(p.videoCodec())
                || !Set.of("source", "360p", "480p", "720p", "1080p", "1440p", "2160p", "custom").contains(p.resolutionPreset())) throw invalid();
        if ("custom".equals(p.resolutionPreset())) {
            if (p.width() == null || p.height() == null || p.width() < 2 || p.height() < 2 || p.width() > 4096 || p.height() > 4096
                    || (long) p.width() * p.height() > 8_847_360) throw invalid();
        } else if (p.width() != null || p.height() != null) throw invalid();
        // 两遍目标大小模式只开放已验证的编码器；HEVC/AV1 使用质量模式。
        if (p.targetSizeBytes() != null && (p.targetSizeBytes() < 32768 || !Set.of("h264", "vp9").contains(p.videoCodec()))) throw invalid();
    }

    public static void validateSource(ExportParameters p, MediaMetadataVO source, long sourceBytes, long maxBytes) {
        validate(p);
        if (p.endMs() != null && p.endMs() > source.durationMs()) throw invalid();
        if ((p.audioOnly() || p.extractAudio()) && !source.hasAudio()) throw new BusinessException(ErrorCode.SOURCE_HAS_NO_AUDIO);
        if (!p.audioOnly()) dimensions(source, p);
        if (p.targetSizeBytes() != null) {
            if (p.targetSizeBytes() >= sourceBytes || p.targetSizeBytes() > maxBytes) throw invalid();
            budget(source, p);
        }
    }

    public static CompressionBudget budget(MediaMetadataVO source, ExportParameters p) {
        return CompressionBudget.calculate(new MediaMetadataVO(source.container(), p.duration(source.durationMs()), source.width(), source.height(),
                source.videoCodec(), source.hasAudio() && !"mute".equals(p.audioMode()), source.audioCodec()), p.targetSizeBytes());
    }

    public static int[] dimensions(MediaMetadataVO source, ExportParameters p) {
        double scale = 1;
        if ("custom".equals(p.resolutionPreset())) scale = Math.min((double) p.width() / source.width(), (double) p.height() / source.height());
        else if (!"source".equals(p.resolutionPreset())) scale = Integer.parseInt(p.resolutionPreset().replace("p", "")) / (double) Math.min(source.width(), source.height());
        scale = Math.min(1, Math.min(scale, 4096d / Math.max(source.width(), source.height())));
        scale = Math.min(scale, Math.sqrt(8_847_360d / ((long) source.width() * source.height())));
        int w = (int) (source.width() * scale) / 2 * 2, h = (int) (source.height() * scale) / 2 * 2;
        if (w < 2 || h < 2) throw invalid();
        return new int[]{w, h};
    }

    public static String audioCodec(String format) { return switch (format) { case "mp3" -> "mp3"; case "wav" -> "pcm_s16le"; case "flac" -> "flac"; case "webm" -> "opus"; default -> "aac"; }; }
    public static String muxer(String format) { return switch (format) { case "mkv" -> "matroska"; case "m4a" -> "ipod"; default -> format; }; }
    public static String contentType(String format) { return switch (format) { case "mp4" -> "video/mp4"; case "mov" -> "video/quicktime"; case "webm" -> "video/webm"; case "mkv" -> "video/x-matroska"; case "mp3" -> "audio/mpeg"; case "m4a" -> "audio/mp4"; case "wav" -> "audio/wav"; case "flac" -> "audio/flac"; default -> throw invalid(); }; }
    private static Long number(JsonNode n, String key) { return n.hasNonNull(key) ? n.path(key).asLong() : null; }
    private static Integer integer(JsonNode n, String key) { return n.hasNonNull(key) ? n.path(key).asInt() : null; }
    private static String text(JsonNode n, String key, String fallback) { return n.hasNonNull(key) ? n.path(key).asText() : fallback; }
    private static BusinessException invalid() { return new BusinessException(ErrorCode.INVALID_PARAMETERS); }
}
