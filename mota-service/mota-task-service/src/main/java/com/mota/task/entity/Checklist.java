package com.mota.task.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import com.mota.common.mybatis.base.BaseEntityDO;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 检查清单实体
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("checklist")
public class Checklist extends BaseEntityDO {

    /**
     * 租户ID
     */
    @JsonSerialize(using = ToStringSerializer.class)
    private Long tenantId;

    /**
     * 任务ID
     */
    @JsonSerialize(using = ToStringSerializer.class)
    private Long taskId;

    /**
     * 清单名称
     */
    private String name;

    /**
     * 清单标题（别名）
     */
    private String title;

    /**
     * 排序顺序
     */
    private Integer sortOrder;

    /**
     * 检查项总数
     */
    private Integer itemCount;

    /**
     * 已完成检查项数
     */
    private Integer completedCount;
}