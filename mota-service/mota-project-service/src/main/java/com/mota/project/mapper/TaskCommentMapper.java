package com.mota.project.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.project.entity.TaskComment;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 任务评论 Mapper 接口
 */
@Mapper
public interface TaskCommentMapper extends BaseMapper<TaskComment> {

    /**
     * 根据任务ID查询评论列表（包含嵌套回复）
     */
    List<TaskComment> selectByTaskId(@Param("taskId") Long taskId);

    /**
     * 根据用户ID查询最近评论
     */
    List<TaskComment> selectRecentByUserId(@Param("userId") Long userId, @Param("limit") Integer limit);

    /**
     * 搜索评论
     */
    List<TaskComment> searchByKeyword(@Param("taskId") Long taskId, @Param("keyword") String keyword);

    /**
     * 统计任务的评论数量
     */
    int countByTaskId(@Param("taskId") Long taskId);

    /**
     * 增加点赞数
     */
    int incrementLikeCount(@Param("id") Long id);

    /**
     * 减少点赞数
     */
    int decrementLikeCount(@Param("id") Long id);
}