-- =====================================================
-- 通知服务数据库表结构
-- =====================================================

-- 通知表
CREATE TABLE IF NOT EXISTS `notification` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `tenant_id` BIGINT COMMENT '租户ID',
    `user_id` BIGINT NOT NULL COMMENT '接收用户ID',
    `sender_id` BIGINT COMMENT '发送者ID',
    `type` VARCHAR(50) NOT NULL COMMENT '通知类型: system/task/project/document/comment/mention/reminder',
    `category` VARCHAR(20) DEFAULT 'normal' COMMENT '通知分类: important/normal/low',
    `channel` VARCHAR(50) DEFAULT 'app' COMMENT '发送渠道: app/email/sms/wechat/dingtalk/feishu',
    `title` VARCHAR(200) NOT NULL COMMENT '通知标题',
    `content` TEXT COMMENT '通知内容',
    `link` VARCHAR(500) COMMENT '跳转链接',
    `extra_data` JSON COMMENT '扩展数据',
    `is_read` TINYINT(1) DEFAULT 0 COMMENT '是否已读',
    `read_time` DATETIME COMMENT '阅读时间',
    `send_status` VARCHAR(20) DEFAULT 'pending' COMMENT '发送状态: pending/sent/failed',
    `send_time` DATETIME COMMENT '发送时间',
    `retry_count` INT DEFAULT 0 COMMENT '重试次数',
    `last_retry_time` DATETIME COMMENT '最后重试时间',
    `error_message` VARCHAR(500) COMMENT '错误信息',
    `is_aggregated` TINYINT(1) DEFAULT 0 COMMENT '是否聚合通知',
    `aggregation_group_id` VARCHAR(100) COMMENT '聚合分组ID',
    `aggregation_count` INT DEFAULT 1 COMMENT '聚合数量',
    `business_type` VARCHAR(50) COMMENT '业务类型',
    `business_id` BIGINT COMMENT '业务ID',
    `expire_time` DATETIME COMMENT '过期时间',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted` TINYINT(1) DEFAULT 0 COMMENT '是否删除',
    PRIMARY KEY (`id`),
    INDEX `idx_tenant_user` (`tenant_id`, `user_id`),
    INDEX `idx_user_read` (`user_id`, `is_read`),
    INDEX `idx_user_type` (`user_id`, `type`),
    INDEX `idx_send_status` (`send_status`),
    INDEX `idx_aggregation_group` (`aggregation_group_id`),
    INDEX `idx_business` (`business_type`, `business_id`),
    INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='通知表';

-- 通知模板表
CREATE TABLE IF NOT EXISTS `notification_template` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `tenant_id` BIGINT COMMENT '租户ID，NULL表示系统模板',
    `code` VARCHAR(100) NOT NULL COMMENT '模板编码',
    `name` VARCHAR(100) NOT NULL COMMENT '模板名称',
    `notify_type` VARCHAR(50) NOT NULL COMMENT '通知类型',
    `channel` VARCHAR(50) DEFAULT 'app' COMMENT '发送渠道',
    `category` VARCHAR(20) DEFAULT 'normal' COMMENT '通知分类',
    `title_template` VARCHAR(200) COMMENT '标题模板',
    `content_template` TEXT COMMENT '内容模板',
    `variables` VARCHAR(500) COMMENT '变量列表，逗号分隔',
    `description` VARCHAR(500) COMMENT '模板描述',
    `enabled` TINYINT(1) DEFAULT 1 COMMENT '是否启用',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted` TINYINT(1) DEFAULT 0 COMMENT '是否删除',
    PRIMARY KEY (`id`),
    UNIQUE INDEX `uk_tenant_code` (`tenant_id`, `code`),
    INDEX `idx_notify_type` (`notify_type`),
    INDEX `idx_enabled` (`enabled`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='通知模板表';

-- 通知订阅表
CREATE TABLE IF NOT EXISTS `notification_subscription` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `notify_type` VARCHAR(50) COMMENT '通知类型',
    `business_type` VARCHAR(50) COMMENT '业务类型',
    `business_id` BIGINT COMMENT '业务ID',
    `channels` VARCHAR(200) COMMENT '订阅渠道，逗号分隔',
    `enabled` TINYINT(1) DEFAULT 1 COMMENT '是否启用',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    INDEX `idx_user_type` (`user_id`, `notify_type`),
    INDEX `idx_user_business` (`user_id`, `business_type`, `business_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='通知订阅表';

-- 免打扰设置表
CREATE TABLE IF NOT EXISTS `do_not_disturb_setting` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `enabled` TINYINT(1) DEFAULT 0 COMMENT '是否启用',
    `mode` VARCHAR(20) DEFAULT 'scheduled' COMMENT '模式: always/scheduled/smart',
    `start_time` TIME COMMENT '开始时间',
    `end_time` TIME COMMENT '结束时间',
    `weekdays` VARCHAR(20) COMMENT '生效星期，逗号分隔，1-7',
    `except_types` VARCHAR(200) COMMENT '例外通知类型，逗号分隔',
    `except_senders` VARCHAR(500) COMMENT '例外发送者ID，逗号分隔',
    `temporary_end_time` DATETIME COMMENT '临时免打扰结束时间',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE INDEX `uk_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='免打扰设置表';

-- 通知配置表（保留原有表）
CREATE TABLE IF NOT EXISTS `notification_config` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `tenant_id` BIGINT COMMENT '租户ID',
    `config_key` VARCHAR(100) NOT NULL COMMENT '配置键',
    `config_value` TEXT COMMENT '配置值',
    `description` VARCHAR(500) COMMENT '配置描述',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE INDEX `uk_tenant_key` (`tenant_id`, `config_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='通知配置表';

-- 通知发送日志表
CREATE TABLE IF NOT EXISTS `notification_send_log` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `notification_id` BIGINT NOT NULL COMMENT '通知ID',
    `channel` VARCHAR(50) NOT NULL COMMENT '发送渠道',
    `status` VARCHAR(20) NOT NULL COMMENT '发送状态: success/failed',
    `request_data` TEXT COMMENT '请求数据',
    `response_data` TEXT COMMENT '响应数据',
    `error_message` VARCHAR(500) COMMENT '错误信息',
    `send_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '发送时间',
    `duration_ms` INT COMMENT '耗时（毫秒）',
    PRIMARY KEY (`id`),
    INDEX `idx_notification_id` (`notification_id`),
    INDEX `idx_channel_status` (`channel`, `status`),
    INDEX `idx_send_time` (`send_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='通知发送日志表';

-- =====================================================
-- 初始化系统模板数据
-- =====================================================

INSERT INTO `notification_template` (`code`, `name`, `notify_type`, `channel`, `category`, `title_template`, `content_template`, `variables`, `enabled`) VALUES
('TASK_ASSIGNED', '任务分配通知', 'task', 'app', 'normal', '您有新任务', '任务「${taskName}」已分配给您，请及时处理。截止日期：${dueDate}', 'taskName,dueDate', 1),
('TASK_COMPLETED', '任务完成通知', 'task', 'app', 'normal', '任务已完成', '任务「${taskName}」已由${completedBy}完成。', 'taskName,completedBy', 1),
('TASK_OVERDUE', '任务逾期通知', 'task', 'app', 'important', '任务已逾期', '任务「${taskName}」已逾期，请尽快处理。', 'taskName', 1),
('PROJECT_CREATED', '项目创建通知', 'project', 'app', 'normal', '新项目创建', '项目「${projectName}」已创建，您已被添加为项目成员。', 'projectName', 1),
('PROJECT_MEMBER_ADDED', '项目成员添加通知', 'project', 'app', 'normal', '您已加入项目', '您已被添加到项目「${projectName}」，角色：${role}', 'projectName,role', 1),
('DOCUMENT_SHARED', '文档分享通知', 'document', 'app', 'normal', '文档分享', '${sharedBy}向您分享了文档「${documentName}」。', 'sharedBy,documentName', 1),
('COMMENT_MENTION', '@提及通知', 'mention', 'app', 'normal', '有人@了您', '${mentionBy}在${context}中@了您：${content}', 'mentionBy,context,content', 1),
('SYSTEM_ANNOUNCEMENT', '系统公告', 'system', 'app', 'important', '${title}', '${content}', 'title,content', 1),
('REMINDER', '提醒通知', 'reminder', 'app', 'normal', '提醒', '${content}', 'content', 1)
ON DUPLICATE KEY UPDATE `updated_at` = CURRENT_TIMESTAMP;