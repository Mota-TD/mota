-- =====================================================
-- 日历服务数据库表初始化脚本
-- 包含多租户支持 (tenant_id)
-- =====================================================
USE mota_calendar;

-- 日历事件表
CREATE TABLE IF NOT EXISTS calendar_event (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '事件ID',
    tenant_id BIGINT NOT NULL DEFAULT 0 COMMENT '租户ID',
    user_id BIGINT NOT NULL COMMENT '创建用户ID',
    enterprise_id BIGINT COMMENT '企业ID',
    title VARCHAR(200) NOT NULL COMMENT '事件标题',
    description TEXT COMMENT '事件描述',
    location VARCHAR(500) COMMENT '地点',
    start_time DATETIME NOT NULL COMMENT '开始时间',
    end_time DATETIME NOT NULL COMMENT '结束时间',
    all_day TINYINT DEFAULT 0 COMMENT '是否全天事件',
    timezone VARCHAR(50) DEFAULT 'Asia/Shanghai' COMMENT '时区',
    event_type VARCHAR(50) DEFAULT 'event' COMMENT '事件类型',
    priority VARCHAR(20) DEFAULT 'normal' COMMENT '优先级',
    status VARCHAR(20) DEFAULT 'confirmed' COMMENT '状态',
    color VARCHAR(20) COMMENT '颜色',
    recurrence_rule VARCHAR(500) COMMENT '重复规则',
    recurrence_id BIGINT COMMENT '重复事件父ID',
    reminder_minutes JSON COMMENT '提醒时间列表',
    is_private TINYINT DEFAULT 0 COMMENT '是否私密',
    source_type VARCHAR(50) COMMENT '来源类型',
    source_id BIGINT COMMENT '来源ID',
    project_id BIGINT COMMENT '关联项目ID',
    task_id BIGINT COMMENT '关联任务ID',
    milestone_id BIGINT COMMENT '关联里程碑ID',
    meeting_url VARCHAR(500) COMMENT '会议链接',
    attachments JSON COMMENT '附件列表',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted TINYINT DEFAULT 0 COMMENT '是否删除',
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_user_id (user_id),
    INDEX idx_enterprise_id (enterprise_id),
    INDEX idx_start_time (start_time),
    INDEX idx_end_time (end_time),
    INDEX idx_event_type (event_type),
    INDEX idx_project_id (project_id),
    INDEX idx_task_id (task_id),
    INDEX idx_milestone_id (milestone_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='日历事件表';

-- 日历事件参与者表
CREATE TABLE IF NOT EXISTS calendar_event_attendee (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '参与者ID',
    tenant_id BIGINT NOT NULL DEFAULT 0 COMMENT '租户ID',
    event_id BIGINT NOT NULL COMMENT '事件ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    email VARCHAR(100) COMMENT '邮箱',
    name VARCHAR(100) COMMENT '姓名',
    role VARCHAR(20) DEFAULT 'attendee' COMMENT '角色',
    status VARCHAR(20) DEFAULT 'pending' COMMENT '响应状态',
    response_time DATETIME COMMENT '响应时间',
    comment VARCHAR(500) COMMENT '备注',
    is_optional TINYINT DEFAULT 0 COMMENT '是否可选参与',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_tenant_id (tenant_id),
    UNIQUE KEY uk_event_user (event_id, user_id),
    INDEX idx_event_id (event_id),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='日历事件参与者表';

-- 日历配置表
CREATE TABLE IF NOT EXISTS calendar_config (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '配置ID',
    tenant_id BIGINT NOT NULL DEFAULT 0 COMMENT '租户ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    enterprise_id BIGINT COMMENT '企业ID',
    default_view VARCHAR(20) DEFAULT 'month' COMMENT '默认视图',
    week_start INT DEFAULT 1 COMMENT '周起始日',
    work_hours_start TIME DEFAULT '09:00:00' COMMENT '工作时间开始',
    work_hours_end TIME DEFAULT '18:00:00' COMMENT '工作时间结束',
    work_days JSON COMMENT '工作日',
    timezone VARCHAR(50) DEFAULT 'Asia/Shanghai' COMMENT '时区',
    default_reminder INT DEFAULT 15 COMMENT '默认提醒时间',
    show_weekends TINYINT DEFAULT 1 COMMENT '显示周末',
    show_declined TINYINT DEFAULT 0 COMMENT '显示已拒绝事件',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_tenant_id (tenant_id),
    UNIQUE KEY uk_user_id (user_id),
    INDEX idx_enterprise_id (enterprise_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='日历配置表';

-- 日历订阅表
CREATE TABLE IF NOT EXISTS calendar_subscription (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '订阅ID',
    tenant_id BIGINT NOT NULL DEFAULT 0 COMMENT '租户ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    enterprise_id BIGINT COMMENT '企业ID',
    name VARCHAR(100) NOT NULL COMMENT '订阅名称',
    subscription_type VARCHAR(50) NOT NULL COMMENT '订阅类型',
    source_url VARCHAR(500) COMMENT '订阅源URL',
    source_id BIGINT COMMENT '订阅源ID',
    color VARCHAR(20) COMMENT '颜色',
    is_visible TINYINT DEFAULT 1 COMMENT '是否可见',
    sync_frequency INT DEFAULT 60 COMMENT '同步频率',
    last_sync_at DATETIME COMMENT '最后同步时间',
    sync_status VARCHAR(20) DEFAULT 'success' COMMENT '同步状态',
    sync_error TEXT COMMENT '同步错误',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted TINYINT DEFAULT 0 COMMENT '是否删除',
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_user_id (user_id),
    INDEX idx_enterprise_id (enterprise_id),
    INDEX idx_subscription_type (subscription_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='日历订阅表';

-- 日历提醒表
CREATE TABLE IF NOT EXISTS calendar_reminder (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '提醒ID',
    tenant_id BIGINT NOT NULL DEFAULT 0 COMMENT '租户ID',
    event_id BIGINT NOT NULL COMMENT '事件ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    reminder_time DATETIME NOT NULL COMMENT '提醒时间',
    reminder_type VARCHAR(20) DEFAULT 'notification' COMMENT '提醒类型',
    status VARCHAR(20) DEFAULT 'pending' COMMENT '状态',
    sent_at DATETIME COMMENT '发送时间',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_event_id (event_id),
    INDEX idx_user_id (user_id),
    INDEX idx_reminder_time (reminder_time),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='日历提醒表';

-- 日历共享表
CREATE TABLE IF NOT EXISTS calendar_share (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '共享ID',
    tenant_id BIGINT NOT NULL DEFAULT 0 COMMENT '租户ID',
    owner_id BIGINT NOT NULL COMMENT '日历所有者ID',
    shared_with_id BIGINT NOT NULL COMMENT '共享给用户ID',
    permission VARCHAR(20) DEFAULT 'view' COMMENT '权限级别',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_tenant_id (tenant_id),
    UNIQUE KEY uk_owner_shared (owner_id, shared_with_id),
    INDEX idx_owner_id (owner_id),
    INDEX idx_shared_with_id (shared_with_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='日历共享表';

SELECT '日历服务数据库表初始化完成!' AS message;