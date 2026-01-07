package com.mota.calendar.controller;

import com.mota.calendar.entity.CalendarEvent;
import com.mota.calendar.entity.CalendarEventAttendee;
import com.mota.calendar.service.CalendarEventService;
import com.mota.common.core.result.Result;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * 日历事件控制器
 * 提供日历事件的CRUD操作接口，供Feign客户端和内部服务调用
 */
@RestController
@RequestMapping("/api/v1/calendar/events")
@RequiredArgsConstructor
public class CalendarEventController {
    
    private final CalendarEventService eventService;
    
    /**
     * 创建事件
     */
    @PostMapping
    public Result<CalendarEvent> createEvent(@RequestBody Map<String, Object> request) {
        CalendarEvent event = new CalendarEvent();
        event.setTitle((String) request.get("title"));
        event.setDescription((String) request.get("description"));
        event.setLocation((String) request.get("location"));
        event.setEventType((String) request.getOrDefault("eventType", "meeting"));
        event.setVisibility((String) request.getOrDefault("visibility", "private"));
        
        if (request.get("userId") != null) {
            event.setUserId(Long.valueOf(request.get("userId").toString()));
        }
        if (request.get("enterpriseId") != null) {
            event.setEnterpriseId(Long.valueOf(request.get("enterpriseId").toString()));
        }
        if (request.get("creatorId") != null) {
            event.setCreatorId(Long.valueOf(request.get("creatorId").toString()));
        }
        if (request.get("projectId") != null) {
            event.setProjectId(Long.valueOf(request.get("projectId").toString()));
        }
        if (request.get("taskId") != null) {
            event.setTaskId(Long.valueOf(request.get("taskId").toString()));
        }
        if (request.get("milestoneId") != null) {
            event.setMilestoneId(Long.valueOf(request.get("milestoneId").toString()));
        }
        if (request.get("startTime") != null) {
            event.setStartTime(LocalDateTime.parse((String) request.get("startTime")));
        }
        if (request.get("endTime") != null) {
            event.setEndTime(LocalDateTime.parse((String) request.get("endTime")));
        }
        event.setAllDay(Boolean.TRUE.equals(request.get("allDay")));
        event.setTimezone((String) request.getOrDefault("timezone", "Asia/Shanghai"));
        event.setIsRecurring(Boolean.TRUE.equals(request.get("isRecurring")));
        event.setRecurrencePattern((String) request.get("recurrencePattern"));
        event.setReminderMinutes(request.get("reminderMinutes") != null ? 
            Integer.valueOf(request.get("reminderMinutes").toString()) : 15);
        
        @SuppressWarnings("unchecked")
        List<Long> attendeeIds = (List<Long>) request.get("attendeeIds");
        
        CalendarEvent created = eventService.createEvent(event, attendeeIds);
        return Result.success(created);
    }
    
    /**
     * 更新事件
     */
    @PutMapping("/{id}")
    public Result<CalendarEvent> updateEvent(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        CalendarEvent event = new CalendarEvent();
        event.setId(id);
        
        if (request.containsKey("title")) {
            event.setTitle((String) request.get("title"));
        }
        if (request.containsKey("description")) {
            event.setDescription((String) request.get("description"));
        }
        if (request.containsKey("location")) {
            event.setLocation((String) request.get("location"));
        }
        if (request.containsKey("eventType")) {
            event.setEventType((String) request.get("eventType"));
        }
        if (request.containsKey("visibility")) {
            event.setVisibility((String) request.get("visibility"));
        }
        if (request.get("startTime") != null) {
            event.setStartTime(LocalDateTime.parse((String) request.get("startTime")));
        }
        if (request.get("endTime") != null) {
            event.setEndTime(LocalDateTime.parse((String) request.get("endTime")));
        }
        if (request.containsKey("allDay")) {
            event.setAllDay(Boolean.TRUE.equals(request.get("allDay")));
        }
        if (request.containsKey("reminderMinutes")) {
            event.setReminderMinutes(Integer.valueOf(request.get("reminderMinutes").toString()));
        }
        
        @SuppressWarnings("unchecked")
        List<Long> attendeeIds = (List<Long>) request.get("attendeeIds");
        
        CalendarEvent updated = eventService.updateEvent(id, event, attendeeIds);
        return Result.success(updated);
    }
    
