-- =====================================================
-- Mota 企业注册模块 V17.0 - 数据库迁移脚本 (Navicat版)
-- 新增行业表、企业表、企业成员表、企业邀请表
-- 创建日期: 2025-12-26
-- =====================================================

-- 选择数据库
USE mota;

-- =====================================================
-- 1. 行业表 (industry)
-- =====================================================
CREATE TABLE IF NOT EXISTS industry (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(50) NOT NULL UNIQUE COMMENT '行业代码',
    name VARCHAR(100) NOT NULL COMMENT '行业名称',
    parent_id BIGINT COMMENT '父行业ID',
    level INT DEFAULT 1 COMMENT '层级(1-一级行业,2-二级行业)',
    sort_order INT DEFAULT 0 COMMENT '排序顺序',
    icon VARCHAR(100) COMMENT '行业图标',
    description VARCHAR(500) COMMENT '行业描述',
    status TINYINT DEFAULT 1 COMMENT '状态(0-禁用,1-启用)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_parent (parent_id),
    INDEX idx_code (code),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='行业表';

-- =====================================================
-- 2. 企业表 (enterprise)
-- =====================================================
CREATE TABLE IF NOT EXISTS enterprise (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    org_id VARCHAR(50) NOT NULL UNIQUE COMMENT '组织ID(用于关联用户)',
    name VARCHAR(200) NOT NULL COMMENT '企业名称',
    short_name VARCHAR(100) COMMENT '企业简称',
    industry_id BIGINT NOT NULL COMMENT '所属行业ID',
    industry_name VARCHAR(100) COMMENT '行业名称(冗余)',
    logo VARCHAR(500) COMMENT '企业Logo',
    description TEXT COMMENT '企业简介',
    address VARCHAR(500) COMMENT '企业地址',
    contact_name VARCHAR(50) COMMENT '联系人姓名',
    contact_phone VARCHAR(20) COMMENT '联系电话',
    contact_email VARCHAR(100) COMMENT '联系邮箱',
    website VARCHAR(200) COMMENT '企业网站',
    scale VARCHAR(50) COMMENT '企业规模(1-50/51-200/201-500/501-1000/1000+)',
    admin_user_id BIGINT NOT NULL COMMENT '超级管理员用户ID',
    member_count INT DEFAULT 1 COMMENT '成员数量',
    max_members INT DEFAULT 100 COMMENT '最大成员数量',
    status TINYINT DEFAULT 1 COMMENT '状态(0-禁用,1-正常,2-待审核)',
    verified TINYINT DEFAULT 0 COMMENT '是否已认证(0-未认证,1-已认证)',
    verified_at TIMESTAMP NULL COMMENT '认证时间',
    expired_at TIMESTAMP NULL COMMENT '服务到期时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted INT DEFAULT 0 COMMENT '删除标记(0-未删除,1-已删除)',
    
    INDEX idx_org_id (org_id),
    INDEX idx_industry (industry_id),
    INDEX idx_admin (admin_user_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='企业表';

-- =====================================================
-- 3. 企业成员表 (enterprise_member)
-- =====================================================
CREATE TABLE IF NOT EXISTS enterprise_member (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    enterprise_id BIGINT NOT NULL COMMENT '企业ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    role VARCHAR(30) DEFAULT 'member' COMMENT '角色(super_admin/admin/member)',
    department_id BIGINT COMMENT '所属部门ID',
    position VARCHAR(100) COMMENT '职位',
    employee_no VARCHAR(50) COMMENT '工号',
    status TINYINT DEFAULT 1 COMMENT '状态(0-禁用,1-正常)',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '加入时间',
    invited_by BIGINT COMMENT '邀请人ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted INT DEFAULT 0 COMMENT '删除标记(0-未删除,1-已删除)',
    
    UNIQUE KEY uk_enterprise_user (enterprise_id, user_id),
    INDEX idx_enterprise (enterprise_id),
    INDEX idx_user (user_id),
    INDEX idx_department (department_id),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='企业成员表';

-- =====================================================
-- 4. 企业邀请表 (enterprise_invitation)
-- =====================================================
CREATE TABLE IF NOT EXISTS enterprise_invitation (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    enterprise_id BIGINT NOT NULL COMMENT '企业ID',
    invite_code VARCHAR(100) NOT NULL UNIQUE COMMENT '邀请码',
    invite_type VARCHAR(20) DEFAULT 'link' COMMENT '邀请类型(link-链接邀请,email-邮件邀请,phone-手机邀请)',
    target_email VARCHAR(100) COMMENT '目标邮箱',
    target_phone VARCHAR(20) COMMENT '目标手机号',
    role VARCHAR(30) DEFAULT 'member' COMMENT '邀请角色',
    department_id BIGINT COMMENT '邀请加入的部门ID',
    max_uses INT DEFAULT 1 COMMENT '最大使用次数(0-无限制)',
    used_count INT DEFAULT 0 COMMENT '已使用次数',
    expired_at TIMESTAMP NOT NULL COMMENT '过期时间',
    status TINYINT DEFAULT 1 COMMENT '状态(0-已失效,1-有效,2-已使用完)',
    invited_by BIGINT NOT NULL COMMENT '邀请人ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_enterprise (enterprise_id),
    INDEX idx_code (invite_code),
    INDEX idx_email (target_email),
    INDEX idx_phone (target_phone),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='企业邀请表';

-- =====================================================
-- 5. 插入一级行业数据
-- =====================================================
INSERT IGNORE INTO industry (code, name, parent_id, level, sort_order, icon, description) VALUES
('IT', '信息技术/互联网', NULL, 1, 1, '💻', '包括软件开发、互联网服务、IT咨询等'),
('FINANCE', '金融/银行/保险', NULL, 1, 2, '🏦', '包括银行、证券、保险、投资等'),
('MANUFACTURING', '制造业', NULL, 1, 3, '🏭', '包括机械制造、电子制造、汽车制造等'),
('RETAIL', '零售/电商', NULL, 1, 4, '🛒', '包括线下零售、电子商务、批发贸易等'),
('HEALTHCARE', '医疗/健康', NULL, 1, 5, '🏥', '包括医院、医药、医疗器械、健康服务等'),
('EDUCATION', '教育/培训', NULL, 1, 6, '📚', '包括学校、培训机构、在线教育等'),
('REALESTATE', '房地产/建筑', NULL, 1, 7, '🏗️', '包括房地产开发、建筑施工、装修设计等'),
('MEDIA', '传媒/广告/文化', NULL, 1, 8, '📺', '包括媒体、广告、影视、游戏等'),
('LOGISTICS', '物流/运输', NULL, 1, 9, '🚚', '包括快递、货运、仓储、供应链等'),
('ENERGY', '能源/环保', NULL, 1, 10, '⚡', '包括电力、石油、新能源、环保等'),
('AGRICULTURE', '农业/食品', NULL, 1, 11, '🌾', '包括农业种植、食品加工、餐饮服务等'),
('CONSULTING', '咨询/法律/会计', NULL, 1, 12, '📋', '包括管理咨询、法律服务、会计审计等'),
('GOVERNMENT', '政府/公共事业', NULL, 1, 13, '🏛️', '包括政府机关、事业单位、非营利组织等'),
('OTHER', '其他行业', NULL, 1, 99, '📦', '其他未分类行业');

-- =====================================================
-- 6. 插入二级行业数据 - IT行业
-- =====================================================
INSERT IGNORE INTO industry (code, name, parent_id, level, sort_order, icon, description) 
SELECT 'IT_SOFTWARE', '软件开发', id, 2, 1, '💾', '软件产品开发、定制开发' FROM industry WHERE code = 'IT';

INSERT IGNORE INTO industry (code, name, parent_id, level, sort_order, icon, description) 
SELECT 'IT_INTERNET', '互联网服务', id, 2, 2, '🌐', '互联网平台、SaaS服务' FROM industry WHERE code = 'IT';

INSERT IGNORE INTO industry (code, name, parent_id, level, sort_order, icon, description) 
SELECT 'IT_AI', '人工智能', id, 2, 3, '🤖', 'AI算法、机器学习、深度学习' FROM industry WHERE code = 'IT';

INSERT IGNORE INTO industry (code, name, parent_id, level, sort_order, icon, description) 
SELECT 'IT_BIGDATA', '大数据', id, 2, 4, '📊', '数据分析、数据挖掘、BI' FROM industry WHERE code = 'IT';

INSERT IGNORE INTO industry (code, name, parent_id, level, sort_order, icon, description) 
SELECT 'IT_CLOUD', '云计算', id, 2, 5, '☁️', '云服务、云平台、云安全' FROM industry WHERE code = 'IT';

INSERT IGNORE INTO industry (code, name, parent_id, level, sort_order, icon, description) 
SELECT 'IT_SECURITY', '网络安全', id, 2, 6, '🔒', '信息安全、网络安全' FROM industry WHERE code = 'IT';

INSERT IGNORE INTO industry (code, name, parent_id, level, sort_order, icon, description) 
SELECT 'IT_HARDWARE', 'IT硬件', id, 2, 7, '🖥️', '服务器、网络设备、终端设备' FROM industry WHERE code = 'IT';

-- =====================================================
-- 7. 插入二级行业数据 - 金融行业
-- =====================================================
INSERT IGNORE INTO industry (code, name, parent_id, level, sort_order, icon, description) 
SELECT 'FINANCE_BANK', '银行', id, 2, 1, '🏦', '商业银行、投资银行' FROM industry WHERE code = 'FINANCE';

INSERT IGNORE INTO industry (code, name, parent_id, level, sort_order, icon, description) 
SELECT 'FINANCE_SECURITIES', '证券/基金', id, 2, 2, '📈', '证券公司、基金公司' FROM industry WHERE code = 'FINANCE';

INSERT IGNORE INTO industry (code, name, parent_id, level, sort_order, icon, description) 
SELECT 'FINANCE_INSURANCE', '保险', id, 2, 3, '🛡️', '人寿保险、财产保险' FROM industry WHERE code = 'FINANCE';

INSERT IGNORE INTO industry (code, name, parent_id, level, sort_order, icon, description) 
SELECT 'FINANCE_FINTECH', '金融科技', id, 2, 4, '💳', '支付、借贷、区块链' FROM industry WHERE code = 'FINANCE';

-- =====================================================
-- 验证结果
-- =====================================================
SELECT '表创建完成' AS message;
SELECT COUNT(*) AS '行业数量' FROM industry;
SELECT * FROM industry ORDER BY level, sort_order LIMIT 30;