-- =====================================================
-- V15.0 系统管理模块增强
-- 包含：SSO登录、岗位管理、人员调动、组织架构图、数据权限、
--       新闻源配置、外部集成、数据变更日志、审计报告、合规检查
-- =====================================================

-- =====================================================
-- 1. SSO登录相关表
-- =====================================================

-- SSO提供商配置表
CREATE TABLE IF NOT EXISTS sys_sso_provider (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    provider_code VARCHAR(50) NOT NULL COMMENT '提供商代码（如：oauth2、saml、ldap、cas）',
    provider_name VARCHAR(100) NOT NULL COMMENT '提供商名称',
    provider_type VARCHAR(20) NOT NULL COMMENT '提供商类型（OAUTH2、SAML、LDAP、CAS）',
    client_id VARCHAR(255) COMMENT 'OAuth2客户端ID',
    client_secret VARCHAR(500) COMMENT 'OAuth2客户端密钥',
    authorization_url VARCHAR(500) COMMENT '授权URL',
    token_url VARCHAR(500) COMMENT 'Token获取URL',
    user_info_url VARCHAR(500) COMMENT '用户信息URL',
    logout_url VARCHAR(500) COMMENT '登出URL',
    redirect_uri VARCHAR(500) COMMENT '回调URL',
    scope VARCHAR(255) COMMENT '授权范围',
    ldap_url VARCHAR(500) COMMENT 'LDAP服务器URL',
    ldap_base_dn VARCHAR(255) COMMENT 'LDAP基础DN',
    ldap_user_dn VARCHAR(255) COMMENT 'LDAP用户DN',
    ldap_password VARCHAR(255) COMMENT 'LDAP密码',
    ldap_user_filter VARCHAR(255) COMMENT 'LDAP用户过滤器',
    saml_metadata_url VARCHAR(500) COMMENT 'SAML元数据URL',
    saml_entity_id VARCHAR(255) COMMENT 'SAML实体ID',
    saml_certificate TEXT COMMENT 'SAML证书',
    attribute_mapping JSON COMMENT '属性映射配置',
    auto_create_user TINYINT(1) DEFAULT 1 COMMENT '是否自动创建用户',
    default_role_id BIGINT COMMENT '默认角色ID',
    status TINYINT(1) DEFAULT 1 COMMENT '状态（1启用 0禁用）',
    sort_order INT DEFAULT 0 COMMENT '排序',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY uk_provider_code (provider_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='SSO提供商配置表';

-- SSO登录记录表
CREATE TABLE IF NOT EXISTS sys_sso_login_log (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    provider_id BIGINT NOT NULL COMMENT 'SSO提供商ID',
    provider_code VARCHAR(50) NOT NULL COMMENT '提供商代码',
    external_user_id VARCHAR(255) COMMENT '外部用户ID',
    local_user_id BIGINT COMMENT '本地用户ID',
    login_status VARCHAR(20) NOT NULL COMMENT '登录状态（SUCCESS、FAILED、PENDING）',
    error_message TEXT COMMENT '错误信息',
    login_ip VARCHAR(50) COMMENT '登录IP',
    user_agent VARCHAR(500) COMMENT '用户代理',
    raw_response TEXT COMMENT '原始响应数据',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_provider_id (provider_id),
    INDEX idx_local_user_id (local_user_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='SSO登录记录表';

-- 用户SSO绑定表
CREATE TABLE IF NOT EXISTS sys_user_sso_binding (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    provider_id BIGINT NOT NULL COMMENT 'SSO提供商ID',
    provider_code VARCHAR(50) NOT NULL COMMENT '提供商代码',
    external_user_id VARCHAR(255) NOT NULL COMMENT '外部用户ID',
    external_username VARCHAR(100) COMMENT '外部用户名',
    external_email VARCHAR(100) COMMENT '外部邮箱',
    external_avatar VARCHAR(500) COMMENT '外部头像',
    access_token TEXT COMMENT '访问令牌',
    refresh_token TEXT COMMENT '刷新令牌',
    token_expires_at DATETIME COMMENT '令牌过期时间',
    extra_data JSON COMMENT '额外数据',
    bind_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '绑定时间',
    last_login_at DATETIME COMMENT '最后登录时间',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY uk_user_provider (user_id, provider_id),
    UNIQUE KEY uk_provider_external (provider_id, external_user_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户SSO绑定表';

-- =====================================================
-- 2. 岗位管理相关表
-- =====================================================

-- 岗位表
CREATE TABLE IF NOT EXISTS sys_position (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    org_id BIGINT NOT NULL COMMENT '组织ID',
    position_code VARCHAR(50) NOT NULL COMMENT '岗位编码',
    position_name VARCHAR(100) NOT NULL COMMENT '岗位名称',
    position_level INT DEFAULT 1 COMMENT '岗位级别（1-10）',
    position_category VARCHAR(50) COMMENT '岗位类别（管理类、技术类、业务类等）',
    parent_id BIGINT DEFAULT 0 COMMENT '上级岗位ID',
    department_id BIGINT COMMENT '所属部门ID',
    description TEXT COMMENT '岗位描述',
    responsibilities TEXT COMMENT '岗位职责',
    requirements TEXT COMMENT '任职要求',
    headcount INT DEFAULT 1 COMMENT '编制人数',
    current_count INT DEFAULT 0 COMMENT '当前人数',
    salary_min DECIMAL(12,2) COMMENT '薪资下限',
    salary_max DECIMAL(12,2) COMMENT '薪资上限',
    status TINYINT(1) DEFAULT 1 COMMENT '状态（1启用 0禁用）',
    sort_order INT DEFAULT 0 COMMENT '排序',
    created_by BIGINT COMMENT '创建人',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted_at DATETIME COMMENT '删除时间',
    UNIQUE KEY uk_org_code (org_id, position_code),
    INDEX idx_org_id (org_id),
    INDEX idx_department_id (department_id),
    INDEX idx_parent_id (parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='岗位表';

-- 用户岗位关联表
CREATE TABLE IF NOT EXISTS sys_user_position (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    position_id BIGINT NOT NULL COMMENT '岗位ID',
    is_primary TINYINT(1) DEFAULT 0 COMMENT '是否主岗位',
    start_date DATE COMMENT '任职开始日期',
    end_date DATE COMMENT '任职结束日期',
    appointment_type VARCHAR(20) DEFAULT 'FORMAL' COMMENT '任命类型（FORMAL正式、ACTING代理、TEMPORARY临时）',
    remark VARCHAR(500) COMMENT '备注',
    created_by BIGINT COMMENT '创建人',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY uk_user_position (user_id, position_id),
    INDEX idx_user_id (user_id),
    INDEX idx_position_id (position_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户岗位关联表';

-- =====================================================
-- 3. 人员调动相关表
-- =====================================================

-- 人员调动记录表
CREATE TABLE IF NOT EXISTS sys_personnel_transfer (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    transfer_no VARCHAR(50) NOT NULL COMMENT '调动单号',
    user_id BIGINT NOT NULL COMMENT '被调动用户ID',
    transfer_type VARCHAR(20) NOT NULL COMMENT '调动类型（DEPARTMENT部门调动、POSITION岗位调动、PROMOTION晋升、DEMOTION降级、TRANSFER调岗）',
    from_department_id BIGINT COMMENT '原部门ID',
    to_department_id BIGINT COMMENT '目标部门ID',
    from_position_id BIGINT COMMENT '原岗位ID',
    to_position_id BIGINT COMMENT '目标岗位ID',
    from_org_id BIGINT COMMENT '原组织ID',
    to_org_id BIGINT COMMENT '目标组织ID',
    transfer_reason TEXT COMMENT '调动原因',
    effective_date DATE NOT NULL COMMENT '生效日期',
    status VARCHAR(20) DEFAULT 'PENDING' COMMENT '状态（PENDING待审批、APPROVED已批准、REJECTED已拒绝、EXECUTED已执行、CANCELLED已取消）',
    applicant_id BIGINT COMMENT '申请人ID',
    apply_time DATETIME COMMENT '申请时间',
    approver_id BIGINT COMMENT '审批人ID',
    approve_time DATETIME COMMENT '审批时间',
    approve_remark VARCHAR(500) COMMENT '审批备注',
    executor_id BIGINT COMMENT '执行人ID',
    execute_time DATETIME COMMENT '执行时间',
    attachment_ids JSON COMMENT '附件ID列表',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY uk_transfer_no (transfer_no),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_effective_date (effective_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='人员调动记录表';

-- 人员调动审批流程表
CREATE TABLE IF NOT EXISTS sys_transfer_approval (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    transfer_id BIGINT NOT NULL COMMENT '调动记录ID',
    step_order INT NOT NULL COMMENT '审批步骤顺序',
    approver_id BIGINT NOT NULL COMMENT '审批人ID',
    approver_type VARCHAR(20) DEFAULT 'USER' COMMENT '审批人类型（USER用户、ROLE角色、DEPARTMENT部门负责人）',
    status VARCHAR(20) DEFAULT 'PENDING' COMMENT '状态（PENDING待审批、APPROVED已批准、REJECTED已拒绝、SKIPPED已跳过）',
    approve_time DATETIME COMMENT '审批时间',
    remark VARCHAR(500) COMMENT '审批意见',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_transfer_id (transfer_id),
    INDEX idx_approver_id (approver_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='人员调动审批流程表';

-- =====================================================
-- 4. 组织架构图相关表
-- =====================================================

-- 组织架构图配置表
CREATE TABLE IF NOT EXISTS sys_org_chart_config (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    org_id BIGINT NOT NULL COMMENT '组织ID',
    chart_name VARCHAR(100) NOT NULL COMMENT '架构图名称',
    chart_type VARCHAR(20) DEFAULT 'TREE' COMMENT '图表类型（TREE树形、MATRIX矩阵、NETWORK网络）',
    layout_direction VARCHAR(20) DEFAULT 'TB' COMMENT '布局方向（TB上下、BT下上、LR左右、RL右左）',
    show_avatar TINYINT(1) DEFAULT 1 COMMENT '是否显示头像',
    show_position TINYINT(1) DEFAULT 1 COMMENT '是否显示岗位',
    show_department TINYINT(1) DEFAULT 1 COMMENT '是否显示部门',
    show_headcount TINYINT(1) DEFAULT 0 COMMENT '是否显示人数',
    node_color_scheme VARCHAR(50) DEFAULT 'DEFAULT' COMMENT '节点配色方案',
    custom_styles JSON COMMENT '自定义样式',
    is_default TINYINT(1) DEFAULT 0 COMMENT '是否默认配置',
    created_by BIGINT COMMENT '创建人',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_org_id (org_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='组织架构图配置表';

-- 组织架构快照表（用于历史对比）
CREATE TABLE IF NOT EXISTS sys_org_chart_snapshot (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    org_id BIGINT NOT NULL COMMENT '组织ID',
    snapshot_name VARCHAR(100) NOT NULL COMMENT '快照名称',
    snapshot_date DATE NOT NULL COMMENT '快照日期',
    snapshot_data JSON NOT NULL COMMENT '快照数据（完整的组织架构JSON）',
    department_count INT DEFAULT 0 COMMENT '部门数量',
    position_count INT DEFAULT 0 COMMENT '岗位数量',
    user_count INT DEFAULT 0 COMMENT '人员数量',
    description VARCHAR(500) COMMENT '描述',
    created_by BIGINT COMMENT '创建人',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_org_id (org_id),
    INDEX idx_snapshot_date (snapshot_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='组织架构快照表';

-- =====================================================
-- 5. 数据权限相关表
-- =====================================================

-- 数据权限规则表
CREATE TABLE IF NOT EXISTS sys_data_permission_rule (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    rule_name VARCHAR(100) NOT NULL COMMENT '规则名称',
    rule_code VARCHAR(50) NOT NULL COMMENT '规则编码',
    resource_type VARCHAR(50) NOT NULL COMMENT '资源类型（PROJECT项目、TASK任务、DOCUMENT文档等）',
    scope_type VARCHAR(20) NOT NULL COMMENT '范围类型（ALL全部、SELF本人、DEPARTMENT本部门、DEPARTMENT_AND_BELOW本部门及下级、CUSTOM自定义）',
    scope_value JSON COMMENT '范围值（自定义时使用）',
    condition_expression TEXT COMMENT '条件表达式（SQL片段或SpEL表达式）',
    description VARCHAR(500) COMMENT '规则描述',
    status TINYINT(1) DEFAULT 1 COMMENT '状态（1启用 0禁用）',
    priority INT DEFAULT 0 COMMENT '优先级（数值越大优先级越高）',
    created_by BIGINT COMMENT '创建人',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY uk_rule_code (rule_code),
    INDEX idx_resource_type (resource_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='数据权限规则表';

-- 角色数据权限关联表
CREATE TABLE IF NOT EXISTS sys_role_data_permission (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    role_id BIGINT NOT NULL COMMENT '角色ID',
    rule_id BIGINT NOT NULL COMMENT '数据权限规则ID',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    UNIQUE KEY uk_role_rule (role_id, rule_id),
    INDEX idx_role_id (role_id),
    INDEX idx_rule_id (rule_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色数据权限关联表';

-- 用户数据权限关联表（用于特殊授权）
CREATE TABLE IF NOT EXISTS sys_user_data_permission (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    rule_id BIGINT NOT NULL COMMENT '数据权限规则ID',
    grant_type VARCHAR(20) DEFAULT 'GRANT' COMMENT '授权类型（GRANT授予、DENY拒绝）',
    expire_time DATETIME COMMENT '过期时间',
    created_by BIGINT COMMENT '授权人',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    UNIQUE KEY uk_user_rule (user_id, rule_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户数据权限关联表';

-- =====================================================
-- 6. 新闻源配置相关表
-- =====================================================

-- 新闻数据源配置表
CREATE TABLE IF NOT EXISTS sys_news_source_config (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    source_name VARCHAR(100) NOT NULL COMMENT '数据源名称',
    source_code VARCHAR(50) NOT NULL COMMENT '数据源编码',
    source_type VARCHAR(20) NOT NULL COMMENT '数据源类型（RSS、API、CRAWLER、MANUAL）',
    source_url VARCHAR(500) COMMENT '数据源URL',
    api_key VARCHAR(255) COMMENT 'API密钥',
    api_secret VARCHAR(255) COMMENT 'API密钥',
    request_headers JSON COMMENT '请求头配置',
    request_params JSON COMMENT '请求参数配置',
    parse_rules JSON COMMENT '解析规则配置',
    category VARCHAR(50) COMMENT '新闻分类',
    language VARCHAR(10) DEFAULT 'zh-CN' COMMENT '语言',
    fetch_interval INT DEFAULT 3600 COMMENT '抓取间隔（秒）',
    last_fetch_time DATETIME COMMENT '最后抓取时间',
    last_fetch_count INT DEFAULT 0 COMMENT '最后抓取数量',
    total_fetch_count INT DEFAULT 0 COMMENT '总抓取数量',
    status TINYINT(1) DEFAULT 1 COMMENT '状态（1启用 0禁用）',
    priority INT DEFAULT 0 COMMENT '优先级',
    created_by BIGINT COMMENT '创建人',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY uk_source_code (source_code),
    INDEX idx_source_type (source_type),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='新闻数据源配置表';

-- 新闻源抓取日志表
CREATE TABLE IF NOT EXISTS sys_news_source_fetch_log (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    source_id BIGINT NOT NULL COMMENT '数据源ID',
    fetch_time DATETIME NOT NULL COMMENT '抓取时间',
    fetch_status VARCHAR(20) NOT NULL COMMENT '抓取状态（SUCCESS、FAILED、PARTIAL）',
    fetch_count INT DEFAULT 0 COMMENT '抓取数量',
    new_count INT DEFAULT 0 COMMENT '新增数量',
    update_count INT DEFAULT 0 COMMENT '更新数量',
    error_count INT DEFAULT 0 COMMENT '错误数量',
    error_message TEXT COMMENT '错误信息',
    duration_ms INT COMMENT '耗时（毫秒）',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_source_id (source_id),
    INDEX idx_fetch_time (fetch_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='新闻源抓取日志表';

-- =====================================================
-- 7. 外部集成相关表
-- =====================================================

-- 外部服务集成配置表
CREATE TABLE IF NOT EXISTS sys_external_integration (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    integration_name VARCHAR(100) NOT NULL COMMENT '集成名称',
    integration_code VARCHAR(50) NOT NULL COMMENT '集成编码',
    integration_type VARCHAR(50) NOT NULL COMMENT '集成类型（WECHAT_WORK企业微信、DINGTALK钉钉、FEISHU飞书、GITLAB、JIRA、CONFLUENCE等）',
    app_id VARCHAR(255) COMMENT '应用ID',
    app_secret VARCHAR(500) COMMENT '应用密钥',
    access_token TEXT COMMENT '访问令牌',
    refresh_token TEXT COMMENT '刷新令牌',
    token_expires_at DATETIME COMMENT '令牌过期时间',
    webhook_url VARCHAR(500) COMMENT 'Webhook URL',
    callback_url VARCHAR(500) COMMENT '回调URL',
    api_base_url VARCHAR(500) COMMENT 'API基础URL',
    extra_config JSON COMMENT '额外配置',
    sync_config JSON COMMENT '同步配置',
    last_sync_time DATETIME COMMENT '最后同步时间',
    status TINYINT(1) DEFAULT 1 COMMENT '状态（1启用 0禁用）',
    created_by BIGINT COMMENT '创建人',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY uk_integration_code (integration_code),
    INDEX idx_integration_type (integration_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='外部服务集成配置表';

-- 外部集成同步日志表
CREATE TABLE IF NOT EXISTS sys_integration_sync_log (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    integration_id BIGINT NOT NULL COMMENT '集成ID',
    sync_type VARCHAR(50) NOT NULL COMMENT '同步类型（USER用户、DEPARTMENT部门、MESSAGE消息、TASK任务等）',
    sync_direction VARCHAR(20) NOT NULL COMMENT '同步方向（PUSH推送、PULL拉取、BIDIRECTIONAL双向）',
    sync_status VARCHAR(20) NOT NULL COMMENT '同步状态（SUCCESS、FAILED、PARTIAL）',
    total_count INT DEFAULT 0 COMMENT '总数量',
    success_count INT DEFAULT 0 COMMENT '成功数量',
    failed_count INT DEFAULT 0 COMMENT '失败数量',
    error_details JSON COMMENT '错误详情',
    sync_time DATETIME NOT NULL COMMENT '同步时间',
    duration_ms INT COMMENT '耗时（毫秒）',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_integration_id (integration_id),
    INDEX idx_sync_time (sync_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='外部集成同步日志表';

-- =====================================================
-- 8. 数据变更日志相关表
-- =====================================================

-- 数据变更日志表
CREATE TABLE IF NOT EXISTS sys_data_change_log (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    table_name VARCHAR(100) NOT NULL COMMENT '表名',
    record_id VARCHAR(100) NOT NULL COMMENT '记录ID',
    operation_type VARCHAR(20) NOT NULL COMMENT '操作类型（INSERT、UPDATE、DELETE）',
    old_data JSON COMMENT '变更前数据',
    new_data JSON COMMENT '变更后数据',
    changed_fields JSON COMMENT '变更字段列表',
    change_summary VARCHAR(500) COMMENT '变更摘要',
    operator_id BIGINT COMMENT '操作人ID',
    operator_name VARCHAR(50) COMMENT '操作人姓名',
    operator_ip VARCHAR(50) COMMENT '操作人IP',
    operation_time DATETIME NOT NULL COMMENT '操作时间',
    request_id VARCHAR(100) COMMENT '请求ID（用于追踪）',
    module_name VARCHAR(50) COMMENT '模块名称',
    business_type VARCHAR(50) COMMENT '业务类型',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_table_record (table_name, record_id),
    INDEX idx_operator_id (operator_id),
    INDEX idx_operation_time (operation_time),
    INDEX idx_request_id (request_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='数据变更日志表';

-- 数据变更订阅表（用于通知相关人员）
CREATE TABLE IF NOT EXISTS sys_data_change_subscription (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    user_id BIGINT NOT NULL COMMENT '订阅用户ID',
    table_name VARCHAR(100) NOT NULL COMMENT '订阅表名',
    record_id VARCHAR(100) COMMENT '订阅记录ID（为空表示订阅整个表）',
    operation_types VARCHAR(100) DEFAULT 'INSERT,UPDATE,DELETE' COMMENT '订阅操作类型',
    notify_method VARCHAR(50) DEFAULT 'NOTIFICATION' COMMENT '通知方式（NOTIFICATION站内、EMAIL邮件、WEBHOOK）',
    webhook_url VARCHAR(500) COMMENT 'Webhook URL',
    status TINYINT(1) DEFAULT 1 COMMENT '状态（1启用 0禁用）',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_user_id (user_id),
    INDEX idx_table_name (table_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='数据变更订阅表';

-- =====================================================
-- 9. 审计报告相关表
-- =====================================================

-- 审计报告表
CREATE TABLE IF NOT EXISTS sys_audit_report (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    report_no VARCHAR(50) NOT NULL COMMENT '报告编号',
    report_name VARCHAR(200) NOT NULL COMMENT '报告名称',
    report_type VARCHAR(50) NOT NULL COMMENT '报告类型（OPERATION操作审计、SECURITY安全审计、DATA数据审计、COMPLIANCE合规审计）',
    report_period_start DATE NOT NULL COMMENT '报告周期开始',
    report_period_end DATE NOT NULL COMMENT '报告周期结束',
    report_scope JSON COMMENT '报告范围（部门、用户、模块等）',
    summary TEXT COMMENT '报告摘要',
    findings JSON COMMENT '审计发现',
    statistics JSON COMMENT '统计数据',
    recommendations JSON COMMENT '改进建议',
    risk_level VARCHAR(20) COMMENT '风险等级（LOW、MEDIUM、HIGH、CRITICAL）',
    report_status VARCHAR(20) DEFAULT 'DRAFT' COMMENT '报告状态（DRAFT草稿、REVIEWING审核中、PUBLISHED已发布、ARCHIVED已归档）',
    report_file_url VARCHAR(500) COMMENT '报告文件URL',
    generated_by BIGINT COMMENT '生成人',
    generated_at DATETIME COMMENT '生成时间',
    reviewed_by BIGINT COMMENT '审核人',
    reviewed_at DATETIME COMMENT '审核时间',
    published_by BIGINT COMMENT '发布人',
    published_at DATETIME COMMENT '发布时间',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY uk_report_no (report_no),
    INDEX idx_report_type (report_type),
    INDEX idx_report_status (report_status),
    INDEX idx_report_period (report_period_start, report_period_end)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='审计报告表';

-- 审计报告模板表
CREATE TABLE IF NOT EXISTS sys_audit_report_template (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    template_name VARCHAR(100) NOT NULL COMMENT '模板名称',
    template_code VARCHAR(50) NOT NULL COMMENT '模板编码',
    report_type VARCHAR(50) NOT NULL COMMENT '报告类型',
    template_content TEXT COMMENT '模板内容',
    data_queries JSON COMMENT '数据查询配置',
    chart_configs JSON COMMENT '图表配置',
    is_default TINYINT(1) DEFAULT 0 COMMENT '是否默认模板',
    status TINYINT(1) DEFAULT 1 COMMENT '状态（1启用 0禁用）',
    created_by BIGINT COMMENT '创建人',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY uk_template_code (template_code),
    INDEX idx_report_type (report_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='审计报告模板表';

-- 审计报告定时任务表
CREATE TABLE IF NOT EXISTS sys_audit_report_schedule (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    schedule_name VARCHAR(100) NOT NULL COMMENT '任务名称',
    template_id BIGINT NOT NULL COMMENT '模板ID',
    schedule_type VARCHAR(20) NOT NULL COMMENT '调度类型（DAILY日报、WEEKLY周报、MONTHLY月报、QUARTERLY季报、YEARLY年报）',
    cron_expression VARCHAR(100) COMMENT 'Cron表达式',
    report_scope JSON COMMENT '报告范围',
    recipients JSON COMMENT '接收人列表',
    notify_method VARCHAR(50) DEFAULT 'EMAIL' COMMENT '通知方式',
    last_run_time DATETIME COMMENT '最后运行时间',
    next_run_time DATETIME COMMENT '下次运行时间',
    status TINYINT(1) DEFAULT 1 COMMENT '状态（1启用 0禁用）',
    created_by BIGINT COMMENT '创建人',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_template_id (template_id),
    INDEX idx_next_run_time (next_run_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='审计报告定时任务表';

-- =====================================================
-- 10. 合规检查相关表
-- =====================================================

-- 合规规则表
CREATE TABLE IF NOT EXISTS sys_compliance_rule (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    rule_name VARCHAR(100) NOT NULL COMMENT '规则名称',
    rule_code VARCHAR(50) NOT NULL COMMENT '规则编码',
    rule_category VARCHAR(50) NOT NULL COMMENT '规则类别（SECURITY安全、PRIVACY隐私、DATA_PROTECTION数据保护、ACCESS_CONTROL访问控制等）',
    rule_description TEXT COMMENT '规则描述',
    check_type VARCHAR(20) NOT NULL COMMENT '检查类型（REALTIME实时、SCHEDULED定时、MANUAL手动）',
    check_expression TEXT COMMENT '检查表达式（SQL或脚本）',
    check_params JSON COMMENT '检查参数',
    severity VARCHAR(20) DEFAULT 'MEDIUM' COMMENT '严重程度（LOW、MEDIUM、HIGH、CRITICAL）',
    remediation_steps TEXT COMMENT '修复步骤',
    reference_standard VARCHAR(200) COMMENT '参考标准（如ISO27001、GDPR等）',
    status TINYINT(1) DEFAULT 1 COMMENT '状态（1启用 0禁用）',
    created_by BIGINT COMMENT '创建人',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY uk_rule_code (rule_code),
    INDEX idx_rule_category (rule_category),
    INDEX idx_check_type (check_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='合规规则表';

-- 合规检查记录表
CREATE TABLE IF NOT EXISTS sys_compliance_check_record (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    check_batch_no VARCHAR(50) NOT NULL COMMENT '检查批次号',
    rule_id BIGINT NOT NULL COMMENT '规则ID',
    rule_code VARCHAR(50) NOT NULL COMMENT '规则编码',
    check_time DATETIME NOT NULL COMMENT '检查时间',
    check_result VARCHAR(20) NOT NULL COMMENT '检查结果（PASS通过、FAIL失败、WARNING警告、ERROR错误）',
    affected_count INT DEFAULT 0 COMMENT '影响数量',
    affected_items JSON COMMENT '影响项目详情',
    check_details JSON COMMENT '检查详情',
    remediation_status VARCHAR(20) DEFAULT 'PENDING' COMMENT '修复状态（PENDING待处理、IN_PROGRESS处理中、RESOLVED已解决、IGNORED已忽略）',
    remediation_time DATETIME COMMENT '修复时间',
    remediation_by BIGINT COMMENT '修复人',
    remediation_notes TEXT COMMENT '修复备注',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_check_batch_no (check_batch_no),
    INDEX idx_rule_id (rule_id),
    INDEX idx_check_time (check_time),
    INDEX idx_check_result (check_result),
    INDEX idx_remediation_status (remediation_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='合规检查记录表';

-- 合规检查定时任务表
CREATE TABLE IF NOT EXISTS sys_compliance_check_schedule (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    schedule_name VARCHAR(100) NOT NULL COMMENT '任务名称',
    rule_ids JSON NOT NULL COMMENT '规则ID列表',
    cron_expression VARCHAR(100) NOT NULL COMMENT 'Cron表达式',
    notify_on_fail TINYINT(1) DEFAULT 1 COMMENT '失败时是否通知',
    notify_recipients JSON COMMENT '通知接收人',
    last_run_time DATETIME COMMENT '最后运行时间',
    last_run_result VARCHAR(20) COMMENT '最后运行结果',
    next_run_time DATETIME COMMENT '下次运行时间',
    status TINYINT(1) DEFAULT 1 COMMENT '状态（1启用 0禁用）',
    created_by BIGINT COMMENT '创建人',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_next_run_time (next_run_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='合规检查定时任务表';

-- =====================================================
-- 11. 初始化数据
-- =====================================================

-- 初始化SSO提供商
INSERT INTO sys_sso_provider (provider_code, provider_name, provider_type, status, sort_order) VALUES
('oauth2_github', 'GitHub', 'OAUTH2', 0, 1),
('oauth2_google', 'Google', 'OAUTH2', 0, 2),
('oauth2_wechat_work', '企业微信', 'OAUTH2', 0, 3),
('oauth2_dingtalk', '钉钉', 'OAUTH2', 0, 4),
('oauth2_feishu', '飞书', 'OAUTH2', 0, 5),
('ldap_default', 'LDAP', 'LDAP', 0, 6),
('saml_default', 'SAML', 'SAML', 0, 7),
('cas_default', 'CAS', 'CAS', 0, 8);

-- 初始化岗位类别
INSERT INTO sys_position (org_id, position_code, position_name, position_level, position_category, description, status) VALUES
(1, 'CEO', '首席执行官', 10, '管理类', '公司最高管理者', 1),
(1, 'CTO', '首席技术官', 9, '管理类', '技术团队最高负责人', 1),
(1, 'PM', '项目经理', 7, '管理类', '项目管理负责人', 1),
(1, 'TL', '技术负责人', 7, '技术类', '技术团队负责人', 1),
(1, 'SE', '高级工程师', 6, '技术类', '高级软件工程师', 1),
(1, 'DEV', '软件工程师', 5, '技术类', '软件开发工程师', 1),
(1, 'QA', '测试工程师', 5, '技术类', '软件测试工程师', 1),
(1, 'UI', 'UI设计师', 5, '设计类', '用户界面设计师', 1),
(1, 'OP', '运维工程师', 5, '技术类', '系统运维工程师', 1);

-- 初始化数据权限规则
INSERT INTO sys_data_permission_rule (rule_name, rule_code, resource_type, scope_type, description, status, priority) VALUES
('查看全部项目', 'VIEW_ALL_PROJECTS', 'PROJECT', 'ALL', '可以查看所有项目', 1, 100),
('查看本人项目', 'VIEW_OWN_PROJECTS', 'PROJECT', 'SELF', '只能查看自己创建或参与的项目', 1, 50),
('查看本部门项目', 'VIEW_DEPT_PROJECTS', 'PROJECT', 'DEPARTMENT', '可以查看本部门的项目', 1, 60),
('查看本部门及下级项目', 'VIEW_DEPT_SUB_PROJECTS', 'PROJECT', 'DEPARTMENT_AND_BELOW', '可以查看本部门及下级部门的项目', 1, 70),
('查看全部任务', 'VIEW_ALL_TASKS', 'TASK', 'ALL', '可以查看所有任务', 1, 100),
('查看本人任务', 'VIEW_OWN_TASKS', 'TASK', 'SELF', '只能查看分配给自己的任务', 1, 50),
('查看本部门任务', 'VIEW_DEPT_TASKS', 'TASK', 'DEPARTMENT', '可以查看本部门的任务', 1, 60),
('查看全部文档', 'VIEW_ALL_DOCUMENTS', 'DOCUMENT', 'ALL', '可以查看所有文档', 1, 100),
('查看本人文档', 'VIEW_OWN_DOCUMENTS', 'DOCUMENT', 'SELF', '只能查看自己创建的文档', 1, 50);

-- 初始化合规规则
INSERT INTO sys_compliance_rule (rule_name, rule_code, rule_category, rule_description, check_type, severity, reference_standard, status) VALUES
('密码复杂度检查', 'PASSWORD_COMPLEXITY', 'SECURITY', '检查用户密码是否符合复杂度要求', 'REALTIME', 'HIGH', 'ISO27001', 1),
('登录失败次数检查', 'LOGIN_FAILURE_CHECK', 'SECURITY', '检查是否存在异常登录失败', 'SCHEDULED', 'MEDIUM', 'ISO27001', 1),
('敏感数据访问检查', 'SENSITIVE_DATA_ACCESS', 'DATA_PROTECTION', '检查敏感数据访问是否合规', 'SCHEDULED', 'HIGH', 'GDPR', 1),
('权限变更审计', 'PERMISSION_CHANGE_AUDIT', 'ACCESS_CONTROL', '审计权限变更记录', 'SCHEDULED', 'MEDIUM', 'ISO27001', 1),
('数据导出检查', 'DATA_EXPORT_CHECK', 'DATA_PROTECTION', '检查数据导出操作是否合规', 'REALTIME', 'HIGH', 'GDPR', 1),
('会话超时检查', 'SESSION_TIMEOUT_CHECK', 'SECURITY', '检查会话超时配置是否合规', 'SCHEDULED', 'LOW', 'ISO27001', 1),
('API访问频率检查', 'API_RATE_LIMIT_CHECK', 'SECURITY', '检查API访问频率是否异常', 'REALTIME', 'MEDIUM', 'OWASP', 1),
('用户权限最小化检查', 'LEAST_PRIVILEGE_CHECK', 'ACCESS_CONTROL', '检查用户权限是否符合最小化原则', 'SCHEDULED', 'MEDIUM', 'ISO27001', 1);

-- 初始化审计报告模板
INSERT INTO sys_audit_report_template (template_name, template_code, report_type, is_default, status) VALUES
('操作审计日报模板', 'OPERATION_DAILY', 'OPERATION', 1, 1),
('操作审计周报模板', 'OPERATION_WEEKLY', 'OPERATION', 0, 1),
('操作审计月报模板', 'OPERATION_MONTHLY', 'OPERATION', 0, 1),
('安全审计报告模板', 'SECURITY_REPORT', 'SECURITY', 1, 1),
('数据审计报告模板', 'DATA_AUDIT_REPORT', 'DATA', 1, 1),
('合规审计报告模板', 'COMPLIANCE_REPORT', 'COMPLIANCE', 1, 1);

-- 初始化外部集成配置
INSERT INTO sys_external_integration (integration_name, integration_code, integration_type, status) VALUES
('企业微信', 'WECHAT_WORK', 'WECHAT_WORK', 0),
('钉钉', 'DINGTALK', 'DINGTALK', 0),
('飞书', 'FEISHU', 'FEISHU', 0),
('GitLab', 'GITLAB', 'GITLAB', 0),
('Jira', 'JIRA', 'JIRA', 0),
('Confluence', 'CONFLUENCE', 'CONFLUENCE', 0);