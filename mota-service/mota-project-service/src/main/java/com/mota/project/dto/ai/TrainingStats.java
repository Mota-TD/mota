package com.mota.project.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 训练统计 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrainingStats {
    private Integer totalDocuments;
    private String totalTokens;
    private String lastTraining;
    private String modelVersion;
    private Double accuracy;
}