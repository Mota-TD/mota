-- =====================================================
-- V28.0 修复 project_member 表结构
-- 添加缺失的 version 列
-- =====================================================

-- 为 project_member 表添加 version 列（如果不存在）
ALTER TABLE project_member ADD COLUMN IF NOT EXISTS version INT DEFAULT 0 COMMENT '乐观锁版本号';

-- 确保 department_id 列存在
ALTER TABLE project_member ADD COLUMN IF NOT EXISTS department_id BIGINT COMMENT '所属部门ID';

-- 确保 created_by 和 updated_by 列存在
ALTER TABLE project_member ADD COLUMN IF NOT EXISTS created_by BIGINT DEFAULT NULL COMMENT '创建人ID';
ALTER TABLE project_member ADD COLUMN IF NOT EXISTS updated_by BIGINT DEFAULT NULL COMMENT '更新人ID';

-- 添加索引（如果不存在）
CREATE INDEX IF NOT EXISTS idx_department ON project_member(department_id);

-- =====================================================
-- 完成
-- =====================================================
SELECT 'V28.0 project_member 表结构修复完成！' AS message;