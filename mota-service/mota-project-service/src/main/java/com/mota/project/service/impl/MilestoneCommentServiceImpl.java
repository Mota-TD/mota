package com.mota.project.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.mota.project.entity.MilestoneComment;
import com.mota.project.mapper.MilestoneCommentMapper;
import com.mota.project.service.MilestoneCommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 里程碑评论服务实现
 */
@Service
@RequiredArgsConstructor
public class MilestoneCommentServiceImpl extends ServiceImpl<MilestoneCommentMapper, MilestoneComment> implements MilestoneCommentService {

    @Override
    public List<MilestoneComment> getByMilestoneId(Long milestoneId) {
        return baseMapper.selectByMilestoneId(milestoneId);
    }

    @Override
    public List<MilestoneComment> getByTaskId(Long taskId) {
        return baseMapper.selectByTaskId(taskId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public MilestoneComment addComment(MilestoneComment comment) {
        save(comment);
        return comment;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public MilestoneComment addMilestoneComment(Long milestoneId, Long userId, String content) {
        MilestoneComment comment = new MilestoneComment();
        comment.setMilestoneId(milestoneId);
        comment.setUserId(userId);
        comment.setContent(content);
        comment.setType(MilestoneComment.Type.COMMENT);
        
        save(comment);
        return comment;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public MilestoneComment addTaskComment(Long taskId, Long userId, String content) {
        MilestoneComment comment = new MilestoneComment();
        comment.setTaskId(taskId);
        comment.setUserId(userId);
        comment.setContent(content);
        comment.setType(MilestoneComment.Type.COMMENT);
        
        save(comment);
        return comment;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public MilestoneComment urgeMilestone(Long milestoneId, Long userId, String content) {
        MilestoneComment comment = new MilestoneComment();
        comment.setMilestoneId(milestoneId);
        comment.setUserId(userId);
        comment.setContent(content != null ? content : "请尽快完成里程碑任务");
        comment.setType(MilestoneComment.Type.URGE);
        
        save(comment);
        return comment;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public MilestoneComment urgeTask(Long taskId, Long userId, String content) {
        MilestoneComment comment = new MilestoneComment();
        comment.setTaskId(taskId);
        comment.setUserId(userId);
        comment.setContent(content != null ? content : "请尽快完成任务");
        comment.setType(MilestoneComment.Type.URGE);
        
        save(comment);
        return comment;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean deleteComment(Long id) {
        return removeById(id);
    }

    @Override
    public int countMilestoneUrges(Long milestoneId) {
        return baseMapper.countUrgeByMilestoneId(milestoneId);
    }

    @Override
    public int countTaskUrges(Long taskId) {
        return baseMapper.countUrgeByTaskId(taskId);
    }
}