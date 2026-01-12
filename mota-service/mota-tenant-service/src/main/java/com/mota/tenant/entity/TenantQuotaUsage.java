package com.mota.tenant.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 租户配额使用记录实体
 * 
 * @author mota
 */
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("sys_tenant_quota_usage")
public class TenantQuotaUsage implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 记录ID
     */
    @TableId(type = IdType.ASSIGN_ID)
    private Long id;

    /**
     * 租户ID
     */
    private Long tenantId;

    /**
     * 统计日期
     */
    private LocalDate statDate;

    /**
     * 统计月份（格式：YYYYMM）
     */
    private String statMonth;

    /**
     * 用户数量
     */
    private Integer userCount;

    /**
     * 活跃用户数量
     */
    private Integer activeUserCount;

    /**
     * 项目数量
     */
    private Integer projectCount;

    /**
     * 活跃项目数量
     */
    private Integer activeProjectCount;

    /**
     * 任务数量
     */
    private Integer taskCount;

    /**
     * 已完成任务数量
     */
    private Integer completedTaskCount;

    /**
     * 文档数量
     */
    private Integer documentCount;

    /**
     * 存储使用量（MB）
     */
    private Long storageUsed;

    /**
     * AI调用次数
     */
    private Integer aiCallCount;

    /**
     * AI Token消耗量
     */
    private Long aiTokenUsed;

    /**
     * 知识库文档数量
     */
    private Integer knowledgeDocCount;

    /**
     * 向量存储使用量
     */
    private Long vectorStorageUsed;

    /**
     * API调用次数
     */
    private Integer apiCallCount;

    /**
     * 登录次数
     */
    private Integer loginCount;

    /**
     * 创建时间
     */
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    /**
     * 更新时间
     */
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}