-- 任务服务数据库表结构
-- 创建数据库
CREATE DATABASE IF NOT EXISTS mota_task DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE mota_task;

-- 任务表
CREATE TABLE IF NOT EXISTS task (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '任务ID',
    tenant_id BIGINT NOT NULL COMMENT '租户ID',
    project_id BIGINT NOT NULL COMMENT '项目ID',
    milestone_id BIGINT COMMENT '里程碑ID',
    parent_id BIGINT COMMENT '父任务ID',
    task_no VARCHAR(50) NOT NULL COMMENT '任务编号',
    title VARCHAR(500) NOT NULL COMMENT '任务标题',
    description TEXT COMMENT '任务描述',
    task_type VARCHAR(50) DEFAULT 'task' COMMENT '任务类型：task/bug/story/epic/feature/subtask',
    status VARCHAR(50) DEFAULT '待处理' COMMENT '状态',
    priority VARCHAR(20) DEFAULT 'medium' COMMENT '优先级：low/medium/high/urgent',
    assignee_id BIGINT COMMENT '负责人ID',
    reporter_id BIGINT COMMENT '报告人ID',
    start_date DATE COMMENT '开始日期',
    due_date DATE COMMENT '截止日期',
    completed_date DATE COMMENT '完成日期',
    estimated_hours DECIMAL(10,2) COMMENT '预估工时（小时）',
    actual_hours DECIMAL(10,2) COMMENT '实际工时（小时）',
    progress INT DEFAULT 0 COMMENT '完成百分比',
    story_points INT COMMENT '故事点数',
    sprint_id BIGINT COMMENT 'Sprint ID',
    tags VARCHAR(500) COMMENT '标签，逗号分隔',
    custom_fields JSON COMMENT '自定义字段',
    version INT DEFAULT 0 COMMENT '乐观锁版本号',
    deleted TINYINT(1) DEFAULT 0 COMMENT '是否删除',
    create_by BIGINT COMMENT '创建人',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_by BIGINT COMMENT '更新人',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_project_id (project_id),
    INDEX idx_milestone_id (milestone_id),
    INDEX idx_parent_id (parent_id),
    INDEX idx_assignee_id (assignee_id),
    INDEX idx_sprint_id (sprint_id),
    INDEX idx_status (status),
    INDEX idx_due_date (due_date),
    INDEX idx_task_no (task_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='任务表';

-- 检查清单表
CREATE TABLE IF NOT EXISTS checklist (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '清单ID',
    task_id BIGINT NOT NULL COMMENT '任务ID',
    title VARCHAR(200) NOT NULL COMMENT '清单标题',
    sort_order INT DEFAULT 0 COMMENT '排序号',
    deleted TINYINT(1) DEFAULT 0 COMMENT '是否删除',
    create_by BIGINT COMMENT '创建人',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_by BIGINT COMMENT '更新人',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_task_id (task_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='检查清单表';

-- 检查清单项表
CREATE TABLE IF NOT EXISTS checklist_item (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '检查项ID',
    checklist_id BIGINT NOT NULL COMMENT '清单ID',
    content VARCHAR(500) NOT NULL COMMENT '检查项内容',
    completed TINYINT(1) DEFAULT 0 COMMENT '是否完成',
    completed_at DATETIME COMMENT '完成时间',
    completed_by BIGINT COMMENT '完成人',
    sort_order INT DEFAULT 0 COMMENT '排序号',
    deleted TINYINT(1) DEFAULT 0 COMMENT '是否删除',
    create_by BIGINT COMMENT '创建人',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_by BIGINT COMMENT '更新人',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_checklist_id (checklist_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='检查清单项表';

-- 任务依赖关系表
CREATE TABLE IF NOT EXISTS task_dependency (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '依赖ID',
    task_id BIGINT NOT NULL COMMENT '任务ID',
    predecessor_id BIGINT NOT NULL COMMENT '前置任务ID',
    dependency_type VARCHAR(10) DEFAULT 'FS' COMMENT '依赖类型：FS/SS/FF/SF',
    lag_days INT DEFAULT 0 COMMENT '延迟天数',
    deleted TINYINT(1) DEFAULT 0 COMMENT '是否删除',
    create_by BIGINT COMMENT '创建人',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_by BIGINT COMMENT '更新人',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_task_id (task_id),
    INDEX idx_predecessor_id (predecessor_id),
    UNIQUE KEY uk_task_predecessor (task_id, predecessor_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='任务依赖关系表';

-- 工作流状态表
CREATE TABLE IF NOT EXISTS workflow_status (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '状态ID',
    tenant_id BIGINT NOT NULL COMMENT '租户ID',
    project_id BIGINT COMMENT '项目ID（为空表示默认模板）',
    name VARCHAR(50) NOT NULL COMMENT '状态名称',
    color VARCHAR(20) DEFAULT '#1890ff' COMMENT '状态颜色',
    category VARCHAR(20) DEFAULT 'todo' COMMENT '状态分类：todo/in_progress/done',
    sort_order INT DEFAULT 0 COMMENT '排序号',
    is_default TINYINT(1) DEFAULT 0 COMMENT '是否默认模板',
    is_initial TINYINT(1) DEFAULT 0 COMMENT '是否初始状态',
    is_final TINYINT(1) DEFAULT 0 COMMENT '是否完成状态',
    deleted TINYINT(1) DEFAULT 0 COMMENT '是否删除',
    create_by BIGINT COMMENT '创建人',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_by BIGINT COMMENT '更新人',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_project_id (project_id),
    INDEX idx_is_default (is_default)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='工作流状态表';

-- 任务评论表
CREATE TABLE IF NOT EXISTS task_comment (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '评论ID',
    task_id BIGINT NOT NULL COMMENT '任务ID',
    parent_id BIGINT COMMENT '父评论ID',
    content TEXT NOT NULL COMMENT '评论内容',
    mentions JSON COMMENT '提及的用户ID列表',
    deleted TINYINT(1) DEFAULT 0 COMMENT '是否删除',
    create_by BIGINT COMMENT '创建人',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_by BIGINT COMMENT '更新人',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_task_id (task_id),
    INDEX idx_parent_id (parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='任务评论表';

-- 任务附件表
CREATE TABLE IF NOT EXISTS task_attachment (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '附件ID',
    task_id BIGINT NOT NULL COMMENT '任务ID',
    file_name VARCHAR(255) NOT NULL COMMENT '文件名',
    file_path VARCHAR(500) NOT NULL COMMENT '文件路径',
    file_size BIGINT COMMENT '文件大小（字节）',
    file_type VARCHAR(100) COMMENT '文件类型',
    deleted TINYINT(1) DEFAULT 0 COMMENT '是否删除',
    create_by BIGINT COMMENT '创建人',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_task_id (task_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='任务附件表';

-- 任务工时记录表
CREATE TABLE IF NOT EXISTS task_time_log (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '记录ID',
    task_id BIGINT NOT NULL COMMENT '任务ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    hours DECIMAL(10,2) NOT NULL COMMENT '工时（小时）',
    work_date DATE NOT NULL COMMENT '工作日期',
    description VARCHAR(500) COMMENT '工作描述',
    deleted TINYINT(1) DEFAULT 0 COMMENT '是否删除',
    create_by BIGINT COMMENT '创建人',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_by BIGINT COMMENT '更新人',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_task_id (task_id),
    INDEX idx_user_id (user_id),
    INDEX idx_work_date (work_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='任务工时记录表';

-- 任务变更历史表
CREATE TABLE IF NOT EXISTS task_history (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '历史ID',
    task_id BIGINT NOT NULL COMMENT '任务ID',
    field_name VARCHAR(50) NOT NULL COMMENT '字段名',
    old_value TEXT COMMENT '旧值',
    new_value TEXT COMMENT '新值',
    change_type VARCHAR(20) COMMENT '变更类型：create/update/delete',
    create_by BIGINT COMMENT '操作人',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
    INDEX idx_task_id (task_id),
    INDEX idx_create_time (create_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='任务变更历史表';

-- Sprint表
CREATE TABLE IF NOT EXISTS sprint (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT 'Sprint ID',
    tenant_id BIGINT NOT NULL COMMENT '租户ID',
    project_id BIGINT NOT NULL COMMENT '项目ID',
    name VARCHAR(100) NOT NULL COMMENT 'Sprint名称',
    goal VARCHAR(500) COMMENT 'Sprint目标',
    start_date DATE COMMENT '开始日期',
    end_date DATE COMMENT '结束日期',
    status VARCHAR(20) DEFAULT 'planning' COMMENT '状态：planning/active/completed',
    velocity INT COMMENT '速度（完成的故事点）',
    deleted TINYINT(1) DEFAULT 0 COMMENT '是否删除',
    create_by BIGINT COMMENT '创建人',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_by BIGINT COMMENT '更新人',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_project_id (project_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Sprint表';

-- 任务标签表
CREATE TABLE IF NOT EXISTS task_label (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '标签ID',
    tenant_id BIGINT NOT NULL COMMENT '租户ID',
    project_id BIGINT COMMENT '项目ID（为空表示全局标签）',
    name VARCHAR(50) NOT NULL COMMENT '标签名称',
    color VARCHAR(20) DEFAULT '#1890ff' COMMENT '标签颜色',
    deleted TINYINT(1) DEFAULT 0 COMMENT '是否删除',
    create_by BIGINT COMMENT '创建人',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_project_id (project_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='任务标签表';