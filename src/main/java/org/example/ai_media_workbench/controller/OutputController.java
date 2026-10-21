package org.example.ai_media_workbench.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.UUID;
import org.example.ai_media_workbench.common.web.MediaStreams;
import org.example.ai_media_workbench.common.result.Result;
import org.example.ai_media_workbench.common.security.AccountPrincipal;
import org.example.ai_media_workbench.dto.common.PageQuery;
import org.example.ai_media_workbench.service.OutputService;
import org.example.ai_media_workbench.vo.common.PageVO;
import org.example.ai_media_workbench.vo.processing.OutputVO;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

@RestController
public class OutputController {
    private final OutputService outputs;
    public OutputController(OutputService outputs) { this.outputs = outputs; }

    @GetMapping("/api/outputs")
    public Result<PageVO<OutputVO>> list(@AuthenticationPrincipal AccountPrincipal user, @Valid @ModelAttribute PageQuery query,
                                        @RequestParam(required = false) UUID mediaId, HttpServletRequest request) {
        ProcessingController.validateQuery(request);
        return Result.success(outputs.list(user.userId(), ProcessingController.string(mediaId), query));
    }
    @GetMapping("/api/outputs/{id}")
    public Result<OutputVO> get(@AuthenticationPrincipal AccountPrincipal user, @PathVariable UUID id) {
        return Result.success(outputs.get(user.userId(), id.toString()));
    }
    @DeleteMapping("/api/outputs/{id}")
    public Result<Void> delete(@AuthenticationPrincipal AccountPrincipal user, @PathVariable UUID id) {
        outputs.delete(user.userId(), id.toString());
        return Result.success();
    }
    @GetMapping("/api/outputs/{id}/download")
    public ResponseEntity<StreamingResponseBody> download(@AuthenticationPrincipal AccountPrincipal user, @PathVariable UUID id) {
        var file = outputs.file(user.userId(), id.toString());
        return MediaStreams.download(file.path(), file.info().sizeBytes(), file.info().contentType(), file.info().filename());
    }
    @GetMapping("/api/outputs/{id}/preview")
    public ResponseEntity<StreamingResponseBody> preview(@AuthenticationPrincipal AccountPrincipal user, @PathVariable UUID id,
                                      @RequestHeader(value = "Range", required = false) String header) {
        var file = outputs.file(user.userId(), id.toString());
        if (file.info().previewUrl() == null) throw new org.example.ai_media_workbench.common.exception.BusinessException(org.example.ai_media_workbench.common.exception.ErrorCode.MEDIA_PREVIEW_UNAVAILABLE);
        return MediaStreams.preview(file.path(), file.info().sizeBytes(), file.info().contentType(), file.info().filename(), header);
    }
}
