package org.example.ai_media_workbench.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.UUID;
import org.example.ai_media_workbench.common.exception.BusinessException;
import org.example.ai_media_workbench.common.exception.ErrorCode;
import org.example.ai_media_workbench.common.result.Result;
import org.example.ai_media_workbench.common.security.AccountPrincipal;
import org.example.ai_media_workbench.dto.transcript.CorrectTranscriptRequest;
import org.example.ai_media_workbench.dto.transcript.TranscriptionRequest;
import org.example.ai_media_workbench.dto.transcript.UpdateTranscriptRequest;
import org.example.ai_media_workbench.service.TranscriptService;
import org.example.ai_media_workbench.vo.processing.TaskVO;
import org.example.ai_media_workbench.vo.transcript.TranscriptCorrectionVO;
import org.example.ai_media_workbench.vo.transcript.TranscriptVO;
import org.springframework.http.ContentDisposition;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * 字幕基础接口入口：提交素材的语音识别任务、读取最新或历史字幕、保存编辑、下载 SRT 和单句校对。
 * TranscriptService 负责账号归属、版本校验与持久化；识别交给后台任务，返回 202 不表示识别已经完成。
 * 校对只返回待采纳建议，不直接改写字幕；保存仍走版本更新接口，SRT 下载成功时直接返回文件内容。
 */
@RestController
public class TranscriptController {
    private final TranscriptService service;
    public TranscriptController(TranscriptService service) { this.service=service; }

    @PostMapping("/api/media/{mediaId}/transcriptions")
    public ResponseEntity<Result<TaskVO>> transcribe(@AuthenticationPrincipal AccountPrincipal user,@PathVariable UUID mediaId,
                                                      @Valid @RequestBody TranscriptionRequest input) {
        var task=service.transcribe(user.userId(),mediaId.toString(),input);
        return ResponseEntity.accepted().location(URI.create("/api/tasks/"+task.id())).body(Result.success(task));
    }
    @GetMapping("/api/media/{mediaId}/transcript")
    public Result<TranscriptVO> latest(@AuthenticationPrincipal AccountPrincipal user,@PathVariable UUID mediaId) {
        return Result.success(service.latest(user.userId(),mediaId.toString()));
    }
    @GetMapping("/api/transcripts/{id}")
    public Result<TranscriptVO> get(@AuthenticationPrincipal AccountPrincipal user,@PathVariable UUID id,
                                    @RequestParam(required=false) @Positive Integer version,HttpServletRequest request) {
        query(request); return Result.success(service.get(user.userId(),id.toString(),version));
    }
    @PatchMapping("/api/transcripts/{id}")
    public Result<TranscriptVO> update(@AuthenticationPrincipal AccountPrincipal user,@PathVariable UUID id,
                                      @Valid @RequestBody UpdateTranscriptRequest input) {
        return Result.success(service.update(user.userId(),id.toString(),input));
    }
    @GetMapping("/api/transcripts/{id}/srt")
    public ResponseEntity<byte[]> srt(@AuthenticationPrincipal AccountPrincipal user,@PathVariable UUID id,
                                     @RequestParam(required=false) @Positive Integer version,HttpServletRequest request) {
        query(request); var file=service.srt(user.userId(),id.toString(),version);
        return ResponseEntity.ok().contentType(MediaType.parseMediaType("application/x-subrip;charset=UTF-8"))
                .contentLength(file.content().length).header("Cache-Control","no-store")
                .header("Content-Disposition",ContentDisposition.attachment().filename(file.filename(),StandardCharsets.UTF_8).build().toString())
                .body(file.content());
    }
    @PostMapping("/api/transcripts/{id}/corrections")
    public Result<TranscriptCorrectionVO> correct(
            @AuthenticationPrincipal AccountPrincipal user,@PathVariable UUID id,@Valid @RequestBody CorrectTranscriptRequest input) {
        return Result.success(service.correct(user.userId(),id.toString(),input));
    }
    private static void query(HttpServletRequest request) {
        if(request.getParameterMap().keySet().stream().anyMatch(key->!key.equals("version"))) throw new BusinessException(ErrorCode.INVALID_REQUEST);
    }
}
