-- 摩塔 Mota 数据库初始化脚本
-- PostgreSQL 16

-- 创建数据库
-- CREATE DATABASE mota_user;
-- CREATE DATABASE mota_project;

-- =====================================================
-- 用户数据库 (mota_user)
-- =====================================================

-- 用户表
CREATE TABLE IF NOT EXISTS sys_user (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    nickname VARCHAR(50),
    avatar VARCHAR(255),
    status SMALLINT DEFAULT 1,
    org_id VARCHAR(64),
    org_name VARCHAR(100),
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    deleted SMALLINT DEFAULT 0,
    version INT DEFAULT 0
);

CREATE INDEX idx_user_email ON sys_user(email);
CREATE INDEX idx_user_phone ON sys_user(phone);
CREATE INDEX idx_user_org_id ON sys_user(org_id);

COMMENT ON TABLE sys_user IS '用户表';
COMMENT ON COLUMN sys_user.id IS '用户ID';
COMMENT ON COLUMN sys_user.username IS '用户名';
COMMENT ON COLUMN sys_user.email IS '邮箱';
COMMENT ON COLUMN sys_user.phone IS '手机号';
COMMENT ON COLUMN sys_user.password_hash IS '密码哈希';
COMMENT ON COLUMN sys_user.nickname IS '昵称';
COMMENT ON COLUMN sys_user.avatar IS '头像';
COMMENT ON COLUMN sys_user.status IS '状态（1正常 0禁用）';
COMMENT ON COLUMN sys_user.org_id IS '组织ID';
COMMENT ON COLUMN sys_user.org_name IS '组织名称';
COMMENT ON COLUMN sys_user.last_login_at IS '最后登录时间';
COMMENT ON COLUMN sys_user.deleted IS '删除标记（0未删除 1已删除）';

-- 组织表
CREATE TABLE IF NOT EXISTS sys_org (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    parent_id BIGINT,
    level INT DEFAULT 1,
    sort INT DEFAULT 0,
    status SMALLINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    deleted SMALLINT DEFAULT 0,
    version INT DEFAULT 0
);

COMMENT ON TABLE sys_org IS '组织表';

-- 角色表
CREATE TABLE IF NOT EXISTS sys_role (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    org_id VARCHAR(64),
    status SMALLINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    deleted SMALLINT DEFAULT 0,
    version INT DEFAULT 0
);

COMMENT ON TABLE sys_role IS '角色表';

-- 用户角色关联表
CREATE TABLE IF NOT EXISTS sys_user_role (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, role_id)
);

COMMENT ON TABLE sys_user_role IS '用户角色关联表';

-- 权限表
CREATE TABLE IF NOT EXISTS sys_permission (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    code VARCHAR(100) NOT NULL UNIQUE,
    type VARCHAR(20) NOT NULL,
    parent_id BIGINT,
    path VARCHAR(255),
    icon VARCHAR(100),
    sort INT DEFAULT 0,
    status SMALLINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted SMALLINT DEFAULT 0
);

COMMENT ON TABLE sys_permission IS '权限表';

-- 角色权限关联表
CREATE TABLE IF NOT EXISTS sys_role_permission (
    id BIGSERIAL PRIMARY KEY,
    role_id BIGINT NOT NULL,
    permission_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(role_id, permission_id)
);

COMMENT ON TABLE sys_role_permission IS '角色权限关联表';

-- =====================================================
-- 项目数据库 (mota_project)
-- =====================================================

-- 项目表
CREATE TABLE IF NOT EXISTS project (
    id BIGSERIAL PRIMARY KEY,
    org_id VARCHAR(64) NOT NULL,
    name VARCHAR(100) NOT NULL,
    key VARCHAR(20) NOT NULL,
    description TEXT,
    template_type VARCHAR(20) DEFAULT 'agile',
    status VARCHAR(20) DEFAULT 'active',
    owner_id BIGINT NOT NULL,
    settings JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    deleted SMALLINT DEFAULT 0,
    version INT DEFAULT 0,
    UNIQUE(org_id, key)
);

