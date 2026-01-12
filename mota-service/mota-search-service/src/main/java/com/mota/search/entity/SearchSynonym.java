package com.mota.search.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 搜索同义词实体
 * 用于搜索扩展和纠错
 * 
 * @author mota
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName("search_synonym")
public class SearchSynonym {

    /**
     * 主键ID
     */
    @TableId(type = IdType.ASSIGN_ID)
    private Long id;

    /**
     * 租户ID（null表示全局同义词）
     */
    private Long tenantId;

    /**
     * 原词
     */
    private String word;

    /**
     * 同义词（多个用逗号分隔）
     */
    private String synonyms;

    /**
     * 同义词类型：
     * equivalent - 等价同义词（双向）
     * expansion - 扩展词（单向，原词扩展到同义词）
     * correction - 纠错词（单向，错误词纠正到正确词）
     */
    private String type;

    /**
     * 是否启用
     */
    private Boolean enabled;

    /**
     * 权重（影响搜索结果排序）
     */
    private Double weight;

    /**
     * 备注
     */
    private String remark;

    /**
     * 创建者ID
     */
    private Long creatorId;

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