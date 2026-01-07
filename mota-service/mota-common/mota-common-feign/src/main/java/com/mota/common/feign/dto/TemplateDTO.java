package com.mota.common.feign.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 模板数据传输对象
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TemplateDTO {
    
    /**
     * 模板ID
     */
    private Long id;
    
    /**
     * 企业ID（null表示系统模板）
     */
    private Long enterpriseId;
    
    /**
     * 模板名称
     */
    private String name;
    
    /**
     * 模板类型
     */
    private String type;
    
    /**
     * 模板分类
     */
    private String category;
    
    /**
     * 模板内容
     */
    private String content;
    
    /**
     * 模板描述
     */
    private String description;
    
    /**
     * 使用次数
     */
    private Integer useCount;
    
    /**
     * 是否为系统模板
     */
    private Boolean isSystem;
    
    /**
     * 创建者ID
     */
    private Long creatorId;
    
    /**
     * 创建时间
     */
    private LocalDateTime createdAt;
    
    /**
     * 更新时间
     */
    private LocalDateTime updatedAt;
}