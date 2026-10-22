package org.example.ai_media_workbench.service;

import org.example.ai_media_workbench.dto.common.PageQuery;
import org.example.ai_media_workbench.dto.processing.CreatePlanRequest;
import org.example.ai_media_workbench.dto.processing.UpdatePlanRequest;
import org.example.ai_media_workbench.vo.common.PageVO;
import org.example.ai_media_workbench.vo.processing.PlanVO;
import org.example.ai_media_workbench.vo.processing.TaskVO;

public interface ProcessingService {
    PlanVO create(String userId, CreatePlanRequest input);
    PlanVO update(String userId, String id, UpdatePlanRequest input);
    PlanVO plan(String userId, String id);
    PageVO<PlanVO> plans(String userId, String mediaId, PageQuery query);
    void deletePlan(String userId, String id);
    void deleteTaskHistory(String userId, String id);
    TaskVO execute(String userId, String id, int expectedVersion);
    TaskVO task(String userId, String id);
    PageVO<TaskVO> tasks(String userId, String mediaId, PageQuery query);
    TaskVO cancel(String userId, String id);
}
