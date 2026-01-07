package com.mota.api.ai.dto;

import lombok.Data;
import java.io.Serializable;

/**
 * 创建方案会话请求DTO
 */
@Data
public class CreateProposalSessionDTO implements Serializable {
    private static final long serialVersionUID = 1L;
    
    /**
     * 用户ID
     */
    private Long userId;
    
    /**
     * 项目ID
     */
    private Long projectId;
    
    /**
     * 方案类型
     */
    private String proposalType;
    
    /**
     * 方案标题
     */
    private String title;
    
    /**
     * 需求描述
     */
    private String requirements;
}