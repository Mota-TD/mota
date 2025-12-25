package com.mota.project.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.project.entity.CalendarEventAttendee;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 日历事件参与者Mapper
 */
@Mapper
public interface CalendarEventAttendeeMapper extends BaseMapper<CalendarEventAttendee> {
    
    /**
     * 根据事件ID查询参与者列表
     */
    List<CalendarEventAttendee> selectByEventId(@Param("eventId") Long eventId);
    
    /**
     * 根据用户ID查询参与的事件ID列表
     */
    List<Long> selectEventIdsByUserId(@Param("userId") Long userId);
    
    /**
     * 批量插入参与者
     */
    int batchInsert(@Param("attendees") List<CalendarEventAttendee> attendees);
    
    /**
     * 根据事件ID删除所有参与者
     */
    int deleteByEventId(@Param("eventId") Long eventId);
    
    /**
     * 更新参与者响应状态
     */
    int updateResponseStatus(@Param("eventId") Long eventId,
                              @Param("userId") Long userId,
                              @Param("responseStatus") String responseStatus);
    
    /**
     * 检查用户是否是事件参与者
     */
    boolean isAttendee(@Param("eventId") Long eventId, @Param("userId") Long userId);
    
    /**
     * 统计事件参与者响应情况
     */
    int countByResponseStatus(@Param("eventId") Long eventId, @Param("responseStatus") String responseStatus);
}