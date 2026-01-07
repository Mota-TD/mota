-- AI训练文档表
CREATE TABLE IF NOT EXISTS `ai_training_document` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `enterprise_id` BIGINT DEFAULT NULL COMMENT '企业ID',
    `name` VARCHAR(255) NOT NULL COMMENT '文档名称',
    `file_size` BIGINT DEFAULT 0 COMMENT '文件大小（字节）',
    `size` VARCHAR(50) DEFAULT NULL COMMENT '文件大小（格式化显示）',
    `file_path` VARCHAR(500) DEFAULT NULL COMMENT '文件路径',
    `file_type` VARCHAR(50) DEFAULT NULL COMMENT '文件类型',
    `status` VARCHAR(20) DEFAULT 'pending' COMMENT '状态：pending-待处理, indexed-已索引, failed-失败',
    `upload_user_id` BIGINT DEFAULT NULL COMMENT '上传用户ID',
    `upload_time` DATETIME DEFAULT NULL COMMENT '上传时间',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_enterprise_id` (`enterprise_id`),
    KEY `idx_status` (`status`),
    KEY `idx_upload_time` (`upload_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI训练文档表';

-- AI训练历史表
CREATE TABLE IF NOT EXISTS `ai_training_history` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `enterprise_id` BIGINT DEFAULT NULL COMMENT '企业ID',
    `version` VARCHAR(50) DEFAULT NULL COMMENT '模型版本',
    `date` DATETIME DEFAULT NULL COMMENT '训练日期',
    `documents` INT DEFAULT 0 COMMENT '训练文档数量',
    `status` VARCHAR(20) DEFAULT 'training' COMMENT '状态：training-训练中, completed-已完成, failed-失败',
    `accuracy` DECIMAL(5,4) DEFAULT NULL COMMENT '准确率',
    `task_id` VARCHAR(100) DEFAULT NULL COMMENT '任务ID',
    `progress` INT DEFAULT 0 COMMENT '训练进度（0-100）',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_enterprise_id` (`enterprise_id`),
    KEY `idx_task_id` (`task_id`),
    KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI训练历史表';

-- AI训练配置表
CREATE TABLE IF NOT EXISTS `ai_training_config` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `enterprise_id` BIGINT DEFAULT NULL COMMENT '企业ID',
    `config_type` VARCHAR(50) NOT NULL COMMENT '配置类型：training-训练设置, business-业务配置',
    `config_key` VARCHAR(100) NOT NULL COMMENT '配置键',
    `config_value` TEXT DEFAULT NULL COMMENT '配置值',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_enterprise_type_key` (`enterprise_id`, `config_type`, `config_key`),
    KEY `idx_enterprise_id` (`enterprise_id`),
    KEY `idx_config_type` (`config_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI训练配置表';