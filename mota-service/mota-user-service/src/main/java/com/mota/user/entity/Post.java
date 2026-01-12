package com.mota.user.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.mota.common.mybatis.base.BaseEntityDO;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 岗位实体
 * 
 * @author mota
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_post")
public class Post extends BaseEntityDO {

    /**
     * 岗位名称
     */
    private String name;

    /**
     * 岗位编码
     */
    private String code;

    /**
     * 岗位层级（1高层 2中层 3基层）
     */
    private Integer level;

    /**
     * 显示顺序
     */
    private Integer sort;

    /**
     * 状态（1正常 0停用）
     */
    private Integer status;

    /**
     * 岗位职责描述
     */
    private String duties;

    /**
     * 备注
     */
    private String remark;
}