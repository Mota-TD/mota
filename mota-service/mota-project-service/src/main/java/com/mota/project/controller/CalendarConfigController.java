package com.mota.project.controller;

import com.mota.common.core.result.Result;
import com.mota.project.entity.CalendarConfig;
import com.mota.project.service.CalendarConfigService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 日历配置控制器
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/calendar-configs")
@RequiredArgsConstructor
public class CalendarConfigController {
    
    private final CalendarConfigService calendarConfigService;
    
    /**
     * 获取用户的日历配置列表
     */
    @GetMapping("/user/{userId}")
    public Result<List<CalendarConfig>> getUserConfigs(@PathVariable Long userId) {
        List<CalendarConfig> configs = calendarConfigService.getByUserId(userId);
        return Result.success(configs);
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
     * 创建日历配置
     */
    @PostMapping
    public Result<CalendarConfig> createConfig(@RequestBody CalendarConfig config) {
        CalendarConfig created = calendarConfigService.createConfig(config);
        return Result.success(created);
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
     * 设置默认日历
     */
    @PostMapping("/user/{userId}/default/{configId}")
    public Result<Boolean> setDefaultConfig(
            @PathVariable Long userId,
            @PathVariable Long configId) {
        calendarConfigService.setDefault(userId, configId);
        return Result.success(true);
    }
    
    /**
     * 获取用户的默认日历配置
     */
    @GetMapping("/user/{userId}/default")
    public Result<CalendarConfig> getDefaultConfig(@PathVariable Long userId) {
        CalendarConfig config = calendarConfigService.getDefaultByUserId(userId);
        return Result.success(config);
    }
}