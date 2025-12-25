package com.mota.project.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.mota.project.entity.Subtask;

import java.util.List;
import java.util.Map;

/**
 * 子任务 Service 接口
 * 支持多级子任务结构
 */
public interface SubtaskService extends IService<Subtask> {

    /**
     * 创建子任务
     */
    Subtask createSubtask(Subtask subtask);

    /**
     * 创建子子任务（在子任务下创建）
     */
    Subtask createChildSubtask(Long parentSubtaskId, Subtask subtask);

    /**
     * 更新子任务
     */
    Subtask updateSubtask(Subtask subtask);

    /**
     * 删除子任务（包含所有子子任务）
     */
    boolean deleteSubtask(Long id);

    /**
     * 根据父任务ID查询一级子任务列表
     */
    List<Subtask> listByParentTaskId(Long parentTaskId);

    /**
     * 根据父任务ID查询所有子任务（包含所有层级）
     */
    List<Subtask> listAllByParentTaskId(Long parentTaskId);

    /**
     * 根据父任务ID查询子任务树形结构
     */
    List<Subtask> listTreeByParentTaskId(Long parentTaskId);

    /**
     * 根据父子任务ID查询子任务列表
     */
    List<Subtask> listByParentSubtaskId(Long parentSubtaskId);

    /**
     * 根据项目ID查询所有子任务
     */
    List<Subtask> listByProjectId(Long projectId);

    /**
     * 根据执行人ID查询子任务列表
     */
    List<Subtask> listByAssigneeId(Long assigneeId);

    /**
     * 更新子任务状态
     */
    boolean updateStatus(Long id, String status);

    /**
     * 更新子任务进度
     */
    boolean updateProgress(Long id, Integer progress);

    /**
     * 完成子任务
     */
    boolean completeSubtask(Long id);

    /**
     * 分配子任务
     */
    boolean assignSubtask(Long id, Long assigneeId);

    /**
     * 统计父任务下各状态的子任务数量（包含所有层级）
     */
    Map<String, Long> countByParentTaskIdGroupByStatus(Long parentTaskId);

    /**
     * 计算父任务的进度（基于所有子任务）
     */
    Integer calculateParentTaskProgress(Long parentTaskId);

    /**
     * 计算子任务的进度（基于其子子任务）
     */
    Integer calculateSubtaskProgress(Long subtaskId);

    /**
     * 获取子任务的进度汇总信息
     */
    Map<String, Object> getSubtaskProgressSummary(Long parentTaskId);

    /**
     * 更新子任务排序
     */
    boolean updateSortOrder(List<Subtask> subtasks);

    /**
     * 批量创建子任务
     */
    boolean batchCreateSubtasks(List<Subtask> subtasks);

    /**
     * 移动子任务到另一个父任务或父子任务下
     */
    boolean moveSubtask(Long subtaskId, Long newParentTaskId, Long newParentSubtaskId);
}