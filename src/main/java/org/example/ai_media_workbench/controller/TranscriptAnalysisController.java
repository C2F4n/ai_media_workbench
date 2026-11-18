package org.example.ai_media_workbench.controller;

import jakarta.validation.Valid;
import java.util.UUID;
import org.example.ai_media_workbench.common.result.Result;
import org.example.ai_media_workbench.common.security.AccountPrincipal;
import org.example.ai_media_workbench.dto.transcript.RecommendClipsRequest;
import org.example.ai_media_workbench.dto.transcript.SearchTranscriptRequest;
import org.example.ai_media_workbench.service.TranscriptAnalysisService;
import org.example.ai_media_workbench.vo.transcript.ClipRecommendationsVO;
import org.example.ai_media_workbench.vo.transcript.TranscriptSearchVO;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

/**
 * 基于已保存字幕的内容分析入口：按文字要求搜索片段，或按目标和时长预算推荐片段。
 * 调用 TranscriptAnalysisService 完成字幕 RAG 召回、模型筛选，以及原文/时间引用和版本校验。
 * 只返回有字幕依据的候选区间，不直接剪辑视频；用户带入裁切或拼接工具确认后才创建处理任务。
 */
@RestController
public class TranscriptAnalysisController {
    private final TranscriptAnalysisService service;
    public TranscriptAnalysisController(TranscriptAnalysisService service) { this.service=service; }
    @PostMapping("/api/media/{mediaId}/search")
    public Result<TranscriptSearchVO> search(@AuthenticationPrincipal AccountPrincipal user,@PathVariable UUID mediaId,@Valid @RequestBody SearchTranscriptRequest input) {
        return Result.success(service.search(user.userId(),mediaId.toString(),input));
    }
    @PostMapping("/api/media/{mediaId}/clip-recommendations")
    public Result<ClipRecommendationsVO> recommend(@AuthenticationPrincipal AccountPrincipal user,@PathVariable UUID mediaId,@Valid @RequestBody RecommendClipsRequest input) {
        return Result.success(service.recommend(user.userId(),mediaId.toString(),input));
    }
}
