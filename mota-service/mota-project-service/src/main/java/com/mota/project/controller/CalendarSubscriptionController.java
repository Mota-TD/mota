package com.mota.project.controller;

import com.mota.common.core.result.Result;
import com.mota.project.entity.CalendarEvent;
import com.mota.project.entity.CalendarSubscription;
import com.mota.project.service.CalendarSubscriptionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 日历订阅控制器
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/calendar-subscriptions")
@RequiredArgsConstructor
public class CalendarSubscriptionController {
    
    private final CalendarSubscriptionService calendarSubscriptionService;
    
    /**
     * 获取用户的订阅列表
     */
    @GetMapping("/user/{userId}")
    public Result<List<CalendarSubscription>> getUserSubscriptions(@PathVariable Long userId) {
        List<CalendarSubscription> subscriptions = calendarSubscriptionService.getByUserId(userId);
        return Result.success(subscriptions);
    }
    
    /**
     * 获取单个订阅
     */
    @GetMapping("/{id}")
    public Result<CalendarSubscription> getSubscription(@PathVariable Long id) {
        CalendarSubscription subscription = calendarSubscriptionService.getById(id);
        return Result.success(subscription);
    }
    
    /**
     * 创建订阅
     */
    @PostMapping("/user/{userId}")
    public Result<CalendarSubscription> createSubscription(
            @PathVariable Long userId,
            @RequestBody CalendarSubscription subscription) {
        subscription.setUserId(userId);
        CalendarSubscription created = calendarSubscriptionService.createSubscription(subscription);
        return Result.success(created);
    }
    
    /**
     * 更新订阅
     */
    @PutMapping("/{id}")
    public Result<CalendarSubscription> updateSubscription(
            @PathVariable Long id,
            @RequestBody CalendarSubscription subscription) {
        subscription.setId(id);
        CalendarSubscription updated = calendarSubscriptionService.updateSubscription(subscription);
        return Result.success(updated);
    }
    
    /**
     * 删除订阅
     */
    @DeleteMapping("/{id}")
    public Result<Boolean> deleteSubscription(@PathVariable Long id) {
        boolean result = calendarSubscriptionService.removeById(id);
        return Result.success(result);
    }
    
    /**
     * 同步订阅
     */
    @PostMapping("/{id}/sync")
    public Result<Boolean> syncSubscription(@PathVariable Long id) {
        calendarSubscriptionService.syncSubscription(id);
        return Result.success(true);
    }
    
    /**
     * 获取订阅的事件列表
     */
    @GetMapping("/{subscriptionId}/events")
    public Result<List<CalendarEvent>> getSubscriptionEvents(@PathVariable Long subscriptionId) {
        List<CalendarEvent> events = calendarSubscriptionService.getSubscriptionEvents(subscriptionId);
        return Result.success(events);
    }
    
    /**
     * 暂停订阅
     */
    @PostMapping("/{id}/pause")
    public Result<Boolean> pauseSubscription(@PathVariable Long id) {
        CalendarSubscription subscription = calendarSubscriptionService.getById(id);
        if (subscription != null) {
            subscription.setStatus(CalendarSubscription.STATUS_PAUSED);
            calendarSubscriptionService.updateSubscription(subscription);
        }
        return Result.success(true);
    }
    
    /**
     * 恢复订阅
     */
    @PostMapping("/{id}/resume")
    public Result<Boolean> resumeSubscription(@PathVariable Long id) {
        CalendarSubscription subscription = calendarSubscriptionService.getById(id);
        if (subscription != null) {
            subscription.setStatus(CalendarSubscription.STATUS_ACTIVE);
            calendarSubscriptionService.updateSubscription(subscription);
        }
        return Result.success(true);
    }
}