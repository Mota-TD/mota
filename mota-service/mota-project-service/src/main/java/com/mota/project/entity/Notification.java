package com.mota.project.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 通知实体
 * 支持通知聚合、智能分类、置顶、折叠等功能
 */
@Data
@TableName("notification")
public class Notification {

    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 通知类型: task_assigned, task_completed, comment_added,
     * milestone_reached, deadline_reminder, mention, system,
     * plan_submitted, plan_approved, plan_rejected, feedback_received,
     * deliverable_uploaded, project_update, member_joined
     */
    private String type;

    /**
     * 通知分类: task, project, comment, system, reminder, plan, feedback
     */
    private String category;

    /**
     * 标题
     */
    private String title;

    /**
     * 内容
     */
    private String content;

    /**
     * 用户ID
     */
    private Long userId;

    /**
     * 是否已读
     */
    private Integer isRead;

    /**
     * 是否置顶
     */
    private Integer isPinned;

    /**
     * 是否折叠
     */
    private Integer isCollapsed;

    /**
     * 关联ID
     */
    private Long relatedId;

    /**
     * 关联类型: task, project, comment, milestone
     */
    private String relatedType;

    /**
     * 聚合分组键 - 用于将相似通知聚合在一起
     * 格式: {category}_{relatedType}_{relatedId} 或 {category}_{type}_{date}
     */
    private String groupKey;

    /**
     * 聚合计数 - 该组中的通知数量
     */
    private Integer aggregatedCount;

    /**
     * 优先级: low, normal, high, urgent
     */
    private String priority;

    /**
     * AI分类: important, normal, low_priority, spam
     */
    private String aiClassification;

    /**
     * AI重要性评分 0-100
     */
    private Integer aiScore;

    /**
     * 发送者ID
     */
    private Long senderId;

    /**
     * 发送者名称
     */
    private String senderName;

    /**
     * 发送者头像
     */
    private String senderAvatar;

    /**
     * 项目ID
     */
    private Long projectId;

    /**
     * 项目名称
     */
    private String projectName;

    /**
     * 操作URL - 点击通知后跳转的地址
     */
    private String actionUrl;

    /**
     * 额外数据 - JSON格式存储额外信息
     */
    private String extraData;

    /**
     * 是否已发送邮件
     */
    private Integer emailSent;

    /**
     * 邮件发送时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime emailSentAt;

    /**
     * 是否已发送推送
     */
    private Integer pushSent;

    /**
     * 推送发送时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime pushSentAt;

    /**
     * 创建时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;

    /**
     * 更新时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updatedAt;

    /**
     * 聚合的子通知列表（非数据库字段）
     */
    @TableField(exist = false)
    private List<Notification> aggregatedNotifications;
}