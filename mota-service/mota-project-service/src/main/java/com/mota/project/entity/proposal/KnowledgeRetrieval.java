package com.mota.project.entity.proposal;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * 知识检索实体 (AG-003 知识检索)
 */
@Data
@TableName("ai_knowledge_retrieval")
public class KnowledgeRetrieval {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    /**
     * 会话ID
     */
    private Long sessionId;
    
    /**
     * 需求分析ID
     */
    private Long requirementId;
    
    /**
     * 检索查询
     */
    private String query;
    
    /**
     * 检索类型(semantic/keyword/hybrid)
     */
    private String retrievalType;
    
    /**
     * 知识库ID列表(JSON)
     */
    private String knowledgeBaseIds;
    
    /**
     * 检索结果(JSON)
     */
    private String results;
    
    /**
     * 结果数量
     */
    private Integer resultCount;
    
    /**
     * 相关度阈值
     */
    private java.math.BigDecimal relevanceThreshold;
    
    /**
     * 检索耗时(毫秒)
     */
    private Integer retrievalTime;
    
    /**
     * 创建时间
     */
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
}