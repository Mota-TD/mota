-- =====================================================
-- AI方案生成模块数据库脚本
-- 版本: V11.0
-- 功能: AG-001到AG-010 AI方案生成完整功能
-- =====================================================

-- 1. 方案会话表 (AG-001 意图识别, AG-009 多轮优化)
CREATE TABLE IF NOT EXISTS ai_proposal_session (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    session_id VARCHAR(64) NOT NULL COMMENT '会话ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    team_id BIGINT COMMENT '团队ID',
    proposal_type VARCHAR(50) NOT NULL COMMENT '方案类型(project/technical/marketing/business/report)',
    title VARCHAR(200) COMMENT '方案标题',
    status VARCHAR(20) DEFAULT 'active' COMMENT '状态(active/completed/cancelled)',
    intent_analysis JSON COMMENT '意图分析结果',
    requirement_summary TEXT COMMENT '需求摘要',
    context JSON COMMENT '上下文信息',
    message_count INT DEFAULT 0 COMMENT '消息数量',
    total_tokens INT DEFAULT 0 COMMENT '总Token数',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    completed_at DATETIME COMMENT '完成时间',
    UNIQUE INDEX uk_session_id (session_id),
    INDEX idx_user_id (user_id),
    INDEX idx_team_id (team_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='方案会话表';

-- 2. 会话消息表 (AG-009 多轮优化)
CREATE TABLE IF NOT EXISTS ai_proposal_message (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    session_id VARCHAR(64) NOT NULL COMMENT '会话ID',
    role VARCHAR(20) NOT NULL COMMENT '角色(system/user/assistant)',
    content TEXT NOT NULL COMMENT '消息内容',
    intent VARCHAR(50) COMMENT '意图类型',
    entities JSON COMMENT '提取的实体',
    tokens INT DEFAULT 0 COMMENT 'Token数',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_session_id (session_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='会话消息表';

-- 3. 需求解析表 (AG-002 需求解析)
CREATE TABLE IF NOT EXISTS ai_requirement_analysis (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    session_id VARCHAR(64) NOT NULL COMMENT '会话ID',
    original_text TEXT NOT NULL COMMENT '原始需求文本',
    parsed_intent VARCHAR(100) COMMENT '解析的意图',
    key_elements JSON COMMENT '关键要素',
    entities JSON COMMENT '识别的实体',
    constraints JSON COMMENT '约束条件',
    goals JSON COMMENT '目标列表',
    stakeholders JSON COMMENT '利益相关者',
    timeline JSON COMMENT '时间线要求',
    budget JSON COMMENT '预算要求',
    confidence DECIMAL(5,2) COMMENT '解析置信度',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_session_id (session_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='需求解析表';

-- 4. 知识检索记录表 (AG-003 知识检索)
CREATE TABLE IF NOT EXISTS ai_knowledge_retrieval (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    session_id VARCHAR(64) NOT NULL COMMENT '会话ID',
    query_text TEXT NOT NULL COMMENT '检索查询',
    knowledge_base_ids JSON COMMENT '检索的知识库ID',
    retrieved_docs JSON COMMENT '检索到的文档',
    doc_count INT DEFAULT 0 COMMENT '文档数量',
    relevance_scores JSON COMMENT '相关性分数',
    used_in_proposal TINYINT(1) DEFAULT 0 COMMENT '是否用于方案',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_session_id (session_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='知识检索记录表';

-- 5. 历史方案参考表 (AG-004 历史参考)
CREATE TABLE IF NOT EXISTS ai_proposal_reference (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    session_id VARCHAR(64) NOT NULL COMMENT '会话ID',
    reference_proposal_id BIGINT NOT NULL COMMENT '参考方案ID',
    similarity_score DECIMAL(5,4) COMMENT '相似度分数',
    matched_sections JSON COMMENT '匹配的章节',
    used_sections JSON COMMENT '使用的章节',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_session_id (session_id),
    INDEX idx_reference_id (reference_proposal_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='历史方案参考表';

-- 6. 方案内容表 (AG-005 方案生成)
CREATE TABLE IF NOT EXISTS ai_proposal_content (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    session_id VARCHAR(64) NOT NULL COMMENT '会话ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    team_id BIGINT COMMENT '团队ID',
    proposal_type VARCHAR(50) NOT NULL COMMENT '方案类型',
    title VARCHAR(200) NOT NULL COMMENT '方案标题',
    content LONGTEXT COMMENT '方案内容(Markdown)',
    content_html LONGTEXT COMMENT '方案内容(HTML)',
    summary TEXT COMMENT '方案摘要',
    outline JSON COMMENT '方案大纲',
    sections JSON COMMENT '章节结构',
    keywords JSON COMMENT '关键词',
    word_count INT DEFAULT 0 COMMENT '字数',
    version INT DEFAULT 1 COMMENT '版本号',
    status VARCHAR(20) DEFAULT 'draft' COMMENT '状态(draft/reviewing/approved/archived)',
    quality_score DECIMAL(5,2) COMMENT '质量评分',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_session_id (session_id),
    INDEX idx_user_id (user_id),
    INDEX idx_team_id (team_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='方案内容表';

-- 7. 方案章节表 (AG-006 章节编排)
CREATE TABLE IF NOT EXISTS ai_proposal_section (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    proposal_id BIGINT NOT NULL COMMENT '方案ID',
    parent_id BIGINT DEFAULT 0 COMMENT '父章节ID',
    section_number VARCHAR(20) COMMENT '章节编号',
    title VARCHAR(200) NOT NULL COMMENT '章节标题',
    content TEXT COMMENT '章节内容',
    level INT DEFAULT 1 COMMENT '层级',
    sort_order INT DEFAULT 0 COMMENT '排序',
    word_count INT DEFAULT 0 COMMENT '字数',
    is_generated TINYINT(1) DEFAULT 1 COMMENT '是否AI生成',
    is_edited TINYINT(1) DEFAULT 0 COMMENT '是否已编辑',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_proposal_id (proposal_id),
    INDEX idx_parent_id (parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='方案章节表';

-- 8. 图表建议表 (AG-007 图表建议)
CREATE TABLE IF NOT EXISTS ai_chart_suggestion (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    proposal_id BIGINT NOT NULL COMMENT '方案ID',
    section_id BIGINT COMMENT '章节ID',
    chart_type VARCHAR(50) NOT NULL COMMENT '图表类型(bar/line/pie/table/flow/gantt)',
    title VARCHAR(200) COMMENT '图表标题',
    description TEXT COMMENT '图表描述',
    data_source TEXT COMMENT '数据来源说明',
    sample_data JSON COMMENT '示例数据',
    chart_config JSON COMMENT '图表配置',
    position VARCHAR(50) COMMENT '建议位置',
    is_applied TINYINT(1) DEFAULT 0 COMMENT '是否已应用',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_proposal_id (proposal_id),
    INDEX idx_section_id (section_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='图表建议表';

-- 9. 质量检查表 (AG-008 质量检查)
CREATE TABLE IF NOT EXISTS ai_quality_check (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    proposal_id BIGINT NOT NULL COMMENT '方案ID',
    check_type VARCHAR(50) NOT NULL COMMENT '检查类型(consistency/completeness/clarity/accuracy)',
    overall_score DECIMAL(5,2) COMMENT '总体评分',
    completeness_score DECIMAL(5,2) COMMENT '完整性评分',
    clarity_score DECIMAL(5,2) COMMENT '清晰度评分',
    consistency_score DECIMAL(5,2) COMMENT '一致性评分',
    accuracy_score DECIMAL(5,2) COMMENT '准确性评分',
    issues JSON COMMENT '发现的问题',
    suggestions JSON COMMENT '改进建议',
    auto_fixes JSON COMMENT '自动修复建议',
    checked_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '检查时间',
    INDEX idx_proposal_id (proposal_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='质量检查表';

-- 10. 方案版本表 (AG-009 多轮优化)
CREATE TABLE IF NOT EXISTS ai_proposal_version (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    proposal_id BIGINT NOT NULL COMMENT '方案ID',
    version INT NOT NULL COMMENT '版本号',
    content LONGTEXT COMMENT '版本内容',
    change_summary TEXT COMMENT '变更摘要',
    change_type VARCHAR(50) COMMENT '变更类型(optimize/expand/refine/restructure)',
    feedback TEXT COMMENT '用户反馈',
    created_by BIGINT COMMENT '创建者ID',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_proposal_id (proposal_id),
    INDEX idx_version (version)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='方案版本表';

-- 11. 方案导出记录表 (AG-010 方案导出)
CREATE TABLE IF NOT EXISTS ai_proposal_export (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    proposal_id BIGINT NOT NULL COMMENT '方案ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    export_format VARCHAR(20) NOT NULL COMMENT '导出格式(word/pdf/ppt/markdown/html)',
    file_name VARCHAR(200) COMMENT '文件名',
    file_path VARCHAR(500) COMMENT '文件路径',
    file_size BIGINT COMMENT '文件大小(字节)',
    template_id BIGINT COMMENT '使用的模板ID',
    export_config JSON COMMENT '导出配置',
    status VARCHAR(20) DEFAULT 'pending' COMMENT '状态(pending/processing/completed/failed)',
    error_message TEXT COMMENT '错误信息',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    completed_at DATETIME COMMENT '完成时间',
    INDEX idx_proposal_id (proposal_id),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='方案导出记录表';

-- 12. 方案模板表
CREATE TABLE IF NOT EXISTS ai_proposal_template (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    name VARCHAR(100) NOT NULL COMMENT '模板名称',
    proposal_type VARCHAR(50) NOT NULL COMMENT '方案类型',
    description TEXT COMMENT '模板描述',
    outline JSON COMMENT '大纲结构',
    sections JSON COMMENT '章节模板',
    variables JSON COMMENT '变量定义',
    sample_content TEXT COMMENT '示例内容',
    is_system TINYINT(1) DEFAULT 0 COMMENT '是否系统模板',
    is_enabled TINYINT(1) DEFAULT 1 COMMENT '是否启用',
    use_count INT DEFAULT 0 COMMENT '使用次数',
    creator_id BIGINT COMMENT '创建者ID',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_proposal_type (proposal_type),
    INDEX idx_is_enabled (is_enabled)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='方案模板表';

-- 13. 导出模板表
CREATE TABLE IF NOT EXISTS ai_export_template (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    name VARCHAR(100) NOT NULL COMMENT '模板名称',
    export_format VARCHAR(20) NOT NULL COMMENT '导出格式',
    description TEXT COMMENT '模板描述',
    template_file VARCHAR(500) COMMENT '模板文件路径',
    style_config JSON COMMENT '样式配置',
    header_config JSON COMMENT '页眉配置',
    footer_config JSON COMMENT '页脚配置',
    is_system TINYINT(1) DEFAULT 0 COMMENT '是否系统模板',
    is_enabled TINYINT(1) DEFAULT 1 COMMENT '是否启用',
    creator_id BIGINT COMMENT '创建者ID',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_export_format (export_format)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='导出模板表';

-- =====================================================
-- 初始化数据
-- =====================================================

-- 插入方案模板
INSERT INTO ai_proposal_template (name, proposal_type, description, outline, is_system) VALUES
('项目方案模板', 'project', '标准项目方案模板，包含项目背景、目标、实施计划等', 
 '["项目背景","项目目标","实施方案","资源需求","风险分析","时间计划","预算估算","预期成果"]', 1),
('技术方案模板', 'technical', '技术方案模板，包含技术选型、架构设计、实施步骤等',
 '["需求分析","技术选型","架构设计","详细设计","实施计划","测试方案","运维方案"]', 1),
('营销方案模板', 'marketing', '营销方案模板，包含市场分析、营销策略、执行计划等',
 '["市场分析","目标客户","营销策略","渠道规划","预算分配","执行计划","效果评估"]', 1),
('商业计划书模板', 'business', '商业计划书模板，包含商业模式、市场分析、财务预测等',
 '["执行摘要","公司介绍","产品服务","市场分析","商业模式","营销策略","运营计划","财务预测","团队介绍","融资需求"]', 1),
('工作报告模板', 'report', '工作报告模板，包含工作总结、成果展示、问题分析等',
 '["工作概述","主要成果","问题与挑战","经验总结","下阶段计划"]', 1);

-- 插入导出模板
INSERT INTO ai_export_template (name, export_format, description, style_config, is_system) VALUES
('标准Word模板', 'word', '标准Word文档导出模板',
 '{"fontFamily":"微软雅黑","fontSize":12,"lineHeight":1.5,"marginTop":2.54,"marginBottom":2.54,"marginLeft":3.17,"marginRight":3.17}', 1),
('专业PDF模板', 'pdf', '专业PDF文档导出模板',
 '{"fontFamily":"思源黑体","fontSize":11,"lineHeight":1.6,"pageSize":"A4","orientation":"portrait"}', 1),
('演示PPT模板', 'ppt', '演示PPT导出模板',
 '{"theme":"professional","slideSize":"16:9","fontFamily":"微软雅黑","primaryColor":"#1890ff"}', 1);

-- =====================================================
-- 完成
-- =====================================================