package com.mota.project.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * AI 任务分解请求 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskDecompositionRequest {
    private String projectName;
    private String projectDescription;
    private List<String> departments;
    private String startDate;
    private String endDate;
}