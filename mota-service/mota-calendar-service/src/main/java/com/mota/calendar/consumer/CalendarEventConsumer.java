package com.mota.calendar.consumer;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mota.calendar.entity.Calendar;
import com.mota.calendar.entity.CalendarEvent;
import com.mota.calendar.service.CalendarEventService;
import com.mota.calendar.service.CalendarService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * 日历事件消费者
 * 监听任务、项目、里程碑等事件，自动创建日历事件
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class CalendarEventConsumer {

    private final CalendarService calendarService;
    private final CalendarEventService calendarEventService;
    private final ObjectMapper objectMapper;

    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    /**
     * 监听任务事件
     */
    @KafkaListener(topics = "task-events", groupId = "calendar-service")
    public void handleTaskEvent(String message) {
        try {
            JsonNode event = objectMapper.readTree(message);
            String eventType = event.get("type").asText();
            JsonNode data = event.get("data");
            
            switch (eventType) {
                case "task.created":
                    handleTaskCreated(data);
                    break;
                case "task.updated":
                    handleTaskUpdated(data);
                    break;
                case "task.deleted":
                    handleTaskDeleted(data);
                    break;
                case "task.deadline_changed":
                    handleTaskDeadlineChanged(data);
                    break;
                default:
                    log.debug("忽略任务事件类型: {}", eventType);
            }
        } catch (Exception e) {
            log.error("处理任务事件失败: {}", message, e);
        }
    }

    /**
     * 监听项目事件
     */
    @KafkaListener(topics = "project-events", groupId = "calendar-service")
    public void handleProjectEvent(String message) {
        try {
            JsonNode event = objectMapper.readTree(message);
            String eventType = event.get("type").asText();
            JsonNode data = event.get("data");
            
            switch (eventType) {
                case "project.created":
                    handleProjectCreated(data);
                    break;
                case "project.updated":
                    handleProjectUpdated(data);
                    break;
                case "project.deleted":
                    handleProjectDeleted(data);
                    break;
                default:
                    log.debug("忽略项目事件类型: {}", eventType);
            }
        } catch (Exception e) {
            log.error("处理项目事件失败: {}", message, e);
        }
    }

    /**
     * 监听里程碑事件
     */
    @KafkaListener(topics = "milestone-events", groupId = "calendar-service")
    public void handleMilestoneEvent(String message) {
        try {
            JsonNode event = objectMapper.readTree(message);
            String eventType = event.get("type").asText();
            JsonNode data = event.get("data");
            
            switch (eventType) {
                case "milestone.created":
                    handleMilestoneCreated(data);
                    break;
                case "milestone.updated":
                    handleMilestoneUpdated(data);
                    break;
                case "milestone.deleted":
                    handleMilestoneDeleted(data);
                    break;
                default:
                    log.debug("忽略里程碑事件类型: {}", eventType);
            }
        } catch (Exception e) {
            log.error("处理里程碑事件失败: {}", message, e);
        }
    }

    /**
     * 监听会议事件
     */
    @KafkaListener(topics = "meeting-events", groupId = "calendar-service")
    public void handleMeetingEvent(String message) {
        try {
            JsonNode event = objectMapper.readTree(message);
            String eventType = event.get("type").asText();
            JsonNode data = event.get("data");
            
            switch (eventType) {
                case "meeting.scheduled":
                    handleMeetingScheduled(data);
                    break;
                case "meeting.updated":
                    handleMeetingUpdated(data);
                    break;
                case "meeting.cancelled":
                    handleMeetingCancelled(data);
                    break;
                default:
                    log.debug("忽略会议事件类型: {}", eventType);
            }
        } catch (Exception e) {
            log.error("处理会议事件失败: {}", message, e);
        }
    }

    // ==================== 任务事件处理 ====================

    private void handleTaskCreated(JsonNode data) {
        Long taskId = data.get("id").asLong();
        Long tenantId = data.get("tenantId").asLong();
        Long projectId = data.get("projectId").asLong();
        Long assigneeId = data.has("assigneeId") ? data.get("assigneeId").asLong() : null;
        String title = data.get("title").asText();
        String dueDate = data.has("dueDate") ? data.get("dueDate").asText() : null;
        
        if (dueDate == null || assigneeId == null) {
            return; // 没有截止日期或负责人，不创建日历事件
        }
        
        // 获取或创建项目日历
        Calendar projectCalendar = calendarService.getProjectCalendar(projectId, tenantId);
        if (projectCalendar == null) {
            String projectName = data.has("projectName") ? data.get("projectName").asText() : "项目";
            projectCalendar = calendarService.createProjectCalendar(projectId, projectName, tenantId, assigneeId);
        }
        
        // 创建任务截止日期事件
        CalendarEvent calendarEvent = new CalendarEvent();
        calendarEvent.setTenantId(tenantId);
        calendarEvent.setCalendarId(projectCalendar.getId());
        calendarEvent.setTitle("任务截止: " + title);
        calendarEvent.setEventType("deadline");
        calendarEvent.setCategory("work");
        calendarEvent.setStartTime(LocalDateTime.parse(dueDate, DATE_TIME_FORMATTER));
        calendarEvent.setEndTime(LocalDateTime.parse(dueDate, DATE_TIME_FORMATTER));
        calendarEvent.setAllDay(true);
        calendarEvent.setCreatorId(assigneeId);
        calendarEvent.setProjectId(projectId);
        calendarEvent.setTaskId(taskId);
        
        calendarEventService.createEvent(calendarEvent);
        log.info("为任务创建日历事件成功: taskId={}", taskId);
    }

    private void handleTaskUpdated(JsonNode data) {
        Long taskId = data.get("id").asLong();
        
        // 查找关联的日历事件并更新
        CalendarEvent existingEvent = calendarEventService.getByTaskId(taskId);
        if (existingEvent != null) {
            String title = data.get("title").asText();
            String dueDate = data.has("dueDate") ? data.get("dueDate").asText() : null;
            
            existingEvent.setTitle("任务截止: " + title);
            if (dueDate != null) {
                existingEvent.setStartTime(LocalDateTime.parse(dueDate, DATE_TIME_FORMATTER));
                existingEvent.setEndTime(LocalDateTime.parse(dueDate, DATE_TIME_FORMATTER));
            }
            
            calendarEventService.updateEvent(existingEvent);
            log.info("更新任务日历事件成功: taskId={}", taskId);
        }
    }

    private void handleTaskDeleted(JsonNode data) {
        Long taskId = data.get("id").asLong();
        
        CalendarEvent existingEvent = calendarEventService.getByTaskId(taskId);
        if (existingEvent != null) {
            calendarEventService.deleteEvent(existingEvent.getId());
            log.info("删除任务日历事件成功: taskId={}", taskId);
        }
    }

    private void handleTaskDeadlineChanged(JsonNode data) {
        handleTaskUpdated(data);
    }

    // ==================== 项目事件处理 ====================

    private void handleProjectCreated(JsonNode data) {
        Long projectId = data.get("id").asLong();
        Long tenantId = data.get("tenantId").asLong();
        Long creatorId = data.get("creatorId").asLong();
        String projectName = data.get("name").asText();
        
        // 创建项目日历
        calendarService.createProjectCalendar(projectId, projectName, tenantId, creatorId);
        log.info("为项目创建日历成功: projectId={}", projectId);
    }

    private void handleProjectUpdated(JsonNode data) {
        Long projectId = data.get("id").asLong();
        Long tenantId = data.get("tenantId").asLong();
        String projectName = data.get("name").asText();
        
        Calendar projectCalendar = calendarService.getProjectCalendar(projectId, tenantId);
        if (projectCalendar != null) {
            projectCalendar.setName(projectName + " - 项目日历");
            calendarService.updateCalendar(projectCalendar);
            log.info("更新项目日历成功: projectId={}", projectId);
        }
    }

    private void handleProjectDeleted(JsonNode data) {
        Long projectId = data.get("id").asLong();
        Long tenantId = data.get("tenantId").asLong();
        
        Calendar projectCalendar = calendarService.getProjectCalendar(projectId, tenantId);
        if (projectCalendar != null) {
            calendarService.deleteCalendar(projectCalendar.getId());
            log.info("删除项目日历成功: projectId={}", projectId);
        }
    }

    // ==================== 里程碑事件处理 ====================

    private void handleMilestoneCreated(JsonNode data) {
        Long milestoneId = data.get("id").asLong();
        Long tenantId = data.get("tenantId").asLong();
        Long projectId = data.get("projectId").asLong();
        Long creatorId = data.get("creatorId").asLong();
        String title = data.get("title").asText();
        String dueDate = data.get("dueDate").asText();
        
        // 获取项目日历
        Calendar projectCalendar = calendarService.getProjectCalendar(projectId, tenantId);
        if (projectCalendar == null) {
            return;
        }
        
        // 创建里程碑事件
        CalendarEvent calendarEvent = new CalendarEvent();
        calendarEvent.setTenantId(tenantId);
        calendarEvent.setCalendarId(projectCalendar.getId());
        calendarEvent.setTitle("里程碑: " + title);
        calendarEvent.setEventType("milestone");
        calendarEvent.setCategory("work");
        calendarEvent.setStartTime(LocalDateTime.parse(dueDate, DATE_TIME_FORMATTER));
        calendarEvent.setEndTime(LocalDateTime.parse(dueDate, DATE_TIME_FORMATTER));
        calendarEvent.setAllDay(true);
        calendarEvent.setCreatorId(creatorId);
        calendarEvent.setProjectId(projectId);
        calendarEvent.setMilestoneId(milestoneId);
        
        calendarEventService.createEvent(calendarEvent);
        log.info("为里程碑创建日历事件成功: milestoneId={}", milestoneId);
    }

    private void handleMilestoneUpdated(JsonNode data) {
        Long milestoneId = data.get("id").asLong();
        
        CalendarEvent existingEvent = calendarEventService.getByMilestoneId(milestoneId);
        if (existingEvent != null) {
            String title = data.get("title").asText();
            String dueDate = data.get("dueDate").asText();
            
            existingEvent.setTitle("里程碑: " + title);
            existingEvent.setStartTime(LocalDateTime.parse(dueDate, DATE_TIME_FORMATTER));
            existingEvent.setEndTime(LocalDateTime.parse(dueDate, DATE_TIME_FORMATTER));
            
            calendarEventService.updateEvent(existingEvent);
            log.info("更新里程碑日历事件成功: milestoneId={}", milestoneId);
        }
    }

    private void handleMilestoneDeleted(JsonNode data) {
        Long milestoneId = data.get("id").asLong();
        
        CalendarEvent existingEvent = calendarEventService.getByMilestoneId(milestoneId);
        if (existingEvent != null) {
            calendarEventService.deleteEvent(existingEvent.getId());
            log.info("删除里程碑日历事件成功: milestoneId={}", milestoneId);
        }
    }

    // ==================== 会议事件处理 ====================

    private void handleMeetingScheduled(JsonNode data) {
        Long meetingId = data.get("id").asLong();
        Long tenantId = data.get("tenantId").asLong();
        Long organizerId = data.get("organizerId").asLong();
        String title = data.get("title").asText();
        String startTime = data.get("startTime").asText();
        String endTime = data.get("endTime").asText();
        String meetingUrl = data.has("meetingUrl") ? data.get("meetingUrl").asText() : null;
        String location = data.has("location") ? data.get("location").asText() : null;
        
        // 获取组织者的默认日历
        Calendar calendar = calendarService.getDefaultCalendar(organizerId, tenantId);
        
        // 创建会议事件
        CalendarEvent calendarEvent = new CalendarEvent();
        calendarEvent.setTenantId(tenantId);
        calendarEvent.setCalendarId(calendar.getId());
        calendarEvent.setTitle(title);
        calendarEvent.setEventType("meeting");
        calendarEvent.setCategory("work");
        calendarEvent.setStartTime(LocalDateTime.parse(startTime, DATE_TIME_FORMATTER));
        calendarEvent.setEndTime(LocalDateTime.parse(endTime, DATE_TIME_FORMATTER));
        calendarEvent.setAllDay(false);
        calendarEvent.setCreatorId(organizerId);
        calendarEvent.setLocation(location);
        calendarEvent.setMeetingUrl(meetingUrl);
        calendarEvent.setMeetingId(meetingId);
        calendarEvent.setBusyStatus("busy");
        
        calendarEventService.createEvent(calendarEvent);
        log.info("为会议创建日历事件成功: meetingId={}", meetingId);
    }

    private void handleMeetingUpdated(JsonNode data) {
        Long meetingId = data.get("id").asLong();
        
        CalendarEvent existingEvent = calendarEventService.getByMeetingId(meetingId);
        if (existingEvent != null) {
            String title = data.get("title").asText();
            String startTime = data.get("startTime").asText();
            String endTime = data.get("endTime").asText();
            String meetingUrl = data.has("meetingUrl") ? data.get("meetingUrl").asText() : null;
            String location = data.has("location") ? data.get("location").asText() : null;
            
            existingEvent.setTitle(title);
            existingEvent.setStartTime(LocalDateTime.parse(startTime, DATE_TIME_FORMATTER));
            existingEvent.setEndTime(LocalDateTime.parse(endTime, DATE_TIME_FORMATTER));
            existingEvent.setMeetingUrl(meetingUrl);
            existingEvent.setLocation(location);
            
            calendarEventService.updateEvent(existingEvent);
            log.info("更新会议日历事件成功: meetingId={}", meetingId);
        }
    }

    private void handleMeetingCancelled(JsonNode data) {
        Long meetingId = data.get("id").asLong();
        
        CalendarEvent existingEvent = calendarEventService.getByMeetingId(meetingId);
        if (existingEvent != null) {
            existingEvent.setStatus("cancelled");
            calendarEventService.updateEvent(existingEvent);
            log.info("取消会议日历事件成功: meetingId={}", meetingId);
        }
    }
}