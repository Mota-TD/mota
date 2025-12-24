package com.mota.project.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.mota.project.entity.WorkPlan;
import com.mota.project.entity.WorkPlanAttachment;

import java.util.List;

/**
 * 工作计划服务接口
 */
public interface WorkPlanService extends IService<WorkPlan> {

    /**
     * 分页查询工作计划
     */
    IPage<WorkPlan> pageWorkPlans(Page<WorkPlan> page, Long departmentTaskId, Long projectId, 
                                   String status, Long submittedBy);

    /**
     * 根据部门任务ID获取工作计划
     */
    WorkPlan getByDepartmentTaskId(Long departmentTaskId);

    /**
     * 获取工作计划详情
     */
    WorkPlan getDetailById(Long id);

    /**
     * 创建工作计划
     */
    WorkPlan createWorkPlan(WorkPlan workPlan);

    /**
     * 更新工作计划
     */
    WorkPlan updateWorkPlan(WorkPlan workPlan);

    /**
     * 删除工作计划
     */
    boolean deleteWorkPlan(Long id);

    /**
     * 提交工作计划
     */
    WorkPlan submitWorkPlan(Long id, String summary, String resourceRequirement);

    /**
     * 审批工作计划
     */
    WorkPlan approveWorkPlan(Long id, boolean approved, String comment);

    /**
     * 获取工作计划附件列表
     */
    List<WorkPlanAttachment> getAttachments(Long workPlanId);

    /**
     * 添加工作计划附件
     */
    WorkPlanAttachment addAttachment(Long workPlanId, String fileName, String fileUrl, 
                                      Long fileSize, String fileType);

    /**
     * 删除工作计划附件
     */
    boolean deleteAttachment(Long workPlanId, Long attachmentId);
}