package com.mota.project.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * PPT 生成请求 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GeneratePPTRequest {
    private String title;
    private String content;
    private String template;
    private String colorScheme;
    private Integer slideCount;
    private String style;
}