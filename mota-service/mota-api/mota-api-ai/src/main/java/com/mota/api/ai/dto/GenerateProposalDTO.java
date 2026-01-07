package com.mota.api.ai.dto;

import lombok.Data;
import java.io.Serializable;
import java.util.Map;

/**
 * 生成方案请求DTO
 */
@Data
public class GenerateProposalDTO implements Serializable {
    private static final long serialVersionUID = 1L;
    
    /**
     * 会话ID
     */
    private Long sessionId;
    
    /**
     * 需求描述
     */
    private String requirements;
    
    /**
     * 参考资料
     */
    private String references;
    
    /**
     * 额外参数
     */
    private Map<String, Object> params;
}