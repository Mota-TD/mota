package com.mota.project.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.mota.project.entity.DepartmentTask;
import com.mota.project.entity.Task;
import com.mota.project.mapper.DepartmentTaskMapper;
import com.mota.project.mapper.TaskMapper;
import com.mota.project.service.DepartmentTaskService;
import com.mota.project.service.ProgressSyncService;
import com.mota.project.service.TaskCalendarSyncService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 部门任务 Service 实现类
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DepartmentTaskServiceImpl extends ServiceImpl<DepartmentTaskMapper, DepartmentTask> implements DepartmentTaskService {

    private final DepartmentTaskMapper departmentTaskMapper;
    private final TaskMapper taskMapper;
    @Lazy
    private final ProgressSyncService progressSyncService;
    @Lazy
    private final TaskCalendarSyncService taskCalendarSyncService;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public DepartmentTask createDepartmentTask(DepartmentTask departmentTask) {
        // 设置默认值
        if (departmentTask.getStatus() == null) {
            departmentTask.setStatus(DepartmentTask.Status.PENDING);
        }
        if (departmentTask.getPriority() == null) {
            departmentTask.setPriority(DepartmentTask.Priority.MEDIUM);
        }
        if (departmentTask.getProgress() == null) {
            departmentTask.setProgress(0);
        }
        if (departmentTask.getRequirePlan() == null) {
            departmentTask.setRequirePlan(1);
        }
        if (departmentTask.getRequireApproval() == null) {
            departmentTask.setRequireApproval(0);
        }
        
        save(departmentTask);
        
        // 为部门任务创建日历事件（如果有负责人）
        if (departmentTask.getManagerId() != null) {
            try {
                taskCalendarSyncService.createEventForDepartmentTask(departmentTask);
            } catch (Exception e) {
                log.warn("创建部门任务日历事件失败: {}", e.getMessage());
            }
        }
        
        // 同步里程碑进度
        if (departmentTask.getMilestoneId() != null) {
            try {
                progressSyncService.syncMilestoneProgress(departmentTask.getMilestoneId());
            } catch (Exception e) {
                log.warn("同步里程碑进度失败: {}", e.getMessage());
            }
        }
        
        return departmentTask;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public DepartmentTask updateDepartmentTask(DepartmentTask departmentTask) {
        DepartmentTask oldTask = getById(departmentTask.getId());
        updateById(departmentTask);
        DepartmentTask updatedTask = getById(departmentTask.getId());
        
        // 同步日历事件
        try {
            taskCalendarSyncService.syncDepartmentTaskCalendarEvent(updatedTask);
        } catch (Exception e) {
            log.warn("同步部门任务日历事件失败: {}", e.getMessage());
        }
        
        // 同步里程碑进度
        if (updatedTask.getMilestoneId() != null) {
            try {
                progressSyncService.syncMilestoneProgress(updatedTask.getMilestoneId());
            } catch (Exception e) {
                log.warn("同步里程碑进度失败: {}", e.getMessage());
            }
        }
        
        return updatedTask;
    }

    @Override
    public List<DepartmentTask> listByProjectId(Long projectId) {
        LambdaQueryWrapper<DepartmentTask> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(DepartmentTask::getProjectId, projectId)
               .eq(DepartmentTask::getDeleted, 0)
               .orderByAsc(DepartmentTask::getCreatedAt);
        return list(wrapper);
    }

    @Override
    public List<DepartmentTask> listByDepartmentId(Long departmentId) {
        LambdaQueryWrapper<DepartmentTask> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(DepartmentTask::getDepartmentId, departmentId)
               .eq(DepartmentTask::getDeleted, 0)
               .orderByDesc(DepartmentTask::getCreatedAt);
        return list(wrapper);
    }

    @Override
    public List<DepartmentTask> listByManagerId(Long managerId) {
        LambdaQueryWrapper<DepartmentTask> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(DepartmentTask::getManagerId, managerId)
               .eq(DepartmentTask::getDeleted, 0)
               .orderByDesc(DepartmentTask::getCreatedAt);
        return list(wrapper);
    }

    @Override
    public IPage<DepartmentTask> pageDepartmentTasks(
            Page<DepartmentTask> page,
            Long projectId,
            Long departmentId,
            String status,
            String priority
    ) {
        LambdaQueryWrapper<DepartmentTask> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(DepartmentTask::getDeleted, 0);
        
        if (projectId != null) {
            wrapper.eq(DepartmentTask::getProjectId, projectId);
        }
        if (departmentId != null) {
            wrapper.eq(DepartmentTask::getDepartmentId, departmentId);
        }
        if (status != null && !status.isEmpty()) {
            wrapper.eq(DepartmentTask::getStatus, status);
        }
        if (priority != null && !priority.isEmpty()) {
            wrapper.eq(DepartmentTask::getPriority, priority);
        }
        
        wrapper.orderByDesc(DepartmentTask::getCreatedAt);
        return page(page, wrapper);
    }

    @Override
    public IPage<DepartmentTask> pageDepartmentTasksByManagerId(
            Page<DepartmentTask> page,
            Long managerId,
            String status,
            String priority
    ) {
        LambdaQueryWrapper<DepartmentTask> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(DepartmentTask::getDeleted, 0);
        wrapper.eq(DepartmentTask::getManagerId, managerId);
        
        if (status != null && !status.isEmpty()) {
            wrapper.eq(DepartmentTask::getStatus, status);
        }
        if (priority != null && !priority.isEmpty()) {
            wrapper.eq(DepartmentTask::getPriority, priority);
        }
        
        wrapper.orderByDesc(DepartmentTask::getCreatedAt);
        return page(page, wrapper);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean updateStatus(Long id, String status) {
        LambdaUpdateWrapper<DepartmentTask> wrapper = new LambdaUpdateWrapper<>();
        wrapper.eq(DepartmentTask::getId, id)
               .set(DepartmentTask::getStatus, status);
        boolean result = update(wrapper);
        
        if (result) {
            DepartmentTask task = getById(id);
            
            // 如果状态变为已完成，标记日历事件为已完成
            if (DepartmentTask.Status.COMPLETED.equals(status) && task != null) {
                try {
                    taskCalendarSyncService.markDepartmentTaskEventCompleted(id);
                } catch (Exception e) {
                    log.warn("标记部门任务日历事件完成失败: {}", e.getMessage());
                }
            }
            
            // 同步里程碑进度
            if (task != null && task.getMilestoneId() != null) {
                try {
                    progressSyncService.syncMilestoneProgress(task.getMilestoneId());
                } catch (Exception e) {
                    log.warn("同步里程碑进度失败: {}", e.getMessage());
                }
            }
        }
        
        return result;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean updateProgress(Long id, Integer progress) {
        LambdaUpdateWrapper<DepartmentTask> wrapper = new LambdaUpdateWrapper<>();
        wrapper.eq(DepartmentTask::getId, id)
               .set(DepartmentTask::getProgress, progress);
        
        // 如果进度为100%，自动更新状态为已完成
        if (progress != null && progress >= 100) {
            wrapper.set(DepartmentTask::getStatus, DepartmentTask.Status.COMPLETED);
        }
        
        boolean result = update(wrapper);
        
        if (result) {
            DepartmentTask task = getById(id);
            
            // 如果进度为100%，标记日历事件为已完成
            if (progress != null && progress >= 100 && task != null) {
                try {
                    taskCalendarSyncService.markDepartmentTaskEventCompleted(id);
                } catch (Exception e) {
                    log.warn("标记部门任务日历事件完成失败: {}", e.getMessage());
                }
            }
            
            // 同步里程碑进度
            if (task != null && task.getMilestoneId() != null) {
                try {
                    progressSyncService.syncMilestoneProgress(task.getMilestoneId());
                } catch (Exception e) {
                    log.warn("同步里程碑进度失败: {}", e.getMessage());
                }
            }
        }
        
        return result;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean calculateAndUpdateProgress(Long id) {
        // 查询该部门任务下的所有执行任务
        LambdaQueryWrapper<Task> taskWrapper = new LambdaQueryWrapper<>();
        taskWrapper.eq(Task::getDepartmentTaskId, id)
                   .eq(Task::getDeleted, 0);
        List<Task> tasks = taskMapper.selectList(taskWrapper);
        
        if (tasks.isEmpty()) {
            return true;
        }
        
        // 计算平均进度
        int totalProgress = 0;
        for (Task task : tasks) {
            totalProgress += task.getProgress() != null ? task.getProgress() : 0;
        }
        int averageProgress = totalProgress / tasks.size();
        
        return updateProgress(id, averageProgress);
    }

    @Override
    public Map<String, Long> countByProjectIdGroupByStatus(Long projectId) {
        List<Map<String, Object>> results = departmentTaskMapper.countByProjectIdGroupByStatus(projectId);
        Map<String, Long> countMap = new HashMap<>();
        for (Map<String, Object> result : results) {
            String status = (String) result.get("status");
            Long count = ((Number) result.get("count")).longValue();
            countMap.put(status, count);
        }
        return countMap;
    }

    @Override
    public DepartmentTask getDetailById(Long id) {
        return getById(id);
    }
}