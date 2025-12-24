package com.mota.project.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 工作计划附件实体
 */
@Data
@TableName("work_plan_attachment")
public class WorkPlanAttachment implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 主键ID
     */
    @TableId(type = IdType.ASSIGN_ID)
    private Long id;

    /**
     * 所属工作计划ID
     */
    private Long workPlanId;

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