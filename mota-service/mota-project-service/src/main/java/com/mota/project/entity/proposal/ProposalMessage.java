package com.mota.project.entity.proposal;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * 方案对话消息实体 (AG-009 多轮优化)
 */
@Data
@TableName("ai_proposal_message")
public class ProposalMessage {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    /**
     * 会话ID
     */
    private Long sessionId;
    
    /**
     * 消息角色(user/assistant/system)
     */
    private String role;
    
    /**
     * 消息内容
     */
    private String content;
    
    /**
     * 消息类型(text/requirement/proposal/feedback/suggestion)
     */
    private String messageType;
    
    /**
     * 附件信息(JSON)
     */
    private String attachments;
    
    /**
     * 元数据(JSON)
     */
    private String metadata;
    
    /**
     * Token数量
     */
    private Integer tokenCount;
    
    /**
     * 创建时间
     */
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
}