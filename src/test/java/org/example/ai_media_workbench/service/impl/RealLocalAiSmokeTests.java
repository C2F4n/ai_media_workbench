package org.example.ai_media_workbench.service.impl;

import java.util.List;
import org.example.ai_media_workbench.properties.LocalAiProperties;
import org.example.ai_media_workbench.service.CloudCredentialService;
import org.example.ai_media_workbench.service.OperationPlanner;
import org.example.ai_media_workbench.dto.cloud.SaveCloudCredentialRequest.Mode;
import org.example.ai_media_workbench.dto.processing.WorkflowParameters;
import org.example.ai_media_workbench.vo.media.MediaMetadataVO;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import tools.jackson.databind.ObjectMapper;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

/** 显式启用的真实模型冒烟测试；平时不启动推理进程，不写数据库、不执行FFmpeg。 */
@EnabledIfEnvironmentVariable(named="LOCAL_AI_SMOKE_PORT",matches="[0-9]+")
class RealLocalAiSmokeTests {
    @Test void realModelPlansOrderedWorkflowUsingTheProductionPromptAndJsonBoundary() {
        var json=new ObjectMapper(); var transport=new CloudTransport();
        try {
            var local=new LocalAiClient(new LocalAiProperties(true,Integer.parseInt(System.getenv("LOCAL_AI_SMOKE_PORT")),"qwen3.5-4b",System.getenv("LOCAL_AI_API_KEY")),transport,json);
            assertThat(local.isAvailable()).isTrue();
            var credentials=mock(CloudCredentialService.class); when(credentials.source("smoke-user","deepseek")).thenReturn(Mode.SERVER);
            var cloud=mock(DeepSeekJsonClient.class);
            var planner=new DeepSeekOperationPlanner(new TextAiJsonClient(credentials,cloud,local),json);
            var context=new OperationPlanner.Context(new MediaMetadataVO("mp4",30000,1920,1080,"h264",true,"aac"),1000000,
                    List.of("workflow","export","trim","mute","join_clips"),null,null,List.of("mp4","webm"),List.of("h264","vp9"),1073741824L);
            var proposal=planner.propose("保留视频前5秒，缩放到360p，然后静音，最后导出MP4。",context,"smoke-user");
            assertThat(proposal.questions()).isEmpty();
            var parameters=WorkflowSettings.parse(proposal.parameters());
            WorkflowSettings.compile(parameters,context.metadata(),context.sizeBytes(),context.maxOutputBytes());
            assertThat(parameters.operation()).isEqualTo("workflow");
            assertThat(parameters.steps()).extracting(WorkflowParameters.Step::operation).containsExactly("trim","resize","mute","export");
            assertThat((WorkflowParameters.Trim)parameters.steps().get(0)).isEqualTo(new WorkflowParameters.Trim("trim",0,5000));
            assertThat(((WorkflowParameters.Resize)parameters.steps().get(1)).resolutionPreset()).isEqualTo("360p");
            assertThat(parameters.outputFormat()).isEqualTo("mp4");
            verifyNoInteractions(cloud);
        } finally { transport.destroy(); }
    }
}
