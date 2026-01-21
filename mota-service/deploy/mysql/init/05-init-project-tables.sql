-- =====================================================
-- 项目服务数据库表初始化脚本
-- 包含多租户支持 (tenant_id)
-- =====================================================
USE mota_project;

-- 项目表
CREATE TABLE IF NOT EXISTS project (
    id BIGINT PRIMARY KEY COMMENT '主键ID',
    tenant_id BIGINT NOT NULL DEFAULT 0 COMMENT '租户ID',
    org_id VARCHAR(50) COMMENT '组织ID',
    name VARCHAR(200) NOT NULL COMMENT '项目名称',
    `key` VARCHAR(50) COMMENT '项目标识',
    description TEXT COMMENT '项目描述',
    status VARCHAR(20) DEFAULT 'planning' COMMENT '状态',
    owner_id BIGINT NOT NULL COMMENT '负责人ID',
    color VARCHAR(20) COMMENT '颜色',
    starred INT DEFAULT 0 COMMENT '是否收藏',
    progress INT DEFAULT 0 COMMENT '进度',
    member_count INT DEFAULT 0 COMMENT '成员数量',
    issue_count INT DEFAULT 0 COMMENT '任务数量',
    start_date DATE COMMENT '开始日期',
    end_date DATE COMMENT '结束日期',
    priority VARCHAR(20) DEFAULT 'medium' COMMENT '优先级',
    archived_at DATETIME COMMENT '归档时间',
    archived_by BIGINT COMMENT '归档人ID',
    visibility VARCHAR(20) DEFAULT 'private' COMMENT '可见性',
    project_type VARCHAR(50) DEFAULT 'standard' COMMENT '项目类型',
    template_id BIGINT COMMENT '模板ID',
    is_template TINYINT(1) DEFAULT 0 COMMENT '是否为模板',
    settings JSON COMMENT '项目配置',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT COMMENT '创建人ID',
    updated_by BIGINT COMMENT '更新人ID',
    dept_id BIGINT COMMENT '部门ID',
    deleted INT DEFAULT 0 COMMENT '删除标记',
    version INT DEFAULT 0 COMMENT '版本号',
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_org_id (org_id),
    INDEX idx_owner_id (owner_id),
    INDEX idx_status (status),
    INDEX idx_is_template (is_template)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='项目表';

-- 项目成员表
CREATE TABLE IF NOT EXISTS project_member (
    id BIGINT PRIMARY KEY COMMENT '主键ID',
    tenant_id BIGINT NOT NULL DEFAULT 0 COMMENT '租户ID',
    project_id BIGINT NOT NULL COMMENT '项目ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    role VARCHAR(50) DEFAULT 'member' COMMENT '角色',
    role_id BIGINT COMMENT '项目角色ID',
    department_id BIGINT COMMENT '部门ID',
    joined_at DATETIME COMMENT '加入时间',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT COMMENT '创建人ID',
    updated_by BIGINT COMMENT '更新人ID',
    dept_id BIGINT COMMENT '部门ID',
    deleted INT DEFAULT 0 COMMENT '删除标记',
    version INT DEFAULT 0 COMMENT '版本号',
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_project_id (project_id),
    INDEX idx_user_id (user_id),
    INDEX idx_role_id (role_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='项目成员表';

-- 里程碑表
CREATE TABLE IF NOT EXISTS milestone (
    id BIGINT PRIMARY KEY COMMENT '主键ID',
    tenant_id BIGINT NOT NULL DEFAULT 0 COMMENT '租户ID',
    project_id BIGINT NOT NULL COMMENT '项目ID',
    name VARCHAR(200) NOT NULL COMMENT '里程碑名称',
    description TEXT COMMENT '描述',
    target_date DATE COMMENT '目标日期',
    status VARCHAR(20) DEFAULT 'pending' COMMENT '状态',
    progress INT DEFAULT 0 COMMENT '进度',
    task_count INT DEFAULT 0 COMMENT '任务总数',
    completed_task_count INT DEFAULT 0 COMMENT '已完成任务数',
    department_task_count INT DEFAULT 0 COMMENT '部门任务数',
    completed_department_task_count INT DEFAULT 0 COMMENT '已完成部门任务数',
    completed_at DATETIME COMMENT '完成时间',
    sort_order INT DEFAULT 0 COMMENT '排序',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT COMMENT '创建人ID',
    updated_by BIGINT COMMENT '更新人ID',
    dept_id BIGINT COMMENT '部门ID',
    deleted INT DEFAULT 0 COMMENT '删除标记',
    version INT DEFAULT 0 COMMENT '版本号',
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_project_id (project_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='里程碑表';

-- 任务表
CREATE TABLE IF NOT EXISTS task (
    id BIGINT PRIMARY KEY COMMENT '主键ID',
    tenant_id BIGINT NOT NULL DEFAULT 0 COMMENT '租户ID',
    department_task_id BIGINT COMMENT '部门任务ID',
    project_id BIGINT COMMENT '项目ID',
    milestone_id BIGINT COMMENT '里程碑ID',
    name VARCHAR(200) NOT NULL COMMENT '任务名称',
    description TEXT COMMENT '描述',
    assignee_id BIGINT COMMENT '执行人ID',
    status VARCHAR(20) DEFAULT 'pending' COMMENT '状态',
    priority VARCHAR(20) DEFAULT 'medium' COMMENT '优先级',
    start_date DATE COMMENT '开始日期',
    end_date DATE COMMENT '截止日期',
    progress INT DEFAULT 0 COMMENT '进度',
    progress_note VARCHAR(500) COMMENT '进度说明',
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
    INDEX idx_project_id (project_id),
    INDEX idx_milestone_id (milestone_id),
    INDEX idx_assignee_id (assignee_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='任务表';

-- 活动动态表
CREATE TABLE IF NOT EXISTS activity (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    tenant_id BIGINT NOT NULL DEFAULT 0 COMMENT '租户ID',
    type VARCHAR(50) COMMENT '活动类型',
    action VARCHAR(200) COMMENT '动作描述',
    target VARCHAR(200) COMMENT '目标名称',
    target_id BIGINT COMMENT '目标ID',
    user_id BIGINT COMMENT '用户ID',
    project_id BIGINT COMMENT '项目ID',
    time VARCHAR(50) COMMENT '时间描述',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_user_id (user_id),
    INDEX idx_project_id (project_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='活动动态表';

-- 里程碑负责人表
CREATE TABLE IF NOT EXISTS milestone_assignee (
    id BIGINT PRIMARY KEY COMMENT '主键ID',
    tenant_id BIGINT NOT NULL DEFAULT 0 COMMENT '租户ID',
    milestone_id BIGINT NOT NULL COMMENT '里程碑ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    role VARCHAR(50) DEFAULT 'assignee' COMMENT '角色',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT COMMENT '创建人ID',
    updated_by BIGINT COMMENT '更新人ID',
    dept_id BIGINT COMMENT '部门ID',
    deleted INT DEFAULT 0 COMMENT '删除标记',
    version INT DEFAULT 0 COMMENT '版本号',
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_milestone_id (milestone_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='里程碑负责人表';

-- 里程碑任务表
CREATE TABLE IF NOT EXISTS milestone_task (
    id BIGINT PRIMARY KEY COMMENT '主键ID',
    tenant_id BIGINT NOT NULL DEFAULT 0 COMMENT '租户ID',
    milestone_id BIGINT NOT NULL COMMENT '里程碑ID',
    name VARCHAR(200) NOT NULL COMMENT '任务名称',
    description TEXT COMMENT '描述',
    assignee_id BIGINT COMMENT '执行人ID',
    status VARCHAR(20) DEFAULT 'pending' COMMENT '状态',
    priority VARCHAR(20) DEFAULT 'medium' COMMENT '优先级',
    start_date DATE COMMENT '开始日期',
    end_date DATE COMMENT '结束日期',
    due_date DATE COMMENT '截止日期',
    progress INT DEFAULT 0 COMMENT '进度',
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
    INDEX idx_assignee_id (assignee_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='里程碑任务表';

-- 部门表
CREATE TABLE IF NOT EXISTS department (
    id BIGINT PRIMARY KEY COMMENT '主键ID',
    tenant_id BIGINT NOT NULL DEFAULT 0 COMMENT '租户ID',
    project_id BIGINT NOT NULL COMMENT '项目ID',
    name VARCHAR(100) NOT NULL COMMENT '部门名称',
    description TEXT COMMENT '描述',
    manager_id BIGINT COMMENT '负责人ID',
    parent_id BIGINT COMMENT '父部门ID',
    sort_order INT DEFAULT 0 COMMENT '排序',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT COMMENT '创建人ID',
    updated_by BIGINT COMMENT '更新人ID',
    dept_id BIGINT COMMENT '部门ID',
    deleted INT DEFAULT 0 COMMENT '删除标记',
    version INT DEFAULT 0 COMMENT '版本号',
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_project_id (project_id),
    INDEX idx_manager_id (manager_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='部门表';

-- 部门任务表
CREATE TABLE IF NOT EXISTS department_task (
    id BIGINT PRIMARY KEY COMMENT '主键ID',
    tenant_id BIGINT NOT NULL DEFAULT 0 COMMENT '租户ID',
    department_id BIGINT NOT NULL COMMENT '部门ID',
    milestone_id BIGINT COMMENT '里程碑ID',
    project_id BIGINT COMMENT '项目ID',
    manager_id BIGINT COMMENT '部门负责人ID',
    name VARCHAR(200) NOT NULL COMMENT '任务名称',
    description TEXT COMMENT '描述',
    assignee_id BIGINT COMMENT '执行人ID',
    status VARCHAR(20) DEFAULT 'pending' COMMENT '状态',
    priority VARCHAR(20) DEFAULT 'medium' COMMENT '优先级',
    start_date DATE COMMENT '开始日期',
    end_date DATE COMMENT '截止日期',
    progress INT DEFAULT 0 COMMENT '进度',
    require_plan INT DEFAULT 0 COMMENT '是否需要提交工作计划(0-否,1-是)',
    require_approval INT DEFAULT 0 COMMENT '工作计划是否需要审批(0-否,1-是)',
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
    INDEX idx_department_id (department_id),
    INDEX idx_milestone_id (milestone_id),
    INDEX idx_project_id (project_id),
    INDEX idx_manager_id (manager_id),
    INDEX idx_assignee_id (assignee_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='部门任务表';

-- 子任务表
CREATE TABLE IF NOT EXISTS subtask (
    id BIGINT PRIMARY KEY COMMENT '主键ID',
    tenant_id BIGINT NOT NULL DEFAULT 0 COMMENT '租户ID',
    task_id BIGINT NOT NULL COMMENT '父任务ID',
    name VARCHAR(200) NOT NULL COMMENT '子任务名称',
    description TEXT COMMENT '描述',
    assignee_id BIGINT COMMENT '执行人ID',
    status VARCHAR(20) DEFAULT 'pending' COMMENT '状态',
    priority VARCHAR(20) DEFAULT 'medium' COMMENT '优先级',
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
    INDEX idx_task_id (task_id),
    INDEX idx_assignee_id (assignee_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='子任务表';

-- 任务评论表
CREATE TABLE IF NOT EXISTS task_comment (
    id BIGINT PRIMARY KEY COMMENT '主键ID',
    tenant_id BIGINT NOT NULL DEFAULT 0 COMMENT '租户ID',
    task_id BIGINT NOT NULL COMMENT '任务ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    content TEXT NOT NULL COMMENT '评论内容',
    parent_id BIGINT COMMENT '父评论ID',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT COMMENT '创建人ID',
    updated_by BIGINT COMMENT '更新人ID',
    dept_id BIGINT COMMENT '部门ID',
    deleted INT DEFAULT 0 COMMENT '删除标记',
    version INT DEFAULT 0 COMMENT '版本号',
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_task_id (task_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='任务评论表';

-- 项目角色表
CREATE TABLE IF NOT EXISTS project_role (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    tenant_id BIGINT NOT NULL DEFAULT 0 COMMENT '租户ID',
    project_id BIGINT NOT NULL COMMENT '项目ID',
    name VARCHAR(50) NOT NULL COMMENT '角色名称',
    code VARCHAR(50) NOT NULL COMMENT '角色编码',
    description VARCHAR(255) COMMENT '角色描述',
    permissions JSON COMMENT '权限列表',
    is_default TINYINT(1) DEFAULT 0 COMMENT '是否默认角色',
    sort_order INT DEFAULT 0 COMMENT '排序',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    create_by BIGINT COMMENT '创建人ID',
    update_by BIGINT COMMENT '更新人ID',
    deleted TINYINT(1) DEFAULT 0 COMMENT '是否删除',
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_project_id (project_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='项目角色表';

-- 项目配置表
CREATE TABLE IF NOT EXISTS project_config (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    tenant_id BIGINT NOT NULL DEFAULT 0 COMMENT '租户ID',
    project_id BIGINT NOT NULL COMMENT '项目ID',
    config_key VARCHAR(100) NOT NULL COMMENT '配置键',
    config_value TEXT COMMENT '配置值',
    config_type VARCHAR(50) DEFAULT 'string' COMMENT '配置类型',
    description VARCHAR(255) COMMENT '配置描述',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_project_id (project_id),
    UNIQUE INDEX uk_project_config_key (project_id, config_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='项目配置表';

-- 项目访问记录表
CREATE TABLE IF NOT EXISTS project_access_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    tenant_id BIGINT NOT NULL DEFAULT 0 COMMENT '租户ID',
    project_id BIGINT NOT NULL COMMENT '项目ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    access_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '访问时间',
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_project_id (project_id),
    INDEX idx_user_id (user_id),
    INDEX idx_access_time (access_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='项目访问记录表';

-- 项目收藏表
CREATE TABLE IF NOT EXISTS project_favorite (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    tenant_id BIGINT NOT NULL DEFAULT 0 COMMENT '租户ID',
    project_id BIGINT NOT NULL COMMENT '项目ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_project_id (project_id),
    INDEX idx_user_id (user_id),
    UNIQUE INDEX uk_project_favorite (project_id, user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='项目收藏表';

-- 项目模板使用记录表
CREATE TABLE IF NOT EXISTS project_template_usage (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    tenant_id BIGINT NOT NULL DEFAULT 0 COMMENT '租户ID',
    template_id BIGINT NOT NULL COMMENT '模板ID',
    project_id BIGINT NOT NULL COMMENT '项目ID',
    user_id BIGINT NOT NULL COMMENT '使用者ID',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_template_id (template_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='项目模板使用记录表';

-- 用户表（项目服务本地缓存）
CREATE TABLE IF NOT EXISTS user (
    id BIGINT PRIMARY KEY COMMENT '主键ID',
    tenant_id BIGINT NOT NULL DEFAULT 0 COMMENT '租户ID',
    username VARCHAR(50) NOT NULL COMMENT '用户名',
    nickname VARCHAR(100) COMMENT '昵称',
    email VARCHAR(100) COMMENT '邮箱',
    phone VARCHAR(20) COMMENT '手机号',
    avatar VARCHAR(500) COMMENT '头像',
    status VARCHAR(20) DEFAULT 'active' COMMENT '状态',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 工作流模板表
CREATE TABLE IF NOT EXISTS workflow_template (
    id BIGINT PRIMARY KEY COMMENT '主键ID',
    tenant_id BIGINT NOT NULL DEFAULT 0 COMMENT '租户ID',
    name VARCHAR(100) NOT NULL COMMENT '工作流名称',
    description TEXT COMMENT '工作流描述',
    project_id BIGINT COMMENT '所属项目ID（NULL表示全局模板）',
    is_default TINYINT(1) DEFAULT 0 COMMENT '是否为默认工作流',
    is_system TINYINT(1) DEFAULT 0 COMMENT '是否为系统预设工作流',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT COMMENT '创建人ID',
    updated_by BIGINT COMMENT '更新人ID',
    dept_id BIGINT COMMENT '部门ID',
    deleted INT DEFAULT 0 COMMENT '删除标记',
    version INT DEFAULT 0 COMMENT '版本号',
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_project_id (project_id),
    INDEX idx_is_system (is_system),
    INDEX idx_is_default (is_default)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='工作流模板表';

-- 工作流状态表
CREATE TABLE IF NOT EXISTS workflow_status (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    workflow_id BIGINT NOT NULL COMMENT '所属工作流ID',
    name VARCHAR(50) NOT NULL COMMENT '状态名称',
    description VARCHAR(255) COMMENT '状态描述',
    color VARCHAR(20) COMMENT '状态颜色',
    icon VARCHAR(50) COMMENT '状态图标',
    sort_order INT DEFAULT 0 COMMENT '排序顺序',
    is_initial TINYINT(1) DEFAULT 0 COMMENT '是否为初始状态',
    is_final TINYINT(1) DEFAULT 0 COMMENT '是否为终态',
    status_type VARCHAR(20) DEFAULT 'todo' COMMENT '状态类型：todo, in_progress, done, cancelled',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_workflow_id (workflow_id),
    INDEX idx_status_type (status_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='工作流状态表';

-- 工作流流转规则表
CREATE TABLE IF NOT EXISTS workflow_transition (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    workflow_id BIGINT NOT NULL COMMENT '所属工作流ID',
    from_status_id BIGINT NOT NULL COMMENT '源状态ID',
    to_status_id BIGINT NOT NULL COMMENT '目标状态ID',
    name VARCHAR(100) COMMENT '流转名称',
    description VARCHAR(255) COMMENT '流转描述',
    conditions JSON COMMENT '流转条件',
    actions JSON COMMENT '流转时执行的动作',
    allowed_roles JSON COMMENT '允许执行此流转的角色',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_workflow_id (workflow_id),
    INDEX idx_from_status_id (from_status_id),
    INDEX idx_to_status_id (to_status_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='工作流流转规则表';

-- 创建 sys_user 视图（指向 mota_auth.sys_user，用于跨服务查询）
-- 注意：此视图依赖 mota_auth 数据库，需要在 mota_auth 初始化后执行
CREATE OR REPLACE VIEW sys_user AS SELECT * FROM mota_auth.sys_user;

-- 插入默认项目角色
INSERT INTO project_role (project_id, tenant_id, name, code, description, permissions, is_default, sort_order) VALUES
(0, 0, '项目负责人', 'owner', '项目负责人，拥有项目的所有权限', '["project:*"]', 1, 1),
(0, 0, '项目管理员', 'admin', '项目管理员，可以管理项目设置和成员', '["project:manage", "project:member:*", "task:*", "milestone:*"]', 1, 2),
(0, 0, '开发人员', 'developer', '开发人员，可以创建和管理任务', '["task:create", "task:update", "task:view", "milestone:view"]', 1, 3),
(0, 0, '测试人员', 'tester', '测试人员，可以查看和更新任务状态', '["task:view", "task:update:status", "milestone:view"]', 1, 4),
(0, 0, '观察者', 'viewer', '观察者，只能查看项目信息', '["project:view", "task:view", "milestone:view"]', 1, 5);

-- 插入默认工作流模板
INSERT INTO workflow_template (id, tenant_id, name, description, project_id, is_default, is_system) VALUES
(1, 0, '标准任务工作流', '适用于大多数任务的标准工作流', NULL, 1, 1),
(2, 0, '敏捷开发工作流', '适用于敏捷开发团队的工作流', NULL, 0, 1),
(3, 0, '简单工作流', '只有待办和完成两个状态的简单工作流', NULL, 0, 1);

-- 插入标准任务工作流的状态
INSERT INTO workflow_status (workflow_id, name, description, color, icon, sort_order, is_initial, is_final, status_type) VALUES
(1, '待办', '任务待处理', '#909399', 'clock', 1, 1, 0, 'todo'),
(1, '进行中', '任务正在处理', '#409EFF', 'loading', 2, 0, 0, 'in_progress'),
(1, '已完成', '任务已完成', '#67C23A', 'check', 3, 0, 1, 'done'),
(1, '已取消', '任务已取消', '#F56C6C', 'close', 4, 0, 1, 'cancelled');

-- 插入敏捷开发工作流的状态
INSERT INTO workflow_status (workflow_id, name, description, color, icon, sort_order, is_initial, is_final, status_type) VALUES
(2, '待办', '待处理的任务', '#909399', 'clock', 1, 1, 0, 'todo'),
(2, '开发中', '正在开发', '#409EFF', 'edit', 2, 0, 0, 'in_progress'),
(2, '代码审查', '等待代码审查', '#E6A23C', 'view', 3, 0, 0, 'in_progress'),
(2, '测试中', '正在测试', '#909399', 'search', 4, 0, 0, 'in_progress'),
(2, '已完成', '任务已完成', '#67C23A', 'check', 5, 0, 1, 'done');

-- 插入简单工作流的状态
INSERT INTO workflow_status (workflow_id, name, description, color, icon, sort_order, is_initial, is_final, status_type) VALUES
(3, '待办', '待处理', '#909399', 'clock', 1, 1, 0, 'todo'),
(3, '已完成', '已完成', '#67C23A', 'check', 2, 0, 1, 'done');

-- 插入标准任务工作流的流转规则
INSERT INTO workflow_transition (workflow_id, from_status_id, to_status_id, name, description) VALUES
(1, 1, 2, '开始处理', '将任务从待办变为进行中'),
(1, 2, 3, '完成任务', '将任务标记为已完成'),
(1, 2, 1, '退回待办', '将任务退回待办状态'),
(1, 1, 4, '取消任务', '取消待办任务'),
(1, 2, 4, '取消任务', '取消进行中的任务');

-- 插入敏捷开发工作流的流转规则
INSERT INTO workflow_transition (workflow_id, from_status_id, to_status_id, name, description) VALUES
(2, 5, 6, '开始开发', '开始开发任务'),
(2, 6, 7, '提交审查', '提交代码审查'),
(2, 7, 6, '审查不通过', '代码审查不通过，返回开发'),
(2, 7, 8, '审查通过', '代码审查通过，进入测试'),
(2, 8, 6, '测试不通过', '测试不通过，返回开发'),
(2, 8, 9, '测试通过', '测试通过，任务完成');

-- 插入简单工作流的流转规则
INSERT INTO workflow_transition (workflow_id, from_status_id, to_status_id, name, description) VALUES
(3, 10, 11, '完成', '将任务标记为已完成'),
(3, 11, 10, '重新打开', '重新打开已完成的任务');

SELECT '项目服务数据库表初始化完成!' AS message;