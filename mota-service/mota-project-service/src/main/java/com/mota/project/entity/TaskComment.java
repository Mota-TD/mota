package com.mota.project.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.extension.handlers.JacksonTypeHandler;
import com.mota.common.mybatis.base.BaseEntityDO;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.List;

/**
 * 任务评论实体
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName(value = "task_comment", autoResultMap = true)
public class TaskComment extends BaseEntityDO {

    /**
     * 所属任务ID
     */
    private Long taskId;

    /**
     * 父评论ID(用于回复)
     */
    private Long parentId;

    /**
     * 评论人ID
     */
    private Long userId;

    /**
     * 评论内容
     */
    private String content;

    /**
     * @提及的用户ID列表
     */
    @TableField(typeHandler = JacksonTypeHandler.class)
    private List<Long> mentionedUsers;

    /**
     * 点赞数
     */
    private Integer likeCount;
}