package com.mota.api.ai.dto;

import lombok.Data;
import java.io.Serializable;
import java.util.List;

/**
 * 文档摘要DTO
 */
@Data
public class SummaryDTO implements Serializable {
    private static final long serialVersionUID = 1L;
    
    /**
     * 摘要内容
     */
    private String summary;
    
    /**
     * 关键词
     */
    private List<String> keywords;
    
    /**
     * 主题
     */
    private String topic;
    
    /**
     * 字数
     */
    private Integer wordCount;
}