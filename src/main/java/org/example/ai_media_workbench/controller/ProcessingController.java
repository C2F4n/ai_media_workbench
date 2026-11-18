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
import org.example.ai_media_workbench.dto.processing.CreatePlanRequest;
import org.example.ai_media_workbench.dto.processing.ExecutePlanRequest;
import org.example.ai_media_workbench.dto.processing.UpdatePlanRequest;
import org.example.ai_media_workbench.entity.enums.TaskStatus;
import org.example.ai_media_workbench.service.ProcessingService;
import org.example.ai_media_workbench.vo.common.PageVO;
import org.example.ai_media_workbench.vo.processing.PlanVO;
import org.example.ai_media_workbench.vo.processing.TaskVO;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * 处理方案与任务的 HTTP 入口：创建方案只保存参数，execute 才将确认过的方案放入后台队列。
 * 提供方案创建/更新/查询/删除，以及任务查询、取消和历史记录删除；不在请求线程里运行 FFmpeg。
 * Controller 注入 ProcessingService 接口，不绑定实现类；@Valid 校验 DTO，Service 校验业务规则。
 * {@code @AuthenticationPrincipal} 的账号来自已验证会话，不接受前端传入 userId 来决定资源归属。
 */
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
        // 202 只表示任务已受理，前端需继续查询任务状态；幂等重试拿到终态任务时返回 200。
        return ResponseEntity.status(task.active() ? 202 : 200).body(Result.success(task));
    }
    @DeleteMapping("/api/operation-plans/{id}")
    public Result<Void> deletePlan(@AuthenticationPrincipal AccountPrincipal user, @PathVariable UUID id) {
        processing.deletePlan(user.userId(), id.toString());
        return Result.success();
    }
    @DeleteMapping("/api/tasks/{id}")
    public Result<Void> deleteTaskHistory(@AuthenticationPrincipal AccountPrincipal user, @PathVariable UUID id) {
        processing.deleteTaskHistory(user.userId(), id.toString());
        return Result.success();
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
