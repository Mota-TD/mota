package com.mota.task.feign;

import com.mota.common.core.result.Result;
import com.mota.common.core.result.ResultCode;
import com.mota.task.feign.dto.MilestoneDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * 项目服务 Feign 客户端降级处理
 */
@Slf4j
@Component
public class ProjectServiceClientFallback implements ProjectServiceClient {

    @Override
    public Result<MilestoneDTO> getMilestoneById(Long id) {
        log.warn("Fallback: getMilestoneById failed for id: {}", id);
        return Result.failed(ResultCode.SERVICE_UNAVAILABLE, "项目服务暂时不可用");
    }

    @Override
    public Result<Void> updateMilestoneProgress(Long id, Integer progress) {
        log.warn("Fallback: updateMilestoneProgress failed for id: {}, progress: {}", id, progress);
        return Result.failed(ResultCode.SERVICE_UNAVAILABLE, "项目服务暂时不可用");
    }
}