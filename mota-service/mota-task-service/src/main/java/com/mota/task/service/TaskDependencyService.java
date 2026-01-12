package com.mota.task.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.mota.task.entity.TaskDependency;

import java.util.List;

/**
 * 任务依赖服务接口
 */
public interface TaskDependencyService extends IService<TaskDependency> {

    /**
     * 添加任务依赖
     * @param taskId 任务ID
     * @param predecessorId 前置任务ID
     * @param dependencyType 依赖类型：FS/SS/FF/SF
     * @param lagDays 延迟天数
     */
    TaskDependency addDependency(Long taskId, Long predecessorId, String dependencyType, Integer lagDays);

    /**
     * 删除任务依赖
     */
    void removeDependency(Long dependencyId);

    /**
     * 删除任务的所有依赖
     */
    void removeAllDependencies(Long taskId);

    /**
     * 获取任务的前置依赖
     */
    List<TaskDependency> getPredecessors(Long taskId);

    /**
     * 获取任务的后置依赖（被哪些任务依赖）
     */
    List<TaskDependency> getSuccessors(Long taskId);

    /**
     * 检查是否存在循环依赖
     */
    boolean hasCircularDependency(Long taskId, Long predecessorId);

    /**
     * 获取项目的所有依赖关系
     */
    List<TaskDependency> getProjectDependencies(Long projectId);

    /**
     * 更新依赖类型
     */
    void updateDependencyType(Long dependencyId, String dependencyType);

    /**
     * 更新延迟天数
     */
    void updateLagDays(Long dependencyId, Integer lagDays);

    /**
     * 批量添加依赖
     */
    void batchAddDependencies(Long taskId, List<Long> predecessorIds, String dependencyType);

    /**
     * 获取关键路径
     */
    List<Long> getCriticalPath(Long projectId);
}