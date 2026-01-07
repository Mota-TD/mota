package com.mota.api.notify.dto;

import lombok.Data;
import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 通知DTO
 */
@Data
public class NotificationDTO implements Serializable {
    private static final long serialVersionUID = 1L;
    
    private Long id;
    private Long userId;
    private String type;
    private String title;
    private String content;
    private String link;
    private Boolean isRead;
    private LocalDateTime readAt;
    private LocalDateTime createdAt;
}