package com.mota.task.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.mota.common.core.context.TenantContext;
import com.mota.common.core.context.UserContext;
import com.mota.common.core.exception.BusinessException;
import com.mota.common.kafka.producer.EventPublisher;
import com.mota.task.dto.TaskCreateRequest;
import com.mota.task.dto.TaskQueryRequest;
import com.mota.task.dto.TaskUpdateRequest;
import com.mota.task.dto.TaskVO;
import com.mota.task.entity.Task;
import com.mota.task.event.TaskEvent;
import com.mota.task.mapper.TaskMapper;
import com.mota.task.service.TaskService;
import com.mota.task.service.WorkflowService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 任务服务实现类
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TaskServiceImpl extends ServiceImpl<TaskMapper, Task> implements TaskService {

    private final WorkflowService workflowService;
    private final EventPublisher eventPublisher;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public TaskVO createTask(TaskCreateRequest request) {
        Task task = new Task();
        BeanUtils.copyProperties(request, task);
        
        // 设置租户ID
        task.setTenantId(TenantContext.getTenantId());
        
        // 生成任务编号
        task.setTaskNo(generateTaskNo(request.getProjectId()));
        
        // 设置初始状态
        var initialStatus = workflowService.getInitialStatus(request.getProjectId());
        if (initialStatus != null) {
            task.setStatus(initialStatus.getName());
        } else {
            task.setStatus("待处理");
        }
        
        // 设置默认值
        task.setProgress(0);
        
        // 处理标签
        if (!CollectionUtils.isEmpty(request.getTags())) {
            task.setTags(String.join(",", request.getTags()));
        }
        
        // 创建人和创建时间由 MyBatis-Plus 自动填充
        save(task);
        
        // 发布任务创建事件
        publishTaskEvent(task, "CREATED");
        
        return convertToVO(task);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public TaskVO updateTask(TaskUpdateRequest request) {
        Task task = getById(request.getId());
        if (task == null) {
            throw new BusinessException("任务不存在");
        }
        
        String oldStatus = task.getStatus();
        
        // 更新字段
        if (StringUtils.hasText(request.getTitle())) {
            task.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) {
            task.setDescription(request.getDescription());
        }
        if (request.getTaskType() != null) {
            task.setTaskType(request.getTaskType());
        }
        if (request.getStatus() != null) {
            task.setStatus(request.getStatus());
        }
        if (request.getPriority() != null) {
            task.setPriority(request.getPriority());
        }
        if (request.getAssigneeId() != null) {
            task.setAssigneeId(request.getAssigneeId());
        }
        if (request.getReporterId() != null) {
            task.setReporterId(request.getReporterId());
        }
        if (request.getStartDate() != null) {
            task.setStartDate(request.getStartDate());
        }
        if (request.getDueDate() != null) {
            task.setDueDate(request.getDueDate());
        }
        if (request.getEstimatedHours() != null) {
            task.setEstimatedHours(request.getEstimatedHours());
        }
        if (request.getActualHours() != null) {
            task.setActualHours(request.getActualHours());
        }
        if (request.getProgress() != null) {
            task.setProgress(request.getProgress());
        }
        if (request.getStoryPoints() != null) {
            task.setStoryPoints(request.getStoryPoints());
        }
        if (request.getSprintId() != null) {
            task.setSprintId(request.getSprintId());
        }
        if (request.getMilestoneId() != null) {
            task.setMilestoneId(request.getMilestoneId());
        }
        if (request.getParentId() != null) {
            task.setParentId(request.getParentId());
        }
        if (!CollectionUtils.isEmpty(request.getTags())) {
            task.setTags(String.join(",", request.getTags()));
        }
        if (request.getCustomFields() != null) {
            task.setCustomFields(request.getCustomFields());
        }
        
        // 更新人和更新时间由 MyBatis-Plus 自动填充
        updateById(task);
        
        // 发布任务更新事件
        String eventType = "UPDATED";
        if (!Objects.equals(oldStatus, task.getStatus())) {
            eventType = "STATUS_CHANGED";
        }
        publishTaskEvent(task, eventType);
        
        return convertToVO(task);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteTask(Long taskId) {
        Task task = getById(taskId);
        if (task == null) {
            throw new BusinessException("任务不存在");
        }
        
        // 检查是否有子任务
        long subtaskCount = count(new LambdaQueryWrapper<Task>()
                .eq(Task::getParentId, taskId)
                .eq(Task::getDeleted, 0));
        if (subtaskCount > 0) {
            throw new BusinessException("请先删除子任务");
        }
        
        // 逻辑删除
        task.setDeleted(1);
        updateById(task);
        
        // 发布任务删除事件
        publishTaskEvent(task, "DELETED");
    }

    @Override
    public TaskVO getTaskDetail(Long taskId) {
        Task task = getById(taskId);
        if (task == null) {
            throw new BusinessException("任务不存在");
        }
        return convertToVO(task);
    }

    @Override
    public Page<TaskVO> queryTasks(TaskQueryRequest request) {
        Page<Task> page = new Page<>(request.getPageNum(), request.getPageSize());
        
        LambdaQueryWrapper<Task> wrapper = buildQueryWrapper(request);
        
        // 排序
        if (StringUtils.hasText(request.getSortField())) {
            boolean isAsc = "asc".equalsIgnoreCase(request.getSortOrder());
            switch (request.getSortField()) {
                case "createTime":
                    wrapper.orderBy(true, isAsc, Task::getCreatedAt);
                    break;
                case "dueDate":
                    wrapper.orderBy(true, isAsc, Task::getDueDate);
                    break;
                case "priority":
                    wrapper.orderBy(true, isAsc, Task::getPriority);
                    break;
                case "status":
                    wrapper.orderBy(true, isAsc, Task::getStatus);
                    break;
                default:
                    wrapper.orderByDesc(Task::getCreatedAt);
            }
        } else {
            wrapper.orderByDesc(Task::getCreatedAt);
        }
        
        Page<Task> taskPage = page(page, wrapper);
        
        Page<TaskVO> voPage = new Page<>(taskPage.getCurrent(), taskPage.getSize(), taskPage.getTotal());
        voPage.setRecords(taskPage.getRecords().stream()
                .map(this::convertToVO)
                .collect(Collectors.toList()));
        
        return voPage;
    }

    @Override
    public List<TaskVO> getTasksByProject(Long projectId) {
        List<Task> tasks = list(new LambdaQueryWrapper<Task>()
                .eq(Task::getProjectId, projectId)
                .eq(Task::getDeleted, 0)
                .orderByDesc(Task::getCreatedAt));
        return tasks.stream().map(this::convertToVO).collect(Collectors.toList());
    }

    @Override
    public List<TaskVO> getTasksByMilestone(Long milestoneId) {
        List<Task> tasks = list(new LambdaQueryWrapper<Task>()
                .eq(Task::getMilestoneId, milestoneId)
                .eq(Task::getDeleted, 0)
                .orderByDesc(Task::getCreatedAt));
        return tasks.stream().map(this::convertToVO).collect(Collectors.toList());
    }

    @Override
    public List<TaskVO> getTasksByAssignee(Long assigneeId) {
        List<Task> tasks = list(new LambdaQueryWrapper<Task>()
                .eq(Task::getAssigneeId, assigneeId)
                .eq(Task::getDeleted, 0)
                .orderByDesc(Task::getCreatedAt));
        return tasks.stream().map(this::convertToVO).collect(Collectors.toList());
    }

    @Override
    public List<TaskVO> getTasksBySprint(Long sprintId) {
        List<Task> tasks = list(new LambdaQueryWrapper<Task>()
                .eq(Task::getSprintId, sprintId)
                .eq(Task::getDeleted, 0)
                .orderByDesc(Task::getCreatedAt));
        return tasks.stream().map(this::convertToVO).collect(Collectors.toList());
    }

    @Override
    public List<TaskVO> getSubtasks(Long parentId) {
        List<Task> tasks = list(new LambdaQueryWrapper<Task>()
                .eq(Task::getParentId, parentId)
                .eq(Task::getDeleted, 0)
                .orderByAsc(Task::getCreatedAt));
        return tasks.stream().map(this::convertToVO).collect(Collectors.toList());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateTaskStatus(Long taskId, String status) {
        Task task = getById(taskId);
        if (task == null) {
            throw new BusinessException("任务不存在");
        }
        
        String oldStatus = task.getStatus();
        task.setStatus(status);
        
        // 如果是完成状态，设置完成日期和进度
        var finalStatuses = workflowService.getFinalStatuses(task.getProjectId());
        boolean isFinal = finalStatuses.stream().anyMatch(s -> s.getName().equals(status));
        if (isFinal) {
            task.setCompletedDate(LocalDate.now());
            task.setProgress(100);
        }
        
        updateById(task);
        
        // 发布状态变更事件
        publishTaskEvent(task, "STATUS_CHANGED");
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateTaskProgress(Long taskId, Integer progress) {
        Task task = getById(taskId);
        if (task == null) {
            throw new BusinessException("任务不存在");
        }
        
        task.setProgress(progress);
        updateById(task);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void assignTask(Long taskId, Long assigneeId) {
        Task task = getById(taskId);
        if (task == null) {
            throw new BusinessException("任务不存在");
        }
        
        task.setAssigneeId(assigneeId);
        updateById(task);
        
        // 发布任务分配事件
        publishTaskEvent(task, "ASSIGNED");
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void batchAssignTasks(List<Long> taskIds, Long assigneeId) {
        if (CollectionUtils.isEmpty(taskIds)) {
            return;
        }
        
        List<Task> tasks = listByIds(taskIds);
        for (Task task : tasks) {
            task.setAssigneeId(assigneeId);
        }
        updateBatchById(tasks);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void batchUpdateStatus(List<Long> taskIds, String status) {
        if (CollectionUtils.isEmpty(taskIds)) {
            return;
        }
        
        List<Task> tasks = listByIds(taskIds);
        for (Task task : tasks) {
            task.setStatus(status);
        }
        updateBatchById(tasks);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void moveToSprint(Long taskId, Long sprintId) {
        Task task = getById(taskId);
        if (task == null) {
            throw new BusinessException("任务不存在");
        }
        
        task.setSprintId(sprintId);
        updateById(task);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void batchMoveToSprint(List<Long> taskIds, Long sprintId) {
        if (CollectionUtils.isEmpty(taskIds)) {
            return;
        }
        
        List<Task> tasks = listByIds(taskIds);
        for (Task task : tasks) {
            task.setSprintId(sprintId);
        }
        updateBatchById(tasks);
    }

    @Override
    public Map<String, Object> getTaskStatistics(Long projectId) {
        Map<String, Object> stats = new HashMap<>();
        
        // 总任务数
        long total = count(new LambdaQueryWrapper<Task>()
                .eq(Task::getProjectId, projectId)
                .eq(Task::getDeleted, 0));
        stats.put("total", total);
        
        // 按状态统计
        List<Map<String, Object>> statusStats = baseMapper.countByStatus(projectId);
        stats.put("byStatus", statusStats);
        
        // 按优先级统计
        List<Map<String, Object>> priorityStats = baseMapper.countByPriority(projectId);
        stats.put("byPriority", priorityStats);
        
        // 按负责人统计
        List<Map<String, Object>> assigneeStats = baseMapper.countByAssignee(projectId);
        stats.put("byAssignee", assigneeStats);
        
        // 逾期任务数
        long overdue = count(new LambdaQueryWrapper<Task>()
                .eq(Task::getProjectId, projectId)
                .eq(Task::getDeleted, 0)
                .lt(Task::getDueDate, LocalDate.now())
                .isNull(Task::getCompletedDate));
        stats.put("overdue", overdue);
        
        return stats;
    }

    @Override
    public List<TaskVO> getOverdueTasks(Long projectId) {
        List<Task> tasks = list(new LambdaQueryWrapper<Task>()
                .eq(Task::getProjectId, projectId)
                .eq(Task::getDeleted, 0)
                .lt(Task::getDueDate, LocalDate.now())
                .isNull(Task::getCompletedDate)
                .orderByAsc(Task::getDueDate));
        return tasks.stream().map(this::convertToVO).collect(Collectors.toList());
    }

    @Override
    public List<TaskVO> getUpcomingTasks(Long projectId, Integer days) {
        LocalDate endDate = LocalDate.now().plusDays(days);
        List<Task> tasks = list(new LambdaQueryWrapper<Task>()
                .eq(Task::getProjectId, projectId)
                .eq(Task::getDeleted, 0)
                .ge(Task::getDueDate, LocalDate.now())
                .le(Task::getDueDate, endDate)
                .isNull(Task::getCompletedDate)
                .orderByAsc(Task::getDueDate));
        return tasks.stream().map(this::convertToVO).collect(Collectors.toList());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public TaskVO copyTask(Long taskId, Long targetProjectId) {
        Task sourceTask = getById(taskId);
        if (sourceTask == null) {
            throw new BusinessException("任务不存在");
        }
        
        Task newTask = new Task();
        BeanUtils.copyProperties(sourceTask, newTask, "id", "taskNo", "createdAt", "updatedAt", "createdBy", "updatedBy");
        newTask.setProjectId(targetProjectId);
        newTask.setTaskNo(generateTaskNo(targetProjectId));
        newTask.setTenantId(TenantContext.getTenantId());
        newTask.setDeleted(0);
        
        save(newTask);
        
        return convertToVO(newTask);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void convertTaskType(Long taskId, String newType) {
        Task task = getById(taskId);
        if (task == null) {
            throw new BusinessException("任务不存在");
        }
        
        task.setTaskType(newType);
        updateById(task);
    }

    /**
     * 生成任务编号
     */
    private String generateTaskNo(Long projectId) {
        // 格式：TASK-项目ID-序号
        long count = count(new LambdaQueryWrapper<Task>()
                .eq(Task::getProjectId, projectId));
        return String.format("TASK-%d-%04d", projectId, count + 1);
    }

    /**
     * 构建查询条件
     */
    private LambdaQueryWrapper<Task> buildQueryWrapper(TaskQueryRequest request) {
        LambdaQueryWrapper<Task> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Task::getDeleted, 0);
        
        if (request.getProjectId() != null) {
            wrapper.eq(Task::getProjectId, request.getProjectId());
        }
        if (request.getMilestoneId() != null) {
            wrapper.eq(Task::getMilestoneId, request.getMilestoneId());
        }
        if (request.getParentId() != null) {
            wrapper.eq(Task::getParentId, request.getParentId());
        }
        if (!CollectionUtils.isEmpty(request.getTaskTypes())) {
            wrapper.in(Task::getTaskType, request.getTaskTypes());
        }
        if (!CollectionUtils.isEmpty(request.getStatuses())) {
            wrapper.in(Task::getStatus, request.getStatuses());
        }
        if (!CollectionUtils.isEmpty(request.getPriorities())) {
            wrapper.in(Task::getPriority, request.getPriorities());
        }
        if (!CollectionUtils.isEmpty(request.getAssigneeIds())) {
            wrapper.in(Task::getAssigneeId, request.getAssigneeIds());
        }
        if (request.getReporterId() != null) {
            wrapper.eq(Task::getReporterId, request.getReporterId());
        }
        if (request.getSprintId() != null) {
            wrapper.eq(Task::getSprintId, request.getSprintId());
        }
        if (StringUtils.hasText(request.getKeyword())) {
            wrapper.and(w -> w.like(Task::getTitle, request.getKeyword())
                    .or().like(Task::getDescription, request.getKeyword())
                    .or().like(Task::getTaskNo, request.getKeyword()));
        }
        if (request.getStartDateFrom() != null) {
            wrapper.ge(Task::getStartDate, request.getStartDateFrom());
        }
        if (request.getStartDateTo() != null) {
            wrapper.le(Task::getStartDate, request.getStartDateTo());
        }
        if (request.getDueDateFrom() != null) {
            wrapper.ge(Task::getDueDate, request.getDueDateFrom());
        }
        if (request.getDueDateTo() != null) {
            wrapper.le(Task::getDueDate, request.getDueDateTo());
        }
        if (Boolean.TRUE.equals(request.getOverdue())) {
            wrapper.lt(Task::getDueDate, LocalDate.now())
                    .isNull(Task::getCompletedDate);
        }
        if (Boolean.FALSE.equals(request.getIncludeSubtasks())) {
            wrapper.isNull(Task::getParentId);
        }
        
        return wrapper;
    }

    /**
     * 转换为VO
     */
    private TaskVO convertToVO(Task task) {
        TaskVO vo = new TaskVO();
        BeanUtils.copyProperties(task, vo);
        
        // 处理标签
        if (StringUtils.hasText(task.getTags())) {
            vo.setTags(Arrays.asList(task.getTags().split(",")));
        }
        
        // 计算是否逾期
        if (task.getDueDate() != null && task.getCompletedDate() == null) {
            vo.setOverdue(task.getDueDate().isBefore(LocalDate.now()));
        } else {
            vo.setOverdue(false);
        }
        
        // 统计子任务数量
        long subtaskCount = count(new LambdaQueryWrapper<Task>()
                .eq(Task::getParentId, task.getId())
                .eq(Task::getDeleted, 0));
        vo.setSubtaskCount((int) subtaskCount);
        
        // 统计已完成子任务数量
        long completedSubtaskCount = count(new LambdaQueryWrapper<Task>()
                .eq(Task::getParentId, task.getId())
                .eq(Task::getDeleted, 0)
                .isNotNull(Task::getCompletedDate));
        vo.setCompletedSubtaskCount((int) completedSubtaskCount);
        
        return vo;
    }

    /**
     * 发布任务事件
     */
    private void publishTaskEvent(Task task, String eventType) {
        try {
            TaskEvent event = new TaskEvent();
            event.setEventType(eventType);
            event.setTenantId(task.getTenantId());
            event.setTaskId(task.getId());
            event.setProjectId(task.getProjectId());
            event.setTaskNo(task.getTaskNo());
            event.setTitle(task.getTitle());
            event.setStatus(task.getStatus());
            event.setAssigneeId(task.getAssigneeId());
            event.setOperatorId(UserContext.getUserId());
            
            eventPublisher.publish("task-events", event);
        } catch (Exception e) {
            log.error("发布任务事件失败", e);
        }
    }
}