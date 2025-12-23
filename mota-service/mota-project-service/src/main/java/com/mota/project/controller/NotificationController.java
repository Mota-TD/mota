package com.mota.project.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.mota.common.core.result.Result;
import com.mota.project.entity.Notification;
import com.mota.project.mapper.NotificationMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 通知控制器
 */
@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationMapper notificationMapper;

    /**
     * 获取通知列表
     */
    @GetMapping
    public Result<Map<String, Object>> list(
            @RequestParam(value = "type", required = false) String type,
            @RequestParam(value = "isRead", required = false) Boolean isRead,
            @RequestParam(value = "page", defaultValue = "1") Integer page,
            @RequestParam(value = "pageSize", defaultValue = "10") Integer pageSize) {
        
        LambdaQueryWrapper<Notification> wrapper = new LambdaQueryWrapper<>();
        
        if (type != null && !type.isEmpty()) {
            wrapper.eq(Notification::getType, type);
        }
        if (isRead != null) {
            wrapper.eq(Notification::getIsRead, isRead ? 1 : 0);
        }
        
        wrapper.orderByDesc(Notification::getCreatedAt);
        
        List<Notification> notifications = notificationMapper.selectList(wrapper);
        
        // 计算未读数量
        LambdaQueryWrapper<Notification> unreadWrapper = new LambdaQueryWrapper<>();
        unreadWrapper.eq(Notification::getIsRead, 0);
        Long unreadCount = notificationMapper.selectCount(unreadWrapper);
        
        Map<String, Object> result = new HashMap<>();
        result.put("list", notifications);
        result.put("total", notifications.size());
        result.put("unreadCount", unreadCount);
        
        return Result.success(result);
    }

    /**
     * 获取通知详情
     */
    @GetMapping("/{id}")
    public Result<Notification> detail(@PathVariable("id") Long id) {
        Notification notification = notificationMapper.selectById(id);
        return Result.success(notification);
    }

    /**
     * 标记通知为已读
     */
    @PutMapping("/{id}/read")
    public Result<Void> markAsRead(@PathVariable("id") Long id) {
        Notification notification = notificationMapper.selectById(id);
        if (notification != null) {
            notification.setIsRead(1);
            notificationMapper.updateById(notification);
        }
        return Result.success();
    }

    /**
     * 标记所有通知为已读
     */
    @PutMapping("/read-all")
    public Result<Void> markAllAsRead() {
        Notification update = new Notification();
        update.setIsRead(1);
        
        LambdaQueryWrapper<Notification> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Notification::getIsRead, 0);
        
        notificationMapper.update(update, wrapper);
        return Result.success();
    }

    /**
     * 删除通知
     */
    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable("id") Long id) {
        notificationMapper.deleteById(id);
        return Result.success();
    }

    /**
     * 获取未读通知数量
     */
    @GetMapping("/unread-count")
    public Result<Map<String, Object>> getUnreadCount() {
        LambdaQueryWrapper<Notification> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Notification::getIsRead, 0);
        Long count = notificationMapper.selectCount(wrapper);
        
        Map<String, Object> result = new HashMap<>();
        result.put("count", count);
        return Result.success(result);
    }
}