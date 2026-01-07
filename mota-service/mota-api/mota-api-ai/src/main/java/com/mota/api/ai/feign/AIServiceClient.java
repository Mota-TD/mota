package com.mota.api.ai.feign;

import com.mota.api.ai.dto.*;
import com.mota.common.core.result.Result;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * AI服务Feign客户端
 * 
 * 提供AI服务的远程调用接口，供其他微服务调用
 * 
 * @author mota
 * @since 1.0.0
 */
@FeignClient(name = "mota-ai-service", path = "/api/v1/ai")
public interface AIServiceClient {

    // ==================== AI助手 ====================
    
    /**
     * 智能问答
     */
    @PostMapping("/assistant/chat")
    Result<ChatResponseDTO> chat(@RequestBody ChatRequestDTO request);

    /**
     * 获取工作建议
     */
    @GetMapping("/assistant/suggestions")
    Result<List<WorkSuggestionDTO>> getWorkSuggestions(@RequestParam("userId") Long userId);

    /**
     * 生成文档摘要
     */
    @PostMapping("/assistant/summarize")
    Result<SummaryDTO> summarizeDocument(@RequestBody SummarizeRequestDTO request);

    // ==================== AI方案生成 ====================
    
    /**
     * 创建方案会话
     */
    @PostMapping("/proposal/sessions")
    Result<ProposalSessionDTO> createProposalSession(@RequestBody CreateProposalSessionDTO request);

    /**
     * 生成方案
     */
    @PostMapping("/proposal/generate")
    Result<ProposalContentDTO> generateProposal(@RequestBody GenerateProposalDTO request);

    /**
     * 获取方案质量检查结果
     */
    @GetMapping("/proposal/{proposalId}/quality-check")
    Result<QualityCheckDTO> getQualityCheck(@PathVariable("proposalId") Long proposalId);

    // ==================== 智能搜索 ====================
    
    /**
     * 语义搜索
     */
    @PostMapping("/search/semantic")
    Result<SearchResultDTO> semanticSearch(@RequestBody SemanticSearchDTO request);

    /**
     * 混合搜索
     */
    @PostMapping("/search/hybrid")
    Result<SearchResultDTO> hybridSearch(@RequestBody HybridSearchDTO request);

    /**
     * 获取搜索建议
     */
    @GetMapping("/search/suggestions")
    Result<List<String>> getSearchSuggestions(@RequestParam("query") String query);

    // ==================== 智能新闻 ====================
    
    /**
     * 获取推荐新闻
     */
    @GetMapping("/news/recommendations")
    Result<List<NewsArticleDTO>> getRecommendedNews(
            @RequestParam("userId") Long userId,
            @RequestParam(value = "limit", defaultValue = "10") Integer limit);

    /**
     * 获取行业新闻
     */
    @GetMapping("/news/industry")
    Result<List<NewsArticleDTO>> getIndustryNews(
            @RequestParam("enterpriseId") Long enterpriseId,
            @RequestParam(value = "limit", defaultValue = "20") Integer limit);

    // ==================== AI知识库 ====================
    
    /**
     * 文档向量化
     */
    @PostMapping("/knowledge/vectorize")
    Result<VectorizeResultDTO> vectorizeDocument(@RequestBody VectorizeRequestDTO request);

    /**
     * 语义检索
     */
    @PostMapping("/knowledge/retrieve")
    Result<List<RetrievalResultDTO>> retrieveKnowledge(@RequestBody RetrievalRequestDTO request);

    // ==================== 多模型管理 ====================
    
    /**
     * 获取可用模型列表
     */
    @GetMapping("/models/available")
    Result<List<AIModelDTO>> getAvailableModels();

    /**
     * 调用指定模型
     */
    @PostMapping("/models/{modelId}/invoke")
    Result<ModelInvokeResultDTO> invokeModel(
            @PathVariable("modelId") String modelId,
            @RequestBody ModelInvokeRequestDTO request);
}