package com.mota.project.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * PPT 配色方案 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PPTColorScheme {
    private String value;
    private String label;
    private List<String> colors;
}