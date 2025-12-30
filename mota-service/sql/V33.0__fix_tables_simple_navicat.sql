-- =====================================================
-- V33.0 修复所有表结构 (Navicat 简单版本)
-- 
-- 使用方法：
-- 1. 在 Navicat 中双击打开你的数据库（如 mota）
-- 2. 右键数据库 -> 运行 SQL 文件，选择此文件
-- 或者：
-- 1. 在 Navicat 中双击打开你的数据库
-- 2. 点击"查询" -> "新建查询"
-- 3. 复制粘贴以下内容并执行
--
-- 注意：如果某列已存在会报错，可以忽略该错误继续执行
-- =====================================================

-- 首先选择数据库（请根据实际数据库名修改）
-- USE mota;

-- ==================== project 表 ====================
-- 检查并添加缺失的列（如果列已存在会报错，忽略即可）

ALTER TABLE project ADD COLUMN org_id VARCHAR(64) DEFAULT 'default' COMMENT '组织ID';
ALTER TABLE project ADD COLUMN name VARCHAR(200) COMMENT '项目名称';
ALTER TABLE project ADD COLUMN `key` VARCHAR(50) COMMENT '项目标识';
ALTER TABLE project ADD COLUMN description TEXT COMMENT '项目描述';
ALTER TABLE project ADD COLUMN status VARCHAR(20) DEFAULT 'active' COMMENT '状态';
ALTER TABLE project ADD COLUMN owner_id BIGINT COMMENT '负责人ID';
ALTER TABLE project ADD COLUMN color VARCHAR(20) COMMENT '颜色';
ALTER TABLE project ADD COLUMN starred INT DEFAULT 0 COMMENT '是否收藏';
ALTER TABLE project ADD COLUMN progress INT DEFAULT 0 COMMENT '进度';
ALTER TABLE project ADD COLUMN member_count INT DEFAULT 0 COMMENT '成员数量';
ALTER TABLE project ADD COLUMN issue_count INT DEFAULT 0 COMMENT '任务数量';
ALTER TABLE project ADD COLUMN start_date DATE COMMENT '项目开始日期';
ALTER TABLE project ADD COLUMN end_date DATE COMMENT '项目结束日期';
ALTER TABLE project ADD COLUMN priority VARCHAR(20) DEFAULT 'medium' COMMENT '优先级';
ALTER TABLE project ADD COLUMN archived_at DATETIME COMMENT '归档时间';
ALTER TABLE project ADD COLUMN archived_by BIGINT COMMENT '归档人ID';
ALTER TABLE project ADD COLUMN visibility VARCHAR(20) DEFAULT 'private' COMMENT '可见性';
ALTER TABLE project ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间';
ALTER TABLE project ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间';
ALTER TABLE project ADD COLUMN created_by BIGINT COMMENT '创建人ID';
ALTER TABLE project ADD COLUMN updated_by BIGINT COMMENT '更新人ID';
ALTER TABLE project ADD COLUMN deleted TINYINT DEFAULT 0 COMMENT '是否删除';
ALTER TABLE project ADD COLUMN version INT DEFAULT 0 COMMENT '乐观锁版本号';

-- ==================== project_member 表 ====================
ALTER TABLE project_member ADD COLUMN project_id BIGINT COMMENT '项目ID';
ALTER TABLE project_member ADD COLUMN user_id BIGINT COMMENT '用户ID';
ALTER TABLE project_member ADD COLUMN role VARCHAR(50) DEFAULT 'member' COMMENT '角色';
ALTER TABLE project_member ADD COLUMN department_id BIGINT COMMENT '所属部门ID';
ALTER TABLE project_member ADD COLUMN joined_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '加入时间';
ALTER TABLE project_member ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间';
ALTER TABLE project_member ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间';
ALTER TABLE project_member ADD COLUMN created_by BIGINT COMMENT '创建人ID';
ALTER TABLE project_member ADD COLUMN updated_by BIGINT COMMENT '更新人ID';
ALTER TABLE project_member ADD COLUMN deleted TINYINT DEFAULT 0 COMMENT '是否删除';
ALTER TABLE project_member ADD COLUMN version INT DEFAULT 0 COMMENT '乐观锁版本号';

-- ==================== milestone 表 ====================
ALTER TABLE milestone ADD COLUMN project_id BIGINT COMMENT '所属项目ID';
ALTER TABLE milestone ADD COLUMN name VARCHAR(200) COMMENT '里程碑名称';
ALTER TABLE milestone ADD COLUMN description TEXT COMMENT '里程碑描述';
ALTER TABLE milestone ADD COLUMN target_date DATE COMMENT '目标日期';
ALTER TABLE milestone ADD COLUMN status VARCHAR(20) DEFAULT 'pending' COMMENT '状态';
ALTER TABLE milestone ADD COLUMN progress INT DEFAULT 0 COMMENT '完成进度';
ALTER TABLE milestone ADD COLUMN task_count INT DEFAULT 0 COMMENT '任务总数';
ALTER TABLE milestone ADD COLUMN completed_task_count INT DEFAULT 0 COMMENT '已完成任务数';
ALTER TABLE milestone ADD COLUMN department_task_count INT DEFAULT 0 COMMENT '关联部门任务数';
ALTER TABLE milestone ADD COLUMN completed_department_task_count INT DEFAULT 0 COMMENT '已完成部门任务数';
ALTER TABLE milestone ADD COLUMN completed_at DATETIME COMMENT '完成时间';
ALTER TABLE milestone ADD COLUMN sort_order INT DEFAULT 0 COMMENT '排序顺序';
ALTER TABLE milestone ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间';
ALTER TABLE milestone ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间';
ALTER TABLE milestone ADD COLUMN created_by BIGINT COMMENT '创建人ID';
ALTER TABLE milestone ADD COLUMN updated_by BIGINT COMMENT '更新人ID';
ALTER TABLE milestone ADD COLUMN deleted TINYINT DEFAULT 0 COMMENT '是否删除';
ALTER TABLE milestone ADD COLUMN version INT DEFAULT 0 COMMENT '乐观锁版本号';

