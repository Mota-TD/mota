package com.mota.project.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.mota.common.mybatis.base.BaseEntityDO;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 工作计划实体
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("work_plan")
public class WorkPlan extends BaseEntityDO {

    /**
     * 所属部门任务ID
     */
    private Long departmentTaskId;

    /**
     * 计划概述
     */
    private String summary;

    /**
     * 资源需求说明
     */
    private String resourceRequirement;

    /**
     * 计划状态(draft/submitted/approved/rejected)
     */
    private String status;

    /**
     * 提交人ID
     */
    private Long submittedBy;

    /**
     * 提交时间
     */
    private LocalDateTime submittedAt;

    /**
     * 审批人ID
     */
    private Long reviewedBy;

    /**
     * 审批时间
     */
    private LocalDateTime reviewedAt;

    /**
     * 审批意见
     */
    private String reviewComment;

    /**
     * 版本号
     */
    private Integer version;

    /**
     * 工作计划状态枚举
     */
    public static class Status {
        public static final String DRAFT = "draft";
        public static final String SUBMITTED = "submitted";
        public static final String APPROVED = "approved";
        public static final String REJECTED = "rejected";
    }
}