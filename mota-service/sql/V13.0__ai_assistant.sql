-- AI助手模块数据库脚本
-- 版本: V13.0
-- 功能: AA-001到AA-008

-- 1. AI对话会话表
CREATE TABLE IF NOT EXISTS ai_chat_session (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '会话ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    session_type VARCHAR(50) NOT NULL DEFAULT 'general' COMMENT '会话类型: general/task/document/schedule/report',
    title VARCHAR(200) COMMENT '会话标题',
    context_type VARCHAR(50) COMMENT '上下文类型: project/task/document',
    context_id BIGINT COMMENT '上下文ID',
    model_name VARCHAR(100) DEFAULT 'gpt-3.5-turbo' COMMENT '使用的模型',
    total_tokens INT DEFAULT 0 COMMENT '总Token数',
    message_count INT DEFAULT 0 COMMENT '消息数量',
    is_pinned BOOLEAN DEFAULT FALSE COMMENT '是否置顶',
    is_archived BOOLEAN DEFAULT FALSE COMMENT '是否归档',
    last_message_at DATETIME COMMENT '最后消息时间',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_user_id (user_id),
    INDEX idx_session_type (session_type),
    INDEX idx_context (context_type, context_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI对话会话表';

-- 2. AI对话消息表
CREATE TABLE IF NOT EXISTS ai_chat_message (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '消息ID',
    session_id BIGINT NOT NULL COMMENT '会话ID',
    role VARCHAR(20) NOT NULL COMMENT '角色: user/assistant/system',
    content TEXT NOT NULL COMMENT '消息内容',
    content_type VARCHAR(50) DEFAULT 'text' COMMENT '内容类型: text/markdown/code/image',
    intent_type VARCHAR(50) COMMENT '意图类型',
    intent_confidence DECIMAL(5,4) COMMENT '意图置信度',
    tokens_used INT DEFAULT 0 COMMENT '使用的Token数',
    response_time_ms INT COMMENT '响应时间(毫秒)',
    is_error BOOLEAN DEFAULT FALSE COMMENT '是否错误',
    error_message VARCHAR(500) COMMENT '错误信息',
    feedback_rating INT COMMENT '反馈评分: 1-5',
    feedback_comment VARCHAR(500) COMMENT '反馈评论',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_session_id (session_id),
    INDEX idx_role (role),
    INDEX idx_intent_type (intent_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI对话消息表';

-- 3. 任务指令表 (AA-002)
CREATE TABLE IF NOT EXISTS ai_task_command (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '指令ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    session_id BIGINT COMMENT '关联会话ID',
    command_text TEXT NOT NULL COMMENT '原始指令文本',
    command_type VARCHAR(50) NOT NULL COMMENT '指令类型: create/update/delete/query/assign/complete',
    target_type VARCHAR(50) NOT NULL COMMENT '目标类型: task/subtask/project/milestone',
    target_id BIGINT COMMENT '目标ID',
    parsed_params JSON COMMENT '解析后的参数',
    execution_status VARCHAR(20) DEFAULT 'pending' COMMENT '执行状态: pending/executing/success/failed',
    execution_result JSON COMMENT '执行结果',
    error_message VARCHAR(500) COMMENT '错误信息',
    confidence_score DECIMAL(5,4) COMMENT '置信度',
    requires_confirmation BOOLEAN DEFAULT FALSE COMMENT '是否需要确认',
    confirmed_at DATETIME COMMENT '确认时间',
    executed_at DATETIME COMMENT '执行时间',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_user_id (user_id),
    INDEX idx_command_type (command_type),
    INDEX idx_execution_status (execution_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='任务指令表';

-- 4. 工作建议表 (AA-003)
CREATE TABLE IF NOT EXISTS ai_work_suggestion (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '建议ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    suggestion_type VARCHAR(50) NOT NULL COMMENT '建议类型: priority/deadline/resource/collaboration/efficiency',
    suggestion_title VARCHAR(200) NOT NULL COMMENT '建议标题',
    suggestion_content TEXT NOT NULL COMMENT '建议内容',
    suggestion_reason TEXT COMMENT '建议原因',
    related_type VARCHAR(50) COMMENT '关联类型: task/project/schedule',
    related_id BIGINT COMMENT '关联ID',
    priority_level INT DEFAULT 3 COMMENT '优先级: 1-5',
    impact_score DECIMAL(5,2) COMMENT '影响评分',
    action_items JSON COMMENT '行动项列表',
    is_read BOOLEAN DEFAULT FALSE COMMENT '是否已读',
    is_accepted BOOLEAN COMMENT '是否采纳',
    is_dismissed BOOLEAN DEFAULT FALSE COMMENT '是否忽略',
    feedback_comment VARCHAR(500) COMMENT '反馈评论',
    valid_until DATETIME COMMENT '有效期至',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_user_id (user_id),
    INDEX idx_suggestion_type (suggestion_type),
    INDEX idx_is_read (is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工作建议表';

-- 5. 文档摘要表 (AA-004)
CREATE TABLE IF NOT EXISTS ai_document_summary (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '摘要ID',
    document_id BIGINT NOT NULL COMMENT '文档ID',
    user_id BIGINT NOT NULL COMMENT '请求用户ID',
    summary_type VARCHAR(50) NOT NULL DEFAULT 'brief' COMMENT '摘要类型: brief/detailed/bullet/executive',
    summary_content TEXT NOT NULL COMMENT '摘要内容',
    key_points JSON COMMENT '关键要点',
    word_count INT COMMENT '原文字数',
    summary_word_count INT COMMENT '摘要字数',
    compression_ratio DECIMAL(5,2) COMMENT '压缩比',
    language VARCHAR(20) DEFAULT 'zh' COMMENT '语言',
    model_used VARCHAR(100) COMMENT '使用的模型',
    tokens_used INT COMMENT '使用的Token数',
    generation_time_ms INT COMMENT '生成时间(毫秒)',
    quality_score DECIMAL(5,2) COMMENT '质量评分',
    feedback_rating INT COMMENT '用户评分',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_document_id (document_id),
    INDEX idx_user_id (user_id),
    INDEX idx_summary_type (summary_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='文档摘要表';

-- 6. 翻译记录表 (AA-005)
CREATE TABLE IF NOT EXISTS ai_translation (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '翻译ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    source_type VARCHAR(50) NOT NULL COMMENT '来源类型: text/document/message',
    source_id BIGINT COMMENT '来源ID',
    source_language VARCHAR(20) NOT NULL COMMENT '源语言',
    target_language VARCHAR(20) NOT NULL COMMENT '目标语言',
    source_text TEXT NOT NULL COMMENT '原文',
    translated_text TEXT NOT NULL COMMENT '译文',
    word_count INT COMMENT '字数',
    translation_engine VARCHAR(50) DEFAULT 'ai' COMMENT '翻译引擎: ai/google/deepl',
    model_used VARCHAR(100) COMMENT '使用的模型',
    tokens_used INT COMMENT '使用的Token数',
    translation_time_ms INT COMMENT '翻译时间(毫秒)',
    quality_score DECIMAL(5,2) COMMENT '质量评分',
    is_reviewed BOOLEAN DEFAULT FALSE COMMENT '是否已审核',
    reviewed_text TEXT COMMENT '审核后文本',
    feedback_rating INT COMMENT '用户评分',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_user_id (user_id),
    INDEX idx_source_type (source_type, source_id),
    INDEX idx_languages (source_language, target_language)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='翻译记录表';

-- 7. 数据分析建议表 (AA-006)
CREATE TABLE IF NOT EXISTS ai_data_analysis (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '分析ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    analysis_type VARCHAR(50) NOT NULL COMMENT '分析类型: project/task/team/resource/trend',
    analysis_scope VARCHAR(50) NOT NULL COMMENT '分析范围: personal/team/project/organization',
    scope_id BIGINT COMMENT '范围ID',
    time_range VARCHAR(50) COMMENT '时间范围: week/month/quarter/year',
    start_date DATE COMMENT '开始日期',
    end_date DATE COMMENT '结束日期',
    analysis_title VARCHAR(200) NOT NULL COMMENT '分析标题',
    analysis_content TEXT NOT NULL COMMENT '分析内容',
    key_findings JSON COMMENT '关键发现',
    metrics JSON COMMENT '指标数据',
    charts JSON COMMENT '图表配置',
    recommendations JSON COMMENT '建议列表',
    data_sources JSON COMMENT '数据来源',
    model_used VARCHAR(100) COMMENT '使用的模型',
    tokens_used INT COMMENT '使用的Token数',
    generation_time_ms INT COMMENT '生成时间(毫秒)',
    is_saved BOOLEAN DEFAULT FALSE COMMENT '是否保存',
    feedback_rating INT COMMENT '用户评分',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_user_id (user_id),
    INDEX idx_analysis_type (analysis_type),
    INDEX idx_analysis_scope (analysis_scope, scope_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='数据分析建议表';

-- 8. 日程建议表 (AA-007)
CREATE TABLE IF NOT EXISTS ai_schedule_suggestion (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '建议ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    suggestion_type VARCHAR(50) NOT NULL COMMENT '建议类型: optimize/conflict/reminder/focus/break',
    suggestion_date DATE NOT NULL COMMENT '建议日期',
    suggestion_title VARCHAR(200) NOT NULL COMMENT '建议标题',
    suggestion_content TEXT NOT NULL COMMENT '建议内容',
    current_schedule JSON COMMENT '当前日程',
    suggested_schedule JSON COMMENT '建议日程',
    affected_events JSON COMMENT '受影响的事件',
    optimization_score DECIMAL(5,2) COMMENT '优化评分',
    time_saved_minutes INT COMMENT '节省时间(分钟)',
    priority_level INT DEFAULT 3 COMMENT '优先级: 1-5',
    is_read BOOLEAN DEFAULT FALSE COMMENT '是否已读',
    is_applied BOOLEAN COMMENT '是否应用',
    is_dismissed BOOLEAN DEFAULT FALSE COMMENT '是否忽略',
    feedback_comment VARCHAR(500) COMMENT '反馈评论',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_user_id (user_id),
    INDEX idx_suggestion_type (suggestion_type),
    INDEX idx_suggestion_date (suggestion_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='日程建议表';

-- 9. 工作报告表 (AA-008)
CREATE TABLE IF NOT EXISTS ai_work_report (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '报告ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    report_type VARCHAR(50) NOT NULL COMMENT '报告类型: daily/weekly/monthly/project/custom',
    report_scope VARCHAR(50) NOT NULL COMMENT '报告范围: personal/team/project',
    scope_id BIGINT COMMENT '范围ID',
    report_title VARCHAR(200) NOT NULL COMMENT '报告标题',
    report_period_start DATE COMMENT '报告周期开始',
    report_period_end DATE COMMENT '报告周期结束',
    report_content TEXT NOT NULL COMMENT '报告内容',
    summary TEXT COMMENT '摘要',
    accomplishments JSON COMMENT '完成事项',
    in_progress JSON COMMENT '进行中事项',
    blockers JSON COMMENT '阻塞问题',
    next_steps JSON COMMENT '下一步计划',
    metrics JSON COMMENT '指标数据',
    charts JSON COMMENT '图表配置',
    attachments JSON COMMENT '附件列表',
    model_used VARCHAR(100) COMMENT '使用的模型',
    tokens_used INT COMMENT '使用的Token数',
    generation_time_ms INT COMMENT '生成时间(毫秒)',
    is_draft BOOLEAN DEFAULT TRUE COMMENT '是否草稿',
    is_sent BOOLEAN DEFAULT FALSE COMMENT '是否已发送',
    sent_to JSON COMMENT '发送对象',
    sent_at DATETIME COMMENT '发送时间',
    feedback_rating INT COMMENT '用户评分',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_user_id (user_id),
    INDEX idx_report_type (report_type),
    INDEX idx_report_scope (report_scope, scope_id),
    INDEX idx_report_period (report_period_start, report_period_end)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工作报告表';

-- 10. AI助手配置表
CREATE TABLE IF NOT EXISTS ai_assistant_config (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '配置ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    assistant_name VARCHAR(100) DEFAULT 'Mota助手' COMMENT '助手名称',
    assistant_avatar VARCHAR(500) COMMENT '助手头像',
    default_model VARCHAR(100) DEFAULT 'gpt-3.5-turbo' COMMENT '默认模型',
    temperature DECIMAL(3,2) DEFAULT 0.7 COMMENT '温度参数',
    max_tokens INT DEFAULT 2000 COMMENT '最大Token数',
    enable_context BOOLEAN DEFAULT TRUE COMMENT '启用上下文',
    context_window INT DEFAULT 10 COMMENT '上下文窗口大小',
    enable_suggestions BOOLEAN DEFAULT TRUE COMMENT '启用建议',
    suggestion_frequency VARCHAR(20) DEFAULT 'daily' COMMENT '建议频率',
    enable_auto_summary BOOLEAN DEFAULT TRUE COMMENT '启用自动摘要',
    enable_auto_translation BOOLEAN DEFAULT FALSE COMMENT '启用自动翻译',
    preferred_language VARCHAR(20) DEFAULT 'zh' COMMENT '首选语言',
    report_schedule JSON COMMENT '报告计划',
    notification_settings JSON COMMENT '通知设置',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY uk_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI助手配置表';

-- 11. AI快捷指令表
CREATE TABLE IF NOT EXISTS ai_quick_command (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '指令ID',
    user_id BIGINT COMMENT '用户ID(NULL表示系统预置)',
    command_name VARCHAR(100) NOT NULL COMMENT '指令名称',
    command_shortcut VARCHAR(50) COMMENT '快捷键',
    command_template TEXT NOT NULL COMMENT '指令模板',
    command_category VARCHAR(50) NOT NULL COMMENT '指令分类: task/document/schedule/report/analysis',
    description VARCHAR(500) COMMENT '描述',
    parameters JSON COMMENT '参数定义',
    is_system BOOLEAN DEFAULT FALSE COMMENT '是否系统预置',
    is_enabled BOOLEAN DEFAULT TRUE COMMENT '是否启用',
    usage_count INT DEFAULT 0 COMMENT '使用次数',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_user_id (user_id),
    INDEX idx_command_category (command_category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI快捷指令表';

-- 12. AI使用统计表
CREATE TABLE IF NOT EXISTS ai_usage_stats (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '统计ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    stats_date DATE NOT NULL COMMENT '统计日期',
    feature_type VARCHAR(50) NOT NULL COMMENT '功能类型: chat/command/suggestion/summary/translation/analysis/schedule/report',
    request_count INT DEFAULT 0 COMMENT '请求次数',
    tokens_used INT DEFAULT 0 COMMENT '使用Token数',
    success_count INT DEFAULT 0 COMMENT '成功次数',
    error_count INT DEFAULT 0 COMMENT '错误次数',
    avg_response_time_ms INT COMMENT '平均响应时间',
    feedback_positive INT DEFAULT 0 COMMENT '正面反馈数',
    feedback_negative INT DEFAULT 0 COMMENT '负面反馈数',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY uk_user_date_feature (user_id, stats_date, feature_type),
    INDEX idx_stats_date (stats_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI使用统计表';

-- 插入系统预置快捷指令
INSERT INTO ai_quick_command (command_name, command_shortcut, command_template, command_category, description, is_system) VALUES
('创建任务', '/task', '创建一个任务：{task_name}，截止日期：{due_date}，优先级：{priority}', 'task', '快速创建任务', TRUE),
('查询任务', '/mytasks', '查询我今天需要完成的任务', 'task', '查询今日任务', TRUE),
('完成任务', '/done', '将任务 {task_name} 标记为已完成', 'task', '完成任务', TRUE),
('生成摘要', '/summary', '为以下内容生成摘要：{content}', 'document', '生成文档摘要', TRUE),
('翻译文本', '/translate', '将以下内容翻译成{target_language}：{content}', 'document', '翻译文本', TRUE),
('今日日程', '/today', '查看我今天的日程安排', 'schedule', '查看今日日程', TRUE),
('安排会议', '/meeting', '安排一个会议：{meeting_title}，时间：{meeting_time}，参与者：{participants}', 'schedule', '安排会议', TRUE),
('日报生成', '/daily', '生成今天的工作日报', 'report', '生成日报', TRUE),
('周报生成', '/weekly', '生成本周的工作周报', 'report', '生成周报', TRUE),
('数据分析', '/analyze', '分析{scope}的{metric}数据', 'analysis', '数据分析', TRUE);