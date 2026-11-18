package org.example.ai_media_workbench.controller;

import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import java.util.UUID;
import org.example.ai_media_workbench.common.result.Result;
import org.example.ai_media_workbench.common.security.AccountPrincipal;
import org.example.ai_media_workbench.dto.transcript.TranslateTranscriptRequest;
import org.example.ai_media_workbench.service.TranscriptTranslationService;
import org.example.ai_media_workbench.vo.transcript.TranscriptTranslationVO;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

/**
 * 字幕翻译入口（/api/transcripts/{id}/translations）：接收目标语言和字幕版本，返回对应批次的翻译建议。
 * TranscriptTranslationService 负责校验字幕快照、组织模型调用和检查返回结果，Controller 只包装 Result。
 * 翻译建议不会自动覆盖已保存字幕；用户确认后复用字幕更新接口另存版本，可用于译文或双语字幕。
 */
@RestController
public class TranscriptTranslationController {
    private final TranscriptTranslationService service;
    public TranscriptTranslationController(TranscriptTranslationService service) { this.service=service; }
    @PostMapping("/api/transcripts/{id}/translations")
    public Result<TranscriptTranslationVO> translate(@AuthenticationPrincipal AccountPrincipal user,@PathVariable UUID id,
                                                     @Valid @RequestBody TranslateTranscriptRequest input,HttpServletResponse response) {
        response.setHeader("Cache-Control","no-store");
        return Result.success(service.translate(user.userId(),id.toString(),input));
    }
}
