package com.mota.report.service;

import com.mota.report.entity.Dashboard;
import com.mota.report.entity.DashboardWidget;

import java.util.List;
import java.util.Map;

/**
 * 仪表盘服务接口
 *
 * @author mota
 */
public interface DashboardService {

    /**
     * 创建仪表盘
     */
    Dashboard createDashboard(Dashboard dashboard);

    /**
     * 更新仪表盘
     */
    Dashboard updateDashboard(Dashboard dashboard);

    /**
     * 删除仪表盘
     */
    void deleteDashboard(Long dashboardId);

    /**
     * 获取仪表盘
     */
    Dashboard getDashboard(Long dashboardId);

    /**
     * 获取仪表盘及其组件
     */
    Dashboard getDashboardWithWidgets(Long dashboardId);

    /**
     * 查询用户的仪表盘
     */
    List<Dashboard> getUserDashboards(Long tenantId, Long userId);

    /**
     * 查询项目仪表盘
     */
    List<Dashboard> getProjectDashboards(Long projectId);

    /**
     * 设置默认仪表盘
     */
    void setDefaultDashboard(Long dashboardId, Long tenantId, Long userId);

    /**
     * 获取默认仪表盘
     */
    Dashboard getDefaultDashboard(Long tenantId, Long userId);

    /**
     * 添加组件
     */
    DashboardWidget addWidget(DashboardWidget widget);

    /**
     * 更新组件
     */
    DashboardWidget updateWidget(DashboardWidget widget);

    /**
     * 删除组件
     */
    void deleteWidget(Long widgetId);

    /**
     * 获取组件数据
     */
    Map<String, Object> getWidgetData(Long widgetId);

    /**
     * 批量更新组件位置
     */
    void updateWidgetPositions(Long dashboardId, List<Map<String, Object>> positions);

    /**
     * 复制仪表盘
     */
    Dashboard copyDashboard(Long dashboardId, String newName, Long userId);
}