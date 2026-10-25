package org.example.ai_media_workbench.service.impl;

import java.util.Locale;
import org.example.ai_media_workbench.common.exception.ErrorCode;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

/** 只解释厂商的机器错误码，不回传可能包含密钥、提示词或音频信息的原始报错。 */
final class CloudFailures {
    private static final ObjectMapper JSON = new ObjectMapper();
    private CloudFailures() { }

    static ErrorCode http(int status, byte[] body) {
        // HTTP鉴权状态优先，不能被不可信响应体中的其他代码覆盖。
        if (status == 401) return ErrorCode.CLOUD_AUTH_FAILED;
        if (status == 402) return ErrorCode.CLOUD_QUOTA_EXCEEDED;
        if (status >= 500) return status == 504 ? ErrorCode.CLOUD_TIMEOUT : ErrorCode.CLOUD_SERVICE_UNAVAILABLE;
        try {
            var root = JSON.readTree(body);
            for (var code : new JsonNode[]{root.path("error").path("code"), root.path("code"), root.path("error").path("type")}) {
                var known = code(code);
                if (known != null) return known;
            }
        } catch (Exception ignored) { /* 非JSON错误页按HTTP状态分类。 */ }
        return switch (status) {
            case 403 -> ErrorCode.CLOUD_PERMISSION_DENIED;
            case 404 -> ErrorCode.CLOUD_MODEL_UNAVAILABLE;
            case 408 -> ErrorCode.CLOUD_TIMEOUT;
            case 429 -> ErrorCode.CLOUD_RATE_LIMITED;
            case 400, 413, 415, 422 -> ErrorCode.CLOUD_REQUEST_REJECTED;
            default -> ErrorCode.CLOUD_SERVICE_UNAVAILABLE;
        };
    }

    static ErrorCode code(JsonNode node) {
        if (!node.isString() || node.asText().length() > 128) return null;
        return switch (node.asText().toLowerCase(Locale.ROOT)) {
            case "invalidapikey", "invalid_api_key", "authenticationerror" -> ErrorCode.CLOUD_AUTH_FAILED;
            case "arrearage", "insufficient_quota", "quotaexceeded", "allocationquota.freetieronly",
                    "accountoverdueerror", "operationdenied.serviceoverdue", "setlimitexceeded", "isv.out_of_service",
                    "credit_balance_exhausted", "billing_hard_limit_reached" -> ErrorCode.CLOUD_QUOTA_EXCEEDED;
            case "modelnotfound", "model_not_found", "modelnotopen", "invalidendpointormodel.notfound",
                    "invalidendpointormodel.modelidaccessdisabled", "model.accessdenied", "endpoint.accessdenied" -> ErrorCode.CLOUD_MODEL_UNAVAILABLE;
            case "accessdenied", "workspace.accessdenied", "operationdenied", "operationdenied.servicenotopen", "permission_denied" -> ErrorCode.CLOUD_PERMISSION_DENIED;
            case "throttling", "throttling.ratelimit", "throttling.allocationquota", "rate_limit_exceeded",
                    "accountratelimitexceeded", "inflightbatchsizeexceeded", "requestbursttoofast" -> ErrorCode.CLOUD_RATE_LIMITED;
            case "requesttimeout", "request_time_out", "requesttimedout", "request_timeout" -> ErrorCode.CLOUD_TIMEOUT;
            case "client_error" -> ErrorCode.CLOUD_REQUEST_REJECTED;
            default -> null;
        };
    }

    static ErrorCode tencent(int code) {
        return switch (code) {
            case 4002 -> ErrorCode.CLOUD_AUTH_FAILED;
            case 4003 -> ErrorCode.CLOUD_PERMISSION_DENIED;
            case 4004, 4005 -> ErrorCode.CLOUD_QUOTA_EXCEEDED;
            case 4006 -> ErrorCode.CLOUD_RATE_LIMITED;
            case 4008, 5003 -> ErrorCode.CLOUD_TIMEOUT;
            case 4009 -> ErrorCode.CLOUD_NETWORK_ERROR;
            case 4001, 4007, 4010, 4011, 4012 -> ErrorCode.CLOUD_REQUEST_REJECTED;
            case 5001 -> ErrorCode.CLOUD_SERVICE_UNAVAILABLE;
            default -> ErrorCode.ASR_FAILED;
        };
    }
}
