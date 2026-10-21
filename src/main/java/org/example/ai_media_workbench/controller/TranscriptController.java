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
import org.example.ai_media_workbench.dto.transcript.*;
import org.example.ai_media_workbench.service.TranscriptService;
import org.example.ai_media_workbench.vo.processing.TaskVO;
import org.example.ai_media_workbench.vo.transcript.TranscriptVO;
import org.springframework.http.ContentDisposition;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

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
    public Result<org.example.ai_media_workbench.vo.transcript.TranscriptCorrectionVO> correct(
            @AuthenticationPrincipal AccountPrincipal user,@PathVariable UUID id,@Valid @RequestBody CorrectTranscriptRequest input) {
        return Result.success(service.correct(user.userId(),id.toString(),input));
    }
    private static void query(HttpServletRequest request) {
        if(request.getParameterMap().keySet().stream().anyMatch(key->!key.equals("version"))) throw new BusinessException(ErrorCode.INVALID_REQUEST);
    }
}
