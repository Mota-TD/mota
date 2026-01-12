package com.mota.task.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.mota.task.dto.TaskCreateRequest;
import com.mota.task.dto.TaskQueryRequest;
import com.mota.task.dto.TaskUpdateRequest;
import com.mota.task.dto.TaskVO;
import com.mota.task.entity.Task;

import java.util.List;
import java.util.Map;

/**
 * 任务服务接口
 */
public interface TaskService extends IService<Task> {

    /**
     * 创建任务
     */
    TaskVO createTask(TaskCreateRequest request);

    /**
     * 更新任务
     */
    TaskVO updateTask(TaskUpdateRequest request);

    /**
     * 删除任务
     */
    void deleteTask(Long taskId);

    /**
     * 获取任务详情
     */
    TaskVO getTaskDetail(Long taskId);

    /**
     * 分页查询任务
     */
    Page<TaskVO> queryTasks(TaskQueryRequest request);

    /**
     * 获取项目的任务列表
     */
    List<TaskVO> getTasksByProject(Long projectId);

    /**
     * 获取里程碑的任务列表
     */
    List<TaskVO> getTasksByMilestone(Long milestoneId);

    /**
     * 获取用户负责的任务
     */
    List<TaskVO> getTasksByAssignee(Long assigneeId);

    /**
     * 获取Sprint的任务列表
     */
    List<TaskVO> getTasksBySprint(Long sprintId);

    /**
     * 获取子任务列表
     */
    List<TaskVO> getSubtasks(Long parentId);

    /**
     * 更新任务状态
     */
    void updateTaskStatus(Long taskId, String status);

    /**
     * 更新任务进度
     */
    void updateTaskProgress(Long taskId, Integer progress);

    /**
     * 分配任务
     */
    void assignTask(Long taskId, Long assigneeId);

    /**
     * 批量分配任务
     */
    void batchAssignTasks(List<Long> taskIds, Long assigneeId);

    /**
     * 批量更新状态
     */
    void batchUpdateStatus(List<Long> taskIds, String status);

    /**
     * 移动任务到Sprint
     */
    void moveToSprint(Long taskId, Long sprintId);

    /**
     * 批量移动任务到Sprint
     */
    void batchMoveToSprint(List<Long> taskIds, Long sprintId);

    /**
     * 获取任务统计
     */
    Map<String, Object> getTaskStatistics(Long projectId);

    /**
     * 获取逾期任务
     */
    List<TaskVO> getOverdueTasks(Long projectId);

    /**
     * 获取即将到期的任务
     */
    List<TaskVO> getUpcomingTasks(Long projectId, Integer days);

    /**
     * 复制任务
     */
    TaskVO copyTask(Long taskId, Long targetProjectId);

    /**
     * 转换任务类型
     */
    void convertTaskType(Long taskId, String newType);
}