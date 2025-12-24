package com.mota.project.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.mota.project.entity.Task;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

/**
 * 执行任务 Mapper 接口
 */
@Mapper
public interface TaskMapper extends BaseMapper<Task> {

    /**
     * 根据部门任务ID查询执行任务列表
     */
    List<Task> selectByDepartmentTaskId(@Param("departmentTaskId") Long departmentTaskId);

    /**
     * 根据项目ID查询执行任务列表
     */
    List<Task> selectByProjectId(@Param("projectId") Long projectId);

    /**
     * 根据执行人ID查询任务列表
     */
    List<Task> selectByAssigneeId(@Param("assigneeId") Long assigneeId);

    /**
     * 分页查询执行任务
     */
    IPage<Task> selectPageByCondition(
            Page<Task> page,
            @Param("projectId") Long projectId,
            @Param("departmentTaskId") Long departmentTaskId,
            @Param("assigneeId") Long assigneeId,
            @Param("status") String status,
            @Param("priority") String priority
    );

    /**
     * 统计部门任务下各状态的执行任务数量
     */
    List<Map<String, Object>> countByDepartmentTaskIdGroupByStatus(@Param("departmentTaskId") Long departmentTaskId);

    /**
     * 统计项目下各状态的执行任务数量
     */
    List<Map<String, Object>> countByProjectIdGroupByStatus(@Param("projectId") Long projectId);

    /**
     * 更新任务进度
     */
    int updateProgress(@Param("id") Long id, @Param("progress") Integer progress, @Param("progressNote") String progressNote);

    /**
     * 更新任务状态
     */
    int updateStatus(@Param("id") Long id, @Param("status") String status);

    /**
     * 查询用户待办任务列表
     */
    List<Task> selectTodoListByUserId(@Param("userId") Long userId);

    /**
     * 查询即将到期的任务
     */
    List<Task> selectUpcomingTasks(@Param("days") Integer days);

    /**
     * 查询已逾期的任务
     */
    List<Task> selectOverdueTasks();
}