package com.mota.api.knowledge.dto;

import lombok.Data;
import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 模板DTO
 */
@Data
public class TemplateDTO implements Serializable {
    private static final long serialVersionUID = 1L;
    
    private Long id;
    private String name;
    private String type;
    private String content;
    private Long enterpriseId;
    private Long creatorId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}