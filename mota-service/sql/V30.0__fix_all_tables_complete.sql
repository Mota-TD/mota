-- =====================================================
-- V30.0 完整修复所有表结构
-- 确保所有实体类需要的列都存在
-- 使用 IF NOT EXISTS 语法，可以安全重复执行
-- =====================================================

-- ==================== project 表 ====================
ALTER TABLE project ADD COLUMN IF NOT EXISTS org_id VARCHAR(64) DEFAULT 'default' COMMENT '组织ID';
ALTER TABLE project ADD COLUMN IF NOT EXISTS name VARCHAR(200) NOT NULL COMMENT '项目名称';
ALTER TABLE project ADD COLUMN IF NOT EXISTS `key` VARCHAR(50) COMMENT '项目标识';
ALTER TABLE project ADD COLUMN IF NOT EXISTS description TEXT COMMENT '项目描述';
ALTER TABLE project ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active' COMMENT '状态';
ALTER TABLE project ADD COLUMN IF NOT EXISTS owner_id BIGINT COMMENT '负责人ID';
ALTER TABLE project ADD COLUMN IF NOT EXISTS color VARCHAR(20) COMMENT '颜色';
ALTER TABLE project ADD COLUMN IF NOT EXISTS starred INT DEFAULT 0 COMMENT '是否收藏';
ALTER TABLE project ADD COLUMN IF NOT EXISTS progress INT DEFAULT 0 COMMENT '进度';
ALTER TABLE project ADD COLUMN IF NOT EXISTS member_count INT DEFAULT 0 COMMENT '成员数量';
ALTER TABLE project ADD COLUMN IF NOT EXISTS issue_count INT DEFAULT 0 COMMENT '任务数量';
ALTER TABLE project ADD COLUMN IF NOT EXISTS start_date DATE COMMENT '项目开始日期';
ALTER TABLE project ADD COLUMN IF NOT EXISTS end_date DATE COMMENT '项目结束日期';
ALTER TABLE project ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'medium' COMMENT '优先级';
ALTER TABLE project ADD COLUMN IF NOT EXISTS archived_at DATETIME COMMENT '归档时间';
ALTER TABLE project ADD COLUMN IF NOT EXISTS archived_by BIGINT COMMENT '归档人ID';
ALTER TABLE project ADD COLUMN IF NOT EXISTS visibility VARCHAR(20) DEFAULT 'private' COMMENT '可见性';

-- ==================== project_member 表 ====================
ALTER TABLE project_member ADD COLUMN IF NOT EXISTS project_id BIGINT NOT NULL COMMENT '项目ID';
ALTER TABLE project_member ADD COLUMN IF NOT EXISTS user_id BIGINT NOT NULL COMMENT '用户ID';
ALTER TABLE project_member ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'member' COMMENT '角色';
ALTER TABLE project_member ADD COLUMN IF NOT EXISTS department_id BIGINT COMMENT '所属部门ID';
ALTER TABLE project_member ADD COLUMN IF NOT EXISTS joined_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '加入时间';
ALTER TABLE project_member ADD COLUMN IF NOT EXISTS version INT DEFAULT 0 COMMENT '乐观锁版本号';
ALTER TABLE project_member ADD COLUMN IF NOT EXISTS created_by BIGINT COMMENT '创建人ID';
ALTER TABLE project_member ADD COLUMN IF NOT EXISTS updated_by BIGINT COMMENT '更新人ID';

-- ==================== milestone 表 ====================
ALTER TABLE milestone ADD COLUMN IF NOT EXISTS project_id BIGINT NOT NULL COMMENT '所属项目ID';
ALTER TABLE milestone ADD COLUMN IF NOT EXISTS name VARCHAR(200) NOT NULL COMMENT '里程碑名称';
ALTER TABLE milestone ADD COLUMN IF NOT EXISTS description TEXT COMMENT '里程碑描述';
ALTER TABLE milestone ADD COLUMN IF NOT EXISTS target_date DATE COMMENT '目标日期';
ALTER TABLE milestone ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending' COMMENT '状态';
ALTER TABLE milestone ADD COLUMN IF NOT EXISTS progress INT DEFAULT 0 COMMENT '完成进度';
ALTER TABLE milestone ADD COLUMN IF NOT EXISTS task_count INT DEFAULT 0 COMMENT '任务总数';
ALTER TABLE milestone ADD COLUMN IF NOT EXISTS completed_task_count INT DEFAULT 0 COMMENT '已完成任务数';
ALTER TABLE milestone ADD COLUMN IF NOT EXISTS department_task_count INT DEFAULT 0 COMMENT '关联部门任务数';
ALTER TABLE milestone ADD COLUMN IF NOT EXISTS completed_department_task_count INT DEFAULT 0 COMMENT '已完成部门任务数';
ALTER TABLE milestone ADD COLUMN IF NOT EXISTS completed_at DATETIME COMMENT '完成时间';
ALTER TABLE milestone ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0 COMMENT '排序顺序';

