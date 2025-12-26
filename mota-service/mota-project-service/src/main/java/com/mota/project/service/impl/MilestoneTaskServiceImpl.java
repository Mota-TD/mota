package com.mota.project.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.mota.common.core.exception.BusinessException;
import com.mota.project.entity.MilestoneTask;
import com.mota.project.entity.MilestoneTaskAttachment;
import com.mota.project.mapper.MilestoneTaskAttachmentMapper;
import com.mota.project.mapper.MilestoneTaskMapper;
import com.mota.project.service.MilestoneService;
import com.mota.project.service.MilestoneTaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 里程碑任务服务实现
 */
@Service
@RequiredArgsConstructor
public class MilestoneTaskServiceImpl extends ServiceImpl<MilestoneTaskMapper, MilestoneTask> implements MilestoneTaskService {

    private final MilestoneTaskAttachmentMapper attachmentMapper;
    
    @Lazy
    private final MilestoneService milestoneService;

    @Override
    public List<MilestoneTask> getByMilestoneId(Long milestoneId) {
        return baseMapper.selectByMilestoneId(milestoneId);
    }

    @Override
    public List<MilestoneTask> getByAssigneeId(Long assigneeId) {
        return baseMapper.selectByAssigneeId(assigneeId);
    }

    @Override
    public MilestoneTask getDetailById(Long id) {
        MilestoneTask task = getById(id);
        if (task == null) {
            throw new BusinessException("任务不存在");
        }
        
        // 加载子任务
        List<MilestoneTask> subTasks = baseMapper.selectByParentTaskId(id);
        task.setSubTasks(subTasks);
        
        // 加载附件
        List<MilestoneTaskAttachment> attachments = attachmentMapper.selectByTaskId(id);
        task.setAttachments(attachments);
        
        return task;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public MilestoneTask createTask(MilestoneTask task) {
        // 从里程碑获取 project_id
        if (task.getProjectId() == null && task.getMilestoneId() != null) {
            var milestone = milestoneService.getById(task.getMilestoneId());
            if (milestone != null) {
                task.setProjectId(milestone.getProjectId());
            }
        }
        
        // 设置默认值
        if (!StringUtils.hasText(task.getStatus())) {
            task.setStatus(MilestoneTask.Status.PENDING);
        }
        if (task.getProgress() == null) {
            task.setProgress(0);
        }
        if (task.getSortOrder() == null) {
            // 获取当前里程碑最大排序号
            LambdaQueryWrapper<MilestoneTask> wrapper = new LambdaQueryWrapper<>();
            wrapper.eq(MilestoneTask::getMilestoneId, task.getMilestoneId());
            wrapper.isNull(MilestoneTask::getParentTaskId);
            wrapper.orderByDesc(MilestoneTask::getSortOrder);
            wrapper.last("LIMIT 1");
            MilestoneTask last = getOne(wrapper);
            task.setSortOrder(last != null ? last.getSortOrder() + 1 : 0);
        }
        
        save(task);
        
        // 更新里程碑进度
        milestoneService.updateMilestoneProgress(task.getMilestoneId());
        
        return task;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public MilestoneTask createSubTask(Long parentTaskId, MilestoneTask task) {
        MilestoneTask parentTask = getById(parentTaskId);
        if (parentTask == null) {
            throw new BusinessException("父任务不存在");
        }
        
        task.setParentTaskId(parentTaskId);
        task.setMilestoneId(parentTask.getMilestoneId());
        task.setProjectId(parentTask.getProjectId());
        
        // 设置默认值
        if (!StringUtils.hasText(task.getStatus())) {
            task.setStatus(MilestoneTask.Status.PENDING);
        }
        if (task.getProgress() == null) {
            task.setProgress(0);
        }
        if (task.getSortOrder() == null) {
            // 获取当前父任务下最大排序号
            LambdaQueryWrapper<MilestoneTask> wrapper = new LambdaQueryWrapper<>();
            wrapper.eq(MilestoneTask::getParentTaskId, parentTaskId);
            wrapper.orderByDesc(MilestoneTask::getSortOrder);
            wrapper.last("LIMIT 1");
            MilestoneTask last = getOne(wrapper);
            task.setSortOrder(last != null ? last.getSortOrder() + 1 : 0);
        }
        
        save(task);
        
        // 更新父任务进度
        updateParentTaskProgress(parentTaskId);
        
        // 更新里程碑进度
        milestoneService.updateMilestoneProgress(task.getMilestoneId());
        
        return task;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public MilestoneTask updateTask(MilestoneTask task) {
        MilestoneTask existing = getById(task.getId());
        if (existing == null) {
            throw new BusinessException("任务不存在");
        }
        
        if (StringUtils.hasText(task.getName())) {
            existing.setName(task.getName());
        }
        if (task.getDescription() != null) {
            existing.setDescription(task.getDescription());
        }
        if (task.getDueDate() != null) {
            existing.setDueDate(task.getDueDate());
        }
        if (task.getAssigneeId() != null) {
            existing.setAssigneeId(task.getAssigneeId());
        }
        if (task.getPriority() != null) {
            existing.setPriority(task.getPriority());
        }
        if (task.getSortOrder() != null) {
            existing.setSortOrder(task.getSortOrder());
        }
        
        updateById(existing);
        return existing;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean updateTaskProgress(Long taskId, Integer progress) {
        MilestoneTask task = getById(taskId);
        if (task == null) {
            return false;
        }
        
        task.setProgress(progress);
        
        // 如果进度为100，自动完成任务
        if (progress >= 100) {
            task.setStatus(MilestoneTask.Status.COMPLETED);
            task.setCompletedAt(LocalDateTime.now());
        } else if (progress > 0) {
            task.setStatus(MilestoneTask.Status.IN_PROGRESS);
        }
        
        updateById(task);
        
        // 更新父任务进度
        if (task.getParentTaskId() != null) {
            updateParentTaskProgress(task.getParentTaskId());
        }
        
        // 更新里程碑进度
        milestoneService.updateMilestoneProgress(task.getMilestoneId());
        
        return true;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean updateTaskStatus(Long taskId, String status) {
        MilestoneTask task = getById(taskId);
        if (task == null) {
            return false;
        }
        
        task.setStatus(status);
        
        if (MilestoneTask.Status.COMPLETED.equals(status)) {
            task.setProgress(100);
            task.setCompletedAt(LocalDateTime.now());
        }
        
        updateById(task);
        
        // 更新父任务进度
        if (task.getParentTaskId() != null) {
            updateParentTaskProgress(task.getParentTaskId());
        }
        
        // 更新里程碑进度
        milestoneService.updateMilestoneProgress(task.getMilestoneId());
        
        return true;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean deleteTask(Long id) {
        MilestoneTask task = getById(id);
        if (task == null) {
            throw new BusinessException("任务不存在");
        }
        
        Long milestoneId = task.getMilestoneId();
        Long parentTaskId = task.getParentTaskId();
        
        // 删除子任务
        LambdaQueryWrapper<MilestoneTask> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MilestoneTask::getParentTaskId, id);
        remove(wrapper);
        
        // 删除任务
        removeById(id);
        
        // 更新父任务进度
        if (parentTaskId != null) {
            updateParentTaskProgress(parentTaskId);
        }
        
        // 更新里程碑进度
        milestoneService.updateMilestoneProgress(milestoneId);
        
        return true;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public MilestoneTask completeTask(Long id) {
        MilestoneTask task = getById(id);
        if (task == null) {
            throw new BusinessException("任务不存在");
        }
        
        task.setStatus(MilestoneTask.Status.COMPLETED);
        task.setProgress(100);
        task.setCompletedAt(LocalDateTime.now());
        
        updateById(task);
        
        // 更新父任务进度
        if (task.getParentTaskId() != null) {
            updateParentTaskProgress(task.getParentTaskId());
        }
        
        // 更新里程碑进度
        milestoneService.updateMilestoneProgress(task.getMilestoneId());
        
        return task;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean assignTask(Long taskId, Long userId) {
        MilestoneTask task = getById(taskId);
        if (task == null) {
            return false;
        }
        
        task.setAssigneeId(userId);
        return updateById(task);
    }

    @Override
    public List<MilestoneTask> getSubTasks(Long parentTaskId) {
        return baseMapper.selectByParentTaskId(parentTaskId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public MilestoneTaskAttachment addAttachment(Long taskId, MilestoneTaskAttachment attachment) {
        MilestoneTask task = getById(taskId);
        if (task == null) {
            throw new BusinessException("任务不存在");
        }
        
        attachment.setTaskId(taskId);
        if (!StringUtils.hasText(attachment.getAttachmentType())) {
            attachment.setAttachmentType(MilestoneTaskAttachment.AttachmentType.OTHER);
        }
        
        attachmentMapper.insert(attachment);
        return attachment;
    }

    @Override
    public List<MilestoneTaskAttachment> getAttachments(Long taskId) {
        return attachmentMapper.selectByTaskId(taskId);
    }

    @Override
    public List<MilestoneTaskAttachment> getExecutionPlans(Long taskId) {
        return attachmentMapper.selectExecutionPlansByTaskId(taskId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean deleteAttachment(Long attachmentId) {
        return attachmentMapper.deleteById(attachmentId) > 0;
    }

    /**
     * 更新父任务进度
     */
    private void updateParentTaskProgress(Long parentTaskId) {
        MilestoneTask parentTask = getById(parentTaskId);
        if (parentTask == null) {
            return;
        }
        
        // 获取所有子任务
        List<MilestoneTask> subTasks = baseMapper.selectByParentTaskId(parentTaskId);
        if (subTasks.isEmpty()) {
            return;
        }
        
        // 计算平均进度
        int totalProgress = subTasks.stream()
                .mapToInt(t -> t.getProgress() != null ? t.getProgress() : 0)
                .sum();
        int avgProgress = totalProgress / subTasks.size();
        
        parentTask.setProgress(avgProgress);
        
        // 检查是否所有子任务都完成
        boolean allCompleted = subTasks.stream()
                .allMatch(t -> MilestoneTask.Status.COMPLETED.equals(t.getStatus()));
        
        if (allCompleted) {
            parentTask.setStatus(MilestoneTask.Status.COMPLETED);
            parentTask.setCompletedAt(LocalDateTime.now());
        } else if (avgProgress > 0) {
            parentTask.setStatus(MilestoneTask.Status.IN_PROGRESS);
        }
        
        updateById(parentTask);
    }
}