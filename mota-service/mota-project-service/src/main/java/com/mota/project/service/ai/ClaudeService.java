package com.mota.project.service.ai;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mota.project.config.ClaudeConfig;
import com.mota.project.dto.ai.ProgressDescriptionRequest;
import com.mota.project.dto.ai.ProgressDescriptionResponse;
import com.mota.project.dto.ai.TaskDecompositionRequest;
import com.mota.project.dto.ai.TaskDecompositionResponse;
import com.mota.project.dto.ai.TaskDecompositionSuggestion;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * Claude AI 服务
 * 调用 Anthropic Claude API 进行智能任务分解
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ClaudeService {

    private static final String SOURCE_AI = "ai";
    private static final String SOURCE_MOCK = "mock";
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private final ClaudeConfig claudeConfig;
    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate;

    /**
     * 调用 Claude API 进行任务分解
     */
    public TaskDecompositionResponse decomposeTask(TaskDecompositionRequest request) {
        log.info("开始调用 Claude API 进行任务分解, 项目: {}", request.getProjectName());
        
        // 检查 API Key 是否配置
        if (claudeConfig.getApiKey() == null || claudeConfig.getApiKey().isEmpty()) {
            log.warn("Claude API Key 未配置，返回模拟数据");
            return generateMockResponse(request);
        }
        
        try {
            // 构建提示词
            String prompt = buildTaskDecompositionPrompt(request);
            
            // 调用 Claude API
            String response = callClaudeAPI(prompt);
            
            // 解析响应
            return parseTaskDecompositionResponse(response, request);
            
        } catch (Exception e) {
            log.error("调用 Claude API 失败: {}", e.getMessage(), e);
            // 失败时返回模拟数据
            return generateMockResponse(request);
        }
    }

    /**
     * 构建任务分解提示词
     */
    private String buildTaskDecompositionPrompt(TaskDecompositionRequest request) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("你是一个专业的项目管理专家。请根据以下项目信息，将项目分解为具体的可执行任务。\n\n");
        prompt.append("## 项目信息\n");
        prompt.append("- 项目名称: ").append(request.getProjectName()).append("\n");
        prompt.append("- 项目描述: ").append(request.getProjectDescription()).append("\n");
        
        if (request.getDepartments() != null && !request.getDepartments().isEmpty()) {
            prompt.append("- 参与部门: ").append(String.join(", ", request.getDepartments())).append("\n");
        }
        
        if (request.getStartDate() != null) {
            prompt.append("- 开始日期: ").append(request.getStartDate()).append("\n");
        }
        
        if (request.getEndDate() != null) {
            prompt.append("- 结束日期: ").append(request.getEndDate()).append("\n");
        }
        
        prompt.append("\n## 要求\n");
        prompt.append("请将项目分解为5-10个具体任务，每个任务包含以下信息：\n");
        prompt.append("1. 任务名称（简洁明了）\n");
        prompt.append("2. 任务描述（详细说明任务内容和目标）\n");
        prompt.append("3. 建议负责部门\n");
        prompt.append("4. 优先级（high/medium/low）\n");
        prompt.append("5. 预估工期（天数）\n");
        prompt.append("6. 依赖任务（如果有的话，用任务序号表示）\n");
        prompt.append("\n## 输出格式\n");
        prompt.append("请以JSON格式输出，格式如下：\n");
        prompt.append("```json\n");
        prompt.append("{\n");
        prompt.append("  \"tasks\": [\n");
        prompt.append("    {\n");
        prompt.append("      \"id\": \"1\",\n");
        prompt.append("      \"name\": \"任务名称\",\n");
        prompt.append("      \"description\": \"任务描述\",\n");
        prompt.append("      \"department\": \"负责部门\",\n");
        prompt.append("      \"priority\": \"high/medium/low\",\n");
        prompt.append("      \"estimatedDays\": 5,\n");
        prompt.append("      \"dependencies\": []\n");
        prompt.append("    }\n");
        prompt.append("  ],\n");
        prompt.append("  \"totalDays\": 30,\n");
        prompt.append("  \"riskAssessment\": \"风险评估说明\"\n");
        prompt.append("}\n");
        prompt.append("```\n");
        prompt.append("\n请只输出JSON，不要有其他内容。");
        
        return prompt.toString();
    }

    /**
     * 调用 Claude API（支持 Anthropic 原生格式和 OpenAI 兼容格式）
     */
    private String callClaudeAPI(String prompt) {
        String baseUrl = claudeConfig.getBaseUrl();
        
        // 判断是否使用 OpenAI 兼容格式（大多数代理服务使用此格式）
        boolean useOpenAIFormat = !baseUrl.contains("anthropic.com");
        
        if (useOpenAIFormat) {
            return callOpenAICompatibleAPI(prompt);
        } else {
            return callAnthropicAPI(prompt);
        }
    }
    
    /**
     * 调用 OpenAI 兼容格式的 API（适用于大多数代理服务）
     */
    private String callOpenAICompatibleAPI(String prompt) {
        String url = claudeConfig.getBaseUrl() + "/chat/completions";
        
        // 构建请求头
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + claudeConfig.getApiKey());
        
        // 构建请求体（OpenAI 格式）
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", claudeConfig.getModel());
        requestBody.put("max_tokens", claudeConfig.getMaxTokens());
        requestBody.put("temperature", claudeConfig.getTemperature());
        
        List<Map<String, String>> messages = new ArrayList<>();
        Map<String, String> userMessage = new HashMap<>();
        userMessage.put("role", "user");
        userMessage.put("content", prompt);
        messages.add(userMessage);
        requestBody.put("messages", messages);
        
        try {
            String jsonBody = objectMapper.writeValueAsString(requestBody);
            log.info("调用 OpenAI 兼容 API, URL: {}", url);
            log.debug("请求体: {}", jsonBody);
            
            HttpEntity<String> entity = new HttpEntity<>(jsonBody, headers);
            
            ResponseEntity<String> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                entity,
                String.class
            );
            
            log.debug("API 响应: {}", response.getBody());
            
            // 解析 OpenAI 格式响应
            JsonNode responseJson = objectMapper.readTree(response.getBody());
            JsonNode choices = responseJson.get("choices");
            if (choices != null && choices.isArray() && choices.size() > 0) {
                JsonNode firstChoice = choices.get(0);
                JsonNode message = firstChoice.get("message");
                if (message != null && message.has("content")) {
                    return message.get("content").asText();
                }
            }
            
            throw new RuntimeException("无法解析 OpenAI 兼容 API 响应: " + response.getBody());
            
        } catch (JsonProcessingException e) {
            throw new RuntimeException("JSON 处理错误: " + e.getMessage(), e);
        }
    }
    
    /**
     * 调用 Anthropic 原生 API
     */
    private String callAnthropicAPI(String prompt) {
        String url = claudeConfig.getBaseUrl() + "/messages";
        
        // 构建请求头
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-api-key", claudeConfig.getApiKey());
        headers.set("anthropic-version", "2023-06-01");
        
        // 构建请求体（Anthropic 格式）
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", claudeConfig.getModel());
        requestBody.put("max_tokens", claudeConfig.getMaxTokens());
        requestBody.put("temperature", claudeConfig.getTemperature());
        
        List<Map<String, String>> messages = new ArrayList<>();
        Map<String, String> userMessage = new HashMap<>();
        userMessage.put("role", "user");
        userMessage.put("content", prompt);
        messages.add(userMessage);
        requestBody.put("messages", messages);
        
        try {
            String jsonBody = objectMapper.writeValueAsString(requestBody);
            log.info("调用 Anthropic API, URL: {}", url);
            log.debug("请求体: {}", jsonBody);
            
            HttpEntity<String> entity = new HttpEntity<>(jsonBody, headers);
            
            ResponseEntity<String> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                entity,
                String.class
            );
            
            log.debug("API 响应: {}", response.getBody());
            
            // 解析 Anthropic 格式响应
            JsonNode responseJson = objectMapper.readTree(response.getBody());
            JsonNode contentArray = responseJson.get("content");
            if (contentArray != null && contentArray.isArray() && contentArray.size() > 0) {
                JsonNode firstContent = contentArray.get(0);
                if (firstContent.has("text")) {
                    return firstContent.get("text").asText();
                }
            }
            
            throw new RuntimeException("无法解析 Anthropic API 响应: " + response.getBody());
            
        } catch (JsonProcessingException e) {
            throw new RuntimeException("JSON 处理错误: " + e.getMessage(), e);
        }
    }

    /**
     * 解析任务分解响应
     */
    private TaskDecompositionResponse parseTaskDecompositionResponse(String response, TaskDecompositionRequest request) {
        try {
            // 提取 JSON 内容（可能被 markdown 代码块包裹）
            String jsonContent = extractJsonFromResponse(response);
            
            JsonNode jsonNode = objectMapper.readTree(jsonContent);
            
            List<TaskDecompositionSuggestion> suggestions = new ArrayList<>();
            JsonNode tasksNode = jsonNode.get("tasks");
            
            if (tasksNode != null && tasksNode.isArray()) {
                for (JsonNode taskNode : tasksNode) {
                    TaskDecompositionSuggestion suggestion = TaskDecompositionSuggestion.builder()
                            .id(getTextValue(taskNode, "id", UUID.randomUUID().toString()))
                            .name(getTextValue(taskNode, "name", "未命名任务"))
                            .description(getTextValue(taskNode, "description", ""))
                            .suggestedDepartment(getTextValue(taskNode, "department", null))
                            .suggestedPriority(getTextValue(taskNode, "priority", "medium"))
                            .estimatedDays(getIntValue(taskNode, "estimatedDays", 1))
                            .dependencies(getStringListValue(taskNode, "dependencies"))
                            .build();
                    suggestions.add(suggestion);
                }
            }
            
            int totalDays = getIntValue(jsonNode, "totalDays", calculateTotalDays(suggestions));
            String riskAssessment = getTextValue(jsonNode, "riskAssessment", "请根据实际情况评估项目风险");
            
            log.info("Claude API 调用成功，生成 {} 个任务建议", suggestions.size());
            
            return TaskDecompositionResponse.builder()
                    .suggestions(suggestions)
                    .totalEstimatedDays(totalDays)
                    .riskAssessment(riskAssessment)
                    .source(SOURCE_AI)
                    .model(claudeConfig.getModel())
                    .generatedAt(LocalDateTime.now().format(DATE_FORMATTER))
                    .build();
                    
        } catch (Exception e) {
            log.error("解析 Claude 响应失败: {}", e.getMessage(), e);
            return generateMockResponse(request);
        }
    }

    /**
     * 从响应中提取 JSON 内容
     */
    private String extractJsonFromResponse(String response) {
        // 尝试提取 markdown 代码块中的 JSON
        if (response.contains("```json")) {
            int start = response.indexOf("```json") + 7;
            int end = response.indexOf("```", start);
            if (end > start) {
                return response.substring(start, end).trim();
            }
        }
        
        if (response.contains("```")) {
            int start = response.indexOf("```") + 3;
            int end = response.indexOf("```", start);
            if (end > start) {
                return response.substring(start, end).trim();
            }
        }
        
        // 尝试找到 JSON 对象
        int start = response.indexOf("{");
        int end = response.lastIndexOf("}");
        if (start >= 0 && end > start) {
            return response.substring(start, end + 1);
        }
        
        return response;
    }

    /**
     * 获取文本值
     */
    private String getTextValue(JsonNode node, String field, String defaultValue) {
        if (node.has(field) && !node.get(field).isNull()) {
            return node.get(field).asText();
        }
        return defaultValue;
    }

    /**
     * 获取整数值
     */
    private int getIntValue(JsonNode node, String field, int defaultValue) {
        if (node.has(field) && !node.get(field).isNull()) {
            return node.get(field).asInt();
        }
        return defaultValue;
    }

    /**
     * 获取字符串列表值
     */
    private List<String> getStringListValue(JsonNode node, String field) {
        List<String> result = new ArrayList<>();
        if (node.has(field) && node.get(field).isArray()) {
            for (JsonNode item : node.get(field)) {
                result.add(item.asText());
            }
        }
        return result;
    }

    /**
     * 计算总工期
     */
    private int calculateTotalDays(List<TaskDecompositionSuggestion> suggestions) {
        return suggestions.stream()
                .mapToInt(TaskDecompositionSuggestion::getEstimatedDays)
                .sum();
    }

    /**
     * 生成模拟响应（当 API 不可用时）
     */
    private TaskDecompositionResponse generateMockResponse(TaskDecompositionRequest request) {
        log.info("生成模拟任务分解响应");
        
        List<TaskDecompositionSuggestion> suggestions = new ArrayList<>();
        
        // 根据项目描述生成基本任务
        suggestions.add(TaskDecompositionSuggestion.builder()
                .id("1")
                .name("需求分析与规划")
                .description("收集和分析项目需求，制定详细的项目计划和里程碑")
                .suggestedDepartment(getFirstDepartment(request.getDepartments(), "产品部"))
                .suggestedPriority("high")
                .estimatedDays(5)
                .dependencies(Collections.emptyList())
                .build());
        
        suggestions.add(TaskDecompositionSuggestion.builder()
                .id("2")
                .name("技术方案设计")
                .description("根据需求设计技术架构和实现方案，评估技术可行性")
                .suggestedDepartment(getFirstDepartment(request.getDepartments(), "技术部"))
                .suggestedPriority("high")
                .estimatedDays(3)
                .dependencies(Arrays.asList("1"))
                .build());
        
        suggestions.add(TaskDecompositionSuggestion.builder()
                .id("3")
                .name("UI/UX设计")
                .description("设计用户界面和交互体验，输出设计稿和交互文档")
                .suggestedDepartment(getFirstDepartment(request.getDepartments(), "设计部"))
                .suggestedPriority("medium")
                .estimatedDays(5)
                .dependencies(Arrays.asList("1"))
                .build());
        
        suggestions.add(TaskDecompositionSuggestion.builder()
                .id("4")
                .name("核心功能开发")
                .description("按照技术方案进行核心功能的编码开发")
                .suggestedDepartment(getFirstDepartment(request.getDepartments(), "技术部"))
                .suggestedPriority("high")
                .estimatedDays(15)
                .dependencies(Arrays.asList("2", "3"))
                .build());
        
        suggestions.add(TaskDecompositionSuggestion.builder()
                .id("5")
                .name("单元测试")
                .description("编写和执行单元测试，确保代码质量")
                .suggestedDepartment(getFirstDepartment(request.getDepartments(), "技术部"))
                .suggestedPriority("medium")
                .estimatedDays(5)
                .dependencies(Arrays.asList("4"))
                .build());
        
        suggestions.add(TaskDecompositionSuggestion.builder()
                .id("6")
                .name("集成测试")
                .description("进行系统集成测试，验证各模块协同工作")
                .suggestedDepartment(getFirstDepartment(request.getDepartments(), "测试部"))
                .suggestedPriority("medium")
                .estimatedDays(5)
                .dependencies(Arrays.asList("5"))
                .build());
        
        suggestions.add(TaskDecompositionSuggestion.builder()
                .id("7")
                .name("用户验收测试")
                .description("组织用户进行验收测试，收集反馈并修复问题")
                .suggestedDepartment(getFirstDepartment(request.getDepartments(), "测试部"))
                .suggestedPriority("high")
                .estimatedDays(3)
                .dependencies(Arrays.asList("6"))
                .build());
        
        suggestions.add(TaskDecompositionSuggestion.builder()
                .id("8")
                .name("部署上线")
                .description("准备生产环境，部署应用并进行上线验证")
                .suggestedDepartment(getFirstDepartment(request.getDepartments(), "运维部"))
                .suggestedPriority("high")
                .estimatedDays(2)
                .dependencies(Arrays.asList("7"))
                .build());
        
        int totalDays = calculateTotalDays(suggestions);
        
        return TaskDecompositionResponse.builder()
                .suggestions(suggestions)
                .totalEstimatedDays(totalDays)
                .riskAssessment("项目整体风险评估：\n" +
                        "1. 需求变更风险 - 建议在需求分析阶段充分沟通，减少后期变更\n" +
                        "2. 技术难点风险 - 建议在技术方案设计阶段进行技术预研\n" +
                        "3. 进度延期风险 - 建议预留10-20%的缓冲时间\n" +
                        "4. 资源不足风险 - 建议提前协调各部门资源")
                .source(SOURCE_MOCK)
                .model(null)
                .generatedAt(LocalDateTime.now().format(DATE_FORMATTER))
                .build();
    }

    /**
     * 获取第一个部门或默认部门
     */
    private String getFirstDepartment(List<String> departments, String defaultDept) {
        if (departments != null && !departments.isEmpty()) {
            return departments.get(0);
        }
        return defaultDept;
    }

    /**
     * AI 进度描述生成/润色
     */
    public ProgressDescriptionResponse generateProgressDescription(ProgressDescriptionRequest request) {
        log.info("开始调用 Claude API 进行进度描述处理, 任务: {}, 操作类型: {}",
                request.getTaskName(), request.getActionType());
        
        // 检查 API Key 是否配置
        if (claudeConfig.getApiKey() == null || claudeConfig.getApiKey().isEmpty()) {
            log.warn("Claude API Key 未配置，返回模拟数据");
            return generateMockProgressDescription(request);
        }
        
        try {
            // 构建提示词
            String prompt = buildProgressDescriptionPrompt(request);
            
            // 调用 Claude API
            String response = callClaudeAPI(prompt);
            
            // 解析响应
            return parseProgressDescriptionResponse(response);
            
        } catch (Exception e) {
            log.error("调用 Claude API 失败: {}", e.getMessage(), e);
            return generateMockProgressDescription(request);
        }
    }

    /**
     * 构建进度描述提示词
     */
    private String buildProgressDescriptionPrompt(ProgressDescriptionRequest request) {
        StringBuilder prompt = new StringBuilder();
        
        if ("polish".equals(request.getActionType())) {
            // 润色模式
            prompt.append("你是一个专业的项目管理助手。请帮我润色以下任务进度更新描述，使其更加专业、清晰、有条理。\n\n");
            prompt.append("## 任务信息\n");
            prompt.append("- 任务名称: ").append(request.getTaskName()).append("\n");
            if (request.getTaskDescription() != null) {
                prompt.append("- 任务描述: ").append(request.getTaskDescription()).append("\n");
            }
            prompt.append("- 进度变化: ").append(request.getCurrentProgress()).append("% → ").append(request.getNewProgress()).append("%\n");
            prompt.append("\n## 用户输入的描述\n");
            prompt.append(request.getUserDescription()).append("\n");
            prompt.append("\n## 要求\n");
            prompt.append("1. 保持原意，但使表达更加专业和清晰\n");
            prompt.append("2. 可以适当补充细节，但不要编造不存在的内容\n");
            prompt.append("3. 使用简洁的语言，避免冗余\n");
            prompt.append("4. 如果有具体的完成项，可以用列表形式展示\n");
            prompt.append("5. 输出格式为纯文本或简单的HTML（支持<p>、<ul>、<li>、<strong>等标签）\n");
            prompt.append("\n请直接输出润色后的描述，不要有其他解释。");
        } else {
            // 自动生成模式
            prompt.append("你是一个专业的项目管理助手。请根据以下任务信息，自动生成一段专业的进度更新描述。\n\n");
            prompt.append("## 任务信息\n");
            prompt.append("- 任务名称: ").append(request.getTaskName()).append("\n");
            if (request.getTaskDescription() != null) {
                prompt.append("- 任务描述: ").append(request.getTaskDescription()).append("\n");
            }
            prompt.append("- 进度变化: ").append(request.getCurrentProgress()).append("% → ").append(request.getNewProgress()).append("%\n");
            prompt.append("\n## 要求\n");
            prompt.append("1. 根据进度变化推测可能完成的工作内容\n");
            prompt.append("2. 描述应该专业、具体、有条理\n");
            prompt.append("3. 可以包含已完成的工作、遇到的问题、下一步计划等\n");
            prompt.append("4. 使用简洁的语言，避免冗余\n");
            prompt.append("5. 输出格式为纯文本或简单的HTML（支持<p>、<ul>、<li>、<strong>等标签）\n");
            prompt.append("\n请直接输出生成的描述，不要有其他解释。");
        }
        
        return prompt.toString();
    }

    /**
     * 解析进度描述响应
     */
    private ProgressDescriptionResponse parseProgressDescriptionResponse(String response) {
        // 清理响应内容
        String description = response.trim();
        
        // 如果响应被 markdown 代码块包裹，提取内容
        if (description.startsWith("```html")) {
            description = description.substring(7);
            int endIndex = description.lastIndexOf("```");
            if (endIndex > 0) {
                description = description.substring(0, endIndex);
            }
        } else if (description.startsWith("```")) {
            description = description.substring(3);
            int endIndex = description.lastIndexOf("```");
            if (endIndex > 0) {
                description = description.substring(0, endIndex);
            }
        }
        
        return ProgressDescriptionResponse.builder()
                .description(description.trim())
                .source(SOURCE_AI)
                .model(claudeConfig.getModel())
                .build();
    }

    /**
     * 生成模拟进度描述
     */
    private ProgressDescriptionResponse generateMockProgressDescription(ProgressDescriptionRequest request) {
        log.info("生成模拟进度描述");
        
        String description;
        int progressDiff = request.getNewProgress() - request.getCurrentProgress();
        
        if ("polish".equals(request.getActionType()) && request.getUserDescription() != null) {
            // 润色模式：简单优化用户输入
            description = "<p><strong>进度更新：</strong>" + request.getUserDescription() + "</p>" +
                    "<p>当前进度已从 " + request.getCurrentProgress() + "% 更新至 " + request.getNewProgress() + "%。</p>";
        } else {
            // 自动生成模式
            if (progressDiff >= 50) {
                description = "<p><strong>重大进展：</strong></p>" +
                        "<ul>" +
                        "<li>任务「" + request.getTaskName() + "」取得重大进展</li>" +
                        "<li>进度从 " + request.getCurrentProgress() + "% 提升至 " + request.getNewProgress() + "%</li>" +
                        "<li>主要工作内容已基本完成</li>" +
                        "</ul>" +
                        "<p><strong>下一步计划：</strong>进行收尾工作和质量检查。</p>";
            } else if (progressDiff >= 20) {
                description = "<p><strong>进度更新：</strong></p>" +
                        "<ul>" +
                        "<li>任务「" + request.getTaskName() + "」稳步推进中</li>" +
                        "<li>进度从 " + request.getCurrentProgress() + "% 提升至 " + request.getNewProgress() + "%</li>" +
                        "<li>按计划完成了阶段性目标</li>" +
                        "</ul>" +
                        "<p><strong>下一步计划：</strong>继续推进剩余工作。</p>";
            } else {
                description = "<p><strong>进度更新：</strong></p>" +
                        "<p>任务「" + request.getTaskName() + "」进度从 " + request.getCurrentProgress() +
                        "% 更新至 " + request.getNewProgress() + "%。</p>" +
                        "<p>正在按计划推进中。</p>";
            }
        }
        
        return ProgressDescriptionResponse.builder()
                .description(description)
                .source(SOURCE_MOCK)
                .model(null)
                .build();
    }
}