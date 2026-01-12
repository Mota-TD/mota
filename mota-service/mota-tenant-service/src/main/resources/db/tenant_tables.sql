-- =============================================
-- 租户服务数据库初始化脚本
-- 数据库: mota_tenant
-- =============================================

-- 创建数据库
CREATE DATABASE IF NOT EXISTS mota_tenant DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE mota_tenant;

-- =============================================
-- 1. 租户套餐表
-- =============================================
CREATE TABLE IF NOT EXISTS sys_tenant_package (
    id BIGINT NOT NULL COMMENT '套餐ID',
    package_code VARCHAR(50) NOT NULL COMMENT '套餐编码',
    package_name VARCHAR(100) NOT NULL COMMENT '套餐名称',
    package_type TINYINT NOT NULL DEFAULT 0 COMMENT '套餐类型（0-免费版、1-基础版、2-专业版、3-企业版、4-旗舰版）',
    description VARCHAR(500) COMMENT '套餐描述',
    monthly_price DECIMAL(10,2) DEFAULT 0.00 COMMENT '月付价格',
    yearly_price DECIMAL(10,2) DEFAULT 0.00 COMMENT '年付价格',
    user_limit INT DEFAULT 5 COMMENT '用户数量上限（-1表示无限制）',
    storage_limit BIGINT DEFAULT 1024 COMMENT '存储空间上限（MB，-1表示无限制）',
    project_limit INT DEFAULT 3 COMMENT '项目数量上限（-1表示无限制）',
    ai_call_limit INT DEFAULT 100 COMMENT 'AI调用次数上限（每月，-1表示无限制）',
    ai_enabled TINYINT(1) DEFAULT 1 COMMENT '是否启用AI功能',
    knowledge_enabled TINYINT(1) DEFAULT 0 COMMENT '是否启用知识库功能',
    advanced_report_enabled TINYINT(1) DEFAULT 0 COMMENT '是否启用高级报表',
    custom_domain_enabled TINYINT(1) DEFAULT 0 COMMENT '是否支持自定义域名',
    sso_enabled TINYINT(1) DEFAULT 0 COMMENT '是否支持SSO登录',
    api_enabled TINYINT(1) DEFAULT 0 COMMENT '是否支持API访问',
    data_export_enabled TINYINT(1) DEFAULT 0 COMMENT '是否支持数据导出',
    audit_log_enabled TINYINT(1) DEFAULT 0 COMMENT '是否支持审计日志',
    priority_support_enabled TINYINT(1) DEFAULT 0 COMMENT '是否支持优先客服',
    features JSON COMMENT '功能权限列表（JSON格式）',
    sort_order INT DEFAULT 0 COMMENT '排序号',
    status TINYINT DEFAULT 1 COMMENT '状态（0-禁用、1-启用）',
    recommended TINYINT(1) DEFAULT 0 COMMENT '是否推荐',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    create_by BIGINT COMMENT '创建人',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    update_by BIGINT COMMENT '更新人',
    deleted TINYINT(1) DEFAULT 0 COMMENT '是否删除',
    PRIMARY KEY (id),
    UNIQUE KEY uk_package_code (package_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='租户套餐表';

-- =============================================
-- 2. 租户表
-- =============================================
CREATE TABLE IF NOT EXISTS sys_tenant (
    id BIGINT NOT NULL COMMENT '租户ID',
    tenant_code VARCHAR(50) NOT NULL COMMENT '租户编码（唯一标识）',
    tenant_name VARCHAR(100) NOT NULL COMMENT '租户名称（企业名称）',
    short_name VARCHAR(50) COMMENT '租户简称',
    logo VARCHAR(255) COMMENT '租户Logo',
    contact_name VARCHAR(50) COMMENT '联系人姓名',
    contact_phone VARCHAR(20) COMMENT '联系人手机',
    contact_email VARCHAR(100) COMMENT '联系人邮箱',
    address VARCHAR(200) COMMENT '企业地址',
    industry VARCHAR(50) COMMENT '行业类型',
    company_size VARCHAR(20) COMMENT '企业规模',
    credit_code VARCHAR(50) COMMENT '统一社会信用代码',
    business_license VARCHAR(255) COMMENT '营业执照图片',
    package_id BIGINT COMMENT '套餐ID',
    status TINYINT DEFAULT 0 COMMENT '租户状态（0-试用中、1-正式、2-已过期、3-已禁用）',
    trial_start_date DATE COMMENT '试用开始日期',
    trial_end_date DATE COMMENT '试用结束日期',
    start_date DATE COMMENT '正式开始日期',
    end_date DATE COMMENT '正式结束日期',
    user_limit INT DEFAULT 5 COMMENT '用户数量上限',
    user_count INT DEFAULT 0 COMMENT '当前用户数量',
    storage_limit BIGINT DEFAULT 1024 COMMENT '存储空间上限（MB）',
    storage_used BIGINT DEFAULT 0 COMMENT '已使用存储空间（MB）',
    project_limit INT DEFAULT 3 COMMENT '项目数量上限',
    project_count INT DEFAULT 0 COMMENT '当前项目数量',
    ai_call_limit INT DEFAULT 100 COMMENT 'AI调用次数上限（每月）',
    ai_call_count INT DEFAULT 0 COMMENT '当前月AI调用次数',
    ai_enabled TINYINT(1) DEFAULT 1 COMMENT '是否启用AI功能',
    knowledge_enabled TINYINT(1) DEFAULT 0 COMMENT '是否启用知识库功能',
    advanced_report_enabled TINYINT(1) DEFAULT 0 COMMENT '是否启用高级报表',
    custom_domain VARCHAR(100) COMMENT '自定义域名',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    create_by BIGINT COMMENT '创建人',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    update_by BIGINT COMMENT '更新人',
    deleted TINYINT(1) DEFAULT 0 COMMENT '是否删除',
    version INT DEFAULT 0 COMMENT '乐观锁版本号',
    PRIMARY KEY (id),
    UNIQUE KEY uk_tenant_code (tenant_code),
    KEY idx_status (status),
    KEY idx_package_id (package_id),
    KEY idx_end_date (end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='租户表';

-- =============================================
-- 3. 租户账单表
-- =============================================
CREATE TABLE IF NOT EXISTS sys_tenant_billing (
    id BIGINT NOT NULL COMMENT '账单ID',
    tenant_id BIGINT NOT NULL COMMENT '租户ID',
    bill_no VARCHAR(50) NOT NULL COMMENT '账单编号',
    bill_type TINYINT NOT NULL COMMENT '账单类型（1-套餐订阅、2-资源扩展、3-增值服务）',
    package_id BIGINT COMMENT '套餐ID',
    package_name VARCHAR(100) COMMENT '套餐名称',
    billing_cycle TINYINT COMMENT '计费周期类型（1-月付、2-年付）',
    billing_start_date DATE COMMENT '计费开始日期',
    billing_end_date DATE COMMENT '计费结束日期',
    original_amount DECIMAL(10,2) DEFAULT 0.00 COMMENT '原价',
    discount_amount DECIMAL(10,2) DEFAULT 0.00 COMMENT '折扣金额',
    coupon_amount DECIMAL(10,2) DEFAULT 0.00 COMMENT '优惠券抵扣',
    pay_amount DECIMAL(10,2) DEFAULT 0.00 COMMENT '实付金额',
    pay_status TINYINT DEFAULT 0 COMMENT '支付状态（0-待支付、1-已支付、2-已取消、3-已退款）',
    pay_method TINYINT COMMENT '支付方式（1-支付宝、2-微信、3-银行转账、4-对公转账）',
    pay_time DATETIME COMMENT '支付时间',
    transaction_no VARCHAR(100) COMMENT '第三方支付流水号',
    invoice_status TINYINT DEFAULT 0 COMMENT '发票状态（0-未开票、1-已申请、2-已开票）',
    invoice_id BIGINT COMMENT '发票ID',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    create_by BIGINT COMMENT '创建人',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    update_by BIGINT COMMENT '更新人',
    deleted TINYINT(1) DEFAULT 0 COMMENT '是否删除',
    PRIMARY KEY (id),
    UNIQUE KEY uk_bill_no (bill_no),
    KEY idx_tenant_id (tenant_id),
    KEY idx_pay_status (pay_status),
    KEY idx_create_time (create_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='租户账单表';

-- =============================================
-- 4. 租户配额使用记录表
-- =============================================
CREATE TABLE IF NOT EXISTS sys_tenant_quota_usage (
    id BIGINT NOT NULL COMMENT '记录ID',
    tenant_id BIGINT NOT NULL COMMENT '租户ID',
    stat_date DATE NOT NULL COMMENT '统计日期',
    stat_month VARCHAR(6) NOT NULL COMMENT '统计月份（格式：YYYYMM）',
    user_count INT DEFAULT 0 COMMENT '用户数量',
    active_user_count INT DEFAULT 0 COMMENT '活跃用户数量',
    project_count INT DEFAULT 0 COMMENT '项目数量',
    active_project_count INT DEFAULT 0 COMMENT '活跃项目数量',
    task_count INT DEFAULT 0 COMMENT '任务数量',
    completed_task_count INT DEFAULT 0 COMMENT '已完成任务数量',
    document_count INT DEFAULT 0 COMMENT '文档数量',
    storage_used BIGINT DEFAULT 0 COMMENT '存储使用量（MB）',
    ai_call_count INT DEFAULT 0 COMMENT 'AI调用次数',
    ai_token_used BIGINT DEFAULT 0 COMMENT 'AI Token消耗量',
    knowledge_doc_count INT DEFAULT 0 COMMENT '知识库文档数量',
    vector_storage_used BIGINT DEFAULT 0 COMMENT '向量存储使用量',
    api_call_count INT DEFAULT 0 COMMENT 'API调用次数',
    login_count INT DEFAULT 0 COMMENT '登录次数',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (id),
    UNIQUE KEY uk_tenant_date (tenant_id, stat_date),
    KEY idx_tenant_month (tenant_id, stat_month)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='租户配额使用记录表';

-- =============================================
-- 5. 租户配置表
-- =============================================
CREATE TABLE IF NOT EXISTS sys_tenant_config (
    id BIGINT NOT NULL COMMENT '配置ID',
    tenant_id BIGINT NOT NULL COMMENT '租户ID',
    config_key VARCHAR(100) NOT NULL COMMENT '配置键',
    config_value TEXT COMMENT '配置值',
    config_type VARCHAR(20) DEFAULT 'string' COMMENT '配置类型（string/number/boolean/json）',
    description VARCHAR(200) COMMENT '配置描述',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (id),
    UNIQUE KEY uk_tenant_key (tenant_id, config_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='租户配置表';

-- =============================================
-- 初始化套餐数据
-- =============================================
INSERT INTO sys_tenant_package (id, package_code, package_name, package_type, description, monthly_price, yearly_price, user_limit, storage_limit, project_limit, ai_call_limit, ai_enabled, knowledge_enabled, advanced_report_enabled, custom_domain_enabled, sso_enabled, api_enabled, data_export_enabled, audit_log_enabled, priority_support_enabled, sort_order, status, recommended) VALUES
(1, 'FREE', '免费版', 0, '适合个人或小团队体验使用', 0.00, 0.00, 5, 1024, 3, 100, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0),
(2, 'BASIC', '基础版', 1, '适合小型团队日常协作', 99.00, 999.00, 20, 10240, 10, 500, 1, 0, 0, 0, 0, 0, 1, 0, 0, 2, 1, 0),
(3, 'PROFESSIONAL', '专业版', 2, '适合中型团队高效协作', 299.00, 2999.00, 50, 51200, 50, 2000, 1, 1, 1, 0, 0, 1, 1, 1, 0, 3, 1, 1),
(4, 'ENTERPRISE', '企业版', 3, '适合大型企业全面管理', 999.00, 9999.00, 200, 204800, 200, 10000, 1, 1, 1, 1, 1, 1, 1, 1, 1, 4, 1, 0),
(5, 'FLAGSHIP', '旗舰版', 4, '无限制，适合超大型企业', 2999.00, 29999.00, -1, -1, -1, -1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5, 1, 0);

-- =============================================
-- 初始化默认租户（平台管理租户）
-- =============================================
INSERT INTO sys_tenant (id, tenant_code, tenant_name, short_name, contact_name, contact_phone, contact_email, package_id, status, user_limit, storage_limit, project_limit, ai_call_limit, ai_enabled, knowledge_enabled, advanced_report_enabled) VALUES
(1, 'PLATFORM', '摩塔平台', '摩塔', '管理员', '13800138000', 'admin@mota.com', 5, 1, -1, -1, -1, -1, 1, 1, 1);