package com.mota.calendar.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.calendar.entity.CalendarShare;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * 日历共享Mapper
 */
@Mapper
public interface CalendarShareMapper extends BaseMapper<CalendarShare> {

    /**
     * 获取日历的所有共享设置
     */
    @Select("SELECT * FROM calendar_share WHERE calendar_id = #{calendarId}")
    List<CalendarShare> selectByCalendarId(@Param("calendarId") Long calendarId);

    /**
     * 获取用户被共享的日历
     */
    @Select("SELECT * FROM calendar_share WHERE share_type = 'user' AND share_target_id = #{userId}")
    List<CalendarShare> selectByUserId(@Param("userId") Long userId);

    /**
     * 检查用户是否有日历权限
     */
    @Select("""
        SELECT * FROM calendar_share 
        WHERE calendar_id = #{calendarId} 
        AND share_type = 'user' 
        AND share_target_id = #{userId}
        LIMIT 1
        """)
    CalendarShare selectByCalendarIdAndUserId(@Param("calendarId") Long calendarId, @Param("userId") Long userId);
}