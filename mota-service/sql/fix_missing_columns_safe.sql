-- 修复所有可能缺失的数据库列（安全版本）
-- 使用存储过程来安全地添加列，如果列已存在则跳过

DELIMITER //

DROP PROCEDURE IF EXISTS add_column_if_not_exists//

CREATE PROCEDURE add_column_if_not_exists(
    IN table_name VARCHAR(64),
    IN column_name VARCHAR(64),
    IN column_definition VARCHAR(255)
)
BEGIN
    DECLARE column_exists INT DEFAULT 0;
    
    SELECT COUNT(*) INTO column_exists
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = table_name
      AND column_name = column_name;
    
    IF column_exists = 0 THEN
        SET @sql = CONCAT('ALTER TABLE ', table_name, ' ADD COLUMN ', column_name, ' ', column_definition);
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
        SELECT CONCAT('Added column: ', table_name, '.', column_name) AS result;
    ELSE
        SELECT CONCAT('Column already exists: ', table_name, '.', column_name) AS result;
    END IF;
END//

DELIMITER ;

-- ==================== project 表 ====================
CALL add_column_if_not_exists('project', 'priority', "VARCHAR(20) DEFAULT 'medium' COMMENT '优先级(low/medium/high/urgent)'");
CALL add_column_if_not_exists('project', 'visibility', "VARCHAR(20) DEFAULT 'private' COMMENT '可见性(private/internal/public)'");
CALL add_column_if_not_exists('project', 'archived_at', "DATETIME DEFAULT NULL COMMENT '归档时间'");
CALL add_column_if_not_exists('project', 'archived_by', "BIGINT DEFAULT NULL COMMENT '归档人ID'");

-- ==================== project_member 表 ====================
CALL add_column_if_not_exists('project_member', 'department_id', "BIGINT DEFAULT NULL COMMENT '所属部门ID'");
CALL add_column_if_not_exists('project_member', 'joined_at', "DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '加入时间'");

-- ==================== milestone 表 ====================
CALL add_column_if_not_exists('milestone', 'progress', "INT DEFAULT 0 COMMENT '完成进度(0-100)'");
CALL add_column_if_not_exists('milestone', 'task_count', "INT DEFAULT 0 COMMENT '任务总数'");
CALL add_column_if_not_exists('milestone', 'completed_task_count', "INT DEFAULT 0 COMMENT '已完成任务数'");
CALL add_column_if_not_exists('milestone', 'department_task_count', "INT DEFAULT 0 COMMENT '关联部门任务数'");
CALL add_column_if_not_exists('milestone', 'completed_department_task_count', "INT DEFAULT 0 COMMENT '已完成部门任务数'");
CALL add_column_if_not_exists('milestone', 'completed_at', "DATETIME DEFAULT NULL COMMENT '完成时间'");
CALL add_column_if_not_exists('milestone', 'sort_order', "INT DEFAULT 0 COMMENT '排序顺序'");

-- ==================== department_task 表 ====================
CALL add_column_if_not_exists('department_task', 'milestone_id', "BIGINT DEFAULT NULL COMMENT '关联里程碑ID'");
CALL add_column_if_not_exists('department_task', 'calendar_event_id', "BIGINT DEFAULT NULL COMMENT '关联的日历事件ID'");
CALL add_column_if_not_exists('department_task', 'require_plan', "TINYINT DEFAULT 0 COMMENT '是否需要提交工作计划(0-否,1-是)'");
CALL add_column_if_not_exists('department_task', 'require_approval', "TINYINT DEFAULT 0 COMMENT '工作计划是否需要审批(0-否,1-是)'");

-- ==================== task 表 ====================
CALL add_column_if_not_exists('task', 'milestone_id', "BIGINT DEFAULT NULL COMMENT '关联里程碑ID'");
CALL add_column_if_not_exists('task', 'calendar_event_id', "BIGINT DEFAULT NULL COMMENT '关联的日历事件ID'");
CALL add_column_if_not_exists('task', 'progress_note', "VARCHAR(500) DEFAULT NULL COMMENT '进度说明'");
CALL add_column_if_not_exists('task', 'sort_order', "INT DEFAULT 0 COMMENT '排序顺序'");
CALL add_column_if_not_exists('task', 'completed_at', "DATETIME DEFAULT NULL COMMENT '完成时间'");

-- 清理存储过程
DROP PROCEDURE IF EXISTS add_column_if_not_exists;

SELECT '所有缺失的列已检查并添加完成！' AS final_result;