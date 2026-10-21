package org.example.ai_media_workbench.service.impl;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import org.example.ai_media_workbench.common.exception.BusinessException;
import org.example.ai_media_workbench.common.exception.ErrorCode;
import org.example.ai_media_workbench.dto.processing.ExportParameters;
import org.example.ai_media_workbench.dto.processing.JoinClipsParameters.ClipRange;
import org.example.ai_media_workbench.dto.processing.WorkflowParameters;
import org.example.ai_media_workbench.dto.processing.WorkflowParameters.*;
import org.example.ai_media_workbench.vo.media.MediaMetadataVO;
import tools.jackson.databind.JsonNode;

/** 独立步骤编译成源区间和滤镜链，不枚举操作组合，也不执行模型提供的命令。 */
public final class WorkflowSettings {
    public static final int MAX_STEPS = 12, MAX_CLIPS = 20;
    public static final long MAX_DURATION_MS = 900_000;
    private WorkflowSettings() {}

    public static WorkflowParameters parse(JsonNode node) {
        fields(node, Set.of("operation", "outputFormat", "steps"));
        if (!node.path("outputFormat").isString() || !node.path("steps").isArray()
                || node.path("steps").isEmpty() || node.path("steps").size() > MAX_STEPS) throw invalid();
        var steps = new ArrayList<Step>();
        for (var step : node.path("steps")) {
            String op = step.path("operation").asText();
            steps.add(switch (op) {
                case "trim" -> {
                    fields(step, Set.of("operation", "startMs", "endMs"));
                    yield new Trim(op, number(step, "startMs"), number(step, "endMs"));
                }
                case "resize" -> {
                    fields(step, Set.of("operation", "resolutionPreset", "width", "height"));
                    if (!step.path("resolutionPreset").isString()) throw invalid();
                    yield new Resize(op, step.path("resolutionPreset").asText(), integer(step, "width"), integer(step, "height"));
                }
                case "join_clips" -> {
                    fields(step, Set.of("operation", "clips"));
                    if (!step.path("clips").isArray() || step.path("clips").isEmpty() || step.path("clips").size() > MAX_CLIPS) throw invalid();
                    var clips = new ArrayList<ClipRange>();
                    for (var clip : step.path("clips")) {
                        fields(clip, Set.of("startMs", "endMs"));
                        clips.add(new ClipRange(number(clip, "startMs"), number(clip, "endMs")));
                    }
                    yield new Join(op, List.copyOf(clips));
                }
                case "mute" -> { fields(step, Set.of("operation")); yield new Mute(op); }
                case "export" -> {
                    fields(step, Set.of("operation", "outputFormat", "videoCodec", "targetSizeBytes", "extractAudio"));
                    if (!step.path("outputFormat").isString() || step.hasNonNull("videoCodec") && !step.path("videoCodec").isString()
                            || step.has("extractAudio") && !step.path("extractAudio").isBoolean()) throw invalid();
                    String format = step.path("outputFormat").asText();
                    String codec = step.hasNonNull("videoCodec") ? step.path("videoCodec").asText()
                            : audio(format) ? null : "webm".equals(format) ? "vp9" : "h264";
                    yield new Export(op, format, codec, step.hasNonNull("targetSizeBytes") ? number(step, "targetSizeBytes") : null,
                            step.path("extractAudio").asBoolean(false));
                }
                default -> throw invalid();
            });
        }
        if (!(steps.getLast() instanceof Export last) || !last.outputFormat().equals(node.path("outputFormat").asText())
                || steps.stream().filter(Export.class::isInstance).count() != 1) throw invalid();
        return new WorkflowParameters("workflow", last.outputFormat(), List.copyOf(steps));
    }

