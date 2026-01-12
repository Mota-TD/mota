package com.mota.task.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.mota.task.entity.WorkflowStatus;

import java.util.List;

/**
 * 工作流服务接口
 */
public interface WorkflowService extends IService<WorkflowStatus> {

    /**
     * 创建工作流状态
     */
    WorkflowStatus createStatus(Long projectId, String name, String color, String category);

    /**
     * 更新工作流状态
     */
    WorkflowStatus updateStatus(Long statusId, String name, String color, String category);

    /**
     * 删除工作流状态
     */
    void deleteStatus(Long statusId);

    /**
     * 获取项目的工作流状态列表
     */
    List<WorkflowStatus> getStatusesByProject(Long projectId);

    /**
     * 获取租户的默认工作流状态
     */
    List<WorkflowStatus> getDefaultStatuses(Long tenantId);

    /**
     * 初始化项目工作流（从默认模板）
     */
    void initProjectWorkflow(Long projectId);

    /**
     * 设置初始状态
     */
    void setInitialStatus(Long projectId, Long statusId);

    /**
     * 设置完成状态
     */
    void setFinalStatus(Long statusId, boolean isFinal);

    /**
     * 获取初始状态
     */
    WorkflowStatus getInitialStatus(Long projectId);

    /**
     * 获取完成状态列表
     */
    List<WorkflowStatus> getFinalStatuses(Long projectId);

    /**
     * 调整状态顺序
     */
    void reorderStatuses(Long projectId, List<Long> statusIds);

    /**
     * 检查状态是否可以删除（没有任务使用）
     */
    boolean canDeleteStatus(Long statusId);

    /**
     * 迁移任务状态（删除状态前）
     */
    void migrateTaskStatus(Long fromStatusId, Long toStatusId);

    /**
     * 复制工作流到另一个项目
     */
    void copyWorkflow(Long sourceProjectId, Long targetProjectId);

    /**
     * 创建默认工作流模板
     */
    void createDefaultTemplate(Long tenantId);
}