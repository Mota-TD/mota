-- =====================================================
-- 任务服务数据库表初始化脚本
-- 包含多租户支持 (tenant_id)
-- =====================================================

-- 创建任务服务数据库
CREATE DATABASE IF NOT EXISTS mota_task DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 授权
GRANT ALL PRIVILEGES ON mota_task.* TO 'mota'@'%';
FLUSH PRIVILEGES;

USE mota_task;

-- 里程碑任务表
CREATE TABLE IF NOT EXISTS milestone_task (
    id BIGINT PRIMARY KEY COMMENT '主键ID',
    tenant_id BIGINT NOT NULL DEFAULT 0 COMMENT '租户ID',
    milestone_id BIGINT NOT NULL COMMENT '里程碑ID',
    project_id BIGINT COMMENT '项目ID',
    parent_task_id BIGINT COMMENT '父任务ID（用于子任务）',
    name VARCHAR(200) NOT NULL COMMENT '任务名称',
    description TEXT COMMENT '描述',
    assignee_id BIGINT COMMENT '执行人ID',
    status VARCHAR(20) DEFAULT 'pending' COMMENT '状态: pending/in_progress/completed/cancelled',
    priority VARCHAR(20) DEFAULT 'medium' COMMENT '优先级: low/medium/high/urgent',
    start_date DATE COMMENT '开始日期',
    end_date DATE COMMENT '结束日期',
    due_date DATE COMMENT '截止日期',
    progress INT DEFAULT 0 COMMENT '进度 (0-100)',
    sort_order INT DEFAULT 0 COMMENT '排序',
    completed_at DATETIME COMMENT '完成时间',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT COMMENT '创建人ID',
    updated_by BIGINT COMMENT '更新人ID',
    dept_id BIGINT COMMENT '部门ID',
    deleted INT DEFAULT 0 COMMENT '删除标记',
    version INT DEFAULT 0 COMMENT '版本号',
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_milestone_id (milestone_id),
    INDEX idx_project_id (project_id),
    INDEX idx_parent_task_id (parent_task_id),
    INDEX idx_assignee_id (assignee_id),
    INDEX idx_status (status),
    INDEX idx_due_date (due_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='里程碑任务表';

-- 里程碑任务附件表
CREATE TABLE IF NOT EXISTS milestone_task_attachment (
    id BIGINT PRIMARY KEY COMMENT '主键ID',
    tenant_id BIGINT NOT NULL DEFAULT 0 COMMENT '租户ID',
    task_id BIGINT NOT NULL COMMENT '任务ID',
    file_name VARCHAR(255) NOT NULL COMMENT '文件名',
    file_path VARCHAR(500) NOT NULL COMMENT '文件路径',
    file_size BIGINT COMMENT '文件大小（字节）',
    file_type VARCHAR(100) COMMENT '文件类型',
    attachment_type VARCHAR(50) DEFAULT 'other' COMMENT '附件类型: execution_plan/progress_report/other',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT COMMENT '创建人ID',
    updated_by BIGINT COMMENT '更新人ID',
    dept_id BIGINT COMMENT '部门ID',
    deleted INT DEFAULT 0 COMMENT '删除标记',
    version INT DEFAULT 0 COMMENT '版本号',
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_task_id (task_id),
    INDEX idx_attachment_type (attachment_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='里程碑任务附件表';

-- 里程碑任务进度记录表
CREATE TABLE IF NOT EXISTS milestone_task_progress_record (
    id BIGINT PRIMARY KEY COMMENT '主键ID',
    tenant_id BIGINT NOT NULL DEFAULT 0 COMMENT '租户ID',
    task_id BIGINT NOT NULL COMMENT '任务ID',
    previous_progress INT COMMENT '更新前进度',
    current_progress INT COMMENT '更新后进度',
    description TEXT COMMENT '进度描述（支持富文本HTML）',
    attachments JSON COMMENT '附件列表（JSON格式）',
    updated_by BIGINT COMMENT '更新人ID',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT COMMENT '创建人ID',
    dept_id BIGINT COMMENT '部门ID',
    deleted INT DEFAULT 0 COMMENT '删除标记',
    version INT DEFAULT 0 COMMENT '版本号',
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_task_id (task_id),
    INDEX idx_updated_by (updated_by),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='里程碑任务进度记录表';

-- 创建 sys_user 视图（指向 mota_auth.sys_user，用于跨服务查询）
-- 注意：此视图依赖 mota_auth 数据库，需要在 mota_auth 初始化后执行
CREATE OR REPLACE VIEW sys_user AS SELECT * FROM mota_auth.sys_user;

SELECT '任务服务数据库表初始化完成!' AS message;