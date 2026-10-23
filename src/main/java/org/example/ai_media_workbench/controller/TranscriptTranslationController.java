package org.example.ai_media_workbench.controller;

import java.util.UUID;
import jakarta.validation.Valid;
import org.example.ai_media_workbench.common.result.Result;
import org.example.ai_media_workbench.common.security.AccountPrincipal;
import org.example.ai_media_workbench.dto.transcript.TranslateTranscriptRequest;
import org.example.ai_media_workbench.service.TranscriptTranslationService;
import org.example.ai_media_workbench.vo.transcript.TranscriptTranslationVO;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
public class TranscriptTranslationController {
    private final TranscriptTranslationService service;
    public TranscriptTranslationController(TranscriptTranslationService service) { this.service=service; }
    @PostMapping("/api/transcripts/{id}/translations")
    public Result<TranscriptTranslationVO> translate(@AuthenticationPrincipal AccountPrincipal user,@PathVariable UUID id,
                                                     @Valid @RequestBody TranslateTranscriptRequest input,jakarta.servlet.http.HttpServletResponse response) {
        response.setHeader("Cache-Control","no-store");
        return Result.success(service.translate(user.userId(),id.toString(),input));
    }
}
