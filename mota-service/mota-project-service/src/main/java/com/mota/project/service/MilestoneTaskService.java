package com.mota.project.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.mota.project.entity.MilestoneTask;
import com.mota.project.entity.MilestoneTaskAttachment;

import java.util.List;

/**
 * 里程碑任务服务接口
 */
public interface MilestoneTaskService extends IService<MilestoneTask> {

    /**
     * 根据里程碑ID获取任务列表
     */
    List<MilestoneTask> getByMilestoneId(Long milestoneId);

    /**
     * 根据负责人ID获取任务列表
     */
    List<MilestoneTask> getByAssigneeId(Long assigneeId);

    /**
     * 获取任务详情（包含子任务和附件）
     */
    MilestoneTask getDetailById(Long id);

    /**
     * 创建任务
     */
    MilestoneTask createTask(MilestoneTask task);

    /**
     * 创建子任务
     */
    MilestoneTask createSubTask(Long parentTaskId, MilestoneTask task);

    /**
     * 更新任务
     */
    MilestoneTask updateTask(MilestoneTask task);

    /**
     * 更新任务进度
     */
    boolean updateTaskProgress(Long taskId, Integer progress);

    /**
     * 更新任务状态
     */
    boolean updateTaskStatus(Long taskId, String status);

    /**
     * 删除任务
     */
    boolean deleteTask(Long id);

    /**
     * 完成任务
     */
    MilestoneTask completeTask(Long id);

    /**
     * 分配任务给用户
     */
    boolean assignTask(Long taskId, Long userId);

    /**
     * 获取任务的子任务列表
     */
    List<MilestoneTask> getSubTasks(Long parentTaskId);

    /**
     * 添加任务附件
     */
    MilestoneTaskAttachment addAttachment(Long taskId, MilestoneTaskAttachment attachment);

    /**
     * 获取任务附件列表
     */
    List<MilestoneTaskAttachment> getAttachments(Long taskId);

    /**
     * 获取任务的执行方案附件
     */
    List<MilestoneTaskAttachment> getExecutionPlans(Long taskId);

    /**
     * 删除任务附件
     */
    boolean deleteAttachment(Long attachmentId);
}