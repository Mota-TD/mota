-- =====================================================
-- Mota 项目管理系统 - 单库设计数据库初始化脚本
-- 版本: V1.0
-- 说明: 单库设计的备选方案，所有表放在 mota_project 数据库中
-- 使用方法: docker exec -i mota-mysql mysql -uroot -proot123 mota_project < sql/init-db-single.sql
-- 注意: 推荐使用 docker/init-db.sql 的微服务多库设计
-- =====================================================

-- 设置字符集
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET character_set_connection=utf8mb4;

-- =====================================================
-- Mota 项目管理系统 - 基础表结构
-- =====================================================

-- =====================================================
-- 1. 用户表 (sys_user)
-- =====================================================
CREATE TABLE IF NOT EXISTS sys_user (
    id BIGINT PRIMARY KEY COMMENT '主键ID',
    username VARCHAR(50) NOT NULL COMMENT '用户名',
    email VARCHAR(100) COMMENT '邮箱',
    phone VARCHAR(20) COMMENT '手机号',
    password_hash VARCHAR(255) NOT NULL COMMENT '密码哈希',
    nickname VARCHAR(100) COMMENT '昵称',
    avatar VARCHAR(500) COMMENT '头像URL',
    status INT DEFAULT 1 COMMENT '状态（0-禁用，1-启用）',
    enterprise_id BIGINT COMMENT '企业ID',
    org_id VARCHAR(50) COMMENT '组织ID',
    org_name VARCHAR(100) COMMENT '组织名称',
    role VARCHAR(50) COMMENT '角色',
    department_id BIGINT COMMENT '部门ID',
    department_name VARCHAR(100) COMMENT '部门名称',
    last_login_at DATETIME COMMENT '最后登录时间',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    created_by BIGINT COMMENT '创建人ID',
    updated_by BIGINT COMMENT '更新人ID',
    deleted INT DEFAULT 0 COMMENT '删除标记（0-未删除，1-已删除）',
    version INT DEFAULT 0 COMMENT '乐观锁版本号',
    
    UNIQUE KEY uk_username (username),
    UNIQUE KEY uk_email (email),
    INDEX idx_org_id (org_id),
    INDEX idx_department_id (department_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- =====================================================
-- 2. 项目表 (project)
-- =====================================================
CREATE TABLE IF NOT EXISTS project (
    id BIGINT PRIMARY KEY COMMENT '主键ID',
    org_id VARCHAR(50) NOT NULL COMMENT '组织ID',
    name VARCHAR(200) NOT NULL COMMENT '项目名称',
    `key` VARCHAR(50) COMMENT '项目标识',
    description TEXT COMMENT '项目描述',
    status VARCHAR(30) DEFAULT 'planning' COMMENT '状态(planning/active/completed/suspended/cancelled/archived)',
    owner_id BIGINT NOT NULL COMMENT '负责人ID',
    color VARCHAR(20) COMMENT '颜色',
    starred INT DEFAULT 0 COMMENT '是否收藏（0-否，1-是）',
    progress INT DEFAULT 0 COMMENT '进度（0-100）',
    member_count INT DEFAULT 0 COMMENT '成员数量',
    issue_count INT DEFAULT 0 COMMENT '任务数量',
    start_date DATE COMMENT '项目开始日期',
    end_date DATE COMMENT '项目结束日期',
    priority VARCHAR(20) DEFAULT 'medium' COMMENT '优先级(low/medium/high/urgent)',
    archived_at DATETIME COMMENT '归档时间',
    archived_by BIGINT COMMENT '归档人ID',
    visibility VARCHAR(20) DEFAULT 'private' COMMENT '可见性(private/internal/public)',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    created_by BIGINT COMMENT '创建人ID',
    updated_by BIGINT COMMENT '更新人ID',
    deleted INT DEFAULT 0 COMMENT '删除标记（0-未删除，1-已删除）',
    version INT DEFAULT 0 COMMENT '乐观锁版本号',
    
    INDEX idx_org_id (org_id),
    INDEX idx_owner_id (owner_id),
    INDEX idx_status (status),
    INDEX idx_priority (priority)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='项目表';

-- =====================================================
-- 3. 项目成员表 (project_member)
-- =====================================================
CREATE TABLE IF NOT EXISTS project_member (
    id BIGINT PRIMARY KEY COMMENT '主键ID',
    project_id BIGINT NOT NULL COMMENT '项目ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    role VARCHAR(30) DEFAULT 'member' COMMENT '项目角色(owner/department_manager/member/viewer)',
    department_id BIGINT COMMENT '所属部门ID',
    joined_at DATETIME COMMENT '加入时间',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    created_by BIGINT COMMENT '创建人ID',
    updated_by BIGINT COMMENT '更新人ID',
    deleted INT DEFAULT 0 COMMENT '删除标记（0-未删除，1-已删除）',
    version INT DEFAULT 0 COMMENT '乐观锁版本号',
    
    UNIQUE KEY uk_project_user (project_id, user_id),
    INDEX idx_project_id (project_id),
    INDEX idx_user_id (user_id),
    INDEX idx_department_id (department_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='项目成员表';

-- =====================================================
-- 4. 通知表 (notification)
-- =====================================================
CREATE TABLE IF NOT EXISTS notification (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    type VARCHAR(50) NOT NULL COMMENT '通知类型',
    category VARCHAR(30) COMMENT '通知分类(task/project/comment/system/reminder/plan/feedback)',
    title VARCHAR(200) COMMENT '标题',
    content TEXT COMMENT '内容',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    is_read INT DEFAULT 0 COMMENT '是否已读（0-未读，1-已读）',
    is_pinned INT DEFAULT 0 COMMENT '是否置顶（0-否，1-是）',
    is_collapsed INT DEFAULT 0 COMMENT '是否折叠（0-否，1-是）',
    related_id BIGINT COMMENT '关联ID',
    related_type VARCHAR(50) COMMENT '关联类型(task/project/comment/milestone)',
    group_key VARCHAR(100) COMMENT '聚合分组键',
    aggregated_count INT DEFAULT 1 COMMENT '聚合计数',
    priority VARCHAR(20) DEFAULT 'normal' COMMENT '优先级(low/normal/high/urgent)',
    ai_classification VARCHAR(30) COMMENT 'AI分类(important/normal/low_priority/spam)',
    ai_score INT COMMENT 'AI重要性评分(0-100)',
    sender_id BIGINT COMMENT '发送者ID',
    sender_name VARCHAR(100) COMMENT '发送者名称',
    sender_avatar VARCHAR(500) COMMENT '发送者头像',
    project_id BIGINT COMMENT '项目ID',
    project_name VARCHAR(200) COMMENT '项目名称',
    action_url VARCHAR(500) COMMENT '操作URL',
    extra_data JSON COMMENT '额外数据',
    email_sent INT DEFAULT 0 COMMENT '是否已发送邮件（0-否，1-是）',
    email_sent_at DATETIME COMMENT '邮件发送时间',
    push_sent INT DEFAULT 0 COMMENT '是否已发送推送（0-否，1-是）',
    push_sent_at DATETIME COMMENT '推送发送时间',
    source_type VARCHAR(50) COMMENT '来源类型',
    source_id BIGINT COMMENT '来源ID',
    channels JSON COMMENT '发送渠道记录',
    is_aggregated INT DEFAULT 0 COMMENT '是否已聚合（0-否，1-是）',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    
    INDEX idx_user_id (user_id),
    INDEX idx_type (type),
    INDEX idx_category (category),
    INDEX idx_is_read (is_read),
    INDEX idx_project_id (project_id),
    INDEX idx_group_key (group_key),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='通知表';

-- =====================================================
-- 5. 活动动态表 (activity)
-- =====================================================
CREATE TABLE IF NOT EXISTS activity (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    type VARCHAR(50) NOT NULL COMMENT '活动类型',
    action VARCHAR(200) COMMENT '动作描述',
    target VARCHAR(500) COMMENT '目标名称',
    target_id BIGINT COMMENT '目标ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    project_id BIGINT COMMENT '项目ID',
    time VARCHAR(50) COMMENT '时间描述',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    
    INDEX idx_user_id (user_id),
    INDEX idx_project_id (project_id),
    INDEX idx_type (type),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='活动动态表';

-- =====================================================
-- 6. AI历史记录表 (ai_history)
-- =====================================================
CREATE TABLE IF NOT EXISTS ai_history (
    id VARCHAR(64) PRIMARY KEY COMMENT '主键ID',
    title VARCHAR(200) COMMENT '标题',
    type VARCHAR(50) COMMENT '类型',
    status VARCHAR(30) COMMENT '状态',
    creator VARCHAR(100) COMMENT '创建者名称',
    creator_id BIGINT COMMENT '创建者ID',
    content LONGTEXT COMMENT '内容',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    
    INDEX idx_creator_id (creator_id),
    INDEX idx_type (type),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI历史记录表';

-- =====================================================
-- 7. AI新闻表 (ai_news)
-- =====================================================
CREATE TABLE IF NOT EXISTS ai_news (
    id VARCHAR(64) PRIMARY KEY COMMENT '主键ID',
    title VARCHAR(500) NOT NULL COMMENT '标题',
    summary TEXT COMMENT '摘要',
    content LONGTEXT COMMENT '内容',
    source VARCHAR(100) COMMENT '来源',
    source_icon VARCHAR(100) COMMENT '来源图标',
    publish_time VARCHAR(50) COMMENT '发布时间',
    category VARCHAR(50) COMMENT '分类',
    tags JSON COMMENT '标签',
    url VARCHAR(1000) COMMENT '链接',
    is_starred INT DEFAULT 0 COMMENT '是否收藏（0-否，1-是）',
    relevance INT DEFAULT 0 COMMENT '相关度',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    
    INDEX idx_category (category),
    INDEX idx_is_starred (is_starred),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI新闻表';

-- =====================================================
-- 8. 日历配置表 (calendar_config)
-- =====================================================
CREATE TABLE IF NOT EXISTS calendar_config (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    calendar_type VARCHAR(30) NOT NULL COMMENT '日历类型(personal/team/project/task)',
    name VARCHAR(100) COMMENT '日历名称',
    color VARCHAR(20) COMMENT '日历颜色',
    visible TINYINT(1) DEFAULT 1 COMMENT '是否可见',
    is_default TINYINT(1) DEFAULT 0 COMMENT '是否默认日历',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    
    INDEX idx_user_id (user_id),
    INDEX idx_calendar_type (calendar_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='日历配置表';

-- =====================================================
-- 9. 日历订阅表 (calendar_subscription)
-- =====================================================
CREATE TABLE IF NOT EXISTS calendar_subscription (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    name VARCHAR(100) NOT NULL COMMENT '订阅名称',
    url VARCHAR(1000) NOT NULL COMMENT '订阅URL(iCal格式)',
    color VARCHAR(20) COMMENT '日历颜色',
    sync_interval INT DEFAULT 60 COMMENT '同步间隔（分钟）',
    last_sync_at DATETIME COMMENT '最后同步时间',
    status VARCHAR(20) DEFAULT 'active' COMMENT '状态(active/error/paused)',
    error_message TEXT COMMENT '错误信息',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    
    INDEX idx_user_id (user_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='日历订阅表';

-- =====================================================
-- 10. 文档收藏表 (document_favorite)
-- =====================================================
CREATE TABLE IF NOT EXISTS document_favorite (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    document_id BIGINT NOT NULL COMMENT '文档ID',
    folder_name VARCHAR(100) COMMENT '收藏夹分类名称',
    note TEXT COMMENT '收藏备注',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '收藏时间',
    
    UNIQUE KEY uk_user_document (user_id, document_id),
    INDEX idx_user_id (user_id),
    INDEX idx_document_id (document_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文档收藏表';

-- =====================================================
-- 11. 迭代表 (sprint) - 用于敏捷开发
-- =====================================================
CREATE TABLE IF NOT EXISTS sprint (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    project_id BIGINT NOT NULL COMMENT '项目ID',
    name VARCHAR(200) NOT NULL COMMENT '迭代名称',
    goal TEXT COMMENT '迭代目标',
    status VARCHAR(30) DEFAULT 'planning' COMMENT '状态(planning/active/completed)',
    start_date DATE COMMENT '开始日期',
    end_date DATE COMMENT '结束日期',
    total_points INT DEFAULT 0 COMMENT '总故事点数',
    completed_points INT DEFAULT 0 COMMENT '已完成故事点数',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    created_by BIGINT COMMENT '创建人ID',
    updated_by BIGINT COMMENT '更新人ID',
    deleted INT DEFAULT 0 COMMENT '删除标记（0-未删除，1-已删除）',
    version INT DEFAULT 0 COMMENT '乐观锁版本号',
    
    INDEX idx_project_id (project_id),
    INDEX idx_status (status),
    INDEX idx_start_date (start_date),
    INDEX idx_end_date (end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='迭代表';

-- =====================================================
-- 12. 事项/问题表 (issue) - 用于任务跟踪
-- =====================================================
CREATE TABLE IF NOT EXISTS issue (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    project_id BIGINT NOT NULL COMMENT '项目ID',
    issue_key VARCHAR(50) NOT NULL COMMENT '事项标识(如PROJ-123)',
    type VARCHAR(30) NOT NULL COMMENT '类型(story/task/bug/epic)',
    title VARCHAR(500) NOT NULL COMMENT '标题',
    description TEXT COMMENT '描述',
    status VARCHAR(30) DEFAULT 'open' COMMENT '状态(open/in_progress/done/closed)',
    priority VARCHAR(20) DEFAULT 'medium' COMMENT '优先级(lowest/low/medium/high/highest)',
    assignee_id BIGINT COMMENT '负责人ID',
    reporter_id BIGINT COMMENT '报告人ID',
    parent_id BIGINT COMMENT '父事项ID',
    sprint_id BIGINT COMMENT '迭代ID',
    story_points INT COMMENT '故事点数',
    estimated_hours DECIMAL(10,2) COMMENT '预估工时',
    actual_hours DECIMAL(10,2) COMMENT '实际工时',
    due_date DATE COMMENT '截止日期',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    created_by BIGINT COMMENT '创建人ID',
    updated_by BIGINT COMMENT '更新人ID',
    deleted INT DEFAULT 0 COMMENT '删除标记（0-未删除，1-已删除）',
    version INT DEFAULT 0 COMMENT '乐观锁版本号',
    
    UNIQUE KEY uk_issue_key (project_id, issue_key),
    INDEX idx_project_id (project_id),
    INDEX idx_sprint_id (sprint_id),
    INDEX idx_assignee_id (assignee_id),
    INDEX idx_reporter_id (reporter_id),
    INDEX idx_status (status),
    INDEX idx_type (type),
    INDEX idx_priority (priority)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='事项/问题表';

-- =====================================================
-- 13. Wiki文档表 (wiki_document)
-- =====================================================
CREATE TABLE IF NOT EXISTS wiki_document (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    project_id BIGINT COMMENT '项目ID',
    title VARCHAR(500) NOT NULL COMMENT '文档标题',
    content LONGTEXT COMMENT '文档内容',
    parent_id BIGINT COMMENT '父文档ID',
    sort INT DEFAULT 0 COMMENT '排序',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    created_by BIGINT COMMENT '创建人ID',
    updated_by BIGINT COMMENT '更新人ID',
    deleted INT DEFAULT 0 COMMENT '删除标记（0-未删除，1-已删除）',
    version INT DEFAULT 0 COMMENT '乐观锁版本号',
    
    INDEX idx_project_id (project_id),
    INDEX idx_parent_id (parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Wiki文档表';

-- =====================================================
-- 14. 项目附件表 (project_attachment)
-- =====================================================
CREATE TABLE IF NOT EXISTS project_attachment (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    project_id BIGINT NOT NULL COMMENT '项目ID',
    file_name VARCHAR(255) NOT NULL COMMENT '文件名',
    file_url VARCHAR(500) NOT NULL COMMENT '文件URL',
    file_size BIGINT COMMENT '文件大小(字节)',
    file_type VARCHAR(50) COMMENT '文件类型',
    description VARCHAR(500) COMMENT '文件说明',
    uploaded_by BIGINT NOT NULL COMMENT '上传人ID',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    deleted INT DEFAULT 0 COMMENT '删除标记（0-未删除，1-已删除）',
    
    INDEX idx_project_id (project_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='项目附件表';

-- =====================================================
-- 完成
-- =====================================================
SELECT 'V1.0 基础表结构创建完成！' AS message;-- =====================================================
-- Mota 项目协同模块 V2.0 - 数据库迁移脚本
-- 新增部门任务、工作计划、执行任务等表结构
-- 创建日期: 2025-12-23
-- =====================================================

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
SELECT 'V2.0 项目协同模块数据库迁移完成！' AS message;-- =====================================================
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
SELECT 'V3.0 任务依赖和子任务功能数据库迁移完成！' AS message;-- =====================================================
-- V4.0 文档协作功能数据库设计
-- 包含：文档管理、版本控制、协作编辑、模板库
-- =====================================================

-- 1. 文档表
CREATE TABLE IF NOT EXISTS document (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL COMMENT '文档标题',
    content LONGTEXT COMMENT '文档内容（Markdown/HTML）',
    content_type VARCHAR(20) DEFAULT 'markdown' COMMENT '内容类型: markdown, richtext, html',
    summary VARCHAR(500) COMMENT '文档摘要',
    cover_image VARCHAR(500) COMMENT '封面图片URL',
    
    -- 关联信息
    project_id BIGINT COMMENT '所属项目ID',
    folder_id BIGINT COMMENT '所属文件夹ID',
    creator_id BIGINT NOT NULL COMMENT '创建者ID',
    
    -- 文档状态
    status VARCHAR(20) DEFAULT 'draft' COMMENT '状态: draft, published, archived',
    is_template TINYINT(1) DEFAULT 0 COMMENT '是否为模板',
    template_category VARCHAR(50) COMMENT '模板分类',
    
    -- 权限设置
    visibility VARCHAR(20) DEFAULT 'project' COMMENT '可见性: private, project, public',
    allow_comments TINYINT(1) DEFAULT 1 COMMENT '是否允许评论',
    allow_edit TINYINT(1) DEFAULT 1 COMMENT '是否允许编辑',
    
    -- 统计信息
    view_count INT DEFAULT 0 COMMENT '浏览次数',
    like_count INT DEFAULT 0 COMMENT '点赞次数',
    comment_count INT DEFAULT 0 COMMENT '评论数量',
    
    -- 版本信息
    current_version INT DEFAULT 1 COMMENT '当前版本号',
    
    -- 时间戳
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    published_at DATETIME COMMENT '发布时间',
    
    INDEX idx_project_id (project_id),
    INDEX idx_folder_id (folder_id),
    INDEX idx_creator_id (creator_id),
    INDEX idx_status (status),
    INDEX idx_is_template (is_template),
    INDEX idx_template_category (template_category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='文档表';

-- 2. 文档文件夹表
CREATE TABLE IF NOT EXISTS document_folder (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL COMMENT '文件夹名称',
    parent_id BIGINT COMMENT '父文件夹ID',
    project_id BIGINT COMMENT '所属项目ID',
    creator_id BIGINT NOT NULL COMMENT '创建者ID',
    sort_order INT DEFAULT 0 COMMENT '排序顺序',
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_parent_id (parent_id),
    INDEX idx_project_id (project_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='文档文件夹表';

-- 3. 文档版本表
CREATE TABLE IF NOT EXISTS document_version (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    document_id BIGINT NOT NULL COMMENT '文档ID',
    version_number INT NOT NULL COMMENT '版本号',
    title VARCHAR(255) NOT NULL COMMENT '版本标题',
    content LONGTEXT COMMENT '版本内容',
    change_summary VARCHAR(500) COMMENT '变更摘要',
    
    -- 编辑者信息
    editor_id BIGINT NOT NULL COMMENT '编辑者ID',
    editor_name VARCHAR(100) COMMENT '编辑者名称',
    
    -- 版本类型
    version_type VARCHAR(20) DEFAULT 'minor' COMMENT '版本类型: major, minor, patch, auto',
    
    -- 内容差异
    diff_content LONGTEXT COMMENT '与上一版本的差异（JSON格式）',
    content_hash VARCHAR(64) COMMENT '内容哈希值',
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_document_id (document_id),
    INDEX idx_version_number (document_id, version_number),
    INDEX idx_editor_id (editor_id),
    UNIQUE KEY uk_document_version (document_id, version_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='文档版本表';

-- 4. 文档协作者表
CREATE TABLE IF NOT EXISTS document_collaborator (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    document_id BIGINT NOT NULL COMMENT '文档ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    permission VARCHAR(20) DEFAULT 'view' COMMENT '权限: view, comment, edit, admin',
    
    -- 协作状态
    is_online TINYINT(1) DEFAULT 0 COMMENT '是否在线编辑',
    last_active_at DATETIME COMMENT '最后活跃时间',
    cursor_position INT COMMENT '光标位置',
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_document_id (document_id),
    INDEX idx_user_id (user_id),
    UNIQUE KEY uk_document_user (document_id, user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='文档协作者表';

-- 5. 文档评论表
CREATE TABLE IF NOT EXISTS document_comment (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    document_id BIGINT NOT NULL COMMENT '文档ID',
    parent_id BIGINT COMMENT '父评论ID（用于回复）',
    user_id BIGINT NOT NULL COMMENT '评论者ID',
    user_name VARCHAR(100) COMMENT '评论者名称',
    user_avatar VARCHAR(500) COMMENT '评论者头像',
    
    content TEXT NOT NULL COMMENT '评论内容',
    
    -- 批注位置（用于行内批注）
    selection_start INT COMMENT '选中开始位置',
    selection_end INT COMMENT '选中结束位置',
    selected_text TEXT COMMENT '选中的文本',
    
    -- 状态
    status VARCHAR(20) DEFAULT 'active' COMMENT '状态: active, resolved, deleted',
    is_resolved TINYINT(1) DEFAULT 0 COMMENT '是否已解决',
    resolved_by BIGINT COMMENT '解决者ID',
    resolved_at DATETIME COMMENT '解决时间',
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_document_id (document_id),
    INDEX idx_parent_id (parent_id),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='文档评论表';

-- 6. 文档操作日志表
CREATE TABLE IF NOT EXISTS document_activity (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    document_id BIGINT NOT NULL COMMENT '文档ID',
    user_id BIGINT NOT NULL COMMENT '操作者ID',
    user_name VARCHAR(100) COMMENT '操作者名称',
    
    action VARCHAR(50) NOT NULL COMMENT '操作类型: create, edit, view, comment, share, delete, restore, publish',
    action_detail TEXT COMMENT '操作详情（JSON格式）',
    
    -- 版本信息
    version_number INT COMMENT '相关版本号',
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_document_id (document_id),
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='文档操作日志表';

-- 7. 文档模板分类表
CREATE TABLE IF NOT EXISTS document_template_category (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL COMMENT '分类名称',
    description VARCHAR(500) COMMENT '分类描述',
    icon VARCHAR(100) COMMENT '分类图标',
    sort_order INT DEFAULT 0 COMMENT '排序顺序',
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='文档模板分类表';

-- 8. 任务模板表
CREATE TABLE IF NOT EXISTS task_template (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL COMMENT '模板名称',
    description VARCHAR(500) COMMENT '模板描述',
    category VARCHAR(50) COMMENT '模板分类',
    
    -- 模板内容（JSON格式）
    template_data TEXT NOT NULL COMMENT '模板数据（包含任务结构、子任务、检查清单等）',
    
    -- 使用统计
    use_count INT DEFAULT 0 COMMENT '使用次数',
    
    -- 权限
    is_public TINYINT(1) DEFAULT 0 COMMENT '是否公开',
    creator_id BIGINT NOT NULL COMMENT '创建者ID',
    project_id BIGINT COMMENT '所属项目ID（项目级模板）',
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_category (category),
    INDEX idx_creator_id (creator_id),
    INDEX idx_project_id (project_id),
    INDEX idx_is_public (is_public)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='任务模板表';

-- 9. 知识图谱节点表
CREATE TABLE IF NOT EXISTS knowledge_node (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(200) NOT NULL COMMENT '节点名称',
    node_type VARCHAR(50) NOT NULL COMMENT '节点类型: concept, entity, document, task, project',
    description TEXT COMMENT '节点描述',
    
    -- 关联信息
    related_id BIGINT COMMENT '关联对象ID',
    related_type VARCHAR(50) COMMENT '关联对象类型',
    
    -- 属性（JSON格式）
    properties TEXT COMMENT '节点属性',
    
    -- 向量嵌入（用于语义搜索）
    embedding_vector TEXT COMMENT '向量嵌入（JSON数组）',
    
    -- 统计
    reference_count INT DEFAULT 0 COMMENT '引用次数',
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_node_type (node_type),
    INDEX idx_related (related_id, related_type),
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='知识图谱节点表';

-- 10. 知识图谱边表（关系）
CREATE TABLE IF NOT EXISTS knowledge_edge (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    source_node_id BIGINT NOT NULL COMMENT '源节点ID',
    target_node_id BIGINT NOT NULL COMMENT '目标节点ID',
    relation_type VARCHAR(50) NOT NULL COMMENT '关系类型: related_to, belongs_to, depends_on, references, similar_to',
    
    -- 关系属性
    weight DECIMAL(5,4) DEFAULT 1.0 COMMENT '关系权重',
    properties TEXT COMMENT '关系属性（JSON格式）',
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_source_node (source_node_id),
    INDEX idx_target_node (target_node_id),
    INDEX idx_relation_type (relation_type),
    UNIQUE KEY uk_edge (source_node_id, target_node_id, relation_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='知识图谱边表';

-- 插入默认模板分类
INSERT INTO document_template_category (name, description, icon, sort_order) VALUES
('项目方案', '项目规划和方案模板', 'ProjectOutlined', 1),
('技术文档', '技术设计和开发文档模板', 'CodeOutlined', 2),
('会议纪要', '会议记录和纪要模板', 'TeamOutlined', 3),
('工作报告', '周报、月报等工作报告模板', 'FileTextOutlined', 4),
('需求文档', '产品需求和功能规格模板', 'BulbOutlined', 5),
('测试文档', '测试计划和测试报告模板', 'BugOutlined', 6);-- =====================================================
-- V5.0 工作流和视图配置功能数据库设计
-- 包含：自定义工作流、状态管理、流转规则、视图配置
-- =====================================================

-- 1. 工作流模板表
CREATE TABLE IF NOT EXISTS workflow_template (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL COMMENT '工作流名称',
    description TEXT COMMENT '工作流描述',
    project_id BIGINT COMMENT '所属项目ID（NULL表示全局模板）',
    is_default TINYINT(1) DEFAULT 0 COMMENT '是否为默认工作流',
    is_system TINYINT(1) DEFAULT 0 COMMENT '是否为系统预设工作流',
    
    -- 创建者信息
    created_by BIGINT COMMENT '创建者ID',
    
    -- 时间戳
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- 软删除
    deleted TINYINT(1) DEFAULT 0 COMMENT '删除标记',
    
    INDEX idx_project_id (project_id),
    INDEX idx_is_default (is_default),
    INDEX idx_created_by (created_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工作流模板表';

-- 2. 工作流状态表
CREATE TABLE IF NOT EXISTS workflow_status (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    workflow_id BIGINT NOT NULL COMMENT '所属工作流ID',
    name VARCHAR(50) NOT NULL COMMENT '状态名称',
    description VARCHAR(200) COMMENT '状态描述',
    color VARCHAR(20) DEFAULT '#1890ff' COMMENT '状态颜色',
    icon VARCHAR(50) COMMENT '状态图标',
    sort_order INT DEFAULT 0 COMMENT '排序顺序',
    is_initial TINYINT(1) DEFAULT 0 COMMENT '是否为初始状态',
    is_final TINYINT(1) DEFAULT 0 COMMENT '是否为终态',
    
    -- 状态类型：todo, in_progress, done, cancelled
    status_type VARCHAR(20) DEFAULT 'todo' COMMENT '状态类型',
    
    -- 时间戳
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_workflow_id (workflow_id),
    INDEX idx_sort_order (sort_order),
    INDEX idx_is_initial (is_initial),
    INDEX idx_is_final (is_final)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工作流状态表';

-- 3. 工作流流转规则表
CREATE TABLE IF NOT EXISTS workflow_transition (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    workflow_id BIGINT NOT NULL COMMENT '所属工作流ID',
    from_status_id BIGINT NOT NULL COMMENT '源状态ID',
    to_status_id BIGINT NOT NULL COMMENT '目标状态ID',
    name VARCHAR(100) COMMENT '流转名称',
    description VARCHAR(200) COMMENT '流转描述',
    
    -- 流转条件（JSON格式）
    conditions TEXT COMMENT '流转条件',
    
    -- 流转动作（JSON格式）
    actions TEXT COMMENT '流转时执行的动作',
    
    -- 权限控制
    allowed_roles TEXT COMMENT '允许执行此流转的角色（JSON数组）',
    
    -- 时间戳
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_workflow_id (workflow_id),
    INDEX idx_from_status (from_status_id),
    INDEX idx_to_status (to_status_id),
    UNIQUE KEY uk_transition (workflow_id, from_status_id, to_status_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工作流流转规则表';

-- 4. 用户视图配置表
CREATE TABLE IF NOT EXISTS user_view_config (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL COMMENT '用户ID',
    view_type VARCHAR(50) NOT NULL COMMENT '视图类型: project, task, calendar, kanban, gantt',
    name VARCHAR(100) NOT NULL COMMENT '视图名称',
    description VARCHAR(200) COMMENT '视图描述',
    
    -- 视图配置（JSON格式）
    config JSON NOT NULL COMMENT '视图配置（筛选条件、排序、列配置等）',
    
    -- 是否为默认视图
    is_default TINYINT(1) DEFAULT 0 COMMENT '是否为默认视图',
    
    -- 是否共享
    is_shared TINYINT(1) DEFAULT 0 COMMENT '是否共享给团队',
    
    -- 关联项目（可选）
    project_id BIGINT COMMENT '关联项目ID',
    
    -- 时间戳
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_user_id (user_id),
    INDEX idx_view_type (view_type),
    INDEX idx_is_default (is_default),
    INDEX idx_project_id (project_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户视图配置表';

-- 5. 项目工作流关联表
CREATE TABLE IF NOT EXISTS project_workflow (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    project_id BIGINT NOT NULL COMMENT '项目ID',
    workflow_id BIGINT NOT NULL COMMENT '工作流ID',
    is_active TINYINT(1) DEFAULT 1 COMMENT '是否激活',
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_project_id (project_id),
    INDEX idx_workflow_id (workflow_id),
    UNIQUE KEY uk_project_workflow (project_id, workflow_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='项目工作流关联表';

-- =====================================================
-- 插入默认工作流数据
-- =====================================================

-- 插入默认工作流模板
INSERT INTO workflow_template (name, description, is_default, is_system, created_by) VALUES
('标准工作流', '适用于大多数项目的标准任务工作流', 1, 1, 1),
('敏捷开发工作流', '适用于敏捷开发团队的工作流', 0, 1, 1),
('简单工作流', '简化的两状态工作流', 0, 1, 1);

-- 获取工作流ID并插入状态
SET @standard_workflow_id = 1;
SET @agile_workflow_id = 2;
SET @simple_workflow_id = 3;

-- 标准工作流状态
INSERT INTO workflow_status (workflow_id, name, description, color, sort_order, is_initial, is_final, status_type) VALUES
(@standard_workflow_id, '待办', '任务待处理', '#909399', 1, 1, 0, 'todo'),
(@standard_workflow_id, '进行中', '任务正在进行', '#409EFF', 2, 0, 0, 'in_progress'),
(@standard_workflow_id, '待审核', '任务待审核', '#E6A23C', 3, 0, 0, 'in_progress'),
(@standard_workflow_id, '已完成', '任务已完成', '#67C23A', 4, 0, 1, 'done'),
(@standard_workflow_id, '已取消', '任务已取消', '#F56C6C', 5, 0, 1, 'cancelled');

-- 敏捷开发工作流状态
INSERT INTO workflow_status (workflow_id, name, description, color, sort_order, is_initial, is_final, status_type) VALUES
(@agile_workflow_id, 'Backlog', '待办事项池', '#909399', 1, 1, 0, 'todo'),
(@agile_workflow_id, 'To Do', '本迭代待办', '#909399', 2, 0, 0, 'todo'),
(@agile_workflow_id, 'In Progress', '开发中', '#409EFF', 3, 0, 0, 'in_progress'),
(@agile_workflow_id, 'Code Review', '代码审查', '#E6A23C', 4, 0, 0, 'in_progress'),
(@agile_workflow_id, 'Testing', '测试中', '#E6A23C', 5, 0, 0, 'in_progress'),
(@agile_workflow_id, 'Done', '已完成', '#67C23A', 6, 0, 1, 'done');

-- 简单工作流状态
INSERT INTO workflow_status (workflow_id, name, description, color, sort_order, is_initial, is_final, status_type) VALUES
(@simple_workflow_id, '未完成', '任务未完成', '#909399', 1, 1, 0, 'todo'),
(@simple_workflow_id, '已完成', '任务已完成', '#67C23A', 2, 0, 1, 'done');

-- 标准工作流流转规则
INSERT INTO workflow_transition (workflow_id, from_status_id, to_status_id, name) VALUES
(1, 1, 2, '开始处理'),
(1, 2, 3, '提交审核'),
(1, 3, 2, '审核退回'),
(1, 3, 4, '审核通过'),
(1, 1, 5, '取消任务'),
(1, 2, 5, '取消任务'),
(1, 2, 1, '暂停任务');

-- 敏捷开发工作流流转规则
INSERT INTO workflow_transition (workflow_id, from_status_id, to_status_id, name) VALUES
(2, 6, 7, '加入迭代'),
(2, 7, 8, '开始开发'),
(2, 8, 9, '提交审查'),
(2, 9, 8, '审查退回'),
(2, 9, 10, '提交测试'),
(2, 10, 8, '测试不通过'),
(2, 10, 11, '测试通过');

-- 简单工作流流转规则
INSERT INTO workflow_transition (workflow_id, from_status_id, to_status_id, name) VALUES
(3, 12, 13, '完成'),
(3, 13, 12, '重新打开');

-- =====================================================
-- 插入默认视图配置示例
-- =====================================================

INSERT INTO user_view_config (user_id, view_type, name, description, config, is_default) VALUES
(1, 'project', '所有项目', '显示所有项目', '{"filters": {}, "sort": {"field": "updatedAt", "order": "desc"}, "columns": ["name", "status", "progress", "owner", "dueDate"]}', 1),
(1, 'project', '进行中项目', '只显示进行中的项目', '{"filters": {"status": ["active"]}, "sort": {"field": "updatedAt", "order": "desc"}, "columns": ["name", "progress", "owner", "dueDate"]}', 0),
(1, 'task', '我的任务', '分配给我的任务', '{"filters": {"assignee": "me"}, "sort": {"field": "priority", "order": "desc"}, "columns": ["name", "status", "priority", "dueDate"]}', 1),
(1, 'task', '高优先级任务', '高优先级和紧急任务', '{"filters": {"priority": ["high", "urgent"]}, "sort": {"field": "dueDate", "order": "asc"}, "columns": ["name", "status", "assignee", "dueDate"]}', 0);-- =====================================================
-- V8.0 知识使用统计功能数据库设计
-- 包含：访问统计、热门排行、访问趋势、复用率、搜索热词、知识缺口
-- =====================================================

-- 1. 文档访问记录表
CREATE TABLE IF NOT EXISTS document_access_log (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    document_id BIGINT NOT NULL COMMENT '文档ID',
    user_id BIGINT NOT NULL COMMENT '访问用户ID',
    project_id BIGINT COMMENT '项目ID',
    
    -- 访问信息
    access_type VARCHAR(20) DEFAULT 'view' COMMENT '访问类型: view, download, share, copy, reference',
    access_source VARCHAR(50) COMMENT '访问来源: search, direct, recommendation, link',
    duration_seconds INT DEFAULT 0 COMMENT '停留时长（秒）',
    
    -- 设备信息
    device_type VARCHAR(20) COMMENT '设备类型: desktop, mobile, tablet',
    browser VARCHAR(50) COMMENT '浏览器',
    ip_address VARCHAR(50) COMMENT 'IP地址',
    
    -- 时间信息
    access_date DATE NOT NULL COMMENT '访问日期',
    access_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '访问时间',
    
    INDEX idx_document_id (document_id),
    INDEX idx_user_id (user_id),
    INDEX idx_project_id (project_id),
    INDEX idx_access_date (access_date),
    INDEX idx_access_type (access_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='文档访问记录表';

-- 2. 文档统计汇总表（按天汇总）
CREATE TABLE IF NOT EXISTS document_stats_daily (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    document_id BIGINT NOT NULL COMMENT '文档ID',
    stats_date DATE NOT NULL COMMENT '统计日期',
    
    -- 访问统计
    view_count INT DEFAULT 0 COMMENT '浏览次数',
    unique_visitors INT DEFAULT 0 COMMENT '独立访客数',
    download_count INT DEFAULT 0 COMMENT '下载次数',
    share_count INT DEFAULT 0 COMMENT '分享次数',
    copy_count INT DEFAULT 0 COMMENT '复制次数',
    reference_count INT DEFAULT 0 COMMENT '引用次数',
    
    -- 时长统计
    total_duration_seconds BIGINT DEFAULT 0 COMMENT '总停留时长（秒）',
    avg_duration_seconds INT DEFAULT 0 COMMENT '平均停留时长（秒）',
    
    -- 来源统计
    search_visits INT DEFAULT 0 COMMENT '搜索访问次数',
    direct_visits INT DEFAULT 0 COMMENT '直接访问次数',
    recommendation_visits INT DEFAULT 0 COMMENT '推荐访问次数',
    link_visits INT DEFAULT 0 COMMENT '链接访问次数',
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY uk_document_date (document_id, stats_date),
    INDEX idx_stats_date (stats_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='文档统计汇总表（按天）';

-- 3. 搜索记录表
CREATE TABLE IF NOT EXISTS search_log (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT COMMENT '搜索用户ID',
    project_id BIGINT COMMENT '项目ID',
    
    -- 搜索信息
    keyword VARCHAR(200) NOT NULL COMMENT '搜索关键词',
    search_type VARCHAR(20) DEFAULT 'document' COMMENT '搜索类型: document, knowledge, all',
    result_count INT DEFAULT 0 COMMENT '搜索结果数量',
    
    -- 点击信息
    clicked_document_id BIGINT COMMENT '点击的文档ID',
    click_position INT COMMENT '点击位置（排名）',
    
    -- 时间信息
    search_date DATE NOT NULL COMMENT '搜索日期',
    search_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '搜索时间',
    
    INDEX idx_user_id (user_id),
    INDEX idx_project_id (project_id),
    INDEX idx_keyword (keyword),
    INDEX idx_search_date (search_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='搜索记录表';

-- 4. 搜索热词统计表（按天汇总）
CREATE TABLE IF NOT EXISTS search_keyword_stats (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    keyword VARCHAR(200) NOT NULL COMMENT '搜索关键词',
    project_id BIGINT COMMENT '项目ID（NULL表示全局）',
    stats_date DATE NOT NULL COMMENT '统计日期',
    
    -- 统计数据
    search_count INT DEFAULT 0 COMMENT '搜索次数',
    unique_users INT DEFAULT 0 COMMENT '独立用户数',
    click_count INT DEFAULT 0 COMMENT '点击次数',
    avg_result_count DECIMAL(10,2) DEFAULT 0 COMMENT '平均结果数',
    
    -- 点击率
    click_rate DECIMAL(5,4) DEFAULT 0 COMMENT '点击率',
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY uk_keyword_project_date (keyword, project_id, stats_date),
    INDEX idx_stats_date (stats_date),
    INDEX idx_search_count (search_count DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='搜索热词统计表';

-- 5. 知识复用记录表
CREATE TABLE IF NOT EXISTS knowledge_reuse_log (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    source_document_id BIGINT NOT NULL COMMENT '源文档ID',
    target_document_id BIGINT COMMENT '目标文档ID',
    target_task_id BIGINT COMMENT '目标任务ID',
    target_project_id BIGINT COMMENT '目标项目ID',
    user_id BIGINT NOT NULL COMMENT '复用用户ID',
    
    -- 复用信息
    reuse_type VARCHAR(20) NOT NULL COMMENT '复用类型: copy, reference, template, quote',
    reuse_content TEXT COMMENT '复用内容摘要',
    content_length INT DEFAULT 0 COMMENT '复用内容长度',
    
    -- 时间信息
    reuse_date DATE NOT NULL COMMENT '复用日期',
    reuse_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '复用时间',
    
    INDEX idx_source_document (source_document_id),
    INDEX idx_target_document (target_document_id),
    INDEX idx_user_id (user_id),
    INDEX idx_reuse_date (reuse_date),
    INDEX idx_reuse_type (reuse_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='知识复用记录表';

-- 6. 知识复用统计表（按文档汇总）
CREATE TABLE IF NOT EXISTS knowledge_reuse_stats (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    document_id BIGINT NOT NULL COMMENT '文档ID',
    stats_month VARCHAR(7) NOT NULL COMMENT '统计月份（YYYY-MM）',
    
    -- 复用统计
    total_reuse_count INT DEFAULT 0 COMMENT '总复用次数',
    copy_count INT DEFAULT 0 COMMENT '复制次数',
    reference_count INT DEFAULT 0 COMMENT '引用次数',
    template_count INT DEFAULT 0 COMMENT '模板使用次数',
    quote_count INT DEFAULT 0 COMMENT '引述次数',
    
    -- 复用用户
    unique_users INT DEFAULT 0 COMMENT '独立复用用户数',
    
    -- 复用率
    reuse_rate DECIMAL(5,4) DEFAULT 0 COMMENT '复用率（复用次数/访问次数）',
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY uk_document_month (document_id, stats_month),
    INDEX idx_stats_month (stats_month),
    INDEX idx_reuse_count (total_reuse_count DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='知识复用统计表';

-- 7. 知识缺口记录表
CREATE TABLE IF NOT EXISTS knowledge_gap (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    project_id BIGINT COMMENT '项目ID',
    
    -- 缺口信息
    gap_type VARCHAR(20) NOT NULL COMMENT '缺口类型: search_no_result, frequent_question, missing_topic',
    keyword VARCHAR(200) COMMENT '相关关键词',
    description TEXT COMMENT '缺口描述',
    
    -- 统计信息
    occurrence_count INT DEFAULT 1 COMMENT '出现次数',
    affected_users INT DEFAULT 1 COMMENT '影响用户数',
    
    -- 状态
    status VARCHAR(20) DEFAULT 'open' COMMENT '状态: open, in_progress, resolved, ignored',
    priority VARCHAR(10) DEFAULT 'medium' COMMENT '优先级: low, medium, high, critical',
    
    -- 解决信息
    resolved_by BIGINT COMMENT '解决者ID',
    resolved_document_id BIGINT COMMENT '解决文档ID',
    resolved_at DATETIME COMMENT '解决时间',
    resolution_note TEXT COMMENT '解决说明',
    
    -- 时间信息
    first_occurred_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '首次出现时间',
    last_occurred_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '最后出现时间',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_project_id (project_id),
    INDEX idx_gap_type (gap_type),
    INDEX idx_status (status),
    INDEX idx_priority (priority),
    INDEX idx_occurrence_count (occurrence_count DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='知识缺口记录表';

-- 8. 知识统计概览表（项目级别）
CREATE TABLE IF NOT EXISTS knowledge_stats_overview (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    project_id BIGINT COMMENT '项目ID（NULL表示全局）',
    stats_date DATE NOT NULL COMMENT '统计日期',
    
    -- 文档统计
    total_documents INT DEFAULT 0 COMMENT '总文档数',
    new_documents INT DEFAULT 0 COMMENT '新增文档数',
    updated_documents INT DEFAULT 0 COMMENT '更新文档数',
    
    -- 访问统计
    total_views INT DEFAULT 0 COMMENT '总浏览量',
    unique_visitors INT DEFAULT 0 COMMENT '独立访客数',
    avg_duration_seconds INT DEFAULT 0 COMMENT '平均停留时长',
    
    -- 搜索统计
    total_searches INT DEFAULT 0 COMMENT '总搜索次数',
    search_success_rate DECIMAL(5,4) DEFAULT 0 COMMENT '搜索成功率',
    
    -- 复用统计
    total_reuses INT DEFAULT 0 COMMENT '总复用次数',
    reuse_rate DECIMAL(5,4) DEFAULT 0 COMMENT '整体复用率',
    
    -- 知识缺口
    open_gaps INT DEFAULT 0 COMMENT '未解决缺口数',
    resolved_gaps INT DEFAULT 0 COMMENT '已解决缺口数',
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY uk_project_date (project_id, stats_date),
    INDEX idx_stats_date (stats_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='知识统计概览表';

-- 9. 热门文档排行表（缓存表，定期更新）
CREATE TABLE IF NOT EXISTS document_ranking (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    document_id BIGINT NOT NULL COMMENT '文档ID',
    project_id BIGINT COMMENT '项目ID',
    ranking_type VARCHAR(20) NOT NULL COMMENT '排行类型: daily, weekly, monthly, all_time',
    ranking_date DATE NOT NULL COMMENT '排行日期',
    
    -- 排名信息
    rank_position INT NOT NULL COMMENT '排名位置',
    score DECIMAL(15,4) DEFAULT 0 COMMENT '综合得分',
    
    -- 统计数据
    view_count INT DEFAULT 0 COMMENT '浏览次数',
    unique_visitors INT DEFAULT 0 COMMENT '独立访客数',
    reuse_count INT DEFAULT 0 COMMENT '复用次数',
    like_count INT DEFAULT 0 COMMENT '点赞数',
    comment_count INT DEFAULT 0 COMMENT '评论数',
    
    -- 变化趋势
    rank_change INT DEFAULT 0 COMMENT '排名变化（正数上升，负数下降）',
    view_change_rate DECIMAL(5,4) DEFAULT 0 COMMENT '浏览量变化率',
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY uk_document_type_date (document_id, ranking_type, ranking_date),
    INDEX idx_ranking_type_date (ranking_type, ranking_date),
    INDEX idx_rank_position (rank_position),
    INDEX idx_project_id (project_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='热门文档排行表';

-- 插入一些测试数据
INSERT INTO knowledge_gap (project_id, gap_type, keyword, description, occurrence_count, affected_users, priority) VALUES
(1, 'search_no_result', 'API接口文档', '用户频繁搜索API接口相关文档但无结果', 15, 8, 'high'),
(1, 'frequent_question', '部署流程', '多次被问到项目部署流程相关问题', 12, 6, 'high'),
(1, 'missing_topic', '性能优化', '缺少性能优化相关的知识文档', 8, 5, 'medium'),
(NULL, 'search_no_result', '新员工入职', '新员工入职指南搜索无结果', 20, 15, 'critical'),
(NULL, 'missing_topic', '代码规范', '缺少统一的代码规范文档', 10, 7, 'medium');-- =====================================================
-- AI知识库模块数据库脚本
-- 版本: V9.0
-- 功能: AI-001到AI-010 AI知识库完整功能
-- =====================================================

-- 1. 知识文档表 (AI-001 文档解析)
CREATE TABLE IF NOT EXISTS ai_knowledge_document (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    title VARCHAR(255) NOT NULL COMMENT '文档标题',
    original_filename VARCHAR(255) NOT NULL COMMENT '原始文件名',
    file_path VARCHAR(500) NOT NULL COMMENT '文件存储路径',
    file_type VARCHAR(50) NOT NULL COMMENT '文件类型(pdf/docx/txt/md/xlsx/pptx)',
    file_size BIGINT NOT NULL DEFAULT 0 COMMENT '文件大小(字节)',
    mime_type VARCHAR(100) COMMENT 'MIME类型',
    content_text LONGTEXT COMMENT '解析后的文本内容',
    content_html LONGTEXT COMMENT '解析后的HTML内容',
    parse_status VARCHAR(20) NOT NULL DEFAULT 'pending' COMMENT '解析状态(pending/parsing/completed/failed)',
    parse_error TEXT COMMENT '解析错误信息',
    parsed_at DATETIME COMMENT '解析完成时间',
    page_count INT DEFAULT 0 COMMENT '页数(PDF/PPT)',
    word_count INT DEFAULT 0 COMMENT '字数统计',
    char_count INT DEFAULT 0 COMMENT '字符数统计',
    language VARCHAR(20) DEFAULT 'zh' COMMENT '文档语言',
    category_id BIGINT COMMENT '分类ID',
    folder_id BIGINT COMMENT '文件夹ID',
    team_id BIGINT COMMENT '团队ID',
    creator_id BIGINT NOT NULL COMMENT '创建者ID',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted_at DATETIME COMMENT '删除时间',
    INDEX idx_team_id (team_id),
    INDEX idx_creator_id (creator_id),
    INDEX idx_category_id (category_id),
    INDEX idx_parse_status (parse_status),
    INDEX idx_file_type (file_type),
    FULLTEXT INDEX ft_content (content_text)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI知识文档表';

-- 2. OCR识别记录表 (AI-002 OCR识别)
CREATE TABLE IF NOT EXISTS ai_ocr_record (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    document_id BIGINT COMMENT '关联文档ID',
    image_path VARCHAR(500) NOT NULL COMMENT '图片路径',
    image_type VARCHAR(50) COMMENT '图片类型(jpg/png/gif/bmp)',
    image_width INT COMMENT '图片宽度',
    image_height INT COMMENT '图片高度',
    ocr_engine VARCHAR(50) DEFAULT 'tesseract' COMMENT 'OCR引擎(tesseract/paddleocr/azure/google)',
    ocr_language VARCHAR(50) DEFAULT 'chi_sim+eng' COMMENT 'OCR语言',
    recognized_text LONGTEXT COMMENT '识别出的文本',
    confidence DECIMAL(5,2) COMMENT '识别置信度(0-100)',
    text_regions JSON COMMENT '文字区域坐标信息',
    ocr_status VARCHAR(20) NOT NULL DEFAULT 'pending' COMMENT '识别状态(pending/processing/completed/failed)',
    ocr_error TEXT COMMENT '识别错误信息',
    processing_time INT COMMENT '处理耗时(毫秒)',
    creator_id BIGINT NOT NULL COMMENT '创建者ID',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_document_id (document_id),
    INDEX idx_ocr_status (ocr_status),
    INDEX idx_creator_id (creator_id),
    FULLTEXT INDEX ft_recognized_text (recognized_text)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='OCR识别记录表';

-- 3. 语音转文字记录表 (AI-003 语音转文字)
CREATE TABLE IF NOT EXISTS ai_speech_to_text (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    document_id BIGINT COMMENT '关联文档ID',
    audio_path VARCHAR(500) NOT NULL COMMENT '音频/视频文件路径',
    audio_type VARCHAR(50) COMMENT '文件类型(mp3/wav/mp4/avi/mov)',
    duration INT COMMENT '时长(秒)',
    file_size BIGINT COMMENT '文件大小(字节)',
    stt_engine VARCHAR(50) DEFAULT 'whisper' COMMENT 'STT引擎(whisper/azure/google/aliyun)',
    stt_language VARCHAR(50) DEFAULT 'zh' COMMENT '识别语言',
    transcribed_text LONGTEXT COMMENT '转写的文本',
    segments JSON COMMENT '分段信息(时间戳+文本)',
    speakers JSON COMMENT '说话人分离信息',
    confidence DECIMAL(5,2) COMMENT '识别置信度(0-100)',
    stt_status VARCHAR(20) NOT NULL DEFAULT 'pending' COMMENT '转写状态(pending/processing/completed/failed)',
    stt_error TEXT COMMENT '转写错误信息',
    processing_time INT COMMENT '处理耗时(毫秒)',
    creator_id BIGINT NOT NULL COMMENT '创建者ID',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_document_id (document_id),
    INDEX idx_stt_status (stt_status),
    INDEX idx_creator_id (creator_id),
    FULLTEXT INDEX ft_transcribed_text (transcribed_text)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='语音转文字记录表';

-- 4. 表格提取记录表 (AI-004 表格提取)
CREATE TABLE IF NOT EXISTS ai_table_extraction (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    document_id BIGINT NOT NULL COMMENT '关联文档ID',
    page_number INT DEFAULT 1 COMMENT '所在页码',
    table_index INT DEFAULT 0 COMMENT '表格序号(同一页可能有多个表格)',
    table_title VARCHAR(255) COMMENT '表格标题',
    row_count INT DEFAULT 0 COMMENT '行数',
    column_count INT DEFAULT 0 COMMENT '列数',
    headers JSON COMMENT '表头信息',
    table_data JSON COMMENT '表格数据(二维数组)',
    table_html TEXT COMMENT '表格HTML格式',
    table_markdown TEXT COMMENT '表格Markdown格式',
    table_csv TEXT COMMENT '表格CSV格式',
    extraction_method VARCHAR(50) DEFAULT 'auto' COMMENT '提取方法(auto/camelot/tabula/custom)',
    confidence DECIMAL(5,2) COMMENT '提取置信度(0-100)',
    extraction_status VARCHAR(20) NOT NULL DEFAULT 'pending' COMMENT '提取状态(pending/processing/completed/failed)',
    extraction_error TEXT COMMENT '提取错误信息',
    creator_id BIGINT NOT NULL COMMENT '创建者ID',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_document_id (document_id),
    INDEX idx_extraction_status (extraction_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='表格提取记录表';

-- 5. 关键信息提取表 (AI-005 关键信息提取)
CREATE TABLE IF NOT EXISTS ai_key_info_extraction (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    document_id BIGINT NOT NULL COMMENT '关联文档ID',
    extraction_type VARCHAR(50) NOT NULL COMMENT '提取类型(entity/relation/event)',
    
    -- 实体信息
    entity_type VARCHAR(50) COMMENT '实体类型(person/org/location/date/money/product等)',
    entity_text VARCHAR(500) COMMENT '实体文本',
    entity_start INT COMMENT '实体起始位置',
    entity_end INT COMMENT '实体结束位置',
    
    -- 关系信息
    relation_type VARCHAR(100) COMMENT '关系类型',
    subject_entity VARCHAR(500) COMMENT '主体实体',
    object_entity VARCHAR(500) COMMENT '客体实体',
    
    -- 事件信息
    event_type VARCHAR(100) COMMENT '事件类型',
    event_trigger VARCHAR(255) COMMENT '事件触发词',
    event_arguments JSON COMMENT '事件论元',
    event_time VARCHAR(100) COMMENT '事件时间',
    event_location VARCHAR(255) COMMENT '事件地点',
    
    confidence DECIMAL(5,2) COMMENT '提取置信度(0-100)',
    context_text TEXT COMMENT '上下文文本',
    metadata JSON COMMENT '其他元数据',
    extraction_status VARCHAR(20) NOT NULL DEFAULT 'completed' COMMENT '提取状态',
    creator_id BIGINT NOT NULL COMMENT '创建者ID',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_document_id (document_id),
    INDEX idx_extraction_type (extraction_type),
    INDEX idx_entity_type (entity_type),
    INDEX idx_relation_type (relation_type),
    INDEX idx_event_type (event_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='关键信息提取表';

-- 6. 文档摘要表 (AI-006 自动摘要)
CREATE TABLE IF NOT EXISTS ai_document_summary (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    document_id BIGINT NOT NULL COMMENT '关联文档ID',
    summary_type VARCHAR(50) NOT NULL DEFAULT 'extractive' COMMENT '摘要类型(extractive/abstractive/hybrid)',
    summary_length VARCHAR(20) DEFAULT 'medium' COMMENT '摘要长度(short/medium/long)',
    summary_text TEXT NOT NULL COMMENT '摘要文本',
    key_points JSON COMMENT '关键要点列表',
    keywords JSON COMMENT '关键词列表',
    word_count INT COMMENT '摘要字数',
    compression_ratio DECIMAL(5,2) COMMENT '压缩比例',
    model_used VARCHAR(100) COMMENT '使用的模型',
    generation_status VARCHAR(20) NOT NULL DEFAULT 'completed' COMMENT '生成状态',
    generation_error TEXT COMMENT '生成错误信息',
    creator_id BIGINT NOT NULL COMMENT '创建者ID',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_document_id (document_id),
    INDEX idx_summary_type (summary_type),
    FULLTEXT INDEX ft_summary (summary_text)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文档摘要表';

-- 7. 主题分类表 (AI-007 主题分类)
CREATE TABLE IF NOT EXISTS ai_topic_category (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    name VARCHAR(100) NOT NULL COMMENT '分类名称',
    code VARCHAR(50) NOT NULL COMMENT '分类编码',
    parent_id BIGINT DEFAULT 0 COMMENT '父分类ID',
    level INT DEFAULT 1 COMMENT '层级',
    path VARCHAR(500) COMMENT '分类路径',
    description TEXT COMMENT '分类描述',
    keywords JSON COMMENT '分类关键词',
    icon VARCHAR(100) COMMENT '分类图标',
    color VARCHAR(20) COMMENT '分类颜色',
    sort_order INT DEFAULT 0 COMMENT '排序',
    is_system TINYINT(1) DEFAULT 0 COMMENT '是否系统分类',
    team_id BIGINT COMMENT '团队ID(null表示全局)',
    creator_id BIGINT NOT NULL COMMENT '创建者ID',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE INDEX uk_code_team (code, team_id),
    INDEX idx_parent_id (parent_id),
    INDEX idx_team_id (team_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='主题分类表';

-- 8. 文档分类关联表 (AI-007 主题分类)
CREATE TABLE IF NOT EXISTS ai_document_category (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    document_id BIGINT NOT NULL COMMENT '文档ID',
    category_id BIGINT NOT NULL COMMENT '分类ID',
    confidence DECIMAL(5,2) COMMENT '分类置信度(0-100)',
    is_primary TINYINT(1) DEFAULT 0 COMMENT '是否主分类',
    is_manual TINYINT(1) DEFAULT 0 COMMENT '是否手动分类',
    classified_by VARCHAR(100) COMMENT '分类模型/用户',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    UNIQUE INDEX uk_doc_cat (document_id, category_id),
    INDEX idx_category_id (category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文档分类关联表';

-- 9. 自动标签表 (AI-008 自动标签)
CREATE TABLE IF NOT EXISTS ai_tag (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    name VARCHAR(100) NOT NULL COMMENT '标签名称',
    type VARCHAR(50) DEFAULT 'keyword' COMMENT '标签类型(keyword/entity/topic/custom)',
    color VARCHAR(20) COMMENT '标签颜色',
    description TEXT COMMENT '标签描述',
    usage_count INT DEFAULT 0 COMMENT '使用次数',
    is_system TINYINT(1) DEFAULT 0 COMMENT '是否系统标签',
    team_id BIGINT COMMENT '团队ID(null表示全局)',
    creator_id BIGINT NOT NULL COMMENT '创建者ID',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE INDEX uk_name_team (name, team_id),
    INDEX idx_type (type),
    INDEX idx_team_id (team_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='自动标签表';

-- 10. 文档标签关联表 (AI-008 自动标签)
CREATE TABLE IF NOT EXISTS ai_document_tag (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    document_id BIGINT NOT NULL COMMENT '文档ID',
    tag_id BIGINT NOT NULL COMMENT '标签ID',
    confidence DECIMAL(5,2) COMMENT '标签置信度(0-100)',
    is_manual TINYINT(1) DEFAULT 0 COMMENT '是否手动标签',
    tagged_by VARCHAR(100) COMMENT '标签来源(模型/用户)',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    UNIQUE INDEX uk_doc_tag (document_id, tag_id),
    INDEX idx_tag_id (tag_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文档标签关联表';

-- 11. 向量存储表 (AI-009 向量化存储)
CREATE TABLE IF NOT EXISTS ai_document_vector (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    document_id BIGINT NOT NULL COMMENT '文档ID',
    chunk_index INT NOT NULL DEFAULT 0 COMMENT '分块索引',
    chunk_text TEXT NOT NULL COMMENT '分块文本',
    chunk_start INT COMMENT '分块起始位置',
    chunk_end INT COMMENT '分块结束位置',
    token_count INT COMMENT 'Token数量',
    embedding_model VARCHAR(100) DEFAULT 'text-embedding-ada-002' COMMENT '向量模型',
    embedding_dimension INT DEFAULT 1536 COMMENT '向量维度',
    embedding BLOB COMMENT '向量数据(二进制存储)',
    embedding_json JSON COMMENT '向量数据(JSON存储,用于调试)',
    vector_id VARCHAR(100) COMMENT '向量数据库中的ID(如Milvus/Pinecone)',
    collection_name VARCHAR(100) COMMENT '向量集合名称',
    metadata JSON COMMENT '元数据',
    vectorize_status VARCHAR(20) NOT NULL DEFAULT 'pending' COMMENT '向量化状态(pending/processing/completed/failed)',
    vectorize_error TEXT COMMENT '向量化错误信息',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_document_id (document_id),
    INDEX idx_vectorize_status (vectorize_status),
    INDEX idx_collection_name (collection_name),
    INDEX idx_vector_id (vector_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文档向量存储表';

-- 12. 语义检索日志表 (AI-010 语义检索)
CREATE TABLE IF NOT EXISTS ai_semantic_search_log (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    query_text TEXT NOT NULL COMMENT '查询文本',
    query_vector BLOB COMMENT '查询向量',
    search_type VARCHAR(50) DEFAULT 'semantic' COMMENT '检索类型(semantic/keyword/hybrid)',
    top_k INT DEFAULT 10 COMMENT '返回结果数',
    similarity_threshold DECIMAL(5,4) DEFAULT 0.7 COMMENT '相似度阈值',
    result_count INT COMMENT '实际返回结果数',
    result_ids JSON COMMENT '返回的文档ID列表',
    result_scores JSON COMMENT '返回的相似度分数列表',
    search_time INT COMMENT '检索耗时(毫秒)',
    filters JSON COMMENT '过滤条件',
    team_id BIGINT COMMENT '团队ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_user_id (user_id),
    INDEX idx_team_id (team_id),
    INDEX idx_search_type (search_type),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='语义检索日志表';

-- 13. AI处理任务队列表
CREATE TABLE IF NOT EXISTS ai_processing_task (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    task_type VARCHAR(50) NOT NULL COMMENT '任务类型(parse/ocr/stt/extract_table/extract_info/summarize/classify/tag/vectorize)',
    target_id BIGINT NOT NULL COMMENT '目标ID(文档ID/图片ID等)',
    target_type VARCHAR(50) NOT NULL COMMENT '目标类型(document/image/audio)',
    priority INT DEFAULT 5 COMMENT '优先级(1-10,数字越小优先级越高)',
    status VARCHAR(20) NOT NULL DEFAULT 'pending' COMMENT '状态(pending/processing/completed/failed/cancelled)',
    progress INT DEFAULT 0 COMMENT '进度(0-100)',
    retry_count INT DEFAULT 0 COMMENT '重试次数',
    max_retries INT DEFAULT 3 COMMENT '最大重试次数',
    error_message TEXT COMMENT '错误信息',
    started_at DATETIME COMMENT '开始时间',
    completed_at DATETIME COMMENT '完成时间',
    scheduled_at DATETIME COMMENT '计划执行时间',
    worker_id VARCHAR(100) COMMENT '处理节点ID',
    params JSON COMMENT '任务参数',
    result JSON COMMENT '任务结果',
    creator_id BIGINT NOT NULL COMMENT '创建者ID',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_task_type (task_type),
    INDEX idx_status (status),
    INDEX idx_priority_status (priority, status),
    INDEX idx_target (target_id, target_type),
    INDEX idx_scheduled_at (scheduled_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI处理任务队列表';

-- 14. AI模型配置表
CREATE TABLE IF NOT EXISTS ai_model_config (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    model_type VARCHAR(50) NOT NULL COMMENT '模型类型(embedding/llm/ocr/stt/ner)',
    model_name VARCHAR(100) NOT NULL COMMENT '模型名称',
    model_provider VARCHAR(50) NOT NULL COMMENT '模型提供商(openai/azure/aliyun/local)',
    api_endpoint VARCHAR(500) COMMENT 'API端点',
    api_key_encrypted VARCHAR(500) COMMENT '加密的API密钥',
    model_params JSON COMMENT '模型参数',
    is_default TINYINT(1) DEFAULT 0 COMMENT '是否默认模型',
    is_enabled TINYINT(1) DEFAULT 1 COMMENT '是否启用',
    rate_limit INT COMMENT '速率限制(每分钟请求数)',
    cost_per_1k_tokens DECIMAL(10,6) COMMENT '每1000token成本',
    team_id BIGINT COMMENT '团队ID(null表示全局)',
    creator_id BIGINT NOT NULL COMMENT '创建者ID',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_model_type (model_type),
    INDEX idx_model_provider (model_provider),
    INDEX idx_team_id (team_id),
    INDEX idx_is_default (is_default)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI模型配置表';

-- 15. AI使用统计表
CREATE TABLE IF NOT EXISTS ai_usage_stats (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    stat_date DATE NOT NULL COMMENT '统计日期',
    team_id BIGINT COMMENT '团队ID',
    user_id BIGINT COMMENT '用户ID',
    model_type VARCHAR(50) NOT NULL COMMENT '模型类型',
    model_name VARCHAR(100) COMMENT '模型名称',
    request_count INT DEFAULT 0 COMMENT '请求次数',
    success_count INT DEFAULT 0 COMMENT '成功次数',
    failed_count INT DEFAULT 0 COMMENT '失败次数',
    total_tokens INT DEFAULT 0 COMMENT '总Token数',
    input_tokens INT DEFAULT 0 COMMENT '输入Token数',
    output_tokens INT DEFAULT 0 COMMENT '输出Token数',
    total_cost DECIMAL(10,4) DEFAULT 0 COMMENT '总成本',
    avg_latency INT DEFAULT 0 COMMENT '平均延迟(毫秒)',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE INDEX uk_stat (stat_date, team_id, user_id, model_type, model_name),
    INDEX idx_stat_date (stat_date),
    INDEX idx_team_id (team_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI使用统计表';

-- =====================================================
-- 初始化数据
-- =====================================================

-- 插入默认主题分类
INSERT INTO ai_topic_category (name, code, parent_id, level, path, description, is_system, creator_id) VALUES
('技术文档', 'tech', 0, 1, '/tech', '技术相关文档', 1, 1),
('产品文档', 'product', 0, 1, '/product', '产品相关文档', 1, 1),
('市场营销', 'marketing', 0, 1, '/marketing', '市场营销相关文档', 1, 1),
('财务报表', 'finance', 0, 1, '/finance', '财务相关文档', 1, 1),
('人力资源', 'hr', 0, 1, '/hr', '人力资源相关文档', 1, 1),
('法务合规', 'legal', 0, 1, '/legal', '法务合规相关文档', 1, 1),
('项目管理', 'project', 0, 1, '/project', '项目管理相关文档', 1, 1),
('培训资料', 'training', 0, 1, '/training', '培训相关文档', 1, 1),
('会议纪要', 'meeting', 0, 1, '/meeting', '会议纪要文档', 1, 1),
('其他', 'other', 0, 1, '/other', '其他类型文档', 1, 1);

-- 插入技术文档子分类
INSERT INTO ai_topic_category (name, code, parent_id, level, path, description, is_system, creator_id) VALUES
('API文档', 'tech_api', 1, 2, '/tech/api', 'API接口文档', 1, 1),
('架构设计', 'tech_arch', 1, 2, '/tech/arch', '系统架构设计文档', 1, 1),
('开发规范', 'tech_standard', 1, 2, '/tech/standard', '开发规范文档', 1, 1),
('运维手册', 'tech_ops', 1, 2, '/tech/ops', '运维操作手册', 1, 1);

-- 插入默认标签
INSERT INTO ai_tag (name, type, color, description, is_system, creator_id) VALUES
('重要', 'custom', '#f5222d', '重要文档', 1, 1),
('紧急', 'custom', '#fa541c', '紧急处理', 1, 1),
('待审核', 'custom', '#faad14', '待审核文档', 1, 1),
('已归档', 'custom', '#52c41a', '已归档文档', 1, 1),
('草稿', 'custom', '#1890ff', '草稿状态', 1, 1),
('机密', 'custom', '#722ed1', '机密文档', 1, 1);

-- 插入默认AI模型配置
INSERT INTO ai_model_config (model_type, model_name, model_provider, api_endpoint, model_params, is_default, is_enabled, creator_id) VALUES
('embedding', 'text-embedding-ada-002', 'openai', 'https://api.openai.com/v1/embeddings', '{"dimension": 1536}', 1, 1, 1),
('embedding', 'text-embedding-3-small', 'openai', 'https://api.openai.com/v1/embeddings', '{"dimension": 1536}', 0, 1, 1),
('llm', 'gpt-4-turbo', 'openai', 'https://api.openai.com/v1/chat/completions', '{"max_tokens": 4096, "temperature": 0.7}', 1, 1, 1),
('llm', 'gpt-3.5-turbo', 'openai', 'https://api.openai.com/v1/chat/completions', '{"max_tokens": 4096, "temperature": 0.7}', 0, 1, 1),
('ocr', 'tesseract', 'local', NULL, '{"language": "chi_sim+eng"}', 1, 1, 1),
('ocr', 'paddleocr', 'local', NULL, '{"language": "ch"}', 0, 1, 1),
('stt', 'whisper-large-v3', 'openai', 'https://api.openai.com/v1/audio/transcriptions', '{"language": "zh"}', 1, 1, 1);

-- =====================================================
-- 完成
-- =====================================================-- =====================================================
-- 智能新闻推送模块数据库脚本
-- 版本: V10.0
-- 功能: NW-001到NW-009 智能新闻推送完整功能
-- =====================================================

-- 1. 企业行业配置表 (NW-001 行业识别)
CREATE TABLE IF NOT EXISTS news_enterprise_industry (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    team_id BIGINT NOT NULL COMMENT '团队ID',
    industry_code VARCHAR(50) NOT NULL COMMENT '行业代码',
    industry_name VARCHAR(100) NOT NULL COMMENT '行业名称',
    parent_industry_code VARCHAR(50) COMMENT '父行业代码',
    confidence DECIMAL(5,2) DEFAULT 100 COMMENT '识别置信度(0-100)',
    is_primary TINYINT(1) DEFAULT 0 COMMENT '是否主行业',
    is_auto_detected TINYINT(1) DEFAULT 0 COMMENT '是否AI自动识别',
    detection_source VARCHAR(100) COMMENT '识别来源(manual/ai/import)',
    keywords JSON COMMENT '行业关键词',
    description TEXT COMMENT '行业描述',
    creator_id BIGINT NOT NULL COMMENT '创建者ID',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_team_id (team_id),
    INDEX idx_industry_code (industry_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='企业行业配置表';

-- 2. 企业业务领域表 (NW-002 业务理解)
CREATE TABLE IF NOT EXISTS news_business_domain (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    team_id BIGINT NOT NULL COMMENT '团队ID',
    domain_name VARCHAR(100) NOT NULL COMMENT '业务领域名称',
    domain_type VARCHAR(50) COMMENT '领域类型(product/service/market/technology)',
    keywords JSON COMMENT '领域关键词',
    description TEXT COMMENT '领域描述',
    importance INT DEFAULT 5 COMMENT '重要程度(1-10)',
    is_core TINYINT(1) DEFAULT 0 COMMENT '是否核心业务',
    related_industries JSON COMMENT '关联行业',
    competitors JSON COMMENT '竞争对手',
    target_customers JSON COMMENT '目标客户',
    creator_id BIGINT NOT NULL COMMENT '创建者ID',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_team_id (team_id),
    INDEX idx_domain_type (domain_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='企业业务领域表';

-- 3. 新闻数据源表 (NW-003 新闻采集)
CREATE TABLE IF NOT EXISTS news_data_source (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    source_name VARCHAR(100) NOT NULL COMMENT '数据源名称',
    source_type VARCHAR(50) NOT NULL COMMENT '数据源类型(rss/api/crawler/manual)',
    source_url VARCHAR(500) COMMENT '数据源URL',
    api_endpoint VARCHAR(500) COMMENT 'API端点',
    api_key_encrypted VARCHAR(500) COMMENT '加密的API密钥',
    crawl_config JSON COMMENT '爬虫配置',
    category VARCHAR(50) COMMENT '新闻分类',
    language VARCHAR(20) DEFAULT 'zh' COMMENT '语言',
    country VARCHAR(20) DEFAULT 'CN' COMMENT '国家/地区',
    update_frequency INT DEFAULT 60 COMMENT '更新频率(分钟)',
    last_crawl_at DATETIME COMMENT '上次采集时间',
    next_crawl_at DATETIME COMMENT '下次采集时间',
    is_enabled TINYINT(1) DEFAULT 1 COMMENT '是否启用',
    priority INT DEFAULT 5 COMMENT '优先级(1-10)',
    reliability_score DECIMAL(5,2) DEFAULT 80 COMMENT '可靠性评分',
    total_articles INT DEFAULT 0 COMMENT '总文章数',
    last_crawl_status VARCHAR(20) COMMENT '上次采集状态(success/failed)',
    last_error_message TEXT COMMENT '上次错误信息',
    creator_id BIGINT NOT NULL COMMENT '创建者ID',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_source_type (source_type),
    INDEX idx_category (category),
    INDEX idx_is_enabled (is_enabled)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='新闻数据源表';

-- 4. 新闻文章表 (NW-003 新闻采集)
CREATE TABLE IF NOT EXISTS news_article (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    source_id BIGINT COMMENT '数据源ID',
    external_id VARCHAR(200) COMMENT '外部ID(用于去重)',
    title VARCHAR(500) NOT NULL COMMENT '新闻标题',
    content LONGTEXT COMMENT '新闻内容',
    summary TEXT COMMENT '新闻摘要',
    author VARCHAR(100) COMMENT '作者',
    source_name VARCHAR(100) COMMENT '来源名称',
    source_url VARCHAR(1000) COMMENT '原文链接',
    image_url VARCHAR(1000) COMMENT '封面图片',
    images JSON COMMENT '图片列表',
    category VARCHAR(50) COMMENT '分类',
    tags JSON COMMENT '标签',
    keywords JSON COMMENT '关键词(AI提取)',
    entities JSON COMMENT '实体(AI提取)',
    publish_time DATETIME COMMENT '发布时间',
    crawl_time DATETIME COMMENT '采集时间',
    language VARCHAR(20) DEFAULT 'zh' COMMENT '语言',
    word_count INT DEFAULT 0 COMMENT '字数',
    read_time INT DEFAULT 0 COMMENT '预计阅读时间(秒)',
    sentiment VARCHAR(20) COMMENT '情感倾向(positive/negative/neutral)',
    sentiment_score DECIMAL(5,2) COMMENT '情感分数',
    importance_score DECIMAL(5,2) COMMENT '重要性评分',
    quality_score DECIMAL(5,2) COMMENT '质量评分',
    is_policy TINYINT(1) DEFAULT 0 COMMENT '是否政策文件',
    policy_level VARCHAR(50) COMMENT '政策级别(national/provincial/municipal)',
    policy_type VARCHAR(50) COMMENT '政策类型',
    view_count INT DEFAULT 0 COMMENT '浏览次数',
    share_count INT DEFAULT 0 COMMENT '分享次数',
    favorite_count INT DEFAULT 0 COMMENT '收藏次数',
    status VARCHAR(20) DEFAULT 'active' COMMENT '状态(active/archived/deleted)',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE INDEX uk_external_id (source_id, external_id),
    INDEX idx_source_id (source_id),
    INDEX idx_category (category),
    INDEX idx_publish_time (publish_time),
    INDEX idx_is_policy (is_policy),
    INDEX idx_status (status),
    FULLTEXT INDEX ft_content (title, content, summary)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='新闻文章表';

-- 5. 政策监控配置表 (NW-004 政策监控)
CREATE TABLE IF NOT EXISTS news_policy_monitor (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    team_id BIGINT NOT NULL COMMENT '团队ID',
    monitor_name VARCHAR(100) NOT NULL COMMENT '监控名称',
    policy_types JSON COMMENT '监控的政策类型',
    policy_levels JSON COMMENT '监控的政策级别',
    keywords JSON COMMENT '监控关键词',
    industries JSON COMMENT '关联行业',
    regions JSON COMMENT '监控地区',
    departments JSON COMMENT '监控部门',
    is_enabled TINYINT(1) DEFAULT 1 COMMENT '是否启用',
    alert_enabled TINYINT(1) DEFAULT 1 COMMENT '是否开启提醒',
    alert_channels JSON COMMENT '提醒渠道(email/push/sms)',
    last_check_at DATETIME COMMENT '上次检查时间',
    matched_count INT DEFAULT 0 COMMENT '匹配数量',
    creator_id BIGINT NOT NULL COMMENT '创建者ID',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_team_id (team_id),
    INDEX idx_is_enabled (is_enabled)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='政策监控配置表';

-- 6. 新闻匹配记录表 (NW-005 智能匹配)
CREATE TABLE IF NOT EXISTS news_match_record (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    article_id BIGINT NOT NULL COMMENT '文章ID',
    team_id BIGINT COMMENT '团队ID',
    user_id BIGINT COMMENT '用户ID',
    match_type VARCHAR(50) NOT NULL COMMENT '匹配类型(industry/keyword/semantic/policy)',
    match_score DECIMAL(5,2) NOT NULL COMMENT '匹配分数(0-100)',
    matched_keywords JSON COMMENT '匹配的关键词',
    matched_industries JSON COMMENT '匹配的行业',
    matched_domains JSON COMMENT '匹配的业务领域',
    semantic_similarity DECIMAL(5,4) COMMENT '语义相似度',
    relevance_reason TEXT COMMENT '相关性原因',
    is_recommended TINYINT(1) DEFAULT 0 COMMENT '是否推荐',
    recommendation_rank INT COMMENT '推荐排名',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_article_id (article_id),
    INDEX idx_team_id (team_id),
    INDEX idx_user_id (user_id),
    INDEX idx_match_score (match_score),
    INDEX idx_is_recommended (is_recommended)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='新闻匹配记录表';

-- 7. 用户新闻偏好表 (NW-006 个性化推送)
CREATE TABLE IF NOT EXISTS news_user_preference (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    team_id BIGINT COMMENT '团队ID',
    role VARCHAR(50) COMMENT '用户角色',
    preferred_categories JSON COMMENT '偏好分类',
    preferred_sources JSON COMMENT '偏好来源',
    preferred_keywords JSON COMMENT '偏好关键词',
    blocked_keywords JSON COMMENT '屏蔽关键词',
    blocked_sources JSON COMMENT '屏蔽来源',
    interest_industries JSON COMMENT '感兴趣的行业',
    interest_topics JSON COMMENT '感兴趣的话题',
    reading_level VARCHAR(20) DEFAULT 'normal' COMMENT '阅读深度(brief/normal/detailed)',
    content_language VARCHAR(20) DEFAULT 'zh' COMMENT '内容语言偏好',
    min_quality_score DECIMAL(5,2) DEFAULT 60 COMMENT '最低质量分数',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE INDEX uk_user_id (user_id),
    INDEX idx_team_id (team_id),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户新闻偏好表';

-- 8. 推送配置表 (NW-007 推送优化)
CREATE TABLE IF NOT EXISTS news_push_config (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    team_id BIGINT COMMENT '团队ID',
    push_enabled TINYINT(1) DEFAULT 1 COMMENT '是否开启推送',
    push_channels JSON COMMENT '推送渠道(email/app/wechat/dingtalk)',
    push_frequency VARCHAR(20) DEFAULT 'daily' COMMENT '推送频率(realtime/hourly/daily/weekly)',
    push_time VARCHAR(10) COMMENT '推送时间(HH:mm)',
    push_days JSON COMMENT '推送日期(周几)',
    timezone VARCHAR(50) DEFAULT 'Asia/Shanghai' COMMENT '时区',
    max_articles_per_push INT DEFAULT 10 COMMENT '每次推送最大文章数',
    min_match_score DECIMAL(5,2) DEFAULT 70 COMMENT '最低匹配分数',
    include_summary TINYINT(1) DEFAULT 1 COMMENT '是否包含摘要',
    include_image TINYINT(1) DEFAULT 1 COMMENT '是否包含图片',
    quiet_hours_start VARCHAR(10) COMMENT '免打扰开始时间',
    quiet_hours_end VARCHAR(10) COMMENT '免打扰结束时间',
    last_push_at DATETIME COMMENT '上次推送时间',
    next_push_at DATETIME COMMENT '下次推送时间',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE INDEX uk_user_id (user_id),
    INDEX idx_team_id (team_id),
    INDEX idx_next_push_at (next_push_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='推送配置表';

-- 9. 推送记录表 (NW-007 推送优化)
CREATE TABLE IF NOT EXISTS news_push_record (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    team_id BIGINT COMMENT '团队ID',
    push_channel VARCHAR(50) NOT NULL COMMENT '推送渠道',
    push_type VARCHAR(50) DEFAULT 'scheduled' COMMENT '推送类型(scheduled/manual/realtime)',
    article_ids JSON COMMENT '推送的文章ID列表',
    article_count INT DEFAULT 0 COMMENT '文章数量',
    push_title VARCHAR(200) COMMENT '推送标题',
    push_content TEXT COMMENT '推送内容',
    push_status VARCHAR(20) DEFAULT 'pending' COMMENT '推送状态(pending/sent/failed)',
    sent_at DATETIME COMMENT '发送时间',
    opened_at DATETIME COMMENT '打开时间',
    click_count INT DEFAULT 0 COMMENT '点击次数',
    error_message TEXT COMMENT '错误信息',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_user_id (user_id),
    INDEX idx_team_id (team_id),
    INDEX idx_push_status (push_status),
    INDEX idx_sent_at (sent_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='推送记录表';

-- 10. 新闻收藏表 (NW-008 新闻收藏)
CREATE TABLE IF NOT EXISTS news_favorite (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    article_id BIGINT NOT NULL COMMENT '文章ID',
    folder_id BIGINT COMMENT '收藏夹ID',
    note TEXT COMMENT '备注',
    tags JSON COMMENT '自定义标签',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    UNIQUE INDEX uk_user_article (user_id, article_id),
    INDEX idx_folder_id (folder_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='新闻收藏表';

-- 11. 收藏夹表 (NW-008 新闻收藏)
CREATE TABLE IF NOT EXISTS news_favorite_folder (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    folder_name VARCHAR(100) NOT NULL COMMENT '收藏夹名称',
    description TEXT COMMENT '描述',
    is_default TINYINT(1) DEFAULT 0 COMMENT '是否默认收藏夹',
    article_count INT DEFAULT 0 COMMENT '文章数量',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='收藏夹表';

-- 12. 新闻分类表 (NW-009 新闻分类)
CREATE TABLE IF NOT EXISTS news_category (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    category_code VARCHAR(50) NOT NULL COMMENT '分类代码',
    category_name VARCHAR(100) NOT NULL COMMENT '分类名称',
    parent_id BIGINT DEFAULT 0 COMMENT '父分类ID',
    level INT DEFAULT 1 COMMENT '层级',
    path VARCHAR(500) COMMENT '分类路径',
    icon VARCHAR(100) COMMENT '图标',
    color VARCHAR(20) COMMENT '颜色',
    description TEXT COMMENT '描述',
    keywords JSON COMMENT '分类关键词',
    sort_order INT DEFAULT 0 COMMENT '排序',
    is_system TINYINT(1) DEFAULT 0 COMMENT '是否系统分类',
    is_enabled TINYINT(1) DEFAULT 1 COMMENT '是否启用',
    article_count INT DEFAULT 0 COMMENT '文章数量',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE INDEX uk_category_code (category_code),
    INDEX idx_parent_id (parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='新闻分类表';

-- 13. 用户阅读记录表
CREATE TABLE IF NOT EXISTS news_reading_record (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    article_id BIGINT NOT NULL COMMENT '文章ID',
    read_duration INT DEFAULT 0 COMMENT '阅读时长(秒)',
    read_progress DECIMAL(5,2) DEFAULT 0 COMMENT '阅读进度(0-100)',
    is_finished TINYINT(1) DEFAULT 0 COMMENT '是否读完',
    source VARCHAR(50) COMMENT '来源(push/search/recommend/browse)',
    device VARCHAR(50) COMMENT '设备类型',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_user_id (user_id),
    INDEX idx_article_id (article_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户阅读记录表';

-- 14. 新闻采集任务表
CREATE TABLE IF NOT EXISTS news_crawl_task (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    source_id BIGINT NOT NULL COMMENT '数据源ID',
    task_type VARCHAR(50) DEFAULT 'scheduled' COMMENT '任务类型(scheduled/manual)',
    status VARCHAR(20) DEFAULT 'pending' COMMENT '状态(pending/running/completed/failed)',
    started_at DATETIME COMMENT '开始时间',
    completed_at DATETIME COMMENT '完成时间',
    total_articles INT DEFAULT 0 COMMENT '采集文章数',
    new_articles INT DEFAULT 0 COMMENT '新增文章数',
    updated_articles INT DEFAULT 0 COMMENT '更新文章数',
    failed_articles INT DEFAULT 0 COMMENT '失败文章数',
    error_message TEXT COMMENT '错误信息',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_source_id (source_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='新闻采集任务表';

-- =====================================================
-- 初始化数据
-- =====================================================

-- 插入默认新闻分类
INSERT INTO news_category (category_code, category_name, parent_id, level, path, icon, color, is_system, sort_order) VALUES
('technology', '科技', 0, 1, '/technology', 'RobotOutlined', '#1890ff', 1, 1),
('industry', '行业动态', 0, 1, '/industry', 'GlobalOutlined', '#52c41a', 1, 2),
('policy', '政策法规', 0, 1, '/policy', 'FileTextOutlined', '#faad14', 1, 3),
('finance', '财经', 0, 1, '/finance', 'DollarOutlined', '#f5222d', 1, 4),
('market', '市场分析', 0, 1, '/market', 'LineChartOutlined', '#722ed1', 1, 5),
('management', '企业管理', 0, 1, '/management', 'TeamOutlined', '#13c2c2', 1, 6),
('innovation', '创新创业', 0, 1, '/innovation', 'BulbOutlined', '#eb2f96', 1, 7),
('international', '国际资讯', 0, 1, '/international', 'GlobalOutlined', '#2f54eb', 1, 8);

-- 插入科技子分类
INSERT INTO news_category (category_code, category_name, parent_id, level, path, is_system, sort_order) VALUES
('tech_ai', '人工智能', 1, 2, '/technology/ai', 1, 1),
('tech_cloud', '云计算', 1, 2, '/technology/cloud', 1, 2),
('tech_bigdata', '大数据', 1, 2, '/technology/bigdata', 1, 3),
('tech_blockchain', '区块链', 1, 2, '/technology/blockchain', 1, 4),
('tech_iot', '物联网', 1, 2, '/technology/iot', 1, 5);

-- 插入默认新闻数据源
INSERT INTO news_data_source (source_name, source_type, source_url, category, update_frequency, priority, reliability_score, creator_id) VALUES
('36氪', 'rss', 'https://36kr.com/feed', 'technology', 30, 8, 90, 1),
('虎嗅', 'rss', 'https://www.huxiu.com/rss/0.xml', 'technology', 30, 8, 88, 1),
('钛媒体', 'rss', 'https://www.tmtpost.com/rss.xml', 'technology', 30, 7, 85, 1),
('亿欧网', 'api', 'https://www.iyiou.com/api/news', 'industry', 60, 7, 82, 1),
('艾瑞咨询', 'crawler', 'https://www.iresearch.cn', 'market', 120, 6, 90, 1),
('国务院政策', 'crawler', 'http://www.gov.cn/zhengce/', 'policy', 60, 9, 100, 1),
('工信部', 'crawler', 'https://www.miit.gov.cn/', 'policy', 60, 9, 100, 1);

-- =====================================================
-- 完成
-- =====================================================-- =====================================================
-- AI方案生成模块数据库脚本
-- 版本: V11.0
-- 功能: AG-001到AG-010 AI方案生成完整功能
-- =====================================================

-- 1. 方案会话表 (AG-001 意图识别, AG-009 多轮优化)
CREATE TABLE IF NOT EXISTS ai_proposal_session (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    session_id VARCHAR(64) NOT NULL COMMENT '会话ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    team_id BIGINT COMMENT '团队ID',
    proposal_type VARCHAR(50) NOT NULL COMMENT '方案类型(project/technical/marketing/business/report)',
    title VARCHAR(200) COMMENT '方案标题',
    status VARCHAR(20) DEFAULT 'active' COMMENT '状态(active/completed/cancelled)',
    intent_analysis JSON COMMENT '意图分析结果',
    requirement_summary TEXT COMMENT '需求摘要',
    context JSON COMMENT '上下文信息',
    message_count INT DEFAULT 0 COMMENT '消息数量',
    total_tokens INT DEFAULT 0 COMMENT '总Token数',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    completed_at DATETIME COMMENT '完成时间',
    UNIQUE INDEX uk_session_id (session_id),
    INDEX idx_user_id (user_id),
    INDEX idx_team_id (team_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='方案会话表';

-- 2. 会话消息表 (AG-009 多轮优化)
CREATE TABLE IF NOT EXISTS ai_proposal_message (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    session_id VARCHAR(64) NOT NULL COMMENT '会话ID',
    role VARCHAR(20) NOT NULL COMMENT '角色(system/user/assistant)',
    content TEXT NOT NULL COMMENT '消息内容',
    intent VARCHAR(50) COMMENT '意图类型',
    entities JSON COMMENT '提取的实体',
    tokens INT DEFAULT 0 COMMENT 'Token数',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_session_id (session_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='会话消息表';

-- 3. 需求解析表 (AG-002 需求解析)
CREATE TABLE IF NOT EXISTS ai_requirement_analysis (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    session_id VARCHAR(64) NOT NULL COMMENT '会话ID',
    original_text TEXT NOT NULL COMMENT '原始需求文本',
    parsed_intent VARCHAR(100) COMMENT '解析的意图',
    key_elements JSON COMMENT '关键要素',
    entities JSON COMMENT '识别的实体',
    constraints JSON COMMENT '约束条件',
    goals JSON COMMENT '目标列表',
    stakeholders JSON COMMENT '利益相关者',
    timeline JSON COMMENT '时间线要求',
    budget JSON COMMENT '预算要求',
    confidence DECIMAL(5,2) COMMENT '解析置信度',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_session_id (session_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='需求解析表';

-- 4. 知识检索记录表 (AG-003 知识检索)
CREATE TABLE IF NOT EXISTS ai_knowledge_retrieval (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    session_id VARCHAR(64) NOT NULL COMMENT '会话ID',
    query_text TEXT NOT NULL COMMENT '检索查询',
    knowledge_base_ids JSON COMMENT '检索的知识库ID',
    retrieved_docs JSON COMMENT '检索到的文档',
    doc_count INT DEFAULT 0 COMMENT '文档数量',
    relevance_scores JSON COMMENT '相关性分数',
    used_in_proposal TINYINT(1) DEFAULT 0 COMMENT '是否用于方案',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_session_id (session_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='知识检索记录表';

-- 5. 历史方案参考表 (AG-004 历史参考)
CREATE TABLE IF NOT EXISTS ai_proposal_reference (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    session_id VARCHAR(64) NOT NULL COMMENT '会话ID',
    reference_proposal_id BIGINT NOT NULL COMMENT '参考方案ID',
    similarity_score DECIMAL(5,4) COMMENT '相似度分数',
    matched_sections JSON COMMENT '匹配的章节',
    used_sections JSON COMMENT '使用的章节',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_session_id (session_id),
    INDEX idx_reference_id (reference_proposal_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='历史方案参考表';

-- 6. 方案内容表 (AG-005 方案生成)
CREATE TABLE IF NOT EXISTS ai_proposal_content (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    session_id VARCHAR(64) NOT NULL COMMENT '会话ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    team_id BIGINT COMMENT '团队ID',
    proposal_type VARCHAR(50) NOT NULL COMMENT '方案类型',
    title VARCHAR(200) NOT NULL COMMENT '方案标题',
    content LONGTEXT COMMENT '方案内容(Markdown)',
    content_html LONGTEXT COMMENT '方案内容(HTML)',
    summary TEXT COMMENT '方案摘要',
    outline JSON COMMENT '方案大纲',
    sections JSON COMMENT '章节结构',
    keywords JSON COMMENT '关键词',
    word_count INT DEFAULT 0 COMMENT '字数',
    version INT DEFAULT 1 COMMENT '版本号',
    status VARCHAR(20) DEFAULT 'draft' COMMENT '状态(draft/reviewing/approved/archived)',
    quality_score DECIMAL(5,2) COMMENT '质量评分',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_session_id (session_id),
    INDEX idx_user_id (user_id),
    INDEX idx_team_id (team_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='方案内容表';

-- 7. 方案章节表 (AG-006 章节编排)
CREATE TABLE IF NOT EXISTS ai_proposal_section (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    proposal_id BIGINT NOT NULL COMMENT '方案ID',
    parent_id BIGINT DEFAULT 0 COMMENT '父章节ID',
    section_number VARCHAR(20) COMMENT '章节编号',
    title VARCHAR(200) NOT NULL COMMENT '章节标题',
    content TEXT COMMENT '章节内容',
    level INT DEFAULT 1 COMMENT '层级',
    sort_order INT DEFAULT 0 COMMENT '排序',
    word_count INT DEFAULT 0 COMMENT '字数',
    is_generated TINYINT(1) DEFAULT 1 COMMENT '是否AI生成',
    is_edited TINYINT(1) DEFAULT 0 COMMENT '是否已编辑',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_proposal_id (proposal_id),
    INDEX idx_parent_id (parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='方案章节表';

-- 8. 图表建议表 (AG-007 图表建议)
CREATE TABLE IF NOT EXISTS ai_chart_suggestion (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    proposal_id BIGINT NOT NULL COMMENT '方案ID',
    section_id BIGINT COMMENT '章节ID',
    chart_type VARCHAR(50) NOT NULL COMMENT '图表类型(bar/line/pie/table/flow/gantt)',
    title VARCHAR(200) COMMENT '图表标题',
    description TEXT COMMENT '图表描述',
    data_source TEXT COMMENT '数据来源说明',
    sample_data JSON COMMENT '示例数据',
    chart_config JSON COMMENT '图表配置',
    position VARCHAR(50) COMMENT '建议位置',
    is_applied TINYINT(1) DEFAULT 0 COMMENT '是否已应用',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_proposal_id (proposal_id),
    INDEX idx_section_id (section_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='图表建议表';

-- 9. 质量检查表 (AG-008 质量检查)
CREATE TABLE IF NOT EXISTS ai_quality_check (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    proposal_id BIGINT NOT NULL COMMENT '方案ID',
    check_type VARCHAR(50) NOT NULL COMMENT '检查类型(consistency/completeness/clarity/accuracy)',
    overall_score DECIMAL(5,2) COMMENT '总体评分',
    completeness_score DECIMAL(5,2) COMMENT '完整性评分',
    clarity_score DECIMAL(5,2) COMMENT '清晰度评分',
    consistency_score DECIMAL(5,2) COMMENT '一致性评分',
    accuracy_score DECIMAL(5,2) COMMENT '准确性评分',
    issues JSON COMMENT '发现的问题',
    suggestions JSON COMMENT '改进建议',
    auto_fixes JSON COMMENT '自动修复建议',
    checked_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '检查时间',
    INDEX idx_proposal_id (proposal_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='质量检查表';

-- 10. 方案版本表 (AG-009 多轮优化)
CREATE TABLE IF NOT EXISTS ai_proposal_version (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    proposal_id BIGINT NOT NULL COMMENT '方案ID',
    version INT NOT NULL COMMENT '版本号',
    content LONGTEXT COMMENT '版本内容',
    change_summary TEXT COMMENT '变更摘要',
    change_type VARCHAR(50) COMMENT '变更类型(optimize/expand/refine/restructure)',
    feedback TEXT COMMENT '用户反馈',
    created_by BIGINT COMMENT '创建者ID',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_proposal_id (proposal_id),
    INDEX idx_version (version)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='方案版本表';

-- 11. 方案导出记录表 (AG-010 方案导出)
CREATE TABLE IF NOT EXISTS ai_proposal_export (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    proposal_id BIGINT NOT NULL COMMENT '方案ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    export_format VARCHAR(20) NOT NULL COMMENT '导出格式(word/pdf/ppt/markdown/html)',
    file_name VARCHAR(200) COMMENT '文件名',
    file_path VARCHAR(500) COMMENT '文件路径',
    file_size BIGINT COMMENT '文件大小(字节)',
    template_id BIGINT COMMENT '使用的模板ID',
    export_config JSON COMMENT '导出配置',
    status VARCHAR(20) DEFAULT 'pending' COMMENT '状态(pending/processing/completed/failed)',
    error_message TEXT COMMENT '错误信息',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    completed_at DATETIME COMMENT '完成时间',
    INDEX idx_proposal_id (proposal_id),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='方案导出记录表';

-- 12. 方案模板表
CREATE TABLE IF NOT EXISTS ai_proposal_template (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    name VARCHAR(100) NOT NULL COMMENT '模板名称',
    proposal_type VARCHAR(50) NOT NULL COMMENT '方案类型',
    description TEXT COMMENT '模板描述',
    outline JSON COMMENT '大纲结构',
    sections JSON COMMENT '章节模板',
    variables JSON COMMENT '变量定义',
    sample_content TEXT COMMENT '示例内容',
    is_system TINYINT(1) DEFAULT 0 COMMENT '是否系统模板',
    is_enabled TINYINT(1) DEFAULT 1 COMMENT '是否启用',
    use_count INT DEFAULT 0 COMMENT '使用次数',
    creator_id BIGINT COMMENT '创建者ID',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_proposal_type (proposal_type),
    INDEX idx_is_enabled (is_enabled)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='方案模板表';

-- 13. 导出模板表
CREATE TABLE IF NOT EXISTS ai_export_template (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    name VARCHAR(100) NOT NULL COMMENT '模板名称',
    export_format VARCHAR(20) NOT NULL COMMENT '导出格式',
    description TEXT COMMENT '模板描述',
    template_file VARCHAR(500) COMMENT '模板文件路径',
    style_config JSON COMMENT '样式配置',
    header_config JSON COMMENT '页眉配置',
    footer_config JSON COMMENT '页脚配置',
    is_system TINYINT(1) DEFAULT 0 COMMENT '是否系统模板',
    is_enabled TINYINT(1) DEFAULT 1 COMMENT '是否启用',
    creator_id BIGINT COMMENT '创建者ID',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_export_format (export_format)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='导出模板表';

-- =====================================================
-- 初始化数据
-- =====================================================

-- 插入方案模板
INSERT INTO ai_proposal_template (name, proposal_type, description, outline, is_system) VALUES
('项目方案模板', 'project', '标准项目方案模板，包含项目背景、目标、实施计划等', 
 '["项目背景","项目目标","实施方案","资源需求","风险分析","时间计划","预算估算","预期成果"]', 1),
('技术方案模板', 'technical', '技术方案模板，包含技术选型、架构设计、实施步骤等',
 '["需求分析","技术选型","架构设计","详细设计","实施计划","测试方案","运维方案"]', 1),
('营销方案模板', 'marketing', '营销方案模板，包含市场分析、营销策略、执行计划等',
 '["市场分析","目标客户","营销策略","渠道规划","预算分配","执行计划","效果评估"]', 1),
('商业计划书模板', 'business', '商业计划书模板，包含商业模式、市场分析、财务预测等',
 '["执行摘要","公司介绍","产品服务","市场分析","商业模式","营销策略","运营计划","财务预测","团队介绍","融资需求"]', 1),
('工作报告模板', 'report', '工作报告模板，包含工作总结、成果展示、问题分析等',
 '["工作概述","主要成果","问题与挑战","经验总结","下阶段计划"]', 1);

-- 插入导出模板
INSERT INTO ai_export_template (name, export_format, description, style_config, is_system) VALUES
('标准Word模板', 'word', '标准Word文档导出模板',
 '{"fontFamily":"微软雅黑","fontSize":12,"lineHeight":1.5,"marginTop":2.54,"marginBottom":2.54,"marginLeft":3.17,"marginRight":3.17}', 1),
('专业PDF模板', 'pdf', '专业PDF文档导出模板',
 '{"fontFamily":"思源黑体","fontSize":11,"lineHeight":1.6,"pageSize":"A4","orientation":"portrait"}', 1),
('演示PPT模板', 'ppt', '演示PPT导出模板',
 '{"theme":"professional","slideSize":"16:9","fontFamily":"微软雅黑","primaryColor":"#1890ff"}', 1);

-- =====================================================
-- 完成
-- =====================================================-- =====================================================
-- 智能搜索模块数据库脚本
-- 版本: V12.0
-- 功能: SS-001到SS-008 智能搜索功能
-- =====================================================

-- 1. 搜索索引配置表
CREATE TABLE IF NOT EXISTS search_index_config (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    index_name VARCHAR(100) NOT NULL COMMENT '索引名称',
    index_type VARCHAR(50) NOT NULL COMMENT '索引类型(document/task/project/knowledge)',
    table_name VARCHAR(100) NOT NULL COMMENT '关联表名',
    field_mappings JSON COMMENT '字段映射配置',
    analyzer_config JSON COMMENT '分析器配置',
    vector_config JSON COMMENT '向量化配置',
    is_enabled BOOLEAN DEFAULT TRUE COMMENT '是否启用',
    last_sync_at DATETIME COMMENT '最后同步时间',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_index_name (index_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='搜索索引配置表';

-- 2. 文档向量表
CREATE TABLE IF NOT EXISTS document_vector (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    document_id BIGINT NOT NULL COMMENT '文档ID',
    document_type VARCHAR(50) NOT NULL COMMENT '文档类型',
    chunk_index INT DEFAULT 0 COMMENT '分块索引',
    content_text TEXT COMMENT '原始文本内容',
    vector_data BLOB COMMENT '向量数据(二进制存储)',
    vector_dimension INT COMMENT '向量维度',
    embedding_model VARCHAR(100) COMMENT '嵌入模型',
    metadata JSON COMMENT '元数据',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_document (document_id, document_type),
    INDEX idx_chunk (document_id, chunk_index)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='文档向量表';

-- 3. 搜索日志表
CREATE TABLE IF NOT EXISTS search_log (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT COMMENT '用户ID',
    session_id VARCHAR(100) COMMENT '会话ID',
    query_text VARCHAR(500) NOT NULL COMMENT '搜索词',
    query_type VARCHAR(50) DEFAULT 'keyword' COMMENT '搜索类型(keyword/semantic/hybrid)',
    corrected_query VARCHAR(500) COMMENT '纠错后的搜索词',
    detected_intent VARCHAR(100) COMMENT '识别的意图',
    filters JSON COMMENT '筛选条件',
    result_count INT DEFAULT 0 COMMENT '结果数量',
    clicked_results JSON COMMENT '点击的结果',
    search_time_ms INT COMMENT '搜索耗时(毫秒)',
    is_successful BOOLEAN DEFAULT TRUE COMMENT '是否成功',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user (user_id),
    INDEX idx_query (query_text(100)),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='搜索日志表';

-- 4. 搜索建议表
CREATE TABLE IF NOT EXISTS search_suggestion (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    suggestion_text VARCHAR(200) NOT NULL COMMENT '建议文本',
    suggestion_type VARCHAR(50) NOT NULL COMMENT '建议类型(hot/related/correction/completion)',
    source_query VARCHAR(200) COMMENT '来源查询',
    frequency INT DEFAULT 1 COMMENT '出现频率',
    click_count INT DEFAULT 0 COMMENT '点击次数',
    score DECIMAL(5,4) DEFAULT 0 COMMENT '相关度得分',
    is_active BOOLEAN DEFAULT TRUE COMMENT '是否启用',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_type (suggestion_type),
    INDEX idx_text (suggestion_text),
    INDEX idx_frequency (frequency DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='搜索建议表';

-- 5. 搜索纠错词典表
CREATE TABLE IF NOT EXISTS search_correction_dict (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    wrong_word VARCHAR(100) NOT NULL COMMENT '错误词',
    correct_word VARCHAR(100) NOT NULL COMMENT '正确词',
    correction_type VARCHAR(50) DEFAULT 'spelling' COMMENT '纠错类型(spelling/synonym/pinyin)',
    confidence DECIMAL(5,4) DEFAULT 1.0 COMMENT '置信度',
    usage_count INT DEFAULT 0 COMMENT '使用次数',
    is_active BOOLEAN DEFAULT TRUE COMMENT '是否启用',
    created_by BIGINT COMMENT '创建人',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_wrong_word (wrong_word),
    INDEX idx_correct (correct_word)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='搜索纠错词典表';

-- 6. 搜索同义词表
CREATE TABLE IF NOT EXISTS search_synonym (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    word_group VARCHAR(500) NOT NULL COMMENT '同义词组(逗号分隔)',
    synonym_type VARCHAR(50) DEFAULT 'equivalent' COMMENT '同义词类型(equivalent/expansion)',
    domain VARCHAR(100) COMMENT '领域',
    weight DECIMAL(3,2) DEFAULT 1.0 COMMENT '权重',
    is_active BOOLEAN DEFAULT TRUE COMMENT '是否启用',
    created_by BIGINT COMMENT '创建人',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_domain (domain)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='搜索同义词表';

-- 7. 搜索意图模板表
CREATE TABLE IF NOT EXISTS search_intent_template (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    intent_name VARCHAR(100) NOT NULL COMMENT '意图名称',
    intent_code VARCHAR(50) NOT NULL COMMENT '意图代码',
    patterns JSON NOT NULL COMMENT '匹配模式(正则表达式列表)',
    keywords JSON COMMENT '关键词列表',
    action_type VARCHAR(50) COMMENT '动作类型(search/navigate/filter/aggregate)',
    action_config JSON COMMENT '动作配置',
    priority INT DEFAULT 0 COMMENT '优先级',
    is_active BOOLEAN DEFAULT TRUE COMMENT '是否启用',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_intent_code (intent_code),
    INDEX idx_priority (priority DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='搜索意图模板表';

-- 8. 搜索结果缓存表
CREATE TABLE IF NOT EXISTS search_result_cache (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    cache_key VARCHAR(255) NOT NULL COMMENT '缓存键(查询hash)',
    query_text VARCHAR(500) NOT NULL COMMENT '搜索词',
    query_type VARCHAR(50) NOT NULL COMMENT '搜索类型',
    filters_hash VARCHAR(64) COMMENT '筛选条件hash',
    result_data JSON COMMENT '结果数据',
    result_count INT DEFAULT 0 COMMENT '结果数量',
    hit_count INT DEFAULT 0 COMMENT '命中次数',
    expires_at DATETIME NOT NULL COMMENT '过期时间',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_cache_key (cache_key),
    INDEX idx_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='搜索结果缓存表';

-- 9. 搜索热词表
CREATE TABLE IF NOT EXISTS search_hot_word (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    word VARCHAR(100) NOT NULL COMMENT '热词',
    category VARCHAR(50) COMMENT '分类',
    search_count INT DEFAULT 0 COMMENT '搜索次数',
    trend_score DECIMAL(10,4) DEFAULT 0 COMMENT '趋势得分',
    period_type VARCHAR(20) DEFAULT 'daily' COMMENT '统计周期(hourly/daily/weekly)',
    period_date DATE NOT NULL COMMENT '统计日期',
    rank_position INT COMMENT '排名位置',
    is_trending BOOLEAN DEFAULT FALSE COMMENT '是否上升趋势',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_word_period (word, period_type, period_date),
    INDEX idx_rank (period_type, period_date, rank_position)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='搜索热词表';

-- 10. 搜索相关推荐表
CREATE TABLE IF NOT EXISTS search_related_query (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    source_query VARCHAR(200) NOT NULL COMMENT '源查询',
    related_query VARCHAR(200) NOT NULL COMMENT '相关查询',
    relation_type VARCHAR(50) DEFAULT 'co_search' COMMENT '关系类型(co_search/refine/broaden)',
    co_occurrence_count INT DEFAULT 0 COMMENT '共现次数',
    similarity_score DECIMAL(5,4) DEFAULT 0 COMMENT '相似度得分',
    click_through_rate DECIMAL(5,4) DEFAULT 0 COMMENT '点击率',
    is_active BOOLEAN DEFAULT TRUE COMMENT '是否启用',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_source_related (source_query(100), related_query(100)),
    INDEX idx_source (source_query(100)),
    INDEX idx_score (similarity_score DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='搜索相关推荐表';

-- 11. 用户搜索偏好表
CREATE TABLE IF NOT EXISTS user_search_preference (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL COMMENT '用户ID',
    preferred_types JSON COMMENT '偏好的内容类型',
    preferred_filters JSON COMMENT '常用筛选条件',
    search_history_enabled BOOLEAN DEFAULT TRUE COMMENT '是否启用搜索历史',
    suggestion_enabled BOOLEAN DEFAULT TRUE COMMENT '是否启用搜索建议',
    personalization_enabled BOOLEAN DEFAULT TRUE COMMENT '是否启用个性化',
    safe_search_level VARCHAR(20) DEFAULT 'moderate' COMMENT '安全搜索级别',
    results_per_page INT DEFAULT 20 COMMENT '每页结果数',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户搜索偏好表';

-- 12. 搜索补全词表
CREATE TABLE IF NOT EXISTS search_completion (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    prefix VARCHAR(50) NOT NULL COMMENT '前缀',
    completion_text VARCHAR(200) NOT NULL COMMENT '补全文本',
    completion_type VARCHAR(50) DEFAULT 'query' COMMENT '补全类型(query/entity/tag)',
    frequency INT DEFAULT 0 COMMENT '频率',
    weight DECIMAL(5,4) DEFAULT 1.0 COMMENT '权重',
    metadata JSON COMMENT '元数据',
    is_active BOOLEAN DEFAULT TRUE COMMENT '是否启用',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_prefix (prefix),
    INDEX idx_frequency (frequency DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='搜索补全词表';

-- 插入默认搜索索引配置
INSERT INTO search_index_config (index_name, index_type, table_name, field_mappings, analyzer_config) VALUES
('documents', 'document', 'document', '{"title": {"type": "text", "boost": 2.0}, "content": {"type": "text"}, "tags": {"type": "keyword"}}', '{"analyzer": "ik_max_word", "search_analyzer": "ik_smart"}'),
('tasks', 'task', 'task', '{"title": {"type": "text", "boost": 2.0}, "description": {"type": "text"}, "tags": {"type": "keyword"}}', '{"analyzer": "ik_max_word", "search_analyzer": "ik_smart"}'),
('projects', 'project', 'project', '{"name": {"type": "text", "boost": 2.0}, "description": {"type": "text"}}', '{"analyzer": "ik_max_word", "search_analyzer": "ik_smart"}'),
('knowledge', 'knowledge', 'ai_knowledge_document', '{"title": {"type": "text", "boost": 2.0}, "content": {"type": "text"}, "summary": {"type": "text"}}', '{"analyzer": "ik_max_word", "search_analyzer": "ik_smart"}');

-- 插入默认搜索意图模板
INSERT INTO search_intent_template (intent_name, intent_code, patterns, keywords, action_type, priority) VALUES
('查找文档', 'find_document', '["查找.*文档", "搜索.*文件", "找.*资料"]', '["文档", "文件", "资料"]', 'search', 10),
('查找任务', 'find_task', '["查找.*任务", "搜索.*工作", "我的任务"]', '["任务", "工作", "待办"]', 'search', 10),
('查找项目', 'find_project', '["查找.*项目", "搜索.*项目", "项目列表"]', '["项目"]', 'search', 10),
('查找人员', 'find_user', '["查找.*人", "搜索.*成员", "谁负责"]', '["人员", "成员", "负责人"]', 'search', 10),
('时间筛选', 'filter_time', '["今天.*", "本周.*", "最近.*", "上个月.*"]', '["今天", "本周", "最近", "上个月"]', 'filter', 5),
('状态筛选', 'filter_status', '["进行中.*", "已完成.*", "待处理.*"]', '["进行中", "已完成", "待处理"]', 'filter', 5);

-- 插入默认纠错词典
INSERT INTO search_correction_dict (wrong_word, correct_word, correction_type, confidence) VALUES
('文挡', '文档', 'spelling', 0.95),
('任物', '任务', 'spelling', 0.95),
('项木', '项目', 'spelling', 0.95),
('搜锁', '搜索', 'spelling', 0.95),
('wendang', '文档', 'pinyin', 0.90),
('renwu', '任务', 'pinyin', 0.90),
('xiangmu', '项目', 'pinyin', 0.90);

-- 插入默认同义词
INSERT INTO search_synonym (word_group, synonym_type, domain) VALUES
('文档,文件,资料,材料', 'equivalent', 'document'),
('任务,工作,待办,事项', 'equivalent', 'task'),
('项目,工程,计划', 'equivalent', 'project'),
('搜索,查找,检索,查询', 'equivalent', 'action'),
('创建,新建,添加,新增', 'equivalent', 'action'),
('删除,移除,清除', 'equivalent', 'action'),
('修改,编辑,更新,变更', 'equivalent', 'action');-- AI助手模块数据库脚本
-- 版本: V13.0
-- 功能: AA-001到AA-008

-- 1. AI对话会话表
CREATE TABLE IF NOT EXISTS ai_chat_session (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '会话ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    session_type VARCHAR(50) NOT NULL DEFAULT 'general' COMMENT '会话类型: general/task/document/schedule/report',
    title VARCHAR(200) COMMENT '会话标题',
    context_type VARCHAR(50) COMMENT '上下文类型: project/task/document',
    context_id BIGINT COMMENT '上下文ID',
    model_name VARCHAR(100) DEFAULT 'gpt-3.5-turbo' COMMENT '使用的模型',
    total_tokens INT DEFAULT 0 COMMENT '总Token数',
    message_count INT DEFAULT 0 COMMENT '消息数量',
    is_pinned BOOLEAN DEFAULT FALSE COMMENT '是否置顶',
    is_archived BOOLEAN DEFAULT FALSE COMMENT '是否归档',
    last_message_at DATETIME COMMENT '最后消息时间',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_user_id (user_id),
    INDEX idx_session_type (session_type),
    INDEX idx_context (context_type, context_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI对话会话表';

-- 2. AI对话消息表
CREATE TABLE IF NOT EXISTS ai_chat_message (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '消息ID',
    session_id BIGINT NOT NULL COMMENT '会话ID',
    role VARCHAR(20) NOT NULL COMMENT '角色: user/assistant/system',
    content TEXT NOT NULL COMMENT '消息内容',
    content_type VARCHAR(50) DEFAULT 'text' COMMENT '内容类型: text/markdown/code/image',
    intent_type VARCHAR(50) COMMENT '意图类型',
    intent_confidence DECIMAL(5,4) COMMENT '意图置信度',
    tokens_used INT DEFAULT 0 COMMENT '使用的Token数',
    response_time_ms INT COMMENT '响应时间(毫秒)',
    is_error BOOLEAN DEFAULT FALSE COMMENT '是否错误',
    error_message VARCHAR(500) COMMENT '错误信息',
    feedback_rating INT COMMENT '反馈评分: 1-5',
    feedback_comment VARCHAR(500) COMMENT '反馈评论',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_session_id (session_id),
    INDEX idx_role (role),
    INDEX idx_intent_type (intent_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI对话消息表';

-- 3. 任务指令表 (AA-002)
CREATE TABLE IF NOT EXISTS ai_task_command (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '指令ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    session_id BIGINT COMMENT '关联会话ID',
    command_text TEXT NOT NULL COMMENT '原始指令文本',
    command_type VARCHAR(50) NOT NULL COMMENT '指令类型: create/update/delete/query/assign/complete',
    target_type VARCHAR(50) NOT NULL COMMENT '目标类型: task/subtask/project/milestone',
    target_id BIGINT COMMENT '目标ID',
    parsed_params JSON COMMENT '解析后的参数',
    execution_status VARCHAR(20) DEFAULT 'pending' COMMENT '执行状态: pending/executing/success/failed',
    execution_result JSON COMMENT '执行结果',
    error_message VARCHAR(500) COMMENT '错误信息',
    confidence_score DECIMAL(5,4) COMMENT '置信度',
    requires_confirmation BOOLEAN DEFAULT FALSE COMMENT '是否需要确认',
    confirmed_at DATETIME COMMENT '确认时间',
    executed_at DATETIME COMMENT '执行时间',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_user_id (user_id),
    INDEX idx_command_type (command_type),
    INDEX idx_execution_status (execution_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='任务指令表';

-- 4. 工作建议表 (AA-003)
CREATE TABLE IF NOT EXISTS ai_work_suggestion (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '建议ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    suggestion_type VARCHAR(50) NOT NULL COMMENT '建议类型: priority/deadline/resource/collaboration/efficiency',
    suggestion_title VARCHAR(200) NOT NULL COMMENT '建议标题',
    suggestion_content TEXT NOT NULL COMMENT '建议内容',
    suggestion_reason TEXT COMMENT '建议原因',
    related_type VARCHAR(50) COMMENT '关联类型: task/project/schedule',
    related_id BIGINT COMMENT '关联ID',
    priority_level INT DEFAULT 3 COMMENT '优先级: 1-5',
    impact_score DECIMAL(5,2) COMMENT '影响评分',
    action_items JSON COMMENT '行动项列表',
    is_read BOOLEAN DEFAULT FALSE COMMENT '是否已读',
    is_accepted BOOLEAN COMMENT '是否采纳',
    is_dismissed BOOLEAN DEFAULT FALSE COMMENT '是否忽略',
    feedback_comment VARCHAR(500) COMMENT '反馈评论',
    valid_until DATETIME COMMENT '有效期至',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_user_id (user_id),
    INDEX idx_suggestion_type (suggestion_type),
    INDEX idx_is_read (is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工作建议表';

-- 5. 文档摘要表 (AA-004)
CREATE TABLE IF NOT EXISTS ai_document_summary (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '摘要ID',
    document_id BIGINT NOT NULL COMMENT '文档ID',
    user_id BIGINT NOT NULL COMMENT '请求用户ID',
    summary_type VARCHAR(50) NOT NULL DEFAULT 'brief' COMMENT '摘要类型: brief/detailed/bullet/executive',
    summary_content TEXT NOT NULL COMMENT '摘要内容',
    key_points JSON COMMENT '关键要点',
    word_count INT COMMENT '原文字数',
    summary_word_count INT COMMENT '摘要字数',
    compression_ratio DECIMAL(5,2) COMMENT '压缩比',
    language VARCHAR(20) DEFAULT 'zh' COMMENT '语言',
    model_used VARCHAR(100) COMMENT '使用的模型',
    tokens_used INT COMMENT '使用的Token数',
    generation_time_ms INT COMMENT '生成时间(毫秒)',
    quality_score DECIMAL(5,2) COMMENT '质量评分',
    feedback_rating INT COMMENT '用户评分',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_document_id (document_id),
    INDEX idx_user_id (user_id),
    INDEX idx_summary_type (summary_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='文档摘要表';

-- 6. 翻译记录表 (AA-005)
CREATE TABLE IF NOT EXISTS ai_translation (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '翻译ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    source_type VARCHAR(50) NOT NULL COMMENT '来源类型: text/document/message',
    source_id BIGINT COMMENT '来源ID',
    source_language VARCHAR(20) NOT NULL COMMENT '源语言',
    target_language VARCHAR(20) NOT NULL COMMENT '目标语言',
    source_text TEXT NOT NULL COMMENT '原文',
    translated_text TEXT NOT NULL COMMENT '译文',
    word_count INT COMMENT '字数',
    translation_engine VARCHAR(50) DEFAULT 'ai' COMMENT '翻译引擎: ai/google/deepl',
    model_used VARCHAR(100) COMMENT '使用的模型',
    tokens_used INT COMMENT '使用的Token数',
    translation_time_ms INT COMMENT '翻译时间(毫秒)',
    quality_score DECIMAL(5,2) COMMENT '质量评分',
    is_reviewed BOOLEAN DEFAULT FALSE COMMENT '是否已审核',
    reviewed_text TEXT COMMENT '审核后文本',
    feedback_rating INT COMMENT '用户评分',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_user_id (user_id),
    INDEX idx_source_type (source_type, source_id),
    INDEX idx_languages (source_language, target_language)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='翻译记录表';

-- 7. 数据分析建议表 (AA-006)
CREATE TABLE IF NOT EXISTS ai_data_analysis (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '分析ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    analysis_type VARCHAR(50) NOT NULL COMMENT '分析类型: project/task/team/resource/trend',
    analysis_scope VARCHAR(50) NOT NULL COMMENT '分析范围: personal/team/project/organization',
    scope_id BIGINT COMMENT '范围ID',
    time_range VARCHAR(50) COMMENT '时间范围: week/month/quarter/year',
    start_date DATE COMMENT '开始日期',
    end_date DATE COMMENT '结束日期',
    analysis_title VARCHAR(200) NOT NULL COMMENT '分析标题',
    analysis_content TEXT NOT NULL COMMENT '分析内容',
    key_findings JSON COMMENT '关键发现',
    metrics JSON COMMENT '指标数据',
    charts JSON COMMENT '图表配置',
    recommendations JSON COMMENT '建议列表',
    data_sources JSON COMMENT '数据来源',
    model_used VARCHAR(100) COMMENT '使用的模型',
    tokens_used INT COMMENT '使用的Token数',
    generation_time_ms INT COMMENT '生成时间(毫秒)',
    is_saved BOOLEAN DEFAULT FALSE COMMENT '是否保存',
    feedback_rating INT COMMENT '用户评分',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_user_id (user_id),
    INDEX idx_analysis_type (analysis_type),
    INDEX idx_analysis_scope (analysis_scope, scope_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='数据分析建议表';

-- 8. 日程建议表 (AA-007)
CREATE TABLE IF NOT EXISTS ai_schedule_suggestion (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '建议ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    suggestion_type VARCHAR(50) NOT NULL COMMENT '建议类型: optimize/conflict/reminder/focus/break',
    suggestion_date DATE NOT NULL COMMENT '建议日期',
    suggestion_title VARCHAR(200) NOT NULL COMMENT '建议标题',
    suggestion_content TEXT NOT NULL COMMENT '建议内容',
    current_schedule JSON COMMENT '当前日程',
    suggested_schedule JSON COMMENT '建议日程',
    affected_events JSON COMMENT '受影响的事件',
    optimization_score DECIMAL(5,2) COMMENT '优化评分',
    time_saved_minutes INT COMMENT '节省时间(分钟)',
    priority_level INT DEFAULT 3 COMMENT '优先级: 1-5',
    is_read BOOLEAN DEFAULT FALSE COMMENT '是否已读',
    is_applied BOOLEAN COMMENT '是否应用',
    is_dismissed BOOLEAN DEFAULT FALSE COMMENT '是否忽略',
    feedback_comment VARCHAR(500) COMMENT '反馈评论',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_user_id (user_id),
    INDEX idx_suggestion_type (suggestion_type),
    INDEX idx_suggestion_date (suggestion_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='日程建议表';

-- 9. 工作报告表 (AA-008)
CREATE TABLE IF NOT EXISTS ai_work_report (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '报告ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    report_type VARCHAR(50) NOT NULL COMMENT '报告类型: daily/weekly/monthly/project/custom',
    report_scope VARCHAR(50) NOT NULL COMMENT '报告范围: personal/team/project',
    scope_id BIGINT COMMENT '范围ID',
    report_title VARCHAR(200) NOT NULL COMMENT '报告标题',
    report_period_start DATE COMMENT '报告周期开始',
    report_period_end DATE COMMENT '报告周期结束',
    report_content TEXT NOT NULL COMMENT '报告内容',
    summary TEXT COMMENT '摘要',
    accomplishments JSON COMMENT '完成事项',
    in_progress JSON COMMENT '进行中事项',
    blockers JSON COMMENT '阻塞问题',
    next_steps JSON COMMENT '下一步计划',
    metrics JSON COMMENT '指标数据',
    charts JSON COMMENT '图表配置',
    attachments JSON COMMENT '附件列表',
    model_used VARCHAR(100) COMMENT '使用的模型',
    tokens_used INT COMMENT '使用的Token数',
    generation_time_ms INT COMMENT '生成时间(毫秒)',
    is_draft BOOLEAN DEFAULT TRUE COMMENT '是否草稿',
    is_sent BOOLEAN DEFAULT FALSE COMMENT '是否已发送',
    sent_to JSON COMMENT '发送对象',
    sent_at DATETIME COMMENT '发送时间',
    feedback_rating INT COMMENT '用户评分',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_user_id (user_id),
    INDEX idx_report_type (report_type),
    INDEX idx_report_scope (report_scope, scope_id),
    INDEX idx_report_period (report_period_start, report_period_end)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工作报告表';

-- 10. AI助手配置表
CREATE TABLE IF NOT EXISTS ai_assistant_config (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '配置ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    assistant_name VARCHAR(100) DEFAULT 'Mota助手' COMMENT '助手名称',
    assistant_avatar VARCHAR(500) COMMENT '助手头像',
    default_model VARCHAR(100) DEFAULT 'gpt-3.5-turbo' COMMENT '默认模型',
    temperature DECIMAL(3,2) DEFAULT 0.7 COMMENT '温度参数',
    max_tokens INT DEFAULT 2000 COMMENT '最大Token数',
    enable_context BOOLEAN DEFAULT TRUE COMMENT '启用上下文',
    context_window INT DEFAULT 10 COMMENT '上下文窗口大小',
    enable_suggestions BOOLEAN DEFAULT TRUE COMMENT '启用建议',
    suggestion_frequency VARCHAR(20) DEFAULT 'daily' COMMENT '建议频率',
    enable_auto_summary BOOLEAN DEFAULT TRUE COMMENT '启用自动摘要',
    enable_auto_translation BOOLEAN DEFAULT FALSE COMMENT '启用自动翻译',
    preferred_language VARCHAR(20) DEFAULT 'zh' COMMENT '首选语言',
    report_schedule JSON COMMENT '报告计划',
    notification_settings JSON COMMENT '通知设置',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY uk_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI助手配置表';

-- 11. AI快捷指令表
CREATE TABLE IF NOT EXISTS ai_quick_command (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '指令ID',
    user_id BIGINT COMMENT '用户ID(NULL表示系统预置)',
    command_name VARCHAR(100) NOT NULL COMMENT '指令名称',
    command_shortcut VARCHAR(50) COMMENT '快捷键',
    command_template TEXT NOT NULL COMMENT '指令模板',
    command_category VARCHAR(50) NOT NULL COMMENT '指令分类: task/document/schedule/report/analysis',
    description VARCHAR(500) COMMENT '描述',
    parameters JSON COMMENT '参数定义',
    is_system BOOLEAN DEFAULT FALSE COMMENT '是否系统预置',
    is_enabled BOOLEAN DEFAULT TRUE COMMENT '是否启用',
    usage_count INT DEFAULT 0 COMMENT '使用次数',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_user_id (user_id),
    INDEX idx_command_category (command_category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI快捷指令表';

-- 12. AI使用统计表
CREATE TABLE IF NOT EXISTS ai_usage_stats (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '统计ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    stats_date DATE NOT NULL COMMENT '统计日期',
    feature_type VARCHAR(50) NOT NULL COMMENT '功能类型: chat/command/suggestion/summary/translation/analysis/schedule/report',
    request_count INT DEFAULT 0 COMMENT '请求次数',
    tokens_used INT DEFAULT 0 COMMENT '使用Token数',
    success_count INT DEFAULT 0 COMMENT '成功次数',
    error_count INT DEFAULT 0 COMMENT '错误次数',
    avg_response_time_ms INT COMMENT '平均响应时间',
    feedback_positive INT DEFAULT 0 COMMENT '正面反馈数',
    feedback_negative INT DEFAULT 0 COMMENT '负面反馈数',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY uk_user_date_feature (user_id, stats_date, feature_type),
    INDEX idx_stats_date (stats_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI使用统计表';

-- 插入系统预置快捷指令
INSERT INTO ai_quick_command (command_name, command_shortcut, command_template, command_category, description, is_system) VALUES
('创建任务', '/task', '创建一个任务：{task_name}，截止日期：{due_date}，优先级：{priority}', 'task', '快速创建任务', TRUE),
('查询任务', '/mytasks', '查询我今天需要完成的任务', 'task', '查询今日任务', TRUE),
('完成任务', '/done', '将任务 {task_name} 标记为已完成', 'task', '完成任务', TRUE),
('生成摘要', '/summary', '为以下内容生成摘要：{content}', 'document', '生成文档摘要', TRUE),
('翻译文本', '/translate', '将以下内容翻译成{target_language}：{content}', 'document', '翻译文本', TRUE),
('今日日程', '/today', '查看我今天的日程安排', 'schedule', '查看今日日程', TRUE),
('安排会议', '/meeting', '安排一个会议：{meeting_title}，时间：{meeting_time}，参与者：{participants}', 'schedule', '安排会议', TRUE),
('日报生成', '/daily', '生成今天的工作日报', 'report', '生成日报', TRUE),
('周报生成', '/weekly', '生成本周的工作周报', 'report', '生成周报', TRUE),
('数据分析', '/analyze', '分析{scope}的{metric}数据', 'analysis', '数据分析', TRUE);-- V14.0 多模型支持数据库脚本

-- 1. AI模型提供商表
CREATE TABLE IF NOT EXISTS ai_model_provider (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    provider_code VARCHAR(50) NOT NULL COMMENT '提供商代码',
    provider_name VARCHAR(100) NOT NULL COMMENT '提供商名称',
    provider_type VARCHAR(50) NOT NULL COMMENT '类型(international/domestic)',
    api_base_url VARCHAR(500) COMMENT 'API基础URL',
    auth_type VARCHAR(50) DEFAULT 'api_key' COMMENT '认证类型',
    api_key_encrypted VARCHAR(500) COMMENT '加密API密钥',
    secret_key_encrypted VARCHAR(500) COMMENT '加密密钥',
    is_enabled BOOLEAN DEFAULT TRUE,
    priority INT DEFAULT 0,
    rate_limit_rpm INT DEFAULT 60,
    timeout_seconds INT DEFAULT 60,
    retry_count INT DEFAULT 3,
    health_status VARCHAR(20) DEFAULT 'unknown',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_code (provider_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. 模型路由规则表（注：ai_model_config表已在V9.0中定义）
CREATE TABLE IF NOT EXISTS ai_model_routing_rule (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    rule_name VARCHAR(100) NOT NULL,
    rule_type VARCHAR(50) NOT NULL,
    priority INT DEFAULT 0,
    conditions JSON,
    target_model_id BIGINT,
    weight INT DEFAULT 100,
    is_enabled BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. 模型降级策略表
CREATE TABLE IF NOT EXISTS ai_model_fallback (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    strategy_name VARCHAR(100) NOT NULL,
    primary_model_id BIGINT NOT NULL,
    fallback_model_ids JSON NOT NULL,
    max_retries INT DEFAULT 3,
    retry_delay_ms INT DEFAULT 1000,
    circuit_breaker_enabled BOOLEAN DEFAULT TRUE,
    circuit_breaker_threshold INT DEFAULT 5,
    is_enabled BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. AI成本预算表
CREATE TABLE IF NOT EXISTS ai_cost_budget (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    budget_type VARCHAR(50) NOT NULL,
    budget_scope_id BIGINT,
    budget_period VARCHAR(20) NOT NULL,
    budget_amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'CNY',
    alert_threshold INT DEFAULT 80,
    hard_limit BOOLEAN DEFAULT FALSE,
    current_usage DECIMAL(12,2) DEFAULT 0,
    period_start DATE,
    period_end DATE,
    is_enabled BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. AI调用记录表
CREATE TABLE IF NOT EXISTS ai_call_log (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    provider_id BIGINT NOT NULL,
    model_id BIGINT NOT NULL,
    model_code VARCHAR(100) NOT NULL,
    call_type VARCHAR(50) NOT NULL,
    input_tokens INT DEFAULT 0,
    output_tokens INT DEFAULT 0,
    total_cost DECIMAL(10,6) DEFAULT 0,
    response_time_ms INT,
    status VARCHAR(20) NOT NULL,
    error_code VARCHAR(50),
    is_fallback BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    KEY idx_user (user_id),
    KEY idx_model (model_id),
    KEY idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. 成本统计表
CREATE TABLE IF NOT EXISTS ai_cost_stats (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    stats_date DATE NOT NULL,
    stats_type VARCHAR(50) NOT NULL,
    scope_id BIGINT,
    provider_id BIGINT,
    model_id BIGINT,
    call_count INT DEFAULT 0,
    total_tokens INT DEFAULT 0,
    total_cost DECIMAL(12,4) DEFAULT 0,
    avg_response_time INT DEFAULT 0,
    success_rate DECIMAL(5,2) DEFAULT 100,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_stats (stats_date, stats_type, scope_id, provider_id, model_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. 熔断器状态表
CREATE TABLE IF NOT EXISTS ai_circuit_breaker (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    model_id BIGINT NOT NULL,
    state VARCHAR(20) NOT NULL DEFAULT 'closed',
    failure_count INT DEFAULT 0,
    last_failure_time DATETIME,
    open_time DATETIME,
    half_open_time DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_model (model_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 插入默认提供商数据
INSERT INTO ai_model_provider (provider_code, provider_name, provider_type, api_base_url, is_enabled, priority) VALUES
('openai', 'OpenAI', 'international', 'https://api.openai.com/v1', TRUE, 100),
('anthropic', 'Anthropic', 'international', 'https://api.anthropic.com/v1', TRUE, 90),
('aliyun', '阿里云通义千问', 'domestic', 'https://dashscope.aliyuncs.com/api/v1', TRUE, 80),
('baidu', '百度文心一言', 'domestic', 'https://aip.baidubce.com', TRUE, 70);

-- 注：ai_model_config的默认数据已在V9.0中插入，此处不再重复插入

-- 插入默认路由规则
INSERT INTO ai_model_routing_rule (rule_name, rule_type, priority, conditions, target_model_id, weight, is_enabled) VALUES
('默认路由', 'default', 0, '{}', 3, 100, TRUE),
('高级用户路由', 'user_level', 10, '{"user_level": "premium"}', 1, 100, TRUE),
('成本优先路由', 'cost', 5, '{"max_cost_per_call": 0.01}', 3, 100, TRUE);

-- 插入默认降级策略
INSERT INTO ai_model_fallback (strategy_name, primary_model_id, fallback_model_ids, max_retries, is_enabled) VALUES
('GPT-4降级策略', 1, '[2, 3]', 3, TRUE),
('Claude降级策略', 4, '[5, 3]', 3, TRUE),
('国内模型降级策略', 6, '[7, 8, 9]', 3, TRUE);

-- 插入默认预算
INSERT INTO ai_cost_budget (budget_type, budget_period, budget_amount, currency, alert_threshold, is_enabled) VALUES
('global', 'monthly', 10000.00, 'CNY', 80, TRUE);-- =====================================================
-- V15.0 系统管理模块增强
-- 包含：SSO登录、岗位管理、人员调动、组织架构图、数据权限、
--       新闻源配置、外部集成、数据变更日志、审计报告、合规检查
-- =====================================================

-- =====================================================
-- 1. SSO登录相关表
-- =====================================================

-- SSO提供商配置表
CREATE TABLE IF NOT EXISTS sys_sso_provider (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    provider_code VARCHAR(50) NOT NULL COMMENT '提供商代码（如：oauth2、saml、ldap、cas）',
    provider_name VARCHAR(100) NOT NULL COMMENT '提供商名称',
    provider_type VARCHAR(20) NOT NULL COMMENT '提供商类型（OAUTH2、SAML、LDAP、CAS）',
    client_id VARCHAR(255) COMMENT 'OAuth2客户端ID',
    client_secret VARCHAR(500) COMMENT 'OAuth2客户端密钥',
    authorization_url VARCHAR(500) COMMENT '授权URL',
    token_url VARCHAR(500) COMMENT 'Token获取URL',
    user_info_url VARCHAR(500) COMMENT '用户信息URL',
    logout_url VARCHAR(500) COMMENT '登出URL',
    redirect_uri VARCHAR(500) COMMENT '回调URL',
    scope VARCHAR(255) COMMENT '授权范围',
    ldap_url VARCHAR(500) COMMENT 'LDAP服务器URL',
    ldap_base_dn VARCHAR(255) COMMENT 'LDAP基础DN',
    ldap_user_dn VARCHAR(255) COMMENT 'LDAP用户DN',
    ldap_password VARCHAR(255) COMMENT 'LDAP密码',
    ldap_user_filter VARCHAR(255) COMMENT 'LDAP用户过滤器',
    saml_metadata_url VARCHAR(500) COMMENT 'SAML元数据URL',
    saml_entity_id VARCHAR(255) COMMENT 'SAML实体ID',
    saml_certificate TEXT COMMENT 'SAML证书',
    attribute_mapping JSON COMMENT '属性映射配置',
    auto_create_user TINYINT(1) DEFAULT 1 COMMENT '是否自动创建用户',
    default_role_id BIGINT COMMENT '默认角色ID',
    status TINYINT(1) DEFAULT 1 COMMENT '状态（1启用 0禁用）',
    sort_order INT DEFAULT 0 COMMENT '排序',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY uk_provider_code (provider_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='SSO提供商配置表';

-- SSO登录记录表
CREATE TABLE IF NOT EXISTS sys_sso_login_log (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    provider_id BIGINT NOT NULL COMMENT 'SSO提供商ID',
    provider_code VARCHAR(50) NOT NULL COMMENT '提供商代码',
    external_user_id VARCHAR(255) COMMENT '外部用户ID',
    local_user_id BIGINT COMMENT '本地用户ID',
    login_status VARCHAR(20) NOT NULL COMMENT '登录状态（SUCCESS、FAILED、PENDING）',
    error_message TEXT COMMENT '错误信息',
    login_ip VARCHAR(50) COMMENT '登录IP',
    user_agent VARCHAR(500) COMMENT '用户代理',
    raw_response TEXT COMMENT '原始响应数据',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_provider_id (provider_id),
    INDEX idx_local_user_id (local_user_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='SSO登录记录表';

-- 用户SSO绑定表
CREATE TABLE IF NOT EXISTS sys_user_sso_binding (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    provider_id BIGINT NOT NULL COMMENT 'SSO提供商ID',
    provider_code VARCHAR(50) NOT NULL COMMENT '提供商代码',
    external_user_id VARCHAR(255) NOT NULL COMMENT '外部用户ID',
    external_username VARCHAR(100) COMMENT '外部用户名',
    external_email VARCHAR(100) COMMENT '外部邮箱',
    external_avatar VARCHAR(500) COMMENT '外部头像',
    access_token TEXT COMMENT '访问令牌',
    refresh_token TEXT COMMENT '刷新令牌',
    token_expires_at DATETIME COMMENT '令牌过期时间',
    extra_data JSON COMMENT '额外数据',
    bind_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '绑定时间',
    last_login_at DATETIME COMMENT '最后登录时间',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY uk_user_provider (user_id, provider_id),
    UNIQUE KEY uk_provider_external (provider_id, external_user_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户SSO绑定表';

-- =====================================================
-- 2. 岗位管理相关表
-- =====================================================

-- 岗位表
CREATE TABLE IF NOT EXISTS sys_position (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    org_id BIGINT NOT NULL COMMENT '组织ID',
    position_code VARCHAR(50) NOT NULL COMMENT '岗位编码',
    position_name VARCHAR(100) NOT NULL COMMENT '岗位名称',
    position_level INT DEFAULT 1 COMMENT '岗位级别（1-10）',
    position_category VARCHAR(50) COMMENT '岗位类别（管理类、技术类、业务类等）',
    parent_id BIGINT DEFAULT 0 COMMENT '上级岗位ID',
    department_id BIGINT COMMENT '所属部门ID',
    description TEXT COMMENT '岗位描述',
    responsibilities TEXT COMMENT '岗位职责',
    requirements TEXT COMMENT '任职要求',
    headcount INT DEFAULT 1 COMMENT '编制人数',
    current_count INT DEFAULT 0 COMMENT '当前人数',
    salary_min DECIMAL(12,2) COMMENT '薪资下限',
    salary_max DECIMAL(12,2) COMMENT '薪资上限',
    status TINYINT(1) DEFAULT 1 COMMENT '状态（1启用 0禁用）',
    sort_order INT DEFAULT 0 COMMENT '排序',
    created_by BIGINT COMMENT '创建人',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted_at DATETIME COMMENT '删除时间',
    UNIQUE KEY uk_org_code (org_id, position_code),
    INDEX idx_org_id (org_id),
    INDEX idx_department_id (department_id),
    INDEX idx_parent_id (parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='岗位表';

-- 用户岗位关联表
CREATE TABLE IF NOT EXISTS sys_user_position (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    position_id BIGINT NOT NULL COMMENT '岗位ID',
    is_primary TINYINT(1) DEFAULT 0 COMMENT '是否主岗位',
    start_date DATE COMMENT '任职开始日期',
    end_date DATE COMMENT '任职结束日期',
    appointment_type VARCHAR(20) DEFAULT 'FORMAL' COMMENT '任命类型（FORMAL正式、ACTING代理、TEMPORARY临时）',
    remark VARCHAR(500) COMMENT '备注',
    created_by BIGINT COMMENT '创建人',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY uk_user_position (user_id, position_id),
    INDEX idx_user_id (user_id),
    INDEX idx_position_id (position_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户岗位关联表';

-- =====================================================
-- 3. 人员调动相关表
-- =====================================================

-- 人员调动记录表
CREATE TABLE IF NOT EXISTS sys_personnel_transfer (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    transfer_no VARCHAR(50) NOT NULL COMMENT '调动单号',
    user_id BIGINT NOT NULL COMMENT '被调动用户ID',
    transfer_type VARCHAR(20) NOT NULL COMMENT '调动类型（DEPARTMENT部门调动、POSITION岗位调动、PROMOTION晋升、DEMOTION降级、TRANSFER调岗）',
    from_department_id BIGINT COMMENT '原部门ID',
    to_department_id BIGINT COMMENT '目标部门ID',
    from_position_id BIGINT COMMENT '原岗位ID',
    to_position_id BIGINT COMMENT '目标岗位ID',
    from_org_id BIGINT COMMENT '原组织ID',
    to_org_id BIGINT COMMENT '目标组织ID',
    transfer_reason TEXT COMMENT '调动原因',
    effective_date DATE NOT NULL COMMENT '生效日期',
    status VARCHAR(20) DEFAULT 'PENDING' COMMENT '状态（PENDING待审批、APPROVED已批准、REJECTED已拒绝、EXECUTED已执行、CANCELLED已取消）',
    applicant_id BIGINT COMMENT '申请人ID',
    apply_time DATETIME COMMENT '申请时间',
    approver_id BIGINT COMMENT '审批人ID',
    approve_time DATETIME COMMENT '审批时间',
    approve_remark VARCHAR(500) COMMENT '审批备注',
    executor_id BIGINT COMMENT '执行人ID',
    execute_time DATETIME COMMENT '执行时间',
    attachment_ids JSON COMMENT '附件ID列表',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY uk_transfer_no (transfer_no),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_effective_date (effective_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='人员调动记录表';

-- 人员调动审批流程表
CREATE TABLE IF NOT EXISTS sys_transfer_approval (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    transfer_id BIGINT NOT NULL COMMENT '调动记录ID',
    step_order INT NOT NULL COMMENT '审批步骤顺序',
    approver_id BIGINT NOT NULL COMMENT '审批人ID',
    approver_type VARCHAR(20) DEFAULT 'USER' COMMENT '审批人类型（USER用户、ROLE角色、DEPARTMENT部门负责人）',
    status VARCHAR(20) DEFAULT 'PENDING' COMMENT '状态（PENDING待审批、APPROVED已批准、REJECTED已拒绝、SKIPPED已跳过）',
    approve_time DATETIME COMMENT '审批时间',
    remark VARCHAR(500) COMMENT '审批意见',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_transfer_id (transfer_id),
    INDEX idx_approver_id (approver_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='人员调动审批流程表';

-- =====================================================
-- 4. 组织架构图相关表
-- =====================================================

-- 组织架构图配置表
CREATE TABLE IF NOT EXISTS sys_org_chart_config (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    org_id BIGINT NOT NULL COMMENT '组织ID',
    chart_name VARCHAR(100) NOT NULL COMMENT '架构图名称',
    chart_type VARCHAR(20) DEFAULT 'TREE' COMMENT '图表类型（TREE树形、MATRIX矩阵、NETWORK网络）',
    layout_direction VARCHAR(20) DEFAULT 'TB' COMMENT '布局方向（TB上下、BT下上、LR左右、RL右左）',
    show_avatar TINYINT(1) DEFAULT 1 COMMENT '是否显示头像',
    show_position TINYINT(1) DEFAULT 1 COMMENT '是否显示岗位',
    show_department TINYINT(1) DEFAULT 1 COMMENT '是否显示部门',
    show_headcount TINYINT(1) DEFAULT 0 COMMENT '是否显示人数',
    node_color_scheme VARCHAR(50) DEFAULT 'DEFAULT' COMMENT '节点配色方案',
    custom_styles JSON COMMENT '自定义样式',
    is_default TINYINT(1) DEFAULT 0 COMMENT '是否默认配置',
    created_by BIGINT COMMENT '创建人',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_org_id (org_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='组织架构图配置表';

-- 组织架构快照表（用于历史对比）
CREATE TABLE IF NOT EXISTS sys_org_chart_snapshot (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    org_id BIGINT NOT NULL COMMENT '组织ID',
    snapshot_name VARCHAR(100) NOT NULL COMMENT '快照名称',
    snapshot_date DATE NOT NULL COMMENT '快照日期',
    snapshot_data JSON NOT NULL COMMENT '快照数据（完整的组织架构JSON）',
    department_count INT DEFAULT 0 COMMENT '部门数量',
    position_count INT DEFAULT 0 COMMENT '岗位数量',
    user_count INT DEFAULT 0 COMMENT '人员数量',
    description VARCHAR(500) COMMENT '描述',
    created_by BIGINT COMMENT '创建人',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_org_id (org_id),
    INDEX idx_snapshot_date (snapshot_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='组织架构快照表';

-- =====================================================
-- 5. 数据权限相关表
-- =====================================================

-- 数据权限规则表
CREATE TABLE IF NOT EXISTS sys_data_permission_rule (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    rule_name VARCHAR(100) NOT NULL COMMENT '规则名称',
    rule_code VARCHAR(50) NOT NULL COMMENT '规则编码',
    resource_type VARCHAR(50) NOT NULL COMMENT '资源类型（PROJECT项目、TASK任务、DOCUMENT文档等）',
    scope_type VARCHAR(20) NOT NULL COMMENT '范围类型（ALL全部、SELF本人、DEPARTMENT本部门、DEPARTMENT_AND_BELOW本部门及下级、CUSTOM自定义）',
    scope_value JSON COMMENT '范围值（自定义时使用）',
    condition_expression TEXT COMMENT '条件表达式（SQL片段或SpEL表达式）',
    description VARCHAR(500) COMMENT '规则描述',
    status TINYINT(1) DEFAULT 1 COMMENT '状态（1启用 0禁用）',
    priority INT DEFAULT 0 COMMENT '优先级（数值越大优先级越高）',
    created_by BIGINT COMMENT '创建人',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY uk_rule_code (rule_code),
    INDEX idx_resource_type (resource_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='数据权限规则表';

-- 角色数据权限关联表
CREATE TABLE IF NOT EXISTS sys_role_data_permission (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    role_id BIGINT NOT NULL COMMENT '角色ID',
    rule_id BIGINT NOT NULL COMMENT '数据权限规则ID',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    UNIQUE KEY uk_role_rule (role_id, rule_id),
    INDEX idx_role_id (role_id),
    INDEX idx_rule_id (rule_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色数据权限关联表';

-- 用户数据权限关联表（用于特殊授权）
CREATE TABLE IF NOT EXISTS sys_user_data_permission (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    rule_id BIGINT NOT NULL COMMENT '数据权限规则ID',
    grant_type VARCHAR(20) DEFAULT 'GRANT' COMMENT '授权类型（GRANT授予、DENY拒绝）',
    expire_time DATETIME COMMENT '过期时间',
    created_by BIGINT COMMENT '授权人',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    UNIQUE KEY uk_user_rule (user_id, rule_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户数据权限关联表';

-- =====================================================
-- 6. 新闻源配置相关表
-- =====================================================

-- 新闻数据源配置表
CREATE TABLE IF NOT EXISTS sys_news_source_config (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    source_name VARCHAR(100) NOT NULL COMMENT '数据源名称',
    source_code VARCHAR(50) NOT NULL COMMENT '数据源编码',
    source_type VARCHAR(20) NOT NULL COMMENT '数据源类型（RSS、API、CRAWLER、MANUAL）',
    source_url VARCHAR(500) COMMENT '数据源URL',
    api_key VARCHAR(255) COMMENT 'API密钥',
    api_secret VARCHAR(255) COMMENT 'API密钥',
    request_headers JSON COMMENT '请求头配置',
    request_params JSON COMMENT '请求参数配置',
    parse_rules JSON COMMENT '解析规则配置',
    category VARCHAR(50) COMMENT '新闻分类',
    language VARCHAR(10) DEFAULT 'zh-CN' COMMENT '语言',
    fetch_interval INT DEFAULT 3600 COMMENT '抓取间隔（秒）',
    last_fetch_time DATETIME COMMENT '最后抓取时间',
    last_fetch_count INT DEFAULT 0 COMMENT '最后抓取数量',
    total_fetch_count INT DEFAULT 0 COMMENT '总抓取数量',
    status TINYINT(1) DEFAULT 1 COMMENT '状态（1启用 0禁用）',
    priority INT DEFAULT 0 COMMENT '优先级',
    created_by BIGINT COMMENT '创建人',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY uk_source_code (source_code),
    INDEX idx_source_type (source_type),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='新闻数据源配置表';

-- 新闻源抓取日志表
CREATE TABLE IF NOT EXISTS sys_news_source_fetch_log (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    source_id BIGINT NOT NULL COMMENT '数据源ID',
    fetch_time DATETIME NOT NULL COMMENT '抓取时间',
    fetch_status VARCHAR(20) NOT NULL COMMENT '抓取状态（SUCCESS、FAILED、PARTIAL）',
    fetch_count INT DEFAULT 0 COMMENT '抓取数量',
    new_count INT DEFAULT 0 COMMENT '新增数量',
    update_count INT DEFAULT 0 COMMENT '更新数量',
    error_count INT DEFAULT 0 COMMENT '错误数量',
    error_message TEXT COMMENT '错误信息',
    duration_ms INT COMMENT '耗时（毫秒）',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_source_id (source_id),
    INDEX idx_fetch_time (fetch_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='新闻源抓取日志表';

-- =====================================================
-- 7. 外部集成相关表
-- =====================================================

-- 外部服务集成配置表
CREATE TABLE IF NOT EXISTS sys_external_integration (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    integration_name VARCHAR(100) NOT NULL COMMENT '集成名称',
    integration_code VARCHAR(50) NOT NULL COMMENT '集成编码',
    integration_type VARCHAR(50) NOT NULL COMMENT '集成类型（WECHAT_WORK企业微信、DINGTALK钉钉、FEISHU飞书、GITLAB、JIRA、CONFLUENCE等）',
    app_id VARCHAR(255) COMMENT '应用ID',
    app_secret VARCHAR(500) COMMENT '应用密钥',
    access_token TEXT COMMENT '访问令牌',
    refresh_token TEXT COMMENT '刷新令牌',
    token_expires_at DATETIME COMMENT '令牌过期时间',
    webhook_url VARCHAR(500) COMMENT 'Webhook URL',
    callback_url VARCHAR(500) COMMENT '回调URL',
    api_base_url VARCHAR(500) COMMENT 'API基础URL',
    extra_config JSON COMMENT '额外配置',
    sync_config JSON COMMENT '同步配置',
    last_sync_time DATETIME COMMENT '最后同步时间',
    status TINYINT(1) DEFAULT 1 COMMENT '状态（1启用 0禁用）',
    created_by BIGINT COMMENT '创建人',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY uk_integration_code (integration_code),
    INDEX idx_integration_type (integration_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='外部服务集成配置表';

-- 外部集成同步日志表
CREATE TABLE IF NOT EXISTS sys_integration_sync_log (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    integration_id BIGINT NOT NULL COMMENT '集成ID',
    sync_type VARCHAR(50) NOT NULL COMMENT '同步类型（USER用户、DEPARTMENT部门、MESSAGE消息、TASK任务等）',
    sync_direction VARCHAR(20) NOT NULL COMMENT '同步方向（PUSH推送、PULL拉取、BIDIRECTIONAL双向）',
    sync_status VARCHAR(20) NOT NULL COMMENT '同步状态（SUCCESS、FAILED、PARTIAL）',
    total_count INT DEFAULT 0 COMMENT '总数量',
    success_count INT DEFAULT 0 COMMENT '成功数量',
    failed_count INT DEFAULT 0 COMMENT '失败数量',
    error_details JSON COMMENT '错误详情',
    sync_time DATETIME NOT NULL COMMENT '同步时间',
    duration_ms INT COMMENT '耗时（毫秒）',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_integration_id (integration_id),
    INDEX idx_sync_time (sync_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='外部集成同步日志表';

-- =====================================================
-- 8. 数据变更日志相关表
-- =====================================================

-- 数据变更日志表
CREATE TABLE IF NOT EXISTS sys_data_change_log (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    table_name VARCHAR(100) NOT NULL COMMENT '表名',
    record_id VARCHAR(100) NOT NULL COMMENT '记录ID',
    operation_type VARCHAR(20) NOT NULL COMMENT '操作类型（INSERT、UPDATE、DELETE）',
    old_data JSON COMMENT '变更前数据',
    new_data JSON COMMENT '变更后数据',
    changed_fields JSON COMMENT '变更字段列表',
    change_summary VARCHAR(500) COMMENT '变更摘要',
    operator_id BIGINT COMMENT '操作人ID',
    operator_name VARCHAR(50) COMMENT '操作人姓名',
    operator_ip VARCHAR(50) COMMENT '操作人IP',
    operation_time DATETIME NOT NULL COMMENT '操作时间',
    request_id VARCHAR(100) COMMENT '请求ID（用于追踪）',
    module_name VARCHAR(50) COMMENT '模块名称',
    business_type VARCHAR(50) COMMENT '业务类型',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_table_record (table_name, record_id),
    INDEX idx_operator_id (operator_id),
    INDEX idx_operation_time (operation_time),
    INDEX idx_request_id (request_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='数据变更日志表';

-- 数据变更订阅表（用于通知相关人员）
CREATE TABLE IF NOT EXISTS sys_data_change_subscription (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    user_id BIGINT NOT NULL COMMENT '订阅用户ID',
    table_name VARCHAR(100) NOT NULL COMMENT '订阅表名',
    record_id VARCHAR(100) COMMENT '订阅记录ID（为空表示订阅整个表）',
    operation_types VARCHAR(100) DEFAULT 'INSERT,UPDATE,DELETE' COMMENT '订阅操作类型',
    notify_method VARCHAR(50) DEFAULT 'NOTIFICATION' COMMENT '通知方式（NOTIFICATION站内、EMAIL邮件、WEBHOOK）',
    webhook_url VARCHAR(500) COMMENT 'Webhook URL',
    status TINYINT(1) DEFAULT 1 COMMENT '状态（1启用 0禁用）',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_user_id (user_id),
    INDEX idx_table_name (table_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='数据变更订阅表';

-- =====================================================
-- 9. 审计报告相关表
-- =====================================================

-- 审计报告表
CREATE TABLE IF NOT EXISTS sys_audit_report (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    report_no VARCHAR(50) NOT NULL COMMENT '报告编号',
    report_name VARCHAR(200) NOT NULL COMMENT '报告名称',
    report_type VARCHAR(50) NOT NULL COMMENT '报告类型（OPERATION操作审计、SECURITY安全审计、DATA数据审计、COMPLIANCE合规审计）',
    report_period_start DATE NOT NULL COMMENT '报告周期开始',
    report_period_end DATE NOT NULL COMMENT '报告周期结束',
    report_scope JSON COMMENT '报告范围（部门、用户、模块等）',
    summary TEXT COMMENT '报告摘要',
    findings JSON COMMENT '审计发现',
    statistics JSON COMMENT '统计数据',
    recommendations JSON COMMENT '改进建议',
    risk_level VARCHAR(20) COMMENT '风险等级（LOW、MEDIUM、HIGH、CRITICAL）',
    report_status VARCHAR(20) DEFAULT 'DRAFT' COMMENT '报告状态（DRAFT草稿、REVIEWING审核中、PUBLISHED已发布、ARCHIVED已归档）',
    report_file_url VARCHAR(500) COMMENT '报告文件URL',
    generated_by BIGINT COMMENT '生成人',
    generated_at DATETIME COMMENT '生成时间',
    reviewed_by BIGINT COMMENT '审核人',
    reviewed_at DATETIME COMMENT '审核时间',
    published_by BIGINT COMMENT '发布人',
    published_at DATETIME COMMENT '发布时间',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY uk_report_no (report_no),
    INDEX idx_report_type (report_type),
    INDEX idx_report_status (report_status),
    INDEX idx_report_period (report_period_start, report_period_end)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='审计报告表';

-- 审计报告模板表
CREATE TABLE IF NOT EXISTS sys_audit_report_template (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    template_name VARCHAR(100) NOT NULL COMMENT '模板名称',
    template_code VARCHAR(50) NOT NULL COMMENT '模板编码',
    report_type VARCHAR(50) NOT NULL COMMENT '报告类型',
    template_content TEXT COMMENT '模板内容',
    data_queries JSON COMMENT '数据查询配置',
    chart_configs JSON COMMENT '图表配置',
    is_default TINYINT(1) DEFAULT 0 COMMENT '是否默认模板',
    status TINYINT(1) DEFAULT 1 COMMENT '状态（1启用 0禁用）',
    created_by BIGINT COMMENT '创建人',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY uk_template_code (template_code),
    INDEX idx_report_type (report_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='审计报告模板表';

-- 审计报告定时任务表
CREATE TABLE IF NOT EXISTS sys_audit_report_schedule (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    schedule_name VARCHAR(100) NOT NULL COMMENT '任务名称',
    template_id BIGINT NOT NULL COMMENT '模板ID',
    schedule_type VARCHAR(20) NOT NULL COMMENT '调度类型（DAILY日报、WEEKLY周报、MONTHLY月报、QUARTERLY季报、YEARLY年报）',
    cron_expression VARCHAR(100) COMMENT 'Cron表达式',
    report_scope JSON COMMENT '报告范围',
    recipients JSON COMMENT '接收人列表',
    notify_method VARCHAR(50) DEFAULT 'EMAIL' COMMENT '通知方式',
    last_run_time DATETIME COMMENT '最后运行时间',
    next_run_time DATETIME COMMENT '下次运行时间',
    status TINYINT(1) DEFAULT 1 COMMENT '状态（1启用 0禁用）',
    created_by BIGINT COMMENT '创建人',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_template_id (template_id),
    INDEX idx_next_run_time (next_run_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='审计报告定时任务表';

-- =====================================================
-- 10. 合规检查相关表
-- =====================================================

-- 合规规则表
CREATE TABLE IF NOT EXISTS sys_compliance_rule (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    rule_name VARCHAR(100) NOT NULL COMMENT '规则名称',
    rule_code VARCHAR(50) NOT NULL COMMENT '规则编码',
    rule_category VARCHAR(50) NOT NULL COMMENT '规则类别（SECURITY安全、PRIVACY隐私、DATA_PROTECTION数据保护、ACCESS_CONTROL访问控制等）',
    rule_description TEXT COMMENT '规则描述',
    check_type VARCHAR(20) NOT NULL COMMENT '检查类型（REALTIME实时、SCHEDULED定时、MANUAL手动）',
    check_expression TEXT COMMENT '检查表达式（SQL或脚本）',
    check_params JSON COMMENT '检查参数',
    severity VARCHAR(20) DEFAULT 'MEDIUM' COMMENT '严重程度（LOW、MEDIUM、HIGH、CRITICAL）',
    remediation_steps TEXT COMMENT '修复步骤',
    reference_standard VARCHAR(200) COMMENT '参考标准（如ISO27001、GDPR等）',
    status TINYINT(1) DEFAULT 1 COMMENT '状态（1启用 0禁用）',
    created_by BIGINT COMMENT '创建人',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY uk_rule_code (rule_code),
    INDEX idx_rule_category (rule_category),
    INDEX idx_check_type (check_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='合规规则表';

-- 合规检查记录表
CREATE TABLE IF NOT EXISTS sys_compliance_check_record (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    check_batch_no VARCHAR(50) NOT NULL COMMENT '检查批次号',
    rule_id BIGINT NOT NULL COMMENT '规则ID',
    rule_code VARCHAR(50) NOT NULL COMMENT '规则编码',
    check_time DATETIME NOT NULL COMMENT '检查时间',
    check_result VARCHAR(20) NOT NULL COMMENT '检查结果（PASS通过、FAIL失败、WARNING警告、ERROR错误）',
    affected_count INT DEFAULT 0 COMMENT '影响数量',
    affected_items JSON COMMENT '影响项目详情',
    check_details JSON COMMENT '检查详情',
    remediation_status VARCHAR(20) DEFAULT 'PENDING' COMMENT '修复状态（PENDING待处理、IN_PROGRESS处理中、RESOLVED已解决、IGNORED已忽略）',
    remediation_time DATETIME COMMENT '修复时间',
    remediation_by BIGINT COMMENT '修复人',
    remediation_notes TEXT COMMENT '修复备注',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_check_batch_no (check_batch_no),
    INDEX idx_rule_id (rule_id),
    INDEX idx_check_time (check_time),
    INDEX idx_check_result (check_result),
    INDEX idx_remediation_status (remediation_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='合规检查记录表';

-- 合规检查定时任务表
CREATE TABLE IF NOT EXISTS sys_compliance_check_schedule (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    schedule_name VARCHAR(100) NOT NULL COMMENT '任务名称',
    rule_ids JSON NOT NULL COMMENT '规则ID列表',
    cron_expression VARCHAR(100) NOT NULL COMMENT 'Cron表达式',
    notify_on_fail TINYINT(1) DEFAULT 1 COMMENT '失败时是否通知',
    notify_recipients JSON COMMENT '通知接收人',
    last_run_time DATETIME COMMENT '最后运行时间',
    last_run_result VARCHAR(20) COMMENT '最后运行结果',
    next_run_time DATETIME COMMENT '下次运行时间',
    status TINYINT(1) DEFAULT 1 COMMENT '状态（1启用 0禁用）',
    created_by BIGINT COMMENT '创建人',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_next_run_time (next_run_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='合规检查定时任务表';

-- =====================================================
-- 11. 初始化数据
-- =====================================================

-- 初始化SSO提供商
INSERT INTO sys_sso_provider (provider_code, provider_name, provider_type, status, sort_order) VALUES
('oauth2_github', 'GitHub', 'OAUTH2', 0, 1),
('oauth2_google', 'Google', 'OAUTH2', 0, 2),
('oauth2_wechat_work', '企业微信', 'OAUTH2', 0, 3),
('oauth2_dingtalk', '钉钉', 'OAUTH2', 0, 4),
('oauth2_feishu', '飞书', 'OAUTH2', 0, 5),
('ldap_default', 'LDAP', 'LDAP', 0, 6),
('saml_default', 'SAML', 'SAML', 0, 7),
('cas_default', 'CAS', 'CAS', 0, 8);

-- 初始化岗位类别
INSERT INTO sys_position (org_id, position_code, position_name, position_level, position_category, description, status) VALUES
(1, 'CEO', '首席执行官', 10, '管理类', '公司最高管理者', 1),
(1, 'CTO', '首席技术官', 9, '管理类', '技术团队最高负责人', 1),
(1, 'PM', '项目经理', 7, '管理类', '项目管理负责人', 1),
(1, 'TL', '技术负责人', 7, '技术类', '技术团队负责人', 1),
(1, 'SE', '高级工程师', 6, '技术类', '高级软件工程师', 1),
(1, 'DEV', '软件工程师', 5, '技术类', '软件开发工程师', 1),
(1, 'QA', '测试工程师', 5, '技术类', '软件测试工程师', 1),
(1, 'UI', 'UI设计师', 5, '设计类', '用户界面设计师', 1),
(1, 'OP', '运维工程师', 5, '技术类', '系统运维工程师', 1);

-- 初始化数据权限规则
INSERT INTO sys_data_permission_rule (rule_name, rule_code, resource_type, scope_type, description, status, priority) VALUES
('查看全部项目', 'VIEW_ALL_PROJECTS', 'PROJECT', 'ALL', '可以查看所有项目', 1, 100),
('查看本人项目', 'VIEW_OWN_PROJECTS', 'PROJECT', 'SELF', '只能查看自己创建或参与的项目', 1, 50),
('查看本部门项目', 'VIEW_DEPT_PROJECTS', 'PROJECT', 'DEPARTMENT', '可以查看本部门的项目', 1, 60),
('查看本部门及下级项目', 'VIEW_DEPT_SUB_PROJECTS', 'PROJECT', 'DEPARTMENT_AND_BELOW', '可以查看本部门及下级部门的项目', 1, 70),
('查看全部任务', 'VIEW_ALL_TASKS', 'TASK', 'ALL', '可以查看所有任务', 1, 100),
('查看本人任务', 'VIEW_OWN_TASKS', 'TASK', 'SELF', '只能查看分配给自己的任务', 1, 50),
('查看本部门任务', 'VIEW_DEPT_TASKS', 'TASK', 'DEPARTMENT', '可以查看本部门的任务', 1, 60),
('查看全部文档', 'VIEW_ALL_DOCUMENTS', 'DOCUMENT', 'ALL', '可以查看所有文档', 1, 100),
('查看本人文档', 'VIEW_OWN_DOCUMENTS', 'DOCUMENT', 'SELF', '只能查看自己创建的文档', 1, 50);

-- 初始化合规规则
INSERT INTO sys_compliance_rule (rule_name, rule_code, rule_category, rule_description, check_type, severity, reference_standard, status) VALUES
('密码复杂度检查', 'PASSWORD_COMPLEXITY', 'SECURITY', '检查用户密码是否符合复杂度要求', 'REALTIME', 'HIGH', 'ISO27001', 1),
('登录失败次数检查', 'LOGIN_FAILURE_CHECK', 'SECURITY', '检查是否存在异常登录失败', 'SCHEDULED', 'MEDIUM', 'ISO27001', 1),
('敏感数据访问检查', 'SENSITIVE_DATA_ACCESS', 'DATA_PROTECTION', '检查敏感数据访问是否合规', 'SCHEDULED', 'HIGH', 'GDPR', 1),
('权限变更审计', 'PERMISSION_CHANGE_AUDIT', 'ACCESS_CONTROL', '审计权限变更记录', 'SCHEDULED', 'MEDIUM', 'ISO27001', 1),
('数据导出检查', 'DATA_EXPORT_CHECK', 'DATA_PROTECTION', '检查数据导出操作是否合规', 'REALTIME', 'HIGH', 'GDPR', 1),
('会话超时检查', 'SESSION_TIMEOUT_CHECK', 'SECURITY', '检查会话超时配置是否合规', 'SCHEDULED', 'LOW', 'ISO27001', 1),
('API访问频率检查', 'API_RATE_LIMIT_CHECK', 'SECURITY', '检查API访问频率是否异常', 'REALTIME', 'MEDIUM', 'OWASP', 1),
('用户权限最小化检查', 'LEAST_PRIVILEGE_CHECK', 'ACCESS_CONTROL', '检查用户权限是否符合最小化原则', 'SCHEDULED', 'MEDIUM', 'ISO27001', 1);

-- 初始化审计报告模板
INSERT INTO sys_audit_report_template (template_name, template_code, report_type, is_default, status) VALUES
('操作审计日报模板', 'OPERATION_DAILY', 'OPERATION', 1, 1),
('操作审计周报模板', 'OPERATION_WEEKLY', 'OPERATION', 0, 1),
('操作审计月报模板', 'OPERATION_MONTHLY', 'OPERATION', 0, 1),
('安全审计报告模板', 'SECURITY_REPORT', 'SECURITY', 1, 1),
('数据审计报告模板', 'DATA_AUDIT_REPORT', 'DATA', 1, 1),
('合规审计报告模板', 'COMPLIANCE_REPORT', 'COMPLIANCE', 1, 1);

-- 初始化外部集成配置
INSERT INTO sys_external_integration (integration_name, integration_code, integration_type, status) VALUES
('企业微信', 'WECHAT_WORK', 'WECHAT_WORK', 0),
('钉钉', 'DINGTALK', 'DINGTALK', 0),
('飞书', 'FEISHU', 'FEISHU', 0),
('GitLab', 'GITLAB', 'GITLAB', 0),
('Jira', 'JIRA', 'JIRA', 0),
('Confluence', 'CONFLUENCE', 'CONFLUENCE', 0);-- =====================================================
-- V16.0 通知中心增强
-- 功能：站内通知、邮件通知、通知聚合、智能分类、重要置顶、低优先级折叠、免打扰模式、订阅管理
-- =====================================================

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
WHERE ai_classification = 'low_priority' OR priority = 'low';-- =====================================================
-- Mota 企业注册模块 V17.0 - 数据库迁移脚本
-- 新增行业表、企业表、企业成员表、企业邀请表
-- 创建日期: 2025-12-26
-- =====================================================

-- =====================================================
-- 1. 行业表 (industry)
-- =====================================================
CREATE TABLE IF NOT EXISTS industry (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(50) NOT NULL UNIQUE COMMENT '行业代码',
    name VARCHAR(100) NOT NULL COMMENT '行业名称',
    parent_id BIGINT COMMENT '父行业ID',
    level INT DEFAULT 1 COMMENT '层级(1-一级行业,2-二级行业)',
    sort_order INT DEFAULT 0 COMMENT '排序顺序',
    icon VARCHAR(100) COMMENT '行业图标',
    description VARCHAR(500) COMMENT '行业描述',
    status TINYINT DEFAULT 1 COMMENT '状态(0-禁用,1-启用)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_parent (parent_id),
    INDEX idx_code (code),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='行业表';

-- =====================================================
-- 2. 企业表 (enterprise)
-- =====================================================
CREATE TABLE IF NOT EXISTS enterprise (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    org_id VARCHAR(50) NOT NULL UNIQUE COMMENT '组织ID(用于关联用户)',
    name VARCHAR(200) NOT NULL COMMENT '企业名称',
    short_name VARCHAR(100) COMMENT '企业简称',
    industry_id BIGINT NOT NULL COMMENT '所属行业ID',
    industry_name VARCHAR(100) COMMENT '行业名称(冗余)',
    logo VARCHAR(500) COMMENT '企业Logo',
    description TEXT COMMENT '企业简介',
    address VARCHAR(500) COMMENT '企业地址',
    contact_name VARCHAR(50) COMMENT '联系人姓名',
    contact_phone VARCHAR(20) COMMENT '联系电话',
    contact_email VARCHAR(100) COMMENT '联系邮箱',
    website VARCHAR(200) COMMENT '企业网站',
    scale VARCHAR(50) COMMENT '企业规模(1-50/51-200/201-500/501-1000/1000+)',
    admin_user_id BIGINT NOT NULL COMMENT '超级管理员用户ID',
    member_count INT DEFAULT 1 COMMENT '成员数量',
    max_members INT DEFAULT 100 COMMENT '最大成员数量',
    status TINYINT DEFAULT 1 COMMENT '状态(0-禁用,1-正常,2-待审核)',
    verified TINYINT DEFAULT 0 COMMENT '是否已认证(0-未认证,1-已认证)',
    verified_at TIMESTAMP COMMENT '认证时间',
    expired_at TIMESTAMP COMMENT '服务到期时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted INT DEFAULT 0 COMMENT '删除标记(0-未删除,1-已删除)',
    
    INDEX idx_org_id (org_id),
    INDEX idx_industry (industry_id),
    INDEX idx_admin (admin_user_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='企业表';

-- =====================================================
-- 3. 企业成员表 (enterprise_member)
-- =====================================================
CREATE TABLE IF NOT EXISTS enterprise_member (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    enterprise_id BIGINT NOT NULL COMMENT '企业ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    role VARCHAR(30) DEFAULT 'member' COMMENT '角色(super_admin/admin/member)',
    department_id BIGINT COMMENT '所属部门ID',
    position VARCHAR(100) COMMENT '职位',
    employee_no VARCHAR(50) COMMENT '工号',
    status TINYINT DEFAULT 1 COMMENT '状态(0-禁用,1-正常)',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '加入时间',
    invited_by BIGINT COMMENT '邀请人ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted INT DEFAULT 0 COMMENT '删除标记(0-未删除,1-已删除)',
    
    UNIQUE KEY uk_enterprise_user (enterprise_id, user_id),
    INDEX idx_enterprise (enterprise_id),
    INDEX idx_user (user_id),
    INDEX idx_department (department_id),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='企业成员表';

-- =====================================================
-- 4. 企业邀请表 (enterprise_invitation)
-- =====================================================
CREATE TABLE IF NOT EXISTS enterprise_invitation (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    enterprise_id BIGINT NOT NULL COMMENT '企业ID',
    invite_code VARCHAR(100) NOT NULL UNIQUE COMMENT '邀请码',
    invite_type VARCHAR(20) DEFAULT 'link' COMMENT '邀请类型(link-链接邀请,email-邮件邀请,phone-手机邀请)',
    target_email VARCHAR(100) COMMENT '目标邮箱',
    target_phone VARCHAR(20) COMMENT '目标手机号',
    role VARCHAR(30) DEFAULT 'member' COMMENT '邀请角色',
    department_id BIGINT COMMENT '邀请加入的部门ID',
    max_uses INT DEFAULT 1 COMMENT '最大使用次数(0-无限制)',
    used_count INT DEFAULT 0 COMMENT '已使用次数',
    expired_at TIMESTAMP NOT NULL COMMENT '过期时间',
    status TINYINT DEFAULT 1 COMMENT '状态(0-已失效,1-有效,2-已使用完)',
    invited_by BIGINT NOT NULL COMMENT '邀请人ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_enterprise (enterprise_id),
    INDEX idx_code (invite_code),
    INDEX idx_email (target_email),
    INDEX idx_phone (target_phone),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='企业邀请表';

-- =====================================================
-- 5. 更新用户表 - 添加企业相关字段（如果不存在）
-- =====================================================
-- 注意：如果列已存在，这些语句会报错，可以忽略错误继续执行
-- 或者先检查列是否存在再执行

-- 添加 enterprise_id 列（如果报错说列已存在，可以忽略）
-- ALTER TABLE sys_user ADD COLUMN enterprise_id BIGINT COMMENT '所属企业ID';

-- 添加 enterprise_role 列（如果报错说列已存在，可以忽略）
-- ALTER TABLE sys_user ADD COLUMN enterprise_role VARCHAR(30) DEFAULT 'member' COMMENT '企业角色(super_admin/admin/member)';

-- =====================================================
-- 6. 初始化行业数据（使用 INSERT IGNORE 避免重复插入）
-- =====================================================
INSERT IGNORE INTO industry (code, name, parent_id, level, sort_order, icon, description) VALUES
-- 一级行业
('IT', '信息技术/互联网', NULL, 1, 1, '💻', '包括软件开发、互联网服务、IT咨询等'),
('FINANCE', '金融/银行/保险', NULL, 1, 2, '🏦', '包括银行、证券、保险、投资等'),
('MANUFACTURING', '制造业', NULL, 1, 3, '🏭', '包括机械制造、电子制造、汽车制造等'),
('RETAIL', '零售/电商', NULL, 1, 4, '🛒', '包括线下零售、电子商务、批发贸易等'),
('HEALTHCARE', '医疗/健康', NULL, 1, 5, '🏥', '包括医院、医药、医疗器械、健康服务等'),
('EDUCATION', '教育/培训', NULL, 1, 6, '📚', '包括学校、培训机构、在线教育等'),
('REALESTATE', '房地产/建筑', NULL, 1, 7, '🏗️', '包括房地产开发、建筑施工、装修设计等'),
('MEDIA', '传媒/广告/文化', NULL, 1, 8, '📺', '包括媒体、广告、影视、游戏等'),
('LOGISTICS', '物流/运输', NULL, 1, 9, '🚚', '包括快递、货运、仓储、供应链等'),
('ENERGY', '能源/环保', NULL, 1, 10, '⚡', '包括电力、石油、新能源、环保等'),
('AGRICULTURE', '农业/食品', NULL, 1, 11, '🌾', '包括农业种植、食品加工、餐饮服务等'),
('CONSULTING', '咨询/法律/会计', NULL, 1, 12, '📋', '包括管理咨询、法律服务、会计审计等'),
('GOVERNMENT', '政府/公共事业', NULL, 1, 13, '🏛️', '包括政府机关、事业单位、非营利组织等'),
('OTHER', '其他行业', NULL, 1, 99, '📦', '其他未分类行业');

-- 二级行业 - IT（使用变量存储父ID）
SET @it_id = (SELECT id FROM industry WHERE code = 'IT');
INSERT IGNORE INTO industry (code, name, parent_id, level, sort_order, icon, description) VALUES
('IT_SOFTWARE', '软件开发', @it_id, 2, 1, '💾', '软件产品开发、定制开发'),
('IT_INTERNET', '互联网服务', @it_id, 2, 2, '🌐', '互联网平台、SaaS服务'),
('IT_AI', '人工智能', @it_id, 2, 3, '🤖', 'AI算法、机器学习、深度学习'),
('IT_BIGDATA', '大数据', @it_id, 2, 4, '📊', '数据分析、数据挖掘、BI'),
('IT_CLOUD', '云计算', @it_id, 2, 5, '☁️', '云服务、云平台、云安全'),
('IT_SECURITY', '网络安全', @it_id, 2, 6, '🔒', '信息安全、网络安全'),
('IT_HARDWARE', 'IT硬件', @it_id, 2, 7, '🖥️', '服务器、网络设备、终端设备');

-- 二级行业 - 金融
SET @finance_id = (SELECT id FROM industry WHERE code = 'FINANCE');
INSERT IGNORE INTO industry (code, name, parent_id, level, sort_order, icon, description) VALUES
('FINANCE_BANK', '银行', @finance_id, 2, 1, '🏦', '商业银行、投资银行'),
('FINANCE_SECURITIES', '证券/基金', @finance_id, 2, 2, '📈', '证券公司、基金公司'),
('FINANCE_INSURANCE', '保险', @finance_id, 2, 3, '🛡️', '人寿保险、财产保险'),
('FINANCE_FINTECH', '金融科技', @finance_id, 2, 4, '💳', '支付、借贷、区块链');

-- =====================================================
-- 完成
-- =====================================================
SELECT 'V17.0 企业注册模块数据库迁移完成！' AS message;-- 用户视图配置表
-- 用于存储用户自定义的视图配置，如项目列表、任务列表、日历、看板、甘特图等视图的筛选条件、排序、列配置等

CREATE TABLE IF NOT EXISTS `user_view_config` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `view_type` VARCHAR(50) NOT NULL COMMENT '视图类型: project, task, calendar, kanban, gantt',
    `name` VARCHAR(100) NOT NULL COMMENT '视图名称',
    `description` VARCHAR(500) DEFAULT NULL COMMENT '视图描述',
    `config` JSON DEFAULT NULL COMMENT '视图配置（JSON格式），包含：筛选条件、排序、列配置等',
    `is_default` TINYINT(1) DEFAULT 0 COMMENT '是否为默认视图',
    `is_shared` TINYINT(1) DEFAULT 0 COMMENT '是否共享给团队',
    `project_id` BIGINT DEFAULT NULL COMMENT '关联项目ID',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    INDEX `idx_user_id` (`user_id`),
    INDEX `idx_view_type` (`view_type`),
    INDEX `idx_user_view_type` (`user_id`, `view_type`),
    INDEX `idx_project_id` (`project_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户视图配置表';-- V21.0 里程碑负责人和任务同步
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

-- 2. 里程碑任务表（里程碑拆解的子任务）
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

-- 里程碑任务进度记录表
-- 用于存储任务进度更新的历史记录，包括富文本描述和附件

-- 创建进度记录表
CREATE TABLE IF NOT EXISTS milestone_task_progress_record (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    task_id BIGINT NOT NULL COMMENT '任务ID',
    previous_progress INT DEFAULT 0 COMMENT '更新前进度',
    current_progress INT DEFAULT 0 COMMENT '更新后进度',
    description TEXT COMMENT '进度描述（支持富文本HTML）',
    attachments JSON COMMENT '附件列表（JSON格式）',
    updated_by BIGINT COMMENT '更新人ID',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted INT DEFAULT 0 COMMENT '逻辑删除标记',
    version INT DEFAULT 1 COMMENT '乐观锁版本号',
    INDEX idx_task_id (task_id),
    INDEX idx_updated_by (updated_by),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='里程碑任务进度记录表';

-- 添加外键约束（可选，根据实际需求决定是否启用）
-- ALTER TABLE milestone_task_progress_record 
--     ADD CONSTRAINT fk_progress_record_task 
--     FOREIGN KEY (task_id) REFERENCES milestone_task(id) ON DELETE CASCADE;-- =====================================================
-- Mota 项目管理系统 - 知识文件管理表
-- 版本: V1.1
-- 说明: 知识文件分类、标签、文件管理相关表
-- =====================================================

-- =====================================================
-- 1. 文件分类表 (file_category)
-- =====================================================
CREATE TABLE IF NOT EXISTS file_category (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    name VARCHAR(100) NOT NULL COMMENT '分类名称',
    parent_id BIGINT COMMENT '父分类ID',
    description VARCHAR(500) COMMENT '分类描述',
    icon VARCHAR(100) COMMENT '图标',
    color VARCHAR(20) COMMENT '颜色',
    file_count INT DEFAULT 0 COMMENT '文件数量',
    sort_order INT DEFAULT 0 COMMENT '排序',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    
    INDEX idx_parent_id (parent_id),
    INDEX idx_sort_order (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文件分类表';

-- =====================================================
-- 2. 文件标签表 (file_tag)
-- =====================================================
CREATE TABLE IF NOT EXISTS file_tag (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    name VARCHAR(100) NOT NULL COMMENT '标签名称',
    color VARCHAR(20) COMMENT '标签颜色',
    file_count INT DEFAULT 0 COMMENT '文件数量',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    
    UNIQUE KEY uk_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文件标签表';

-- =====================================================
-- 3. 知识文件表 (knowledge_file)
-- =====================================================
CREATE TABLE IF NOT EXISTS knowledge_file (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    name VARCHAR(255) NOT NULL COMMENT '文件名',
    original_name VARCHAR(255) COMMENT '原始文件名',
    size BIGINT COMMENT '文件大小（字节）',
    mime_type VARCHAR(100) COMMENT 'MIME类型',
    extension VARCHAR(20) COMMENT '文件扩展名',
    path VARCHAR(500) COMMENT '文件存储路径',
    thumbnail_path VARCHAR(500) COMMENT '缩略图路径',
    project_id BIGINT COMMENT '所属项目ID',
    folder_id BIGINT COMMENT '所属文件夹ID',
    uploader_id BIGINT COMMENT '上传者ID',
    status VARCHAR(30) DEFAULT 'completed' COMMENT '文件状态(uploading/processing/completed/failed)',
    upload_progress INT DEFAULT 100 COMMENT '上传进度（0-100）',
    category VARCHAR(50) COMMENT '分类',
    ai_suggested_category VARCHAR(50) COMMENT 'AI建议的分类',
    ai_confidence DECIMAL(5,4) COMMENT 'AI分类置信度',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    
    INDEX idx_project_id (project_id),
    INDEX idx_folder_id (folder_id),
    INDEX idx_uploader_id (uploader_id),
    INDEX idx_status (status),
    INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='知识文件表';

-- =====================================================
-- 4. 知识文件标签关联表 (knowledge_file_tag)
-- =====================================================
CREATE TABLE IF NOT EXISTS knowledge_file_tag (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    file_id BIGINT NOT NULL COMMENT '文件ID',
    tag_id BIGINT NOT NULL COMMENT '标签ID',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    
    UNIQUE KEY uk_file_tag (file_id, tag_id),
    INDEX idx_file_id (file_id),
    INDEX idx_tag_id (tag_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='知识文件标签关联表';

-- =====================================================
-- 完成
-- =====================================================
SELECT 'V1.1 知识文件管理表创建完成！' AS message;