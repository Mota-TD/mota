package com.mota.calendar.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.calendar.entity.CalendarEvent;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 日历事件Mapper
 */
@Mapper
public interface CalendarEventMapper extends BaseMapper<CalendarEvent> {
    
    /**
     * 获取用户在指定时间范围内的事件
     */
    @Select("SELECT * FROM calendar_event WHERE creator_id = #{userId} " +
            "AND start_time >= #{startTime} AND end_time <= #{endTime} " +
            "AND status = 'active' ORDER BY start_time")
    List<CalendarEvent> findByUserIdAndTimeRange(@Param("userId") Long userId,
                                                  @Param("startTime") LocalDateTime startTime,
                                                  @Param("endTime") LocalDateTime endTime);
    
    /**
     * 获取项目在指定时间范围内的事件
     */
    @Select("SELECT * FROM calendar_event WHERE project_id = #{projectId} " +
            "AND start_time >= #{startTime} AND end_time <= #{endTime} " +
            "AND status = 'active' ORDER BY start_time")
    List<CalendarEvent> findByProjectIdAndTimeRange(@Param("projectId") Long projectId,
                                                     @Param("startTime") LocalDateTime startTime,
                                                     @Param("endTime") LocalDateTime endTime);
    
    /**
     * 获取即将到来的事件（用于提醒）
     */
    @Select("SELECT * FROM calendar_event WHERE creator_id = #{userId} " +
            "AND start_time BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL #{minutes} MINUTE) " +
            "AND status = 'active' ORDER BY start_time")
    List<CalendarEvent> findUpcomingEvents(@Param("userId") Long userId,
                                           @Param("minutes") Integer minutes);
    
    /**
     * 获取任务关联的事件
     */
    @Select("SELECT * FROM calendar_event WHERE task_id = #{taskId} AND status = 'active'")
    List<CalendarEvent> findByTaskId(@Param("taskId") Long taskId);
    
    /**
     * 获取里程碑关联的事件
     */
    @Select("SELECT * FROM calendar_event WHERE milestone_id = #{milestoneId} AND status = 'active'")
    List<CalendarEvent> findByMilestoneId(@Param("milestoneId") Long milestoneId);
}