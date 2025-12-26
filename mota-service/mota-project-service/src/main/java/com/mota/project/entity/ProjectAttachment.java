package com.mota.project.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.mota.common.mybatis.base.BaseEntityDO;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 项目附件实体
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("project_attachment")
public class ProjectAttachment extends BaseEntityDO {

    /**
     * 项目ID
     */
    private Long projectId;

    /**
     * 文件名
     */
    private String fileName;

    /**
     * 文件路径
     */
    private String filePath;

    /**
     * 文件大小(字节)
     */
    private Long fileSize;

    /**
     * 文件类型
     */
    private String fileType;

    /**
     * 上传用户ID
     */
    private Long uploadedBy;

    /**
     * 上传用户信息（非数据库字段）
     */
    @TableField(exist = false)
    private User uploader;
}