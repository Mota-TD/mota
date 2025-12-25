package com.mota.project.service;

import com.mota.project.entity.WorkflowStatus;
import com.mota.project.entity.WorkflowTemplate;
import com.mota.project.entity.WorkflowTransition;

import java.util.List;

/**
 * 工作流服务接口
 */
public interface WorkflowService {

    // ========== 工作流模板管理 ==========

    /**
     * 创建工作流模板
     */
    WorkflowTemplate createWorkflow(WorkflowTemplate template);

    /**
     * 更新工作流模板
     */
    WorkflowTemplate updateWorkflow(Long id, WorkflowTemplate template);

    /**
     * 删除工作流模板
     */
    boolean deleteWorkflow(Long id);

    /**
     * 获取工作流详情
     */
    WorkflowTemplate getWorkflowById(Long id);

    /**
     * 获取工作流详情（包含状态和流转规则）
     */
    WorkflowTemplate getWorkflowWithDetails(Long id);

    /**
     * 获取系统预设工作流
     */
    List<WorkflowTemplate> getSystemWorkflows();

    /**
     * 获取项目可用的工作流
     */
    List<WorkflowTemplate> getProjectWorkflows(Long projectId);

    /**
     * 获取用户创建的工作流
     */
    List<WorkflowTemplate> getUserWorkflows(Long userId);

    /**
     * 设置默认工作流
     */
    void setDefaultWorkflow(Long workflowId, Long projectId);

    /**
     * 获取默认工作流
     */
    WorkflowTemplate getDefaultWorkflow(Long projectId);

    // ========== 工作流状态管理 ==========

    /**
     * 添加状态
     */
    WorkflowStatus addStatus(Long workflowId, WorkflowStatus status);

    /**
     * 更新状态
     */
    WorkflowStatus updateStatus(Long statusId, WorkflowStatus status);

    /**
     * 删除状态
     */
    boolean deleteStatus(Long statusId);

    /**
     * 获取工作流的所有状态
     */
    List<WorkflowStatus> getWorkflowStatuses(Long workflowId);

    /**
     * 获取初始状态
     */
    WorkflowStatus getInitialStatus(Long workflowId);

    /**
     * 获取终态列表
     */
    List<WorkflowStatus> getFinalStatuses(Long workflowId);

    /**
     * 更新状态排序
     */
    void updateStatusOrder(Long workflowId, List<Long> statusIds);

    // ========== 工作流流转规则管理 ==========

    /**
     * 添加流转规则
     */
    WorkflowTransition addTransition(Long workflowId, WorkflowTransition transition);

    /**
     * 更新流转规则
     */
    WorkflowTransition updateTransition(Long transitionId, WorkflowTransition transition);

    /**
     * 删除流转规则
     */
    boolean deleteTransition(Long transitionId);

    /**
     * 获取工作流的所有流转规则
     */
    List<WorkflowTransition> getWorkflowTransitions(Long workflowId);

    /**
     * 获取从指定状态可以流转到的状态
     */
    List<WorkflowTransition> getAvailableTransitions(Long fromStatusId);

    /**
     * 检查状态流转是否允许
     */
    boolean canTransition(Long workflowId, Long fromStatusId, Long toStatusId);

    // ========== 工作流复制 ==========

    /**
     * 复制工作流
     */
    WorkflowTemplate duplicateWorkflow(Long workflowId, String newName, Long projectId);

    /**
     * 从系统模板创建项目工作流
     */
    WorkflowTemplate createFromSystemTemplate(Long templateId, Long projectId);
}