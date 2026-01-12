-- =====================================================
-- 项目服务数据库表更新脚本
-- 添加多租户支持和项目模板功能
-- =====================================================

-- 1. 更新项目表，添加多租户和模板相关字段
ALTER TABLE `project` 
ADD COLUMN `tenant_id` BIGINT NULL COMMENT '租户ID（多租户隔离）' AFTER `id`,
ADD COLUMN `project_type` VARCHAR(50) DEFAULT 'standard' COMMENT '项目类型(standard/template/agile/waterfall/kanban)' AFTER `visibility`,
ADD COLUMN `template_id` BIGINT NULL COMMENT '模板ID（如果是从模板创建的项目）' AFTER `project_type`,
ADD COLUMN `is_template` TINYINT(1) DEFAULT 0 COMMENT '是否为模板项目' AFTER `template_id`,
ADD COLUMN `settings` JSON NULL COMMENT '项目配置（JSON格式）' AFTER `is_template`;

-- 添加索引
CREATE INDEX `idx_project_tenant_id` ON `project` (`tenant_id`);
CREATE INDEX `idx_project_template_id` ON `project` (`template_id`);
CREATE INDEX `idx_project_is_template` ON `project` (`is_template`);
CREATE INDEX `idx_project_project_type` ON `project` (`project_type`);

-- 2. 创建项目模板使用记录表
CREATE TABLE IF NOT EXISTS `project_template_usage` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `template_id` BIGINT NOT NULL COMMENT '模板ID',
    `project_id` BIGINT NOT NULL COMMENT '创建的项目ID',
    `tenant_id` BIGINT NULL COMMENT '租户ID',
    `user_id` BIGINT NOT NULL COMMENT '使用者ID',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    INDEX `idx_template_usage_template_id` (`template_id`),
    INDEX `idx_template_usage_tenant_id` (`tenant_id`),
    INDEX `idx_template_usage_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='项目模板使用记录表';

-- 3. 创建项目角色表（项目级别的角色定义）
CREATE TABLE IF NOT EXISTS `project_role` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `project_id` BIGINT NOT NULL COMMENT '项目ID',
    `tenant_id` BIGINT NULL COMMENT '租户ID',
    `name` VARCHAR(50) NOT NULL COMMENT '角色名称',
    `code` VARCHAR(50) NOT NULL COMMENT '角色编码',
    `description` VARCHAR(255) NULL COMMENT '角色描述',
    `permissions` JSON NULL COMMENT '权限列表（JSON数组）',
    `is_default` TINYINT(1) DEFAULT 0 COMMENT '是否为默认角色',
    `sort_order` INT DEFAULT 0 COMMENT '排序顺序',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `create_by` BIGINT NULL COMMENT '创建人ID',
    `update_by` BIGINT NULL COMMENT '更新人ID',
    `deleted` TINYINT(1) DEFAULT 0 COMMENT '是否删除',
    PRIMARY KEY (`id`),
    INDEX `idx_project_role_project_id` (`project_id`),
    INDEX `idx_project_role_tenant_id` (`tenant_id`),
    UNIQUE INDEX `uk_project_role_code` (`project_id`, `code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='项目角色表';

-- 4. 更新项目成员表，添加角色ID关联
ALTER TABLE `project_member`
ADD COLUMN `tenant_id` BIGINT NULL COMMENT '租户ID' AFTER `id`,
ADD COLUMN `role_id` BIGINT NULL COMMENT '项目角色ID' AFTER `role`;

CREATE INDEX `idx_project_member_tenant_id` ON `project_member` (`tenant_id`);
CREATE INDEX `idx_project_member_role_id` ON `project_member` (`role_id`);

