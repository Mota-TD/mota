-- 用户服务数据库表结构 (H2 兼容版本)

-- 用户表
CREATE TABLE IF NOT EXISTS sys_user (
    id BIGINT NOT NULL,
    tenant_id BIGINT NOT NULL DEFAULT 0,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) DEFAULT NULL,
    phone VARCHAR(20) DEFAULT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nickname VARCHAR(50) DEFAULT NULL,
    real_name VARCHAR(50) DEFAULT NULL,
    avatar VARCHAR(500) DEFAULT NULL,
    gender TINYINT DEFAULT 0,
    status TINYINT DEFAULT 1,
    dept_id BIGINT DEFAULT NULL,
    post_id BIGINT DEFAULT NULL,
    user_type TINYINT DEFAULT 1,
    last_login_at TIMESTAMP DEFAULT NULL,
    last_login_ip VARCHAR(50) DEFAULT NULL,
    login_fail_count INT DEFAULT 0,
    lock_time TIMESTAMP DEFAULT NULL,
    password_expire_at TIMESTAMP DEFAULT NULL,
    remark VARCHAR(500) DEFAULT NULL,
    create_by BIGINT DEFAULT NULL,
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_by BIGINT DEFAULT NULL,
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted TINYINT DEFAULT 0,
    version INT DEFAULT 0,
    PRIMARY KEY (id)
);

CREATE UNIQUE INDEX IF NOT EXISTS uk_username_tenant ON sys_user(username, tenant_id);
CREATE INDEX IF NOT EXISTS idx_user_email ON sys_user(email);
CREATE INDEX IF NOT EXISTS idx_user_phone ON sys_user(phone);
CREATE INDEX IF NOT EXISTS idx_user_dept_id ON sys_user(dept_id);
CREATE INDEX IF NOT EXISTS idx_user_tenant_id ON sys_user(tenant_id);
CREATE INDEX IF NOT EXISTS idx_user_status ON sys_user(status);

-- 部门表
CREATE TABLE IF NOT EXISTS sys_dept (
    id BIGINT NOT NULL,
    tenant_id BIGINT NOT NULL DEFAULT 0,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) DEFAULT NULL,
    parent_id BIGINT DEFAULT 0,
    ancestors VARCHAR(500) DEFAULT '',
    level INT DEFAULT 1,
    sort INT DEFAULT 0,
    leader_id BIGINT DEFAULT NULL,
    leader_name VARCHAR(50) DEFAULT NULL,
    phone VARCHAR(20) DEFAULT NULL,
    email VARCHAR(100) DEFAULT NULL,
    status TINYINT DEFAULT 1,
    remark VARCHAR(500) DEFAULT NULL,
    create_by BIGINT DEFAULT NULL,
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_by BIGINT DEFAULT NULL,
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted TINYINT DEFAULT 0,
    version INT DEFAULT 0,
    PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS idx_dept_parent_id ON sys_dept(parent_id);
CREATE INDEX IF NOT EXISTS idx_dept_tenant_id ON sys_dept(tenant_id);
CREATE INDEX IF NOT EXISTS idx_dept_code ON sys_dept(code);

-- 岗位表
CREATE TABLE IF NOT EXISTS sys_post (
    id BIGINT NOT NULL,
    tenant_id BIGINT NOT NULL DEFAULT 0,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL,
    level TINYINT DEFAULT 3,
    sort INT DEFAULT 0,
    status TINYINT DEFAULT 1,
    duties CLOB DEFAULT NULL,
    remark VARCHAR(500) DEFAULT NULL,
    create_by BIGINT DEFAULT NULL,
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_by BIGINT DEFAULT NULL,
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted TINYINT DEFAULT 0,
    version INT DEFAULT 0,
    PRIMARY KEY (id)
);

CREATE UNIQUE INDEX IF NOT EXISTS uk_post_code_tenant ON sys_post(code, tenant_id);
CREATE INDEX IF NOT EXISTS idx_post_tenant_id ON sys_post(tenant_id);

