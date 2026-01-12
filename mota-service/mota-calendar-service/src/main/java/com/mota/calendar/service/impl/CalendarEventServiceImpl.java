package com.mota.calendar.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.mota.calendar.entity.CalendarEvent;
import com.mota.calendar.entity.CalendarEventAttendee;
import com.mota.calendar.mapper.CalendarEventMapper;
import com.mota.calendar.mapper.CalendarEventAttendeeMapper;
import com.mota.calendar.service.CalendarEventService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 日历事件服务实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CalendarEventServiceImpl extends ServiceImpl<CalendarEventMapper, CalendarEvent> implements CalendarEventService {
    
    private final CalendarEventAttendeeMapper attendeeMapper;
    
    @Override
    @Transactional
    public CalendarEvent createEvent(CalendarEvent event, List<Long> attendeeIds) {
        event.setStatus(CalendarEvent.STATUS_ACTIVE);
        event.setCreatedAt(LocalDateTime.now());
        event.setUpdatedAt(LocalDateTime.now());
        baseMapper.insert(event);
        
        // 添加参与者
        if (attendeeIds != null && !attendeeIds.isEmpty()) {
            addAttendees(event.getId(), attendeeIds);
        }
        
        log.info("创建日历事件成功: id={}, title={}", event.getId(), event.getTitle());
        return event;
    }
    
    @Override
    @Transactional
    public CalendarEvent createEvent(CalendarEvent event) {
        return createEvent(event, null);
    }
    
    @Override
    @Transactional
    public CalendarEvent updateEvent(Long id, CalendarEvent event, List<Long> attendeeIds) {
        CalendarEvent existing = baseMapper.selectById(id);
        if (existing == null) {
            throw new RuntimeException("事件不存在: " + id);
        }
        
        event.setId(id);
        event.setUpdatedAt(LocalDateTime.now());
        baseMapper.updateById(event);
        
        // 更新参与者
        if (attendeeIds != null) {
            attendeeMapper.deleteByEventId(id);
            if (!attendeeIds.isEmpty()) {
                addAttendees(id, attendeeIds);
            }
        }
        
        log.info("更新日历事件成功: id={}", id);
        return baseMapper.selectById(id);
    }
    
    @Override
    @Transactional
    public CalendarEvent updateEvent(CalendarEvent event) {
        event.setUpdatedAt(LocalDateTime.now());
        baseMapper.updateById(event);
        log.info("更新日历事件成功: id={}", event.getId());
        return baseMapper.selectById(event.getId());
    }
    
    @Override
    @Transactional
    public boolean deleteEvent(Long id) {
        attendeeMapper.deleteByEventId(id);
        int result = baseMapper.deleteById(id);
        log.info("删除日历事件: id={}, result={}", id, result > 0);
        return result > 0;
    }
    
    @Override
    public boolean cancelEvent(Long id) {
        CalendarEvent event = baseMapper.selectById(id);
        if (event == null) {
            return false;
        }
        event.setStatus(CalendarEvent.STATUS_CANCELLED);
        event.setUpdatedAt(LocalDateTime.now());
        int result = baseMapper.updateById(event);
        log.info("取消日历事件: id={}, result={}", id, result > 0);
        return result > 0;
    }
    
    @Override
    public CalendarEvent getEventById(Long id) {
        return baseMapper.selectById(id);
    }
    
    @Override
    public CalendarEvent getEventWithAttendees(Long id) {
        CalendarEvent event = baseMapper.selectById(id);
        if (event != null) {
            List<CalendarEventAttendee> attendees = attendeeMapper.findByEventId(id);
            event.setAttendees(attendees);
        }
        return event;
    }
    
    @Override
    public List<CalendarEvent> getUserEvents(Long userId, LocalDateTime startTime, LocalDateTime endTime) {
        return baseMapper.findByUserIdAndTimeRange(userId, startTime, endTime);
    }
    
    @Override
    public List<CalendarEvent> getProjectEvents(Long projectId, LocalDateTime startTime, LocalDateTime endTime) {
        return baseMapper.findByProjectIdAndTimeRange(projectId, startTime, endTime);
    }
    
    @Override
    public List<CalendarEvent> getUserEventsInRange(Long userId, LocalDateTime startTime, LocalDateTime endTime) {
        // 获取用户创建的事件
        List<CalendarEvent> createdEvents = baseMapper.findByUserIdAndTimeRange(userId, startTime, endTime);
        
        // 获取用户参与的事件
        List<Long> participatingEventIds = attendeeMapper.findEventIdsByUserId(userId);
        List<CalendarEvent> participatingEvents = new ArrayList<>();
        
        if (!participatingEventIds.isEmpty()) {
            LambdaQueryWrapper<CalendarEvent> wrapper = new LambdaQueryWrapper<>();
            wrapper.in(CalendarEvent::getId, participatingEventIds)
                   .ge(CalendarEvent::getStartTime, startTime)
                   .le(CalendarEvent::getEndTime, endTime)
                   .eq(CalendarEvent::getStatus, CalendarEvent.STATUS_ACTIVE);
            participatingEvents = baseMapper.selectList(wrapper);
        }
        
        // 合并并去重
        List<CalendarEvent> allEvents = new ArrayList<>(createdEvents);
        for (CalendarEvent event : participatingEvents) {
            if (allEvents.stream().noneMatch(e -> e.getId().equals(event.getId()))) {
                allEvents.add(event);
            }
        }
        
        // 按开始时间排序
        allEvents.sort((a, b) -> a.getStartTime().compareTo(b.getStartTime()));
        return allEvents;
    }
    
    @Override
    public List<CalendarEvent> getUpcomingEvents(Long userId, Integer minutes) {
        return baseMapper.findUpcomingEvents(userId, minutes);
    }
    
    @Override
    public List<CalendarEvent> getEventsByTaskId(Long taskId) {
        return baseMapper.findByTaskId(taskId);
    }
    
    @Override
    public CalendarEvent getByTaskId(Long taskId) {
        LambdaQueryWrapper<CalendarEvent> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(CalendarEvent::getTaskId, taskId)
               .eq(CalendarEvent::getStatus, CalendarEvent.STATUS_ACTIVE)
               .last("LIMIT 1");
        return baseMapper.selectOne(wrapper);
    }
    
    @Override
    public List<CalendarEvent> getEventsByMilestoneId(Long milestoneId) {
        return baseMapper.findByMilestoneId(milestoneId);
    }
    
    @Override
    public CalendarEvent getByMilestoneId(Long milestoneId) {
        LambdaQueryWrapper<CalendarEvent> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(CalendarEvent::getMilestoneId, milestoneId)
               .eq(CalendarEvent::getStatus, CalendarEvent.STATUS_ACTIVE)
               .last("LIMIT 1");
        return baseMapper.selectOne(wrapper);
    }
    
    @Override
    public CalendarEvent getByMeetingId(Long meetingId) {
        LambdaQueryWrapper<CalendarEvent> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(CalendarEvent::getMeetingId, meetingId)
               .eq(CalendarEvent::getStatus, CalendarEvent.STATUS_ACTIVE)
               .last("LIMIT 1");
        return baseMapper.selectOne(wrapper);
    }
    
    @Override
    public List<CalendarEvent> getCalendarEvents(Long calendarId, LocalDateTime startTime, LocalDateTime endTime) {
        LambdaQueryWrapper<CalendarEvent> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(CalendarEvent::getCalendarId, calendarId)
               .ge(CalendarEvent::getStartTime, startTime)
               .le(CalendarEvent::getEndTime, endTime)
               .eq(CalendarEvent::getStatus, CalendarEvent.STATUS_ACTIVE)
               .orderByAsc(CalendarEvent::getStartTime);
        return baseMapper.selectList(wrapper);
    }
    
    @Override
    @Transactional
    public boolean addAttendees(Long eventId, List<Long> userIds) {
        for (Long userId : userIds) {
            CalendarEventAttendee attendee = new CalendarEventAttendee();
            attendee.setEventId(eventId);
            attendee.setUserId(userId);
            attendee.setStatus(CalendarEventAttendee.STATUS_PENDING);
            attendee.setIsOptional(true);
            attendee.setCreatedAt(LocalDateTime.now());
            attendeeMapper.insert(attendee);
        }
        log.info("添加事件参与者: eventId={}, userIds={}", eventId, userIds);
        return true;
    }
    
    @Override
    public boolean removeAttendee(Long eventId, Long userId) {
        LambdaQueryWrapper<CalendarEventAttendee> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(CalendarEventAttendee::getEventId, eventId)
               .eq(CalendarEventAttendee::getUserId, userId);
        int result = attendeeMapper.delete(wrapper);
        log.info("移除事件参与者: eventId={}, userId={}, result={}", eventId, userId, result > 0);
        return result > 0;
    }
    
    @Override
    public boolean updateAttendeeResponse(Long eventId, Long userId, String responseStatus) {
        CalendarEventAttendee attendee = attendeeMapper.findByEventIdAndUserId(eventId, userId);
        if (attendee == null) {
            return false;
        }
        attendee.setStatus(responseStatus);
        attendee.setResponseTime(LocalDateTime.now());
        int result = attendeeMapper.updateById(attendee);
        log.info("更新参与者响应: eventId={}, userId={}, status={}", eventId, userId, responseStatus);
        return result > 0;
    }
    
    @Override
    public List<CalendarEventAttendee> getEventAttendees(Long eventId) {
        return attendeeMapper.findByEventId(eventId);
    }
    
    @Override
    public boolean canAccessEvent(Long eventId, Long userId) {
        CalendarEvent event = baseMapper.selectById(eventId);
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
        CalendarEventAttendee attendee = attendeeMapper.findByEventIdAndUserId(eventId, userId);
        return attendee != null;
    }
    
    @Override
    @Transactional
    public boolean deleteEvents(List<Long> ids) {
        for (Long id : ids) {
            attendeeMapper.deleteByEventId(id);
        }
        int result = baseMapper.deleteBatchIds(ids);
        log.info("批量删除日历事件: ids={}, result={}", ids, result);
        return result > 0;
    }
}