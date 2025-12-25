package com.mota.project.service.impl;

import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.mota.project.entity.Subtask;
import com.mota.project.entity.Task;
import com.mota.project.mapper.SubtaskMapper;
import com.mota.project.service.SubtaskService;
import com.mota.project.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 子任务 Service 实现类
 * 支持多级子任务结构
 */
@Service
@RequiredArgsConstructor
public class SubtaskServiceImpl extends ServiceImpl<SubtaskMapper, Subtask> implements SubtaskService {

    private final SubtaskMapper subtaskMapper;
    
    @Lazy
    private final TaskService taskService;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Subtask createSubtask(Subtask subtask) {
        // 设置默认值
        if (subtask.getStatus() == null) {
            subtask.setStatus(Subtask.Status.PENDING);
        }
        if (subtask.getPriority() == null) {
            subtask.setPriority(Subtask.Priority.MEDIUM);
        }
        if (subtask.getProgress() == null) {
            subtask.setProgress(0);
        }
        if (subtask.getLevel() == null) {
            subtask.setLevel(0); // 一级子任务
        }
        
        // 设置排序顺序
        if (subtask.getSortOrder() == null) {
            Integer maxSortOrder = subtaskMapper.getMaxSortOrder(subtask.getParentTaskId());
            subtask.setSortOrder(maxSortOrder + 1);
        }
        
        // 从父任务获取项目ID
        if (subtask.getProjectId() == null && subtask.getParentTaskId() != null) {
            Task parentTask = taskService.getById(subtask.getParentTaskId());
            if (parentTask != null) {
                subtask.setProjectId(parentTask.getProjectId());
            }
        }
        
        save(subtask);
        
        // 更新父任务进度
        updateParentTaskProgress(subtask.getParentTaskId());
        
        return subtask;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Subtask createChildSubtask(Long parentSubtaskId, Subtask subtask) {
        // 获取父子任务
        Subtask parentSubtask = getById(parentSubtaskId);
        if (parentSubtask == null) {
            throw new RuntimeException("父子任务不存在");
        }
        
        // 设置父子任务ID和层级
        subtask.setParentSubtaskId(parentSubtaskId);
        subtask.setParentTaskId(parentSubtask.getParentTaskId());
        subtask.setProjectId(parentSubtask.getProjectId());
        subtask.setLevel(parentSubtask.getLevel() + 1);
        
        // 设置默认值
        if (subtask.getStatus() == null) {
            subtask.setStatus(Subtask.Status.PENDING);
        }
        if (subtask.getPriority() == null) {
            subtask.setPriority(Subtask.Priority.MEDIUM);
        }
        if (subtask.getProgress() == null) {
            subtask.setProgress(0);
        }
        
        // 设置排序顺序
        if (subtask.getSortOrder() == null) {
            Integer maxSortOrder = subtaskMapper.getMaxSortOrderByParentSubtask(parentSubtaskId);
            subtask.setSortOrder(maxSortOrder + 1);
        }
        
        save(subtask);
        
        // 更新父子任务进度
        updateSubtaskProgress(parentSubtaskId);
        
        // 更新父任务进度
        updateParentTaskProgress(subtask.getParentTaskId());
        
        return subtask;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Subtask updateSubtask(Subtask subtask) {
        updateById(subtask);
        
        Subtask updated = getById(subtask.getId());
        
        // 更新父子任务进度（如果有）
        if (updated != null && updated.getParentSubtaskId() != null) {
            updateSubtaskProgress(updated.getParentSubtaskId());
        }
        
        // 更新父任务进度
        if (updated != null && updated.getParentTaskId() != null) {
            updateParentTaskProgress(updated.getParentTaskId());
        }
        
        return updated;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean deleteSubtask(Long id) {
        Subtask subtask = getById(id);
        if (subtask == null) {
            return false;
        }
        
        Long parentTaskId = subtask.getParentTaskId();
        Long parentSubtaskId = subtask.getParentSubtaskId();
        
        // 递归删除子任务及其所有子子任务
        boolean result = subtaskMapper.deleteWithChildren(id) > 0;
        
        // 更新父子任务进度（如果有）
        if (result && parentSubtaskId != null) {
            updateSubtaskProgress(parentSubtaskId);
        }
        
        // 更新父任务进度
        if (result && parentTaskId != null) {
            updateParentTaskProgress(parentTaskId);
        }
        
        return result;
    }

    @Override
    public List<Subtask> listByParentTaskId(Long parentTaskId) {
        return subtaskMapper.selectByParentTaskId(parentTaskId);
    }

    @Override
    public List<Subtask> listAllByParentTaskId(Long parentTaskId) {
        return subtaskMapper.selectAllByParentTaskId(parentTaskId);
    }

    @Override
    public List<Subtask> listTreeByParentTaskId(Long parentTaskId) {
        List<Subtask> tree = subtaskMapper.selectTreeByParentTaskId(parentTaskId);
        // 填充子任务统计信息
        for (Subtask subtask : tree) {
            fillSubtaskStats(subtask);
        }
        return tree;
    }

    @Override
    public List<Subtask> listByParentSubtaskId(Long parentSubtaskId) {
        return subtaskMapper.selectByParentSubtaskId(parentSubtaskId);
    }

    @Override
    public List<Subtask> listByProjectId(Long projectId) {
        return subtaskMapper.selectByProjectId(projectId);
    }

    @Override
    public List<Subtask> listByAssigneeId(Long assigneeId) {
        return subtaskMapper.selectByAssigneeId(assigneeId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean updateStatus(Long id, String status) {
        Subtask subtask = getById(id);
        if (subtask == null) {
            return false;
        }
        
        LambdaUpdateWrapper<Subtask> wrapper = new LambdaUpdateWrapper<>();
        wrapper.eq(Subtask::getId, id)
               .set(Subtask::getStatus, status);
        
        // 如果状态为已完成，设置完成时间和进度
        if (Subtask.Status.COMPLETED.equals(status)) {
            wrapper.set(Subtask::getCompletedAt, LocalDateTime.now())
                   .set(Subtask::getProgress, 100);
        }
        
        boolean result = update(wrapper);
        
        // 更新父子任务进度（如果有）
        if (result && subtask.getParentSubtaskId() != null) {
            updateSubtaskProgress(subtask.getParentSubtaskId());
        }
        
        // 更新父任务进度
        if (result && subtask.getParentTaskId() != null) {
            updateParentTaskProgress(subtask.getParentTaskId());
        }
        
        return result;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean updateProgress(Long id, Integer progress) {
        Subtask subtask = getById(id);
        if (subtask == null) {
            return false;
        }
        
        LambdaUpdateWrapper<Subtask> wrapper = new LambdaUpdateWrapper<>();
        wrapper.eq(Subtask::getId, id)
               .set(Subtask::getProgress, progress);
        
        // 根据进度自动更新状态
        if (progress >= 100) {
            wrapper.set(Subtask::getStatus, Subtask.Status.COMPLETED)
                   .set(Subtask::getCompletedAt, LocalDateTime.now());
        } else if (progress > 0) {
            wrapper.set(Subtask::getStatus, Subtask.Status.IN_PROGRESS);
        }
        
        boolean result = update(wrapper);
        
        // 更新父子任务进度（如果有）
        if (result && subtask.getParentSubtaskId() != null) {
            updateSubtaskProgress(subtask.getParentSubtaskId());
        }
        
        // 更新父任务进度
        if (result && subtask.getParentTaskId() != null) {
            updateParentTaskProgress(subtask.getParentTaskId());
        }
        
        return result;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean completeSubtask(Long id) {
        return updateStatus(id, Subtask.Status.COMPLETED);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean assignSubtask(Long id, Long assigneeId) {
        LambdaUpdateWrapper<Subtask> wrapper = new LambdaUpdateWrapper<>();
        wrapper.eq(Subtask::getId, id)
               .set(Subtask::getAssigneeId, assigneeId);
        return update(wrapper);
    }

    @Override
    public Map<String, Long> countByParentTaskIdGroupByStatus(Long parentTaskId) {
        List<Map<String, Object>> results = subtaskMapper.countByParentTaskIdGroupByStatus(parentTaskId);
        Map<String, Long> countMap = new HashMap<>();
        for (Map<String, Object> result : results) {
            String status = (String) result.get("status");
            Long count = ((Number) result.get("count")).longValue();
            countMap.put(status, count);
        }
        return countMap;
    }

    @Override
    public Integer calculateParentTaskProgress(Long parentTaskId) {
        List<Subtask> subtasks = listAllByParentTaskId(parentTaskId);
        if (subtasks.isEmpty()) {
            return null; // 没有子任务时返回null，表示不应该基于子任务计算进度
        }
        
        int totalProgress = 0;
        for (Subtask subtask : subtasks) {
            totalProgress += subtask.getProgress() != null ? subtask.getProgress() : 0;
        }
        
        return totalProgress / subtasks.size();
    }

    @Override
    public Integer calculateSubtaskProgress(Long subtaskId) {
        return subtaskMapper.calculateSubtaskProgress(subtaskId);
    }

    @Override
    public Map<String, Object> getSubtaskProgressSummary(Long parentTaskId) {
        List<Subtask> allSubtasks = listAllByParentTaskId(parentTaskId);
        
        int total = allSubtasks.size();
        int completed = 0;
        int inProgress = 0;
        int pending = 0;
        int totalProgress = 0;
        
        for (Subtask subtask : allSubtasks) {
            if (Subtask.Status.COMPLETED.equals(subtask.getStatus())) {
                completed++;
            } else if (Subtask.Status.IN_PROGRESS.equals(subtask.getStatus())) {
                inProgress++;
            } else if (Subtask.Status.PENDING.equals(subtask.getStatus())) {
                pending++;
            }
            totalProgress += subtask.getProgress() != null ? subtask.getProgress() : 0;
        }
        
        Map<String, Object> summary = new HashMap<>();
        summary.put("total", total);
        summary.put("completed", completed);
        summary.put("inProgress", inProgress);
        summary.put("pending", pending);
        summary.put("averageProgress", total > 0 ? totalProgress / total : 0);
        summary.put("completionRate", total > 0 ? (completed * 100) / total : 0);
        
        return summary;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean updateSortOrder(List<Subtask> subtasks) {
        if (subtasks == null || subtasks.isEmpty()) {
            return true;
        }
        return subtaskMapper.batchUpdateSortOrder(subtasks) > 0;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean batchCreateSubtasks(List<Subtask> subtasks) {
        if (subtasks == null || subtasks.isEmpty()) {
            return true;
        }
        
        Long parentTaskId = null;
        for (Subtask subtask : subtasks) {
            if (subtask.getStatus() == null) {
                subtask.setStatus(Subtask.Status.PENDING);
            }
            if (subtask.getPriority() == null) {
                subtask.setPriority(Subtask.Priority.MEDIUM);
            }
            if (subtask.getProgress() == null) {
                subtask.setProgress(0);
            }
            if (subtask.getLevel() == null) {
                subtask.setLevel(0);
            }
            parentTaskId = subtask.getParentTaskId();
        }
        
        boolean result = saveBatch(subtasks);
        
        // 更新父任务进度
        if (result && parentTaskId != null) {
            updateParentTaskProgress(parentTaskId);
        }
        
        return result;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean moveSubtask(Long subtaskId, Long newParentTaskId, Long newParentSubtaskId) {
        Subtask subtask = getById(subtaskId);
        if (subtask == null) {
            return false;
        }
        
        Long oldParentTaskId = subtask.getParentTaskId();
        Long oldParentSubtaskId = subtask.getParentSubtaskId();
        
        // 更新子任务的父任务和父子任务
        LambdaUpdateWrapper<Subtask> wrapper = new LambdaUpdateWrapper<>();
        wrapper.eq(Subtask::getId, subtaskId);
        
        if (newParentSubtaskId != null) {
            // 移动到另一个子任务下
            Subtask newParentSubtask = getById(newParentSubtaskId);
            if (newParentSubtask == null) {
                return false;
            }
            wrapper.set(Subtask::getParentTaskId, newParentSubtask.getParentTaskId())
                   .set(Subtask::getParentSubtaskId, newParentSubtaskId)
                   .set(Subtask::getProjectId, newParentSubtask.getProjectId())
                   .set(Subtask::getLevel, newParentSubtask.getLevel() + 1);
        } else if (newParentTaskId != null) {
            // 移动到另一个任务下
            Task newParentTask = taskService.getById(newParentTaskId);
            if (newParentTask == null) {
                return false;
            }
            wrapper.set(Subtask::getParentTaskId, newParentTaskId)
                   .set(Subtask::getParentSubtaskId, null)
                   .set(Subtask::getProjectId, newParentTask.getProjectId())
                   .set(Subtask::getLevel, 0);
        }
        
        boolean result = update(wrapper);
        
        // 更新旧父子任务进度
        if (result && oldParentSubtaskId != null) {
            updateSubtaskProgress(oldParentSubtaskId);
        }
        
        // 更新旧父任务进度
        if (result && oldParentTaskId != null) {
            updateParentTaskProgress(oldParentTaskId);
        }
        
        // 更新新父子任务进度
        if (result && newParentSubtaskId != null) {
            updateSubtaskProgress(newParentSubtaskId);
        }
        
        // 更新新父任务进度
        if (result && newParentTaskId != null) {
            updateParentTaskProgress(newParentTaskId);
        }
        
        return result;
    }

    /**
     * 更新父任务进度
     */
    private void updateParentTaskProgress(Long parentTaskId) {
        Integer progress = calculateParentTaskProgress(parentTaskId);
        if (progress != null) {
            taskService.updateProgress(parentTaskId, progress, "基于子任务自动计算");
        }
    }

    /**
     * 更新子任务进度（基于其子子任务）
     */
    private void updateSubtaskProgress(Long subtaskId) {
        Integer progress = calculateSubtaskProgress(subtaskId);
        if (progress != null && progress > 0) {
            LambdaUpdateWrapper<Subtask> wrapper = new LambdaUpdateWrapper<>();
            wrapper.eq(Subtask::getId, subtaskId)
                   .set(Subtask::getProgress, progress);
            
            if (progress >= 100) {
                wrapper.set(Subtask::getStatus, Subtask.Status.COMPLETED)
                       .set(Subtask::getCompletedAt, LocalDateTime.now());
            } else if (progress > 0) {
                wrapper.set(Subtask::getStatus, Subtask.Status.IN_PROGRESS);
            }
            
            update(wrapper);
        }
    }

    /**
     * 填充子任务统计信息
     */
    private void fillSubtaskStats(Subtask subtask) {
        Integer childrenCount = subtaskMapper.countByParentSubtaskId(subtask.getId());
        Integer completedCount = subtaskMapper.countCompletedByParentSubtaskId(subtask.getId());
        subtask.setChildrenCount(childrenCount);
        subtask.setCompletedChildrenCount(completedCount);
        
        // 递归填充子任务的统计信息
        if (subtask.getChildren() != null) {
            for (Subtask child : subtask.getChildren()) {
                fillSubtaskStats(child);
            }
        }
    }
}