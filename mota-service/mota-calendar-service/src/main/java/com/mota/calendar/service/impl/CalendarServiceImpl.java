package com.mota.calendar.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.mota.calendar.entity.Calendar;
import com.mota.calendar.entity.CalendarShare;
import com.mota.calendar.mapper.CalendarMapper;
import com.mota.calendar.mapper.CalendarShareMapper;
import com.mota.calendar.service.CalendarService;
import com.mota.common.core.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 日历服务实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CalendarServiceImpl extends ServiceImpl<CalendarMapper, Calendar> implements CalendarService {

    private final CalendarShareMapper calendarShareMapper;

    @Override
    @Transactional
    public Calendar createCalendar(Calendar calendar) {
        // 设置默认值
        if (calendar.getColor() == null) {
            calendar.setColor("#1890ff");
        }
        if (calendar.getIsDefault() == null) {
            calendar.setIsDefault(false);
        }
        if (calendar.getIsVisible() == null) {
            calendar.setIsVisible(true);
        }
        if (calendar.getSortOrder() == null) {
            calendar.setSortOrder(0);
        }
        
        calendar.setCreateTime(LocalDateTime.now());
        calendar.setUpdateTime(LocalDateTime.now());
        
        save(calendar);
        log.info("创建日历成功: id={}, name={}", calendar.getId(), calendar.getName());
        return calendar;
    }

    @Override
    @Transactional
    public Calendar updateCalendar(Calendar calendar) {
        Calendar existing = getById(calendar.getId());
        if (existing == null) {
            throw new BusinessException("日历不存在");
        }
        
        calendar.setUpdateTime(LocalDateTime.now());
        updateById(calendar);
        log.info("更新日历成功: id={}", calendar.getId());
        return getById(calendar.getId());
    }

    @Override
    @Transactional
    public void deleteCalendar(Long id) {
        Calendar calendar = getById(id);
        if (calendar == null) {
            throw new BusinessException("日历不存在");
        }
        
        if (calendar.getIsDefault()) {
            throw new BusinessException("默认日历不能删除");
        }
        
        // 删除日历共享设置
        LambdaQueryWrapper<CalendarShare> shareWrapper = new LambdaQueryWrapper<>();
        shareWrapper.eq(CalendarShare::getCalendarId, id);
        calendarShareMapper.delete(shareWrapper);
        
        // 删除日历
        removeById(id);
        log.info("删除日历成功: id={}", id);
    }

    @Override
    public Calendar getCalendarById(Long id) {
        return getById(id);
    }

    @Override
    public List<Calendar> getUserCalendars(Long userId, Long tenantId) {
        return baseMapper.selectByUserId(userId, tenantId);
    }

    @Override
    public List<Calendar> getVisibleCalendars(Long userId, Long tenantId) {
        List<Calendar> calendars = new ArrayList<>();
        
        // 获取用户自己的日历
        calendars.addAll(getUserCalendars(userId, tenantId));
        
        // 获取共享给用户的日历
        List<CalendarShare> shares = calendarShareMapper.selectByUserId(userId);
        if (!shares.isEmpty()) {
            List<Long> sharedCalendarIds = shares.stream()
                    .map(CalendarShare::getCalendarId)
                    .collect(Collectors.toList());
            
            LambdaQueryWrapper<Calendar> wrapper = new LambdaQueryWrapper<>();
            wrapper.in(Calendar::getId, sharedCalendarIds)
                    .eq(Calendar::getTenantId, tenantId);
            calendars.addAll(list(wrapper));
        }
        
        return calendars;
    }

    @Override
    public Page<Calendar> pageCalendars(Long tenantId, String type, String keyword, int page, int size) {
        Page<Calendar> pageParam = new Page<>(page, size);
        
        LambdaQueryWrapper<Calendar> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Calendar::getTenantId, tenantId);
        
        if (StringUtils.hasText(type)) {
            wrapper.eq(Calendar::getType, type);
        }
        
        if (StringUtils.hasText(keyword)) {
            wrapper.and(w -> w.like(Calendar::getName, keyword)
                    .or().like(Calendar::getDescription, keyword));
        }
        
        wrapper.orderByAsc(Calendar::getSortOrder)
                .orderByDesc(Calendar::getCreateTime);
        
        return page(pageParam, wrapper);
    }

    @Override
    public Calendar getDefaultCalendar(Long userId, Long tenantId) {
        Calendar calendar = baseMapper.selectDefaultCalendar(userId, tenantId);
        
        // 如果没有默认日历，创建一个
        if (calendar == null) {
            calendar = new Calendar();
            calendar.setTenantId(tenantId);
            calendar.setUserId(userId);
            calendar.setName("我的日历");
            calendar.setType("personal");
            calendar.setColor("#1890ff");
            calendar.setIsDefault(true);
            calendar.setIsVisible(true);
            calendar.setSortOrder(0);
            calendar = createCalendar(calendar);
        }
        
        return calendar;
    }

    @Override
    @Transactional
    public void setDefaultCalendar(Long userId, Long calendarId) {
        Calendar calendar = getById(calendarId);
        if (calendar == null) {
            throw new BusinessException("日历不存在");
        }
        
        if (!calendar.getUserId().equals(userId)) {
            throw new BusinessException("只能设置自己的日历为默认日历");
        }
        
        // 取消原来的默认日历
        LambdaQueryWrapper<Calendar> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Calendar::getUserId, userId)
                .eq(Calendar::getIsDefault, true);
        
        Calendar oldDefault = getOne(wrapper);
        if (oldDefault != null) {
            oldDefault.setIsDefault(false);
            updateById(oldDefault);
        }
        
        // 设置新的默认日历
        calendar.setIsDefault(true);
        updateById(calendar);
        
        log.info("设置默认日历成功: userId={}, calendarId={}", userId, calendarId);
    }

    @Override
    public Calendar getProjectCalendar(Long projectId, Long tenantId) {
        LambdaQueryWrapper<Calendar> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Calendar::getTenantId, tenantId)
                .eq(Calendar::getType, "project")
                .eq(Calendar::getProjectId, projectId);
        return getOne(wrapper);
    }

    @Override
    public Calendar getTeamCalendar(Long teamId, Long tenantId) {
        LambdaQueryWrapper<Calendar> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Calendar::getTenantId, tenantId)
                .eq(Calendar::getType, "team")
                .eq(Calendar::getTeamId, teamId);
        return getOne(wrapper);
    }

    @Override
    @Transactional
    public Calendar createProjectCalendar(Long projectId, String projectName, Long tenantId, Long creatorId) {
        // 检查是否已存在
        Calendar existing = getProjectCalendar(projectId, tenantId);
        if (existing != null) {
            return existing;
        }
        
        Calendar calendar = new Calendar();
        calendar.setTenantId(tenantId);
        calendar.setUserId(creatorId);
        calendar.setProjectId(projectId);
        calendar.setName(projectName + " - 项目日历");
        calendar.setType("project");
        calendar.setColor("#52c41a");
        calendar.setIsDefault(false);
        calendar.setIsVisible(true);
        calendar.setSortOrder(100);
        
        return createCalendar(calendar);
    }

    @Override
    @Transactional
    public Calendar createTeamCalendar(Long teamId, String teamName, Long tenantId, Long creatorId) {
        // 检查是否已存在
        Calendar existing = getTeamCalendar(teamId, tenantId);
        if (existing != null) {
            return existing;
        }
        
        Calendar calendar = new Calendar();
        calendar.setTenantId(tenantId);
        calendar.setUserId(creatorId);
        calendar.setTeamId(teamId);
        calendar.setName(teamName + " - 团队日历");
        calendar.setType("team");
        calendar.setColor("#722ed1");
        calendar.setIsDefault(false);
        calendar.setIsVisible(true);
        calendar.setSortOrder(50);
        
        return createCalendar(calendar);
    }
}