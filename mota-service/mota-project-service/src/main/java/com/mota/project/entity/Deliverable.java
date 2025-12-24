package com.mota.project.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 任务交付物实体
 */
@Data
@TableName("deliverable")
public class Deliverable implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 主键ID
     */
    @TableId(type = IdType.ASSIGN_ID)
    private Long id;

    /**
     * 所属任务ID
     */
    private Long taskId;

    /**
     * 交付物名称
     */
    private String name;

    /**
     * 文件名
     */
    private String fileName;

    /**
     * 文件URL
     */
    private String fileUrl;

    /**
     * 文件大小(字节)
     */
    private Long fileSize;

    /**
     * 文件类型
     */
    private String fileType;

    /**
     * 交付物说明
     */
    private String description;

    /**
     * 上传人ID
     */
    private Long uploadedBy;

    /**
     * 创建时间
     */
    private LocalDateTime createdAt;

    /**
     * 删除标记(0-未删除,1-已删除)
     */
    private Integer deleted;
}