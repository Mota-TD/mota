package com.mota.project.controller;

import com.mota.project.entity.WorkflowStatus;
import com.mota.project.entity.WorkflowTemplate;
import com.mota.project.entity.WorkflowTransition;
import com.mota.project.service.WorkflowService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 工作流控制器
 */
@RestController
@RequestMapping("/api/workflows")
@RequiredArgsConstructor
public class WorkflowController {

    private final WorkflowService workflowService;

    // ========== 工作流模板管理 ==========

    @PostMapping
    public ResponseEntity<WorkflowTemplate> createWorkflow(@RequestBody WorkflowTemplate template) {
        return ResponseEntity.ok(workflowService.createWorkflow(template));
    }

    @PutMapping("/{id}")
    public ResponseEntity<WorkflowTemplate> updateWorkflow(@PathVariable Long id, @RequestBody WorkflowTemplate template) {
        return ResponseEntity.ok(workflowService.updateWorkflow(id, template));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Boolean> deleteWorkflow(@PathVariable Long id) {
        return ResponseEntity.ok(workflowService.deleteWorkflow(id));
    }

    @GetMapping("/{id}")
    public ResponseEntity<WorkflowTemplate> getWorkflow(@PathVariable Long id) {
        return ResponseEntity.ok(workflowService.getWorkflowById(id));
    }

    @GetMapping("/{id}/details")
    public ResponseEntity<WorkflowTemplate> getWorkflowWithDetails(@PathVariable Long id) {
        return ResponseEntity.ok(workflowService.getWorkflowWithDetails(id));
    }

    @GetMapping("/system")
    public ResponseEntity<List<WorkflowTemplate>> getSystemWorkflows() {
        return ResponseEntity.ok(workflowService.getSystemWorkflows());
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<WorkflowTemplate>> getProjectWorkflows(@PathVariable Long projectId) {
        return ResponseEntity.ok(workflowService.getProjectWorkflows(projectId));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<WorkflowTemplate>> getUserWorkflows(@PathVariable Long userId) {
        return ResponseEntity.ok(workflowService.getUserWorkflows(userId));
    }

    @PutMapping("/{workflowId}/default")
    public ResponseEntity<Void> setDefaultWorkflow(
            @PathVariable Long workflowId,
            @RequestParam(required = false) Long projectId) {
        workflowService.setDefaultWorkflow(workflowId, projectId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/default")
    public ResponseEntity<WorkflowTemplate> getDefaultWorkflow(
            @RequestParam(required = false) Long projectId) {
        return ResponseEntity.ok(workflowService.getDefaultWorkflow(projectId));
    }

    // ========== 工作流状态管理 ==========

    @PostMapping("/{workflowId}/statuses")
    public ResponseEntity<WorkflowStatus> addStatus(
            @PathVariable Long workflowId,
            @RequestBody WorkflowStatus status) {
        return ResponseEntity.ok(workflowService.addStatus(workflowId, status));
    }

    @PutMapping("/statuses/{statusId}")
    public ResponseEntity<WorkflowStatus> updateStatus(
            @PathVariable Long statusId,
            @RequestBody WorkflowStatus status) {
        return ResponseEntity.ok(workflowService.updateStatus(statusId, status));
    }

    @DeleteMapping("/statuses/{statusId}")
    public ResponseEntity<Boolean> deleteStatus(@PathVariable Long statusId) {
        return ResponseEntity.ok(workflowService.deleteStatus(statusId));
    }

    @GetMapping("/{workflowId}/statuses")
    public ResponseEntity<List<WorkflowStatus>> getWorkflowStatuses(@PathVariable Long workflowId) {
        return ResponseEntity.ok(workflowService.getWorkflowStatuses(workflowId));
    }

    @GetMapping("/{workflowId}/statuses/initial")
    public ResponseEntity<WorkflowStatus> getInitialStatus(@PathVariable Long workflowId) {
        return ResponseEntity.ok(workflowService.getInitialStatus(workflowId));
    }

    @GetMapping("/{workflowId}/statuses/final")
    public ResponseEntity<List<WorkflowStatus>> getFinalStatuses(@PathVariable Long workflowId) {
        return ResponseEntity.ok(workflowService.getFinalStatuses(workflowId));
    }

    @PutMapping("/{workflowId}/statuses/order")
    public ResponseEntity<Void> updateStatusOrder(
            @PathVariable Long workflowId,
            @RequestBody List<Long> statusIds) {
        workflowService.updateStatusOrder(workflowId, statusIds);
        return ResponseEntity.ok().build();
    }

    // ========== 工作流流转规则管理 ==========

    @PostMapping("/{workflowId}/transitions")
    public ResponseEntity<WorkflowTransition> addTransition(
            @PathVariable Long workflowId,
            @RequestBody WorkflowTransition transition) {
        return ResponseEntity.ok(workflowService.addTransition(workflowId, transition));
    }

    @PutMapping("/transitions/{transitionId}")
    public ResponseEntity<WorkflowTransition> updateTransition(
            @PathVariable Long transitionId,
            @RequestBody WorkflowTransition transition) {
        return ResponseEntity.ok(workflowService.updateTransition(transitionId, transition));
    }

    @DeleteMapping("/transitions/{transitionId}")
    public ResponseEntity<Boolean> deleteTransition(@PathVariable Long transitionId) {
        return ResponseEntity.ok(workflowService.deleteTransition(transitionId));
    }

    @GetMapping("/{workflowId}/transitions")
    public ResponseEntity<List<WorkflowTransition>> getWorkflowTransitions(@PathVariable Long workflowId) {
        return ResponseEntity.ok(workflowService.getWorkflowTransitions(workflowId));
    }

    @GetMapping("/statuses/{fromStatusId}/available-transitions")
    public ResponseEntity<List<WorkflowTransition>> getAvailableTransitions(@PathVariable Long fromStatusId) {
        return ResponseEntity.ok(workflowService.getAvailableTransitions(fromStatusId));
    }

    @GetMapping("/{workflowId}/can-transition")
    public ResponseEntity<Boolean> canTransition(
            @PathVariable Long workflowId,
            @RequestParam Long fromStatusId,
            @RequestParam Long toStatusId) {
        return ResponseEntity.ok(workflowService.canTransition(workflowId, fromStatusId, toStatusId));
    }

    // ========== 工作流复制 ==========

    @PostMapping("/{workflowId}/duplicate")
    public ResponseEntity<WorkflowTemplate> duplicateWorkflow(
            @PathVariable Long workflowId,
            @RequestParam(required = false) String newName,
            @RequestParam(required = false) Long projectId) {
        return ResponseEntity.ok(workflowService.duplicateWorkflow(workflowId, newName, projectId));
    }

    @PostMapping("/from-system-template/{templateId}")
    public ResponseEntity<WorkflowTemplate> createFromSystemTemplate(
            @PathVariable Long templateId,
            @RequestParam Long projectId) {
        return ResponseEntity.ok(workflowService.createFromSystemTemplate(templateId, projectId));
    }
}