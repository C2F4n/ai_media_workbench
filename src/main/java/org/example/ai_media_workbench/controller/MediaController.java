package org.example.ai_media_workbench.controller;

import jakarta.validation.Valid;
import jakarta.servlet.http.HttpServletRequest;
import java.net.URI;
import java.util.UUID;
import org.example.ai_media_workbench.common.exception.BusinessException;
import org.example.ai_media_workbench.common.exception.ErrorCode;
import org.example.ai_media_workbench.common.result.Result;
import org.example.ai_media_workbench.common.security.AccountPrincipal;
import org.example.ai_media_workbench.dto.common.PageQuery;
import org.example.ai_media_workbench.service.MediaService;
import org.example.ai_media_workbench.vo.common.PageVO;
import org.example.ai_media_workbench.vo.media.MediaVO;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartHttpServletRequest;

@RestController
@RequestMapping("/api/media")
public class MediaController {
    private final MediaService media;
    public MediaController(MediaService media) { this.media=media; }

    @PostMapping(consumes=MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Result<MediaVO>> upload(@AuthenticationPrincipal AccountPrincipal principal,
                                                 MultipartHttpServletRequest request) {
        if(!request.getParameterMap().isEmpty() || request.getMultiFileMap().size()!=1
                || request.getFiles("file").size()!=1) throw new BusinessException(ErrorCode.INVALID_REQUEST);
        var saved=media.upload(principal.userId(),request.getFile("file"));
        return ResponseEntity.accepted().location(URI.create("/api/media/"+saved.id())).body(Result.success(saved));
    }

    @GetMapping
    public Result<PageVO<MediaVO>> list(@AuthenticationPrincipal AccountPrincipal principal,@Valid @ModelAttribute PageQuery query,
                                        HttpServletRequest request) {
        if(request.getParameterMap().keySet().stream().anyMatch(key->!key.equals("page") && !key.equals("pageSize"))) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST);
        }
        return Result.success(media.list(principal.userId(),query));
    }

    @GetMapping("/{mediaId}")
    public Result<MediaVO> get(@AuthenticationPrincipal AccountPrincipal principal,@PathVariable UUID mediaId) {
        return Result.success(media.get(principal.userId(),mediaId.toString()));
    }

    @PostMapping("/{mediaId}/probe")
    public ResponseEntity<Result<MediaVO>> retry(@AuthenticationPrincipal AccountPrincipal principal,@PathVariable UUID mediaId) {
        return ResponseEntity.accepted().body(Result.success(media.retryProbe(principal.userId(),mediaId.toString())));
    }
}