    public static Compiled compile(WorkflowParameters plan, MediaMetadataVO source, long sourceBytes, long maxBytes) {
        if (plan.steps() == null || plan.steps().isEmpty() || plan.steps().size() > MAX_STEPS
                || !(plan.steps().getLast() instanceof Export) || source.width() == null || source.height() == null) throw invalid();
        var clips = List.of(new ClipRange(0, source.durationMs()));
        var filters = new ArrayList<String>();
        var state = source;
        ExportParameters output = null;
        for (Step step : plan.steps()) {
            switch (step) {
                case Trim trim -> clips = select(clips, List.of(new ClipRange(trim.startMs(), trim.endMs())), 100);
                case Join join -> clips = select(clips, join.clips(), 500);
                case Resize resize -> {
                    var settings = new ExportParameters("export", "mp4", "h264", resize.resolutionPreset(), resize.width(), resize.height(), "keep", null, null, null, false);
                    ExportSettings.validate(settings);
                    int[] size = ExportSettings.dimensions(state, settings);
                    filters.add("scale=" + size[0] + ":" + size[1] + ":flags=lanczos,setsar=1");
                    state = metadata(state, state.durationMs(), size[0], size[1], state.hasAudio());
                }
                case Mute mute -> state = metadata(state, state.durationMs(), state.width(), state.height(), false);
                case Export export -> {
                    if (step != plan.steps().getLast() || !plan.outputFormat().equals(export.outputFormat())) throw invalid();
                    boolean audioOnly = audio(export.outputFormat());
                    if (audioOnly && !state.hasAudio()) throw new BusinessException(ErrorCode.SOURCE_HAS_NO_AUDIO);
                    if (export.extractAudio() && !source.hasAudio()) throw new BusinessException(ErrorCode.SOURCE_HAS_NO_AUDIO);
                    output = new ExportParameters("export", export.outputFormat(), export.videoCodec(), audioOnly ? null : "source", null, null,
                            audioOnly || state.hasAudio() ? "keep" : "mute", null, null, export.targetSizeBytes(), export.extractAudio());
                    // 旁路音轨属于源文件，不能使用已静音的状态做来源校验。
                    var check = new ExportParameters("export", output.outputFormat(), output.videoCodec(), output.resolutionPreset(), null, null,
                            output.audioMode(), null, null, output.targetSizeBytes(), false);
                    ExportSettings.validateSource(check, state, sourceBytes, maxBytes);
                    ExportSettings.validate(output);
                }
            }
            state = metadata(state, duration(clips), state.width(), state.height(), state.hasAudio());
        }
        if (output == null || state.durationMs() > MAX_DURATION_MS) throw invalid();
        if (!output.audioOnly()) {
            int[] size = ExportSettings.dimensions(state, output);
            filters.add("scale=" + size[0] + ":" + size[1] + ":flags=lanczos,setsar=1");
            state = metadata(state, state.durationMs(), size[0], size[1], state.hasAudio());
        }
        return new Compiled(List.copyOf(clips), List.copyOf(filters), state, output);
    }

    // 用当前时间轴选区映射回源区间，重复、重叠、倒序均保留；不进行有损中间导出。
    private static List<ClipRange> select(List<ClipRange> input, List<ClipRange> ranges, long minimum) {
        if (ranges == null || ranges.isEmpty() || ranges.size() > MAX_CLIPS) throw invalid();
        long length = duration(input), total = 0;
        var result = new ArrayList<ClipRange>();
        for (var range : ranges) {
            if (range.startMs() < 0 || range.endMs() > length || range.endMs() <= range.startMs() || range.endMs() - range.startMs() < minimum) throw invalid();
            total += range.endMs() - range.startMs();
            if (total > MAX_DURATION_MS) throw invalid();
            long cursor = 0;
            for (var clip : input) {
                long end = cursor + clip.endMs() - clip.startMs();
                long from = Math.max(cursor, range.startMs()), to = Math.min(end, range.endMs());
                if (to > from) result.add(new ClipRange(clip.startMs() + from - cursor, clip.startMs() + to - cursor));
                if (result.size() > MAX_CLIPS) throw invalid();
                cursor = end;
            }
        }
        return List.copyOf(result);
    }

    private static MediaMetadataVO metadata(MediaMetadataVO m, long duration, int w, int h, boolean audio) {
        return new MediaMetadataVO(m.container(), duration, w, h, m.videoCodec(), audio, audio ? m.audioCodec() : null);
    }
    private static long duration(List<ClipRange> clips) { return clips.stream().mapToLong(c -> c.endMs() - c.startMs()).sum(); }
    private static boolean audio(String format) { return Set.of("mp3", "m4a", "wav", "flac").contains(format); }
    private static void fields(JsonNode node, Set<String> allowed) {
        if (!node.isObject()) throw invalid();
        node.propertyNames().forEach(key -> { if (!allowed.contains(key)) throw invalid(); });
    }
    private static long number(JsonNode node, String key) {
        if (!node.path(key).isIntegralNumber() || !node.path(key).canConvertToLong()) throw invalid();
        return node.path(key).asLong();
    }
    private static Integer integer(JsonNode node, String key) {
        if (!node.hasNonNull(key)) return null;
        long value = number(node, key);
        if (value < Integer.MIN_VALUE || value > Integer.MAX_VALUE) throw invalid();
        return (int) value;
    }
    private static BusinessException invalid() { return new BusinessException(ErrorCode.INVALID_PARAMETERS); }
    public record Compiled(List<ClipRange> clips, List<String> videoFilters, MediaMetadataVO metadata, ExportParameters export) {}
}
