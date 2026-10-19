package org.example.ai_media_workbench.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.util.List;
import java.util.UUID;
import org.example.ai_media_workbench.common.exception.RangeNotSatisfiableException;
import org.example.ai_media_workbench.common.result.Result;
import org.example.ai_media_workbench.common.security.AccountPrincipal;
import org.example.ai_media_workbench.dto.common.PageQuery;
import org.example.ai_media_workbench.service.OutputService;
import org.example.ai_media_workbench.vo.common.PageVO;
import org.example.ai_media_workbench.vo.processing.OutputVO;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpRange;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.util.StreamUtils;
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
    @GetMapping("/api/outputs/{id}/download")
    public ResponseEntity<StreamingResponseBody> download(@AuthenticationPrincipal AccountPrincipal user, @PathVariable UUID id) {
        var file = outputs.file(user.userId(), id.toString());
        return stream(file, 0, file.info().sizeBytes() - 1, false, false);
    }
    @GetMapping("/api/outputs/{id}/preview")
    public ResponseEntity<StreamingResponseBody> preview(@AuthenticationPrincipal AccountPrincipal user, @PathVariable UUID id,
                                      @RequestHeader(value = "Range", required = false) String header) {
        var file = outputs.file(user.userId(), id.toString());
        long size = file.info().sizeBytes();
        List<HttpRange> ranges;
        try { ranges = header == null ? List.of() : HttpRange.parseRanges(header); }
        catch (IllegalArgumentException invalid) { ranges = List.of(); }
        if (ranges.size() != 1) return stream(file, 0, size - 1, true, false);
        long start = ranges.getFirst().getRangeStart(size);
        long end = ranges.getFirst().getRangeEnd(size);
        if (start >= size || start > end) {
            throw new RangeNotSatisfiableException(size);
        }
        return stream(file, start, end, true, true);
    }

    private ResponseEntity<StreamingResponseBody> stream(OutputService.OutputFile file, long start, long end, boolean inline, boolean partial) {
        StreamingResponseBody body = output -> {
            try (var input = Files.newInputStream(file.path())) { StreamUtils.copyRange(input, output, start, end); }
        };
        var response = ResponseEntity.status(partial ? 206 : 200)
                .contentType(MediaType.parseMediaType(file.info().contentType())).contentLength(end - start + 1)
                .header(HttpHeaders.CACHE_CONTROL, "no-store")
                .header(HttpHeaders.CONTENT_DISPOSITION, (inline ? ContentDisposition.inline() : ContentDisposition.attachment())
                        .filename(file.info().filename(), StandardCharsets.UTF_8).build().toString());
        if (inline) response.header(HttpHeaders.ACCEPT_RANGES, "bytes");
        if (partial) response.header(HttpHeaders.CONTENT_RANGE, "bytes " + start + "-" + end + "/" + file.info().sizeBytes());
        return response.body(body);
    }
}
