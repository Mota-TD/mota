package com.mota.task.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.mota.common.core.context.TenantContext;
import com.mota.common.core.context.UserContext;
import com.mota.common.core.exception.BusinessException;
import com.mota.task.entity.Task;
import com.mota.task.entity.WorkflowStatus;
import com.mota.task.mapper.TaskMapper;
import com.mota.task.mapper.WorkflowStatusMapper;
import com.mota.task.service.WorkflowService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

/**
 * 工作流服务实现类
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class WorkflowServiceImpl extends ServiceImpl<WorkflowStatusMapper, WorkflowStatus> implements WorkflowService {

    private final TaskMapper taskMapper;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public WorkflowStatus createStatus(Long projectId, String name, String color, String category) {
        // 检查名称是否重复
        WorkflowStatus existing = baseMapper.selectByName(projectId, name);
        if (existing != null) {
            throw new BusinessException("状态名称已存在");
        }
        
        // 获取当前最大排序号
        int maxOrder = 0;
        List<WorkflowStatus> statuses = getStatusesByProject(projectId);
        if (!statuses.isEmpty()) {
            maxOrder = statuses.stream()
                    .mapToInt(WorkflowStatus::getSortOrder)
                    .max()
                    .orElse(0);
        }
        
        WorkflowStatus status = new WorkflowStatus();
        status.setTenantId(TenantContext.getTenantId());
        status.setProjectId(projectId);
        status.setName(name);
        status.setColor(color != null ? color : "#1890ff");
        status.setCategory(category != null ? category : "todo");
        status.setSortOrder(maxOrder + 1);
        status.setIsDefault(false);
        status.setIsInitial(false);
        status.setIsFinal(false);
        // createdBy/createdAt 由 MyBatis-Plus 自动填充
        
        save(status);
        return status;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public WorkflowStatus updateStatus(Long statusId, String name, String color, String category) {
        WorkflowStatus status = getById(statusId);
        if (status == null) {
            throw new BusinessException("状态不存在");
        }
        
        // 检查名称是否重复
        if (name != null && !name.equals(status.getName())) {
            WorkflowStatus existing = baseMapper.selectByName(status.getProjectId(), name);
            if (existing != null && !existing.getId().equals(statusId)) {
                throw new BusinessException("状态名称已存在");
            }
            status.setName(name);
        }
        
        if (color != null) {
            status.setColor(color);
        }
        if (category != null) {
            status.setCategory(category);
        }
        
        // updatedBy/updatedAt 由 MyBatis-Plus 自动填充
        
        updateById(status);
        return status;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteStatus(Long statusId) {
        WorkflowStatus status = getById(statusId);
        if (status == null) {
            throw new BusinessException("状态不存在");
        }
        
        // 检查是否可以删除
        if (!canDeleteStatus(statusId)) {
            throw new BusinessException("该状态下还有任务，无法删除");
        }
        
        // 检查是否是初始状态
        if (Boolean.TRUE.equals(status.getIsInitial())) {
            throw new BusinessException("初始状态不能删除");
        }
        
        status.setDeleted(1);
        // updatedBy/updatedAt 由 MyBatis-Plus 自动填充
        updateById(status);
    }

    @Override
    public List<WorkflowStatus> getStatusesByProject(Long projectId) {
        return baseMapper.selectByProjectId(projectId);
    }

    @Override
    public List<WorkflowStatus> getDefaultStatuses(Long tenantId) {
        return baseMapper.selectDefaultByTenantId(tenantId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void initProjectWorkflow(Long projectId) {
        Long tenantId = TenantContext.getTenantId();
        
        // 检查项目是否已有工作流
        List<WorkflowStatus> existing = getStatusesByProject(projectId);
        if (!existing.isEmpty()) {
            return;
        }
        
        // 获取租户默认工作流
        List<WorkflowStatus> defaultStatuses = getDefaultStatuses(tenantId);
        
        if (defaultStatuses.isEmpty()) {
            // 创建默认工作流
            createDefaultWorkflow(projectId, tenantId);
        } else {
            // 复制默认工作流
            for (WorkflowStatus defaultStatus : defaultStatuses) {
                WorkflowStatus status = new WorkflowStatus();
                status.setTenantId(tenantId);
                status.setProjectId(projectId);
                status.setName(defaultStatus.getName());
                status.setColor(defaultStatus.getColor());
                status.setCategory(defaultStatus.getCategory());
                status.setSortOrder(defaultStatus.getSortOrder());
                status.setIsDefault(false);
                status.setIsInitial(defaultStatus.getIsInitial());
                status.setIsFinal(defaultStatus.getIsFinal());
                // createdBy/createdAt 由 MyBatis-Plus 自动填充
                save(status);
            }
        }
    }

    /**
     * 创建默认工作流
     */
    private void createDefaultWorkflow(Long projectId, Long tenantId) {
        List<String[]> defaultStatuses = Arrays.asList(
                new String[]{"待处理", "#909399", "todo", "true", "false"},
                new String[]{"进行中", "#409EFF", "in_progress", "false", "false"},
                new String[]{"已完成", "#67C23A", "done", "false", "true"},
                new String[]{"已关闭", "#909399", "done", "false", "true"}
        );
        
        int order = 1;
        for (String[] statusInfo : defaultStatuses) {
            WorkflowStatus status = new WorkflowStatus();
            status.setTenantId(tenantId);
            status.setProjectId(projectId);
            status.setName(statusInfo[0]);
            status.setColor(statusInfo[1]);
            status.setCategory(statusInfo[2]);
            status.setSortOrder(order++);
            status.setIsDefault(false);
            status.setIsInitial(Boolean.parseBoolean(statusInfo[3]));
            status.setIsFinal(Boolean.parseBoolean(statusInfo[4]));
            // createdBy/createdAt 由 MyBatis-Plus 自动填充
            save(status);
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void setInitialStatus(Long projectId, Long statusId) {
        // 取消当前初始状态
        List<WorkflowStatus> statuses = getStatusesByProject(projectId);
        for (WorkflowStatus status : statuses) {
            if (Boolean.TRUE.equals(status.getIsInitial())) {
                status.setIsInitial(false);
                // updatedBy/updatedAt 由 MyBatis-Plus 自动填充
                updateById(status);
            }
        }
        
        // 设置新的初始状态
        WorkflowStatus newInitial = getById(statusId);
        if (newInitial != null && newInitial.getProjectId().equals(projectId)) {
            newInitial.setIsInitial(true);
            // updatedBy/updatedAt 由 MyBatis-Plus 自动填充
            updateById(newInitial);
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void setFinalStatus(Long statusId, boolean isFinal) {
        WorkflowStatus status = getById(statusId);
        if (status == null) {
            throw new BusinessException("状态不存在");
        }
        
        status.setIsFinal(isFinal);
        // updatedBy/updatedAt 由 MyBatis-Plus 自动填充
        updateById(status);
    }

    @Override
    public WorkflowStatus getInitialStatus(Long projectId) {
        return baseMapper.selectInitialStatus(projectId);
    }

    @Override
    public List<WorkflowStatus> getFinalStatuses(Long projectId) {
        return baseMapper.selectFinalStatuses(projectId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void reorderStatuses(Long projectId, List<Long> statusIds) {
        for (int i = 0; i < statusIds.size(); i++) {
            WorkflowStatus status = getById(statusIds.get(i));
            if (status != null && status.getProjectId().equals(projectId)) {
                status.setSortOrder(i + 1);
                // updatedBy/updatedAt 由 MyBatis-Plus 自动填充
                updateById(status);
            }
        }
    }

    @Override
    public boolean canDeleteStatus(Long statusId) {
        WorkflowStatus status = getById(statusId);
        if (status == null) {
            return false;
        }
        
        // 检查是否有任务使用该状态
        long taskCount = taskMapper.selectCount(new LambdaQueryWrapper<Task>()
                .eq(Task::getProjectId, status.getProjectId())
                .eq(Task::getStatus, status.getName())
                .eq(Task::getDeleted, 0));
        
        return taskCount == 0;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void migrateTaskStatus(Long fromStatusId, Long toStatusId) {
        WorkflowStatus fromStatus = getById(fromStatusId);
        WorkflowStatus toStatus = getById(toStatusId);
        
        if (fromStatus == null || toStatus == null) {
            throw new BusinessException("状态不存在");
        }
        
        if (!fromStatus.getProjectId().equals(toStatus.getProjectId())) {
            throw new BusinessException("状态必须属于同一项目");
        }
        
        // 更新所有使用该状态的任务
        List<Task> tasks = taskMapper.selectList(new LambdaQueryWrapper<Task>()
                .eq(Task::getProjectId, fromStatus.getProjectId())
                .eq(Task::getStatus, fromStatus.getName())
                .eq(Task::getDeleted, 0));
        
        for (Task task : tasks) {
            task.setStatus(toStatus.getName());
            // updatedBy/updatedAt 由 MyBatis-Plus 自动填充
            taskMapper.updateById(task);
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void copyWorkflow(Long sourceProjectId, Long targetProjectId) {
        List<WorkflowStatus> sourceStatuses = getStatusesByProject(sourceProjectId);
        
        for (WorkflowStatus source : sourceStatuses) {
            WorkflowStatus status = new WorkflowStatus();
            status.setTenantId(TenantContext.getTenantId());
            status.setProjectId(targetProjectId);
            status.setName(source.getName());
            status.setColor(source.getColor());
            status.setCategory(source.getCategory());
            status.setSortOrder(source.getSortOrder());
            status.setIsDefault(false);
            status.setIsInitial(source.getIsInitial());
            status.setIsFinal(source.getIsFinal());
            // createdBy/createdAt 由 MyBatis-Plus 自动填充
            save(status);
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void createDefaultTemplate(Long tenantId) {
        // 检查是否已有默认模板
        List<WorkflowStatus> existing = getDefaultStatuses(tenantId);
        if (!existing.isEmpty()) {
            return;
        }
        
        List<String[]> defaultStatuses = Arrays.asList(
                new String[]{"待处理", "#909399", "todo", "true", "false"},
                new String[]{"进行中", "#409EFF", "in_progress", "false", "false"},
                new String[]{"测试中", "#E6A23C", "in_progress", "false", "false"},
                new String[]{"已完成", "#67C23A", "done", "false", "true"},
                new String[]{"已关闭", "#909399", "done", "false", "true"}
        );
        
        int order = 1;
        for (String[] statusInfo : defaultStatuses) {
            WorkflowStatus status = new WorkflowStatus();
            status.setTenantId(tenantId);
            status.setProjectId(null); // 默认模板不关联项目
            status.setName(statusInfo[0]);
            status.setColor(statusInfo[1]);
            status.setCategory(statusInfo[2]);
            status.setSortOrder(order++);
            status.setIsDefault(true);
            status.setIsInitial(Boolean.parseBoolean(statusInfo[3]));
            status.setIsFinal(Boolean.parseBoolean(statusInfo[4]));
            // createdBy/createdAt 由 MyBatis-Plus 自动填充
            save(status);
        }
    }
}