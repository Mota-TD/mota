-- =====================================================
-- Mota协作服务数据库表结构
-- 数据库: mota_collab
-- =====================================================

-- 创建数据库
CREATE DATABASE IF NOT EXISTS mota_collab DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE mota_collab;

-- =====================================================
-- 1. 文档表
-- =====================================================
CREATE TABLE IF NOT EXISTS `document` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '文档ID',
    `tenant_id` BIGINT NOT NULL COMMENT '租户ID',
    `project_id` BIGINT COMMENT '所属项目ID',
    `parent_id` BIGINT COMMENT '父文档ID（用于文件夹结构）',
    `title` VARCHAR(500) NOT NULL COMMENT '文档标题',
    `content` LONGTEXT COMMENT '文档内容（JSON格式，支持富文本）',
    `plain_text` LONGTEXT COMMENT '纯文本内容（用于搜索）',
    `doc_type` VARCHAR(50) NOT NULL DEFAULT 'markdown' COMMENT '文档类型：markdown/richtext/code/whiteboard/folder',
    `status` VARCHAR(50) NOT NULL DEFAULT 'draft' COMMENT '状态：draft/published/archived',
    `is_folder` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否为文件夹',
    `version` INT NOT NULL DEFAULT 1 COMMENT '当前版本号',
    `word_count` INT DEFAULT 0 COMMENT '字数统计',
    `cover_image` VARCHAR(500) COMMENT '封面图片URL',
    `icon` VARCHAR(100) COMMENT '图标',
    `sort_order` INT DEFAULT 0 COMMENT '排序顺序',
    `is_template` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否为模板',
    `template_id` BIGINT COMMENT '来源模板ID',
    `is_locked` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否锁定',
    `locked_by` BIGINT COMMENT '锁定者ID',
    `locked_at` DATETIME COMMENT '锁定时间',
    `permission_level` VARCHAR(50) NOT NULL DEFAULT 'private' COMMENT '权限级别：private/team/public',
    `is_favorite` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否收藏',
    `view_count` INT DEFAULT 0 COMMENT '浏览次数',
    `last_viewed_at` DATETIME COMMENT '最后浏览时间',
    `created_by` BIGINT NOT NULL COMMENT '创建者ID',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_by` BIGINT COMMENT '更新者ID',
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否删除',
    PRIMARY KEY (`id`),
    KEY `idx_tenant_id` (`tenant_id`),
    KEY `idx_project_id` (`project_id`),
    KEY `idx_parent_id` (`parent_id`),
    KEY `idx_doc_type` (`doc_type`),
    KEY `idx_status` (`status`),
    KEY `idx_created_by` (`created_by`),
    KEY `idx_is_template` (`is_template`),
    KEY `idx_permission_level` (`permission_level`),
    FULLTEXT KEY `ft_title_content` (`title`, `plain_text`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文档表';

-- =====================================================
-- 2. 文档版本表
-- =====================================================
CREATE TABLE IF NOT EXISTS `document_version` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '版本ID',
    `tenant_id` BIGINT NOT NULL COMMENT '租户ID',
    `document_id` BIGINT NOT NULL COMMENT '文档ID',
    `version_number` INT NOT NULL COMMENT '版本号',
    `content` LONGTEXT COMMENT '版本内容',
    `diff_content` TEXT COMMENT '与上一版本的差异（JSON格式）',
    `change_summary` VARCHAR(500) COMMENT '变更摘要',
    `is_auto_save` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否自动保存',
    `is_major_version` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否主要版本',
    `word_count` INT DEFAULT 0 COMMENT '字数统计',
    `created_by` BIGINT NOT NULL COMMENT '创建者ID',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `deleted` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否删除',
    PRIMARY KEY (`id`),
    KEY `idx_tenant_id` (`tenant_id`),
    KEY `idx_document_id` (`document_id`),
    KEY `idx_version_number` (`version_number`),
    KEY `idx_created_by` (`created_by`),
    KEY `idx_is_major_version` (`is_major_version`),
    UNIQUE KEY `uk_document_version` (`document_id`, `version_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文档版本表';

-- =====================================================
-- 3. 文档评论表
-- =====================================================
CREATE TABLE IF NOT EXISTS `document_comment` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '评论ID',
    `tenant_id` BIGINT NOT NULL COMMENT '租户ID',
    `document_id` BIGINT NOT NULL COMMENT '文档ID',
    `parent_id` BIGINT COMMENT '父评论ID（用于回复）',
    `content` TEXT NOT NULL COMMENT '评论内容',
    `comment_type` VARCHAR(50) NOT NULL DEFAULT 'general' COMMENT '评论类型：inline/block/general',
    `selected_text` TEXT COMMENT '选中的文本（行内评论）',
    `anchor_position` VARCHAR(500) COMMENT '锚点位置（JSON格式）',
    `is_resolved` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否已解决',
    `resolved_by` BIGINT COMMENT '解决者ID',
    `resolved_at` DATETIME COMMENT '解决时间',
    `mentioned_users` VARCHAR(1000) COMMENT '@提及的用户ID列表（JSON数组）',
    `created_by` BIGINT NOT NULL COMMENT '创建者ID',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_by` BIGINT COMMENT '更新者ID',
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否删除',
    PRIMARY KEY (`id`),
    KEY `idx_tenant_id` (`tenant_id`),
    KEY `idx_document_id` (`document_id`),
    KEY `idx_parent_id` (`parent_id`),
    KEY `idx_comment_type` (`comment_type`),
    KEY `idx_is_resolved` (`is_resolved`),
    KEY `idx_created_by` (`created_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文档评论表';

