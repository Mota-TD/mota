-- Mota项目测试数据
-- UTF-8编码

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- 用户数据
INSERT INTO sys_user (id, username, email, phone, password_hash, nickname, status, org_id, org_name) VALUES
(1, 'admin', 'admin@mota.ai', '13800000001', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', '管理员', 1, 'default', '默认组织'),
(2, 'zhangsan', 'zhangsan@mota.ai', '13800000002', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', '张三', 1, 'default', '默认组织'),
(3, 'lisi', 'lisi@mota.ai', '13800000003', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', '李四', 1, 'default', '默认组织'),
(4, 'wangwu', 'wangwu@mota.ai', '13800000004', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', '王五', 1, 'default', '默认组织'),
(5, 'zhaoliu', 'zhaoliu@mota.ai', '13800000005', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', '赵六', 1, 'default', '默认组织')
ON CONFLICT (username) DO UPDATE SET nickname = EXCLUDED.nickname;

-- 项目数据
INSERT INTO project (id, org_id, name, `key`, description, status, owner_id, color, starred, progress, member_count, issue_count) VALUES
(1, 'default', 'Mota智能平台', 'MOTA', 'Mota AI智能企业解决方案平台开发', 'active', 1, '#1677ff', 1, 65, 5, 24),
(2, 'default', '官网改版项目', 'WEB', '公司官方网站全面改版升级项目', 'active', 2, '#52c41a', 0, 40, 3, 12),
(3, 'default', '移动端应用', 'APP', '企业移动端应用程序开发', 'active', 3, '#722ed1', 1, 25, 4, 18),
(4, 'default', '数据分析平台', 'DATA', '企业级数据分析与可视化平台', 'completed', 1, '#fa8c16', 0, 100, 3, 8);

-- 项目成员
INSERT INTO project_member (project_id, user_id, role) VALUES
(1, 1, 'owner'), (1, 2, 'developer'), (1, 3, 'developer'), (1, 4, 'tester'), (1, 5, 'designer'),
(2, 2, 'owner'), (2, 3, 'developer'), (2, 5, 'designer'),
(3, 3, 'owner'), (3, 1, 'developer'), (3, 2, 'developer'), (3, 4, 'tester'),
(4, 1, 'owner'), (4, 2, 'developer'), (4, 4, 'tester');

-- 迭代数据
INSERT INTO sprint (id, project_id, name, goal, status, start_date, end_date, total_points, completed_points) VALUES
(1, 1, '迭代一', '基础架构搭建', 'completed', '2024-01-01', '2024-01-14', 40, 40),
(2, 1, '迭代二', 'AI功能开发', 'active', '2024-01-15', '2024-01-28', 35, 20),
(3, 1, '迭代三', '性能优化', 'planning', '2024-01-29', '2024-02-11', 30, 0),
(4, 2, '迭代一', '设计阶段', 'active', '2024-01-10', '2024-01-24', 25, 15),
(5, 3, '迭代一', '原型开发', 'active', '2024-01-08', '2024-01-22', 30, 10);

-- 工作项数据
INSERT INTO issue (id, project_id, issue_key, type, title, description, status, priority, assignee_id, reporter_id, sprint_id, story_points, due_date) VALUES
(1, 1, 'MOTA-1', 'story', '用户登录功能', '实现用户登录和注册功能模块', 'done', 'high', 2, 1, 1, 5, '2024-01-10'),
(2, 1, 'MOTA-2', 'story', '项目管理模块', '项目增删改查及成员管理功能', 'done', 'high', 3, 1, 1, 8, '2024-01-12'),
(3, 1, 'MOTA-3', 'story', '任务管理模块', '任务增删改查及状态流转功能', 'done', 'high', 2, 1, 1, 8, '2024-01-14'),
(4, 1, 'MOTA-4', 'story', 'AI方案生成器', 'AI驱动的智能方案生成功能', 'in_progress', 'highest', 2, 1, 2, 13, '2024-01-25'),
(5, 1, 'MOTA-5', 'story', 'AI PPT生成器', 'AI驱动的智能PPT生成功能', 'in_progress', 'high', 3, 1, 2, 13, '2024-01-26'),
(6, 1, 'MOTA-6', 'task', '数据库优化', '优化数据库表结构和索引', 'done', 'medium', 2, 1, 1, 5, '2024-01-08'),
(7, 1, 'MOTA-7', 'bug', '登录页样式问题', '移动端登录页面布局错乱', 'done', 'medium', 5, 4, 1, 2, '2024-01-09'),
(8, 1, 'MOTA-8', 'task', 'API接口文档', '编写API接口文档', 'in_progress', 'low', 2, 1, 2, 3, '2024-01-28'),
(9, 1, 'MOTA-9', 'story', '资讯追踪功能', 'AI资讯追踪与推送功能', 'open', 'medium', 3, 1, 3, 8, '2024-02-10'),
(10, 1, 'MOTA-10', 'bug', '生成超时问题', '大文本生成时出现超时', 'open', 'high', 2, 4, 2, 3, '2024-01-27'),
(11, 2, 'WEB-1', 'story', '首页设计', '设计全新首页界面', 'done', 'high', 5, 2, 4, 5, '2024-01-18'),
(12, 2, 'WEB-2', 'story', '产品页设计', '设计产品展示页面', 'in_progress', 'high', 5, 2, 4, 5, '2024-01-22'),
(13, 2, 'WEB-3', 'task', '响应式布局', '实现响应式设计适配', 'open', 'medium', 3, 2, 4, 8, '2024-01-24'),
(14, 3, 'APP-1', 'story', '应用框架搭建', '搭建React Native项目框架', 'done', 'high', 2, 3, 5, 5, '2024-01-15'),
(15, 3, 'APP-2', 'story', '登录模块', '实现应用登录功能', 'in_progress', 'high', 2, 3, 5, 5, '2024-01-20'),
(16, 3, 'APP-3', 'story', '首页开发', '开发应用首页界面', 'open', 'medium', 1, 3, 5, 8, '2024-01-22');

-- 动态数据
INSERT INTO activity (id, type, action, target, target_id, user_id, project_id, time, created_at) VALUES
(1, 'issue_created', '创建了任务', 'MOTA-10', 10, 4, 1, '10分钟前', NOW()),
(2, 'issue_updated', '更新了任务状态', 'MOTA-4', 4, 2, 1, '30分钟前', NOW()),
(3, 'comment_added', '评论了任务', 'MOTA-5', 5, 3, 1, '1小时前', NOW()),
(4, 'issue_completed', '完成了任务', 'MOTA-7', 7, 5, 1, '2小时前', NOW()),
(5, 'member_joined', '加入了项目', 'Mota智能平台', 1, 5, 1, '3小时前', NOW()),
(6, 'sprint_started', '开始了迭代', '迭代二', 2, 1, 1, '1天前', NOW()),
(7, 'project_created', '创建了项目', '移动端应用', 3, 3, 3, '2天前', NOW()),
(8, 'issue_created', '创建了任务', 'WEB-3', 13, 2, 2, '2天前', NOW());

-- 通知数据
INSERT INTO notification (id, type, title, content, user_id, is_read, related_id, related_type, created_at) VALUES
(1, 'task_assigned', '新任务分配', '您被分配了任务 MOTA-4', 2, 0, 4, 'issue', NOW()),
(2, 'comment', '新评论', '张三评论了您的任务 MOTA-5', 3, 0, 5, 'issue', NOW()),
(3, 'mention', '有人提到了您', '李四在任务 MOTA-8 中提到了您', 2, 1, 8, 'issue', NOW()),
(4, 'sprint_start', '迭代开始', '迭代二已经开始', 2, 1, 2, 'sprint', NOW()),
(5, 'task_completed', '任务完成', '任务 MOTA-7 已完成', 1, 0, 7, 'issue', NOW()),
(6, 'project_invite', '项目邀请', '您被邀请加入移动端应用项目', 4, 0, 3, 'project', NOW()),
(7, 'deadline_reminder', '截止日期提醒', '任务 MOTA-4 将在2天后到期', 2, 0, 4, 'issue', NOW()),
(8, 'system', '系统通知', '系统将于今晚进行维护升级', 1, 1, NULL, NULL, NOW());

-- 知识库文档
INSERT INTO wiki_document (id, project_id, title, content, parent_id, sort, created_by, created_at, updated_at) VALUES
(1, 1, '项目概述', '# Mota智能平台\n\n## 简介\nMota是一个AI驱动的企业级解决方案平台...', NULL, 1, 1, NOW(), NOW()),
(2, 1, '技术架构', '# 技术架构\n\n## 前端技术栈\n- React 18\n- TypeScript\n- Ant Design\n\n## 后端技术栈\n- Spring Boot 3\n- MySQL 8\n- Redis', NULL, 2, 1, NOW(), NOW()),
(3, 1, 'API接口文档', '# API接口文档\n\n## 认证接口\n\n### 登录\n```\nPOST /api/v1/auth/login\n```', NULL, 3, 1, NOW(), NOW()),
(4, 1, '开发指南', '# 开发指南\n\n## 代码规范\n- 使用ESLint进行代码检查\n- 使用Prettier进行代码格式化', 1, 1, 1, NOW(), NOW()),
(5, 2, '设计规范', '# 设计规范\n\n## 颜色规范\n主色: #1677ff\n辅助色: #52c41a', NULL, 1, 2, NOW(), NOW());

-- AI历史记录
INSERT INTO ai_history (id, title, type, status, creator, creator_id, content, created_at, updated_at) VALUES
('SOL-001', '商业计划书', 'solution', 'completed', '管理员', 1, '# 商业计划书\n\n## 背景\n...', NOW(), NOW()),
('PPT-001', '产品介绍PPT', 'ppt', 'completed', '管理员', 1, 'PPT内容...', NOW(), NOW()),
('MKT-001', '营销推广方案', 'marketing', 'completed', '张三', 2, '# 营销推广方案\n\n## 目标\n...', NOW(), NOW()),
('SOL-002', '技术架构方案', 'solution', 'completed', '李四', 3, '# 技术架构方案\n\n## 系统设计\n...', NOW(), NOW()),
('NEWS-001', '行业资讯周报', 'news', 'completed', '管理员', 1, '# 行业资讯\n\n## 头条新闻\n...', NOW(), NOW());

-- AI资讯数据
INSERT INTO ai_news (id, title, summary, source, publish_time, category, tags, url, is_starred, relevance, created_at) VALUES
('1', 'GPT-5正式发布，性能大幅提升', 'OpenAI发布GPT-5，在推理能力和多模态理解方面有重大突破...', '36氪', '2小时前', 'AI技术', '["GPT-5", "OpenAI", "大模型"]', '#', 1, 95, NOW()),
('2', '企业数字化转型报告发布', '最新研究显示80%的企业将AI视为数字化转型的核心驱动力...', '亿欧', '4小时前', '行业趋势', '["数字化转型", "企业", "AI"]', '#', 0, 88, NOW()),
('3', 'SaaS行业迎来AI变革', 'AI技术正在重塑SaaS行业，自动化成为主要趋势...', '虎嗅', '6小时前', '行业趋势', '["SaaS", "自动化", "AI"]', '#', 1, 92, NOW()),
('4', '国内科技巨头AI竞赛加剧', '百度、阿里、腾讯在AI大模型领域竞争日趋激烈...', 'TMT观察', '8小时前', 'AI技术', '["大模型", "百度", "阿里", "腾讯"]', '#', 0, 85, NOW()),
('5', 'AI营销工具市场规模突破百亿', 'AI营销工具市场规模已突破100亿元，预计年增长率达30%...', '艾瑞咨询', '1天前', '市场分析', '["AI营销", "市场规模", "增长"]', '#', 0, 90, NOW());