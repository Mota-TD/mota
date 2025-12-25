-- =====================================================
-- V16.0 通知中心增强
-- 功能：站内通知、邮件通知、通知聚合、智能分类、重要置顶、低优先级折叠、免打扰模式、订阅管理
-- =====================================================

-- 1. 增强通知表，添加新字段
ALTER TABLE notification 
ADD COLUMN IF NOT EXISTS is_pinned TINYINT(1) DEFAULT 0 COMMENT '是否置顶',
ADD COLUMN IF NOT EXISTS is_collapsed TINYINT(1) DEFAULT 0 COMMENT '是否折叠',
ADD COLUMN IF NOT EXISTS ai_classification VARCHAR(20) DEFAULT NULL COMMENT 'AI分类: important, normal, low_priority, spam',
ADD COLUMN IF NOT EXISTS ai_score INT DEFAULT NULL COMMENT 'AI重要性评分 0-100',
ADD COLUMN IF NOT EXISTS email_sent TINYINT(1) DEFAULT 0 COMMENT '是否已发送邮件',
ADD COLUMN IF NOT EXISTS email_sent_at DATETIME DEFAULT NULL COMMENT '邮件发送时间',
ADD COLUMN IF NOT EXISTS push_sent TINYINT(1) DEFAULT 0 COMMENT '是否已发送推送',
ADD COLUMN IF NOT EXISTS push_sent_at DATETIME DEFAULT NULL COMMENT '推送发送时间';

-- 添加索引
CREATE INDEX IF NOT EXISTS idx_notification_pinned ON notification(user_id, is_pinned);
CREATE INDEX IF NOT EXISTS idx_notification_collapsed ON notification(user_id, is_collapsed);
CREATE INDEX IF NOT EXISTS idx_notification_ai_classification ON notification(user_id, ai_classification);
CREATE INDEX IF NOT EXISTS idx_notification_ai_score ON notification(user_id, ai_score);

