-- 报表服务数据库表结构
-- 数据库: mota_report

-- 报表模板表
CREATE TABLE IF NOT EXISTS report_template (
    id BIGINT PRIMARY KEY COMMENT '模板ID',
    tenant_id BIGINT NOT NULL COMMENT '租户ID',
    name VARCHAR(200) NOT NULL COMMENT '模板名称',
    code VARCHAR(100) COMMENT '模板编码',
    description TEXT COMMENT '模板描述',
    type VARCHAR(50) NOT NULL DEFAULT 'table' COMMENT '模板类型: table/chart/mixed/dashboard',
    category VARCHAR(50) COMMENT '模板分类: project/task/resource/performance/custom',
    data_source_config JSON COMMENT '数据源配置',
    layout_config JSON COMMENT '布局配置',
    style_config JSON COMMENT '样式配置',
    chart_config JSON COMMENT '图表配置',
    param_config JSON COMMENT '参数配置',
    export_formats VARCHAR(100) DEFAULT 'excel,pdf' COMMENT '支持的导出格式',
    is_system BOOLEAN DEFAULT FALSE COMMENT '是否系统模板',
    is_public BOOLEAN DEFAULT FALSE COMMENT '是否公开',
    usage_count INT DEFAULT 0 COMMENT '使用次数',
    status TINYINT DEFAULT 1 COMMENT '状态: 0-禁用, 1-启用',
    created_by BIGINT COMMENT '创建人ID',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_by BIGINT COMMENT '更新人ID',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted BOOLEAN DEFAULT FALSE COMMENT '是否删除',
    version INT DEFAULT 0 COMMENT '版本号',
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_code (code),
    INDEX idx_category (category),
    INDEX idx_type (type),
    INDEX idx_created_by (created_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='报表模板表';

-- 报表实例表
CREATE TABLE IF NOT EXISTS report (
    id BIGINT PRIMARY KEY COMMENT '报表ID',
    tenant_id BIGINT NOT NULL COMMENT '租户ID',
    template_id BIGINT NOT NULL COMMENT '模板ID',
    name VARCHAR(200) NOT NULL COMMENT '报表名称',
    description TEXT COMMENT '报表描述',
    generate_type VARCHAR(50) DEFAULT 'manual' COMMENT '生成类型: manual/scheduled/triggered',
    query_params JSON COMMENT '查询参数',
    data_snapshot LONGTEXT COMMENT '数据快照',
    status VARCHAR(50) DEFAULT 'pending' COMMENT '状态: pending/generating/completed/failed',
    error_message TEXT COMMENT '错误信息',
    generate_start_time DATETIME COMMENT '生成开始时间',
    generate_end_time DATETIME COMMENT '生成结束时间',
    generate_duration BIGINT COMMENT '生成耗时(毫秒)',
    data_row_count INT COMMENT '数据行数',
    file_path VARCHAR(500) COMMENT '文件路径',
    file_format VARCHAR(20) COMMENT '文件格式',
    file_size BIGINT COMMENT '文件大小(字节)',
    expire_at DATETIME COMMENT '过期时间',
    view_count INT DEFAULT 0 COMMENT '查看次数',
    download_count INT DEFAULT 0 COMMENT '下载次数',
    created_by BIGINT COMMENT '创建人ID',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted BOOLEAN DEFAULT FALSE COMMENT '是否删除',
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_template_id (template_id),
    INDEX idx_status (status),
    INDEX idx_created_by (created_by),
    INDEX idx_expire_at (expire_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='报表实例表';

-- 定时报表任务表
CREATE TABLE IF NOT EXISTS report_schedule (
    id BIGINT PRIMARY KEY COMMENT '任务ID',
    tenant_id BIGINT NOT NULL COMMENT '租户ID',
    template_id BIGINT NOT NULL COMMENT '模板ID',
    name VARCHAR(200) NOT NULL COMMENT '任务名称',
    description TEXT COMMENT '任务描述',
    cron_expression VARCHAR(100) NOT NULL COMMENT 'Cron表达式',
    timezone VARCHAR(50) DEFAULT 'Asia/Shanghai' COMMENT '时区',
    query_params JSON COMMENT '查询参数',
    export_format VARCHAR(20) DEFAULT 'excel' COMMENT '导出格式',
    notify_type VARCHAR(50) COMMENT '通知方式: email/system/webhook',
    notify_receivers JSON COMMENT '通知接收人',
    email_subject VARCHAR(500) COMMENT '邮件主题模板',
    email_content TEXT COMMENT '邮件内容模板',
    webhook_url VARCHAR(500) COMMENT 'Webhook URL',
    retention_days INT DEFAULT 30 COMMENT '报表保留天数',
    max_retention_count INT DEFAULT 10 COMMENT '最大保留份数',
    status TINYINT DEFAULT 1 COMMENT '状态: 0-禁用, 1-启用',
    last_execute_time DATETIME COMMENT '上次执行时间',
    last_execute_status VARCHAR(50) COMMENT '上次执行状态',
    next_execute_time DATETIME COMMENT '下次执行时间',
    execute_count INT DEFAULT 0 COMMENT '执行次数',
    success_count INT DEFAULT 0 COMMENT '成功次数',
    fail_count INT DEFAULT 0 COMMENT '失败次数',
    created_by BIGINT COMMENT '创建人ID',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_by BIGINT COMMENT '更新人ID',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted BOOLEAN DEFAULT FALSE COMMENT '是否删除',
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_template_id (template_id),
    INDEX idx_status (status),
    INDEX idx_next_execute_time (next_execute_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='定时报表任务表';

-- 仪表盘表
CREATE TABLE IF NOT EXISTS dashboard (
    id BIGINT PRIMARY KEY COMMENT '仪表盘ID',
    tenant_id BIGINT NOT NULL COMMENT '租户ID',
    name VARCHAR(200) NOT NULL COMMENT '仪表盘名称',
    description TEXT COMMENT '仪表盘描述',
    type VARCHAR(50) DEFAULT 'personal' COMMENT '类型: personal/team/project/system',
    project_id BIGINT COMMENT '关联项目ID',
    team_id BIGINT COMMENT '关联团队ID',
    layout_config JSON COMMENT '布局配置',
    theme_config JSON COMMENT '主题配置',
    refresh_interval INT DEFAULT 0 COMMENT '刷新间隔(秒)',
    is_public BOOLEAN DEFAULT FALSE COMMENT '是否公开',
    is_default BOOLEAN DEFAULT FALSE COMMENT '是否默认',
    sort_order INT DEFAULT 0 COMMENT '排序号',
    status TINYINT DEFAULT 1 COMMENT '状态: 0-禁用, 1-启用',
    view_count INT DEFAULT 0 COMMENT '查看次数',
    created_by BIGINT COMMENT '创建人ID',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_by BIGINT COMMENT '更新人ID',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted BOOLEAN DEFAULT FALSE COMMENT '是否删除',
    version INT DEFAULT 0 COMMENT '版本号',
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_type (type),
    INDEX idx_project_id (project_id),
    INDEX idx_team_id (team_id),
    INDEX idx_created_by (created_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='仪表盘表';

-- 仪表盘组件表
CREATE TABLE IF NOT EXISTS dashboard_widget (
    id BIGINT PRIMARY KEY COMMENT '组件ID',
    dashboard_id BIGINT NOT NULL COMMENT '仪表盘ID',
    name VARCHAR(200) NOT NULL COMMENT '组件名称',
    type VARCHAR(50) NOT NULL COMMENT '组件类型: stat/chart/table/list/progress/gauge/map/text/image/iframe',
    chart_type VARCHAR(50) COMMENT '图表子类型',
    data_source_type VARCHAR(50) DEFAULT 'api' COMMENT '数据源类型: api/sql/static',
    data_source_config JSON COMMENT '数据源配置',
    transform_config JSON COMMENT '数据转换配置',
    widget_config JSON COMMENT '组件配置',
    position_config JSON COMMENT '位置配置',
    refresh_interval INT DEFAULT 0 COMMENT '刷新间隔(秒)',
    cache_seconds INT DEFAULT 60 COMMENT '缓存时间(秒)',
    sort_order INT DEFAULT 0 COMMENT '排序号',
    status TINYINT DEFAULT 1 COMMENT '状态: 0-禁用, 1-启用',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted BOOLEAN DEFAULT FALSE COMMENT '是否删除',
    INDEX idx_dashboard_id (dashboard_id),
    INDEX idx_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='仪表盘组件表';

-- 报表订阅表
CREATE TABLE IF NOT EXISTS report_subscription (
    id BIGINT PRIMARY KEY COMMENT '订阅ID',
    tenant_id BIGINT NOT NULL COMMENT '租户ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    subscribe_type VARCHAR(50) NOT NULL COMMENT '订阅类型: template/schedule/dashboard',
    target_id BIGINT NOT NULL COMMENT '订阅目标ID',
    notify_type VARCHAR(50) DEFAULT 'system' COMMENT '通知方式: email/system/webhook',
    email VARCHAR(200) COMMENT '邮箱地址',
    webhook_url VARCHAR(500) COMMENT 'Webhook URL',
    preferred_format VARCHAR(20) DEFAULT 'excel' COMMENT '偏好格式',
    status TINYINT DEFAULT 1 COMMENT '状态: 0-取消订阅, 1-已订阅',
    subscribed_at DATETIME COMMENT '订阅时间',
    unsubscribed_at DATETIME COMMENT '取消订阅时间',
    last_received_at DATETIME COMMENT '最后接收时间',
    receive_count INT DEFAULT 0 COMMENT '接收次数',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_user_id (user_id),
    INDEX idx_target (subscribe_type, target_id),
    UNIQUE KEY uk_user_target (user_id, subscribe_type, target_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='报表订阅表';

-- 数据指标表
CREATE TABLE IF NOT EXISTS data_metric (
    id BIGINT PRIMARY KEY COMMENT '指标ID',
    tenant_id BIGINT NOT NULL COMMENT '租户ID',
    name VARCHAR(200) NOT NULL COMMENT '指标名称',
    code VARCHAR(100) NOT NULL COMMENT '指标编码',
    description TEXT COMMENT '指标描述',
    category VARCHAR(50) COMMENT '指标分类',
    data_type VARCHAR(50) DEFAULT 'number' COMMENT '数据类型: number/percentage/currency/text',
    unit VARCHAR(50) COMMENT '单位',
    calculation_formula TEXT COMMENT '计算公式',
    data_source_config JSON COMMENT '数据源配置',
    aggregation_type VARCHAR(50) DEFAULT 'sum' COMMENT '聚合方式: sum/avg/count/max/min',
    time_dimension VARCHAR(50) DEFAULT 'day' COMMENT '时间维度: hour/day/week/month/year',
    is_system BOOLEAN DEFAULT FALSE COMMENT '是否系统指标',
    status TINYINT DEFAULT 1 COMMENT '状态: 0-禁用, 1-启用',
    created_by BIGINT COMMENT '创建人ID',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_by BIGINT COMMENT '更新人ID',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted BOOLEAN DEFAULT FALSE COMMENT '是否删除',
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_code (code),
    INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='数据指标表';

-- 指标数据表（存储计算后的指标值）
CREATE TABLE IF NOT EXISTS metric_data (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '数据ID',
    tenant_id BIGINT NOT NULL COMMENT '租户ID',
    metric_id BIGINT NOT NULL COMMENT '指标ID',
    dimension_key VARCHAR(200) COMMENT '维度键',
    dimension_value VARCHAR(500) COMMENT '维度值',
    metric_value DECIMAL(20, 4) COMMENT '指标值',
    metric_date DATE NOT NULL COMMENT '指标日期',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_tenant_metric (tenant_id, metric_id),
    INDEX idx_metric_date (metric_id, metric_date),
    INDEX idx_dimension (dimension_key, dimension_value)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='指标数据表';

-- 插入系统默认模板
INSERT INTO report_template (id, tenant_id, name, code, description, type, category, is_system, is_public, status, created_at) VALUES
(1, 0, '项目进度报表', 'project_progress', '展示项目整体进度和里程碑完成情况', 'mixed', 'project', TRUE, TRUE, 1, NOW()),
(2, 0, '任务统计报表', 'task_statistics', '统计任务完成率、逾期率等指标', 'chart', 'task', TRUE, TRUE, 1, NOW()),
(3, 0, '团队效能报表', 'team_efficiency', '分析团队成员工作效能和贡献度', 'mixed', 'performance', TRUE, TRUE, 1, NOW()),
(4, 0, '资源利用报表', 'resource_utilization', '展示资源分配和利用情况', 'chart', 'resource', TRUE, TRUE, 1, NOW()),
(5, 0, '工时统计报表', 'workload_statistics', '统计成员工时投入情况', 'table', 'resource', TRUE, TRUE, 1, NOW());