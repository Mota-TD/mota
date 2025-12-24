package com.mota.project.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.mota.common.mybatis.base.BaseEntityDO;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 工作反馈实体
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("work_feedback")
public class WorkFeedback extends BaseEntityDO {

    /**
     * 关联项目ID
     */
    private Long projectId;

    /**
     * 关联任务ID
     */
    private Long taskId;

    /**
     * 反馈类型(guidance/evaluation/problem/collaboration/report)
     */
    private String feedbackType;

    /**
     * 发起人ID
     */
    private Long fromUserId;

    /**
     * 接收人ID
     */
    private Long toUserId;

    /**
     * 反馈标题
     */
    private String title;

    /**
     * 反馈内容
     */
    private String content;

    /**
     * 评价等级(1-5)
     */
    private Integer rating;

    /**
     * 是否需要回复(0-否,1-是)
     */
    private Integer requireReply;

    /**
     * 状态(pending/read/replied)
     */
    private String status;

    /**
     * 回复内容
     */
    private String replyContent;

    /**
     * 回复时间
     */
    private LocalDateTime repliedAt;

    /**
     * 反馈类型枚举
     */
    public static class FeedbackType {
        public static final String GUIDANCE = "guidance";
        public static final String EVALUATION = "evaluation";
        public static final String PROBLEM = "problem";
        public static final String COLLABORATION = "collaboration";
        public static final String REPORT = "report";
    }

    /**
     * 状态枚举
     */
    public static class Status {
        public static final String PENDING = "pending";
        public static final String READ = "read";
        public static final String REPLIED = "replied";
    }
}