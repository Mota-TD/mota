package com.mota.project.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * AI 历史记录 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AIHistoryRecord {
    private String id;
    private String title;
    private String type;  // solution, ppt, marketing, news
    private String status;  // completed, failed, processing
    private String creator;
    private Long creatorId;
    private String content;
    private String createdAt;
    private String updatedAt;
}