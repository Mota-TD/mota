package com.mota.issue.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.mota.common.core.exception.BusinessException;
import com.mota.issue.entity.Sprint;
import com.mota.issue.mapper.SprintMapper;
import com.mota.issue.service.SprintService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;

/**
 * 迭代服务实现
 */
@Service
@RequiredArgsConstructor
public class SprintServiceImpl extends ServiceImpl<SprintMapper, Sprint> implements SprintService {

    @Override
    public List<Sprint> getSprintList(Long projectId, String status) {
        LambdaQueryWrapper<Sprint> wrapper = new LambdaQueryWrapper<>();
        
        if (projectId != null) {
            wrapper.eq(Sprint::getProjectId, projectId);
        }
        
        if (StringUtils.hasText(status)) {
            wrapper.eq(Sprint::getStatus, status);
        }
        
        wrapper.orderByDesc(Sprint::getCreatedAt);
        
        return list(wrapper);
    }

    @Override
    public Sprint getSprintDetail(Long id) {
        Sprint sprint = getById(id);
        if (sprint == null) {
            throw new BusinessException("迭代不存在");
        }
        return sprint;
    }

    @Override
    public Sprint createSprint(Sprint sprint) {
        if (!StringUtils.hasText(sprint.getStatus())) {
            sprint.setStatus("planning");
        }
        
        if (sprint.getTotalPoints() == null) {
            sprint.setTotalPoints(0);
        }
        
        if (sprint.getCompletedPoints() == null) {
            sprint.setCompletedPoints(0);
        }
        
        save(sprint);
        return sprint;
    }

    @Override
    public Sprint updateSprint(Long id, Sprint sprint) {
        Sprint existing = getById(id);
        if (existing == null) {
            throw new BusinessException("迭代不存在");
        }
        
        sprint.setId(id);
        updateById(sprint);
        return getById(id);
    }

    @Override
    public void deleteSprint(Long id) {
        Sprint sprint = getById(id);
        if (sprint == null) {
            throw new BusinessException("迭代不存在");
        }
        removeById(id);
    }

    @Override
    public void startSprint(Long id) {
        Sprint sprint = getById(id);
        if (sprint == null) {
            throw new BusinessException("迭代不存在");
        }
        
        sprint.setStatus("active");
        updateById(sprint);
    }

    @Override
    public void completeSprint(Long id) {
        Sprint sprint = getById(id);
        if (sprint == null) {
            throw new BusinessException("迭代不存在");
        }
        
        sprint.setStatus("completed");
        updateById(sprint);
    }
}