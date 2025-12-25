-- =====================================================
-- AI知识库模块数据库脚本
-- 版本: V9.0
-- 功能: AI-001到AI-010 AI知识库完整功能
-- =====================================================

-- 1. 知识文档表 (AI-001 文档解析)
CREATE TABLE IF NOT EXISTS ai_knowledge_document (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    title VARCHAR(255) NOT NULL COMMENT '文档标题',
    original_filename VARCHAR(255) NOT NULL COMMENT '原始文件名',
    file_path VARCHAR(500) NOT NULL COMMENT '文件存储路径',
    file_type VARCHAR(50) NOT NULL COMMENT '文件类型(pdf/docx/txt/md/xlsx/pptx)',
    file_size BIGINT NOT NULL DEFAULT 0 COMMENT '文件大小(字节)',
    mime_type VARCHAR(100) COMMENT 'MIME类型',
    content_text LONGTEXT COMMENT '解析后的文本内容',
    content_html LONGTEXT COMMENT '解析后的HTML内容',
    parse_status VARCHAR(20) NOT NULL DEFAULT 'pending' COMMENT '解析状态(pending/parsing/completed/failed)',
    parse_error TEXT COMMENT '解析错误信息',
    parsed_at DATETIME COMMENT '解析完成时间',
    page_count INT DEFAULT 0 COMMENT '页数(PDF/PPT)',
    word_count INT DEFAULT 0 COMMENT '字数统计',
    char_count INT DEFAULT 0 COMMENT '字符数统计',
    language VARCHAR(20) DEFAULT 'zh' COMMENT '文档语言',
    category_id BIGINT COMMENT '分类ID',
    folder_id BIGINT COMMENT '文件夹ID',
    team_id BIGINT COMMENT '团队ID',
    creator_id BIGINT NOT NULL COMMENT '创建者ID',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted_at DATETIME COMMENT '删除时间',
    INDEX idx_team_id (team_id),
    INDEX idx_creator_id (creator_id),
    INDEX idx_category_id (category_id),
    INDEX idx_parse_status (parse_status),
    INDEX idx_file_type (file_type),
    FULLTEXT INDEX ft_content (content_text)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI知识文档表';

-- 2. OCR识别记录表 (AI-002 OCR识别)
CREATE TABLE IF NOT EXISTS ai_ocr_record (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    document_id BIGINT COMMENT '关联文档ID',
    image_path VARCHAR(500) NOT NULL COMMENT '图片路径',
    image_type VARCHAR(50) COMMENT '图片类型(jpg/png/gif/bmp)',
    image_width INT COMMENT '图片宽度',
    image_height INT COMMENT '图片高度',
    ocr_engine VARCHAR(50) DEFAULT 'tesseract' COMMENT 'OCR引擎(tesseract/paddleocr/azure/google)',
    ocr_language VARCHAR(50) DEFAULT 'chi_sim+eng' COMMENT 'OCR语言',
    recognized_text LONGTEXT COMMENT '识别出的文本',
    confidence DECIMAL(5,2) COMMENT '识别置信度(0-100)',
    text_regions JSON COMMENT '文字区域坐标信息',
    ocr_status VARCHAR(20) NOT NULL DEFAULT 'pending' COMMENT '识别状态(pending/processing/completed/failed)',
    ocr_error TEXT COMMENT '识别错误信息',
    processing_time INT COMMENT '处理耗时(毫秒)',
    creator_id BIGINT NOT NULL COMMENT '创建者ID',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_document_id (document_id),
    INDEX idx_ocr_status (ocr_status),
    INDEX idx_creator_id (creator_id),
    FULLTEXT INDEX ft_recognized_text (recognized_text)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='OCR识别记录表';

-- 3. 语音转文字记录表 (AI-003 语音转文字)
CREATE TABLE IF NOT EXISTS ai_speech_to_text (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    document_id BIGINT COMMENT '关联文档ID',
    audio_path VARCHAR(500) NOT NULL COMMENT '音频/视频文件路径',
    audio_type VARCHAR(50) COMMENT '文件类型(mp3/wav/mp4/avi/mov)',
    duration INT COMMENT '时长(秒)',
    file_size BIGINT COMMENT '文件大小(字节)',
    stt_engine VARCHAR(50) DEFAULT 'whisper' COMMENT 'STT引擎(whisper/azure/google/aliyun)',
    stt_language VARCHAR(50) DEFAULT 'zh' COMMENT '识别语言',
    transcribed_text LONGTEXT COMMENT '转写的文本',
    segments JSON COMMENT '分段信息(时间戳+文本)',
    speakers JSON COMMENT '说话人分离信息',
    confidence DECIMAL(5,2) COMMENT '识别置信度(0-100)',
    stt_status VARCHAR(20) NOT NULL DEFAULT 'pending' COMMENT '转写状态(pending/processing/completed/failed)',
    stt_error TEXT COMMENT '转写错误信息',
    processing_time INT COMMENT '处理耗时(毫秒)',
    creator_id BIGINT NOT NULL COMMENT '创建者ID',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_document_id (document_id),
    INDEX idx_stt_status (stt_status),
    INDEX idx_creator_id (creator_id),
    FULLTEXT INDEX ft_transcribed_text (transcribed_text)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='语音转文字记录表';

-- 4. 表格提取记录表 (AI-004 表格提取)
CREATE TABLE IF NOT EXISTS ai_table_extraction (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    document_id BIGINT NOT NULL COMMENT '关联文档ID',
    page_number INT DEFAULT 1 COMMENT '所在页码',
    table_index INT DEFAULT 0 COMMENT '表格序号(同一页可能有多个表格)',
    table_title VARCHAR(255) COMMENT '表格标题',
    row_count INT DEFAULT 0 COMMENT '行数',
    column_count INT DEFAULT 0 COMMENT '列数',
    headers JSON COMMENT '表头信息',
    table_data JSON COMMENT '表格数据(二维数组)',
    table_html TEXT COMMENT '表格HTML格式',
    table_markdown TEXT COMMENT '表格Markdown格式',
    table_csv TEXT COMMENT '表格CSV格式',
    extraction_method VARCHAR(50) DEFAULT 'auto' COMMENT '提取方法(auto/camelot/tabula/custom)',
    confidence DECIMAL(5,2) COMMENT '提取置信度(0-100)',
    extraction_status VARCHAR(20) NOT NULL DEFAULT 'pending' COMMENT '提取状态(pending/processing/completed/failed)',
    extraction_error TEXT COMMENT '提取错误信息',
    creator_id BIGINT NOT NULL COMMENT '创建者ID',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_document_id (document_id),
    INDEX idx_extraction_status (extraction_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='表格提取记录表';

-- 5. 关键信息提取表 (AI-005 关键信息提取)
CREATE TABLE IF NOT EXISTS ai_key_info_extraction (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    document_id BIGINT NOT NULL COMMENT '关联文档ID',
    extraction_type VARCHAR(50) NOT NULL COMMENT '提取类型(entity/relation/event)',
    
    -- 实体信息
    entity_type VARCHAR(50) COMMENT '实体类型(person/org/location/date/money/product等)',
    entity_text VARCHAR(500) COMMENT '实体文本',
    entity_start INT COMMENT '实体起始位置',
    entity_end INT COMMENT '实体结束位置',
    
    -- 关系信息
    relation_type VARCHAR(100) COMMENT '关系类型',
    subject_entity VARCHAR(500) COMMENT '主体实体',
    object_entity VARCHAR(500) COMMENT '客体实体',
    
    -- 事件信息
    event_type VARCHAR(100) COMMENT '事件类型',
    event_trigger VARCHAR(255) COMMENT '事件触发词',
    event_arguments JSON COMMENT '事件论元',
    event_time VARCHAR(100) COMMENT '事件时间',
    event_location VARCHAR(255) COMMENT '事件地点',
    
    confidence DECIMAL(5,2) COMMENT '提取置信度(0-100)',
    context_text TEXT COMMENT '上下文文本',
    metadata JSON COMMENT '其他元数据',
    extraction_status VARCHAR(20) NOT NULL DEFAULT 'completed' COMMENT '提取状态',
    creator_id BIGINT NOT NULL COMMENT '创建者ID',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_document_id (document_id),
    INDEX idx_extraction_type (extraction_type),
    INDEX idx_entity_type (entity_type),
    INDEX idx_relation_type (relation_type),
    INDEX idx_event_type (event_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='关键信息提取表';

-- 6. 文档摘要表 (AI-006 自动摘要)
CREATE TABLE IF NOT EXISTS ai_document_summary (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    document_id BIGINT NOT NULL COMMENT '关联文档ID',
    summary_type VARCHAR(50) NOT NULL DEFAULT 'extractive' COMMENT '摘要类型(extractive/abstractive/hybrid)',
    summary_length VARCHAR(20) DEFAULT 'medium' COMMENT '摘要长度(short/medium/long)',
    summary_text TEXT NOT NULL COMMENT '摘要文本',
    key_points JSON COMMENT '关键要点列表',
    keywords JSON COMMENT '关键词列表',
    word_count INT COMMENT '摘要字数',
    compression_ratio DECIMAL(5,2) COMMENT '压缩比例',
    model_used VARCHAR(100) COMMENT '使用的模型',
    generation_status VARCHAR(20) NOT NULL DEFAULT 'completed' COMMENT '生成状态',
    generation_error TEXT COMMENT '生成错误信息',
    creator_id BIGINT NOT NULL COMMENT '创建者ID',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_document_id (document_id),
    INDEX idx_summary_type (summary_type),
    FULLTEXT INDEX ft_summary (summary_text)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文档摘要表';

-- 7. 主题分类表 (AI-007 主题分类)
CREATE TABLE IF NOT EXISTS ai_topic_category (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    name VARCHAR(100) NOT NULL COMMENT '分类名称',
    code VARCHAR(50) NOT NULL COMMENT '分类编码',
    parent_id BIGINT DEFAULT 0 COMMENT '父分类ID',
    level INT DEFAULT 1 COMMENT '层级',
    path VARCHAR(500) COMMENT '分类路径',
    description TEXT COMMENT '分类描述',
    keywords JSON COMMENT '分类关键词',
    icon VARCHAR(100) COMMENT '分类图标',
    color VARCHAR(20) COMMENT '分类颜色',
    sort_order INT DEFAULT 0 COMMENT '排序',
    is_system TINYINT(1) DEFAULT 0 COMMENT '是否系统分类',
    team_id BIGINT COMMENT '团队ID(null表示全局)',
    creator_id BIGINT NOT NULL COMMENT '创建者ID',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE INDEX uk_code_team (code, team_id),
    INDEX idx_parent_id (parent_id),
    INDEX idx_team_id (team_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='主题分类表';

-- 8. 文档分类关联表 (AI-007 主题分类)
CREATE TABLE IF NOT EXISTS ai_document_category (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    document_id BIGINT NOT NULL COMMENT '文档ID',
    category_id BIGINT NOT NULL COMMENT '分类ID',
    confidence DECIMAL(5,2) COMMENT '分类置信度(0-100)',
    is_primary TINYINT(1) DEFAULT 0 COMMENT '是否主分类',
    is_manual TINYINT(1) DEFAULT 0 COMMENT '是否手动分类',
    classified_by VARCHAR(100) COMMENT '分类模型/用户',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    UNIQUE INDEX uk_doc_cat (document_id, category_id),
    INDEX idx_category_id (category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文档分类关联表';

-- 9. 自动标签表 (AI-008 自动标签)
CREATE TABLE IF NOT EXISTS ai_tag (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    name VARCHAR(100) NOT NULL COMMENT '标签名称',
    type VARCHAR(50) DEFAULT 'keyword' COMMENT '标签类型(keyword/entity/topic/custom)',
    color VARCHAR(20) COMMENT '标签颜色',
    description TEXT COMMENT '标签描述',
    usage_count INT DEFAULT 0 COMMENT '使用次数',
    is_system TINYINT(1) DEFAULT 0 COMMENT '是否系统标签',
    team_id BIGINT COMMENT '团队ID(null表示全局)',
    creator_id BIGINT NOT NULL COMMENT '创建者ID',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE INDEX uk_name_team (name, team_id),
    INDEX idx_type (type),
    INDEX idx_team_id (team_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='自动标签表';

-- 10. 文档标签关联表 (AI-008 自动标签)
CREATE TABLE IF NOT EXISTS ai_document_tag (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    document_id BIGINT NOT NULL COMMENT '文档ID',
    tag_id BIGINT NOT NULL COMMENT '标签ID',
    confidence DECIMAL(5,2) COMMENT '标签置信度(0-100)',
    is_manual TINYINT(1) DEFAULT 0 COMMENT '是否手动标签',
    tagged_by VARCHAR(100) COMMENT '标签来源(模型/用户)',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    UNIQUE INDEX uk_doc_tag (document_id, tag_id),
    INDEX idx_tag_id (tag_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文档标签关联表';

-- 11. 向量存储表 (AI-009 向量化存储)
CREATE TABLE IF NOT EXISTS ai_document_vector (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    document_id BIGINT NOT NULL COMMENT '文档ID',
    chunk_index INT NOT NULL DEFAULT 0 COMMENT '分块索引',
    chunk_text TEXT NOT NULL COMMENT '分块文本',
    chunk_start INT COMMENT '分块起始位置',
    chunk_end INT COMMENT '分块结束位置',
    token_count INT COMMENT 'Token数量',
    embedding_model VARCHAR(100) DEFAULT 'text-embedding-ada-002' COMMENT '向量模型',
    embedding_dimension INT DEFAULT 1536 COMMENT '向量维度',
    embedding BLOB COMMENT '向量数据(二进制存储)',
    embedding_json JSON COMMENT '向量数据(JSON存储,用于调试)',
    vector_id VARCHAR(100) COMMENT '向量数据库中的ID(如Milvus/Pinecone)',
    collection_name VARCHAR(100) COMMENT '向量集合名称',
    metadata JSON COMMENT '元数据',
    vectorize_status VARCHAR(20) NOT NULL DEFAULT 'pending' COMMENT '向量化状态(pending/processing/completed/failed)',
    vectorize_error TEXT COMMENT '向量化错误信息',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_document_id (document_id),
    INDEX idx_vectorize_status (vectorize_status),
    INDEX idx_collection_name (collection_name),
    INDEX idx_vector_id (vector_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文档向量存储表';

-- 12. 语义检索日志表 (AI-010 语义检索)
CREATE TABLE IF NOT EXISTS ai_semantic_search_log (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    query_text TEXT NOT NULL COMMENT '查询文本',
    query_vector BLOB COMMENT '查询向量',
    search_type VARCHAR(50) DEFAULT 'semantic' COMMENT '检索类型(semantic/keyword/hybrid)',
    top_k INT DEFAULT 10 COMMENT '返回结果数',
    similarity_threshold DECIMAL(5,4) DEFAULT 0.7 COMMENT '相似度阈值',
    result_count INT COMMENT '实际返回结果数',
    result_ids JSON COMMENT '返回的文档ID列表',
    result_scores JSON COMMENT '返回的相似度分数列表',
    search_time INT COMMENT '检索耗时(毫秒)',
    filters JSON COMMENT '过滤条件',
    team_id BIGINT COMMENT '团队ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_user_id (user_id),
    INDEX idx_team_id (team_id),
    INDEX idx_search_type (search_type),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='语义检索日志表';

-- 13. AI处理任务队列表
CREATE TABLE IF NOT EXISTS ai_processing_task (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    task_type VARCHAR(50) NOT NULL COMMENT '任务类型(parse/ocr/stt/extract_table/extract_info/summarize/classify/tag/vectorize)',
    target_id BIGINT NOT NULL COMMENT '目标ID(文档ID/图片ID等)',
    target_type VARCHAR(50) NOT NULL COMMENT '目标类型(document/image/audio)',
    priority INT DEFAULT 5 COMMENT '优先级(1-10,数字越小优先级越高)',
    status VARCHAR(20) NOT NULL DEFAULT 'pending' COMMENT '状态(pending/processing/completed/failed/cancelled)',
    progress INT DEFAULT 0 COMMENT '进度(0-100)',
    retry_count INT DEFAULT 0 COMMENT '重试次数',
    max_retries INT DEFAULT 3 COMMENT '最大重试次数',
    error_message TEXT COMMENT '错误信息',
    started_at DATETIME COMMENT '开始时间',
    completed_at DATETIME COMMENT '完成时间',
    scheduled_at DATETIME COMMENT '计划执行时间',
    worker_id VARCHAR(100) COMMENT '处理节点ID',
    params JSON COMMENT '任务参数',
    result JSON COMMENT '任务结果',
    creator_id BIGINT NOT NULL COMMENT '创建者ID',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_task_type (task_type),
    INDEX idx_status (status),
    INDEX idx_priority_status (priority, status),
    INDEX idx_target (target_id, target_type),
    INDEX idx_scheduled_at (scheduled_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI处理任务队列表';

-- 14. AI模型配置表
CREATE TABLE IF NOT EXISTS ai_model_config (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    model_type VARCHAR(50) NOT NULL COMMENT '模型类型(embedding/llm/ocr/stt/ner)',
    model_name VARCHAR(100) NOT NULL COMMENT '模型名称',
    model_provider VARCHAR(50) NOT NULL COMMENT '模型提供商(openai/azure/aliyun/local)',
    api_endpoint VARCHAR(500) COMMENT 'API端点',
    api_key_encrypted VARCHAR(500) COMMENT '加密的API密钥',
    model_params JSON COMMENT '模型参数',
    is_default TINYINT(1) DEFAULT 0 COMMENT '是否默认模型',
    is_enabled TINYINT(1) DEFAULT 1 COMMENT '是否启用',
    rate_limit INT COMMENT '速率限制(每分钟请求数)',
    cost_per_1k_tokens DECIMAL(10,6) COMMENT '每1000token成本',
    team_id BIGINT COMMENT '团队ID(null表示全局)',
    creator_id BIGINT NOT NULL COMMENT '创建者ID',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_model_type (model_type),
    INDEX idx_model_provider (model_provider),
    INDEX idx_team_id (team_id),
    INDEX idx_is_default (is_default)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI模型配置表';

-- 15. AI使用统计表
CREATE TABLE IF NOT EXISTS ai_usage_stats (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    stat_date DATE NOT NULL COMMENT '统计日期',
    team_id BIGINT COMMENT '团队ID',
    user_id BIGINT COMMENT '用户ID',
    model_type VARCHAR(50) NOT NULL COMMENT '模型类型',
    model_name VARCHAR(100) COMMENT '模型名称',
    request_count INT DEFAULT 0 COMMENT '请求次数',
    success_count INT DEFAULT 0 COMMENT '成功次数',
    failed_count INT DEFAULT 0 COMMENT '失败次数',
    total_tokens INT DEFAULT 0 COMMENT '总Token数',
    input_tokens INT DEFAULT 0 COMMENT '输入Token数',
    output_tokens INT DEFAULT 0 COMMENT '输出Token数',
    total_cost DECIMAL(10,4) DEFAULT 0 COMMENT '总成本',
    avg_latency INT DEFAULT 0 COMMENT '平均延迟(毫秒)',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE INDEX uk_stat (stat_date, team_id, user_id, model_type, model_name),
    INDEX idx_stat_date (stat_date),
    INDEX idx_team_id (team_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI使用统计表';

-- =====================================================
-- 初始化数据
-- =====================================================

-- 插入默认主题分类
INSERT INTO ai_topic_category (name, code, parent_id, level, path, description, is_system, creator_id) VALUES
('技术文档', 'tech', 0, 1, '/tech', '技术相关文档', 1, 1),
('产品文档', 'product', 0, 1, '/product', '产品相关文档', 1, 1),
('市场营销', 'marketing', 0, 1, '/marketing', '市场营销相关文档', 1, 1),
('财务报表', 'finance', 0, 1, '/finance', '财务相关文档', 1, 1),
('人力资源', 'hr', 0, 1, '/hr', '人力资源相关文档', 1, 1),
('法务合规', 'legal', 0, 1, '/legal', '法务合规相关文档', 1, 1),
('项目管理', 'project', 0, 1, '/project', '项目管理相关文档', 1, 1),
('培训资料', 'training', 0, 1, '/training', '培训相关文档', 1, 1),
('会议纪要', 'meeting', 0, 1, '/meeting', '会议纪要文档', 1, 1),
('其他', 'other', 0, 1, '/other', '其他类型文档', 1, 1);

-- 插入技术文档子分类
INSERT INTO ai_topic_category (name, code, parent_id, level, path, description, is_system, creator_id) VALUES
('API文档', 'tech_api', 1, 2, '/tech/api', 'API接口文档', 1, 1),
('架构设计', 'tech_arch', 1, 2, '/tech/arch', '系统架构设计文档', 1, 1),
('开发规范', 'tech_standard', 1, 2, '/tech/standard', '开发规范文档', 1, 1),
('运维手册', 'tech_ops', 1, 2, '/tech/ops', '运维操作手册', 1, 1);

-- 插入默认标签
INSERT INTO ai_tag (name, type, color, description, is_system, creator_id) VALUES
('重要', 'custom', '#f5222d', '重要文档', 1, 1),
('紧急', 'custom', '#fa541c', '紧急处理', 1, 1),
('待审核', 'custom', '#faad14', '待审核文档', 1, 1),
('已归档', 'custom', '#52c41a', '已归档文档', 1, 1),
('草稿', 'custom', '#1890ff', '草稿状态', 1, 1),
('机密', 'custom', '#722ed1', '机密文档', 1, 1);

-- 插入默认AI模型配置
INSERT INTO ai_model_config (model_type, model_name, model_provider, api_endpoint, model_params, is_default, is_enabled, creator_id) VALUES
('embedding', 'text-embedding-ada-002', 'openai', 'https://api.openai.com/v1/embeddings', '{"dimension": 1536}', 1, 1, 1),
('embedding', 'text-embedding-3-small', 'openai', 'https://api.openai.com/v1/embeddings', '{"dimension": 1536}', 0, 1, 1),
('llm', 'gpt-4-turbo', 'openai', 'https://api.openai.com/v1/chat/completions', '{"max_tokens": 4096, "temperature": 0.7}', 1, 1, 1),
('llm', 'gpt-3.5-turbo', 'openai', 'https://api.openai.com/v1/chat/completions', '{"max_tokens": 4096, "temperature": 0.7}', 0, 1, 1),
('ocr', 'tesseract', 'local', NULL, '{"language": "chi_sim+eng"}', 1, 1, 1),
('ocr', 'paddleocr', 'local', NULL, '{"language": "ch"}', 0, 1, 1),
('stt', 'whisper-large-v3', 'openai', 'https://api.openai.com/v1/audio/transcriptions', '{"language": "zh"}', 1, 1, 1);

-- =====================================================
-- 完成
-- =====================================================