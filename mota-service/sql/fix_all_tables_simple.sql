-- =====================================================
-- 综合修复脚本 - 修复所有表结构问题（简化版）
-- 执行此脚本可以修复项目详情查看报错的问题
-- 适用于 MySQL 5.7 / 8.0
-- 
-- 使用方法：在 Navicat 中选择 mota 数据库后执行此脚本
-- =====================================================

-- 设置字符集
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- 选择数据库
USE mota;

-- =====================================================
-- 1. 修复 project 表 - 添加缺失的列
-- =====================================================

-- 检查并添加 visibility 列
SET @column_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'mota' AND TABLE_NAME = 'project' AND COLUMN_NAME = 'visibility');
SET @sql = IF(@column_exists = 0, "ALTER TABLE project ADD COLUMN visibility VARCHAR(20) DEFAULT 'private' COMMENT '可见性(private/internal/public)'", 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 检查并添加 archived_at 列
SET @column_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'mota' AND TABLE_NAME = 'project' AND COLUMN_NAME = 'archived_at');
SET @sql = IF(@column_exists = 0, "ALTER TABLE project ADD COLUMN archived_at DATETIME COMMENT '归档时间'", 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 检查并添加 archived_by 列
SET @column_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'mota' AND TABLE_NAME = 'project' AND COLUMN_NAME = 'archived_by');
SET @sql = IF(@column_exists = 0, "ALTER TABLE project ADD COLUMN archived_by BIGINT COMMENT '归档人ID'", 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 检查并添加 start_date 列
SET @column_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'mota' AND TABLE_NAME = 'project' AND COLUMN_NAME = 'start_date');
SET @sql = IF(@column_exists = 0, "ALTER TABLE project ADD COLUMN start_date DATE COMMENT '项目开始日期'", 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 检查并添加 end_date 列
SET @column_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'mota' AND TABLE_NAME = 'project' AND COLUMN_NAME = 'end_date');
SET @sql = IF(@column_exists = 0, "ALTER TABLE project ADD COLUMN end_date DATE COMMENT '项目结束日期'", 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 检查并添加 priority 列
SET @column_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'mota' AND TABLE_NAME = 'project' AND COLUMN_NAME = 'priority');
SET @sql = IF(@column_exists = 0, "ALTER TABLE project ADD COLUMN priority VARCHAR(20) DEFAULT 'medium' COMMENT '优先级(low/medium/high/urgent)'", 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT 'project 表修复完成' AS message;

-- =====================================================
-- 2. 修复 project_member 表 - 添加缺失的列
-- =====================================================

-- 检查并添加 version 列
SET @column_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'mota' AND TABLE_NAME = 'project_member' AND COLUMN_NAME = 'version');
SET @sql = IF(@column_exists = 0, "ALTER TABLE project_member ADD COLUMN version INT DEFAULT 0 COMMENT '乐观锁版本号'", 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 检查并添加 department_id 列
SET @column_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'mota' AND TABLE_NAME = 'project_member' AND COLUMN_NAME = 'department_id');
SET @sql = IF(@column_exists = 0, "ALTER TABLE project_member ADD COLUMN department_id BIGINT COMMENT '所属部门ID'", 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 检查并添加 created_by 列
SET @column_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'mota' AND TABLE_NAME = 'project_member' AND COLUMN_NAME = 'created_by');
SET @sql = IF(@column_exists = 0, "ALTER TABLE project_member ADD COLUMN created_by BIGINT DEFAULT NULL COMMENT '创建人ID'", 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 检查并添加 updated_by 列
SET @column_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'mota' AND TABLE_NAME = 'project_member' AND COLUMN_NAME = 'updated_by');
SET @sql = IF(@column_exists = 0, "ALTER TABLE project_member ADD COLUMN updated_by BIGINT DEFAULT NULL COMMENT '更新人ID'", 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT 'project_member 表修复完成' AS message;

-- =====================================================
-- 3. 确保 task 表存在（用于统计查询）
-- =====================================================
CREATE TABLE IF NOT EXISTS task (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    department_task_id BIGINT COMMENT '所属部门任务ID',
    project_id BIGINT NOT NULL COMMENT '所属项目ID',
    name VARCHAR(255) NOT NULL COMMENT '任务名称',
    description TEXT COMMENT '任务描述',
    assignee_id BIGINT COMMENT '执行人ID',
    status VARCHAR(20) DEFAULT 'pending' COMMENT '任务状态(pending/in_progress/completed/cancelled)',
    priority VARCHAR(20) DEFAULT 'medium' COMMENT '优先级(low/medium/high/urgent)',
    start_date DATE COMMENT '开始日期',
    end_date DATE COMMENT '截止日期',
    progress INT DEFAULT 0 COMMENT '任务进度(0-100)',
    progress_note TEXT COMMENT '进度说明',
    sort_order INT DEFAULT 0 COMMENT '排序顺序',
    completed_at TIMESTAMP NULL COMMENT '完成时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT COMMENT '创建人ID',
    updated_by BIGINT COMMENT '更新人ID',
    deleted INT DEFAULT 0 COMMENT '删除标记(0-未删除,1-已删除)',
    version INT DEFAULT 0 COMMENT '乐观锁版本号',
    
    INDEX idx_task_department_task (department_task_id),
    INDEX idx_task_project (project_id),
    INDEX idx_task_assignee (assignee_id),
    INDEX idx_task_status (status),
    INDEX idx_task_end_date (end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='执行任务表';

SELECT 'task 表检查完成' AS message;

-- =====================================================
-- 4. 确保 milestone 表存在（用于统计查询）
-- =====================================================
CREATE TABLE IF NOT EXISTS milestone (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    project_id BIGINT NOT NULL COMMENT '所属项目ID',
    name VARCHAR(200) NOT NULL COMMENT '里程碑名称',
    description TEXT COMMENT '里程碑描述',
    target_date DATE COMMENT '目标日期',
    status VARCHAR(20) DEFAULT 'pending' COMMENT '状态(pending/completed/delayed)',
    completed_at TIMESTAMP NULL COMMENT '完成时间',
    sort_order INT DEFAULT 0 COMMENT '排序顺序',
    department_task_count INT DEFAULT 0 COMMENT '部门任务数量',
    completed_department_task_count INT DEFAULT 0 COMMENT '已完成部门任务数量',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT COMMENT '创建人ID',
    updated_by BIGINT COMMENT '更新人ID',
    deleted INT DEFAULT 0 COMMENT '删除标记(0-未删除,1-已删除)',
    version INT DEFAULT 0 COMMENT '乐观锁版本号',
    
    INDEX idx_milestone_project (project_id),
    INDEX idx_milestone_target_date (target_date),
    INDEX idx_milestone_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='项目里程碑表';

SELECT 'milestone 表检查完成' AS message;

-- =====================================================
-- 5. 确保 department_task 表存在（用于统计查询）
-- =====================================================
CREATE TABLE IF NOT EXISTS department_task (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    project_id BIGINT NOT NULL COMMENT '所属项目ID',
    milestone_id BIGINT COMMENT '所属里程碑ID',
    department_id BIGINT NOT NULL COMMENT '负责部门ID',
    manager_id BIGINT COMMENT '部门负责人ID',
    name VARCHAR(200) NOT NULL COMMENT '任务名称',
    description TEXT COMMENT '任务描述',
    status VARCHAR(30) DEFAULT 'pending' COMMENT '任务状态(pending/plan_submitted/plan_approved/in_progress/completed/cancelled)',
    priority VARCHAR(20) DEFAULT 'medium' COMMENT '优先级(low/medium/high/urgent)',
    start_date DATE COMMENT '开始日期',
    end_date DATE COMMENT '截止日期',
    progress INT DEFAULT 0 COMMENT '任务进度(0-100)',
    require_plan TINYINT DEFAULT 1 COMMENT '是否需要提交工作计划(0-否,1-是)',
    require_approval TINYINT DEFAULT 0 COMMENT '工作计划是否需要审批(0-否,1-是)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT COMMENT '创建人ID',
    updated_by BIGINT COMMENT '更新人ID',
    deleted INT DEFAULT 0 COMMENT '删除标记(0-未删除,1-已删除)',
    version INT DEFAULT 0 COMMENT '乐观锁版本号',
    
    INDEX idx_department_task_project (project_id),
    INDEX idx_department_task_milestone (milestone_id),
    INDEX idx_department_task_department (department_id),
    INDEX idx_department_task_manager (manager_id),
    INDEX idx_department_task_status (status),
    INDEX idx_department_task_end_date (end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='部门任务表';

SELECT 'department_task 表检查完成' AS message;

-- =====================================================
-- 6. 查看当前表结构
-- =====================================================
SELECT '当前 project 表结构:' AS message;
DESCRIBE project;

SELECT '当前 project_member 表结构:' AS message;
DESCRIBE project_member;

-- =====================================================
-- 完成
-- =====================================================
SELECT '所有表结构修复完成！请重启后端服务。' AS message;