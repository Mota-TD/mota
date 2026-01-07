package com.mota.api.knowledge.dto;

import lombok.Data;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 知识文件DTO
 */
@Data
public class KnowledgeFileDTO implements Serializable {
    private static final long serialVersionUID = 1L;
    
    private Long id;
    private String name;
    private String path;
    private String type;
    private Long size;
    private Long categoryId;
    private String categoryName;
    private Long enterpriseId;
    private Long creatorId;
    private String creatorName;
    private List<String> tags;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}