-- 角色表
CREATE TABLE IF NOT EXISTS sys_role (
    id BIGINT NOT NULL,
    tenant_id BIGINT NOT NULL DEFAULT 0,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL,
    sort INT DEFAULT 0,
    data_scope TINYINT DEFAULT 1,
    status TINYINT DEFAULT 1,
    is_system TINYINT DEFAULT 0,
    remark VARCHAR(500) DEFAULT NULL,
    create_by BIGINT DEFAULT NULL,
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_by BIGINT DEFAULT NULL,
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted TINYINT DEFAULT 0,
    version INT DEFAULT 0,
    PRIMARY KEY (id)
);

CREATE UNIQUE INDEX IF NOT EXISTS uk_role_code_tenant ON sys_role(code, tenant_id);
CREATE INDEX IF NOT EXISTS idx_role_tenant_id ON sys_role(tenant_id);

-- 权限/菜单表
CREATE TABLE IF NOT EXISTS sys_permission (
    id BIGINT NOT NULL,
    tenant_id BIGINT NOT NULL DEFAULT 0,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(100) DEFAULT NULL,
    parent_id BIGINT DEFAULT 0,
    type TINYINT DEFAULT 1,
    path VARCHAR(200) DEFAULT NULL,
    component VARCHAR(200) DEFAULT NULL,
    perms VARCHAR(100) DEFAULT NULL,
    icon VARCHAR(100) DEFAULT NULL,
    sort INT DEFAULT 0,
    visible TINYINT DEFAULT 1,
    keep_alive TINYINT DEFAULT 0,
    status TINYINT DEFAULT 1,
    remark VARCHAR(500) DEFAULT NULL,
    create_by BIGINT DEFAULT NULL,
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_by BIGINT DEFAULT NULL,
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted TINYINT DEFAULT 0,
    version INT DEFAULT 0,
    PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS idx_perm_parent_id ON sys_permission(parent_id);
CREATE INDEX IF NOT EXISTS idx_perm_tenant_id ON sys_permission(tenant_id);

-- 用户角色关联表
CREATE TABLE IF NOT EXISTS sys_user_role (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, role_id)
);

CREATE INDEX IF NOT EXISTS idx_user_role_role_id ON sys_user_role(role_id);

-- 角色权限关联表
CREATE TABLE IF NOT EXISTS sys_role_permission (
    role_id BIGINT NOT NULL,
    permission_id BIGINT NOT NULL,
    PRIMARY KEY (role_id, permission_id)
);

CREATE INDEX IF NOT EXISTS idx_role_perm_perm_id ON sys_role_permission(permission_id);

-- 角色部门关联表
CREATE TABLE IF NOT EXISTS sys_role_dept (
    role_id BIGINT NOT NULL,
    dept_id BIGINT NOT NULL,
    PRIMARY KEY (role_id, dept_id)
);

CREATE INDEX IF NOT EXISTS idx_role_dept_dept_id ON sys_role_dept(dept_id);

-- 登录日志表
CREATE TABLE IF NOT EXISTS sys_login_log (
    id BIGINT NOT NULL,
    tenant_id BIGINT NOT NULL DEFAULT 0,
    user_id BIGINT DEFAULT NULL,
    username VARCHAR(50) DEFAULT NULL,
    login_type VARCHAR(20) DEFAULT NULL,
    ip_address VARCHAR(50) DEFAULT NULL,
    location VARCHAR(100) DEFAULT NULL,
    browser VARCHAR(50) DEFAULT NULL,
    os VARCHAR(50) DEFAULT NULL,
    status TINYINT DEFAULT 1,
    message VARCHAR(500) DEFAULT NULL,
    login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS idx_login_log_user_id ON sys_login_log(user_id);
CREATE INDEX IF NOT EXISTS idx_login_log_tenant_id ON sys_login_log(tenant_id);
CREATE INDEX IF NOT EXISTS idx_login_log_login_time ON sys_login_log(login_time);