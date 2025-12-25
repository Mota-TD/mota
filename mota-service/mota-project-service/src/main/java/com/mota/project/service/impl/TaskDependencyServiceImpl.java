package com.mota.project.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.mota.project.dto.CriticalPathDTO;
import com.mota.project.dto.DependencyConflictDTO;
import com.mota.project.entity.Task;
import com.mota.project.entity.TaskDependency;
import com.mota.project.mapper.TaskDependencyMapper;
import com.mota.project.service.TaskDependencyService;
import com.mota.project.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 任务依赖关系 Service 实现类
 */
@Service
@RequiredArgsConstructor
public class TaskDependencyServiceImpl extends ServiceImpl<TaskDependencyMapper, TaskDependency> 
        implements TaskDependencyService {

    private final TaskDependencyMapper taskDependencyMapper;
    
    @Lazy
    private final TaskService taskService;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public TaskDependency createDependency(TaskDependency dependency) {
        // 验证不能自己依赖自己
        if (dependency.getPredecessorId().equals(dependency.getSuccessorId())) {
            throw new IllegalArgumentException("任务不能依赖自己");
        }
        
        // 检查是否已存在依赖关系
        if (existsDependency(dependency.getPredecessorId(), dependency.getSuccessorId())) {
            throw new IllegalArgumentException("依赖关系已存在");
        }
        
        // 检查是否会形成循环依赖
        if (wouldCreateCycle(dependency.getPredecessorId(), dependency.getSuccessorId())) {
            throw new IllegalArgumentException("添加此依赖会形成循环依赖");
        }
        
        // 设置默认值
        if (dependency.getDependencyType() == null) {
            dependency.setDependencyType(TaskDependency.DependencyType.FS);
        }
        if (dependency.getLagDays() == null) {
            dependency.setLagDays(0);
        }
        
        save(dependency);
        return dependency;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean batchCreateDependencies(List<TaskDependency> dependencies) {
        if (dependencies == null || dependencies.isEmpty()) {
            return true;
        }
        
        // 验证每个依赖关系
        for (TaskDependency dependency : dependencies) {
            if (dependency.getPredecessorId().equals(dependency.getSuccessorId())) {
                throw new IllegalArgumentException("任务不能依赖自己");
            }
            if (dependency.getDependencyType() == null) {
                dependency.setDependencyType(TaskDependency.DependencyType.FS);
            }
            if (dependency.getLagDays() == null) {
                dependency.setLagDays(0);
            }
        }
        
        return taskDependencyMapper.batchInsert(dependencies) > 0;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public TaskDependency updateDependency(TaskDependency dependency) {
        updateById(dependency);
        return getById(dependency.getId());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean deleteDependency(Long id) {
        return removeById(id);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean deleteByTaskId(Long taskId) {
        return taskDependencyMapper.deleteByTaskId(taskId) >= 0;
    }

    @Override
    public List<TaskDependency> listBySuccessorId(Long successorId) {
        return taskDependencyMapper.selectBySuccessorId(successorId);
    }

    @Override
    public List<TaskDependency> listByPredecessorId(Long predecessorId) {
        return taskDependencyMapper.selectByPredecessorId(predecessorId);
    }

    @Override
    public List<TaskDependency> listByTaskId(Long taskId) {
        return taskDependencyMapper.selectByTaskId(taskId);
    }

    @Override
    public List<TaskDependency> listByProjectId(Long projectId) {
        return taskDependencyMapper.selectByProjectId(projectId);
    }

    @Override
    public boolean existsDependency(Long predecessorId, Long successorId) {
        return taskDependencyMapper.existsDependency(predecessorId, successorId);
    }

    @Override
    public boolean wouldCreateCycle(Long predecessorId, Long successorId) {
        // 使用DFS检测是否会形成循环
        // 如果从successorId出发能够到达predecessorId，则会形成循环
        Set<Long> visited = new HashSet<>();
        return canReach(successorId, predecessorId, visited);
    }

    /**
     * 检查从startId出发是否能到达targetId
     */
    private boolean canReach(Long startId, Long targetId, Set<Long> visited) {
        if (startId.equals(targetId)) {
            return true;
        }
        
        if (visited.contains(startId)) {
            return false;
        }
        
        visited.add(startId);
        
        // 获取startId的所有后继任务
        List<TaskDependency> successors = listByPredecessorId(startId);
        for (TaskDependency dep : successors) {
            if (canReach(dep.getSuccessorId(), targetId, visited)) {
                return true;
            }
        }
        
        return false;
    }

    @Override
    public List<Long> getAllPredecessorIds(Long taskId) {
        Set<Long> result = new HashSet<>();
        collectPredecessors(taskId, result);
        return new ArrayList<>(result);
    }

    /**
     * 递归收集所有前置任务ID
     */
    private void collectPredecessors(Long taskId, Set<Long> result) {
        List<TaskDependency> predecessors = listBySuccessorId(taskId);
        for (TaskDependency dep : predecessors) {
            if (!result.contains(dep.getPredecessorId())) {
                result.add(dep.getPredecessorId());
                collectPredecessors(dep.getPredecessorId(), result);
            }
        }
    }

    @Override
    public List<Long> getAllSuccessorIds(Long taskId) {
        Set<Long> result = new HashSet<>();
        collectSuccessors(taskId, result);
        return new ArrayList<>(result);
    }

    /**
     * 递归收集所有后继任务ID
     */
    private void collectSuccessors(Long taskId, Set<Long> result) {
        List<TaskDependency> successors = listByPredecessorId(taskId);
        for (TaskDependency dep : successors) {
            if (!result.contains(dep.getSuccessorId())) {
                result.add(dep.getSuccessorId());
                collectSuccessors(dep.getSuccessorId(), result);
            }
        }
    }

    @Override
    public List<Long> calculateCriticalPath(Long projectId) {
        // 获取项目的所有任务
        List<Task> tasks = taskService.listByProjectId(projectId);
        if (tasks.isEmpty()) {
            return Collections.emptyList();
        }
        
        // 获取所有依赖关系
        List<TaskDependency> dependencies = listByProjectId(projectId);
        
        // 构建任务ID到任务的映射
        Map<Long, Task> taskMap = tasks.stream()
                .collect(Collectors.toMap(Task::getId, t -> t));
        
        // 构建邻接表
        Map<Long, List<Long>> successorMap = new HashMap<>();
        Map<Long, List<Long>> predecessorMap = new HashMap<>();
        
        for (Task task : tasks) {
            successorMap.put(task.getId(), new ArrayList<>());
            predecessorMap.put(task.getId(), new ArrayList<>());
        }
        
        for (TaskDependency dep : dependencies) {
            successorMap.get(dep.getPredecessorId()).add(dep.getSuccessorId());
            predecessorMap.get(dep.getSuccessorId()).add(dep.getPredecessorId());
        }
        
        // 计算每个任务的最早开始时间（ES）和最早完成时间（EF）
        Map<Long, Integer> earliestStart = new HashMap<>();
        Map<Long, Integer> earliestFinish = new HashMap<>();
        
        // 拓扑排序
        List<Long> topologicalOrder = topologicalSort(tasks, predecessorMap);
        
        // 正向遍历计算ES和EF
        for (Long taskId : topologicalOrder) {
            Task task = taskMap.get(taskId);
            int duration = calculateTaskDuration(task);
            
            List<Long> preds = predecessorMap.get(taskId);
            int es = 0;
            for (Long predId : preds) {
                es = Math.max(es, earliestFinish.getOrDefault(predId, 0));
            }
            
            earliestStart.put(taskId, es);
            earliestFinish.put(taskId, es + duration);
        }
        
        // 计算项目总工期
        int projectDuration = earliestFinish.values().stream()
                .mapToInt(Integer::intValue)
                .max()
                .orElse(0);
        
        // 计算每个任务的最晚开始时间（LS）和最晚完成时间（LF）
        Map<Long, Integer> latestStart = new HashMap<>();
        Map<Long, Integer> latestFinish = new HashMap<>();
        
        // 反向遍历计算LS和LF
        Collections.reverse(topologicalOrder);
        for (Long taskId : topologicalOrder) {
            Task task = taskMap.get(taskId);
            int duration = calculateTaskDuration(task);
            
            List<Long> succs = successorMap.get(taskId);
            int lf = projectDuration;
            for (Long succId : succs) {
                lf = Math.min(lf, latestStart.getOrDefault(succId, projectDuration));
            }
            
            latestFinish.put(taskId, lf);
            latestStart.put(taskId, lf - duration);
        }
        
        // 找出关键路径上的任务（浮动时间为0的任务）
        List<Long> criticalPath = new ArrayList<>();
        for (Task task : tasks) {
            Long taskId = task.getId();
            int slack = latestStart.get(taskId) - earliestStart.get(taskId);
            if (slack == 0) {
                criticalPath.add(taskId);
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
        
        List<Long> preds = predecessorMap.get(taskId);
        if (preds != null) {
            for (Long predId : preds) {
                if (visiting.contains(predId)) {
                    throw new IllegalStateException("检测到循环依赖");
                }
                if (!visited.contains(predId)) {
                    topologicalSortDFS(predId, predecessorMap, visited, visiting, result);
                }
            }
        }
        
        visiting.remove(taskId);
        visited.add(taskId);
        result.add(taskId);
    }

    /**
     * 计算任务工期（天数）
     */
    private int calculateTaskDuration(Task task) {
        if (task.getStartDate() != null && task.getEndDate() != null) {
            return (int) java.time.temporal.ChronoUnit.DAYS.between(
                    task.getStartDate(), task.getEndDate()) + 1;
        }
        return 1; // 默认1天
    }

    @Override
    public boolean canTaskStart(Long taskId) {
        List<Long> blockingPredecessors = getBlockingPredecessors(taskId);
        return blockingPredecessors.isEmpty();
    }

    @Override
    public List<Long> getBlockingPredecessors(Long taskId) {
        List<TaskDependency> predecessors = listBySuccessorId(taskId);
        List<Long> blockingIds = new ArrayList<>();
        
        for (TaskDependency dep : predecessors) {
            Task predecessorTask = taskService.getById(dep.getPredecessorId());
            if (predecessorTask != null) {
                String depType = dep.getDependencyType();
                
                // 根据依赖类型判断是否阻塞
                if (TaskDependency.DependencyType.FS.equals(depType)) {
                    // 完成后开始：前置任务必须完成
                    if (!Task.Status.COMPLETED.equals(predecessorTask.getStatus())) {
                        blockingIds.add(dep.getPredecessorId());
                    }
                } else if (TaskDependency.DependencyType.SS.equals(depType)) {
                    // 同时开始：前置任务必须已开始
                    if (Task.Status.PENDING.equals(predecessorTask.getStatus())) {
                        blockingIds.add(dep.getPredecessorId());
                    }
                }
                // FF和SF类型不阻塞开始
            }
        }
        
        return blockingIds;
    }

    // ==================== 新增方法实现 ====================

    @Override
    public List<DependencyConflictDTO> detectConflicts(Long taskId) {
        List<DependencyConflictDTO> conflicts = new ArrayList<>();
        Task task = taskService.getById(taskId);
        if (task == null) {
            return conflicts;
        }

        // 检查作为后继任务的依赖冲突
        List<TaskDependency> predecessorDeps = listBySuccessorId(taskId);
        for (TaskDependency dep : predecessorDeps) {
            DependencyConflictDTO conflict = checkDependencyConflict(dep, task, true);
            if (conflict != null && conflict.isHasConflict()) {
                conflicts.add(conflict);
            }
        }

        // 检查作为前置任务的依赖冲突
        List<TaskDependency> successorDeps = listByPredecessorId(taskId);
        for (TaskDependency dep : successorDeps) {
            Task successorTask = taskService.getById(dep.getSuccessorId());
            if (successorTask != null) {
                DependencyConflictDTO conflict = checkDependencyConflict(dep, successorTask, false);
                if (conflict != null && conflict.isHasConflict()) {
                    conflicts.add(conflict);
                }
            }
        }

        return conflicts;
    }

    @Override
    public List<DependencyConflictDTO> detectProjectConflicts(Long projectId) {
        List<DependencyConflictDTO> conflicts = new ArrayList<>();
        List<TaskDependency> dependencies = listByProjectId(projectId);
        
        for (TaskDependency dep : dependencies) {
            Task successorTask = taskService.getById(dep.getSuccessorId());
            if (successorTask != null) {
                DependencyConflictDTO conflict = checkDependencyConflict(dep, successorTask, true);
                if (conflict != null && conflict.isHasConflict()) {
                    conflicts.add(conflict);
                }
            }
        }

        return conflicts;
    }

    /**
     * 检查单个依赖关系的冲突
     */
    private DependencyConflictDTO checkDependencyConflict(TaskDependency dep, Task successorTask, boolean checkAsSuccessor) {
        Task predecessorTask = taskService.getById(dep.getPredecessorId());
        if (predecessorTask == null) {
            return null;
        }

        String depType = dep.getDependencyType();
        int lagDays = dep.getLagDays() != null ? dep.getLagDays() : 0;

        // 根据依赖类型检查冲突
        switch (depType) {
            case TaskDependency.DependencyType.FS:
                return checkFSConflict(predecessorTask, successorTask, lagDays);
            case TaskDependency.DependencyType.SS:
                return checkSSConflict(predecessorTask, successorTask, lagDays);
            case TaskDependency.DependencyType.FF:
                return checkFFConflict(predecessorTask, successorTask, lagDays);
            case TaskDependency.DependencyType.SF:
                return checkSFConflict(predecessorTask, successorTask, lagDays);
            default:
                return null;
        }
    }

    /**
     * 检查FS依赖冲突（完成-开始）
     */
    private DependencyConflictDTO checkFSConflict(Task predecessor, Task successor, int lagDays) {
        // FS: 后继任务的开始日期必须 >= 前置任务的结束日期 + 延迟天数
        if (predecessor.getEndDate() != null && successor.getStartDate() != null) {
            LocalDate requiredStartDate = predecessor.getEndDate().plusDays(lagDays + 1);
            if (successor.getStartDate().isBefore(requiredStartDate)) {
                return DependencyConflictDTO.builder()
                        .hasConflict(true)
                        .conflictType(DependencyConflictDTO.ConflictType.DATE_CONFLICT)
                        .description(String.format("FS依赖冲突：任务[%s]的开始日期(%s)早于前置任务[%s]的结束日期(%s)加延迟(%d天)",
                                successor.getName(), successor.getStartDate(),
                                predecessor.getName(), predecessor.getEndDate(), lagDays))
                        .taskId(successor.getId())
                        .taskName(successor.getName())
                        .predecessorId(predecessor.getId())
                        .predecessorName(predecessor.getName())
                        .dependencyType(TaskDependency.DependencyType.FS)
                        .suggestedStartDate(requiredStartDate)
                        .build();
            }
        }

        // 检查状态冲突
        if (!Task.Status.COMPLETED.equals(predecessor.getStatus()) &&
            Task.Status.IN_PROGRESS.equals(successor.getStatus())) {
            return DependencyConflictDTO.builder()
                    .hasConflict(true)
                    .conflictType(DependencyConflictDTO.ConflictType.STATUS_CONFLICT)
                    .description(String.format("FS状态冲突：前置任务[%s]未完成，但后继任务[%s]已开始",
                            predecessor.getName(), successor.getName()))
                    .taskId(successor.getId())
                    .taskName(successor.getName())
                    .predecessorId(predecessor.getId())
                    .predecessorName(predecessor.getName())
                    .dependencyType(TaskDependency.DependencyType.FS)
                    .build();
        }

        return DependencyConflictDTO.builder().hasConflict(false).build();
    }

    /**
     * 检查SS依赖冲突（开始-开始）
     */
    private DependencyConflictDTO checkSSConflict(Task predecessor, Task successor, int lagDays) {
        // SS: 后继任务的开始日期必须 >= 前置任务的开始日期 + 延迟天数
        if (predecessor.getStartDate() != null && successor.getStartDate() != null) {
            LocalDate requiredStartDate = predecessor.getStartDate().plusDays(lagDays);
            if (successor.getStartDate().isBefore(requiredStartDate)) {
                return DependencyConflictDTO.builder()
                        .hasConflict(true)
                        .conflictType(DependencyConflictDTO.ConflictType.DATE_CONFLICT)
                        .description(String.format("SS依赖冲突：任务[%s]的开始日期(%s)早于前置任务[%s]的开始日期(%s)加延迟(%d天)",
                                successor.getName(), successor.getStartDate(),
                                predecessor.getName(), predecessor.getStartDate(), lagDays))
                        .taskId(successor.getId())
                        .taskName(successor.getName())
                        .predecessorId(predecessor.getId())
                        .predecessorName(predecessor.getName())
                        .dependencyType(TaskDependency.DependencyType.SS)
                        .suggestedStartDate(requiredStartDate)
                        .build();
            }
        }

        // 检查状态冲突
        if (Task.Status.PENDING.equals(predecessor.getStatus()) &&
            !Task.Status.PENDING.equals(successor.getStatus())) {
            return DependencyConflictDTO.builder()
                    .hasConflict(true)
                    .conflictType(DependencyConflictDTO.ConflictType.STATUS_CONFLICT)
                    .description(String.format("SS状态冲突：前置任务[%s]未开始，但后继任务[%s]已开始",
                            predecessor.getName(), successor.getName()))
                    .taskId(successor.getId())
                    .taskName(successor.getName())
                    .predecessorId(predecessor.getId())
                    .predecessorName(predecessor.getName())
                    .dependencyType(TaskDependency.DependencyType.SS)
                    .build();
        }

        return DependencyConflictDTO.builder().hasConflict(false).build();
    }

    /**
     * 检查FF依赖冲突（完成-完成）
     */
    private DependencyConflictDTO checkFFConflict(Task predecessor, Task successor, int lagDays) {
        // FF: 后继任务的结束日期必须 >= 前置任务的结束日期 + 延迟天数
        if (predecessor.getEndDate() != null && successor.getEndDate() != null) {
            LocalDate requiredEndDate = predecessor.getEndDate().plusDays(lagDays);
            if (successor.getEndDate().isBefore(requiredEndDate)) {
                return DependencyConflictDTO.builder()
                        .hasConflict(true)
                        .conflictType(DependencyConflictDTO.ConflictType.DATE_CONFLICT)
                        .description(String.format("FF依赖冲突：任务[%s]的结束日期(%s)早于前置任务[%s]的结束日期(%s)加延迟(%d天)",
                                successor.getName(), successor.getEndDate(),
                                predecessor.getName(), predecessor.getEndDate(), lagDays))
                        .taskId(successor.getId())
                        .taskName(successor.getName())
                        .predecessorId(predecessor.getId())
                        .predecessorName(predecessor.getName())
                        .dependencyType(TaskDependency.DependencyType.FF)
                        .suggestedEndDate(requiredEndDate)
                        .build();
            }
        }

        // 检查状态冲突
        if (!Task.Status.COMPLETED.equals(predecessor.getStatus()) &&
            Task.Status.COMPLETED.equals(successor.getStatus())) {
            return DependencyConflictDTO.builder()
                    .hasConflict(true)
                    .conflictType(DependencyConflictDTO.ConflictType.STATUS_CONFLICT)
                    .description(String.format("FF状态冲突：前置任务[%s]未完成，但后继任务[%s]已完成",
                            predecessor.getName(), successor.getName()))
                    .taskId(successor.getId())
                    .taskName(successor.getName())
                    .predecessorId(predecessor.getId())
                    .predecessorName(predecessor.getName())
                    .dependencyType(TaskDependency.DependencyType.FF)
                    .build();
        }

        return DependencyConflictDTO.builder().hasConflict(false).build();
    }

    /**
     * 检查SF依赖冲突（开始-完成）
     */
    private DependencyConflictDTO checkSFConflict(Task predecessor, Task successor, int lagDays) {
        // SF: 后继任务的结束日期必须 >= 前置任务的开始日期 + 延迟天数
        if (predecessor.getStartDate() != null && successor.getEndDate() != null) {
            LocalDate requiredEndDate = predecessor.getStartDate().plusDays(lagDays);
            if (successor.getEndDate().isBefore(requiredEndDate)) {
                return DependencyConflictDTO.builder()
                        .hasConflict(true)
                        .conflictType(DependencyConflictDTO.ConflictType.DATE_CONFLICT)
                        .description(String.format("SF依赖冲突：任务[%s]的结束日期(%s)早于前置任务[%s]的开始日期(%s)加延迟(%d天)",
                                successor.getName(), successor.getEndDate(),
                                predecessor.getName(), predecessor.getStartDate(), lagDays))
                        .taskId(successor.getId())
                        .taskName(successor.getName())
                        .predecessorId(predecessor.getId())
                        .predecessorName(predecessor.getName())
                        .dependencyType(TaskDependency.DependencyType.SF)
                        .suggestedEndDate(requiredEndDate)
                        .build();
            }
        }

        // 检查状态冲突
        if (Task.Status.PENDING.equals(predecessor.getStatus()) &&
            Task.Status.COMPLETED.equals(successor.getStatus())) {
            return DependencyConflictDTO.builder()
                    .hasConflict(true)
                    .conflictType(DependencyConflictDTO.ConflictType.STATUS_CONFLICT)
                    .description(String.format("SF状态冲突：前置任务[%s]未开始，但后继任务[%s]已完成",
                            predecessor.getName(), successor.getName()))
                    .taskId(successor.getId())
                    .taskName(successor.getName())
                    .predecessorId(predecessor.getId())
                    .predecessorName(predecessor.getName())
                    .dependencyType(TaskDependency.DependencyType.SF)
                    .build();
        }

        return DependencyConflictDTO.builder().hasConflict(false).build();
    }

    @Override
    public DependencyConflictDTO validateDependency(TaskDependency dependency) {
        // 检查自依赖
        if (dependency.getPredecessorId().equals(dependency.getSuccessorId())) {
            return DependencyConflictDTO.builder()
                    .hasConflict(true)
                    .conflictType(DependencyConflictDTO.ConflictType.CIRCULAR)
                    .description("任务不能依赖自己")
                    .taskId(dependency.getSuccessorId())
                    .predecessorId(dependency.getPredecessorId())
                    .build();
        }

        // 检查循环依赖
        if (wouldCreateCycle(dependency.getPredecessorId(), dependency.getSuccessorId())) {
            return DependencyConflictDTO.builder()
                    .hasConflict(true)
                    .conflictType(DependencyConflictDTO.ConflictType.CIRCULAR)
                    .description("添加此依赖会形成循环依赖")
                    .taskId(dependency.getSuccessorId())
                    .predecessorId(dependency.getPredecessorId())
                    .build();
        }

        // 检查日期冲突
        Task predecessor = taskService.getById(dependency.getPredecessorId());
        Task successor = taskService.getById(dependency.getSuccessorId());
        
        if (predecessor != null && successor != null) {
            DependencyConflictDTO conflict = checkDependencyConflict(dependency, successor, true);
            if (conflict != null && conflict.isHasConflict()) {
                return conflict;
            }
        }

        return DependencyConflictDTO.builder().hasConflict(false).build();
    }

    @Override
    public CriticalPathDTO calculateCriticalPathDetail(Long projectId) {
        // 获取项目的所有任务
        List<Task> tasks = taskService.listByProjectId(projectId);
        if (tasks.isEmpty()) {
            return CriticalPathDTO.builder()
                    .criticalTaskIds(Collections.emptyList())
                    .criticalTasks(Collections.emptyList())
                    .projectDuration(0)
                    .build();
        }

        // 获取所有依赖关系
        List<TaskDependency> dependencies = listByProjectId(projectId);

        // 构建任务ID到任务的映射
        Map<Long, Task> taskMap = tasks.stream()
                .collect(Collectors.toMap(Task::getId, t -> t));

        // 构建邻接表
        Map<Long, List<Long>> successorMap = new HashMap<>();
        Map<Long, List<Long>> predecessorMap = new HashMap<>();

        for (Task task : tasks) {
            successorMap.put(task.getId(), new ArrayList<>());
            predecessorMap.put(task.getId(), new ArrayList<>());
        }

        for (TaskDependency dep : dependencies) {
            if (successorMap.containsKey(dep.getPredecessorId())) {
                successorMap.get(dep.getPredecessorId()).add(dep.getSuccessorId());
            }
            if (predecessorMap.containsKey(dep.getSuccessorId())) {
                predecessorMap.get(dep.getSuccessorId()).add(dep.getPredecessorId());
            }
        }

        // 计算每个任务的最早开始时间（ES）和最早完成时间（EF）
        Map<Long, Integer> earliestStart = new HashMap<>();
        Map<Long, Integer> earliestFinish = new HashMap<>();

        // 拓扑排序
        List<Long> topologicalOrder = topologicalSort(tasks, predecessorMap);

        // 正向遍历计算ES和EF
        for (Long taskId : topologicalOrder) {
            Task task = taskMap.get(taskId);
            int duration = calculateTaskDuration(task);

            List<Long> preds = predecessorMap.get(taskId);
            int es = 0;
            for (Long predId : preds) {
                es = Math.max(es, earliestFinish.getOrDefault(predId, 0));
            }

            earliestStart.put(taskId, es);
            earliestFinish.put(taskId, es + duration);
        }

        // 计算项目总工期
        int projectDuration = earliestFinish.values().stream()
                .mapToInt(Integer::intValue)
                .max()
                .orElse(0);

        // 计算每个任务的最晚开始时间（LS）和最晚完成时间（LF）
        Map<Long, Integer> latestStart = new HashMap<>();
        Map<Long, Integer> latestFinish = new HashMap<>();

        // 反向遍历计算LS和LF
        List<Long> reversedOrder = new ArrayList<>(topologicalOrder);
        Collections.reverse(reversedOrder);
        for (Long taskId : reversedOrder) {
            Task task = taskMap.get(taskId);
            int duration = calculateTaskDuration(task);

            List<Long> succs = successorMap.get(taskId);
            int lf = projectDuration;
            for (Long succId : succs) {
                lf = Math.min(lf, latestStart.getOrDefault(succId, projectDuration));
            }

            latestFinish.put(taskId, lf);
            latestStart.put(taskId, lf - duration);
        }

        // 构建关键路径任务信息
        List<CriticalPathDTO.CriticalTaskInfo> criticalTasks = new ArrayList<>();
        List<Long> criticalTaskIds = new ArrayList<>();

        for (Task task : tasks) {
            Long taskId = task.getId();
            int es = earliestStart.getOrDefault(taskId, 0);
            int ef = earliestFinish.getOrDefault(taskId, 0);
            int ls = latestStart.getOrDefault(taskId, 0);
            int lf = latestFinish.getOrDefault(taskId, 0);
            int slack = ls - es;
            int duration = calculateTaskDuration(task);
            boolean isCritical = slack == 0;

            if (isCritical) {
                criticalTaskIds.add(taskId);
            }

            criticalTasks.add(CriticalPathDTO.CriticalTaskInfo.builder()
                    .taskId(taskId)
                    .taskName(task.getName())
                    .earliestStart(es)
                    .earliestFinish(ef)
                    .latestStart(ls)
                    .latestFinish(lf)
                    .slack(slack)
                    .duration(duration)
                    .startDate(task.getStartDate())
                    .endDate(task.getEndDate())
                    .isCritical(isCritical)
                    .build());
        }

        // 计算项目日期
        LocalDate projectStartDate = tasks.stream()
                .map(Task::getStartDate)
                .filter(Objects::nonNull)
                .min(LocalDate::compareTo)
                .orElse(null);

        LocalDate projectEndDate = tasks.stream()
                .map(Task::getEndDate)
                .filter(Objects::nonNull)
                .max(LocalDate::compareTo)
                .orElse(null);

        return CriticalPathDTO.builder()
                .criticalTaskIds(criticalTaskIds)
                .criticalTasks(criticalTasks)
                .projectDuration(projectDuration)
                .projectStartDate(projectStartDate)
                .projectEndDate(projectEndDate)
                .build();
    }

    @Override
    public LocalDate calculateSuggestedStartDate(Long taskId) {
        List<TaskDependency> predecessors = listBySuccessorId(taskId);
        LocalDate suggestedDate = LocalDate.now();

        for (TaskDependency dep : predecessors) {
            Task predecessorTask = taskService.getById(dep.getPredecessorId());
            if (predecessorTask == null) continue;

            int lagDays = dep.getLagDays() != null ? dep.getLagDays() : 0;
            LocalDate requiredDate = null;

            switch (dep.getDependencyType()) {
                case TaskDependency.DependencyType.FS:
                    // 前置任务完成后开始
                    if (predecessorTask.getEndDate() != null) {
                        requiredDate = predecessorTask.getEndDate().plusDays(lagDays + 1);
                    }
                    break;
                case TaskDependency.DependencyType.SS:
                    // 前置任务开始后开始
                    if (predecessorTask.getStartDate() != null) {
                        requiredDate = predecessorTask.getStartDate().plusDays(lagDays);
                    }
                    break;
                case TaskDependency.DependencyType.FF:
                case TaskDependency.DependencyType.SF:
                    // FF和SF不直接约束开始日期
                    break;
            }

            if (requiredDate != null && requiredDate.isAfter(suggestedDate)) {
                suggestedDate = requiredDate;
            }
        }

        return suggestedDate;
    }

    @Override
    public boolean canTaskComplete(Long taskId) {
        List<Long> blockingTasks = getBlockingForCompletion(taskId);
        return blockingTasks.isEmpty();
    }

    @Override
    public List<Long> getBlockingForCompletion(Long taskId) {
        List<TaskDependency> predecessors = listBySuccessorId(taskId);
        List<Long> blockingIds = new ArrayList<>();

        for (TaskDependency dep : predecessors) {
            Task predecessorTask = taskService.getById(dep.getPredecessorId());
            if (predecessorTask == null) continue;

            String depType = dep.getDependencyType();

            // 根据依赖类型判断是否阻塞完成
            if (TaskDependency.DependencyType.FF.equals(depType)) {
                // 同时完成：前置任务必须完成
                if (!Task.Status.COMPLETED.equals(predecessorTask.getStatus())) {
                    blockingIds.add(dep.getPredecessorId());
                }
            } else if (TaskDependency.DependencyType.SF.equals(depType)) {
                // 开始后完成：前置任务必须已开始
                if (Task.Status.PENDING.equals(predecessorTask.getStatus())) {
                    blockingIds.add(dep.getPredecessorId());
                }
            }
            // FS和SS类型不阻塞完成
        }

        return blockingIds;
    }

    @Override
    public List<DependencyDetailDTO> listDependencyDetails(Long projectId) {
        List<TaskDependency> dependencies = listByProjectId(projectId);
        List<DependencyDetailDTO> details = new ArrayList<>();

        for (TaskDependency dep : dependencies) {
            Task predecessor = taskService.getById(dep.getPredecessorId());
            Task successor = taskService.getById(dep.getSuccessorId());

            if (predecessor == null || successor == null) continue;

            // 检查冲突
            DependencyConflictDTO conflict = checkDependencyConflict(dep, successor, true);
            boolean hasConflict = conflict != null && conflict.isHasConflict();
            String conflictDescription = hasConflict ? conflict.getDescription() : null;

            details.add(DependencyDetailDTO.builder()
                    .id(dep.getId())
                    .predecessorId(predecessor.getId())
                    .predecessorName(predecessor.getName())
                    .predecessorStartDate(predecessor.getStartDate())
                    .predecessorEndDate(predecessor.getEndDate())
                    .predecessorStatus(predecessor.getStatus())
                    .successorId(successor.getId())
                    .successorName(successor.getName())
                    .successorStartDate(successor.getStartDate())
                    .successorEndDate(successor.getEndDate())
                    .successorStatus(successor.getStatus())
                    .dependencyType(dep.getDependencyType())
                    .lagDays(dep.getLagDays())
                    .description(dep.getDescription())
                    .hasConflict(hasConflict)
                    .conflictDescription(conflictDescription)
                    .build());
        }

        return details;
    }
}