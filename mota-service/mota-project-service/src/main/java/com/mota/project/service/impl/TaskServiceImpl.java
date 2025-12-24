package com.mota.project.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.mota.project.entity.Task;
import com.mota.project.mapper.TaskMapper;
import com.mota.project.service.DepartmentTaskService;
import com.mota.project.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 执行任务 Service 实现类
 */
@Service
@RequiredArgsConstructor
public class TaskServiceImpl extends ServiceImpl<TaskMapper, Task> implements TaskService {

    private final TaskMapper taskMapper;
    
    @Lazy
    private final DepartmentTaskService departmentTaskService;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Task createTask(Task task) {
        // 设置默认值
        if (task.getStatus() == null) {
            task.setStatus(Task.Status.PENDING);
        }
        if (task.getPriority() == null) {
            task.setPriority(Task.Priority.MEDIUM);
        }
        if (task.getProgress() == null) {
            task.setProgress(0);
        }
        if (task.getSortOrder() == null) {
            task.setSortOrder(0);
        }
        
        save(task);
        
        // 更新部门任务进度
        if (task.getDepartmentTaskId() != null) {
            departmentTaskService.calculateAndUpdateProgress(task.getDepartmentTaskId());
        }
        
        return task;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Task updateTask(Task task) {
        updateById(task);
        
        // 更新部门任务进度
        Task updatedTask = getById(task.getId());
        if (updatedTask != null && updatedTask.getDepartmentTaskId() != null) {
            departmentTaskService.calculateAndUpdateProgress(updatedTask.getDepartmentTaskId());
        }
        
        return updatedTask;
    }

    @Override
    public List<Task> listByDepartmentTaskId(Long departmentTaskId) {
        LambdaQueryWrapper<Task> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Task::getDepartmentTaskId, departmentTaskId)
               .eq(Task::getDeleted, 0)
               .orderByAsc(Task::getSortOrder)
               .orderByAsc(Task::getCreatedAt);
        return list(wrapper);
    }

