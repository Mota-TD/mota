-- 修复所有可能缺失的数据库列
-- 执行前请备份数据库

-- ==================== project 表 ====================
-- 添加 priority 列（如果不存在）
SET @exist := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'project' AND column_name = 'priority');
SET @sql := IF(@exist = 0, 'ALTER TABLE project ADD COLUMN priority VARCHAR(20) DEFAULT ''medium'' COMMENT ''优先级(low/medium/high/urgent)''', 'SELECT ''priority column already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 添加 visibility 列（如果不存在）
SET @exist := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'project' AND column_name = 'visibility');
SET @sql := IF(@exist = 0, 'ALTER TABLE project ADD COLUMN visibility VARCHAR(20) DEFAULT ''private'' COMMENT ''可见性(private/internal/public)''', 'SELECT ''visibility column already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 添加 archived_at 列（如果不存在）
SET @exist := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'project' AND column_name = 'archived_at');
SET @sql := IF(@exist = 0, 'ALTER TABLE project ADD COLUMN archived_at DATETIME DEFAULT NULL COMMENT ''归档时间''', 'SELECT ''archived_at column already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 添加 archived_by 列（如果不存在）
SET @exist := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'project' AND column_name = 'archived_by');
SET @sql := IF(@exist = 0, 'ALTER TABLE project ADD COLUMN archived_by BIGINT DEFAULT NULL COMMENT ''归档人ID''', 'SELECT ''archived_by column already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ==================== project_member 表 ====================
-- 添加 department_id 列（如果不存在）
SET @exist := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'project_member' AND column_name = 'department_id');
SET @sql := IF(@exist = 0, 'ALTER TABLE project_member ADD COLUMN department_id BIGINT DEFAULT NULL COMMENT ''所属部门ID''', 'SELECT ''department_id column already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 添加 joined_at 列（如果不存在）
SET @exist := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'project_member' AND column_name = 'joined_at');
SET @sql := IF(@exist = 0, 'ALTER TABLE project_member ADD COLUMN joined_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT ''加入时间''', 'SELECT ''joined_at column already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ==================== milestone 表 ====================
-- 添加 progress 列（如果不存在）
SET @exist := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'milestone' AND column_name = 'progress');
SET @sql := IF(@exist = 0, 'ALTER TABLE milestone ADD COLUMN progress INT DEFAULT 0 COMMENT ''完成进度(0-100)''', 'SELECT ''progress column already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 添加 task_count 列（如果不存在）
SET @exist := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'milestone' AND column_name = 'task_count');
SET @sql := IF(@exist = 0, 'ALTER TABLE milestone ADD COLUMN task_count INT DEFAULT 0 COMMENT ''任务总数''', 'SELECT ''task_count column already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 添加 completed_task_count 列（如果不存在）
SET @exist := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'milestone' AND column_name = 'completed_task_count');
SET @sql := IF(@exist = 0, 'ALTER TABLE milestone ADD COLUMN completed_task_count INT DEFAULT 0 COMMENT ''已完成任务数''', 'SELECT ''completed_task_count column already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 添加 department_task_count 列（如果不存在）
SET @exist := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'milestone' AND column_name = 'department_task_count');
SET @sql := IF(@exist = 0, 'ALTER TABLE milestone ADD COLUMN department_task_count INT DEFAULT 0 COMMENT ''关联部门任务数''', 'SELECT ''department_task_count column already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 添加 completed_department_task_count 列（如果不存在）
SET @exist := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'milestone' AND column_name = 'completed_department_task_count');
SET @sql := IF(@exist = 0, 'ALTER TABLE milestone ADD COLUMN completed_department_task_count INT DEFAULT 0 COMMENT ''已完成部门任务数''', 'SELECT ''completed_department_task_count column already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 添加 completed_at 列（如果不存在）
SET @exist := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'milestone' AND column_name = 'completed_at');
SET @sql := IF(@exist = 0, 'ALTER TABLE milestone ADD COLUMN completed_at DATETIME DEFAULT NULL COMMENT ''完成时间''', 'SELECT ''completed_at column already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 添加 sort_order 列（如果不存在）
SET @exist := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'milestone' AND column_name = 'sort_order');
SET @sql := IF(@exist = 0, 'ALTER TABLE milestone ADD COLUMN sort_order INT DEFAULT 0 COMMENT ''排序顺序''', 'SELECT ''sort_order column already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ==================== department_task 表 ====================
-- 添加 milestone_id 列（如果不存在）
SET @exist := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'department_task' AND column_name = 'milestone_id');
SET @sql := IF(@exist = 0, 'ALTER TABLE department_task ADD COLUMN milestone_id BIGINT DEFAULT NULL COMMENT ''关联里程碑ID''', 'SELECT ''milestone_id column already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 添加 calendar_event_id 列（如果不存在）
SET @exist := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'department_task' AND column_name = 'calendar_event_id');
SET @sql := IF(@exist = 0, 'ALTER TABLE department_task ADD COLUMN calendar_event_id BIGINT DEFAULT NULL COMMENT ''关联的日历事件ID''', 'SELECT ''calendar_event_id column already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 添加 require_plan 列（如果不存在）
SET @exist := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'department_task' AND column_name = 'require_plan');
SET @sql := IF(@exist = 0, 'ALTER TABLE department_task ADD COLUMN require_plan TINYINT DEFAULT 0 COMMENT ''是否需要提交工作计划(0-否,1-是)''', 'SELECT ''require_plan column already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 添加 require_approval 列（如果不存在）
SET @exist := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'department_task' AND column_name = 'require_approval');
SET @sql := IF(@exist = 0, 'ALTER TABLE department_task ADD COLUMN require_approval TINYINT DEFAULT 0 COMMENT ''工作计划是否需要审批(0-否,1-是)''', 'SELECT ''require_approval column already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ==================== task 表 ====================
-- 添加 milestone_id 列（如果不存在）
SET @exist := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'task' AND column_name = 'milestone_id');
SET @sql := IF(@exist = 0, 'ALTER TABLE task ADD COLUMN milestone_id BIGINT DEFAULT NULL COMMENT ''关联里程碑ID''', 'SELECT ''milestone_id column already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 添加 calendar_event_id 列（如果不存在）
SET @exist := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'task' AND column_name = 'calendar_event_id');
SET @sql := IF(@exist = 0, 'ALTER TABLE task ADD COLUMN calendar_event_id BIGINT DEFAULT NULL COMMENT ''关联的日历事件ID''', 'SELECT ''calendar_event_id column already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 添加 progress_note 列（如果不存在）
SET @exist := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'task' AND column_name = 'progress_note');
SET @sql := IF(@exist = 0, 'ALTER TABLE task ADD COLUMN progress_note VARCHAR(500) DEFAULT NULL COMMENT ''进度说明''', 'SELECT ''progress_note column already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 添加 sort_order 列（如果不存在）
SET @exist := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'task' AND column_name = 'sort_order');
SET @sql := IF(@exist = 0, 'ALTER TABLE task ADD COLUMN sort_order INT DEFAULT 0 COMMENT ''排序顺序''', 'SELECT ''sort_order column already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 添加 completed_at 列（如果不存在）
SET @exist := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'task' AND column_name = 'completed_at');
SET @sql := IF(@exist = 0, 'ALTER TABLE task ADD COLUMN completed_at DATETIME DEFAULT NULL COMMENT ''完成时间''', 'SELECT ''completed_at column already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ==================== 添加索引 ====================
-- 为 department_task.milestone_id 添加索引
SET @exist := (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'department_task' AND index_name = 'idx_department_task_milestone_id');
SET @sql := IF(@exist = 0, 'CREATE INDEX idx_department_task_milestone_id ON department_task(milestone_id)', 'SELECT ''idx_department_task_milestone_id already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 为 task.milestone_id 添加索引
SET @exist := (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'task' AND index_name = 'idx_task_milestone_id');
SET @sql := IF(@exist = 0, 'CREATE INDEX idx_task_milestone_id ON task(milestone_id)', 'SELECT ''idx_task_milestone_id already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT '所有缺失的列已添加完成！' AS result;