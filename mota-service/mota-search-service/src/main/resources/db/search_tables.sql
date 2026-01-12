-- 搜索服务数据库表结构
-- 创建数据库
CREATE DATABASE IF NOT EXISTS mota_search DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE mota_search;

-- 搜索历史表
CREATE TABLE IF NOT EXISTS search_history (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    tenant_id BIGINT NOT NULL COMMENT '租户ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    keyword VARCHAR(200) NOT NULL COMMENT '搜索关键词',
    search_mode VARCHAR(20) DEFAULT 'fulltext' COMMENT '搜索模式：fulltext/semantic/vector/hybrid',
    search_types VARCHAR(200) COMMENT '搜索类型，逗号分隔',
    result_count INT DEFAULT 0 COMMENT '搜索结果数量',
    response_time INT DEFAULT 0 COMMENT '响应时间（毫秒）',
    clicked_doc_id VARCHAR(100) COMMENT '点击的文档ID',
    click_position INT COMMENT '点击位置',
    click_time DATETIME COMMENT '点击时间',
    search_time DATETIME NOT NULL COMMENT '搜索时间',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_tenant_user (tenant_id, user_id),
    INDEX idx_tenant_keyword (tenant_id, keyword),
    INDEX idx_search_time (search_time),
    INDEX idx_tenant_date (tenant_id, search_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='搜索历史表';

-- 搜索热词表
CREATE TABLE IF NOT EXISTS search_hotword (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    tenant_id BIGINT NOT NULL COMMENT '租户ID',
    keyword VARCHAR(100) NOT NULL COMMENT '关键词',
    search_count BIGINT DEFAULT 0 COMMENT '搜索次数',
    period VARCHAR(20) DEFAULT 'daily' COMMENT '统计周期：daily/weekly/monthly/all',
    ranking INT COMMENT '排名',
    trend VARCHAR(20) DEFAULT 'stable' COMMENT '趋势：up/down/stable',
    is_new TINYINT(1) DEFAULT 0 COMMENT '是否新热词',
    is_recommended TINYINT(1) DEFAULT 0 COMMENT '是否推荐',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY uk_tenant_keyword_period (tenant_id, keyword, period),
    INDEX idx_tenant_period_rank (tenant_id, period, ranking),
    INDEX idx_tenant_recommended (tenant_id, is_recommended)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='搜索热词表';

-- 搜索同义词表
CREATE TABLE IF NOT EXISTS search_synonym (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    tenant_id BIGINT NOT NULL COMMENT '租户ID',
    keyword VARCHAR(100) NOT NULL COMMENT '关键词',
    synonyms TEXT NOT NULL COMMENT '同义词列表，逗号分隔',
    synonym_type VARCHAR(20) DEFAULT 'equivalent' COMMENT '同义词类型：equivalent-等价/expansion-扩展/correction-纠错',
    weight DECIMAL(3,2) DEFAULT 1.00 COMMENT '权重',
    is_enabled TINYINT(1) DEFAULT 1 COMMENT '是否启用',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    creator_id BIGINT COMMENT '创建者ID',
    INDEX idx_tenant_keyword (tenant_id, keyword),
    INDEX idx_tenant_type (tenant_id, synonym_type),
    INDEX idx_tenant_enabled (tenant_id, is_enabled)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='搜索同义词表';

-- 搜索配置表
CREATE TABLE IF NOT EXISTS search_config (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    tenant_id BIGINT NOT NULL COMMENT '租户ID',
    config_key VARCHAR(100) NOT NULL COMMENT '配置键',
    config_value TEXT COMMENT '配置值',
    config_type VARCHAR(20) DEFAULT 'string' COMMENT '配置类型：string/number/boolean/json',
    description VARCHAR(500) COMMENT '配置描述',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY uk_tenant_key (tenant_id, config_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='搜索配置表';

-- 索引任务表
CREATE TABLE IF NOT EXISTS index_task (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    tenant_id BIGINT NOT NULL COMMENT '租户ID',
    task_type VARCHAR(50) NOT NULL COMMENT '任务类型：full_rebuild/incremental/delete',
    doc_type VARCHAR(50) COMMENT '文档类型',
    status VARCHAR(20) DEFAULT 'pending' COMMENT '状态：pending/running/completed/failed',
    total_count INT DEFAULT 0 COMMENT '总数量',
    processed_count INT DEFAULT 0 COMMENT '已处理数量',
    failed_count INT DEFAULT 0 COMMENT '失败数量',
    error_message TEXT COMMENT '错误信息',
    start_time DATETIME COMMENT '开始时间',
    end_time DATETIME COMMENT '结束时间',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    creator_id BIGINT COMMENT '创建者ID',
    INDEX idx_tenant_status (tenant_id, status),
    INDEX idx_create_time (create_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='索引任务表';

-- 搜索日志表（用于详细分析）
CREATE TABLE IF NOT EXISTS search_log (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    tenant_id BIGINT NOT NULL COMMENT '租户ID',
    user_id BIGINT COMMENT '用户ID',
    session_id VARCHAR(100) COMMENT '会话ID',
    keyword VARCHAR(200) COMMENT '搜索关键词',
    expanded_keywords TEXT COMMENT '扩展后的关键词',
    search_mode VARCHAR(20) COMMENT '搜索模式',
    search_types VARCHAR(200) COMMENT '搜索类型',
    filters TEXT COMMENT '过滤条件JSON',
    result_count INT DEFAULT 0 COMMENT '结果数量',
    response_time INT DEFAULT 0 COMMENT '响应时间（毫秒）',
    es_query TEXT COMMENT 'ES查询语句',
    client_ip VARCHAR(50) COMMENT '客户端IP',
    user_agent VARCHAR(500) COMMENT '用户代理',
    search_time DATETIME NOT NULL COMMENT '搜索时间',
    INDEX idx_tenant_time (tenant_id, search_time),
    INDEX idx_tenant_user (tenant_id, user_id),
    INDEX idx_search_time (search_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='搜索日志表';

-- 初始化默认配置
INSERT INTO search_config (tenant_id, config_key, config_value, config_type, description) VALUES
(0, 'default_page_size', '20', 'number', '默认每页大小'),
(0, 'max_page_size', '100', 'number', '最大每页大小'),
(0, 'highlight_pre_tag', '<em>', 'string', '高亮前缀标签'),
(0, 'highlight_post_tag', '</em>', 'string', '高亮后缀标签'),
(0, 'enable_synonym', 'true', 'boolean', '是否启用同义词'),
(0, 'enable_spell_check', 'true', 'boolean', '是否启用拼写检查'),
(0, 'min_keyword_length', '2', 'number', '最小关键词长度'),
(0, 'max_keyword_length', '100', 'number', '最大关键词长度'),
(0, 'history_retention_days', '90', 'number', '搜索历史保留天数'),
(0, 'hotword_refresh_interval', '3600', 'number', '热词刷新间隔（秒）');

-- 初始化常用同义词
INSERT INTO search_synonym (tenant_id, keyword, synonyms, synonym_type, weight) VALUES
(0, '项目', '工程,任务集,project', 'equivalent', 1.00),
(0, '任务', '工作,事项,待办,task', 'equivalent', 1.00),
(0, '文档', '文件,资料,document', 'equivalent', 1.00),
(0, '知识', '知识库,wiki,knowledge', 'equivalent', 1.00),
(0, '用户', '成员,人员,user', 'equivalent', 1.00),
(0, '搜索', '查找,检索,search', 'equivalent', 1.00);