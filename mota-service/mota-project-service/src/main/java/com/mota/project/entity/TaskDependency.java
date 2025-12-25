package com.mota.project.entity;

import com.baomidou.mybatisplus.annotation.TableName;
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
     * 前置任务ID
     */
    private Long predecessorId;

    /**
     * 后继任务ID
     */
    private Long successorId;

    /**
     * 依赖类型(FS-完成后开始/SS-同时开始/FF-同时完成/SF-开始后完成)
     */
    private String dependencyType;

    /**
     * 延迟天数(可为负数表示提前)
     */
    private Integer lagDays;

    /**
     * 依赖说明
     */
    private String description;

    /**
     * 依赖类型枚举
     */
    public static class DependencyType {
        /**
         * Finish-to-Start: 前置任务完成后，后继任务才能开始
         */
        public static final String FS = "FS";
        
        /**
         * Start-to-Start: 前置任务开始后，后继任务才能开始
         */
        public static final String SS = "SS";
        
        /**
         * Finish-to-Finish: 前置任务完成后，后继任务才能完成
         */
        public static final String FF = "FF";
        
        /**
         * Start-to-Finish: 前置任务开始后，后继任务才能完成
         */
        public static final String SF = "SF";
    }
}