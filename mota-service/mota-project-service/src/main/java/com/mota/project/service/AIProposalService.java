package com.mota.project.service;

import java.util.List;
import java.util.Map;

/**
 * AI方案生成服务接口
 */
public interface AIProposalService {

    // ========== 方案生成 ==========

    /**
     * 生成项目方案
     * @param requirement 需求描述
     * @param projectType 项目类型
     * @param context 上下文信息（可选）
     * @return 生成的方案内容
     */
    String generateProjectProposal(String requirement, String projectType, Map<String, Object> context);

    /**
     * 生成技术方案
     * @param requirement 技术需求
     * @param techStack 技术栈
     * @param constraints 约束条件
     * @return 生成的技术方案
     */
    String generateTechnicalProposal(String requirement, List<String> techStack, Map<String, Object> constraints);

    /**
     * 生成营销方案
     * @param product 产品信息
     * @param targetAudience 目标受众
     * @param budget 预算
     * @return 生成的营销方案
     */
    String generateMarketingProposal(String product, String targetAudience, Double budget);

    /**
     * 生成商业计划
     * @param businessIdea 商业想法
     * @param industry 行业
     * @param scale 规模
     * @return 生成的商业计划
     */
    String generateBusinessPlan(String businessIdea, String industry, String scale);

    /**
     * 生成工作报告
     * @param projectId 项目ID
     * @param reportType 报告类型（周报/月报/季报）
     * @param period 时间段
     * @return 生成的工作报告
     */
    String generateWorkReport(Long projectId, String reportType, String period);

    // ========== 方案优化 ==========

    /**
     * 优化方案
     * @param originalProposal 原始方案
     * @param feedback 反馈意见
     * @return 优化后的方案
     */
    String optimizeProposal(String originalProposal, String feedback);

    /**
     * 扩展方案细节
     * @param proposal 方案
     * @param section 需要扩展的部分
     * @return 扩展后的内容
     */
    String expandProposalSection(String proposal, String section);

    /**
     * 方案质量评估
     * @param proposal 方案内容
     * @return 评估结果（分数和建议）
     */
    Map<String, Object> evaluateProposal(String proposal);

    // ========== 知识库集成 ==========

    /**
     * 基于知识库生成方案
     * @param requirement 需求
     * @param knowledgeBaseIds 知识库ID列表
     * @return 生成的方案
     */
    String generateProposalWithKnowledge(String requirement, List<Long> knowledgeBaseIds);

    /**
     * 搜索相关历史方案
     * @param requirement 需求描述
     * @param limit 返回数量
     * @return 相关方案列表
     */
    List<Map<String, Object>> searchRelatedProposals(String requirement, int limit);

    // ========== 多轮对话 ==========

    /**
     * 开始方案生成会话
     * @param userId 用户ID
     * @param proposalType 方案类型
     * @return 会话ID
     */
    String startProposalSession(Long userId, String proposalType);

    /**
     * 继续方案对话
     * @param sessionId 会话ID
     * @param userMessage 用户消息
     * @return AI回复
     */
    String continueProposalSession(String sessionId, String userMessage);

    /**
     * 获取会话历史
     * @param sessionId 会话ID
     * @return 对话历史
     */
    List<Map<String, Object>> getSessionHistory(String sessionId);

    /**
     * 结束会话并保存方案
     * @param sessionId 会话ID
     * @return 最终方案
     */
    String finalizeProposalSession(String sessionId);

    // ========== 模板管理 ==========

    /**
     * 获取方案模板列表
     * @param proposalType 方案类型
     * @return 模板列表
     */
    List<Map<String, Object>> getProposalTemplates(String proposalType);

    /**
     * 基于模板生成方案
     * @param templateId 模板ID
     * @param variables 变量值
     * @return 生成的方案
     */
    String generateFromTemplate(Long templateId, Map<String, Object> variables);

    // ========== AI助手功能 ==========

    /**
     * 智能问答
     * @param question 问题
     * @param context 上下文
     * @return 回答
     */
    String askQuestion(String question, Map<String, Object> context);

    /**
     * 文档摘要生成
     * @param documentId 文档ID
     * @param maxLength 最大长度
     * @return 摘要
     */
    String generateDocumentSummary(Long documentId, int maxLength);

    /**
     * 会议纪要生成
     * @param meetingNotes 会议记录
     * @return 会议纪要
     */
    String generateMeetingMinutes(String meetingNotes);

    /**
     * 任务建议
     * @param projectId 项目ID
     * @param currentTasks 当前任务列表
     * @return 任务建议
     */
    List<Map<String, Object>> suggestTasks(Long projectId, List<Long> currentTasks);

    /**
     * 数据分析辅助
     * @param data 数据
     * @param analysisType 分析类型
     * @return 分析结果
     */
    Map<String, Object> analyzeData(Map<String, Object> data, String analysisType);
}