package com.mota.project.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.mota.project.entity.CalendarEvent;
import com.mota.project.entity.CalendarSubscription;

import java.util.List;

/**
 * 日历订阅服务接口
 */
public interface CalendarSubscriptionService extends IService<CalendarSubscription> {
    
    /**
     * 获取用户的订阅列表
     */
    List<CalendarSubscription> getByUserId(Long userId);
    
    /**
     * 创建订阅
     */
    CalendarSubscription createSubscription(CalendarSubscription subscription);
    
    /**
     * 更新订阅
     */
    CalendarSubscription updateSubscription(CalendarSubscription subscription);
    
    /**
     * 同步订阅的日历事件
     */
    void syncSubscription(Long subscriptionId);
    
    /**
     * 获取订阅的事件列表
     */
    List<CalendarEvent> getSubscriptionEvents(Long subscriptionId);
    
    /**
     * 生成用户日历的订阅URL
     */
    String generateSubscriptionUrl(Long userId);
}