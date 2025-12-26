-- =====================================================
-- V25.0 修复 milestone 表缺失的字段
-- 添加 progress, task_count, completed_task_count 字段
-- =====================================================

-- 检查并添加 progress 字段
SET @exist := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'milestone' AND column_name = 'progress');
SET @sql := IF(@exist = 0, 'ALTER TABLE milestone ADD COLUMN progress INT DEFAULT 0 COMMENT ''完成进度(0-100)''', 'SELECT ''Column progress already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 检查并添加 task_count 字段
SET @exist := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'milestone' AND column_name = 'task_count');
SET @sql := IF(@exist = 0, 'ALTER TABLE milestone ADD COLUMN task_count INT DEFAULT 0 COMMENT ''任务总数''', 'SELECT ''Column task_count already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 检查并添加 completed_task_count 字段
SET @exist := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'milestone' AND column_name = 'completed_task_count');
SET @sql := IF(@exist = 0, 'ALTER TABLE milestone ADD COLUMN completed_task_count INT DEFAULT 0 COMMENT ''已完成任务数''', 'SELECT ''Column completed_task_count already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 完成
SELECT 'V25.0 milestone 表字段修复完成！' AS message;