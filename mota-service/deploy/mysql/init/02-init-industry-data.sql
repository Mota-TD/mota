-- =====================================================
-- 行业数据初始化脚本
-- 在 mota_user 数据库中创建行业表并插入初始数据
-- =====================================================

-- 设置字符集
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET character_set_connection=utf8mb4;

USE mota_user;

-- 行业表
CREATE TABLE IF NOT EXISTS `industry` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `code` VARCHAR(50) NOT NULL UNIQUE COMMENT '行业代码',
    `name` VARCHAR(100) NOT NULL COMMENT '行业名称',
    `parent_id` BIGINT COMMENT '父行业ID',
    `level` INT DEFAULT 1 COMMENT '层级',
    `sort_order` INT DEFAULT 0 COMMENT '排序顺序',
    `icon` VARCHAR(100) COMMENT '行业图标',
    `description` VARCHAR(500) COMMENT '行业描述',
    `status` TINYINT DEFAULT 1 COMMENT '状态',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_parent` (`parent_id`),
    INDEX `idx_code` (`code`),
    INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='行业表';

-- 清空现有数据（如果存在）
TRUNCATE TABLE `industry`;

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

-- 输出结果
SELECT '行业数据初始化完成!' AS message;
SELECT COUNT(*) AS total_industries FROM `industry`;