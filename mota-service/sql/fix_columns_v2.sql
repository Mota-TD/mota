-- 修复所有可能缺失的数据库列（安全版本 V2）
-- 此脚本可以安全执行，已存在的列会被跳过

-- 创建临时存储过程
DROP PROCEDURE IF EXISTS safe_add_column;

DELIMITER $$

CREATE PROCEDURE safe_add_column(
    IN p_table VARCHAR(64),
    IN p_column VARCHAR(64),
    IN p_definition VARCHAR(500)
)
BEGIN
    DECLARE col_exists INT DEFAULT 0;
    
    SELECT COUNT(*) INTO col_exists
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = p_table
      AND column_name = p_column;
    
    IF col_exists = 0 THEN
        SET @ddl = CONCAT('ALTER TABLE `', p_table, '` ADD COLUMN `', p_column, '` ', p_definition);
        PREPARE stmt FROM @ddl;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
        SELECT CONCAT('✓ 已添加: ', p_table, '.', p_column) AS result;
    ELSE
        SELECT CONCAT('- 已存在: ', p_table, '.', p_column) AS result;
    END IF;
END$$

DELIMITER ;

-- ==================== 执行添加列操作 ====================

-- project 表
CALL safe_add_column('project', 'priority', "VARCHAR(20) DEFAULT 'medium' COMMENT '优先级'");
CALL safe_add_column('project', 'visibility', "VARCHAR(20) DEFAULT 'private' COMMENT '可见性'");
CALL safe_add_column('project', 'archived_at', "DATETIME DEFAULT NULL COMMENT '归档时间'");
CALL safe_add_column('project', 'archived_by', "BIGINT DEFAULT NULL COMMENT '归档人ID'");

-- project_member 表
CALL safe_add_column('project_member', 'department_id', "BIGINT DEFAULT NULL COMMENT '所属部门ID'");
CALL safe_add_column('project_member', 'joined_at', "DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '加入时间'");

-- milestone 表
CALL safe_add_column('milestone', 'progress', "INT DEFAULT 0 COMMENT '完成进度'");
CALL safe_add_column('milestone', 'task_count', "INT DEFAULT 0 COMMENT '任务总数'");
CALL safe_add_column('milestone', 'completed_task_count', "INT DEFAULT 0 COMMENT '已完成任务数'");
CALL safe_add_column('milestone', 'department_task_count', "INT DEFAULT 0 COMMENT '关联部门任务数'");
CALL safe_add_column('milestone', 'completed_department_task_count', "INT DEFAULT 0 COMMENT '已完成部门任务数'");
CALL safe_add_column('milestone', 'completed_at', "DATETIME DEFAULT NULL COMMENT '完成时间'");
CALL safe_add_column('milestone', 'sort_order', "INT DEFAULT 0 COMMENT '排序顺序'");

-- department_task 表
CALL safe_add_column('department_task', 'milestone_id', "BIGINT DEFAULT NULL COMMENT '关联里程碑ID'");
CALL safe_add_column('department_task', 'calendar_event_id', "BIGINT DEFAULT NULL COMMENT '关联的日历事件ID'");
CALL safe_add_column('department_task', 'require_plan', "TINYINT DEFAULT 0 COMMENT '是否需要提交工作计划'");
CALL safe_add_column('department_task', 'require_approval', "TINYINT DEFAULT 0 COMMENT '工作计划是否需要审批'");

-- task 表
CALL safe_add_column('task', 'milestone_id', "BIGINT DEFAULT NULL COMMENT '关联里程碑ID'");
CALL safe_add_column('task', 'calendar_event_id', "BIGINT DEFAULT NULL COMMENT '关联的日历事件ID'");
CALL safe_add_column('task', 'progress_note', "VARCHAR(500) DEFAULT NULL COMMENT '进度说明'");
CALL safe_add_column('task', 'sort_order', "INT DEFAULT 0 COMMENT '排序顺序'");
CALL safe_add_column('task', 'completed_at', "DATETIME DEFAULT NULL COMMENT '完成时间'");

-- 清理存储过程
DROP PROCEDURE IF EXISTS safe_add_column;

SELECT '========== 列添加操作完成 ==========' AS final_result;