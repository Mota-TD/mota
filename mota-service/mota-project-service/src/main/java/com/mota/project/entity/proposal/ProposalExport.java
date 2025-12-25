package com.mota.project.entity.proposal;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * 方案导出实体 (AG-010 方案导出)
 */
@Data
@TableName("ai_proposal_export")
public class ProposalExport {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    /**
     * 方案ID
     */
    private Long proposalId;
    
    /**
     * 版本ID
     */
    private Long versionId;
    
    /**
     * 导出格式(word/pdf/ppt/html/markdown)
     */
    private String exportFormat;
    
    /**
     * 导出模板ID
     */
    private Long templateId;
    
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
     * 导出状态(pending/processing/completed/failed)
     */
    private String status;
    
    /**
     * 错误信息
     */
    private String errorMessage;
    
    /**
     * 导出配置(JSON)
     */
    private String exportConfig;
    
    /**
     * 下载次数
     */
    private Integer downloadCount;
    
    /**
     * 过期时间
     */
    private LocalDateTime expiresAt;
    
    /**
     * 创建人ID
     */
    private Long createdBy;
    
    /**
     * 创建时间
     */
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
}