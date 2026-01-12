-- AI模型配置表
CREATE TABLE IF NOT EXISTS ai_model_config (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    tenant_id BIGINT NOT NULL COMMENT '租户ID',
    provider VARCHAR(50) NOT NULL COMMENT '模型提供商: openai/anthropic/aliyun/baidu/local',
    model_name VARCHAR(100) NOT NULL COMMENT '模型名称: gpt-4/claude-3/qwen-max/ernie-bot-4',
    display_name VARCHAR(100) COMMENT '显示名称',
    description TEXT COMMENT '模型描述',
    api_endpoint VARCHAR(500) COMMENT 'API端点',
    api_key VARCHAR(500) COMMENT 'API密钥（加密存储）',
    model_type VARCHAR(50) NOT NULL DEFAULT 'chat' COMMENT '模型类型: chat/completion/embedding/image',
    max_tokens INT DEFAULT 4096 COMMENT '最大Token数',
    context_window INT DEFAULT 8192 COMMENT '上下文窗口大小',
    input_price DECIMAL(10, 6) DEFAULT 0 COMMENT '输入价格（每1K Token）',
    output_price DECIMAL(10, 6) DEFAULT 0 COMMENT '输出价格（每1K Token）',
    rpm_limit INT DEFAULT 60 COMMENT '每分钟请求限制',
    tpm_limit INT DEFAULT 100000 COMMENT '每分钟Token限制',
    priority INT DEFAULT 0 COMMENT '优先级（越大越优先）',
    weight INT DEFAULT 1 COMMENT '权重（用于负载均衡）',
    is_enabled TINYINT(1) DEFAULT 1 COMMENT '是否启用',
    is_default TINYINT(1) DEFAULT 0 COMMENT '是否默认模型',
    capabilities VARCHAR(500) COMMENT '模型能力（逗号分隔）: code/math/vision/function_call',
    fallback_model_id BIGINT COMMENT '降级模型ID',
    health_status VARCHAR(20) DEFAULT 'healthy' COMMENT '健康状态: healthy/degraded/unhealthy',
    last_health_check DATETIME COMMENT '最后健康检查时间',
    config_json JSON COMMENT '扩展配置（JSON格式）',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT(1) DEFAULT 0 COMMENT '是否删除',
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_provider (provider),
    INDEX idx_model_type (model_type),
    INDEX idx_health_status (health_status),
    INDEX idx_is_enabled (is_enabled)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI模型配置表';

-- AI使用统计表
CREATE TABLE IF NOT EXISTS ai_usage_stats (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    tenant_id BIGINT NOT NULL COMMENT '租户ID',
    model_config_id BIGINT COMMENT '模型配置ID',
    user_id BIGINT COMMENT '用户ID',
    stats_date DATE NOT NULL COMMENT '统计日期',
    request_count INT DEFAULT 0 COMMENT '请求次数',
    success_count INT DEFAULT 0 COMMENT '成功次数',
    failure_count INT DEFAULT 0 COMMENT '失败次数',
    total_input_tokens BIGINT DEFAULT 0 COMMENT '总输入Token数',
    total_output_tokens BIGINT DEFAULT 0 COMMENT '总输出Token数',
    total_cost DECIMAL(12, 4) DEFAULT 0 COMMENT '总费用',
    total_response_time INT DEFAULT 0 COMMENT '总响应时间（毫秒）',
    avg_response_time INT DEFAULT 0 COMMENT '平均响应时间（毫秒）',
    min_response_time INT DEFAULT 0 COMMENT '最小响应时间（毫秒）',
    max_response_time INT DEFAULT 0 COMMENT '最大响应时间（毫秒）',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY uk_tenant_model_user_date (tenant_id, model_config_id, user_id, stats_date),
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_model_config_id (model_config_id),
    INDEX idx_user_id (user_id),
    INDEX idx_stats_date (stats_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI使用统计表';

-- AI预算配置表
CREATE TABLE IF NOT EXISTS ai_budget_config (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    tenant_id BIGINT NOT NULL COMMENT '租户ID',
    budget_name VARCHAR(100) NOT NULL COMMENT '预算名称',
    budget_type VARCHAR(20) NOT NULL COMMENT '预算类型: daily/weekly/monthly/yearly',
    budget_amount DECIMAL(12, 2) NOT NULL COMMENT '预算金额',
    current_usage DECIMAL(12, 2) DEFAULT 0 COMMENT '当前使用量',
    alert_threshold DOUBLE DEFAULT 80 COMMENT '告警阈值（百分比）',
    alert_emails VARCHAR(500) COMMENT '告警邮箱（逗号分隔）',
    over_limit_policy VARCHAR(20) DEFAULT 'warn' COMMENT '超限策略: block/warn/allow',
    is_enabled TINYINT(1) DEFAULT 1 COMMENT '是否启用',
    period_start_date DATE COMMENT '周期开始日期',
    description TEXT COMMENT '预算描述',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT(1) DEFAULT 0 COMMENT '是否删除',
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_budget_type (budget_type),
    INDEX idx_is_enabled (is_enabled)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI预算配置表';

-- AI调用日志表（用于详细记录每次调用）
CREATE TABLE IF NOT EXISTS ai_call_log (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    tenant_id BIGINT NOT NULL COMMENT '租户ID',
    model_config_id BIGINT NOT NULL COMMENT '模型配置ID',
    user_id BIGINT COMMENT '用户ID',
    session_id VARCHAR(64) COMMENT '会话ID',
    request_id VARCHAR(64) COMMENT '请求ID',
    model_name VARCHAR(100) COMMENT '模型名称',
    input_tokens INT DEFAULT 0 COMMENT '输入Token数',
    output_tokens INT DEFAULT 0 COMMENT '输出Token数',
    cost DECIMAL(10, 6) DEFAULT 0 COMMENT '费用',
    response_time INT DEFAULT 0 COMMENT '响应时间（毫秒）',
    status VARCHAR(20) DEFAULT 'success' COMMENT '状态: success/failed/timeout',
    error_code VARCHAR(50) COMMENT '错误码',
    error_message TEXT COMMENT '错误信息',
    request_summary TEXT COMMENT '请求摘要',
    response_summary TEXT COMMENT '响应摘要',
    ip_address VARCHAR(50) COMMENT 'IP地址',
    user_agent VARCHAR(500) COMMENT 'User-Agent',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_model_config_id (model_config_id),
    INDEX idx_user_id (user_id),
    INDEX idx_session_id (session_id),
    INDEX idx_create_time (create_time),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI调用日志表';

-- 初始化默认模型配置
INSERT INTO ai_model_config (tenant_id, provider, model_name, display_name, description, model_type, max_tokens, context_window, input_price, output_price, priority, is_enabled, is_default, capabilities) VALUES
(0, 'openai', 'gpt-4', 'GPT-4', 'OpenAI GPT-4模型，最强大的通用模型', 'chat', 8192, 128000, 0.03, 0.06, 100, 1, 1, 'code,math,vision,function_call'),
(0, 'openai', 'gpt-3.5-turbo', 'GPT-3.5 Turbo', 'OpenAI GPT-3.5模型，性价比高', 'chat', 4096, 16385, 0.0005, 0.0015, 80, 1, 0, 'code,function_call'),
(0, 'anthropic', 'claude-3-opus', 'Claude 3 Opus', 'Anthropic Claude 3 Opus，最强推理能力', 'chat', 4096, 200000, 0.015, 0.075, 95, 1, 0, 'code,math,vision'),
(0, 'anthropic', 'claude-3-sonnet', 'Claude 3 Sonnet', 'Anthropic Claude 3 Sonnet，平衡性能', 'chat', 4096, 200000, 0.003, 0.015, 85, 1, 0, 'code,math,vision'),
(0, 'aliyun', 'qwen-max', '通义千问Max', '阿里云通义千问Max模型', 'chat', 8192, 32000, 0.02, 0.06, 70, 1, 0, 'code,math'),
(0, 'aliyun', 'qwen-plus', '通义千问Plus', '阿里云通义千问Plus模型', 'chat', 8192, 32000, 0.004, 0.012, 60, 1, 0, 'code'),
(0, 'baidu', 'ernie-bot-4', '文心一言4.0', '百度文心一言4.0模型', 'chat', 4096, 8192, 0.12, 0.12, 65, 1, 0, 'code,math'),
(0, 'openai', 'text-embedding-3-large', 'Embedding Large', 'OpenAI文本嵌入模型', 'embedding', 8191, 8191, 0.00013, 0, 50, 1, 0, 'embedding');

-- 初始化默认预算配置
INSERT INTO ai_budget_config (tenant_id, budget_name, budget_type, budget_amount, alert_threshold, over_limit_policy, is_enabled, period_start_date, description) VALUES
(0, '日预算', 'daily', 100.00, 80, 'warn', 1, CURDATE(), '每日AI使用预算'),
(0, '月预算', 'monthly', 2000.00, 80, 'warn', 1, DATE_FORMAT(CURDATE(), '%Y-%m-01'), '每月AI使用预算');