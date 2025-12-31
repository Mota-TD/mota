package com.mota.project.controller;

import com.mota.common.core.result.Result;
import com.mota.project.entity.CalendarEvent;
import com.mota.project.entity.CalendarEventAttendee;
import com.mota.project.entity.Milestone;
import com.mota.project.entity.Task;
import com.mota.project.service.CalendarEventService;
import com.mota.project.service.CalendarSubscriptionService;
import com.mota.project.service.MilestoneService;
import com.mota.project.service.TaskService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 日历事件控制器
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/calendar-events")
@RequiredArgsConstructor
public class CalendarEventController {
    
    private final CalendarEventService calendarEventService;
    private final CalendarSubscriptionService calendarSubscriptionService;
    private final TaskService taskService;
    private final MilestoneService milestoneService;
    
    /**
     * 创建事件
     */
    @PostMapping
    public Result<CalendarEvent> createEvent(
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
        return Result.success(created);
    }
    
    /**
     * 更新事件
     */
    @PutMapping("/{id}")
    public Result<CalendarEvent> updateEvent(
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
        return Result.success(updated);
    }
    
    /**
     * 删除事件
     */
    @DeleteMapping("/{id}")
    public Result<Boolean> deleteEvent(@PathVariable Long id) {
        return Result.success(calendarEventService.deleteEvent(id));
    }
    
    /**
     * 取消事件
     */
    @PostMapping("/{id}/cancel")
    public Result<Boolean> cancelEvent(@PathVariable Long id) {
        return Result.success(calendarEventService.cancelEvent(id));
    }
    
    /**
     * 获取事件详情
     */
    @GetMapping("/{id}")
    public Result<CalendarEvent> getEvent(@PathVariable Long id) {
        return Result.success(calendarEventService.getEventById(id));
    }
    
    /**
     * 获取事件详情(包含参与者)
     */
    @GetMapping("/{id}/detail")
    public Result<CalendarEvent> getEventWithAttendees(@PathVariable Long id) {
        return Result.success(calendarEventService.getEventWithAttendees(id));
    }
    
    /**
     * 获取用户的任务日历事件
     * 注意：更具体的路径必须放在通用路径之前
     * 直接从任务表获取数据并转换为日历事件格式
     */
    @GetMapping("/user/{userId}/tasks")
    public Result<List<CalendarEvent>> getUserTaskEvents(
            @PathVariable Long userId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime) {
        
        // 直接从任务表获取用户的任务
        List<Task> tasks = taskService.listByAssigneeId(userId);
        
        // 将任务转换为日历事件格式
        List<CalendarEvent> taskEvents = tasks.stream()
                .filter(task -> task.getEndDate() != null) // 只显示有截止日期的任务
                .filter(task -> {
                    // 时间范围过滤
                    if (startTime != null && task.getEndDate() != null) {
                        LocalDateTime taskEnd = task.getEndDate().atTime(LocalTime.MAX);
                        if (taskEnd.isBefore(startTime)) return false;
                    }
                    if (endTime != null && task.getStartDate() != null) {
                        LocalDateTime taskStart = task.getStartDate().atStartOfDay();
                        if (taskStart.isAfter(endTime)) return false;
                    }
                    return true;
                })
                .map(this::convertTaskToCalendarEvent)
                .collect(Collectors.toList());
        
        return Result.success(taskEvents);
    }
    
    /**
     * 获取用户的里程碑日历事件
     * 直接从里程碑表获取数据并转换为日历事件格式
     */
    @GetMapping("/user/{userId}/milestones")
    public Result<List<CalendarEvent>> getUserMilestoneEvents(
            @PathVariable Long userId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime) {
        
        // 直接从里程碑表获取用户负责的里程碑
        List<Milestone> milestones = milestoneService.getMilestonesByAssignee(userId);
        
        // 将里程碑转换为日历事件格式
        List<CalendarEvent> milestoneEvents = milestones.stream()
                .filter(milestone -> milestone.getTargetDate() != null) // 只显示有目标日期的里程碑
                .filter(milestone -> {
                    // 时间范围过滤
                    if (startTime != null && milestone.getTargetDate() != null) {
                        LocalDateTime milestoneDate = milestone.getTargetDate().atTime(LocalTime.MAX);
                        if (milestoneDate.isBefore(startTime)) return false;
                    }
                    if (endTime != null && milestone.getTargetDate() != null) {
                        LocalDateTime milestoneDate = milestone.getTargetDate().atStartOfDay();
                        if (milestoneDate.isAfter(endTime)) return false;
                    }
                    return true;
                })
                .map(this::convertMilestoneToCalendarEvent)
                .collect(Collectors.toList());
        
        return Result.success(milestoneEvents);
    }
    
