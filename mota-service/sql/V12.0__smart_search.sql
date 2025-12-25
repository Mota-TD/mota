-- =====================================================
-- 智能搜索模块数据库脚本
-- 版本: V12.0
-- 功能: SS-001到SS-008 智能搜索功能
-- =====================================================

-- 1. 搜索索引配置表
CREATE TABLE IF NOT EXISTS search_index_config (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    index_name VARCHAR(100) NOT NULL COMMENT '索引名称',
    index_type VARCHAR(50) NOT NULL COMMENT '索引类型(document/task/project/knowledge)',
    table_name VARCHAR(100) NOT NULL COMMENT '关联表名',
    field_mappings JSON COMMENT '字段映射配置',
    analyzer_config JSON COMMENT '分析器配置',
    vector_config JSON COMMENT '向量化配置',
    is_enabled BOOLEAN DEFAULT TRUE COMMENT '是否启用',
    last_sync_at DATETIME COMMENT '最后同步时间',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_index_name (index_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='搜索索引配置表';

-- 2. 文档向量表
CREATE TABLE IF NOT EXISTS document_vector (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    document_id BIGINT NOT NULL COMMENT '文档ID',
    document_type VARCHAR(50) NOT NULL COMMENT '文档类型',
    chunk_index INT DEFAULT 0 COMMENT '分块索引',
    content_text TEXT COMMENT '原始文本内容',
    vector_data BLOB COMMENT '向量数据(二进制存储)',
    vector_dimension INT COMMENT '向量维度',
    embedding_model VARCHAR(100) COMMENT '嵌入模型',
    metadata JSON COMMENT '元数据',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_document (document_id, document_type),
    INDEX idx_chunk (document_id, chunk_index)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='文档向量表';

-- 3. 搜索日志表
CREATE TABLE IF NOT EXISTS search_log (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT COMMENT '用户ID',
    session_id VARCHAR(100) COMMENT '会话ID',
    query_text VARCHAR(500) NOT NULL COMMENT '搜索词',
    query_type VARCHAR(50) DEFAULT 'keyword' COMMENT '搜索类型(keyword/semantic/hybrid)',
    corrected_query VARCHAR(500) COMMENT '纠错后的搜索词',
    detected_intent VARCHAR(100) COMMENT '识别的意图',
    filters JSON COMMENT '筛选条件',
    result_count INT DEFAULT 0 COMMENT '结果数量',
    clicked_results JSON COMMENT '点击的结果',
    search_time_ms INT COMMENT '搜索耗时(毫秒)',
    is_successful BOOLEAN DEFAULT TRUE COMMENT '是否成功',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user (user_id),
    INDEX idx_query (query_text(100)),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='搜索日志表';

-- 4. 搜索建议表
CREATE TABLE IF NOT EXISTS search_suggestion (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    suggestion_text VARCHAR(200) NOT NULL COMMENT '建议文本',
    suggestion_type VARCHAR(50) NOT NULL COMMENT '建议类型(hot/related/correction/completion)',
    source_query VARCHAR(200) COMMENT '来源查询',
    frequency INT DEFAULT 1 COMMENT '出现频率',
    click_count INT DEFAULT 0 COMMENT '点击次数',
    score DECIMAL(5,4) DEFAULT 0 COMMENT '相关度得分',
    is_active BOOLEAN DEFAULT TRUE COMMENT '是否启用',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_type (suggestion_type),
    INDEX idx_text (suggestion_text),
    INDEX idx_frequency (frequency DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='搜索建议表';

-- 5. 搜索纠错词典表
CREATE TABLE IF NOT EXISTS search_correction_dict (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    wrong_word VARCHAR(100) NOT NULL COMMENT '错误词',
    correct_word VARCHAR(100) NOT NULL COMMENT '正确词',
    correction_type VARCHAR(50) DEFAULT 'spelling' COMMENT '纠错类型(spelling/synonym/pinyin)',
    confidence DECIMAL(5,4) DEFAULT 1.0 COMMENT '置信度',
    usage_count INT DEFAULT 0 COMMENT '使用次数',
    is_active BOOLEAN DEFAULT TRUE COMMENT '是否启用',
    created_by BIGINT COMMENT '创建人',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_wrong_word (wrong_word),
    INDEX idx_correct (correct_word)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='搜索纠错词典表';

-- 6. 搜索同义词表
CREATE TABLE IF NOT EXISTS search_synonym (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    word_group VARCHAR(500) NOT NULL COMMENT '同义词组(逗号分隔)',
    synonym_type VARCHAR(50) DEFAULT 'equivalent' COMMENT '同义词类型(equivalent/expansion)',
    domain VARCHAR(100) COMMENT '领域',
    weight DECIMAL(3,2) DEFAULT 1.0 COMMENT '权重',
    is_active BOOLEAN DEFAULT TRUE COMMENT '是否启用',
    created_by BIGINT COMMENT '创建人',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_domain (domain)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='搜索同义词表';

-- 7. 搜索意图模板表
CREATE TABLE IF NOT EXISTS search_intent_template (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    intent_name VARCHAR(100) NOT NULL COMMENT '意图名称',
    intent_code VARCHAR(50) NOT NULL COMMENT '意图代码',
    patterns JSON NOT NULL COMMENT '匹配模式(正则表达式列表)',
    keywords JSON COMMENT '关键词列表',
    action_type VARCHAR(50) COMMENT '动作类型(search/navigate/filter/aggregate)',
    action_config JSON COMMENT '动作配置',
    priority INT DEFAULT 0 COMMENT '优先级',
    is_active BOOLEAN DEFAULT TRUE COMMENT '是否启用',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_intent_code (intent_code),
    INDEX idx_priority (priority DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='搜索意图模板表';

-- 8. 搜索结果缓存表
CREATE TABLE IF NOT EXISTS search_result_cache (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    cache_key VARCHAR(255) NOT NULL COMMENT '缓存键(查询hash)',
    query_text VARCHAR(500) NOT NULL COMMENT '搜索词',
    query_type VARCHAR(50) NOT NULL COMMENT '搜索类型',
    filters_hash VARCHAR(64) COMMENT '筛选条件hash',
    result_data JSON COMMENT '结果数据',
    result_count INT DEFAULT 0 COMMENT '结果数量',
    hit_count INT DEFAULT 0 COMMENT '命中次数',
    expires_at DATETIME NOT NULL COMMENT '过期时间',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_cache_key (cache_key),
    INDEX idx_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='搜索结果缓存表';

-- 9. 搜索热词表
CREATE TABLE IF NOT EXISTS search_hot_word (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    word VARCHAR(100) NOT NULL COMMENT '热词',
    category VARCHAR(50) COMMENT '分类',
    search_count INT DEFAULT 0 COMMENT '搜索次数',
    trend_score DECIMAL(10,4) DEFAULT 0 COMMENT '趋势得分',
    period_type VARCHAR(20) DEFAULT 'daily' COMMENT '统计周期(hourly/daily/weekly)',
    period_date DATE NOT NULL COMMENT '统计日期',
    rank_position INT COMMENT '排名位置',
    is_trending BOOLEAN DEFAULT FALSE COMMENT '是否上升趋势',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_word_period (word, period_type, period_date),
    INDEX idx_rank (period_type, period_date, rank_position)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='搜索热词表';

-- 10. 搜索相关推荐表
CREATE TABLE IF NOT EXISTS search_related_query (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    source_query VARCHAR(200) NOT NULL COMMENT '源查询',
    related_query VARCHAR(200) NOT NULL COMMENT '相关查询',
    relation_type VARCHAR(50) DEFAULT 'co_search' COMMENT '关系类型(co_search/refine/broaden)',
    co_occurrence_count INT DEFAULT 0 COMMENT '共现次数',
    similarity_score DECIMAL(5,4) DEFAULT 0 COMMENT '相似度得分',
    click_through_rate DECIMAL(5,4) DEFAULT 0 COMMENT '点击率',
    is_active BOOLEAN DEFAULT TRUE COMMENT '是否启用',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_source_related (source_query(100), related_query(100)),
    INDEX idx_source (source_query(100)),
    INDEX idx_score (similarity_score DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='搜索相关推荐表';

-- 11. 用户搜索偏好表
CREATE TABLE IF NOT EXISTS user_search_preference (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL COMMENT '用户ID',
    preferred_types JSON COMMENT '偏好的内容类型',
    preferred_filters JSON COMMENT '常用筛选条件',
    search_history_enabled BOOLEAN DEFAULT TRUE COMMENT '是否启用搜索历史',
    suggestion_enabled BOOLEAN DEFAULT TRUE COMMENT '是否启用搜索建议',
    personalization_enabled BOOLEAN DEFAULT TRUE COMMENT '是否启用个性化',
    safe_search_level VARCHAR(20) DEFAULT 'moderate' COMMENT '安全搜索级别',
    results_per_page INT DEFAULT 20 COMMENT '每页结果数',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户搜索偏好表';

-- 12. 搜索补全词表
CREATE TABLE IF NOT EXISTS search_completion (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    prefix VARCHAR(50) NOT NULL COMMENT '前缀',
    completion_text VARCHAR(200) NOT NULL COMMENT '补全文本',
    completion_type VARCHAR(50) DEFAULT 'query' COMMENT '补全类型(query/entity/tag)',
    frequency INT DEFAULT 0 COMMENT '频率',
    weight DECIMAL(5,4) DEFAULT 1.0 COMMENT '权重',
    metadata JSON COMMENT '元数据',
    is_active BOOLEAN DEFAULT TRUE COMMENT '是否启用',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_prefix (prefix),
    INDEX idx_frequency (frequency DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='搜索补全词表';

-- 插入默认搜索索引配置
INSERT INTO search_index_config (index_name, index_type, table_name, field_mappings, analyzer_config) VALUES
('documents', 'document', 'document', '{"title": {"type": "text", "boost": 2.0}, "content": {"type": "text"}, "tags": {"type": "keyword"}}', '{"analyzer": "ik_max_word", "search_analyzer": "ik_smart"}'),
('tasks', 'task', 'task', '{"title": {"type": "text", "boost": 2.0}, "description": {"type": "text"}, "tags": {"type": "keyword"}}', '{"analyzer": "ik_max_word", "search_analyzer": "ik_smart"}'),
('projects', 'project', 'project', '{"name": {"type": "text", "boost": 2.0}, "description": {"type": "text"}}', '{"analyzer": "ik_max_word", "search_analyzer": "ik_smart"}'),
('knowledge', 'knowledge', 'ai_knowledge_document', '{"title": {"type": "text", "boost": 2.0}, "content": {"type": "text"}, "summary": {"type": "text"}}', '{"analyzer": "ik_max_word", "search_analyzer": "ik_smart"}');

-- 插入默认搜索意图模板
INSERT INTO search_intent_template (intent_name, intent_code, patterns, keywords, action_type, priority) VALUES
('查找文档', 'find_document', '["查找.*文档", "搜索.*文件", "找.*资料"]', '["文档", "文件", "资料"]', 'search', 10),
('查找任务', 'find_task', '["查找.*任务", "搜索.*工作", "我的任务"]', '["任务", "工作", "待办"]', 'search', 10),
('查找项目', 'find_project', '["查找.*项目", "搜索.*项目", "项目列表"]', '["项目"]', 'search', 10),
('查找人员', 'find_user', '["查找.*人", "搜索.*成员", "谁负责"]', '["人员", "成员", "负责人"]', 'search', 10),
('时间筛选', 'filter_time', '["今天.*", "本周.*", "最近.*", "上个月.*"]', '["今天", "本周", "最近", "上个月"]', 'filter', 5),
('状态筛选', 'filter_status', '["进行中.*", "已完成.*", "待处理.*"]', '["进行中", "已完成", "待处理"]', 'filter', 5);

-- 插入默认纠错词典
INSERT INTO search_correction_dict (wrong_word, correct_word, correction_type, confidence) VALUES
('文挡', '文档', 'spelling', 0.95),
('任物', '任务', 'spelling', 0.95),
('项木', '项目', 'spelling', 0.95),
('搜锁', '搜索', 'spelling', 0.95),
('wendang', '文档', 'pinyin', 0.90),
('renwu', '任务', 'pinyin', 0.90),
('xiangmu', '项目', 'pinyin', 0.90);

-- 插入默认同义词
INSERT INTO search_synonym (word_group, synonym_type, domain) VALUES
('文档,文件,资料,材料', 'equivalent', 'document'),
('任务,工作,待办,事项', 'equivalent', 'task'),
('项目,工程,计划', 'equivalent', 'project'),
('搜索,查找,检索,查询', 'equivalent', 'action'),
('创建,新建,添加,新增', 'equivalent', 'action'),
('删除,移除,清除', 'equivalent', 'action'),
('修改,编辑,更新,变更', 'equivalent', 'action');