package com.mota.user.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 活动动态实体
 */
@Data
@TableName("activity")
public class Activity {

    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 类型
     */
    private String type;

    /**
     * 动作
     */
    private String action;

    /**
     * 目标
     */
    private String target;

    /**
     * 目标ID
     */
    private Long targetId;

    /**
     * 用户ID
     */
    private Long userId;

    /**
     * 项目ID
     */
    private Long projectId;

    /**
     * 时间描述
     */
    private String time;

    /**
     * 创建时间
     */
    private LocalDateTime createdAt;
}