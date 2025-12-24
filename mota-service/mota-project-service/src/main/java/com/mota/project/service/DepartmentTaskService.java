package com.mota.project.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.mota.project.entity.DepartmentTask;

import java.util.List;
import java.util.Map;

/**
 * 部门任务 Service 接口
 */
public interface DepartmentTaskService extends IService<DepartmentTask> {

    /**
     * 创建部门任务
     */
    DepartmentTask createDepartmentTask(DepartmentTask departmentTask);

    /**
     * 更新部门任务
     */
    DepartmentTask updateDepartmentTask(DepartmentTask departmentTask);

    /**
     * 根据项目ID查询部门任务列表
     */
    List<DepartmentTask> listByProjectId(Long projectId);

    /**
     * 根据部门ID查询部门任务列表
     */
    List<DepartmentTask> listByDepartmentId(Long departmentId);

    /**
     * 根据负责人ID查询部门任务列表
     */
    List<DepartmentTask> listByManagerId(Long managerId);

    /**
     * 分页查询部门任务
     */
    IPage<DepartmentTask> pageDepartmentTasks(
            Page<DepartmentTask> page,
            Long projectId,
            Long departmentId,
            String status,
            String priority
    );

    /**
     * 更新部门任务状态
     */
    boolean updateStatus(Long id, String status);

    /**
     * 更新部门任务进度
     */
    boolean updateProgress(Long id, Integer progress);

    /**
     * 计算并更新部门任务进度（根据子任务进度自动计算）
     */
    boolean calculateAndUpdateProgress(Long id);

    /**
     * 统计项目下各状态的部门任务数量
     */
    Map<String, Long> countByProjectIdGroupByStatus(Long projectId);

    /**
     * 获取部门任务详情（包含关联信息）
     */
    DepartmentTask getDetailById(Long id);
}