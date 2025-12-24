package com.mota.project.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 业务配置请求 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BusinessConfigRequest {
    private String companyName;
    private String industry;
    private String businessDesc;
}