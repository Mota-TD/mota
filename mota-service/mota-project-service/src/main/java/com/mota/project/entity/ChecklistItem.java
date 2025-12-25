package com.mota.project.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.mota.common.mybatis.base.BaseEntityDO;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 检查清单项实体
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("checklist_item")
public class ChecklistItem extends BaseEntityDO {

    /**
     * 所属清单ID
     */
    private Long checklistId;

    /**
     * 检查项内容
     */
    private String content;

    /**
     * 是否完成(0-未完成,1-已完成)
     */
    private Integer isCompleted;

    /**
     * 完成人ID
     */
    private Long completedBy;

    /**
     * 完成时间
     */
    private LocalDateTime completedAt;

    /**
     * 负责人ID
     */
    private Long assigneeId;

    /**
     * 截止日期
     */
    private LocalDate dueDate;

    /**
     * 排序顺序
     */
    private Integer sortOrder;

    /**
     * 判断是否已完成
     */
    public boolean isItemCompleted() {
        return isCompleted != null && isCompleted == 1;
    }

    /**
     * 设置完成状态
     */
    public void setItemCompleted(boolean completed) {
        this.isCompleted = completed ? 1 : 0;
    }
}