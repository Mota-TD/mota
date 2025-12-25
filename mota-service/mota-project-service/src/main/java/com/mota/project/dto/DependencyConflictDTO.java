package com.mota.project.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

/**
 * 依赖冲突检测结果DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DependencyConflictDTO {

    /**
     * 是否存在冲突
     */
    private boolean hasConflict;

    /**
     * 冲突类型
     */
    private String conflictType;

    /**
     * 冲突描述
     */
    private String description;

    /**
     * 冲突的任务ID
     */
    private Long taskId;

    /**
     * 冲突的任务名称
     */
    private String taskName;

    /**
     * 前置任务ID
     */
    private Long predecessorId;

    /**
     * 前置任务名称
     */
    private String predecessorName;

    /**
     * 依赖类型
     */
    private String dependencyType;

    /**
     * 建议的开始日期
     */
    private LocalDate suggestedStartDate;

    /**
     * 建议的结束日期
     */
    private LocalDate suggestedEndDate;

    /**
     * 冲突类型枚举
     */
    public static class ConflictType {
        /**
         * 循环依赖
         */
        public static final String CIRCULAR = "CIRCULAR";
        
        /**
         * 日期冲突 - 后继任务开始日期早于前置任务完成日期
         */
        public static final String DATE_CONFLICT = "DATE_CONFLICT";
        
        /**
         * 状态冲突 - 前置任务未完成但后继任务已开始
         */
        public static final String STATUS_CONFLICT = "STATUS_CONFLICT";
        
        /**
         * 延迟冲突 - 考虑延迟天数后的日期冲突
         */
        public static final String LAG_CONFLICT = "LAG_CONFLICT";
    }
}