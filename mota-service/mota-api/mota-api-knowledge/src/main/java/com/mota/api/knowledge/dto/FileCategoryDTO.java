package com.mota.api.knowledge.dto;

import lombok.Data;
import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 文件分类DTO
 */
@Data
public class FileCategoryDTO implements Serializable {
    private static final long serialVersionUID = 1L;
    
    private Long id;
    private String name;
    private Long parentId;
    private Long enterpriseId;
    private Integer sortOrder;
    private LocalDateTime createdAt;
}