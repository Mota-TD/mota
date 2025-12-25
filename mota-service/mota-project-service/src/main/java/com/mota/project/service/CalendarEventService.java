package com.mota.project.service;

import com.mota.project.entity.CalendarEvent;
import com.mota.project.entity.CalendarEventAttendee;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 日历事件服务接口
 */
public interface CalendarEventService {
    
    /**
     * 创建事件
     */
    CalendarEvent createEvent(CalendarEvent event, List<Long> attendeeIds);
    
    /**
     * 更新事件
     */
    CalendarEvent updateEvent(Long id, CalendarEvent event, List<Long> attendeeIds);
    
    /**
     * 删除事件
     */
    boolean deleteEvent(Long id);
    
    /**
     * 取消事件
     */
    boolean cancelEvent(Long id);
    
    /**
     * 获取事件详情
     */
    CalendarEvent getEventById(Long id);
    
    /**
     * 获取事件详情(包含参与者)
     */
    CalendarEvent getEventWithAttendees(Long id);
    
    /**
     * 获取用户的事件列表
     */
    List<CalendarEvent> getUserEvents(Long userId, LocalDateTime startTime, LocalDateTime endTime);
    
    /**
     * 获取项目的事件列表
     */
    List<CalendarEvent> getProjectEvents(Long projectId, LocalDateTime startTime, LocalDateTime endTime);
    
    /**
     * 获取用户在指定时间范围内的所有事件(包括参与的事件)
     */
    List<CalendarEvent> getUserEventsInRange(Long userId, LocalDateTime startTime, LocalDateTime endTime);
    
    /**
     * 获取即将到来的事件(用于提醒)
     */
    List<CalendarEvent> getUpcomingEvents(Long userId, Integer minutes);
    
    /**
     * 获取任务关联的事件
     */
    List<CalendarEvent> getEventsByTaskId(Long taskId);
    
    /**
     * 获取里程碑关联的事件
     */
    List<CalendarEvent> getEventsByMilestoneId(Long milestoneId);
    
    /**
     * 添加参与者
     */
    boolean addAttendees(Long eventId, List<Long> userIds);
    
    /**
     * 移除参与者
     */
    boolean removeAttendee(Long eventId, Long userId);
    
    /**
     * 更新参与者响应状态
     */
    boolean updateAttendeeResponse(Long eventId, Long userId, String responseStatus);
    
    /**
     * 获取事件参与者列表
     */
    List<CalendarEventAttendee> getEventAttendees(Long eventId);
    
    /**
     * 检查用户是否可以访问事件
     */
    boolean canAccessEvent(Long eventId, Long userId);
    
    /**
     * 从任务创建事件
     */
    CalendarEvent createEventFromTask(Long taskId, Long creatorId);
    
    /**
     * 从里程碑创建事件
     */
    CalendarEvent createEventFromMilestone(Long milestoneId, Long creatorId);
    
    /**
     * 批量删除事件
     */
    boolean deleteEvents(List<Long> ids);
}