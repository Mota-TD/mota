package com.mota.project.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mota.project.dto.request.ProgressUpdateRequest;
import com.mota.project.dto.request.StatusUpdateRequest;
import com.mota.project.entity.DepartmentTask;
import com.mota.project.service.DepartmentTaskService;
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
import java.util.HashMap;
import java.util.Map;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * DepartmentTaskController Integration Tests
 * Tests the department task management API endpoints
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("Department Task Controller Integration Tests")
public class DepartmentTaskControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private DepartmentTaskService departmentTaskService;

    private DepartmentTask testDepartmentTask;

    @BeforeEach
    void setUp() {
        testDepartmentTask = new DepartmentTask();
        testDepartmentTask.setId(1L);
        testDepartmentTask.setName("Test Department Task");
        testDepartmentTask.setDescription("Test department task description");
        testDepartmentTask.setStatus("pending");
        testDepartmentTask.setPriority("high");
        testDepartmentTask.setProgress(0);
        testDepartmentTask.setProjectId(1L);
        testDepartmentTask.setDepartmentId(1L);
        testDepartmentTask.setManagerId(1L);
        testDepartmentTask.setStartDate(LocalDate.now());
        testDepartmentTask.setEndDate(LocalDate.now().plusDays(14));
    }

    @Test
    @DisplayName("GET /api/v1/department-tasks - Should return department task list with pagination")
    void getDepartmentTasks_ShouldReturnPaginatedList() throws Exception {
        Page<DepartmentTask> page = new Page<>(1, 10);
        page.setRecords(Arrays.asList(testDepartmentTask));
        page.setTotal(1);
        
        when(departmentTaskService.pageDepartmentTasks(any(), any(), any(), any(), any())).thenReturn(page);

        mockMvc.perform(get("/api/v1/department-tasks")
                .param("page", "1")
                .param("pageSize", "10")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.records").isArray());
    }

    @Test
    @DisplayName("GET /api/v1/department-tasks/{id} - Should return department task by ID")
    void getDepartmentTaskById_ShouldReturnTask() throws Exception {
        when(departmentTaskService.getDetailById(1L)).thenReturn(testDepartmentTask);

        mockMvc.perform(get("/api/v1/department-tasks/1")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.id").value(1))
                .andExpect(jsonPath("$.data.name").value("Test Department Task"));
    }

    @Test
    @DisplayName("POST /api/v1/department-tasks - Should create new department task")
    void createDepartmentTask_ShouldReturnCreatedTask() throws Exception {
        when(departmentTaskService.createDepartmentTask(any(DepartmentTask.class))).thenReturn(testDepartmentTask);

        mockMvc.perform(post("/api/v1/department-tasks")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testDepartmentTask)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.name").value("Test Department Task"));
    }

    @Test
    @DisplayName("PUT /api/v1/department-tasks/{id} - Should update department task")
    void updateDepartmentTask_ShouldReturnUpdatedTask() throws Exception {
        testDepartmentTask.setName("Updated Department Task");
        when(departmentTaskService.updateDepartmentTask(any(DepartmentTask.class))).thenReturn(testDepartmentTask);

        mockMvc.perform(put("/api/v1/department-tasks/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testDepartmentTask)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.name").value("Updated Department Task"));
    }

    @Test
    @DisplayName("DELETE /api/v1/department-tasks/{id} - Should delete department task")
    void deleteDepartmentTask_ShouldReturnSuccess() throws Exception {
        when(departmentTaskService.removeById(1L)).thenReturn(true);

        mockMvc.perform(delete("/api/v1/department-tasks/1")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").value(true));
    }

    @Test
    @DisplayName("GET /api/v1/department-tasks/project/{projectId} - Should return tasks by project")
    void getDepartmentTasksByProject_ShouldReturnList() throws Exception {
        when(departmentTaskService.listByProjectId(1L)).thenReturn(Arrays.asList(testDepartmentTask));

        mockMvc.perform(get("/api/v1/department-tasks/project/1")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("GET /api/v1/department-tasks/department/{departmentId} - Should return tasks by department")
    void getDepartmentTasksByDepartment_ShouldReturnList() throws Exception {
        when(departmentTaskService.listByDepartmentId(1L)).thenReturn(Arrays.asList(testDepartmentTask));

        mockMvc.perform(get("/api/v1/department-tasks/department/1")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("GET /api/v1/department-tasks/manager/{managerId} - Should return tasks by manager")
    void getDepartmentTasksByManager_ShouldReturnList() throws Exception {
        when(departmentTaskService.listByManagerId(1L)).thenReturn(Arrays.asList(testDepartmentTask));

        mockMvc.perform(get("/api/v1/department-tasks/manager/1")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("PUT /api/v1/department-tasks/{id}/status - Should update department task status")
    void updateDepartmentTaskStatus_ShouldReturnSuccess() throws Exception {
        StatusUpdateRequest request = new StatusUpdateRequest();
        request.setStatus("in_progress");
        
        when(departmentTaskService.updateStatus(eq(1L), eq("in_progress"))).thenReturn(true);

        mockMvc.perform(put("/api/v1/department-tasks/1/status")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").value(true));
    }

    @Test
    @DisplayName("PUT /api/v1/department-tasks/{id}/progress - Should update department task progress")
    void updateDepartmentTaskProgress_ShouldReturnSuccess() throws Exception {
        ProgressUpdateRequest request = new ProgressUpdateRequest();
        request.setProgress(50);
        
        when(departmentTaskService.updateProgress(eq(1L), eq(50))).thenReturn(true);

        mockMvc.perform(put("/api/v1/department-tasks/1/progress")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").value(true));
    }

    @Test
    @DisplayName("POST /api/v1/department-tasks/{id}/calculate-progress - Should calculate progress")
    void calculateProgress_ShouldReturnSuccess() throws Exception {
        when(departmentTaskService.calculateAndUpdateProgress(1L)).thenReturn(true);

        mockMvc.perform(post("/api/v1/department-tasks/1/calculate-progress")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").value(true));
    }

    @Test
    @DisplayName("GET /api/v1/department-tasks/project/{projectId}/statistics - Should return statistics")
    void getDepartmentTaskStatistics_ShouldReturnMap() throws Exception {
        Map<String, Long> statistics = new HashMap<>();
        statistics.put("pending", 3L);
        statistics.put("in_progress", 2L);
        statistics.put("completed", 5L);
        
        when(departmentTaskService.countByProjectIdGroupByStatus(1L)).thenReturn(statistics);

        mockMvc.perform(get("/api/v1/department-tasks/project/1/statistics")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.pending").value(3))
                .andExpect(jsonPath("$.data.completed").value(5));
    }
}