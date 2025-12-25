-- =====================================================
-- V8.0 知识使用统计功能数据库设计
-- 包含：访问统计、热门排行、访问趋势、复用率、搜索热词、知识缺口
-- =====================================================

-- 1. 文档访问记录表
CREATE TABLE IF NOT EXISTS document_access_log (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    document_id BIGINT NOT NULL COMMENT '文档ID',
    user_id BIGINT NOT NULL COMMENT '访问用户ID',
    project_id BIGINT COMMENT '项目ID',
    
    -- 访问信息
    access_type VARCHAR(20) DEFAULT 'view' COMMENT '访问类型: view, download, share, copy, reference',
    access_source VARCHAR(50) COMMENT '访问来源: search, direct, recommendation, link',
    duration_seconds INT DEFAULT 0 COMMENT '停留时长（秒）',
    
    -- 设备信息
    device_type VARCHAR(20) COMMENT '设备类型: desktop, mobile, tablet',
    browser VARCHAR(50) COMMENT '浏览器',
    ip_address VARCHAR(50) COMMENT 'IP地址',
    
    -- 时间信息
    access_date DATE NOT NULL COMMENT '访问日期',
    access_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '访问时间',
    
    INDEX idx_document_id (document_id),
    INDEX idx_user_id (user_id),
    INDEX idx_project_id (project_id),
    INDEX idx_access_date (access_date),
    INDEX idx_access_type (access_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='文档访问记录表';

-- 2. 文档统计汇总表（按天汇总）
CREATE TABLE IF NOT EXISTS document_stats_daily (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    document_id BIGINT NOT NULL COMMENT '文档ID',
    stats_date DATE NOT NULL COMMENT '统计日期',
    
    -- 访问统计
    view_count INT DEFAULT 0 COMMENT '浏览次数',
    unique_visitors INT DEFAULT 0 COMMENT '独立访客数',
    download_count INT DEFAULT 0 COMMENT '下载次数',
    share_count INT DEFAULT 0 COMMENT '分享次数',
    copy_count INT DEFAULT 0 COMMENT '复制次数',
    reference_count INT DEFAULT 0 COMMENT '引用次数',
    
    -- 时长统计
    total_duration_seconds BIGINT DEFAULT 0 COMMENT '总停留时长（秒）',
    avg_duration_seconds INT DEFAULT 0 COMMENT '平均停留时长（秒）',
    
    -- 来源统计
    search_visits INT DEFAULT 0 COMMENT '搜索访问次数',
    direct_visits INT DEFAULT 0 COMMENT '直接访问次数',
    recommendation_visits INT DEFAULT 0 COMMENT '推荐访问次数',
    link_visits INT DEFAULT 0 COMMENT '链接访问次数',
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY uk_document_date (document_id, stats_date),
    INDEX idx_stats_date (stats_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='文档统计汇总表（按天）';

-- 3. 搜索记录表
CREATE TABLE IF NOT EXISTS search_log (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT COMMENT '搜索用户ID',
    project_id BIGINT COMMENT '项目ID',
    
    -- 搜索信息
    keyword VARCHAR(200) NOT NULL COMMENT '搜索关键词',
    search_type VARCHAR(20) DEFAULT 'document' COMMENT '搜索类型: document, knowledge, all',
    result_count INT DEFAULT 0 COMMENT '搜索结果数量',
    
    -- 点击信息
    clicked_document_id BIGINT COMMENT '点击的文档ID',
    click_position INT COMMENT '点击位置（排名）',
    
    -- 时间信息
    search_date DATE NOT NULL COMMENT '搜索日期',
    search_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '搜索时间',
    
    INDEX idx_user_id (user_id),
    INDEX idx_project_id (project_id),
    INDEX idx_keyword (keyword),
    INDEX idx_search_date (search_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='搜索记录表';

-- 4. 搜索热词统计表（按天汇总）
CREATE TABLE IF NOT EXISTS search_keyword_stats (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    keyword VARCHAR(200) NOT NULL COMMENT '搜索关键词',
    project_id BIGINT COMMENT '项目ID（NULL表示全局）',
    stats_date DATE NOT NULL COMMENT '统计日期',
    
    -- 统计数据
    search_count INT DEFAULT 0 COMMENT '搜索次数',
    unique_users INT DEFAULT 0 COMMENT '独立用户数',
    click_count INT DEFAULT 0 COMMENT '点击次数',
    avg_result_count DECIMAL(10,2) DEFAULT 0 COMMENT '平均结果数',
    
    -- 点击率
    click_rate DECIMAL(5,4) DEFAULT 0 COMMENT '点击率',
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY uk_keyword_project_date (keyword, project_id, stats_date),
    INDEX idx_stats_date (stats_date),
    INDEX idx_search_count (search_count DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='搜索热词统计表';

-- 5. 知识复用记录表
CREATE TABLE IF NOT EXISTS knowledge_reuse_log (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    source_document_id BIGINT NOT NULL COMMENT '源文档ID',
    target_document_id BIGINT COMMENT '目标文档ID',
    target_task_id BIGINT COMMENT '目标任务ID',
    target_project_id BIGINT COMMENT '目标项目ID',
    user_id BIGINT NOT NULL COMMENT '复用用户ID',
    
    -- 复用信息
    reuse_type VARCHAR(20) NOT NULL COMMENT '复用类型: copy, reference, template, quote',
    reuse_content TEXT COMMENT '复用内容摘要',
    content_length INT DEFAULT 0 COMMENT '复用内容长度',
    
    -- 时间信息
    reuse_date DATE NOT NULL COMMENT '复用日期',
    reuse_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '复用时间',
    
    INDEX idx_source_document (source_document_id),
    INDEX idx_target_document (target_document_id),
    INDEX idx_user_id (user_id),
    INDEX idx_reuse_date (reuse_date),
    INDEX idx_reuse_type (reuse_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='知识复用记录表';

-- 6. 知识复用统计表（按文档汇总）
CREATE TABLE IF NOT EXISTS knowledge_reuse_stats (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    document_id BIGINT NOT NULL COMMENT '文档ID',
    stats_month VARCHAR(7) NOT NULL COMMENT '统计月份（YYYY-MM）',
    
    -- 复用统计
    total_reuse_count INT DEFAULT 0 COMMENT '总复用次数',
    copy_count INT DEFAULT 0 COMMENT '复制次数',
    reference_count INT DEFAULT 0 COMMENT '引用次数',
    template_count INT DEFAULT 0 COMMENT '模板使用次数',
    quote_count INT DEFAULT 0 COMMENT '引述次数',
    
    -- 复用用户
    unique_users INT DEFAULT 0 COMMENT '独立复用用户数',
    
    -- 复用率
    reuse_rate DECIMAL(5,4) DEFAULT 0 COMMENT '复用率（复用次数/访问次数）',
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY uk_document_month (document_id, stats_month),
    INDEX idx_stats_month (stats_month),
    INDEX idx_reuse_count (total_reuse_count DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='知识复用统计表';

-- 7. 知识缺口记录表
CREATE TABLE IF NOT EXISTS knowledge_gap (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    project_id BIGINT COMMENT '项目ID',
    
    -- 缺口信息
    gap_type VARCHAR(20) NOT NULL COMMENT '缺口类型: search_no_result, frequent_question, missing_topic',
    keyword VARCHAR(200) COMMENT '相关关键词',
    description TEXT COMMENT '缺口描述',
    
    -- 统计信息
    occurrence_count INT DEFAULT 1 COMMENT '出现次数',
    affected_users INT DEFAULT 1 COMMENT '影响用户数',
    
    -- 状态
    status VARCHAR(20) DEFAULT 'open' COMMENT '状态: open, in_progress, resolved, ignored',
    priority VARCHAR(10) DEFAULT 'medium' COMMENT '优先级: low, medium, high, critical',
    
    -- 解决信息
    resolved_by BIGINT COMMENT '解决者ID',
    resolved_document_id BIGINT COMMENT '解决文档ID',
    resolved_at DATETIME COMMENT '解决时间',
    resolution_note TEXT COMMENT '解决说明',
    
    -- 时间信息
    first_occurred_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '首次出现时间',
    last_occurred_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '最后出现时间',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_project_id (project_id),
    INDEX idx_gap_type (gap_type),
    INDEX idx_status (status),
    INDEX idx_priority (priority),
    INDEX idx_occurrence_count (occurrence_count DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='知识缺口记录表';

-- 8. 知识统计概览表（项目级别）
CREATE TABLE IF NOT EXISTS knowledge_stats_overview (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    project_id BIGINT COMMENT '项目ID（NULL表示全局）',
    stats_date DATE NOT NULL COMMENT '统计日期',
    
    -- 文档统计
    total_documents INT DEFAULT 0 COMMENT '总文档数',
    new_documents INT DEFAULT 0 COMMENT '新增文档数',
    updated_documents INT DEFAULT 0 COMMENT '更新文档数',
    
    -- 访问统计
    total_views INT DEFAULT 0 COMMENT '总浏览量',
    unique_visitors INT DEFAULT 0 COMMENT '独立访客数',
    avg_duration_seconds INT DEFAULT 0 COMMENT '平均停留时长',
    
    -- 搜索统计
    total_searches INT DEFAULT 0 COMMENT '总搜索次数',
    search_success_rate DECIMAL(5,4) DEFAULT 0 COMMENT '搜索成功率',
    
    -- 复用统计
    total_reuses INT DEFAULT 0 COMMENT '总复用次数',
    reuse_rate DECIMAL(5,4) DEFAULT 0 COMMENT '整体复用率',
    
    -- 知识缺口
    open_gaps INT DEFAULT 0 COMMENT '未解决缺口数',
    resolved_gaps INT DEFAULT 0 COMMENT '已解决缺口数',
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY uk_project_date (project_id, stats_date),
    INDEX idx_stats_date (stats_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='知识统计概览表';

-- 9. 热门文档排行表（缓存表，定期更新）
CREATE TABLE IF NOT EXISTS document_ranking (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    document_id BIGINT NOT NULL COMMENT '文档ID',
    project_id BIGINT COMMENT '项目ID',
    ranking_type VARCHAR(20) NOT NULL COMMENT '排行类型: daily, weekly, monthly, all_time',
    ranking_date DATE NOT NULL COMMENT '排行日期',
    
    -- 排名信息
    rank_position INT NOT NULL COMMENT '排名位置',
    score DECIMAL(15,4) DEFAULT 0 COMMENT '综合得分',
    
    -- 统计数据
    view_count INT DEFAULT 0 COMMENT '浏览次数',
    unique_visitors INT DEFAULT 0 COMMENT '独立访客数',
    reuse_count INT DEFAULT 0 COMMENT '复用次数',
    like_count INT DEFAULT 0 COMMENT '点赞数',
    comment_count INT DEFAULT 0 COMMENT '评论数',
    
    -- 变化趋势
    rank_change INT DEFAULT 0 COMMENT '排名变化（正数上升，负数下降）',
    view_change_rate DECIMAL(5,4) DEFAULT 0 COMMENT '浏览量变化率',
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY uk_document_type_date (document_id, ranking_type, ranking_date),
    INDEX idx_ranking_type_date (ranking_type, ranking_date),
    INDEX idx_rank_position (rank_position),
    INDEX idx_project_id (project_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='热门文档排行表';

-- 插入一些测试数据
INSERT INTO knowledge_gap (project_id, gap_type, keyword, description, occurrence_count, affected_users, priority) VALUES
(1, 'search_no_result', 'API接口文档', '用户频繁搜索API接口相关文档但无结果', 15, 8, 'high'),
(1, 'frequent_question', '部署流程', '多次被问到项目部署流程相关问题', 12, 6, 'high'),
(1, 'missing_topic', '性能优化', '缺少性能优化相关的知识文档', 8, 5, 'medium'),
(NULL, 'search_no_result', '新员工入职', '新员工入职指南搜索无结果', 20, 15, 'critical'),
(NULL, 'missing_topic', '代码规范', '缺少统一的代码规范文档', 10, 7, 'medium');