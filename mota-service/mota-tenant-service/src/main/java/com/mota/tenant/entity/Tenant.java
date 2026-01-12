package com.mota.tenant.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 租户实体
 * 
 * @author mota
 */
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("sys_tenant")
public class Tenant implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 租户ID
     */
    @TableId(type = IdType.ASSIGN_ID)
    private Long id;

    /**
     * 租户编码（唯一标识）
     */
    private String tenantCode;

    /**
     * 租户名称（企业名称）
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
     * 企业规模（1-20人、21-50人、51-100人、101-500人、500人以上）
     */
    private String companySize;

    /**
     * 统一社会信用代码
     */
    private String creditCode;

    /**
     * 营业执照图片
     */
    private String businessLicense;

    /**
     * 套餐ID
     */
    private Long packageId;

    /**
     * 租户状态（0-试用中、1-正式、2-已过期、3-已禁用）
     */
    private Integer status;

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
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    /**
     * 创建人
     */
    @TableField(fill = FieldFill.INSERT)
    private Long createBy;

    /**
     * 更新时间
     */
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    /**
     * 更新人
     */
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private Long updateBy;

    /**
     * 是否删除
     */
    @TableLogic
    private Boolean deleted;

    /**
     * 乐观锁版本号
     */
    @Version
    private Integer version;

    /**
     * 租户状态枚举
     */
    public enum Status {
        TRIAL(0, "试用中"),
        ACTIVE(1, "正式"),
        EXPIRED(2, "已过期"),
        DISABLED(3, "已禁用");

        private final int code;
        private final String desc;

        Status(int code, String desc) {
            this.code = code;
            this.desc = desc;
        }

        public int getCode() {
            return code;
        }

        public String getDesc() {
            return desc;
        }
    }
}