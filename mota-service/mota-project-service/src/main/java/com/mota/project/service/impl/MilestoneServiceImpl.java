package com.mota.project.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.mota.common.core.exception.BusinessException;
import com.mota.project.entity.Milestone;
import com.mota.project.mapper.MilestoneMapper;
import com.mota.project.service.MilestoneService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 里程碑服务实现
 */
@Service
@RequiredArgsConstructor
public class MilestoneServiceImpl extends ServiceImpl<MilestoneMapper, Milestone> implements MilestoneService {

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
        
        return page(page, wrapper);
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
    public Milestone getDetailById(Long id) {
        Milestone milestone = getById(id);
        if (milestone == null) {
            throw new BusinessException("里程碑不存在");
        }
        return milestone;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Milestone createMilestone(Milestone milestone) {
        // 设置默认值
        if (!StringUtils.hasText(milestone.getStatus())) {
            milestone.setStatus(Milestone.Status.PENDING);
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
        
        updateById(existing);
        return existing;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean deleteMilestone(Long id) {
        Milestone existing = getById(id);
        if (existing == null) {
            throw new BusinessException("里程碑不存在");
        }
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
        
        return list(wrapper);
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
        
        return list(wrapper);
    }
}