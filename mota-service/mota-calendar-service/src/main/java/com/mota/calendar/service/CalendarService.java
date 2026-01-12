package com.mota.calendar.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.mota.calendar.entity.Calendar;

import java.util.List;

/**
 * 日历服务接口
 */
public interface CalendarService extends IService<Calendar> {

    /**
     * 创建日历
     */
    Calendar createCalendar(Calendar calendar);

    /**
     * 更新日历
     */
    Calendar updateCalendar(Calendar calendar);

    /**
     * 删除日历
     */
    void deleteCalendar(Long id);

    /**
     * 获取日历详情
     */
    Calendar getCalendarById(Long id);

    /**
     * 获取用户的所有日历
     */
    List<Calendar> getUserCalendars(Long userId, Long tenantId);

    /**
     * 获取用户可见的所有日历（包括共享的）
     */
    List<Calendar> getVisibleCalendars(Long userId, Long tenantId);

    /**
     * 分页查询日历
     */
    Page<Calendar> pageCalendars(Long tenantId, String type, String keyword, int page, int size);

    /**
     * 获取用户的默认日历
     */
    Calendar getDefaultCalendar(Long userId, Long tenantId);

    /**
     * 设置默认日历
     */
    void setDefaultCalendar(Long userId, Long calendarId);

    /**
     * 获取项目日历
     */
    Calendar getProjectCalendar(Long projectId, Long tenantId);

    /**
     * 获取团队日历
     */
    Calendar getTeamCalendar(Long teamId, Long tenantId);

    /**
     * 创建项目日历
     */
    Calendar createProjectCalendar(Long projectId, String projectName, Long tenantId, Long creatorId);

    /**
     * 创建团队日历
     */
    Calendar createTeamCalendar(Long teamId, String teamName, Long tenantId, Long creatorId);
}