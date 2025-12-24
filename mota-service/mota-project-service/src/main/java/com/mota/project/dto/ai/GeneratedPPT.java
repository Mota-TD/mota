package com.mota.project.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 生成的 PPT DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GeneratedPPT {
    private String id;
    private String title;
    private Integer slides;
    private String template;
    private String createdAt;
    private List<PPTPage> pages;
}