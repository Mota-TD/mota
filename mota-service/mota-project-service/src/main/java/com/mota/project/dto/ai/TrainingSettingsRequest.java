package com.mota.project.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 训练设置请求 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrainingSettingsRequest {
    private Integer epochs;
    private String learningRate;
    private Integer batchSize;
}