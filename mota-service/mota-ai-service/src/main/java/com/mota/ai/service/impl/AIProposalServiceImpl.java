package com.mota.ai.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.mota.ai.entity.AIProposal;
import com.mota.ai.mapper.AIProposalMapper;
import com.mota.ai.service.AIProposalService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * AI方案服务实现类
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AIProposalServiceImpl implements AIProposalService {

    private final AIProposalMapper proposalMapper;

    @Override
    @Transactional
    public AIProposal generateProposal(Long userId, Long enterpriseId, Long projectId,
                                        String title, String description, String type) {
        AIProposal proposal = new AIProposal();
        proposal.setUserId(userId);
        proposal.setEnterpriseId(enterpriseId);
        proposal.setProjectId(projectId);
        proposal.setTitle(title);
        proposal.setDescription(description);
        proposal.setType(type != null ? type : "general");
        proposal.setStatus("draft");
        proposal.setCreatedAt(LocalDateTime.now());
        proposal.setUpdatedAt(LocalDateTime.now());
        
        // TODO: 调用AI模型生成方案内容
        // 这里暂时生成模拟内容
        String generatedContent = generateMockContent(title, description, type);
        proposal.setContent(generatedContent);
        
        proposalMapper.insert(proposal);
        return proposal;
    }

    private String generateMockContent(String title, String description, String type) {
        return String.format("""
            # %s
            
            ## 项目概述
            %s
            
            ## 方案类型
            %s
            
            ## 详细方案
            
            ### 1. 目标分析
            根据您的需求描述，我们分析出以下核心目标：
            - 目标1：提升效率
            - 目标2：优化流程
            - 目标3：降低成本
            
            ### 2. 实施步骤
            1. 第一阶段：需求调研（1周）
            2. 第二阶段：方案设计（2周）
            3. 第三阶段：开发实施（4周）
            4. 第四阶段：测试验收（1周）
            
            ### 3. 资源需求
            - 人力资源：项目经理1人，开发人员3人
            - 时间周期：8周
            - 预算估算：待定
            
            ### 4. 风险评估
            - 风险1：需求变更风险
            - 风险2：技术实现风险
            - 风险3：进度延期风险
            
            ### 5. 预期成果
            - 成果1：完整的解决方案
            - 成果2：可执行的实施计划
            - 成果3：详细的技术文档
            
            ---
            *此方案由摩塔AI助手自动生成，仅供参考*
            """, title, description, type);
    }

    @Override
    public IPage<AIProposal> getProposalList(Long userId, Long enterpriseId, int page, int size) {
        Page<AIProposal> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<AIProposal> wrapper = new LambdaQueryWrapper<>();
        
        if (userId != null) {
            wrapper.eq(AIProposal::getUserId, userId);
        }
        if (enterpriseId != null) {
            wrapper.eq(AIProposal::getEnterpriseId, enterpriseId);
        }
        wrapper.eq(AIProposal::getDeleted, 0)
               .orderByDesc(AIProposal::getUpdatedAt);
        
        return proposalMapper.selectPage(pageParam, wrapper);
    }

    @Override
    public AIProposal getProposalById(Long id) {
        return proposalMapper.selectById(id);
    }

    @Override
    @Transactional
    public void updateProposal(Long id, String title, String content) {
        AIProposal proposal = proposalMapper.selectById(id);
        if (proposal != null) {
            if (title != null) {
                proposal.setTitle(title);
            }
            if (content != null) {
                proposal.setContent(content);
            }
            proposal.setUpdatedAt(LocalDateTime.now());
            proposalMapper.updateById(proposal);
        }
    }

    @Override
    @Transactional
    public void publishProposal(Long id) {
        AIProposal proposal = proposalMapper.selectById(id);
        if (proposal != null) {
            proposal.setStatus("published");
            proposal.setUpdatedAt(LocalDateTime.now());
            proposalMapper.updateById(proposal);
        }
    }

    @Override
    @Transactional
    public void archiveProposal(Long id) {
        AIProposal proposal = proposalMapper.selectById(id);
        if (proposal != null) {
            proposal.setStatus("archived");
            proposal.setUpdatedAt(LocalDateTime.now());
            proposalMapper.updateById(proposal);
        }
    }

    @Override
    @Transactional
    public void deleteProposal(Long id) {
        AIProposal proposal = proposalMapper.selectById(id);
        if (proposal != null) {
            proposal.setDeleted(1);
            proposal.setUpdatedAt(LocalDateTime.now());
            proposalMapper.updateById(proposal);
        }
    }

    @Override
    public IPage<AIProposal> getProposalsByProject(Long projectId, int page, int size) {
        Page<AIProposal> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<AIProposal> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(AIProposal::getProjectId, projectId)
               .eq(AIProposal::getDeleted, 0)
               .orderByDesc(AIProposal::getUpdatedAt);
        
        return proposalMapper.selectPage(pageParam, wrapper);
    }
}