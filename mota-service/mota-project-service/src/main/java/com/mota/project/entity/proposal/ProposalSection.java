package com.mota.project.entity.proposal;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * 方案章节实体 (AG-006 章节编排)
 */
@Data
@TableName("ai_proposal_section")
public class ProposalSection {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    /**
     * 方案ID
     */
    private Long proposalId;
    
    /**
     * 父章节ID
     */
    private Long parentId;
    
    /**
     * 章节编号
     */
    private String sectionNumber;
    
    /**
     * 章节标题
     */
    private String title;
    
    /**
     * 章节内容
     */
    private String content;
    
    /**
     * 层级
     */
    private Integer level;
    
    /**
     * 排序
     */
    private Integer sortOrder;
    
    /**
     * 字数
     */
    private Integer wordCount;
    
    /**
     * 是否AI生成
     */
    private Boolean isGenerated;
    
    /**
     * 是否已编辑
     */
    private Boolean isEdited;
    
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