    /**
     * 获取用户的所有任务和里程碑日历事件（综合视图）
     * 直接从任务表和里程碑表获取数据
     */
    @GetMapping("/user/{userId}/all-work-items")
    public Result<Map<String, Object>> getUserAllWorkItemEvents(
            @PathVariable Long userId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime) {
        
        // 直接从任务表获取用户的任务
        List<Task> tasks = taskService.listByAssigneeId(userId);
        List<CalendarEvent> taskEvents = tasks.stream()
                .filter(task -> task.getEndDate() != null)
                .filter(task -> filterByTimeRange(task.getStartDate(), task.getEndDate(), startTime, endTime))
                .map(this::convertTaskToCalendarEvent)
                .collect(Collectors.toList());
        
        // 直接从里程碑表获取用户负责的里程碑
        List<Milestone> milestones = milestoneService.getMilestonesByAssignee(userId);
        List<CalendarEvent> milestoneEvents = milestones.stream()
                .filter(milestone -> milestone.getTargetDate() != null)
                .filter(milestone -> filterByTimeRange(milestone.getTargetDate(), milestone.getTargetDate(), startTime, endTime))
                .map(this::convertMilestoneToCalendarEvent)
                .collect(Collectors.toList());
        
        // 获取用户的其他日历事件（会议等）
        List<CalendarEvent> calendarEvents = calendarEventService.getUserEvents(userId, startTime, endTime);
        List<CalendarEvent> meetingEvents = calendarEvents.stream()
                .filter(e -> "meeting".equals(e.getEventType()))
                .collect(Collectors.toList());
        
        List<CalendarEvent> otherEvents = calendarEvents.stream()
                .filter(e -> e.getTaskId() == null && e.getMilestoneId() == null
                        && !"task".equals(e.getEventType())
                        && !"milestone".equals(e.getEventType())
                        && !"meeting".equals(e.getEventType()))
                .collect(Collectors.toList());
        
        Map<String, Object> result = new HashMap<>();
        result.put("tasks", taskEvents);
        result.put("milestones", milestoneEvents);
        result.put("meetings", meetingEvents);
        result.put("others", otherEvents);
        result.put("total", taskEvents.size() + milestoneEvents.size() + meetingEvents.size() + otherEvents.size());
        
        // 统计信息
        Map<String, Integer> stats = new HashMap<>();
        stats.put("taskCount", taskEvents.size());
        stats.put("milestoneCount", milestoneEvents.size());
        stats.put("meetingCount", meetingEvents.size());
        stats.put("otherCount", otherEvents.size());
        result.put("stats", stats);
        
        return Result.success(result);
    }
    
    /**
     * 将任务转换为日历事件格式
     */
    private CalendarEvent convertTaskToCalendarEvent(Task task) {
        CalendarEvent event = new CalendarEvent();
        event.setId(task.getId()); // 使用任务ID作为事件ID
        event.setTitle(task.getName());
        event.setDescription(task.getDescription());
        event.setEventType(CalendarEvent.TYPE_TASK);
        event.setTaskId(task.getId());
        event.setProjectId(task.getProjectId());
        event.setCreatorId(task.getAssigneeId());
        
        // 设置时间
        if (task.getStartDate() != null) {
            event.setStartTime(task.getStartDate().atStartOfDay());
        } else if (task.getEndDate() != null) {
            event.setStartTime(task.getEndDate().atStartOfDay());
        } else {
            event.setStartTime(LocalDateTime.now());
        }
        
        if (task.getEndDate() != null) {
            event.setEndTime(task.getEndDate().atTime(LocalTime.MAX));
        } else {
            event.setEndTime(event.getStartTime().plusHours(1));
        }
        
        event.setAllDay(true);
        
        // 根据优先级设置颜色
        String priority = task.getPriority();
        if ("high".equals(priority) || "urgent".equals(priority)) {
            event.setColor("#ef4444"); // 红色 - 高优先级
        } else if ("medium".equals(priority)) {
            event.setColor("#f59e0b"); // 橙色 - 中优先级
        } else {
            event.setColor("#52c41a"); // 绿色 - 低优先级/默认
        }
        
        event.setStatus(CalendarEvent.STATUS_ACTIVE);
        event.setVisibility(CalendarEvent.VISIBILITY_PRIVATE);
        event.setCreatedAt(task.getCreatedAt());
        event.setUpdatedAt(task.getUpdatedAt());
        
        return event;
    }
    
