package com.mota.api.notify.dto;

import lombok.Data;
import java.io.Serializable;

/**
 * 发送通知请求DTO
 */
@Data
public class SendNotificationDTO implements Serializable {
    private static final long serialVersionUID = 1L;
    
    private Long userId;
    private String type;
    private String title;
    private String content;
    private String link;
}