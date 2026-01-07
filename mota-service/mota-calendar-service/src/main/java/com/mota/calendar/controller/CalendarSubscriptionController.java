package com.mota.calendar.controller;

import com.mota.calendar.entity.CalendarSubscription;
import com.mota.calendar.service.CalendarSubscriptionService;
import com.mota.common.core.result.Result;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 日历订阅控制器（内部服务接口）
 * 注意：外部API请求通过网关路由到项目服务(mota-project-service)
 * 此控制器仅供内部服务间调用使用
 */
@RestController
@RequestMapping("/internal/calendar-subscriptions")
@RequiredArgsConstructor
public class CalendarSubscriptionController {
    
    private final CalendarSubscriptionService subscriptionService;
    
    /**
     * 获取用户的订阅列表
     */
    @GetMapping("/user/{userId}")
    public Result<List<CalendarSubscription>> getUserSubscriptions(@PathVariable Long userId) {
        List<CalendarSubscription> subscriptions = subscriptionService.getUserSubscriptions(userId);
        return Result.success(subscriptions);
    }
    
    /**
     * 获取订阅详情
     */
    @GetMapping("/{id}")
    public Result<CalendarSubscription> getSubscription(@PathVariable Long id) {
        CalendarSubscription subscription = subscriptionService.getById(id);
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
        CalendarSubscription created = subscriptionService.createSubscription(subscription);
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
        CalendarSubscription updated = subscriptionService.updateSubscription(subscription);
        return Result.success(updated);
    }
    
    /**
     * 删除订阅
     */
    @DeleteMapping("/{id}")
    public Result<Boolean> deleteSubscription(@PathVariable Long id) {
        boolean result = subscriptionService.deleteSubscription(id);
        return Result.success(result);
    }
    
    /**
     * 同步订阅
     */
    @PostMapping("/{id}/sync")
    public Result<Boolean> syncSubscription(@PathVariable Long id) {
        boolean result = subscriptionService.syncSubscription(id);
        return Result.success(result);
    }
    
    /**
     * 暂停订阅
     */
    @PostMapping("/{id}/pause")
    public Result<Boolean> pauseSubscription(@PathVariable Long id) {
        boolean result = subscriptionService.pauseSubscription(id);
        return Result.success(result);
    }
    
    /**
     * 恢复订阅
     */
    @PostMapping("/{id}/resume")
    public Result<Boolean> resumeSubscription(@PathVariable Long id) {
        boolean result = subscriptionService.resumeSubscription(id);
        return Result.success(result);
    }
}