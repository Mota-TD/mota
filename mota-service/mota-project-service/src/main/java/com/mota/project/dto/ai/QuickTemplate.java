package com.mota.project.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 快捷模板 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuickTemplate {
    private String label;
    private String value;
}