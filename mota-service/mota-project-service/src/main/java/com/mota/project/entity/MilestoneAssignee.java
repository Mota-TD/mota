package com.mota.project.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.mota.common.mybatis.base.BaseEntityDO;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 里程碑负责人关联实体
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("milestone_assignee")
public class MilestoneAssignee extends BaseEntityDO {

    /**
     * 里程碑ID
     */
    private Long milestoneId;

    /**
     * 负责人用户ID
     */
    private Long userId;

    /**
     * 是否主负责人
     */
    private Boolean isPrimary;

    /**
     * 分配时间
     */
    private LocalDateTime assignedAt;

    /**
     * 分配人ID
     */
    private Long assignedBy;

    /**
     * 用户名称（非数据库字段）
     */
    @TableField(exist = false)
    private String userName;

    /**
     * 用户头像（非数据库字段）
     */
    @TableField(exist = false)
    private String userAvatar;
}