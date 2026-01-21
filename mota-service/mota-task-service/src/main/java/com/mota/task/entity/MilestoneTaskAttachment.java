package com.mota.task.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.mota.common.mybatis.base.BaseEntityDO;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 里程碑任务附件实体（执行方案等）
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("milestone_task_attachment")
public class MilestoneTaskAttachment extends BaseEntityDO {

    /**
     * 任务ID
     */
    private Long taskId;

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
     * 附件类型(execution_plan/other)
     */
    private String attachmentType;

    /**
     * 上传用户ID
     */
    private Long uploadedBy;

    /**
     * 上传用户名称（非数据库字段）
     */
    @TableField(exist = false)
    private String uploaderName;

    /**
     * 附件类型枚举
     */
    public static class AttachmentType {
        /**
         * 执行方案
         */
        public static final String EXECUTION_PLAN = "execution_plan";
        /**
         * 其他附件
         */
        public static final String OTHER = "other";
    }
}