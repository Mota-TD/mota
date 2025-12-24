package com.mota.project.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.extension.handlers.JacksonTypeHandler;
import com.mota.common.mybatis.base.BaseEntityDO;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * 进度汇报实体
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName(value = "progress_report", autoResultMap = true)
public class ProgressReport extends BaseEntityDO {

    /**
     * 关联项目ID
     */
    private Long projectId;

    /**
     * 关联部门任务ID
     */
    private Long departmentTaskId;

    /**
     * 汇报类型(daily/weekly/milestone/adhoc)
     */
    private String reportType;

    /**
     * 汇报人ID
     */
    private Long reporterId;

    /**
     * 汇报周期开始
     */
    private LocalDate reportPeriodStart;

    /**
     * 汇报周期结束
     */
    private LocalDate reportPeriodEnd;

    /**
     * 已完成工作
     */
    private String completedWork;

    /**
     * 计划工作
     */
    private String plannedWork;

    /**
     * 问题与风险
     */
    private String issuesRisks;

    /**
     * 需要的支持
     */
    private String supportNeeded;

    /**
     * 关联任务进度快照
     */
    @TableField(typeHandler = JacksonTypeHandler.class)
    private Map<String, Integer> taskProgress;

    /**
     * 汇报接收人ID列表
     */
    @TableField(typeHandler = JacksonTypeHandler.class)
    private List<Long> recipients;

    /**
     * 状态(draft/submitted/read)
     */
    private String status;

    /**
     * 提交时间
     */
    private LocalDateTime submittedAt;

    /**
     * 汇报类型枚举
     */
    public static class ReportType {
        public static final String DAILY = "daily";
        public static final String WEEKLY = "weekly";
        public static final String MILESTONE = "milestone";
        public static final String ADHOC = "adhoc";
    }

    /**
     * 状态枚举
     */
    public static class Status {
        public static final String DRAFT = "draft";
        public static final String SUBMITTED = "submitted";
        public static final String READ = "read";
    }
}