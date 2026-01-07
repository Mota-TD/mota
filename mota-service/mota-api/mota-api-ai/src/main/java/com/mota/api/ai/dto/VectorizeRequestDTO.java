package com.mota.api.ai.dto;

import lombok.Data;
import java.io.Serializable;

/**
 * 文档向量化请求DTO
 */
@Data
public class VectorizeRequestDTO implements Serializable {
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
     * 文档类型
     */
    private String documentType;
    
    /**
     * 企业ID
     */
    private Long enterpriseId;
    
    /**
     * 是否覆盖已有向量
     */
    private Boolean overwrite;
}