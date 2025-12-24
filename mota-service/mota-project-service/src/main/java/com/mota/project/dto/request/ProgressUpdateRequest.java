package com.mota.project.dto.request;

import lombok.Data;

/**
 * 进度更新请求 DTO
 */
@Data
public class ProgressUpdateRequest {
    
    /**
     * 进度值 (0-100)
     */
    private Integer progress;
    
    /**
     * 进度备注
     */
    private String note;
}