    @Override
    public List<Task> listByProjectId(Long projectId) {
        LambdaQueryWrapper<Task> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Task::getProjectId, projectId)
               .eq(Task::getDeleted, 0)
               .orderByDesc(Task::getCreatedAt);
        return list(wrapper);
    }

    @Override
    public List<Task> listByAssigneeId(Long assigneeId) {
        LambdaQueryWrapper<Task> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Task::getAssigneeId, assigneeId)
               .eq(Task::getDeleted, 0)
               .orderByDesc(Task::getCreatedAt);
        return list(wrapper);
    }

    @Override
    public IPage<Task> pageTasks(
            Page<Task> page,
            Long projectId,
            Long departmentTaskId,
            Long assigneeId,
            String status,
            String priority
    ) {
        LambdaQueryWrapper<Task> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Task::getDeleted, 0);
        
        if (projectId != null) {
            wrapper.eq(Task::getProjectId, projectId);
        }
        if (departmentTaskId != null) {
            wrapper.eq(Task::getDepartmentTaskId, departmentTaskId);
        }
        if (assigneeId != null) {
            wrapper.eq(Task::getAssigneeId, assigneeId);
        }
        if (status != null && !status.isEmpty()) {
            wrapper.eq(Task::getStatus, status);
        }
        if (priority != null && !priority.isEmpty()) {
            wrapper.eq(Task::getPriority, priority);
        }
        
        wrapper.orderByDesc(Task::getCreatedAt);
        return page(page, wrapper);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean updateStatus(Long id, String status) {
        LambdaUpdateWrapper<Task> wrapper = new LambdaUpdateWrapper<>();
        wrapper.eq(Task::getId, id)
               .set(Task::getStatus, status);
        
        // 如果状态为已完成，设置完成时间
        if (Task.Status.COMPLETED.equals(status)) {
            wrapper.set(Task::getCompletedAt, LocalDateTime.now())
                   .set(Task::getProgress, 100);
        }
        
        boolean result = update(wrapper);
        
        // 更新部门任务进度
        Task task = getById(id);
        if (task != null && task.getDepartmentTaskId() != null) {
            departmentTaskService.calculateAndUpdateProgress(task.getDepartmentTaskId());
        }
        
        return result;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean updateProgress(Long id, Integer progress, String progressNote) {
        LambdaUpdateWrapper<Task> wrapper = new LambdaUpdateWrapper<>();
        wrapper.eq(Task::getId, id)
               .set(Task::getProgress, progress);
        
        if (progressNote != null) {
            wrapper.set(Task::getProgressNote, progressNote);
        }
        
        // 如果进度为100%，自动更新状态为已完成
        if (progress != null && progress >= 100) {
            wrapper.set(Task::getStatus, Task.Status.COMPLETED)
                   .set(Task::getCompletedAt, LocalDateTime.now());
        } else if (progress != null && progress > 0) {
            // 如果进度大于0但小于100，状态为进行中
            wrapper.set(Task::getStatus, Task.Status.IN_PROGRESS);
        }
        
        boolean result = update(wrapper);
        
        // 更新部门任务进度
        Task task = getById(id);
        if (task != null && task.getDepartmentTaskId() != null) {
            departmentTaskService.calculateAndUpdateProgress(task.getDepartmentTaskId());
        }
        
        return result;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean completeTask(Long id) {
        return updateStatus(id, Task.Status.COMPLETED);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean assignTask(Long id, Long assigneeId) {
        LambdaUpdateWrapper<Task> wrapper = new LambdaUpdateWrapper<>();
        wrapper.eq(Task::getId, id)
               .set(Task::getAssigneeId, assigneeId);
        return update(wrapper);
    }

    @Override
    public Map<String, Long> countByDepartmentTaskIdGroupByStatus(Long departmentTaskId) {
        List<Map<String, Object>> results = taskMapper.countByDepartmentTaskIdGroupByStatus(departmentTaskId);
        Map<String, Long> countMap = new HashMap<>();
        for (Map<String, Object> result : results) {
            String status = (String) result.get("status");
            Long count = ((Number) result.get("count")).longValue();
            countMap.put(status, count);
        }
        return countMap;
    }

    @Override
    public Map<String, Long> countByProjectIdGroupByStatus(Long projectId) {
        List<Map<String, Object>> results = taskMapper.countByProjectIdGroupByStatus(projectId);
        Map<String, Long> countMap = new HashMap<>();
        for (Map<String, Object> result : results) {
            String status = (String) result.get("status");
            Long count = ((Number) result.get("count")).longValue();
            countMap.put(status, count);
        }
        return countMap;
    }

    @Override
    public List<Task> getTodoListByUserId(Long userId) {
        LambdaQueryWrapper<Task> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Task::getAssigneeId, userId)
               .eq(Task::getDeleted, 0)
               .in(Task::getStatus, Task.Status.PENDING, Task.Status.IN_PROGRESS)
               .orderByAsc(Task::getEndDate)
               .orderByDesc(Task::getPriority);
        return list(wrapper);
    }

    @Override
    public List<Task> getUpcomingTasks(Integer days) {
        LocalDate today = LocalDate.now();
        LocalDate endDate = today.plusDays(days);
        
        LambdaQueryWrapper<Task> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Task::getDeleted, 0)
               .in(Task::getStatus, Task.Status.PENDING, Task.Status.IN_PROGRESS)
               .ge(Task::getEndDate, today)
               .le(Task::getEndDate, endDate)
               .orderByAsc(Task::getEndDate);
        return list(wrapper);
    }

    @Override
    public List<Task> getOverdueTasks() {
        LocalDate today = LocalDate.now();
        
        LambdaQueryWrapper<Task> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Task::getDeleted, 0)
               .in(Task::getStatus, Task.Status.PENDING, Task.Status.IN_PROGRESS)
               .lt(Task::getEndDate, today)
               .orderByAsc(Task::getEndDate);
        return list(wrapper);
    }

    @Override
    public List<Task> getUpcomingTasksByUserId(Long userId, Integer days) {
        LocalDate today = LocalDate.now();
        LocalDate endDate = today.plusDays(days);
        
        LambdaQueryWrapper<Task> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Task::getDeleted, 0)
               .eq(Task::getAssigneeId, userId)
               .in(Task::getStatus, Task.Status.PENDING, Task.Status.IN_PROGRESS)
               .ge(Task::getEndDate, today)
               .le(Task::getEndDate, endDate)
               .orderByAsc(Task::getEndDate);
        return list(wrapper);
    }

    @Override
    public List<Task> getOverdueTasksByUserId(Long userId) {
        LocalDate today = LocalDate.now();
        
        LambdaQueryWrapper<Task> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Task::getDeleted, 0)
               .eq(Task::getAssigneeId, userId)
               .in(Task::getStatus, Task.Status.PENDING, Task.Status.IN_PROGRESS)
               .lt(Task::getEndDate, today)
               .orderByAsc(Task::getEndDate);
        return list(wrapper);
    }

    @Override
    public Task getDetailById(Long id) {
        return getById(id);
    }
}