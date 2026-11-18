package org.example.ai_media_workbench.service;

import org.example.ai_media_workbench.dto.common.PageQuery;
import org.example.ai_media_workbench.dto.processing.CreatePlanRequest;
import org.example.ai_media_workbench.dto.processing.UpdatePlanRequest;
import org.example.ai_media_workbench.vo.common.PageVO;
import org.example.ai_media_workbench.vo.processing.PlanVO;
import org.example.ai_media_workbench.vo.processing.TaskVO;

/**
 * Controller 使用的业务契约；Spring 注入 ProcessingServiceImpl，测试时也可替换为模拟实现。
 * 请求 DTO 描述用户输入，返回 VO 描述对外结果；数据库 Entity 和 SQL 不暴露给 Controller 的调用方。
 */
public interface ProcessingService {
    PlanVO create(String userId, CreatePlanRequest input);
    PlanVO update(String userId, String id, UpdatePlanRequest input);
    PlanVO plan(String userId, String id);
    PageVO<PlanVO> plans(String userId, String mediaId, PageQuery query);
    void deletePlan(String userId, String id);
    void deleteTaskHistory(String userId, String id);
    /** 确认指定版本并入队；返回任务不代表处理已完成，相同方案重复执行返回同一任务。 */
    TaskVO execute(String userId, String id, int expectedVersion);
    TaskVO task(String userId, String id);
    PageVO<TaskVO> tasks(String userId, String mediaId, PageQuery query);
    TaskVO cancel(String userId, String id);
}
