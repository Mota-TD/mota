package com.mota.calendar.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.calendar.entity.CalendarEventAttendee;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Delete;

import java.util.List;

/**
 * 日历事件参与者Mapper
 */
@Mapper
public interface CalendarEventAttendeeMapper extends BaseMapper<CalendarEventAttendee> {
    
    /**
     * 获取事件的所有参与者
     */
    @Select("SELECT * FROM calendar_event_attendee WHERE event_id = #{eventId}")
    List<CalendarEventAttendee> findByEventId(@Param("eventId") Long eventId);
    
    /**
     * 获取用户参与的所有事件ID
     */
    @Select("SELECT event_id FROM calendar_event_attendee WHERE user_id = #{userId}")
    List<Long> findEventIdsByUserId(@Param("userId") Long userId);
    
    /**
     * 删除事件的所有参与者
     */
    @Delete("DELETE FROM calendar_event_attendee WHERE event_id = #{eventId}")
    int deleteByEventId(@Param("eventId") Long eventId);
    
    /**
     * 获取特定用户在特定事件中的参与记录
     */
    @Select("SELECT * FROM calendar_event_attendee WHERE event_id = #{eventId} AND user_id = #{userId}")
    CalendarEventAttendee findByEventIdAndUserId(@Param("eventId") Long eventId, @Param("userId") Long userId);
}