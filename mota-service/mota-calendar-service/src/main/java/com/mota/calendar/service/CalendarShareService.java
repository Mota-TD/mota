package com.mota.calendar.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.mota.calendar.entity.CalendarShare;

import java.util.List;

/**
 * 日历共享服务接口
 */
public interface CalendarShareService extends IService<CalendarShare> {

    /**
     * 共享日历给用户
     */
    CalendarShare shareToUser(Long calendarId, Long userId, String permission, Long operatorId);

    /**
     * 共享日历给团队
     */
    CalendarShare shareToTeam(Long calendarId, Long teamId, String permission, Long operatorId);

    /**
     * 共享日历给部门
     */
    CalendarShare shareToDepartment(Long calendarId, Long departmentId, String permission, Long operatorId);

    /**
     * 共享日历给所有人
     */
    CalendarShare shareToAll(Long calendarId, String permission, Long operatorId);

    /**
     * 取消共享
     */
    void cancelShare(Long shareId);

    /**
     * 取消日历的所有共享
     */
    void cancelAllShares(Long calendarId);

    /**
     * 获取日历的共享列表
     */
    List<CalendarShare> getCalendarShares(Long calendarId);

    /**
     * 获取用户被共享的日历
     */
    List<CalendarShare> getUserSharedCalendars(Long userId);

    /**
     * 检查用户是否有日历权限
     */
    boolean hasPermission(Long calendarId, Long userId, String requiredPermission);

    /**
     * 更新共享权限
     */
    CalendarShare updatePermission(Long shareId, String permission);

    /**
     * 接受共享邀请
     */
    void acceptShare(Long shareId, Long userId);

    /**
     * 拒绝共享邀请
     */
    void rejectShare(Long shareId, Long userId);
}