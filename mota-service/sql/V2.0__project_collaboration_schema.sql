-- =====================================================
-- Mota 项目协同模块 V2.0 - 数据库迁移脚本
-- 新增部门任务、工作计划、执行任务等表结构
-- 创建日期: 2025-12-23
-- =====================================================

-- =====================================================
-- 1. 更新项目表 (project) - 添加新字段
-- =====================================================
ALTER TABLE project 
ADD COLUMN IF NOT EXISTS start_date DATE COMMENT '项目开始日期',
ADD COLUMN IF NOT EXISTS end_date DATE COMMENT '项目结束日期',
ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'medium' COMMENT '优先级(low/medium/high/urgent)';

-- =====================================================
-- 2. 部门表 (department) - 如果不存在则创建
-- =====================================================
CREATE TABLE IF NOT EXISTS department (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    org_id VARCHAR(50) NOT NULL COMMENT '组织ID',
    name VARCHAR(100) NOT NULL COMMENT '部门名称',
    description VARCHAR(500) COMMENT '部门描述',
    manager_id BIGINT COMMENT '部门负责人ID',
    parent_id BIGINT COMMENT '上级部门ID',
    sort_order INT DEFAULT 0 COMMENT '排序顺序',
    status TINYINT DEFAULT 1 COMMENT '状态(0-禁用,1-启用)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT COMMENT '创建人ID',
    updated_by BIGINT COMMENT '更新人ID',
    deleted INT DEFAULT 0 COMMENT '删除标记(0-未删除,1-已删除)',
    version INT DEFAULT 0 COMMENT '乐观锁版本号',
    
    INDEX idx_org (org_id),
    INDEX idx_manager (manager_id),
    INDEX idx_parent (parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='部门表';

-- =====================================================
-- 3. 部门任务表 (department_task)
-- =====================================================
CREATE TABLE IF NOT EXISTS department_task (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    project_id BIGINT NOT NULL COMMENT '所属项目ID',
    department_id BIGINT NOT NULL COMMENT '负责部门ID',
    manager_id BIGINT NOT NULL COMMENT '部门负责人ID',
    name VARCHAR(200) NOT NULL COMMENT '任务名称',
    description TEXT COMMENT '任务描述',
    status VARCHAR(30) DEFAULT 'pending' COMMENT '任务状态(pending/plan_submitted/plan_approved/in_progress/completed/cancelled)',
    priority VARCHAR(20) DEFAULT 'medium' COMMENT '优先级(low/medium/high/urgent)',
    start_date DATE COMMENT '开始日期',
    end_date DATE NOT NULL COMMENT '截止日期',
    progress INT DEFAULT 0 COMMENT '任务进度(0-100)',
    require_plan TINYINT DEFAULT 1 COMMENT '是否需要提交工作计划(0-否,1-是)',
    require_approval TINYINT DEFAULT 0 COMMENT '工作计划是否需要审批(0-否,1-是)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT NOT NULL COMMENT '创建人ID',
    updated_by BIGINT COMMENT '更新人ID',
    deleted INT DEFAULT 0 COMMENT '删除标记(0-未删除,1-已删除)',
    version INT DEFAULT 0 COMMENT '乐观锁版本号',
    
    INDEX idx_project (project_id),
    INDEX idx_department (department_id),
    INDEX idx_manager (manager_id),
    INDEX idx_status (status),
    INDEX idx_end_date (end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='部门任务表';

-- =====================================================
-- 4. 工作计划表 (work_plan)
-- =====================================================
CREATE TABLE IF NOT EXISTS work_plan (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    department_task_id BIGINT NOT NULL COMMENT '所属部门任务ID',
    summary TEXT COMMENT '计划概述',
    resource_requirement TEXT COMMENT '资源需求说明',
    status VARCHAR(20) DEFAULT 'draft' COMMENT '计划状态(draft/submitted/approved/rejected)',
    submitted_by BIGINT COMMENT '提交人ID',
    submitted_at TIMESTAMP COMMENT '提交时间',
    reviewed_by BIGINT COMMENT '审批人ID',
    reviewed_at TIMESTAMP COMMENT '审批时间',
    review_comment TEXT COMMENT '审批意见',
    version INT DEFAULT 1 COMMENT '版本号',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT COMMENT '创建人ID',
    updated_by BIGINT COMMENT '更新人ID',
    deleted INT DEFAULT 0 COMMENT '删除标记(0-未删除,1-已删除)',
    
    INDEX idx_department_task (department_task_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='工作计划表';

-- =====================================================
-- 5. 工作计划附件表 (work_plan_attachment)
-- =====================================================
CREATE TABLE IF NOT EXISTS work_plan_attachment (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    work_plan_id BIGINT NOT NULL COMMENT '所属工作计划ID',
    file_name VARCHAR(255) NOT NULL COMMENT '文件名',
    file_url VARCHAR(500) NOT NULL COMMENT '文件URL',
    file_size BIGINT COMMENT '文件大小(字节)',
    file_type VARCHAR(50) COMMENT '文件类型',
    uploaded_by BIGINT NOT NULL COMMENT '上传人ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted INT DEFAULT 0 COMMENT '删除标记(0-未删除,1-已删除)',
    
    INDEX idx_work_plan (work_plan_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='工作计划附件表';

-- =====================================================
-- 6. 执行任务表 (task)
-- =====================================================
CREATE TABLE IF NOT EXISTS task (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    department_task_id BIGINT NOT NULL COMMENT '所属部门任务ID',
    project_id BIGINT NOT NULL COMMENT '所属项目ID(冗余字段,便于查询)',
    name VARCHAR(255) NOT NULL COMMENT '任务名称',
    description TEXT COMMENT '任务描述',
    assignee_id BIGINT COMMENT '执行人ID',
    status VARCHAR(20) DEFAULT 'pending' COMMENT '任务状态(pending/in_progress/completed/cancelled)',
    priority VARCHAR(20) DEFAULT 'medium' COMMENT '优先级(low/medium/high/urgent)',
    start_date DATE COMMENT '开始日期',
    end_date DATE COMMENT '截止日期',
    progress INT DEFAULT 0 COMMENT '任务进度(0-100)',
    progress_note TEXT COMMENT '进度说明',
    sort_order INT DEFAULT 0 COMMENT '排序顺序',
    completed_at TIMESTAMP COMMENT '完成时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT NOT NULL COMMENT '创建人ID',
    updated_by BIGINT COMMENT '更新人ID',
    deleted INT DEFAULT 0 COMMENT '删除标记(0-未删除,1-已删除)',
    version INT DEFAULT 0 COMMENT '乐观锁版本号',
    
    INDEX idx_department_task (department_task_id),
    INDEX idx_project (project_id),
    INDEX idx_assignee (assignee_id),
    INDEX idx_status (status),
    INDEX idx_end_date (end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='执行任务表';

-- =====================================================
-- 7. 任务交付物表 (deliverable)
-- =====================================================
CREATE TABLE IF NOT EXISTS deliverable (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    task_id BIGINT NOT NULL COMMENT '所属任务ID',
    name VARCHAR(255) NOT NULL COMMENT '交付物名称',
    file_name VARCHAR(255) COMMENT '文件名',
    file_url VARCHAR(500) COMMENT '文件URL',
    file_size BIGINT COMMENT '文件大小(字节)',
    file_type VARCHAR(50) COMMENT '文件类型',
    description TEXT COMMENT '交付物说明',
    uploaded_by BIGINT NOT NULL COMMENT '上传人ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted INT DEFAULT 0 COMMENT '删除标记(0-未删除,1-已删除)',
    
    INDEX idx_task (task_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='任务交付物表';

-- =====================================================
-- 8. 项目里程碑表 (milestone)
-- =====================================================
CREATE TABLE IF NOT EXISTS milestone (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    project_id BIGINT NOT NULL COMMENT '所属项目ID',
    name VARCHAR(200) NOT NULL COMMENT '里程碑名称',
    description TEXT COMMENT '里程碑描述',
    target_date DATE NOT NULL COMMENT '目标日期',
    status VARCHAR(20) DEFAULT 'pending' COMMENT '状态(pending/completed/delayed)',
    completed_at TIMESTAMP COMMENT '完成时间',
    sort_order INT DEFAULT 0 COMMENT '排序顺序',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT COMMENT '创建人ID',
    updated_by BIGINT COMMENT '更新人ID',
    deleted INT DEFAULT 0 COMMENT '删除标记(0-未删除,1-已删除)',
    version INT DEFAULT 0 COMMENT '乐观锁版本号',
    
    INDEX idx_project (project_id),
    INDEX idx_target_date (target_date),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='项目里程碑表';

-- =====================================================
-- 9. 更新项目成员表 (project_member) - 添加新字段
-- =====================================================
ALTER TABLE project_member 
ADD COLUMN IF NOT EXISTS department_id BIGINT COMMENT '所属部门ID',
MODIFY COLUMN role VARCHAR(30) DEFAULT 'member' COMMENT '项目角色(owner/department_manager/member/viewer)';

-- 添加索引
CREATE INDEX IF NOT EXISTS idx_department ON project_member(department_id);

-- =====================================================
-- 10. 任务评论表 (task_comment)
-- =====================================================
CREATE TABLE IF NOT EXISTS task_comment (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    task_id BIGINT NOT NULL COMMENT '所属任务ID',
    parent_id BIGINT COMMENT '父评论ID(用于回复)',
    user_id BIGINT NOT NULL COMMENT '评论人ID',
    content TEXT NOT NULL COMMENT '评论内容',
    mentioned_users JSON COMMENT '@提及的用户ID列表',
    like_count INT DEFAULT 0 COMMENT '点赞数',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted INT DEFAULT 0 COMMENT '删除标记(0-未删除,1-已删除)',
    
    INDEX idx_task (task_id),
    INDEX idx_parent (parent_id),
    INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='任务评论表';

-- =====================================================
-- 11. 评论附件表 (comment_attachment)
-- =====================================================
CREATE TABLE IF NOT EXISTS comment_attachment (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    comment_id BIGINT NOT NULL COMMENT '所属评论ID',
    file_name VARCHAR(255) NOT NULL COMMENT '文件名',
    file_url VARCHAR(500) NOT NULL COMMENT '文件URL',
    file_size BIGINT COMMENT '文件大小(字节)',
    file_type VARCHAR(50) COMMENT '文件类型',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_comment (comment_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='评论附件表';

-- =====================================================
-- 12. 工作反馈表 (work_feedback)
-- =====================================================
CREATE TABLE IF NOT EXISTS work_feedback (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    project_id BIGINT COMMENT '关联项目ID',
    task_id BIGINT COMMENT '关联任务ID',
    feedback_type VARCHAR(30) NOT NULL COMMENT '反馈类型(guidance/evaluation/problem/collaboration/report)',
    from_user_id BIGINT NOT NULL COMMENT '发起人ID',
    to_user_id BIGINT NOT NULL COMMENT '接收人ID',
    title VARCHAR(200) COMMENT '反馈标题',
    content TEXT NOT NULL COMMENT '反馈内容',
    rating INT COMMENT '评价等级(1-5)',
    require_reply TINYINT DEFAULT 0 COMMENT '是否需要回复(0-否,1-是)',
    status VARCHAR(20) DEFAULT 'pending' COMMENT '状态(pending/read/replied)',
    reply_content TEXT COMMENT '回复内容',
    replied_at TIMESTAMP COMMENT '回复时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted INT DEFAULT 0 COMMENT '删除标记(0-未删除,1-已删除)',
    
    INDEX idx_from_user (from_user_id),
    INDEX idx_to_user (to_user_id),
    INDEX idx_task (task_id),
    INDEX idx_project (project_id),
    INDEX idx_type (feedback_type),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='工作反馈表';

-- =====================================================
-- 13. 进度汇报表 (progress_report)
-- =====================================================
CREATE TABLE IF NOT EXISTS progress_report (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    project_id BIGINT NOT NULL COMMENT '关联项目ID',
    department_task_id BIGINT COMMENT '关联部门任务ID',
    report_type VARCHAR(20) NOT NULL COMMENT '汇报类型(daily/weekly/milestone/adhoc)',
    reporter_id BIGINT NOT NULL COMMENT '汇报人ID',
    report_period_start DATE COMMENT '汇报周期开始',
    report_period_end DATE COMMENT '汇报周期结束',
    completed_work TEXT COMMENT '已完成工作',
    planned_work TEXT COMMENT '计划工作',
    issues_risks TEXT COMMENT '问题与风险',
    support_needed TEXT COMMENT '需要的支持',
    task_progress JSON COMMENT '关联任务进度快照',
    recipients JSON COMMENT '汇报接收人ID列表',
    status VARCHAR(20) DEFAULT 'draft' COMMENT '状态(draft/submitted/read)',
    submitted_at TIMESTAMP COMMENT '提交时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted INT DEFAULT 0 COMMENT '删除标记(0-未删除,1-已删除)',
    
    INDEX idx_project (project_id),
    INDEX idx_department_task (department_task_id),
    INDEX idx_reporter (reporter_id),
    INDEX idx_type (report_type),
    INDEX idx_period (report_period_start, report_period_end),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='进度汇报表';

-- =====================================================
-- 14. 更新通知表 (notification) - 添加新字段
-- =====================================================
ALTER TABLE notification 
ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'medium' COMMENT '优先级(low/medium/high/urgent)',
ADD COLUMN IF NOT EXISTS source_type VARCHAR(50) COMMENT '来源类型(task/feedback/comment等)',
ADD COLUMN IF NOT EXISTS source_id BIGINT COMMENT '来源ID',
ADD COLUMN IF NOT EXISTS channels JSON COMMENT '发送渠道记录';

-- =====================================================
-- 15. 部门任务附件表 (department_task_attachment)
-- =====================================================
CREATE TABLE IF NOT EXISTS department_task_attachment (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    department_task_id BIGINT NOT NULL COMMENT '所属部门任务ID',
    file_name VARCHAR(255) NOT NULL COMMENT '文件名',
    file_url VARCHAR(500) NOT NULL COMMENT '文件URL',
    file_size BIGINT COMMENT '文件大小(字节)',
    file_type VARCHAR(50) COMMENT '文件类型',
    description VARCHAR(500) COMMENT '文件说明',
    uploaded_by BIGINT NOT NULL COMMENT '上传人ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted INT DEFAULT 0 COMMENT '删除标记(0-未删除,1-已删除)',
    
    INDEX idx_department_task (department_task_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='部门任务附件表';

-- =====================================================
-- 16. 项目部门关联表 (project_department)
-- =====================================================
CREATE TABLE IF NOT EXISTS project_department (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    project_id BIGINT NOT NULL COMMENT '项目ID',
    department_id BIGINT NOT NULL COMMENT '部门ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE KEY uk_project_department (project_id, department_id),
    INDEX idx_project (project_id),
    INDEX idx_department (department_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='项目部门关联表';

-- =====================================================
-- 完成
-- =====================================================
SELECT 'V2.0 项目协同模块数据库迁移完成！' AS message;