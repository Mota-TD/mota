-- 里程碑任务进度记录表
-- 用于存储任务进度更新的历史记录，包括富文本描述和附件

-- 选择数据库
USE mota;

-- 创建进度记录表
CREATE TABLE IF NOT EXISTS milestone_task_progress_record (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    task_id BIGINT NOT NULL COMMENT '任务ID',
    previous_progress INT DEFAULT 0 COMMENT '更新前进度',
    current_progress INT DEFAULT 0 COMMENT '更新后进度',
    description TEXT COMMENT '进度描述（支持富文本HTML）',
    attachments JSON COMMENT '附件列表（JSON格式）',
    updated_by BIGINT COMMENT '更新人ID',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted INT DEFAULT 0 COMMENT '逻辑删除标记',
    version INT DEFAULT 1 COMMENT '乐观锁版本号',
    INDEX idx_task_id (task_id),
    INDEX idx_updated_by (updated_by),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='里程碑任务进度记录表';

-- 添加外键约束（可选，根据实际需求决定是否启用）
-- ALTER TABLE milestone_task_progress_record 
--     ADD CONSTRAINT fk_progress_record_task 
--     FOREIGN KEY (task_id) REFERENCES milestone_task(id) ON DELETE CASCADE;