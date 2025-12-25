package com.mota.project.controller;

import com.mota.project.dto.resource.*;
import com.mota.project.service.ResourceManagementService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * 资源管理控制器
 * 提供资源管理相关API：工作量统计、团队分布、工作量预警、资源日历、资源利用率、跨项目冲突检测
 */
@Tag(name = "资源管理", description = "资源管理相关接口")
@RestController
@RequestMapping("/api/resource-management")
@RequiredArgsConstructor
public class ResourceManagementController {
    
    private final ResourceManagementService resourceManagementService;
    
    /**
     * 获取个人工作量统计
     * RM-001: 个人任务负载可视化
     */
    @Operation(summary = "获取个人工作量统计", description = "获取指定用户的工作量统计数据")
    @GetMapping("/workload-stats/{userId}")
    public ResponseEntity<WorkloadStatsData> getWorkloadStats(
            @Parameter(description = "用户ID") @PathVariable Long userId,
            @Parameter(description = "开始日期") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "结束日期") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(resourceManagementService.getWorkloadStats(userId, startDate, endDate));
    }
    
    /**
     * 获取团队工作量统计列表
     * RM-001: 团队成员任务负载可视化
     */
    @Operation(summary = "获取团队工作量统计", description = "获取团队所有成员的工作量统计数据")
    @GetMapping("/workload-stats/team")
    public ResponseEntity<List<WorkloadStatsData>> getTeamWorkloadStats(
            @Parameter(description = "团队ID") @RequestParam(required = false) Long teamId,
            @Parameter(description = "开始日期") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "结束日期") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(resourceManagementService.getTeamWorkloadStats(teamId, startDate, endDate));
    }
    
    /**
     * 获取团队工作量分布
     * RM-002: 团队工作量分布图
     */
    @Operation(summary = "获取团队工作量分布", description = "获取团队工作量分布数据，包括成员分布、状态分布、优先级分布")
    @GetMapping("/team-distribution/{teamId}")
    public ResponseEntity<TeamDistributionData> getTeamDistribution(
            @Parameter(description = "团队ID") @PathVariable Long teamId,
            @Parameter(description = "开始日期") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "结束日期") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(resourceManagementService.getTeamDistribution(teamId, startDate, endDate));
    }
    
    /**
     * 获取工作量预警
     * RM-003: 过载/空闲预警提示
     */
    @Operation(summary = "获取工作量预警", description = "获取工作量预警数据，包括过载、空闲、即将过载等预警")
    @GetMapping("/workload-alerts")
    public ResponseEntity<WorkloadAlertData> getWorkloadAlerts(
            @Parameter(description = "团队ID") @RequestParam(required = false) Long teamId,
            @Parameter(description = "预警类型列表") @RequestParam(required = false) List<String> alertTypes) {
        return ResponseEntity.ok(resourceManagementService.getWorkloadAlerts(teamId, alertTypes));
    }
    
    /**
     * 标记预警为已处理
     */
    @Operation(summary = "标记预警为已处理", description = "将指定预警标记为已处理状态")
    @PostMapping("/workload-alerts/{alertId}/resolve")
    public ResponseEntity<Map<String, Object>> resolveAlert(
            @Parameter(description = "预警ID") @PathVariable Long alertId) {
        boolean success = resourceManagementService.resolveAlert(alertId);
        return ResponseEntity.ok(Map.of("success", success, "message", success ? "预警已处理" : "处理失败"));
    }
    
    /**
     * 获取资源日历
     * RM-004: 资源日历视图
     */
    @Operation(summary = "获取资源日历", description = "获取资源日历数据，显示每个资源每天的分配情况")
    @GetMapping("/resource-calendar")
    public ResponseEntity<ResourceCalendarData> getResourceCalendar(
            @Parameter(description = "团队ID") @RequestParam(required = false) Long teamId,
            @Parameter(description = "用户ID列表") @RequestParam(required = false) List<Long> userIds,
            @Parameter(description = "开始日期") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "结束日期") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(resourceManagementService.getResourceCalendar(teamId, userIds, startDate, endDate));
    }
    
    /**
     * 获取资源利用率
     * RM-005: 资源利用率图表
     */
    @Operation(summary = "获取资源利用率", description = "获取资源利用率数据，包括趋势、成员利用率、项目利用率")
    @GetMapping("/resource-utilization")
    public ResponseEntity<ResourceUtilizationData> getResourceUtilization(
            @Parameter(description = "团队ID") @RequestParam(required = false) Long teamId,
            @Parameter(description = "统计周期：DAILY, WEEKLY, MONTHLY") @RequestParam(defaultValue = "WEEKLY") String period,
            @Parameter(description = "开始日期") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "结束日期") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(resourceManagementService.getResourceUtilization(teamId, period, startDate, endDate));
    }
    
    /**
     * 获取跨项目资源冲突
     * RM-006: 跨项目资源冲突检测
     */
    @Operation(summary = "获取跨项目资源冲突", description = "检测并获取跨项目资源冲突数据")
    @GetMapping("/project-conflicts")
    public ResponseEntity<ProjectConflictData> getProjectConflicts(
            @Parameter(description = "团队ID") @RequestParam(required = false) Long teamId,
            @Parameter(description = "用户ID") @RequestParam(required = false) Long userId,
            @Parameter(description = "开始日期") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "结束日期") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(resourceManagementService.getProjectConflicts(teamId, userId, startDate, endDate));
    }
    
    /**
     * 解决资源冲突
     */
    @Operation(summary = "解决资源冲突", description = "标记资源冲突为已解决并记录解决方案")
    @PostMapping("/project-conflicts/{conflictId}/resolve")
    public ResponseEntity<Map<String, Object>> resolveConflict(
            @Parameter(description = "冲突ID") @PathVariable Long conflictId,
            @Parameter(description = "解决方案") @RequestBody Map<String, String> request) {
        String resolution = request.get("resolution");
        boolean success = resourceManagementService.resolveConflict(conflictId, resolution);
        return ResponseEntity.ok(Map.of("success", success, "message", success ? "冲突已解决" : "解决失败"));
    }
}