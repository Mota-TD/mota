package com.mota.task.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.mota.common.core.context.UserContext;
import com.mota.common.core.exception.BusinessException;
import com.mota.task.entity.Task;
import com.mota.task.entity.TaskDependency;
import com.mota.task.mapper.TaskDependencyMapper;
import com.mota.task.mapper.TaskMapper;
import com.mota.task.service.TaskDependencyService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;

import java.time.LocalDateTime;
import java.util.*;

/**
 * 任务依赖服务实现类
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TaskDependencyServiceImpl extends ServiceImpl<TaskDependencyMapper, TaskDependency> implements TaskDependencyService {

    private final TaskMapper taskMapper;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public TaskDependency addDependency(Long taskId, Long predecessorId, String dependencyType, Integer lagDays) {
        // 验证任务存在
        Task task = taskMapper.selectById(taskId);
        if (task == null) {
            throw new BusinessException("任务不存在");
        }
        
        Task predecessor = taskMapper.selectById(predecessorId);
        if (predecessor == null) {
            throw new BusinessException("前置任务不存在");
        }
        
        // 检查是否同一个任务
        if (taskId.equals(predecessorId)) {
            throw new BusinessException("任务不能依赖自己");
        }
        
        // 检查是否已存在依赖
        long existCount = count(new LambdaQueryWrapper<TaskDependency>()
                .eq(TaskDependency::getTaskId, taskId)
                .eq(TaskDependency::getPredecessorId, predecessorId)
                .eq(TaskDependency::getDeleted, 0));
        if (existCount > 0) {
            throw new BusinessException("依赖关系已存在");
        }
        
        // 检查循环依赖
        if (hasCircularDependency(taskId, predecessorId)) {
            throw new BusinessException("存在循环依赖");
        }
        
        TaskDependency dependency = new TaskDependency();
        dependency.setTaskId(taskId);
        dependency.setPredecessorId(predecessorId);
        dependency.setDependencyType(dependencyType != null ? dependencyType : "FS");
        dependency.setLagDays(lagDays != null ? lagDays : 0);
        // createdBy/createdAt 由 MyBatis-Plus 自动填充
        
        save(dependency);
        return dependency;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void removeDependency(Long dependencyId) {
        TaskDependency dependency = getById(dependencyId);
        if (dependency == null) {
            throw new BusinessException("依赖关系不存在");
        }
        
        dependency.setDeleted(1);
        // updatedBy/updatedAt 由 MyBatis-Plus 自动填充
        updateById(dependency);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void removeAllDependencies(Long taskId) {
        List<TaskDependency> dependencies = list(new LambdaQueryWrapper<TaskDependency>()
                .eq(TaskDependency::getTaskId, taskId)
                .eq(TaskDependency::getDeleted, 0));
        
        for (TaskDependency dependency : dependencies) {
            dependency.setDeleted(1);
            // updatedBy/updatedAt 由 MyBatis-Plus 自动填充
        }
        
        if (!dependencies.isEmpty()) {
            updateBatchById(dependencies);
        }
    }

    @Override
    public List<TaskDependency> getPredecessors(Long taskId) {
        return baseMapper.selectPredecessors(taskId);
    }

    @Override
    public List<TaskDependency> getSuccessors(Long taskId) {
        return baseMapper.selectSuccessors(taskId);
    }

    @Override
    public boolean hasCircularDependency(Long taskId, Long predecessorId) {
        // 使用递归CTE检查循环依赖
        int count = baseMapper.checkCircularDependency(predecessorId);
        if (count > 0) {
            return true;
        }
        
        // 额外检查：predecessorId的依赖链中是否包含taskId
        Set<Long> visited = new HashSet<>();
        return checkCircularDependencyRecursive(predecessorId, taskId, visited);
    }

    /**
     * 递归检查循环依赖
     */
    private boolean checkCircularDependencyRecursive(Long currentId, Long targetId, Set<Long> visited) {
        if (currentId.equals(targetId)) {
            return true;
        }
        
        if (visited.contains(currentId)) {
            return false;
        }
        
        visited.add(currentId);
        
        List<TaskDependency> predecessors = getPredecessors(currentId);
        for (TaskDependency dep : predecessors) {
            if (checkCircularDependencyRecursive(dep.getPredecessorId(), targetId, visited)) {
                return true;
            }
        }
        
        return false;
    }

    @Override
    public List<TaskDependency> getProjectDependencies(Long projectId) {
        return baseMapper.selectByProjectId(projectId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateDependencyType(Long dependencyId, String dependencyType) {
        TaskDependency dependency = getById(dependencyId);
        if (dependency == null) {
            throw new BusinessException("依赖关系不存在");
        }
        
        dependency.setDependencyType(dependencyType);
        // updatedBy/updatedAt 由 MyBatis-Plus 自动填充
        updateById(dependency);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateLagDays(Long dependencyId, Integer lagDays) {
        TaskDependency dependency = getById(dependencyId);
        if (dependency == null) {
            throw new BusinessException("依赖关系不存在");
        }
        
        dependency.setLagDays(lagDays);
        // updatedBy/updatedAt 由 MyBatis-Plus 自动填充
        updateById(dependency);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void batchAddDependencies(Long taskId, List<Long> predecessorIds, String dependencyType) {
        if (CollectionUtils.isEmpty(predecessorIds)) {
            return;
        }
        
        for (Long predecessorId : predecessorIds) {
            try {
                addDependency(taskId, predecessorId, dependencyType, 0);
            } catch (BusinessException e) {
                log.warn("添加依赖失败: taskId={}, predecessorId={}, error={}", taskId, predecessorId, e.getMessage());
            }
        }
    }

    @Override
    public List<Long> getCriticalPath(Long projectId) {
        // 获取项目所有任务
        List<Task> tasks = taskMapper.selectList(new LambdaQueryWrapper<Task>()
                .eq(Task::getProjectId, projectId)
                .eq(Task::getDeleted, 0));
        
        if (tasks.isEmpty()) {
            return Collections.emptyList();
        }
        
        // 获取所有依赖关系
        List<TaskDependency> dependencies = getProjectDependencies(projectId);
        
        // 构建任务图
        Map<Long, Task> taskMap = new HashMap<>();
        Map<Long, List<Long>> predecessorMap = new HashMap<>();
        Map<Long, List<Long>> successorMap = new HashMap<>();
        
        for (Task task : tasks) {
            taskMap.put(task.getId(), task);
            predecessorMap.put(task.getId(), new ArrayList<>());
            successorMap.put(task.getId(), new ArrayList<>());
        }
        
        for (TaskDependency dep : dependencies) {
            predecessorMap.get(dep.getTaskId()).add(dep.getPredecessorId());
            successorMap.get(dep.getPredecessorId()).add(dep.getTaskId());
        }
        
        // 计算最早开始时间和最晚开始时间
        Map<Long, Integer> earliestStart = new HashMap<>();
        Map<Long, Integer> latestStart = new HashMap<>();
        
        // 拓扑排序计算最早开始时间
        List<Long> sortedTasks = topologicalSort(tasks, predecessorMap);
        
        for (Long taskId : sortedTasks) {
            Task task = taskMap.get(taskId);
            int es = 0;
            for (Long predId : predecessorMap.get(taskId)) {
                Task pred = taskMap.get(predId);
                int predDuration = pred.getEstimatedHours() != null ? pred.getEstimatedHours().intValue() : 0;
                es = Math.max(es, earliestStart.getOrDefault(predId, 0) + predDuration);
            }
            earliestStart.put(taskId, es);
        }
        
        // 计算项目总工期
        int projectDuration = 0;
        for (Long taskId : sortedTasks) {
            Task task = taskMap.get(taskId);
            int duration = task.getEstimatedHours() != null ? task.getEstimatedHours().intValue() : 0;
            projectDuration = Math.max(projectDuration, earliestStart.get(taskId) + duration);
        }
        
        // 反向计算最晚开始时间
        Collections.reverse(sortedTasks);
        for (Long taskId : sortedTasks) {
            Task task = taskMap.get(taskId);
            int duration = task.getEstimatedHours() != null ? task.getEstimatedHours().intValue() : 0;
            
            List<Long> successors = successorMap.get(taskId);
            if (successors.isEmpty()) {
                latestStart.put(taskId, projectDuration - duration);
            } else {
                int ls = Integer.MAX_VALUE;
                for (Long succId : successors) {
                    ls = Math.min(ls, latestStart.getOrDefault(succId, projectDuration) - duration);
                }
                latestStart.put(taskId, ls);
            }
        }
        
        // 找出关键路径（浮动时间为0的任务）
        List<Long> criticalPath = new ArrayList<>();
        for (Task task : tasks) {
            int es = earliestStart.getOrDefault(task.getId(), 0);
            int ls = latestStart.getOrDefault(task.getId(), 0);
            if (es == ls) {
                criticalPath.add(task.getId());
            }
        }
        
        return criticalPath;
    }

    /**
     * 拓扑排序
     */
    private List<Long> topologicalSort(List<Task> tasks, Map<Long, List<Long>> predecessorMap) {
        List<Long> result = new ArrayList<>();
        Set<Long> visited = new HashSet<>();
        Set<Long> visiting = new HashSet<>();
        
        for (Task task : tasks) {
            if (!visited.contains(task.getId())) {
                topologicalSortDFS(task.getId(), predecessorMap, visited, visiting, result);
            }
        }
        
        Collections.reverse(result);
        return result;
    }

    private void topologicalSortDFS(Long taskId, Map<Long, List<Long>> predecessorMap,
                                     Set<Long> visited, Set<Long> visiting, List<Long> result) {
        visiting.add(taskId);
        
        for (Long predId : predecessorMap.getOrDefault(taskId, Collections.emptyList())) {
            if (visiting.contains(predId)) {
                // 存在循环，跳过
                continue;
            }
            if (!visited.contains(predId)) {
                topologicalSortDFS(predId, predecessorMap, visited, visiting, result);
            }
        }
        
        visiting.remove(taskId);
        visited.add(taskId);
        result.add(taskId);
    }
}