package com.mota.api.ai.dto;

import lombok.Data;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 方案内容DTO
 */
@Data
public class ProposalContentDTO implements Serializable {
    private static final long serialVersionUID = 1L;
    
    /**
     * 方案ID
     */
    private Long id;
    
    /**
     * 方案标题
     */
    private String title;
    
    /**
     * 方案内容
     */
    private String content;
    
    /**
     * 章节列表
     */
    private List<SectionDTO> sections;
    
    /**
     * 版本号
     */
    private Integer version;
    
    /**
     * 创建时间
     */
    private LocalDateTime createdAt;
    
    @Data
    public static class SectionDTO implements Serializable {
        private static final long serialVersionUID = 1L;
        
        private String title;
        private String content;
        private Integer order;
    }
}