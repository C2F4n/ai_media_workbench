package org.example.ai_media_workbench.controller;

import jakarta.validation.Valid;
import java.util.UUID;
import org.example.ai_media_workbench.common.result.Result;
import org.example.ai_media_workbench.common.security.AccountPrincipal;
import org.example.ai_media_workbench.dto.transcript.*;
import org.example.ai_media_workbench.service.TranscriptAnalysisService;
import org.example.ai_media_workbench.vo.transcript.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

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
