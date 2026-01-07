package com.mota.api.ai.dto;

import lombok.Data;
import java.io.Serializable;

/**
 * 文档向量化结果DTO
 */
@Data
public class VectorizeResultDTO implements Serializable {
    private static final long serialVersionUID = 1L;
    
    /**
     * 文档ID
     */
    private Long documentId;
    
    /**
     * 向量ID
     */
    private String vectorId;
    
    /**
     * 向量维度
     */
    private Integer dimensions;
    
    /**
     * 分块数量
     */
    private Integer chunkCount;
    
    /**
     * 是否成功
     */
    private Boolean success;
    
    /**
     * 错误信息
     */
    private String errorMessage;
}