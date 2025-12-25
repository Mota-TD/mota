package com.mota.project.entity.search;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * 文档向量实体 (SS-003 向量检索)
 */
@Data
@TableName("document_vector")
public class DocumentVector {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    /**
     * 文档ID
     */
    private Long documentId;
    
    /**
     * 文档类型
     */
    private String documentType;
    
    /**
     * 分块索引
     */
    private Integer chunkIndex;
    
    /**
     * 原始文本内容
     */
    private String contentText;
    
    /**
     * 向量数据(二进制存储)
     */
    private byte[] vectorData;
    
    /**
     * 向量维度
     */
    private Integer vectorDimension;
    
    /**
     * 嵌入模型
     */
    private String embeddingModel;
    
    /**
     * 元数据(JSON)
     */
    private String metadata;
    
    /**
     * 创建时间
     */
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
    
    /**
     * 更新时间
     */
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}