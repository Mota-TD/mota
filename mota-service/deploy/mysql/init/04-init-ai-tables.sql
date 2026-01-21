-- =====================================================
-- AI服务数据库表初始化脚本
-- 包含多租户支持 (tenant_id)
-- =====================================================
USE mota_ai;

-- AI新闻表
CREATE TABLE IF NOT EXISTS ai_news (
    id VARCHAR(64) PRIMARY KEY COMMENT '主键ID',
    tenant_id BIGINT NOT NULL DEFAULT 0 COMMENT '租户ID',
    title VARCHAR(500) NOT NULL COMMENT '标题',
    summary TEXT COMMENT '摘要',
    content LONGTEXT COMMENT '内容',
    source VARCHAR(100) COMMENT '来源',
    source_icon VARCHAR(100) COMMENT '来源图标',
    publish_time VARCHAR(50) COMMENT '发布时间',
    category VARCHAR(50) COMMENT '分类',
    tags JSON COMMENT '标签',
    url VARCHAR(1000) COMMENT '链接',
    is_starred INT DEFAULT 0 COMMENT '是否收藏',
    relevance INT DEFAULT 0 COMMENT '相关度',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted INT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_category (category),
    INDEX idx_is_starred (is_starred),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI新闻表';

-- AI对话会话表
CREATE TABLE IF NOT EXISTS ai_chat_session (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '会话ID',
    tenant_id BIGINT NOT NULL DEFAULT 0 COMMENT '租户ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    enterprise_id BIGINT COMMENT '企业ID',
    title VARCHAR(200) COMMENT '会话标题',
    model VARCHAR(50) DEFAULT 'gpt-4' COMMENT 'AI模型',
    context_type VARCHAR(50) COMMENT '上下文类型',
    context_id BIGINT COMMENT '上下文ID',
    status TINYINT DEFAULT 1 COMMENT '状态',
    total_tokens INT DEFAULT 0 COMMENT '总Token数',
    message_count INT DEFAULT 0 COMMENT '消息数量',
    is_pinned BOOLEAN DEFAULT FALSE COMMENT '是否置顶',
    is_archived BOOLEAN DEFAULT FALSE COMMENT '是否归档',
    last_message_at DATETIME COMMENT '最后消息时间',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted TINYINT DEFAULT 0 COMMENT '是否删除',
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_user_id (user_id),
    INDEX idx_enterprise_id (enterprise_id),
    INDEX idx_context (context_type, context_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI对话会话表';

-- AI对话消息表
CREATE TABLE IF NOT EXISTS ai_chat_message (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '消息ID',
    tenant_id BIGINT NOT NULL DEFAULT 0 COMMENT '租户ID',
    session_id BIGINT NOT NULL COMMENT '会话ID',
    role VARCHAR(20) NOT NULL COMMENT '角色',
    content TEXT NOT NULL COMMENT '消息内容',
    content_type VARCHAR(50) DEFAULT 'text' COMMENT '内容类型',
    intent_type VARCHAR(50) COMMENT '意图类型',
    intent_confidence DECIMAL(5,4) COMMENT '意图置信度',
    tokens INT DEFAULT 0 COMMENT 'Token数量',
    tokens_used INT DEFAULT 0 COMMENT '使用的Token数',
    response_time_ms INT COMMENT '响应时间',
    is_error BOOLEAN DEFAULT FALSE COMMENT '是否错误',
    error_message VARCHAR(500) COMMENT '错误信息',
    feedback_rating INT COMMENT '反馈评分',
    feedback_comment VARCHAR(500) COMMENT '反馈评论',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_session_id (session_id),
    INDEX idx_role (role),
    INDEX idx_intent_type (intent_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI对话消息表';

-- AI模型配置表 (与 AIModelConfig 实体类匹配)
CREATE TABLE IF NOT EXISTS ai_model_config (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    tenant_id BIGINT NOT NULL DEFAULT 0 COMMENT '租户ID',
    provider VARCHAR(50) NOT NULL COMMENT '模型提供商: openai/anthropic/aliyun/baidu/local',
    model_name VARCHAR(100) NOT NULL COMMENT '模型名称',
    display_name VARCHAR(100) COMMENT '显示名称',
    description TEXT COMMENT '模型描述',
    api_endpoint VARCHAR(500) COMMENT 'API端点',
    api_key VARCHAR(500) COMMENT 'API密钥（加密存储）',
    api_key_id VARCHAR(100) COMMENT 'API密钥ID（用于多密钥轮换）',
    model_type VARCHAR(50) COMMENT '模型类型: chat/completion/embedding/image',
    max_tokens INT COMMENT '最大Token数',
    context_window INT COMMENT '上下文窗口大小',
    input_price DECIMAL(10,6) COMMENT '输入价格（每1K tokens）',
    output_price DECIMAL(10,6) COMMENT '输出价格（每1K tokens）',
    rpm_limit INT COMMENT '每分钟请求限制',
    tpm_limit INT COMMENT '每分钟Token限制',
    priority INT DEFAULT 0 COMMENT '优先级（用于路由选择）',
    weight INT DEFAULT 1 COMMENT '权重（用于负载均衡）',
    is_enabled TINYINT(1) DEFAULT 1 COMMENT '是否启用',
    is_default TINYINT(1) DEFAULT 0 COMMENT '是否为默认模型',
    capabilities VARCHAR(500) COMMENT '支持的功能: chat,completion,embedding,function_calling,vision',
    parameters JSON COMMENT '模型参数配置',
    fallback_model_id BIGINT COMMENT '降级模型ID',
    health_status VARCHAR(20) DEFAULT 'healthy' COMMENT '健康状态: healthy/degraded/unhealthy',
    last_health_check DATETIME COMMENT '最后健康检查时间',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted TINYINT(1) DEFAULT 0 COMMENT '是否删除',
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_provider (provider),
    INDEX idx_model_type (model_type),
    INDEX idx_is_enabled (is_enabled),
    INDEX idx_is_default (is_default)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI模型配置表';

-- AI使用统计表
CREATE TABLE IF NOT EXISTS ai_usage_stats (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    tenant_id BIGINT NOT NULL DEFAULT 0 COMMENT '租户ID',
    stat_date DATE NOT NULL COMMENT '统计日期',
    stats_date DATE NOT NULL COMMENT '统计日期',
    team_id BIGINT COMMENT '团队ID',
    user_id BIGINT COMMENT '用户ID',
    model_type VARCHAR(50) NOT NULL COMMENT '模型类型',
    feature_type VARCHAR(50) NOT NULL COMMENT '功能类型',
    model_name VARCHAR(100) COMMENT '模型名称',
    request_count INT DEFAULT 0 COMMENT '请求次数',
    success_count INT DEFAULT 0 COMMENT '成功次数',
    failed_count INT DEFAULT 0 COMMENT '失败次数',
    error_count INT DEFAULT 0 COMMENT '错误次数',
    total_tokens INT DEFAULT 0 COMMENT '总Token数',
    tokens_used INT DEFAULT 0 COMMENT '使用Token数',
    input_tokens INT DEFAULT 0 COMMENT '输入Token数',
    output_tokens INT DEFAULT 0 COMMENT '输出Token数',
    total_cost DECIMAL(10,4) DEFAULT 0 COMMENT '总成本',
    avg_latency INT DEFAULT 0 COMMENT '平均延迟',
    avg_response_time_ms INT COMMENT '平均响应时间',
    feedback_positive INT DEFAULT 0 COMMENT '正面反馈数',
    feedback_negative INT DEFAULT 0 COMMENT '负面反馈数',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_stat_date (stat_date),
    INDEX idx_stats_date (stats_date),
    INDEX idx_team_id (team_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI使用统计表';

-- AI预算配置表
CREATE TABLE IF NOT EXISTS ai_budget_config (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tenant_id BIGINT NOT NULL DEFAULT 0 COMMENT '租户ID',
    budget_type VARCHAR(20) NOT NULL COMMENT '预算类型: daily/weekly/monthly/yearly',
    budget_amount DECIMAL(12,2) DEFAULT 0 COMMENT '预算金额',
    used_amount DECIMAL(12,2) DEFAULT 0 COMMENT '已使用金额',
    current_usage DECIMAL(12,2) DEFAULT 0 COMMENT '当前使用量',
    token_budget BIGINT DEFAULT 0 COMMENT 'Token预算',
    used_tokens BIGINT DEFAULT 0 COMMENT '已使用Token',
    request_budget INT DEFAULT 0 COMMENT '请求次数预算',
    used_requests INT DEFAULT 0 COMMENT '已使用请求次数',
    alert_threshold INT DEFAULT 80 COMMENT '预警阈值',
    alert_enabled TINYINT(1) DEFAULT 1 COMMENT '是否启用预警',
    over_limit_policy VARCHAR(20) DEFAULT 'warn' COMMENT '超限策略',
    period_start DATETIME COMMENT '周期开始时间',
    period_start_date DATE COMMENT '周期开始日期',
    period_end DATETIME COMMENT '周期结束时间',
    is_enabled TINYINT(1) DEFAULT 1 COMMENT '是否启用',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted TINYINT(1) DEFAULT 0 COMMENT '是否删除',
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_budget_type (budget_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI预算配置表';

-- AI方案表
CREATE TABLE IF NOT EXISTS ai_proposal (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tenant_id BIGINT NOT NULL DEFAULT 0 COMMENT '租户ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    enterprise_id BIGINT COMMENT '企业ID',
    project_id BIGINT COMMENT '项目ID',
    title VARCHAR(200) NOT NULL COMMENT '方案标题',
    description TEXT COMMENT '方案描述',
    content LONGTEXT COMMENT '方案内容',
    type VARCHAR(50) COMMENT '方案类型',
    status VARCHAR(20) DEFAULT 'draft' COMMENT '状态',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted INT DEFAULT 0 COMMENT '是否删除',
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_user_id (user_id),
    INDEX idx_enterprise_id (enterprise_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI方案表';

-- AI训练配置表
CREATE TABLE IF NOT EXISTS ai_training_config (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tenant_id BIGINT NOT NULL DEFAULT 0 COMMENT '租户ID',
    enterprise_id BIGINT COMMENT '企业ID',
    config_type VARCHAR(50) NOT NULL COMMENT '配置类型',
    config_key VARCHAR(100) NOT NULL COMMENT '配置键',
    config_value TEXT COMMENT '配置值',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_enterprise_id (enterprise_id),
    INDEX idx_config_type (config_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI训练配置表';

-- AI训练文档表
CREATE TABLE IF NOT EXISTS ai_training_document (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tenant_id BIGINT NOT NULL DEFAULT 0 COMMENT '租户ID',
    enterprise_id BIGINT COMMENT '企业ID',
    name VARCHAR(200) NOT NULL COMMENT '文档名称',
    file_size BIGINT DEFAULT 0 COMMENT '文件大小',
    size VARCHAR(50) COMMENT '格式化大小',
    file_path VARCHAR(500) COMMENT '文件路径',
    file_type VARCHAR(50) COMMENT '文件类型',
    status VARCHAR(20) DEFAULT 'pending' COMMENT '状态',
    upload_user_id BIGINT COMMENT '上传用户ID',
    upload_time DATETIME COMMENT '上传时间',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_enterprise_id (enterprise_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI训练文档表';

-- AI训练历史表
CREATE TABLE IF NOT EXISTS ai_training_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tenant_id BIGINT NOT NULL DEFAULT 0 COMMENT '租户ID',
    enterprise_id BIGINT COMMENT '企业ID',
    version VARCHAR(50) COMMENT '模型版本',
    date DATETIME COMMENT '训练日期',
    documents INT DEFAULT 0 COMMENT '训练文档数量',
    status VARCHAR(20) DEFAULT 'training' COMMENT '状态',
    accuracy DECIMAL(5,2) COMMENT '准确率',
    task_id VARCHAR(100) COMMENT '任务ID',
    progress INT DEFAULT 0 COMMENT '训练进度',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_enterprise_id (enterprise_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI训练历史表';

-- 新闻数据源表
CREATE TABLE IF NOT EXISTS news_data_source (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    tenant_id BIGINT NOT NULL DEFAULT 0 COMMENT '租户ID',
    source_name VARCHAR(100) NOT NULL COMMENT '数据源名称',
    source_type VARCHAR(50) NOT NULL COMMENT '数据源类型',
    source_url VARCHAR(500) COMMENT '数据源URL',
    api_endpoint VARCHAR(500) COMMENT 'API端点',
    api_key_encrypted VARCHAR(500) COMMENT '加密的API密钥',
    crawl_config JSON COMMENT '爬虫配置',
    category VARCHAR(50) COMMENT '新闻分类',
    language VARCHAR(20) DEFAULT 'zh' COMMENT '语言',
    country VARCHAR(20) DEFAULT 'CN' COMMENT '国家/地区',
    update_frequency INT DEFAULT 60 COMMENT '更新频率',
    last_crawl_at DATETIME COMMENT '上次采集时间',
    next_crawl_at DATETIME COMMENT '下次采集时间',
    is_enabled TINYINT(1) DEFAULT 1 COMMENT '是否启用',
    priority INT DEFAULT 5 COMMENT '优先级',
    reliability_score DECIMAL(5,2) DEFAULT 80 COMMENT '可靠性评分',
    total_articles INT DEFAULT 0 COMMENT '总文章数',
    last_crawl_status VARCHAR(20) COMMENT '上次采集状态',
    last_error_message TEXT COMMENT '上次错误信息',
    creator_id BIGINT NOT NULL COMMENT '创建者ID',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_source_type (source_type),
    INDEX idx_category (category),
    INDEX idx_is_enabled (is_enabled)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='新闻数据源表';

-- 新闻文章表
CREATE TABLE IF NOT EXISTS news_article (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    tenant_id BIGINT NOT NULL DEFAULT 0 COMMENT '租户ID',
    source_id BIGINT COMMENT '数据源ID',
    external_id VARCHAR(200) COMMENT '外部ID',
    title VARCHAR(500) NOT NULL COMMENT '新闻标题',
    content LONGTEXT COMMENT '新闻内容',
    summary TEXT COMMENT '新闻摘要',
    author VARCHAR(100) COMMENT '作者',
    source_name VARCHAR(100) COMMENT '来源名称',
    source_url VARCHAR(1000) COMMENT '原文链接',
    image_url VARCHAR(1000) COMMENT '封面图片',
    images JSON COMMENT '图片列表',
    category VARCHAR(50) COMMENT '分类',
    tags JSON COMMENT '标签',
    keywords JSON COMMENT '关键词',
    entities JSON COMMENT '实体',
    publish_time DATETIME COMMENT '发布时间',
    crawl_time DATETIME COMMENT '采集时间',
    language VARCHAR(20) DEFAULT 'zh' COMMENT '语言',
    word_count INT DEFAULT 0 COMMENT '字数',
    read_time INT DEFAULT 0 COMMENT '预计阅读时间',
    sentiment VARCHAR(20) COMMENT '情感倾向',
    sentiment_score DECIMAL(5,2) COMMENT '情感分数',
    importance_score DECIMAL(5,2) COMMENT '重要性评分',
    quality_score DECIMAL(5,2) COMMENT '质量评分',
    is_policy TINYINT(1) DEFAULT 0 COMMENT '是否政策文件',
    policy_level VARCHAR(50) COMMENT '政策级别',
    policy_type VARCHAR(50) COMMENT '政策类型',
    view_count INT DEFAULT 0 COMMENT '浏览次数',
    share_count INT DEFAULT 0 COMMENT '分享次数',
    favorite_count INT DEFAULT 0 COMMENT '收藏次数',
    status VARCHAR(20) DEFAULT 'active' COMMENT '状态',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_source_id (source_id),
    INDEX idx_category (category),
    INDEX idx_publish_time (publish_time),
    INDEX idx_is_policy (is_policy),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='新闻文章表';

-- 新闻收藏表
CREATE TABLE IF NOT EXISTS news_favorite (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    tenant_id BIGINT NOT NULL DEFAULT 0 COMMENT '租户ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    article_id BIGINT NOT NULL COMMENT '文章ID',
    folder_id BIGINT COMMENT '收藏夹ID',
    note TEXT COMMENT '备注',
    tags JSON COMMENT '自定义标签',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_tenant_id (tenant_id),
    UNIQUE INDEX uk_user_article (user_id, article_id),
    INDEX idx_folder_id (folder_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='新闻收藏表';

SELECT 'AI服务数据库表初始化完成!' AS message;