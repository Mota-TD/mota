package com.mota.issue.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.mota.common.mybatis.base.BaseEntityDO;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;

/**
 * 迭代实体
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sprint")
public class Sprint extends BaseEntityDO {

    /**
     * 项目ID
     */
    private Long projectId;

    /**
     * 迭代名称
     */
    private String name;

    /**
     * 迭代目标
     */
    private String goal;

    /**
     * 状态
     */
    private String status;

    /**
     * 开始日期
     */
    private LocalDate startDate;

    /**
     * 结束日期
     */
    private LocalDate endDate;

    /**
     * 总故事点数
     */
    private Integer totalPoints;

    /**
     * 已完成故事点数
     */
    private Integer completedPoints;
}