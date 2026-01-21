package com.mota.task.feign;

import com.mota.common.core.result.Result;
import com.mota.task.feign.dto.MilestoneDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;

/**
 * 项目服务 Feign 客户端
 */
@FeignClient(name = "mota-project-service", fallback = ProjectServiceClientFallback.class)
public interface ProjectServiceClient {

    /**
     * 获取里程碑详情
     */
    @GetMapping("/api/v1/milestones/{id}")
    Result<MilestoneDTO> getMilestoneById(@PathVariable("id") Long id);

    /**
     * 更新里程碑进度
     */
    @PutMapping("/api/v1/milestones/{id}/progress")
    Result<Void> updateMilestoneProgress(@PathVariable("id") Long id, @RequestParam("progress") Integer progress);
}