    /**
     * 删除事件
     */
    @DeleteMapping("/{id}")
    public Result<Boolean> deleteEvent(@PathVariable Long id) {
        boolean result = eventService.deleteEvent(id);
        return Result.success(result);
    }
    
    /**
     * 取消事件
     */
    @PostMapping("/{id}/cancel")
    public Result<Boolean> cancelEvent(@PathVariable Long id) {
        boolean result = eventService.cancelEvent(id);
        return Result.success(result);
    }
    
    /**
     * 获取事件详情
     */
    @GetMapping("/{id}")
    public Result<CalendarEvent> getEvent(@PathVariable Long id) {
        CalendarEvent event = eventService.getEventWithAttendees(id);
        return Result.success(event);
    }
    
    /**
     * 获取用户事件列表
     */
    @GetMapping("/user/{userId}")
    public Result<List<CalendarEvent>> getUserEvents(
            @PathVariable Long userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime) {
        List<CalendarEvent> events = eventService.getUserEventsInRange(userId, startTime, endTime);
        return Result.success(events);
    }
    
    /**
     * 获取项目事件列表
     */
    @GetMapping("/project/{projectId}")
    public Result<List<CalendarEvent>> getProjectEvents(
            @PathVariable Long projectId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime) {
        List<CalendarEvent> events = eventService.getProjectEvents(projectId, startTime, endTime);
        return Result.success(events);
    }
    
    /**
     * 获取即将开始的事件
     */
    @GetMapping("/upcoming")
    public Result<List<CalendarEvent>> getUpcomingEvents(
            @RequestParam Long userId,
            @RequestParam(defaultValue = "30") Integer minutes) {
        List<CalendarEvent> events = eventService.getUpcomingEvents(userId, minutes);
        return Result.success(events);
    }
    
    /**
     * 获取任务关联的事件
     */
    @GetMapping("/task/{taskId}")
    public Result<List<CalendarEvent>> getEventsByTaskId(@PathVariable Long taskId) {
        List<CalendarEvent> events = eventService.getEventsByTaskId(taskId);
        return Result.success(events);
    }
    
    /**
     * 获取里程碑关联的事件
     */
    @GetMapping("/milestone/{milestoneId}")
    public Result<List<CalendarEvent>> getEventsByMilestoneId(@PathVariable Long milestoneId) {
        List<CalendarEvent> events = eventService.getEventsByMilestoneId(milestoneId);
        return Result.success(events);
    }
    
    /**
     * 添加参与者
     */
    @PostMapping("/{eventId}/attendees")
    public Result<Boolean> addAttendees(
            @PathVariable Long eventId,
            @RequestBody List<Long> userIds) {
        boolean result = eventService.addAttendees(eventId, userIds);
        return Result.success(result);
    }
    
    /**
     * 移除参与者
     */
    @DeleteMapping("/{eventId}/attendees/{userId}")
    public Result<Boolean> removeAttendee(
            @PathVariable Long eventId,
            @PathVariable Long userId) {
        boolean result = eventService.removeAttendee(eventId, userId);
        return Result.success(result);
    }
    
    /**
     * 更新参与者响应状态
     */
    @PutMapping("/{eventId}/attendees/{userId}/response")
    public Result<Boolean> updateAttendeeResponse(
            @PathVariable Long eventId,
            @PathVariable Long userId,
            @RequestBody Map<String, String> request) {
        boolean result = eventService.updateAttendeeResponse(eventId, userId, request.get("status"));
        return Result.success(result);
    }
    
    /**
     * 获取事件参与者列表
     */
    @GetMapping("/{eventId}/attendees")
    public Result<List<CalendarEventAttendee>> getEventAttendees(@PathVariable Long eventId) {
        List<CalendarEventAttendee> attendees = eventService.getEventAttendees(eventId);
        return Result.success(attendees);
    }
    
    /**
     * 检查用户是否有权限访问事件
     */
    @GetMapping("/{eventId}/access")
    public Result<Boolean> canAccessEvent(
            @PathVariable Long eventId,
            @RequestParam Long userId) {
        boolean canAccess = eventService.canAccessEvent(eventId, userId);
        return Result.success(canAccess);
    }
    
    /**
     * 批量删除事件
     */
    @DeleteMapping("/batch")
    public Result<Boolean> deleteEvents(@RequestBody List<Long> ids) {
        boolean result = eventService.deleteEvents(ids);
        return Result.success(result);
    }
}