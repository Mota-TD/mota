package com.mota.project.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * AI 进度预测 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProgressPrediction {
    private String projectId;
    private Integer currentProgress;
    private Integer predictedProgress;
    private String predictedCompletionDate;
    private Double confidence;
    private List<String> factors;
}