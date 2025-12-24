package com.mota.project.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.mota.common.mybatis.base.BaseEntityDO;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 项目里程碑实体
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("milestone")
public class Milestone extends BaseEntityDO {

    /**
     * 所属项目ID
     */
    private Long projectId;

    /**
     * 里程碑名称
     */
    private String name;

    /**
     * 里程碑描述
     */
    private String description;

    /**
     * 目标日期
     */
    private LocalDate targetDate;

    /**
     * 状态(pending/completed/delayed)
     */
    private String status;

    /**
     * 完成时间
     */
    private LocalDateTime completedAt;

    /**
     * 排序顺序
     */
    private Integer sortOrder;

    /**
     * 里程碑状态枚举
     */
    public static class Status {
        public static final String PENDING = "pending";
        public static final String COMPLETED = "completed";
        public static final String DELAYED = "delayed";
    }
}