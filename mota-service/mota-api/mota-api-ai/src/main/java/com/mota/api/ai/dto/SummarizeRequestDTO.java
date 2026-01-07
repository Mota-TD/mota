package com.mota.api.ai.dto;

import lombok.Data;
import java.io.Serializable;

/**
 * 文档摘要请求DTO
 */
@Data
public class SummarizeRequestDTO implements Serializable {
    private static final long serialVersionUID = 1L;
    
    /**
     * 文档ID
     */
    private Long documentId;
    
    /**
     * 文档内容
     */
    private String content;
    
    /**
     * 摘要长度
     */
    private Integer maxLength;
    
    /**
     * 语言
     */
    private String language;
}