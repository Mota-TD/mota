package com.mota.calendar.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.mota.calendar.entity.CalendarEvent;
import com.mota.calendar.entity.EventReminder;
import com.mota.calendar.mapper.EventReminderMapper;
import com.mota.calendar.service.CalendarEventService;
import com.mota.calendar.service.EventReminderService;
import com.mota.common.core.exception.BusinessException;
import com.mota.common.feign.client.NotifyServiceClient;
import com.mota.common.feign.dto.NotificationDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * 事件提醒服务实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class EventReminderServiceImpl extends ServiceImpl<EventReminderMapper, EventReminder> implements EventReminderService {

    @Lazy
    private final CalendarEventService calendarEventService;
    private final NotifyServiceClient notifyServiceClient;

    @Override
    @Transactional
    public EventReminder createReminder(EventReminder reminder) {
        CalendarEvent event = calendarEventService.getById(reminder.getEventId());
        if (event == null) {
            throw new BusinessException("事件不存在");
        }
        
        // 计算提醒时间
        LocalDateTime remindTime = calculateRemindTime(event.getStartTime(), reminder.getReminderMinutes());
        reminder.setRemindTime(remindTime);
        reminder.setStatus("pending");
        reminder.setCreateTime(LocalDateTime.now());
        reminder.setUpdateTime(LocalDateTime.now());
        
        save(reminder);
        log.info("创建提醒成功: id={}, eventId={}", reminder.getId(), reminder.getEventId());
        return reminder;
    }

    @Override
    @Transactional
    public List<EventReminder> createReminders(Long eventId, List<EventReminder> reminders) {
        CalendarEvent event = calendarEventService.getById(eventId);
        if (event == null) {
            throw new BusinessException("事件不存在");
        }
        
        List<EventReminder> createdReminders = new ArrayList<>();
        for (EventReminder reminder : reminders) {
            reminder.setEventId(eventId);
            reminder.setUserId(event.getCreatorId());
            
            LocalDateTime remindTime = calculateRemindTime(event.getStartTime(), reminder.getReminderMinutes());
            reminder.setRemindTime(remindTime);
            reminder.setStatus("pending");
            reminder.setCreateTime(LocalDateTime.now());
            reminder.setUpdateTime(LocalDateTime.now());
            
            save(reminder);
            createdReminders.add(reminder);
        }
        
        log.info("批量创建提醒成功: eventId={}, count={}", eventId, createdReminders.size());
        return createdReminders;
    }

    @Override
    @Transactional
    public EventReminder updateReminder(EventReminder reminder) {
        EventReminder existing = getById(reminder.getId());
        if (existing == null) {
            throw new BusinessException("提醒不存在");
        }
        
        // 如果提醒时间变化，重新计算
        if (reminder.getReminderMinutes() != null && 
            !reminder.getReminderMinutes().equals(existing.getReminderMinutes())) {
            CalendarEvent event = calendarEventService.getById(existing.getEventId());
            LocalDateTime remindTime = calculateRemindTime(event.getStartTime(), reminder.getReminderMinutes());
            reminder.setRemindTime(remindTime);
        }
        
        reminder.setUpdateTime(LocalDateTime.now());
        updateById(reminder);
        
        log.info("更新提醒成功: id={}", reminder.getId());
        return getById(reminder.getId());
    }

    @Override
    @Transactional
    public void deleteReminder(Long id) {
        removeById(id);
        log.info("删除提醒成功: id={}", id);
    }

    @Override
    @Transactional
    public void deleteEventReminders(Long eventId) {
        baseMapper.deleteByEventId(eventId);
        log.info("删除事件所有提醒成功: eventId={}", eventId);
    }

    @Override
    public List<EventReminder> getEventReminders(Long eventId) {
        return baseMapper.selectByEventId(eventId);
    }

    @Override
    public List<EventReminder> getPendingReminders(int limit) {
        return baseMapper.selectPendingReminders(LocalDateTime.now(), limit);
    }

    @Override
    @Async
    public void sendReminder(Long reminderId) {
        EventReminder reminder = getById(reminderId);
        if (reminder == null) {
            log.warn("提醒不存在: id={}", reminderId);
            return;
        }
        
        if (!"pending".equals(reminder.getStatus())) {
            log.warn("提醒状态不是待发送: id={}, status={}", reminderId, reminder.getStatus());
            return;
        }
        
        try {
            CalendarEvent event = calendarEventService.getById(reminder.getEventId());
            if (event == null) {
                markAsFailed(reminderId, "事件不存在");
                return;
            }
            
            // 根据提醒类型发送通知
            sendNotification(reminder, event);
            
            markAsSent(reminderId);
            log.info("发送提醒成功: id={}", reminderId);
        } catch (Exception e) {
            log.error("发送提醒失败: id={}", reminderId, e);
            markAsFailed(reminderId, e.getMessage());
        }
    }

    @Override
    @Async
    public void sendReminders(List<Long> reminderIds) {
        for (Long reminderId : reminderIds) {
            sendReminder(reminderId);
        }
    }

    @Override
    @Transactional
    public void markAsSent(Long reminderId) {
        baseMapper.updateStatus(reminderId, "sent", LocalDateTime.now());
    }

    @Override
    @Transactional
    public void markAsFailed(Long reminderId, String errorMessage) {
        EventReminder reminder = getById(reminderId);
        if (reminder != null) {
            reminder.setStatus("failed");
            reminder.setUpdateTime(LocalDateTime.now());
            updateById(reminder);
        }
    }

    @Override
    @Transactional
    public void recalculateReminders(Long eventId) {
        CalendarEvent event = calendarEventService.getById(eventId);
        if (event == null) {
            return;
        }
        
        List<EventReminder> reminders = getEventReminders(eventId);
        for (EventReminder reminder : reminders) {
            if ("pending".equals(reminder.getStatus())) {
                LocalDateTime remindTime = calculateRemindTime(event.getStartTime(), reminder.getReminderMinutes());
                reminder.setRemindTime(remindTime);
                reminder.setUpdateTime(LocalDateTime.now());
                updateById(reminder);
            }
        }
        
        log.info("重新计算提醒时间成功: eventId={}", eventId);
    }

    /**
     * 计算提醒时间
     */
    private LocalDateTime calculateRemindTime(LocalDateTime eventTime, Integer reminderMinutes) {
        if (reminderMinutes == null || reminderMinutes <= 0) {
            return eventTime;
        }
        return eventTime.minusMinutes(reminderMinutes);
    }

    /**
     * 发送通知
     */
    private void sendNotification(EventReminder reminder, CalendarEvent event) {
        String reminderType = reminder.getReminderType();
        
        NotificationDTO notification = new NotificationDTO();
        notification.setUserId(reminder.getUserId());
        notification.setTitle("日程提醒");
        notification.setContent(String.format("您有一个日程即将开始：%s", event.getTitle()));
        notification.setType("calendar_reminder");
        notification.setBusinessType("calendar");
        notification.setBusinessId(event.getId());
        
        switch (reminderType) {
            case "notification":
                notification.setChannel("in_app");
                break;
            case "email":
                notification.setChannel("email");
                break;
            case "sms":
                notification.setChannel("sms");
                break;
            case "push":
                notification.setChannel("push");
                break;
            default:
                notification.setChannel("in_app");
        }
        
        try {
            notifyServiceClient.sendNotification(notification);
        } catch (Exception e) {
            log.error("发送通知失败: reminderId={}", reminder.getId(), e);
            throw e;
        }
    }
}