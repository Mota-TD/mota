package com.mota.project.service;

import com.mota.project.entity.DepartmentTask;
import com.mota.project.entity.Milestone;
import com.mota.project.entity.Task;
import com.mota.project.mapper.DepartmentTaskMapper;
import com.mota.project.mapper.MilestoneMapper;
import com.mota.project.mapper.ProjectMapper;
import com.mota.project.mapper.TaskMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 进度同步服务
 * 实现任务进度自动向上汇总：执行任务 → 部门任务 → 里程碑 → 项目
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ProgressSyncService {

    private final TaskMapper taskMapper;
    private final DepartmentTaskMapper departmentTaskMapper;
    private final MilestoneMapper milestoneMapper;
    private final ProjectMapper projectMapper;

    /**
     * 同步任务进度到上层
     * 当执行任务进度更新时调用此方法
     *
     * @param taskId 任务ID
     */
    @Transactional
    public void syncTaskProgress(Long taskId) {
        Task task = taskMapper.selectById(taskId);
        if (task == null) {
            log.warn("Task not found: {}", taskId);
            return;
        }

        log.info("Syncing progress for task: {} (progress: {})", taskId, task.getProgress());

        // 1. 更新部门任务进度
        if (task.getDepartmentTaskId() != null) {
            syncDepartmentTaskProgress(task.getDepartmentTaskId());
        }

        // 2. 更新里程碑进度（如果任务直接关联里程碑）
        if (task.getMilestoneId() != null) {
            syncMilestoneProgress(task.getMilestoneId());
        }
    }

    /**
     * 同步部门任务进度
     * 计算所有子任务的平均进度
     *
     * @param departmentTaskId 部门任务ID
     */
    @Transactional
    public void syncDepartmentTaskProgress(Long departmentTaskId) {
        // 计算所有子任务的平均进度
        Integer avgProgress = taskMapper.calculateAverageProgress(departmentTaskId);
        int progress = avgProgress != null ? avgProgress : 0;
        
        departmentTaskMapper.updateProgress(departmentTaskId, progress);
        log.info("Updated department task {} progress to {}", departmentTaskId, progress);

        // 获取部门任务信息，继续向上同步
        DepartmentTask deptTask = departmentTaskMapper.selectById(departmentTaskId);
        if (deptTask != null && deptTask.getMilestoneId() != null) {
            syncMilestoneProgress(deptTask.getMilestoneId());
        }
    }

    /**
     * 同步里程碑进度
     * 计算所有关联部门任务的平均进度
     *
     * @param milestoneId 里程碑ID
     */
    @Transactional
    public void syncMilestoneProgress(Long milestoneId) {
        // 计算所有关联部门任务的平均进度
        Integer avgProgress = departmentTaskMapper.calculateAverageProgressByMilestone(milestoneId);
        int progress = avgProgress != null ? avgProgress : 0;
        
        // 统计已完成的部门任务数
        Integer completedCount = departmentTaskMapper.countCompletedByMilestone(milestoneId);
        Integer totalCount = departmentTaskMapper.countByMilestone(milestoneId);

        // 更新里程碑进度和统计
        milestoneMapper.updateProgress(milestoneId, progress);
        milestoneMapper.updateDepartmentTaskStats(milestoneId, 
                totalCount != null ? totalCount : 0, 
                completedCount != null ? completedCount : 0);
        
        log.info("Updated milestone {} progress to {}, tasks: {}/{}", 
                milestoneId, progress, completedCount, totalCount);

        // 获取里程碑信息，继续向上同步项目进度
        Milestone milestone = milestoneMapper.selectById(milestoneId);
        if (milestone != null) {
            syncProjectProgress(milestone.getProjectId());
        }
    }

    /**
     * 同步项目进度
     * 计算所有里程碑的加权平均进度
     *
     * @param projectId 项目ID
     */
    @Transactional
    public void syncProjectProgress(Long projectId) {
        // 计算所有里程碑的平均进度
        Integer avgProgress = milestoneMapper.calculateAverageProgressByProject(projectId);
        int progress = avgProgress != null ? avgProgress : 0;
        
        projectMapper.updateProgress(projectId, progress);
        log.info("Updated project {} progress to {}", projectId, progress);
    }

    /**
     * 手动触发全量进度同步
     * 用于数据修复或初始化场景
     *
     * @param projectId 项目ID
     */
    @Transactional
    public void syncAllProgress(Long projectId) {
        log.info("Starting full progress sync for project: {}", projectId);

        // 1. 同步所有部门任务进度
        var departmentTasks = departmentTaskMapper.selectByProjectId(projectId);
        for (DepartmentTask dt : departmentTasks) {
            Integer avgProgress = taskMapper.calculateAverageProgress(dt.getId());
            departmentTaskMapper.updateProgress(dt.getId(), avgProgress != null ? avgProgress : 0);
        }

        // 2. 同步所有里程碑进度
        var milestones = milestoneMapper.selectByProjectId(projectId);
        for (Milestone m : milestones) {
            Integer avgProgress = departmentTaskMapper.calculateAverageProgressByMilestone(m.getId());
            Integer completedCount = departmentTaskMapper.countCompletedByMilestone(m.getId());
            Integer totalCount = departmentTaskMapper.countByMilestone(m.getId());
            
            milestoneMapper.updateProgress(m.getId(), avgProgress != null ? avgProgress : 0);
            milestoneMapper.updateDepartmentTaskStats(m.getId(), 
                    totalCount != null ? totalCount : 0, 
                    completedCount != null ? completedCount : 0);
        }

        // 3. 同步项目进度
        syncProjectProgress(projectId);

        log.info("Completed full progress sync for project: {}", projectId);
    }
}