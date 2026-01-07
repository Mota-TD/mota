package com.mota.common.feign.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 知识文件数据传输对象
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KnowledgeFileDTO {
    
    /**
     * 文件ID
     */
    private Long id;
    
    /**
     * 企业ID
     */
    private Long enterpriseId;
    
    /**
     * 项目ID
     */
    private Long projectId;
    
    /**
     * 父文件夹ID
     */
    private Long parentId;
    
    /**
     * 文件名
     */
    private String name;
    
    /**
     * 文件类型
     */
    private String type;
    
    /**
     * 文件大小（字节）
     */
    private Long size;
    
    /**
     * 文件路径
     */
    private String path;
    
    /**
     * 文件内容（文本文件）
     */
    private String content;
    
    /**
     * 是否为文件夹
     */
    private Boolean isFolder;
    
    /**
     * 创建者ID
     */
    private Long creatorId;
    
    /**
     * 创建时间
     */
    private LocalDateTime createdAt;
    
    /**
     * 更新时间
     */
    private LocalDateTime updatedAt;
}