-- 2. 创建通知订阅表
CREATE TABLE IF NOT EXISTS notification_subscription (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL COMMENT '用户ID',
    category VARCHAR(50) NOT NULL COMMENT '通知分类: task, project, comment, system, reminder, plan, feedback',
    type VARCHAR(50) DEFAULT NULL COMMENT '通知类型（可选，为空表示该分类下所有类型）',
    project_id BIGINT DEFAULT NULL COMMENT '项目ID（可选，为空表示所有项目）',
    enabled TINYINT(1) DEFAULT 1 COMMENT '是否启用站内通知',
    email_enabled TINYINT(1) DEFAULT 1 COMMENT '是否启用邮件通知',
    push_enabled TINYINT(1) DEFAULT 1 COMMENT '是否启用推送通知',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_subscription (user_id, category, type, project_id),
    INDEX idx_subscription_user (user_id),
    INDEX idx_subscription_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='通知订阅规则表';

-- 3. 创建免打扰设置表
CREATE TABLE IF NOT EXISTS notification_dnd_settings (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL UNIQUE COMMENT '用户ID',
    enabled TINYINT(1) DEFAULT 0 COMMENT '是否启用定时免打扰',
    start_time VARCHAR(5) DEFAULT '22:00' COMMENT '免打扰开始时间 HH:mm',
    end_time VARCHAR(5) DEFAULT '08:00' COMMENT '免打扰结束时间 HH:mm',
    weekdays VARCHAR(20) DEFAULT '0,1,2,3,4,5,6' COMMENT '生效的星期几，逗号分隔，0=周日',
    allow_urgent TINYINT(1) DEFAULT 1 COMMENT '是否允许紧急通知',
    allow_mentions TINYINT(1) DEFAULT 1 COMMENT '是否允许@提及通知',
    -- 临时免打扰
    temp_enabled TINYINT(1) DEFAULT 0 COMMENT '是否启用临时免打扰',
    temp_end_time DATETIME DEFAULT NULL COMMENT '临时免打扰结束时间',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_dnd_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='免打扰设置表';

-- 4. 创建通知偏好设置表
CREATE TABLE IF NOT EXISTS notification_preferences (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL UNIQUE COMMENT '用户ID',
    -- 聚合设置
    enable_aggregation TINYINT(1) DEFAULT 1 COMMENT '是否启用通知聚合',
    aggregation_interval INT DEFAULT 30 COMMENT '聚合间隔（分钟）',
    -- 智能分类设置
    enable_ai_classification TINYINT(1) DEFAULT 1 COMMENT '是否启用AI智能分类',
    auto_collapse_threshold INT DEFAULT 30 COMMENT '自动折叠阈值（AI评分低于此值自动折叠）',
    -- 置顶设置
    auto_pin_urgent TINYINT(1) DEFAULT 1 COMMENT '自动置顶紧急通知',
    auto_pin_mentions TINYINT(1) DEFAULT 0 COMMENT '自动置顶@提及',
    -- 显示设置
    show_low_priority_collapsed TINYINT(1) DEFAULT 1 COMMENT '低优先级默认折叠',
    max_visible_notifications INT DEFAULT 50 COMMENT '最大显示数量',
    -- 邮件设置
    email_digest_enabled TINYINT(1) DEFAULT 0 COMMENT '是否启用邮件摘要',
    email_digest_frequency VARCHAR(20) DEFAULT 'daily' COMMENT '邮件摘要频率: realtime, hourly, daily, weekly',
    email_digest_time VARCHAR(5) DEFAULT '09:00' COMMENT '每日摘要发送时间',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_preferences_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='通知偏好设置表';

-- 5. 创建邮件通知队列表
CREATE TABLE IF NOT EXISTS notification_email_queue (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    notification_id BIGINT NOT NULL COMMENT '通知ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    email VARCHAR(255) NOT NULL COMMENT '收件人邮箱',
    subject VARCHAR(255) NOT NULL COMMENT '邮件主题',
    content TEXT NOT NULL COMMENT '邮件内容',
    status VARCHAR(20) DEFAULT 'pending' COMMENT '状态: pending, sent, failed',
    retry_count INT DEFAULT 0 COMMENT '重试次数',
    error_message TEXT DEFAULT NULL COMMENT '错误信息',
    scheduled_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '计划发送时间',
    sent_at DATETIME DEFAULT NULL COMMENT '实际发送时间',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email_queue_status (status),
    INDEX idx_email_queue_scheduled (scheduled_at),
    INDEX idx_email_queue_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='邮件通知队列表';

-- 6. 创建推送通知队列表（为未来移动推送、企微、钉钉做准备）
CREATE TABLE IF NOT EXISTS notification_push_queue (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    notification_id BIGINT NOT NULL COMMENT '通知ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    push_type VARCHAR(20) NOT NULL COMMENT '推送类型: app, wechat_work, dingtalk',
    title VARCHAR(255) NOT NULL COMMENT '推送标题',
    content TEXT NOT NULL COMMENT '推送内容',
    extra_data JSON DEFAULT NULL COMMENT '额外数据',
    status VARCHAR(20) DEFAULT 'pending' COMMENT '状态: pending, sent, failed',
    retry_count INT DEFAULT 0 COMMENT '重试次数',
    error_message TEXT DEFAULT NULL COMMENT '错误信息',
    scheduled_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '计划发送时间',
    sent_at DATETIME DEFAULT NULL COMMENT '实际发送时间',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_push_queue_status (status),
    INDEX idx_push_queue_type (push_type),
    INDEX idx_push_queue_scheduled (scheduled_at),
    INDEX idx_push_queue_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='推送通知队列表';

-- 7. 创建AI分类历史表（用于训练和优化）
CREATE TABLE IF NOT EXISTS notification_ai_classification_log (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    notification_id BIGINT NOT NULL COMMENT '通知ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    original_classification VARCHAR(20) COMMENT '原始AI分类',
    original_score INT COMMENT '原始AI评分',
    user_classification VARCHAR(20) DEFAULT NULL COMMENT '用户修正的分类',
    feedback_type VARCHAR(20) DEFAULT NULL COMMENT '反馈类型: correct, incorrect, reclassify',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_ai_log_notification (notification_id),
    INDEX idx_ai_log_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI分类历史日志表';

-- 8. 插入默认订阅规则（为现有用户）
INSERT IGNORE INTO notification_subscription (user_id, category, enabled, email_enabled, push_enabled)
SELECT DISTINCT user_id, 'task', 1, 1, 1 FROM notification WHERE user_id IS NOT NULL
UNION
SELECT DISTINCT user_id, 'project', 1, 1, 0 FROM notification WHERE user_id IS NOT NULL
UNION
SELECT DISTINCT user_id, 'comment', 1, 0, 1 FROM notification WHERE user_id IS NOT NULL
UNION
SELECT DISTINCT user_id, 'system', 1, 1, 1 FROM notification WHERE user_id IS NOT NULL
UNION
SELECT DISTINCT user_id, 'reminder', 1, 1, 1 FROM notification WHERE user_id IS NOT NULL
UNION
SELECT DISTINCT user_id, 'plan', 1, 1, 0 FROM notification WHERE user_id IS NOT NULL
UNION
SELECT DISTINCT user_id, 'feedback', 1, 0, 1 FROM notification WHERE user_id IS NOT NULL;

-- 9. 为现有通知添加AI分类（模拟）
UPDATE notification 
SET ai_classification = CASE 
    WHEN priority = 'urgent' THEN 'important'
    WHEN priority = 'high' THEN 'important'
    WHEN priority = 'normal' THEN 'normal'
    WHEN priority = 'low' THEN 'low_priority'
    ELSE 'normal'
END,
ai_score = CASE 
    WHEN priority = 'urgent' THEN 95
    WHEN priority = 'high' THEN 80
    WHEN priority = 'normal' THEN 50
    WHEN priority = 'low' THEN 25
    ELSE 50
END
WHERE ai_classification IS NULL;

-- 10. 自动折叠低优先级通知
UPDATE notification 
SET is_collapsed = 1 
WHERE ai_classification = 'low_priority' OR priority = 'low';