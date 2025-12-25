package com.mota.project.service;

import com.mota.project.dto.resource.*;

import java.time.LocalDate;
import java.util.List;

/**
 * 资源管理服务接口
 * 提供资源管理相关功能：工作量统计、团队分布、工作量预警、资源日历、资源利用率、跨项目冲突检测
 */
public interface ResourceManagementService {
    
    /**
     * 获取个人工作量统计
     * RM-001: 个人任务负载可视化
     *
     * @param userId 用户ID
     * @param startDate 开始日期
     * @param endDate 结束日期
     * @return 工作量统计数据
     */
    WorkloadStatsData getWorkloadStats(Long userId, LocalDate startDate, LocalDate endDate);
    
    /**
     * 获取团队工作量统计列表
     * RM-001: 团队成员任务负载可视化
     *
     * @param teamId 团队ID（可选，为空则获取所有）
     * @param startDate 开始日期
     * @param endDate 结束日期
     * @return 工作量统计数据列表
     */
    List<WorkloadStatsData> getTeamWorkloadStats(Long teamId, LocalDate startDate, LocalDate endDate);
    
    /**
     * 获取团队工作量分布
     * RM-002: 团队工作量分布图
     *
     * @param teamId 团队ID
     * @param startDate 开始日期
     * @param endDate 结束日期
     * @return 团队分布数据
     */
    TeamDistributionData getTeamDistribution(Long teamId, LocalDate startDate, LocalDate endDate);
    
    /**
     * 获取工作量预警
     * RM-003: 过载/空闲预警提示
     *
     * @param teamId 团队ID（可选）
     * @param alertTypes 预警类型列表（可选）
     * @return 工作量预警数据
     */
    WorkloadAlertData getWorkloadAlerts(Long teamId, List<String> alertTypes);
    
    /**
     * 获取资源日历
     * RM-004: 资源日历视图
     *
     * @param teamId 团队ID（可选）
     * @param userIds 用户ID列表（可选）
     * @param startDate 开始日期
     * @param endDate 结束日期
     * @return 资源日历数据
     */
    ResourceCalendarData getResourceCalendar(Long teamId, List<Long> userIds, LocalDate startDate, LocalDate endDate);
    
    /**
     * 获取资源利用率
     * RM-005: 资源利用率图表
     *
     * @param teamId 团队ID（可选）
     * @param period 统计周期：DAILY, WEEKLY, MONTHLY
     * @param startDate 开始日期
     * @param endDate 结束日期
     * @return 资源利用率数据
     */
    ResourceUtilizationData getResourceUtilization(Long teamId, String period, LocalDate startDate, LocalDate endDate);
    
    /**
     * 获取跨项目资源冲突
     * RM-006: 跨项目资源冲突检测
     *
     * @param teamId 团队ID（可选）
     * @param userId 用户ID（可选）
     * @param startDate 开始日期
     * @param endDate 结束日期
     * @return 跨项目冲突数据
     */
    ProjectConflictData getProjectConflicts(Long teamId, Long userId, LocalDate startDate, LocalDate endDate);
    
    /**
     * 解决资源冲突
     *
     * @param conflictId 冲突ID
     * @param resolution 解决方案
     * @return 是否成功
     */
    boolean resolveConflict(Long conflictId, String resolution);
    
    /**
     * 标记预警为已处理
     *
     * @param alertId 预警ID
     * @return 是否成功
     */
    boolean resolveAlert(Long alertId);
}