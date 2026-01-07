package com.mota.api.calendar.feign;

import com.mota.api.calendar.dto.*;
import com.mota.common.core.result.Result;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 日历服务Feign客户端
 */
@FeignClient(name = "mota-calendar-service", path = "/api/v1/calendar")
public interface CalendarServiceClient {

    /**
     * 创建事件
     */
    @PostMapping("/events")
    Result<CalendarEventDTO> createEvent(@RequestBody CreateEventDTO request);

    /**
     * 更新事件
     */
    @PutMapping("/events/{id}")
    Result<CalendarEventDTO> updateEvent(@PathVariable("id") Long id, @RequestBody UpdateEventDTO request);

    /**
     * 删除事件
     */
    @DeleteMapping("/events/{id}")
    Result<Boolean> deleteEvent(@PathVariable("id") Long id);

    /**
     * 获取事件详情
     */
    @GetMapping("/events/{id}")
    Result<CalendarEventDTO> getEvent(@PathVariable("id") Long id);

    /**
     * 获取用户事件列表
     */
    @GetMapping("/events/user/{userId}")
    Result<List<CalendarEventDTO>> getUserEvents(
            @PathVariable("userId") Long userId,
            @RequestParam("startTime") String startTime,
            @RequestParam("endTime") String endTime);

    /**
     * 获取项目事件列表
     */
    @GetMapping("/events/project/{projectId}")
    Result<List<CalendarEventDTO>> getProjectEvents(
            @PathVariable("projectId") Long projectId,
            @RequestParam("startTime") String startTime,
            @RequestParam("endTime") String endTime);

    /**
     * 获取用户日历配置
     */
    @GetMapping("/configs/user/{userId}")
    Result<List<CalendarConfigDTO>> getUserConfigs(@PathVariable("userId") Long userId);
}