package com.mota.project.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.mota.project.entity.MilestoneComment;

import java.util.List;

/**
 * 里程碑评论服务接口
 */
public interface MilestoneCommentService extends IService<MilestoneComment> {

    /**
     * 根据里程碑ID获取评论列表
     */
    List<MilestoneComment> getByMilestoneId(Long milestoneId);

    /**
     * 根据任务ID获取评论列表
     */
    List<MilestoneComment> getByTaskId(Long taskId);

    /**
     * 添加评论
     */
    MilestoneComment addComment(MilestoneComment comment);

    /**
     * 添加里程碑评论
     */
    MilestoneComment addMilestoneComment(Long milestoneId, Long userId, String content);

    /**
     * 添加任务评论
     */
    MilestoneComment addTaskComment(Long taskId, Long userId, String content);

    /**
     * 催办里程碑
     */
    MilestoneComment urgeMilestone(Long milestoneId, Long userId, String content);

    /**
     * 催办任务
     */
    MilestoneComment urgeTask(Long taskId, Long userId, String content);

    /**
     * 删除评论
     */
    boolean deleteComment(Long id);

    /**
     * 获取里程碑的催办次数
     */
    int countMilestoneUrges(Long milestoneId);

    /**
     * 获取任务的催办次数
     */
    int countTaskUrges(Long taskId);
}