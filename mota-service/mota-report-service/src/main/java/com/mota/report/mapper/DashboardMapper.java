package com.mota.report.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.report.entity.Dashboard;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.List;

/**
 * 仪表盘Mapper
 *
 * @author mota
 */
@Mapper
public interface DashboardMapper extends BaseMapper<Dashboard> {

    /**
     * 查询用户的仪表盘
     */
    @Select("SELECT * FROM dashboard WHERE tenant_id = #{tenantId} AND created_by = #{userId} AND deleted = 0 " +
            "ORDER BY sort_order ASC, created_at DESC")
    List<Dashboard> findByUser(@Param("tenantId") Long tenantId, @Param("userId") Long userId);

    /**
     * 查询项目仪表盘
     */
    @Select("SELECT * FROM dashboard WHERE project_id = #{projectId} AND deleted = 0 ORDER BY sort_order ASC")
    List<Dashboard> findByProject(@Param("projectId") Long projectId);

    /**
     * 查询团队仪表盘
     */
    @Select("SELECT * FROM dashboard WHERE team_id = #{teamId} AND deleted = 0 ORDER BY sort_order ASC")
    List<Dashboard> findByTeam(@Param("teamId") Long teamId);

    /**
     * 查询公开仪表盘
     */
    @Select("SELECT * FROM dashboard WHERE tenant_id = #{tenantId} AND is_public = 1 AND status = 1 AND deleted = 0 " +
            "ORDER BY view_count DESC")
    List<Dashboard> findPublicDashboards(@Param("tenantId") Long tenantId);

    /**
     * 查询默认仪表盘
     */
    @Select("SELECT * FROM dashboard WHERE tenant_id = #{tenantId} AND created_by = #{userId} " +
            "AND is_default = 1 AND deleted = 0 LIMIT 1")
    Dashboard findDefaultDashboard(@Param("tenantId") Long tenantId, @Param("userId") Long userId);

    /**
     * 设置默认仪表盘
     */
    @Update("UPDATE dashboard SET is_default = 0 WHERE tenant_id = #{tenantId} AND created_by = #{userId}")
    int clearDefaultDashboard(@Param("tenantId") Long tenantId, @Param("userId") Long userId);

    /**
     * 增加查看次数
     */
    @Update("UPDATE dashboard SET view_count = view_count + 1 WHERE id = #{id}")
    int incrementViewCount(@Param("id") Long id);

    /**
     * 按类型查询仪表盘
     */
    @Select("SELECT * FROM dashboard WHERE tenant_id = #{tenantId} AND type = #{type} AND status = 1 AND deleted = 0")
    List<Dashboard> findByType(@Param("tenantId") Long tenantId, @Param("type") String type);
}