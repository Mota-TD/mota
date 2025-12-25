package com.mota.project.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

/**
 * 关键路径计算结果DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CriticalPathDTO {

    /**
     * 关键路径上的任务ID列表
     */
    private List<Long> criticalTaskIds;

    /**
     * 关键路径上的任务详情
     */
    private List<CriticalTaskInfo> criticalTasks;

    /**
     * 项目总工期（天）
     */
    private int projectDuration;

    /**
     * 项目最早开始日期
     */
    private LocalDate projectStartDate;

    /**
     * 项目最早完成日期
     */
    private LocalDate projectEndDate;

    /**
     * 关键路径任务信息
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CriticalTaskInfo {
        /**
         * 任务ID
         */
        private Long taskId;

        /**
         * 任务名称
         */
        private String taskName;

        /**
         * 最早开始时间 (ES)
         */
        private int earliestStart;

        /**
         * 最早完成时间 (EF)
         */
        private int earliestFinish;

        /**
         * 最晚开始时间 (LS)
         */
        private int latestStart;

        /**
         * 最晚完成时间 (LF)
         */
        private int latestFinish;

        /**
         * 浮动时间 (Slack)
         */
        private int slack;

        /**
         * 任务工期
         */
        private int duration;

        /**
         * 开始日期
         */
        private LocalDate startDate;

        /**
         * 结束日期
         */
        private LocalDate endDate;

        /**
         * 是否在关键路径上
         */
        private boolean isCritical;
    }
}