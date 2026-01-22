-- =====================================================
-- 用户服务数据库表初始化脚本
-- =====================================================

-- 设置字符集
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET character_set_connection=utf8mb4;

USE mota_user;

-- 部门表
CREATE TABLE IF NOT EXISTS `sys_dept` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '部门ID',
    `tenant_id` BIGINT COMMENT '租户ID',
    `name` VARCHAR(100) NOT NULL COMMENT '部门名称',
    `code` VARCHAR(50) COMMENT '部门编码',
    `parent_id` BIGINT DEFAULT 0 COMMENT '父部门ID',
    `ancestors` VARCHAR(500) DEFAULT '' COMMENT '祖级列表',
    `level` INT DEFAULT 1 COMMENT '部门层级',
    `sort` INT DEFAULT 0 COMMENT '显示顺序',
    `leader_id` BIGINT COMMENT '负责人ID',
    `leader_name` VARCHAR(50) COMMENT '负责人姓名',
    `phone` VARCHAR(20) COMMENT '联系电话',
    `email` VARCHAR(100) COMMENT '邮箱',
    `status` TINYINT DEFAULT 1 COMMENT '状态（1正常 0停用）',
    `remark` VARCHAR(500) COMMENT '备注',
    `created_by` BIGINT COMMENT '创建人ID',
    `updated_by` BIGINT COMMENT '更新人ID',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted` TINYINT DEFAULT 0 COMMENT '删除标记：0-未删除，1-已删除',
    `version` INT DEFAULT 0 COMMENT '乐观锁版本号',
    INDEX `idx_parent_id` (`parent_id`),
    INDEX `idx_code` (`code`),
    INDEX `idx_status` (`status`),
    INDEX `idx_tenant` (`tenant_id`),
    INDEX `idx_deleted` (`deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='部门表';

-- 角色表
CREATE TABLE IF NOT EXISTS `sys_role` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '角色ID',
    `tenant_id` BIGINT COMMENT '租户ID',
    `name` VARCHAR(100) NOT NULL COMMENT '角色名称',
    `code` VARCHAR(50) NOT NULL COMMENT '角色编码',
    `remark` VARCHAR(500) COMMENT '角色描述/备注',
    `sort` INT DEFAULT 0 COMMENT '显示顺序',
    `data_scope` TINYINT DEFAULT 1 COMMENT '数据范围（1全部 2自定义 3本部门 4本部门及以下 5仅本人）',
    `status` TINYINT DEFAULT 1 COMMENT '状态（1正常 0停用）',
    `is_system` TINYINT DEFAULT 0 COMMENT '是否系统内置（1是 0否）',
    `dept_id` BIGINT COMMENT '部门ID',
    `created_by` BIGINT COMMENT '创建人ID',
    `updated_by` BIGINT COMMENT '更新人ID',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted` TINYINT DEFAULT 0 COMMENT '删除标记：0-未删除，1-已删除',
    `version` INT DEFAULT 0 COMMENT '乐观锁版本号',
    UNIQUE KEY `uk_code` (`code`),
    INDEX `idx_status` (`status`),
    INDEX `idx_tenant` (`tenant_id`),
    INDEX `idx_deleted` (`deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色表';

-- 权限表
CREATE TABLE IF NOT EXISTS `sys_permission` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '权限ID',
    `name` VARCHAR(100) NOT NULL COMMENT '权限名称',
    `code` VARCHAR(100) NOT NULL COMMENT '权限编码',
    `type` VARCHAR(20) DEFAULT 'menu' COMMENT '权限类型（menu菜单 button按钮 api接口）',
    `parent_id` BIGINT DEFAULT 0 COMMENT '父权限ID',
    `path` VARCHAR(200) COMMENT '路由路径',
    `component` VARCHAR(200) COMMENT '组件路径',
    `icon` VARCHAR(100) COMMENT '图标',
    `sort` INT DEFAULT 0 COMMENT '显示顺序',
    `visible` TINYINT DEFAULT 1 COMMENT '是否可见（1是 0否）',
    `status` TINYINT DEFAULT 1 COMMENT '状态（1正常 0停用）',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted` TINYINT DEFAULT 0 COMMENT '删除标记：0-未删除，1-已删除',
    UNIQUE KEY `uk_code` (`code`),
    INDEX `idx_parent_id` (`parent_id`),
    INDEX `idx_type` (`type`),
    INDEX `idx_status` (`status`),
    INDEX `idx_deleted` (`deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='权限表';

