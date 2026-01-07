package com.mota.project.controller;

import com.mota.common.core.result.Result;
import com.mota.project.entity.CalendarConfig;
import com.mota.project.service.CalendarConfigService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

/**
 * 日历配置控制器
 * 用于管理用户的日历显示配置（视图设置、工作时间等）
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/calendar-configs")
@RequiredArgsConstructor
public class CalendarConfigController {
    
    private final CalendarConfigService calendarConfigService;
    
    /**
     * 获取用户的日历配置
     */
    @GetMapping("/user/{userId}")
    public Result<CalendarConfig> getUserConfig(@PathVariable Long userId) {
        CalendarConfig config = calendarConfigService.getByUserId(userId);
        return Result.success(config);
    }
    
    /**
     * 获取用户在指定企业的日历配置
     */
    @GetMapping("/user/{userId}/enterprise/{enterpriseId}")
    public Result<CalendarConfig> getUserEnterpriseConfig(
            @PathVariable Long userId,
            @PathVariable Long enterpriseId) {
        CalendarConfig config = calendarConfigService.getByUserIdAndEnterpriseId(userId, enterpriseId);
        return Result.success(config);
    }
    
    /**
     * 获取单个日历配置
     */
    @GetMapping("/{id}")
    public Result<CalendarConfig> getConfig(@PathVariable Long id) {
        CalendarConfig config = calendarConfigService.getById(id);
        return Result.success(config);
    }
    
    /**
     * 创建或更新日历配置
     */
    @PostMapping
    public Result<CalendarConfig> saveOrUpdateConfig(@RequestBody CalendarConfig config) {
        CalendarConfig saved = calendarConfigService.saveOrUpdateConfig(config);
        return Result.success(saved);
    }
    
    /**
     * 更新日历配置
     */
    @PutMapping("/{id}")
    public Result<CalendarConfig> updateConfig(
            @PathVariable Long id,
            @RequestBody CalendarConfig config) {
        config.setId(id);
        CalendarConfig updated = calendarConfigService.updateConfig(config);
        return Result.success(updated);
    }
    
    /**
     * 删除日历配置
     */
    @DeleteMapping("/{id}")
    public Result<Boolean> deleteConfig(@PathVariable Long id) {
        boolean result = calendarConfigService.removeById(id);
        return Result.success(result);
    }
    
    /**
     * 获取或创建默认日历配置
     */
    @GetMapping("/user/{userId}/default")
    public Result<CalendarConfig> getOrCreateDefaultConfig(
            @PathVariable Long userId,
            @RequestParam(required = false) Long enterpriseId) {
        CalendarConfig config = calendarConfigService.getOrCreateDefault(userId, enterpriseId);
        return Result.success(config);
    }
}