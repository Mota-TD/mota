-- V14.0 多模型支持数据库脚本

-- 1. AI模型提供商表
CREATE TABLE IF NOT EXISTS ai_model_provider (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    provider_code VARCHAR(50) NOT NULL COMMENT '提供商代码',
    provider_name VARCHAR(100) NOT NULL COMMENT '提供商名称',
    provider_type VARCHAR(50) NOT NULL COMMENT '类型(international/domestic)',
    api_base_url VARCHAR(500) COMMENT 'API基础URL',
    auth_type VARCHAR(50) DEFAULT 'api_key' COMMENT '认证类型',
    api_key_encrypted VARCHAR(500) COMMENT '加密API密钥',
    secret_key_encrypted VARCHAR(500) COMMENT '加密密钥',
    is_enabled BOOLEAN DEFAULT TRUE,
    priority INT DEFAULT 0,
    rate_limit_rpm INT DEFAULT 60,
    timeout_seconds INT DEFAULT 60,
    retry_count INT DEFAULT 3,
    health_status VARCHAR(20) DEFAULT 'unknown',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_code (provider_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. AI模型配置表
CREATE TABLE IF NOT EXISTS ai_model_config (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    provider_id BIGINT NOT NULL,
    model_code VARCHAR(100) NOT NULL,
    model_name VARCHAR(200) NOT NULL,
    model_type VARCHAR(50) NOT NULL COMMENT 'chat/embedding/image',
    max_tokens INT DEFAULT 4096,
    context_window INT DEFAULT 4096,
    input_price DECIMAL(10,6) DEFAULT 0,
    output_price DECIMAL(10,6) DEFAULT 0,
    currency VARCHAR(10) DEFAULT 'USD',
    supports_streaming BOOLEAN DEFAULT TRUE,
    supports_function_call BOOLEAN DEFAULT FALSE,
    supports_vision BOOLEAN DEFAULT FALSE,
    is_enabled BOOLEAN DEFAULT TRUE,
    is_default BOOLEAN DEFAULT FALSE,
    priority INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_model (provider_id, model_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. 模型路由规则表
CREATE TABLE IF NOT EXISTS ai_model_routing_rule (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    rule_name VARCHAR(100) NOT NULL,
    rule_type VARCHAR(50) NOT NULL,
    priority INT DEFAULT 0,
    conditions JSON,
    target_model_id BIGINT,
    weight INT DEFAULT 100,
    is_enabled BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. 模型降级策略表
CREATE TABLE IF NOT EXISTS ai_model_fallback (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    strategy_name VARCHAR(100) NOT NULL,
    primary_model_id BIGINT NOT NULL,
    fallback_model_ids JSON NOT NULL,
    max_retries INT DEFAULT 3,
    retry_delay_ms INT DEFAULT 1000,
    circuit_breaker_enabled BOOLEAN DEFAULT TRUE,
    circuit_breaker_threshold INT DEFAULT 5,
    is_enabled BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. AI成本预算表
CREATE TABLE IF NOT EXISTS ai_cost_budget (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    budget_type VARCHAR(50) NOT NULL,
    budget_scope_id BIGINT,
    budget_period VARCHAR(20) NOT NULL,
    budget_amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'CNY',
    alert_threshold INT DEFAULT 80,
    hard_limit BOOLEAN DEFAULT FALSE,
    current_usage DECIMAL(12,2) DEFAULT 0,
    period_start DATE,
    period_end DATE,
    is_enabled BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. AI调用记录表
CREATE TABLE IF NOT EXISTS ai_call_log (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    provider_id BIGINT NOT NULL,
    model_id BIGINT NOT NULL,
    model_code VARCHAR(100) NOT NULL,
    call_type VARCHAR(50) NOT NULL,
    input_tokens INT DEFAULT 0,
    output_tokens INT DEFAULT 0,
    total_cost DECIMAL(10,6) DEFAULT 0,
    response_time_ms INT,
    status VARCHAR(20) NOT NULL,
    error_code VARCHAR(50),
    is_fallback BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    KEY idx_user (user_id),
    KEY idx_model (model_id),
    KEY idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. 成本统计表
CREATE TABLE IF NOT EXISTS ai_cost_stats (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    stats_date DATE NOT NULL,
    stats_type VARCHAR(50) NOT NULL,
    scope_id BIGINT,
    provider_id BIGINT,
    model_id BIGINT,
    call_count INT DEFAULT 0,
    total_tokens INT DEFAULT 0,
    total_cost DECIMAL(12,4) DEFAULT 0,
    avg_response_time INT DEFAULT 0,
    success_rate DECIMAL(5,2) DEFAULT 100,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_stats (stats_date, stats_type, scope_id, provider_id, model_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. 熔断器状态表
CREATE TABLE IF NOT EXISTS ai_circuit_breaker (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    model_id BIGINT NOT NULL,
    state VARCHAR(20) NOT NULL DEFAULT 'closed',
    failure_count INT DEFAULT 0,
    last_failure_time DATETIME,
    open_time DATETIME,
    half_open_time DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_model (model_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 插入默认提供商数据
INSERT INTO ai_model_provider (provider_code, provider_name, provider_type, api_base_url, is_enabled, priority) VALUES
('openai', 'OpenAI', 'international', 'https://api.openai.com/v1', TRUE, 100),
('anthropic', 'Anthropic', 'international', 'https://api.anthropic.com/v1', TRUE, 90),
('aliyun', '阿里云通义千问', 'domestic', 'https://dashscope.aliyuncs.com/api/v1', TRUE, 80),
('baidu', '百度文心一言', 'domestic', 'https://aip.baidubce.com', TRUE, 70);

-- 插入默认模型配置
INSERT INTO ai_model_config (provider_id, model_code, model_name, model_type, max_tokens, context_window, input_price, output_price, supports_streaming, supports_function_call, supports_vision, is_enabled, is_default, priority) VALUES
(1, 'gpt-4', 'GPT-4', 'chat', 8192, 8192, 0.03, 0.06, TRUE, TRUE, FALSE, TRUE, FALSE, 100),
(1, 'gpt-4-turbo', 'GPT-4 Turbo', 'chat', 128000, 128000, 0.01, 0.03, TRUE, TRUE, TRUE, TRUE, FALSE, 95),
(1, 'gpt-3.5-turbo', 'GPT-3.5 Turbo', 'chat', 16385, 16385, 0.0005, 0.0015, TRUE, TRUE, FALSE, TRUE, TRUE, 90),
(2, 'claude-3-opus', 'Claude 3 Opus', 'chat', 200000, 200000, 0.015, 0.075, TRUE, TRUE, TRUE, TRUE, FALSE, 85),
(2, 'claude-3-sonnet', 'Claude 3 Sonnet', 'chat', 200000, 200000, 0.003, 0.015, TRUE, TRUE, TRUE, TRUE, FALSE, 80),
(3, 'qwen-turbo', '通义千问-Turbo', 'chat', 8000, 8000, 0.008, 0.008, TRUE, FALSE, FALSE, TRUE, FALSE, 75),
(3, 'qwen-plus', '通义千问-Plus', 'chat', 32000, 32000, 0.02, 0.02, TRUE, TRUE, FALSE, TRUE, FALSE, 70),
(4, 'ernie-bot-4', '文心一言4.0', 'chat', 8000, 8000, 0.12, 0.12, TRUE, TRUE, FALSE, TRUE, FALSE, 65),
(4, 'ernie-bot-turbo', '文心一言Turbo', 'chat', 8000, 8000, 0.008, 0.008, TRUE, FALSE, FALSE, TRUE, FALSE, 60);

-- 插入默认路由规则
INSERT INTO ai_model_routing_rule (rule_name, rule_type, priority, conditions, target_model_id, weight, is_enabled) VALUES
('默认路由', 'default', 0, '{}', 3, 100, TRUE),
('高级用户路由', 'user_level', 10, '{"user_level": "premium"}', 1, 100, TRUE),
('成本优先路由', 'cost', 5, '{"max_cost_per_call": 0.01}', 3, 100, TRUE);

-- 插入默认降级策略
INSERT INTO ai_model_fallback (strategy_name, primary_model_id, fallback_model_ids, max_retries, is_enabled) VALUES
('GPT-4降级策略', 1, '[2, 3]', 3, TRUE),
('Claude降级策略', 4, '[5, 3]', 3, TRUE),
('国内模型降级策略', 6, '[7, 8, 9]', 3, TRUE);

-- 插入默认预算
INSERT INTO ai_cost_budget (budget_type, budget_period, budget_amount, currency, alert_threshold, is_enabled) VALUES
('global', 'monthly', 10000.00, 'CNY', 80, TRUE);