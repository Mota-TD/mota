package com.mota.calendar.controller;

import com.mota.calendar.entity.CalendarConfig;
import com.mota.calendar.service.CalendarConfigService;
import com.mota.common.core.result.Result;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * 日历配置控制器（内部服务接口）
 * 注意：外部API请求通过网关路由到项目服务(mota-project-service)
 * 此控制器仅供内部服务间调用使用
 *
 * 日历配置用于管理用户的日历显示设置（视图、工作时间等）
 */
@RestController
@RequestMapping("/internal/calendar-configs")
@RequiredArgsConstructor
public class CalendarConfigController {
    
    private final CalendarConfigService configService;
    
    /**
     * 获取用户的日历配置
     */
    @GetMapping("/user/{userId}")
    public Result<CalendarConfig> getUserConfig(@PathVariable Long userId) {
        CalendarConfig config = configService.getByUserId(userId);
        return Result.success(config);
    }
    
    /**
     * 获取用户在指定企业的日历配置
     */
    @GetMapping("/user/{userId}/enterprise/{enterpriseId}")
    public Result<CalendarConfig> getUserEnterpriseConfig(@PathVariable Long userId,
                                                          @PathVariable Long enterpriseId) {
        CalendarConfig config = configService.getByUserIdAndEnterpriseId(userId, enterpriseId);
        return Result.success(config);
    }
    
    /**
     * 获取或创建默认配置
     */
    @GetMapping("/user/{userId}/default")
    public Result<CalendarConfig> getOrCreateDefaultConfig(
            @PathVariable Long userId,
            @RequestParam(required = false) Long enterpriseId) {
        CalendarConfig config = configService.getOrCreateDefault(userId, enterpriseId);
        return Result.success(config);
    }
    
    /**
     * 获取配置详情
     */
    @GetMapping("/{id}")
    public Result<CalendarConfig> getConfig(@PathVariable Long id) {
        CalendarConfig config = configService.getById(id);
        return Result.success(config);
    }
    
    /**
     * 创建或更新日历配置
     */
    @PostMapping
    public Result<CalendarConfig> saveOrUpdateConfig(@RequestBody CalendarConfig config) {
        CalendarConfig saved = configService.saveOrUpdateConfig(config);
        return Result.success(saved);
    }
    
    /**
     * 更新日历配置
     */
    @PutMapping("/{id}")
    public Result<CalendarConfig> updateConfig(@PathVariable Long id,
                                                @RequestBody CalendarConfig config) {
        config.setId(id);
        CalendarConfig updated = configService.updateConfig(config);
        return Result.success(updated);
    }
}