package com.mota.project.service;

import com.mota.project.entity.CalendarEvent;
import com.mota.project.entity.DepartmentTask;
import com.mota.project.entity.Task;
import com.mota.project.mapper.DepartmentTaskMapper;
import com.mota.project.mapper.TaskMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Objects;

/**
 * 任务日程同步服务
 * 实现任务与日历事件的自动同步
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TaskCalendarSyncService {

    private final CalendarEventService calendarEventService;
    private final TaskMapper taskMapper;
    private final DepartmentTaskMapper departmentTaskMapper;

    // 颜色常量
    private static final String COLOR_DEPARTMENT_TASK = "#f59e0b"; // 橙色
    private static final String COLOR_TASK = "#52c41a"; // 绿色
    private static final String COLOR_MILESTONE = "#722ed1"; // 紫色

    /**
     * 为部门任务创建日历事件
     *
     * @param task 部门任务
     * @return 创建的日历事件，如果无法创建则返回null
     */
    @Transactional
    public CalendarEvent createEventForDepartmentTask(DepartmentTask task) {
        if (task.getManagerId() == null || task.getEndDate() == null) {
            log.debug("Cannot create calendar event for department task {}: missing manager or end date", task.getId());
            return null;
        }

        CalendarEvent event = new CalendarEvent();
        event.setTitle("[部门任务] " + task.getName());
        event.setDescription(task.getDescription());
        event.setEventType(CalendarEvent.TYPE_TASK);
        event.setStartTime(task.getStartDate() != null ?
                task.getStartDate().atStartOfDay() :
                task.getEndDate().atStartOfDay());
        event.setEndTime(task.getEndDate().atTime(23, 59, 59));
        event.setAllDay(true);
        event.setColor(COLOR_DEPARTMENT_TASK);
        event.setCreatorId(task.getCreatedBy());
        event.setProjectId(task.getProjectId());
        event.setVisibility(CalendarEvent.VISIBILITY_PROJECT);

        CalendarEvent created = calendarEventService.createEvent(event,
                Collections.singletonList(task.getManagerId()));

        // 更新任务的日历事件ID
        task.setCalendarEventId(created.getId());
        departmentTaskMapper.updateById(task);

        log.info("Created calendar event {} for department task {}", created.getId(), task.getId());
        return created;
    }

    /**
     * 为执行任务创建日历事件
     *
     * @param task 执行任务
     * @return 创建的日历事件，如果无法创建则返回null
     */
    @Transactional
    public CalendarEvent createEventForTask(Task task) {
        if (task.getAssigneeId() == null || task.getEndDate() == null) {
            log.debug("Cannot create calendar event for task {}: missing assignee or end date", task.getId());
            return null;
        }

        CalendarEvent event = new CalendarEvent();
        event.setTitle("[任务] " + task.getName());
        event.setDescription(task.getDescription());
        event.setEventType(CalendarEvent.TYPE_TASK);
        event.setStartTime(task.getStartDate() != null ?
                task.getStartDate().atStartOfDay() :
                task.getEndDate().atStartOfDay());
        event.setEndTime(task.getEndDate().atTime(23, 59, 59));
        event.setAllDay(true);
        event.setColor(COLOR_TASK);
        event.setCreatorId(task.getCreatedBy());
        event.setProjectId(task.getProjectId());
        event.setTaskId(task.getId());
        event.setVisibility(CalendarEvent.VISIBILITY_PROJECT);

        CalendarEvent created = calendarEventService.createEvent(event,
                Collections.singletonList(task.getAssigneeId()));

        // 更新任务的日历事件ID
        task.setCalendarEventId(created.getId());
        taskMapper.updateById(task);

        log.info("Created calendar event {} for task {}", created.getId(), task.getId());
        return created;
    }

    /**
     * 更新任务时同步日历事件
     *
     * @param task 执行任务
     */
    @Transactional
    public void syncTaskCalendarEvent(Task task) {
        if (task.getCalendarEventId() != null) {
            // 更新现有事件
            CalendarEvent event = calendarEventService.getEventById(task.getCalendarEventId());
            if (event != null) {
                event.setTitle("[任务] " + task.getName());
                event.setDescription(task.getDescription());
                if (task.getStartDate() != null) {
                    event.setStartTime(task.getStartDate().atStartOfDay());
                }
                if (task.getEndDate() != null) {
                    event.setEndTime(task.getEndDate().atTime(23, 59, 59));
                }
                calendarEventService.updateEvent(event.getId(), event,
                        task.getAssigneeId() != null ?
                                Collections.singletonList(task.getAssigneeId()) : null);
                log.info("Updated calendar event {} for task {}", event.getId(), task.getId());
            }
        } else if (task.getAssigneeId() != null && task.getEndDate() != null) {
            // 创建新事件
            createEventForTask(task);
        }
    }

    /**
     * 更新部门任务时同步日历事件
     *
     * @param task 部门任务
     */
    @Transactional
    public void syncDepartmentTaskCalendarEvent(DepartmentTask task) {
        if (task.getCalendarEventId() != null) {
            // 更新现有事件
            CalendarEvent event = calendarEventService.getEventById(task.getCalendarEventId());
            if (event != null) {
                event.setTitle("[部门任务] " + task.getName());
                event.setDescription(task.getDescription());
                if (task.getStartDate() != null) {
                    event.setStartTime(task.getStartDate().atStartOfDay());
                }
                if (task.getEndDate() != null) {
                    event.setEndTime(task.getEndDate().atTime(23, 59, 59));
                }
                calendarEventService.updateEvent(event.getId(), event,
                        task.getManagerId() != null ?
                                Collections.singletonList(task.getManagerId()) : null);
                log.info("Updated calendar event {} for department task {}", event.getId(), task.getId());
            }
        } else if (task.getManagerId() != null && task.getEndDate() != null) {
            // 创建新事件
            createEventForDepartmentTask(task);
        }
    }

    /**
     * 任务完成时更新日历事件状态
     *
     * @param task 执行任务
     */
    @Transactional
    public void markTaskEventCompleted(Task task) {
        if (task.getCalendarEventId() != null) {
            calendarEventService.cancelEvent(task.getCalendarEventId());
            log.info("Marked calendar event {} as completed for task {}", task.getCalendarEventId(), task.getId());
        }
    }

    /**
     * 部门任务完成时更新日历事件状态
     *
     * @param task 部门任务
     */
    @Transactional
    public void markDepartmentTaskEventCompleted(DepartmentTask task) {
        if (task.getCalendarEventId() != null) {
            calendarEventService.cancelEvent(task.getCalendarEventId());
            log.info("Marked calendar event {} as completed for department task {}", task.getCalendarEventId(), task.getId());
        }
    }

    /**
     * 部门任务完成时更新日历事件状态（通过ID）
     *
     * @param departmentTaskId 部门任务ID
     */
    @Transactional
    public void markDepartmentTaskEventCompleted(Long departmentTaskId) {
        DepartmentTask task = departmentTaskMapper.selectById(departmentTaskId);
        if (task != null) {
            markDepartmentTaskEventCompleted(task);
        }
    }

    /**
     * 任务完成时更新日历事件状态（通过ID）
     *
     * @param taskId 任务ID
     */
    @Transactional
    public void markTaskEventCompleted(Long taskId) {
        Task task = taskMapper.selectById(taskId);
        if (task != null) {
            markTaskEventCompleted(task);
        }
    }

    /**
     * 删除任务时删除关联的日历事件
     *
     * @param task 执行任务
     */
    @Transactional
    public void deleteTaskCalendarEvent(Task task) {
        if (task.getCalendarEventId() != null) {
            calendarEventService.deleteEvent(task.getCalendarEventId());
            log.info("Deleted calendar event {} for task {}", task.getCalendarEventId(), task.getId());
        }
    }

    /**
     * 删除部门任务时删除关联的日历事件
     *
     * @param task 部门任务
     */
    @Transactional
    public void deleteDepartmentTaskCalendarEvent(DepartmentTask task) {
        if (task.getCalendarEventId() != null) {
            calendarEventService.deleteEvent(task.getCalendarEventId());
            log.info("Deleted calendar event {} for department task {}", task.getCalendarEventId(), task.getId());
        }
    }

    /**
     * 变更任务负责人时更新日历事件
     *
     * @param task          执行任务
     * @param oldAssigneeId 旧负责人ID
     * @param newAssigneeId 新负责人ID
     */
    @Transactional
    public void updateTaskAssignee(Task task, Long oldAssigneeId, Long newAssigneeId) {
        if (task.getCalendarEventId() != null) {
            // 移除旧负责人
            if (oldAssigneeId != null) {
                calendarEventService.removeAttendee(task.getCalendarEventId(), oldAssigneeId);
            }
            // 添加新负责人
            if (newAssigneeId != null) {
                calendarEventService.addAttendees(task.getCalendarEventId(),
                        Collections.singletonList(newAssigneeId));
            }
            log.info("Updated assignee for calendar event {} from {} to {}", 
                    task.getCalendarEventId(), oldAssigneeId, newAssigneeId);
        } else if (newAssigneeId != null && task.getEndDate() != null) {
            // 如果之前没有日历事件，现在创建
            createEventForTask(task);
        }
    }

    /**
     * 变更部门任务负责人时更新日历事件
     *
     * @param task         部门任务
     * @param oldManagerId 旧负责人ID
     * @param newManagerId 新负责人ID
     */
    @Transactional
    public void updateDepartmentTaskManager(DepartmentTask task, Long oldManagerId, Long newManagerId) {
        if (task.getCalendarEventId() != null) {
            // 移除旧负责人
            if (oldManagerId != null) {
                calendarEventService.removeAttendee(task.getCalendarEventId(), oldManagerId);
            }
            // 添加新负责人
            if (newManagerId != null) {
                calendarEventService.addAttendees(task.getCalendarEventId(),
                        Collections.singletonList(newManagerId));
            }
            log.info("Updated manager for calendar event {} from {} to {}", 
                    task.getCalendarEventId(), oldManagerId, newManagerId);
        } else if (newManagerId != null && task.getEndDate() != null) {
            // 如果之前没有日历事件，现在创建
            createEventForDepartmentTask(task);
        }
    }
}