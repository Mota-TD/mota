package com.mota.project.dto.request;

import lombok.Data;

/**
 * 状态更新请求 DTO
 */
@Data
public class StatusUpdateRequest {
    
    /**
     * 状态值
     */
    private String status;
}