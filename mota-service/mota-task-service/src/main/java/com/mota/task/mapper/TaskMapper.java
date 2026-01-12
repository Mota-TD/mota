package com.mota.task.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.task.entity.Task;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * 任务Mapper接口
 */
@Mapper
public interface TaskMapper extends BaseMapper<Task> {

    /**
     * 获取项目任务列表
     */
    @Select("SELECT * FROM task WHERE project_id = #{projectId} AND deleted = 0 ORDER BY sort_order, create_time DESC")
    List<Task> selectByProjectId(@Param("projectId") Long projectId);

    /**
     * 获取里程碑任务列表
     */
    @Select("SELECT * FROM task WHERE milestone_id = #{milestoneId} AND deleted = 0 ORDER BY sort_order, create_time DESC")
    List<Task> selectByMilestoneId(@Param("milestoneId") Long milestoneId);

    /**
     * 获取子任务列表
     */
    @Select("SELECT * FROM task WHERE parent_id = #{parentId} AND deleted = 0 ORDER BY sort_order, create_time DESC")
    List<Task> selectByParentId(@Param("parentId") Long parentId);

    /**
     * 获取用户负责的任务列表
     */
    @Select("SELECT * FROM task WHERE assignee_id = #{assigneeId} AND deleted = 0 ORDER BY due_date, priority DESC")
    List<Task> selectByAssigneeId(@Param("assigneeId") Long assigneeId);

    /**
     * 获取用户创建的任务列表
     */
    @Select("SELECT * FROM task WHERE reporter_id = #{reporterId} AND deleted = 0 ORDER BY create_time DESC")
    List<Task> selectByReporterId(@Param("reporterId") Long reporterId);

    /**
     * 统计项目任务数量
     */
    @Select("SELECT COUNT(*) FROM task WHERE project_id = #{projectId} AND deleted = 0")
    Integer countByProjectId(@Param("projectId") Long projectId);

    /**
     * 统计项目已完成任务数量
     */
    @Select("SELECT COUNT(*) FROM task WHERE project_id = #{projectId} AND status = 'done' AND deleted = 0")
    Integer countCompletedByProjectId(@Param("projectId") Long projectId);

    /**
     * 统计子任务数量
     */
    @Select("SELECT COUNT(*) FROM task WHERE parent_id = #{parentId} AND deleted = 0")
    Integer countByParentId(@Param("parentId") Long parentId);

    /**
     * 统计已完成子任务数量
     */
    @Select("SELECT COUNT(*) FROM task WHERE parent_id = #{parentId} AND status = 'done' AND deleted = 0")
    Integer countCompletedByParentId(@Param("parentId") Long parentId);

    /**
     * 获取Sprint任务列表
     */
    @Select("SELECT * FROM task WHERE sprint_id = #{sprintId} AND deleted = 0 ORDER BY sort_order, create_time DESC")
    List<Task> selectBySprintId(@Param("sprintId") Long sprintId);

    /**
     * 获取逾期任务列表
     */
    @Select("SELECT * FROM task WHERE project_id = #{projectId} AND due_date < CURDATE() AND status != 'done' AND deleted = 0")
    List<Task> selectOverdueTasks(@Param("projectId") Long projectId);

    /**
     * 按状态统计任务数量
     */
    @Select("SELECT status, COUNT(*) as count FROM task WHERE project_id = #{projectId} AND deleted = 0 GROUP BY status")
    List<java.util.Map<String, Object>> countByStatus(@Param("projectId") Long projectId);

    /**
     * 按优先级统计任务数量
     */
    @Select("SELECT priority, COUNT(*) as count FROM task WHERE project_id = #{projectId} AND deleted = 0 GROUP BY priority")
    List<java.util.Map<String, Object>> countByPriority(@Param("projectId") Long projectId);

    /**
     * 按负责人统计任务数量
     */
    @Select("SELECT assignee_id, COUNT(*) as count FROM task WHERE project_id = #{projectId} AND deleted = 0 GROUP BY assignee_id")
    List<java.util.Map<String, Object>> countByAssignee(@Param("projectId") Long projectId);
}