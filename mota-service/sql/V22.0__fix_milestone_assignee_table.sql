-- V22.0 创建里程碑负责人表
-- 创建时间: 2024-12-26
-- 说明: 创建 milestone_assignee 表（如果不存在）

-- 创建里程碑负责人关联表（支持多负责人）
CREATE TABLE IF NOT EXISTS milestone_assignee (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    milestone_id BIGINT NOT NULL COMMENT '里程碑ID',
    user_id BIGINT NOT NULL COMMENT '负责人用户ID',
    is_primary TINYINT(1) DEFAULT 0 COMMENT '是否主负责人(0-否,1-是)',
    assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '分配时间',
    assigned_by BIGINT COMMENT '分配人ID',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    created_by BIGINT COMMENT '创建人ID',
    updated_by BIGINT COMMENT '更新人ID',
    deleted INT DEFAULT 0 COMMENT '删除标记(0-未删除,1-已删除)',
    version INT DEFAULT 0 COMMENT '乐观锁版本号',
    UNIQUE KEY uk_milestone_user (milestone_id, user_id),
    KEY idx_milestone_id (milestone_id),
    KEY idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='里程碑负责人关联表';