-- =====================================================
-- V29.0 修复 project 表结构
-- 添加缺失的 visibility, archived_at, archived_by 列
-- =====================================================

-- 为 project 表添加 visibility 列（如果不存在）
ALTER TABLE project ADD COLUMN IF NOT EXISTS visibility VARCHAR(20) DEFAULT 'private' COMMENT '可见性(private/internal/public)';

-- 为 project 表添加 archived_at 列（如果不存在）
ALTER TABLE project ADD COLUMN IF NOT EXISTS archived_at DATETIME COMMENT '归档时间';

-- 为 project 表添加 archived_by 列（如果不存在）
ALTER TABLE project ADD COLUMN IF NOT EXISTS archived_by BIGINT COMMENT '归档人ID';

-- 确保 start_date 列存在
ALTER TABLE project ADD COLUMN IF NOT EXISTS start_date DATE COMMENT '项目开始日期';

-- 确保 end_date 列存在
ALTER TABLE project ADD COLUMN IF NOT EXISTS end_date DATE COMMENT '项目结束日期';

-- 确保 priority 列存在
ALTER TABLE project ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'medium' COMMENT '优先级(low/medium/high/urgent)';

-- 添加状态索引（如果不存在）
CREATE INDEX IF NOT EXISTS idx_project_status ON project(status);

-- =====================================================
-- 完成
-- =====================================================
SELECT 'V29.0 project 表结构修复完成！' AS message;