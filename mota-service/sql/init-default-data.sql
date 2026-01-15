-- =====================================================
-- Mota SaaS 系统默认数据初始化脚本
-- 包含：默认部门、角色、权限
-- 此脚本应在 init-db.sql 执行后运行
-- =====================================================

-- 设置字符集
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- =====================================================
-- 一、初始化权限数据 (mota_user 数据库)
-- =====================================================
USE mota_user;

-- 清空现有权限数据（谨慎使用，生产环境请注释掉）
-- DELETE FROM sys_role_permission;
-- DELETE FROM sys_permission WHERE id > 0;

-- 检查 sys_permission 表是否存在，如果不存在则创建
CREATE TABLE IF NOT EXISTS `sys_permission` (
    `id` BIGINT NOT NULL COMMENT '权限ID',
    `tenant_id` BIGINT NOT NULL DEFAULT 0 COMMENT '租户ID',
    `name` VARCHAR(100) NOT NULL COMMENT '权限名称',
    `code` VARCHAR(100) DEFAULT NULL COMMENT '权限编码',
    `parent_id` BIGINT DEFAULT 0 COMMENT '父权限ID',
    `type` TINYINT DEFAULT 1 COMMENT '类型（1目录 2菜单 3按钮）',
    `path` VARCHAR(200) DEFAULT NULL COMMENT '路由地址',
    `component` VARCHAR(200) DEFAULT NULL COMMENT '组件路径',
    `perms` VARCHAR(100) DEFAULT NULL COMMENT '权限标识',
    `icon` VARCHAR(100) DEFAULT NULL COMMENT '图标',
    `sort` INT DEFAULT 0 COMMENT '显示顺序',
    `visible` TINYINT DEFAULT 1 COMMENT '是否可见（1是 0否）',
    `keep_alive` TINYINT DEFAULT 0 COMMENT '是否缓存（1是 0否）',
    `status` TINYINT DEFAULT 1 COMMENT '状态（1正常 0停用）',
    `remark` VARCHAR(500) DEFAULT NULL COMMENT '备注',
    `create_by` BIGINT DEFAULT NULL COMMENT '创建者',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_by` BIGINT DEFAULT NULL COMMENT '更新者',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted` TINYINT DEFAULT 0 COMMENT '删除标志（0未删除 1已删除）',
    `version` INT DEFAULT 0 COMMENT '乐观锁版本号',
    PRIMARY KEY (`id`),
    KEY `idx_parent_id` (`parent_id`),
    KEY `idx_tenant_id` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='权限/菜单表';

-- 检查 sys_role 表是否存在，如果不存在则创建
CREATE TABLE IF NOT EXISTS `sys_role` (
    `id` BIGINT NOT NULL COMMENT '角色ID',
    `tenant_id` BIGINT NOT NULL DEFAULT 0 COMMENT '租户ID',
    `name` VARCHAR(100) NOT NULL COMMENT '角色名称',
    `code` VARCHAR(50) NOT NULL COMMENT '角色编码',
    `sort` INT DEFAULT 0 COMMENT '显示顺序',
    `data_scope` TINYINT DEFAULT 1 COMMENT '数据范围（1全部 2自定义 3本部门 4本部门及以下 5仅本人）',
    `status` TINYINT DEFAULT 1 COMMENT '状态（1正常 0停用）',
    `is_system` TINYINT DEFAULT 0 COMMENT '是否系统内置（1是 0否）',
    `remark` VARCHAR(500) DEFAULT NULL COMMENT '备注',
    `create_by` BIGINT DEFAULT NULL COMMENT '创建者',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_by` BIGINT DEFAULT NULL COMMENT '更新者',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted` TINYINT DEFAULT 0 COMMENT '删除标志（0未删除 1已删除）',
    `version` INT DEFAULT 0 COMMENT '乐观锁版本号',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_code_tenant` (`code`, `tenant_id`),
    KEY `idx_tenant_id` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色表';

-- 检查 sys_role_permission 表是否存在
CREATE TABLE IF NOT EXISTS `sys_role_permission` (
    `role_id` BIGINT NOT NULL COMMENT '角色ID',
    `permission_id` BIGINT NOT NULL COMMENT '权限ID',
    PRIMARY KEY (`role_id`, `permission_id`),
    KEY `idx_permission_id` (`permission_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色权限关联表';

-- 检查 sys_user_role 表是否存在
CREATE TABLE IF NOT EXISTS `sys_user_role` (
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `role_id` BIGINT NOT NULL COMMENT '角色ID',
    PRIMARY KEY (`user_id`, `role_id`),
    KEY `idx_role_id` (`role_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户角色关联表';

-- =====================================================
-- 二、插入完整权限数据
-- =====================================================

-- 删除旧的权限数据（使用 REPLACE INTO 或 INSERT IGNORE）
DELETE FROM sys_permission WHERE deleted = 0;

-- 一级菜单
INSERT INTO sys_permission (id, tenant_id, name, code, parent_id, type, path, component, perms, icon, sort, visible, status, deleted) VALUES
-- 工作台
(1, 0, '工作台', 'dashboard', 0, 1, '/dashboard', 'dashboard/index', 'dashboard:view', 'DashboardOutlined', 1, 1, 1, 0),
-- AI助理
(10, 0, 'AI助理', 'ai', 0, 1, '/ai', NULL, 'ai:view', 'RobotOutlined', 10, 1, 1, 0),
-- 项目协同
(20, 0, '项目协同', 'project', 0, 1, '/projects', NULL, 'project:view', 'ProjectOutlined', 20, 1, 1, 0),
-- 知识库
(30, 0, '知识库', 'knowledge', 0, 1, '/knowledge', NULL, 'knowledge:view', 'BookOutlined', 30, 1, 1, 0),
-- 日程管理
(40, 0, '日程管理', 'calendar', 0, 1, '/calendar', NULL, 'calendar:view', 'CalendarOutlined', 40, 1, 1, 0),
-- 新闻追踪
(50, 0, '新闻追踪', 'news', 0, 1, '/news', NULL, 'news:view', 'ReadOutlined', 50, 1, 1, 0),
-- 组织管理
(60, 0, '组织管理', 'organization', 0, 1, '/organization', NULL, 'organization:view', 'TeamOutlined', 60, 1, 1, 0),
-- 系统设置
(70, 0, '系统设置', 'system', 0, 1, '/system', NULL, 'system:view', 'SettingOutlined', 70, 1, 1, 0);

-- AI助理子菜单
INSERT INTO sys_permission (id, tenant_id, name, code, parent_id, type, path, component, perms, icon, sort, visible, status, deleted) VALUES
(1001, 0, 'AI助手', 'ai:assistant', 10, 2, '/ai/assistant', 'ai/assistant/index', 'ai:assistant:view', NULL, 1, 1, 1, 0),
(1002, 0, '方案生成', 'ai:proposal', 10, 2, '/ai/proposal', 'ai/proposal/index', 'ai:proposal:view', NULL, 2, 1, 1, 0),
(1003, 0, 'PPT生成', 'ai:ppt', 10, 2, '/ai/ppt', 'ai/ppt/index', 'ai:ppt:view', NULL, 3, 1, 1, 0),
(1004, 0, 'AI知识库', 'ai:knowledge', 10, 2, '/ai/knowledge', 'ai/knowledge/index', 'ai:knowledge:view', NULL, 4, 1, 1, 0),
(1005, 0, '智能搜索', 'ai:search', 10, 2, '/ai/search', 'ai/search/index', 'ai:search:view', NULL, 5, 1, 1, 0),
(1006, 0, '模型训练', 'ai:training', 10, 2, '/ai/training', 'ai/training/index', 'ai:training:view', NULL, 6, 1, 1, 0),
(1007, 0, '历史记录', 'ai:history', 10, 2, '/ai/history', 'ai/history/index', 'ai:history:view', NULL, 7, 1, 1, 0),
(1008, 0, '模型管理', 'ai:model', 10, 2, '/ai/model', 'ai/model/index', 'ai:model:view', NULL, 8, 1, 1, 0);

-- 项目协同子菜单
INSERT INTO sys_permission (id, tenant_id, name, code, parent_id, type, path, component, perms, icon, sort, visible, status, deleted) VALUES
(2001, 0, '项目管理', 'project:list', 20, 2, '/projects', 'project/list/index', 'project:list:view', NULL, 1, 1, 1, 0),
(2002, 0, '我的任务', 'project:tasks', 20, 2, '/tasks', 'project/tasks/index', 'project:tasks:view', NULL, 2, 1, 1, 0),
(2003, 0, '进度跟踪', 'project:progress', 20, 2, '/progress', 'project/progress/index', 'project:progress:view', NULL, 3, 1, 1, 0),
(2004, 0, '资源管理', 'project:resource', 20, 2, '/resources', 'project/resource/index', 'project:resource:view', NULL, 4, 1, 1, 0);

-- 知识库子菜单
INSERT INTO sys_permission (id, tenant_id, name, code, parent_id, type, path, component, perms, icon, sort, visible, status, deleted) VALUES
(3001, 0, '文档管理', 'knowledge:docs', 30, 2, '/knowledge/docs', 'knowledge/docs/index', 'knowledge:docs:view', NULL, 1, 1, 1, 0),
(3002, 0, '知识图谱', 'knowledge:graph', 30, 2, '/knowledge/graph', 'knowledge/graph/index', 'knowledge:graph:view', NULL, 2, 1, 1, 0),
(3003, 0, '模板中心', 'knowledge:templates', 30, 2, '/knowledge/templates', 'knowledge/templates/index', 'knowledge:templates:view', NULL, 3, 1, 1, 0);

-- 组织管理子菜单
INSERT INTO sys_permission (id, tenant_id, name, code, parent_id, type, path, component, perms, icon, sort, visible, status, deleted) VALUES
(6001, 0, '部门管理', 'org:department', 60, 2, '/departments', 'organization/department/index', 'org:department:view', NULL, 1, 1, 1, 0),
(6002, 0, '成员管理', 'org:member', 60, 2, '/members', 'organization/member/index', 'org:member:view', NULL, 2, 1, 1, 0),
(6003, 0, '角色管理', 'org:role', 60, 2, '/roles', 'organization/role/index', 'org:role:view', NULL, 3, 1, 1, 0),
(6004, 0, '权限管理', 'org:permission', 60, 2, '/permissions', 'organization/permission/index', 'org:permission:view', NULL, 4, 1, 1, 0);

-- 系统设置子菜单
INSERT INTO sys_permission (id, tenant_id, name, code, parent_id, type, path, component, perms, icon, sort, visible, status, deleted) VALUES
(7001, 0, '企业设置', 'system:enterprise', 70, 2, '/system/enterprise', 'system/enterprise/index', 'system:enterprise:view', NULL, 1, 1, 1, 0),
(7002, 0, '安全设置', 'system:security', 70, 2, '/system/security', 'system/security/index', 'system:security:view', NULL, 2, 1, 1, 0),
(7003, 0, '集成管理', 'system:integration', 70, 2, '/system/integration', 'system/integration/index', 'system:integration:view', NULL, 3, 1, 1, 0),
(7004, 0, '操作日志', 'system:log', 70, 2, '/system/log', 'system/log/index', 'system:log:view', NULL, 4, 1, 1, 0);

-- 按钮权限（操作权限）
INSERT INTO sys_permission (id, tenant_id, name, code, parent_id, type, path, perms, sort, visible, status, deleted) VALUES
-- 项目操作权限
(20011, 0, '创建项目', 'project:create', 2001, 3, NULL, 'project:create', 1, 1, 1, 0),
(20012, 0, '编辑项目', 'project:edit', 2001, 3, NULL, 'project:edit', 2, 1, 1, 0),
(20013, 0, '删除项目', 'project:delete', 2001, 3, NULL, 'project:delete', 3, 1, 1, 0),
(20014, 0, '归档项目', 'project:archive', 2001, 3, NULL, 'project:archive', 4, 1, 1, 0),
-- 任务操作权限
(20021, 0, '创建任务', 'task:create', 2002, 3, NULL, 'task:create', 1, 1, 1, 0),
(20022, 0, '编辑任务', 'task:edit', 2002, 3, NULL, 'task:edit', 2, 1, 1, 0),
(20023, 0, '删除任务', 'task:delete', 2002, 3, NULL, 'task:delete', 3, 1, 1, 0),
(20024, 0, '分配任务', 'task:assign', 2002, 3, NULL, 'task:assign', 4, 1, 1, 0),
-- 部门操作权限
(60011, 0, '创建部门', 'department:create', 6001, 3, NULL, 'department:create', 1, 1, 1, 0),
(60012, 0, '编辑部门', 'department:edit', 6001, 3, NULL, 'department:edit', 2, 1, 1, 0),
(60013, 0, '删除部门', 'department:delete', 6001, 3, NULL, 'department:delete', 3, 1, 1, 0),
-- 成员操作权限
(60021, 0, '邀请成员', 'member:invite', 6002, 3, NULL, 'member:invite', 1, 1, 1, 0),
(60022, 0, '编辑成员', 'member:edit', 6002, 3, NULL, 'member:edit', 2, 1, 1, 0),
(60023, 0, '移除成员', 'member:remove', 6002, 3, NULL, 'member:remove', 3, 1, 1, 0),
(60024, 0, '禁用成员', 'member:disable', 6002, 3, NULL, 'member:disable', 4, 1, 1, 0),
-- 角色操作权限
(60031, 0, '创建角色', 'role:create', 6003, 3, NULL, 'role:create', 1, 1, 1, 0),
(60032, 0, '编辑角色', 'role:edit', 6003, 3, NULL, 'role:edit', 2, 1, 1, 0),
(60033, 0, '删除角色', 'role:delete', 6003, 3, NULL, 'role:delete', 3, 1, 1, 0),
(60034, 0, '分配权限', 'role:assign', 6003, 3, NULL, 'role:assign', 4, 1, 1, 0),
-- AI模型训练权限
(10061, 0, '上传训练数据', 'ai:training:upload', 1006, 3, NULL, 'ai:training:upload', 1, 1, 1, 0),
(10062, 0, '启动训练', 'ai:training:start', 1006, 3, NULL, 'ai:training:start', 2, 1, 1, 0),
(10063, 0, '部署模型', 'ai:training:deploy', 1006, 3, NULL, 'ai:training:deploy', 3, 1, 1, 0),
-- 系统设置权限
(70011, 0, '编辑企业信息', 'enterprise:edit', 7001, 3, NULL, 'enterprise:edit', 1, 1, 1, 0),
(70021, 0, '安全配置', 'security:config', 7002, 3, NULL, 'security:config', 1, 1, 1, 0),
(70031, 0, '集成配置', 'integration:config', 7003, 3, NULL, 'integration:config', 1, 1, 1, 0);

-- =====================================================
-- 三、创建完整角色体系
-- =====================================================

-- 删除旧的角色数据
DELETE FROM sys_role WHERE deleted = 0;

-- 企业级管理角色
INSERT INTO sys_role (id, tenant_id, name, code, sort, data_scope, status, is_system, remark, deleted) VALUES
(1, 0, '超级管理员', 'super_admin', 1, 1, 1, 1, '系统最高权限，拥有所有功能的完全控制权，包括系统配置、企业数据、付费管理等', 0),
(2, 0, '企业管理员', 'enterprise_admin', 2, 1, 1, 1, '企业级管理权限，可管理部门架构、角色权限、成员账号、审批流程等', 0);

-- 部门级管理角色
INSERT INTO sys_role (id, tenant_id, name, code, sort, data_scope, status, is_system, remark, deleted) VALUES
(3, 0, '部门经理', 'dept_manager', 3, 3, 1, 1, '部门管理权限，可管理本部门成员、任务分配、数据统计、审批节点等', 0),
(4, 0, '项目负责人', 'project_manager', 4, 4, 1, 1, '项目管理权限，可创建项目、分配成员、管控进度、风险预警等', 0);

-- 普通员工角色
INSERT INTO sys_role (id, tenant_id, name, code, sort, data_scope, status, is_system, remark, deleted) VALUES
(5, 0, '普通成员', 'member', 5, 5, 1, 1, '基础员工权限，可接收任务、提交进度、参与协作、提交审批等', 0),
(6, 0, '实习生/外包', 'intern', 6, 5, 1, 1, '受限权限，仅可查看和提交分配的任务，无法访问核心数据', 0);

-- SaaS专属角色
INSERT INTO sys_role (id, tenant_id, name, code, sort, data_scope, status, is_system, remark, deleted) VALUES
(7, 0, '数据分析师', 'data_analyst', 7, 4, 1, 1, '数据分析权限，可提取数据、生成报表、配置可视化、评估算法效果', 0),
(8, 0, 'AI模型训练师', 'ai_trainer', 8, 4, 1, 1, 'AI训练权限，可上传训练数据、调整模型参数、管理模型版本、监控效果', 0),
(9, 0, '合规专员', 'compliance_officer', 9, 2, 1, 1, '合规审核权限，可审核数据隐私、检查权限合规、配置监管政策', 0);

-- =====================================================
-- 四、角色权限关联
-- =====================================================

-- 清空角色权限关联表
DELETE FROM sys_role_permission;

-- 超级管理员 - 拥有所有权限
INSERT INTO sys_role_permission (role_id, permission_id)
SELECT 1, id FROM sys_permission WHERE deleted = 0;

-- 企业管理员 - 除系统核心配置外的所有权限
INSERT INTO sys_role_permission (role_id, permission_id)
SELECT 2, id FROM sys_permission WHERE deleted = 0 AND code NOT IN ('system:security', 'security:config');

-- 部门经理 - 工作台、项目、知识库、日程、组织管理（部门和成员）
INSERT INTO sys_role_permission (role_id, permission_id)
SELECT 3, id FROM sys_permission WHERE deleted = 0 AND (
    id IN (1, 20, 30, 40, 60) OR
    parent_id IN (20, 30, 40) OR
    id IN (6001, 6002, 60011, 60012, 60021, 60022)
);

-- 项目负责人 - 工作台、项目管理、知识库、日程
INSERT INTO sys_role_permission (role_id, permission_id)
SELECT 4, id FROM sys_permission WHERE deleted = 0 AND (
    id IN (1, 20, 30, 40) OR
    parent_id IN (20, 30, 40) OR
    id IN (20011, 20012, 20013, 20014, 20021, 20022, 20023, 20024)
);

-- 普通成员 - 工作台、项目（查看和任务）、知识库（查看）、日程、AI助手
INSERT INTO sys_role_permission (role_id, permission_id)
SELECT 5, id FROM sys_permission WHERE deleted = 0 AND (
    id IN (1, 10, 20, 30, 40) OR
    id IN (1001, 1002, 1003, 1005, 1007) OR
    id IN (2001, 2002, 2003) OR
    id IN (3001, 3003) OR
    id IN (20021, 20022)
);

-- 实习生/外包 - 仅工作台和任务查看
INSERT INTO sys_role_permission (role_id, permission_id)
SELECT 6, id FROM sys_permission WHERE deleted = 0 AND id IN (1, 2002);

-- 数据分析师 - 工作台、AI分析、项目数据、知识库
INSERT INTO sys_role_permission (role_id, permission_id)
SELECT 7, id FROM sys_permission WHERE deleted = 0 AND (
    id IN (1, 10, 20, 30) OR
    id IN (1001, 1005, 1007) OR
    id IN (2001, 2003) OR
    id IN (3001, 3002)
);

-- AI模型训练师 - 工作台、AI全部功能
INSERT INTO sys_role_permission (role_id, permission_id)
SELECT 8, id FROM sys_permission WHERE deleted = 0 AND (
    id IN (1, 10) OR
    parent_id = 10 OR
    id IN (10061, 10062, 10063)
);

-- 合规专员 - 工作台、系统设置、操作日志
INSERT INTO sys_role_permission (role_id, permission_id)
SELECT 9, id FROM sys_permission WHERE deleted = 0 AND (
    id IN (1, 70) OR
    id IN (7001, 7002, 7004)
);

-- =====================================================
-- 五、创建默认部门架构 (mota_user 数据库)
-- =====================================================

-- 删除旧的部门数据
DELETE FROM department WHERE deleted = 0;

-- 创建默认部门架构（使用通用组织ID 'default'，实际使用时需要替换为具体企业的org_id）
-- 一级部门
INSERT INTO department (id, org_id, name, description, parent_id, sort_order, status, created_at, updated_at, deleted, version) VALUES
(1, 'default', '总部', '公司总部/总经办', NULL, 1, 1, NOW(), NOW(), 0, 1),
(2, 'default', '研发部', '负责产品开发、迭代、技术维护', NULL, 2, 1, NOW(), NOW(), 0, 1),
(3, 'default', '产品部', '负责需求调研、产品规划、原型设计、版本管理', NULL, 3, 1, NOW(), NOW(), 0, 1),
(4, 'default', '市场部', '负责品牌推广、获客、市场调研、活动策划', NULL, 4, 1, NOW(), NOW(), 0, 1),
(5, 'default', '销售部', '负责客户跟进、合同签订、回款', NULL, 5, 1, NOW(), NOW(), 0, 1),
(6, 'default', '客户成功部', '负责客户培训、问题解决、续费转化', NULL, 6, 1, NOW(), NOW(), 0, 1),
(7, 'default', '运营部', '负责用户运营、内容运营、数据运营', NULL, 7, 1, NOW(), NOW(), 0, 1),
(8, 'default', '人力资源部', '负责招聘、绩效、员工管理', NULL, 8, 1, NOW(), NOW(), 0, 1),
(9, 'default', '财务部', '负责预算、报销、财务报表', NULL, 9, 1, NOW(), NOW(), 0, 1),
(10, 'default', '行政部', '负责办公用品、办公环境、行政事务', NULL, 10, 1, NOW(), NOW(), 0, 1),
(11, 'default', '数据合规部', '负责数据隐私、算法合规、行业监管适配', NULL, 11, 1, NOW(), NOW(), 0, 1),
(12, 'default', '项目部', '统筹跨部门项目的资源协调和进度管控', NULL, 12, 1, NOW(), NOW(), 0, 1);

-- 研发部子部门
INSERT INTO department (id, org_id, name, description, parent_id, sort_order, status, created_at, updated_at, deleted, version) VALUES
(201, 'default', '前端组', '负责Web/移动端前端开发', 2, 1, 1, NOW(), NOW(), 0, 1),
(202, 'default', '后端组', '负责服务端开发、API设计', 2, 2, 1, NOW(), NOW(), 0, 1),
(203, 'default', '算法组', '负责AI算法研发、模型训练', 2, 3, 1, NOW(), NOW(), 0, 1),
(204, 'default', '测试组', '负责质量保证、自动化测试', 2, 4, 1, NOW(), NOW(), 0, 1),
(205, 'default', '运维组', '负责系统运维、DevOps', 2, 5, 1, NOW(), NOW(), 0, 1);

-- 销售部子部门
INSERT INTO department (id, org_id, name, description, parent_id, sort_order, status, created_at, updated_at, deleted, version) VALUES
(501, 'default', '直销组', '负责直接客户销售', 5, 1, 1, NOW(), NOW(), 0, 1),
(502, 'default', '渠道组', '负责渠道分销合作', 5, 2, 1, NOW(), NOW(), 0, 1);

-- 运营部子部门
INSERT INTO department (id, org_id, name, description, parent_id, sort_order, status, created_at, updated_at, deleted, version) VALUES
(701, 'default', '用户运营组', '负责用户活跃度和留存', 7, 1, 1, NOW(), NOW(), 0, 1),
(702, 'default', '内容运营组', '负责内容创作和传播', 7, 2, 1, NOW(), NOW(), 0, 1),
(703, 'default', '数据运营组', '负责数据分析和优化', 7, 3, 1, NOW(), NOW(), 0, 1);

-- =====================================================
-- 六、同步部门数据到 mota_project 数据库
-- =====================================================
USE mota_project;

-- 删除旧的部门数据
DELETE FROM department WHERE deleted = 0;

-- 同步部门数据
INSERT INTO department (id, org_id, name, description, parent_id, sort_order, status, created_at, updated_at, deleted, version) VALUES
(1, 'default', '总部', '公司总部/总经办', NULL, 1, 1, NOW(), NOW(), 0, 1),
(2, 'default', '研发部', '负责产品开发、迭代、技术维护', NULL, 2, 1, NOW(), NOW(), 0, 1),
(3, 'default', '产品部', '负责需求调研、产品规划、原型设计、版本管理', NULL, 3, 1, NOW(), NOW(), 0, 1),
(4, 'default', '市场部', '负责品牌推广、获客、市场调研、活动策划', NULL, 4, 1, NOW(), NOW(), 0, 1),
(5, 'default', '销售部', '负责客户跟进、合同签订、回款', NULL, 5, 1, NOW(), NOW(), 0, 1),
(6, 'default', '客户成功部', '负责客户培训、问题解决、续费转化', NULL, 6, 1, NOW(), NOW(), 0, 1),
(7, 'default', '运营部', '负责用户运营、内容运营、数据运营', NULL, 7, 1, NOW(), NOW(), 0, 1),
(8, 'default', '人力资源部', '负责招聘、绩效、员工管理', NULL, 8, 1, NOW(), NOW(), 0, 1),
(9, 'default', '财务部', '负责预算、报销、财务报表', NULL, 9, 1, NOW(), NOW(), 0, 1),
(10, 'default', '行政部', '负责办公用品、办公环境、行政事务', NULL, 10, 1, NOW(), NOW(), 0, 1),
(11, 'default', '数据合规部', '负责数据隐私、算法合规、行业监管适配', NULL, 11, 1, NOW(), NOW(), 0, 1),
(12, 'default', '项目部', '统筹跨部门项目的资源协调和进度管控', NULL, 12, 1, NOW(), NOW(), 0, 1),
(201, 'default', '前端组', '负责Web/移动端前端开发', 2, 1, 1, NOW(), NOW(), 0, 1),
(202, 'default', '后端组', '负责服务端开发、API设计', 2, 2, 1, NOW(), NOW(), 0, 1),
(203, 'default', '算法组', '负责AI算法研发、模型训练', 2, 3, 1, NOW(), NOW(), 0, 1),
(204, 'default', '测试组', '负责质量保证、自动化测试', 2, 4, 1, NOW(), NOW(), 0, 1),
(205, 'default', '运维组', '负责系统运维、DevOps', 2, 5, 1, NOW(), NOW(), 0, 1),
(501, 'default', '直销组', '负责直接客户销售', 5, 1, 1, NOW(), NOW(), 0, 1),
(502, 'default', '渠道组', '负责渠道分销合作', 5, 2, 1, NOW(), NOW(), 0, 1),
(701, 'default', '用户运营组', '负责用户活跃度和留存', 7, 1, 1, NOW(), NOW(), 0, 1),
(702, 'default', '内容运营组', '负责内容创作和传播', 7, 2, 1, NOW(), NOW(), 0, 1),
(703, 'default', '数据运营组', '负责数据分析和优化', 7, 3, 1, NOW(), NOW(), 0, 1);

-- =====================================================
-- 完成
-- =====================================================
USE mota_user;

SELECT '默认数据初始化完成！' AS message;
SELECT CONCAT('已创建 ', COUNT(*), ' 个权限') AS permissions FROM sys_permission WHERE deleted = 0;
SELECT CONCAT('已创建 ', COUNT(*), ' 个角色') AS roles FROM sys_role WHERE deleted = 0;
SELECT CONCAT('已创建 ', COUNT(*), ' 个部门') AS departments FROM department WHERE deleted = 0;