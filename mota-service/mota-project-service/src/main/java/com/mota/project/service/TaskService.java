package com.mota.project.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.mota.project.entity.Task;

import java.util.List;
import java.util.Map;

/**
 * 执行任务 Service 接口
 */
public interface TaskService extends IService<Task> {

    /**
     * 创建执行任务
     */
    Task createTask(Task task);

    /**
     * 更新执行任务
     */
    Task updateTask(Task task);

    /**
     * 根据部门任务ID查询执行任务列表
     */
    List<Task> listByDepartmentTaskId(Long departmentTaskId);

    /**
     * 根据项目ID查询执行任务列表
     */
    List<Task> listByProjectId(Long projectId);

    /**
     * 根据执行人ID查询任务列表
     */
    List<Task> listByAssigneeId(Long assigneeId);

    /**
     * 分页查询执行任务
     */
    IPage<Task> pageTasks(
            Page<Task> page,
            Long projectId,
            Long departmentTaskId,
            Long assigneeId,
            String status,
            String priority
    );

    /**
     * 更新任务状态
     */
    boolean updateStatus(Long id, String status);

    /**
     * 更新任务进度
     */
    boolean updateProgress(Long id, Integer progress, String progressNote);

    /**
     * 完成任务
     */
    boolean completeTask(Long id);

    /**
     * 分配任务给执行人
     */
    boolean assignTask(Long id, Long assigneeId);

    /**
     * 统计部门任务下各状态的执行任务数量
     */
    Map<String, Long> countByDepartmentTaskIdGroupByStatus(Long departmentTaskId);

    /**
     * 统计项目下各状态的执行任务数量
     */
    Map<String, Long> countByProjectIdGroupByStatus(Long projectId);

    /**
     * 获取用户待办任务列表
     */
    List<Task> getTodoListByUserId(Long userId);

    /**
     * 获取即将到期的任务
     */
    List<Task> getUpcomingTasks(Integer days);

    /**
     * 获取已逾期的任务
     */
    List<Task> getOverdueTasks();

    /**
     * 获取指定用户即将到期的任务
     */
    List<Task> getUpcomingTasksByUserId(Long userId, Integer days);

    /**
     * 获取指定用户已逾期的任务
     */
    List<Task> getOverdueTasksByUserId(Long userId);

    /**
     * 获取任务详情（包含关联信息）
     */
    Task getDetailById(Long id);
}