-- =====================================================
-- 认证服务数据库表初始化脚本
-- =====================================================

-- 设置字符集
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET character_set_connection=utf8mb4;

USE mota_auth;

-- 企业表
CREATE TABLE IF NOT EXISTS `enterprise` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '企业ID',
    `tenant_id` BIGINT COMMENT '租户ID',
    `org_id` VARCHAR(50) UNIQUE COMMENT '组织ID',
    `name` VARCHAR(200) NOT NULL COMMENT '企业名称',
    `short_name` VARCHAR(100) COMMENT '企业简称',
    `industry_id` BIGINT COMMENT '所属行业ID',
    `industry_name` VARCHAR(100) COMMENT '行业名称',
    `logo` VARCHAR(500) COMMENT '企业Logo',
    `description` TEXT COMMENT '企业简介',
    `address` VARCHAR(500) COMMENT '企业地址',
    `contact_name` VARCHAR(100) COMMENT '联系人姓名',
    `contact_phone` VARCHAR(50) COMMENT '联系电话',
    `contact_email` VARCHAR(100) COMMENT '联系邮箱',
    `website` VARCHAR(200) COMMENT '企业网站',
    `scale` VARCHAR(50) COMMENT '企业规模',
    `admin_user_id` BIGINT COMMENT '超级管理员用户ID',
    `member_count` INT DEFAULT 0 COMMENT '成员数量',
    `max_members` INT DEFAULT 100 COMMENT '最大成员数量',
    `status` TINYINT DEFAULT 1 COMMENT '状态：0-禁用，1-正常，2-待审核',
    `verified` TINYINT DEFAULT 0 COMMENT '是否已认证：0-未认证，1-已认证',
    `verified_at` TIMESTAMP NULL COMMENT '认证时间',
    `expired_at` TIMESTAMP NULL COMMENT '服务到期时间',
    `created_by` BIGINT COMMENT '创建人ID',
    `updated_by` BIGINT COMMENT '更新人ID',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted` TINYINT DEFAULT 0 COMMENT '删除标记：0-未删除，1-已删除',
    `version` INT DEFAULT 0 COMMENT '乐观锁版本号',
    INDEX `idx_org_id` (`org_id`),
    INDEX `idx_name` (`name`),
    INDEX `idx_industry` (`industry_id`),
    INDEX `idx_admin_user` (`admin_user_id`),
    INDEX `idx_status` (`status`),
    INDEX `idx_tenant` (`tenant_id`),
    INDEX `idx_deleted` (`deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='企业表';

-- 行业表
CREATE TABLE IF NOT EXISTS `industry` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '行业ID',
    `code` VARCHAR(50) NOT NULL UNIQUE COMMENT '行业代码',
    `name` VARCHAR(100) NOT NULL COMMENT '行业名称',
    `parent_id` BIGINT COMMENT '父行业ID',
    `level` INT DEFAULT 1 COMMENT '层级：1-一级行业，2-二级行业',
    `sort_order` INT DEFAULT 0 COMMENT '排序顺序',
    `icon` VARCHAR(100) COMMENT '行业图标',
    `description` VARCHAR(500) COMMENT '行业描述',
    `status` TINYINT DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX `idx_parent` (`parent_id`),
    INDEX `idx_code` (`code`),
    INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='行业表';

-- 插入一级行业数据
INSERT INTO `industry` (`id`, `code`, `name`, `parent_id`, `level`, `sort_order`, `status`) VALUES
(1, 'IT', '互联网/IT', NULL, 1, 1, 1),
(2, 'FINANCE', '金融/银行', NULL, 1, 2, 1),
(3, 'MANUFACTURING', '制造业', NULL, 1, 3, 1),
(4, 'EDUCATION', '教育/培训', NULL, 1, 4, 1),
(5, 'HEALTHCARE', '医疗/健康', NULL, 1, 5, 1),
(6, 'RETAIL', '零售/电商', NULL, 1, 6, 1),
(7, 'REALESTATE', '房地产/建筑', NULL, 1, 7, 1),
(8, 'GOVERNMENT', '政府/公共事业', NULL, 1, 8, 1),
(9, 'OTHER', '其他', NULL, 1, 9, 1);

