package com.mota.project.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mota.project.entity.Project;
import com.mota.project.service.ProjectService;
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
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * ProjectController Integration Tests
 * Tests the project management API endpoints
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("Project Controller Integration Tests")
public class ProjectControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ProjectService projectService;

    private Project testProject;

    @BeforeEach
    void setUp() {
        testProject = new Project();
        testProject.setId(1L);
        testProject.setName("Test Project");
        testProject.setDescription("Test project description");
        testProject.setStatus("active");
        testProject.setProgress(50);
        testProject.setStartDate(LocalDate.now());
        testProject.setEndDate(LocalDate.now().plusMonths(3));
    }

    @Test
    @DisplayName("GET /api/v1/projects - Should return project list")
    void getProjects_ShouldReturnSuccess() throws Exception {
        List<Project> projects = Arrays.asList(testProject);
        when(projectService.getProjectList(any(), any())).thenReturn(projects);

        mockMvc.perform(get("/api/v1/projects")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("GET /api/v1/projects/{id} - Should return project by ID")
    void getProjectById_ShouldReturnProject() throws Exception {
        when(projectService.getProjectDetail(1L)).thenReturn(testProject);

        mockMvc.perform(get("/api/v1/projects/1")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.id").value(1))
                .andExpect(jsonPath("$.data.name").value("Test Project"));
    }

    @Test
    @DisplayName("POST /api/v1/projects - Should create new project")
    void createProject_ShouldReturnCreatedProject() throws Exception {
        when(projectService.createProject(any(Project.class))).thenReturn(testProject);

        mockMvc.perform(post("/api/v1/projects")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testProject)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.name").value("Test Project"));
    }

    @Test
    @DisplayName("PUT /api/v1/projects/{id} - Should update project")
    void updateProject_ShouldReturnUpdatedProject() throws Exception {
        testProject.setName("Updated Project");
        when(projectService.updateProject(eq(1L), any(Project.class))).thenReturn(testProject);

        mockMvc.perform(put("/api/v1/projects/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testProject)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.name").value("Updated Project"));
    }

    @Test
    @DisplayName("DELETE /api/v1/projects/{id} - Should delete project")
    void deleteProject_ShouldReturnSuccess() throws Exception {
        mockMvc.perform(delete("/api/v1/projects/1")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    @DisplayName("POST /api/v1/projects/{id}/star - Should toggle star status")
    void toggleStar_ShouldReturnSuccess() throws Exception {
        mockMvc.perform(post("/api/v1/projects/1/star")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    @DisplayName("POST /api/v1/projects/{id}/archive - Should archive project")
    void archiveProject_ShouldReturnSuccess() throws Exception {
        mockMvc.perform(post("/api/v1/projects/1/archive")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    @DisplayName("GET /api/v1/projects/archived - Should return archived projects")
    void getArchivedProjects_ShouldReturnList() throws Exception {
        when(projectService.getArchivedProjects()).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/v1/projects/archived")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("GET /api/v1/projects/starred - Should return starred projects")
    void getStarredProjects_ShouldReturnList() throws Exception {
        when(projectService.getStarredProjects()).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/v1/projects/starred")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("GET /api/v1/projects/{id}/members - Should return project members")
    void getProjectMembers_ShouldReturnList() throws Exception {
        when(projectService.getProjectMembers(1L)).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/v1/projects/1/members")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("PUT /api/v1/projects/{id}/status - Should update project status")
    void updateProjectStatus_ShouldReturnSuccess() throws Exception {
        mockMvc.perform(put("/api/v1/projects/1/status")
                .param("status", "completed")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200));
    }
}