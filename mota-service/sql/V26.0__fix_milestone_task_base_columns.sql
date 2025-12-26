-- =====================================================
-- V26.0 修复 milestone_task 表缺失的基类字段
-- 添加 created_by, updated_by, version 字段
-- 兼容 MySQL 5.7+ 版本
-- =====================================================

-- 为 milestone_task 表添加缺失的字段
ALTER TABLE milestone_task ADD COLUMN created_by BIGINT DEFAULT NULL COMMENT '创建人ID';
ALTER TABLE milestone_task ADD COLUMN updated_by BIGINT DEFAULT NULL COMMENT '更新人ID';
ALTER TABLE milestone_task ADD COLUMN version INT DEFAULT 1 COMMENT '乐观锁版本号';

-- 为 milestone_task_attachment 表添加缺失的字段
ALTER TABLE milestone_task_attachment ADD COLUMN created_by BIGINT DEFAULT NULL COMMENT '创建人ID';
ALTER TABLE milestone_task_attachment ADD COLUMN updated_by BIGINT DEFAULT NULL COMMENT '更新人ID';
ALTER TABLE milestone_task_attachment ADD COLUMN version INT DEFAULT 1 COMMENT '乐观锁版本号';

-- 为 milestone_comment 表添加缺失的字段
ALTER TABLE milestone_comment ADD COLUMN created_by BIGINT DEFAULT NULL COMMENT '创建人ID';
ALTER TABLE milestone_comment ADD COLUMN updated_by BIGINT DEFAULT NULL COMMENT '更新人ID';
ALTER TABLE milestone_comment ADD COLUMN version INT DEFAULT 1 COMMENT '乐观锁版本号';