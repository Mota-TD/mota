package com.mota.project.entity.proposal;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 方案内容实体 (AG-005 方案生成)
 */
@Data
@TableName("ai_proposal_content")
public class ProposalContent {
    
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
     * 方案类型
     */
    private String proposalType;
    
    /**
     * 方案标题
     */
    private String title;
    
    /**
     * 方案内容(Markdown)
     */
    private String content;
    
    /**
     * 方案内容(HTML)
     */
    private String contentHtml;
    
    /**
     * 方案摘要
     */
    private String summary;
    
    /**
     * 方案大纲(JSON)
     */
    private String outline;
    
    /**
     * 章节结构(JSON)
     */
    private String sections;
    
    /**
     * 关键词(JSON)
     */
    private String keywords;
    
    /**
     * 字数
     */
    private Integer wordCount;
    
    /**
     * 版本号
     */
    private Integer version;
    
    /**
     * 状态(draft/reviewing/approved/archived)
     */
    private String status;
    
    /**
     * 质量评分
     */
    private BigDecimal qualityScore;
    
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