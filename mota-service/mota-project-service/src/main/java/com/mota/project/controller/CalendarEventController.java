package com.mota.project.controller;

import com.mota.project.entity.CalendarEvent;
import com.mota.project.entity.CalendarEventAttendee;
import com.mota.project.service.CalendarEventService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * 日历事件控制器
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/calendar-events")
@RequiredArgsConstructor
public class CalendarEventController {
    
    private final CalendarEventService calendarEventService;
    
    /**
     * 创建事件
     */
    @PostMapping
    public ResponseEntity<CalendarEvent> createEvent(
            @RequestBody CreateEventRequest request) {
        CalendarEvent event = new CalendarEvent();
        event.setTitle(request.getTitle());
        event.setDescription(request.getDescription());
        event.setEventType(request.getEventType());
        event.setStartTime(request.getStartTime());
        event.setEndTime(request.getEndTime());
        event.setAllDay(request.getAllDay());
        event.setLocation(request.getLocation());
        event.setColor(request.getColor());
        event.setCreatorId(request.getCreatorId());
        event.setProjectId(request.getProjectId());
        event.setTaskId(request.getTaskId());
        event.setMilestoneId(request.getMilestoneId());
        event.setRecurrenceRule(request.getRecurrenceRule());
        event.setRecurrenceEndDate(request.getRecurrenceEndDate());
        event.setReminderMinutes(request.getReminderMinutes());
        event.setVisibility(request.getVisibility());
        
        CalendarEvent created = calendarEventService.createEvent(event, request.getAttendeeIds());
        return ResponseEntity.ok(created);
    }
    
    /**
     * 更新事件
     */
    @PutMapping("/{id}")
    public ResponseEntity<CalendarEvent> updateEvent(
            @PathVariable Long id,
            @RequestBody CreateEventRequest request) {
        CalendarEvent event = new CalendarEvent();
        event.setTitle(request.getTitle());
        event.setDescription(request.getDescription());
        event.setEventType(request.getEventType());
        event.setStartTime(request.getStartTime());
        event.setEndTime(request.getEndTime());
        event.setAllDay(request.getAllDay());
        event.setLocation(request.getLocation());
        event.setColor(request.getColor());
        event.setRecurrenceRule(request.getRecurrenceRule());
        event.setRecurrenceEndDate(request.getRecurrenceEndDate());
        event.setReminderMinutes(request.getReminderMinutes());
        event.setVisibility(request.getVisibility());
        
        CalendarEvent updated = calendarEventService.updateEvent(id, event, request.getAttendeeIds());
        return ResponseEntity.ok(updated);
    }
    
    /**
     * 删除事件
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Boolean> deleteEvent(@PathVariable Long id) {
        return ResponseEntity.ok(calendarEventService.deleteEvent(id));
    }
    
    /**
     * 取消事件
     */
    @PostMapping("/{id}/cancel")
    public ResponseEntity<Boolean> cancelEvent(@PathVariable Long id) {
        return ResponseEntity.ok(calendarEventService.cancelEvent(id));
    }
    
    /**
     * 获取事件详情
     */
    @GetMapping("/{id}")
    public ResponseEntity<CalendarEvent> getEvent(@PathVariable Long id) {
        return ResponseEntity.ok(calendarEventService.getEventById(id));
    }
    
    /**
     * 获取事件详情(包含参与者)
     */
    @GetMapping("/{id}/detail")
    public ResponseEntity<CalendarEvent> getEventWithAttendees(@PathVariable Long id) {
        return ResponseEntity.ok(calendarEventService.getEventWithAttendees(id));
    }
    
    /**
     * 获取用户的事件列表
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<CalendarEvent>> getUserEvents(
            @PathVariable Long userId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime) {
        return ResponseEntity.ok(calendarEventService.getUserEvents(userId, startTime, endTime));
    }
    
    /**
     * 获取项目的事件列表
     */
    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<CalendarEvent>> getProjectEvents(
            @PathVariable Long projectId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime) {
        return ResponseEntity.ok(calendarEventService.getProjectEvents(projectId, startTime, endTime));
    }
    
