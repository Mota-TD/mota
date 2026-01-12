package com.mota.report.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.report.entity.DashboardWidget;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * 仪表盘组件Mapper
 *
 * @author mota
 */
@Mapper
public interface DashboardWidgetMapper extends BaseMapper<DashboardWidget> {

    /**
     * 查询仪表盘的所有组件
     */
    @Select("SELECT * FROM dashboard_widget WHERE dashboard_id = #{dashboardId} AND deleted = 0 " +
            "ORDER BY sort_order ASC")
    List<DashboardWidget> findByDashboard(@Param("dashboardId") Long dashboardId);

    /**
     * 查询仪表盘的启用组件
     */
    @Select("SELECT * FROM dashboard_widget WHERE dashboard_id = #{dashboardId} AND status = 1 AND deleted = 0 " +
            "ORDER BY sort_order ASC")
    List<DashboardWidget> findActiveByDashboard(@Param("dashboardId") Long dashboardId);

    /**
     * 按类型查询组件
     */
    @Select("SELECT * FROM dashboard_widget WHERE dashboard_id = #{dashboardId} AND type = #{type} AND deleted = 0")
    List<DashboardWidget> findByType(@Param("dashboardId") Long dashboardId, @Param("type") String type);

    /**
     * 删除仪表盘的所有组件
     */
    @Delete("UPDATE dashboard_widget SET deleted = 1 WHERE dashboard_id = #{dashboardId}")
    int deleteByDashboard(@Param("dashboardId") Long dashboardId);

    /**
     * 获取最大排序号
     */
    @Select("SELECT COALESCE(MAX(sort_order), 0) FROM dashboard_widget WHERE dashboard_id = #{dashboardId} AND deleted = 0")
    int getMaxSortOrder(@Param("dashboardId") Long dashboardId);
}