-- 用户服务数据库表结构
-- 数据库: mota_user

-- 用户表
CREATE TABLE IF NOT EXISTS `sys_user` (
    `id` BIGINT NOT NULL COMMENT '用户ID',
    `tenant_id` BIGINT NOT NULL DEFAULT 0 COMMENT '租户ID',
    `username` VARCHAR(50) NOT NULL COMMENT '用户名',
    `email` VARCHAR(100) DEFAULT NULL COMMENT '邮箱',
    `phone` VARCHAR(20) DEFAULT NULL COMMENT '手机号',
    `password_hash` VARCHAR(255) NOT NULL COMMENT '密码哈希',
    `nickname` VARCHAR(50) DEFAULT NULL COMMENT '昵称',
    `real_name` VARCHAR(50) DEFAULT NULL COMMENT '真实姓名',
    `avatar` VARCHAR(500) DEFAULT NULL COMMENT '头像URL',
    `gender` TINYINT DEFAULT 0 COMMENT '性别（0未知 1男 2女）',
    `status` TINYINT DEFAULT 1 COMMENT '状态（1正常 0禁用）',
    `dept_id` BIGINT DEFAULT NULL COMMENT '部门ID',
    `post_id` BIGINT DEFAULT NULL COMMENT '岗位ID',
    `user_type` TINYINT DEFAULT 1 COMMENT '用户类型（1普通用户 2管理员 3超级管理员）',
    `last_login_at` DATETIME DEFAULT NULL COMMENT '最后登录时间',
    `last_login_ip` VARCHAR(50) DEFAULT NULL COMMENT '最后登录IP',
    `login_fail_count` INT DEFAULT 0 COMMENT '登录失败次数',
    `lock_time` DATETIME DEFAULT NULL COMMENT '账号锁定时间',
    `password_expire_at` DATETIME DEFAULT NULL COMMENT '密码过期时间',
    `remark` VARCHAR(500) DEFAULT NULL COMMENT '备注',
    `create_by` BIGINT DEFAULT NULL COMMENT '创建者',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_by` BIGINT DEFAULT NULL COMMENT '更新者',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted` TINYINT DEFAULT 0 COMMENT '删除标志（0未删除 1已删除）',
    `version` INT DEFAULT 0 COMMENT '乐观锁版本号',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_username_tenant` (`username`, `tenant_id`),
    KEY `idx_email` (`email`),
    KEY `idx_phone` (`phone`),
    KEY `idx_dept_id` (`dept_id`),
    KEY `idx_tenant_id` (`tenant_id`),
    KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 部门表
CREATE TABLE IF NOT EXISTS `sys_dept` (
    `id` BIGINT NOT NULL COMMENT '部门ID',
    `tenant_id` BIGINT NOT NULL DEFAULT 0 COMMENT '租户ID',
    `name` VARCHAR(100) NOT NULL COMMENT '部门名称',
    `code` VARCHAR(50) DEFAULT NULL COMMENT '部门编码',
    `parent_id` BIGINT DEFAULT 0 COMMENT '父部门ID',
    `ancestors` VARCHAR(500) DEFAULT '' COMMENT '祖级列表',
    `level` INT DEFAULT 1 COMMENT '部门层级',
    `sort` INT DEFAULT 0 COMMENT '显示顺序',
    `leader_id` BIGINT DEFAULT NULL COMMENT '负责人ID',
    `leader_name` VARCHAR(50) DEFAULT NULL COMMENT '负责人姓名',
    `phone` VARCHAR(20) DEFAULT NULL COMMENT '联系电话',
    `email` VARCHAR(100) DEFAULT NULL COMMENT '邮箱',
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
    KEY `idx_tenant_id` (`tenant_id`),
    KEY `idx_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='部门表';

-- 岗位表
CREATE TABLE IF NOT EXISTS `sys_post` (
    `id` BIGINT NOT NULL COMMENT '岗位ID',
    `tenant_id` BIGINT NOT NULL DEFAULT 0 COMMENT '租户ID',
    `name` VARCHAR(100) NOT NULL COMMENT '岗位名称',
    `code` VARCHAR(50) NOT NULL COMMENT '岗位编码',
    `level` TINYINT DEFAULT 3 COMMENT '岗位层级（1高层 2中层 3基层）',
    `sort` INT DEFAULT 0 COMMENT '显示顺序',
    `status` TINYINT DEFAULT 1 COMMENT '状态（1正常 0停用）',
    `duties` TEXT DEFAULT NULL COMMENT '岗位职责描述',
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='岗位表';

-- 角色表
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

-- 权限/菜单表
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

-- 用户角色关联表
CREATE TABLE IF NOT EXISTS `sys_user_role` (
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `role_id` BIGINT NOT NULL COMMENT '角色ID',
    PRIMARY KEY (`user_id`, `role_id`),
    KEY `idx_role_id` (`role_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户角色关联表';

-- 角色权限关联表
CREATE TABLE IF NOT EXISTS `sys_role_permission` (
    `role_id` BIGINT NOT NULL COMMENT '角色ID',
    `permission_id` BIGINT NOT NULL COMMENT '权限ID',
    PRIMARY KEY (`role_id`, `permission_id`),
    KEY `idx_permission_id` (`permission_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色权限关联表';

-- 角色部门关联表（用于自定义数据权限）
CREATE TABLE IF NOT EXISTS `sys_role_dept` (
    `role_id` BIGINT NOT NULL COMMENT '角色ID',
    `dept_id` BIGINT NOT NULL COMMENT '部门ID',
    PRIMARY KEY (`role_id`, `dept_id`),
    KEY `idx_dept_id` (`dept_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色部门关联表';

-- 登录日志表
CREATE TABLE IF NOT EXISTS `sys_login_log` (
    `id` BIGINT NOT NULL COMMENT '日志ID',
    `tenant_id` BIGINT NOT NULL DEFAULT 0 COMMENT '租户ID',
    `user_id` BIGINT DEFAULT NULL COMMENT '用户ID',
    `username` VARCHAR(50) DEFAULT NULL COMMENT '用户名',
    `login_type` VARCHAR(20) DEFAULT NULL COMMENT '登录类型（password/sso/oauth）',
    `ip_address` VARCHAR(50) DEFAULT NULL COMMENT 'IP地址',
    `location` VARCHAR(100) DEFAULT NULL COMMENT '登录地点',
    `browser` VARCHAR(50) DEFAULT NULL COMMENT '浏览器',
    `os` VARCHAR(50) DEFAULT NULL COMMENT '操作系统',
    `status` TINYINT DEFAULT 1 COMMENT '状态（1成功 0失败）',
    `message` VARCHAR(500) DEFAULT NULL COMMENT '消息',
    `login_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '登录时间',
    PRIMARY KEY (`id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_tenant_id` (`tenant_id`),
    KEY `idx_login_time` (`login_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='登录日志表';

-- 初始化超级管理员角色
INSERT INTO `sys_role` (`id`, `tenant_id`, `name`, `code`, `sort`, `data_scope`, `status`, `is_system`, `remark`) VALUES
(1, 0, '超级管理员', 'super_admin', 1, 1, 1, 1, '系统内置超级管理员角色'),
(2, 0, '管理员', 'admin', 2, 1, 1, 1, '系统内置管理员角色'),
(3, 0, '普通用户', 'user', 3, 5, 1, 1, '系统内置普通用户角色');

-- 初始化系统菜单
INSERT INTO `sys_permission` (`id`, `tenant_id`, `name`, `code`, `parent_id`, `type`, `path`, `component`, `perms`, `icon`, `sort`, `visible`, `status`) VALUES
-- 系统管理
(100, 0, '系统管理', 'system', 0, 1, '/system', NULL, NULL, 'setting', 1, 1, 1),
(101, 0, '用户管理', 'system:user', 100, 2, '/system/user', 'system/user/index', 'system:user:list', 'user', 1, 1, 1),
(102, 0, '角色管理', 'system:role', 100, 2, '/system/role', 'system/role/index', 'system:role:list', 'peoples', 2, 1, 1),
(103, 0, '菜单管理', 'system:menu', 100, 2, '/system/menu', 'system/menu/index', 'system:menu:list', 'tree-table', 3, 1, 1),
(104, 0, '部门管理', 'system:dept', 100, 2, '/system/dept', 'system/dept/index', 'system:dept:list', 'tree', 4, 1, 1),
(105, 0, '岗位管理', 'system:post', 100, 2, '/system/post', 'system/post/index', 'system:post:list', 'post', 5, 1, 1),
-- 用户管理按钮
(1011, 0, '用户查询', NULL, 101, 3, NULL, NULL, 'system:user:query', NULL, 1, 1, 1),
(1012, 0, '用户新增', NULL, 101, 3, NULL, NULL, 'system:user:create', NULL, 2, 1, 1),
(1013, 0, '用户修改', NULL, 101, 3, NULL, NULL, 'system:user:update', NULL, 3, 1, 1),
(1014, 0, '用户删除', NULL, 101, 3, NULL, NULL, 'system:user:delete', NULL, 4, 1, 1),
(1015, 0, '重置密码', NULL, 101, 3, NULL, NULL, 'system:user:resetPwd', NULL, 5, 1, 1),
(1016, 0, '分配角色', NULL, 101, 3, NULL, NULL, 'system:user:assignRole', NULL, 6, 1, 1);

-- 为超级管理员分配所有权限
INSERT INTO `sys_role_permission` (`role_id`, `permission_id`)
SELECT 1, id FROM `sys_permission` WHERE `deleted` = 0;