-- 用户角色关联表
CREATE TABLE IF NOT EXISTS `sys_user_role` (
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `role_id` BIGINT NOT NULL COMMENT '角色ID',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`user_id`, `role_id`),
    INDEX `idx_role_id` (`role_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户角色关联表';

-- 角色权限关联表
CREATE TABLE IF NOT EXISTS `sys_role_permission` (
    `role_id` BIGINT NOT NULL COMMENT '角色ID',
    `permission_id` BIGINT NOT NULL COMMENT '权限ID',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`role_id`, `permission_id`),
    INDEX `idx_permission_id` (`permission_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色权限关联表';

-- 岗位表
CREATE TABLE IF NOT EXISTS `sys_post` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '岗位ID',
    `tenant_id` BIGINT COMMENT '租户ID',
    `name` VARCHAR(100) NOT NULL COMMENT '岗位名称',
    `code` VARCHAR(50) NOT NULL COMMENT '岗位编码',
    `sort` INT DEFAULT 0 COMMENT '显示顺序',
    `status` TINYINT DEFAULT 1 COMMENT '状态（1正常 0停用）',
    `remark` VARCHAR(500) COMMENT '备注',
    `created_by` BIGINT COMMENT '创建人ID',
    `updated_by` BIGINT COMMENT '更新人ID',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted` TINYINT DEFAULT 0 COMMENT '删除标记：0-未删除，1-已删除',
    `version` INT DEFAULT 0 COMMENT '乐观锁版本号',
    INDEX `idx_code` (`code`),
    INDEX `idx_status` (`status`),
    INDEX `idx_tenant` (`tenant_id`),
    INDEX `idx_deleted` (`deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='岗位表';

-- 用户扩展表（与auth服务的sys_user关联）
CREATE TABLE IF NOT EXISTS `sys_user_ext` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID',
    `user_id` BIGINT NOT NULL COMMENT '用户ID（关联auth服务的sys_user）',
    `tenant_id` BIGINT COMMENT '租户ID',
    `dept_id` BIGINT COMMENT '部门ID',
    `post_id` BIGINT COMMENT '岗位ID',
    `employee_no` VARCHAR(50) COMMENT '工号',
    `real_name` VARCHAR(50) COMMENT '真实姓名',
    `gender` TINYINT DEFAULT 0 COMMENT '性别（0未知 1男 2女）',
    `birthday` DATE COMMENT '生日',
    `address` VARCHAR(500) COMMENT '地址',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted` TINYINT DEFAULT 0 COMMENT '删除标记：0-未删除，1-已删除',
    UNIQUE KEY `uk_user_id` (`user_id`),
    INDEX `idx_dept_id` (`dept_id`),
    INDEX `idx_post_id` (`post_id`),
    INDEX `idx_tenant` (`tenant_id`),
    INDEX `idx_deleted` (`deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户扩展表';

-- 插入默认部门
INSERT INTO `sys_dept` (`id`, `tenant_id`, `name`, `code`, `parent_id`, `ancestors`, `level`, `sort`, `status`, `created_at`, `updated_at`, `deleted`) VALUES
(1, 1, '摩塔科技', 'MOTA', 0, '0', 1, 1, 1, NOW(), NOW(), 0),
(2, 1, '技术部', 'TECH', 1, '0,1', 2, 1, 1, NOW(), NOW(), 0),
(3, 1, '产品部', 'PRODUCT', 1, '0,1', 2, 2, 1, NOW(), NOW(), 0),
(4, 1, '运营部', 'OPERATION', 1, '0,1', 2, 3, 1, NOW(), NOW(), 0);

-- 插入默认角色
INSERT INTO `sys_role` (`id`, `tenant_id`, `name`, `code`, `remark`, `sort`, `data_scope`, `status`, `is_system`, `created_at`, `updated_at`, `deleted`) VALUES
(1, 1, '超级管理员', 'super_admin', '系统最高权限，拥有所有功能的完全控制权', 1, 1, 1, 1, NOW(), NOW(), 0),
(2, 1, '企业管理员', 'enterprise_admin', '企业级管理权限，可管理部门架构、角色权限、成员账号', 2, 1, 1, 1, NOW(), NOW(), 0),
(3, 1, '部门经理', 'dept_manager', '部门管理权限，可管理本部门成员、任务分配、数据统计', 3, 3, 1, 1, NOW(), NOW(), 0),
(4, 1, '项目负责人', 'project_manager', '项目管理权限，可创建项目、分配成员、管控进度', 4, 4, 1, 1, NOW(), NOW(), 0),
(5, 1, '普通成员', 'member', '基础员工权限，可接收任务、提交进度、参与协作', 5, 5, 1, 1, NOW(), NOW(), 0),
(6, 1, '实习生/外包', 'intern', '受限权限，仅可查看和提交分配的任务', 6, 5, 1, 1, NOW(), NOW(), 0),
(7, 1, '数据分析师', 'data_analyst', '数据分析权限，可提取数据、生成报表、配置可视化', 7, 4, 1, 1, NOW(), NOW(), 0),
(8, 1, 'AI模型训练师', 'ai_trainer', 'AI训练权限，可上传训练数据、调整模型参数、管理模型版本', 8, 4, 1, 1, NOW(), NOW(), 0),
(9, 1, '合规专员', 'compliance_officer', '合规审核权限，可审核数据隐私、检查权限合规', 9, 2, 1, 1, NOW(), NOW(), 0);

-- 插入默认权限（一级菜单）
INSERT INTO `sys_permission` (`id`, `name`, `code`, `type`, `parent_id`, `path`, `component`, `icon`, `sort`, `visible`, `status`, `created_at`, `updated_at`, `deleted`) VALUES
(1, '工作台', 'dashboard', 'menu', 0, '/dashboard', 'dashboard/index', 'DashboardOutlined', 1, 1, 1, NOW(), NOW(), 0),
(10, 'AI助理', 'ai', 'directory', 0, '/ai', NULL, 'RobotOutlined', 10, 1, 1, NOW(), NOW(), 0),
(20, '项目协同', 'project', 'directory', 0, '/projects', NULL, 'ProjectOutlined', 20, 1, 1, NOW(), NOW(), 0),
(30, '知识库', 'knowledge', 'directory', 0, '/knowledge', NULL, 'BookOutlined', 30, 1, 1, NOW(), NOW(), 0),
(40, '日程管理', 'calendar', 'menu', 0, '/calendar', 'calendar/index', 'CalendarOutlined', 40, 1, 1, NOW(), NOW(), 0),
(50, '新闻追踪', 'news', 'menu', 0, '/news', 'news/index', 'ReadOutlined', 50, 1, 1, NOW(), NOW(), 0),
(60, '组织管理', 'organization', 'directory', 0, '/organization', NULL, 'TeamOutlined', 60, 1, 1, NOW(), NOW(), 0),
(70, '系统设置', 'system', 'directory', 0, '/system', NULL, 'SettingOutlined', 70, 1, 1, NOW(), NOW(), 0);

-- AI助理子菜单
INSERT INTO `sys_permission` (`id`, `name`, `code`, `type`, `parent_id`, `path`, `component`, `icon`, `sort`, `visible`, `status`, `created_at`, `updated_at`, `deleted`) VALUES
(1001, 'AI助手', 'ai:assistant', 'menu', 10, '/ai/assistant', 'ai/assistant/index', NULL, 1, 1, 1, NOW(), NOW(), 0),
(1002, '方案生成', 'ai:proposal', 'menu', 10, '/ai/proposal', 'ai/proposal/index', NULL, 2, 1, 1, NOW(), NOW(), 0),
(1003, 'PPT生成', 'ai:ppt', 'menu', 10, '/ai/ppt', 'ai/ppt/index', NULL, 3, 1, 1, NOW(), NOW(), 0),
(1004, 'AI知识库', 'ai:knowledge', 'menu', 10, '/ai/knowledge', 'ai/knowledge/index', NULL, 4, 1, 1, NOW(), NOW(), 0),
(1005, '智能搜索', 'ai:search', 'menu', 10, '/ai/search', 'ai/search/index', NULL, 5, 1, 1, NOW(), NOW(), 0),
(1006, '模型训练', 'ai:training', 'menu', 10, '/ai/training', 'ai/training/index', NULL, 6, 1, 1, NOW(), NOW(), 0),
(1007, '历史记录', 'ai:history', 'menu', 10, '/ai/history', 'ai/history/index', NULL, 7, 1, 1, NOW(), NOW(), 0),
(1008, '模型管理', 'ai:model', 'menu', 10, '/ai/model', 'ai/model/index', NULL, 8, 1, 1, NOW(), NOW(), 0);

-- 项目协同子菜单
INSERT INTO `sys_permission` (`id`, `name`, `code`, `type`, `parent_id`, `path`, `component`, `icon`, `sort`, `visible`, `status`, `created_at`, `updated_at`, `deleted`) VALUES
(2001, '项目管理', 'project:list', 'menu', 20, '/projects', 'project/list/index', NULL, 1, 1, 1, NOW(), NOW(), 0),
(2002, '我的任务', 'project:tasks', 'menu', 20, '/tasks', 'project/tasks/index', NULL, 2, 1, 1, NOW(), NOW(), 0),
(2003, '进度跟踪', 'project:progress', 'menu', 20, '/progress', 'project/progress/index', NULL, 3, 1, 1, NOW(), NOW(), 0),
(2004, '资源管理', 'project:resource', 'menu', 20, '/resources', 'project/resource/index', NULL, 4, 1, 1, NOW(), NOW(), 0);

-- 知识库子菜单
INSERT INTO `sys_permission` (`id`, `name`, `code`, `type`, `parent_id`, `path`, `component`, `icon`, `sort`, `visible`, `status`, `created_at`, `updated_at`, `deleted`) VALUES
(3001, '文档管理', 'knowledge:docs', 'menu', 30, '/knowledge/docs', 'knowledge/docs/index', NULL, 1, 1, 1, NOW(), NOW(), 0),
(3002, '知识图谱', 'knowledge:graph', 'menu', 30, '/knowledge/graph', 'knowledge/graph/index', NULL, 2, 1, 1, NOW(), NOW(), 0),
(3003, '模板中心', 'knowledge:templates', 'menu', 30, '/knowledge/templates', 'knowledge/templates/index', NULL, 3, 1, 1, NOW(), NOW(), 0);

-- 组织管理子菜单
INSERT INTO `sys_permission` (`id`, `name`, `code`, `type`, `parent_id`, `path`, `component`, `icon`, `sort`, `visible`, `status`, `created_at`, `updated_at`, `deleted`) VALUES
(6001, '部门管理', 'org:department', 'menu', 60, '/departments', 'organization/department/index', NULL, 1, 1, 1, NOW(), NOW(), 0),
(6002, '成员管理', 'org:member', 'menu', 60, '/members', 'organization/member/index', NULL, 2, 1, 1, NOW(), NOW(), 0),
(6003, '角色管理', 'org:role', 'menu', 60, '/roles', 'organization/role/index', NULL, 3, 1, 1, NOW(), NOW(), 0),
(6004, '权限管理', 'org:permission', 'menu', 60, '/permissions', 'organization/permission/index', NULL, 4, 1, 1, NOW(), NOW(), 0);

-- 系统设置子菜单
INSERT INTO `sys_permission` (`id`, `name`, `code`, `type`, `parent_id`, `path`, `component`, `icon`, `sort`, `visible`, `status`, `created_at`, `updated_at`, `deleted`) VALUES
(7001, '企业设置', 'system:enterprise', 'menu', 70, '/system/enterprise', 'system/enterprise/index', NULL, 1, 1, 1, NOW(), NOW(), 0),
(7002, '安全设置', 'system:security', 'menu', 70, '/system/security', 'system/security/index', NULL, 2, 1, 1, NOW(), NOW(), 0),
(7003, '集成管理', 'system:integration', 'menu', 70, '/system/integration', 'system/integration/index', NULL, 3, 1, 1, NOW(), NOW(), 0),
(7004, '操作日志', 'system:log', 'menu', 70, '/system/log', 'system/log/index', NULL, 4, 1, 1, NOW(), NOW(), 0);

-- 按钮权限
INSERT INTO `sys_permission` (`id`, `name`, `code`, `type`, `parent_id`, `path`, `icon`, `sort`, `visible`, `status`, `created_at`, `updated_at`, `deleted`) VALUES
(20011, '创建项目', 'project:create', 'button', 2001, NULL, NULL, 1, 1, 1, NOW(), NOW(), 0),
(20012, '编辑项目', 'project:edit', 'button', 2001, NULL, NULL, 2, 1, 1, NOW(), NOW(), 0),
(20013, '删除项目', 'project:delete', 'button', 2001, NULL, NULL, 3, 1, 1, NOW(), NOW(), 0),
(20014, '归档项目', 'project:archive', 'button', 2001, NULL, NULL, 4, 1, 1, NOW(), NOW(), 0),
(20021, '创建任务', 'task:create', 'button', 2002, NULL, NULL, 1, 1, 1, NOW(), NOW(), 0),
(20022, '编辑任务', 'task:edit', 'button', 2002, NULL, NULL, 2, 1, 1, NOW(), NOW(), 0),
(20023, '删除任务', 'task:delete', 'button', 2002, NULL, NULL, 3, 1, 1, NOW(), NOW(), 0),
(20024, '分配任务', 'task:assign', 'button', 2002, NULL, NULL, 4, 1, 1, NOW(), NOW(), 0),
(60011, '创建部门', 'department:create', 'button', 6001, NULL, NULL, 1, 1, 1, NOW(), NOW(), 0),
(60012, '编辑部门', 'department:edit', 'button', 6001, NULL, NULL, 2, 1, 1, NOW(), NOW(), 0),
(60013, '删除部门', 'department:delete', 'button', 6001, NULL, NULL, 3, 1, 1, NOW(), NOW(), 0),
(60021, '邀请成员', 'member:invite', 'button', 6002, NULL, NULL, 1, 1, 1, NOW(), NOW(), 0),
(60022, '编辑成员', 'member:edit', 'button', 6002, NULL, NULL, 2, 1, 1, NOW(), NOW(), 0),
(60023, '移除成员', 'member:remove', 'button', 6002, NULL, NULL, 3, 1, 1, NOW(), NOW(), 0),
(60024, '禁用成员', 'member:disable', 'button', 6002, NULL, NULL, 4, 1, 1, NOW(), NOW(), 0),
(60031, '创建角色', 'role:create', 'button', 6003, NULL, NULL, 1, 1, 1, NOW(), NOW(), 0),
(60032, '编辑角色', 'role:edit', 'button', 6003, NULL, NULL, 2, 1, 1, NOW(), NOW(), 0),
(60033, '删除角色', 'role:delete', 'button', 6003, NULL, NULL, 3, 1, 1, NOW(), NOW(), 0),
(60034, '分配权限', 'role:assign', 'button', 6003, NULL, NULL, 4, 1, 1, NOW(), NOW(), 0),
(10061, '上传训练数据', 'ai:training:upload', 'button', 1006, NULL, NULL, 1, 1, 1, NOW(), NOW(), 0),
(10062, '启动训练', 'ai:training:start', 'button', 1006, NULL, NULL, 2, 1, 1, NOW(), NOW(), 0),
(10063, '部署模型', 'ai:training:deploy', 'button', 1006, NULL, NULL, 3, 1, 1, NOW(), NOW(), 0),
(70011, '编辑企业信息', 'enterprise:edit', 'button', 7001, NULL, NULL, 1, 1, 1, NOW(), NOW(), 0),
(70021, '安全配置', 'security:config', 'button', 7002, NULL, NULL, 1, 1, 1, NOW(), NOW(), 0),
(70031, '集成配置', 'integration:config', 'button', 7003, NULL, NULL, 1, 1, 1, NOW(), NOW(), 0);

-- 为超级管理员分配所有权限
INSERT IGNORE INTO `sys_role_permission` (`role_id`, `permission_id`, `created_at`)
SELECT 1, id, NOW() FROM `sys_permission` WHERE deleted = 0;

-- 为企业管理员分配权限（除系统核心配置外）
INSERT IGNORE INTO `sys_role_permission` (`role_id`, `permission_id`, `created_at`)
SELECT 2, id, NOW() FROM `sys_permission` WHERE deleted = 0 AND code NOT IN ('system:security', 'security:config');

-- 为部门经理分配权限
INSERT IGNORE INTO `sys_role_permission` (`role_id`, `permission_id`, `created_at`)
SELECT 3, id, NOW() FROM `sys_permission` WHERE deleted = 0 AND (
    id IN (1, 20, 30, 40, 60) OR
    parent_id IN (20, 30, 40) OR
    id IN (6001, 6002, 60011, 60012, 60021, 60022)
);

-- 为项目负责人分配权限
INSERT IGNORE INTO `sys_role_permission` (`role_id`, `permission_id`, `created_at`)
SELECT 4, id, NOW() FROM `sys_permission` WHERE deleted = 0 AND (
    id IN (1, 20, 30, 40) OR
    parent_id IN (20, 30, 40) OR
    id IN (20011, 20012, 20013, 20014, 20021, 20022, 20023, 20024)
);

-- 为普通成员分配权限
INSERT IGNORE INTO `sys_role_permission` (`role_id`, `permission_id`, `created_at`)
SELECT 5, id, NOW() FROM `sys_permission` WHERE deleted = 0 AND (
    id IN (1, 10, 20, 30, 40) OR
    id IN (1001, 1002, 1003, 1005, 1007) OR
    id IN (2001, 2002, 2003) OR
    id IN (3001, 3003) OR
    id IN (20021, 20022)
);

-- 为实习生/外包分配权限
INSERT IGNORE INTO `sys_role_permission` (`role_id`, `permission_id`, `created_at`)
SELECT 6, id, NOW() FROM `sys_permission` WHERE deleted = 0 AND id IN (1, 2002);

-- 为数据分析师分配权限
INSERT IGNORE INTO `sys_role_permission` (`role_id`, `permission_id`, `created_at`)
SELECT 7, id, NOW() FROM `sys_permission` WHERE deleted = 0 AND (
    id IN (1, 10, 20, 30) OR
    id IN (1001, 1005, 1007) OR
    id IN (2001, 2003) OR
    id IN (3001, 3002)
);

-- 为AI模型训练师分配权限
INSERT IGNORE INTO `sys_role_permission` (`role_id`, `permission_id`, `created_at`)
SELECT 8, id, NOW() FROM `sys_permission` WHERE deleted = 0 AND (
    id IN (1, 10) OR
    parent_id = 10 OR
    id IN (10061, 10062, 10063)
);

-- 为合规专员分配权限
INSERT IGNORE INTO `sys_role_permission` (`role_id`, `permission_id`, `created_at`)
SELECT 9, id, NOW() FROM `sys_permission` WHERE deleted = 0 AND (
    id IN (1, 70) OR
    id IN (7001, 7002, 7004)
);

-- 输出结果
SELECT 'mota_user 数据库表初始化完成!' AS message;
SELECT COUNT(*) AS total_depts FROM `sys_dept`;
SELECT COUNT(*) AS total_roles FROM `sys_role`;
SELECT COUNT(*) AS total_permissions FROM `sys_permission`;