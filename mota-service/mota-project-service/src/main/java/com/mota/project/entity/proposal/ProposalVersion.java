package com.mota.project.entity.proposal;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * 方案版本实体 (AG-009 多轮优化)
 */
@Data
@TableName("ai_proposal_version")
public class ProposalVersion {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    /**
     * 方案ID
     */
    private Long proposalId;
    
    /**
     * 版本号
     */
    private String versionNumber;
    
    /**
     * 版本类型(draft/review/final)
     */
    private String versionType;
    
    /**
     * 内容快照(JSON)
     */
    private String contentSnapshot;
    
    /**
     * 变更说明
     */
    private String changeDescription;
    
    /**
     * 变更类型(auto/manual/ai_optimize)
     */
    private String changeType;
    
    /**
     * 质量得分
     */
    private Integer qualityScore;
    
    /**
     * 是否当前版本
     */
    private Boolean isCurrent;
    
    /**
     * 创建人ID
     */
    private Long createdBy;
    
    /**
     * 创建时间
     */
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
}