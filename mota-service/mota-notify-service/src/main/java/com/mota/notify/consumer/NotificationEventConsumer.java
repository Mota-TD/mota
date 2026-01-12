package com.mota.notify.consumer;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mota.notify.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

/**
 * 通知事件消费者
 * 监听Kafka消息并发送通知
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationEventConsumer {

    private final NotificationService notificationService;
    private final ObjectMapper objectMapper;

    /**
     * 监听任务事件
     */
    @KafkaListener(topics = "task-events", groupId = "notify-service")
    public void handleTaskEvent(String message) {
        try {
            Map<String, Object> event = objectMapper.readValue(message, new TypeReference<Map<String, Object>>() {});
            String eventType = (String) event.get("eventType");
            
            log.info("收到任务事件: type={}", eventType);
            
            switch (eventType) {
                case "TASK_CREATED":
                    handleTaskCreated(event);
                    break;
                case "TASK_ASSIGNED":
                    handleTaskAssigned(event);
                    break;
                case "TASK_COMPLETED":
                    handleTaskCompleted(event);
                    break;
                case "TASK_OVERDUE":
                    handleTaskOverdue(event);
                    break;
                case "TASK_COMMENT":
                    handleTaskComment(event);
                    break;
                default:
                    log.debug("未处理的任务事件类型: {}", eventType);
            }
        } catch (Exception e) {
            log.error("处理任务事件失败: {}", message, e);
        }
    }

    /**
     * 监听项目事件
     */
    @KafkaListener(topics = "project-events", groupId = "notify-service")
    public void handleProjectEvent(String message) {
        try {
            Map<String, Object> event = objectMapper.readValue(message, new TypeReference<Map<String, Object>>() {});
            String eventType = (String) event.get("eventType");
            
            log.info("收到项目事件: type={}", eventType);
            
            switch (eventType) {
                case "PROJECT_CREATED":
                    handleProjectCreated(event);
                    break;
                case "PROJECT_MEMBER_ADDED":
                    handleProjectMemberAdded(event);
                    break;
                case "PROJECT_MEMBER_REMOVED":
                    handleProjectMemberRemoved(event);
                    break;
                case "MILESTONE_COMPLETED":
                    handleMilestoneCompleted(event);
                    break;
                default:
                    log.debug("未处理的项目事件类型: {}", eventType);
            }
        } catch (Exception e) {
            log.error("处理项目事件失败: {}", message, e);
        }
    }

    /**
     * 监听文档事件
     */
    @KafkaListener(topics = "document-events", groupId = "notify-service")
    public void handleDocumentEvent(String message) {
        try {
            Map<String, Object> event = objectMapper.readValue(message, new TypeReference<Map<String, Object>>() {});
            String eventType = (String) event.get("eventType");
            
            log.info("收到文档事件: type={}", eventType);
            
            switch (eventType) {
                case "DOCUMENT_SHARED":
                    handleDocumentShared(event);
                    break;
                case "DOCUMENT_COMMENTED":
                    handleDocumentCommented(event);
                    break;
                case "DOCUMENT_MENTIONED":
                    handleDocumentMentioned(event);
                    break;
                default:
                    log.debug("未处理的文档事件类型: {}", eventType);
            }
        } catch (Exception e) {
            log.error("处理文档事件失败: {}", message, e);
        }
    }

    /**
     * 监听系统事件
     */
    @KafkaListener(topics = "system-events", groupId = "notify-service")
    public void handleSystemEvent(String message) {
        try {
            Map<String, Object> event = objectMapper.readValue(message, new TypeReference<Map<String, Object>>() {});
            String eventType = (String) event.get("eventType");
            
            log.info("收到系统事件: type={}", eventType);
            
            switch (eventType) {
                case "SYSTEM_ANNOUNCEMENT":
                    handleSystemAnnouncement(event);
                    break;
                case "SYSTEM_MAINTENANCE":
                    handleSystemMaintenance(event);
                    break;
                default:
                    log.debug("未处理的系统事件类型: {}", eventType);
            }
        } catch (Exception e) {
            log.error("处理系统事件失败: {}", message, e);
        }
    }

    /**
     * 监听提醒事件
     */
    @KafkaListener(topics = "reminder-events", groupId = "notify-service")
    public void handleReminderEvent(String message) {
        try {
            Map<String, Object> event = objectMapper.readValue(message, new TypeReference<Map<String, Object>>() {});
            
            Long userId = Long.valueOf(event.get("userId").toString());
            Long tenantId = event.get("tenantId") != null ? 
                Long.valueOf(event.get("tenantId").toString()) : null;
            String title = (String) event.get("title");
            String content = (String) event.get("content");
            String link = (String) event.get("link");
            
            notificationService.sendNotification(userId, tenantId, "reminder", title, content, link, null);
            log.info("发送提醒通知: userId={}", userId);
        } catch (Exception e) {
            log.error("处理提醒事件失败: {}", message, e);
        }
    }

    // ==================== 任务事件处理 ====================

    private void handleTaskCreated(Map<String, Object> event) {
        Long creatorId = Long.valueOf(event.get("creatorId").toString());
        Long tenantId = event.get("tenantId") != null ? 
            Long.valueOf(event.get("tenantId").toString()) : null;
        String taskName = (String) event.get("taskName");
        String projectName = (String) event.get("projectName");
        Long taskId = Long.valueOf(event.get("taskId").toString());
        
        // 通知项目成员
        @SuppressWarnings("unchecked")
        List<Long> memberIds = (List<Long>) event.get("memberIds");
        if (memberIds != null) {
            for (Long memberId : memberIds) {
                if (!memberId.equals(creatorId)) {
                    notificationService.sendNotification(
                        memberId, tenantId, "task",
                        "新任务创建",
                        String.format("项目「%s」中创建了新任务「%s」", projectName, taskName),
                        "/tasks/" + taskId,
                        creatorId
                    );
                }
            }
        }
    }

    private void handleTaskAssigned(Map<String, Object> event) {
        Long assigneeId = Long.valueOf(event.get("assigneeId").toString());
        Long assignerId = Long.valueOf(event.get("assignerId").toString());
        Long tenantId = event.get("tenantId") != null ? 
            Long.valueOf(event.get("tenantId").toString()) : null;
        String taskName = (String) event.get("taskName");
        String dueDate = (String) event.get("dueDate");
        Long taskId = Long.valueOf(event.get("taskId").toString());
        
        notificationService.sendNotification(
            assigneeId, tenantId, "task",
            "您有新任务",
            String.format("任务「%s」已分配给您，截止日期：%s", taskName, dueDate != null ? dueDate : "未设置"),
            "/tasks/" + taskId,
            assignerId
        );
    }

    private void handleTaskCompleted(Map<String, Object> event) {
        Long completedBy = Long.valueOf(event.get("completedBy").toString());
        String completedByName = (String) event.get("completedByName");
        Long tenantId = event.get("tenantId") != null ? 
            Long.valueOf(event.get("tenantId").toString()) : null;
        String taskName = (String) event.get("taskName");
        Long taskId = Long.valueOf(event.get("taskId").toString());
        
        // 通知任务创建者和关注者
        @SuppressWarnings("unchecked")
        List<Long> notifyUserIds = (List<Long>) event.get("notifyUserIds");
        if (notifyUserIds != null) {
            for (Long userId : notifyUserIds) {
                if (!userId.equals(completedBy)) {
                    notificationService.sendNotification(
                        userId, tenantId, "task",
                        "任务已完成",
                        String.format("任务「%s」已由%s完成", taskName, completedByName),
                        "/tasks/" + taskId,
                        completedBy
                    );
                }
            }
        }
    }

    private void handleTaskOverdue(Map<String, Object> event) {
        Long assigneeId = Long.valueOf(event.get("assigneeId").toString());
        Long tenantId = event.get("tenantId") != null ? 
            Long.valueOf(event.get("tenantId").toString()) : null;
        String taskName = (String) event.get("taskName");
        Long taskId = Long.valueOf(event.get("taskId").toString());
        
        notificationService.sendNotification(
            assigneeId, tenantId, "task",
            "任务已逾期",
            String.format("任务「%s」已逾期，请尽快处理", taskName),
            "/tasks/" + taskId,
            null
        );
    }

    private void handleTaskComment(Map<String, Object> event) {
        Long commenterId = Long.valueOf(event.get("commenterId").toString());
        String commenterName = (String) event.get("commenterName");
        Long tenantId = event.get("tenantId") != null ? 
            Long.valueOf(event.get("tenantId").toString()) : null;
        String taskName = (String) event.get("taskName");
        String commentContent = (String) event.get("commentContent");
        Long taskId = Long.valueOf(event.get("taskId").toString());
        
        // 通知任务相关人员
        @SuppressWarnings("unchecked")
        List<Long> notifyUserIds = (List<Long>) event.get("notifyUserIds");
        if (notifyUserIds != null) {
            for (Long userId : notifyUserIds) {
                if (!userId.equals(commenterId)) {
                    notificationService.sendNotification(
                        userId, tenantId, "comment",
                        "任务有新评论",
                        String.format("%s在任务「%s」中评论：%s", commenterName, taskName, 
                            commentContent.length() > 50 ? commentContent.substring(0, 50) + "..." : commentContent),
                        "/tasks/" + taskId,
                        commenterId
                    );
                }
            }
        }
    }

    // ==================== 项目事件处理 ====================

    private void handleProjectCreated(Map<String, Object> event) {
        Long creatorId = Long.valueOf(event.get("creatorId").toString());
        Long tenantId = event.get("tenantId") != null ? 
            Long.valueOf(event.get("tenantId").toString()) : null;
        String projectName = (String) event.get("projectName");
        Long projectId = Long.valueOf(event.get("projectId").toString());
        
        // 通知初始成员
        @SuppressWarnings("unchecked")
        List<Long> memberIds = (List<Long>) event.get("memberIds");
        if (memberIds != null) {
            for (Long memberId : memberIds) {
                if (!memberId.equals(creatorId)) {
                    notificationService.sendNotification(
                        memberId, tenantId, "project",
                        "新项目创建",
                        String.format("项目「%s」已创建，您已被添加为项目成员", projectName),
                        "/projects/" + projectId,
                        creatorId
                    );
                }
            }
        }
    }

    private void handleProjectMemberAdded(Map<String, Object> event) {
        Long memberId = Long.valueOf(event.get("memberId").toString());
        Long addedBy = Long.valueOf(event.get("addedBy").toString());
        Long tenantId = event.get("tenantId") != null ? 
            Long.valueOf(event.get("tenantId").toString()) : null;
        String projectName = (String) event.get("projectName");
        String role = (String) event.get("role");
        Long projectId = Long.valueOf(event.get("projectId").toString());
        
        notificationService.sendNotification(
            memberId, tenantId, "project",
            "您已加入项目",
            String.format("您已被添加到项目「%s」，角色：%s", projectName, role),
            "/projects/" + projectId,
            addedBy
        );
    }

    private void handleProjectMemberRemoved(Map<String, Object> event) {
        Long memberId = Long.valueOf(event.get("memberId").toString());
        Long removedBy = Long.valueOf(event.get("removedBy").toString());
        Long tenantId = event.get("tenantId") != null ? 
            Long.valueOf(event.get("tenantId").toString()) : null;
        String projectName = (String) event.get("projectName");
        
        notificationService.sendNotification(
            memberId, tenantId, "project",
            "您已离开项目",
            String.format("您已从项目「%s」中移除", projectName),
            null,
            removedBy
        );
    }

    private void handleMilestoneCompleted(Map<String, Object> event) {
        Long tenantId = event.get("tenantId") != null ? 
            Long.valueOf(event.get("tenantId").toString()) : null;
        String projectName = (String) event.get("projectName");
        String milestoneName = (String) event.get("milestoneName");
        Long projectId = Long.valueOf(event.get("projectId").toString());
        
        // 通知项目成员
        @SuppressWarnings("unchecked")
        List<Long> memberIds = (List<Long>) event.get("memberIds");
        if (memberIds != null) {
            for (Long memberId : memberIds) {
                notificationService.sendNotification(
                    memberId, tenantId, "project",
                    "里程碑已完成",
                    String.format("项目「%s」的里程碑「%s」已完成", projectName, milestoneName),
                    "/projects/" + projectId,
                    null
                );
            }
        }
    }

    // ==================== 文档事件处理 ====================

    private void handleDocumentShared(Map<String, Object> event) {
        Long sharedBy = Long.valueOf(event.get("sharedBy").toString());
        String sharedByName = (String) event.get("sharedByName");
        Long tenantId = event.get("tenantId") != null ? 
            Long.valueOf(event.get("tenantId").toString()) : null;
        String documentName = (String) event.get("documentName");
        Long documentId = Long.valueOf(event.get("documentId").toString());
        
        // 通知被分享的用户
        @SuppressWarnings("unchecked")
        List<Long> sharedToUserIds = (List<Long>) event.get("sharedToUserIds");
        if (sharedToUserIds != null) {
            for (Long userId : sharedToUserIds) {
                notificationService.sendNotification(
                    userId, tenantId, "document",
                    "文档分享",
                    String.format("%s向您分享了文档「%s」", sharedByName, documentName),
                    "/documents/" + documentId,
                    sharedBy
                );
            }
        }
    }

    private void handleDocumentCommented(Map<String, Object> event) {
        Long commenterId = Long.valueOf(event.get("commenterId").toString());
        String commenterName = (String) event.get("commenterName");
        Long tenantId = event.get("tenantId") != null ? 
            Long.valueOf(event.get("tenantId").toString()) : null;
        String documentName = (String) event.get("documentName");
        String commentContent = (String) event.get("commentContent");
        Long documentId = Long.valueOf(event.get("documentId").toString());
        
        // 通知文档作者和协作者
        @SuppressWarnings("unchecked")
        List<Long> notifyUserIds = (List<Long>) event.get("notifyUserIds");
        if (notifyUserIds != null) {
            for (Long userId : notifyUserIds) {
                if (!userId.equals(commenterId)) {
                    notificationService.sendNotification(
                        userId, tenantId, "comment",
                        "文档有新评论",
                        String.format("%s在文档「%s」中评论：%s", commenterName, documentName,
                            commentContent.length() > 50 ? commentContent.substring(0, 50) + "..." : commentContent),
                        "/documents/" + documentId,
                        commenterId
                    );
                }
            }
        }
    }

    private void handleDocumentMentioned(Map<String, Object> event) {
        Long mentionBy = Long.valueOf(event.get("mentionBy").toString());
        String mentionByName = (String) event.get("mentionByName");
        Long tenantId = event.get("tenantId") != null ? 
            Long.valueOf(event.get("tenantId").toString()) : null;
        String documentName = (String) event.get("documentName");
        String content = (String) event.get("content");
        Long documentId = Long.valueOf(event.get("documentId").toString());
        
        // 通知被@的用户
        @SuppressWarnings("unchecked")
        List<Long> mentionedUserIds = (List<Long>) event.get("mentionedUserIds");
        if (mentionedUserIds != null) {
            for (Long userId : mentionedUserIds) {
                notificationService.sendNotification(
                    userId, tenantId, "mention",
                    "有人@了您",
                    String.format("%s在文档「%s」中@了您：%s", mentionByName, documentName,
                        content.length() > 50 ? content.substring(0, 50) + "..." : content),
                    "/documents/" + documentId,
                    mentionBy
                );
            }
        }
    }

    // ==================== 系统事件处理 ====================

    private void handleSystemAnnouncement(Map<String, Object> event) {
        Long tenantId = event.get("tenantId") != null ? 
            Long.valueOf(event.get("tenantId").toString()) : null;
        String title = (String) event.get("title");
        String content = (String) event.get("content");
        String link = (String) event.get("link");
        
        // 通知所有用户或租户用户
        @SuppressWarnings("unchecked")
        List<Long> userIds = (List<Long>) event.get("userIds");
        if (userIds != null) {
            notificationService.sendBatchNotifications(userIds, tenantId, "system", title, content, link, null);
        }
    }

    private void handleSystemMaintenance(Map<String, Object> event) {
        Long tenantId = event.get("tenantId") != null ? 
            Long.valueOf(event.get("tenantId").toString()) : null;
        String maintenanceTime = (String) event.get("maintenanceTime");
        String duration = (String) event.get("duration");
        String reason = (String) event.get("reason");
        
        String content = String.format("系统将于%s进行维护，预计持续%s。维护原因：%s", 
            maintenanceTime, duration, reason);
        
        // 通知所有用户
        @SuppressWarnings("unchecked")
        List<Long> userIds = (List<Long>) event.get("userIds");
        if (userIds != null) {
            notificationService.sendBatchNotifications(userIds, tenantId, "system", "系统维护通知", content, null, null);
        }
    }
}