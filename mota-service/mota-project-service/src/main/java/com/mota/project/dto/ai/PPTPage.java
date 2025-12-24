package com.mota.project.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * PPT 页面 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PPTPage {
    private Integer id;
    private String title;
    private String type;
}