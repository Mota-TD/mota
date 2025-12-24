package com.mota.project.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mota.project.dto.request.StatusUpdateRequest;
import com.mota.project.entity.Task;
import com.mota.project.service.TaskService;
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
 * TaskController Integration Tests
 * Tests the task management API endpoints
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("Task Controller Integration Tests")
public class TaskControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private TaskService taskService;

    private Task testTask;

    @BeforeEach
    void setUp() {
        testTask = new Task();
        testTask.setId(1L);
        testTask.setName("Test Task");
        testTask.setDescription("Test task description");
        testTask.setStatus("pending");
        testTask.setPriority("high");
        testTask.setProgress(0);
        testTask.setProjectId(1L);
        testTask.setAssigneeId(1L);
        testTask.setStartDate(LocalDate.now());
        testTask.setEndDate(LocalDate.now().plusDays(7));
    }

    @Test
    @DisplayName("GET /api/v1/tasks - Should return task list with pagination")
    void getTasks_ShouldReturnPaginatedList() throws Exception {
        Page<Task> page = new Page<>(1, 10);
        page.setRecords(Arrays.asList(testTask));
        page.setTotal(1);
        
        when(taskService.pageTasks(any(), any(), any(), any(), any(), any())).thenReturn(page);

        mockMvc.perform(get("/api/v1/tasks")
                .param("page", "1")
                .param("pageSize", "10")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.records").isArray());
    }

    @Test
    @DisplayName("GET /api/v1/tasks/{id} - Should return task by ID")
    void getTaskById_ShouldReturnTask() throws Exception {
        when(taskService.getDetailById(1L)).thenReturn(testTask);

        mockMvc.perform(get("/api/v1/tasks/1")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.id").value(1))
                .andExpect(jsonPath("$.data.name").value("Test Task"));
    }

    @Test
    @DisplayName("POST /api/v1/tasks - Should create new task")
    void createTask_ShouldReturnCreatedTask() throws Exception {
        when(taskService.createTask(any(Task.class))).thenReturn(testTask);

        mockMvc.perform(post("/api/v1/tasks")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testTask)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.name").value("Test Task"));
    }

    @Test
    @DisplayName("PUT /api/v1/tasks/{id} - Should update task")
    void updateTask_ShouldReturnUpdatedTask() throws Exception {
        testTask.setName("Updated Task");
        when(taskService.updateTask(any(Task.class))).thenReturn(testTask);

        mockMvc.perform(put("/api/v1/tasks/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testTask)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.name").value("Updated Task"));
    }

    @Test
    @DisplayName("DELETE /api/v1/tasks/{id} - Should delete task")
    void deleteTask_ShouldReturnSuccess() throws Exception {
        when(taskService.removeById(1L)).thenReturn(true);

        mockMvc.perform(delete("/api/v1/tasks/1")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").value(true));
    }

    @Test
    @DisplayName("PUT /api/v1/tasks/{id}/status - Should update task status")
    void updateTaskStatus_ShouldReturnSuccess() throws Exception {
        StatusUpdateRequest request = new StatusUpdateRequest();
        request.setStatus("in_progress");
        
        when(taskService.updateStatus(eq(1L), eq("in_progress"))).thenReturn(true);

        mockMvc.perform(put("/api/v1/tasks/1/status")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").value(true));
    }

    @Test
    @DisplayName("PUT /api/v1/tasks/{id}/progress - Should update task progress")
    void updateTaskProgress_ShouldReturnSuccess() throws Exception {
        when(taskService.updateProgress(eq(1L), eq(50), any())).thenReturn(true);

        mockMvc.perform(put("/api/v1/tasks/1/progress")
                .param("progress", "50")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").value(true));
    }

    @Test
    @DisplayName("POST /api/v1/tasks/{id}/complete - Should complete task")
    void completeTask_ShouldReturnSuccess() throws Exception {
        when(taskService.completeTask(1L)).thenReturn(true);

        mockMvc.perform(post("/api/v1/tasks/1/complete")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").value(true));
    }

    @Test
    @DisplayName("PUT /api/v1/tasks/{id}/assign - Should assign task")
    void assignTask_ShouldReturnSuccess() throws Exception {
        when(taskService.assignTask(eq(1L), eq(2L))).thenReturn(true);

        mockMvc.perform(put("/api/v1/tasks/1/assign")
                .param("assigneeId", "2")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").value(true));
    }

    @Test
    @DisplayName("GET /api/v1/tasks/project/{projectId} - Should return tasks by project")
    void getTasksByProject_ShouldReturnList() throws Exception {
        when(taskService.listByProjectId(1L)).thenReturn(Arrays.asList(testTask));

        mockMvc.perform(get("/api/v1/tasks/project/1")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("GET /api/v1/tasks/overdue - Should return overdue tasks")
    void getOverdueTasks_ShouldReturnList() throws Exception {
        when(taskService.getOverdueTasks()).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/v1/tasks/overdue")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("GET /api/v1/tasks/upcoming - Should return upcoming tasks")
    void getUpcomingTasks_ShouldReturnList() throws Exception {
        when(taskService.getUpcomingTasks(7)).thenReturn(Arrays.asList(testTask));

        mockMvc.perform(get("/api/v1/tasks/upcoming")
                .param("days", "7")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("GET /api/v1/tasks/project/{projectId}/statistics - Should return task statistics")
    void getTaskStatistics_ShouldReturnMap() throws Exception {
        Map<String, Long> statistics = new HashMap<>();
        statistics.put("pending", 5L);
        statistics.put("in_progress", 3L);
        statistics.put("completed", 10L);
        
        when(taskService.countByProjectIdGroupByStatus(1L)).thenReturn(statistics);

        mockMvc.perform(get("/api/v1/tasks/project/1/statistics")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.pending").value(5))
                .andExpect(jsonPath("$.data.completed").value(10));
    }
}