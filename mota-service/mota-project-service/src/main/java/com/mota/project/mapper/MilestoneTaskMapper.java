package com.mota.project.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.project.entity.MilestoneTask;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Result;
import org.apache.ibatis.annotations.Results;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.List;

/**
 * 里程碑任务Mapper
 */
@Mapper
public interface MilestoneTaskMapper extends BaseMapper<MilestoneTask> {

    /**
     * 根据里程碑ID查询任务列表（包含负责人信息）
     */
    @Select("SELECT mt.*, " +
            "COALESCE(u.nickname, u.username) as assignee_name, " +
            "u.avatar as assignee_avatar " +
            "FROM milestone_task mt " +
            "LEFT JOIN sys_user u ON mt.assignee_id = u.id " +
            "WHERE mt.milestone_id = #{milestoneId} AND mt.deleted = 0 " +
            "ORDER BY mt.sort_order")
    @Results({
            @Result(property = "assigneeName", column = "assignee_name"),
            @Result(property = "assigneeAvatar", column = "assignee_avatar")
    })
    List<MilestoneTask> selectByMilestoneId(@Param("milestoneId") Long milestoneId);

    /**
     * 根据负责人ID查询任务列表（包含负责人信息）
     */
    @Select("SELECT mt.*, " +
            "COALESCE(u.nickname, u.username) as assignee_name, " +
            "u.avatar as assignee_avatar " +
            "FROM milestone_task mt " +
            "LEFT JOIN sys_user u ON mt.assignee_id = u.id " +
            "WHERE mt.assignee_id = #{assigneeId} AND mt.deleted = 0 " +
            "ORDER BY mt.due_date")
    @Results({
            @Result(property = "assigneeName", column = "assignee_name"),
            @Result(property = "assigneeAvatar", column = "assignee_avatar")
    })
    List<MilestoneTask> selectByAssigneeId(@Param("assigneeId") Long assigneeId);

    /**
     * 根据父任务ID查询子任务列表（包含负责人信息）
     */
    @Select("SELECT mt.*, " +
            "COALESCE(u.nickname, u.username) as assignee_name, " +
            "u.avatar as assignee_avatar " +
            "FROM milestone_task mt " +
            "LEFT JOIN sys_user u ON mt.assignee_id = u.id " +
            "WHERE mt.parent_task_id = #{parentTaskId} AND mt.deleted = 0 " +
            "ORDER BY mt.sort_order")
    @Results({
            @Result(property = "assigneeName", column = "assignee_name"),
            @Result(property = "assigneeAvatar", column = "assignee_avatar")
    })
    List<MilestoneTask> selectByParentTaskId(@Param("parentTaskId") Long parentTaskId);

    /**
     * 统计里程碑的任务数量
     */
    @Select("SELECT COUNT(*) FROM milestone_task WHERE milestone_id = #{milestoneId} AND deleted = 0")
    int countByMilestoneId(@Param("milestoneId") Long milestoneId);

    /**
     * 统计里程碑已完成的任务数量
     */
    @Select("SELECT COUNT(*) FROM milestone_task WHERE milestone_id = #{milestoneId} AND status = 'completed' AND deleted = 0")
    int countCompletedByMilestoneId(@Param("milestoneId") Long milestoneId);

    /**
     * 更新任务进度
     */
    @Update("UPDATE milestone_task SET progress = #{progress}, update_time = NOW() WHERE id = #{taskId}")
    void updateProgress(@Param("taskId") Long taskId, @Param("progress") Integer progress);
}