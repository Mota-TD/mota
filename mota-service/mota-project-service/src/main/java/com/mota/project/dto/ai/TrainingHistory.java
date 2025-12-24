package com.mota.project.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 训练历史记录 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrainingHistory {
    private Integer id;
    private String version;
    private String date;
    private Integer documents;
    private String status;
    private Double accuracy;
}