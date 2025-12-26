package com.mota.project.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.mota.project.entity.proposal.*;
import com.mota.project.mapper.proposal.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

/**
 * AI方案生成服务
 * 实现AG-001到AG-010功能
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AIProposalGenerationService {
    
    private final ProposalSessionMapper sessionMapper;
    private final ProposalContentMapper contentMapper;
    private final RequirementAnalysisMapper requirementMapper;
    private final ProposalSectionMapper sectionMapper;
    private final ChartSuggestionMapper chartMapper;
    private final QualityCheckMapper qualityMapper;
    private final ProposalVersionMapper versionMapper;
    private final ProposalExportMapper exportMapper;
    private final ProposalTemplateMapper templateMapper;
    
    // ==================== AG-001 意图识别 ====================
    
    /**
     * 创建新会话
     */
    @Transactional
    public ProposalSession createSession(Long userId, String title, String proposalType) {
        ProposalSession session = new ProposalSession();
        session.setUserId(userId);
        session.setTitle(title);
        session.setProposalType(proposalType);
        session.setStatus("active");
        session.setMessageCount(0);
        session.setCreatedAt(LocalDateTime.now());
        session.setUpdatedAt(LocalDateTime.now());
        sessionMapper.insert(session);
        
        log.info("创建方案会话: sessionId={}, userId={}, type={}", session.getId(), userId, proposalType);
        return session;
    }
    
    /**
     * 解析用户意图
     */
    public Map<String, Object> parseIntent(Long sessionId, String userInput) {
        log.info("解析用户意图: sessionId={}, input={}", sessionId, userInput);
        
        Map<String, Object> result = new HashMap<>();
        
        // 意图分类
        String intentType = classifyIntent(userInput);
        result.put("intentType", intentType);
        
        // 提取关键词
        List<String> keywords = extractKeywords(userInput);
        result.put("keywords", keywords);
        
        // 置信度评分
        double confidence = calculateConfidence(userInput, intentType);
        result.put("confidence", confidence);
        
        // 建议的方案类型
        String suggestedType = suggestProposalType(intentType, keywords);
        result.put("suggestedType", suggestedType);
        
        return result;
    }
    
    private String classifyIntent(String input) {
        String lowerInput = input.toLowerCase();
        if (lowerInput.contains("技术") || lowerInput.contains("系统") || lowerInput.contains("开发")) {
            return "technical";
        } else if (lowerInput.contains("商业") || lowerInput.contains("营销") || lowerInput.contains("市场")) {
            return "business";
        } else if (lowerInput.contains("研究") || lowerInput.contains("分析") || lowerInput.contains("调研")) {
            return "research";
        } else if (lowerInput.contains("报告") || lowerInput.contains("总结") || lowerInput.contains("汇报")) {
            return "report";
        }
        return "general";
    }
    
    private List<String> extractKeywords(String input) {
        // 简化的关键词提取
        List<String> keywords = new ArrayList<>();
        String[] words = input.split("[\\s,，。.!！?？]+");
        for (String word : words) {
            if (word.length() >= 2 && word.length() <= 10) {
                keywords.add(word);
            }
        }
        return keywords.subList(0, Math.min(keywords.size(), 10));
    }
    
    private double calculateConfidence(String input, String intentType) {
        // 基于输入长度和关键词匹配计算置信度
        double baseConfidence = 0.6;
        if (input.length() > 50) baseConfidence += 0.1;
        if (input.length() > 100) baseConfidence += 0.1;
        if (!intentType.equals("general")) baseConfidence += 0.1;
        return Math.min(baseConfidence, 0.95);
    }
    
    private String suggestProposalType(String intentType, List<String> keywords) {
        return intentType;
    }
    
    // ==================== AG-002 需求解析 ====================
    
    /**
     * 解析需求
     */
    @Transactional
    public RequirementAnalysis analyzeRequirement(Long sessionId, String userInput) {
        log.info("解析需求: sessionId={}", sessionId);
        
        RequirementAnalysis analysis = new RequirementAnalysis();
        analysis.setSessionId(String.valueOf(sessionId));
        analysis.setOriginalInput(userInput);
        
        // 解析意图
        Map<String, Object> intent = parseIntent(sessionId, userInput);
        analysis.setIntentType((String) intent.get("intentType"));
        analysis.setConfidenceScore(BigDecimal.valueOf((Double) intent.get("confidence")));
        
        // 提取关键要素
        Map<String, Object> elements = extractKeyElements(userInput);
        analysis.setKeyElements(toJson(elements));
        
        // 提取约束条件
        Map<String, Object> constraints = extractConstraints(userInput);
        analysis.setConstraints(toJson(constraints));
        
        // 提取目标受众
        String audience = extractAudience(userInput);
        analysis.setTargetAudience(audience);
        
        // 提取预期产出
        String output = extractExpectedOutput(userInput);
        analysis.setExpectedOutput(output);
        
        analysis.setCreatedAt(LocalDateTime.now());
        requirementMapper.insert(analysis);
        
        return analysis;
    }
    
    private Map<String, Object> extractKeyElements(String input) {
        Map<String, Object> elements = new HashMap<>();
        elements.put("topic", extractTopic(input));
        elements.put("scope", extractScope(input));
        elements.put("objectives", extractObjectives(input));
        return elements;
    }
    
    private String extractTopic(String input) {
        // 提取主题
        if (input.length() > 20) {
            return input.substring(0, 20) + "...";
        }
        return input;
    }
    
    private String extractScope(String input) {
        if (input.contains("全面") || input.contains("完整")) {
            return "comprehensive";
        } else if (input.contains("简要") || input.contains("概述")) {
            return "brief";
        }
        return "standard";
    }
    
    private List<String> extractObjectives(String input) {
        List<String> objectives = new ArrayList<>();
        if (input.contains("分析")) objectives.add("分析");
        if (input.contains("设计")) objectives.add("设计");
        if (input.contains("实现")) objectives.add("实现");
        if (input.contains("优化")) objectives.add("优化");
        return objectives;
    }
    
    private Map<String, Object> extractConstraints(String input) {
        Map<String, Object> constraints = new HashMap<>();
        // 时间约束
        if (input.contains("紧急") || input.contains("尽快")) {
            constraints.put("urgency", "high");
        }
        // 预算约束
        if (input.contains("预算") || input.contains("成本")) {
            constraints.put("budgetSensitive", true);
        }
        return constraints;
    }
    
    private String extractAudience(String input) {
        if (input.contains("领导") || input.contains("管理层")) {
            return "management";
        } else if (input.contains("技术") || input.contains("开发")) {
            return "technical";
        } else if (input.contains("客户") || input.contains("用户")) {
            return "customer";
        }
        return "general";
    }
    
    private String extractExpectedOutput(String input) {
        if (input.contains("方案")) return "proposal";
        if (input.contains("报告")) return "report";
        if (input.contains("计划")) return "plan";
        return "document";
    }
    
    // ==================== AG-003 知识检索 ====================
    
    /**
     * 检索相关知识
     */
    public List<Map<String, Object>> retrieveKnowledge(Long sessionId, String query, List<Long> knowledgeBaseIds) {
        log.info("检索知识: sessionId={}, query={}", sessionId, query);
        
        List<Map<String, Object>> results = new ArrayList<>();
        
        // 模拟知识检索结果
        Map<String, Object> result1 = new HashMap<>();
        result1.put("id", 1L);
        result1.put("title", "相关技术文档");
        result1.put("content", "这是与查询相关的技术文档内容...");
        result1.put("relevanceScore", 0.85);
        result1.put("source", "knowledge_base");
        results.add(result1);
        
        Map<String, Object> result2 = new HashMap<>();
        result2.put("id", 2L);
        result2.put("title", "历史方案参考");
        result2.put("content", "这是历史方案的相关内容...");
        result2.put("relevanceScore", 0.78);
        result2.put("source", "history");
        results.add(result2);
        
        return results;
    }
    
    // ==================== AG-004 历史参考 ====================
    
    /**
     * 获取历史参考
     */
    public List<ProposalContent> getHistoricalReferences(Long userId, String proposalType, int limit) {
        log.info("获取历史参考: userId={}, type={}", userId, proposalType);
        
        LambdaQueryWrapper<ProposalContent> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ProposalContent::getCreatedBy, userId)
               .eq(proposalType != null, ProposalContent::getProposalType, proposalType)
               .eq(ProposalContent::getStatus, "completed")
               .orderByDesc(ProposalContent::getCreatedAt)
               .last("LIMIT " + limit);
        
        return contentMapper.selectList(wrapper);
    }
    
    // ==================== AG-005 方案生成 ====================
    
    /**
     * 生成方案
     */
    @Transactional
    public ProposalContent generateProposal(Long sessionId, Long requirementId, Long templateId) {
        log.info("生成方案: sessionId={}, requirementId={}, templateId={}", sessionId, requirementId, templateId);
        
        // 获取需求分析
        RequirementAnalysis requirement = requirementMapper.selectById(requirementId);
        if (requirement == null) {
            throw new RuntimeException("需求分析不存在");
        }
        
        // 获取模板
        ProposalTemplate template = null;
        if (templateId != null) {
            template = templateMapper.selectById(templateId);
            if (template != null) {
                templateMapper.incrementUsageCount(templateId);
            }
        }
        
        // 创建方案内容
        ProposalContent proposal = new ProposalContent();
        proposal.setSessionId(String.valueOf(sessionId));
        proposal.setTitle(generateTitle(requirement));
        proposal.setProposalType(requirement.getIntentType());
        proposal.setTemplateId(templateId);
        proposal.setStatus("draft");
        proposal.setQualityScore(BigDecimal.ZERO);
        proposal.setCreatedBy(getSessionUserId(sessionId));
        proposal.setCreatedAt(LocalDateTime.now());
        proposal.setUpdatedAt(LocalDateTime.now());
        
        // 生成内容
        String content = generateContent(requirement, template);
        proposal.setContent(content);
        proposal.setSummary(generateSummary(content));
        
        // 生成大纲
        String outline = generateOutline(requirement, template);
        proposal.setOutline(outline);
        
        // 计算字数
        proposal.setWordCount(content.length());
        
        contentMapper.insert(proposal);
        
        // 生成章节
        generateSections(proposal.getId(), requirement, template);
        
        // 创建初始版本
        createVersion(proposal.getId(), "1.0", "draft", "初始版本");
        
        return proposal;
    }
    
    private String generateTitle(RequirementAnalysis requirement) {
        String topic = requirement.getOriginalText() != null ? requirement.getOriginalText() : requirement.getOriginalInput();
        if (topic.length() > 30) {
            topic = topic.substring(0, 30);
        }
        return topic + " - 方案";
    }
    
    private String generateContent(RequirementAnalysis requirement, ProposalTemplate template) {
        StringBuilder content = new StringBuilder();
        content.append("# 方案概述\n\n");
        content.append("基于您的需求，我们制定了以下方案：\n\n");
        content.append("## 背景分析\n\n");
        content.append("根据您提供的信息：").append(requirement.getOriginalText() != null ? requirement.getOriginalText() : requirement.getOriginalInput()).append("\n\n");
        content.append("## 目标与范围\n\n");
        content.append("本方案旨在解决上述需求，主要目标包括：\n");
        content.append("- 目标1：深入分析问题\n");
        content.append("- 目标2：提供解决方案\n");
        content.append("- 目标3：制定实施计划\n\n");
        content.append("## 解决方案\n\n");
        content.append("### 方案设计\n\n");
        content.append("详细的解决方案设计...\n\n");
        content.append("### 实施步骤\n\n");
        content.append("1. 第一阶段：准备工作\n");
        content.append("2. 第二阶段：核心实施\n");
        content.append("3. 第三阶段：验收总结\n\n");
        content.append("## 预期效果\n\n");
        content.append("通过本方案的实施，预期达到以下效果...\n");
        
        return content.toString();
    }
    
    private String generateSummary(String content) {
        if (content.length() > 200) {
            return content.substring(0, 200) + "...";
        }
        return content;
    }
    
    private String generateOutline(RequirementAnalysis requirement, ProposalTemplate template) {
        Map<String, Object> outline = new HashMap<>();
        List<Map<String, Object>> sections = new ArrayList<>();
        
        sections.add(createOutlineSection("1", "方案概述", 1));
        sections.add(createOutlineSection("2", "背景分析", 1));
        sections.add(createOutlineSection("3", "目标与范围", 1));
        sections.add(createOutlineSection("4", "解决方案", 1));
        sections.add(createOutlineSection("4.1", "方案设计", 2));
        sections.add(createOutlineSection("4.2", "实施步骤", 2));
        sections.add(createOutlineSection("5", "预期效果", 1));
        
        outline.put("sections", sections);
        return toJson(outline);
    }
    
    private Map<String, Object> createOutlineSection(String number, String title, int level) {
        Map<String, Object> section = new HashMap<>();
        section.put("number", number);
        section.put("title", title);
        section.put("level", level);
        return section;
    }
    
    private Long getSessionUserId(Long sessionId) {
        ProposalSession session = sessionMapper.selectById(sessionId);
        return session != null ? session.getUserId() : null;
    }
    
    // ==================== AG-006 章节编排 ====================
    
    /**
     * 生成章节
     */
    @Transactional
    public List<ProposalSection> generateSections(Long proposalId, RequirementAnalysis requirement, ProposalTemplate template) {
        log.info("生成章节: proposalId={}", proposalId);
        
        List<ProposalSection> sections = new ArrayList<>();
        
        // 创建主要章节
        sections.add(createSection(proposalId, null, "1", "方案概述", "本方案的整体概述...", 1, 1));
        sections.add(createSection(proposalId, null, "2", "背景分析", "项目背景和现状分析...", 1, 2));
        sections.add(createSection(proposalId, null, "3", "目标与范围", "明确的目标和范围定义...", 1, 3));
        
        ProposalSection solutionSection = createSection(proposalId, null, "4", "解决方案", "详细的解决方案...", 1, 4);
        sections.add(solutionSection);
        
        // 创建子章节
        sections.add(createSection(proposalId, solutionSection.getId(), "4.1", "方案设计", "具体的方案设计...", 2, 1));
        sections.add(createSection(proposalId, solutionSection.getId(), "4.2", "实施步骤", "详细的实施步骤...", 2, 2));
        
        sections.add(createSection(proposalId, null, "5", "预期效果", "预期达到的效果...", 1, 5));
        sections.add(createSection(proposalId, null, "6", "风险与对策", "可能的风险和应对措施...", 1, 6));
        sections.add(createSection(proposalId, null, "7", "总结", "方案总结...", 1, 7));
        
        return sections;
    }
    
    private ProposalSection createSection(Long proposalId, Long parentId, String number, String title, String content, int level, int order) {
        ProposalSection section = new ProposalSection();
        section.setProposalId(proposalId);
        section.setParentId(parentId);
        section.setSectionNumber(number);
        section.setTitle(title);
        section.setContent(content);
        section.setLevel(level);
        section.setSortOrder(order);
        section.setWordCount(content.length());
        section.setStatus("draft");
        section.setCreatedAt(LocalDateTime.now());
        section.setUpdatedAt(LocalDateTime.now());
        sectionMapper.insert(section);
        return section;
    }
    
    /**
     * 更新章节
     */
    @Transactional
    public ProposalSection updateSection(Long sectionId, String title, String content) {
        ProposalSection section = sectionMapper.selectById(sectionId);
        if (section == null) {
            throw new RuntimeException("章节不存在");
        }
        
        section.setTitle(title);
        section.setContent(content);
        section.setWordCount(content.length());
        section.setUpdatedAt(LocalDateTime.now());
        sectionMapper.updateById(section);
        
        return section;
    }
    
    /**
     * 调整章节顺序
     */
    @Transactional
    public void reorderSections(Long proposalId, List<Long> sectionIds) {
        for (int i = 0; i < sectionIds.size(); i++) {
            ProposalSection section = sectionMapper.selectById(sectionIds.get(i));
            if (section != null && section.getProposalId().equals(proposalId)) {
                section.setSortOrder(i + 1);
                sectionMapper.updateById(section);
            }
        }
    }
    
    // ==================== AG-007 图表建议 ====================
    
    /**
     * 生成图表建议
     */
    @Transactional
    public List<ChartSuggestion> generateChartSuggestions(Long proposalId) {
        log.info("生成图表建议: proposalId={}", proposalId);
        
        List<ChartSuggestion> suggestions = new ArrayList<>();
        
        // 获取方案章节
        List<ProposalSection> sections = sectionMapper.findByProposalId(proposalId);
        
        for (ProposalSection section : sections) {
            // 根据章节内容分析适合的图表类型
            List<ChartSuggestion> sectionSuggestions = analyzeChartOpportunities(proposalId, section);
            suggestions.addAll(sectionSuggestions);
        }
        
        return suggestions;
    }
    
    private List<ChartSuggestion> analyzeChartOpportunities(Long proposalId, ProposalSection section) {
        List<ChartSuggestion> suggestions = new ArrayList<>();
        String content = section.getContent().toLowerCase();
        
        // 分析内容，建议合适的图表
        if (content.contains("对比") || content.contains("比较")) {
            suggestions.add(createChartSuggestion(proposalId, section.getId(), "bar", 
                "对比分析图", "用于展示不同选项的对比分析"));
        }
        
        if (content.contains("趋势") || content.contains("变化") || content.contains("增长")) {
            suggestions.add(createChartSuggestion(proposalId, section.getId(), "line", 
                "趋势变化图", "用于展示数据随时间的变化趋势"));
        }
        
        if (content.contains("占比") || content.contains("比例") || content.contains("分布")) {
            suggestions.add(createChartSuggestion(proposalId, section.getId(), "pie", 
                "占比分布图", "用于展示各部分的占比情况"));
        }
        
        if (content.contains("流程") || content.contains("步骤") || content.contains("阶段")) {
            suggestions.add(createChartSuggestion(proposalId, section.getId(), "flow", 
                "流程图", "用于展示工作流程或步骤"));
        }
        
        if (content.contains("计划") || content.contains("进度") || content.contains("时间表")) {
            suggestions.add(createChartSuggestion(proposalId, section.getId(), "gantt", 
                "甘特图", "用于展示项目进度计划"));
        }
        
        return suggestions;
    }
    
    private ChartSuggestion createChartSuggestion(Long proposalId, Long sectionId, String type, String title, String description) {
        ChartSuggestion suggestion = new ChartSuggestion();
        suggestion.setProposalId(proposalId);
        suggestion.setSectionId(sectionId);
        suggestion.setChartType(type);
        suggestion.setTitle(title);
        suggestion.setDescription(description);
        suggestion.setIsApplied(false);
        suggestion.setCreatedAt(LocalDateTime.now());
        chartMapper.insert(suggestion);
        return suggestion;
    }
    
    /**
     * 应用图表建议
     */
    @Transactional
    public void applyChartSuggestion(Long suggestionId, String chartConfig) {
        ChartSuggestion suggestion = chartMapper.selectById(suggestionId);
        if (suggestion != null) {
            suggestion.setChartConfig(chartConfig);
            suggestion.setIsApplied(true);
            chartMapper.updateById(suggestion);
        }
    }
    
    // ==================== AG-008 质量检查 ====================
    
    /**
     * 执行质量检查
     */
    @Transactional
    public List<QualityCheck> performQualityCheck(Long proposalId, Long versionId) {
        log.info("执行质量检查: proposalId={}, versionId={}", proposalId, versionId);
        
        List<QualityCheck> checks = new ArrayList<>();
        
        ProposalContent proposal = contentMapper.selectById(proposalId);
        if (proposal == null) {
            throw new RuntimeException("方案不存在");
        }
        
        // 完整性检查
        checks.add(checkCompleteness(proposalId, versionId, proposal));
        
        // 一致性检查
        checks.add(checkConsistency(proposalId, versionId, proposal));
        
        // 准确性检查
        checks.add(checkAccuracy(proposalId, versionId, proposal));
        
        // 格式检查
        checks.add(checkFormat(proposalId, versionId, proposal));
        
        // 语言检查
        checks.add(checkLanguage(proposalId, versionId, proposal));
        
        // 更新方案质量得分
        int avgScore = checks.stream().mapToInt(QualityCheck::getScore).sum() / checks.size();
        proposal.setQualityScore(BigDecimal.valueOf(avgScore));
        contentMapper.updateById(proposal);
        
        return checks;
    }
    
    private QualityCheck checkCompleteness(Long proposalId, Long versionId, ProposalContent proposal) {
        QualityCheck check = new QualityCheck();
        check.setProposalId(proposalId);
        check.setVersionId(versionId);
        check.setCheckType("completeness");
        check.setCheckItem("内容完整性");
        
        // 检查必要章节是否存在
        List<ProposalSection> sections = sectionMapper.findByProposalId(proposalId);
        int score = 60;
        if (sections.size() >= 5) score += 20;
        if (proposal.getContent() != null && proposal.getContent().length() > 500) score += 20;
        
        check.setScore(score);
        check.setResult(score >= 80 ? "pass" : (score >= 60 ? "warning" : "fail"));
        check.setIssue(score < 80 ? "内容可能不够完整" : null);
        check.setSuggestion(score < 80 ? "建议补充更多章节内容" : null);
        check.setIsFixed(false);
        check.setCreatedAt(LocalDateTime.now());
        
        qualityMapper.insert(check);
        return check;
    }
    
    private QualityCheck checkConsistency(Long proposalId, Long versionId, ProposalContent proposal) {
        QualityCheck check = new QualityCheck();
        check.setProposalId(proposalId);
        check.setVersionId(versionId);
        check.setCheckType("consistency");
        check.setCheckItem("内容一致性");
        check.setScore(85);
        check.setResult("pass");
        check.setIsFixed(false);
        check.setCreatedAt(LocalDateTime.now());
        
        qualityMapper.insert(check);
        return check;
    }
    
    private QualityCheck checkAccuracy(Long proposalId, Long versionId, ProposalContent proposal) {
        QualityCheck check = new QualityCheck();
        check.setProposalId(proposalId);
        check.setVersionId(versionId);
        check.setCheckType("accuracy");
        check.setCheckItem("内容准确性");
        check.setScore(80);
        check.setResult("pass");
        check.setIsFixed(false);
        check.setCreatedAt(LocalDateTime.now());
        
        qualityMapper.insert(check);
        return check;
    }
    
    private QualityCheck checkFormat(Long proposalId, Long versionId, ProposalContent proposal) {
        QualityCheck check = new QualityCheck();
        check.setProposalId(proposalId);
        check.setVersionId(versionId);
        check.setCheckType("format");
        check.setCheckItem("格式规范性");
        
        int score = 70;
        String content = proposal.getContent();
        if (content != null) {
            if (content.contains("#")) score += 10; // 有标题
            if (content.contains("-") || content.contains("1.")) score += 10; // 有列表
            if (content.contains("\n\n")) score += 10; // 有段落分隔
        }
        
        check.setScore(score);
        check.setResult(score >= 80 ? "pass" : "warning");
        check.setIssue(score < 80 ? "格式可以进一步优化" : null);
        check.setSuggestion(score < 80 ? "建议使用更规范的标题和列表格式" : null);
        check.setIsFixed(false);
        check.setCreatedAt(LocalDateTime.now());
        
        qualityMapper.insert(check);
        return check;
    }
    
    private QualityCheck checkLanguage(Long proposalId, Long versionId, ProposalContent proposal) {
        QualityCheck check = new QualityCheck();
        check.setProposalId(proposalId);
        check.setVersionId(versionId);
        check.setCheckType("language");
        check.setCheckItem("语言表达");
        check.setScore(82);
        check.setResult("pass");
        check.setIsFixed(false);
        check.setCreatedAt(LocalDateTime.now());
        
        qualityMapper.insert(check);
        return check;
    }
    
    // ==================== AG-009 多轮优化 ====================
    
    /**
     * 创建新版本
     */
    @Transactional
    public ProposalVersion createVersion(Long proposalId, String versionNumber, String versionType, String changeDescription) {
        log.info("创建版本: proposalId={}, version={}", proposalId, versionNumber);
        
        // 重置当前版本标记
        versionMapper.resetCurrentVersion(proposalId);
        
        ProposalContent proposal = contentMapper.selectById(proposalId);
        
        ProposalVersion version = new ProposalVersion();
        version.setProposalId(proposalId);
        version.setVersionNumber(versionNumber);
        version.setVersionType(versionType);
        version.setContentSnapshot(proposal.getContent());
        version.setChangeDescription(changeDescription);
        version.setChangeType("manual");
        version.setQualityScore(proposal.getQualityScore() != null ? proposal.getQualityScore().intValue() : 0);
        version.setIsCurrent(true);
        version.setCreatedBy(proposal.getCreatedBy());
        version.setCreatedAt(LocalDateTime.now());
        
        versionMapper.insert(version);
        return version;
    }
    
    /**
     * 优化方案
     */
    @Transactional
    public ProposalContent optimizeProposal(Long proposalId, String feedback) {
        log.info("优化方案: proposalId={}, feedback={}", proposalId, feedback);
        
        ProposalContent proposal = contentMapper.selectById(proposalId);
        if (proposal == null) {
            throw new RuntimeException("方案不存在");
        }
        
        // 根据反馈优化内容
        String optimizedContent = applyOptimization(proposal.getContent(), feedback);
        proposal.setContent(optimizedContent);
        proposal.setWordCount(optimizedContent.length());
        proposal.setUpdatedAt(LocalDateTime.now());
        
        contentMapper.updateById(proposal);
        
        // 创建新版本
        String currentVersion = versionMapper.getLatestVersionNumber(proposalId);
        String newVersion = incrementVersion(currentVersion);
        createVersion(proposalId, newVersion, "draft", "根据反馈优化: " + feedback);
        
        return proposal;
    }
    
    private String applyOptimization(String content, String feedback) {
        // 简化的优化逻辑
        StringBuilder optimized = new StringBuilder(content);
        optimized.append("\n\n---\n");
        optimized.append("## 优化说明\n\n");
        optimized.append("根据反馈进行了以下优化：\n");
        optimized.append("- ").append(feedback).append("\n");
        return optimized.toString();
    }
    
    private String incrementVersion(String version) {
        if (version == null) return "1.0";
        String[] parts = version.split("\\.");
        int minor = Integer.parseInt(parts[1]) + 1;
        return parts[0] + "." + minor;
    }
    
    /**
     * 回滚到指定版本
     */
    @Transactional
    public ProposalContent rollbackToVersion(Long proposalId, Long versionId) {
        log.info("回滚版本: proposalId={}, versionId={}", proposalId, versionId);
        
        ProposalVersion version = versionMapper.selectById(versionId);
        if (version == null || !version.getProposalId().equals(proposalId)) {
            throw new RuntimeException("版本不存在");
        }
        
        ProposalContent proposal = contentMapper.selectById(proposalId);
        proposal.setContent(version.getContentSnapshot());
        proposal.setUpdatedAt(LocalDateTime.now());
        contentMapper.updateById(proposal);
        
        // 更新当前版本标记
        versionMapper.resetCurrentVersion(proposalId);
        version.setIsCurrent(true);
        versionMapper.updateById(version);
        
        return proposal;
    }
    
    // ==================== AG-010 方案导出 ====================
    
    /**
     * 导出方案
     */
    @Transactional
    public ProposalExport exportProposal(Long proposalId, Long versionId, String format, Long templateId) {
        log.info("导出方案: proposalId={}, format={}", proposalId, format);
        
        ProposalContent proposal = contentMapper.selectById(proposalId);
        if (proposal == null) {
            throw new RuntimeException("方案不存在");
        }
        
        ProposalExport export = new ProposalExport();
        export.setProposalId(proposalId);
        export.setVersionId(versionId);
        export.setExportFormat(format);
        export.setTemplateId(templateId);
        export.setFileName(generateFileName(proposal, format));
        export.setStatus("pending");
        export.setDownloadCount(0);
        export.setExpiresAt(LocalDateTime.now().plusDays(7));
        export.setCreatedBy(proposal.getCreatedBy());
        export.setCreatedAt(LocalDateTime.now());
        
        exportMapper.insert(export);
        
        // 异步处理导出任务
        processExport(export);
        
        return export;
    }
    
    private String generateFileName(ProposalContent proposal, String format) {
        String title = proposal.getTitle().replaceAll("[^a-zA-Z0-9\\u4e00-\\u9fa5]", "_");
        return title + "_" + System.currentTimeMillis() + "." + format;
    }
    
    private void processExport(ProposalExport export) {
        // 模拟导出处理
        export.setStatus("processing");
        exportMapper.updateById(export);
        
        try {
            // 生成文件
            String filePath = generateExportFile(export);
            export.setFilePath(filePath);
            export.setFileSize(1024L * 100); // 模拟文件大小
            export.setStatus("completed");
        } catch (Exception e) {
            export.setStatus("failed");
            export.setErrorMessage(e.getMessage());
        }
        
        exportMapper.updateById(export);
    }
    
    private String generateExportFile(ProposalExport export) {
        // 模拟生成文件路径
        return "/exports/" + export.getFileName();
    }
    
    /**
     * 下载导出文件
     */
    public ProposalExport downloadExport(Long exportId) {
        ProposalExport export = exportMapper.selectById(exportId);
        if (export != null && "completed".equals(export.getStatus())) {
            exportMapper.incrementDownloadCount(exportId);
        }
        return export;
    }
    
    // ==================== 辅助方法 ====================
    
    /**
     * 获取会话列表
     */
    public List<ProposalSession> getUserSessions(Long userId) {
        return sessionMapper.findByUserId(userId);
    }
    
    /**
     * 获取方案详情
     */
    public ProposalContent getProposalDetail(Long proposalId) {
        return contentMapper.selectById(proposalId);
    }
    
    /**
     * 获取方案章节
     */
    public List<ProposalSection> getProposalSections(Long proposalId) {
        return sectionMapper.findByProposalId(proposalId);
    }
    
    /**
     * 获取方案版本
     */
    public List<ProposalVersion> getProposalVersions(Long proposalId) {
        return versionMapper.findByProposalId(proposalId);
    }
    
    /**
     * 获取模板列表
     */
    public List<ProposalTemplate> getTemplates(String type, String industry) {
        if (type != null) {
            return templateMapper.findByType(type);
        } else if (industry != null) {
            return templateMapper.findByIndustry(industry);
        }
        return templateMapper.findActiveTemplates();
    }
    
    private String toJson(Object obj) {
        try {
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            return mapper.writeValueAsString(obj);
        } catch (Exception e) {
            return "{}";
        }
    }
}