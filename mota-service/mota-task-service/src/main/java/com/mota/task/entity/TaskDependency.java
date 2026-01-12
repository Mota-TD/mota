package com.mota.task.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import com.mota.common.mybatis.base.BaseEntityDO;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 任务依赖关系实体
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("task_dependency")
public class TaskDependency extends BaseEntityDO {

    /**
     * 租户ID
     */
    @JsonSerialize(using = ToStringSerializer.class)
    private Long tenantId;

    /**
     * 项目ID
     */
    @JsonSerialize(using = ToStringSerializer.class)
    private Long projectId;

    /**
     * 任务ID（别名，等同于 successorId）
     */
    @JsonSerialize(using = ToStringSerializer.class)
    private Long taskId;

    /**
     * 前置任务ID（被依赖的任务）
     */
    @JsonSerialize(using = ToStringSerializer.class)
    private Long predecessorId;

    /**
     * 后续任务ID（依赖其他任务的任务）
     */
    @JsonSerialize(using = ToStringSerializer.class)
    private Long successorId;

    /**
     * 依赖类型
     * FS: 完成-开始（Finish-to-Start）
     * SS: 开始-开始（Start-to-Start）
     * FF: 完成-完成（Finish-to-Finish）
     * SF: 开始-完成（Start-to-Finish）
     */
    private String dependencyType;

    /**
     * 延迟天数（正数表示延迟，负数表示提前）
     */
    private Integer lagDays;

    /**
     * 依赖类型枚举
     */
    public static class DependencyType {
        /**
         * 完成-开始：前置任务完成后，后续任务才能开始
         */
        public static final String FINISH_TO_START = "FS";
        
        /**
         * 开始-开始：前置任务开始后，后续任务才能开始
         */
        public static final String START_TO_START = "SS";
        
        /**
         * 完成-完成：前置任务完成后，后续任务才能完成
         */
        public static final String FINISH_TO_FINISH = "FF";
        
        /**
         * 开始-完成：前置任务开始后，后续任务才能完成
         */
        public static final String START_TO_FINISH = "SF";
    }
}