-- =====================================================
-- V31.0 安全修复所有表结构
-- 使用存储过程检查列是否存在，兼容所有 MySQL 版本
-- =====================================================

DELIMITER //

-- 创建安全添加列的存储过程
DROP PROCEDURE IF EXISTS safe_add_column//
CREATE PROCEDURE safe_add_column(
    IN p_table_name VARCHAR(64),
    IN p_column_name VARCHAR(64),
    IN p_column_definition VARCHAR(500)
)
BEGIN
    DECLARE column_exists INT DEFAULT 0;
    
    SELECT COUNT(*) INTO column_exists
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = p_table_name
      AND COLUMN_NAME = p_column_name;
    
    IF column_exists = 0 THEN
        SET @sql = CONCAT('ALTER TABLE `', p_table_name, '` ADD COLUMN `', p_column_name, '` ', p_column_definition);
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
        SELECT CONCAT('Added column: ', p_table_name, '.', p_column_name) AS result;
    ELSE
        SELECT CONCAT('Column already exists: ', p_table_name, '.', p_column_name) AS result;
    END IF;
END//

-- 创建安全添加索引的存储过程
DROP PROCEDURE IF EXISTS safe_add_index//
CREATE PROCEDURE safe_add_index(
    IN p_table_name VARCHAR(64),
    IN p_index_name VARCHAR(64),
    IN p_column_name VARCHAR(64)
)
BEGIN
    DECLARE index_exists INT DEFAULT 0;
    
    SELECT COUNT(*) INTO index_exists
    FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = p_table_name
      AND INDEX_NAME = p_index_name;
    
    IF index_exists = 0 THEN
        SET @sql = CONCAT('CREATE INDEX `', p_index_name, '` ON `', p_table_name, '`(`', p_column_name, '`)');
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
        SELECT CONCAT('Added index: ', p_index_name) AS result;
    ELSE
        SELECT CONCAT('Index already exists: ', p_index_name) AS result;
    END IF;
END//

DELIMITER ;

-- ==================== project 表 ====================
CALL safe_add_column('project', 'org_id', "VARCHAR(64) DEFAULT 'default' COMMENT '组织ID'");
CALL safe_add_column('project', 'name', "VARCHAR(200) NOT NULL DEFAULT '' COMMENT '项目名称'");
CALL safe_add_column('project', 'key', "VARCHAR(50) COMMENT '项目标识'");
CALL safe_add_column('project', 'description', "TEXT COMMENT '项目描述'");
CALL safe_add_column('project', 'status', "VARCHAR(20) DEFAULT 'active' COMMENT '状态'");
CALL safe_add_column('project', 'owner_id', "BIGINT COMMENT '负责人ID'");
CALL safe_add_column('project', 'color', "VARCHAR(20) COMMENT '颜色'");
CALL safe_add_column('project', 'starred', "INT DEFAULT 0 COMMENT '是否收藏'");
CALL safe_add_column('project', 'progress', "INT DEFAULT 0 COMMENT '进度'");
CALL safe_add_column('project', 'member_count', "INT DEFAULT 0 COMMENT '成员数量'");
CALL safe_add_column('project', 'issue_count', "INT DEFAULT 0 COMMENT '任务数量'");
CALL safe_add_column('project', 'start_date', "DATE COMMENT '项目开始日期'");
CALL safe_add_column('project', 'end_date', "DATE COMMENT '项目结束日期'");
CALL safe_add_column('project', 'priority', "VARCHAR(20) DEFAULT 'medium' COMMENT '优先级'");
CALL safe_add_column('project', 'archived_at', "DATETIME COMMENT '归档时间'");
CALL safe_add_column('project', 'archived_by', "BIGINT COMMENT '归档人ID'");
CALL safe_add_column('project', 'visibility', "VARCHAR(20) DEFAULT 'private' COMMENT '可见性'");
CALL safe_add_column('project', 'created_at', "DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'");
CALL safe_add_column('project', 'updated_at', "DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'");
CALL safe_add_column('project', 'created_by', "BIGINT COMMENT '创建人ID'");
CALL safe_add_column('project', 'updated_by', "BIGINT COMMENT '更新人ID'");
CALL safe_add_column('project', 'deleted', "TINYINT DEFAULT 0 COMMENT '是否删除'");
CALL safe_add_column('project', 'version', "INT DEFAULT 0 COMMENT '乐观锁版本号'");

