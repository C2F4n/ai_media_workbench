package org.example.ai_media_workbench.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.Set;
import java.util.UUID;
import org.example.ai_media_workbench.common.exception.BusinessException;
import org.example.ai_media_workbench.common.exception.ErrorCode;
import org.example.ai_media_workbench.common.result.Result;
import org.example.ai_media_workbench.common.security.AccountPrincipal;
import org.example.ai_media_workbench.dto.common.PageQuery;
import org.example.ai_media_workbench.dto.processing.*;
import org.example.ai_media_workbench.service.ProcessingService;
import org.example.ai_media_workbench.vo.common.PageVO;
import org.example.ai_media_workbench.vo.processing.PlanVO;
import org.example.ai_media_workbench.vo.processing.TaskVO;
import org.example.ai_media_workbench.entity.enums.TaskStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/** HTTP validation and Result wrapping only; business logic depends on the service interface. */
@RestController
public class ProcessingController {
    private final ProcessingService processing;
    public ProcessingController(ProcessingService processing) { this.processing = processing; }

    @PostMapping("/api/operation-plans")
    public ResponseEntity<Result<PlanVO>> create(@AuthenticationPrincipal AccountPrincipal user, @Valid @RequestBody CreatePlanRequest input) {
        var plan = processing.create(user.userId(), input);
        return ResponseEntity.created(URI.create("/api/operation-plans/" + plan.id())).body(Result.success(plan));
    }
    @GetMapping("/api/operation-plans/{id}")
    public Result<PlanVO> plan(@AuthenticationPrincipal AccountPrincipal user, @PathVariable UUID id) {
        return Result.success(processing.plan(user.userId(), id.toString()));
    }
    @PatchMapping("/api/operation-plans/{id}")
    public Result<PlanVO> update(@AuthenticationPrincipal AccountPrincipal user, @PathVariable UUID id, @Valid @RequestBody UpdatePlanRequest input) {
        return Result.success(processing.update(user.userId(), id.toString(), input));
    }
    @GetMapping("/api/operation-plans")
    public Result<PageVO<PlanVO>> plans(@AuthenticationPrincipal AccountPrincipal user, @Valid @ModelAttribute PageQuery query,
                                       @RequestParam(required = false) UUID mediaId, HttpServletRequest request) {
        validateQuery(request);
        return Result.success(processing.plans(user.userId(), string(mediaId), query));
    }
    @PostMapping("/api/operation-plans/{id}/execute")
    public ResponseEntity<Result<TaskVO>> execute(@AuthenticationPrincipal AccountPrincipal user, @PathVariable UUID id,
                                                  @Valid @RequestBody ExecutePlanRequest input) {
        var task = processing.execute(user.userId(), id.toString(), input.expectedVersion());
        return ResponseEntity.status(task.active() ? 202 : 200).body(Result.success(task));
    }
    @GetMapping("/api/tasks/{id}")
    public Result<TaskVO> task(@AuthenticationPrincipal AccountPrincipal user, @PathVariable UUID id) {
        return Result.success(processing.task(user.userId(), id.toString()));
    }
    @GetMapping("/api/tasks")
    public Result<PageVO<TaskVO>> tasks(@AuthenticationPrincipal AccountPrincipal user, @Valid @ModelAttribute PageQuery query,
                                       @RequestParam(required = false) UUID mediaId, HttpServletRequest request) {
        validateQuery(request);
        return Result.success(processing.tasks(user.userId(), string(mediaId), query));
    }
    @PostMapping("/api/tasks/{id}/cancel")
    public ResponseEntity<Result<TaskVO>> cancel(@AuthenticationPrincipal AccountPrincipal user, @PathVariable UUID id) {
        var task = processing.cancel(user.userId(), id.toString());
        return ResponseEntity.status(task.status() == TaskStatus.CANCELLING ? 202 : 200).body(Result.success(task));
    }
    static void validateQuery(HttpServletRequest request) {
        if (!Set.of("page", "pageSize", "mediaId").containsAll(request.getParameterMap().keySet()))
            throw new BusinessException(ErrorCode.INVALID_REQUEST);
    }
    static String string(UUID value) { return value == null ? null : value.toString(); }
}
