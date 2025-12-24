package com.mota.project.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.mota.common.core.exception.BusinessException;
import com.mota.project.entity.WorkFeedback;
import com.mota.project.mapper.WorkFeedbackMapper;
import com.mota.project.service.WorkFeedbackService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 工作反馈服务实现
 */
@Service
@RequiredArgsConstructor
public class WorkFeedbackServiceImpl extends ServiceImpl<WorkFeedbackMapper, WorkFeedback> implements WorkFeedbackService {

    @Override
    public IPage<WorkFeedback> pageFeedbacks(Page<WorkFeedback> page, Long projectId, Long taskId,
                                              String feedbackType, Long fromUserId, Long toUserId, String status) {
        LambdaQueryWrapper<WorkFeedback> wrapper = new LambdaQueryWrapper<>();
        
        if (projectId != null) {
            wrapper.eq(WorkFeedback::getProjectId, projectId);
        }
        if (taskId != null) {
            wrapper.eq(WorkFeedback::getTaskId, taskId);
        }
        if (StringUtils.hasText(feedbackType)) {
            wrapper.eq(WorkFeedback::getFeedbackType, feedbackType);
        }
        if (fromUserId != null) {
            wrapper.eq(WorkFeedback::getFromUserId, fromUserId);
        }
        if (toUserId != null) {
            wrapper.eq(WorkFeedback::getToUserId, toUserId);
        }
        if (StringUtils.hasText(status)) {
            wrapper.eq(WorkFeedback::getStatus, status);
        }
        
        wrapper.orderByDesc(WorkFeedback::getCreatedAt);
        
        return page(page, wrapper);
    }

    @Override
    public List<WorkFeedback> getReceivedFeedbacks(Long userId) {
        LambdaQueryWrapper<WorkFeedback> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(WorkFeedback::getToUserId, userId);
        wrapper.orderByDesc(WorkFeedback::getCreatedAt);
        return list(wrapper);
    }

    @Override
    public List<WorkFeedback> getSentFeedbacks(Long userId) {
        LambdaQueryWrapper<WorkFeedback> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(WorkFeedback::getFromUserId, userId);
        wrapper.orderByDesc(WorkFeedback::getCreatedAt);
        return list(wrapper);
    }

    @Override
    public List<WorkFeedback> getByTaskId(Long taskId) {
        LambdaQueryWrapper<WorkFeedback> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(WorkFeedback::getTaskId, taskId);
        wrapper.orderByDesc(WorkFeedback::getCreatedAt);
        return list(wrapper);
    }

    @Override
    public WorkFeedback getDetailById(Long id) {
        WorkFeedback feedback = getById(id);
        if (feedback == null) {
            throw new BusinessException("工作反馈不存在");
        }
        return feedback;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public WorkFeedback createFeedback(WorkFeedback feedback) {
        // 设置默认值
        if (!StringUtils.hasText(feedback.getStatus())) {
            feedback.setStatus(WorkFeedback.Status.PENDING);
        }
        if (feedback.getRequireReply() == null) {
            feedback.setRequireReply(0);
        }
        // TODO: 从当前登录用户获取
        if (feedback.getFromUserId() == null) {
            feedback.setFromUserId(1L);
        }
        
        save(feedback);
        return feedback;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public WorkFeedback replyFeedback(Long id, String replyContent) {
        WorkFeedback existing = getById(id);
        if (existing == null) {
            throw new BusinessException("工作反馈不存在");
        }
        
        existing.setReplyContent(replyContent);
        existing.setRepliedAt(LocalDateTime.now());
        existing.setStatus(WorkFeedback.Status.REPLIED);
        
        updateById(existing);
        return existing;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean markAsRead(Long id) {
        WorkFeedback existing = getById(id);
        if (existing == null) {
            throw new BusinessException("工作反馈不存在");
        }
        
        if (WorkFeedback.Status.PENDING.equals(existing.getStatus())) {
            existing.setStatus(WorkFeedback.Status.READ);
            return updateById(existing);
        }
        return true;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean deleteFeedback(Long id) {
        WorkFeedback existing = getById(id);
        if (existing == null) {
            throw new BusinessException("工作反馈不存在");
        }
        return removeById(id);
    }

    @Override
    public int getUnreadCount(Long userId) {
        LambdaQueryWrapper<WorkFeedback> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(WorkFeedback::getToUserId, userId);
        wrapper.eq(WorkFeedback::getStatus, WorkFeedback.Status.PENDING);
        return (int) count(wrapper);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean markAllAsRead(Long userId) {
        LambdaUpdateWrapper<WorkFeedback> wrapper = new LambdaUpdateWrapper<>();
        wrapper.eq(WorkFeedback::getToUserId, userId);
        wrapper.eq(WorkFeedback::getStatus, WorkFeedback.Status.PENDING);
        wrapper.set(WorkFeedback::getStatus, WorkFeedback.Status.READ);
        return update(wrapper);
    }
}