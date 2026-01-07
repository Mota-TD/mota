package com.mota.api.calendar.dto;

import lombok.Data;
import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 日历配置DTO
 */
@Data
public class CalendarConfigDTO implements Serializable {
    private static final long serialVersionUID = 1L;
    
    private Long id;
    private Long userId;
    private String calendarType;
    private String name;
    private String color;
    private Boolean visible;
    private Boolean isDefault;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}