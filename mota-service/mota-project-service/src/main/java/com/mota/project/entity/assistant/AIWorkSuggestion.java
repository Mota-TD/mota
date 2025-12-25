package com.mota.project.entity.assistant;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 工作建议实体
 * AA-003 工作建议推荐
 */
@Data
@TableName("ai_work_suggestion")
public class AIWorkSuggestion {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    /**
     * 用户ID
     */
    private Long userId;
    
    /**
     * 建议类型: priority/deadline/resource/collaboration/efficiency
     */
    private String suggestionType;
    
    /**
     * 建议标题
     */
    private String suggestionTitle;
    
    /**
     * 建议内容
     */
    private String suggestionContent;
    
    /**
     * 建议原因
     */
    private String suggestionReason;
    
    /**
     * 关联类型: task/project/schedule
     */
    private String relatedType;
    
    /**
     * 关联ID
     */
    private Long relatedId;
    
    /**
     * 优先级: 1-5
     */
    private Integer priorityLevel;
    
    /**
     * 影响评分
     */
    private BigDecimal impactScore;
    
    /**
     * 行动项列表(JSON)
     */
    private String actionItems;
    
    /**
     * 是否已读
     */
    private Boolean isRead;
    
    /**
     * 是否采纳
     */
    private Boolean isAccepted;
    
    /**
     * 是否忽略
     */
    private Boolean isDismissed;
    
    /**
     * 反馈评论
     */
    private String feedbackComment;
    
    /**
     * 有效期至
     */
    private LocalDateTime validUntil;
    
    /**
     * 创建时间
     */
    private LocalDateTime createdAt;
}