-- =====================================================
-- Mota V19.0 - 添加用户企业ID和部门字段
-- 创建日期: 2025-12-26
-- =====================================================

-- 使用存储过程安全添加列
DELIMITER //

-- 添加 enterprise_id 列
DROP PROCEDURE IF EXISTS add_enterprise_id_column//
CREATE PROCEDURE add_enterprise_id_column()
BEGIN
    IF NOT EXISTS (
        SELECT * FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'sys_user' 
        AND COLUMN_NAME = 'enterprise_id'
    ) THEN
        ALTER TABLE sys_user ADD COLUMN enterprise_id BIGINT COMMENT '所属企业ID' AFTER status;
    END IF;
END//
CALL add_enterprise_id_column()//
DROP PROCEDURE IF EXISTS add_enterprise_id_column//

-- 添加 department_id 列
DROP PROCEDURE IF EXISTS add_department_id_column//
CREATE PROCEDURE add_department_id_column()
BEGIN
    IF NOT EXISTS (
        SELECT * FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'sys_user' 
        AND COLUMN_NAME = 'department_id'
    ) THEN
        ALTER TABLE sys_user ADD COLUMN department_id BIGINT COMMENT '所属部门ID' AFTER enterprise_id;
    END IF;
END//
CALL add_department_id_column()//
DROP PROCEDURE IF EXISTS add_department_id_column//

-- 添加 department_name 列
DROP PROCEDURE IF EXISTS add_department_name_column//
CREATE PROCEDURE add_department_name_column()
BEGIN
    IF NOT EXISTS (
        SELECT * FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'sys_user' 
        AND COLUMN_NAME = 'department_name'
    ) THEN
        ALTER TABLE sys_user ADD COLUMN department_name VARCHAR(100) COMMENT '部门名称' AFTER department_id;
    END IF;
END//
CALL add_department_name_column()//
DROP PROCEDURE IF EXISTS add_department_name_column//

DELIMITER ;

-- =====================================================
-- 插入默认部门数据
-- =====================================================
INSERT IGNORE INTO department (id, org_id, name, description, sort_order, status, created_at, updated_at) VALUES
(1, 'default', '总经办', '公司最高管理层', 1, 'active', NOW(), NOW()),
(2, 'default', '运营部', '负责公司日常运营管理', 2, 'active', NOW(), NOW()),
(3, 'default', '市场部', '负责市场调研和品牌推广', 3, 'active', NOW(), NOW()),
(4, 'default', '营销部', '负责销售和客户关系管理', 4, 'active', NOW(), NOW()),
(5, 'default', '财务部', '负责公司财务管理', 5, 'active', NOW(), NOW()),
(6, 'default', '行政部', '负责行政事务和后勤保障', 6, 'active', NOW(), NOW()),
(7, 'default', '科技部', '负责技术研发和产品开发', 7, 'active', NOW(), NOW());

-- =====================================================
-- 完成
-- =====================================================
SELECT 'V19.0 用户企业ID和部门字段添加完成！' AS message;