-- =====================================================
-- 4. 文档协作者表
-- =====================================================
CREATE TABLE IF NOT EXISTS `document_collaborator` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '协作者ID',
    `tenant_id` BIGINT NOT NULL COMMENT '租户ID',
    `document_id` BIGINT NOT NULL COMMENT '文档ID',
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `permission` VARCHAR(50) NOT NULL DEFAULT 'viewer' COMMENT '权限：owner/editor/commenter/viewer',
    `invited_by` BIGINT COMMENT '邀请者ID',
    `invited_at` DATETIME COMMENT '邀请时间',
    `accepted_at` DATETIME COMMENT '接受时间',
    `last_accessed_at` DATETIME COMMENT '最后访问时间',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否删除',
    PRIMARY KEY (`id`),
    KEY `idx_tenant_id` (`tenant_id`),
    KEY `idx_document_id` (`document_id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_permission` (`permission`),
    UNIQUE KEY `uk_document_user` (`document_id`, `user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文档协作者表';

-- =====================================================
-- 5. 文档标签表
-- =====================================================
CREATE TABLE IF NOT EXISTS `document_tag` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '标签ID',
    `tenant_id` BIGINT NOT NULL COMMENT '租户ID',
    `document_id` BIGINT NOT NULL COMMENT '文档ID',
    `tag_name` VARCHAR(100) NOT NULL COMMENT '标签名称',
    `tag_color` VARCHAR(50) COMMENT '标签颜色',
    `created_by` BIGINT NOT NULL COMMENT '创建者ID',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_tenant_id` (`tenant_id`),
    KEY `idx_document_id` (`document_id`),
    KEY `idx_tag_name` (`tag_name`),
    UNIQUE KEY `uk_document_tag` (`document_id`, `tag_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文档标签表';

-- =====================================================
-- 6. 协作会话表
-- =====================================================
CREATE TABLE IF NOT EXISTS `collaboration_session` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '会话ID',
    `tenant_id` BIGINT NOT NULL COMMENT '租户ID',
    `document_id` BIGINT NOT NULL COMMENT '文档ID',
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `session_id` VARCHAR(100) NOT NULL COMMENT '会话标识',
    `cursor_position` VARCHAR(500) COMMENT '光标位置（JSON格式）',
    `selection_range` VARCHAR(500) COMMENT '选区范围（JSON格式）',
    `user_color` VARCHAR(50) COMMENT '用户颜色（用于协作显示）',
    `is_active` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '是否活跃',
    `last_heartbeat` DATETIME COMMENT '最后心跳时间',
    `joined_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '加入时间',
    `left_at` DATETIME COMMENT '离开时间',
    PRIMARY KEY (`id`),
    KEY `idx_tenant_id` (`tenant_id`),
    KEY `idx_document_id` (`document_id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_session_id` (`session_id`),
    KEY `idx_is_active` (`is_active`),
    KEY `idx_last_heartbeat` (`last_heartbeat`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='协作会话表';

-- =====================================================
-- 7. 文档收藏表
-- =====================================================
CREATE TABLE IF NOT EXISTS `document_favorite` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '收藏ID',
    `tenant_id` BIGINT NOT NULL COMMENT '租户ID',
    `document_id` BIGINT NOT NULL COMMENT '文档ID',
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_tenant_id` (`tenant_id`),
    KEY `idx_document_id` (`document_id`),
    KEY `idx_user_id` (`user_id`),
    UNIQUE KEY `uk_document_user` (`document_id`, `user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文档收藏表';

-- =====================================================
-- 8. 文档浏览历史表
-- =====================================================
CREATE TABLE IF NOT EXISTS `document_view_history` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '历史ID',
    `tenant_id` BIGINT NOT NULL COMMENT '租户ID',
    `document_id` BIGINT NOT NULL COMMENT '文档ID',
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `viewed_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '浏览时间',
    `duration` INT DEFAULT 0 COMMENT '浏览时长（秒）',
    PRIMARY KEY (`id`),
    KEY `idx_tenant_id` (`tenant_id`),
    KEY `idx_document_id` (`document_id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_viewed_at` (`viewed_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文档浏览历史表';

-- =====================================================
-- 9. 文档模板表
-- =====================================================
CREATE TABLE IF NOT EXISTS `document_template` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '模板ID',
    `tenant_id` BIGINT NOT NULL COMMENT '租户ID',
    `name` VARCHAR(200) NOT NULL COMMENT '模板名称',
    `description` TEXT COMMENT '模板描述',
    `content` LONGTEXT COMMENT '模板内容',
    `doc_type` VARCHAR(50) NOT NULL DEFAULT 'markdown' COMMENT '文档类型',
    `category` VARCHAR(100) COMMENT '模板分类',
    `cover_image` VARCHAR(500) COMMENT '封面图片',
    `is_system` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否系统模板',
    `is_public` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否公开',
    `use_count` INT DEFAULT 0 COMMENT '使用次数',
    `created_by` BIGINT NOT NULL COMMENT '创建者ID',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_by` BIGINT COMMENT '更新者ID',
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否删除',
    PRIMARY KEY (`id`),
    KEY `idx_tenant_id` (`tenant_id`),
    KEY `idx_doc_type` (`doc_type`),
    KEY `idx_category` (`category`),
    KEY `idx_is_system` (`is_system`),
    KEY `idx_is_public` (`is_public`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文档模板表';

-- =====================================================
-- 10. 文档分享链接表
-- =====================================================
CREATE TABLE IF NOT EXISTS `document_share_link` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '分享ID',
    `tenant_id` BIGINT NOT NULL COMMENT '租户ID',
    `document_id` BIGINT NOT NULL COMMENT '文档ID',
    `share_code` VARCHAR(100) NOT NULL COMMENT '分享码',
    `permission` VARCHAR(50) NOT NULL DEFAULT 'viewer' COMMENT '权限：viewer/commenter/editor',
    `password` VARCHAR(100) COMMENT '访问密码',
    `expire_at` DATETIME COMMENT '过期时间',
    `max_views` INT COMMENT '最大浏览次数',
    `view_count` INT DEFAULT 0 COMMENT '已浏览次数',
    `is_active` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '是否有效',
    `created_by` BIGINT NOT NULL COMMENT '创建者ID',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_tenant_id` (`tenant_id`),
    KEY `idx_document_id` (`document_id`),
    KEY `idx_share_code` (`share_code`),
    KEY `idx_is_active` (`is_active`),
    UNIQUE KEY `uk_share_code` (`share_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文档分享链接表';

-- =====================================================
-- 初始化数据
-- =====================================================

-- 插入系统文档模板
INSERT INTO `document_template` (`tenant_id`, `name`, `description`, `content`, `doc_type`, `category`, `is_system`, `is_public`, `created_by`) VALUES
(0, '空白文档', '从空白开始创建文档', '# 无标题文档\n\n开始编写您的内容...', 'markdown', '基础', 1, 1, 0),
(0, '会议纪要', '会议纪要模板', '# 会议纪要\n\n## 基本信息\n- **会议主题**：\n- **会议时间**：\n- **会议地点**：\n- **参会人员**：\n- **主持人**：\n- **记录人**：\n\n## 会议议程\n1. \n2. \n3. \n\n## 讨论内容\n\n### 议题一\n\n### 议题二\n\n## 决议事项\n| 序号 | 决议内容 | 负责人 | 完成时间 |\n|------|----------|--------|----------|\n| 1 | | | |\n| 2 | | | |\n\n## 待办事项\n- [ ] \n- [ ] \n\n## 下次会议安排\n- **时间**：\n- **地点**：\n- **议题**：', 'markdown', '办公', 1, 1, 0),
(0, '项目计划', '项目计划模板', '# 项目计划书\n\n## 项目概述\n### 项目名称\n\n### 项目背景\n\n### 项目目标\n\n## 项目范围\n### 包含内容\n\n### 不包含内容\n\n## 项目里程碑\n| 里程碑 | 计划完成时间 | 交付物 |\n|--------|--------------|--------|\n| | | |\n\n## 项目团队\n| 角色 | 姓名 | 职责 |\n|------|------|------|\n| 项目经理 | | |\n| 开发负责人 | | |\n\n## 风险管理\n| 风险 | 可能性 | 影响 | 应对措施 |\n|------|--------|------|----------|\n| | | | |\n\n## 资源需求\n\n## 预算估算', 'markdown', '项目管理', 1, 1, 0),
(0, '技术文档', '技术文档模板', '# 技术文档\n\n## 概述\n\n## 系统架构\n\n## 技术选型\n| 类型 | 技术 | 版本 | 说明 |\n|------|------|------|------|\n| | | | |\n\n## 接口设计\n\n### 接口1\n- **URL**: \n- **Method**: \n- **请求参数**:\n```json\n{\n}\n```\n- **响应结果**:\n```json\n{\n}\n```\n\n## 数据库设计\n\n## 部署说明\n\n## 常见问题', 'markdown', '技术', 1, 1, 0),
(0, '周报模板', '工作周报模板', '# 工作周报\n\n**姓名**：\n**部门**：\n**周期**：\n\n## 本周工作完成情况\n| 序号 | 工作内容 | 完成情况 | 备注 |\n|------|----------|----------|------|\n| 1 | | | |\n| 2 | | | |\n\n## 下周工作计划\n| 序号 | 工作内容 | 预计完成时间 | 优先级 |\n|------|----------|--------------|--------|\n| 1 | | | |\n| 2 | | | |\n\n## 问题与建议\n\n## 需要的支持', 'markdown', '办公', 1, 1, 0);