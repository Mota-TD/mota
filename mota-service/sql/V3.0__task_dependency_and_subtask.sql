-- =====================================================
-- Mota 项目协同模块 V3.0 - 任务依赖和子任务功能
-- 新增任务依赖关系表、子任务表、检查清单表
-- 创建日期: 2025-12-25
-- =====================================================

-- =====================================================
-- 1. 任务依赖关系表 (task_dependency)
-- =====================================================
CREATE TABLE IF NOT EXISTS task_dependency (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    predecessor_id BIGINT NOT NULL COMMENT '前置任务ID',
    successor_id BIGINT NOT NULL COMMENT '后继任务ID',
    dependency_type VARCHAR(10) NOT NULL DEFAULT 'FS' COMMENT '依赖类型(FS-完成后开始/SS-同时开始/FF-同时完成/SF-开始后完成)',
    lag_days INT DEFAULT 0 COMMENT '延迟天数(可为负数表示提前)',
    description VARCHAR(500) COMMENT '依赖说明',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT COMMENT '创建人ID',
    updated_by BIGINT COMMENT '更新人ID',
    deleted INT DEFAULT 0 COMMENT '删除标记(0-未删除,1-已删除)',
    version INT DEFAULT 0 COMMENT '乐观锁版本号',
    
    UNIQUE KEY uk_predecessor_successor (predecessor_id, successor_id, deleted),
    INDEX idx_predecessor (predecessor_id),
    INDEX idx_successor (successor_id),
    INDEX idx_dependency_type (dependency_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='任务依赖关系表';

-- =====================================================
-- 2. 子任务表 (subtask)
-- =====================================================
CREATE TABLE IF NOT EXISTS subtask (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    parent_task_id BIGINT NOT NULL COMMENT '父任务ID',
    project_id BIGINT NOT NULL COMMENT '所属项目ID',
    name VARCHAR(255) NOT NULL COMMENT '子任务名称',
    description TEXT COMMENT '子任务描述',
    assignee_id BIGINT COMMENT '执行人ID',
    status VARCHAR(20) DEFAULT 'pending' COMMENT '状态(pending/in_progress/completed/cancelled)',
    priority VARCHAR(20) DEFAULT 'medium' COMMENT '优先级(low/medium/high/urgent)',
    start_date DATE COMMENT '开始日期',
    end_date DATE COMMENT '截止日期',
    progress INT DEFAULT 0 COMMENT '进度(0-100)',
    sort_order INT DEFAULT 0 COMMENT '排序顺序',
    completed_at TIMESTAMP COMMENT '完成时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT NOT NULL COMMENT '创建人ID',
    updated_by BIGINT COMMENT '更新人ID',
    deleted INT DEFAULT 0 COMMENT '删除标记(0-未删除,1-已删除)',
    version INT DEFAULT 0 COMMENT '乐观锁版本号',
    
    INDEX idx_parent_task (parent_task_id),
    INDEX idx_project (project_id),
    INDEX idx_assignee (assignee_id),
    INDEX idx_status (status),
    INDEX idx_sort_order (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='子任务表';

-- =====================================================
-- 3. 检查清单表 (checklist)
-- =====================================================
CREATE TABLE IF NOT EXISTS checklist (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    task_id BIGINT NOT NULL COMMENT '所属任务ID',
    name VARCHAR(255) NOT NULL COMMENT '清单名称',
    sort_order INT DEFAULT 0 COMMENT '排序顺序',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT COMMENT '创建人ID',
    updated_by BIGINT COMMENT '更新人ID',
    deleted INT DEFAULT 0 COMMENT '删除标记(0-未删除,1-已删除)',
    version INT DEFAULT 0 COMMENT '乐观锁版本号',
    
    INDEX idx_task (task_id),
    INDEX idx_sort_order (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='检查清单表';

-- =====================================================
-- 4. 检查清单项表 (checklist_item)
-- =====================================================
CREATE TABLE IF NOT EXISTS checklist_item (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    checklist_id BIGINT NOT NULL COMMENT '所属清单ID',
    content VARCHAR(500) NOT NULL COMMENT '检查项内容',
    is_completed TINYINT DEFAULT 0 COMMENT '是否完成(0-未完成,1-已完成)',
    completed_by BIGINT COMMENT '完成人ID',
    completed_at TIMESTAMP COMMENT '完成时间',
    assignee_id BIGINT COMMENT '负责人ID',
    due_date DATE COMMENT '截止日期',
    sort_order INT DEFAULT 0 COMMENT '排序顺序',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT COMMENT '创建人ID',
    updated_by BIGINT COMMENT '更新人ID',
    deleted INT DEFAULT 0 COMMENT '删除标记(0-未删除,1-已删除)',
    version INT DEFAULT 0 COMMENT '乐观锁版本号',
    
    INDEX idx_checklist (checklist_id),
    INDEX idx_is_completed (is_completed),
    INDEX idx_assignee (assignee_id),
    INDEX idx_sort_order (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='检查清单项表';

-- =====================================================
-- 5. 更新任务表 - 添加父任务ID字段支持任务层级
-- =====================================================
ALTER TABLE task 
ADD COLUMN IF NOT EXISTS parent_id BIGINT COMMENT '父任务ID(用于子任务)',
ADD COLUMN IF NOT EXISTS estimated_hours DECIMAL(10,2) COMMENT '预估工时(小时)',
ADD COLUMN IF NOT EXISTS actual_hours DECIMAL(10,2) COMMENT '实际工时(小时)',
ADD COLUMN IF NOT EXISTS is_milestone TINYINT DEFAULT 0 COMMENT '是否为里程碑任务(0-否,1-是)';

-- 添加索引
CREATE INDEX IF NOT EXISTS idx_parent ON task(parent_id);
CREATE INDEX IF NOT EXISTS idx_is_milestone ON task(is_milestone);

-- =====================================================
-- 6. 日程事件表 (calendar_event)
-- =====================================================
CREATE TABLE IF NOT EXISTS calendar_event (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL COMMENT '事件标题',
    description TEXT COMMENT '事件描述',
    event_type VARCHAR(30) NOT NULL COMMENT '事件类型(task/milestone/meeting/reminder/custom)',
    start_time DATETIME NOT NULL COMMENT '开始时间',
    end_time DATETIME COMMENT '结束时间',
    all_day TINYINT DEFAULT 0 COMMENT '是否全天事件(0-否,1-是)',
    location VARCHAR(255) COMMENT '地点',
    color VARCHAR(20) COMMENT '显示颜色',
    recurrence_rule VARCHAR(255) COMMENT '循环规则(iCal RRULE格式)',
    recurrence_end_date DATE COMMENT '循环结束日期',
    reminder_minutes INT COMMENT '提前提醒分钟数',
    project_id BIGINT COMMENT '关联项目ID',
    task_id BIGINT COMMENT '关联任务ID',
    milestone_id BIGINT COMMENT '关联里程碑ID',
    owner_id BIGINT NOT NULL COMMENT '所有者ID',
    visibility VARCHAR(20) DEFAULT 'private' COMMENT '可见性(private/team/public)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT COMMENT '创建人ID',
    updated_by BIGINT COMMENT '更新人ID',
    deleted INT DEFAULT 0 COMMENT '删除标记(0-未删除,1-已删除)',
    version INT DEFAULT 0 COMMENT '乐观锁版本号',
    
    INDEX idx_owner (owner_id),
    INDEX idx_project (project_id),
    INDEX idx_task (task_id),
    INDEX idx_milestone (milestone_id),
    INDEX idx_start_time (start_time),
    INDEX idx_end_time (end_time),
    INDEX idx_event_type (event_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='日程事件表';

-- =====================================================
-- 7. 日程事件参与者表 (calendar_event_attendee)
-- =====================================================
CREATE TABLE IF NOT EXISTS calendar_event_attendee (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    event_id BIGINT NOT NULL COMMENT '事件ID',
    user_id BIGINT NOT NULL COMMENT '参与者ID',
    response_status VARCHAR(20) DEFAULT 'pending' COMMENT '响应状态(pending/accepted/declined/tentative)',
    responded_at TIMESTAMP COMMENT '响应时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE KEY uk_event_user (event_id, user_id),
    INDEX idx_event (event_id),
    INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='日程事件参与者表';

-- =====================================================
-- 8. 更新通知表 - 添加聚合和分类字段
-- =====================================================
ALTER TABLE notification 
ADD COLUMN IF NOT EXISTS category VARCHAR(30) COMMENT '通知分类(task/project/mention/system/reminder)',
ADD COLUMN IF NOT EXISTS group_key VARCHAR(100) COMMENT '聚合分组键',
ADD COLUMN IF NOT EXISTS aggregated_count INT DEFAULT 1 COMMENT '聚合数量',
ADD COLUMN IF NOT EXISTS is_aggregated TINYINT DEFAULT 0 COMMENT '是否已聚合(0-否,1-是)';

-- 添加索引
CREATE INDEX IF NOT EXISTS idx_category ON notification(category);
CREATE INDEX IF NOT EXISTS idx_group_key ON notification(group_key);

-- =====================================================
-- 9. 任务工时记录表 (task_time_log)
-- =====================================================
CREATE TABLE IF NOT EXISTS task_time_log (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    task_id BIGINT NOT NULL COMMENT '任务ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    log_date DATE NOT NULL COMMENT '工时日期',
    hours DECIMAL(5,2) NOT NULL COMMENT '工时(小时)',
    description VARCHAR(500) COMMENT '工作描述',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT COMMENT '创建人ID',
    updated_by BIGINT COMMENT '更新人ID',
    deleted INT DEFAULT 0 COMMENT '删除标记(0-未删除,1-已删除)',
    version INT DEFAULT 0 COMMENT '乐观锁版本号',
    
    INDEX idx_task (task_id),
    INDEX idx_user (user_id),
    INDEX idx_log_date (log_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='任务工时记录表';

-- =====================================================
-- 10. 任务模板表 (task_template)
-- =====================================================
CREATE TABLE IF NOT EXISTS task_template (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL COMMENT '模板名称',
    description TEXT COMMENT '模板描述',
    category VARCHAR(50) COMMENT '模板分类',
    template_data JSON NOT NULL COMMENT '模板数据(JSON格式)',
    is_public TINYINT DEFAULT 0 COMMENT '是否公开(0-私有,1-公开)',
    usage_count INT DEFAULT 0 COMMENT '使用次数',
    org_id VARCHAR(50) COMMENT '组织ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT COMMENT '创建人ID',
    updated_by BIGINT COMMENT '更新人ID',
    deleted INT DEFAULT 0 COMMENT '删除标记(0-未删除,1-已删除)',
    version INT DEFAULT 0 COMMENT '乐观锁版本号',
    
    INDEX idx_category (category),
    INDEX idx_is_public (is_public),
    INDEX idx_org (org_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='任务模板表';

-- =====================================================
-- 完成
-- =====================================================
SELECT 'V3.0 任务依赖和子任务功能数据库迁移完成！' AS message;