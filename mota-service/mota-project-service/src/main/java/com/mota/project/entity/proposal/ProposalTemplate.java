package com.mota.project.entity.proposal;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * 方案模板实体
 */
@Data
@TableName("ai_proposal_template")
public class ProposalTemplate {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    /**
     * 模板名称
     */
    private String name;
    
    /**
     * 模板描述
     */
    private String description;
    
    /**
     * 模板类型(technical/business/research/report)
     */
    private String templateType;
    
    /**
     * 行业分类
     */
    private String industry;
    
    /**
     * 章节结构(JSON)
     */
    private String sectionStructure;
    
    /**
     * 提示词模板(JSON)
     */
    private String promptTemplates;
    
    /**
     * 默认配置(JSON)
     */
    private String defaultConfig;
    
    /**
     * 示例内容
     */
    private String sampleContent;
    
    /**
     * 使用次数
     */
    private Integer usageCount;
    
    /**
     * 是否系统模板
     */
    private Boolean isSystem;
    
    /**
     * 是否启用
     */
    private Boolean isActive;
    
    /**
     * 创建人ID
     */
    private Long createdBy;
    
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