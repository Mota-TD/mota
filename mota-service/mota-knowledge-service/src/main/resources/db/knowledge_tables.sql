-- =====================================================
-- 知识服务数据库表结构
-- =====================================================

-- 知识文件表（增强版）
CREATE TABLE IF NOT EXISTS `knowledge_file` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `tenant_id` BIGINT NOT NULL COMMENT '租户ID',
    `project_id` BIGINT COMMENT '项目ID',
    `parent_id` BIGINT COMMENT '父文件夹ID',
    `name` VARCHAR(255) NOT NULL COMMENT '文件名',
    `original_name` VARCHAR(255) COMMENT '原始文件名',
    `mime_type` VARCHAR(100) COMMENT 'MIME类型',
    `extension` VARCHAR(20) COMMENT '文件扩展名',
    `file_size` BIGINT DEFAULT 0 COMMENT '文件大小（字节）',
    `storage_path` VARCHAR(500) COMMENT '存储路径',
    `bucket_name` VARCHAR(100) COMMENT 'MinIO桶名',
    `content` LONGTEXT COMMENT '文件内容（文本类型）',
    `plain_text` LONGTEXT COMMENT '纯文本内容（用于搜索）',
    `summary` TEXT COMMENT '内容摘要',
    `thumbnail_path` VARCHAR(500) COMMENT '缩略图路径',
    `version` INT DEFAULT 1 COMMENT '版本号',
    `category_id` BIGINT COMMENT '分类ID',
    `status` VARCHAR(20) DEFAULT 'draft' COMMENT '状态：draft/published/archived',
    `permission_level` VARCHAR(20) DEFAULT 'private' COMMENT '权限级别：private/team/public',
    `is_indexed` TINYINT(1) DEFAULT 0 COMMENT '是否已索引（ES）',
    `is_vectorized` TINYINT(1) DEFAULT 0 COMMENT '是否已向量化（Milvus）',
    `vector_id` VARCHAR(100) COMMENT '向量ID',
    `md5_hash` VARCHAR(32) COMMENT '文件MD5哈希',
    `view_count` INT DEFAULT 0 COMMENT '浏览次数',
    `download_count` INT DEFAULT 0 COMMENT '下载次数',
    `favorite_count` INT DEFAULT 0 COMMENT '收藏次数',
    `created_by` BIGINT COMMENT '创建人ID',
    `updated_by` BIGINT COMMENT '更新人ID',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted` TINYINT(1) DEFAULT 0 COMMENT '是否删除',
    PRIMARY KEY (`id`),
    INDEX `idx_tenant_project` (`tenant_id`, `project_id`),
    INDEX `idx_parent` (`parent_id`),
    INDEX `idx_category` (`category_id`),
    INDEX `idx_status` (`status`),
    INDEX `idx_md5` (`md5_hash`),
    INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='知识文件表';

-- 文件版本表
CREATE TABLE IF NOT EXISTS `file_version` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `tenant_id` BIGINT NOT NULL COMMENT '租户ID',
    `file_id` BIGINT NOT NULL COMMENT '文件ID',
    `version_number` INT NOT NULL COMMENT '版本号',
    `file_name` VARCHAR(255) COMMENT '文件名',
    `file_size` BIGINT COMMENT '文件大小',
    `storage_path` VARCHAR(500) COMMENT '存储路径',
    `md5_hash` VARCHAR(32) COMMENT 'MD5哈希',
    `change_description` TEXT COMMENT '变更描述',
    `created_by` BIGINT COMMENT '创建人ID',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    INDEX `idx_file_version` (`file_id`, `version_number`),
    INDEX `idx_tenant` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文件版本表';

-- 知识实体表（知识图谱节点）
CREATE TABLE IF NOT EXISTS `knowledge_entity` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `tenant_id` BIGINT NOT NULL COMMENT '租户ID',
    `name` VARCHAR(255) NOT NULL COMMENT '实体名称',
    `entity_type` VARCHAR(50) NOT NULL COMMENT '实体类型：person/organization/concept/technology/product/event/location',
    `description` TEXT COMMENT '实体描述',
    `properties` JSON COMMENT '实体属性（JSON格式）',
    `aliases` VARCHAR(500) COMMENT '别名（逗号分隔）',
    `source_file_id` BIGINT COMMENT '来源文件ID',
    `reference_count` INT DEFAULT 0 COMMENT '引用次数',
    `is_verified` TINYINT(1) DEFAULT 0 COMMENT '是否已验证',
    `verified_by` BIGINT COMMENT '验证人ID',
    `verified_at` DATETIME COMMENT '验证时间',
    `created_by` BIGINT COMMENT '创建人ID',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted` TINYINT(1) DEFAULT 0 COMMENT '是否删除',
    PRIMARY KEY (`id`),
    INDEX `idx_tenant_type` (`tenant_id`, `entity_type`),
    INDEX `idx_name` (`name`),
    INDEX `idx_source_file` (`source_file_id`),
    INDEX `idx_reference_count` (`reference_count` DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='知识实体表';

-- 知识关系表（知识图谱边）
CREATE TABLE IF NOT EXISTS `knowledge_relation` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `tenant_id` BIGINT NOT NULL COMMENT '租户ID',
    `source_entity_id` BIGINT NOT NULL COMMENT '源实体ID',
    `target_entity_id` BIGINT NOT NULL COMMENT '目标实体ID',
    `relation_type` VARCHAR(50) NOT NULL COMMENT '关系类型：belongs_to/related_to/depends_on/created_by/part_of/uses/implements',
    `relation_name` VARCHAR(100) COMMENT '关系名称',
    `description` TEXT COMMENT '关系描述',
    `properties` JSON COMMENT '关系属性（JSON格式）',
    `weight` DECIMAL(5,4) DEFAULT 1.0000 COMMENT '关系权重',
    `is_bidirectional` TINYINT(1) DEFAULT 0 COMMENT '是否双向关系',
    `source_file_id` BIGINT COMMENT '来源文件ID',
    `is_verified` TINYINT(1) DEFAULT 0 COMMENT '是否已验证',
    `verified_by` BIGINT COMMENT '验证人ID',
    `verified_at` DATETIME COMMENT '验证时间',
    `created_by` BIGINT COMMENT '创建人ID',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted` TINYINT(1) DEFAULT 0 COMMENT '是否删除',
    PRIMARY KEY (`id`),
    INDEX `idx_tenant` (`tenant_id`),
    INDEX `idx_source_entity` (`source_entity_id`),
    INDEX `idx_target_entity` (`target_entity_id`),
    INDEX `idx_relation_type` (`relation_type`),
    INDEX `idx_source_file` (`source_file_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='知识关系表';

-- 文件访问日志表
CREATE TABLE IF NOT EXISTS `file_access_log` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `tenant_id` BIGINT NOT NULL COMMENT '租户ID',
    `file_id` BIGINT NOT NULL COMMENT '文件ID',
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `access_type` VARCHAR(20) NOT NULL COMMENT '访问类型：view/download/edit/share',
    `access_ip` VARCHAR(50) COMMENT '访问IP',
    `user_agent` VARCHAR(500) COMMENT '用户代理',
    `duration` INT COMMENT '访问时长（秒）',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '访问时间',
    PRIMARY KEY (`id`),
    INDEX `idx_tenant_file` (`tenant_id`, `file_id`),
    INDEX `idx_user` (`user_id`),
    INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文件访问日志表';

-- 分片上传表
CREATE TABLE IF NOT EXISTS `chunk_upload` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `tenant_id` BIGINT NOT NULL COMMENT '租户ID',
    `upload_id` VARCHAR(64) NOT NULL COMMENT '上传ID',
    `file_name` VARCHAR(255) NOT NULL COMMENT '文件名',
    `file_size` BIGINT NOT NULL COMMENT '文件大小',
    `chunk_size` BIGINT NOT NULL COMMENT '分片大小',
    `total_chunks` INT NOT NULL COMMENT '总分片数',
    `uploaded_chunks` INT DEFAULT 0 COMMENT '已上传分片数',
    `md5_hash` VARCHAR(32) COMMENT '文件MD5',
    `status` VARCHAR(20) DEFAULT 'uploading' COMMENT '状态：uploading/completed/cancelled/expired',
    `file_id` BIGINT COMMENT '合并后的文件ID',
    `created_by` BIGINT COMMENT '创建人ID',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `expire_at` DATETIME COMMENT '过期时间',
    PRIMARY KEY (`id`),
    UNIQUE INDEX `idx_upload_id` (`upload_id`),
    INDEX `idx_tenant` (`tenant_id`),
    INDEX `idx_md5` (`md5_hash`),
    INDEX `idx_status` (`status`),
    INDEX `idx_expire_at` (`expire_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='分片上传表';

-- 文件分类表
CREATE TABLE IF NOT EXISTS `file_category` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `tenant_id` BIGINT NOT NULL COMMENT '租户ID',
    `name` VARCHAR(100) NOT NULL COMMENT '分类名称',
    `parent_id` BIGINT COMMENT '父分类ID',
    `icon` VARCHAR(50) COMMENT '图标',
    `sort_order` INT DEFAULT 0 COMMENT '排序',
    `description` VARCHAR(500) COMMENT '描述',
    `created_by` BIGINT COMMENT '创建人ID',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted` TINYINT(1) DEFAULT 0 COMMENT '是否删除',
    PRIMARY KEY (`id`),
    INDEX `idx_tenant_parent` (`tenant_id`, `parent_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文件分类表';

-- 文件标签表
CREATE TABLE IF NOT EXISTS `file_tag` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `tenant_id` BIGINT NOT NULL COMMENT '租户ID',
    `name` VARCHAR(50) NOT NULL COMMENT '标签名称',
    `color` VARCHAR(20) COMMENT '标签颜色',
    `usage_count` INT DEFAULT 0 COMMENT '使用次数',
    `created_by` BIGINT COMMENT '创建人ID',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    UNIQUE INDEX `idx_tenant_name` (`tenant_id`, `name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文件标签表';

-- 文件标签关联表
CREATE TABLE IF NOT EXISTS `file_tag_relation` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `file_id` BIGINT NOT NULL COMMENT '文件ID',
    `tag_id` BIGINT NOT NULL COMMENT '标签ID',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    UNIQUE INDEX `idx_file_tag` (`file_id`, `tag_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文件标签关联表';

-- 文件收藏表
CREATE TABLE IF NOT EXISTS `file_favorite` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `tenant_id` BIGINT NOT NULL COMMENT '租户ID',
    `file_id` BIGINT NOT NULL COMMENT '文件ID',
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '收藏时间',
    PRIMARY KEY (`id`),
    UNIQUE INDEX `idx_user_file` (`user_id`, `file_id`),
    INDEX `idx_tenant` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文件收藏表';

-- 文件分享表
CREATE TABLE IF NOT EXISTS `file_share` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `tenant_id` BIGINT NOT NULL COMMENT '租户ID',
    `file_id` BIGINT NOT NULL COMMENT '文件ID',
    `share_code` VARCHAR(32) NOT NULL COMMENT '分享码',
    `share_password` VARCHAR(20) COMMENT '分享密码',
    `expire_at` DATETIME COMMENT '过期时间',
    `max_downloads` INT COMMENT '最大下载次数',
    `download_count` INT DEFAULT 0 COMMENT '已下载次数',
    `view_count` INT DEFAULT 0 COMMENT '浏览次数',
    `is_active` TINYINT(1) DEFAULT 1 COMMENT '是否有效',
    `created_by` BIGINT COMMENT '创建人ID',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    UNIQUE INDEX `idx_share_code` (`share_code`),
    INDEX `idx_tenant_file` (`tenant_id`, `file_id`),
    INDEX `idx_expire_at` (`expire_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文件分享表';

-- 知识模板表
CREATE TABLE IF NOT EXISTS `knowledge_template` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `tenant_id` BIGINT NOT NULL COMMENT '租户ID',
    `name` VARCHAR(100) NOT NULL COMMENT '模板名称',
    `description` TEXT COMMENT '模板描述',
    `category` VARCHAR(50) COMMENT '模板分类',
    `content` LONGTEXT COMMENT '模板内容',
    `variables` JSON COMMENT '模板变量',
    `thumbnail` VARCHAR(500) COMMENT '缩略图',
    `usage_count` INT DEFAULT 0 COMMENT '使用次数',
    `is_public` TINYINT(1) DEFAULT 0 COMMENT '是否公开',
    `created_by` BIGINT COMMENT '创建人ID',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted` TINYINT(1) DEFAULT 0 COMMENT '是否删除',
    PRIMARY KEY (`id`),
    INDEX `idx_tenant_category` (`tenant_id`, `category`),
    INDEX `idx_is_public` (`is_public`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='知识模板表';