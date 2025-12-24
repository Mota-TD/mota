package com.mota.project.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 方案生成请求 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GenerateSolutionRequest {
    private String solutionType;
    private String companyName;
    private String businessDesc;
    private String requirements;
    private String additionalInfo;
}