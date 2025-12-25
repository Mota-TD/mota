-- =====================================================
-- V5.0 工作流和视图配置功能数据库设计
-- 包含：自定义工作流、状态管理、流转规则、视图配置
-- =====================================================

-- 1. 工作流模板表
CREATE TABLE IF NOT EXISTS workflow_template (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL COMMENT '工作流名称',
    description TEXT COMMENT '工作流描述',
    project_id BIGINT COMMENT '所属项目ID（NULL表示全局模板）',
    is_default TINYINT(1) DEFAULT 0 COMMENT '是否为默认工作流',
    is_system TINYINT(1) DEFAULT 0 COMMENT '是否为系统预设工作流',
    
    -- 创建者信息
    created_by BIGINT COMMENT '创建者ID',
    
    -- 时间戳
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- 软删除
    deleted TINYINT(1) DEFAULT 0 COMMENT '删除标记',
    
    INDEX idx_project_id (project_id),
    INDEX idx_is_default (is_default),
    INDEX idx_created_by (created_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工作流模板表';

-- 2. 工作流状态表
CREATE TABLE IF NOT EXISTS workflow_status (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    workflow_id BIGINT NOT NULL COMMENT '所属工作流ID',
    name VARCHAR(50) NOT NULL COMMENT '状态名称',
    description VARCHAR(200) COMMENT '状态描述',
    color VARCHAR(20) DEFAULT '#1890ff' COMMENT '状态颜色',
    icon VARCHAR(50) COMMENT '状态图标',
    sort_order INT DEFAULT 0 COMMENT '排序顺序',
    is_initial TINYINT(1) DEFAULT 0 COMMENT '是否为初始状态',
    is_final TINYINT(1) DEFAULT 0 COMMENT '是否为终态',
    
    -- 状态类型：todo, in_progress, done, cancelled
    status_type VARCHAR(20) DEFAULT 'todo' COMMENT '状态类型',
    
    -- 时间戳
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_workflow_id (workflow_id),
    INDEX idx_sort_order (sort_order),
    INDEX idx_is_initial (is_initial),
    INDEX idx_is_final (is_final)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工作流状态表';

-- 3. 工作流流转规则表
CREATE TABLE IF NOT EXISTS workflow_transition (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    workflow_id BIGINT NOT NULL COMMENT '所属工作流ID',
    from_status_id BIGINT NOT NULL COMMENT '源状态ID',
    to_status_id BIGINT NOT NULL COMMENT '目标状态ID',
    name VARCHAR(100) COMMENT '流转名称',
    description VARCHAR(200) COMMENT '流转描述',
    
    -- 流转条件（JSON格式）
    conditions TEXT COMMENT '流转条件',
    
    -- 流转动作（JSON格式）
    actions TEXT COMMENT '流转时执行的动作',
    
    -- 权限控制
    allowed_roles TEXT COMMENT '允许执行此流转的角色（JSON数组）',
    
    -- 时间戳
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_workflow_id (workflow_id),
    INDEX idx_from_status (from_status_id),
    INDEX idx_to_status (to_status_id),
    UNIQUE KEY uk_transition (workflow_id, from_status_id, to_status_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工作流流转规则表';

-- 4. 用户视图配置表
CREATE TABLE IF NOT EXISTS user_view_config (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL COMMENT '用户ID',
    view_type VARCHAR(50) NOT NULL COMMENT '视图类型: project, task, calendar, kanban, gantt',
    name VARCHAR(100) NOT NULL COMMENT '视图名称',
    description VARCHAR(200) COMMENT '视图描述',
    
    -- 视图配置（JSON格式）
    config JSON NOT NULL COMMENT '视图配置（筛选条件、排序、列配置等）',
    
    -- 是否为默认视图
    is_default TINYINT(1) DEFAULT 0 COMMENT '是否为默认视图',
    
    -- 是否共享
    is_shared TINYINT(1) DEFAULT 0 COMMENT '是否共享给团队',
    
    -- 关联项目（可选）
    project_id BIGINT COMMENT '关联项目ID',
    
    -- 时间戳
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_user_id (user_id),
    INDEX idx_view_type (view_type),
    INDEX idx_is_default (is_default),
    INDEX idx_project_id (project_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户视图配置表';

-- 5. 项目工作流关联表
CREATE TABLE IF NOT EXISTS project_workflow (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    project_id BIGINT NOT NULL COMMENT '项目ID',
    workflow_id BIGINT NOT NULL COMMENT '工作流ID',
    is_active TINYINT(1) DEFAULT 1 COMMENT '是否激活',
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_project_id (project_id),
    INDEX idx_workflow_id (workflow_id),
    UNIQUE KEY uk_project_workflow (project_id, workflow_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='项目工作流关联表';

-- =====================================================
-- 插入默认工作流数据
-- =====================================================

-- 插入默认工作流模板
INSERT INTO workflow_template (name, description, is_default, is_system, created_by) VALUES
('标准工作流', '适用于大多数项目的标准任务工作流', 1, 1, 1),
('敏捷开发工作流', '适用于敏捷开发团队的工作流', 0, 1, 1),
('简单工作流', '简化的两状态工作流', 0, 1, 1);

-- 获取工作流ID并插入状态
SET @standard_workflow_id = 1;
SET @agile_workflow_id = 2;
SET @simple_workflow_id = 3;

-- 标准工作流状态
INSERT INTO workflow_status (workflow_id, name, description, color, sort_order, is_initial, is_final, status_type) VALUES
(@standard_workflow_id, '待办', '任务待处理', '#909399', 1, 1, 0, 'todo'),
(@standard_workflow_id, '进行中', '任务正在进行', '#409EFF', 2, 0, 0, 'in_progress'),
(@standard_workflow_id, '待审核', '任务待审核', '#E6A23C', 3, 0, 0, 'in_progress'),
(@standard_workflow_id, '已完成', '任务已完成', '#67C23A', 4, 0, 1, 'done'),
(@standard_workflow_id, '已取消', '任务已取消', '#F56C6C', 5, 0, 1, 'cancelled');

-- 敏捷开发工作流状态
INSERT INTO workflow_status (workflow_id, name, description, color, sort_order, is_initial, is_final, status_type) VALUES
(@agile_workflow_id, 'Backlog', '待办事项池', '#909399', 1, 1, 0, 'todo'),
(@agile_workflow_id, 'To Do', '本迭代待办', '#909399', 2, 0, 0, 'todo'),
(@agile_workflow_id, 'In Progress', '开发中', '#409EFF', 3, 0, 0, 'in_progress'),
(@agile_workflow_id, 'Code Review', '代码审查', '#E6A23C', 4, 0, 0, 'in_progress'),
(@agile_workflow_id, 'Testing', '测试中', '#E6A23C', 5, 0, 0, 'in_progress'),
(@agile_workflow_id, 'Done', '已完成', '#67C23A', 6, 0, 1, 'done');

-- 简单工作流状态
INSERT INTO workflow_status (workflow_id, name, description, color, sort_order, is_initial, is_final, status_type) VALUES
(@simple_workflow_id, '未完成', '任务未完成', '#909399', 1, 1, 0, 'todo'),
(@simple_workflow_id, '已完成', '任务已完成', '#67C23A', 2, 0, 1, 'done');

-- 标准工作流流转规则
INSERT INTO workflow_transition (workflow_id, from_status_id, to_status_id, name) VALUES
(1, 1, 2, '开始处理'),
(1, 2, 3, '提交审核'),
(1, 3, 2, '审核退回'),
(1, 3, 4, '审核通过'),
(1, 1, 5, '取消任务'),
(1, 2, 5, '取消任务'),
(1, 2, 1, '暂停任务');

-- 敏捷开发工作流流转规则
INSERT INTO workflow_transition (workflow_id, from_status_id, to_status_id, name) VALUES
(2, 6, 7, '加入迭代'),
(2, 7, 8, '开始开发'),
(2, 8, 9, '提交审查'),
(2, 9, 8, '审查退回'),
(2, 9, 10, '提交测试'),
(2, 10, 8, '测试不通过'),
(2, 10, 11, '测试通过');

-- 简单工作流流转规则
INSERT INTO workflow_transition (workflow_id, from_status_id, to_status_id, name) VALUES
(3, 12, 13, '完成'),
(3, 13, 12, '重新打开');

-- =====================================================
-- 插入默认视图配置示例
-- =====================================================

INSERT INTO user_view_config (user_id, view_type, name, description, config, is_default) VALUES
(1, 'project', '所有项目', '显示所有项目', '{"filters": {}, "sort": {"field": "updatedAt", "order": "desc"}, "columns": ["name", "status", "progress", "owner", "dueDate"]}', 1),
(1, 'project', '进行中项目', '只显示进行中的项目', '{"filters": {"status": ["active"]}, "sort": {"field": "updatedAt", "order": "desc"}, "columns": ["name", "progress", "owner", "dueDate"]}', 0),
(1, 'task', '我的任务', '分配给我的任务', '{"filters": {"assignee": "me"}, "sort": {"field": "priority", "order": "desc"}, "columns": ["name", "status", "priority", "dueDate"]}', 1),
(1, 'task', '高优先级任务', '高优先级和紧急任务', '{"filters": {"priority": ["high", "urgent"]}, "sort": {"field": "dueDate", "order": "asc"}, "columns": ["name", "status", "assignee", "dueDate"]}', 0);