package com.mota.project.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.mota.common.core.exception.BusinessException;
import com.mota.project.entity.Milestone;
import com.mota.project.entity.MilestoneAssignee;
import com.mota.project.entity.MilestoneTask;
import com.mota.project.mapper.MilestoneAssigneeMapper;
import com.mota.project.mapper.MilestoneMapper;
import com.mota.project.mapper.MilestoneTaskMapper;
import com.mota.project.service.MilestoneService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 里程碑服务实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class MilestoneServiceImpl extends ServiceImpl<MilestoneMapper, Milestone> implements MilestoneService {

    private final MilestoneAssigneeMapper milestoneAssigneeMapper;
    private final MilestoneTaskMapper milestoneTaskMapper;

    @Override
    public IPage<Milestone> pageMilestones(Page<Milestone> page, Long projectId, String status) {
        LambdaQueryWrapper<Milestone> wrapper = new LambdaQueryWrapper<>();
        
        if (projectId != null) {
            wrapper.eq(Milestone::getProjectId, projectId);
        }
        if (StringUtils.hasText(status)) {
            wrapper.eq(Milestone::getStatus, status);
        }
        
        wrapper.orderByAsc(Milestone::getSortOrder);
        wrapper.orderByAsc(Milestone::getTargetDate);
        
        IPage<Milestone> result = page(page, wrapper);
        
        // 加载负责人信息
        result.getRecords().forEach(this::loadAssignees);
        
        return result;
    }

    @Override
    public List<Milestone> getByProjectId(Long projectId) {
        LambdaQueryWrapper<Milestone> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Milestone::getProjectId, projectId);
        wrapper.orderByAsc(Milestone::getSortOrder);
        wrapper.orderByAsc(Milestone::getTargetDate);
        return list(wrapper);
    }

    @Override
    public List<Milestone> getByProjectIdWithAssignees(Long projectId) {
        List<Milestone> milestones = getByProjectId(projectId);
        milestones.forEach(this::loadAssignees);
        return milestones;
    }

    @Override
    public Milestone getDetailById(Long id) {
        Milestone milestone = getById(id);
        if (milestone == null) {
            throw new BusinessException("里程碑不存在");
        }
        return milestone;
    }

    @Override
    public Milestone getDetailByIdWithAssignees(Long id) {
        Milestone milestone = getDetailById(id);
        loadAssignees(milestone);
        loadTasks(milestone);
        return milestone;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Milestone createMilestone(Milestone milestone) {
        // 设置默认值
        if (!StringUtils.hasText(milestone.getStatus())) {
            milestone.setStatus(Milestone.Status.PENDING);
        }
        if (milestone.getProgress() == null) {
            milestone.setProgress(0);
        }
        if (milestone.getTaskCount() == null) {
            milestone.setTaskCount(0);
        }
        if (milestone.getCompletedTaskCount() == null) {
            milestone.setCompletedTaskCount(0);
        }
        if (milestone.getSortOrder() == null) {
            // 获取当前项目最大排序号
            LambdaQueryWrapper<Milestone> wrapper = new LambdaQueryWrapper<>();
            wrapper.eq(Milestone::getProjectId, milestone.getProjectId());
            wrapper.orderByDesc(Milestone::getSortOrder);
            wrapper.last("LIMIT 1");
            Milestone last = getOne(wrapper);
            milestone.setSortOrder(last != null ? last.getSortOrder() + 1 : 0);
        }
        
        save(milestone);
        
        return milestone;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Milestone createMilestoneWithAssignees(Milestone milestone, List<Long> assigneeIds) {
        // 创建里程碑
        createMilestone(milestone);
        
        // 添加负责人
        if (assigneeIds != null && !assigneeIds.isEmpty()) {
            boolean isFirst = true;
            for (Long userId : assigneeIds) {
                addMilestoneAssignee(milestone.getId(), userId, isFirst);
                isFirst = false;
            }
        }
        
        // 加载负责人信息
        loadAssignees(milestone);
        
        return milestone;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Milestone updateMilestone(Milestone milestone) {
        Milestone existing = getById(milestone.getId());
        if (existing == null) {
            throw new BusinessException("里程碑不存在");
        }
        
        if (StringUtils.hasText(milestone.getName())) {
            existing.setName(milestone.getName());
        }
        if (milestone.getDescription() != null) {
            existing.setDescription(milestone.getDescription());
        }
        if (milestone.getTargetDate() != null) {
            existing.setTargetDate(milestone.getTargetDate());
        }
        if (milestone.getSortOrder() != null) {
            existing.setSortOrder(milestone.getSortOrder());
        }
        if (milestone.getProgress() != null) {
            existing.setProgress(milestone.getProgress());
        }
        
        updateById(existing);
        
        return existing;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean updateMilestoneAssignees(Long milestoneId, List<Long> assigneeIds) {
        // 删除现有负责人
        milestoneAssigneeMapper.deleteByMilestoneId(milestoneId);
        
        // 添加新负责人
        if (assigneeIds != null && !assigneeIds.isEmpty()) {
            boolean isFirst = true;
            for (Long userId : assigneeIds) {
                addMilestoneAssignee(milestoneId, userId, isFirst);
                isFirst = false;
            }
        }
        
        return true;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean deleteMilestone(Long id) {
        Milestone existing = getById(id);
        if (existing == null) {
            throw new BusinessException("里程碑不存在");
        }
        
        // 删除负责人关联
        milestoneAssigneeMapper.deleteByMilestoneId(id);
        
        return removeById(id);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Milestone completeMilestone(Long id) {
        Milestone existing = getById(id);
        if (existing == null) {
            throw new BusinessException("里程碑不存在");
        }
        
        existing.setStatus(Milestone.Status.COMPLETED);
        existing.setCompletedAt(LocalDateTime.now());
        existing.setProgress(100);
        
        updateById(existing);
        
        return existing;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Milestone delayMilestone(Long id) {
        Milestone existing = getById(id);
        if (existing == null) {
            throw new BusinessException("里程碑不存在");
        }
        
        existing.setStatus(Milestone.Status.DELAYED);
        
        updateById(existing);
        return existing;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean reorderMilestones(Long projectId, List<Long> milestoneIds) {
        for (int i = 0; i < milestoneIds.size(); i++) {
            Milestone milestone = getById(milestoneIds.get(i));
            if (milestone != null && milestone.getProjectId().equals(projectId)) {
                milestone.setSortOrder(i);
                updateById(milestone);
            }
        }
        return true;
    }

    @Override
    public List<Milestone> getUpcomingMilestones(Long projectId, Integer days) {
        LocalDate today = LocalDate.now();
        LocalDate endDate = today.plusDays(days != null ? days : 7);
        
        LambdaQueryWrapper<Milestone> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Milestone::getProjectId, projectId);
        wrapper.eq(Milestone::getStatus, Milestone.Status.PENDING);
        wrapper.ge(Milestone::getTargetDate, today);
        wrapper.le(Milestone::getTargetDate, endDate);
        wrapper.orderByAsc(Milestone::getTargetDate);
        
        List<Milestone> milestones = list(wrapper);
        milestones.forEach(this::loadAssignees);
        return milestones;
    }

    @Override
    public List<Milestone> getDelayedMilestones(Long projectId) {
        LocalDate today = LocalDate.now();
        
        LambdaQueryWrapper<Milestone> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Milestone::getProjectId, projectId);
        wrapper.and(w -> w.eq(Milestone::getStatus, Milestone.Status.DELAYED)
                         .or()
                         .and(inner -> inner.eq(Milestone::getStatus, Milestone.Status.PENDING)
                                           .lt(Milestone::getTargetDate, today)));
        wrapper.orderByAsc(Milestone::getTargetDate);
        
        List<Milestone> milestones = list(wrapper);
        milestones.forEach(this::loadAssignees);
        return milestones;
    }

    @Override
    public List<MilestoneAssignee> getMilestoneAssignees(Long milestoneId) {
        return milestoneAssigneeMapper.selectByMilestoneId(milestoneId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean addMilestoneAssignee(Long milestoneId, Long userId, boolean isPrimary) {
        MilestoneAssignee assignee = new MilestoneAssignee();
        assignee.setMilestoneId(milestoneId);
        assignee.setUserId(userId);
        assignee.setIsPrimary(isPrimary);
        assignee.setAssignedAt(LocalDateTime.now());
        // TODO: 从当前登录用户获取
        assignee.setAssignedBy(1L);
        
        return milestoneAssigneeMapper.insert(assignee) > 0;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean removeMilestoneAssignee(Long milestoneId, Long userId) {
        LambdaQueryWrapper<MilestoneAssignee> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MilestoneAssignee::getMilestoneId, milestoneId);
        wrapper.eq(MilestoneAssignee::getUserId, userId);
        return milestoneAssigneeMapper.delete(wrapper) > 0;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean updateMilestoneProgress(Long milestoneId) {
        Milestone milestone = getById(milestoneId);
        if (milestone == null) {
            return false;
        }
        
        // 统计任务数量
        int taskCount = milestoneTaskMapper.countByMilestoneId(milestoneId);
        int completedCount = milestoneTaskMapper.countCompletedByMilestoneId(milestoneId);
        
        milestone.setTaskCount(taskCount);
        milestone.setCompletedTaskCount(completedCount);
        
        // 计算进度
        if (taskCount > 0) {
            milestone.setProgress((completedCount * 100) / taskCount);
        } else {
            milestone.setProgress(0);
        }
        
        // 更新状态
        if (completedCount == taskCount && taskCount > 0) {
            milestone.setStatus(Milestone.Status.COMPLETED);
            milestone.setCompletedAt(LocalDateTime.now());
        } else if (completedCount > 0) {
            milestone.setStatus(Milestone.Status.IN_PROGRESS);
        }
        
        return updateById(milestone);
    }

    @Override
    public List<Milestone> getMilestonesByAssignee(Long userId) {
        List<MilestoneAssignee> assignees = milestoneAssigneeMapper.selectByUserId(userId);
        if (assignees.isEmpty()) {
            return new ArrayList<>();
        }
        
        List<Long> milestoneIds = assignees.stream()
                .map(MilestoneAssignee::getMilestoneId)
                .collect(Collectors.toList());
        
        LambdaQueryWrapper<Milestone> wrapper = new LambdaQueryWrapper<>();
        wrapper.in(Milestone::getId, milestoneIds);
        wrapper.orderByAsc(Milestone::getTargetDate);
        
        List<Milestone> milestones = list(wrapper);
        milestones.forEach(this::loadAssignees);
        return milestones;
    }

    /**
     * 加载里程碑的负责人信息
     */
    private void loadAssignees(Milestone milestone) {
        List<MilestoneAssignee> assignees = milestoneAssigneeMapper.selectByMilestoneId(milestone.getId());
        milestone.setAssignees(assignees);
    }

    /**
     * 加载里程碑的任务信息
     */
    private void loadTasks(Milestone milestone) {
        List<MilestoneTask> tasks = milestoneTaskMapper.selectByMilestoneId(milestone.getId());
        milestone.setTasks(tasks);
    }
}