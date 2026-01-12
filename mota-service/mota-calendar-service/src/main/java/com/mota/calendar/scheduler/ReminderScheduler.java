package com.mota.calendar.scheduler;

import com.mota.calendar.entity.EventReminder;
import com.mota.calendar.service.EventReminderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 提醒调度器
 * 定时检查并发送待发送的提醒
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ReminderScheduler {

    private final EventReminderService eventReminderService;

    /**
     * 每分钟检查待发送的提醒
     */
    @Scheduled(fixedRate = 60000)
    public void processReminders() {
        try {
            // 获取待发送的提醒（每次最多处理100条）
            List<EventReminder> pendingReminders = eventReminderService.getPendingReminders(100);
            
            if (pendingReminders.isEmpty()) {
                return;
            }
            
            log.info("发现 {} 条待发送的提醒", pendingReminders.size());
            
            // 批量发送提醒
            List<Long> reminderIds = pendingReminders.stream()
                    .map(EventReminder::getId)
                    .collect(Collectors.toList());
            
            eventReminderService.sendReminders(reminderIds);
            
        } catch (Exception e) {
            log.error("处理提醒任务失败", e);
        }
    }
}