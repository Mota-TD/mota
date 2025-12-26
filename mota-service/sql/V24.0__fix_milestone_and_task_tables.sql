-- V24.0 修复 milestone 和 milestone_task 表结构
-- 添加缺失的表和列

-- 1. 创建 milestone_task 表（如果不存在）
CREATE TABLE IF NOT EXISTS milestone_task (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    milestone_id BIGINT NOT NULL COMMENT '所属里程碑ID',
    project_id BIGINT NOT NULL COMMENT '所属项目ID',
    parent_task_id BIGINT DEFAULT NULL COMMENT '父任务ID（用于子任务层级）',
    name VARCHAR(200) NOT NULL COMMENT '任务名称',
    description TEXT COMMENT '任务描述',
    assignee_id BIGINT COMMENT '执行人ID',
    assigned_by BIGINT COMMENT '分配人ID',
    status VARCHAR(20) DEFAULT 'pending' COMMENT '状态(pending/in_progress/completed/cancelled)',
    priority VARCHAR(20) DEFAULT 'medium' COMMENT '优先级(low/medium/high/urgent)',
    progress INT DEFAULT 0 COMMENT '完成进度(0-100)',
    start_date DATE COMMENT '开始日期',
    due_date DATE COMMENT '截止日期',
    completed_at DATETIME COMMENT '完成时间',
    sort_order INT DEFAULT 0 COMMENT '排序顺序',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT(1) DEFAULT 0 COMMENT '是否删除',
    KEY idx_milestone_id (milestone_id),
    KEY idx_project_id (project_id),
    KEY idx_parent_task_id (parent_task_id),
    KEY idx_assignee_id (assignee_id),
    KEY idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='里程碑任务表';

-- 2. 创建 milestone_task_attachment 表（如果不存在）
CREATE TABLE IF NOT EXISTS milestone_task_attachment (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    task_id BIGINT NOT NULL COMMENT '任务ID',
    file_name VARCHAR(255) NOT NULL COMMENT '文件名',
    file_path VARCHAR(500) NOT NULL COMMENT '文件路径',
    file_size BIGINT COMMENT '文件大小(字节)',
    file_type VARCHAR(100) COMMENT '文件类型',
    attachment_type VARCHAR(50) DEFAULT 'other' COMMENT '附件类型(execution_plan/other)',
    uploaded_by BIGINT COMMENT '上传人ID',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT(1) DEFAULT 0 COMMENT '是否删除',
    KEY idx_task_id (task_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='里程碑任务附件表';

-- 3. 创建 milestone_comment 表（如果不存在）
CREATE TABLE IF NOT EXISTS milestone_comment (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    milestone_id BIGINT COMMENT '里程碑ID',
    task_id BIGINT COMMENT '任务ID(如果是任务评论)',
    user_id BIGINT NOT NULL COMMENT '评论人ID',
    content TEXT NOT NULL COMMENT '评论内容',
    parent_id BIGINT COMMENT '父评论ID(回复)',
    is_reminder TINYINT(1) DEFAULT 0 COMMENT '是否催办(0-普通评论,1-催办)',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT(1) DEFAULT 0 COMMENT '是否删除',
    KEY idx_milestone_id (milestone_id),
    KEY idx_task_id (task_id),
    KEY idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='里程碑/任务评论表';

-- 4. 为 project_member 表添加缺失的列
ALTER TABLE project_member ADD COLUMN created_by BIGINT DEFAULT NULL COMMENT '创建人ID';
ALTER TABLE project_member ADD COLUMN updated_by BIGINT DEFAULT NULL COMMENT '更新人ID';