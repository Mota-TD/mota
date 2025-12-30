-- =====================================================
-- 修复数据库缺失字段脚本 (完整版)
-- 执行方式：在 Navicat 中打开此文件，直接执行
-- =====================================================

USE mota;

-- =====================================================
-- 1. 修复 task 表 - 添加 calendar_event_id 字段
-- =====================================================
SET @table_name = 'task';
SET @column_name = 'calendar_event_id';
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM information_schema.COLUMNS 
     WHERE TABLE_SCHEMA = 'mota' AND TABLE_NAME = @table_name AND COLUMN_NAME = @column_name) = 0,
    CONCAT('ALTER TABLE `', @table_name, '` ADD COLUMN `', @column_name, '` BIGINT NULL COMMENT ''关联日历事件ID'' AFTER `completed_at`'),
    'SELECT ''Column calendar_event_id already exists in task'''
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- =====================================================
-- 2. 修复 department_task 表 - 添加 calendar_event_id 字段
-- =====================================================
SET @table_name = 'department_task';
SET @column_name = 'calendar_event_id';
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM information_schema.COLUMNS 
     WHERE TABLE_SCHEMA = 'mota' AND TABLE_NAME = @table_name AND COLUMN_NAME = @column_name) = 0,
    CONCAT('ALTER TABLE `', @table_name, '` ADD COLUMN `', @column_name, '` BIGINT NULL COMMENT ''关联日历事件ID'' AFTER `require_approval`'),
    'SELECT ''Column calendar_event_id already exists in department_task'''
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- =====================================================
-- 验证修复结果
-- =====================================================
SELECT '===== task 表结构 =====' AS info;
DESCRIBE task;

SELECT '===== department_task 表结构 =====' AS info;
DESCRIBE department_task;

SELECT '修复完成！请重启后端服务。' AS result;