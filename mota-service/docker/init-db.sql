-- 摩塔 Mota 数据库初始化脚本
-- MySQL 8.0
-- 此脚本会在 Docker 容器首次启动时自动执行

-- 设置字符集
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- =====================================================
-- 用户数据库 (mota) - 默认数据库
-- =====================================================

-- 用户表
CREATE TABLE IF NOT EXISTS sys_user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    nickname VARCHAR(50),
    avatar VARCHAR(255),
    status TINYINT DEFAULT 1,
    org_id VARCHAR(64),
    org_name VARCHAR(100),
    role VARCHAR(50) DEFAULT 'member',
    last_login_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    deleted TINYINT DEFAULT 0,
    version INT DEFAULT 0,
    INDEX idx_user_email (email),
    INDEX idx_user_phone (phone),
    INDEX idx_user_org_id (org_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 组织表
CREATE TABLE IF NOT EXISTS sys_org (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    parent_id BIGINT,
    level INT DEFAULT 1,
    sort INT DEFAULT 0,
    status TINYINT DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    deleted TINYINT DEFAULT 0,
    version INT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='组织表';

-- 角色表
CREATE TABLE IF NOT EXISTS sys_role (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    org_id VARCHAR(64),
    status TINYINT DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    deleted TINYINT DEFAULT 0,
    version INT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色表';

-- 用户角色关联表
CREATE TABLE IF NOT EXISTS sys_user_role (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_role (user_id, role_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户角色关联表';

-- 权限表
CREATE TABLE IF NOT EXISTS sys_permission (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    code VARCHAR(100) NOT NULL UNIQUE,
    type VARCHAR(20) NOT NULL,
    parent_id BIGINT,
    path VARCHAR(255),
    icon VARCHAR(100),
    sort INT DEFAULT 0,
    status TINYINT DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted TINYINT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='权限表';

-- 角色权限关联表
CREATE TABLE IF NOT EXISTS sys_role_permission (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    role_id BIGINT NOT NULL,
    permission_id BIGINT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_role_permission (role_id, permission_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色权限关联表';

-- 项目表
CREATE TABLE IF NOT EXISTS project (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    org_id VARCHAR(64) NOT NULL,
    name VARCHAR(100) NOT NULL,
    `key` VARCHAR(20) NOT NULL,
    description TEXT,
    template_type VARCHAR(20) DEFAULT 'agile',
    status VARCHAR(20) DEFAULT 'active',
    owner_id BIGINT NOT NULL,
    color VARCHAR(20) DEFAULT '#1677ff',
    starred TINYINT DEFAULT 0,
    progress INT DEFAULT 0,
    member_count INT DEFAULT 1,
    issue_count INT DEFAULT 0,
    start_date DATE COMMENT '项目开始日期',
    end_date DATE COMMENT '项目结束日期',
    priority VARCHAR(20) DEFAULT 'medium' COMMENT '优先级(low/medium/high/urgent)',
    visibility VARCHAR(20) DEFAULT 'private' COMMENT '可见性(private/internal/public)',
    archived_at DATETIME COMMENT '归档时间',
    archived_by BIGINT COMMENT '归档人ID',
    settings JSON,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    deleted TINYINT DEFAULT 0,
    version INT DEFAULT 0,
    UNIQUE KEY uk_org_key (org_id, `key`),
    INDEX idx_project_org_id (org_id),
    INDEX idx_project_owner_id (owner_id),
    INDEX idx_project_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='项目表';

-- 项目成员表
CREATE TABLE IF NOT EXISTS project_member (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    role VARCHAR(30) NOT NULL DEFAULT 'member',
    department_id BIGINT COMMENT '所属部门ID',
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT COMMENT '创建人ID',
    updated_by BIGINT COMMENT '更新人ID',
    deleted TINYINT DEFAULT 0,
    version INT DEFAULT 0 COMMENT '乐观锁版本号',
    UNIQUE KEY uk_project_user (project_id, user_id),
    INDEX idx_project_member_project_id (project_id),
    INDEX idx_project_member_user_id (user_id),
    INDEX idx_project_member_department_id (department_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='项目成员表';

-- 迭代表
CREATE TABLE IF NOT EXISTS sprint (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    goal TEXT,
    status VARCHAR(20) DEFAULT 'planning',
    start_date DATE,
    end_date DATE,
    total_points INT DEFAULT 0,
    completed_points INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    deleted TINYINT DEFAULT 0,
    version INT DEFAULT 0,
    INDEX idx_sprint_project_id (project_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='迭代表';

-- 任务表
CREATE TABLE IF NOT EXISTS issue (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT NOT NULL,
    issue_key VARCHAR(30) NOT NULL UNIQUE,
    type VARCHAR(20) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'open',
    priority VARCHAR(20) DEFAULT 'medium',
    assignee_id BIGINT,
    reporter_id BIGINT NOT NULL,
    parent_id BIGINT,
    sprint_id BIGINT,
    story_points INT,
    estimated_hours DECIMAL(10,2),
    actual_hours DECIMAL(10,2),
    due_date DATE,
    resolved_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    deleted TINYINT DEFAULT 0,
    version INT DEFAULT 0,
    INDEX idx_issue_project_id (project_id),
    INDEX idx_issue_assignee_id (assignee_id),
    INDEX idx_issue_reporter_id (reporter_id),
    INDEX idx_issue_sprint_id (sprint_id),
    INDEX idx_issue_parent_id (parent_id),
    INDEX idx_issue_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='任务表';

-- 任务评论表
CREATE TABLE IF NOT EXISTS issue_comment (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    issue_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted TINYINT DEFAULT 0,
    INDEX idx_issue_comment_issue_id (issue_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='任务评论表';

-- 任务变更记录表
CREATE TABLE IF NOT EXISTS issue_changelog (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    issue_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    field VARCHAR(50) NOT NULL,
    old_value TEXT,
    new_value TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_issue_changelog_issue_id (issue_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='任务变更记录表';

-- 活动动态表
CREATE TABLE IF NOT EXISTS activity (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    action VARCHAR(100) NOT NULL,
    target VARCHAR(255),
    target_id BIGINT,
    user_id BIGINT NOT NULL,
    project_id BIGINT,
    time VARCHAR(50),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_activity_user_id (user_id),
    INDEX idx_activity_project_id (project_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='活动动态表';

-- 通知表
CREATE TABLE IF NOT EXISTS notification (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    user_id BIGINT NOT NULL,
    is_read TINYINT DEFAULT 0,
    related_id BIGINT,
    related_type VARCHAR(50),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_notification_user_id (user_id),
    INDEX idx_notification_is_read (is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='通知表';

-- 知识库文档表
CREATE TABLE IF NOT EXISTS wiki_document (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    content LONGTEXT,
    parent_id BIGINT,
    sort INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    deleted TINYINT DEFAULT 0,
    INDEX idx_wiki_document_project_id (project_id),
    INDEX idx_wiki_document_parent_id (parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='知识库文档表';

-- AI历史记录表
CREATE TABLE IF NOT EXISTS ai_history (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'completed',
    creator VARCHAR(50),
    creator_id BIGINT,
    content LONGTEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_ai_history_creator_id (creator_id),
    INDEX idx_ai_history_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI历史记录表';

-- AI新闻表
CREATE TABLE IF NOT EXISTS ai_news (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    summary TEXT,
    source VARCHAR(100),
    source_icon VARCHAR(255),
    publish_time VARCHAR(50),
    category VARCHAR(50),
    tags JSON,
    url VARCHAR(500),
    is_starred TINYINT DEFAULT 0,
    relevance INT DEFAULT 80,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_ai_news_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI新闻表';

-- AI训练统计表
CREATE TABLE IF NOT EXISTS ai_training_stats (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    total_documents INT DEFAULT 0,
    total_tokens VARCHAR(20) DEFAULT '0',
    last_training DATETIME,
    model_version VARCHAR(20) DEFAULT 'v1.0.0',
    accuracy DECIMAL(5,2) DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI训练统计表';

-- AI训练历史表
CREATE TABLE IF NOT EXISTS ai_training_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    version VARCHAR(20) NOT NULL,
    date DATETIME NOT NULL,
    documents INT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'completed',
    accuracy DECIMAL(5,2) DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI训练历史表';

-- AI知识库文档表
CREATE TABLE IF NOT EXISTS ai_knowledge_document (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    size VARCHAR(20),
    upload_time DATE,
    status VARCHAR(20) DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_ai_knowledge_document_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI知识库文档表';

-- =====================================================
-- 初始化数据
-- =====================================================

-- 插入默认管理员用户 (密码: password)
-- BCrypt hash for "password" - generated by Spring Security BCryptPasswordEncoder
INSERT IGNORE INTO sys_user (id, username, email, phone, password_hash, nickname, status, org_id, org_name, role)
VALUES 
    (1, 'admin', 'admin@mota.ai', '13800000000', '$2a$10$758siWFXb//cvh9LHp7vGuPCmN3mPoUUIJ8wzZp19YrAcdho7JRAm', '系统管理员', 1, 'default', '默认组织', 'admin'),
    (2, 'zhangsan', 'zhangsan@mota.ai', '13800000001', '$2a$10$758siWFXb//cvh9LHp7vGuPCmN3mPoUUIJ8wzZp19YrAcdho7JRAm', '张三', 1, 'default', '默认组织', 'developer'),
    (3, 'lisi', 'lisi@mota.ai', '13800000002', '$2a$10$758siWFXb//cvh9LHp7vGuPCmN3mPoUUIJ8wzZp19YrAcdho7JRAm', '李四', 1, 'default', '默认组织', 'developer'),
    (4, 'wangwu', 'wangwu@mota.ai', '13800000003', '$2a$10$758siWFXb//cvh9LHp7vGuPCmN3mPoUUIJ8wzZp19YrAcdho7JRAm', '王五', 1, 'default', '默认组织', 'tester'),
    (5, 'zhaoliu', 'zhaoliu@mota.ai', '13800000004', '$2a$10$758siWFXb//cvh9LHp7vGuPCmN3mPoUUIJ8wzZp19YrAcdho7JRAm', '赵六', 1, 'default', '默认组织', 'designer');

-- 插入默认角色
INSERT IGNORE INTO sys_role (name, code, description)
VALUES 
    ('系统管理员', 'admin', '系统管理员，拥有所有权限'),
    ('项目管理员', 'project_admin', '项目管理员，可以管理项目'),
    ('开发人员', 'developer', '开发人员，可以处理任务'),
    ('访客', 'viewer', '访客，只能查看');

-- 插入默认权限
INSERT IGNORE INTO sys_permission (name, code, type, parent_id, sort)
VALUES 
    ('项目管理', 'project', 'menu', NULL, 1),
    ('项目列表', 'project:list', 'menu', 1, 1),
    ('创建项目', 'project:create', 'button', 1, 2),
    ('编辑项目', 'project:update', 'button', 1, 3),
    ('删除项目', 'project:delete', 'button', 1, 4),
    ('任务管理', 'issue', 'menu', NULL, 2),
    ('任务列表', 'issue:list', 'menu', 6, 1),
    ('创建任务', 'issue:create', 'button', 6, 2),
    ('编辑任务', 'issue:update', 'button', 6, 3),
    ('删除任务', 'issue:delete', 'button', 6, 4);

-- 为管理员分配角色
INSERT IGNORE INTO sys_user_role (user_id, role_id)
SELECT u.id, r.id FROM sys_user u, sys_role r 
WHERE u.username = 'admin' AND r.code = 'admin';

-- =====================================================
-- 演示数据 - 项目
-- =====================================================
INSERT IGNORE INTO project (id, org_id, name, `key`, description, status, owner_id, color, starred, progress, member_count, issue_count)
VALUES 
    (1, 'default', '摩塔智能平台', 'MOTA', '摩塔科技核心产品开发项目，包含AI方案生成、PPT生成等功能模块', 'active', 1, '#1677ff', 1, 65, 5, 24),
    (2, 'default', '企业官网重构', 'WEB', '公司官网全面升级改版项目', 'active', 2, '#52c41a', 0, 40, 3, 12),
    (3, 'default', '移动端App开发', 'APP', '摩塔移动端应用开发项目', 'active', 3, '#722ed1', 1, 25, 4, 18),
    (4, 'default', '数据分析平台', 'DATA', '企业数据分析和可视化平台', 'completed', 1, '#fa8c16', 0, 100, 3, 8);

-- 项目成员
INSERT IGNORE INTO project_member (project_id, user_id, role)
VALUES 
    (1, 1, 'owner'), (1, 2, 'developer'), (1, 3, 'developer'), (1, 4, 'tester'), (1, 5, 'designer'),
    (2, 2, 'owner'), (2, 3, 'developer'), (2, 5, 'designer'),
    (3, 3, 'owner'), (3, 1, 'developer'), (3, 2, 'developer'), (3, 4, 'tester'),
    (4, 1, 'owner'), (4, 2, 'developer'), (4, 4, 'tester');

-- =====================================================
-- 演示数据 - 迭代
-- =====================================================
INSERT IGNORE INTO sprint (id, project_id, name, goal, status, start_date, end_date, total_points, completed_points)
VALUES 
    (1, 1, 'Sprint 1 - 基础架构', '完成项目基础架构搭建和核心模块开发', 'completed', '2024-01-01', '2024-01-14', 40, 40),
    (2, 1, 'Sprint 2 - AI功能', '完成AI方案生成和PPT生成功能', 'active', '2024-01-15', '2024-01-28', 35, 20),
    (3, 1, 'Sprint 3 - 优化完善', '功能优化和用户体验提升', 'planning', '2024-01-29', '2024-02-11', 30, 0),
    (4, 2, 'Sprint 1 - 设计稿', '完成官网设计稿', 'active', '2024-01-10', '2024-01-24', 25, 15),
    (5, 3, 'Sprint 1 - 原型开发', 'App原型开发', 'active', '2024-01-08', '2024-01-22', 30, 10);

-- =====================================================
-- 演示数据 - 任务
-- =====================================================
INSERT IGNORE INTO issue (id, project_id, issue_key, type, title, description, status, priority, assignee_id, reporter_id, sprint_id, story_points)
VALUES 
    -- 摩塔智能平台项目任务
    (1, 1, 'MOTA-1', 'story', '用户登录注册功能', '实现用户登录、注册、找回密码等功能', 'done', 'high', 2, 1, 1, 5),
    (2, 1, 'MOTA-2', 'story', '项目管理模块', '实现项目的创建、编辑、删除、成员管理等功能', 'done', 'high', 3, 1, 1, 8),
    (3, 1, 'MOTA-3', 'story', '任务管理模块', '实现任务的CRUD、状态流转、分配等功能', 'done', 'high', 2, 1, 1, 8),
    (4, 1, 'MOTA-4', 'story', 'AI方案生成功能', '集成AI接口，实现商务方案自动生成', 'in_progress', 'highest', 2, 1, 2, 13),
    (5, 1, 'MOTA-5', 'story', 'AI PPT生成功能', '实现AI自动生成PPT演示文稿', 'in_progress', 'high', 3, 1, 2, 13),
    (6, 1, 'MOTA-6', 'task', '数据库设计优化', '优化数据库表结构和索引', 'done', 'medium', 2, 1, 1, 5),
    (7, 1, 'MOTA-7', 'bug', '登录页面样式问题', '移动端登录页面布局错乱', 'done', 'medium', 5, 4, 1, 2),
    (8, 1, 'MOTA-8', 'task', 'API接口文档编写', '编写完整的API接口文档', 'in_progress', 'low', 2, 1, 2, 3),
    (9, 1, 'MOTA-9', 'story', '新闻追踪功能', '实现AI自动追踪行业新闻', 'open', 'medium', 3, 1, 3, 8),
    (10, 1, 'MOTA-10', 'bug', '方案生成超时问题', '大文本方案生成时偶发超时', 'open', 'high', 2, 4, 2, 3),
    -- 企业官网项目任务
    (11, 2, 'WEB-1', 'story', '首页设计', '设计新版官网首页', 'done', 'high', 5, 2, 4, 5),
    (12, 2, 'WEB-2', 'story', '产品页面设计', '设计产品介绍页面', 'in_progress', 'high', 5, 2, 4, 5),
    (13, 2, 'WEB-3', 'task', '响应式适配', '实现移动端响应式布局', 'open', 'medium', 3, 2, 4, 8),
    -- 移动端App项目任务
    (14, 3, 'APP-1', 'story', 'App框架搭建', '搭建React Native项目框架', 'done', 'high', 2, 3, 5, 5),
    (15, 3, 'APP-2', 'story', '登录模块开发', '实现App登录功能', 'in_progress', 'high', 2, 3, 5, 5),
    (16, 3, 'APP-3', 'story', '首页开发', '开发App首页界面', 'open', 'medium', 1, 3, 5, 8);

-- =====================================================
-- 演示数据 - 活动动态
-- =====================================================
INSERT IGNORE INTO activity (id, type, action, target, target_id, user_id, project_id, time)
VALUES 
    (1, 'issue_created', '创建了任务', 'MOTA-10', 10, 4, 1, '10分钟前'),
    (2, 'issue_updated', '更新了任务状态', 'MOTA-4', 4, 2, 1, '30分钟前'),
    (3, 'comment_added', '评论了任务', 'MOTA-5', 5, 3, 1, '1小时前'),
    (4, 'issue_completed', '完成了任务', 'MOTA-7', 7, 5, 1, '2小时前'),
    (5, 'member_joined', '加入了项目', '摩塔智能平台', 1, 5, 1, '3小时前'),
    (6, 'sprint_started', '开始了迭代', 'Sprint 2 - AI功能', 2, 1, 1, '1天前'),
    (7, 'project_created', '创建了项目', '移动端App开发', 3, 3, 3, '2天前'),
    (8, 'issue_created', '创建了任务', 'WEB-3', 13, 2, 2, '2天前'),
    (9, 'sprint_completed', '完成了迭代', 'Sprint 1 - 基础架构', 1, 1, 1, '3天前'),
    (10, 'issue_updated', '更新了任务优先级', 'MOTA-4', 4, 1, 1, '3天前');

-- =====================================================
-- 演示数据 - 通知
-- =====================================================
INSERT IGNORE INTO notification (id, type, title, content, user_id, is_read, related_id, related_type)
VALUES 
    (1, 'task_assigned', '新任务分配', '您被分配了任务 MOTA-4: AI方案生成功能', 2, 0, 4, 'issue'),
    (2, 'comment', '新评论', '张三 评论了您的任务 MOTA-5', 3, 0, 5, 'issue'),
    (3, 'mention', '有人@了您', '李四 在任务 MOTA-8 中@了您', 2, 1, 8, 'issue'),
    (4, 'sprint_start', '迭代开始', 'Sprint 2 - AI功能 已开始', 2, 1, 2, 'sprint'),
    (5, 'task_completed', '任务完成', '任务 MOTA-7 已完成', 1, 0, 7, 'issue'),
    (6, 'project_invite', '项目邀请', '您被邀请加入项目 移动端App开发', 4, 0, 3, 'project'),
    (7, 'deadline_reminder', '截止日期提醒', '任务 MOTA-4 将在2天后到期', 2, 0, 4, 'issue'),
    (8, 'system', '系统通知', '系统将于今晚22:00进行维护升级', 1, 1, NULL, NULL);

-- =====================================================
-- 演示数据 - 知识库文档
-- =====================================================
INSERT IGNORE INTO wiki_document (id, project_id, title, content, parent_id, sort)
VALUES 
    (1, 1, '项目概述', '# 摩塔智能平台\n\n## 项目简介\n摩塔智能平台是一个AI驱动的企业级解决方案生成平台...', NULL, 1),
    (2, 1, '技术架构', '# 技术架构\n\n## 前端技术栈\n- React 18\n- TypeScript\n- Ant Design\n- Vite\n\n## 后端技术栈\n- Spring Boot 3\n- Spring Cloud\n- MySQL 8\n- Redis', NULL, 2),
    (3, 1, 'API文档', '# API文档\n\n## 认证接口\n\n### 登录\n```\nPOST /api/v1/auth/login\n```', NULL, 3),
    (4, 1, '开发规范', '# 开发规范\n\n## 代码规范\n- 使用ESLint进行代码检查\n- 使用Prettier进行代码格式化', 1, 1),
    (5, 2, '官网设计规范', '# 官网设计规范\n\n## 色彩规范\n主色调: #1677ff\n辅助色: #52c41a', NULL, 1);

-- =====================================================
-- 演示数据 - AI历史记录
-- =====================================================
INSERT IGNORE INTO ai_history (id, title, type, status, creator, creator_id, content, created_at)
VALUES 
    ('SOL-1703123456789', '摩塔科技商务方案', 'solution', 'completed', '管理员', 1, '# 摩塔科技商务方案\n\n## 一、项目背景\n\n摩塔科技是一家专注于AI驱动的智能商业平台提供商...', '2024-01-15 14:30:25'),
    ('PPT-1703123456790', '产品介绍PPT', 'ppt', 'completed', '管理员', 1, 'PPT内容...', '2024-01-15 10:20:15'),
    ('MKT-1703123456791', '双十一营销方案', 'marketing', 'completed', '张三', 2, '# 双十一营销方案\n\n## 活动目标\n...', '2024-01-14 16:45:30'),
    ('SOL-1703123456792', '技术架构方案', 'solution', 'completed', '李四', 3, '# 技术架构方案\n\n## 系统架构\n...', '2024-01-14 09:15:00'),
    ('NEWS-1703123456793', '行业新闻周报', 'news', 'completed', '管理员', 1, '# 行业新闻周报\n\n## 本周要闻\n...', '2024-01-13 18:00:00'),
    ('SOL-1703123456794', '客户提案方案', 'solution', 'failed', '王五', 4, '', '2024-01-13 11:30:45'),
    ('PPT-1703123456795', '季度汇报PPT', 'ppt', 'completed', '管理员', 1, 'PPT内容...', '2024-01-12 15:20:30'),
    ('MKT-1703123456796', '新品发布营销方案', 'marketing', 'processing', '赵六', 5, '', '2024-01-12 10:00:00');

-- =====================================================
-- 演示数据 - AI新闻
-- =====================================================
INSERT IGNORE INTO ai_news (id, title, summary, source, publish_time, category, tags, url, is_starred, relevance)
VALUES 
    ('1', 'OpenAI发布GPT-5，性能大幅提升', 'OpenAI今日正式发布GPT-5模型，在推理能力、多模态理解等方面取得重大突破，将为企业AI应用带来新的可能性...', '36氪', '2小时前', 'AI技术', '["GPT-5", "OpenAI", "大模型"]', '#', 1, 95),
    ('2', '企业数字化转型报告：AI成为核心驱动力', '最新调研报告显示，超过80%的企业将AI视为数字化转型的核心驱动力，预计未来三年AI投资将增长300%...', '亿欧网', '4小时前', '行业动态', '["数字化转型", "企业服务", "AI应用"]', '#', 0, 88),
    ('3', 'SaaS行业迎来AI革命，智能化成新趋势', '随着AI技术的成熟，SaaS行业正在经历一场深刻的变革，智能化、自动化成为产品升级的主要方向...', '虎嗅', '6小时前', '行业动态', '["SaaS", "智能化", "产品升级"]', '#', 1, 92),
    ('4', '国内AI大模型竞争加剧，百度、阿里、腾讯纷纷发力', '国内科技巨头在AI大模型领域的竞争日趋激烈，各家纷纷推出自研大模型，并在企业服务领域展开布局...', '钛媒体', '8小时前', 'AI技术', '["大模型", "百度", "阿里", "腾讯"]', '#', 0, 85),
    ('5', 'AI营销工具市场规模突破百亿，增长势头强劲', '据市场研究机构数据，AI营销工具市场规模已突破百亿元，预计未来五年将保持30%以上的年增长率...', '艾瑞咨询', '1天前', '市场分析', '["AI营销", "市场规模", "增长趋势"]', '#', 0, 90),
    ('6', '企业级AI应用落地加速，效率提升显著', '越来越多的企业开始将AI技术应用于实际业务场景，在客服、营销、运营等领域取得了显著的效率提升...', '界面新闻', '1天前', '案例分析', '["AI应用", "企业效率", "落地实践"]', '#', 0, 87);

-- =====================================================
-- 演示数据 - AI训练统计
-- =====================================================
INSERT IGNORE INTO ai_training_stats (id, total_documents, total_tokens, last_training, model_version, accuracy)
VALUES (1, 156, '2.3M', '2024-01-15 14:30:00', 'v1.2.0', 92.5);

-- =====================================================
-- 演示数据 - AI训练历史
-- =====================================================
INSERT IGNORE INTO ai_training_history (id, version, date, documents, status, accuracy)
VALUES 
    (1, 'v1.2.0', '2024-01-15 14:30:00', 156, 'completed', 92.5),
    (2, 'v1.1.0', '2024-01-10 10:20:00', 120, 'completed', 89.2),
    (3, 'v1.0.0', '2024-01-05 09:00:00', 80, 'completed', 85.0);

-- =====================================================
-- 演示数据 - AI知识库文档
-- =====================================================
INSERT IGNORE INTO ai_knowledge_document (id, name, size, upload_time, status)
VALUES 
    (1, '公司简介.pdf', '2.3 MB', '2024-01-15', 'indexed'),
    (2, '产品手册.docx', '5.1 MB', '2024-01-14', 'indexed'),
    (3, '服务说明.pdf', '1.8 MB', '2024-01-13', 'indexed'),
    (4, '案例集锦.pdf', '8.2 MB', '2024-01-12', 'indexed'),
    (5, '技术白皮书.pdf', '3.5 MB', '2024-01-10', 'pending');