package com.mota.project.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.mota.project.entity.Milestone;

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
     * 获取里程碑详情
     */
    Milestone getDetailById(Long id);

    /**
     * 创建里程碑
     */
    Milestone createMilestone(Milestone milestone);

    /**
     * 更新里程碑
     */
    Milestone updateMilestone(Milestone milestone);

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
}