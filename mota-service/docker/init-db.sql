-- =====================================================
-- Mota 微服务数据库初始化脚本
-- 为每个微服务创建独立的数据库
-- 版本: V2.1 (整合完整表结构，统一命名规范)
-- 更新日期: 2025-01-07
-- =====================================================

-- 设置字符集
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET character_set_connection=utf8mb4;

-- =====================================================
-- 创建数据库
-- =====================================================

-- 创建项目服务数据库 (mota-project-service 使用)
CREATE DATABASE IF NOT EXISTS mota_project DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建认证服务数据库 (mota-auth-service 使用)
CREATE DATABASE IF NOT EXISTS mota_auth DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建AI服务数据库 (mota-ai-service 使用)
CREATE DATABASE IF NOT EXISTS mota_ai DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建知识库服务数据库 (mota-knowledge-service 使用)
CREATE DATABASE IF NOT EXISTS mota_knowledge DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建通知服务数据库 (mota-notify-service 使用)
CREATE DATABASE IF NOT EXISTS mota_notify DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建日历服务数据库 (mota-calendar-service 使用)
CREATE DATABASE IF NOT EXISTS mota_calendar DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建用户服务数据库 (mota-user-service 使用)
CREATE DATABASE IF NOT EXISTS mota_user DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- =====================================================
-- 创建服务账户并授权
-- =====================================================

-- 项目服务账户
CREATE USER IF NOT EXISTS 'mota_project'@'%' IDENTIFIED BY 'mota123';
GRANT ALL PRIVILEGES ON mota_project.* TO 'mota_project'@'%';

-- 认证服务账户
CREATE USER IF NOT EXISTS 'mota_auth'@'%' IDENTIFIED BY 'mota123';
GRANT ALL PRIVILEGES ON mota_auth.* TO 'mota_auth'@'%';

-- AI服务账户
CREATE USER IF NOT EXISTS 'mota_ai'@'%' IDENTIFIED BY 'mota123';
GRANT ALL PRIVILEGES ON mota_ai.* TO 'mota_ai'@'%';

-- 知识库服务账户
CREATE USER IF NOT EXISTS 'mota_knowledge'@'%' IDENTIFIED BY 'mota123';
GRANT ALL PRIVILEGES ON mota_knowledge.* TO 'mota_knowledge'@'%';

-- 通知服务账户
CREATE USER IF NOT EXISTS 'mota_notify'@'%' IDENTIFIED BY 'mota123';
GRANT ALL PRIVILEGES ON mota_notify.* TO 'mota_notify'@'%';

-- 日历服务账户
CREATE USER IF NOT EXISTS 'mota_calendar'@'%' IDENTIFIED BY 'mota123';
GRANT ALL PRIVILEGES ON mota_calendar.* TO 'mota_calendar'@'%';

-- 用户服务账户
CREATE USER IF NOT EXISTS 'mota_user'@'%' IDENTIFIED BY 'mota123';
GRANT ALL PRIVILEGES ON mota_user.* TO 'mota_user'@'%';

-- 刷新权限
FLUSH PRIVILEGES;

-- =====================================================
-- mota_auth 数据库表结构 (认证服务)
-- =====================================================
USE mota_auth;

