-- 日历事件表
CREATE TABLE IF NOT EXISTS calendar_event (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL COMMENT '事件标题',
    description TEXT NULL COMMENT '事件描述',
    event_type VARCHAR(50) DEFAULT 'other' COMMENT '事件类型: meeting(会议), task(任务), milestone(里程碑), reminder(提醒), other(其他)',
    start_time DATETIME NOT NULL COMMENT '开始时间',
    end_time DATETIME NOT NULL COMMENT '结束时间',
    all_day BOOLEAN DEFAULT FALSE COMMENT '是否全天事件',
    location VARCHAR(500) NULL COMMENT '事件地点',
    color VARCHAR(20) DEFAULT '#1890ff' COMMENT '事件颜色',
    creator_id BIGINT NOT NULL COMMENT '创建者ID',
    project_id BIGINT NULL COMMENT '关联项目ID',
    task_id BIGINT NULL COMMENT '关联任务ID',
    milestone_id BIGINT NULL COMMENT '关联里程碑ID',
    recurrence_rule VARCHAR(50) DEFAULT 'none' COMMENT '循环规则: none(不循环), daily(每天), weekly(每周), monthly(每月), yearly(每年)',
    recurrence_end_date DATETIME NULL COMMENT '循环结束日期',
    reminder_minutes INT DEFAULT 15 COMMENT '提醒时间(分钟): 0(准时), 5, 10, 15, 30, 60, 1440(1天前)',
    visibility VARCHAR(20) DEFAULT 'private' COMMENT '可见性: private(仅自己), project(项目成员), public(所有人)',
    status VARCHAR(20) DEFAULT 'active' COMMENT '状态: active(活动), cancelled(已取消)',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_creator_id (creator_id),
    INDEX idx_project_id (project_id),
    INDEX idx_task_id (task_id),
    INDEX idx_milestone_id (milestone_id),
    INDEX idx_start_time (start_time),
    INDEX idx_end_time (end_time),
    INDEX idx_status (status),
    INDEX idx_event_type (event_type),
    INDEX idx_creator_time (creator_id, start_time, end_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='日历事件表';

-- 日历事件参与者表
CREATE TABLE IF NOT EXISTS calendar_event_attendee (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    event_id BIGINT NOT NULL COMMENT '事件ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    response_status VARCHAR(20) DEFAULT 'pending' COMMENT '响应状态: pending(待确认), accepted(已接受), declined(已拒绝), tentative(暂定)',
    required BOOLEAN DEFAULT FALSE COMMENT '是否必须参加',
    responded_at DATETIME NULL COMMENT '响应时间',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_event_id (event_id),
    INDEX idx_user_id (user_id),
    INDEX idx_response_status (response_status),
    UNIQUE KEY uk_event_user (event_id, user_id),
    CONSTRAINT fk_attendee_event FOREIGN KEY (event_id) REFERENCES calendar_event(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='日历事件参与者表';