package com.mota.user.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 通知实体
 */
@Data
@TableName("notification")
public class Notification {

    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 类型
     */
    private String type;

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
     * 关联ID
     */
    private Long relatedId;

    /**
     * 关联类型
     */
    private String relatedType;

    /**
     * 创建时间
     */
    private LocalDateTime createdAt;
}