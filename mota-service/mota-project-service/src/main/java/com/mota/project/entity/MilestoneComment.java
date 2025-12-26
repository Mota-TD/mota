package com.mota.project.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.mota.common.mybatis.base.BaseEntityDO;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 里程碑/任务评论和催办实体
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("milestone_comment")
public class MilestoneComment extends BaseEntityDO {

    /**
     * 里程碑ID（评论里程碑时填写）
     */
    private Long milestoneId;

    /**
     * 任务ID（评论任务时填写）
     */
    private Long taskId;

    /**
     * 评论用户ID
     */
    private Long userId;

    /**
     * 评论内容
     */
    private String content;

    /**
     * 评论类型(comment/urge)
     */
    private String type;

    /**
     * 父评论ID（用于回复）
     */
    private Long parentId;

    /**
     * 评论用户信息（非数据库字段）
     */
    @TableField(exist = false)
    private User user;

    /**
     * 评论类型枚举
     */
    public static class Type {
        /**
         * 普通评论
         */
        public static final String COMMENT = "comment";
        /**
         * 催办
         */
        public static final String URGE = "urge";
    }
}