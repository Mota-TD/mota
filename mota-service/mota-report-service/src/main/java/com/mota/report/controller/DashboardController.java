package com.mota.report.controller;

import com.mota.common.core.result.Result;
import com.mota.common.security.util.SecurityUtils;
import com.mota.report.entity.Dashboard;
import com.mota.report.entity.DashboardWidget;
import com.mota.report.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 仪表盘控制器
 *
 * @author mota
 */
@RestController
@RequestMapping("/api/dashboards")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    // ==================== 仪表盘 ====================

    /**
     * 创建仪表盘
     */
    @PostMapping
    public Result<Dashboard> createDashboard(@RequestBody Dashboard dashboard) {
        dashboard.setTenantId(SecurityUtils.getTenantId());
        dashboard.setCreatedBy(SecurityUtils.getUserId());
        return Result.success(dashboardService.createDashboard(dashboard));
    }

    /**
     * 更新仪表盘
     */
    @PutMapping("/{id}")
    public Result<Dashboard> updateDashboard(@PathVariable Long id, @RequestBody Dashboard dashboard) {
        dashboard.setId(id);
        dashboard.setUpdatedBy(SecurityUtils.getUserId());
        return Result.success(dashboardService.updateDashboard(dashboard));
    }

    /**
     * 删除仪表盘
     */
    @DeleteMapping("/{id}")
    public Result<Void> deleteDashboard(@PathVariable Long id) {
        dashboardService.deleteDashboard(id);
        return Result.success();
    }

    /**
     * 获取仪表盘
     */
    @GetMapping("/{id}")
    public Result<Dashboard> getDashboard(@PathVariable Long id) {
        return Result.success(dashboardService.getDashboard(id));
    }

    /**
     * 获取仪表盘及其组件
     */
    @GetMapping("/{id}/full")
    public Result<Dashboard> getDashboardWithWidgets(@PathVariable Long id) {
        return Result.success(dashboardService.getDashboardWithWidgets(id));
    }

    /**
     * 获取用户的仪表盘列表
     */
    @GetMapping("/my")
    public Result<List<Dashboard>> getMyDashboards() {
        return Result.success(dashboardService.getUserDashboards(
            SecurityUtils.getTenantId(), SecurityUtils.getUserId()));
    }

    /**
     * 获取项目仪表盘
     */
    @GetMapping("/project/{projectId}")
    public Result<List<Dashboard>> getProjectDashboards(@PathVariable Long projectId) {
        return Result.success(dashboardService.getProjectDashboards(projectId));
    }

    /**
     * 设置默认仪表盘
     */
    @PostMapping("/{id}/default")
    public Result<Void> setDefaultDashboard(@PathVariable Long id) {
        dashboardService.setDefaultDashboard(id, SecurityUtils.getTenantId(), SecurityUtils.getUserId());
        return Result.success();
    }

    /**
     * 获取默认仪表盘
     */
    @GetMapping("/default")
    public Result<Dashboard> getDefaultDashboard() {
        return Result.success(dashboardService.getDefaultDashboard(
            SecurityUtils.getTenantId(), SecurityUtils.getUserId()));
    }

    /**
     * 复制仪表盘
     */
    @PostMapping("/{id}/copy")
    public Result<Dashboard> copyDashboard(@PathVariable Long id, @RequestBody Map<String, String> request) {
        String newName = request.get("name");
        return Result.success(dashboardService.copyDashboard(id, newName, SecurityUtils.getUserId()));
    }

    // ==================== 仪表盘组件 ====================

    /**
     * 添加组件
     */
    @PostMapping("/{dashboardId}/widgets")
    public Result<DashboardWidget> addWidget(@PathVariable Long dashboardId, @RequestBody DashboardWidget widget) {
        widget.setDashboardId(dashboardId);
        return Result.success(dashboardService.addWidget(widget));
    }

    /**
     * 更新组件
     */
    @PutMapping("/widgets/{id}")
    public Result<DashboardWidget> updateWidget(@PathVariable Long id, @RequestBody DashboardWidget widget) {
        widget.setId(id);
        return Result.success(dashboardService.updateWidget(widget));
    }

    /**
     * 删除组件
     */
    @DeleteMapping("/widgets/{id}")
    public Result<Void> deleteWidget(@PathVariable Long id) {
        dashboardService.deleteWidget(id);
        return Result.success();
    }

    /**
     * 获取组件数据
     */
    @GetMapping("/widgets/{id}/data")
    public Result<Map<String, Object>> getWidgetData(@PathVariable Long id) {
        return Result.success(dashboardService.getWidgetData(id));
    }

    /**
     * 批量更新组件位置
     */
    @PutMapping("/{dashboardId}/widgets/positions")
    public Result<Void> updateWidgetPositions(@PathVariable Long dashboardId, 
                                              @RequestBody List<Map<String, Object>> positions) {
        dashboardService.updateWidgetPositions(dashboardId, positions);
        return Result.success();
    }
}