package com.mota.project.entity.proposal;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * 方案参考实体 (AG-004 历史参考)
 */
@Data
@TableName("ai_proposal_reference")
public class ProposalReference {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    /**
     * 方案ID
     */
    private Long proposalId;
    
    /**
     * 参考类型(history/template/knowledge/external)
     */
    private String referenceType;
    
    /**
     * 参考来源ID
     */
    private Long sourceId;
    
    /**
     * 来源类型(proposal/document/knowledge)
     */
    private String sourceType;
    
    /**
     * 参考标题
     */
    private String title;
    
    /**
     * 参考摘要
     */
    private String summary;
    
    /**
     * 参考内容片段
     */
    private String contentSnippet;
    
    /**
     * 相关度得分
     */
    private java.math.BigDecimal relevanceScore;
    
    /**
     * 使用位置(章节)
     */
    private String usedInSection;
    
    /**
     * 是否已使用
     */
    private Boolean isUsed;
    
    /**
     * 创建时间
     */
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
}