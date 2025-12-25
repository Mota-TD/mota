package com.mota.project.entity.proposal;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * 质量检查实体 (AG-008 质量检查)
 */
@Data
@TableName("ai_quality_check")
public class QualityCheck {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    /**
     * 方案ID
     */
    private Long proposalId;
    
    /**
     * 版本ID
     */
    private Long versionId;
    
    /**
     * 检查类型(completeness/consistency/accuracy/format/language)
     */
    private String checkType;
    
    /**
     * 检查项名称
     */
    private String checkItem;
    
    /**
     * 检查结果(pass/warning/fail)
     */
    private String result;
    
    /**
     * 得分(0-100)
     */
    private Integer score;
    
    /**
     * 问题描述
     */
    private String issue;
    
    /**
     * 改进建议
     */
    private String suggestion;
    
    /**
     * 问题位置(章节/段落)
     */
    private String location;
    
    /**
     * 是否已修复
     */
    private Boolean isFixed;
    
    /**
     * 修复时间
     */
    private LocalDateTime fixedAt;
    
    /**
     * 创建时间
     */
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
}