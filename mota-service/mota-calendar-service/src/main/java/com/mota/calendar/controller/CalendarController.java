package com.mota.calendar.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.mota.calendar.entity.Calendar;
import com.mota.calendar.entity.CalendarShare;
import com.mota.calendar.service.CalendarService;
import com.mota.calendar.service.CalendarShareService;
import com.mota.common.core.result.Result;
import com.mota.common.security.util.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 日历管理控制器
 */
@Tag(name = "日历管理", description = "日历的增删改查和共享管理")
@RestController
@RequestMapping("/api/calendars")
@RequiredArgsConstructor
public class CalendarController {

    private final CalendarService calendarService;
    private final CalendarShareService calendarShareService;

    @Operation(summary = "创建日历")
    @PostMapping
    public Result<Calendar> createCalendar(@RequestBody Calendar calendar) {
        Long userId = SecurityUtils.getUserId();
        Long tenantId = SecurityUtils.getTenantId();
        
        calendar.setUserId(userId);
        calendar.setTenantId(tenantId);
        
        Calendar created = calendarService.createCalendar(calendar);
        return Result.success(created);
    }

    @Operation(summary = "更新日历")
    @PutMapping("/{id}")
    public Result<Calendar> updateCalendar(@PathVariable Long id, @RequestBody Calendar calendar) {
        calendar.setId(id);
        Calendar updated = calendarService.updateCalendar(calendar);
        return Result.success(updated);
    }

    @Operation(summary = "删除日历")
    @DeleteMapping("/{id}")
    public Result<Void> deleteCalendar(@PathVariable Long id) {
        calendarService.deleteCalendar(id);
        return Result.success();
    }

    @Operation(summary = "获取日历详情")
    @GetMapping("/{id}")
    public Result<Calendar> getCalendar(@PathVariable Long id) {
        Calendar calendar = calendarService.getCalendarById(id);
        return Result.success(calendar);
    }

    @Operation(summary = "获取我的日历列表")
    @GetMapping("/my")
    public Result<List<Calendar>> getMyCalendars() {
        Long userId = SecurityUtils.getUserId();
        Long tenantId = SecurityUtils.getTenantId();
        
        List<Calendar> calendars = calendarService.getUserCalendars(userId, tenantId);
        return Result.success(calendars);
    }

    @Operation(summary = "获取可见的所有日历（包括共享的）")
    @GetMapping("/visible")
    public Result<List<Calendar>> getVisibleCalendars() {
        Long userId = SecurityUtils.getUserId();
        Long tenantId = SecurityUtils.getTenantId();
        
        List<Calendar> calendars = calendarService.getVisibleCalendars(userId, tenantId);
        return Result.success(calendars);
    }

    @Operation(summary = "分页查询日历")
    @GetMapping("/page")
    public Result<Page<Calendar>> pageCalendars(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        Long tenantId = SecurityUtils.getTenantId();
        
        Page<Calendar> result = calendarService.pageCalendars(tenantId, type, keyword, page, size);
        return Result.success(result);
    }

    @Operation(summary = "获取默认日历")
    @GetMapping("/default")
    public Result<Calendar> getDefaultCalendar() {
        Long userId = SecurityUtils.getUserId();
        Long tenantId = SecurityUtils.getTenantId();
        
        Calendar calendar = calendarService.getDefaultCalendar(userId, tenantId);
        return Result.success(calendar);
    }

    @Operation(summary = "设置默认日历")
    @PutMapping("/{id}/default")
    public Result<Void> setDefaultCalendar(@PathVariable Long id) {
        Long userId = SecurityUtils.getUserId();
        calendarService.setDefaultCalendar(userId, id);
        return Result.success();
    }

    // ==================== 日历共享 ====================

    @Operation(summary = "共享日历给用户")
    @PostMapping("/{id}/share/user")
    public Result<CalendarShare> shareToUser(
            @PathVariable Long id,
            @RequestParam Long userId,
            @RequestParam(defaultValue = "view") String permission) {
        Long operatorId = SecurityUtils.getUserId();
        CalendarShare share = calendarShareService.shareToUser(id, userId, permission, operatorId);
        return Result.success(share);
    }

    @Operation(summary = "共享日历给团队")
    @PostMapping("/{id}/share/team")
    public Result<CalendarShare> shareToTeam(
            @PathVariable Long id,
            @RequestParam Long teamId,
            @RequestParam(defaultValue = "view") String permission) {
        Long operatorId = SecurityUtils.getUserId();
        CalendarShare share = calendarShareService.shareToTeam(id, teamId, permission, operatorId);
        return Result.success(share);
    }

    @Operation(summary = "共享日历给部门")
    @PostMapping("/{id}/share/department")
    public Result<CalendarShare> shareToDepartment(
            @PathVariable Long id,
            @RequestParam Long departmentId,
            @RequestParam(defaultValue = "view") String permission) {
        Long operatorId = SecurityUtils.getUserId();
        CalendarShare share = calendarShareService.shareToDepartment(id, departmentId, permission, operatorId);
        return Result.success(share);
    }

    @Operation(summary = "共享日历给所有人")
    @PostMapping("/{id}/share/all")
    public Result<CalendarShare> shareToAll(
            @PathVariable Long id,
            @RequestParam(defaultValue = "view") String permission) {
        Long operatorId = SecurityUtils.getUserId();
        CalendarShare share = calendarShareService.shareToAll(id, permission, operatorId);
        return Result.success(share);
    }

    @Operation(summary = "取消共享")
    @DeleteMapping("/share/{shareId}")
    public Result<Void> cancelShare(@PathVariable Long shareId) {
        calendarShareService.cancelShare(shareId);
        return Result.success();
    }

    @Operation(summary = "获取日历的共享列表")
    @GetMapping("/{id}/shares")
    public Result<List<CalendarShare>> getCalendarShares(@PathVariable Long id) {
        List<CalendarShare> shares = calendarShareService.getCalendarShares(id);
        return Result.success(shares);
    }

    @Operation(summary = "更新共享权限")
    @PutMapping("/share/{shareId}")
    public Result<CalendarShare> updateSharePermission(
            @PathVariable Long shareId,
            @RequestParam String permission) {
        CalendarShare share = calendarShareService.updatePermission(shareId, permission);
        return Result.success(share);
    }

    @Operation(summary = "接受共享邀请")
    @PostMapping("/share/{shareId}/accept")
    public Result<Void> acceptShare(@PathVariable Long shareId) {
        Long userId = SecurityUtils.getUserId();
        calendarShareService.acceptShare(shareId, userId);
        return Result.success();
    }

    @Operation(summary = "拒绝共享邀请")
    @PostMapping("/share/{shareId}/reject")
    public Result<Void> rejectShare(@PathVariable Long shareId) {
        Long userId = SecurityUtils.getUserId();
        calendarShareService.rejectShare(shareId, userId);
        return Result.success();
    }
}