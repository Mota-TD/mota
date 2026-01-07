package com.mota.api.ai.dto;

import lombok.Data;
import java.io.Serializable;
import java.util.List;

/**
 * 质量检查结果DTO
 */
@Data
public class QualityCheckDTO implements Serializable {
    private static final long serialVersionUID = 1L;
    
    /**
     * 总分
     */
    private Integer score;
    
    /**
     * 检查项列表
     */
    private List<CheckItemDTO> items;
    
    /**
     * 建议
     */
    private List<String> suggestions;
    
    /**
     * 是否通过
     */
    private Boolean passed;
    
    @Data
    public static class CheckItemDTO implements Serializable {
        private static final long serialVersionUID = 1L;
        
        private String name;
        private Integer score;
        private String comment;
    }
}