-- V36.0 修复里程碑任务相关表结构
-- 兼容 MySQL 5.7 版本

-- 选择数据库（请根据实际数据库名称修改）
USE mota;

-- 1. 确保 milestone_task_attachment 表存在
CREATE TABLE IF NOT EXISTS milestone_task_attachment (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    task_id BIGINT NOT NULL COMMENT '任务ID',
    file_name VARCHAR(255) NOT NULL COMMENT '文件名',
    file_path VARCHAR(500) NOT NULL COMMENT '文件路径',
    file_size BIGINT COMMENT '文件大小(字节)',
    file_type VARCHAR(100) COMMENT '文件类型',
    attachment_type VARCHAR(50) DEFAULT 'other' COMMENT '附件类型(execution_plan/other)',
    uploaded_by BIGINT COMMENT '上传人ID',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    created_by BIGINT DEFAULT NULL COMMENT '创建人ID',
    updated_by BIGINT DEFAULT NULL COMMENT '更新人ID',
    deleted TINYINT(1) DEFAULT 0 COMMENT '是否删除',
    version INT DEFAULT 1 COMMENT '乐观锁版本号',
    KEY idx_task_id (task_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='里程碑任务附件表';

-- 2. 确保 milestone_comment 表存在
CREATE TABLE IF NOT EXISTS milestone_comment (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    milestone_id BIGINT COMMENT '里程碑ID',
    task_id BIGINT COMMENT '任务ID(如果是任务评论)',
    user_id BIGINT NOT NULL COMMENT '评论人ID',
    content TEXT NOT NULL COMMENT '评论内容',
    parent_id BIGINT COMMENT '父评论ID(回复)',
    is_reminder TINYINT(1) DEFAULT 0 COMMENT '是否催办(0-普通评论,1-催办)',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    created_by BIGINT DEFAULT NULL COMMENT '创建人ID',
    updated_by BIGINT DEFAULT NULL COMMENT '更新人ID',
    deleted TINYINT(1) DEFAULT 0 COMMENT '是否删除',
    version INT DEFAULT 1 COMMENT '乐观锁版本号',
    KEY idx_milestone_id (milestone_id),
    KEY idx_task_id (task_id),
    KEY idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='里程碑/任务评论表';