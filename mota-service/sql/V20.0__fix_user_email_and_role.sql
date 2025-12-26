-- 添加 created_by 字段
ALTER TABLE milestone_assignee ADD COLUMN created_by BIGINT COMMENT '创建人ID';

-- 添加 updated_by 字段
ALTER TABLE milestone_assignee ADD COLUMN updated_by BIGINT COMMENT '更新人ID';

-- 添加 deleted 字段
ALTER TABLE milestone_assignee ADD COLUMN deleted INT DEFAULT 0 COMMENT '删除标记(0-未删除,1-已删除)';

-- 添加 version 字段
ALTER TABLE milestone_assignee ADD COLUMN version INT DEFAULT 0 COMMENT '乐观锁版本号';

-- 更新现有记录的默认值
UPDATE milestone_assignee SET deleted = 0 WHERE deleted IS NULL;
UPDATE milestone_assignee SET version = 0 WHERE version IS NULL;
