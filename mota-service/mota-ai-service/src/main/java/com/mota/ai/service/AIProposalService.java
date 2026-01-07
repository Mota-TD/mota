package com.mota.ai.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.mota.ai.entity.AIProposal;

/**
 * AI方案服务接口
 */
public interface AIProposalService {

    /**
     * 生成方案
     */
    AIProposal generateProposal(Long userId, Long enterpriseId, Long projectId, String title, String description, String type);

    /**
     * 获取方案列表
     */
    IPage<AIProposal> getProposalList(Long userId, Long enterpriseId, int page, int size);

    /**
     * 获取方案详情
     */
    AIProposal getProposalById(Long id);

    /**
     * 更新方案
     */
    void updateProposal(Long id, String title, String content);

    /**
     * 发布方案
     */
    void publishProposal(Long id);

    /**
     * 归档方案
     */
    void archiveProposal(Long id);

    /**
     * 删除方案
     */
    void deleteProposal(Long id);

    /**
     * 根据项目获取方案
     */
    IPage<AIProposal> getProposalsByProject(Long projectId, int page, int size);
}