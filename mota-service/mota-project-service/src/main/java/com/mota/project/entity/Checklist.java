package com.mota.project.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.mota.common.mybatis.base.BaseEntityDO;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.List;

/**
 * 检查清单实体
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("checklist")
public class Checklist extends BaseEntityDO {

    /**
     * 所属任务ID
     */
    private Long taskId;

    /**
     * 清单名称
     */
    private String name;

    /**
     * 排序顺序
     */
    private Integer sortOrder;

    /**
     * 清单项列表（非数据库字段）
     */
    @TableField(exist = false)
    private List<ChecklistItem> items;

    /**
     * 完成进度（非数据库字段）
     */
    @TableField(exist = false)
    private Integer completedCount;

    /**
     * 总数（非数据库字段）
     */
    @TableField(exist = false)
    private Integer totalCount;
}