-- 用户表
CREATE TABLE IF NOT EXISTS sys_user (
    id BIGINT PRIMARY KEY COMMENT '主键ID',
    username VARCHAR(50) NOT NULL COMMENT '用户名',
    email VARCHAR(100) COMMENT '邮箱',
    phone VARCHAR(20) COMMENT '手机号',
    password_hash VARCHAR(255) NOT NULL COMMENT '密码哈希',
    nickname VARCHAR(100) COMMENT '昵称',
    avatar VARCHAR(500) COMMENT '头像URL',
    status INT DEFAULT 1 COMMENT '状态（0-禁用，1-启用）',
    enterprise_id BIGINT COMMENT '企业ID',
    tenant_id BIGINT COMMENT '租户ID',
    org_id VARCHAR(50) COMMENT '组织ID',
    org_name VARCHAR(100) COMMENT '组织名称',
    role VARCHAR(50) COMMENT '角色',
    department_id BIGINT COMMENT '部门ID',
    department_name VARCHAR(100) COMMENT '部门名称',
    last_login_at DATETIME COMMENT '最后登录时间',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    created_by BIGINT COMMENT '创建人ID',
    updated_by BIGINT COMMENT '更新人ID',
    deleted INT DEFAULT 0 COMMENT '删除标记',
    version INT DEFAULT 0 COMMENT '乐观锁版本号',
    UNIQUE KEY uk_username (username),
    UNIQUE KEY uk_email (email),
    INDEX idx_org_id (org_id),
    INDEX idx_department_id (department_id),
    INDEX idx_status (status),
    INDEX idx_tenant_id (tenant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 企业表
CREATE TABLE IF NOT EXISTS enterprise (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tenant_id BIGINT COMMENT '租户ID(每个企业是一个独立租户)',
    org_id VARCHAR(50) NOT NULL UNIQUE COMMENT '组织ID',
    name VARCHAR(200) NOT NULL COMMENT '企业名称',
    short_name VARCHAR(100) COMMENT '企业简称',
    industry_id BIGINT NOT NULL COMMENT '所属行业ID',
    industry_name VARCHAR(100) COMMENT '行业名称',
    logo VARCHAR(500) COMMENT '企业Logo',
    description TEXT COMMENT '企业简介',
    address VARCHAR(500) COMMENT '企业地址',
    contact_name VARCHAR(50) COMMENT '联系人姓名',
    contact_phone VARCHAR(20) COMMENT '联系电话',
    contact_email VARCHAR(100) COMMENT '联系邮箱',
    website VARCHAR(200) COMMENT '企业网站',
    scale VARCHAR(50) COMMENT '企业规模',
    admin_user_id BIGINT NOT NULL COMMENT '超级管理员用户ID',
    member_count INT DEFAULT 1 COMMENT '成员数量',
    max_members INT DEFAULT 100 COMMENT '最大成员数量',
    status TINYINT DEFAULT 1 COMMENT '状态',
    verified TINYINT DEFAULT 0 COMMENT '是否已认证',
    verified_at TIMESTAMP COMMENT '认证时间',
    expired_at TIMESTAMP COMMENT '服务到期时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT COMMENT '创建人ID',
    updated_by BIGINT COMMENT '更新人ID',
    deleted INT DEFAULT 0 COMMENT '删除标记',
    version INT DEFAULT 1 COMMENT '乐观锁版本号',
    INDEX idx_org_id (org_id),
    INDEX idx_industry (industry_id),
    INDEX idx_admin (admin_user_id),
    INDEX idx_status (status),
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_created_by (created_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='企业表';

-- 企业成员表
CREATE TABLE IF NOT EXISTS enterprise_member (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    enterprise_id BIGINT NOT NULL COMMENT '企业ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    role VARCHAR(30) DEFAULT 'member' COMMENT '角色',
    department_id BIGINT COMMENT '所属部门ID',
    position VARCHAR(100) COMMENT '职位',
    employee_no VARCHAR(50) COMMENT '工号',
    status TINYINT DEFAULT 1 COMMENT '状态',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '加入时间',
    invited_by BIGINT COMMENT '邀请人ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted INT DEFAULT 0 COMMENT '删除标记',
    UNIQUE KEY uk_enterprise_user (enterprise_id, user_id),
    INDEX idx_enterprise (enterprise_id),
    INDEX idx_user (user_id),
    INDEX idx_department (department_id),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='企业成员表';

-- 企业邀请表
CREATE TABLE IF NOT EXISTS enterprise_invitation (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    enterprise_id BIGINT NOT NULL COMMENT '企业ID',
    invite_code VARCHAR(100) NOT NULL UNIQUE COMMENT '邀请码',
    invite_type VARCHAR(20) DEFAULT 'link' COMMENT '邀请类型',
    target_email VARCHAR(100) COMMENT '目标邮箱',
    target_phone VARCHAR(20) COMMENT '目标手机号',
    role VARCHAR(30) DEFAULT 'member' COMMENT '邀请角色',
    department_id BIGINT COMMENT '邀请加入的部门ID',
    max_uses INT DEFAULT 1 COMMENT '最大使用次数',
    used_count INT DEFAULT 0 COMMENT '已使用次数',
    expired_at TIMESTAMP NOT NULL COMMENT '过期时间',
    status TINYINT DEFAULT 1 COMMENT '状态',
    invited_by BIGINT NOT NULL COMMENT '邀请人ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_enterprise (enterprise_id),
    INDEX idx_code (invite_code),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='企业邀请表';

-- 行业表
CREATE TABLE IF NOT EXISTS industry (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(50) NOT NULL UNIQUE COMMENT '行业代码',
    name VARCHAR(100) NOT NULL COMMENT '行业名称',
    parent_id BIGINT COMMENT '父行业ID',
    level INT DEFAULT 1 COMMENT '层级',
    sort_order INT DEFAULT 0 COMMENT '排序顺序',
    icon VARCHAR(100) COMMENT '行业图标',
    description VARCHAR(500) COMMENT '行业描述',
    status TINYINT DEFAULT 1 COMMENT '状态',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_parent (parent_id),
    INDEX idx_code (code),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='行业表';

-- 部门表
CREATE TABLE IF NOT EXISTS department (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    org_id VARCHAR(50) NOT NULL COMMENT '组织ID',
    name VARCHAR(100) NOT NULL COMMENT '部门名称',
    description VARCHAR(500) COMMENT '部门描述',
    manager_id BIGINT COMMENT '部门负责人ID',
    parent_id BIGINT COMMENT '上级部门ID',
    sort_order INT DEFAULT 0 COMMENT '排序顺序',
    status TINYINT DEFAULT 1 COMMENT '状态',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT COMMENT '创建人ID',
    updated_by BIGINT COMMENT '更新人ID',
    deleted INT DEFAULT 0 COMMENT '删除标记',
    version INT DEFAULT 0 COMMENT '乐观锁版本号',
    INDEX idx_org (org_id),
    INDEX idx_manager (manager_id),
    INDEX idx_parent (parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='部门表';

-- SSO提供商配置表
CREATE TABLE IF NOT EXISTS sys_sso_provider (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    provider_code VARCHAR(50) NOT NULL COMMENT '提供商代码',
    provider_name VARCHAR(100) NOT NULL COMMENT '提供商名称',
    provider_type VARCHAR(20) NOT NULL COMMENT '提供商类型',
    client_id VARCHAR(255) COMMENT 'OAuth2客户端ID',
    client_secret VARCHAR(500) COMMENT 'OAuth2客户端密钥',
    authorization_url VARCHAR(500) COMMENT '授权URL',
    token_url VARCHAR(500) COMMENT 'Token获取URL',
    user_info_url VARCHAR(500) COMMENT '用户信息URL',
    logout_url VARCHAR(500) COMMENT '登出URL',
    redirect_uri VARCHAR(500) COMMENT '回调URL',
    scope VARCHAR(255) COMMENT '授权范围',
    attribute_mapping JSON COMMENT '属性映射配置',
    auto_create_user TINYINT(1) DEFAULT 1 COMMENT '是否自动创建用户',
    default_role_id BIGINT COMMENT '默认角色ID',
    status TINYINT(1) DEFAULT 1 COMMENT '状态',
    sort_order INT DEFAULT 0 COMMENT '排序',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_provider_code (provider_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='SSO提供商配置表';

-- 用户SSO绑定表
CREATE TABLE IF NOT EXISTS sys_user_sso_binding (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
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
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_provider (user_id, provider_id),
    UNIQUE KEY uk_provider_external (provider_id, external_user_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户SSO绑定表';

-- 岗位表
CREATE TABLE IF NOT EXISTS sys_position (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    org_id BIGINT NOT NULL COMMENT '组织ID',
    position_code VARCHAR(50) NOT NULL COMMENT '岗位编码',
    position_name VARCHAR(100) NOT NULL COMMENT '岗位名称',
    position_level INT DEFAULT 1 COMMENT '岗位级别',
    position_category VARCHAR(50) COMMENT '岗位类别',
    parent_id BIGINT DEFAULT 0 COMMENT '上级岗位ID',
    department_id BIGINT COMMENT '所属部门ID',
    description TEXT COMMENT '岗位描述',
    responsibilities TEXT COMMENT '岗位职责',
    requirements TEXT COMMENT '任职要求',
    headcount INT DEFAULT 1 COMMENT '编制人数',
    current_count INT DEFAULT 0 COMMENT '当前人数',
    status TINYINT(1) DEFAULT 1 COMMENT '状态',
    sort_order INT DEFAULT 0 COMMENT '排序',
    created_by BIGINT COMMENT '创建人',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME COMMENT '删除时间',
    UNIQUE KEY uk_org_code (org_id, position_code),
    INDEX idx_org_id (org_id),
    INDEX idx_department_id (department_id),
    INDEX idx_parent_id (parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='岗位表';

-- 用户岗位关联表
CREATE TABLE IF NOT EXISTS sys_user_position (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL COMMENT '用户ID',
    position_id BIGINT NOT NULL COMMENT '岗位ID',
    is_primary TINYINT(1) DEFAULT 0 COMMENT '是否主岗位',
    start_date DATE COMMENT '任职开始日期',
    end_date DATE COMMENT '任职结束日期',
    appointment_type VARCHAR(20) DEFAULT 'FORMAL' COMMENT '任命类型',
    remark VARCHAR(500) COMMENT '备注',
    created_by BIGINT COMMENT '创建人',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_position (user_id, position_id),
    INDEX idx_user_id (user_id),
    INDEX idx_position_id (position_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户岗位关联表';

-- 数据权限规则表
CREATE TABLE IF NOT EXISTS sys_data_permission_rule (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    rule_name VARCHAR(100) NOT NULL COMMENT '规则名称',
    rule_code VARCHAR(50) NOT NULL COMMENT '规则编码',
    resource_type VARCHAR(50) NOT NULL COMMENT '资源类型',
    scope_type VARCHAR(20) NOT NULL COMMENT '范围类型',
    scope_value JSON COMMENT '范围值',
    condition_expression TEXT COMMENT '条件表达式',
    description VARCHAR(500) COMMENT '规则描述',
    status TINYINT(1) DEFAULT 1 COMMENT '状态',
    priority INT DEFAULT 0 COMMENT '优先级',
    created_by BIGINT COMMENT '创建人',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_rule_code (rule_code),
    INDEX idx_resource_type (resource_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='数据权限规则表';

-- 角色数据权限关联表
CREATE TABLE IF NOT EXISTS sys_role_data_permission (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    role_id BIGINT NOT NULL COMMENT '角色ID',
    rule_id BIGINT NOT NULL COMMENT '数据权限规则ID',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_role_rule (role_id, rule_id),
    INDEX idx_role_id (role_id),
    INDEX idx_rule_id (rule_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色数据权限关联表';

-- 数据变更日志表
CREATE TABLE IF NOT EXISTS sys_data_change_log (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    table_name VARCHAR(100) NOT NULL COMMENT '表名',
    record_id VARCHAR(100) NOT NULL COMMENT '记录ID',
    operation_type VARCHAR(20) NOT NULL COMMENT '操作类型',
    old_data JSON COMMENT '变更前数据',
    new_data JSON COMMENT '变更后数据',
    changed_fields JSON COMMENT '变更字段列表',
    change_summary VARCHAR(500) COMMENT '变更摘要',
    operator_id BIGINT COMMENT '操作人ID',
    operator_name VARCHAR(50) COMMENT '操作人姓名',
    operator_ip VARCHAR(50) COMMENT '操作人IP',
    operation_time DATETIME NOT NULL COMMENT '操作时间',
    request_id VARCHAR(100) COMMENT '请求ID',
    module_name VARCHAR(50) COMMENT '模块名称',
    business_type VARCHAR(50) COMMENT '业务类型',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_table_record (table_name, record_id),
    INDEX idx_operator_id (operator_id),
    INDEX idx_operation_time (operation_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='数据变更日志表';

-- 审计报告表
CREATE TABLE IF NOT EXISTS sys_audit_report (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    report_no VARCHAR(50) NOT NULL COMMENT '报告编号',
    report_name VARCHAR(200) NOT NULL COMMENT '报告名称',
    report_type VARCHAR(50) NOT NULL COMMENT '报告类型',
    report_period_start DATE NOT NULL COMMENT '报告周期开始',
    report_period_end DATE NOT NULL COMMENT '报告周期结束',
    report_scope JSON COMMENT '报告范围',
    summary TEXT COMMENT '报告摘要',
    findings JSON COMMENT '审计发现',
    statistics JSON COMMENT '统计数据',
    recommendations JSON COMMENT '改进建议',
    risk_level VARCHAR(20) COMMENT '风险等级',
    report_status VARCHAR(20) DEFAULT 'DRAFT' COMMENT '报告状态',
    report_file_url VARCHAR(500) COMMENT '报告文件URL',
    generated_by BIGINT COMMENT '生成人',
    generated_at DATETIME COMMENT '生成时间',
    reviewed_by BIGINT COMMENT '审核人',
    reviewed_at DATETIME COMMENT '审核时间',
    published_by BIGINT COMMENT '发布人',
    published_at DATETIME COMMENT '发布时间',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_report_no (report_no),
    INDEX idx_report_type (report_type),
    INDEX idx_report_status (report_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='审计报告表';

-- 合规规则表
CREATE TABLE IF NOT EXISTS sys_compliance_rule (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    rule_name VARCHAR(100) NOT NULL COMMENT '规则名称',
    rule_code VARCHAR(50) NOT NULL COMMENT '规则编码',
    rule_category VARCHAR(50) NOT NULL COMMENT '规则类别',
    rule_description TEXT COMMENT '规则描述',
    check_type VARCHAR(20) NOT NULL COMMENT '检查类型',
    check_expression TEXT COMMENT '检查表达式',
    check_params JSON COMMENT '检查参数',
    severity VARCHAR(20) DEFAULT 'MEDIUM' COMMENT '严重程度',
    remediation_steps TEXT COMMENT '修复步骤',
    reference_standard VARCHAR(200) COMMENT '参考标准',
    status TINYINT(1) DEFAULT 1 COMMENT '状态',
    created_by BIGINT COMMENT '创建人',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_rule_code (rule_code),
    INDEX idx_rule_category (rule_category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='合规规则表';

-- 外部服务集成配置表
CREATE TABLE IF NOT EXISTS sys_external_integration (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    integration_name VARCHAR(100) NOT NULL COMMENT '集成名称',
    integration_code VARCHAR(50) NOT NULL COMMENT '集成编码',
    integration_type VARCHAR(50) NOT NULL COMMENT '集成类型',
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
    status TINYINT(1) DEFAULT 1 COMMENT '状态',
    created_by BIGINT COMMENT '创建人',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_integration_code (integration_code),
    INDEX idx_integration_type (integration_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='外部服务集成配置表';

-- =====================================================
-- mota_project 数据库表结构 (项目服务 - 核心业务)
-- =====================================================
USE mota_project;

-- 用户表（从 mota_auth 同步，用于 JOIN 查询）
CREATE TABLE IF NOT EXISTS sys_user (
    id BIGINT PRIMARY KEY COMMENT '主键ID',
    username VARCHAR(50) NOT NULL COMMENT '用户名',
    email VARCHAR(100) COMMENT '邮箱',
    phone VARCHAR(20) COMMENT '手机号',
    password_hash VARCHAR(255) COMMENT '密码哈希',
    nickname VARCHAR(100) COMMENT '昵称',
    avatar VARCHAR(500) COMMENT '头像URL',
    status INT DEFAULT 1 COMMENT '状态（0-禁用，1-启用）',
    enterprise_id BIGINT COMMENT '企业ID',
    org_id VARCHAR(50) COMMENT '组织ID',
    org_name VARCHAR(100) COMMENT '组织名称',
    role VARCHAR(50) COMMENT '角色',
    department_id BIGINT COMMENT '部门ID',
    department_name VARCHAR(100) COMMENT '部门名称',
    last_login_at DATETIME COMMENT '最后登录时间',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    created_by BIGINT COMMENT '创建人ID',
    updated_by BIGINT COMMENT '更新人ID',
    deleted INT DEFAULT 0 COMMENT '删除标记',
    version INT DEFAULT 0 COMMENT '乐观锁版本号',
    INDEX idx_username (username),
    INDEX idx_org_id (org_id),
    INDEX idx_department_id (department_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表（同步副本）';

-- 部门表（从 mota_auth 同步，用于 JOIN 查询）
CREATE TABLE IF NOT EXISTS department (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    org_id VARCHAR(50) NOT NULL COMMENT '组织ID',
    name VARCHAR(100) NOT NULL COMMENT '部门名称',
    description VARCHAR(500) COMMENT '部门描述',
    manager_id BIGINT COMMENT '部门负责人ID',
    parent_id BIGINT COMMENT '上级部门ID',
    sort_order INT DEFAULT 0 COMMENT '排序顺序',
    status TINYINT DEFAULT 1 COMMENT '状态',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT COMMENT '创建人ID',
    updated_by BIGINT COMMENT '更新人ID',
    deleted INT DEFAULT 0 COMMENT '删除标记',
    version INT DEFAULT 0 COMMENT '乐观锁版本号',
    INDEX idx_org (org_id),
    INDEX idx_manager (manager_id),
    INDEX idx_parent (parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='部门表（同步副本）';

-- 项目表
CREATE TABLE IF NOT EXISTS project (
    id BIGINT PRIMARY KEY COMMENT '主键ID',
    org_id VARCHAR(50) NOT NULL COMMENT '组织ID',
    name VARCHAR(200) NOT NULL COMMENT '项目名称',
    `key` VARCHAR(50) COMMENT '项目标识',
    description TEXT COMMENT '项目描述',
    status VARCHAR(30) DEFAULT 'planning' COMMENT '状态',
    owner_id BIGINT NOT NULL COMMENT '负责人ID',
    color VARCHAR(20) COMMENT '颜色',
    starred INT DEFAULT 0 COMMENT '是否收藏',
    progress INT DEFAULT 0 COMMENT '进度',
    member_count INT DEFAULT 0 COMMENT '成员数量',
    issue_count INT DEFAULT 0 COMMENT '任务数量',
    start_date DATE COMMENT '项目开始日期',
    end_date DATE COMMENT '项目结束日期',
    priority VARCHAR(20) DEFAULT 'medium' COMMENT '优先级',
    archived_at DATETIME COMMENT '归档时间',
    archived_by BIGINT COMMENT '归档人ID',
    visibility VARCHAR(20) DEFAULT 'private' COMMENT '可见性',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT COMMENT '创建人ID',
    updated_by BIGINT COMMENT '更新人ID',
    deleted INT DEFAULT 0 COMMENT '删除标记',
    version INT DEFAULT 0 COMMENT '乐观锁版本号',
    INDEX idx_org_id (org_id),
    INDEX idx_owner_id (owner_id),
    INDEX idx_status (status),
    INDEX idx_priority (priority)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='项目表';

-- 项目成员表
CREATE TABLE IF NOT EXISTS project_member (
    id BIGINT PRIMARY KEY COMMENT '主键ID',
    project_id BIGINT NOT NULL COMMENT '项目ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    role VARCHAR(30) DEFAULT 'member' COMMENT '项目角色',
    department_id BIGINT COMMENT '所属部门ID',
    joined_at DATETIME COMMENT '加入时间',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT COMMENT '创建人ID',
    updated_by BIGINT COMMENT '更新人ID',
    deleted INT DEFAULT 0 COMMENT '删除标记',
    version INT DEFAULT 0 COMMENT '乐观锁版本号',
    UNIQUE KEY uk_project_user (project_id, user_id),
    INDEX idx_project_id (project_id),
    INDEX idx_user_id (user_id),
    INDEX idx_department_id (department_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='项目成员表';

-- 项目附件表
CREATE TABLE IF NOT EXISTS project_attachment (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    project_id BIGINT NOT NULL COMMENT '项目ID',
    file_name VARCHAR(255) NOT NULL COMMENT '文件名',
    file_url VARCHAR(500) NOT NULL COMMENT '文件URL',
    file_size BIGINT COMMENT '文件大小',
    file_type VARCHAR(50) COMMENT '文件类型',
    description VARCHAR(500) COMMENT '文件说明',
    uploaded_by BIGINT NOT NULL COMMENT '上传人ID',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted INT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_project_id (project_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='项目附件表';

-- 部门任务表
CREATE TABLE IF NOT EXISTS department_task (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    project_id BIGINT NOT NULL COMMENT '所属项目ID',
    department_id BIGINT NOT NULL COMMENT '负责部门ID',
    manager_id BIGINT NOT NULL COMMENT '部门负责人ID',
    name VARCHAR(200) NOT NULL COMMENT '任务名称',
    description TEXT COMMENT '任务描述',
    status VARCHAR(30) DEFAULT 'pending' COMMENT '任务状态',
    priority VARCHAR(20) DEFAULT 'medium' COMMENT '优先级',
    start_date DATE COMMENT '开始日期',
    end_date DATE NOT NULL COMMENT '截止日期',
    progress INT DEFAULT 0 COMMENT '任务进度',
    require_plan TINYINT DEFAULT 1 COMMENT '是否需要提交工作计划',
    require_approval TINYINT DEFAULT 0 COMMENT '工作计划是否需要审批',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT NOT NULL COMMENT '创建人ID',
    updated_by BIGINT COMMENT '更新人ID',
    deleted INT DEFAULT 0 COMMENT '删除标记',
    version INT DEFAULT 0 COMMENT '乐观锁版本号',
    INDEX idx_project (project_id),
    INDEX idx_department (department_id),
    INDEX idx_manager (manager_id),
    INDEX idx_status (status),
    INDEX idx_end_date (end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='部门任务表';

-- 工作计划表
CREATE TABLE IF NOT EXISTS work_plan (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    department_task_id BIGINT NOT NULL COMMENT '所属部门任务ID',
    summary TEXT COMMENT '计划概述',
    resource_requirement TEXT COMMENT '资源需求说明',
    status VARCHAR(20) DEFAULT 'draft' COMMENT '计划状态',
    submitted_by BIGINT COMMENT '提交人ID',
    submitted_at TIMESTAMP COMMENT '提交时间',
    reviewed_by BIGINT COMMENT '审批人ID',
    reviewed_at TIMESTAMP COMMENT '审批时间',
    review_comment TEXT COMMENT '审批意见',
    version INT DEFAULT 1 COMMENT '版本号',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT COMMENT '创建人ID',
    updated_by BIGINT COMMENT '更新人ID',
    deleted INT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_department_task (department_task_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='工作计划表';

-- 工作计划附件表
CREATE TABLE IF NOT EXISTS work_plan_attachment (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    work_plan_id BIGINT NOT NULL COMMENT '所属工作计划ID',
    file_name VARCHAR(255) NOT NULL COMMENT '文件名',
    file_url VARCHAR(500) NOT NULL COMMENT '文件URL',
    file_size BIGINT COMMENT '文件大小',
    file_type VARCHAR(50) COMMENT '文件类型',
    uploaded_by BIGINT NOT NULL COMMENT '上传人ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted INT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_work_plan (work_plan_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='工作计划附件表';

-- 执行任务表
CREATE TABLE IF NOT EXISTS task (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    department_task_id BIGINT NOT NULL COMMENT '所属部门任务ID',
    project_id BIGINT NOT NULL COMMENT '所属项目ID',
    name VARCHAR(255) NOT NULL COMMENT '任务名称',
    description TEXT COMMENT '任务描述',
    assignee_id BIGINT COMMENT '执行人ID',
    status VARCHAR(20) DEFAULT 'pending' COMMENT '任务状态',
    priority VARCHAR(20) DEFAULT 'medium' COMMENT '优先级',
    start_date DATE COMMENT '开始日期',
    end_date DATE COMMENT '截止日期',
    progress INT DEFAULT 0 COMMENT '任务进度',
    progress_note TEXT COMMENT '进度说明',
    sort_order INT DEFAULT 0 COMMENT '排序顺序',
    completed_at TIMESTAMP COMMENT '完成时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT NOT NULL COMMENT '创建人ID',
    updated_by BIGINT COMMENT '更新人ID',
    deleted INT DEFAULT 0 COMMENT '删除标记',
    version INT DEFAULT 0 COMMENT '乐观锁版本号',
    INDEX idx_department_task (department_task_id),
    INDEX idx_project (project_id),
    INDEX idx_assignee (assignee_id),
    INDEX idx_status (status),
    INDEX idx_end_date (end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='执行任务表';

-- 任务交付物表
CREATE TABLE IF NOT EXISTS deliverable (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    task_id BIGINT NOT NULL COMMENT '所属任务ID',
    name VARCHAR(255) NOT NULL COMMENT '交付物名称',
    file_name VARCHAR(255) COMMENT '文件名',
    file_url VARCHAR(500) COMMENT '文件URL',
    file_size BIGINT COMMENT '文件大小',
    file_type VARCHAR(50) COMMENT '文件类型',
    description TEXT COMMENT '交付物说明',
    uploaded_by BIGINT NOT NULL COMMENT '上传人ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted INT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_task (task_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='任务交付物表';

-- 项目里程碑表
CREATE TABLE IF NOT EXISTS milestone (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    project_id BIGINT NOT NULL COMMENT '所属项目ID',
    name VARCHAR(200) NOT NULL COMMENT '里程碑名称',
    description TEXT COMMENT '里程碑描述',
    target_date DATE NOT NULL COMMENT '目标日期',
    status VARCHAR(20) DEFAULT 'pending' COMMENT '状态',
    completed_at TIMESTAMP COMMENT '完成时间',
    sort_order INT DEFAULT 0 COMMENT '排序顺序',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT COMMENT '创建人ID',
    updated_by BIGINT COMMENT '更新人ID',
    deleted INT DEFAULT 0 COMMENT '删除标记',
    version INT DEFAULT 0 COMMENT '乐观锁版本号',
    INDEX idx_project (project_id),
    INDEX idx_target_date (target_date),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='项目里程碑表';

-- 里程碑负责人关联表
CREATE TABLE IF NOT EXISTS milestone_assignee (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    milestone_id BIGINT NOT NULL COMMENT '里程碑ID',
    user_id BIGINT NOT NULL COMMENT '负责人用户ID',
    is_primary TINYINT(1) DEFAULT 0 COMMENT '是否主负责人',
    assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '分配时间',
    assigned_by BIGINT COMMENT '分配人ID',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT COMMENT '创建人ID',
    updated_by BIGINT COMMENT '更新人ID',
    deleted INT DEFAULT 0 COMMENT '删除标记',
    version INT DEFAULT 0 COMMENT '乐观锁版本号',
    UNIQUE KEY uk_milestone_user (milestone_id, user_id),
    KEY idx_milestone_id (milestone_id),
    KEY idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='里程碑负责人关联表';

-- 里程碑任务表
CREATE TABLE IF NOT EXISTS milestone_task (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    milestone_id BIGINT NOT NULL COMMENT '所属里程碑ID',
    project_id BIGINT NOT NULL COMMENT '所属项目ID',
    name VARCHAR(200) NOT NULL COMMENT '任务名称',
    description TEXT COMMENT '任务描述',
    assignee_id BIGINT COMMENT '执行人ID',
    assigned_by BIGINT COMMENT '分配人ID',
    status VARCHAR(20) DEFAULT 'pending' COMMENT '状态',
    priority VARCHAR(20) DEFAULT 'medium' COMMENT '优先级',
    progress INT DEFAULT 0 COMMENT '完成进度',
    start_date DATE COMMENT '开始日期',
    due_date DATE COMMENT '截止日期',
    completed_at DATETIME COMMENT '完成时间',
    sort_order INT DEFAULT 0 COMMENT '排序顺序',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted TINYINT(1) DEFAULT 0 COMMENT '是否删除',
    KEY idx_milestone_id (milestone_id),
    KEY idx_project_id (project_id),
    KEY idx_assignee_id (assignee_id),
    KEY idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='里程碑任务表';

-- 里程碑任务附件表
CREATE TABLE IF NOT EXISTS milestone_task_attachment (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    task_id BIGINT NOT NULL COMMENT '任务ID',
    milestone_id BIGINT NOT NULL COMMENT '里程碑ID',
    file_name VARCHAR(255) NOT NULL COMMENT '文件名',
    file_path VARCHAR(500) NOT NULL COMMENT '文件路径',
    file_size BIGINT COMMENT '文件大小',
    file_type VARCHAR(100) COMMENT '文件类型',
    upload_by BIGINT COMMENT '上传人ID',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    KEY idx_task_id (task_id),
    KEY idx_milestone_id (milestone_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='里程碑任务附件表';

-- 里程碑任务进度记录表
CREATE TABLE IF NOT EXISTS milestone_task_progress_record (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    task_id BIGINT NOT NULL COMMENT '任务ID',
    previous_progress INT DEFAULT 0 COMMENT '更新前进度',
    current_progress INT DEFAULT 0 COMMENT '更新后进度',
    description TEXT COMMENT '进度描述',
    attachments JSON COMMENT '附件列表',
    updated_by BIGINT COMMENT '更新人ID',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted INT DEFAULT 0 COMMENT '逻辑删除标记',
    version INT DEFAULT 1 COMMENT '乐观锁版本号',
    INDEX idx_task_id (task_id),
    INDEX idx_updated_by (updated_by),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='里程碑任务进度记录表';

-- 里程碑/任务评论表
CREATE TABLE IF NOT EXISTS milestone_comment (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    milestone_id BIGINT COMMENT '里程碑ID',
    task_id BIGINT COMMENT '任务ID',
    user_id BIGINT NOT NULL COMMENT '评论人ID',
    content TEXT NOT NULL COMMENT '评论内容',
    parent_id BIGINT COMMENT '父评论ID',
    is_reminder TINYINT(1) DEFAULT 0 COMMENT '是否催办',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted TINYINT(1) DEFAULT 0 COMMENT '是否删除',
    KEY idx_milestone_id (milestone_id),
    KEY idx_task_id (task_id),
    KEY idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='里程碑/任务评论表';

-- 任务评论表
CREATE TABLE IF NOT EXISTS task_comment (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    task_id BIGINT NOT NULL COMMENT '所属任务ID',
    parent_id BIGINT COMMENT '父评论ID',
    user_id BIGINT NOT NULL COMMENT '评论人ID',
    content TEXT NOT NULL COMMENT '评论内容',
    mentioned_users JSON COMMENT '@提及的用户ID列表',
    like_count INT DEFAULT 0 COMMENT '点赞数',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted INT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_task (task_id),
    INDEX idx_parent (parent_id),
    INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='任务评论表';

-- 工作反馈表
CREATE TABLE IF NOT EXISTS work_feedback (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    project_id BIGINT COMMENT '关联项目ID',
    task_id BIGINT COMMENT '关联任务ID',
    feedback_type VARCHAR(30) NOT NULL COMMENT '反馈类型',
    from_user_id BIGINT NOT NULL COMMENT '发起人ID',
    to_user_id BIGINT NOT NULL COMMENT '接收人ID',
    title VARCHAR(200) COMMENT '反馈标题',
    content TEXT NOT NULL COMMENT '反馈内容',
    rating INT COMMENT '评价等级',
    require_reply TINYINT DEFAULT 0 COMMENT '是否需要回复',
    status VARCHAR(20) DEFAULT 'pending' COMMENT '状态',
    reply_content TEXT COMMENT '回复内容',
    replied_at TIMESTAMP COMMENT '回复时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted INT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_from_user (from_user_id),
    INDEX idx_to_user (to_user_id),
    INDEX idx_task (task_id),
    INDEX idx_project (project_id),
    INDEX idx_type (feedback_type),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='工作反馈表';

-- 进度汇报表
CREATE TABLE IF NOT EXISTS progress_report (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    project_id BIGINT NOT NULL COMMENT '关联项目ID',
    department_task_id BIGINT COMMENT '关联部门任务ID',
    report_type VARCHAR(20) NOT NULL COMMENT '汇报类型',
    reporter_id BIGINT NOT NULL COMMENT '汇报人ID',
    report_period_start DATE COMMENT '汇报周期开始',
    report_period_end DATE COMMENT '汇报周期结束',
    completed_work TEXT COMMENT '已完成工作',
    planned_work TEXT COMMENT '计划工作',
    issues_risks TEXT COMMENT '问题与风险',
    support_needed TEXT COMMENT '需要的支持',
    task_progress JSON COMMENT '关联任务进度快照',
    recipients JSON COMMENT '汇报接收人ID列表',
    status VARCHAR(20) DEFAULT 'draft' COMMENT '状态',
    submitted_at TIMESTAMP COMMENT '提交时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted INT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_project (project_id),
    INDEX idx_department_task (department_task_id),
    INDEX idx_reporter (reporter_id),
    INDEX idx_type (report_type),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='进度汇报表';

-- 任务依赖关系表
CREATE TABLE IF NOT EXISTS task_dependency (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    predecessor_id BIGINT NOT NULL COMMENT '前置任务ID',
    successor_id BIGINT NOT NULL COMMENT '后继任务ID',
    dependency_type VARCHAR(10) NOT NULL DEFAULT 'FS' COMMENT '依赖类型',
    lag_days INT DEFAULT 0 COMMENT '延迟天数',
    description VARCHAR(500) COMMENT '依赖说明',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT COMMENT '创建人ID',
    updated_by BIGINT COMMENT '更新人ID',
    deleted INT DEFAULT 0 COMMENT '删除标记',
    version INT DEFAULT 0 COMMENT '乐观锁版本号',
    UNIQUE KEY uk_predecessor_successor (predecessor_id, successor_id, deleted),
    INDEX idx_predecessor (predecessor_id),
    INDEX idx_successor (successor_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='任务依赖关系表';

-- 子任务表
CREATE TABLE IF NOT EXISTS subtask (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    parent_task_id BIGINT NOT NULL COMMENT '父任务ID',
    project_id BIGINT NOT NULL COMMENT '所属项目ID',
    name VARCHAR(255) NOT NULL COMMENT '子任务名称',
    description TEXT COMMENT '子任务描述',
    assignee_id BIGINT COMMENT '执行人ID',
    status VARCHAR(20) DEFAULT 'pending' COMMENT '状态',
    priority VARCHAR(20) DEFAULT 'medium' COMMENT '优先级',
    start_date DATE COMMENT '开始日期',
    end_date DATE COMMENT '截止日期',
    progress INT DEFAULT 0 COMMENT '进度',
    sort_order INT DEFAULT 0 COMMENT '排序顺序',
    completed_at TIMESTAMP COMMENT '完成时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT NOT NULL COMMENT '创建人ID',
    updated_by BIGINT COMMENT '更新人ID',
    deleted INT DEFAULT 0 COMMENT '删除标记',
    version INT DEFAULT 0 COMMENT '乐观锁版本号',
    INDEX idx_parent_task (parent_task_id),
    INDEX idx_project (project_id),
    INDEX idx_assignee (assignee_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='子任务表';

-- 检查清单表
CREATE TABLE IF NOT EXISTS checklist (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    task_id BIGINT NOT NULL COMMENT '所属任务ID',
    name VARCHAR(255) NOT NULL COMMENT '清单名称',
    sort_order INT DEFAULT 0 COMMENT '排序顺序',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT COMMENT '创建人ID',
    updated_by BIGINT COMMENT '更新人ID',
    deleted INT DEFAULT 0 COMMENT '删除标记',
    version INT DEFAULT 0 COMMENT '乐观锁版本号',
    INDEX idx_task (task_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='检查清单表';

-- 检查清单项表
CREATE TABLE IF NOT EXISTS checklist_item (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    checklist_id BIGINT NOT NULL COMMENT '所属清单ID',
    content VARCHAR(500) NOT NULL COMMENT '检查项内容',
    is_completed TINYINT DEFAULT 0 COMMENT '是否完成',
    completed_by BIGINT COMMENT '完成人ID',
    completed_at TIMESTAMP COMMENT '完成时间',
    assignee_id BIGINT COMMENT '负责人ID',
    due_date DATE COMMENT '截止日期',
    sort_order INT DEFAULT 0 COMMENT '排序顺序',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT COMMENT '创建人ID',
    updated_by BIGINT COMMENT '更新人ID',
    deleted INT DEFAULT 0 COMMENT '删除标记',
    version INT DEFAULT 0 COMMENT '乐观锁版本号',
    INDEX idx_checklist (checklist_id),
    INDEX idx_is_completed (is_completed),
    INDEX idx_assignee (assignee_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='检查清单项表';

-- 任务模板表
CREATE TABLE IF NOT EXISTS task_template (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL COMMENT '模板名称',
    description TEXT COMMENT '模板描述',
    category VARCHAR(50) COMMENT '模板分类',
    template_data JSON NOT NULL COMMENT '模板数据',
    is_public TINYINT DEFAULT 0 COMMENT '是否公开',
    usage_count INT DEFAULT 0 COMMENT '使用次数',
    org_id VARCHAR(50) COMMENT '组织ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT COMMENT '创建人ID',
    updated_by BIGINT COMMENT '更新人ID',
    deleted INT DEFAULT 0 COMMENT '删除标记',
    version INT DEFAULT 0 COMMENT '乐观锁版本号',
    INDEX idx_category (category),
    INDEX idx_is_public (is_public),
    INDEX idx_org (org_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='任务模板表';

-- 活动动态表
CREATE TABLE IF NOT EXISTS activity (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    type VARCHAR(50) NOT NULL COMMENT '活动类型',
    action VARCHAR(200) COMMENT '动作描述',
    target VARCHAR(500) COMMENT '目标名称',
    target_id BIGINT COMMENT '目标ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    project_id BIGINT COMMENT '项目ID',
    time VARCHAR(50) COMMENT '时间描述',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_project_id (project_id),
    INDEX idx_type (type),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='活动动态表';

-- AI历史记录表
CREATE TABLE IF NOT EXISTS ai_history (
    id VARCHAR(64) PRIMARY KEY COMMENT '主键ID',
    title VARCHAR(200) COMMENT '标题',
    type VARCHAR(50) COMMENT '类型',
    status VARCHAR(30) COMMENT '状态',
    creator VARCHAR(100) COMMENT '创建者名称',
    creator_id BIGINT COMMENT '创建者ID',
    content LONGTEXT COMMENT '内容',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_creator_id (creator_id),
    INDEX idx_type (type),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI历史记录表';

-- AI新闻表
CREATE TABLE IF NOT EXISTS ai_news (
    id VARCHAR(64) PRIMARY KEY COMMENT '主键ID',
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
    INDEX idx_category (category),
    INDEX idx_is_starred (is_starred),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI新闻表';

-- 文档表
CREATE TABLE IF NOT EXISTS document (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL COMMENT '文档标题',
    content LONGTEXT COMMENT '文档内容',
    content_type VARCHAR(20) DEFAULT 'markdown' COMMENT '内容类型',
    summary VARCHAR(500) COMMENT '文档摘要',
    cover_image VARCHAR(500) COMMENT '封面图片URL',
    project_id BIGINT COMMENT '所属项目ID',
    folder_id BIGINT COMMENT '所属文件夹ID',
    creator_id BIGINT NOT NULL COMMENT '创建者ID',
    status VARCHAR(20) DEFAULT 'draft' COMMENT '状态',
    is_template TINYINT(1) DEFAULT 0 COMMENT '是否为模板',
    template_category VARCHAR(50) COMMENT '模板分类',
    visibility VARCHAR(20) DEFAULT 'project' COMMENT '可见性',
    allow_comments TINYINT(1) DEFAULT 1 COMMENT '是否允许评论',
    allow_edit TINYINT(1) DEFAULT 1 COMMENT '是否允许编辑',
    view_count INT DEFAULT 0 COMMENT '浏览次数',
    like_count INT DEFAULT 0 COMMENT '点赞次数',
    comment_count INT DEFAULT 0 COMMENT '评论数量',
    current_version INT DEFAULT 1 COMMENT '当前版本号',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    published_at DATETIME COMMENT '发布时间',
    INDEX idx_project_id (project_id),
    INDEX idx_folder_id (folder_id),
    INDEX idx_creator_id (creator_id),
    INDEX idx_status (status),
    INDEX idx_is_template (is_template)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='文档表';

-- 文档版本表
CREATE TABLE IF NOT EXISTS document_version (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    document_id BIGINT NOT NULL COMMENT '文档ID',
    version_number INT NOT NULL COMMENT '版本号',
    title VARCHAR(255) NOT NULL COMMENT '版本标题',
    content LONGTEXT COMMENT '版本内容',
    change_summary VARCHAR(500) COMMENT '变更摘要',
    editor_id BIGINT NOT NULL COMMENT '编辑者ID',
    editor_name VARCHAR(100) COMMENT '编辑者名称',
    version_type VARCHAR(20) DEFAULT 'minor' COMMENT '版本类型',
    diff_content LONGTEXT COMMENT '与上一版本的差异',
    content_hash VARCHAR(64) COMMENT '内容哈希值',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_document_id (document_id),
    INDEX idx_version_number (document_id, version_number),
    INDEX idx_editor_id (editor_id),
    UNIQUE KEY uk_document_version (document_id, version_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='文档版本表';

-- 文档收藏表
CREATE TABLE IF NOT EXISTS document_favorite (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL COMMENT '用户ID',
    document_id BIGINT NOT NULL COMMENT '文档ID',
    folder_name VARCHAR(100) COMMENT '收藏夹分类名称',
    note TEXT COMMENT '收藏备注',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_document (user_id, document_id),
    INDEX idx_user_id (user_id),
    INDEX idx_document_id (document_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文档收藏表';

-- 文档访问记录表
CREATE TABLE IF NOT EXISTS document_access_log (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    document_id BIGINT NOT NULL COMMENT '文档ID',
    user_id BIGINT NOT NULL COMMENT '访问用户ID',
    project_id BIGINT COMMENT '项目ID',
    access_type VARCHAR(20) DEFAULT 'view' COMMENT '访问类型',
    access_source VARCHAR(50) COMMENT '访问来源',
    duration_seconds INT DEFAULT 0 COMMENT '停留时长',
    device_type VARCHAR(20) COMMENT '设备类型',
    browser VARCHAR(50) COMMENT '浏览器',
    ip_address VARCHAR(50) COMMENT 'IP地址',
    access_date DATE NOT NULL COMMENT '访问日期',
    access_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '访问时间',
    INDEX idx_document_id (document_id),
    INDEX idx_user_id (user_id),
    INDEX idx_project_id (project_id),
    INDEX idx_access_date (access_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='文档访问记录表';

-- 文档统计汇总表
CREATE TABLE IF NOT EXISTS document_stats_daily (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    document_id BIGINT NOT NULL COMMENT '文档ID',
    stats_date DATE NOT NULL COMMENT '统计日期',
    view_count INT DEFAULT 0 COMMENT '浏览次数',
    unique_visitors INT DEFAULT 0 COMMENT '独立访客数',
    download_count INT DEFAULT 0 COMMENT '下载次数',
    share_count INT DEFAULT 0 COMMENT '分享次数',
    copy_count INT DEFAULT 0 COMMENT '复制次数',
    reference_count INT DEFAULT 0 COMMENT '引用次数',
    total_duration_seconds BIGINT DEFAULT 0 COMMENT '总停留时长',
    avg_duration_seconds INT DEFAULT 0 COMMENT '平均停留时长',
    search_visits INT DEFAULT 0 COMMENT '搜索访问次数',
    direct_visits INT DEFAULT 0 COMMENT '直接访问次数',
    recommendation_visits INT DEFAULT 0 COMMENT '推荐访问次数',
    link_visits INT DEFAULT 0 COMMENT '链接访问次数',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_document_date (document_id, stats_date),
    INDEX idx_stats_date (stats_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='文档统计汇总表';

-- 热门文档排行表
CREATE TABLE IF NOT EXISTS document_ranking (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    document_id BIGINT NOT NULL COMMENT '文档ID',
    project_id BIGINT COMMENT '项目ID',
    ranking_type VARCHAR(20) NOT NULL COMMENT '排行类型',
    ranking_date DATE NOT NULL COMMENT '排行日期',
    rank_position INT NOT NULL COMMENT '排名位置',
    score DECIMAL(15,4) DEFAULT 0 COMMENT '综合得分',
    view_count INT DEFAULT 0 COMMENT '浏览次数',
    unique_visitors INT DEFAULT 0 COMMENT '独立访客数',
    reuse_count INT DEFAULT 0 COMMENT '复用次数',
    like_count INT DEFAULT 0 COMMENT '点赞数',
    comment_count INT DEFAULT 0 COMMENT '评论数',
    rank_change INT DEFAULT 0 COMMENT '排名变化',
    view_change_rate DECIMAL(5,4) DEFAULT 0 COMMENT '浏览量变化率',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_document_type_date (document_id, ranking_type, ranking_date),
    INDEX idx_ranking_type_date (ranking_type, ranking_date),
    INDEX idx_rank_position (rank_position),
    INDEX idx_project_id (project_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='热门文档排行表';

-- 搜索记录表
CREATE TABLE IF NOT EXISTS search_log (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT COMMENT '搜索用户ID',
    project_id BIGINT COMMENT '项目ID',
    keyword VARCHAR(200) NOT NULL COMMENT '搜索关键词',
    search_type VARCHAR(20) DEFAULT 'document' COMMENT '搜索类型',
    result_count INT DEFAULT 0 COMMENT '搜索结果数量',
    clicked_document_id BIGINT COMMENT '点击的文档ID',
    click_position INT COMMENT '点击位置',
    search_date DATE NOT NULL COMMENT '搜索日期',
    search_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '搜索时间',
    INDEX idx_user_id (user_id),
    INDEX idx_project_id (project_id),
    INDEX idx_keyword (keyword),
    INDEX idx_search_date (search_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='搜索记录表';

-- 搜索热词统计表
CREATE TABLE IF NOT EXISTS search_keyword_stats (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    keyword VARCHAR(200) NOT NULL COMMENT '搜索关键词',
    project_id BIGINT COMMENT '项目ID',
    stats_date DATE NOT NULL COMMENT '统计日期',
    search_count INT DEFAULT 0 COMMENT '搜索次数',
    unique_users INT DEFAULT 0 COMMENT '独立用户数',
    click_count INT DEFAULT 0 COMMENT '点击次数',
    avg_result_count DECIMAL(10,2) DEFAULT 0 COMMENT '平均结果数',
    click_rate DECIMAL(5,4) DEFAULT 0 COMMENT '点击率',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_keyword_project_date (keyword, project_id, stats_date),
    INDEX idx_stats_date (stats_date),
    INDEX idx_search_count (search_count DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='搜索热词统计表';

-- 知识复用记录表
CREATE TABLE IF NOT EXISTS knowledge_reuse_log (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    source_document_id BIGINT NOT NULL COMMENT '源文档ID',
    target_document_id BIGINT COMMENT '目标文档ID',
    target_task_id BIGINT COMMENT '目标任务ID',
    target_project_id BIGINT COMMENT '目标项目ID',
    user_id BIGINT NOT NULL COMMENT '复用用户ID',
    reuse_type VARCHAR(20) NOT NULL COMMENT '复用类型',
    reuse_content TEXT COMMENT '复用内容摘要',
    content_length INT DEFAULT 0 COMMENT '复用内容长度',
    reuse_date DATE NOT NULL COMMENT '复用日期',
    reuse_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '复用时间',
    INDEX idx_source_document (source_document_id),
    INDEX idx_target_document (target_document_id),
    INDEX idx_user_id (user_id),
    INDEX idx_reuse_date (reuse_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='知识复用记录表';

-- 知识缺口记录表
CREATE TABLE IF NOT EXISTS knowledge_gap (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    project_id BIGINT COMMENT '项目ID',
    gap_type VARCHAR(20) NOT NULL COMMENT '缺口类型',
    keyword VARCHAR(200) COMMENT '相关关键词',
    description TEXT COMMENT '缺口描述',
    occurrence_count INT DEFAULT 1 COMMENT '出现次数',
    affected_users INT DEFAULT 1 COMMENT '影响用户数',
    status VARCHAR(20) DEFAULT 'open' COMMENT '状态',
    priority VARCHAR(10) DEFAULT 'medium' COMMENT '优先级',
    resolved_by BIGINT COMMENT '解决者ID',
    resolved_document_id BIGINT COMMENT '解决文档ID',
    resolved_at DATETIME COMMENT '解决时间',
    resolution_note TEXT COMMENT '解决说明',
    first_occurred_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '首次出现时间',
    last_occurred_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '最后出现时间',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_project_id (project_id),
    INDEX idx_gap_type (gap_type),
    INDEX idx_status (status),
    INDEX idx_priority (priority)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='知识缺口记录表';

-- 知识图谱节点表
CREATE TABLE IF NOT EXISTS knowledge_node (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(200) NOT NULL COMMENT '节点名称',
    node_type VARCHAR(50) NOT NULL COMMENT '节点类型',
    description TEXT COMMENT '节点描述',
    related_id BIGINT COMMENT '关联对象ID',
    related_type VARCHAR(50) COMMENT '关联对象类型',
    properties TEXT COMMENT '节点属性',
    embedding_vector TEXT COMMENT '向量嵌入',
    reference_count INT DEFAULT 0 COMMENT '引用次数',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_node_type (node_type),
    INDEX idx_related (related_id, related_type),
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='知识图谱节点表';

-- 知识图谱边表
CREATE TABLE IF NOT EXISTS knowledge_edge (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    source_node_id BIGINT NOT NULL COMMENT '源节点ID',
    target_node_id BIGINT NOT NULL COMMENT '目标节点ID',
    relation_type VARCHAR(50) NOT NULL COMMENT '关系类型',
    weight DECIMAL(5,4) DEFAULT 1.0 COMMENT '关系权重',
    properties TEXT COMMENT '关系属性',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_source_node (source_node_id),
    INDEX idx_target_node (target_node_id),
    INDEX idx_relation_type (relation_type),
    UNIQUE KEY uk_edge (source_node_id, target_node_id, relation_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='知识图谱边表';

-- 工作流模板表
CREATE TABLE IF NOT EXISTS workflow_template (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL COMMENT '工作流名称',
    description TEXT COMMENT '工作流描述',
    project_id BIGINT COMMENT '所属项目ID',
    is_default TINYINT(1) DEFAULT 0 COMMENT '是否为默认工作流',
    is_system TINYINT(1) DEFAULT 0 COMMENT '是否为系统预设工作流',
    created_by BIGINT COMMENT '创建者ID',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted TINYINT(1) DEFAULT 0 COMMENT '删除标记',
    INDEX idx_project_id (project_id),
    INDEX idx_is_default (is_default),
    INDEX idx_created_by (created_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工作流模板表';

-- 工作流状态表
CREATE TABLE IF NOT EXISTS workflow_status (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    workflow_id BIGINT NOT NULL COMMENT '所属工作流ID',
    name VARCHAR(50) NOT NULL COMMENT '状态名称',
    description VARCHAR(200) COMMENT '状态描述',
    color VARCHAR(20) DEFAULT '#1890ff' COMMENT '状态颜色',
    icon VARCHAR(50) COMMENT '状态图标',
    sort_order INT DEFAULT 0 COMMENT '排序顺序',
    is_initial TINYINT(1) DEFAULT 0 COMMENT '是否为初始状态',
    is_final TINYINT(1) DEFAULT 0 COMMENT '是否为终态',
    status_type VARCHAR(20) DEFAULT 'todo' COMMENT '状态类型',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_workflow_id (workflow_id),
    INDEX idx_sort_order (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工作流状态表';

-- 工作流流转规则表
CREATE TABLE IF NOT EXISTS workflow_transition (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    workflow_id BIGINT NOT NULL COMMENT '所属工作流ID',
    from_status_id BIGINT NOT NULL COMMENT '源状态ID',
    to_status_id BIGINT NOT NULL COMMENT '目标状态ID',
    name VARCHAR(100) COMMENT '流转名称',
    description VARCHAR(200) COMMENT '流转描述',
    conditions TEXT COMMENT '流转条件',
    actions TEXT COMMENT '流转时执行的动作',
    allowed_roles TEXT COMMENT '允许执行此流转的角色',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_workflow_id (workflow_id),
    INDEX idx_from_status (from_status_id),
    INDEX idx_to_status (to_status_id),
    UNIQUE KEY uk_transition (workflow_id, from_status_id, to_status_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工作流流转规则表';

-- 用户视图配置表
CREATE TABLE IF NOT EXISTS user_view_config (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL COMMENT '用户ID',
    view_type VARCHAR(50) NOT NULL COMMENT '视图类型',
    name VARCHAR(100) NOT NULL COMMENT '视图名称',
    description VARCHAR(200) COMMENT '视图描述',
    config JSON NOT NULL COMMENT '视图配置',
    is_default TINYINT(1) DEFAULT 0 COMMENT '是否为默认视图',
    is_shared TINYINT(1) DEFAULT 0 COMMENT '是否共享给团队',
    project_id BIGINT COMMENT '关联项目ID',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_view_type (view_type),
    INDEX idx_is_default (is_default),
    INDEX idx_project_id (project_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户视图配置表';

-- 新闻数据源表 (mota_project 数据库)
CREATE TABLE IF NOT EXISTS news_data_source (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
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
    creator_id BIGINT COMMENT '创建者ID',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_source_type (source_type),
    INDEX idx_category (category),
    INDEX idx_is_enabled (is_enabled)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='新闻数据源表';

-- 新闻文章表 (mota_project 数据库)
CREATE TABLE IF NOT EXISTS news_article (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
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
    UNIQUE INDEX uk_external_id (source_id, external_id),
    INDEX idx_source_id (source_id),
    INDEX idx_category (category),
    INDEX idx_publish_time (publish_time),
    INDEX idx_is_policy (is_policy),
    INDEX idx_status (status),
    FULLTEXT INDEX ft_content (title, content, summary)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='新闻文章表';

-- 新闻收藏表 (mota_project 数据库)
CREATE TABLE IF NOT EXISTS news_favorite (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    article_id BIGINT NOT NULL COMMENT '文章ID',
    folder_id BIGINT COMMENT '收藏夹ID',
    note TEXT COMMENT '备注',
    tags JSON COMMENT '自定义标签',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE INDEX uk_user_article (user_id, article_id),
    INDEX idx_folder_id (folder_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='新闻收藏表';

-- 新闻分类表 (mota_project 数据库)
CREATE TABLE IF NOT EXISTS news_category (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    category_code VARCHAR(50) COMMENT '分类代码',
    category_name VARCHAR(100) NOT NULL COMMENT '分类名称',
    parent_id BIGINT COMMENT '父分类ID',
    level INT DEFAULT 1 COMMENT '层级',
    path VARCHAR(500) COMMENT '分类路径',
    icon VARCHAR(100) COMMENT '图标',
    color VARCHAR(20) COMMENT '颜色',
    description VARCHAR(500) COMMENT '描述',
    keywords JSON COMMENT '分类关键词',
    sort_order INT DEFAULT 0 COMMENT '排序',
    is_system TINYINT(1) DEFAULT 0 COMMENT '是否系统分类',
    is_enabled TINYINT(1) DEFAULT 1 COMMENT '是否启用',
    article_count INT DEFAULT 0 COMMENT '文章数量',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_parent_id (parent_id),
    INDEX idx_category_code (category_code),
    INDEX idx_is_enabled (is_enabled)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='新闻分类表';

-- 新闻收藏夹表 (mota_project 数据库)
CREATE TABLE IF NOT EXISTS news_favorite_folder (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    folder_name VARCHAR(100) NOT NULL COMMENT '收藏夹名称',
    description VARCHAR(500) COMMENT '描述',
    is_default TINYINT(1) DEFAULT 0 COMMENT '是否默认收藏夹',
    article_count INT DEFAULT 0 COMMENT '文章数量',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='新闻收藏夹表';

-- 新闻匹配记录表 (mota_project 数据库)
CREATE TABLE IF NOT EXISTS news_match_record (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    article_id BIGINT NOT NULL COMMENT '文章ID',
    team_id BIGINT COMMENT '团队ID',
    user_id BIGINT COMMENT '用户ID',
    match_type VARCHAR(50) COMMENT '匹配类型',
    match_score DECIMAL(5,2) COMMENT '匹配分数',
    matched_keywords JSON COMMENT '匹配的关键词',
    matched_industries JSON COMMENT '匹配的行业',
    matched_domains JSON COMMENT '匹配的业务领域',
    semantic_similarity DECIMAL(5,4) COMMENT '语义相似度',
    relevance_reason TEXT COMMENT '相关性原因',
    is_recommended TINYINT(1) DEFAULT 0 COMMENT '是否推荐',
    recommendation_rank INT COMMENT '推荐排名',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_article_id (article_id),
    INDEX idx_team_id (team_id),
    INDEX idx_user_id (user_id),
    INDEX idx_match_type (match_type),
    INDEX idx_is_recommended (is_recommended)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='新闻匹配记录表';

-- 新闻推送配置表 (mota_project 数据库)
CREATE TABLE IF NOT EXISTS news_push_config (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    user_id BIGINT COMMENT '用户ID',
    team_id BIGINT COMMENT '团队ID',
    push_enabled TINYINT(1) DEFAULT 1 COMMENT '是否开启推送',
    push_channels JSON COMMENT '推送渠道',
    push_frequency VARCHAR(20) DEFAULT 'daily' COMMENT '推送频率',
    push_time VARCHAR(10) COMMENT '推送时间',
    push_days JSON COMMENT '推送日期',
    timezone VARCHAR(50) DEFAULT 'Asia/Shanghai' COMMENT '时区',
    max_articles_per_push INT DEFAULT 10 COMMENT '每次推送最大文章数',
    min_match_score DECIMAL(5,2) DEFAULT 60 COMMENT '最低匹配分数',
    include_summary TINYINT(1) DEFAULT 1 COMMENT '是否包含摘要',
    include_image TINYINT(1) DEFAULT 1 COMMENT '是否包含图片',
    quiet_hours_start VARCHAR(10) COMMENT '免打扰开始时间',
    quiet_hours_end VARCHAR(10) COMMENT '免打扰结束时间',
    last_push_at DATETIME COMMENT '上次推送时间',
    next_push_at DATETIME COMMENT '下次推送时间',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_team_id (team_id),
    INDEX idx_push_enabled (push_enabled)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='新闻推送配置表';

-- 新闻推送记录表 (mota_project 数据库)
CREATE TABLE IF NOT EXISTS news_push_record (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    user_id BIGINT COMMENT '用户ID',
    team_id BIGINT COMMENT '团队ID',
    push_channel VARCHAR(50) COMMENT '推送渠道',
    push_type VARCHAR(20) COMMENT '推送类型',
    article_ids JSON COMMENT '推送的文章ID列表',
    article_count INT DEFAULT 0 COMMENT '文章数量',
    push_title VARCHAR(200) COMMENT '推送标题',
    push_content TEXT COMMENT '推送内容',
    push_status VARCHAR(20) DEFAULT 'pending' COMMENT '推送状态',
    sent_at DATETIME COMMENT '发送时间',
    opened_at DATETIME COMMENT '打开时间',
    click_count INT DEFAULT 0 COMMENT '点击次数',
    error_message TEXT COMMENT '错误信息',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_team_id (team_id),
    INDEX idx_push_status (push_status),
    INDEX idx_sent_at (sent_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='新闻推送记录表';

-- 新闻阅读记录表 (mota_project 数据库)
CREATE TABLE IF NOT EXISTS news_reading_record (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    article_id BIGINT NOT NULL COMMENT '文章ID',
    read_duration INT DEFAULT 0 COMMENT '阅读时长(秒)',
    read_progress DECIMAL(5,2) DEFAULT 0 COMMENT '阅读进度',
    is_finished TINYINT(1) DEFAULT 0 COMMENT '是否读完',
    source VARCHAR(50) COMMENT '来源',
    device VARCHAR(50) COMMENT '设备类型',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE INDEX uk_user_article (user_id, article_id),
    INDEX idx_user_id (user_id),
    INDEX idx_article_id (article_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='新闻阅读记录表';

-- 新闻用户偏好表 (mota_project 数据库)
CREATE TABLE IF NOT EXISTS news_user_preference (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    team_id BIGINT COMMENT '团队ID',
    role VARCHAR(50) COMMENT '用户角色',
    preferred_categories JSON COMMENT '偏好分类',
    preferred_sources JSON COMMENT '偏好来源',
    preferred_keywords JSON COMMENT '偏好关键词',
    blocked_keywords JSON COMMENT '屏蔽关键词',
    blocked_sources JSON COMMENT '屏蔽来源',
    interest_industries JSON COMMENT '感兴趣的行业',
    interest_topics JSON COMMENT '感兴趣的话题',
    reading_level VARCHAR(20) DEFAULT 'normal' COMMENT '阅读深度',
    content_language VARCHAR(20) DEFAULT 'zh' COMMENT '内容语言偏好',
    min_quality_score DECIMAL(5,2) DEFAULT 60 COMMENT '最低质量分数',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE INDEX uk_user_id (user_id),
    INDEX idx_team_id (team_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='新闻用户偏好表';

-- 新闻政策监控表 (mota_project 数据库)
CREATE TABLE IF NOT EXISTS news_policy_monitor (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    team_id BIGINT NOT NULL COMMENT '团队ID',
    monitor_name VARCHAR(100) NOT NULL COMMENT '监控名称',
    policy_types JSON COMMENT '监控的政策类型',
    policy_levels JSON COMMENT '监控的政策级别',
    keywords JSON COMMENT '监控关键词',
    industries JSON COMMENT '关联行业',
    regions JSON COMMENT '监控地区',
    departments JSON COMMENT '监控部门',
    is_enabled TINYINT(1) DEFAULT 1 COMMENT '是否启用',
    alert_enabled TINYINT(1) DEFAULT 1 COMMENT '是否开启提醒',
    alert_channels JSON COMMENT '提醒渠道',
    last_check_at DATETIME COMMENT '上次检查时间',
    matched_count INT DEFAULT 0 COMMENT '匹配数量',
    creator_id BIGINT COMMENT '创建者ID',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_team_id (team_id),
    INDEX idx_is_enabled (is_enabled),
    INDEX idx_creator_id (creator_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='新闻政策监控表';

-- 新闻业务领域表 (mota_project 数据库)
CREATE TABLE IF NOT EXISTS news_business_domain (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    team_id BIGINT NOT NULL COMMENT '团队ID',
    domain_name VARCHAR(100) NOT NULL COMMENT '业务领域名称',
    domain_type VARCHAR(50) COMMENT '领域类型',
    keywords JSON COMMENT '领域关键词',
    description TEXT COMMENT '领域描述',
    importance INT DEFAULT 5 COMMENT '重要程度',
    is_core TINYINT(1) DEFAULT 0 COMMENT '是否核心业务',
    related_industries JSON COMMENT '关联行业',
    competitors JSON COMMENT '竞争对手',
    target_customers JSON COMMENT '目标客户',
    creator_id BIGINT COMMENT '创建者ID',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_team_id (team_id),
    INDEX idx_domain_type (domain_type),
    INDEX idx_is_core (is_core)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='新闻业务领域表';

-- 新闻企业行业配置表 (mota_project 数据库)
CREATE TABLE IF NOT EXISTS news_enterprise_industry (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    team_id BIGINT NOT NULL COMMENT '团队ID',
    industry_code VARCHAR(50) COMMENT '行业代码',
    industry_name VARCHAR(100) NOT NULL COMMENT '行业名称',
    parent_industry_code VARCHAR(50) COMMENT '父行业代码',
    confidence DECIMAL(5,2) COMMENT '识别置信度',
    is_primary TINYINT(1) DEFAULT 0 COMMENT '是否主行业',
    is_auto_detected TINYINT(1) DEFAULT 0 COMMENT '是否AI自动识别',
    detection_source VARCHAR(20) COMMENT '识别来源',
    keywords JSON COMMENT '行业关键词',
    description TEXT COMMENT '行业描述',
    creator_id BIGINT COMMENT '创建者ID',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_team_id (team_id),
    INDEX idx_industry_code (industry_code),
    INDEX idx_is_primary (is_primary)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='新闻企业行业配置表';

-- 日历事件表 (mota_project 数据库 - 用于项目关联的日历事件)
CREATE TABLE IF NOT EXISTS calendar_event (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '事件ID',
    title VARCHAR(200) NOT NULL COMMENT '事件标题',
    description TEXT COMMENT '事件描述',
    event_type VARCHAR(50) DEFAULT 'other' COMMENT '事件类型',
    start_time DATETIME NOT NULL COMMENT '开始时间',
    end_time DATETIME NOT NULL COMMENT '结束时间',
    all_day TINYINT DEFAULT 0 COMMENT '是否全天事件',
    location VARCHAR(500) COMMENT '地点',
    color VARCHAR(20) COMMENT '颜色',
    creator_id BIGINT NOT NULL COMMENT '创建者ID',
    project_id BIGINT COMMENT '关联项目ID',
    task_id BIGINT COMMENT '关联任务ID',
    milestone_id BIGINT COMMENT '关联里程碑ID',
    recurrence_rule VARCHAR(50) DEFAULT 'none' COMMENT '循环规则',
    recurrence_end_date DATETIME COMMENT '循环结束日期',
    reminder_minutes INT DEFAULT 15 COMMENT '提醒时间(分钟)',
    visibility VARCHAR(20) DEFAULT 'private' COMMENT '可见性',
    status VARCHAR(20) DEFAULT 'active' COMMENT '状态',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_creator_id (creator_id),
    INDEX idx_project_id (project_id),
    INDEX idx_task_id (task_id),
    INDEX idx_milestone_id (milestone_id),
    INDEX idx_start_time (start_time),
    INDEX idx_end_time (end_time),
    INDEX idx_event_type (event_type),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='日历事件表';

-- 日历事件参与者表 (mota_project 数据库)
CREATE TABLE IF NOT EXISTS calendar_event_attendee (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '参与者ID',
    event_id BIGINT NOT NULL COMMENT '事件ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    email VARCHAR(100) COMMENT '邮箱',
    name VARCHAR(100) COMMENT '姓名',
    role VARCHAR(20) DEFAULT 'attendee' COMMENT '角色',
    status VARCHAR(20) DEFAULT 'pending' COMMENT '响应状态',
    response_time DATETIME COMMENT '响应时间',
    comment VARCHAR(500) COMMENT '备注',
    is_optional TINYINT DEFAULT 0 COMMENT '是否可选参与',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_event_user (event_id, user_id),
    INDEX idx_event_id (event_id),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='日历事件参与者表';

-- 日历配置表 (mota_project 数据库)
CREATE TABLE IF NOT EXISTS calendar_config (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '配置ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    enterprise_id BIGINT COMMENT '企业ID',
    default_view VARCHAR(20) DEFAULT 'month' COMMENT '默认视图',
    week_start INT DEFAULT 1 COMMENT '周起始日',
    work_hours_start TIME DEFAULT '09:00:00' COMMENT '工作时间开始',
    work_hours_end TIME DEFAULT '18:00:00' COMMENT '工作时间结束',
    work_days JSON COMMENT '工作日',
    timezone VARCHAR(50) DEFAULT 'Asia/Shanghai' COMMENT '时区',
    default_reminder INT DEFAULT 15 COMMENT '默认提醒时间',
    show_weekends TINYINT DEFAULT 1 COMMENT '显示周末',
    show_declined TINYINT DEFAULT 0 COMMENT '显示已拒绝事件',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_id (user_id),
    INDEX idx_enterprise_id (enterprise_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='日历配置表';

-- 日历订阅表 (mota_project 数据库)
CREATE TABLE IF NOT EXISTS calendar_subscription (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '订阅ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    enterprise_id BIGINT COMMENT '企业ID',
    name VARCHAR(100) NOT NULL COMMENT '订阅名称',
    subscription_type VARCHAR(50) NOT NULL COMMENT '订阅类型',
    source_url VARCHAR(500) COMMENT '订阅源URL',
    source_id BIGINT COMMENT '订阅源ID',
    color VARCHAR(20) COMMENT '颜色',
    is_visible TINYINT DEFAULT 1 COMMENT '是否可见',
    sync_frequency INT DEFAULT 60 COMMENT '同步频率',
    last_sync_at DATETIME COMMENT '最后同步时间',
    sync_status VARCHAR(20) DEFAULT 'success' COMMENT '同步状态',
    sync_error TEXT COMMENT '同步错误',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted TINYINT DEFAULT 0 COMMENT '是否删除',
    INDEX idx_user_id (user_id),
    INDEX idx_enterprise_id (enterprise_id),
    INDEX idx_subscription_type (subscription_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='日历订阅表';

-- =====================================================
-- mota_ai 数据库表结构 (AI服务)
-- =====================================================
USE mota_ai;

-- AI新闻表
CREATE TABLE IF NOT EXISTS ai_news (
    id VARCHAR(64) PRIMARY KEY COMMENT '主键ID',
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
    INDEX idx_category (category),
    INDEX idx_is_starred (is_starred),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI新闻表';

-- AI对话会话表
CREATE TABLE IF NOT EXISTS ai_chat_session (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '会话ID',
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
    INDEX idx_user_id (user_id),
    INDEX idx_enterprise_id (enterprise_id),
    INDEX idx_context (context_type, context_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI对话会话表';

-- AI对话消息表
CREATE TABLE IF NOT EXISTS ai_chat_message (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '消息ID',
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
    INDEX idx_session_id (session_id),
    INDEX idx_role (role),
    INDEX idx_intent_type (intent_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI对话消息表';

-- AI方案表
CREATE TABLE IF NOT EXISTS ai_proposal (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '方案ID',
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
    deleted TINYINT DEFAULT 0 COMMENT '是否删除',
    INDEX idx_user_id (user_id),
    INDEX idx_enterprise_id (enterprise_id),
    INDEX idx_project_id (project_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI方案表';

-- AI工作建议表
CREATE TABLE IF NOT EXISTS ai_work_suggestion (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '建议ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    enterprise_id BIGINT COMMENT '企业ID',
    type VARCHAR(50) COMMENT '建议类型',
    suggestion_type VARCHAR(50) NOT NULL COMMENT '建议类型',
    suggestion_title VARCHAR(200) NOT NULL COMMENT '建议标题',
    suggestion_content TEXT NOT NULL COMMENT '建议内容',
    suggestion_reason TEXT COMMENT '建议原因',
    related_type VARCHAR(50) COMMENT '关联类型',
    related_id BIGINT COMMENT '关联ID',
    title VARCHAR(200) COMMENT '建议标题',
    content TEXT COMMENT '建议内容',
    priority INT DEFAULT 0 COMMENT '优先级',
    priority_level INT DEFAULT 3 COMMENT '优先级',
    impact_score DECIMAL(5,2) COMMENT '影响评分',
    action_items JSON COMMENT '行动项列表',
    status VARCHAR(20) DEFAULT 'pending' COMMENT '状态',
    is_read BOOLEAN DEFAULT FALSE COMMENT '是否已读',
    is_accepted BOOLEAN COMMENT '是否采纳',
    is_dismissed BOOLEAN DEFAULT FALSE COMMENT '是否忽略',
    feedback_comment VARCHAR(500) COMMENT '反馈评论',
    valid_until DATETIME COMMENT '有效期至',
    context_type VARCHAR(50) COMMENT '上下文类型',
    context_id BIGINT COMMENT '上下文ID',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_enterprise_id (enterprise_id),
    INDEX idx_suggestion_type (suggestion_type),
    INDEX idx_is_read (is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI工作建议表';

-- AI文档向量表
CREATE TABLE IF NOT EXISTS ai_document_vector (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID',
    document_id BIGINT NOT NULL COMMENT '文档ID',
    chunk_index INT DEFAULT 0 COMMENT '分块索引',
    content TEXT COMMENT '文本内容',
    chunk_text TEXT NOT NULL COMMENT '分块文本',
    chunk_start INT COMMENT '分块起始位置',
    chunk_end INT COMMENT '分块结束位置',
    token_count INT COMMENT 'Token数量',
    embedding_model VARCHAR(100) DEFAULT 'text-embedding-ada-002' COMMENT '向量模型',
    embedding_dimension INT DEFAULT 1536 COMMENT '向量维度',
    embedding BLOB COMMENT '向量数据',
    embedding_json JSON COMMENT '向量数据JSON',
    vector JSON COMMENT '向量数据',
    vector_id VARCHAR(100) COMMENT '向量数据库中的ID',
    collection_name VARCHAR(100) COMMENT '向量集合名称',
    metadata JSON COMMENT '元数据',
    vectorize_status VARCHAR(20) NOT NULL DEFAULT 'pending' COMMENT '向量化状态',
    vectorize_error TEXT COMMENT '向量化错误信息',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_document_id (document_id),
    INDEX idx_vectorize_status (vectorize_status),
    INDEX idx_collection_name (collection_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI文档向量表';

-- 智能搜索日志表
CREATE TABLE IF NOT EXISTS smart_search_log (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    enterprise_id BIGINT COMMENT '企业ID',
    query VARCHAR(500) NOT NULL COMMENT '搜索查询',
    intent VARCHAR(100) COMMENT '识别的意图',
    results_count INT DEFAULT 0 COMMENT '结果数量',
    click_position INT COMMENT '点击位置',
    search_time INT COMMENT '搜索耗时(ms)',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_enterprise_id (enterprise_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='智能搜索日志表';

-- AI知识文档表
CREATE TABLE IF NOT EXISTS ai_knowledge_document (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    title VARCHAR(255) NOT NULL COMMENT '文档标题',
    original_filename VARCHAR(255) NOT NULL COMMENT '原始文件名',
    file_path VARCHAR(500) NOT NULL COMMENT '文件存储路径',
    file_type VARCHAR(50) NOT NULL COMMENT '文件类型',
    file_size BIGINT NOT NULL DEFAULT 0 COMMENT '文件大小',
    mime_type VARCHAR(100) COMMENT 'MIME类型',
    content_text LONGTEXT COMMENT '解析后的文本内容',
    content_html LONGTEXT COMMENT '解析后的HTML内容',
    parse_status VARCHAR(20) NOT NULL DEFAULT 'pending' COMMENT '解析状态',
    parse_error TEXT COMMENT '解析错误信息',
    parsed_at DATETIME COMMENT '解析完成时间',
    page_count INT DEFAULT 0 COMMENT '页数',
    word_count INT DEFAULT 0 COMMENT '字数统计',
    char_count INT DEFAULT 0 COMMENT '字符数统计',
    language VARCHAR(20) DEFAULT 'zh' COMMENT '文档语言',
    category_id BIGINT COMMENT '分类ID',
    folder_id BIGINT COMMENT '文件夹ID',
    team_id BIGINT COMMENT '团队ID',
    creator_id BIGINT NOT NULL COMMENT '创建者ID',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME COMMENT '删除时间',
    INDEX idx_team_id (team_id),
    INDEX idx_creator_id (creator_id),
    INDEX idx_category_id (category_id),
    INDEX idx_parse_status (parse_status),
    INDEX idx_file_type (file_type),
    FULLTEXT INDEX ft_content (content_text)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI知识文档表';

-- AI文档摘要表
CREATE TABLE IF NOT EXISTS ai_document_summary (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    document_id BIGINT NOT NULL COMMENT '文档ID',
    user_id BIGINT NOT NULL COMMENT '请求用户ID',
    summary_type VARCHAR(50) NOT NULL DEFAULT 'extractive' COMMENT '摘要类型',
    summary_length VARCHAR(20) DEFAULT 'medium' COMMENT '摘要长度',
    summary_text TEXT NOT NULL COMMENT '摘要文本',
    summary_content TEXT NOT NULL COMMENT '摘要内容',
    key_points JSON COMMENT '关键要点',
    keywords JSON COMMENT '关键词列表',
    word_count INT COMMENT '摘要字数',
    summary_word_count INT COMMENT '摘要字数',
    compression_ratio DECIMAL(5,2) COMMENT '压缩比例',
    model_used VARCHAR(100) COMMENT '使用的模型',
    tokens_used INT COMMENT '使用的Token数',
    generation_time_ms INT COMMENT '生成时间',
    quality_score DECIMAL(5,2) COMMENT '质量评分',
    feedback_rating INT COMMENT '用户评分',
    generation_status VARCHAR(20) NOT NULL DEFAULT 'completed' COMMENT '生成状态',
    generation_error TEXT COMMENT '生成错误信息',
    language VARCHAR(20) DEFAULT 'zh' COMMENT '语言',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_document_id (document_id),
    INDEX idx_user_id (user_id),
    INDEX idx_summary_type (summary_type),
    FULLTEXT INDEX ft_summary (summary_text)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI文档摘要表';

-- AI模型配置表
CREATE TABLE IF NOT EXISTS ai_model_config (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    model_type VARCHAR(50) NOT NULL COMMENT '模型类型',
    model_name VARCHAR(100) NOT NULL COMMENT '模型名称',
    model_provider VARCHAR(50) NOT NULL COMMENT '模型提供商',
    api_endpoint VARCHAR(500) COMMENT 'API端点',
    api_key_encrypted VARCHAR(500) COMMENT '加密的API密钥',
    model_params JSON COMMENT '模型参数',
    is_default TINYINT(1) DEFAULT 0 COMMENT '是否默认模型',
    is_enabled TINYINT(1) DEFAULT 1 COMMENT '是否启用',
    rate_limit INT COMMENT '速率限制',
    cost_per_1k_tokens DECIMAL(10,6) COMMENT '每1000token成本',
    team_id BIGINT COMMENT '团队ID',
    creator_id BIGINT NOT NULL COMMENT '创建者ID',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_model_type (model_type),
    INDEX idx_model_provider (model_provider),
    INDEX idx_team_id (team_id),
    INDEX idx_is_default (is_default)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI模型配置表';

-- AI使用统计表
CREATE TABLE IF NOT EXISTS ai_usage_stats (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
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
    UNIQUE INDEX uk_stat (stat_date, team_id, user_id, model_type, model_name),
    UNIQUE KEY uk_user_date_feature (user_id, stats_date, feature_type),
    INDEX idx_stat_date (stat_date),
    INDEX idx_stats_date (stats_date),
    INDEX idx_team_id (team_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI使用统计表';

-- AI模型提供商表
CREATE TABLE IF NOT EXISTS ai_model_provider (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    provider_code VARCHAR(50) NOT NULL COMMENT '提供商代码',
    provider_name VARCHAR(100) NOT NULL COMMENT '提供商名称',
    provider_type VARCHAR(50) NOT NULL COMMENT '类型',
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI模型提供商表';

-- AI方案会话表
CREATE TABLE IF NOT EXISTS ai_proposal_session (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    session_id VARCHAR(64) NOT NULL COMMENT '会话ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    team_id BIGINT COMMENT '团队ID',
    proposal_type VARCHAR(50) NOT NULL COMMENT '方案类型',
    title VARCHAR(200) COMMENT '方案标题',
    status VARCHAR(20) DEFAULT 'active' COMMENT '状态',
    intent_analysis JSON COMMENT '意图分析结果',
    requirement_summary TEXT COMMENT '需求摘要',
    context JSON COMMENT '上下文信息',
    message_count INT DEFAULT 0 COMMENT '消息数量',
    total_tokens INT DEFAULT 0 COMMENT '总Token数',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    completed_at DATETIME COMMENT '完成时间',
    UNIQUE INDEX uk_session_id (session_id),
    INDEX idx_user_id (user_id),
    INDEX idx_team_id (team_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI方案会话表';

-- AI方案内容表
CREATE TABLE IF NOT EXISTS ai_proposal_content (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    session_id VARCHAR(64) NOT NULL COMMENT '会话ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    team_id BIGINT COMMENT '团队ID',
    proposal_type VARCHAR(50) NOT NULL COMMENT '方案类型',
    title VARCHAR(200) NOT NULL COMMENT '方案标题',
    content LONGTEXT COMMENT '方案内容',
    content_html LONGTEXT COMMENT '方案内容HTML',
    summary TEXT COMMENT '方案摘要',
    outline JSON COMMENT '方案大纲',
    sections JSON COMMENT '章节结构',
    keywords JSON COMMENT '关键词',
    word_count INT DEFAULT 0 COMMENT '字数',
    version INT DEFAULT 1 COMMENT '版本号',
    status VARCHAR(20) DEFAULT 'draft' COMMENT '状态',
    quality_score DECIMAL(5,2) COMMENT '质量评分',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_session_id (session_id),
    INDEX idx_user_id (user_id),
    INDEX idx_team_id (team_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI方案内容表';

-- AI方案章节表
CREATE TABLE IF NOT EXISTS ai_proposal_section (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    proposal_id BIGINT NOT NULL COMMENT '方案ID',
    parent_id BIGINT DEFAULT 0 COMMENT '父章节ID',
    section_number VARCHAR(20) COMMENT '章节编号',
    title VARCHAR(200) NOT NULL COMMENT '章节标题',
    content TEXT COMMENT '章节内容',
    level INT DEFAULT 1 COMMENT '层级',
    sort_order INT DEFAULT 0 COMMENT '排序',
    word_count INT DEFAULT 0 COMMENT '字数',
    is_generated TINYINT(1) DEFAULT 1 COMMENT '是否AI生成',
    is_edited TINYINT(1) DEFAULT 0 COMMENT '是否已编辑',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_proposal_id (proposal_id),
    INDEX idx_parent_id (parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI方案章节表';

-- AI图表建议表
CREATE TABLE IF NOT EXISTS ai_chart_suggestion (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    proposal_id BIGINT NOT NULL COMMENT '方案ID',
    section_id BIGINT COMMENT '章节ID',
    chart_type VARCHAR(50) NOT NULL COMMENT '图表类型',
    title VARCHAR(200) COMMENT '图表标题',
    description TEXT COMMENT '图表描述',
    data_source TEXT COMMENT '数据来源说明',
    sample_data JSON COMMENT '示例数据',
    chart_config JSON COMMENT '图表配置',
    position VARCHAR(50) COMMENT '建议位置',
    is_applied TINYINT(1) DEFAULT 0 COMMENT '是否已应用',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_proposal_id (proposal_id),
    INDEX idx_section_id (section_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI图表建议表';

-- AI质量检查表
CREATE TABLE IF NOT EXISTS ai_quality_check (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    proposal_id BIGINT NOT NULL COMMENT '方案ID',
    check_type VARCHAR(50) NOT NULL COMMENT '检查类型',
    overall_score DECIMAL(5,2) COMMENT '总体评分',
    completeness_score DECIMAL(5,2) COMMENT '完整性评分',
    clarity_score DECIMAL(5,2) COMMENT '清晰度评分',
    consistency_score DECIMAL(5,2) COMMENT '一致性评分',
    accuracy_score DECIMAL(5,2) COMMENT '准确性评分',
    issues JSON COMMENT '发现的问题',
    suggestions JSON COMMENT '改进建议',
    auto_fixes JSON COMMENT '自动修复建议',
    checked_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_proposal_id (proposal_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI质量检查表';

-- AI方案版本表
CREATE TABLE IF NOT EXISTS ai_proposal_version (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    proposal_id BIGINT NOT NULL COMMENT '方案ID',
    version INT NOT NULL COMMENT '版本号',
    content LONGTEXT COMMENT '版本内容',
    change_summary TEXT COMMENT '变更摘要',
    change_type VARCHAR(50) COMMENT '变更类型',
    feedback TEXT COMMENT '用户反馈',
    created_by BIGINT COMMENT '创建者ID',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_proposal_id (proposal_id),
    INDEX idx_version (version)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI方案版本表';

-- AI方案导出记录表
CREATE TABLE IF NOT EXISTS ai_proposal_export (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    proposal_id BIGINT NOT NULL COMMENT '方案ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    export_format VARCHAR(20) NOT NULL COMMENT '导出格式',
    file_name VARCHAR(200) COMMENT '文件名',
    file_path VARCHAR(500) COMMENT '文件路径',
    file_size BIGINT COMMENT '文件大小',
    template_id BIGINT COMMENT '使用的模板ID',
    export_config JSON COMMENT '导出配置',
    status VARCHAR(20) DEFAULT 'pending' COMMENT '状态',
    error_message TEXT COMMENT '错误信息',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME COMMENT '完成时间',
    INDEX idx_proposal_id (proposal_id),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI方案导出记录表';

-- AI方案模板表
CREATE TABLE IF NOT EXISTS ai_proposal_template (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    name VARCHAR(100) NOT NULL COMMENT '模板名称',
    proposal_type VARCHAR(50) NOT NULL COMMENT '方案类型',
    description TEXT COMMENT '模板描述',
    outline JSON COMMENT '大纲结构',
    sections JSON COMMENT '章节模板',
    variables JSON COMMENT '变量定义',
    sample_content TEXT COMMENT '示例内容',
    is_system TINYINT(1) DEFAULT 0 COMMENT '是否系统模板',
    is_enabled TINYINT(1) DEFAULT 1 COMMENT '是否启用',
    use_count INT DEFAULT 0 COMMENT '使用次数',
    creator_id BIGINT COMMENT '创建者ID',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_proposal_type (proposal_type),
    INDEX idx_is_enabled (is_enabled)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI方案模板表';

-- AI需求解析表
CREATE TABLE IF NOT EXISTS ai_requirement_analysis (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    session_id VARCHAR(64) NOT NULL COMMENT '会话ID',
    original_text TEXT NOT NULL COMMENT '原始需求文本',
    parsed_intent VARCHAR(100) COMMENT '解析的意图',
    key_elements JSON COMMENT '关键要素',
    entities JSON COMMENT '识别的实体',
    constraints JSON COMMENT '约束条件',
    goals JSON COMMENT '目标列表',
    stakeholders JSON COMMENT '利益相关者',
    timeline JSON COMMENT '时间线要求',
    budget JSON COMMENT '预算要求',
    confidence DECIMAL(5,2) COMMENT '解析置信度',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_session_id (session_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI需求解析表';

-- 搜索索引配置表
CREATE TABLE IF NOT EXISTS search_index_config (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    index_name VARCHAR(100) NOT NULL COMMENT '索引名称',
    index_type VARCHAR(50) NOT NULL COMMENT '索引类型',
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

-- 搜索建议表
CREATE TABLE IF NOT EXISTS search_suggestion (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    suggestion_text VARCHAR(200) NOT NULL COMMENT '建议文本',
    suggestion_type VARCHAR(50) NOT NULL COMMENT '建议类型',
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

-- 搜索纠错词典表
CREATE TABLE IF NOT EXISTS search_correction_dict (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    wrong_word VARCHAR(100) NOT NULL COMMENT '错误词',
    correct_word VARCHAR(100) NOT NULL COMMENT '正确词',
    correction_type VARCHAR(50) DEFAULT 'spelling' COMMENT '纠错类型',
    confidence DECIMAL(5,4) DEFAULT 1.0 COMMENT '置信度',
    usage_count INT DEFAULT 0 COMMENT '使用次数',
    is_active BOOLEAN DEFAULT TRUE COMMENT '是否启用',
    created_by BIGINT COMMENT '创建人',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_wrong_word (wrong_word),
    INDEX idx_correct (correct_word)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='搜索纠错词典表';

-- 搜索同义词表
CREATE TABLE IF NOT EXISTS search_synonym (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    word_group VARCHAR(500) NOT NULL COMMENT '同义词组',
    synonym_type VARCHAR(50) DEFAULT 'equivalent' COMMENT '同义词类型',
    domain VARCHAR(100) COMMENT '领域',
    weight DECIMAL(3,2) DEFAULT 1.0 COMMENT '权重',
    is_active BOOLEAN DEFAULT TRUE COMMENT '是否启用',
    created_by BIGINT COMMENT '创建人',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_domain (domain)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='搜索同义词表';

-- 搜索意图模板表
CREATE TABLE IF NOT EXISTS search_intent_template (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    intent_name VARCHAR(100) NOT NULL COMMENT '意图名称',
    intent_code VARCHAR(50) NOT NULL COMMENT '意图代码',
    patterns JSON NOT NULL COMMENT '匹配模式',
    keywords JSON COMMENT '关键词列表',
    action_type VARCHAR(50) COMMENT '动作类型',
    action_config JSON COMMENT '动作配置',
    priority INT DEFAULT 0 COMMENT '优先级',
    is_active BOOLEAN DEFAULT TRUE COMMENT '是否启用',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_intent_code (intent_code),
    INDEX idx_priority (priority DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='搜索意图模板表';

-- 搜索热词表
CREATE TABLE IF NOT EXISTS search_hot_word (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    word VARCHAR(100) NOT NULL COMMENT '热词',
    category VARCHAR(50) COMMENT '分类',
    search_count INT DEFAULT 0 COMMENT '搜索次数',
    trend_score DECIMAL(10,4) DEFAULT 0 COMMENT '趋势得分',
    period_type VARCHAR(20) DEFAULT 'daily' COMMENT '统计周期',
    period_date DATE NOT NULL COMMENT '统计日期',
    rank_position INT COMMENT '排名位置',
    is_trending BOOLEAN DEFAULT FALSE COMMENT '是否上升趋势',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_word_period (word, period_type, period_date),
    INDEX idx_rank (period_type, period_date, rank_position)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='搜索热词表';

-- 搜索相关推荐表
CREATE TABLE IF NOT EXISTS search_related_query (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    source_query VARCHAR(200) NOT NULL COMMENT '源查询',
    related_query VARCHAR(200) NOT NULL COMMENT '相关查询',
    relation_type VARCHAR(50) DEFAULT 'co_search' COMMENT '关系类型',
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

-- 搜索补全词表
CREATE TABLE IF NOT EXISTS search_completion (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    prefix VARCHAR(50) NOT NULL COMMENT '前缀',
    completion_text VARCHAR(200) NOT NULL COMMENT '补全文本',
    completion_type VARCHAR(50) DEFAULT 'query' COMMENT '补全类型',
    frequency INT DEFAULT 0 COMMENT '频率',
    weight DECIMAL(5,4) DEFAULT 1.0 COMMENT '权重',
    metadata JSON COMMENT '元数据',
    is_active BOOLEAN DEFAULT TRUE COMMENT '是否启用',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_prefix (prefix),
    INDEX idx_frequency (frequency DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='搜索补全词表';

-- 新闻数据源表
CREATE TABLE IF NOT EXISTS news_data_source (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
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
    INDEX idx_source_type (source_type),
    INDEX idx_category (category),
    INDEX idx_is_enabled (is_enabled)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='新闻数据源表';

-- 新闻文章表
CREATE TABLE IF NOT EXISTS news_article (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
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
    UNIQUE INDEX uk_external_id (source_id, external_id),
    INDEX idx_source_id (source_id),
    INDEX idx_category (category),
    INDEX idx_publish_time (publish_time),
    INDEX idx_is_policy (is_policy),
    INDEX idx_status (status),
    FULLTEXT INDEX ft_content (title, content, summary)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='新闻文章表';

-- 新闻收藏表
CREATE TABLE IF NOT EXISTS news_favorite (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    article_id BIGINT NOT NULL COMMENT '文章ID',
    folder_id BIGINT COMMENT '收藏夹ID',
    note TEXT COMMENT '备注',
    tags JSON COMMENT '自定义标签',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE INDEX uk_user_article (user_id, article_id),
    INDEX idx_folder_id (folder_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='新闻收藏表';

-- AI训练文档表
CREATE TABLE IF NOT EXISTS ai_training_document (
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    enterprise_id BIGINT DEFAULT NULL COMMENT '企业ID',
    name VARCHAR(255) NOT NULL COMMENT '文档名称',
    file_size BIGINT DEFAULT 0 COMMENT '文件大小（字节）',
    size VARCHAR(50) DEFAULT NULL COMMENT '文件大小（格式化显示）',
    file_path VARCHAR(500) DEFAULT NULL COMMENT '文件路径',
    file_type VARCHAR(50) DEFAULT NULL COMMENT '文件类型',
    status VARCHAR(20) DEFAULT 'pending' COMMENT '状态：pending-待处理, indexed-已索引, failed-失败',
    upload_user_id BIGINT DEFAULT NULL COMMENT '上传用户ID',
    upload_time DATETIME DEFAULT NULL COMMENT '上传时间',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (id),
    KEY idx_enterprise_id (enterprise_id),
    KEY idx_status (status),
    KEY idx_upload_time (upload_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI训练文档表';

-- AI训练历史表
CREATE TABLE IF NOT EXISTS ai_training_history (
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    enterprise_id BIGINT DEFAULT NULL COMMENT '企业ID',
    version VARCHAR(50) DEFAULT NULL COMMENT '模型版本',
    date DATETIME DEFAULT NULL COMMENT '训练日期',
    documents INT DEFAULT 0 COMMENT '训练文档数量',
    status VARCHAR(20) DEFAULT 'training' COMMENT '状态：training-训练中, completed-已完成, failed-失败',
    accuracy DECIMAL(5,4) DEFAULT NULL COMMENT '准确率',
    task_id VARCHAR(100) DEFAULT NULL COMMENT '任务ID',
    progress INT DEFAULT 0 COMMENT '训练进度（0-100）',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (id),
    KEY idx_enterprise_id (enterprise_id),
    KEY idx_task_id (task_id),
    KEY idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI训练历史表';

-- AI训练配置表
CREATE TABLE IF NOT EXISTS ai_training_config (
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    enterprise_id BIGINT DEFAULT NULL COMMENT '企业ID',
    config_type VARCHAR(50) NOT NULL COMMENT '配置类型：training-训练设置, business-业务配置',
    config_key VARCHAR(100) NOT NULL COMMENT '配置键',
    config_value TEXT DEFAULT NULL COMMENT '配置值',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (id),
    UNIQUE KEY uk_enterprise_type_key (enterprise_id, config_type, config_key),
    KEY idx_enterprise_id (enterprise_id),
    KEY idx_config_type (config_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI训练配置表';

-- AI新闻表 (mota_ai 数据库)
CREATE TABLE IF NOT EXISTS ai_news (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    enterprise_id BIGINT COMMENT '企业ID',
    title VARCHAR(500) NOT NULL COMMENT '标题',
    summary TEXT COMMENT '摘要',
    content LONGTEXT COMMENT '内容',
    source VARCHAR(100) COMMENT '来源',
    source_url VARCHAR(1000) COMMENT '来源URL',
    source_icon VARCHAR(500) COMMENT '来源图标',
    published_at DATETIME COMMENT '发布时间',
    category VARCHAR(50) COMMENT '分类',
    tags VARCHAR(500) COMMENT '标签（JSON格式）',
    url VARCHAR(1000) COMMENT '链接',
    relevance_score DECIMAL(5,2) COMMENT '相关性评分',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted INT DEFAULT 0 COMMENT '是否删除',
    INDEX idx_enterprise_id (enterprise_id),
    INDEX idx_category (category),
    INDEX idx_published_at (published_at),
    INDEX idx_created_at (created_at),
    INDEX idx_deleted (deleted)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI新闻表';

-- =====================================================
-- mota_knowledge 数据库表结构 (知识库服务)
-- =====================================================
USE mota_knowledge;

-- 知识文件表
CREATE TABLE IF NOT EXISTS knowledge_file (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '文件ID',
    enterprise_id BIGINT NOT NULL COMMENT '企业ID',
    project_id BIGINT COMMENT '项目ID',
    parent_id BIGINT DEFAULT 0 COMMENT '父级ID',
    name VARCHAR(255) NOT NULL COMMENT '文件名',
    original_name VARCHAR(255) COMMENT '原始文件名',
    type VARCHAR(20) NOT NULL COMMENT '类型',
    file_type VARCHAR(50) COMMENT '文件类型',
    size BIGINT DEFAULT 0 COMMENT '文件大小',
    file_size BIGINT DEFAULT 0 COMMENT '文件大小',
    file_path VARCHAR(500) COMMENT '文件路径',
    path VARCHAR(500) COMMENT '文件存储路径',
    thumbnail_path VARCHAR(500) COMMENT '缩略图路径',
    mime_type VARCHAR(100) COMMENT 'MIME类型',
    extension VARCHAR(20) COMMENT '文件扩展名',
    content LONGTEXT COMMENT '文件内容',
    folder_id BIGINT COMMENT '所属文件夹ID',
    uploader_id BIGINT COMMENT '上传者ID',
    version INT DEFAULT 1 COMMENT '版本号',
    status VARCHAR(30) DEFAULT 'completed' COMMENT '状态',
    upload_progress INT DEFAULT 100 COMMENT '上传进度',
    category VARCHAR(50) COMMENT '分类',
    ai_suggested_category VARCHAR(50) COMMENT 'AI建议的分类',
    ai_confidence DECIMAL(5,4) COMMENT 'AI分类置信度',
    created_by BIGINT COMMENT '创建人',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted TINYINT DEFAULT 0 COMMENT '是否删除',
    INDEX idx_enterprise_id (enterprise_id),
    INDEX idx_project_id (project_id),
    INDEX idx_parent_id (parent_id),
    INDEX idx_folder_id (folder_id),
    INDEX idx_uploader_id (uploader_id),
    INDEX idx_created_by (created_by),
    INDEX idx_status (status),
    INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='知识文件表';

-- 文件分类表
CREATE TABLE IF NOT EXISTS file_category (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '分类ID',
    enterprise_id BIGINT NOT NULL COMMENT '企业ID',
    name VARCHAR(100) NOT NULL COMMENT '分类名称',
    code VARCHAR(50) COMMENT '分类编码',
    parent_id BIGINT DEFAULT 0 COMMENT '父级ID',
    description VARCHAR(500) COMMENT '分类描述',
    icon VARCHAR(100) COMMENT '图标',
    color VARCHAR(20) COMMENT '颜色',
    file_count INT DEFAULT 0 COMMENT '文件数量',
    sort INT DEFAULT 0 COMMENT '排序',
    sort_order INT DEFAULT 0 COMMENT '排序',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted TINYINT DEFAULT 0 COMMENT '是否删除',
    INDEX idx_enterprise_id (enterprise_id),
    INDEX idx_parent_id (parent_id),
    INDEX idx_sort_order (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文件分类表';

-- 文件标签表
CREATE TABLE IF NOT EXISTS file_tag (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '标签ID',
    enterprise_id BIGINT NOT NULL COMMENT '企业ID',
    name VARCHAR(50) NOT NULL COMMENT '标签名称',
    color VARCHAR(20) COMMENT '标签颜色',
    file_count INT DEFAULT 0 COMMENT '文件数量',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_enterprise_id (enterprise_id),
    UNIQUE KEY uk_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文件标签表';

-- 文件标签关联表
CREATE TABLE IF NOT EXISTS file_tag_relation (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '关联ID',
    file_id BIGINT NOT NULL COMMENT '文件ID',
    tag_id BIGINT NOT NULL COMMENT '标签ID',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_file_tag (file_id, tag_id),
    INDEX idx_file_id (file_id),
    INDEX idx_tag_id (tag_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文件标签关联表';

-- 模板表
CREATE TABLE IF NOT EXISTS template (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '模板ID',
    enterprise_id BIGINT NOT NULL COMMENT '企业ID',
    name VARCHAR(200) NOT NULL COMMENT '模板名称',
    description TEXT COMMENT '模板描述',
    category VARCHAR(50) COMMENT '模板分类',
    type VARCHAR(50) NOT NULL COMMENT '模板类型',
    content LONGTEXT COMMENT '模板内容',
    thumbnail VARCHAR(500) COMMENT '缩略图URL',
    is_public TINYINT DEFAULT 0 COMMENT '是否公开',
    usage_count INT DEFAULT 0 COMMENT '使用次数',
    status VARCHAR(20) DEFAULT 'active' COMMENT '状态',
    created_by BIGINT COMMENT '创建人ID',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted TINYINT DEFAULT 0 COMMENT '是否删除',
    INDEX idx_enterprise_id (enterprise_id),
    INDEX idx_category (category),
    INDEX idx_type (type),
    INDEX idx_is_public (is_public)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='模板表';

-- 文件版本表
CREATE TABLE IF NOT EXISTS file_version (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '版本ID',
    file_id BIGINT NOT NULL COMMENT '文件ID',
    version_number INT NOT NULL COMMENT '版本号',
    file_path VARCHAR(500) NOT NULL COMMENT '文件路径',
    file_size BIGINT DEFAULT 0 COMMENT '文件大小',
    change_summary VARCHAR(500) COMMENT '变更说明',
    created_by BIGINT COMMENT '创建人ID',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_file_id (file_id),
    UNIQUE KEY uk_file_version (file_id, version_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文件版本表';

-- =====================================================
-- mota_notify 数据库表结构 (通知服务)
-- =====================================================
USE mota_notify;

-- 通知表
CREATE TABLE IF NOT EXISTS notification (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '通知ID',
    user_id BIGINT NOT NULL COMMENT '接收用户ID',
    enterprise_id BIGINT COMMENT '企业ID',
    type VARCHAR(50) NOT NULL COMMENT '通知类型',
    title VARCHAR(200) NOT NULL COMMENT '通知标题',
    content TEXT COMMENT '通知内容',
    content_type VARCHAR(20) DEFAULT 'text' COMMENT '内容类型',
    priority VARCHAR(20) DEFAULT 'normal' COMMENT '优先级',
    source_type VARCHAR(50) COMMENT '来源类型',
    source_id BIGINT COMMENT '来源ID',
    sender_id BIGINT COMMENT '发送者ID',
    sender_name VARCHAR(100) COMMENT '发送者名称',
    action_url VARCHAR(500) COMMENT '操作链接',
    action_type VARCHAR(50) COMMENT '操作类型',
    extra_data JSON COMMENT '额外数据',
    is_read TINYINT DEFAULT 0 COMMENT '是否已读',
    read_at DATETIME COMMENT '阅读时间',
    is_archived TINYINT DEFAULT 0 COMMENT '是否归档',
    archived_at DATETIME COMMENT '归档时间',
    expired_at DATETIME COMMENT '过期时间',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted TINYINT DEFAULT 0 COMMENT '是否删除',
    INDEX idx_user_id (user_id),
    INDEX idx_enterprise_id (enterprise_id),
    INDEX idx_type (type),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='通知表';

-- 通知配置表
CREATE TABLE IF NOT EXISTS notification_config (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '配置ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    enterprise_id BIGINT COMMENT '企业ID',
    notification_type VARCHAR(50) NOT NULL COMMENT '通知类型',
    channel VARCHAR(30) NOT NULL COMMENT '通知渠道',
    is_enabled TINYINT DEFAULT 1 COMMENT '是否启用',
    quiet_hours_start TIME COMMENT '免打扰开始时间',
    quiet_hours_end TIME COMMENT '免打扰结束时间',
    frequency VARCHAR(20) DEFAULT 'realtime' COMMENT '通知频率',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_type_channel (user_id, notification_type, channel),
    INDEX idx_user_id (user_id),
    INDEX idx_enterprise_id (enterprise_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='通知配置表';

-- 通知订阅表
CREATE TABLE IF NOT EXISTS notification_subscription (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '订阅ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    enterprise_id BIGINT COMMENT '企业ID',
    subscription_type VARCHAR(50) NOT NULL COMMENT '订阅类型',
    target_type VARCHAR(50) NOT NULL COMMENT '目标类型',
    target_id BIGINT NOT NULL COMMENT '目标ID',
    notify_on_create TINYINT DEFAULT 1 COMMENT '创建时通知',
    notify_on_update TINYINT DEFAULT 1 COMMENT '更新时通知',
    notify_on_comment TINYINT DEFAULT 1 COMMENT '评论时通知',
    notify_on_mention TINYINT DEFAULT 1 COMMENT '提及时通知',
    is_active TINYINT DEFAULT 1 COMMENT '是否激活',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_target (user_id, target_type, target_id),
    INDEX idx_user_id (user_id),
    INDEX idx_target (target_type, target_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='通知订阅表';

-- 通知偏好设置表
CREATE TABLE IF NOT EXISTS notification_preferences (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL COMMENT '用户ID',
    category VARCHAR(50) NOT NULL COMMENT '通知类别',
    email_enabled BOOLEAN DEFAULT TRUE COMMENT '邮件通知',
    push_enabled BOOLEAN DEFAULT TRUE COMMENT '推送通知',
    in_app_enabled BOOLEAN DEFAULT TRUE COMMENT '应用内通知',
    sms_enabled BOOLEAN DEFAULT FALSE COMMENT '短信通知',
    digest_frequency VARCHAR(20) DEFAULT 'realtime' COMMENT '摘要频率',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_category (user_id, category),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='通知偏好设置表';

-- 免打扰设置表
CREATE TABLE IF NOT EXISTS notification_dnd_settings (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL COMMENT '用户ID',
    is_enabled BOOLEAN DEFAULT FALSE COMMENT '是否启用',
    start_time TIME COMMENT '开始时间',
    end_time TIME COMMENT '结束时间',
    timezone VARCHAR(50) DEFAULT 'Asia/Shanghai' COMMENT '时区',
    weekdays JSON COMMENT '生效的星期几',
    allow_urgent BOOLEAN DEFAULT TRUE COMMENT '允许紧急通知',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='免打扰设置表';

-- 邮件发送队列表
CREATE TABLE IF NOT EXISTS email_queue (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    to_email VARCHAR(255) NOT NULL COMMENT '收件人邮箱',
    to_name VARCHAR(100) COMMENT '收件人姓名',
    subject VARCHAR(500) NOT NULL COMMENT '邮件主题',
    content LONGTEXT NOT NULL COMMENT '邮件内容',
    content_type VARCHAR(20) DEFAULT 'html' COMMENT '内容类型',
    template_id VARCHAR(100) COMMENT '模板ID',
    template_params JSON COMMENT '模板参数',
    priority INT DEFAULT 5 COMMENT '优先级',
    status VARCHAR(20) DEFAULT 'pending' COMMENT '状态',
    retry_count INT DEFAULT 0 COMMENT '重试次数',
    max_retries INT DEFAULT 3 COMMENT '最大重试次数',
    error_message TEXT COMMENT '错误信息',
    scheduled_at DATETIME COMMENT '计划发送时间',
    sent_at DATETIME COMMENT '实际发送时间',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_scheduled_at (scheduled_at),
    INDEX idx_priority (priority)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='邮件发送队列表';

-- 推送通知队列表
CREATE TABLE IF NOT EXISTS push_notification_queue (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL COMMENT '用户ID',
    device_token VARCHAR(500) COMMENT '设备令牌',
    platform VARCHAR(20) COMMENT '平台',
    title VARCHAR(200) NOT NULL COMMENT '标题',
    body TEXT COMMENT '内容',
    data JSON COMMENT '附加数据',
    badge INT COMMENT '角标数',
    sound VARCHAR(100) COMMENT '声音',
    priority VARCHAR(20) DEFAULT 'normal' COMMENT '优先级',
    status VARCHAR(20) DEFAULT 'pending' COMMENT '状态',
    retry_count INT DEFAULT 0 COMMENT '重试次数',
    error_message TEXT COMMENT '错误信息',
    scheduled_at DATETIME COMMENT '计划发送时间',
    sent_at DATETIME COMMENT '实际发送时间',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_scheduled_at (scheduled_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='推送通知队列表';

-- 用户设备表
CREATE TABLE IF NOT EXISTS user_device (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL COMMENT '用户ID',
    device_id VARCHAR(200) NOT NULL COMMENT '设备ID',
    device_token VARCHAR(500) COMMENT '推送令牌',
    device_type VARCHAR(50) COMMENT '设备类型',
    device_name VARCHAR(100) COMMENT '设备名称',
    platform VARCHAR(20) COMMENT '平台',
    os_version VARCHAR(50) COMMENT '系统版本',
    app_version VARCHAR(50) COMMENT '应用版本',
    is_active BOOLEAN DEFAULT TRUE COMMENT '是否活跃',
    last_active_at DATETIME COMMENT '最后活跃时间',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_device (user_id, device_id),
    INDEX idx_user_id (user_id),
    INDEX idx_device_token (device_token(100))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户设备表';

-- =====================================================
-- mota_calendar 数据库表结构 (日历服务)
-- =====================================================
USE mota_calendar;

-- 日历事件表
CREATE TABLE IF NOT EXISTS calendar_event (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '事件ID',
    user_id BIGINT NOT NULL COMMENT '创建用户ID',
    enterprise_id BIGINT COMMENT '企业ID',
    title VARCHAR(200) NOT NULL COMMENT '事件标题',
    description TEXT COMMENT '事件描述',
    location VARCHAR(500) COMMENT '地点',
    start_time DATETIME NOT NULL COMMENT '开始时间',
    end_time DATETIME NOT NULL COMMENT '结束时间',
    all_day TINYINT DEFAULT 0 COMMENT '是否全天事件',
    timezone VARCHAR(50) DEFAULT 'Asia/Shanghai' COMMENT '时区',
    event_type VARCHAR(50) DEFAULT 'event' COMMENT '事件类型',
    priority VARCHAR(20) DEFAULT 'normal' COMMENT '优先级',
    status VARCHAR(20) DEFAULT 'confirmed' COMMENT '状态',
    color VARCHAR(20) COMMENT '颜色',
    recurrence_rule VARCHAR(500) COMMENT '重复规则',
    recurrence_id BIGINT COMMENT '重复事件父ID',
    reminder_minutes JSON COMMENT '提醒时间列表',
    is_private TINYINT DEFAULT 0 COMMENT '是否私密',
    source_type VARCHAR(50) COMMENT '来源类型',
    source_id BIGINT COMMENT '来源ID',
    project_id BIGINT COMMENT '关联项目ID',
    task_id BIGINT COMMENT '关联任务ID',
    meeting_url VARCHAR(500) COMMENT '会议链接',
    attachments JSON COMMENT '附件列表',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted TINYINT DEFAULT 0 COMMENT '是否删除',
    INDEX idx_user_id (user_id),
    INDEX idx_enterprise_id (enterprise_id),
    INDEX idx_start_time (start_time),
    INDEX idx_end_time (end_time),
    INDEX idx_event_type (event_type),
    INDEX idx_project_id (project_id),
    INDEX idx_task_id (task_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='日历事件表';

-- 日历事件参与者表
CREATE TABLE IF NOT EXISTS calendar_event_attendee (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '参与者ID',
    event_id BIGINT NOT NULL COMMENT '事件ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    email VARCHAR(100) COMMENT '邮箱',
    name VARCHAR(100) COMMENT '姓名',
    role VARCHAR(20) DEFAULT 'attendee' COMMENT '角色',
    status VARCHAR(20) DEFAULT 'pending' COMMENT '响应状态',
    response_time DATETIME COMMENT '响应时间',
    comment VARCHAR(500) COMMENT '备注',
    is_optional TINYINT DEFAULT 0 COMMENT '是否可选参与',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_event_user (event_id, user_id),
    INDEX idx_event_id (event_id),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='日历事件参与者表';

-- 日历配置表
CREATE TABLE IF NOT EXISTS calendar_config (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '配置ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    enterprise_id BIGINT COMMENT '企业ID',
    default_view VARCHAR(20) DEFAULT 'month' COMMENT '默认视图',
    week_start INT DEFAULT 1 COMMENT '周起始日',
    work_hours_start TIME DEFAULT '09:00:00' COMMENT '工作时间开始',
    work_hours_end TIME DEFAULT '18:00:00' COMMENT '工作时间结束',
    work_days JSON COMMENT '工作日',
    timezone VARCHAR(50) DEFAULT 'Asia/Shanghai' COMMENT '时区',
    default_reminder INT DEFAULT 15 COMMENT '默认提醒时间',
    show_weekends TINYINT DEFAULT 1 COMMENT '显示周末',
    show_declined TINYINT DEFAULT 0 COMMENT '显示已拒绝事件',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_id (user_id),
    INDEX idx_enterprise_id (enterprise_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='日历配置表';

-- 日历订阅表
CREATE TABLE IF NOT EXISTS calendar_subscription (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '订阅ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    enterprise_id BIGINT COMMENT '企业ID',
    name VARCHAR(100) NOT NULL COMMENT '订阅名称',
    subscription_type VARCHAR(50) NOT NULL COMMENT '订阅类型',
    source_url VARCHAR(500) COMMENT '订阅源URL',
    source_id BIGINT COMMENT '订阅源ID',
    color VARCHAR(20) COMMENT '颜色',
    is_visible TINYINT DEFAULT 1 COMMENT '是否可见',
    sync_frequency INT DEFAULT 60 COMMENT '同步频率',
    last_sync_at DATETIME COMMENT '最后同步时间',
    sync_status VARCHAR(20) DEFAULT 'success' COMMENT '同步状态',
    sync_error TEXT COMMENT '同步错误',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted TINYINT DEFAULT 0 COMMENT '是否删除',
    INDEX idx_user_id (user_id),
    INDEX idx_enterprise_id (enterprise_id),
    INDEX idx_subscription_type (subscription_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='日历订阅表';

-- 日历提醒表
CREATE TABLE IF NOT EXISTS calendar_reminder (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '提醒ID',
    event_id BIGINT NOT NULL COMMENT '事件ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    reminder_time DATETIME NOT NULL COMMENT '提醒时间',
    reminder_type VARCHAR(20) DEFAULT 'notification' COMMENT '提醒类型',
    status VARCHAR(20) DEFAULT 'pending' COMMENT '状态',
    sent_at DATETIME COMMENT '发送时间',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_event_id (event_id),
    INDEX idx_user_id (user_id),
    INDEX idx_reminder_time (reminder_time),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='日历提醒表';

-- =====================================================
-- mota_user 数据库表结构 (用户服务)
-- =====================================================
USE mota_user;

-- 用户表
CREATE TABLE IF NOT EXISTS sys_user (
    id BIGINT PRIMARY KEY COMMENT '主键ID',
    username VARCHAR(50) NOT NULL COMMENT '用户名',
    email VARCHAR(100) COMMENT '邮箱',
    phone VARCHAR(20) COMMENT '手机号',
    password_hash VARCHAR(255) NOT NULL COMMENT '密码哈希',
    nickname VARCHAR(100) COMMENT '昵称',
    avatar VARCHAR(500) COMMENT '头像URL',
    status INT DEFAULT 1 COMMENT '状态（0-禁用，1-启用）',
    org_id VARCHAR(50) COMMENT '组织ID',
    org_name VARCHAR(100) COMMENT '组织名称',
    role VARCHAR(50) COMMENT '角色',
    last_login_at DATETIME COMMENT '最后登录时间',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    created_by BIGINT COMMENT '创建人ID',
    updated_by BIGINT COMMENT '更新人ID',
    deleted INT DEFAULT 0 COMMENT '删除标记',
    version INT DEFAULT 0 COMMENT '乐观锁版本号',
    UNIQUE KEY uk_username (username),
    UNIQUE KEY uk_email (email),
    INDEX idx_org_id (org_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 活动动态表
CREATE TABLE IF NOT EXISTS activity (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    type VARCHAR(50) NOT NULL COMMENT '活动类型',
    action VARCHAR(200) COMMENT '动作描述',
    target VARCHAR(500) COMMENT '目标名称',
    target_id BIGINT COMMENT '目标ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    project_id BIGINT COMMENT '项目ID',
    time VARCHAR(50) COMMENT '时间描述',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_project_id (project_id),
    INDEX idx_type (type),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='活动动态表';

-- 通知表
CREATE TABLE IF NOT EXISTS notification (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    type VARCHAR(50) NOT NULL COMMENT '通知类型',
    title VARCHAR(200) NOT NULL COMMENT '通知标题',
    content TEXT COMMENT '通知内容',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    is_read INT DEFAULT 0 COMMENT '是否已读',
    related_id BIGINT COMMENT '关联ID',
    related_type VARCHAR(50) COMMENT '关联类型',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_type (type),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='通知表';

-- 行业表
CREATE TABLE IF NOT EXISTS industry (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(50) NOT NULL UNIQUE COMMENT '行业代码',
    name VARCHAR(100) NOT NULL COMMENT '行业名称',
    parent_id BIGINT COMMENT '父行业ID',
    level INT DEFAULT 1 COMMENT '层级',
    sort_order INT DEFAULT 0 COMMENT '排序顺序',
    icon VARCHAR(100) COMMENT '行业图标',
    description VARCHAR(500) COMMENT '行业描述',
    status TINYINT DEFAULT 1 COMMENT '状态',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_parent (parent_id),
    INDEX idx_code (code),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='行业表';

-- 企业表
CREATE TABLE IF NOT EXISTS enterprise (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    org_id VARCHAR(50) NOT NULL UNIQUE COMMENT '组织ID',
    name VARCHAR(200) NOT NULL COMMENT '企业名称',
    short_name VARCHAR(100) COMMENT '企业简称',
    industry_id BIGINT NOT NULL COMMENT '所属行业ID',
    industry_name VARCHAR(100) COMMENT '行业名称',
    logo VARCHAR(500) COMMENT '企业Logo',
    description TEXT COMMENT '企业简介',
    address VARCHAR(500) COMMENT '企业地址',
    contact_name VARCHAR(50) COMMENT '联系人姓名',
    contact_phone VARCHAR(20) COMMENT '联系电话',
    contact_email VARCHAR(100) COMMENT '联系邮箱',
    website VARCHAR(200) COMMENT '企业网站',
    scale VARCHAR(50) COMMENT '企业规模',
    admin_user_id BIGINT NOT NULL COMMENT '超级管理员用户ID',
    member_count INT DEFAULT 1 COMMENT '成员数量',
    max_members INT DEFAULT 100 COMMENT '最大成员数量',
    status TINYINT DEFAULT 1 COMMENT '状态',
    verified TINYINT DEFAULT 0 COMMENT '是否已认证',
    verified_at TIMESTAMP NULL COMMENT '认证时间',
    expired_at TIMESTAMP NULL COMMENT '服务到期时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted INT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_org_id (org_id),
    INDEX idx_industry (industry_id),
    INDEX idx_admin (admin_user_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='企业表';

-- 企业成员表
CREATE TABLE IF NOT EXISTS enterprise_member (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    enterprise_id BIGINT NOT NULL COMMENT '企业ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    role VARCHAR(30) DEFAULT 'member' COMMENT '角色',
    department_id BIGINT COMMENT '所属部门ID',
    position VARCHAR(100) COMMENT '职位',
    employee_no VARCHAR(50) COMMENT '工号',
    status TINYINT DEFAULT 1 COMMENT '状态',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '加入时间',
    invited_by BIGINT COMMENT '邀请人ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted INT DEFAULT 0 COMMENT '删除标记',
    UNIQUE KEY uk_enterprise_user (enterprise_id, user_id),
    INDEX idx_enterprise (enterprise_id),
    INDEX idx_user (user_id),
    INDEX idx_department (department_id),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='企业成员表';

-- 企业邀请表
CREATE TABLE IF NOT EXISTS enterprise_invitation (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    enterprise_id BIGINT NOT NULL COMMENT '企业ID',
    invite_code VARCHAR(100) NOT NULL UNIQUE COMMENT '邀请码',
    invite_type VARCHAR(20) DEFAULT 'link' COMMENT '邀请类型',
    target_email VARCHAR(100) COMMENT '目标邮箱',
    target_phone VARCHAR(20) COMMENT '目标手机号',
    role VARCHAR(30) DEFAULT 'member' COMMENT '邀请角色',
    department_id BIGINT COMMENT '邀请加入的部门ID',
    max_uses INT DEFAULT 1 COMMENT '最大使用次数',
    used_count INT DEFAULT 0 COMMENT '已使用次数',
    expired_at TIMESTAMP NOT NULL COMMENT '过期时间',
    status TINYINT DEFAULT 1 COMMENT '状态',
    invited_by BIGINT NOT NULL COMMENT '邀请人ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_enterprise (enterprise_id),
    INDEX idx_code (invite_code),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='企业邀请表';

-- 部门表
CREATE TABLE IF NOT EXISTS department (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    org_id VARCHAR(50) NOT NULL COMMENT '组织ID',
    name VARCHAR(100) NOT NULL COMMENT '部门名称',
    description VARCHAR(500) COMMENT '部门描述',
    manager_id BIGINT COMMENT '部门负责人ID',
    parent_id BIGINT COMMENT '上级部门ID',
    sort_order INT DEFAULT 0 COMMENT '排序顺序',
    status TINYINT DEFAULT 1 COMMENT '状态',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT COMMENT '创建人ID',
    updated_by BIGINT COMMENT '更新人ID',
    deleted INT DEFAULT 0 COMMENT '删除标记',
    version INT DEFAULT 0 COMMENT '乐观锁版本号',
    INDEX idx_org (org_id),
    INDEX idx_manager (manager_id),
    INDEX idx_parent (parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='部门表';

-- 权限/菜单表
CREATE TABLE IF NOT EXISTS sys_permission (
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT '权限ID',
    name VARCHAR(100) NOT NULL COMMENT '权限名称',
    code VARCHAR(100) NOT NULL COMMENT '权限编码',
    type VARCHAR(20) DEFAULT 'menu' COMMENT '类型（directory目录 menu菜单 button按钮）',
    parent_id BIGINT DEFAULT 0 COMMENT '父权限ID',
    path VARCHAR(200) DEFAULT NULL COMMENT '路由地址',
    component VARCHAR(200) DEFAULT NULL COMMENT '组件路径',
    icon VARCHAR(100) DEFAULT NULL COMMENT '图标',
    sort INT DEFAULT 0 COMMENT '显示顺序',
    visible TINYINT DEFAULT 1 COMMENT '是否可见（1是 0否）',
    status TINYINT DEFAULT 1 COMMENT '状态（1正常 0停用）',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标志（0未删除 1已删除）',
    PRIMARY KEY (id),
    UNIQUE KEY uk_code (code),
    KEY idx_parent_id (parent_id),
    KEY idx_status (status),
    KEY idx_deleted (deleted)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='权限/菜单表';

-- 角色表
CREATE TABLE IF NOT EXISTS sys_role (
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT '角色ID',
    name VARCHAR(100) NOT NULL COMMENT '角色名称',
    code VARCHAR(50) NOT NULL COMMENT '角色编码',
    sort INT DEFAULT 0 COMMENT '显示顺序',
    data_scope TINYINT DEFAULT 1 COMMENT '数据范围（1全部 2自定义 3本部门 4本部门及以下 5仅本人）',
    status TINYINT DEFAULT 1 COMMENT '状态（1正常 0停用）',
    is_system TINYINT DEFAULT 0 COMMENT '是否系统内置（1是 0否）',
    remark VARCHAR(500) DEFAULT NULL COMMENT '备注',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标志（0未删除 1已删除）',
    PRIMARY KEY (id),
    UNIQUE KEY uk_code (code),
    KEY idx_status (status),
    KEY idx_deleted (deleted)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色表';

-- 角色权限关联表
CREATE TABLE IF NOT EXISTS sys_role_permission (
    role_id BIGINT NOT NULL COMMENT '角色ID',
    permission_id BIGINT NOT NULL COMMENT '权限ID',
    PRIMARY KEY (role_id, permission_id),
    KEY idx_permission_id (permission_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色权限关联表';

-- 用户角色关联表
CREATE TABLE IF NOT EXISTS sys_user_role (
    user_id BIGINT NOT NULL COMMENT '用户ID',
    role_id BIGINT NOT NULL COMMENT '角色ID',
    PRIMARY KEY (user_id, role_id),
    KEY idx_role_id (role_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户角色关联表';

-- =====================================================
-- 初始化数据
-- =====================================================

-- 初始化行业数据到 mota_auth 数据库（认证服务使用）
USE mota_auth;

INSERT INTO industry (id, code, name, parent_id, level, sort_order, status) VALUES
(1, 'IT', '互联网/IT', NULL, 1, 1, 1),
(2, 'FINANCE', '金融/银行', NULL, 1, 2, 1),
(3, 'MANUFACTURING', '制造业', NULL, 1, 3, 1),
(4, 'EDUCATION', '教育/培训', NULL, 1, 4, 1),
(5, 'HEALTHCARE', '医疗/健康', NULL, 1, 5, 1),
(6, 'RETAIL', '零售/电商', NULL, 1, 6, 1),
(7, 'REALESTATE', '房地产/建筑', NULL, 1, 7, 1),
(8, 'GOVERNMENT', '政府/公共事业', NULL, 1, 8, 1),
(9, 'OTHER', '其他', NULL, 1, 99, 1)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- 初始化行业数据（二级行业）
-- 互联网/IT 二级行业
INSERT INTO industry (code, name, parent_id, level, sort_order, status) VALUES
('IT_SOFTWARE', '软件开发', 1, 2, 1, 1),
('IT_INTERNET', '互联网服务', 1, 2, 2, 1),
('IT_AI', '人工智能', 1, 2, 3, 1),
('IT_BIGDATA', '大数据', 1, 2, 4, 1),
('IT_CLOUD', '云计算', 1, 2, 5, 1),
('IT_SECURITY', '网络安全', 1, 2, 6, 1),
('IT_GAME', '游戏', 1, 2, 7, 1),
('IT_ECOMMERCE', '电子商务', 1, 2, 8, 1)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- 金融/银行 二级行业
INSERT INTO industry (code, name, parent_id, level, sort_order, status) VALUES
('FINANCE_BANK', '银行', 2, 2, 1, 1),
('FINANCE_SECURITIES', '证券', 2, 2, 2, 1),
('FINANCE_INSURANCE', '保险', 2, 2, 3, 1),
('FINANCE_FUND', '基金', 2, 2, 4, 1),
('FINANCE_INVESTMENT', '投资', 2, 2, 5, 1),
('FINANCE_FINTECH', '金融科技', 2, 2, 6, 1)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- 制造业 二级行业
INSERT INTO industry (code, name, parent_id, level, sort_order, status) VALUES
('MFG_AUTO', '汽车制造', 3, 2, 1, 1),
('MFG_ELECTRONICS', '电子制造', 3, 2, 2, 1),
('MFG_MACHINERY', '机械设备', 3, 2, 3, 1),
('MFG_CHEMICAL', '化工', 3, 2, 4, 1),
('MFG_FOOD', '食品加工', 3, 2, 5, 1),
('MFG_TEXTILE', '纺织服装', 3, 2, 6, 1)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- 教育/培训 二级行业
INSERT INTO industry (code, name, parent_id, level, sort_order, status) VALUES
('EDU_K12', 'K12教育', 4, 2, 1, 1),
('EDU_HIGHER', '高等教育', 4, 2, 2, 1),
('EDU_VOCATIONAL', '职业培训', 4, 2, 3, 1),
('EDU_ONLINE', '在线教育', 4, 2, 4, 1),
('EDU_LANGUAGE', '语言培训', 4, 2, 5, 1)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- 医疗/健康 二级行业
INSERT INTO industry (code, name, parent_id, level, sort_order, status) VALUES
('HEALTH_HOSPITAL', '医院', 5, 2, 1, 1),
('HEALTH_PHARMA', '制药', 5, 2, 2, 1),
('HEALTH_DEVICE', '医疗器械', 5, 2, 3, 1),
('HEALTH_MANAGEMENT', '健康管理', 5, 2, 4, 1),
('HEALTH_BIOTECH', '生物技术', 5, 2, 5, 1)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- 零售/电商 二级行业
INSERT INTO industry (code, name, parent_id, level, sort_order, status) VALUES
('RETAIL_GENERAL', '综合零售', 6, 2, 1, 1),
('RETAIL_PLATFORM', '电商平台', 6, 2, 2, 1),
('RETAIL_FMCG', '快消品', 6, 2, 3, 1),
('RETAIL_LUXURY', '奢侈品', 6, 2, 4, 1)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- 房地产/建筑 二级行业
INSERT INTO industry (code, name, parent_id, level, sort_order, status) VALUES
('RE_DEVELOPMENT', '房地产开发', 7, 2, 1, 1),
('RE_CONSTRUCTION', '建筑工程', 7, 2, 2, 1),
('RE_PROPERTY', '物业管理', 7, 2, 3, 1),
('RE_DECORATION', '装修装饰', 7, 2, 4, 1)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- 政府/公共事业 二级行业
INSERT INTO industry (code, name, parent_id, level, sort_order, status) VALUES
('GOV_AGENCY', '政府机关', 8, 2, 1, 1),
('GOV_SERVICE', '公共服务', 8, 2, 2, 1),
('GOV_ENERGY', '能源', 8, 2, 3, 1),
('GOV_TRANSPORT', '交通运输', 8, 2, 4, 1)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- 初始化行业数据到 mota_user 数据库（用户服务使用）
USE mota_user;

INSERT INTO industry (id, code, name, parent_id, level, sort_order, status) VALUES
(1, 'IT', '互联网/IT', NULL, 1, 1, 1),
(2, 'FINANCE', '金融/银行', NULL, 1, 2, 1),
(3, 'MANUFACTURING', '制造业', NULL, 1, 3, 1),
(4, 'EDUCATION', '教育/培训', NULL, 1, 4, 1),
(5, 'HEALTHCARE', '医疗/健康', NULL, 1, 5, 1),
(6, 'RETAIL', '零售/电商', NULL, 1, 6, 1),
(7, 'REALESTATE', '房地产/建筑', NULL, 1, 7, 1),
(8, 'GOVERNMENT', '政府/公共事业', NULL, 1, 8, 1),
(9, 'OTHER', '其他', NULL, 1, 99, 1)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- 初始化行业数据（二级行业）
-- 互联网/IT 二级行业
INSERT INTO industry (code, name, parent_id, level, sort_order, status) VALUES
('IT_SOFTWARE', '软件开发', 1, 2, 1, 1),
('IT_INTERNET', '互联网服务', 1, 2, 2, 1),
('IT_AI', '人工智能', 1, 2, 3, 1),
('IT_BIGDATA', '大数据', 1, 2, 4, 1),
('IT_CLOUD', '云计算', 1, 2, 5, 1),
('IT_SECURITY', '网络安全', 1, 2, 6, 1),
('IT_GAME', '游戏', 1, 2, 7, 1),
('IT_ECOMMERCE', '电子商务', 1, 2, 8, 1)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- 金融/银行 二级行业
INSERT INTO industry (code, name, parent_id, level, sort_order, status) VALUES
('FINANCE_BANK', '银行', 2, 2, 1, 1),
('FINANCE_SECURITIES', '证券', 2, 2, 2, 1),
('FINANCE_INSURANCE', '保险', 2, 2, 3, 1),
('FINANCE_FUND', '基金', 2, 2, 4, 1),
('FINANCE_INVESTMENT', '投资', 2, 2, 5, 1),
('FINANCE_FINTECH', '金融科技', 2, 2, 6, 1)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- 制造业 二级行业
INSERT INTO industry (code, name, parent_id, level, sort_order, status) VALUES
('MFG_AUTO', '汽车制造', 3, 2, 1, 1),
('MFG_ELECTRONICS', '电子制造', 3, 2, 2, 1),
('MFG_MACHINERY', '机械设备', 3, 2, 3, 1),
('MFG_CHEMICAL', '化工', 3, 2, 4, 1),
('MFG_FOOD', '食品加工', 3, 2, 5, 1),
('MFG_TEXTILE', '纺织服装', 3, 2, 6, 1)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- 教育/培训 二级行业
INSERT INTO industry (code, name, parent_id, level, sort_order, status) VALUES
('EDU_K12', 'K12教育', 4, 2, 1, 1),
('EDU_HIGHER', '高等教育', 4, 2, 2, 1),
('EDU_VOCATIONAL', '职业培训', 4, 2, 3, 1),
('EDU_ONLINE', '在线教育', 4, 2, 4, 1),
('EDU_LANGUAGE', '语言培训', 4, 2, 5, 1)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- 医疗/健康 二级行业
INSERT INTO industry (code, name, parent_id, level, sort_order, status) VALUES
('HEALTH_HOSPITAL', '医院', 5, 2, 1, 1),
('HEALTH_PHARMA', '制药', 5, 2, 2, 1),
('HEALTH_DEVICE', '医疗器械', 5, 2, 3, 1),
('HEALTH_MANAGEMENT', '健康管理', 5, 2, 4, 1),
('HEALTH_BIOTECH', '生物技术', 5, 2, 5, 1)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- 零售/电商 二级行业
INSERT INTO industry (code, name, parent_id, level, sort_order, status) VALUES
('RETAIL_GENERAL', '综合零售', 6, 2, 1, 1),
('RETAIL_PLATFORM', '电商平台', 6, 2, 2, 1),
('RETAIL_FMCG', '快消品', 6, 2, 3, 1),
('RETAIL_LUXURY', '奢侈品', 6, 2, 4, 1)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- 房地产/建筑 二级行业
INSERT INTO industry (code, name, parent_id, level, sort_order, status) VALUES
('RE_DEVELOPMENT', '房地产开发', 7, 2, 1, 1),
('RE_CONSTRUCTION', '建筑工程', 7, 2, 2, 1),
('RE_PROPERTY', '物业管理', 7, 2, 3, 1),
('RE_DECORATION', '装修装饰', 7, 2, 4, 1)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- 政府/公共事业 二级行业
INSERT INTO industry (code, name, parent_id, level, sort_order, status) VALUES
('GOV_AGENCY', '政府机关', 8, 2, 1, 1),
('GOV_SERVICE', '公共服务', 8, 2, 2, 1),
('GOV_ENERGY', '能源', 8, 2, 3, 1),
('GOV_TRANSPORT', '交通运输', 8, 2, 4, 1)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- 初始化默认工作流模板
USE mota_project;

INSERT INTO workflow_template (name, description, is_default, is_system, created_at) VALUES
('标准工作流', '适用于大多数项目的标准工作流程', 1, 1, NOW()),
('敏捷开发工作流', '适用于敏捷开发团队的工作流程', 0, 1, NOW()),
('简单工作流', '简化的三状态工作流程', 0, 1, NOW())
ON DUPLICATE KEY UPDATE description = VALUES(description);

-- 初始化AI方案模板
USE mota_ai;

INSERT INTO ai_proposal_template (name, proposal_type, description, is_system, is_enabled, created_at) VALUES
('项目可行性分析报告', 'feasibility', '用于分析项目可行性的标准模板', 1, 1, NOW()),
('技术方案设计文档', 'technical', '技术方案设计的标准模板', 1, 1, NOW()),
('商业计划书', 'business', '商业计划书的标准模板', 1, 1, NOW()),
('项目总结报告', 'summary', '项目总结报告的标准模板', 1, 1, NOW()),
('需求分析文档', 'requirement', '需求分析文档的标准模板', 1, 1, NOW())
ON DUPLICATE KEY UPDATE description = VALUES(description);

-- =====================================================
-- 初始化权限、角色和部门默认数据
-- =====================================================
USE mota_user;

-- 一级菜单
INSERT INTO sys_permission (id, name, code, parent_id, type, path, component, icon, sort, visible, status, deleted) VALUES
(1, '工作台', 'dashboard', 0, 'menu', '/dashboard', 'dashboard/index', 'DashboardOutlined', 1, 1, 1, 0),
(10, 'AI助理', 'ai', 0, 'directory', '/ai', NULL, 'RobotOutlined', 10, 1, 1, 0),
(20, '项目协同', 'project', 0, 'directory', '/projects', NULL, 'ProjectOutlined', 20, 1, 1, 0),
(30, '知识库', 'knowledge', 0, 'directory', '/knowledge', NULL, 'BookOutlined', 30, 1, 1, 0),
(40, '日程管理', 'calendar', 0, 'menu', '/calendar', 'calendar/index', 'CalendarOutlined', 40, 1, 1, 0),
(50, '新闻追踪', 'news', 0, 'menu', '/news', 'news/index', 'ReadOutlined', 50, 1, 1, 0),
(60, '组织管理', 'organization', 0, 'directory', '/organization', NULL, 'TeamOutlined', 60, 1, 1, 0),
(70, '系统设置', 'system', 0, 'directory', '/system', NULL, 'SettingOutlined', 70, 1, 1, 0)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- AI助理子菜单
INSERT INTO sys_permission (id, name, code, parent_id, type, path, component, icon, sort, visible, status, deleted) VALUES
(1001, 'AI助手', 'ai:assistant', 10, 'menu', '/ai/assistant', 'ai/assistant/index', NULL, 1, 1, 1, 0),
(1002, '方案生成', 'ai:proposal', 10, 'menu', '/ai/proposal', 'ai/proposal/index', NULL, 2, 1, 1, 0),
(1003, 'PPT生成', 'ai:ppt', 10, 'menu', '/ai/ppt', 'ai/ppt/index', NULL, 3, 1, 1, 0),
(1004, 'AI知识库', 'ai:knowledge', 10, 'menu', '/ai/knowledge', 'ai/knowledge/index', NULL, 4, 1, 1, 0),
(1005, '智能搜索', 'ai:search', 10, 'menu', '/ai/search', 'ai/search/index', NULL, 5, 1, 1, 0),
(1006, '模型训练', 'ai:training', 10, 'menu', '/ai/training', 'ai/training/index', NULL, 6, 1, 1, 0),
(1007, '历史记录', 'ai:history', 10, 'menu', '/ai/history', 'ai/history/index', NULL, 7, 1, 1, 0),
(1008, '模型管理', 'ai:model', 10, 'menu', '/ai/model', 'ai/model/index', NULL, 8, 1, 1, 0)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- 项目协同子菜单
INSERT INTO sys_permission (id, name, code, parent_id, type, path, component, icon, sort, visible, status, deleted) VALUES
(2001, '项目管理', 'project:list', 20, 'menu', '/projects', 'project/list/index', NULL, 1, 1, 1, 0),
(2002, '我的任务', 'project:tasks', 20, 'menu', '/tasks', 'project/tasks/index', NULL, 2, 1, 1, 0),
(2003, '进度跟踪', 'project:progress', 20, 'menu', '/progress', 'project/progress/index', NULL, 3, 1, 1, 0),
(2004, '资源管理', 'project:resource', 20, 'menu', '/resources', 'project/resource/index', NULL, 4, 1, 1, 0)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- 知识库子菜单
INSERT INTO sys_permission (id, name, code, parent_id, type, path, component, icon, sort, visible, status, deleted) VALUES
(3001, '文档管理', 'knowledge:docs', 30, 'menu', '/knowledge/docs', 'knowledge/docs/index', NULL, 1, 1, 1, 0),
(3002, '知识图谱', 'knowledge:graph', 30, 'menu', '/knowledge/graph', 'knowledge/graph/index', NULL, 2, 1, 1, 0),
(3003, '模板中心', 'knowledge:templates', 30, 'menu', '/knowledge/templates', 'knowledge/templates/index', NULL, 3, 1, 1, 0)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- 组织管理子菜单
INSERT INTO sys_permission (id, name, code, parent_id, type, path, component, icon, sort, visible, status, deleted) VALUES
(6001, '部门管理', 'org:department', 60, 'menu', '/departments', 'organization/department/index', NULL, 1, 1, 1, 0),
(6002, '成员管理', 'org:member', 60, 'menu', '/members', 'organization/member/index', NULL, 2, 1, 1, 0),
(6003, '角色管理', 'org:role', 60, 'menu', '/roles', 'organization/role/index', NULL, 3, 1, 1, 0),
(6004, '权限管理', 'org:permission', 60, 'menu', '/permissions', 'organization/permission/index', NULL, 4, 1, 1, 0)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- 系统设置子菜单
INSERT INTO sys_permission (id, name, code, parent_id, type, path, component, icon, sort, visible, status, deleted) VALUES
(7001, '企业设置', 'system:enterprise', 70, 'menu', '/system/enterprise', 'system/enterprise/index', NULL, 1, 1, 1, 0),
(7002, '安全设置', 'system:security', 70, 'menu', '/system/security', 'system/security/index', NULL, 2, 1, 1, 0),
(7003, '集成管理', 'system:integration', 70, 'menu', '/system/integration', 'system/integration/index', NULL, 3, 1, 1, 0),
(7004, '操作日志', 'system:log', 70, 'menu', '/system/log', 'system/log/index', NULL, 4, 1, 1, 0)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- 按钮权限（操作权限）
INSERT INTO sys_permission (id, name, code, parent_id, type, path, icon, sort, visible, status, deleted) VALUES
-- 项目操作权限
(20011, '创建项目', 'project:create', 2001, 'button', NULL, NULL, 1, 1, 1, 0),
(20012, '编辑项目', 'project:edit', 2001, 'button', NULL, NULL, 2, 1, 1, 0),
(20013, '删除项目', 'project:delete', 2001, 'button', NULL, NULL, 3, 1, 1, 0),
(20014, '归档项目', 'project:archive', 2001, 'button', NULL, NULL, 4, 1, 1, 0),
-- 任务操作权限
(20021, '创建任务', 'task:create', 2002, 'button', NULL, NULL, 1, 1, 1, 0),
(20022, '编辑任务', 'task:edit', 2002, 'button', NULL, NULL, 2, 1, 1, 0),
(20023, '删除任务', 'task:delete', 2002, 'button', NULL, NULL, 3, 1, 1, 0),
(20024, '分配任务', 'task:assign', 2002, 'button', NULL, NULL, 4, 1, 1, 0),
-- 部门操作权限
(60011, '创建部门', 'department:create', 6001, 'button', NULL, NULL, 1, 1, 1, 0),
(60012, '编辑部门', 'department:edit', 6001, 'button', NULL, NULL, 2, 1, 1, 0),
(60013, '删除部门', 'department:delete', 6001, 'button', NULL, NULL, 3, 1, 1, 0),
-- 成员操作权限
(60021, '邀请成员', 'member:invite', 6002, 'button', NULL, NULL, 1, 1, 1, 0),
(60022, '编辑成员', 'member:edit', 6002, 'button', NULL, NULL, 2, 1, 1, 0),
(60023, '移除成员', 'member:remove', 6002, 'button', NULL, NULL, 3, 1, 1, 0),
(60024, '禁用成员', 'member:disable', 6002, 'button', NULL, NULL, 4, 1, 1, 0),
-- 角色操作权限
(60031, '创建角色', 'role:create', 6003, 'button', NULL, NULL, 1, 1, 1, 0),
(60032, '编辑角色', 'role:edit', 6003, 'button', NULL, NULL, 2, 1, 1, 0),
(60033, '删除角色', 'role:delete', 6003, 'button', NULL, NULL, 3, 1, 1, 0),
(60034, '分配权限', 'role:assign', 6003, 'button', NULL, NULL, 4, 1, 1, 0),
-- AI模型训练权限
(10061, '上传训练数据', 'ai:training:upload', 1006, 'button', NULL, NULL, 1, 1, 1, 0),
(10062, '启动训练', 'ai:training:start', 1006, 'button', NULL, NULL, 2, 1, 1, 0),
(10063, '部署模型', 'ai:training:deploy', 1006, 'button', NULL, NULL, 3, 1, 1, 0),
-- 系统设置权限
(70011, '编辑企业信息', 'enterprise:edit', 7001, 'button', NULL, NULL, 1, 1, 1, 0),
(70021, '安全配置', 'security:config', 7002, 'button', NULL, NULL, 1, 1, 1, 0),
(70031, '集成配置', 'integration:config', 7003, 'button', NULL, NULL, 1, 1, 1, 0)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- 初始化角色数据
-- 企业级管理角色
INSERT INTO sys_role (id, name, code, sort, data_scope, status, is_system, remark, deleted) VALUES
(1, '超级管理员', 'super_admin', 1, 1, 1, 1, '系统最高权限，拥有所有功能的完全控制权，包括系统配置、企业数据、付费管理等', 0),
(2, '企业管理员', 'enterprise_admin', 2, 1, 1, 1, '企业级管理权限，可管理部门架构、角色权限、成员账号、审批流程等', 0)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- 部门级管理角色
INSERT INTO sys_role (id, name, code, sort, data_scope, status, is_system, remark, deleted) VALUES
(3, '部门经理', 'dept_manager', 3, 3, 1, 1, '部门管理权限，可管理本部门成员、任务分配、数据统计、审批节点等', 0),
(4, '项目负责人', 'project_manager', 4, 4, 1, 1, '项目管理权限，可创建项目、分配成员、管控进度、风险预警等', 0)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- 普通员工角色
INSERT INTO sys_role (id, name, code, sort, data_scope, status, is_system, remark, deleted) VALUES
(5, '普通成员', 'member', 5, 5, 1, 1, '基础员工权限，可接收任务、提交进度、参与协作、提交审批等', 0),
(6, '实习生/外包', 'intern', 6, 5, 1, 1, '受限权限，仅可查看和提交分配的任务，无法访问核心数据', 0)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- SaaS专属角色
INSERT INTO sys_role (id, name, code, sort, data_scope, status, is_system, remark, deleted) VALUES
(7, '数据分析师', 'data_analyst', 7, 4, 1, 1, '数据分析权限，可提取数据、生成报表、配置可视化、评估算法效果', 0),
(8, 'AI模型训练师', 'ai_trainer', 8, 4, 1, 1, 'AI训练权限，可上传训练数据、调整模型参数、管理模型版本、监控效果', 0),
(9, '合规专员', 'compliance_officer', 9, 2, 1, 1, '合规审核权限，可审核数据隐私、检查权限合规、配置监管政策', 0)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- 角色权限关联
-- 超级管理员 - 拥有所有权限
INSERT IGNORE INTO sys_role_permission (role_id, permission_id)
SELECT 1, id FROM sys_permission WHERE deleted = 0;

-- 企业管理员 - 除系统核心配置外的所有权限
INSERT IGNORE INTO sys_role_permission (role_id, permission_id)
SELECT 2, id FROM sys_permission WHERE deleted = 0 AND code NOT IN ('system:security', 'security:config');

-- 部门经理 - 工作台、项目、知识库、日程、组织管理（部门和成员）
INSERT IGNORE INTO sys_role_permission (role_id, permission_id)
SELECT 3, id FROM sys_permission WHERE deleted = 0 AND (
    id IN (1, 20, 30, 40, 60) OR
    parent_id IN (20, 30, 40) OR
    id IN (6001, 6002, 60011, 60012, 60021, 60022)
);

-- 项目负责人 - 工作台、项目管理、知识库、日程
INSERT IGNORE INTO sys_role_permission (role_id, permission_id)
SELECT 4, id FROM sys_permission WHERE deleted = 0 AND (
    id IN (1, 20, 30, 40) OR
    parent_id IN (20, 30, 40) OR
    id IN (20011, 20012, 20013, 20014, 20021, 20022, 20023, 20024)
);

-- 普通成员 - 工作台、项目（查看和任务）、知识库（查看）、日程、AI助手
INSERT IGNORE INTO sys_role_permission (role_id, permission_id)
SELECT 5, id FROM sys_permission WHERE deleted = 0 AND (
    id IN (1, 10, 20, 30, 40) OR
    id IN (1001, 1002, 1003, 1005, 1007) OR
    id IN (2001, 2002, 2003) OR
    id IN (3001, 3003) OR
    id IN (20021, 20022)
);

-- 实习生/外包 - 仅工作台和任务查看
INSERT IGNORE INTO sys_role_permission (role_id, permission_id)
SELECT 6, id FROM sys_permission WHERE deleted = 0 AND id IN (1, 2002);

-- 数据分析师 - 工作台、AI分析、项目数据、知识库
INSERT IGNORE INTO sys_role_permission (role_id, permission_id)
SELECT 7, id FROM sys_permission WHERE deleted = 0 AND (
    id IN (1, 10, 20, 30) OR
    id IN (1001, 1005, 1007) OR
    id IN (2001, 2003) OR
    id IN (3001, 3002)
);

-- AI模型训练师 - 工作台、AI全部功能
INSERT IGNORE INTO sys_role_permission (role_id, permission_id)
SELECT 8, id FROM sys_permission WHERE deleted = 0 AND (
    id IN (1, 10) OR
    parent_id = 10 OR
    id IN (10061, 10062, 10063)
);

-- 合规专员 - 工作台、系统设置、操作日志
INSERT IGNORE INTO sys_role_permission (role_id, permission_id)
SELECT 9, id FROM sys_permission WHERE deleted = 0 AND (
    id IN (1, 70) OR
    id IN (7001, 7002, 7004)
);

-- 初始化部门数据
-- 一级部门
INSERT INTO department (id, org_id, name, description, parent_id, sort_order, status, created_at, updated_at, deleted, version) VALUES
(1, 'default', '总部', '公司总部/总经办', NULL, 1, 1, NOW(), NOW(), 0, 1),
(2, 'default', '研发部', '负责产品开发、迭代、技术维护', NULL, 2, 1, NOW(), NOW(), 0, 1),
(3, 'default', '产品部', '负责需求调研、产品规划、原型设计、版本管理', NULL, 3, 1, NOW(), NOW(), 0, 1),
(4, 'default', '市场部', '负责品牌推广、获客、市场调研、活动策划', NULL, 4, 1, NOW(), NOW(), 0, 1),
(5, 'default', '销售部', '负责客户跟进、合同签订、回款', NULL, 5, 1, NOW(), NOW(), 0, 1),
(6, 'default', '客户成功部', '负责客户培训、问题解决、续费转化', NULL, 6, 1, NOW(), NOW(), 0, 1),
(7, 'default', '运营部', '负责用户运营、内容运营、数据运营', NULL, 7, 1, NOW(), NOW(), 0, 1),
(8, 'default', '人力资源部', '负责招聘、绩效、员工管理', NULL, 8, 1, NOW(), NOW(), 0, 1),
(9, 'default', '财务部', '负责预算、报销、财务报表', NULL, 9, 1, NOW(), NOW(), 0, 1),
(10, 'default', '行政部', '负责办公用品、办公环境、行政事务', NULL, 10, 1, NOW(), NOW(), 0, 1),
(11, 'default', '数据合规部', '负责数据隐私、算法合规、行业监管适配', NULL, 11, 1, NOW(), NOW(), 0, 1),
(12, 'default', '项目部', '统筹跨部门项目的资源协调和进度管控', NULL, 12, 1, NOW(), NOW(), 0, 1)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- 研发部子部门
INSERT INTO department (id, org_id, name, description, parent_id, sort_order, status, created_at, updated_at, deleted, version) VALUES
(201, 'default', '前端组', '负责Web/移动端前端开发', 2, 1, 1, NOW(), NOW(), 0, 1),
(202, 'default', '后端组', '负责服务端开发、API设计', 2, 2, 1, NOW(), NOW(), 0, 1),
(203, 'default', '算法组', '负责AI算法研发、模型训练', 2, 3, 1, NOW(), NOW(), 0, 1),
(204, 'default', '测试组', '负责质量保证、自动化测试', 2, 4, 1, NOW(), NOW(), 0, 1),
(205, 'default', '运维组', '负责系统运维、DevOps', 2, 5, 1, NOW(), NOW(), 0, 1)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- 销售部子部门
INSERT INTO department (id, org_id, name, description, parent_id, sort_order, status, created_at, updated_at, deleted, version) VALUES
(501, 'default', '直销组', '负责直接客户销售', 5, 1, 1, NOW(), NOW(), 0, 1),
(502, 'default', '渠道组', '负责渠道分销合作', 5, 2, 1, NOW(), NOW(), 0, 1)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- 运营部子部门
INSERT INTO department (id, org_id, name, description, parent_id, sort_order, status, created_at, updated_at, deleted, version) VALUES
(701, 'default', '用户运营组', '负责用户活跃度和留存', 7, 1, 1, NOW(), NOW(), 0, 1),
(702, 'default', '内容运营组', '负责内容创作和传播', 7, 2, 1, NOW(), NOW(), 0, 1),
(703, 'default', '数据运营组', '负责数据分析和优化', 7, 3, 1, NOW(), NOW(), 0, 1)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- 同步部门数据到 mota_project 数据库
USE mota_project;

-- 一级部门
INSERT INTO department (id, org_id, name, description, parent_id, sort_order, status, created_at, updated_at, deleted, version) VALUES
(1, 'default', '总部', '公司总部/总经办', NULL, 1, 1, NOW(), NOW(), 0, 1),
(2, 'default', '研发部', '负责产品开发、迭代、技术维护', NULL, 2, 1, NOW(), NOW(), 0, 1),
(3, 'default', '产品部', '负责需求调研、产品规划、原型设计、版本管理', NULL, 3, 1, NOW(), NOW(), 0, 1),
(4, 'default', '市场部', '负责品牌推广、获客、市场调研、活动策划', NULL, 4, 1, NOW(), NOW(), 0, 1),
(5, 'default', '销售部', '负责客户跟进、合同签订、回款', NULL, 5, 1, NOW(), NOW(), 0, 1),
(6, 'default', '客户成功部', '负责客户培训、问题解决、续费转化', NULL, 6, 1, NOW(), NOW(), 0, 1),
(7, 'default', '运营部', '负责用户运营、内容运营、数据运营', NULL, 7, 1, NOW(), NOW(), 0, 1),
(8, 'default', '人力资源部', '负责招聘、绩效、员工管理', NULL, 8, 1, NOW(), NOW(), 0, 1),
(9, 'default', '财务部', '负责预算、报销、财务报表', NULL, 9, 1, NOW(), NOW(), 0, 1),
(10, 'default', '行政部', '负责办公用品、办公环境、行政事务', NULL, 10, 1, NOW(), NOW(), 0, 1),
(11, 'default', '数据合规部', '负责数据隐私、算法合规、行业监管适配', NULL, 11, 1, NOW(), NOW(), 0, 1),
(12, 'default', '项目部', '统筹跨部门项目的资源协调和进度管控', NULL, 12, 1, NOW(), NOW(), 0, 1)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- 研发部子部门
INSERT INTO department (id, org_id, name, description, parent_id, sort_order, status, created_at, updated_at, deleted, version) VALUES
(201, 'default', '前端组', '负责Web/移动端前端开发', 2, 1, 1, NOW(), NOW(), 0, 1),
(202, 'default', '后端组', '负责服务端开发、API设计', 2, 2, 1, NOW(), NOW(), 0, 1),
(203, 'default', '算法组', '负责AI算法研发、模型训练', 2, 3, 1, NOW(), NOW(), 0, 1),
(204, 'default', '测试组', '负责质量保证、自动化测试', 2, 4, 1, NOW(), NOW(), 0, 1),
(205, 'default', '运维组', '负责系统运维、DevOps', 2, 5, 1, NOW(), NOW(), 0, 1)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- 销售部子部门
INSERT INTO department (id, org_id, name, description, parent_id, sort_order, status, created_at, updated_at, deleted, version) VALUES
(501, 'default', '直销组', '负责直接客户销售', 5, 1, 1, NOW(), NOW(), 0, 1),
(502, 'default', '渠道组', '负责渠道分销合作', 5, 2, 1, NOW(), NOW(), 0, 1)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- 运营部子部门
INSERT INTO department (id, org_id, name, description, parent_id, sort_order, status, created_at, updated_at, deleted, version) VALUES
(701, 'default', '用户运营组', '负责用户活跃度和留存', 7, 1, 1, NOW(), NOW(), 0, 1),
(702, 'default', '内容运营组', '负责内容创作和传播', 7, 2, 1, NOW(), NOW(), 0, 1),
(703, 'default', '数据运营组', '负责数据分析和优化', 7, 3, 1, NOW(), NOW(), 0, 1)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- 完成初始化
SELECT 'Mota 微服务数据库初始化完成!' AS message;