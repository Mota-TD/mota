-- =====================================================
-- 智能新闻推送模块数据库脚本
-- 版本: V10.0
-- 功能: NW-001到NW-009 智能新闻推送完整功能
-- =====================================================

-- 1. 企业行业配置表 (NW-001 行业识别)
CREATE TABLE IF NOT EXISTS news_enterprise_industry (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    team_id BIGINT NOT NULL COMMENT '团队ID',
    industry_code VARCHAR(50) NOT NULL COMMENT '行业代码',
    industry_name VARCHAR(100) NOT NULL COMMENT '行业名称',
    parent_industry_code VARCHAR(50) COMMENT '父行业代码',
    confidence DECIMAL(5,2) DEFAULT 100 COMMENT '识别置信度(0-100)',
    is_primary TINYINT(1) DEFAULT 0 COMMENT '是否主行业',
    is_auto_detected TINYINT(1) DEFAULT 0 COMMENT '是否AI自动识别',
    detection_source VARCHAR(100) COMMENT '识别来源(manual/ai/import)',
    keywords JSON COMMENT '行业关键词',
    description TEXT COMMENT '行业描述',
    creator_id BIGINT NOT NULL COMMENT '创建者ID',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_team_id (team_id),
    INDEX idx_industry_code (industry_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='企业行业配置表';

-- 2. 企业业务领域表 (NW-002 业务理解)
CREATE TABLE IF NOT EXISTS news_business_domain (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    team_id BIGINT NOT NULL COMMENT '团队ID',
    domain_name VARCHAR(100) NOT NULL COMMENT '业务领域名称',
    domain_type VARCHAR(50) COMMENT '领域类型(product/service/market/technology)',
    keywords JSON COMMENT '领域关键词',
    description TEXT COMMENT '领域描述',
    importance INT DEFAULT 5 COMMENT '重要程度(1-10)',
    is_core TINYINT(1) DEFAULT 0 COMMENT '是否核心业务',
    related_industries JSON COMMENT '关联行业',
    competitors JSON COMMENT '竞争对手',
    target_customers JSON COMMENT '目标客户',
    creator_id BIGINT NOT NULL COMMENT '创建者ID',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_team_id (team_id),
    INDEX idx_domain_type (domain_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='企业业务领域表';

-- 3. 新闻数据源表 (NW-003 新闻采集)
CREATE TABLE IF NOT EXISTS news_data_source (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    source_name VARCHAR(100) NOT NULL COMMENT '数据源名称',
    source_type VARCHAR(50) NOT NULL COMMENT '数据源类型(rss/api/crawler/manual)',
    source_url VARCHAR(500) COMMENT '数据源URL',
    api_endpoint VARCHAR(500) COMMENT 'API端点',
    api_key_encrypted VARCHAR(500) COMMENT '加密的API密钥',
    crawl_config JSON COMMENT '爬虫配置',
    category VARCHAR(50) COMMENT '新闻分类',
    language VARCHAR(20) DEFAULT 'zh' COMMENT '语言',
    country VARCHAR(20) DEFAULT 'CN' COMMENT '国家/地区',
    update_frequency INT DEFAULT 60 COMMENT '更新频率(分钟)',
    last_crawl_at DATETIME COMMENT '上次采集时间',
    next_crawl_at DATETIME COMMENT '下次采集时间',
    is_enabled TINYINT(1) DEFAULT 1 COMMENT '是否启用',
    priority INT DEFAULT 5 COMMENT '优先级(1-10)',
    reliability_score DECIMAL(5,2) DEFAULT 80 COMMENT '可靠性评分',
    total_articles INT DEFAULT 0 COMMENT '总文章数',
    creator_id BIGINT NOT NULL COMMENT '创建者ID',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_source_type (source_type),
    INDEX idx_category (category),
    INDEX idx_is_enabled (is_enabled)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='新闻数据源表';

-- 4. 新闻文章表 (NW-003 新闻采集)
CREATE TABLE IF NOT EXISTS news_article (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    source_id BIGINT COMMENT '数据源ID',
    external_id VARCHAR(200) COMMENT '外部ID(用于去重)',
    title VARCHAR(500) NOT NULL COMMENT '新闻标题',
    content LONGTEXT COMMENT '新闻内容',
    summary TEXT COMMENT '新闻摘要',
    author VARCHAR(100) COMMENT '作者',
    source_name VARCHAR(100) COMMENT '来源名称',
    source_url VARCHAR(1000) COMMENT '原文链接',
    image_url VARCHAR(1000) COMMENT '封面图片',
    images JSON COMMENT '图片列表',
    category VARCHAR(50) COMMENT '分类',
    tags JSON COMMENT '标签',
    keywords JSON COMMENT '关键词(AI提取)',
    entities JSON COMMENT '实体(AI提取)',
    publish_time DATETIME COMMENT '发布时间',
    crawl_time DATETIME COMMENT '采集时间',
    language VARCHAR(20) DEFAULT 'zh' COMMENT '语言',
    word_count INT DEFAULT 0 COMMENT '字数',
    read_time INT DEFAULT 0 COMMENT '预计阅读时间(秒)',
    sentiment VARCHAR(20) COMMENT '情感倾向(positive/negative/neutral)',
    sentiment_score DECIMAL(5,2) COMMENT '情感分数',
    importance_score DECIMAL(5,2) COMMENT '重要性评分',
    quality_score DECIMAL(5,2) COMMENT '质量评分',
    is_policy TINYINT(1) DEFAULT 0 COMMENT '是否政策文件',
    policy_level VARCHAR(50) COMMENT '政策级别(national/provincial/municipal)',
    policy_type VARCHAR(50) COMMENT '政策类型',
    view_count INT DEFAULT 0 COMMENT '浏览次数',
    share_count INT DEFAULT 0 COMMENT '分享次数',
    favorite_count INT DEFAULT 0 COMMENT '收藏次数',
    status VARCHAR(20) DEFAULT 'active' COMMENT '状态(active/archived/deleted)',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE INDEX uk_external_id (source_id, external_id),
    INDEX idx_source_id (source_id),
    INDEX idx_category (category),
    INDEX idx_publish_time (publish_time),
    INDEX idx_is_policy (is_policy),
    INDEX idx_status (status),
    FULLTEXT INDEX ft_content (title, content, summary)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='新闻文章表';

-- 5. 政策监控配置表 (NW-004 政策监控)
CREATE TABLE IF NOT EXISTS news_policy_monitor (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    team_id BIGINT NOT NULL COMMENT '团队ID',
    monitor_name VARCHAR(100) NOT NULL COMMENT '监控名称',
    policy_types JSON COMMENT '监控的政策类型',
    policy_levels JSON COMMENT '监控的政策级别',
    keywords JSON COMMENT '监控关键词',
    industries JSON COMMENT '关联行业',
    regions JSON COMMENT '监控地区',
    departments JSON COMMENT '监控部门',
    is_enabled TINYINT(1) DEFAULT 1 COMMENT '是否启用',
    alert_enabled TINYINT(1) DEFAULT 1 COMMENT '是否开启提醒',
    alert_channels JSON COMMENT '提醒渠道(email/push/sms)',
    last_check_at DATETIME COMMENT '上次检查时间',
    matched_count INT DEFAULT 0 COMMENT '匹配数量',
    creator_id BIGINT NOT NULL COMMENT '创建者ID',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_team_id (team_id),
    INDEX idx_is_enabled (is_enabled)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='政策监控配置表';

-- 6. 新闻匹配记录表 (NW-005 智能匹配)
CREATE TABLE IF NOT EXISTS news_match_record (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    article_id BIGINT NOT NULL COMMENT '文章ID',
    team_id BIGINT COMMENT '团队ID',
    user_id BIGINT COMMENT '用户ID',
    match_type VARCHAR(50) NOT NULL COMMENT '匹配类型(industry/keyword/semantic/policy)',
    match_score DECIMAL(5,2) NOT NULL COMMENT '匹配分数(0-100)',
    matched_keywords JSON COMMENT '匹配的关键词',
    matched_industries JSON COMMENT '匹配的行业',
    matched_domains JSON COMMENT '匹配的业务领域',
    semantic_similarity DECIMAL(5,4) COMMENT '语义相似度',
    relevance_reason TEXT COMMENT '相关性原因',
    is_recommended TINYINT(1) DEFAULT 0 COMMENT '是否推荐',
    recommendation_rank INT COMMENT '推荐排名',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_article_id (article_id),
    INDEX idx_team_id (team_id),
    INDEX idx_user_id (user_id),
    INDEX idx_match_score (match_score),
    INDEX idx_is_recommended (is_recommended)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='新闻匹配记录表';

-- 7. 用户新闻偏好表 (NW-006 个性化推送)
CREATE TABLE IF NOT EXISTS news_user_preference (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    team_id BIGINT COMMENT '团队ID',
    role VARCHAR(50) COMMENT '用户角色',
    preferred_categories JSON COMMENT '偏好分类',
    preferred_sources JSON COMMENT '偏好来源',
    preferred_keywords JSON COMMENT '偏好关键词',
    blocked_keywords JSON COMMENT '屏蔽关键词',
    blocked_sources JSON COMMENT '屏蔽来源',
    interest_industries JSON COMMENT '感兴趣的行业',
    interest_topics JSON COMMENT '感兴趣的话题',
    reading_level VARCHAR(20) DEFAULT 'normal' COMMENT '阅读深度(brief/normal/detailed)',
    content_language VARCHAR(20) DEFAULT 'zh' COMMENT '内容语言偏好',
    min_quality_score DECIMAL(5,2) DEFAULT 60 COMMENT '最低质量分数',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE INDEX uk_user_id (user_id),
    INDEX idx_team_id (team_id),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户新闻偏好表';

-- 8. 推送配置表 (NW-007 推送优化)
CREATE TABLE IF NOT EXISTS news_push_config (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    team_id BIGINT COMMENT '团队ID',
    push_enabled TINYINT(1) DEFAULT 1 COMMENT '是否开启推送',
    push_channels JSON COMMENT '推送渠道(email/app/wechat/dingtalk)',
    push_frequency VARCHAR(20) DEFAULT 'daily' COMMENT '推送频率(realtime/hourly/daily/weekly)',
    push_time VARCHAR(10) COMMENT '推送时间(HH:mm)',
    push_days JSON COMMENT '推送日期(周几)',
    timezone VARCHAR(50) DEFAULT 'Asia/Shanghai' COMMENT '时区',
    max_articles_per_push INT DEFAULT 10 COMMENT '每次推送最大文章数',
    min_match_score DECIMAL(5,2) DEFAULT 70 COMMENT '最低匹配分数',
    include_summary TINYINT(1) DEFAULT 1 COMMENT '是否包含摘要',
    include_image TINYINT(1) DEFAULT 1 COMMENT '是否包含图片',
    quiet_hours_start VARCHAR(10) COMMENT '免打扰开始时间',
    quiet_hours_end VARCHAR(10) COMMENT '免打扰结束时间',
    last_push_at DATETIME COMMENT '上次推送时间',
    next_push_at DATETIME COMMENT '下次推送时间',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE INDEX uk_user_id (user_id),
    INDEX idx_team_id (team_id),
    INDEX idx_next_push_at (next_push_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='推送配置表';

-- 9. 推送记录表 (NW-007 推送优化)
CREATE TABLE IF NOT EXISTS news_push_record (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    team_id BIGINT COMMENT '团队ID',
    push_channel VARCHAR(50) NOT NULL COMMENT '推送渠道',
    push_type VARCHAR(50) DEFAULT 'scheduled' COMMENT '推送类型(scheduled/manual/realtime)',
    article_ids JSON COMMENT '推送的文章ID列表',
    article_count INT DEFAULT 0 COMMENT '文章数量',
    push_title VARCHAR(200) COMMENT '推送标题',
    push_content TEXT COMMENT '推送内容',
    push_status VARCHAR(20) DEFAULT 'pending' COMMENT '推送状态(pending/sent/failed)',
    sent_at DATETIME COMMENT '发送时间',
    opened_at DATETIME COMMENT '打开时间',
    click_count INT DEFAULT 0 COMMENT '点击次数',
    error_message TEXT COMMENT '错误信息',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_user_id (user_id),
    INDEX idx_team_id (team_id),
    INDEX idx_push_status (push_status),
    INDEX idx_sent_at (sent_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='推送记录表';

-- 10. 新闻收藏表 (NW-008 新闻收藏)
CREATE TABLE IF NOT EXISTS news_favorite (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    article_id BIGINT NOT NULL COMMENT '文章ID',
    folder_id BIGINT COMMENT '收藏夹ID',
    note TEXT COMMENT '备注',
    tags JSON COMMENT '自定义标签',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    UNIQUE INDEX uk_user_article (user_id, article_id),
    INDEX idx_folder_id (folder_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='新闻收藏表';

-- 11. 收藏夹表 (NW-008 新闻收藏)
CREATE TABLE IF NOT EXISTS news_favorite_folder (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    folder_name VARCHAR(100) NOT NULL COMMENT '收藏夹名称',
    description TEXT COMMENT '描述',
    is_default TINYINT(1) DEFAULT 0 COMMENT '是否默认收藏夹',
    article_count INT DEFAULT 0 COMMENT '文章数量',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='收藏夹表';

-- 12. 新闻分类表 (NW-009 新闻分类)
CREATE TABLE IF NOT EXISTS news_category (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    category_code VARCHAR(50) NOT NULL COMMENT '分类代码',
    category_name VARCHAR(100) NOT NULL COMMENT '分类名称',
    parent_id BIGINT DEFAULT 0 COMMENT '父分类ID',
    level INT DEFAULT 1 COMMENT '层级',
    path VARCHAR(500) COMMENT '分类路径',
    icon VARCHAR(100) COMMENT '图标',
    color VARCHAR(20) COMMENT '颜色',
    description TEXT COMMENT '描述',
    keywords JSON COMMENT '分类关键词',
    sort_order INT DEFAULT 0 COMMENT '排序',
    is_system TINYINT(1) DEFAULT 0 COMMENT '是否系统分类',
    is_enabled TINYINT(1) DEFAULT 1 COMMENT '是否启用',
    article_count INT DEFAULT 0 COMMENT '文章数量',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE INDEX uk_category_code (category_code),
    INDEX idx_parent_id (parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='新闻分类表';

-- 13. 用户阅读记录表
CREATE TABLE IF NOT EXISTS news_reading_record (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    article_id BIGINT NOT NULL COMMENT '文章ID',
    read_duration INT DEFAULT 0 COMMENT '阅读时长(秒)',
    read_progress DECIMAL(5,2) DEFAULT 0 COMMENT '阅读进度(0-100)',
    is_finished TINYINT(1) DEFAULT 0 COMMENT '是否读完',
    source VARCHAR(50) COMMENT '来源(push/search/recommend/browse)',
    device VARCHAR(50) COMMENT '设备类型',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_user_id (user_id),
    INDEX idx_article_id (article_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户阅读记录表';

-- 14. 新闻采集任务表
CREATE TABLE IF NOT EXISTS news_crawl_task (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    source_id BIGINT NOT NULL COMMENT '数据源ID',
    task_type VARCHAR(50) DEFAULT 'scheduled' COMMENT '任务类型(scheduled/manual)',
    status VARCHAR(20) DEFAULT 'pending' COMMENT '状态(pending/running/completed/failed)',
    started_at DATETIME COMMENT '开始时间',
    completed_at DATETIME COMMENT '完成时间',
    total_articles INT DEFAULT 0 COMMENT '采集文章数',
    new_articles INT DEFAULT 0 COMMENT '新增文章数',
    updated_articles INT DEFAULT 0 COMMENT '更新文章数',
    failed_articles INT DEFAULT 0 COMMENT '失败文章数',
    error_message TEXT COMMENT '错误信息',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_source_id (source_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='新闻采集任务表';

-- =====================================================
-- 初始化数据
-- =====================================================

-- 插入默认新闻分类
INSERT INTO news_category (category_code, category_name, parent_id, level, path, icon, color, is_system, sort_order) VALUES
('technology', '科技', 0, 1, '/technology', 'RobotOutlined', '#1890ff', 1, 1),
('industry', '行业动态', 0, 1, '/industry', 'GlobalOutlined', '#52c41a', 1, 2),
('policy', '政策法规', 0, 1, '/policy', 'FileTextOutlined', '#faad14', 1, 3),
('finance', '财经', 0, 1, '/finance', 'DollarOutlined', '#f5222d', 1, 4),
('market', '市场分析', 0, 1, '/market', 'LineChartOutlined', '#722ed1', 1, 5),
('management', '企业管理', 0, 1, '/management', 'TeamOutlined', '#13c2c2', 1, 6),
('innovation', '创新创业', 0, 1, '/innovation', 'BulbOutlined', '#eb2f96', 1, 7),
('international', '国际资讯', 0, 1, '/international', 'GlobalOutlined', '#2f54eb', 1, 8);

-- 插入科技子分类
INSERT INTO news_category (category_code, category_name, parent_id, level, path, is_system, sort_order) VALUES
('tech_ai', '人工智能', 1, 2, '/technology/ai', 1, 1),
('tech_cloud', '云计算', 1, 2, '/technology/cloud', 1, 2),
('tech_bigdata', '大数据', 1, 2, '/technology/bigdata', 1, 3),
('tech_blockchain', '区块链', 1, 2, '/technology/blockchain', 1, 4),
('tech_iot', '物联网', 1, 2, '/technology/iot', 1, 5);

-- 插入默认新闻数据源
INSERT INTO news_data_source (source_name, source_type, source_url, category, update_frequency, priority, reliability_score, creator_id) VALUES
('36氪', 'rss', 'https://36kr.com/feed', 'technology', 30, 8, 90, 1),
('虎嗅', 'rss', 'https://www.huxiu.com/rss/0.xml', 'technology', 30, 8, 88, 1),
('钛媒体', 'rss', 'https://www.tmtpost.com/rss.xml', 'technology', 30, 7, 85, 1),
('亿欧网', 'api', 'https://www.iyiou.com/api/news', 'industry', 60, 7, 82, 1),
('艾瑞咨询', 'crawler', 'https://www.iresearch.cn', 'market', 120, 6, 90, 1),
('国务院政策', 'crawler', 'http://www.gov.cn/zhengce/', 'policy', 60, 9, 100, 1),
('工信部', 'crawler', 'https://www.miit.gov.cn/', 'policy', 60, 9, 100, 1);

-- =====================================================
-- 完成
-- =====================================================