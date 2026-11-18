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

/**
 * 处理结果管理入口（/api/outputs）：列出结果、查询详情、删除、下载和兼容格式预览。
 * 与 MediaController 的原始素材区分：这里操作的是任务成功后发布的输出文件，不重新执行处理。
 * OutputService 校验当前账号的访问权限，MediaStreams 负责下载响应和预览 Range 分段传输。
 * 普通业务响应使用 Result；文件下载/预览成功时直接返回文件流，失败仍交给统一异常处理。
 */
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