    /**
     * 将里程碑转换为日历事件格式
     */
    private CalendarEvent convertMilestoneToCalendarEvent(Milestone milestone) {
        CalendarEvent event = new CalendarEvent();
        event.setId(milestone.getId()); // 使用里程碑ID作为事件ID
        event.setTitle("🎯 里程碑: " + milestone.getName());
        event.setDescription(milestone.getDescription());
        event.setEventType(CalendarEvent.TYPE_MILESTONE);
        event.setMilestoneId(milestone.getId());
        event.setProjectId(milestone.getProjectId());
        
        // 设置时间
        if (milestone.getTargetDate() != null) {
            event.setStartTime(milestone.getTargetDate().atStartOfDay());
            event.setEndTime(milestone.getTargetDate().atTime(LocalTime.MAX));
        } else {
            event.setStartTime(LocalDateTime.now());
            event.setEndTime(LocalDateTime.now().plusHours(1));
        }
        
        event.setAllDay(true);
        event.setColor("#722ed1"); // 紫色表示里程碑
        event.setStatus(CalendarEvent.STATUS_ACTIVE);
        event.setVisibility(CalendarEvent.VISIBILITY_PRIVATE);
        event.setCreatedAt(milestone.getCreatedAt());
        event.setUpdatedAt(milestone.getUpdatedAt());
        
        return event;
    }
    
    /**
     * 根据时间范围过滤
     */
    private boolean filterByTimeRange(LocalDate itemStartDate, LocalDate itemEndDate,
                                       LocalDateTime startTime, LocalDateTime endTime) {
        if (startTime != null && itemEndDate != null) {
            LocalDateTime itemEnd = itemEndDate.atTime(LocalTime.MAX);
            if (itemEnd.isBefore(startTime)) return false;
        }
        if (endTime != null && itemStartDate != null) {
            LocalDateTime itemStart = itemStartDate.atStartOfDay();
            if (itemStart.isAfter(endTime)) return false;
        }
        return true;
    }
    
    /**
     * 获取用户在指定时间范围内的所有事件
     */
    @GetMapping("/user/{userId}/range")
    public Result<List<CalendarEvent>> getUserEventsInRange(
            @PathVariable Long userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime) {
        return Result.success(calendarEventService.getUserEventsInRange(userId, startTime, endTime));
    }
    