CREATE INDEX idx_project_org_id ON project(org_id);
CREATE INDEX idx_project_owner_id ON project(owner_id);

COMMENT ON TABLE project IS '项目表';
COMMENT ON COLUMN project.key IS '项目标识';
COMMENT ON COLUMN project.template_type IS '模板类型（agile/kanban/waterfall）';
COMMENT ON COLUMN project.status IS '状态（active/archived/deleted）';

-- 项目成员表
CREATE TABLE IF NOT EXISTS project_member (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'member',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted SMALLINT DEFAULT 0,
    UNIQUE(project_id, user_id)
);

CREATE INDEX idx_project_member_project_id ON project_member(project_id);
CREATE INDEX idx_project_member_user_id ON project_member(user_id);

COMMENT ON TABLE project_member IS '项目成员表';
COMMENT ON COLUMN project_member.role IS '角色（owner/admin/member/viewer）';

-- 迭代表
CREATE TABLE IF NOT EXISTS sprint (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    goal TEXT,
    status VARCHAR(20) DEFAULT 'planning',
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    deleted SMALLINT DEFAULT 0,
    version INT DEFAULT 0
);

CREATE INDEX idx_sprint_project_id ON sprint(project_id);

COMMENT ON TABLE sprint IS '迭代表';
COMMENT ON COLUMN sprint.status IS '状态（planning/active/completed/cancelled）';

-- 任务表
CREATE TABLE IF NOT EXISTS issue (
    id BIGSERIAL PRIMARY KEY,
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
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    deleted SMALLINT DEFAULT 0,
    version INT DEFAULT 0
);

CREATE INDEX idx_issue_project_id ON issue(project_id);
CREATE INDEX idx_issue_assignee_id ON issue(assignee_id);
CREATE INDEX idx_issue_reporter_id ON issue(reporter_id);
CREATE INDEX idx_issue_sprint_id ON issue(sprint_id);
CREATE INDEX idx_issue_parent_id ON issue(parent_id);
CREATE INDEX idx_issue_status ON issue(status);

COMMENT ON TABLE issue IS '任务表';
COMMENT ON COLUMN issue.type IS '类型（epic/story/task/bug/subtask）';
COMMENT ON COLUMN issue.status IS '状态（open/in_progress/in_review/done/closed）';
COMMENT ON COLUMN issue.priority IS '优先级（lowest/low/medium/high/highest）';

-- 任务评论表
CREATE TABLE IF NOT EXISTS issue_comment (
    id BIGSERIAL PRIMARY KEY,
    issue_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted SMALLINT DEFAULT 0
);

CREATE INDEX idx_issue_comment_issue_id ON issue_comment(issue_id);

COMMENT ON TABLE issue_comment IS '任务评论表';

-- 任务变更记录表
CREATE TABLE IF NOT EXISTS issue_changelog (
    id BIGSERIAL PRIMARY KEY,
    issue_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    field VARCHAR(50) NOT NULL,
    old_value TEXT,
    new_value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_issue_changelog_issue_id ON issue_changelog(issue_id);

COMMENT ON TABLE issue_changelog IS '任务变更记录表';

-- =====================================================
-- 初始化数据
-- =====================================================

-- 插入默认管理员用户 (密码: admin123)
INSERT INTO sys_user (username, email, phone, password_hash, nickname, status, org_id, org_name)
VALUES ('admin', 'admin@mota.ai', '13800000000', 
        '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', 
        '系统管理员', 1, 'default', '默认组织')
ON CONFLICT (username) DO NOTHING;

-- 插入默认角色
INSERT INTO sys_role (name, code, description)
VALUES 
    ('系统管理员', 'admin', '系统管理员，拥有所有权限'),
    ('项目管理员', 'project_admin', '项目管理员，可以管理项目'),
    ('开发人员', 'developer', '开发人员，可以处理任务'),
    ('访客', 'viewer', '访客，只能查看')
ON CONFLICT (code) DO NOTHING;

-- 插入默认权限
INSERT INTO sys_permission (name, code, type, parent_id, sort)
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
    ('删除任务', 'issue:delete', 'button', 6, 4)
ON CONFLICT (code) DO NOTHING;