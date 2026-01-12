-- =====================================================
-- 日历服务数据库表结构
-- =====================================================

-- 日历表
CREATE TABLE IF NOT EXISTS `calendar` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '日历ID',
    `tenant_id` BIGINT NOT NULL COMMENT '租户ID',
    `user_id` BIGINT NOT NULL COMMENT '所有者用户ID',
    `name` VARCHAR(100) NOT NULL COMMENT '日历名称',
    `description` VARCHAR(500) COMMENT '日历描述',
    `type` VARCHAR(20) NOT NULL DEFAULT 'personal' COMMENT '日历类型: personal/work/project/team/shared/holiday',
    `color` VARCHAR(20) DEFAULT '#1890ff' COMMENT '日历颜色',
    `icon` VARCHAR(50) COMMENT '日历图标',
    `is_default` TINYINT(1) DEFAULT 0 COMMENT '是否默认日历',
    `is_visible` TINYINT(1) DEFAULT 1 COMMENT '是否可见',
    `sort_order` INT DEFAULT 0 COMMENT '排序顺序',
    `project_id` BIGINT COMMENT '关联项目ID（项目日历）',
    `team_id` BIGINT COMMENT '关联团队ID（团队日历）',
    `timezone` VARCHAR(50) DEFAULT 'Asia/Shanghai' COMMENT '时区',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_tenant_id` (`tenant_id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_type` (`type`),
    KEY `idx_project_id` (`project_id`),
    KEY `idx_team_id` (`team_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='日历表';