-- 5. 创建项目配置表
CREATE TABLE IF NOT EXISTS `project_config` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `project_id` BIGINT NOT NULL COMMENT '项目ID',
    `tenant_id` BIGINT NULL COMMENT '租户ID',
    `config_key` VARCHAR(100) NOT NULL COMMENT '配置键',
    `config_value` TEXT NULL COMMENT '配置值',
    `config_type` VARCHAR(50) DEFAULT 'string' COMMENT '配置类型(string/number/boolean/json)',
    `description` VARCHAR(255) NULL COMMENT '配置描述',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    INDEX `idx_project_config_project_id` (`project_id`),
    INDEX `idx_project_config_tenant_id` (`tenant_id`),
    UNIQUE INDEX `uk_project_config_key` (`project_id`, `config_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='项目配置表';

-- 6. 创建项目访问记录表（用于最近访问功能）
CREATE TABLE IF NOT EXISTS `project_access_log` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `project_id` BIGINT NOT NULL COMMENT '项目ID',
    `tenant_id` BIGINT NULL COMMENT '租户ID',
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `access_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '访问时间',
    PRIMARY KEY (`id`),
    INDEX `idx_project_access_project_id` (`project_id`),
    INDEX `idx_project_access_user_id` (`user_id`),
    INDEX `idx_project_access_tenant_id` (`tenant_id`),
    INDEX `idx_project_access_time` (`access_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='项目访问记录表';

-- 7. 创建项目收藏表
CREATE TABLE IF NOT EXISTS `project_favorite` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `project_id` BIGINT NOT NULL COMMENT '项目ID',
    `tenant_id` BIGINT NULL COMMENT '租户ID',
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    INDEX `idx_project_favorite_project_id` (`project_id`),
    INDEX `idx_project_favorite_user_id` (`user_id`),
    INDEX `idx_project_favorite_tenant_id` (`tenant_id`),
    UNIQUE INDEX `uk_project_favorite` (`project_id`, `user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='项目收藏表';

-- 8. 更新里程碑表，添加租户ID
ALTER TABLE `milestone`
ADD COLUMN `tenant_id` BIGINT NULL COMMENT '租户ID' AFTER `id`;

CREATE INDEX `idx_milestone_tenant_id` ON `milestone` (`tenant_id`);

-- 9. 插入默认项目角色
INSERT INTO `project_role` (`project_id`, `name`, `code`, `description`, `permissions`, `is_default`, `sort_order`) VALUES
(0, '项目负责人', 'owner', '项目负责人，拥有项目的所有权限', '["project:*"]', 1, 1),
(0, '项目管理员', 'admin', '项目管理员，可以管理项目设置和成员', '["project:manage", "project:member:*", "task:*", "milestone:*"]', 1, 2),
(0, '开发人员', 'developer', '开发人员，可以创建和管理任务', '["task:create", "task:update", "task:view", "milestone:view"]', 1, 3),
(0, '测试人员', 'tester', '测试人员，可以查看和更新任务状态', '["task:view", "task:update:status", "milestone:view"]', 1, 4),
(0, '观察者', 'viewer', '观察者，只能查看项目信息', '["project:view", "task:view", "milestone:view"]', 1, 5);

-- 10. 插入系统项目模板
INSERT INTO `project` (`name`, `key`, `description`, `status`, `owner_id`, `project_type`, `is_template`, `visibility`, `settings`) VALUES
('敏捷开发模板', 'TPL-AGILE', '适用于敏捷开发团队的项目模板，包含Sprint管理、看板视图等功能', 'active', 1, 'agile', 1, 'public', '{"sprintDuration": 14, "defaultView": "kanban", "enableBurndown": true}'),
('瀑布开发模板', 'TPL-WATERFALL', '适用于传统瀑布开发流程的项目模板，包含阶段管理、甘特图等功能', 'active', 1, 'waterfall', 1, 'public', '{"phases": ["需求分析", "设计", "开发", "测试", "部署"], "defaultView": "gantt"}'),
('看板模板', 'TPL-KANBAN', '简单的看板项目模板，适用于持续交付的团队', 'active', 1, 'kanban', 1, 'public', '{"columns": ["待办", "进行中", "已完成"], "wipLimit": 5, "defaultView": "kanban"}'),
('产品研发模板', 'TPL-PRODUCT', '适用于产品研发团队的项目模板，包含需求管理、版本规划等功能', 'active', 1, 'standard', 1, 'public', '{"enableVersioning": true, "enableRequirements": true, "defaultView": "list"}'),
('运维项目模板', 'TPL-OPS', '适用于运维团队的项目模板，包含工单管理、值班安排等功能', 'active', 1, 'standard', 1, 'public', '{"enableTickets": true, "enableOnCall": true, "defaultView": "list"}');