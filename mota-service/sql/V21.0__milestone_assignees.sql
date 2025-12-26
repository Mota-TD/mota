-- V21.0 里程碑负责人和任务同步
-- 创建时间: 2024-12-26

-- 1. 里程碑负责人关联表（支持多负责人）
CREATE TABLE IF NOT EXISTS milestone_assignee (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    milestone_id BIGINT NOT NULL COMMENT '里程碑ID',
    user_id BIGINT NOT NULL COMMENT '负责人用户ID',
    is_primary TINYINT(1) DEFAULT 0 COMMENT '是否主负责人(0-否,1-是)',
    assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '分配时间',
    assigned_by BIGINT COMMENT '分配人ID',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    created_by BIGINT COMMENT '创建人ID',
    updated_by BIGINT COMMENT '更新人ID',
    deleted INT DEFAULT 0 COMMENT '删除标记(0-未删除,1-已删除)',
    version INT DEFAULT 0 COMMENT '乐观锁版本号',
    UNIQUE KEY uk_milestone_user (milestone_id, user_id),
    KEY idx_milestone_id (milestone_id),
    KEY idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='里程碑负责人关联表';

-- 2. 修改里程碑表，添加进度字段
ALTER TABLE milestone 
ADD COLUMN IF NOT EXISTS progress INT DEFAULT 0 COMMENT '完成进度(0-100)' AFTER status,
ADD COLUMN IF NOT EXISTS task_count INT DEFAULT 0 COMMENT '任务总数' AFTER progress,
ADD COLUMN IF NOT EXISTS completed_task_count INT DEFAULT 0 COMMENT '已完成任务数' AFTER task_count;

-- 3. 里程碑任务表（里程碑拆解的子任务）
CREATE TABLE IF NOT EXISTS milestone_task (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    milestone_id BIGINT NOT NULL COMMENT '所属里程碑ID',
    project_id BIGINT NOT NULL COMMENT '所属项目ID',
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
    KEY idx_assignee_id (assignee_id),
    KEY idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='里程碑任务表';

-- 4. 里程碑任务附件表（执行方案上传）
CREATE TABLE IF NOT EXISTS milestone_task_attachment (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    task_id BIGINT NOT NULL COMMENT '任务ID',
    milestone_id BIGINT NOT NULL COMMENT '里程碑ID',
    file_name VARCHAR(255) NOT NULL COMMENT '文件名',
    file_path VARCHAR(500) NOT NULL COMMENT '文件路径',
    file_size BIGINT COMMENT '文件大小(字节)',
    file_type VARCHAR(100) COMMENT '文件类型',
    upload_by BIGINT COMMENT '上传人ID',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    KEY idx_task_id (task_id),
    KEY idx_milestone_id (milestone_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='里程碑任务附件表';

-- 5. 里程碑/任务评论表
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

-- 6. 项目附件表（项目资料上传）
CREATE TABLE IF NOT EXISTS project_attachment (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    project_id BIGINT NOT NULL COMMENT '项目ID',
    file_name VARCHAR(255) NOT NULL COMMENT '文件名',
    file_path VARCHAR(500) NOT NULL COMMENT '文件路径',
    file_size BIGINT COMMENT '文件大小(字节)',
    file_type VARCHAR(100) COMMENT '文件类型',
    upload_by BIGINT COMMENT '上传人ID',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    KEY idx_project_id (project_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='项目附件表';