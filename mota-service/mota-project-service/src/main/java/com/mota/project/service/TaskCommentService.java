package com.mota.project.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.mota.project.entity.TaskComment;

import java.util.List;

/**
 * 任务评论服务接口
 */
public interface TaskCommentService extends IService<TaskComment> {

    /**
     * 分页查询评论
     */
    IPage<TaskComment> pageComments(Page<TaskComment> page, Long taskId, Long userId);

    /**
     * 根据任务ID获取评论列表（包含嵌套回复）
     */
    List<TaskComment> getByTaskId(Long taskId);

    /**
     * 获取评论详情
     */
    TaskComment getDetailById(Long id);

    /**
     * 创建评论
     */
    TaskComment createComment(TaskComment comment);

    /**
     * 更新评论
     */
    TaskComment updateComment(TaskComment comment);

    /**
     * 删除评论（软删除）
     */
    boolean deleteComment(Long id);

    /**
     * 回复评论
     */
    TaskComment replyToComment(Long parentId, TaskComment reply);

    /**
     * 点赞评论
     */
    boolean likeComment(Long id);

    /**
     * 取消点赞评论
     */
    boolean unlikeComment(Long id);

    /**
     * 获取用户最近的评论
     */
    List<TaskComment> getRecentByUserId(Long userId, Integer limit);

    /**
     * 搜索评论
     */
    List<TaskComment> searchComments(Long taskId, String keyword);

    /**
     * 获取评论数量
     */
    int countByTaskId(Long taskId);
}