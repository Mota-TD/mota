-- 日历配置表
CREATE TABLE IF NOT EXISTS calendar_config (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL COMMENT '用户ID',
    calendar_type VARCHAR(50) DEFAULT 'personal' COMMENT '日历类型: personal(个人), project(项目), team(团队)',
    name VARCHAR(100) NOT NULL COMMENT '日历名称',
    color VARCHAR(20) DEFAULT '#1890ff' COMMENT '日历颜色',
    visible BOOLEAN DEFAULT TRUE COMMENT '是否可见',
    is_default BOOLEAN DEFAULT FALSE COMMENT '是否默认日历',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_user_id (user_id),
    INDEX idx_is_default (user_id, is_default)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='日历配置表';

-- 日历订阅表
CREATE TABLE IF NOT EXISTS calendar_subscription (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL COMMENT '用户ID',
    name VARCHAR(100) NOT NULL COMMENT '订阅名称',
    url VARCHAR(500) NOT NULL COMMENT '订阅URL (iCal格式)',
    color VARCHAR(20) DEFAULT '#52c41a' COMMENT '日历颜色',
    sync_interval INT DEFAULT 60 COMMENT '同步间隔（分钟）',
    last_sync_at DATETIME NULL COMMENT '最后同步时间',
    status VARCHAR(20) DEFAULT 'active' COMMENT '状态: active(活动), error(错误), paused(暂停)',
    error_message TEXT NULL COMMENT '错误信息',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_need_sync (status, last_sync_at, sync_interval)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='日历订阅表';

-- 为现有用户创建默认日历配置（可选，根据需要执行）
-- INSERT INTO calendar_config (user_id, calendar_type, name, color, visible, is_default)
-- SELECT DISTINCT user_id, 'personal', '我的日历', '#1890ff', TRUE, TRUE
-- FROM calendar_event
-- WHERE user_id NOT IN (SELECT user_id FROM calendar_config);