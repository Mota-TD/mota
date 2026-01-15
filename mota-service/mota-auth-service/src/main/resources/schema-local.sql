-- Auth Service 数据库表结构 (H2 兼容版本)

-- 用户表
CREATE TABLE IF NOT EXISTS sys_user (
    id BIGINT NOT NULL,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) DEFAULT NULL,
    phone VARCHAR(20) DEFAULT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nickname VARCHAR(50) DEFAULT NULL,
    avatar VARCHAR(500) DEFAULT NULL,
    status INT DEFAULT 1,
    org_id VARCHAR(50) DEFAULT NULL,
    org_name VARCHAR(100) DEFAULT NULL,
    last_login_at TIMESTAMP DEFAULT NULL,
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    create_by BIGINT DEFAULT NULL,
    update_by BIGINT DEFAULT NULL,
    deleted INT DEFAULT 0,
    PRIMARY KEY (id)
);

CREATE UNIQUE INDEX IF NOT EXISTS uk_sys_user_username ON sys_user(username);
CREATE INDEX IF NOT EXISTS idx_sys_user_email ON sys_user(email);
CREATE INDEX IF NOT EXISTS idx_sys_user_phone ON sys_user(phone);
CREATE INDEX IF NOT EXISTS idx_sys_user_org_id ON sys_user(org_id);

-- 行业表
CREATE TABLE IF NOT EXISTS industry (
    id BIGINT AUTO_INCREMENT,
    code VARCHAR(50) DEFAULT NULL,
    name VARCHAR(100) NOT NULL,
    parent_id BIGINT DEFAULT 0,
    level INT DEFAULT 1,
    sort_order INT DEFAULT 0,
    icon VARCHAR(200) DEFAULT NULL,
    description VARCHAR(500) DEFAULT NULL,
    status INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS idx_industry_parent_id ON industry(parent_id);
CREATE INDEX IF NOT EXISTS idx_industry_code ON industry(code);

-- 企业表
CREATE TABLE IF NOT EXISTS enterprise (
    id BIGINT NOT NULL,
    org_id VARCHAR(50) NOT NULL,
    name VARCHAR(200) NOT NULL,
    short_name VARCHAR(100) DEFAULT NULL,
    industry_id BIGINT DEFAULT NULL,
    industry_name VARCHAR(100) DEFAULT NULL,
    logo VARCHAR(500) DEFAULT NULL,
    description VARCHAR(1000) DEFAULT NULL,
    address VARCHAR(500) DEFAULT NULL,
    contact_name VARCHAR(50) DEFAULT NULL,
    contact_phone VARCHAR(20) DEFAULT NULL,
    contact_email VARCHAR(100) DEFAULT NULL,
    website VARCHAR(200) DEFAULT NULL,
    scale VARCHAR(20) DEFAULT NULL,
    admin_user_id BIGINT DEFAULT NULL,
    member_count INT DEFAULT 0,
    max_members INT DEFAULT 10,
    status INT DEFAULT 1,
    verified INT DEFAULT 0,
    verified_at TIMESTAMP DEFAULT NULL,
    expired_at TIMESTAMP DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted INT DEFAULT 0,
    PRIMARY KEY (id)
);

CREATE UNIQUE INDEX IF NOT EXISTS uk_enterprise_org_id ON enterprise(org_id);
CREATE INDEX IF NOT EXISTS idx_enterprise_admin_user_id ON enterprise(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_enterprise_industry_id ON enterprise(industry_id);

-- 企业成员表
CREATE TABLE IF NOT EXISTS enterprise_member (
    id BIGINT NOT NULL,
    enterprise_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    role VARCHAR(50) DEFAULT 'member',
    status INT DEFAULT 1,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted INT DEFAULT 0,
    PRIMARY KEY (id)
);

CREATE UNIQUE INDEX IF NOT EXISTS uk_enterprise_member ON enterprise_member(enterprise_id, user_id);
CREATE INDEX IF NOT EXISTS idx_enterprise_member_user_id ON enterprise_member(user_id);

-- 企业邀请表
CREATE TABLE IF NOT EXISTS enterprise_invitation (
    id BIGINT NOT NULL,
    enterprise_id BIGINT NOT NULL,
    invite_code VARCHAR(100) NOT NULL,
    inviter_id BIGINT NOT NULL,
    invitee_email VARCHAR(100) DEFAULT NULL,
    invitee_phone VARCHAR(20) DEFAULT NULL,
    role VARCHAR(50) DEFAULT 'member',
    status INT DEFAULT 0,
    expired_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP DEFAULT NULL,
    used_by BIGINT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted INT DEFAULT 0,
    PRIMARY KEY (id)
);

CREATE UNIQUE INDEX IF NOT EXISTS uk_invitation_code ON enterprise_invitation(invite_code);
CREATE INDEX IF NOT EXISTS idx_invitation_enterprise_id ON enterprise_invitation(enterprise_id);