-- ==================== project_member 表 ====================
CALL safe_add_column('project_member', 'project_id', "BIGINT NOT NULL DEFAULT 0 COMMENT '项目ID'");
CALL safe_add_column('project_member', 'user_id', "BIGINT NOT NULL DEFAULT 0 COMMENT '用户ID'");
CALL safe_add_column('project_member', 'role', "VARCHAR(50) DEFAULT 'member' COMMENT '角色'");
CALL safe_add_column('project_member', 'department_id', "BIGINT COMMENT '所属部门ID'");
CALL safe_add_column('project_member', 'joined_at', "DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '加入时间'");
CALL safe_add_column('project_member', 'created_at', "DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'");
CALL safe_add_column('project_member', 'updated_at', "DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'");
CALL safe_add_column('project_member', 'created_by', "BIGINT COMMENT '创建人ID'");
CALL safe_add_column('project_member', 'updated_by', "BIGINT COMMENT '更新人ID'");
CALL safe_add_column('project_member', 'deleted', "TINYINT DEFAULT 0 COMMENT '是否删除'");
CALL safe_add_column('project_member', 'version', "INT DEFAULT 0 COMMENT '乐观锁版本号'");

-- ==================== milestone 表 ====================
CALL safe_add_column('milestone', 'project_id', "BIGINT NOT NULL DEFAULT 0 COMMENT '所属项目ID'");
CALL safe_add_column('milestone', 'name', "VARCHAR(200) NOT NULL DEFAULT '' COMMENT '里程碑名称'");
CALL safe_add_column('milestone', 'description', "TEXT COMMENT '里程碑描述'");
CALL safe_add_column('milestone', 'target_date', "DATE COMMENT '目标日期'");
CALL safe_add_column('milestone', 'status', "VARCHAR(20) DEFAULT 'pending' COMMENT '状态'");
CALL safe_add_column('milestone', 'progress', "INT DEFAULT 0 COMMENT '完成进度'");
CALL safe_add_column('milestone', 'task_count', "INT DEFAULT 0 COMMENT '任务总数'");
CALL safe_add_column('milestone', 'completed_task_count', "INT DEFAULT 0 COMMENT '已完成任务数'");
CALL safe_add_column('milestone', 'department_task_count', "INT DEFAULT 0 COMMENT '关联部门任务数'");
CALL safe_add_column('milestone', 'completed_department_task_count', "INT DEFAULT 0 COMMENT '已完成部门任务数'");
CALL safe_add_column('milestone', 'completed_at', "DATETIME COMMENT '完成时间'");
CALL safe_add_column('milestone', 'sort_order', "INT DEFAULT 0 COMMENT '排序顺序'");
CALL safe_add_column('milestone', 'created_at', "DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'");
CALL safe_add_column('milestone', 'updated_at', "DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'");
CALL safe_add_column('milestone', 'created_by', "BIGINT COMMENT '创建人ID'");
CALL safe_add_column('milestone', 'updated_by', "BIGINT COMMENT '更新人ID'");
CALL safe_add_column('milestone', 'deleted', "TINYINT DEFAULT 0 COMMENT '是否删除'");
CALL safe_add_column('milestone', 'version', "INT DEFAULT 0 COMMENT '乐观锁版本号'");

-- ==================== department_task 表 ====================
CALL safe_add_column('department_task', 'project_id', "BIGINT NOT NULL DEFAULT 0 COMMENT '项目ID'");
CALL safe_add_column('department_task', 'milestone_id', "BIGINT COMMENT '关联里程碑ID'");
CALL safe_add_column('department_task', 'department_id', "BIGINT NOT NULL DEFAULT 0 COMMENT '部门ID'");
CALL safe_add_column('department_task', 'manager_id', "BIGINT COMMENT '负责人ID'");
CALL safe_add_column('department_task', 'name', "VARCHAR(200) NOT NULL DEFAULT '' COMMENT '任务名称'");
CALL safe_add_column('department_task', 'description', "TEXT COMMENT '任务描述'");
CALL safe_add_column('department_task', 'status', "VARCHAR(20) DEFAULT 'pending' COMMENT '状态'");
CALL safe_add_column('department_task', 'priority', "VARCHAR(20) DEFAULT 'medium' COMMENT '优先级'");
CALL safe_add_column('department_task', 'start_date', "DATE COMMENT '开始日期'");
CALL safe_add_column('department_task', 'end_date', "DATE COMMENT '结束日期'");
CALL safe_add_column('department_task', 'progress', "INT DEFAULT 0 COMMENT '进度'");
CALL safe_add_column('department_task', 'require_plan', "TINYINT DEFAULT 0 COMMENT '是否需要提交工作计划'");
CALL safe_add_column('department_task', 'require_approval', "TINYINT DEFAULT 0 COMMENT '工作计划是否需要审批'");
CALL safe_add_column('department_task', 'calendar_event_id', "BIGINT COMMENT '关联的日历事件ID'");
CALL safe_add_column('department_task', 'created_at', "DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'");
CALL safe_add_column('department_task', 'updated_at', "DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'");
CALL safe_add_column('department_task', 'created_by', "BIGINT COMMENT '创建人ID'");
CALL safe_add_column('department_task', 'updated_by', "BIGINT COMMENT '更新人ID'");
CALL safe_add_column('department_task', 'deleted', "TINYINT DEFAULT 0 COMMENT '是否删除'");
CALL safe_add_column('department_task', 'version', "INT DEFAULT 0 COMMENT '乐观锁版本号'");