-- 日历事件表
CREATE TABLE IF NOT EXISTS `calendar_event` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '事件ID',
    `tenant_id` BIGINT NOT NULL COMMENT '租户ID',
    `calendar_id` BIGINT COMMENT '所属日历ID',
    `title` VARCHAR(200) NOT NULL COMMENT '事件标题',
    `description` TEXT COMMENT '事件描述',
    `event_type` VARCHAR(30) DEFAULT 'meeting' COMMENT '事件类型: meeting/task/milestone/reminder/deadline/birthday/holiday/other',
    `category` VARCHAR(30) COMMENT '事件分类: work/personal/family/social',
    `start_time` DATETIME NOT NULL COMMENT '开始时间',
    `end_time` DATETIME NOT NULL COMMENT '结束时间',
    `all_day` TINYINT(1) DEFAULT 0 COMMENT '是否全天事件',
    `location` VARCHAR(200) COMMENT '地点',
    `meeting_url` VARCHAR(500) COMMENT '会议链接',
    `color` VARCHAR(20) COMMENT '事件颜色',
    `recurrence_rule` VARCHAR(30) DEFAULT 'none' COMMENT '重复规则: none/daily/weekly/biweekly/monthly/yearly/custom',
    `recurrence_pattern` VARCHAR(500) COMMENT '重复模式（RRULE格式）',
    `recurrence_end_date` DATE COMMENT '重复结束日期',
    `parent_event_id` BIGINT COMMENT '父事件ID（重复事件的实例）',
    `busy_status` VARCHAR(20) DEFAULT 'busy' COMMENT '忙碌状态: free/busy/tentative/outOfOffice',
    `priority` VARCHAR(10) DEFAULT 'normal' COMMENT '优先级: low/normal/high',
    `visibility` VARCHAR(20) DEFAULT 'private' COMMENT '可见性: private/public/confidential',
    `status` VARCHAR(20) DEFAULT 'active' COMMENT '状态: active/cancelled/completed',
    `creator_id` BIGINT NOT NULL COMMENT '创建者ID',
    `project_id` BIGINT COMMENT '关联项目ID',
    `task_id` BIGINT COMMENT '关联任务ID',
    `milestone_id` BIGINT COMMENT '关联里程碑ID',
    `meeting_id` BIGINT COMMENT '关联会议ID',
    `external_id` VARCHAR(200) COMMENT '外部日历事件ID',
    `external_source` VARCHAR(50) COMMENT '外部来源: google/outlook/apple/exchange',
    `last_sync_time` DATETIME COMMENT '最后同步时间',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_tenant_id` (`tenant_id`),
    KEY `idx_calendar_id` (`calendar_id`),
    KEY `idx_creator_id` (`creator_id`),
    KEY `idx_start_time` (`start_time`),
    KEY `idx_end_time` (`end_time`),
    KEY `idx_project_id` (`project_id`),
    KEY `idx_task_id` (`task_id`),
    KEY `idx_milestone_id` (`milestone_id`),
    KEY `idx_meeting_id` (`meeting_id`),
    KEY `idx_external_id` (`external_id`),
    KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='日历事件表';

-- 日历事件参与者表
CREATE TABLE IF NOT EXISTS `calendar_event_attendee` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '参与者ID',
    `event_id` BIGINT NOT NULL COMMENT '事件ID',
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `email` VARCHAR(100) COMMENT '邮箱（外部参与者）',
    `name` VARCHAR(50) COMMENT '姓名（外部参与者）',
    `status` VARCHAR(20) DEFAULT 'pending' COMMENT '响应状态: pending/accepted/declined/tentative',
    `is_optional` TINYINT(1) DEFAULT 0 COMMENT '是否可选参与者',
    `is_organizer` TINYINT(1) DEFAULT 0 COMMENT '是否组织者',
    `response_time` DATETIME COMMENT '响应时间',
    `comment` VARCHAR(500) COMMENT '响应备注',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_event_user` (`event_id`, `user_id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='日历事件参与者表';

-- 日历共享表
CREATE TABLE IF NOT EXISTS `calendar_share` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '共享ID',
    `calendar_id` BIGINT NOT NULL COMMENT '日历ID',
    `share_type` VARCHAR(20) NOT NULL COMMENT '共享类型: user/team/department/all',
    `share_target_id` BIGINT NOT NULL COMMENT '共享目标ID（用户/团队/部门ID，all时为0）',
    `permission` VARCHAR(20) NOT NULL DEFAULT 'view' COMMENT '权限: view/edit/manage',
    `shared_by` BIGINT NOT NULL COMMENT '共享者ID',
    `status` VARCHAR(20) DEFAULT 'active' COMMENT '状态: pending/accepted/rejected/active',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_calendar_id` (`calendar_id`),
    KEY `idx_share_type_target` (`share_type`, `share_target_id`),
    KEY `idx_shared_by` (`shared_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='日历共享表';

-- 事件提醒表
CREATE TABLE IF NOT EXISTS `event_reminder` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '提醒ID',
    `event_id` BIGINT NOT NULL COMMENT '事件ID',
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `reminder_type` VARCHAR(20) NOT NULL DEFAULT 'notification' COMMENT '提醒类型: notification/email/sms/push',
    `reminder_minutes` INT NOT NULL DEFAULT 15 COMMENT '提前提醒分钟数',
    `remind_time` DATETIME NOT NULL COMMENT '提醒时间',
    `status` VARCHAR(20) DEFAULT 'pending' COMMENT '状态: pending/sent/failed',
    `sent_time` DATETIME COMMENT '发送时间',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_event_id` (`event_id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_remind_time` (`remind_time`),
    KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='事件提醒表';

-- 日历配置表
CREATE TABLE IF NOT EXISTS `calendar_config` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '配置ID',
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `tenant_id` BIGINT NOT NULL COMMENT '租户ID',
    `default_view` VARCHAR(20) DEFAULT 'week' COMMENT '默认视图: day/week/month/agenda',
    `week_start_day` INT DEFAULT 1 COMMENT '周起始日: 0=周日, 1=周一',
    `work_hours_start` TIME DEFAULT '09:00:00' COMMENT '工作时间开始',
    `work_hours_end` TIME DEFAULT '18:00:00' COMMENT '工作时间结束',
    `work_days` VARCHAR(20) DEFAULT '1,2,3,4,5' COMMENT '工作日（逗号分隔）',
    `default_event_duration` INT DEFAULT 60 COMMENT '默认事件时长（分钟）',
    `default_reminder_minutes` INT DEFAULT 15 COMMENT '默认提醒时间（分钟）',
    `show_weekends` TINYINT(1) DEFAULT 1 COMMENT '是否显示周末',
    `show_declined_events` TINYINT(1) DEFAULT 0 COMMENT '是否显示已拒绝的事件',
    `timezone` VARCHAR(50) DEFAULT 'Asia/Shanghai' COMMENT '时区',
    `date_format` VARCHAR(20) DEFAULT 'YYYY-MM-DD' COMMENT '日期格式',
    `time_format` VARCHAR(10) DEFAULT '24h' COMMENT '时间格式: 12h/24h',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_user_tenant` (`user_id`, `tenant_id`),
    KEY `idx_tenant_id` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='日历配置表';

-- 日历订阅表
CREATE TABLE IF NOT EXISTS `calendar_subscription` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '订阅ID',
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `tenant_id` BIGINT NOT NULL COMMENT '租户ID',
    `name` VARCHAR(100) NOT NULL COMMENT '订阅名称',
    `url` VARCHAR(500) NOT NULL COMMENT '订阅URL（iCal格式）',
    `source_type` VARCHAR(30) COMMENT '来源类型: google/outlook/apple/exchange/ical/other',
    `color` VARCHAR(20) DEFAULT '#1890ff' COMMENT '显示颜色',
    `is_active` TINYINT(1) DEFAULT 1 COMMENT '是否启用',
    `sync_interval` INT DEFAULT 60 COMMENT '同步间隔（分钟）',
    `last_sync_time` DATETIME COMMENT '最后同步时间',
    `last_sync_status` VARCHAR(20) COMMENT '最后同步状态: success/failed',
    `last_sync_error` VARCHAR(500) COMMENT '最后同步错误信息',
    `event_count` INT DEFAULT 0 COMMENT '事件数量',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_tenant_id` (`tenant_id`),
    KEY `idx_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='日历订阅表';

-- 外部日历同步记录表
CREATE TABLE IF NOT EXISTS `calendar_sync_log` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '日志ID',
    `calendar_id` BIGINT COMMENT '日历ID',
    `subscription_id` BIGINT COMMENT '订阅ID',
    `sync_type` VARCHAR(20) NOT NULL COMMENT '同步类型: import/export/sync',
    `sync_direction` VARCHAR(10) NOT NULL COMMENT '同步方向: in/out/both',
    `source` VARCHAR(50) COMMENT '来源: google/outlook/apple/exchange/ical',
    `status` VARCHAR(20) NOT NULL COMMENT '状态: running/success/failed',
    `events_added` INT DEFAULT 0 COMMENT '新增事件数',
    `events_updated` INT DEFAULT 0 COMMENT '更新事件数',
    `events_deleted` INT DEFAULT 0 COMMENT '删除事件数',
    `error_message` TEXT COMMENT '错误信息',
    `start_time` DATETIME NOT NULL COMMENT '开始时间',
    `end_time` DATETIME COMMENT '结束时间',
    `created_by` BIGINT COMMENT '操作人ID',
    PRIMARY KEY (`id`),
    KEY `idx_calendar_id` (`calendar_id`),
    KEY `idx_subscription_id` (`subscription_id`),
    KEY `idx_status` (`status`),
    KEY `idx_start_time` (`start_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='日历同步日志表';

-- 初始化节假日日历数据
INSERT INTO `calendar` (`tenant_id`, `user_id`, `name`, `description`, `type`, `color`, `is_default`, `is_visible`, `sort_order`)
VALUES (0, 0, '中国法定节假日', '中国法定节假日日历', 'holiday', '#f5222d', 0, 1, 1000);