-- 互联网/IT 二级行业
INSERT INTO `industry` (`code`, `name`, `parent_id`, `level`, `sort_order`, `status`) VALUES
('IT_SOFTWARE', '软件开发', 1, 2, 1, 1),
('IT_INTERNET', '互联网服务', 1, 2, 2, 1),
('IT_ECOMMERCE', '电子商务', 1, 2, 3, 1),
('IT_GAME', '游戏', 1, 2, 4, 1),
('IT_AI', '人工智能', 1, 2, 5, 1),
('IT_BIGDATA', '大数据', 1, 2, 6, 1),
('IT_CLOUD', '云计算', 1, 2, 7, 1),
('IT_SECURITY', '网络安全', 1, 2, 8, 1);

-- 金融/银行 二级行业
INSERT INTO `industry` (`code`, `name`, `parent_id`, `level`, `sort_order`, `status`) VALUES
('FINANCE_BANK', '银行', 2, 2, 1, 1),
('FINANCE_SECURITIES', '证券', 2, 2, 2, 1),
('FINANCE_INSURANCE', '保险', 2, 2, 3, 1),
('FINANCE_FUND', '基金', 2, 2, 4, 1),
('FINANCE_FINTECH', '金融科技', 2, 2, 5, 1);

-- 制造业 二级行业
INSERT INTO `industry` (`code`, `name`, `parent_id`, `level`, `sort_order`, `status`) VALUES
('MFG_AUTO', '汽车制造', 3, 2, 1, 1),
('MFG_ELECTRONICS', '电子制造', 3, 2, 2, 1),
('MFG_MACHINERY', '机械设备', 3, 2, 3, 1),
('MFG_CHEMICAL', '化工', 3, 2, 4, 1),
('MFG_TEXTILE', '纺织服装', 3, 2, 5, 1);

-- 教育/培训 二级行业
INSERT INTO `industry` (`code`, `name`, `parent_id`, `level`, `sort_order`, `status`) VALUES
('EDU_K12', 'K12教育', 4, 2, 1, 1),
('EDU_HIGHER', '高等教育', 4, 2, 2, 1),
('EDU_VOCATIONAL', '职业培训', 4, 2, 3, 1),
('EDU_ONLINE', '在线教育', 4, 2, 4, 1);

-- 医疗/健康 二级行业
INSERT INTO `industry` (`code`, `name`, `parent_id`, `level`, `sort_order`, `status`) VALUES
('HEALTH_HOSPITAL', '医院', 5, 2, 1, 1),
('HEALTH_PHARMA', '医药', 5, 2, 2, 1),
('HEALTH_DEVICE', '医疗器械', 5, 2, 3, 1),
('HEALTH_BIOTECH', '生物技术', 5, 2, 4, 1);

-- 零售/电商 二级行业
INSERT INTO `industry` (`code`, `name`, `parent_id`, `level`, `sort_order`, `status`) VALUES
('RETAIL_GENERAL', '综合零售', 6, 2, 1, 1),
('RETAIL_FOOD', '食品饮料', 6, 2, 2, 1),
('RETAIL_FASHION', '服装鞋帽', 6, 2, 3, 1);

-- 房地产/建筑 二级行业
INSERT INTO `industry` (`code`, `name`, `parent_id`, `level`, `sort_order`, `status`) VALUES
('RE_DEVELOPMENT', '房地产开发', 7, 2, 1, 1),
('RE_CONSTRUCTION', '建筑施工', 7, 2, 2, 1),
('RE_DECORATION', '装修装饰', 7, 2, 3, 1);

-- 政府/公共事业 二级行业
INSERT INTO `industry` (`code`, `name`, `parent_id`, `level`, `sort_order`, `status`) VALUES
('GOV_AGENCY', '政府机关', 8, 2, 1, 1),
('GOV_PUBLIC', '公共服务', 8, 2, 2, 1),
('GOV_NONPROFIT', '非营利组织', 8, 2, 3, 1);

