-- =====================================================
-- 知识库服务数据库表初始化脚本
-- 包含多租户支持 (tenant_id)
-- =====================================================
USE mota_knowledge;

-- 知识文件表
CREATE TABLE IF NOT EXISTS knowledge_file (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '文件ID',
    tenant_id BIGINT NOT NULL DEFAULT 0 COMMENT '租户ID',
    enterprise_id BIGINT NOT NULL COMMENT '企业ID',
    project_id BIGINT COMMENT '项目ID',
    parent_id BIGINT DEFAULT 0 COMMENT '父级ID',
    name VARCHAR(255) NOT NULL COMMENT '文件名',
    original_name VARCHAR(255) COMMENT '原始文件名',
    type VARCHAR(20) NOT NULL COMMENT '类型',
    file_type VARCHAR(50) COMMENT '文件类型',
    size BIGINT DEFAULT 0 COMMENT '文件大小',
    file_size BIGINT DEFAULT 0 COMMENT '文件大小',
    file_path VARCHAR(500) COMMENT '文件路径',
    path VARCHAR(500) COMMENT '文件存储路径',
    thumbnail_path VARCHAR(500) COMMENT '缩略图路径',
    mime_type VARCHAR(100) COMMENT 'MIME类型',
    extension VARCHAR(20) COMMENT '文件扩展名',
    content LONGTEXT COMMENT '文件内容',
    folder_id BIGINT COMMENT '所属文件夹ID',
    uploader_id BIGINT COMMENT '上传者ID',
    version INT DEFAULT 1 COMMENT '版本号',
    status VARCHAR(30) DEFAULT 'completed' COMMENT '状态',
    upload_progress INT DEFAULT 100 COMMENT '上传进度',
    category VARCHAR(50) COMMENT '分类',
    ai_suggested_category VARCHAR(50) COMMENT 'AI建议的分类',
    ai_confidence DECIMAL(5,4) COMMENT 'AI分类置信度',
    created_by BIGINT COMMENT '创建人',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted TINYINT DEFAULT 0 COMMENT '是否删除',
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_enterprise_id (enterprise_id),
    INDEX idx_project_id (project_id),
    INDEX idx_parent_id (parent_id),
    INDEX idx_folder_id (folder_id),
    INDEX idx_uploader_id (uploader_id),
    INDEX idx_created_by (created_by),
    INDEX idx_status (status),
    INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='知识文件表';

-- 文件分类表
CREATE TABLE IF NOT EXISTS file_category (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '分类ID',
    tenant_id BIGINT NOT NULL DEFAULT 0 COMMENT '租户ID',
    enterprise_id BIGINT NOT NULL COMMENT '企业ID',
    name VARCHAR(100) NOT NULL COMMENT '分类名称',
    code VARCHAR(50) COMMENT '分类编码',
    parent_id BIGINT DEFAULT 0 COMMENT '父级ID',
    description VARCHAR(500) COMMENT '分类描述',
    icon VARCHAR(100) COMMENT '图标',
    color VARCHAR(20) COMMENT '颜色',
    file_count INT DEFAULT 0 COMMENT '文件数量',
    sort INT DEFAULT 0 COMMENT '排序',
    sort_order INT DEFAULT 0 COMMENT '排序',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted TINYINT DEFAULT 0 COMMENT '是否删除',
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_enterprise_id (enterprise_id),
    INDEX idx_parent_id (parent_id),
    INDEX idx_sort_order (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文件分类表';

-- 文件标签表
CREATE TABLE IF NOT EXISTS file_tag (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '标签ID',
    tenant_id BIGINT NOT NULL DEFAULT 0 COMMENT '租户ID',
    enterprise_id BIGINT NOT NULL COMMENT '企业ID',
    name VARCHAR(50) NOT NULL COMMENT '标签名称',
    color VARCHAR(20) COMMENT '标签颜色',
    file_count INT DEFAULT 0 COMMENT '文件数量',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_enterprise_id (enterprise_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文件标签表';

-- 文件标签关联表
CREATE TABLE IF NOT EXISTS file_tag_relation (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '关联ID',
    tenant_id BIGINT NOT NULL DEFAULT 0 COMMENT '租户ID',
    file_id BIGINT NOT NULL COMMENT '文件ID',
    tag_id BIGINT NOT NULL COMMENT '标签ID',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_tenant_id (tenant_id),
    UNIQUE KEY uk_file_tag (file_id, tag_id),
    INDEX idx_file_id (file_id),
    INDEX idx_tag_id (tag_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文件标签关联表';

-- 模板表
CREATE TABLE IF NOT EXISTS template (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '模板ID',
    tenant_id BIGINT NOT NULL DEFAULT 0 COMMENT '租户ID',
    enterprise_id BIGINT NOT NULL COMMENT '企业ID',
    name VARCHAR(200) NOT NULL COMMENT '模板名称',
    description TEXT COMMENT '模板描述',
    category VARCHAR(50) COMMENT '模板分类',
    type VARCHAR(50) NOT NULL COMMENT '模板类型',
    content LONGTEXT COMMENT '模板内容',
    thumbnail VARCHAR(500) COMMENT '缩略图URL',
    is_public TINYINT DEFAULT 0 COMMENT '是否公开',
    usage_count INT DEFAULT 0 COMMENT '使用次数',
    status VARCHAR(20) DEFAULT 'active' COMMENT '状态',
    created_by BIGINT COMMENT '创建人ID',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted TINYINT DEFAULT 0 COMMENT '是否删除',
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_enterprise_id (enterprise_id),
    INDEX idx_category (category),
    INDEX idx_type (type),
    INDEX idx_is_public (is_public)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='模板表';

-- 文件版本表
CREATE TABLE IF NOT EXISTS file_version (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '版本ID',
    tenant_id BIGINT NOT NULL DEFAULT 0 COMMENT '租户ID',
    file_id BIGINT NOT NULL COMMENT '文件ID',
    version_number INT NOT NULL COMMENT '版本号',
    file_path VARCHAR(500) NOT NULL COMMENT '文件路径',
    file_size BIGINT DEFAULT 0 COMMENT '文件大小',
    change_summary VARCHAR(500) COMMENT '变更说明',
    created_by BIGINT COMMENT '创建人ID',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_file_id (file_id),
    UNIQUE KEY uk_file_version (file_id, version_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文件版本表';

SELECT '知识库服务数据库表初始化完成!' AS message;