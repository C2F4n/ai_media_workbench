package org.example.ai_media_workbench.common.ai;

import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.example.ai_media_workbench.common.exception.BusinessException;
import org.example.ai_media_workbench.common.exception.ErrorCode;
import org.example.ai_media_workbench.service.OperationPlanner;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

/** 标准Chat Completions工具目录；工具只能提交候选方案，不能执行FFmpeg或访问文件。 */
public final class MediaPlanTools {
    private MediaPlanTools() {}

    public static List<Map<String, Object>> definitions(OperationPlanner.Context context) {
        var range = object(Map.of("startMs", integer(0), "endMs", integer(1)), List.of("startMs", "endMs"));
        var properties = new LinkedHashMap<String, Object>();
        properties.put("operation", enumeration(context.supportedOperations().stream()
                .filter(value -> !value.equals("burn_subtitles")).toList()));
        properties.put("outputFormat", enumeration(List.of("mp4", "mov", "mkv", "webm", "mp3", "m4a", "wav", "flac")));
        properties.put("videoCodec", nullable(enumeration(List.of("h264", "hevc", "vp9", "av1"))));
        properties.put("resolutionPreset", nullable(enumeration(List.of("source", "360p", "480p", "720p", "1080p", "1440p", "2160p", "custom"))));
        properties.put("audioMode", enumeration(List.of("keep", "mute")));
        properties.put("startMs", nullable(integer(0))); properties.put("endMs", nullable(integer(1)));
        properties.put("width", nullable(integer(2))); properties.put("height", nullable(integer(2)));
        properties.put("targetSizeBytes", nullable(integer(32768)));
        properties.put("extractAudio", Map.of("type", "boolean"));
        properties.put("clips", array(range, 1, 20));
        var steps = new LinkedHashMap<>(properties);
        steps.put("operation", enumeration(List.of("trim", "resize", "join_clips", "mute", "export")));
        steps.remove("audioMode");
        properties.put("steps", array(object(steps, List.of("operation")), 1, 12));
        return List.of(tool("submit_media_plan", "提交完整候选处理方案；业务层校验后由用户确认，不会立即执行。",
                        object(Map.of("parameters", object(properties, List.of("operation", "outputFormat"))), List.of("parameters"))),
                tool("request_clarification", "需求不明确、不支持或冲突时提出固定澄清问题，不猜测或执行。",
                        object(Map.of("questions", Map.of("type", "array", "minItems", 1, "maxItems", 3, "uniqueItems", true,
                                "items", enumeration(java.util.Arrays.stream(OperationPlanner.Question.values()).map(Enum::name).toList()))), List.of("questions"))));
    }

    public static JsonNode readResponse(JsonNode response, ObjectMapper json) {
        var choice = response.path("choices").path(0);
        var message = choice.path("message");
        var calls = message.path("tool_calls");
        if (!"tool_calls".equals(choice.path("finish_reason").asText()) || !calls.isArray() || calls.size() != 1
                || (!message.path("refusal").isMissingNode() && !message.path("refusal").isNull())) invalid();
        var call = calls.path(0);
        var function = call.path("function");
        if (!"function".equals(call.path("type").asText()) || !function.path("arguments").isString()) invalid();
        String arguments = function.path("arguments").asText();
        if (arguments.getBytes(StandardCharsets.UTF_8).length > 64 * 1024) invalid();
        JsonNode value = json.readTree(arguments);
        if (!value.isObject() || value.size() != 1) invalid();
        String name = function.path("name").asText();
        if (name.equals("submit_media_plan") && value.path("parameters").isObject()) return value;
        if (name.equals("request_clarification") && value.path("questions").isArray()) return value;
        invalid(); return null;
    }

    private static Map<String, Object> tool(String name, String description, Map<String, Object> parameters) {
        return Map.of("type", "function", "function", Map.of("name", name, "description", description, "parameters", parameters));
    }
    private static Map<String, Object> object(Map<String, ?> properties, List<String> required) {
        return Map.of("type", "object", "properties", properties, "required", required, "additionalProperties", false);
    }
    private static Map<String, Object> array(Map<String, Object> items, int min, int max) {
        return Map.of("type", "array", "items", items, "minItems", min, "maxItems", max);
    }
    private static Map<String, Object> integer(long minimum) { return Map.of("type", "integer", "minimum", minimum); }
    private static Map<String, Object> enumeration(List<String> values) { return Map.of("type", "string", "enum", values); }
    private static Map<String, Object> nullable(Map<String, Object> value) { return Map.of("anyOf", List.of(value, Map.of("type", "null"))); }
    private static void invalid() { throw new BusinessException(ErrorCode.AI_PLAN_FAILED); }
}