-- 用户表
CREATE TABLE IF NOT EXISTS `sys_user` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '用户ID',
    `username` VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    `email` VARCHAR(100) COMMENT '邮箱',
    `phone` VARCHAR(20) COMMENT '手机号',
    `password_hash` VARCHAR(255) NOT NULL COMMENT '密码哈希',
    `nickname` VARCHAR(100) COMMENT '昵称',
    `avatar` VARCHAR(500) COMMENT '头像URL',
    `status` TINYINT DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
    `org_id` VARCHAR(50) COMMENT '组织ID',
    `org_name` VARCHAR(200) COMMENT '组织名称',
    `last_login_at` TIMESTAMP NULL COMMENT '最后登录时间',
    `tenant_id` BIGINT COMMENT '租户ID',
    `created_by` BIGINT COMMENT '创建人ID',
    `updated_by` BIGINT COMMENT '更新人ID',
    `dept_id` BIGINT COMMENT '部门ID',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted` TINYINT DEFAULT 0 COMMENT '删除标记：0-未删除，1-已删除',
    `version` INT DEFAULT 0 COMMENT '乐观锁版本号',
    INDEX `idx_username` (`username`),
    INDEX `idx_email` (`email`),
    INDEX `idx_phone` (`phone`),
    INDEX `idx_org_id` (`org_id`),
    INDEX `idx_status` (`status`),
    INDEX `idx_tenant` (`tenant_id`),
    INDEX `idx_deleted` (`deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 企业成员表
CREATE TABLE IF NOT EXISTS `enterprise_member` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '成员ID',
    `enterprise_id` BIGINT NOT NULL COMMENT '企业ID',
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `role` VARCHAR(50) NOT NULL COMMENT '角色：super_admin-超级管理员，admin-管理员，member-普通成员',
    `department_id` BIGINT COMMENT '所属部门ID',
    `position` VARCHAR(100) COMMENT '职位',
    `employee_no` VARCHAR(50) COMMENT '工号',
    `status` TINYINT DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
    `joined_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '加入时间',
    `invited_by` BIGINT COMMENT '邀请人ID',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted` TINYINT DEFAULT 0 COMMENT '删除标记：0-未删除，1-已删除',
    UNIQUE KEY `uk_enterprise_user` (`enterprise_id`, `user_id`, `deleted`),
    INDEX `idx_enterprise` (`enterprise_id`),
    INDEX `idx_user` (`user_id`),
    INDEX `idx_role` (`role`),
    INDEX `idx_department` (`department_id`),
    INDEX `idx_status` (`status`),
    INDEX `idx_deleted` (`deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='企业成员表';

-- 企业邀请表
CREATE TABLE IF NOT EXISTS `enterprise_invitation` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '邀请ID',
    `enterprise_id` BIGINT NOT NULL COMMENT '企业ID',
    `invite_code` VARCHAR(50) NOT NULL UNIQUE COMMENT '邀请码',
    `invite_type` VARCHAR(20) DEFAULT 'link' COMMENT '邀请类型：link-链接邀请，email-邮件邀请，phone-手机邀请',
    `target_email` VARCHAR(100) COMMENT '目标邮箱',
    `target_phone` VARCHAR(20) COMMENT '目标手机号',
    `role` VARCHAR(50) DEFAULT 'member' COMMENT '邀请角色',
    `department_id` BIGINT COMMENT '邀请加入的部门ID',
    `max_uses` INT DEFAULT 0 COMMENT '最大使用次数，0表示无限制',
    `used_count` INT DEFAULT 0 COMMENT '已使用次数',
    `expired_at` TIMESTAMP NOT NULL COMMENT '过期时间',
    `status` TINYINT DEFAULT 1 COMMENT '状态：0-已失效，1-有效，2-已使用完',
    `invited_by` BIGINT COMMENT '邀请人ID',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX `idx_enterprise` (`enterprise_id`),
    INDEX `idx_invite_code` (`invite_code`),
    INDEX `idx_invite_type` (`invite_type`),
    INDEX `idx_target_email` (`target_email`),
    INDEX `idx_target_phone` (`target_phone`),
    INDEX `idx_status` (`status`),
    INDEX `idx_expired` (`expired_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='企业邀请表';

-- 输出结果
SELECT 'mota_auth 数据库表初始化完成!' AS message;
SELECT COUNT(*) AS total_industries FROM `industry`;