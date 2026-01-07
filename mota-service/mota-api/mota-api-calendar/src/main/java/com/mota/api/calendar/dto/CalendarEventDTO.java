package com.mota.api.calendar.dto;

import lombok.Data;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 日历事件DTO
 */
@Data
public class CalendarEventDTO implements Serializable {
    private static final long serialVersionUID = 1L;
    
    private Long id;
    private String title;
    private String description;
    private String eventType;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Boolean allDay;
    private String location;
    private String color;
    private Long creatorId;
    private String creatorName;
    private Long projectId;
    private String projectName;
    private Long taskId;
    private Long milestoneId;
    private String recurrenceRule;
    private LocalDateTime recurrenceEndDate;
    private Integer reminderMinutes;
    private String visibility;
    private String status;
    private List<AttendeeDTO> attendees;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    @Data
    public static class AttendeeDTO implements Serializable {
        private static final long serialVersionUID = 1L;
        
        private Long userId;
        private String userName;
        private String userAvatar;
        private String responseStatus;
        private Boolean required;
    }
}