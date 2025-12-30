package com.mota.project.dto.request;

import lombok.Data;

import java.util.List;

/**
 * 里程碑任务进度更新请求 DTO
 */
@Data
public class MilestoneTaskProgressUpdateRequest {
    
    /**
     * 进度值 (0-100)
     */
    private Integer progress;
    
    /**
     * 进度描述（支持富文本HTML）
     */
    private String description;
    
    /**
     * 附件列表
     */
    private List<AttachmentInfo> attachments;
    
    /**
     * 附件信息
     */
    @Data
    public static class AttachmentInfo {
        /**
         * 文件名
         */
        private String fileName;
        
        /**
         * 文件路径/URL
         */
        private String filePath;
        
        /**
         * 文件大小（字节）
         */
        private Long fileSize;
        
        /**
         * 文件类型
         */
        private String fileType;
    }
}