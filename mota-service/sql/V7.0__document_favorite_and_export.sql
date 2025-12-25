-- =====================================================
-- V7.0 文档收藏夹和导出功能
-- 包含：文档收藏、最近访问记录
-- =====================================================

-- 1. 文档收藏表
CREATE TABLE IF NOT EXISTS document_favorite (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL COMMENT '用户ID',
    document_id BIGINT NOT NULL COMMENT '文档ID',
    
    -- 收藏信息
    folder_name VARCHAR(100) COMMENT '收藏夹分类名称',
    note VARCHAR(500) COMMENT '收藏备注',
    
    -- 时间戳
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '收藏时间',
    
    INDEX idx_user_id (user_id),
    INDEX idx_document_id (document_id),
    INDEX idx_folder_name (user_id, folder_name),
    UNIQUE KEY uk_user_document (user_id, document_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='文档收藏表';

-- 2. 文档访问记录表（用于最近访问功能）
CREATE TABLE IF NOT EXISTS document_access_log (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL COMMENT '用户ID',
    document_id BIGINT NOT NULL COMMENT '文档ID',
    
    -- 访问信息
    access_type VARCHAR(20) DEFAULT 'view' COMMENT '访问类型: view, edit',
    access_count INT DEFAULT 1 COMMENT '访问次数',
    
    -- 时间戳
    first_access_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '首次访问时间',
    last_access_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最后访问时间',
    
    INDEX idx_user_id (user_id),
    INDEX idx_document_id (document_id),
    INDEX idx_last_access (user_id, last_access_at DESC),
    UNIQUE KEY uk_user_document (user_id, document_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='文档访问记录表';

-- 3. 文档标签表（增强标签功能）
CREATE TABLE IF NOT EXISTS document_tag (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL COMMENT '标签名称',
    color VARCHAR(20) DEFAULT '#1890ff' COMMENT '标签颜色',
    
    -- 关联信息
    project_id BIGINT COMMENT '所属项目ID（项目级标签）',
    creator_id BIGINT NOT NULL COMMENT '创建者ID',
    
    -- 使用统计
    use_count INT DEFAULT 0 COMMENT '使用次数',
    
    -- 时间戳
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_project_id (project_id),
    INDEX idx_creator_id (creator_id),
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='文档标签表';

-- 4. 文档-标签关联表
CREATE TABLE IF NOT EXISTS document_tag_relation (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    document_id BIGINT NOT NULL COMMENT '文档ID',
    tag_id BIGINT NOT NULL COMMENT '标签ID',
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_document_id (document_id),
    INDEX idx_tag_id (tag_id),
    UNIQUE KEY uk_document_tag (document_id, tag_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='文档标签关联表';

-- 插入一些默认标签
INSERT INTO document_tag (name, color, creator_id) VALUES
('重要', '#f5222d', 1),
('待审核', '#fa8c16', 1),
('已完成', '#52c41a', 1),
('进行中', '#1890ff', 1),
('参考资料', '#722ed1', 1),
('技术文档', '#13c2c2', 1);