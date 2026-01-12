package com.mota.tenant.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.io.Serial;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 租户账单实体
 * 
 * @author mota
 */
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("sys_tenant_billing")
public class TenantBilling implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 账单ID
     */
    @TableId(type = IdType.ASSIGN_ID)
    private Long id;

    /**
     * 租户ID
     */
    private Long tenantId;

    /**
     * 账单编号
     */
    private String billNo;

    /**
     * 账单类型（1-套餐订阅、2-资源扩展、3-增值服务）
     */
    private Integer billType;

    /**
     * 套餐ID
     */
    private Long packageId;

    /**
     * 套餐名称
     */
    private String packageName;

    /**
     * 计费周期类型（1-月付、2-年付）
     */
    private Integer billingCycle;

    /**
     * 计费开始日期
     */
    private LocalDate billingStartDate;

    /**
     * 计费结束日期
     */
    private LocalDate billingEndDate;

    /**
     * 原价
     */
    private BigDecimal originalAmount;

    /**
     * 折扣金额
     */
    private BigDecimal discountAmount;

    /**
     * 优惠券抵扣
     */
    private BigDecimal couponAmount;

    /**
     * 实付金额
     */
    private BigDecimal payAmount;

    /**
     * 支付状态（0-待支付、1-已支付、2-已取消、3-已退款）
     */
    private Integer payStatus;

    /**
     * 支付方式（1-支付宝、2-微信、3-银行转账、4-对公转账）
     */
    private Integer payMethod;

    /**
     * 支付时间
     */
    private LocalDateTime payTime;

    /**
     * 第三方支付流水号
     */
    private String transactionNo;

    /**
     * 发票状态（0-未开票、1-已申请、2-已开票）
     */
    private Integer invoiceStatus;

    /**
     * 发票ID
     */
    private Long invoiceId;

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
     * 账单类型枚举
     */
    public enum BillType {
        SUBSCRIPTION(1, "套餐订阅"),
        RESOURCE_EXTENSION(2, "资源扩展"),
        VALUE_ADDED_SERVICE(3, "增值服务");

        private final int code;
        private final String desc;

        BillType(int code, String desc) {
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

    /**
     * 支付状态枚举
     */
    public enum PayStatus {
        PENDING(0, "待支付"),
        PAID(1, "已支付"),
        CANCELLED(2, "已取消"),
        REFUNDED(3, "已退款");

        private final int code;
        private final String desc;

        PayStatus(int code, String desc) {
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

    /**
     * 支付方式枚举
     */
    public enum PayMethod {
        ALIPAY(1, "支付宝"),
        WECHAT(2, "微信"),
        BANK_TRANSFER(3, "银行转账"),
        CORPORATE_TRANSFER(4, "对公转账");

        private final int code;
        private final String desc;

        PayMethod(int code, String desc) {
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