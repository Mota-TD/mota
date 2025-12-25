package com.mota.project.service.impl;

import com.mota.project.entity.WorkflowStatus;
import com.mota.project.entity.WorkflowTemplate;
import com.mota.project.entity.WorkflowTransition;
import com.mota.project.mapper.WorkflowStatusMapper;
import com.mota.project.mapper.WorkflowTemplateMapper;
import com.mota.project.mapper.WorkflowTransitionMapper;
import com.mota.project.service.WorkflowService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 工作流服务实现类
 */
@Service
@RequiredArgsConstructor
public class WorkflowServiceImpl implements WorkflowService {

    private final WorkflowTemplateMapper workflowTemplateMapper;
    private final WorkflowStatusMapper workflowStatusMapper;
    private final WorkflowTransitionMapper workflowTransitionMapper;

    // ========== 工作流模板管理 ==========

    @Override
    @Transactional
    public WorkflowTemplate createWorkflow(WorkflowTemplate template) {
        template.setIsDefault(false);
        template.setIsSystem(false);
        workflowTemplateMapper.insert(template);
        return template;
    }

    @Override
    @Transactional
    public WorkflowTemplate updateWorkflow(Long id, WorkflowTemplate template) {
        WorkflowTemplate existing = workflowTemplateMapper.selectById(id);
        if (existing == null) {
            throw new RuntimeException("工作流不存在");
        }
        
        // 系统预设工作流不允许修改
        if (existing.getIsSystem() != null && existing.getIsSystem()) {
            throw new RuntimeException("系统预设工作流不允许修改");
        }
        
        template.setId(id);
        workflowTemplateMapper.updateById(template);
        
        return workflowTemplateMapper.selectById(id);
    }

    @Override
    @Transactional
    public boolean deleteWorkflow(Long id) {
        WorkflowTemplate existing = workflowTemplateMapper.selectById(id);
        if (existing == null) {
            return false;
        }
        
        // 系统预设工作流不允许删除
        if (existing.getIsSystem() != null && existing.getIsSystem()) {
            throw new RuntimeException("系统预设工作流不允许删除");
        }
        
        // 删除关联的状态和流转规则
        workflowTransitionMapper.deleteByWorkflowId(id);
        workflowStatusMapper.deleteByWorkflowId(id);
        
        return workflowTemplateMapper.deleteById(id) > 0;
    }

    @Override
    public WorkflowTemplate getWorkflowById(Long id) {
        return workflowTemplateMapper.selectById(id);
    }

    @Override
    public WorkflowTemplate getWorkflowWithDetails(Long id) {
        WorkflowTemplate template = workflowTemplateMapper.selectById(id);
        if (template != null) {
            template.setStatuses(workflowStatusMapper.selectByWorkflowIdOrdered(id));
            template.setTransitions(workflowTransitionMapper.selectWithStatusByWorkflowId(id));
        }
        return template;
    }

    @Override
    public List<WorkflowTemplate> getSystemWorkflows() {
        return workflowTemplateMapper.selectSystemTemplates();
    }

    @Override
    public List<WorkflowTemplate> getProjectWorkflows(Long projectId) {
        return workflowTemplateMapper.selectByProjectId(projectId);
    }

    @Override
    public List<WorkflowTemplate> getUserWorkflows(Long userId) {
        return workflowTemplateMapper.selectByCreatedBy(userId);
    }

    @Override
    @Transactional
    public void setDefaultWorkflow(Long workflowId, Long projectId) {
        // 先取消当前默认工作流
        workflowTemplateMapper.unsetDefaultTemplate(projectId);
        // 设置新的默认工作流
        workflowTemplateMapper.setDefaultTemplate(workflowId, projectId);
    }

    @Override
    public WorkflowTemplate getDefaultWorkflow(Long projectId) {
        return workflowTemplateMapper.selectDefaultTemplate(projectId);
    }

    // ========== 工作流状态管理 ==========

    @Override
    @Transactional
    public WorkflowStatus addStatus(Long workflowId, WorkflowStatus status) {
        // 获取最大排序顺序
        Integer maxOrder = workflowStatusMapper.selectMaxSortOrder(workflowId);
        status.setWorkflowId(workflowId);
        status.setSortOrder(maxOrder != null ? maxOrder + 1 : 1);
        status.setCreatedAt(LocalDateTime.now());
        status.setUpdatedAt(LocalDateTime.now());
        
        workflowStatusMapper.insert(status);
        return status;
    }

    @Override
    @Transactional
    public WorkflowStatus updateStatus(Long statusId, WorkflowStatus status) {
        WorkflowStatus existing = workflowStatusMapper.selectById(statusId);
        if (existing == null) {
            throw new RuntimeException("状态不存在");
        }
        
        status.setId(statusId);
        status.setWorkflowId(existing.getWorkflowId());
        status.setUpdatedAt(LocalDateTime.now());
        
        workflowStatusMapper.updateById(status);
        return workflowStatusMapper.selectById(statusId);
    }

    @Override
    @Transactional
    public boolean deleteStatus(Long statusId) {
        // 删除涉及该状态的流转规则
        workflowTransitionMapper.deleteByStatusId(statusId);
        return workflowStatusMapper.deleteById(statusId) > 0;
    }

    @Override
    public List<WorkflowStatus> getWorkflowStatuses(Long workflowId) {
        return workflowStatusMapper.selectByWorkflowIdOrdered(workflowId);
    }

    @Override
    public WorkflowStatus getInitialStatus(Long workflowId) {
        return workflowStatusMapper.selectInitialStatus(workflowId);
    }

