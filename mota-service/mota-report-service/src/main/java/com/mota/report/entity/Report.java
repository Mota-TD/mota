package com.mota.report.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 报表实例实体
 * 基于模板生成的具体报表
 *
 * @author mota
 */
@Data
@TableName("report")
public class Report {

    /**
     * 报表ID
     */
    @TableId(type = IdType.ASSIGN_ID)
    private Long id;

    /**
     * 租户ID
     */
    private Long tenantId;

    /**
     * 报表模板ID
     */
    private Long templateId;

    /**
     * 报表名称
     */
    private String name;

    /**
     * 报表描述
     */
    private String description;

    /**
     * 报表类型：manual/scheduled/triggered
     */
    private String generateType;

    /**
     * 查询参数（JSON）
     */
    private String queryParams;

    /**
     * 数据快照（JSON）
     * 存储生成时的数据，用于历史查看
     */
    private String dataSnapshot;

    /**
     * 报表状态：pending/generating/completed/failed
     */
    private String status;

    /**
     * 错误信息
     */
    private String errorMessage;

    /**
     * 生成开始时间
     */
    private LocalDateTime generateStartTime;

    /**
     * 生成结束时间
     */
    private LocalDateTime generateEndTime;

    /**
     * 生成耗时（毫秒）
     */
    private Long generateDuration;

    /**
     * 数据行数
     */
    private Integer dataRowCount;

    /**
     * 文件路径（导出后的文件）
     */
    private String filePath;

    /**
     * 文件格式
     */
    private String fileFormat;

    /**
     * 文件大小（字节）
     */
    private Long fileSize;

    /**
     * 过期时间
     */
    private LocalDateTime expireAt;

    /**
     * 查看次数
     */
    private Integer viewCount;

    /**
     * 下载次数
     */
    private Integer downloadCount;

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

    /**
     * 是否删除
     */
    @TableLogic
    private Boolean deleted;
}