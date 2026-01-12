package com.mota.calendar.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.calendar.entity.Calendar;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * 日历Mapper
 */
@Mapper
public interface CalendarMapper extends BaseMapper<Calendar> {

    /**
     * 获取用户的所有日历
     */
    @Select("SELECT * FROM calendar WHERE owner_id = #{userId} AND tenant_id = #{tenantId} AND deleted = 0 ORDER BY sort_order, created_at")
    List<Calendar> selectByUserId(@Param("userId") Long userId, @Param("tenantId") Long tenantId);

    /**
     * 获取用户的默认日历
     */
    @Select("SELECT * FROM calendar WHERE owner_id = #{userId} AND is_default = 1 AND deleted = 0 LIMIT 1")
    Calendar selectDefaultByUserId(@Param("userId") Long userId);
    
    /**
     * 获取用户的默认日历（带租户ID）
     */
    @Select("SELECT * FROM calendar WHERE owner_id = #{userId} AND tenant_id = #{tenantId} AND is_default = 1 AND deleted = 0 LIMIT 1")
    Calendar selectDefaultCalendar(@Param("userId") Long userId, @Param("tenantId") Long tenantId);

    /**
     * 获取项目日历
     */
    @Select("SELECT * FROM calendar WHERE project_id = #{projectId} AND deleted = 0")
    Calendar selectByProjectId(@Param("projectId") Long projectId);

    /**
     * 获取团队日历
     */
    @Select("SELECT * FROM calendar WHERE team_id = #{teamId} AND deleted = 0")
    Calendar selectByTeamId(@Param("teamId") Long teamId);

    /**
     * 获取用户可见的所有日历（包括共享的）
     */
    @Select("""
        SELECT DISTINCT c.* FROM calendar c
        LEFT JOIN calendar_share cs ON c.id = cs.calendar_id
        WHERE c.deleted = 0 AND (
            c.owner_id = #{userId}
            OR c.is_public = 1
            OR (cs.share_type = 'user' AND cs.share_target_id = #{userId})
            OR (cs.share_type = 'all')
        )
        ORDER BY c.sort_order, c.created_at
        """)
    List<Calendar> selectVisibleByUserId(@Param("userId") Long userId);

    /**
     * 获取需要同步的日历
     */
    @Select("SELECT * FROM calendar WHERE sync_enabled = 1 AND deleted = 0")
    List<Calendar> selectSyncEnabled();

    /**
     * 按类型获取日历
     */
    @Select("SELECT * FROM calendar WHERE owner_id = #{userId} AND calendar_type = #{calendarType} AND deleted = 0")
    List<Calendar> selectByUserIdAndType(@Param("userId") Long userId, @Param("calendarType") String calendarType);
}