    @Override
    public List<WorkflowStatus> getFinalStatuses(Long workflowId) {
        return workflowStatusMapper.selectFinalStatuses(workflowId);
    }

    @Override
    @Transactional
    public void updateStatusOrder(Long workflowId, List<Long> statusIds) {
        for (int i = 0; i < statusIds.size(); i++) {
            workflowStatusMapper.updateSortOrder(statusIds.get(i), i + 1);
        }
    }

    // ========== 工作流流转规则管理 ==========

    @Override
    @Transactional
    public WorkflowTransition addTransition(Long workflowId, WorkflowTransition transition) {
        // 检查是否已存在相同的流转规则
        WorkflowTransition existing = workflowTransitionMapper.selectByFromAndTo(
                workflowId, transition.getFromStatusId(), transition.getToStatusId());
        if (existing != null) {
            throw new RuntimeException("该流转规则已存在");
        }
        
        transition.setWorkflowId(workflowId);
        transition.setCreatedAt(LocalDateTime.now());
        transition.setUpdatedAt(LocalDateTime.now());
        
        workflowTransitionMapper.insert(transition);
        return transition;
    }

    @Override
    @Transactional
    public WorkflowTransition updateTransition(Long transitionId, WorkflowTransition transition) {
        WorkflowTransition existing = workflowTransitionMapper.selectById(transitionId);
        if (existing == null) {
            throw new RuntimeException("流转规则不存在");
        }
        
        transition.setId(transitionId);
        transition.setWorkflowId(existing.getWorkflowId());
        transition.setUpdatedAt(LocalDateTime.now());
        
        workflowTransitionMapper.updateById(transition);
        return workflowTransitionMapper.selectById(transitionId);
    }

    @Override
    @Transactional
    public boolean deleteTransition(Long transitionId) {
        return workflowTransitionMapper.deleteById(transitionId) > 0;
    }

    @Override
    public List<WorkflowTransition> getWorkflowTransitions(Long workflowId) {
        return workflowTransitionMapper.selectWithStatusByWorkflowId(workflowId);
    }

    @Override
    public List<WorkflowTransition> getAvailableTransitions(Long fromStatusId) {
        return workflowTransitionMapper.selectByFromStatusId(fromStatusId);
    }

    @Override
    public boolean canTransition(Long workflowId, Long fromStatusId, Long toStatusId) {
        WorkflowTransition transition = workflowTransitionMapper.selectByFromAndTo(
                workflowId, fromStatusId, toStatusId);
        return transition != null;
    }

    // ========== 工作流复制 ==========

    @Override
    @Transactional
    public WorkflowTemplate duplicateWorkflow(Long workflowId, String newName, Long projectId) {
        WorkflowTemplate original = getWorkflowWithDetails(workflowId);
        if (original == null) {
            throw new RuntimeException("工作流不存在");
        }
        
        // 创建新工作流
        WorkflowTemplate newWorkflow = new WorkflowTemplate();
        newWorkflow.setName(newName != null ? newName : original.getName() + " (副本)");
        newWorkflow.setDescription(original.getDescription());
        newWorkflow.setProjectId(projectId);
        newWorkflow.setIsDefault(false);
        newWorkflow.setIsSystem(false);
        
        workflowTemplateMapper.insert(newWorkflow);
        Long newWorkflowId = newWorkflow.getId();
        
        // 复制状态
        List<WorkflowStatus> originalStatuses = original.getStatuses();
        if (originalStatuses != null && !originalStatuses.isEmpty()) {
            for (WorkflowStatus status : originalStatuses) {
                Long oldStatusId = status.getId();
                status.setId(null);
                status.setWorkflowId(newWorkflowId);
                status.setCreatedAt(LocalDateTime.now());
                status.setUpdatedAt(LocalDateTime.now());
                workflowStatusMapper.insert(status);
                
                // 记录旧ID到新ID的映射，用于复制流转规则
                status.setDescription(oldStatusId + ":" + status.getId());
            }
        }
        
        // 复制流转规则
        List<WorkflowTransition> originalTransitions = original.getTransitions();
        if (originalTransitions != null && !originalTransitions.isEmpty()) {
            // 构建状态ID映射
            java.util.Map<Long, Long> statusIdMap = new java.util.HashMap<>();
            for (WorkflowStatus status : originalStatuses) {
                String[] parts = status.getDescription().split(":");
                if (parts.length == 2) {
                    statusIdMap.put(Long.parseLong(parts[0]), Long.parseLong(parts[1]));
                }
            }
            
            for (WorkflowTransition transition : originalTransitions) {
                transition.setId(null);
                transition.setWorkflowId(newWorkflowId);
                transition.setFromStatusId(statusIdMap.get(transition.getFromStatusId()));
                transition.setToStatusId(statusIdMap.get(transition.getToStatusId()));
                transition.setCreatedAt(LocalDateTime.now());
                transition.setUpdatedAt(LocalDateTime.now());
                workflowTransitionMapper.insert(transition);
            }
            
            // 恢复状态描述
            for (WorkflowStatus status : originalStatuses) {
                String[] parts = status.getDescription().split(":");
                if (parts.length == 2) {
                    status.setDescription(null);
                    workflowStatusMapper.updateById(status);
                }
            }
        }
        
        return getWorkflowWithDetails(newWorkflowId);
    }

    @Override
    @Transactional
    public WorkflowTemplate createFromSystemTemplate(Long templateId, Long projectId) {
        WorkflowTemplate template = workflowTemplateMapper.selectById(templateId);
        if (template == null || !template.getIsSystem()) {
            throw new RuntimeException("系统模板不存在");
        }
        
        return duplicateWorkflow(templateId, template.getName(), projectId);
    }
}