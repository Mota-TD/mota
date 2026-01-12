package com.mota.tenant.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.io.Serial;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 租户套餐实体
 * 
 * @author mota
 */
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("sys_tenant_package")
public class TenantPackage implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 套餐ID
     */
    @TableId(type = IdType.ASSIGN_ID)
    private Long id;

    /**
     * 套餐编码
     */
    private String packageCode;

    /**
     * 套餐名称
     */
    private String packageName;

    /**
     * 套餐类型（0-免费版、1-基础版、2-专业版、3-企业版、4-旗舰版）
     */
    private Integer packageType;

    /**
     * 套餐描述
     */
    private String description;

    /**
     * 月付价格
     */
    private BigDecimal monthlyPrice;

    /**
     * 年付价格
     */
    private BigDecimal yearlyPrice;

    /**
     * 用户数量上限（-1表示无限制）
     */
    private Integer userLimit;

    /**
     * 存储空间上限（MB，-1表示无限制）
     */
    private Long storageLimit;

    /**
     * 项目数量上限（-1表示无限制）
     */
    private Integer projectLimit;

    /**
     * AI调用次数上限（每月，-1表示无限制）
     */
    private Integer aiCallLimit;

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
     * 是否支持自定义域名
     */
    private Boolean customDomainEnabled;

    /**
     * 是否支持SSO登录
     */
    private Boolean ssoEnabled;

    /**
     * 是否支持API访问
     */
    private Boolean apiEnabled;

    /**
     * 是否支持数据导出
     */
    private Boolean dataExportEnabled;

    /**
     * 是否支持审计日志
     */
    private Boolean auditLogEnabled;

    /**
     * 是否支持优先客服
     */
    private Boolean prioritySupportEnabled;

    /**
     * 功能权限列表（JSON格式）
     */
    private String features;

    /**
     * 排序号
     */
    private Integer sortOrder;

    /**
     * 状态（0-禁用、1-启用）
     */
    private Integer status;

    /**
     * 是否推荐
     */
    private Boolean recommended;

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
     * 套餐类型枚举
     */
    public enum PackageType {
        FREE(0, "免费版"),
        BASIC(1, "基础版"),
        PROFESSIONAL(2, "专业版"),
        ENTERPRISE(3, "企业版"),
        FLAGSHIP(4, "旗舰版");

        private final int code;
        private final String desc;

        PackageType(int code, String desc) {
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