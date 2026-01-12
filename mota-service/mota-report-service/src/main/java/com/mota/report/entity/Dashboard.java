package com.mota.report.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 仪表盘实体
 * 可视化数据展示面板
 *
 * @author mota
 */
@Data
@TableName("dashboard")
public class Dashboard {

    /**
     * 仪表盘ID
     */
    @TableId(type = IdType.ASSIGN_ID)
    private Long id;

    /**
     * 租户ID
     */
    private Long tenantId;

    /**
     * 仪表盘名称
     */
    private String name;

    /**
     * 仪表盘描述
     */
    private String description;

    /**
     * 仪表盘类型：personal/team/project/system
     */
    private String type;

    /**
     * 关联项目ID（项目仪表盘）
     */
    private Long projectId;

    /**
     * 关联团队ID（团队仪表盘）
     */
    private Long teamId;

    /**
     * 布局配置（JSON）
     * 包含：网格布局、组件位置、大小等
     */
    private String layoutConfig;

    /**
     * 主题配置（JSON）
     * 包含：颜色方案、字体、背景等
     */
    private String themeConfig;

    /**
     * 刷新间隔（秒），0表示不自动刷新
     */
    private Integer refreshInterval;

    /**
     * 是否公开
     */
    private Boolean isPublic;

    /**
     * 是否默认仪表盘
     */
    private Boolean isDefault;

    /**
     * 排序号
     */
    private Integer sortOrder;

    /**
     * 状态：0-禁用，1-启用
     */
    private Integer status;

    /**
     * 查看次数
     */
    private Integer viewCount;

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