    /**
     * 获取用户在指定时间范围内的所有事件
     */
    @GetMapping("/user/{userId}/range")
    public ResponseEntity<List<CalendarEvent>> getUserEventsInRange(
            @PathVariable Long userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime) {
        return ResponseEntity.ok(calendarEventService.getUserEventsInRange(userId, startTime, endTime));
    }
    
    /**
     * 获取即将到来的事件
     */
    @GetMapping("/user/{userId}/upcoming")
    public ResponseEntity<List<CalendarEvent>> getUpcomingEvents(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "60") Integer minutes) {
        return ResponseEntity.ok(calendarEventService.getUpcomingEvents(userId, minutes));
    }
    
    /**
     * 获取任务关联的事件
     */
    @GetMapping("/task/{taskId}")
    public ResponseEntity<List<CalendarEvent>> getEventsByTaskId(@PathVariable Long taskId) {
        return ResponseEntity.ok(calendarEventService.getEventsByTaskId(taskId));
    }
    
    /**
     * 获取里程碑关联的事件
     */
    @GetMapping("/milestone/{milestoneId}")
    public ResponseEntity<List<CalendarEvent>> getEventsByMilestoneId(@PathVariable Long milestoneId) {
        return ResponseEntity.ok(calendarEventService.getEventsByMilestoneId(milestoneId));
    }
    
    /**
     * 添加参与者
     */
    @PostMapping("/{eventId}/attendees")
    public ResponseEntity<Boolean> addAttendees(
            @PathVariable Long eventId,
            @RequestBody List<Long> userIds) {
        return ResponseEntity.ok(calendarEventService.addAttendees(eventId, userIds));
    }
    
    /**
     * 移除参与者
     */
    @DeleteMapping("/{eventId}/attendees/{userId}")
    public ResponseEntity<Boolean> removeAttendee(
            @PathVariable Long eventId,
            @PathVariable Long userId) {
        return ResponseEntity.ok(calendarEventService.removeAttendee(eventId, userId));
    }
    
    /**
     * 更新参与者响应状态
     */
    @PutMapping("/{eventId}/attendees/{userId}/response")
    public ResponseEntity<Boolean> updateAttendeeResponse(
            @PathVariable Long eventId,
            @PathVariable Long userId,
            @RequestBody Map<String, String> request) {
        String responseStatus = request.get("responseStatus");
        return ResponseEntity.ok(calendarEventService.updateAttendeeResponse(eventId, userId, responseStatus));
    }
    
    /**
     * 获取事件参与者列表
     */
    @GetMapping("/{eventId}/attendees")
    public ResponseEntity<List<CalendarEventAttendee>> getEventAttendees(@PathVariable Long eventId) {
        return ResponseEntity.ok(calendarEventService.getEventAttendees(eventId));
    }
    
    /**
     * 从任务创建事件
     */
    @PostMapping("/from-task/{taskId}")
    public ResponseEntity<CalendarEvent> createEventFromTask(
            @PathVariable Long taskId,
            @RequestParam Long creatorId) {
        return ResponseEntity.ok(calendarEventService.createEventFromTask(taskId, creatorId));
    }
    
    /**
     * 从里程碑创建事件
     */
    @PostMapping("/from-milestone/{milestoneId}")
    public ResponseEntity<CalendarEvent> createEventFromMilestone(
            @PathVariable Long milestoneId,
            @RequestParam Long creatorId) {
        return ResponseEntity.ok(calendarEventService.createEventFromMilestone(milestoneId, creatorId));
    }
    
    /**
     * 批量删除事件
     */
    @DeleteMapping("/batch")
    public ResponseEntity<Boolean> deleteEvents(@RequestBody List<Long> ids) {
        return ResponseEntity.ok(calendarEventService.deleteEvents(ids));
    }
    
    /**
     * 创建事件请求DTO
     */
    @lombok.Data
    public static class CreateEventRequest {
        private String title;
        private String description;
        private String eventType;
        private LocalDateTime startTime;
        private LocalDateTime endTime;
        private Boolean allDay;
        private String location;
        private String color;
        private Long creatorId;
        private Long projectId;
        private Long taskId;
        private Long milestoneId;
        private String recurrenceRule;
        private LocalDateTime recurrenceEndDate;
        private Integer reminderMinutes;
        private String visibility;
        private List<Long> attendeeIds;
    }
}