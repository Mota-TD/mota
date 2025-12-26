package com.mota.project.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.mota.project.entity.Milestone;
import com.mota.project.entity.MilestoneAssignee;

import java.util.List;

/**
 * 里程碑服务接口
 */
public interface MilestoneService extends IService<Milestone> {

    /**
     * 分页查询里程碑
     */
    IPage<Milestone> pageMilestones(Page<Milestone> page, Long projectId, String status);

    /**
     * 根据项目ID获取里程碑列表
     */
    List<Milestone> getByProjectId(Long projectId);

    /**
     * 根据项目ID获取里程碑列表（包含负责人信息）
     */
    List<Milestone> getByProjectIdWithAssignees(Long projectId);

    /**
     * 获取里程碑详情
     */
    Milestone getDetailById(Long id);

    /**
     * 获取里程碑详情（包含负责人和任务信息）
     */
    Milestone getDetailByIdWithAssignees(Long id);

    /**
     * 创建里程碑
     */
    Milestone createMilestone(Milestone milestone);

    /**
     * 创建里程碑（包含负责人）
     */
    Milestone createMilestoneWithAssignees(Milestone milestone, List<Long> assigneeIds);

    /**
     * 更新里程碑
     */
    Milestone updateMilestone(Milestone milestone);

    /**
     * 更新里程碑负责人
     */
    boolean updateMilestoneAssignees(Long milestoneId, List<Long> assigneeIds);

    /**
     * 删除里程碑
     */
    boolean deleteMilestone(Long id);

    /**
     * 完成里程碑
     */
    Milestone completeMilestone(Long id);

    /**
     * 标记里程碑为延期
     */
    Milestone delayMilestone(Long id);

    /**
     * 重新排序里程碑
     */
    boolean reorderMilestones(Long projectId, List<Long> milestoneIds);

    /**
     * 获取即将到期的里程碑
     */
    List<Milestone> getUpcomingMilestones(Long projectId, Integer days);

    /**
     * 获取已延期的里程碑
     */
    List<Milestone> getDelayedMilestones(Long projectId);

    /**
     * 获取里程碑的负责人列表
     */
    List<MilestoneAssignee> getMilestoneAssignees(Long milestoneId);

    /**
     * 添加里程碑负责人
     */
    boolean addMilestoneAssignee(Long milestoneId, Long userId, boolean isPrimary);

    /**
     * 移除里程碑负责人
     */
    boolean removeMilestoneAssignee(Long milestoneId, Long userId);

    /**
     * 更新里程碑进度
     */
    boolean updateMilestoneProgress(Long milestoneId);

    /**
     * 根据用户ID获取负责的里程碑列表
     */
    List<Milestone> getMilestonesByAssignee(Long userId);
}