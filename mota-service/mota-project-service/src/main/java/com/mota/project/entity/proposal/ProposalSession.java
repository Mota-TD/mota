package com.mota.project.entity.proposal;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * 方案会话实体 (AG-001 意图识别, AG-009 多轮优化)
 */
@Data
@TableName("ai_proposal_session")
public class ProposalSession {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    /**
     * 会话ID
     */
    private String sessionId;
    
    /**
     * 用户ID
     */
    private Long userId;
    
    /**
     * 团队ID
     */
    private Long teamId;
    
    /**
     * 方案类型(project/technical/marketing/business/report)
     */
    private String proposalType;
    
    /**
     * 方案标题
     */
    private String title;
    
    /**
     * 状态(active/completed/cancelled)
     */
    private String status;
    
    /**
     * 意图分析结果(JSON)
     */
    private String intentAnalysis;
    
    /**
     * 需求摘要
     */
    private String requirementSummary;
    
    /**
     * 上下文信息(JSON)
     */
    private String context;
    
    /**
     * 消息数量
     */
    private Integer messageCount;
    
    /**
     * 总Token数
     */
    private Integer totalTokens;
    
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
    
    /**
     * 完成时间
     */
    private LocalDateTime completedAt;
}