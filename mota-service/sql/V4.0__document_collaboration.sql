-- =====================================================
-- V4.0 文档协作功能数据库设计
-- 包含：文档管理、版本控制、协作编辑、模板库
-- =====================================================

-- 1. 文档表
CREATE TABLE IF NOT EXISTS document (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL COMMENT '文档标题',
    content LONGTEXT COMMENT '文档内容（Markdown/HTML）',
    content_type VARCHAR(20) DEFAULT 'markdown' COMMENT '内容类型: markdown, richtext, html',
    summary VARCHAR(500) COMMENT '文档摘要',
    cover_image VARCHAR(500) COMMENT '封面图片URL',
    
    -- 关联信息
    project_id BIGINT COMMENT '所属项目ID',
    folder_id BIGINT COMMENT '所属文件夹ID',
    creator_id BIGINT NOT NULL COMMENT '创建者ID',
    
    -- 文档状态
    status VARCHAR(20) DEFAULT 'draft' COMMENT '状态: draft, published, archived',
    is_template TINYINT(1) DEFAULT 0 COMMENT '是否为模板',
    template_category VARCHAR(50) COMMENT '模板分类',
    
    -- 权限设置
    visibility VARCHAR(20) DEFAULT 'project' COMMENT '可见性: private, project, public',
    allow_comments TINYINT(1) DEFAULT 1 COMMENT '是否允许评论',
    allow_edit TINYINT(1) DEFAULT 1 COMMENT '是否允许编辑',
    
    -- 统计信息
    view_count INT DEFAULT 0 COMMENT '浏览次数',
    like_count INT DEFAULT 0 COMMENT '点赞次数',
    comment_count INT DEFAULT 0 COMMENT '评论数量',
    
    -- 版本信息
    current_version INT DEFAULT 1 COMMENT '当前版本号',
    
    -- 时间戳
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    published_at DATETIME COMMENT '发布时间',
    
    INDEX idx_project_id (project_id),
    INDEX idx_folder_id (folder_id),
    INDEX idx_creator_id (creator_id),
    INDEX idx_status (status),
    INDEX idx_is_template (is_template),
    INDEX idx_template_category (template_category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='文档表';

-- 2. 文档文件夹表
CREATE TABLE IF NOT EXISTS document_folder (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL COMMENT '文件夹名称',
    parent_id BIGINT COMMENT '父文件夹ID',
    project_id BIGINT COMMENT '所属项目ID',
    creator_id BIGINT NOT NULL COMMENT '创建者ID',
    sort_order INT DEFAULT 0 COMMENT '排序顺序',
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_parent_id (parent_id),
    INDEX idx_project_id (project_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='文档文件夹表';

-- 3. 文档版本表
CREATE TABLE IF NOT EXISTS document_version (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    document_id BIGINT NOT NULL COMMENT '文档ID',
    version_number INT NOT NULL COMMENT '版本号',
    title VARCHAR(255) NOT NULL COMMENT '版本标题',
    content LONGTEXT COMMENT '版本内容',
    change_summary VARCHAR(500) COMMENT '变更摘要',
    
    -- 编辑者信息
    editor_id BIGINT NOT NULL COMMENT '编辑者ID',
    editor_name VARCHAR(100) COMMENT '编辑者名称',
    
    -- 版本类型
    version_type VARCHAR(20) DEFAULT 'minor' COMMENT '版本类型: major, minor, patch, auto',
    
    -- 内容差异
    diff_content LONGTEXT COMMENT '与上一版本的差异（JSON格式）',
    content_hash VARCHAR(64) COMMENT '内容哈希值',
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_document_id (document_id),
    INDEX idx_version_number (document_id, version_number),
    INDEX idx_editor_id (editor_id),
    UNIQUE KEY uk_document_version (document_id, version_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='文档版本表';

-- 4. 文档协作者表
CREATE TABLE IF NOT EXISTS document_collaborator (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    document_id BIGINT NOT NULL COMMENT '文档ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    permission VARCHAR(20) DEFAULT 'view' COMMENT '权限: view, comment, edit, admin',
    
    -- 协作状态
    is_online TINYINT(1) DEFAULT 0 COMMENT '是否在线编辑',
    last_active_at DATETIME COMMENT '最后活跃时间',
    cursor_position INT COMMENT '光标位置',
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_document_id (document_id),
    INDEX idx_user_id (user_id),
    UNIQUE KEY uk_document_user (document_id, user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='文档协作者表';

-- 5. 文档评论表
CREATE TABLE IF NOT EXISTS document_comment (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    document_id BIGINT NOT NULL COMMENT '文档ID',
    parent_id BIGINT COMMENT '父评论ID（用于回复）',
    user_id BIGINT NOT NULL COMMENT '评论者ID',
    user_name VARCHAR(100) COMMENT '评论者名称',
    user_avatar VARCHAR(500) COMMENT '评论者头像',
    
    content TEXT NOT NULL COMMENT '评论内容',
    
    -- 批注位置（用于行内批注）
    selection_start INT COMMENT '选中开始位置',
    selection_end INT COMMENT '选中结束位置',
    selected_text TEXT COMMENT '选中的文本',
    
    -- 状态
    status VARCHAR(20) DEFAULT 'active' COMMENT '状态: active, resolved, deleted',
    is_resolved TINYINT(1) DEFAULT 0 COMMENT '是否已解决',
    resolved_by BIGINT COMMENT '解决者ID',
    resolved_at DATETIME COMMENT '解决时间',
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_document_id (document_id),
    INDEX idx_parent_id (parent_id),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='文档评论表';

-- 6. 文档操作日志表
CREATE TABLE IF NOT EXISTS document_activity (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    document_id BIGINT NOT NULL COMMENT '文档ID',
    user_id BIGINT NOT NULL COMMENT '操作者ID',
    user_name VARCHAR(100) COMMENT '操作者名称',
    
    action VARCHAR(50) NOT NULL COMMENT '操作类型: create, edit, view, comment, share, delete, restore, publish',
    action_detail TEXT COMMENT '操作详情（JSON格式）',
    
    -- 版本信息
    version_number INT COMMENT '相关版本号',
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_document_id (document_id),
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='文档操作日志表';

-- 7. 文档模板分类表
CREATE TABLE IF NOT EXISTS document_template_category (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL COMMENT '分类名称',
    description VARCHAR(500) COMMENT '分类描述',
    icon VARCHAR(100) COMMENT '分类图标',
    sort_order INT DEFAULT 0 COMMENT '排序顺序',
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='文档模板分类表';

-- 8. 任务模板表
CREATE TABLE IF NOT EXISTS task_template (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL COMMENT '模板名称',
    description VARCHAR(500) COMMENT '模板描述',
    category VARCHAR(50) COMMENT '模板分类',
    
    -- 模板内容（JSON格式）
    template_data TEXT NOT NULL COMMENT '模板数据（包含任务结构、子任务、检查清单等）',
    
    -- 使用统计
    use_count INT DEFAULT 0 COMMENT '使用次数',
    
    -- 权限
    is_public TINYINT(1) DEFAULT 0 COMMENT '是否公开',
    creator_id BIGINT NOT NULL COMMENT '创建者ID',
    project_id BIGINT COMMENT '所属项目ID（项目级模板）',
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_category (category),
    INDEX idx_creator_id (creator_id),
    INDEX idx_project_id (project_id),
    INDEX idx_is_public (is_public)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='任务模板表';

-- 9. 知识图谱节点表
CREATE TABLE IF NOT EXISTS knowledge_node (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(200) NOT NULL COMMENT '节点名称',
    node_type VARCHAR(50) NOT NULL COMMENT '节点类型: concept, entity, document, task, project',
    description TEXT COMMENT '节点描述',
    
    -- 关联信息
    related_id BIGINT COMMENT '关联对象ID',
    related_type VARCHAR(50) COMMENT '关联对象类型',
    
    -- 属性（JSON格式）
    properties TEXT COMMENT '节点属性',
    
    -- 向量嵌入（用于语义搜索）
    embedding_vector TEXT COMMENT '向量嵌入（JSON数组）',
    
    -- 统计
    reference_count INT DEFAULT 0 COMMENT '引用次数',
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_node_type (node_type),
    INDEX idx_related (related_id, related_type),
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='知识图谱节点表';

-- 10. 知识图谱边表（关系）
CREATE TABLE IF NOT EXISTS knowledge_edge (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    source_node_id BIGINT NOT NULL COMMENT '源节点ID',
    target_node_id BIGINT NOT NULL COMMENT '目标节点ID',
    relation_type VARCHAR(50) NOT NULL COMMENT '关系类型: related_to, belongs_to, depends_on, references, similar_to',
    
    -- 关系属性
    weight DECIMAL(5,4) DEFAULT 1.0 COMMENT '关系权重',
    properties TEXT COMMENT '关系属性（JSON格式）',
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_source_node (source_node_id),
    INDEX idx_target_node (target_node_id),
    INDEX idx_relation_type (relation_type),
    UNIQUE KEY uk_edge (source_node_id, target_node_id, relation_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='知识图谱边表';

-- 插入默认模板分类
INSERT INTO document_template_category (name, description, icon, sort_order) VALUES
('项目方案', '项目规划和方案模板', 'ProjectOutlined', 1),
('技术文档', '技术设计和开发文档模板', 'CodeOutlined', 2),
('会议纪要', '会议记录和纪要模板', 'TeamOutlined', 3),
('工作报告', '周报、月报等工作报告模板', 'FileTextOutlined', 4),
('需求文档', '产品需求和功能规格模板', 'BulbOutlined', 5),
('测试文档', '测试计划和测试报告模板', 'BugOutlined', 6);