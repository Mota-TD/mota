package com.mota.project.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.mota.common.core.exception.BusinessException;
import com.mota.project.entity.TaskComment;
import com.mota.project.mapper.TaskCommentMapper;
import com.mota.project.service.TaskCommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 任务评论服务实现
 */
@Service
@RequiredArgsConstructor
public class TaskCommentServiceImpl extends ServiceImpl<TaskCommentMapper, TaskComment> implements TaskCommentService {

    @Override
    public IPage<TaskComment> pageComments(Page<TaskComment> page, Long taskId, Long userId) {
        LambdaQueryWrapper<TaskComment> wrapper = new LambdaQueryWrapper<>();
        
        // 只查询顶级评论
        wrapper.isNull(TaskComment::getParentId);
        // @TableLogic 会自动过滤已删除记录
        
        if (taskId != null) {
            wrapper.eq(TaskComment::getTaskId, taskId);
        }
        if (userId != null) {
            wrapper.eq(TaskComment::getUserId, userId);
        }
        
        wrapper.orderByDesc(TaskComment::getCreatedAt);
        
        return page(page, wrapper);
    }

    @Override
    public List<TaskComment> getByTaskId(Long taskId) {
        // 获取所有评论
        LambdaQueryWrapper<TaskComment> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(TaskComment::getTaskId, taskId);
        // @TableLogic 会自动过滤已删除记录
        wrapper.orderByAsc(TaskComment::getCreatedAt);
        
        List<TaskComment> allComments = list(wrapper);
        
        // 构建嵌套结构
        return buildCommentTree(allComments);
    }

    @Override
    public TaskComment getDetailById(Long id) {
        TaskComment comment = getById(id);
        if (comment == null) {
            throw new BusinessException("评论不存在");
        }
        return comment;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public TaskComment createComment(TaskComment comment) {
        // 设置默认值
        if (comment.getLikeCount() == null) {
            comment.setLikeCount(0);
        }
        // TODO: 从当前登录用户获取
        if (comment.getUserId() == null) {
            comment.setUserId(1L);
        }
        
        save(comment);
        return comment;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public TaskComment updateComment(TaskComment comment) {
        TaskComment existing = getById(comment.getId());
        if (existing == null) {
            throw new BusinessException("评论不存在");
        }
        
        if (StringUtils.hasText(comment.getContent())) {
            existing.setContent(comment.getContent());
        }
        if (comment.getMentionedUsers() != null) {
            existing.setMentionedUsers(comment.getMentionedUsers());
        }
        
        updateById(existing);
        return existing;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean deleteComment(Long id) {
        TaskComment existing = getById(id);
        if (existing == null) {
            throw new BusinessException("评论不存在");
        }
        
        // 软删除 - 使用BaseEntityDO的deleted字段，@TableLogic会自动处理
        return removeById(id);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public TaskComment replyToComment(Long parentId, TaskComment reply) {
        TaskComment parent = getById(parentId);
        if (parent == null) {
            throw new BusinessException("父评论不存在");
        }
        
        reply.setParentId(parentId);
        reply.setTaskId(parent.getTaskId());
        if (reply.getLikeCount() == null) {
            reply.setLikeCount(0);
        }
        // TODO: 从当前登录用户获取
        if (reply.getUserId() == null) {
            reply.setUserId(1L);
        }
        
        save(reply);
        return reply;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean likeComment(Long id) {
        TaskComment comment = getById(id);
        if (comment == null) {
            throw new BusinessException("评论不存在");
        }
        
        comment.setLikeCount(comment.getLikeCount() + 1);
        return updateById(comment);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean unlikeComment(Long id) {
        TaskComment comment = getById(id);
        if (comment == null) {
            throw new BusinessException("评论不存在");
        }
        
        if (comment.getLikeCount() > 0) {
            comment.setLikeCount(comment.getLikeCount() - 1);
            return updateById(comment);
        }
        return true;
    }

    @Override
    public List<TaskComment> getRecentByUserId(Long userId, Integer limit) {
        LambdaQueryWrapper<TaskComment> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(TaskComment::getUserId, userId);
        // @TableLogic 会自动过滤已删除记录
        wrapper.orderByDesc(TaskComment::getCreatedAt);
        wrapper.last("LIMIT " + (limit != null ? limit : 10));
        return list(wrapper);
    }

    @Override
    public List<TaskComment> searchComments(Long taskId, String keyword) {
        LambdaQueryWrapper<TaskComment> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(TaskComment::getTaskId, taskId);
        // @TableLogic 会自动过滤已删除记录
        if (StringUtils.hasText(keyword)) {
            wrapper.like(TaskComment::getContent, keyword);
        }
        wrapper.orderByDesc(TaskComment::getCreatedAt);
        return list(wrapper);
    }

    @Override
    public int countByTaskId(Long taskId) {
        LambdaQueryWrapper<TaskComment> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(TaskComment::getTaskId, taskId);
        // @TableLogic 会自动过滤已删除记录
        return (int) count(wrapper);
    }

    /**
     * 构建评论树结构
     */
    private List<TaskComment> buildCommentTree(List<TaskComment> allComments) {
        // 按parentId分组
        Map<Long, List<TaskComment>> childrenMap = allComments.stream()
                .filter(c -> c.getParentId() != null)
                .collect(Collectors.groupingBy(TaskComment::getParentId));
        
        // 获取顶级评论并设置子评论
        List<TaskComment> rootComments = allComments.stream()
                .filter(c -> c.getParentId() == null)
                .collect(Collectors.toList());
        
        // 递归设置子评论（这里简化处理，只支持一级回复）
        // 如果需要多级嵌套，可以使用递归
        for (TaskComment root : rootComments) {
            List<TaskComment> children = childrenMap.get(root.getId());
            if (children != null) {
                // 使用transient字段存储回复（需要在Entity中添加）
                // 这里暂时不处理，前端可以通过parentId自行组织
            }
        }
        
        return rootComments;
    }
}