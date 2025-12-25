-- =====================================================
-- Mota 项目协同模块 V6.0 - 多级子任务支持
-- 为子任务表添加层级结构支持
-- 创建日期: 2025-12-25
-- =====================================================

-- =====================================================
-- 1. 更新子任务表 - 添加多级子任务支持字段
-- =====================================================
ALTER TABLE subtask 
ADD COLUMN IF NOT EXISTS parent_subtask_id BIGINT COMMENT '父子任务ID（用于多级子任务）',
ADD COLUMN IF NOT EXISTS level INT DEFAULT 0 COMMENT '层级深度（0表示一级子任务）';

-- 添加索引
CREATE INDEX IF NOT EXISTS idx_parent_subtask ON subtask(parent_subtask_id);
CREATE INDEX IF NOT EXISTS idx_level ON subtask(level);

-- =====================================================
-- 完成
-- =====================================================
SELECT 'V6.0 多级子任务支持数据库迁移完成！' AS message;