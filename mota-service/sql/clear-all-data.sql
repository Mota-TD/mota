-- =====================================================
-- 清空所有业务数据脚本（Navicat安全版）
-- 用于从零开始创建数据
-- 执行前请确保已备份重要数据
-- =====================================================

-- 选择数据库
USE mota;

-- 禁用外键检查
SET FOREIGN_KEY_CHECKS = 0;

-- =====================================================
-- 使用存储过程安全删除数据
-- 如果表不存在则跳过
-- =====================================================

DROP PROCEDURE IF EXISTS safe_truncate;

DELIMITER //
CREATE PROCEDURE safe_truncate(IN tbl_name VARCHAR(100))
BEGIN
    DECLARE tbl_exists INT DEFAULT 0;
    
    SELECT COUNT(*) INTO tbl_exists 
    FROM information_schema.tables 
    WHERE table_schema = DATABASE() 
    AND table_name = tbl_name;
    
    IF tbl_exists > 0 THEN
        SET @sql = CONCAT('TRUNCATE TABLE `', tbl_name, '`');
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END //
DELIMITER ;

-- =====================================================
-- 清空企业和用户相关表
-- =====================================================
CALL safe_truncate('enterprise_invitation');
CALL safe_truncate('enterprise_member');
CALL safe_truncate('enterprise');
CALL safe_truncate('sys_user');

-- =====================================================
-- 清空项目协同相关表
-- =====================================================
CALL safe_truncate('project_department');
CALL safe_truncate('project_member');
CALL safe_truncate('department_task');
CALL safe_truncate('task');
CALL safe_truncate('subtask');
CALL safe_truncate('task_dependency');
CALL safe_truncate('task_comment');
CALL safe_truncate('task_attachment');
CALL safe_truncate('task_checklist');
CALL safe_truncate('task_checklist_item');
CALL safe_truncate('milestone');
CALL safe_truncate('deliverable');
CALL safe_truncate('work_plan');
CALL safe_truncate('work_plan_attachment');
CALL safe_truncate('work_feedback');
CALL safe_truncate('progress_report');
CALL safe_truncate('project');
CALL safe_truncate('department');

-- =====================================================
-- 清空知识管理相关表
-- =====================================================
CALL safe_truncate('document');
CALL safe_truncate('document_version');
CALL safe_truncate('document_comment');
CALL safe_truncate('document_share');
CALL safe_truncate('document_favorite');
CALL safe_truncate('document_access_log');
CALL safe_truncate('document_export_log');
CALL safe_truncate('knowledge_file');
CALL safe_truncate('knowledge_category');
CALL safe_truncate('knowledge_tag');
CALL safe_truncate('knowledge_file_tag');
CALL safe_truncate('wiki_document');

-- =====================================================
-- 清空通知相关表
-- =====================================================
CALL safe_truncate('notification');
CALL safe_truncate('notification_subscription');

-- =====================================================
-- 清空活动记录
-- =====================================================
CALL safe_truncate('activity');

-- =====================================================
-- 清空日历事件
-- =====================================================
CALL safe_truncate('calendar_event');

-- =====================================================
-- 清空旧版表（如果存在）
-- =====================================================
CALL safe_truncate('sprint');
CALL safe_truncate('issue');
CALL safe_truncate('ai_history');
CALL safe_truncate('ai_news');

-- 删除存储过程
DROP PROCEDURE IF EXISTS safe_truncate;

-- 启用外键检查
SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- 完成提示
-- =====================================================
SELECT '所有业务数据已清空！' AS message;