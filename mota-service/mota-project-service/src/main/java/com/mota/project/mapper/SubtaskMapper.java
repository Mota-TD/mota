package com.mota.project.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.project.entity.Subtask;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

/**
 * 子任务 Mapper 接口
 * 支持多级子任务结构
 */
@Mapper
public interface SubtaskMapper extends BaseMapper<Subtask> {

    /**
     * 根据父任务ID查询一级子任务列表（不包含子子任务）
     */
    List<Subtask> selectByParentTaskId(@Param("parentTaskId") Long parentTaskId);

    /**
     * 根据父任务ID查询所有子任务（包含所有层级）
     */
    List<Subtask> selectAllByParentTaskId(@Param("parentTaskId") Long parentTaskId);

    /**
     * 根据父子任务ID查询子任务列表
     */
    List<Subtask> selectByParentSubtaskId(@Param("parentSubtaskId") Long parentSubtaskId);

    /**
     * 根据父任务ID查询子任务树形结构
     */
    List<Subtask> selectTreeByParentTaskId(@Param("parentTaskId") Long parentTaskId);

    /**
     * 根据项目ID查询所有子任务
     */
    List<Subtask> selectByProjectId(@Param("projectId") Long projectId);

    /**
     * 根据执行人ID查询子任务列表
     */
    List<Subtask> selectByAssigneeId(@Param("assigneeId") Long assigneeId);

    /**
     * 统计父任务下各状态的子任务数量（包含所有层级）
     */
    List<Map<String, Object>> countByParentTaskIdGroupByStatus(@Param("parentTaskId") Long parentTaskId);

    /**
     * 统计子任务的子任务数量
     */
    Integer countByParentSubtaskId(@Param("parentSubtaskId") Long parentSubtaskId);

    /**
     * 统计子任务的已完成子任务数量
     */
    Integer countCompletedByParentSubtaskId(@Param("parentSubtaskId") Long parentSubtaskId);

    /**
     * 更新子任务状态
     */
    int updateStatus(@Param("id") Long id, @Param("status") String status);

    /**
     * 更新子任务进度
     */
    int updateProgress(@Param("id") Long id, @Param("progress") Integer progress);

    /**
     * 批量更新排序顺序
     */
    int batchUpdateSortOrder(@Param("list") List<Subtask> subtasks);

    /**
     * 获取父任务下的最大排序顺序
     */
    Integer getMaxSortOrder(@Param("parentTaskId") Long parentTaskId);

    /**
     * 获取父子任务下的最大排序顺序
     */
    Integer getMaxSortOrderByParentSubtask(@Param("parentSubtaskId") Long parentSubtaskId);

    /**
     * 递归删除子任务及其所有子子任务
     */
    int deleteWithChildren(@Param("id") Long id);

    /**
     * 计算子任务的进度（基于其子子任务）
     */
    Integer calculateSubtaskProgress(@Param("subtaskId") Long subtaskId);
}