-- ==================== department_task 表 ====================
ALTER TABLE department_task ADD COLUMN project_id BIGINT COMMENT '项目ID';
ALTER TABLE department_task ADD COLUMN milestone_id BIGINT COMMENT '关联里程碑ID';
ALTER TABLE department_task ADD COLUMN department_id BIGINT COMMENT '部门ID';
ALTER TABLE department_task ADD COLUMN manager_id BIGINT COMMENT '负责人ID';
ALTER TABLE department_task ADD COLUMN name VARCHAR(200) COMMENT '任务名称';
ALTER TABLE department_task ADD COLUMN description TEXT COMMENT '任务描述';
ALTER TABLE department_task ADD COLUMN status VARCHAR(20) DEFAULT 'pending' COMMENT '状态';
ALTER TABLE department_task ADD COLUMN priority VARCHAR(20) DEFAULT 'medium' COMMENT '优先级';
ALTER TABLE department_task ADD COLUMN start_date DATE COMMENT '开始日期';
ALTER TABLE department_task ADD COLUMN end_date DATE COMMENT '结束日期';
ALTER TABLE department_task ADD COLUMN progress INT DEFAULT 0 COMMENT '进度';
ALTER TABLE department_task ADD COLUMN require_plan TINYINT DEFAULT 0 COMMENT '是否需要提交工作计划';
ALTER TABLE department_task ADD COLUMN require_approval TINYINT DEFAULT 0 COMMENT '工作计划是否需要审批';
ALTER TABLE department_task ADD COLUMN calendar_event_id BIGINT COMMENT '关联的日历事件ID';
ALTER TABLE department_task ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间';
ALTER TABLE department_task ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间';
ALTER TABLE department_task ADD COLUMN created_by BIGINT COMMENT '创建人ID';
ALTER TABLE department_task ADD COLUMN updated_by BIGINT COMMENT '更新人ID';
ALTER TABLE department_task ADD COLUMN deleted TINYINT DEFAULT 0 COMMENT '是否删除';
ALTER TABLE department_task ADD COLUMN version INT DEFAULT 0 COMMENT '乐观锁版本号';

-- ==================== task 表 ====================
ALTER TABLE task ADD COLUMN project_id BIGINT COMMENT '项目ID';
ALTER TABLE task ADD COLUMN department_task_id BIGINT COMMENT '部门任务ID';
ALTER TABLE task ADD COLUMN milestone_id BIGINT COMMENT '关联里程碑ID';
ALTER TABLE task ADD COLUMN name VARCHAR(200) COMMENT '任务名称';
ALTER TABLE task ADD COLUMN description TEXT COMMENT '任务描述';
ALTER TABLE task ADD COLUMN status VARCHAR(20) DEFAULT 'pending' COMMENT '状态';
ALTER TABLE task ADD COLUMN priority VARCHAR(20) DEFAULT 'medium' COMMENT '优先级';
ALTER TABLE task ADD COLUMN assignee_id BIGINT COMMENT '执行人ID';
ALTER TABLE task ADD COLUMN start_date DATE COMMENT '开始日期';
ALTER TABLE task ADD COLUMN end_date DATE COMMENT '结束日期';
ALTER TABLE task ADD COLUMN progress INT DEFAULT 0 COMMENT '进度';
ALTER TABLE task ADD COLUMN progress_note VARCHAR(500) COMMENT '进度说明';
ALTER TABLE task ADD COLUMN sort_order INT DEFAULT 0 COMMENT '排序顺序';
ALTER TABLE task ADD COLUMN completed_at DATETIME COMMENT '完成时间';
ALTER TABLE task ADD COLUMN calendar_event_id BIGINT COMMENT '关联的日历事件ID';
ALTER TABLE task ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间';
ALTER TABLE task ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间';
ALTER TABLE task ADD COLUMN created_by BIGINT COMMENT '创建人ID';
ALTER TABLE task ADD COLUMN updated_by BIGINT COMMENT '更新人ID';
ALTER TABLE task ADD COLUMN deleted TINYINT DEFAULT 0 COMMENT '是否删除';
ALTER TABLE task ADD COLUMN version INT DEFAULT 0 COMMENT '乐观锁版本号';

-- =====================================================
-- 完成提示
-- =====================================================
SELECT '表结构修复脚本执行完成！如果有 Duplicate column 错误可以忽略。' AS message;