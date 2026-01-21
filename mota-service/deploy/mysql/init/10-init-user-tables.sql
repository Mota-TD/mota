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
    `description` VARCHAR(500) COMMENT '角色描述',
    `sort` INT DEFAULT 0 COMMENT '显示顺序',
    `data_scope` TINYINT DEFAULT 1 COMMENT '数据范围（1全部 2自定义 3本部门 4本部门及以下 5仅本人）',
    `status` TINYINT DEFAULT 1 COMMENT '状态（1正常 0停用）',
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
INSERT INTO `sys_role` (`id`, `tenant_id`, `name`, `code`, `description`, `sort`, `data_scope`, `status`, `created_at`, `updated_at`, `deleted`) VALUES
(1, 1, '超级管理员', 'super_admin', '拥有所有权限', 1, 1, 1, NOW(), NOW(), 0),
(2, 1, '管理员', 'admin', '管理员角色', 2, 1, 1, NOW(), NOW(), 0),
(3, 1, '普通用户', 'user', '普通用户角色', 3, 5, 1, NOW(), NOW(), 0);

-- 插入默认权限
INSERT INTO `sys_permission` (`id`, `name`, `code`, `type`, `parent_id`, `path`, `sort`, `status`, `created_at`, `updated_at`, `deleted`) VALUES
(1, '系统管理', 'system', 'menu', 0, '/system', 1, 1, NOW(), NOW(), 0),
(2, '用户管理', 'system:user', 'menu', 1, '/system/user', 1, 1, NOW(), NOW(), 0),
(3, '角色管理', 'system:role', 'menu', 1, '/system/role', 2, 1, NOW(), NOW(), 0),
(4, '部门管理', 'system:dept', 'menu', 1, '/system/dept', 3, 1, NOW(), NOW(), 0),
(5, '项目管理', 'project', 'menu', 0, '/projects', 2, 1, NOW(), NOW(), 0),
(6, '任务管理', 'task', 'menu', 0, '/tasks', 3, 1, NOW(), NOW(), 0),
(7, '知识库', 'knowledge', 'menu', 0, '/knowledge', 4, 1, NOW(), NOW(), 0),
(8, 'AI助手', 'ai', 'menu', 0, '/ai', 5, 1, NOW(), NOW(), 0);

-- 为超级管理员分配所有权限
INSERT INTO `sys_role_permission` (`role_id`, `permission_id`, `created_at`) VALUES
(1, 1, NOW()), (1, 2, NOW()), (1, 3, NOW()), (1, 4, NOW()),
(1, 5, NOW()), (1, 6, NOW()), (1, 7, NOW()), (1, 8, NOW());

-- 为管理员分配部分权限
INSERT INTO `sys_role_permission` (`role_id`, `permission_id`, `created_at`) VALUES
(2, 5, NOW()), (2, 6, NOW()), (2, 7, NOW()), (2, 8, NOW());

-- 为普通用户分配基本权限
INSERT INTO `sys_role_permission` (`role_id`, `permission_id`, `created_at`) VALUES
(3, 5, NOW()), (3, 6, NOW()), (3, 7, NOW());

-- 输出结果
SELECT 'mota_user 数据库表初始化完成!' AS message;
SELECT COUNT(*) AS total_depts FROM `sys_dept`;
SELECT COUNT(*) AS total_roles FROM `sys_role`;
SELECT COUNT(*) AS total_permissions FROM `sys_permission`;