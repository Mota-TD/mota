package com.mota.project.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 新闻项 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NewsItem {
    private String id;
    private String title;
    private String summary;
    private String source;
    private String sourceIcon;
    private String publishTime;
    private String category;
    private List<String> tags;
    private String url;
    private Boolean isStarred;
    private Integer relevance;
}