-- ==================== task 表 ====================
CALL safe_add_column('task', 'project_id', "BIGINT COMMENT '项目ID'");
CALL safe_add_column('task', 'department_task_id', "BIGINT COMMENT '部门任务ID'");
CALL safe_add_column('task', 'milestone_id', "BIGINT COMMENT '关联里程碑ID'");
CALL safe_add_column('task', 'name', "VARCHAR(200) NOT NULL DEFAULT '' COMMENT '任务名称'");
CALL safe_add_column('task', 'description', "TEXT COMMENT '任务描述'");
CALL safe_add_column('task', 'status', "VARCHAR(20) DEFAULT 'pending' COMMENT '状态'");
CALL safe_add_column('task', 'priority', "VARCHAR(20) DEFAULT 'medium' COMMENT '优先级'");
CALL safe_add_column('task', 'assignee_id', "BIGINT COMMENT '执行人ID'");
CALL safe_add_column('task', 'start_date', "DATE COMMENT '开始日期'");
CALL safe_add_column('task', 'end_date', "DATE COMMENT '结束日期'");
CALL safe_add_column('task', 'progress', "INT DEFAULT 0 COMMENT '进度'");
CALL safe_add_column('task', 'progress_note', "VARCHAR(500) COMMENT '进度说明'");
CALL safe_add_column('task', 'sort_order', "INT DEFAULT 0 COMMENT '排序顺序'");
CALL safe_add_column('task', 'completed_at', "DATETIME COMMENT '完成时间'");
CALL safe_add_column('task', 'calendar_event_id', "BIGINT COMMENT '关联的日历事件ID'");
CALL safe_add_column('task', 'created_at', "DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'");
CALL safe_add_column('task', 'updated_at', "DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'");
CALL safe_add_column('task', 'created_by', "BIGINT COMMENT '创建人ID'");
CALL safe_add_column('task', 'updated_by', "BIGINT COMMENT '更新人ID'");
CALL safe_add_column('task', 'deleted', "TINYINT DEFAULT 0 COMMENT '是否删除'");
CALL safe_add_column('task', 'version', "INT DEFAULT 0 COMMENT '乐观锁版本号'");

-- ==================== 创建索引 ====================
CALL safe_add_index('project', 'idx_project_status', 'status');
CALL safe_add_index('project', 'idx_project_owner', 'owner_id');
CALL safe_add_index('project', 'idx_project_starred', 'starred');
CALL safe_add_index('project', 'idx_project_deleted', 'deleted');

CALL safe_add_index('project_member', 'idx_pm_project', 'project_id');
CALL safe_add_index('project_member', 'idx_pm_user', 'user_id');
CALL safe_add_index('project_member', 'idx_pm_department', 'department_id');
CALL safe_add_index('project_member', 'idx_pm_deleted', 'deleted');

CALL safe_add_index('milestone', 'idx_milestone_project', 'project_id');
CALL safe_add_index('milestone', 'idx_milestone_status', 'status');
CALL safe_add_index('milestone', 'idx_milestone_deleted', 'deleted');

CALL safe_add_index('department_task', 'idx_dt_project', 'project_id');
CALL safe_add_index('department_task', 'idx_dt_milestone', 'milestone_id');
CALL safe_add_index('department_task', 'idx_dt_department', 'department_id');
CALL safe_add_index('department_task', 'idx_dt_deleted', 'deleted');

CALL safe_add_index('task', 'idx_task_project', 'project_id');
CALL safe_add_index('task', 'idx_task_dept_task', 'department_task_id');
CALL safe_add_index('task', 'idx_task_milestone', 'milestone_id');
CALL safe_add_index('task', 'idx_task_assignee', 'assignee_id');
CALL safe_add_index('task', 'idx_task_deleted', 'deleted');

-- ==================== 清理存储过程 ====================
DROP PROCEDURE IF EXISTS safe_add_column;
DROP PROCEDURE IF EXISTS safe_add_index;

-- =====================================================
-- 完成
-- =====================================================
SELECT 'V31.0 所有表结构安全修复完成！' AS message;