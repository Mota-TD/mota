-- 修复所有可能缺失的数据库列（简化版本）
-- 执行前请备份数据库
-- 如果某个列已存在，会报错但不影响其他语句的执行

-- ==================== project 表 ====================
ALTER TABLE project ADD COLUMN priority VARCHAR(20) DEFAULT 'medium' COMMENT '优先级(low/medium/high/urgent)';
ALTER TABLE project ADD COLUMN visibility VARCHAR(20) DEFAULT 'private' COMMENT '可见性(private/internal/public)';
ALTER TABLE project ADD COLUMN archived_at DATETIME DEFAULT NULL COMMENT '归档时间';
ALTER TABLE project ADD COLUMN archived_by BIGINT DEFAULT NULL COMMENT '归档人ID';

-- ==================== project_member 表 ====================
ALTER TABLE project_member ADD COLUMN department_id BIGINT DEFAULT NULL COMMENT '所属部门ID';
ALTER TABLE project_member ADD COLUMN joined_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '加入时间';

-- ==================== milestone 表 ====================
ALTER TABLE milestone ADD COLUMN progress INT DEFAULT 0 COMMENT '完成进度(0-100)';
ALTER TABLE milestone ADD COLUMN task_count INT DEFAULT 0 COMMENT '任务总数';
ALTER TABLE milestone ADD COLUMN completed_task_count INT DEFAULT 0 COMMENT '已完成任务数';
ALTER TABLE milestone ADD COLUMN department_task_count INT DEFAULT 0 COMMENT '关联部门任务数';
ALTER TABLE milestone ADD COLUMN completed_department_task_count INT DEFAULT 0 COMMENT '已完成部门任务数';
ALTER TABLE milestone ADD COLUMN completed_at DATETIME DEFAULT NULL COMMENT '完成时间';
ALTER TABLE milestone ADD COLUMN sort_order INT DEFAULT 0 COMMENT '排序顺序';

-- ==================== department_task 表 ====================
ALTER TABLE department_task ADD COLUMN milestone_id BIGINT DEFAULT NULL COMMENT '关联里程碑ID';
ALTER TABLE department_task ADD COLUMN calendar_event_id BIGINT DEFAULT NULL COMMENT '关联的日历事件ID';
ALTER TABLE department_task ADD COLUMN require_plan TINYINT DEFAULT 0 COMMENT '是否需要提交工作计划(0-否,1-是)';
ALTER TABLE department_task ADD COLUMN require_approval TINYINT DEFAULT 0 COMMENT '工作计划是否需要审批(0-否,1-是)';

-- ==================== task 表 ====================
ALTER TABLE task ADD COLUMN milestone_id BIGINT DEFAULT NULL COMMENT '关联里程碑ID';
ALTER TABLE task ADD COLUMN calendar_event_id BIGINT DEFAULT NULL COMMENT '关联的日历事件ID';
ALTER TABLE task ADD COLUMN progress_note VARCHAR(500) DEFAULT NULL COMMENT '进度说明';
ALTER TABLE task ADD COLUMN sort_order INT DEFAULT 0 COMMENT '排序顺序';
ALTER TABLE task ADD COLUMN completed_at DATETIME DEFAULT NULL COMMENT '完成时间';

-- ==================== 添加索引 ====================
CREATE INDEX idx_department_task_milestone_id ON department_task(milestone_id);
CREATE INDEX idx_task_milestone_id ON task(milestone_id);