package com.mota.report.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 报表模板实体
 * 定义报表的结构、数据源、样式等
 *
 * @author mota
 */
@Data
@TableName("report_template")
public class ReportTemplate {

    /**
     * 模板ID
     */
    @TableId(type = IdType.ASSIGN_ID)
    private Long id;

    /**
     * 租户ID
     */
    private Long tenantId;

    /**
     * 模板名称
     */
    private String name;

    /**
     * 模板编码（唯一标识）
     */
    private String code;

    /**
     * 模板描述
     */
    private String description;

    /**
     * 模板类型：table/chart/mixed/dashboard
     */
    private String type;

    /**
     * 模板分类：project/task/resource/performance/custom
     */
    private String category;

    /**
     * 数据源配置（JSON）
     * 包含：数据来源服务、查询条件、字段映射等
     */
    private String dataSourceConfig;

    /**
     * 布局配置（JSON）
     * 包含：列定义、排序、分组、汇总等
     */
    private String layoutConfig;

    /**
     * 样式配置（JSON）
     * 包含：字体、颜色、边框、对齐等
     */
    private String styleConfig;

    /**
     * 图表配置（JSON）
     * 包含：图表类型、系列、坐标轴等
     */
    private String chartConfig;

    /**
     * 参数配置（JSON）
     * 包含：可配置的查询参数定义
     */
    private String paramConfig;

    /**
     * 导出格式支持：excel,pdf,word,html
     */
    private String exportFormats;

    /**
     * 是否系统模板
     */
    private Boolean isSystem;

    /**
     * 是否公开（租户内共享）
     */
    private Boolean isPublic;

    /**
     * 使用次数
     */
    private Integer usageCount;

    /**
     * 状态：0-禁用，1-启用
     */
    private Integer status;

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
     * 更新人ID
     */
    private Long updatedBy;

    /**
     * 更新时间
     */
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;

    /**
     * 是否删除
     */
    @TableLogic
    private Boolean deleted;

    /**
     * 版本号（乐观锁）
     */
    @Version
    private Integer version;
}