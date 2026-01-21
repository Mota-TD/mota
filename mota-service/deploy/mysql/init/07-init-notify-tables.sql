-- =====================================================
-- 通知服务数据库表初始化脚本
-- 包含多租户支持 (tenant_id)
-- =====================================================
USE mota_notify;

-- 通知表
CREATE TABLE IF NOT EXISTS notification (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '通知ID',
    tenant_id BIGINT NOT NULL DEFAULT 0 COMMENT '租户ID',
    user_id BIGINT NOT NULL COMMENT '接收用户ID',
    enterprise_id BIGINT COMMENT '企业ID',
    type VARCHAR(50) NOT NULL COMMENT '通知类型',
    title VARCHAR(200) NOT NULL COMMENT '通知标题',
    content TEXT COMMENT '通知内容',
    content_type VARCHAR(20) DEFAULT 'text' COMMENT '内容类型',
    priority VARCHAR(20) DEFAULT 'normal' COMMENT '优先级',
    source_type VARCHAR(50) COMMENT '来源类型',
    source_id BIGINT COMMENT '来源ID',
    sender_id BIGINT COMMENT '发送者ID',
    sender_name VARCHAR(100) COMMENT '发送者名称',
    action_url VARCHAR(500) COMMENT '操作链接',
    action_type VARCHAR(50) COMMENT '操作类型',
    extra_data JSON COMMENT '额外数据',
    is_read TINYINT DEFAULT 0 COMMENT '是否已读',
    read_at DATETIME COMMENT '阅读时间',
    is_archived TINYINT DEFAULT 0 COMMENT '是否归档',
    archived_at DATETIME COMMENT '归档时间',
    expired_at DATETIME COMMENT '过期时间',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted TINYINT DEFAULT 0 COMMENT '是否删除',
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_user_id (user_id),
    INDEX idx_enterprise_id (enterprise_id),
    INDEX idx_type (type),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='通知表';

-- 通知配置表
CREATE TABLE IF NOT EXISTS notification_config (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '配置ID',
    tenant_id BIGINT NOT NULL DEFAULT 0 COMMENT '租户ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    enterprise_id BIGINT COMMENT '企业ID',
    notification_type VARCHAR(50) NOT NULL COMMENT '通知类型',
    channel VARCHAR(30) NOT NULL COMMENT '通知渠道',
    is_enabled TINYINT DEFAULT 1 COMMENT '是否启用',
    quiet_hours_start TIME COMMENT '免打扰开始时间',
    quiet_hours_end TIME COMMENT '免打扰结束时间',
    frequency VARCHAR(20) DEFAULT 'realtime' COMMENT '通知频率',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_tenant_id (tenant_id),
    UNIQUE KEY uk_user_type_channel (user_id, notification_type, channel),
    INDEX idx_user_id (user_id),
    INDEX idx_enterprise_id (enterprise_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='通知配置表';

-- 通知订阅表
CREATE TABLE IF NOT EXISTS notification_subscription (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '订阅ID',
    tenant_id BIGINT NOT NULL DEFAULT 0 COMMENT '租户ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    enterprise_id BIGINT COMMENT '企业ID',
    subscription_type VARCHAR(50) NOT NULL COMMENT '订阅类型',
    target_type VARCHAR(50) NOT NULL COMMENT '目标类型',
    target_id BIGINT NOT NULL COMMENT '目标ID',
    notify_on_create TINYINT DEFAULT 1 COMMENT '创建时通知',
    notify_on_update TINYINT DEFAULT 1 COMMENT '更新时通知',
    notify_on_comment TINYINT DEFAULT 1 COMMENT '评论时通知',
    notify_on_mention TINYINT DEFAULT 1 COMMENT '提及时通知',
    is_active TINYINT DEFAULT 1 COMMENT '是否激活',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_tenant_id (tenant_id),
    UNIQUE KEY uk_user_target (user_id, target_type, target_id),
    INDEX idx_user_id (user_id),
    INDEX idx_target (target_type, target_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='通知订阅表';

-- 通知偏好设置表
CREATE TABLE IF NOT EXISTS notification_preferences (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tenant_id BIGINT NOT NULL DEFAULT 0 COMMENT '租户ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    category VARCHAR(50) NOT NULL COMMENT '通知类别',
    email_enabled BOOLEAN DEFAULT TRUE COMMENT '邮件通知',
    push_enabled BOOLEAN DEFAULT TRUE COMMENT '推送通知',
    in_app_enabled BOOLEAN DEFAULT TRUE COMMENT '应用内通知',
    sms_enabled BOOLEAN DEFAULT FALSE COMMENT '短信通知',
    digest_frequency VARCHAR(20) DEFAULT 'realtime' COMMENT '摘要频率',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_tenant_id (tenant_id),
    UNIQUE KEY uk_user_category (user_id, category),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='通知偏好设置表';

-- 免打扰设置表
CREATE TABLE IF NOT EXISTS notification_dnd_settings (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tenant_id BIGINT NOT NULL DEFAULT 0 COMMENT '租户ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    is_enabled BOOLEAN DEFAULT FALSE COMMENT '是否启用',
    start_time TIME COMMENT '开始时间',
    end_time TIME COMMENT '结束时间',
    timezone VARCHAR(50) DEFAULT 'Asia/Shanghai' COMMENT '时区',
    weekdays JSON COMMENT '生效的星期几',
    allow_urgent BOOLEAN DEFAULT TRUE COMMENT '允许紧急通知',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_tenant_id (tenant_id),
    UNIQUE KEY uk_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='免打扰设置表';

-- 通知模板表
CREATE TABLE IF NOT EXISTS notification_template (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '模板ID',
    tenant_id BIGINT NOT NULL DEFAULT 0 COMMENT '租户ID',
    template_code VARCHAR(100) NOT NULL COMMENT '模板编码',
    template_name VARCHAR(200) NOT NULL COMMENT '模板名称',
    notification_type VARCHAR(50) NOT NULL COMMENT '通知类型',
    channel VARCHAR(30) NOT NULL COMMENT '通知渠道',
    title_template VARCHAR(500) COMMENT '标题模板',
    content_template TEXT COMMENT '内容模板',
    variables JSON COMMENT '变量定义',
    is_system TINYINT DEFAULT 0 COMMENT '是否系统模板',
    is_enabled TINYINT DEFAULT 1 COMMENT '是否启用',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_tenant_id (tenant_id),
    UNIQUE KEY uk_template_code (template_code),
    INDEX idx_notification_type (notification_type),
    INDEX idx_channel (channel)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='通知模板表';

-- 邮件发送队列表
CREATE TABLE IF NOT EXISTS email_queue (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tenant_id BIGINT NOT NULL DEFAULT 0 COMMENT '租户ID',
    to_email VARCHAR(255) NOT NULL COMMENT '收件人邮箱',
    to_name VARCHAR(100) COMMENT '收件人姓名',
    subject VARCHAR(500) NOT NULL COMMENT '邮件主题',
    content LONGTEXT NOT NULL COMMENT '邮件内容',
    content_type VARCHAR(20) DEFAULT 'html' COMMENT '内容类型',
    template_id VARCHAR(100) COMMENT '模板ID',
    template_params JSON COMMENT '模板参数',
    priority INT DEFAULT 5 COMMENT '优先级',
    status VARCHAR(20) DEFAULT 'pending' COMMENT '状态',
    retry_count INT DEFAULT 0 COMMENT '重试次数',
    max_retries INT DEFAULT 3 COMMENT '最大重试次数',
    error_message TEXT COMMENT '错误信息',
    scheduled_at DATETIME COMMENT '计划发送时间',
    sent_at DATETIME COMMENT '实际发送时间',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_status (status),
    INDEX idx_scheduled_at (scheduled_at),
    INDEX idx_priority (priority)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='邮件发送队列表';

-- 推送通知队列表
CREATE TABLE IF NOT EXISTS push_notification_queue (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tenant_id BIGINT NOT NULL DEFAULT 0 COMMENT '租户ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    device_token VARCHAR(500) COMMENT '设备令牌',
    platform VARCHAR(20) COMMENT '平台',
    title VARCHAR(200) NOT NULL COMMENT '标题',
    body TEXT COMMENT '内容',
    data JSON COMMENT '附加数据',
    badge INT COMMENT '角标数',
    sound VARCHAR(100) COMMENT '声音',
    priority VARCHAR(20) DEFAULT 'normal' COMMENT '优先级',
    status VARCHAR(20) DEFAULT 'pending' COMMENT '状态',
    retry_count INT DEFAULT 0 COMMENT '重试次数',
    error_message TEXT COMMENT '错误信息',
    scheduled_at DATETIME COMMENT '计划发送时间',
    sent_at DATETIME COMMENT '实际发送时间',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_scheduled_at (scheduled_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='推送通知队列表';

-- 用户设备表
CREATE TABLE IF NOT EXISTS user_device (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tenant_id BIGINT NOT NULL DEFAULT 0 COMMENT '租户ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    device_id VARCHAR(200) NOT NULL COMMENT '设备ID',
    device_token VARCHAR(500) COMMENT '推送令牌',
    device_type VARCHAR(50) COMMENT '设备类型',
    device_name VARCHAR(100) COMMENT '设备名称',
    platform VARCHAR(20) COMMENT '平台',
    os_version VARCHAR(50) COMMENT '系统版本',
    app_version VARCHAR(50) COMMENT '应用版本',
    is_active BOOLEAN DEFAULT TRUE COMMENT '是否活跃',
    last_active_at DATETIME COMMENT '最后活跃时间',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_tenant_id (tenant_id),
    UNIQUE KEY uk_user_device (user_id, device_id),
    INDEX idx_user_id (user_id),
    INDEX idx_device_token (device_token(100))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户设备表';

SELECT '通知服务数据库表初始化完成!' AS message;