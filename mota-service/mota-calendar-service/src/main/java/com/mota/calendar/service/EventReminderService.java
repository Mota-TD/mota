package com.mota.calendar.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.mota.calendar.entity.EventReminder;

import java.util.List;

/**
 * 事件提醒服务接口
 */
public interface EventReminderService extends IService<EventReminder> {

    /**
     * 创建提醒
     */
    EventReminder createReminder(EventReminder reminder);

    /**
     * 批量创建提醒
     */
    List<EventReminder> createReminders(Long eventId, List<EventReminder> reminders);

    /**
     * 更新提醒
     */
    EventReminder updateReminder(EventReminder reminder);

    /**
     * 删除提醒
     */
    void deleteReminder(Long id);

    /**
     * 删除事件的所有提醒
     */
    void deleteEventReminders(Long eventId);

    /**
     * 获取事件的提醒列表
     */
    List<EventReminder> getEventReminders(Long eventId);

    /**
     * 获取待发送的提醒
     */
    List<EventReminder> getPendingReminders(int limit);

    /**
     * 发送提醒
     */
    void sendReminder(Long reminderId);

    /**
     * 批量发送提醒
     */
    void sendReminders(List<Long> reminderIds);

    /**
     * 标记提醒已发送
     */
    void markAsSent(Long reminderId);

    /**
     * 标记提醒发送失败
     */
    void markAsFailed(Long reminderId, String errorMessage);

    /**
     * 重新计算事件的提醒时间
     */
    void recalculateReminders(Long eventId);
}