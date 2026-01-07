package com.mota.api.knowledge.dto;

import lombok.Data;
import java.io.Serializable;
import java.util.List;

/**
 * 上传文件请求DTO
 */
@Data
public class UploadFileDTO implements Serializable {
    private static final long serialVersionUID = 1L;
    
    private String name;
    private String content;
    private String type;
    private Long categoryId;
    private Long enterpriseId;
    private Long creatorId;
    private List<String> tags;
}