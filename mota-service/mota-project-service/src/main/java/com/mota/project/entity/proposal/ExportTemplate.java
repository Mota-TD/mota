package com.mota.project.entity.proposal;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * 导出模板实体
 */
@Data
@TableName("ai_export_template")
public class ExportTemplate {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    /**
     * 模板名称
     */
    private String name;
    
    /**
     * 模板描述
     */
    private String description;
    
    /**
     * 导出格式(word/pdf/ppt)
     */
    private String exportFormat;
    
    /**
     * 模板文件路径
     */
    private String templatePath;
    
    /**
     * 样式配置(JSON)
     */
    private String styleConfig;
    
    /**
     * 页眉页脚配置(JSON)
     */
    private String headerFooterConfig;
    
    /**
     * 封面配置(JSON)
     */
    private String coverConfig;
    
    /**
     * 目录配置(JSON)
     */
    private String tocConfig;
    
    /**
     * 是否系统模板
     */
    private Boolean isSystem;
    
    /**
     * 是否启用
     */
    private Boolean isActive;
    
    /**
     * 创建人ID
     */
    private Long createdBy;
    
    /**
     * 创建时间
     */
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
    
    /**
     * 更新时间
     */
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}