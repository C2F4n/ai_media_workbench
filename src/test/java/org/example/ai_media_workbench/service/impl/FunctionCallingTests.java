package org.example.ai_media_workbench.service.impl;

import java.net.http.HttpRequest;
import java.util.List;
import java.util.Map;
import org.example.ai_media_workbench.common.ai.MediaPlanTools;
import org.example.ai_media_workbench.common.exception.BusinessException;
import org.example.ai_media_workbench.common.exception.ErrorCode;
import org.example.ai_media_workbench.dto.cloud.SaveCloudCredentialRequest.Mode;
import org.example.ai_media_workbench.properties.AiProperties;
import org.example.ai_media_workbench.service.CloudCredentialService;
import org.example.ai_media_workbench.service.OperationPlanner;
import org.example.ai_media_workbench.vo.media.MediaMetadataVO;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class FunctionCallingTests {
    private final ObjectMapper json = new ObjectMapper();
    private final OperationPlanner.Context context = new OperationPlanner.Context(
            new MediaMetadataVO("mp4",20000,1920,1080,"h264",true,"aac"),1000000,
            List.of("workflow","trim","mute"),null,null,List.of("mp4"),List.of("h264"),1073741824L);

    @Test void allPersonalProvidersSendTheRegisteredCatalogAndOnlyAcceptOneToolCall() {
        for (String provider : List.of("deepseek","openai","bailian","doubao")) {
            var credentials=mock(CloudCredentialService.class);
            when(credentials.effective("owner","deepseek")).thenReturn(new AiProperties("","","","","","fixture-key","fixture-model",provider));
            var transport=mock(CloudTransport.class); var client=new CloudTextJsonClient(credentials,transport,json);
            when(transport.post(any(),anyLong(),any(),any())).thenReturn(json.writeValueAsBytes(response("request_clarification","{\"questions\":[\"TRIM_RANGE_REQUIRED\"]}")));
            assertThat(client.plan("JSON schema","ambiguous",context,"owner").path("questions").get(0).asText()).isEqualTo("TRIM_RANGE_REQUIRED");
            var request=ArgumentCaptor.forClass(HttpRequest.class);
            verify(transport,times(1)).post(request.capture(),anyLong(),any(),eq(ErrorCode.AI_PLAN_FAILED));
            assertThat(request.getValue().uri().getScheme()).isEqualTo("https");
            assertThat(request.getValue().headers().firstValue("Authorization")).contains("Bearer fixture-key");
        }
        var tools=json.valueToTree(MediaPlanTools.definitions(context));
        assertThat(tools.path(0).path("function").path("name").asText()).isEqualTo("submit_media_plan");
        assertThat(tools.path(0).path("function").path("parameters").path("properties").path("parameters")
                .path("properties").path("operation").toString()).doesNotContain("burn_subtitles","shell","exec","download");
    }

    @Test void invalidUnknownParallelTruncatedAndMismatchedToolCallsAreRejected() {
        String arguments="{\"parameters\":{\"operation\":\"mute\",\"outputFormat\":\"mp4\"}}";
        assertThat(MediaPlanTools.readResponse(response("submit_media_plan",arguments),json).path("parameters").path("operation").asText()).isEqualTo("mute");
        for (var invalid : List.of(response("execute_shell",arguments),response("request_clarification",arguments),
                response("submit_media_plan","{\"parameters\":{},\"command\":\"unsafe\"}"),response("submit_media_plan","[]"),
                json.readTree("{\"choices\":[{\"finish_reason\":\"length\",\"message\":{\"tool_calls\":[]}}]}"),
                json.readTree("{\"choices\":[{\"finish_reason\":\"stop\",\"message\":{\"content\":\"plain text\"}}]}"))) {
            assertThatThrownBy(()->MediaPlanTools.readResponse(invalid,json)).isInstanceOfSatisfying(BusinessException.class,
                    exception->assertThat(exception.code()).isEqualTo(ErrorCode.AI_PLAN_FAILED));
        }
        var parallel=response("submit_media_plan",arguments);
        var calls=(tools.jackson.databind.node.ArrayNode)parallel.path("choices").path(0).path("message").path("tool_calls");
        calls.add(calls.get(0).deepCopy());
        assertThatThrownBy(()->MediaPlanTools.readResponse(parallel,json)).isInstanceOf(BusinessException.class);
        assertThatThrownBy(()->DeepSeekOperationPlanner.parse(MediaPlanTools.readResponse(response("request_clarification","{\"questions\":[\"SECRET_KEY_REQUIRED\"]}"),json)))
                .isInstanceOf(BusinessException.class);
    }

    @Test void localPlanningKeepsTheExplicitJsonProtocolAndNeverFallsBackToCloud() {
        var credentials=mock(CloudCredentialService.class); when(credentials.source("owner","deepseek")).thenReturn(Mode.SERVER);
        var cloud=mock(CloudTextJsonClient.class); var local=mock(LocalAiClient.class);
        var expected=json.readTree("{\"questions\":[\"TRIM_RANGE_REQUIRED\"]}");
        when(local.complete(anyString(),anyString(),eq(3072),eq(ErrorCode.AI_PLAN_FAILED))).thenReturn(expected);
        assertThat(new TextAiJsonClient(credentials,cloud,local).plan("prompt","content",context,"owner")).isEqualTo(expected);
        verifyNoInteractions(cloud);
    }

    private JsonNode response(String name,String arguments) {
        return json.valueToTree(Map.of("choices",List.of(Map.of("finish_reason","tool_calls","message",Map.of("tool_calls",
                List.of(Map.of("id","call-fixture","type","function","function",Map.of("name",name,"arguments",arguments))))))));
    }
}
