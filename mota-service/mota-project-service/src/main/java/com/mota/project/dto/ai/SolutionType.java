package com.mota.project.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 方案类型 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SolutionType {
    private String value;
    private String label;
    private String desc;
    private String icon;
}