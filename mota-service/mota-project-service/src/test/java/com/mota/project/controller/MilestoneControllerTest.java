package com.mota.project.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mota.project.entity.Milestone;
import com.mota.project.service.MilestoneService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * MilestoneController Integration Tests
 * Tests the milestone management API endpoints
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("Milestone Controller Integration Tests")
public class MilestoneControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private MilestoneService milestoneService;

    private Milestone testMilestone;

    @BeforeEach
    void setUp() {
        testMilestone = new Milestone();
        testMilestone.setId(1L);
        testMilestone.setName("Test Milestone");
        testMilestone.setDescription("Test milestone description");
        testMilestone.setStatus("pending");
        testMilestone.setProjectId(1L);
        testMilestone.setTargetDate(LocalDate.now().plusDays(30));
    }

    @Test
    @DisplayName("GET /api/v1/milestones - Should return milestone list with pagination")
    void getMilestones_ShouldReturnPaginatedList() throws Exception {
        Page<Milestone> page = new Page<>(1, 10);
        page.setRecords(Arrays.asList(testMilestone));
        page.setTotal(1);
        
        when(milestoneService.pageMilestones(any(), any(), any())).thenReturn(page);

        mockMvc.perform(get("/api/v1/milestones")
                .param("page", "1")
                .param("pageSize", "10")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.records").isArray());
    }

    @Test
    @DisplayName("GET /api/v1/milestones/{id} - Should return milestone by ID")
    void getMilestoneById_ShouldReturnMilestone() throws Exception {
        when(milestoneService.getDetailById(1L)).thenReturn(testMilestone);

        mockMvc.perform(get("/api/v1/milestones/1")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.id").value(1))
                .andExpect(jsonPath("$.data.name").value("Test Milestone"));
    }

    @Test
    @DisplayName("POST /api/v1/milestones - Should create new milestone")
    void createMilestone_ShouldReturnCreatedMilestone() throws Exception {
        when(milestoneService.createMilestone(any(Milestone.class))).thenReturn(testMilestone);

        mockMvc.perform(post("/api/v1/milestones")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testMilestone)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.name").value("Test Milestone"));
    }

    @Test
    @DisplayName("PUT /api/v1/milestones/{id} - Should update milestone")
    void updateMilestone_ShouldReturnUpdatedMilestone() throws Exception {
        testMilestone.setName("Updated Milestone");
        when(milestoneService.updateMilestone(any(Milestone.class))).thenReturn(testMilestone);

        mockMvc.perform(put("/api/v1/milestones/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testMilestone)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.name").value("Updated Milestone"));
    }

    @Test
    @DisplayName("DELETE /api/v1/milestones/{id} - Should delete milestone")
    void deleteMilestone_ShouldReturnSuccess() throws Exception {
        when(milestoneService.deleteMilestone(1L)).thenReturn(true);

        mockMvc.perform(delete("/api/v1/milestones/1")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").value(true));
    }

    @Test
    @DisplayName("GET /api/v1/milestones/project/{projectId} - Should return milestones by project")
    void getMilestonesByProject_ShouldReturnList() throws Exception {
        when(milestoneService.getByProjectId(1L)).thenReturn(Arrays.asList(testMilestone));

        mockMvc.perform(get("/api/v1/milestones/project/1")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("PUT /api/v1/milestones/{id}/complete - Should complete milestone")
    void completeMilestone_ShouldReturnCompletedMilestone() throws Exception {
        testMilestone.setStatus("completed");
        when(milestoneService.completeMilestone(1L)).thenReturn(testMilestone);

        mockMvc.perform(put("/api/v1/milestones/1/complete")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.status").value("completed"));
    }

    @Test
    @DisplayName("PUT /api/v1/milestones/{id}/delay - Should mark milestone as delayed")
    void delayMilestone_ShouldReturnDelayedMilestone() throws Exception {
        testMilestone.setStatus("delayed");
        when(milestoneService.delayMilestone(1L)).thenReturn(testMilestone);

        mockMvc.perform(put("/api/v1/milestones/1/delay")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.status").value("delayed"));
    }

    @Test
    @DisplayName("PUT /api/v1/milestones/project/{projectId}/reorder - Should reorder milestones")
    void reorderMilestones_ShouldReturnSuccess() throws Exception {
        Map<String, List<Long>> body = new HashMap<>();
        body.put("milestoneIds", Arrays.asList(1L, 2L, 3L));
        
        when(milestoneService.reorderMilestones(eq(1L), anyList())).thenReturn(true);

        mockMvc.perform(put("/api/v1/milestones/project/1/reorder")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").value(true));
    }

    @Test
    @DisplayName("GET /api/v1/milestones/project/{projectId}/upcoming - Should return upcoming milestones")
    void getUpcomingMilestones_ShouldReturnList() throws Exception {
        when(milestoneService.getUpcomingMilestones(eq(1L), eq(7))).thenReturn(Arrays.asList(testMilestone));

        mockMvc.perform(get("/api/v1/milestones/project/1/upcoming")
                .param("days", "7")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("GET /api/v1/milestones/project/{projectId}/delayed - Should return delayed milestones")
    void getDelayedMilestones_ShouldReturnList() throws Exception {
        when(milestoneService.getDelayedMilestones(1L)).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/v1/milestones/project/1/delayed")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").isArray());
    }
}