-- ==================== department_task 表 ====================
ALTER TABLE department_task ADD COLUMN IF NOT EXISTS project_id BIGINT NOT NULL COMMENT '项目ID';
ALTER TABLE department_task ADD COLUMN IF NOT EXISTS milestone_id BIGINT COMMENT '关联里程碑ID';
ALTER TABLE department_task ADD COLUMN IF NOT EXISTS department_id BIGINT NOT NULL COMMENT '部门ID';
ALTER TABLE department_task ADD COLUMN IF NOT EXISTS manager_id BIGINT COMMENT '负责人ID';
ALTER TABLE department_task ADD COLUMN IF NOT EXISTS name VARCHAR(200) NOT NULL COMMENT '任务名称';
ALTER TABLE department_task ADD COLUMN IF NOT EXISTS description TEXT COMMENT '任务描述';
ALTER TABLE department_task ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending' COMMENT '状态';
ALTER TABLE department_task ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'medium' COMMENT '优先级';
ALTER TABLE department_task ADD COLUMN IF NOT EXISTS start_date DATE COMMENT '开始日期';
ALTER TABLE department_task ADD COLUMN IF NOT EXISTS end_date DATE COMMENT '结束日期';
ALTER TABLE department_task ADD COLUMN IF NOT EXISTS progress INT DEFAULT 0 COMMENT '进度';
ALTER TABLE department_task ADD COLUMN IF NOT EXISTS require_plan TINYINT DEFAULT 0 COMMENT '是否需要提交工作计划';
ALTER TABLE department_task ADD COLUMN IF NOT EXISTS require_approval TINYINT DEFAULT 0 COMMENT '工作计划是否需要审批';
ALTER TABLE department_task ADD COLUMN IF NOT EXISTS calendar_event_id BIGINT COMMENT '关联的日历事件ID';

-- ==================== task 表 ====================
ALTER TABLE task ADD COLUMN IF NOT EXISTS project_id BIGINT COMMENT '项目ID';
ALTER TABLE task ADD COLUMN IF NOT EXISTS department_task_id BIGINT COMMENT '部门任务ID';
ALTER TABLE task ADD COLUMN IF NOT EXISTS milestone_id BIGINT COMMENT '关联里程碑ID';
ALTER TABLE task ADD COLUMN IF NOT EXISTS name VARCHAR(200) NOT NULL COMMENT '任务名称';
ALTER TABLE task ADD COLUMN IF NOT EXISTS description TEXT COMMENT '任务描述';
ALTER TABLE task ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending' COMMENT '状态';
ALTER TABLE task ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'medium' COMMENT '优先级';
ALTER TABLE task ADD COLUMN IF NOT EXISTS assignee_id BIGINT COMMENT '执行人ID';
ALTER TABLE task ADD COLUMN IF NOT EXISTS start_date DATE COMMENT '开始日期';
ALTER TABLE task ADD COLUMN IF NOT EXISTS end_date DATE COMMENT '结束日期';
ALTER TABLE task ADD COLUMN IF NOT EXISTS progress INT DEFAULT 0 COMMENT '进度';
ALTER TABLE task ADD COLUMN IF NOT EXISTS progress_note VARCHAR(500) COMMENT '进度说明';
ALTER TABLE task ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0 COMMENT '排序顺序';
ALTER TABLE task ADD COLUMN IF NOT EXISTS completed_at DATETIME COMMENT '完成时间';
ALTER TABLE task ADD COLUMN IF NOT EXISTS calendar_event_id BIGINT COMMENT '关联的日历事件ID';

-- ==================== 创建索引 ====================
CREATE INDEX IF NOT EXISTS idx_project_status ON project(status);
CREATE INDEX IF NOT EXISTS idx_project_owner ON project(owner_id);
CREATE INDEX IF NOT EXISTS idx_project_starred ON project(starred);

CREATE INDEX IF NOT EXISTS idx_pm_project ON project_member(project_id);
CREATE INDEX IF NOT EXISTS idx_pm_user ON project_member(user_id);
CREATE INDEX IF NOT EXISTS idx_pm_department ON project_member(department_id);

CREATE INDEX IF NOT EXISTS idx_milestone_project ON milestone(project_id);
CREATE INDEX IF NOT EXISTS idx_milestone_status ON milestone(status);

CREATE INDEX IF NOT EXISTS idx_dt_project ON department_task(project_id);
CREATE INDEX IF NOT EXISTS idx_dt_milestone ON department_task(milestone_id);
CREATE INDEX IF NOT EXISTS idx_dt_department ON department_task(department_id);

CREATE INDEX IF NOT EXISTS idx_task_project ON task(project_id);
CREATE INDEX IF NOT EXISTS idx_task_dept_task ON task(department_task_id);
CREATE INDEX IF NOT EXISTS idx_task_milestone ON task(milestone_id);
CREATE INDEX IF NOT EXISTS idx_task_assignee ON task(assignee_id);

-- =====================================================
-- 完成
-- =====================================================
SELECT 'V30.0 所有表结构修复完成！' AS message;