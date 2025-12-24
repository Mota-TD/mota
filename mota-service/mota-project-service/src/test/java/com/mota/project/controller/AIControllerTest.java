package com.mota.project.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mota.project.dto.ai.*;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * AIController Integration Tests
 * Tests the AI functionality API endpoints
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("AI Controller Integration Tests")
public class AIControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    // ============ AI History Tests ============

    @Test
    @DisplayName("GET /api/v1/ai/history - Should return AI history list")
    void getAIHistory_ShouldReturnList() throws Exception {
        mockMvc.perform(get("/api/v1/ai/history")
                .param("page", "1")
                .param("pageSize", "10")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.list").isArray())
                .andExpect(jsonPath("$.data.total").isNumber());
    }

    @Test
    @DisplayName("GET /api/v1/ai/history/{id} - Should return AI history by ID")
    void getAIHistoryById_ShouldReturnRecord() throws Exception {
        mockMvc.perform(get("/api/v1/ai/history/1")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.id").value("1"));
    }

    @Test
    @DisplayName("DELETE /api/v1/ai/history/{id} - Should delete AI history")
    void deleteAIHistory_ShouldReturnSuccess() throws Exception {
        mockMvc.perform(delete("/api/v1/ai/history/1")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200));
    }

    // ============ News Tests ============

    @Test
    @DisplayName("GET /api/v1/ai/news - Should return news list")
    void getNews_ShouldReturnList() throws Exception {
        mockMvc.perform(get("/api/v1/ai/news")
                .param("page", "1")
                .param("pageSize", "10")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.list").isArray())
                .andExpect(jsonPath("$.data.total").isNumber());
    }

    @Test
    @DisplayName("POST /api/v1/ai/news/{id}/star - Should toggle news star")
    void toggleNewsStar_ShouldReturnSuccess() throws Exception {
        mockMvc.perform(post("/api/v1/ai/news/1/star")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.isStarred").isBoolean());
    }

    @Test
    @DisplayName("POST /api/v1/ai/news/refresh - Should refresh news")
    void refreshNews_ShouldReturnList() throws Exception {
        mockMvc.perform(post("/api/v1/ai/news/refresh")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.list").isArray());
    }

    // ============ Solution Generation Tests ============

    @Test
    @DisplayName("POST /api/v1/ai/solution/generate - Should generate solution")
    void generateSolution_ShouldReturnSolution() throws Exception {
        GenerateSolutionRequest request = new GenerateSolutionRequest();
        request.setCompanyName("Test Company");
        request.setSolutionType("digital");
        request.setBusinessDesc("Test business description");
        request.setRequirements("Test requirements");

        mockMvc.perform(post("/api/v1/ai/solution/generate")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.id").exists())
                .andExpect(jsonPath("$.data.title").exists())
                .andExpect(jsonPath("$.data.content").exists());
    }

    @Test
    @DisplayName("GET /api/v1/ai/solution/types - Should return solution types")
    void getSolutionTypes_ShouldReturnList() throws Exception {
        mockMvc.perform(get("/api/v1/ai/solution/types")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("GET /api/v1/ai/solution/templates - Should return quick templates")
    void getQuickTemplates_ShouldReturnList() throws Exception {
        mockMvc.perform(get("/api/v1/ai/solution/templates")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").isArray());
    }

    // ============ PPT Generation Tests ============

    @Test
    @DisplayName("GET /api/v1/ai/ppt/templates - Should return PPT templates")
    void getPPTTemplates_ShouldReturnList() throws Exception {
        mockMvc.perform(get("/api/v1/ai/ppt/templates")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("GET /api/v1/ai/ppt/color-schemes - Should return color schemes")
    void getPPTColorSchemes_ShouldReturnList() throws Exception {
        mockMvc.perform(get("/api/v1/ai/ppt/color-schemes")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("POST /api/v1/ai/ppt/generate - Should generate PPT")
    void generatePPT_ShouldReturnPPT() throws Exception {
        GeneratePPTRequest request = new GeneratePPTRequest();
        request.setTitle("Test PPT");
        request.setTemplate("business");
        request.setSlideCount(5);

        mockMvc.perform(post("/api/v1/ai/ppt/generate")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.id").exists())
                .andExpect(jsonPath("$.data.title").value("Test PPT"))
                .andExpect(jsonPath("$.data.pages").isArray());
    }

    @Test
    @DisplayName("GET /api/v1/ai/ppt/{id}/download - Should return download link")
    void downloadPPT_ShouldReturnLink() throws Exception {
        mockMvc.perform(get("/api/v1/ai/ppt/test-id/download")
                .param("format", "pptx")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").isString());
    }

    // ============ Training Tests ============

    @Test
    @DisplayName("GET /api/v1/ai/training/stats - Should return training stats")
    void getTrainingStats_ShouldReturnStats() throws Exception {
        mockMvc.perform(get("/api/v1/ai/training/stats")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.totalDocuments").isNumber())
                .andExpect(jsonPath("$.data.modelVersion").exists());
    }

    @Test
    @DisplayName("GET /api/v1/ai/training/history - Should return training history")
    void getTrainingHistory_ShouldReturnList() throws Exception {
        mockMvc.perform(get("/api/v1/ai/training/history")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("GET /api/v1/ai/training/documents - Should return knowledge documents")
    void getKnowledgeDocuments_ShouldReturnList() throws Exception {
        mockMvc.perform(get("/api/v1/ai/training/documents")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("POST /api/v1/ai/training/start - Should start training")
    void startTraining_ShouldReturnTaskId() throws Exception {
        mockMvc.perform(post("/api/v1/ai/training/start")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.taskId").exists());
    }

    @Test
    @DisplayName("GET /api/v1/ai/training/progress/{taskId} - Should return training progress")
    void getTrainingProgress_ShouldReturnProgress() throws Exception {
        mockMvc.perform(get("/api/v1/ai/training/progress/test-task-id")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.progress").isNumber())
                .andExpect(jsonPath("$.data.status").exists());
    }

    // ============ Project AI Features Tests ============

    @Test
    @DisplayName("POST /api/v1/ai/project/decompose - Should decompose task")
    void decomposeTask_ShouldReturnSuggestions() throws Exception {
        TaskDecompositionRequest request = new TaskDecompositionRequest();
        request.setProjectName("Test Project");
        request.setProjectDescription("Build a web application");

        mockMvc.perform(post("/api/v1/ai/project/decompose")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.suggestions").isArray())
                .andExpect(jsonPath("$.data.totalEstimatedDays").isNumber());
    }

    @Test
    @DisplayName("GET /api/v1/ai/project/{projectId}/predict - Should predict progress")
    void predictProgress_ShouldReturnPrediction() throws Exception {
        mockMvc.perform(get("/api/v1/ai/project/1/predict")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.projectId").value("1"))
                .andExpect(jsonPath("$.data.currentProgress").isNumber())
                .andExpect(jsonPath("$.data.predictedProgress").isNumber());
    }

    @Test
    @DisplayName("GET /api/v1/ai/project/{projectId}/risks - Should return risk warnings")
    void getRiskWarnings_ShouldReturnList() throws Exception {
        mockMvc.perform(get("/api/v1/ai/project/1/risks")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("POST /api/v1/ai/project/{projectId}/report - Should generate project report")
    void generateProjectReport_ShouldReturnReport() throws Exception {
        ProjectReportRequest request = new ProjectReportRequest();
        request.setReportType("weekly");

        mockMvc.perform(post("/api/v1/ai/project/1/report")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.id").exists())
                .andExpect(jsonPath("$.data.projectId").value("1"))
                .andExpect(jsonPath("$.data.summary").exists());
    }

    @Test
    @DisplayName("GET /api/v1/ai/project/task/{taskId}/suggest-assignee - Should suggest assignee")
    void suggestAssignee_ShouldReturnSuggestions() throws Exception {
        mockMvc.perform(get("/api/v1/ai/project/task/1/suggest-assignee")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.suggestedAssignees").isArray());
    }

    @Test
    @DisplayName("GET /api/v1/ai/project/department-task/{id}/work-plan-suggestion - Should suggest work plan")
    void suggestWorkPlan_ShouldReturnSuggestion() throws Exception {
        mockMvc.perform(get("/api/v1/ai/project/department-task/1/work-plan-suggestion")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.summary").exists())
                .andExpect(jsonPath("$.data.milestones").isArray());
    }
}