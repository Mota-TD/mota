package com.mota.tenant.dto;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 租户视图对象
 * 
 * @author mota
 */
@Data
public class TenantVO {

    /**
     * 租户ID
     */
    private Long id;

    /**
     * 租户编码
     */
    private String tenantCode;

    /**
     * 租户名称
     */
    private String tenantName;

    /**
     * 租户简称
     */
    private String shortName;

    /**
     * 租户Logo
     */
    private String logo;

    /**
     * 联系人姓名
     */
    private String contactName;

    /**
     * 联系人手机
     */
    private String contactPhone;

    /**
     * 联系人邮箱
     */
    private String contactEmail;

    /**
     * 企业地址
     */
    private String address;

    /**
     * 行业类型
     */
    private String industry;

    /**
     * 企业规模
     */
    private String companySize;

    /**
     * 套餐ID
     */
    private Long packageId;

    /**
     * 套餐名称
     */
    private String packageName;

    /**
     * 租户状态（0-试用中、1-正式、2-已过期、3-已禁用）
     */
    private Integer status;

    /**
     * 状态描述
     */
    private String statusDesc;

    /**
     * 试用开始日期
     */
    private LocalDate trialStartDate;

    /**
     * 试用结束日期
     */
    private LocalDate trialEndDate;

    /**
     * 正式开始日期
     */
    private LocalDate startDate;

    /**
     * 正式结束日期
     */
    private LocalDate endDate;

    /**
     * 用户数量上限
     */
    private Integer userLimit;

    /**
     * 当前用户数量
     */
    private Integer userCount;

    /**
     * 存储空间上限（MB）
     */
    private Long storageLimit;

    /**
     * 已使用存储空间（MB）
     */
    private Long storageUsed;

    /**
     * 项目数量上限
     */
    private Integer projectLimit;

    /**
     * 当前项目数量
     */
    private Integer projectCount;

    /**
     * AI调用次数上限（每月）
     */
    private Integer aiCallLimit;

    /**
     * 当前月AI调用次数
     */
    private Integer aiCallCount;

    /**
     * 是否启用AI功能
     */
    private Boolean aiEnabled;

    /**
     * 是否启用知识库功能
     */
    private Boolean knowledgeEnabled;

    /**
     * 是否启用高级报表
     */
    private Boolean advancedReportEnabled;

    /**
     * 自定义域名
     */
    private String customDomain;

    /**
     * 备注
     */
    private String remark;

    /**
     * 创建时间
     */
    private LocalDateTime createTime;

    /**
     * 剩余天数
     */
    private Integer remainingDays;

    /**
     * 用户使用率（百分比）
     */
    private Double userUsageRate;

    /**
     * 存储使用率（百分比）
     */
    private Double storageUsageRate;

    /**
     * 项目使用率（百分比）
     */
    private Double projectUsageRate;

    /**
     * AI调用使用率（百分比）
     */
    private Double aiCallUsageRate;
}