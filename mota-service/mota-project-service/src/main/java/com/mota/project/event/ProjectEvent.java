package com.mota.project.event;

import com.mota.common.kafka.event.DomainEvent;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

/**
 * 项目领域事件
 */
@Data
@SuperBuilder
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class ProjectEvent extends DomainEvent {

    /**
     * 项目ID
     */
    private Long projectId;

    /**
     * 项目名称
     */
    private String projectName;

    /**
     * 项目标识
     */
    private String projectKey;

    /**
     * 租户ID
     */
    private Long tenantId;

    /**
     * 操作用户ID
     */
    private Long operatorId;

    /**
     * 操作用户名
     */
    private String operatorName;

    /**
     * 事件类型枚举
     */
    public static class EventType {
        public static final String PROJECT_CREATED = "PROJECT_CREATED";
        public static final String PROJECT_UPDATED = "PROJECT_UPDATED";
        public static final String PROJECT_DELETED = "PROJECT_DELETED";
        public static final String PROJECT_ARCHIVED = "PROJECT_ARCHIVED";
        public static final String PROJECT_RESTORED = "PROJECT_RESTORED";
        public static final String PROJECT_STATUS_CHANGED = "PROJECT_STATUS_CHANGED";
        public static final String PROJECT_MEMBER_ADDED = "PROJECT_MEMBER_ADDED";
        public static final String PROJECT_MEMBER_REMOVED = "PROJECT_MEMBER_REMOVED";
        public static final String PROJECT_MEMBER_ROLE_CHANGED = "PROJECT_MEMBER_ROLE_CHANGED";
        public static final String PROJECT_COPIED = "PROJECT_COPIED";
        public static final String PROJECT_TEMPLATE_CREATED = "PROJECT_TEMPLATE_CREATED";
    }

    /**
     * Kafka Topic
     */
    public static final String TOPIC = "mota.project.events";
}