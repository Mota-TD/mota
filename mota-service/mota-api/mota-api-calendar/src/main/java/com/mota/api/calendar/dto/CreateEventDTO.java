package com.mota.api.calendar.dto;

import lombok.Data;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 创建事件请求DTO
 */
@Data
public class CreateEventDTO implements Serializable {
    private static final long serialVersionUID = 1L;
    
    private String title;
    private String description;
    private String eventType;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Boolean allDay;
    private String location;
    private String color;
    private Long creatorId;
    private Long projectId;
    private Long taskId;
    private Long milestoneId;
    private String recurrenceRule;
    private LocalDateTime recurrenceEndDate;
    private Integer reminderMinutes;
    private String visibility;
    private List<Long> attendeeIds;
}