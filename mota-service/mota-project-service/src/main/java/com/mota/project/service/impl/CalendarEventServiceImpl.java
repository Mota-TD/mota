package com.mota.project.service.impl;

import com.mota.project.entity.CalendarEvent;
import com.mota.project.entity.CalendarEventAttendee;
import com.mota.project.entity.Task;
import com.mota.project.entity.Milestone;
import com.mota.project.mapper.CalendarEventMapper;
import com.mota.project.mapper.CalendarEventAttendeeMapper;
import com.mota.project.mapper.TaskMapper;
import com.mota.project.mapper.MilestoneMapper;
import com.mota.project.service.CalendarEventService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 日历事件服务实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CalendarEventServiceImpl implements CalendarEventService {
    
    private final CalendarEventMapper calendarEventMapper;
    private final CalendarEventAttendeeMapper attendeeMapper;
    private final TaskMapper taskMapper;
    private final MilestoneMapper milestoneMapper;
    
    @Override
    @Transactional
    public CalendarEvent createEvent(CalendarEvent event, List<Long> attendeeIds) {
        // 设置默认值
        if (event.getStatus() == null) {
            event.setStatus(CalendarEvent.STATUS_ACTIVE);
        }
        if (event.getVisibility() == null) {
            event.setVisibility(CalendarEvent.VISIBILITY_PRIVATE);
        }
        if (event.getRecurrenceRule() == null) {
            event.setRecurrenceRule(CalendarEvent.RECURRENCE_NONE);
        }
        if (event.getAllDay() == null) {
            event.setAllDay(false);
        }
        
        event.setCreatedAt(LocalDateTime.now());
        event.setUpdatedAt(LocalDateTime.now());
        
        calendarEventMapper.insert(event);
        
        // 添加参与者
        if (attendeeIds != null && !attendeeIds.isEmpty()) {
            addAttendeesInternal(event.getId(), attendeeIds);
        }
        
        log.info("Created calendar event: id={}, title={}", event.getId(), event.getTitle());
        return event;
    }
    
    @Override
    @Transactional
    public CalendarEvent updateEvent(Long id, CalendarEvent event, List<Long> attendeeIds) {
        CalendarEvent existing = calendarEventMapper.selectById(id);
        if (existing == null) {
            throw new RuntimeException("Event not found: " + id);
        }
        
        // 更新字段
        if (event.getTitle() != null) existing.setTitle(event.getTitle());
        if (event.getDescription() != null) existing.setDescription(event.getDescription());
        if (event.getEventType() != null) existing.setEventType(event.getEventType());
        if (event.getStartTime() != null) existing.setStartTime(event.getStartTime());
        if (event.getEndTime() != null) existing.setEndTime(event.getEndTime());
        if (event.getAllDay() != null) existing.setAllDay(event.getAllDay());
        if (event.getLocation() != null) existing.setLocation(event.getLocation());
        if (event.getColor() != null) existing.setColor(event.getColor());
        if (event.getRecurrenceRule() != null) existing.setRecurrenceRule(event.getRecurrenceRule());
        if (event.getRecurrenceEndDate() != null) existing.setRecurrenceEndDate(event.getRecurrenceEndDate());
        if (event.getReminderMinutes() != null) existing.setReminderMinutes(event.getReminderMinutes());
        if (event.getVisibility() != null) existing.setVisibility(event.getVisibility());
        
        existing.setUpdatedAt(LocalDateTime.now());
        calendarEventMapper.updateById(existing);
        
        // 更新参与者
        if (attendeeIds != null) {
            attendeeMapper.deleteByEventId(id);
            if (!attendeeIds.isEmpty()) {
                addAttendeesInternal(id, attendeeIds);
            }
        }
        
        log.info("Updated calendar event: id={}", id);
        return existing;
    }
    
    @Override
    @Transactional
    public boolean deleteEvent(Long id) {
        attendeeMapper.deleteByEventId(id);
        int result = calendarEventMapper.deleteById(id);
        log.info("Deleted calendar event: id={}", id);
        return result > 0;
    }
    
    @Override
    public boolean cancelEvent(Long id) {
        int result = calendarEventMapper.cancelEvent(id);
        log.info("Cancelled calendar event: id={}", id);
        return result > 0;
    }
    
    @Override
    public CalendarEvent getEventById(Long id) {
        return calendarEventMapper.selectById(id);
    }
    
    @Override
    public CalendarEvent getEventWithAttendees(Long id) {
        return calendarEventMapper.selectWithAttendees(id);
    }
    
    @Override
    public List<CalendarEvent> getUserEvents(Long userId, LocalDateTime startTime, LocalDateTime endTime) {
        return calendarEventMapper.selectByUserId(userId, startTime, endTime);
    }
    
    @Override
    public List<CalendarEvent> getProjectEvents(Long projectId, LocalDateTime startTime, LocalDateTime endTime) {
        return calendarEventMapper.selectByProjectId(projectId, startTime, endTime);
    }
    
    @Override
    public List<CalendarEvent> getUserEventsInRange(Long userId, LocalDateTime startTime, LocalDateTime endTime) {
        return calendarEventMapper.selectUserEventsInRange(userId, startTime, endTime);
    }
    
    @Override
    public List<CalendarEvent> getUpcomingEvents(Long userId, Integer minutes) {
        return calendarEventMapper.selectUpcomingEvents(userId, minutes);
    }
    
    @Override
    public List<CalendarEvent> getEventsByTaskId(Long taskId) {
        return calendarEventMapper.selectByTaskId(taskId);
    }
    
    @Override
    public List<CalendarEvent> getEventsByMilestoneId(Long milestoneId) {
        return calendarEventMapper.selectByMilestoneId(milestoneId);
    }
    
    @Override
    @Transactional
    public boolean addAttendees(Long eventId, List<Long> userIds) {
        if (userIds == null || userIds.isEmpty()) {
            return true;
        }
        addAttendeesInternal(eventId, userIds);
        return true;
    }
    
    private void addAttendeesInternal(Long eventId, List<Long> userIds) {
        List<CalendarEventAttendee> attendees = userIds.stream()
            .map(userId -> {
                CalendarEventAttendee attendee = new CalendarEventAttendee();
                attendee.setEventId(eventId);
                attendee.setUserId(userId);
                attendee.setResponseStatus(CalendarEventAttendee.RESPONSE_PENDING);
                attendee.setRequired(true);
                return attendee;
            })
            .collect(Collectors.toList());
        
        attendeeMapper.batchInsert(attendees);
    }
    
    @Override
    @Transactional
    public boolean removeAttendee(Long eventId, Long userId) {
        // 使用MyBatis-Plus的条件删除
        return attendeeMapper.delete(
            new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<CalendarEventAttendee>()
                .eq("event_id", eventId)
                .eq("user_id", userId)
        ) > 0;
    }
    
    @Override
    public boolean updateAttendeeResponse(Long eventId, Long userId, String responseStatus) {
        return attendeeMapper.updateResponseStatus(eventId, userId, responseStatus) > 0;
    }
    
    @Override
    public List<CalendarEventAttendee> getEventAttendees(Long eventId) {
        return attendeeMapper.selectByEventId(eventId);
    }
    
    @Override
    public boolean canAccessEvent(Long eventId, Long userId) {
        CalendarEvent event = calendarEventMapper.selectById(eventId);
        if (event == null) {
            return false;
        }
        
        // 创建者可以访问
        if (event.getCreatorId().equals(userId)) {
            return true;
        }
        
        // 公开事件所有人可以访问
        if (CalendarEvent.VISIBILITY_PUBLIC.equals(event.getVisibility())) {
            return true;
        }
        
        // 参与者可以访问
        if (attendeeMapper.isAttendee(eventId, userId)) {
            return true;
        }
        
        // TODO: 项目成员可以访问项目事件
        
        return false;
    }
    
    @Override
    @Transactional
    public CalendarEvent createEventFromTask(Long taskId, Long creatorId) {
        Task task = taskMapper.selectById(taskId);
        if (task == null) {
            throw new RuntimeException("Task not found: " + taskId);
        }
        
        CalendarEvent event = new CalendarEvent();
        event.setTitle(task.getName());
        event.setDescription(task.getDescription());
        event.setEventType(CalendarEvent.TYPE_TASK);
        event.setCreatorId(creatorId);
        event.setProjectId(task.getProjectId());
        event.setTaskId(taskId);
        
        // 设置时间
        if (task.getStartDate() != null) {
            event.setStartTime(task.getStartDate().atStartOfDay());
        } else {
            event.setStartTime(LocalDateTime.now());
        }
        
        if (task.getEndDate() != null) {
            event.setEndTime(task.getEndDate().atTime(LocalTime.MAX));
        } else {
            event.setEndTime(event.getStartTime().plusHours(1));
        }
        
        event.setAllDay(true);
        event.setReminderMinutes(1440); // 提前1天提醒
        
        // 添加任务执行人为参与者
        List<Long> attendeeIds = new ArrayList<>();
        if (task.getAssigneeId() != null) {
            attendeeIds.add(task.getAssigneeId());
        }
        
        return createEvent(event, attendeeIds);
    }
    
    @Override
    @Transactional
    public CalendarEvent createEventFromMilestone(Long milestoneId, Long creatorId) {
        Milestone milestone = milestoneMapper.selectById(milestoneId);
        if (milestone == null) {
            throw new RuntimeException("Milestone not found: " + milestoneId);
        }
        
        CalendarEvent event = new CalendarEvent();
        event.setTitle("里程碑: " + milestone.getName());
        event.setDescription(milestone.getDescription());
        event.setEventType(CalendarEvent.TYPE_MILESTONE);
        event.setCreatorId(creatorId);
        event.setProjectId(milestone.getProjectId());
        event.setMilestoneId(milestoneId);
        
        // 里程碑使用目标日期
        if (milestone.getTargetDate() != null) {
            event.setStartTime(milestone.getTargetDate().atStartOfDay());
            event.setEndTime(milestone.getTargetDate().atTime(LocalTime.MAX));
        } else {
            event.setStartTime(LocalDateTime.now());
            event.setEndTime(LocalDateTime.now().plusHours(1));
        }
        
        event.setAllDay(true);
        event.setColor("#722ed1"); // 紫色表示里程碑
        event.setReminderMinutes(1440); // 提前1天提醒
        
        return createEvent(event, null);
    }
    
    @Override
    @Transactional
    public boolean deleteEvents(List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return true;
        }
        
        // 删除所有参与者
        for (Long id : ids) {
            attendeeMapper.deleteByEventId(id);
        }
        
        // 批量删除事件
        return calendarEventMapper.deleteByIds(ids) > 0;
    }
}