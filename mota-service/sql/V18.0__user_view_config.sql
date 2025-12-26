-- 用户视图配置表
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户视图配置表';