    /**
     * 获取即将到来的事件
     */
    @GetMapping("/user/{userId}/upcoming")
    public Result<List<CalendarEvent>> getUpcomingEvents(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "60") Integer minutes) {
        return Result.success(calendarEventService.getUpcomingEvents(userId, minutes));
    }
    
    /**
     * 获取用户日历订阅URL
     */
    @GetMapping("/user/{userId}/subscription-url")
    public Result<Map<String, String>> getUserSubscriptionUrl(@PathVariable Long userId) {
        String url = calendarSubscriptionService.generateSubscriptionUrl(userId);
        Map<String, String> result = new HashMap<>();
        result.put("url", url);
        return Result.success(result);
    }
    
    /**
     * 同步用户的所有任务到日历（批量创建缺失的日历事件）
     * 注意：现在任务直接从任务表转换为日历事件，不再需要单独同步
     * 此接口保留用于兼容性，但实际上不执行任何操作
     */
    @PostMapping("/user/{userId}/sync-tasks")
    public Result<Map<String, Object>> syncUserTasksToCalendar(@PathVariable Long userId) {
        List<Task> tasks = taskService.listByAssigneeId(userId);
        
        // 任务现在直接从任务表转换为日历事件格式，不需要单独同步
        // 返回所有任务数量作为"已同步"
        Map<String, Object> result = new HashMap<>();
        result.put("synced", tasks.size());
        result.put("skipped", 0);
        result.put("total", tasks.size());
        result.put("message", "任务现在直接显示在日历中，无需单独同步");
        return Result.success(result);
    }
    
    /**
     * 查询用户日历事件（支持复杂查询条件）
     */
    @PostMapping("/user/{userId}/query")
    public Result<List<CalendarEvent>> queryUserEvents(
            @PathVariable Long userId,
            @RequestBody EventQueryRequest queryRequest) {
        LocalDateTime startTime = queryRequest.getStartTime();
        LocalDateTime endTime = queryRequest.getEndTime();
        
        List<CalendarEvent> events = calendarEventService.getUserEvents(userId, startTime, endTime);
        
        // 根据查询条件过滤
        if (queryRequest.getEventTypes() != null && !queryRequest.getEventTypes().isEmpty()) {
            events = events.stream()
                    .filter(e -> queryRequest.getEventTypes().contains(e.getEventType()))
                    .toList();
        }
        
        if (queryRequest.getProjectId() != null) {
            events = events.stream()
                    .filter(e -> queryRequest.getProjectId().equals(e.getProjectId()))
                    .toList();
        }
        
        return Result.success(events);
    }
    
    /**
     * 获取用户的事件列表（通用接口，放在最后）
     */
    @GetMapping("/user/{userId}")
    public Result<List<CalendarEvent>> getUserEvents(
            @PathVariable Long userId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime) {
        return Result.success(calendarEventService.getUserEvents(userId, startTime, endTime));
    }
    
    /**
     * 同步项目的所有里程碑到日历
     * 注意：现在里程碑直接从里程碑表转换为日历事件，不再需要单独同步
     * 此接口保留用于兼容性，但实际上不执行任何操作
     */
    @PostMapping("/project/{projectId}/sync-milestones")
    public Result<Map<String, Object>> syncProjectMilestonesToCalendar(
            @PathVariable Long projectId,
            @RequestParam Long creatorId) {
        List<Milestone> milestones = milestoneService.getByProjectId(projectId);
        
        // 里程碑现在直接从里程碑表转换为日历事件格式，不需要单独同步
        // 返回所有里程碑数量作为"已同步"
        Map<String, Object> result = new HashMap<>();
        result.put("synced", milestones.size());
        result.put("skipped", 0);
        result.put("total", milestones.size());
        result.put("message", "里程碑现在直接显示在日历中，无需单独同步");
        return Result.success(result);
    }
    
    /**
     * 获取项目的事件列表
     */
    @GetMapping("/project/{projectId}")
    public Result<List<CalendarEvent>> getProjectEvents(
            @PathVariable Long projectId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime) {
        return Result.success(calendarEventService.getProjectEvents(projectId, startTime, endTime));
    }
    
    /**
     * 获取任务关联的事件
     */
    @GetMapping("/task/{taskId}")
    public Result<List<CalendarEvent>> getEventsByTaskId(@PathVariable Long taskId) {
        return Result.success(calendarEventService.getEventsByTaskId(taskId));
    }
    
    /**
     * 获取里程碑关联的事件
     */
    @GetMapping("/milestone/{milestoneId}")
    public Result<List<CalendarEvent>> getEventsByMilestoneId(@PathVariable Long milestoneId) {
        return Result.success(calendarEventService.getEventsByMilestoneId(milestoneId));
    }
    
    /**
     * 添加参与者
     */
    @PostMapping("/{eventId}/attendees")
    public Result<Boolean> addAttendees(
            @PathVariable Long eventId,
            @RequestBody List<Long> userIds) {
        return Result.success(calendarEventService.addAttendees(eventId, userIds));
    }
    
    /**
     * 移除参与者
     */
    @DeleteMapping("/{eventId}/attendees/{userId}")
    public Result<Boolean> removeAttendee(
            @PathVariable Long eventId,
            @PathVariable Long userId) {
        return Result.success(calendarEventService.removeAttendee(eventId, userId));
    }
    
    /**
     * 更新参与者响应状态
     */
    @PutMapping("/{eventId}/attendees/{userId}/response")
    public Result<Boolean> updateAttendeeResponse(
            @PathVariable Long eventId,
            @PathVariable Long userId,
            @RequestBody Map<String, String> request) {
        String responseStatus = request.get("responseStatus");
        return Result.success(calendarEventService.updateAttendeeResponse(eventId, userId, responseStatus));
    }
    
    /**
     * 获取事件参与者列表
     */
    @GetMapping("/{eventId}/attendees")
    public Result<List<CalendarEventAttendee>> getEventAttendees(@PathVariable Long eventId) {
        return Result.success(calendarEventService.getEventAttendees(eventId));
    }
    
    /**
     * 从任务创建事件
     */
    @PostMapping("/from-task/{taskId}")
    public Result<CalendarEvent> createEventFromTask(
            @PathVariable Long taskId,
            @RequestParam Long creatorId) {
        return Result.success(calendarEventService.createEventFromTask(taskId, creatorId));
    }
    
    /**
     * 从里程碑创建事件
     */
    @PostMapping("/from-milestone/{milestoneId}")
    public Result<CalendarEvent> createEventFromMilestone(
            @PathVariable Long milestoneId,
            @RequestParam Long creatorId) {
        return Result.success(calendarEventService.createEventFromMilestone(milestoneId, creatorId));
    }
    
    /**
     * 批量删除事件
     */
    @DeleteMapping("/batch")
    public Result<Boolean> deleteEvents(@RequestBody List<Long> ids) {
        return Result.success(calendarEventService.deleteEvents(ids));
    }
    
    
    /**
     * 事件查询请求DTO
     */
    @lombok.Data
    public static class EventQueryRequest {
        private LocalDateTime startTime;
        private LocalDateTime endTime;
        private List<String> eventTypes;
        private Long projectId;
        private Long taskId;
        private Boolean includeRecurring;
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