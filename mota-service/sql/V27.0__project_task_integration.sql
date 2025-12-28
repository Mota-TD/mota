-- V27.0__project_task_integration.sql
-- 项目创建到任务管理闭环改进
-- 实现项目 → 里程碑 → 部门任务 → 执行任务的完整链路

-- =====================================================
-- 1. 部门任务表添加里程碑关联和日历事件关联
-- =====================================================
ALTER TABLE department_task 
ADD COLUMN IF NOT EXISTS milestone_id BIGINT COMMENT '关联里程碑ID',
ADD COLUMN IF NOT EXISTS calendar_event_id BIGINT COMMENT '关联的日历事件ID';

-- 添加索引
CREATE INDEX IF NOT EXISTS idx_dept_task_milestone ON department_task(milestone_id);
CREATE INDEX IF NOT EXISTS idx_dept_task_calendar_event ON department_task(calendar_event_id);

-- =====================================================
-- 2. 执行任务表添加里程碑关联和日历事件关联
-- =====================================================
ALTER TABLE task 
ADD COLUMN IF NOT EXISTS milestone_id BIGINT COMMENT '关联里程碑ID',
ADD COLUMN IF NOT EXISTS calendar_event_id BIGINT COMMENT '关联的日历事件ID';

-- 添加索引
CREATE INDEX IF NOT EXISTS idx_task_milestone ON task(milestone_id);
CREATE INDEX IF NOT EXISTS idx_task_calendar_event ON task(calendar_event_id);

-- =====================================================
-- 3. 里程碑表添加部门任务统计字段
-- =====================================================
ALTER TABLE milestone 
ADD COLUMN IF NOT EXISTS department_task_count INT DEFAULT 0 COMMENT '关联部门任务数',
ADD COLUMN IF NOT EXISTS completed_department_task_count INT DEFAULT 0 COMMENT '已完成部门任务数';

-- =====================================================
-- 4. 创建进度同步触发器（可选，也可以用应用层实现）
-- =====================================================

-- 当任务进度更新时，自动更新部门任务进度
DROP TRIGGER IF EXISTS trg_task_progress_update;
DELIMITER //
CREATE TRIGGER trg_task_progress_update
AFTER UPDATE ON task
FOR EACH ROW
BEGIN
    IF NEW.progress != OLD.progress OR NEW.status != OLD.status THEN
        -- 更新部门任务进度
        UPDATE department_task dt
        SET progress = (
            SELECT COALESCE(AVG(t.progress), 0)
            FROM task t
            WHERE t.department_task_id = dt.id AND t.deleted = 0
        )
        WHERE dt.id = NEW.department_task_id;
    END IF;
END//
DELIMITER ;

-- 当部门任务进度更新时，自动更新里程碑进度
DROP TRIGGER IF EXISTS trg_dept_task_progress_update;
DELIMITER //
CREATE TRIGGER trg_dept_task_progress_update
AFTER UPDATE ON department_task
FOR EACH ROW
BEGIN
    IF NEW.progress != OLD.progress OR NEW.status != OLD.status THEN
        -- 更新里程碑进度
        IF NEW.milestone_id IS NOT NULL THEN
            UPDATE milestone m
            SET 
                progress = (
                    SELECT COALESCE(AVG(dt.progress), 0)
                    FROM department_task dt
                    WHERE dt.milestone_id = m.id AND dt.deleted = 0
                ),
                completed_department_task_count = (
                    SELECT COUNT(*)
                    FROM department_task dt
                    WHERE dt.milestone_id = m.id AND dt.deleted = 0 AND dt.status = 'completed'
                )
            WHERE m.id = NEW.milestone_id;
        END IF;
    END IF;
END//
DELIMITER ;

-- 当里程碑进度更新时，自动更新项目进度
DROP TRIGGER IF EXISTS trg_milestone_progress_update;
DELIMITER //
CREATE TRIGGER trg_milestone_progress_update
AFTER UPDATE ON milestone
FOR EACH ROW
BEGIN
    IF NEW.progress != OLD.progress OR NEW.status != OLD.status THEN
        -- 更新项目进度
        UPDATE project p
        SET progress = (
            SELECT COALESCE(AVG(m.progress), 0)
            FROM milestone m
            WHERE m.project_id = p.id AND m.deleted = 0
        )
        WHERE p.id = NEW.project_id;
    END IF;
END//
DELIMITER ;

-- =====================================================
-- 5. 添加外键约束（可选，根据实际需求决定是否启用）
-- =====================================================
-- ALTER TABLE department_task 
-- ADD CONSTRAINT fk_dept_task_milestone FOREIGN KEY (milestone_id) REFERENCES milestone(id);

-- ALTER TABLE task 
-- ADD CONSTRAINT fk_task_milestone FOREIGN KEY (milestone_id) REFERENCES milestone(id);

-- ALTER TABLE department_task 
-- ADD CONSTRAINT fk_dept_task_calendar_event FOREIGN KEY (calendar_event_id) REFERENCES calendar_event(id);

-- ALTER TABLE task 
-- ADD CONSTRAINT fk_task_calendar_event FOREIGN KEY (calendar_event_id) REFERENCES calendar_event(id);