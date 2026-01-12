package com.mota.report.service.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mota.common.core.exception.BusinessException;
import com.mota.report.entity.Dashboard;
import com.mota.report.entity.DashboardWidget;
import com.mota.report.mapper.DashboardMapper;
import com.mota.report.mapper.DashboardWidgetMapper;
import com.mota.report.service.DashboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

/**
 * 仪表盘服务实现
 *
 * @author mota
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final DashboardMapper dashboardMapper;
    private final DashboardWidgetMapper widgetMapper;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional
    public Dashboard createDashboard(Dashboard dashboard) {
        dashboard.setViewCount(0);
        dashboard.setStatus(1);
        dashboard.setDeleted(false);
        
        if (dashboard.getSortOrder() == null) {
            dashboard.setSortOrder(0);
        }
        
        dashboardMapper.insert(dashboard);
        log.info("创建仪表盘: id={}, name={}", dashboard.getId(), dashboard.getName());
        return dashboard;
    }

    @Override
    @Transactional
    public Dashboard updateDashboard(Dashboard dashboard) {
        Dashboard existing = dashboardMapper.selectById(dashboard.getId());
        if (existing == null) {
            throw new BusinessException("仪表盘不存在: " + dashboard.getId());
        }
        
        dashboardMapper.updateById(dashboard);
        log.info("更新仪表盘: id={}", dashboard.getId());
        return dashboard;
    }

    @Override
    @Transactional
    public void deleteDashboard(Long dashboardId) {
        Dashboard dashboard = dashboardMapper.selectById(dashboardId);
        if (dashboard == null) {
            throw new BusinessException("仪表盘不存在: " + dashboardId);
        }
        
        // 删除所有组件
        widgetMapper.deleteByDashboard(dashboardId);
        
        // 删除仪表盘
        dashboardMapper.deleteById(dashboardId);
        log.info("删除仪表盘: id={}", dashboardId);
    }

    @Override
    public Dashboard getDashboard(Long dashboardId) {
        Dashboard dashboard = dashboardMapper.selectById(dashboardId);
        if (dashboard != null) {
            dashboardMapper.incrementViewCount(dashboardId);
        }
        return dashboard;
    }

    @Override
    public Dashboard getDashboardWithWidgets(Long dashboardId) {
        Dashboard dashboard = getDashboard(dashboardId);
        if (dashboard != null) {
            List<DashboardWidget> widgets = widgetMapper.findActiveByDashboard(dashboardId);
            // 将组件列表存储在扩展属性中（实际项目中可以使用VO对象）
        }
        return dashboard;
    }

    @Override
    public List<Dashboard> getUserDashboards(Long tenantId, Long userId) {
        return dashboardMapper.findByUser(tenantId, userId);
    }

    @Override
    public List<Dashboard> getProjectDashboards(Long projectId) {
        return dashboardMapper.findByProject(projectId);
    }

    @Override
    @Transactional
    public void setDefaultDashboard(Long dashboardId, Long tenantId, Long userId) {
        Dashboard dashboard = dashboardMapper.selectById(dashboardId);
        if (dashboard == null) {
            throw new BusinessException("仪表盘不存在: " + dashboardId);
        }
        
        // 清除原有默认仪表盘
        dashboardMapper.clearDefaultDashboard(tenantId, userId);
        
        // 设置新的默认仪表盘
        dashboard.setIsDefault(true);
        dashboardMapper.updateById(dashboard);
        
        log.info("设置默认仪表盘: id={}, userId={}", dashboardId, userId);
    }

    @Override
    public Dashboard getDefaultDashboard(Long tenantId, Long userId) {
        return dashboardMapper.findDefaultDashboard(tenantId, userId);
    }

    @Override
    @Transactional
    public DashboardWidget addWidget(DashboardWidget widget) {
        Dashboard dashboard = dashboardMapper.selectById(widget.getDashboardId());
        if (dashboard == null) {
            throw new BusinessException("仪表盘不存在: " + widget.getDashboardId());
        }
        
        // 设置排序号
        if (widget.getSortOrder() == null) {
            int maxOrder = widgetMapper.getMaxSortOrder(widget.getDashboardId());
            widget.setSortOrder(maxOrder + 1);
        }
        
        widget.setStatus(1);
        widget.setDeleted(false);
        widgetMapper.insert(widget);
        
        log.info("添加仪表盘组件: id={}, dashboardId={}", widget.getId(), widget.getDashboardId());
        return widget;
    }

    @Override
    @Transactional
    public DashboardWidget updateWidget(DashboardWidget widget) {
        DashboardWidget existing = widgetMapper.selectById(widget.getId());
        if (existing == null) {
            throw new BusinessException("组件不存在: " + widget.getId());
        }
        
        widgetMapper.updateById(widget);
        log.info("更新仪表盘组件: id={}", widget.getId());
        return widget;
    }

    @Override
    @Transactional
    public void deleteWidget(Long widgetId) {
        DashboardWidget widget = widgetMapper.selectById(widgetId);
        if (widget == null) {
            throw new BusinessException("组件不存在: " + widgetId);
        }
        
        widgetMapper.deleteById(widgetId);
        log.info("删除仪表盘组件: id={}", widgetId);
    }

    @Override
    public Map<String, Object> getWidgetData(Long widgetId) {
        DashboardWidget widget = widgetMapper.selectById(widgetId);
        if (widget == null) {
            throw new BusinessException("组件不存在: " + widgetId);
        }
        
        Map<String, Object> result = new HashMap<>();
        
        try {
            // 解析数据源配置
            Map<String, Object> dataSourceConfig = objectMapper.readValue(
                widget.getDataSourceConfig(), new TypeReference<Map<String, Object>>() {});
            
            String sourceType = (String) dataSourceConfig.getOrDefault("type", "static");
            
            switch (sourceType) {
                case "api":
                    result = fetchWidgetDataFromApi(dataSourceConfig);
                    break;
                case "sql":
                    result = fetchWidgetDataFromSql(dataSourceConfig);
                    break;
                case "static":
                    result = (Map<String, Object>) dataSourceConfig.getOrDefault("data", new HashMap<>());
                    break;
                default:
                    log.warn("未知的数据源类型: {}", sourceType);
            }
            
        } catch (Exception e) {
            log.error("获取组件数据失败: widgetId={}", widgetId, e);
            throw new BusinessException("获取组件数据失败: " + e.getMessage());
        }
        
        return result;
    }

    private Map<String, Object> fetchWidgetDataFromApi(Map<String, Object> config) {
        // TODO: 通过Feign调用其他服务获取数据
        // 返回模拟数据
        Map<String, Object> result = new HashMap<>();
        result.put("value", (int) (Math.random() * 1000));
        result.put("trend", Math.random() > 0.5 ? "up" : "down");
        result.put("change", String.format("%.1f%%", (Math.random() - 0.5) * 20));
        return result;
    }

    private Map<String, Object> fetchWidgetDataFromSql(Map<String, Object> config) {
        // TODO: 执行SQL查询获取数据
        return new HashMap<>();
    }

    @Override
    @Transactional
    public void updateWidgetPositions(Long dashboardId, List<Map<String, Object>> positions) {
        for (Map<String, Object> pos : positions) {
            Long widgetId = Long.valueOf(pos.get("id").toString());
            DashboardWidget widget = widgetMapper.selectById(widgetId);
            
            if (widget != null && widget.getDashboardId().equals(dashboardId)) {
                try {
                    widget.setPositionConfig(objectMapper.writeValueAsString(pos));
                    widgetMapper.updateById(widget);
                } catch (Exception e) {
                    log.error("更新组件位置失败: widgetId={}", widgetId, e);
                }
            }
        }
        
        log.info("批量更新组件位置: dashboardId={}, count={}", dashboardId, positions.size());
    }

    @Override
    @Transactional
    public Dashboard copyDashboard(Long dashboardId, String newName, Long userId) {
        Dashboard source = dashboardMapper.selectById(dashboardId);
        if (source == null) {
            throw new BusinessException("仪表盘不存在: " + dashboardId);
        }
        
        // 复制仪表盘
        Dashboard copy = new Dashboard();
        copy.setTenantId(source.getTenantId());
        copy.setName(newName != null ? newName : source.getName() + "_副本");
        copy.setDescription(source.getDescription());
        copy.setType(source.getType());
        copy.setProjectId(source.getProjectId());
        copy.setTeamId(source.getTeamId());
        copy.setLayoutConfig(source.getLayoutConfig());
        copy.setThemeConfig(source.getThemeConfig());
        copy.setRefreshInterval(source.getRefreshInterval());
        copy.setIsPublic(false);
        copy.setIsDefault(false);
        copy.setSortOrder(0);
        copy.setStatus(1);
        copy.setViewCount(0);
        copy.setCreatedBy(userId);
        copy.setDeleted(false);
        
        dashboardMapper.insert(copy);
        
        // 复制组件
        List<DashboardWidget> widgets = widgetMapper.findByDashboard(dashboardId);
        for (DashboardWidget widget : widgets) {
            DashboardWidget widgetCopy = new DashboardWidget();
            widgetCopy.setDashboardId(copy.getId());
            widgetCopy.setName(widget.getName());
            widgetCopy.setType(widget.getType());
            widgetCopy.setChartType(widget.getChartType());
            widgetCopy.setDataSourceType(widget.getDataSourceType());
            widgetCopy.setDataSourceConfig(widget.getDataSourceConfig());
            widgetCopy.setTransformConfig(widget.getTransformConfig());
            widgetCopy.setWidgetConfig(widget.getWidgetConfig());
            widgetCopy.setPositionConfig(widget.getPositionConfig());
            widgetCopy.setRefreshInterval(widget.getRefreshInterval());
            widgetCopy.setCacheSeconds(widget.getCacheSeconds());
            widgetCopy.setSortOrder(widget.getSortOrder());
            widgetCopy.setStatus(1);
            widgetCopy.setDeleted(false);
            
            widgetMapper.insert(widgetCopy);
        }
        
        log.info("复制仪表盘: sourceId={}, newId={}, widgetCount={}", 
            dashboardId, copy.getId(), widgets.size());
        
        return copy;
    }
}