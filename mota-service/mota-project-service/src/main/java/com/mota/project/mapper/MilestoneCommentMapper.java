package com.mota.project.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.project.entity.MilestoneComment;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * 里程碑评论Mapper
 */
@Mapper
public interface MilestoneCommentMapper extends BaseMapper<MilestoneComment> {

    /**
     * 根据里程碑ID查询评论列表
     */
    @Select("SELECT * FROM milestone_comment WHERE milestone_id = #{milestoneId} AND deleted = 0 ORDER BY create_time DESC")
    List<MilestoneComment> selectByMilestoneId(@Param("milestoneId") Long milestoneId);

    /**
     * 根据任务ID查询评论列表
     */
    @Select("SELECT * FROM milestone_comment WHERE task_id = #{taskId} AND deleted = 0 ORDER BY create_time DESC")
    List<MilestoneComment> selectByTaskId(@Param("taskId") Long taskId);

    /**
     * 根据类型查询评论（评论或催办）
     */
    @Select("SELECT * FROM milestone_comment WHERE milestone_id = #{milestoneId} AND type = #{type} AND deleted = 0 ORDER BY create_time DESC")
    List<MilestoneComment> selectByMilestoneIdAndType(@Param("milestoneId") Long milestoneId, @Param("type") String type);

    /**
     * 统计里程碑的催办次数
     */
    @Select("SELECT COUNT(*) FROM milestone_comment WHERE milestone_id = #{milestoneId} AND type = 'urge' AND deleted = 0")
    int countUrgeByMilestoneId(@Param("milestoneId") Long milestoneId);

    /**
     * 统计任务的催办次数
     */
    @Select("SELECT COUNT(*) FROM milestone_comment WHERE task_id = #{taskId} AND type = 'urge' AND deleted = 0")
    int countUrgeByTaskId(@Param("taskId") Long taskId);
}