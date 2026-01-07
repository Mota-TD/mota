package com.mota.api.notify.dto;

import lombok.Data;
import java.io.Serializable;
import java.util.List;

/**
 * 批量发送通知请求DTO
 */
@Data
public class BatchNotificationDTO implements Serializable {
    private static final long serialVersionUID = 1L;
    
    private List<Long> userIds;
    private String type;
    private String title;
    private String content;
    private String link;
}