package com.mota.project.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * PPT 模板 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PPTTemplate {
    private String value;
    private String label;
    private String color;
    private String icon;
}