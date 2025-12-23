-- =====================================================
-- Mota 项目管理系统 - 完整测试数据
-- 根据实际数据库表结构生成
-- =====================================================

-- 清空现有数据（按外键依赖顺序）
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE ai_news;
TRUNCATE TABLE ai_history;
TRUNCATE TABLE wiki_document;
TRUNCATE TABLE notification;
TRUNCATE TABLE activity;
TRUNCATE TABLE issue;
TRUNCATE TABLE sprint;
TRUNCATE TABLE project_member;
TRUNCATE TABLE project;
TRUNCATE TABLE sys_user;
SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- 1. 用户数据 (sys_user)
-- =====================================================
-- 密码哈希为 BCrypt 加密的 "password"
INSERT INTO sys_user (id, username, email, phone, password_hash, nickname, avatar, status, org_id, org_name, role, last_login_at, created_at, updated_at) VALUES
(1, 'admin', 'admin@mota.com', '13800000001', '$2a$10$EqKcp1WFKVQISheBxkVJceXl.RP.nb7FpjNYhPWFJEiPBTwMwpM2W', '系统管理员', 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin', 1, 'ORG001', 'Mota科技', 'admin', NOW(), NOW(), NOW()),
(2, 'zhangsan', 'zhangsan@mota.com', '13800000002', '$2a$10$EqKcp1WFKVQISheBxkVJceXl.RP.nb7FpjNYhPWFJEiPBTwMwpM2W', '张三', 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhangsan', 1, 'ORG001', 'Mota科技', 'pm', NOW(), NOW(), NOW()),
(3, 'lisi', 'lisi@mota.com', '13800000003', '$2a$10$EqKcp1WFKVQISheBxkVJceXl.RP.nb7FpjNYhPWFJEiPBTwMwpM2W', '李四', 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisi', 1, 'ORG001', 'Mota科技', 'dev', NOW(), NOW(), NOW()),
(4, 'wangwu', 'wangwu@mota.com', '13800000004', '$2a$10$EqKcp1WFKVQISheBxkVJceXl.RP.nb7FpjNYhPWFJEiPBTwMwpM2W', '王五', 'https://api.dicebear.com/7.x/avataaars/svg?seed=wangwu', 1, 'ORG001', 'Mota科技', 'dev', NOW(), NOW(), NOW()),
(5, 'zhaoliu', 'zhaoliu@mota.com', '13800000005', '$2a$10$EqKcp1WFKVQISheBxkVJceXl.RP.nb7FpjNYhPWFJEiPBTwMwpM2W', '赵六', 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhaoliu', 1, 'ORG001', 'Mota科技', 'qa', NOW(), NOW(), NOW()),
(6, 'sunqi', 'sunqi@mota.com', '13800000006', '$2a$10$EqKcp1WFKVQISheBxkVJceXl.RP.nb7FpjNYhPWFJEiPBTwMwpM2W', '孙七', 'https://api.dicebear.com/7.x/avataaars/svg?seed=sunqi', 1, 'ORG001', 'Mota科技', 'dev', NOW(), NOW(), NOW()),
(7, 'zhouba', 'zhouba@mota.com', '13800000007', '$2a$10$EqKcp1WFKVQISheBxkVJceXl.RP.nb7FpjNYhPWFJEiPBTwMwpM2W', '周八', 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhouba', 1, 'ORG001', 'Mota科技', 'designer', NOW(), NOW(), NOW()),
(8, 'wujiu', 'wujiu@mota.com', '13800000008', '$2a$10$EqKcp1WFKVQISheBxkVJceXl.RP.nb7FpjNYhPWFJEiPBTwMwpM2W', '吴九', 'https://api.dicebear.com/7.x/avataaars/svg?seed=wujiu', 1, 'ORG001', 'Mota科技', 'dev', NOW(), NOW(), NOW());

-- =====================================================
-- 2. 项目数据 (project)
-- 字段: id, org_id, name, key, description, template_type, status, owner_id, color, starred, progress, member_count, issue_count, settings, created_at, updated_at
-- =====================================================
INSERT INTO project (id, org_id, name, `key`, description, template_type, status, owner_id, color, starred, progress, member_count, issue_count, created_at, updated_at) VALUES
(1, 'ORG001', 'Mota 项目管理系统', 'MOTA', '新一代智能项目管理平台，集成AI能力，提供项目协同、知识管理、效能洞察等功能', 'agile', 'active', 1, '#1677ff', 1, 65, 7, 11, NOW(), NOW()),
(2, 'ORG001', '电商平台重构', 'SHOP', '对现有电商平台进行技术架构升级，采用微服务架构，提升系统性能和可扩展性', 'agile', 'active', 2, '#52c41a', 0, 45, 4, 5, NOW(), NOW()),
(3, 'ORG001', '移动端App开发', 'APP', '开发iOS和Android双平台移动应用，提供用户端核心功能', 'agile', 'active', 2, '#722ed1', 0, 55, 4, 4, NOW(), NOW()),
(4, 'ORG001', '数据中台建设', 'DATA', '构建企业级数据中台，实现数据采集、存储、计算、服务一体化', 'agile', 'planning', 1, '#fa8c16', 0, 10, 2, 0, NOW(), NOW()),
(5, 'ORG001', 'AI智能客服系统', 'AICS', '基于大语言模型的智能客服系统，支持多轮对话和知识库问答', 'agile', 'active', 3, '#eb2f96', 1, 40, 3, 4, NOW(), NOW()),
(6, 'ORG001', '运维监控平台', 'OPS', '统一运维监控平台，集成日志、指标、链路追踪等功能', 'agile', 'completed', 4, '#13c2c2', 0, 100, 3, 0, NOW(), NOW());

-- =====================================================
-- 3. 项目成员 (project_member)
-- 字段: id, project_id, user_id, role, joined_at, created_at, updated_at
-- =====================================================
INSERT INTO project_member (id, project_id, user_id, role, joined_at, created_at, updated_at) VALUES
-- Mota项目成员
(1, 1, 1, 'owner', NOW(), NOW(), NOW()),
(2, 1, 2, 'admin', NOW(), NOW(), NOW()),
(3, 1, 3, 'member', NOW(), NOW(), NOW()),
(4, 1, 4, 'member', NOW(), NOW(), NOW()),
(5, 1, 5, 'member', NOW(), NOW(), NOW()),
(6, 1, 6, 'member', NOW(), NOW(), NOW()),
(7, 1, 7, 'member', NOW(), NOW(), NOW()),
-- 电商平台成员
(8, 2, 2, 'owner', NOW(), NOW(), NOW()),
(9, 2, 3, 'member', NOW(), NOW(), NOW()),
(10, 2, 4, 'member', NOW(), NOW(), NOW()),
(11, 2, 5, 'member', NOW(), NOW(), NOW()),
-- 移动端App成员
(12, 3, 2, 'owner', NOW(), NOW(), NOW()),
(13, 3, 6, 'member', NOW(), NOW(), NOW()),
(14, 3, 7, 'member', NOW(), NOW(), NOW()),
(15, 3, 8, 'member', NOW(), NOW(), NOW()),
-- AI客服系统成员
(16, 5, 3, 'owner', NOW(), NOW(), NOW()),
(17, 5, 4, 'member', NOW(), NOW(), NOW()),
(18, 5, 8, 'member', NOW(), NOW(), NOW()),
-- 数据中台成员
(19, 4, 1, 'owner', NOW(), NOW(), NOW()),
(20, 4, 4, 'member', NOW(), NOW(), NOW()),
-- 运维监控平台成员
(21, 6, 4, 'owner', NOW(), NOW(), NOW()),
(22, 6, 6, 'member', NOW(), NOW(), NOW()),
(23, 6, 8, 'member', NOW(), NOW(), NOW());

-- =====================================================
-- 4. 迭代数据 (sprint)
-- 字段: id, project_id, name, goal, status, start_date, end_date, total_points, completed_points, created_at, updated_at
-- =====================================================
INSERT INTO sprint (id, project_id, name, goal, status, start_date, end_date, total_points, completed_points, created_at, updated_at) VALUES
-- Mota项目迭代
(1, 1, '迭代1 - 基础架构', '完成项目基础架构搭建，包括前后端框架、数据库设计、CI/CD流程', 'completed', '2024-01-01', '2024-01-14', 34, 34, NOW(), NOW()),
(2, 1, '迭代2 - 用户认证', '实现用户注册、登录、权限管理等核心功能', 'completed', '2024-01-15', '2024-01-28', 29, 29, NOW(), NOW()),
(3, 1, '迭代3 - 项目管理', '实现项目创建、成员管理、迭代规划等功能', 'completed', '2024-01-29', '2024-02-11', 32, 32, NOW(), NOW()),
(4, 1, '迭代4 - 任务管理', '实现任务创建、分配、状态流转、看板视图等功能', 'active', '2024-02-12', '2024-02-25', 30, 12, NOW(), NOW()),
(5, 1, '迭代5 - AI智能', '集成AI能力，实现智能需求生成、代码建议等功能', 'planning', '2024-02-26', '2024-03-10', 29, 0, NOW(), NOW()),
-- 电商平台迭代
(6, 2, '迭代1 - 服务拆分', '将单体应用拆分为微服务架构', 'completed', '2024-03-01', '2024-03-14', 40, 40, NOW(), NOW()),
(7, 2, '迭代2 - 订单服务', '重构订单服务，优化下单流程', 'completed', '2024-03-15', '2024-03-28', 35, 35, NOW(), NOW()),
(8, 2, '迭代3 - 支付服务', '重构支付服务，接入多种支付渠道', 'active', '2024-03-29', '2024-04-11', 32, 10, NOW(), NOW()),
-- 移动端App迭代
(9, 3, '迭代1 - UI框架', '搭建移动端UI框架和组件库', 'completed', '2024-02-01', '2024-02-14', 28, 28, NOW(), NOW()),
(10, 3, '迭代2 - 首页模块', '实现App首页和推荐功能', 'active', '2024-02-15', '2024-02-28', 25, 12, NOW(), NOW()),
-- AI客服迭代
(11, 5, '迭代1 - 对话引擎', '搭建基础对话引擎和知识库', 'completed', '2024-04-01', '2024-04-14', 38, 38, NOW(), NOW()),
(12, 5, '迭代2 - 多轮对话', '实现多轮对话和上下文理解', 'active', '2024-04-15', '2024-04-28', 35, 16, NOW(), NOW());

-- =====================================================
-- 5. 任务/事项数据 (issue)
-- 字段: id, project_id, issue_key, type, title, description, status, priority, assignee_id, reporter_id, parent_id, sprint_id, story_points, estimated_hours, actual_hours, due_date, created_at, updated_at
-- =====================================================
INSERT INTO issue (id, project_id, issue_key, type, title, description, status, priority, assignee_id, reporter_id, sprint_id, story_points, estimated_hours, due_date, created_at, updated_at) VALUES
-- Mota项目 Sprint 4 任务
(1, 1, 'MOTA-1', 'story', '实现任务创建功能', '支持创建不同类型的任务（Story、Task、Bug），包含标题、描述、优先级等字段', 'done', 'high', 3, 2, 4, 5, 16.00, '2024-02-15', NOW(), NOW()),
(2, 1, 'MOTA-2', 'story', '实现任务列表页面', '展示任务列表，支持筛选、排序、分页功能', 'done', 'high', 3, 2, 4, 3, 12.00, '2024-02-16', NOW(), NOW()),
(3, 1, 'MOTA-3', 'story', '实现看板视图', '拖拽式看板，支持任务状态流转', 'in_progress', 'high', 4, 2, 4, 8, 24.00, '2024-02-20', NOW(), NOW()),
(4, 1, 'MOTA-4', 'story', '任务详情页面', '展示任务详细信息，支持编辑、评论、附件等功能', 'in_progress', 'medium', 6, 2, 4, 5, 16.00, '2024-02-22', NOW(), NOW()),
(5, 1, 'MOTA-5', 'task', '任务分配功能', '支持将任务分配给团队成员', 'open', 'medium', 3, 2, 4, 2, 8.00, '2024-02-23', NOW(), NOW()),
(6, 1, 'MOTA-6', 'task', '任务状态流转', '实现任务状态的自动流转和手动变更', 'open', 'medium', 4, 2, 4, 3, 12.00, '2024-02-24', NOW(), NOW()),
(7, 1, 'MOTA-7', 'bug', '修复任务列表分页bug', '当数据量大时分页显示异常', 'done', 'high', 3, 5, 4, 1, 4.00, '2024-02-14', NOW(), NOW()),
(8, 1, 'MOTA-8', 'task', '优化任务加载性能', '任务列表加载速度优化', 'in_progress', 'low', 4, 2, 4, 3, 8.00, '2024-02-25', NOW(), NOW()),

-- Mota项目 Sprint 5 任务（规划中）
(9, 1, 'MOTA-9', 'story', 'AI需求生成功能', '基于用户输入自动生成需求文档', 'open', 'high', NULL, 2, 5, 8, 24.00, '2024-03-05', NOW(), NOW()),
(10, 1, 'MOTA-10', 'story', 'AI代码建议功能', '根据需求自动生成代码建议', 'open', 'high', NULL, 2, 5, 13, 40.00, '2024-03-08', NOW(), NOW()),
(11, 1, 'MOTA-11', 'story', 'AI测试用例生成', '自动生成测试用例', 'open', 'medium', NULL, 2, 5, 8, 24.00, '2024-03-10', NOW(), NOW()),

-- 电商平台 Sprint 3 任务
(12, 2, 'SHOP-1', 'story', '支付宝支付接入', '接入支付宝支付SDK', 'in_progress', 'high', 3, 2, 8, 5, 16.00, '2024-04-05', NOW(), NOW()),
(13, 2, 'SHOP-2', 'story', '微信支付接入', '接入微信支付SDK', 'open', 'high', 4, 2, 8, 5, 16.00, '2024-04-08', NOW(), NOW()),
(14, 2, 'SHOP-3', 'task', '支付回调处理', '处理支付成功/失败回调', 'open', 'medium', 3, 2, 8, 3, 12.00, '2024-04-10', NOW(), NOW()),
(15, 2, 'SHOP-4', 'task', '支付状态查询', '实现支付状态查询接口', 'open', 'medium', 4, 2, 8, 2, 8.00, '2024-04-11', NOW(), NOW()),
(16, 2, 'SHOP-5', 'bug', '修复订单金额计算bug', '优惠券叠加时金额计算错误', 'in_progress', 'highest', 3, 5, 8, 2, 8.00, '2024-04-03', NOW(), NOW()),

-- 移动端App Sprint 2 任务
(17, 3, 'APP-1', 'story', '首页UI设计实现', '实现首页UI设计稿', 'done', 'high', 7, 2, 10, 5, 16.00, '2024-02-18', NOW(), NOW()),
(18, 3, 'APP-2', 'story', '推荐算法接入', '接入后端推荐算法API', 'in_progress', 'high', 6, 2, 10, 8, 24.00, '2024-02-22', NOW(), NOW()),
(19, 3, 'APP-3', 'task', '下拉刷新功能', '实现首页下拉刷新', 'done', 'medium', 8, 2, 10, 2, 8.00, '2024-02-20', NOW(), NOW()),
(20, 3, 'APP-4', 'task', '首页性能优化', '优化首页加载速度和内存占用', 'open', 'low', 6, 2, 10, 5, 16.00, '2024-02-28', NOW(), NOW()),

-- AI客服 Sprint 2 任务
(21, 5, 'AICS-1', 'story', '上下文管理模块', '实现对话上下文的存储和管理', 'in_progress', 'high', 4, 3, 12, 8, 24.00, '2024-04-20', NOW(), NOW()),
(22, 5, 'AICS-2', 'story', '意图识别优化', '优化用户意图识别准确率', 'open', 'high', 8, 3, 12, 5, 16.00, '2024-04-25', NOW(), NOW()),
(23, 5, 'AICS-3', 'task', '知识库检索优化', '优化知识库检索速度和准确性', 'in_progress', 'medium', 4, 3, 12, 5, 16.00, '2024-04-22', NOW(), NOW()),
(24, 5, 'AICS-4', 'task', '对话日志记录', '记录所有对话日志用于分析', 'done', 'low', 8, 3, 12, 3, 8.00, '2024-04-18', NOW(), NOW()),

-- Backlog 任务（未分配迭代）
(25, 1, 'MOTA-12', 'story', '国际化支持', '支持多语言切换', 'open', 'low', NULL, 2, NULL, 13, 40.00, NULL, NOW(), NOW()),
(26, 1, 'MOTA-13', 'story', '深色模式', '支持深色/浅色主题切换', 'open', 'low', NULL, 2, NULL, 5, 16.00, NULL, NOW(), NOW()),
(27, 1, 'MOTA-14', 'story', '移动端适配', '响应式设计，支持移动端访问', 'open', 'medium', NULL, 2, NULL, 8, 24.00, NULL, NOW(), NOW()),
(28, 2, 'SHOP-6', 'story', '库存预警功能', '库存低于阈值时自动预警', 'open', 'medium', NULL, 2, NULL, 5, 16.00, NULL, NOW(), NOW()),
(29, 2, 'SHOP-7', 'story', '数据导出功能', '支持订单数据导出为Excel', 'open', 'low', NULL, 2, NULL, 3, 8.00, NULL, NOW(), NOW()),
(30, 3, 'APP-5', 'story', '消息推送功能', '集成推送服务，支持消息推送', 'open', 'medium', NULL, 2, NULL, 8, 24.00, NULL, NOW(), NOW());

-- =====================================================
-- 6. 活动记录 (activity)
-- 字段: id, type, action, target, target_id, user_id, project_id, time, created_at
-- =====================================================
INSERT INTO activity (id, type, action, target, target_id, user_id, project_id, time, created_at) VALUES
-- 今天的活动
(1, 'issue', '完成了任务', '实现任务创建功能', 1, 3, 1, '刚刚', NOW()),
(2, 'issue', '更新了任务', '实现看板视图', 3, 4, 1, '1小时前', DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(3, 'issue', '创建了任务', 'AI需求生成功能', 9, 2, 1, '2小时前', DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(4, 'issue', '评论了任务', '修复任务列表分页bug', 7, 5, 1, '3小时前', DATE_SUB(NOW(), INTERVAL 3 HOUR)),
(5, 'issue', '开始处理任务', '支付宝支付接入', 12, 3, 2, '4小时前', DATE_SUB(NOW(), INTERVAL 4 HOUR)),

-- 昨天的活动
(6, 'issue', '完成了任务', '实现任务列表页面', 2, 3, 1, '昨天', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(7, 'issue', '开始处理任务', '任务详情页面', 4, 6, 1, '昨天', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(8, 'issue', '完成了任务', '首页UI设计实现', 17, 7, 3, '昨天', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(9, 'issue', '创建了Bug', '修复订单金额计算bug', 16, 5, 2, '昨天', DATE_SUB(NOW(), INTERVAL 1 DAY)),

-- 本周的活动
(10, 'sprint', '创建了迭代', '迭代5 - AI智能', 5, 2, 1, '2天前', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(11, 'issue', '开始处理任务', '优化任务加载性能', 8, 4, 1, '2天前', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(12, 'issue', '开始处理任务', '上下文管理模块', 21, 4, 5, '3天前', DATE_SUB(NOW(), INTERVAL 3 DAY)),
(13, 'issue', '完成了任务', '对话日志记录', 24, 8, 5, '3天前', DATE_SUB(NOW(), INTERVAL 3 DAY)),
(14, 'issue', '完成了任务', '下拉刷新功能', 19, 8, 3, '4天前', DATE_SUB(NOW(), INTERVAL 4 DAY)),
(15, 'project', '更新了项目', 'Mota 项目管理系统', 1, 1, 1, '5天前', DATE_SUB(NOW(), INTERVAL 5 DAY)),

-- 更早的活动
(16, 'sprint', '创建了迭代', '迭代3 - 支付服务', 8, 2, 2, '1周前', DATE_SUB(NOW(), INTERVAL 7 DAY)),
(17, 'issue', '修复了Bug', '修复任务列表分页bug', 7, 3, 1, '1周前', DATE_SUB(NOW(), INTERVAL 7 DAY)),
(18, 'issue', '开始处理任务', '推荐算法接入', 18, 6, 3, '1周前', DATE_SUB(NOW(), INTERVAL 8 DAY)),
(19, 'sprint', '创建了迭代', '迭代2 - 多轮对话', 12, 3, 5, '10天前', DATE_SUB(NOW(), INTERVAL 10 DAY)),
(20, 'member', '添加了成员', '周八', NULL, 2, 1, '2周前', DATE_SUB(NOW(), INTERVAL 14 DAY));

-- =====================================================
-- 7. 通知数据 (notification)
-- 字段: id, type, title, content, user_id, is_read, related_id, related_type, created_at
-- =====================================================
INSERT INTO notification (id, type, title, content, user_id, is_read, related_id, related_type, created_at) VALUES
-- 管理员的通知
(1, 'member', '新成员加入', '周八已加入项目"Mota 项目管理系统"', 1, 0, 1, 'project', NOW()),
(2, 'sprint', '迭代已完成', '迭代3 - 项目管理 已完成', 1, 1, 3, 'sprint', DATE_SUB(NOW(), INTERVAL 1 DAY)),

-- 张三的通知
(3, 'issue', '任务已完成', '李四完成了任务"实现任务创建功能"', 2, 0, 1, 'issue', NOW()),
(4, 'issue', 'Bug已修复', '李四修复了"修复任务列表分页bug"', 2, 0, 7, 'issue', DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(5, 'comment', '新评论', '赵六在任务"修复任务列表分页bug"中添加了评论', 2, 1, 7, 'issue', DATE_SUB(NOW(), INTERVAL 3 HOUR)),

-- 李四的通知
(6, 'issue', '任务已分配', '张三将任务"支付宝支付接入"分配给你', 3, 0, 12, 'issue', DATE_SUB(NOW(), INTERVAL 4 HOUR)),
(7, 'sprint', '迭代即将结束', '迭代4 - 任务管理 将于3天后结束', 3, 0, 4, 'sprint', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(8, 'review', '代码评审请求', '王五请求你评审代码', 3, 1, 3, 'issue', DATE_SUB(NOW(), INTERVAL 2 DAY)),

-- 王五的通知
(9, 'issue', '任务已分配', '张三将任务"实现看板视图"分配给你', 4, 1, 3, 'issue', DATE_SUB(NOW(), INTERVAL 5 DAY)),
(10, 'mention', '提及你', '李四在评论中@了你', 4, 0, 8, 'issue', DATE_SUB(NOW(), INTERVAL 1 DAY)),

-- 赵六的通知
(11, 'issue', 'Bug已分配', '张三将Bug"修复订单金额计算bug"分配给你验证', 5, 0, 16, 'issue', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(12, 'task', '测试任务', '有新的测试任务需要处理', 5, 1, 7, 'issue', DATE_SUB(NOW(), INTERVAL 3 DAY)),

-- 其他成员的通知
(13, 'issue', '任务已分配', '张三将任务"任务详情页面"分配给你', 6, 0, 4, 'issue', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(14, 'review', '设计评审', '首页UI设计需要评审', 7, 1, 17, 'issue', DATE_SUB(NOW(), INTERVAL 3 DAY)),
(15, 'issue', '任务已分配', '李四将任务"意图识别优化"分配给你', 8, 0, 22, 'issue', DATE_SUB(NOW(), INTERVAL 1 DAY));

-- =====================================================
-- 8. Wiki文档 (wiki_document)
-- 字段: id, project_id, title, content, parent_id, sort, created_at, updated_at, created_by, updated_by
-- =====================================================
INSERT INTO wiki_document (id, project_id, title, content, parent_id, sort, created_at, updated_at, created_by) VALUES
-- Mota项目文档
(1, 1, '项目概述', '# Mota 项目管理系统\n\n## 项目简介\nMota是新一代智能项目管理平台，集成AI能力，提供项目协同、知识管理、效能洞察等功能。\n\n## 核心功能\n- 项目管理\n- 任务跟踪\n- 迭代规划\n- AI智能助手\n- 效能分析\n\n## 技术栈\n- 前端：React + TypeScript + Ant Design\n- 后端：Spring Boot + Spring Cloud\n- 数据库：MySQL + Redis\n- AI：大语言模型集成', NULL, 1, NOW(), NOW(), 1),
(2, 1, '快速开始', '# 快速开始\n\n## 环境要求\n- Node.js 18+\n- Java 21+\n- MySQL 8.0+\n- Redis 7.0+\n\n## 安装步骤\n\n### 1. 克隆代码\n```bash\ngit clone https://github.com/mota/mota.git\n```\n\n### 2. 启动后端\n```bash\ncd mota-service\nmvn spring-boot:run\n```\n\n### 3. 启动前端\n```bash\ncd mota-user\nnpm install\nnpm run dev\n```\n\n## 访问系统\n打开浏览器访问 http://localhost:3000', NULL, 2, NOW(), NOW(), 2),
(3, 1, '开发规范', '# 开发规范\n\n## 代码规范\n\n### 命名规范\n- 类名：大驼峰命名法\n- 方法名：小驼峰命名法\n- 常量：全大写下划线分隔\n\n### Git提交规范\n- feat: 新功能\n- fix: 修复bug\n- docs: 文档更新\n- style: 代码格式\n- refactor: 重构\n- test: 测试\n- chore: 构建/工具\n\n## API规范\n- RESTful风格\n- 统一响应格式\n- 版本控制：/api/v1/\n\n## 数据库规范\n- 表名：小写下划线\n- 字段名：小写下划线\n- 必须有主键、创建时间、更新时间', NULL, 3, NOW(), NOW(), 2),
(4, 1, '系统架构', '# 系统架构\n\n## 整体架构\n```\n┌─────────────────────────────────────────┐\n│                 前端应用                 │\n│         React + TypeScript              │\n└─────────────────┬───────────────────────┘\n                  │\n┌─────────────────▼───────────────────────┐\n│              API Gateway                │\n│           Spring Cloud Gateway          │\n└─────────────────┬───────────────────────┘\n                  │\n┌─────────────────▼───────────────────────┐\n│              微服务集群                  │\n│  ┌─────────┐ ┌─────────┐ ┌─────────┐   │\n│  │用户服务 │ │项目服务 │ │任务服务 │   │\n│  └─────────┘ └─────────┘ └─────────┘   │\n└─────────────────────────────────────────┘\n```\n\n## 服务说明\n- Gateway：统一入口，路由转发，认证鉴权\n- Auth Service：用户认证，Token管理\n- User Service：用户管理\n- Project Service：项目管理\n- Issue Service：任务管理', 1, 1, NOW(), NOW(), 3),
(5, 1, '数据库设计', '# 数据库设计\n\n## ER图\n\n### 用户相关\n- sys_user：用户表\n- sys_role：角色表\n- sys_permission：权限表\n\n### 项目相关\n- project：项目表\n- project_member：项目成员表\n- sprint：迭代表\n- issue：任务表\n\n### 其他\n- activity：活动记录表\n- notification：通知表\n- wiki_document：文档表\n\n## 表结构\n\n### sys_user\n| 字段 | 类型 | 说明 |\n|------|------|------|\n| id | bigint | 主键 |\n| username | varchar(50) | 用户名 |\n| email | varchar(100) | 邮箱 |\n| password_hash | varchar(255) | 密码哈希 |', 1, 2, NOW(), NOW(), 3),

-- 电商平台文档
(6, 2, '项目介绍', '# 电商平台重构\n\n## 项目背景\n现有电商平台采用单体架构，随着业务增长，面临以下问题：\n- 系统耦合度高\n- 部署效率低\n- 扩展性差\n\n## 重构目标\n- 采用微服务架构\n- 提升系统性能\n- 增强可扩展性\n\n## 服务拆分\n- 用户服务\n- 商品服务\n- 订单服务\n- 支付服务\n- 库存服务', NULL, 1, NOW(), NOW(), 2),
(7, 2, '接口文档', '# API接口文档\n\n## 订单服务\n\n### 创建订单\n```\nPOST /api/v1/orders\n```\n\n请求参数：\n```json\n{\n  "userId": 1,\n  "items": [\n    {"productId": 1, "quantity": 2}\n  ],\n  "addressId": 1\n}\n```\n\n### 查询订单\n```\nGET /api/v1/orders/{orderId}\n```\n\n## 支付服务\n\n### 发起支付\n```\nPOST /api/v1/payments\n```\n\n请求参数：\n```json\n{\n  "orderId": 1,\n  "paymentMethod": "alipay",\n  "amount": 99.00\n}\n```', NULL, 2, NOW(), NOW(), 3),

-- 移动端App文档
(8, 3, '产品需求', '# 移动端App产品需求\n\n## 功能模块\n\n### 1. 首页\n- 轮播图\n- 推荐商品\n- 分类入口\n- 搜索功能\n\n### 2. 商品\n- 商品列表\n- 商品详情\n- 商品评价\n\n### 3. 购物车\n- 添加商品\n- 修改数量\n- 删除商品\n- 结算\n\n### 4. 我的\n- 个人信息\n- 订单管理\n- 收货地址\n- 设置', NULL, 1, NOW(), NOW(), 2),
(9, 3, 'UI设计规范', '# UI设计规范\n\n## 色彩规范\n- 主色：#2B7DE9\n- 辅助色：#52C41A\n- 警告色：#FAAD14\n- 错误色：#FF4D4F\n\n## 字体规范\n- 标题：18px Bold\n- 正文：14px Regular\n- 辅助文字：12px Regular\n\n## 间距规范\n- 页面边距：16px\n- 模块间距：12px\n- 元素间距：8px\n\n## 圆角规范\n- 卡片：8px\n- 按钮：4px\n- 输入框：4px', NULL, 2, NOW(), NOW(), 7),

-- AI客服文档
(10, 5, '技术方案', '# AI智能客服技术方案\n\n## 系统架构\n\n### 核心组件\n1. 对话引擎\n2. 意图识别\n3. 知识库\n4. 回复生成\n\n## 技术选型\n- 大语言模型：GPT-4 / Claude\n- 向量数据库：Milvus\n- 消息队列：RabbitMQ\n\n## 对话流程\n1. 用户输入\n2. 意图识别\n3. 知识检索\n4. 回复生成\n5. 返回用户\n\n## 性能指标\n- 响应时间：< 2s\n- 准确率：> 90%\n- 并发支持：1000 QPS', NULL, 1, NOW(), NOW(), 3);

-- =====================================================
-- 9. AI历史记录 (ai_history)
-- 字段: id, title, type, status, creator, creator_id, content, created_at, updated_at
-- =====================================================
INSERT INTO ai_history (id, title, type, status, creator, creator_id, content, created_at, updated_at) VALUES
('ai-001', '用户登录功能需求', 'requirement', 'completed', '张三', 2, '## 需求文档\n\n### 1. 需求背景\n用户需要通过登录功能访问系统\n\n### 2. 功能需求\n- 支持用户名/邮箱登录\n- 支持手机验证码登录\n- 支持第三方登录（微信、钉钉）\n- 记住登录状态\n\n### 3. 非功能需求\n- 登录响应时间 < 1s\n- 支持并发登录 1000+\n- 密码加密存储', NOW(), NOW()),
('ai-002', '订单模块测试用例', 'testcase', 'completed', '赵六', 5, '## 测试用例\n\n### 测试场景: 订单创建\n\n| 用例ID | 测试步骤 | 预期结果 | 优先级 |\n|--------|----------|----------|--------|\n| TC001 | 正常创建订单 | 订单创建成功 | P0 |\n| TC002 | 库存不足创建订单 | 提示库存不足 | P0 |\n| TC003 | 未登录创建订单 | 跳转登录页 | P1 |\n| TC004 | 商品下架创建订单 | 提示商品已下架 | P1 |', DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY)),
('ai-003', '支付接口代码', 'code', 'completed', '李四', 3, '```java\n@Service\npublic class PaymentService {\n    \n    @Autowired\n    private PaymentGateway paymentGateway;\n    \n    public PaymentResult pay(PaymentRequest request) {\n        // 验证订单\n        Order order = orderService.getById(request.getOrderId());\n        if (order == null) {\n            throw new BusinessException("订单不存在");\n        }\n        \n        // 发起支付\n        return paymentGateway.pay(request);\n    }\n}\n```', DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY)),
('ai-004', '项目周报PPT', 'ppt', 'completed', '张三', 2, '# 项目周报\n\n## 本周完成\n- 完成用户认证模块\n- 完成项目管理基础功能\n- 修复5个Bug\n\n## 下周计划\n- 任务管理功能开发\n- 看板视图实现\n- 性能优化\n\n## 风险与问题\n- 人员不足\n- 需求变更频繁', DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY)),
('ai-005', '性能优化方案', 'solution', 'completed', '王五', 4, '## 问题分析\n\n任务列表加载缓慢，响应时间超过3秒\n\n## 解决方案\n\n### 方案一：数据库优化\n- 添加索引\n- 优化SQL查询\n- 分页查询\n\n### 方案二：缓存优化\n- Redis缓存热点数据\n- 本地缓存\n\n### 方案三：前端优化\n- 虚拟滚动\n- 懒加载\n\n## 推荐方案\n综合采用方案一和方案二，预计可将响应时间降至500ms以内', DATE_SUB(NOW(), INTERVAL 4 DAY), DATE_SUB(NOW(), INTERVAL 4 DAY)),
('ai-006', '数据库设计文档', 'requirement', 'completed', '李四', 3, '## 数据库设计\n\n### 用户表 (sys_user)\n| 字段 | 类型 | 说明 |\n|------|------|------|\n| id | bigint | 主键 |\n| username | varchar(50) | 用户名 |\n| email | varchar(100) | 邮箱 |\n| password_hash | varchar(255) | 密码 |\n\n### 项目表 (project)\n| 字段 | 类型 | 说明 |\n|------|------|------|\n| id | bigint | 主键 |\n| name | varchar(100) | 项目名 |\n| key | varchar(20) | 项目标识 |', DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY)),
('ai-007', 'API接口测试用例', 'testcase', 'completed', '赵六', 5, '## API测试用例\n\n### 登录接口\n\n#### 正常登录\n```\nPOST /api/v1/auth/login\n{\n  "username": "admin",\n  "password": "password"\n}\n```\n预期：返回token\n\n#### 密码错误\n```\nPOST /api/v1/auth/login\n{\n  "username": "admin",\n  "password": "wrong"\n}\n```\n预期：返回401错误', DATE_SUB(NOW(), INTERVAL 6 DAY), DATE_SUB(NOW(), INTERVAL 6 DAY)),
('ai-008', '技术选型报告', 'solution', 'completed', '张三', 2, '## 技术选型报告\n\n### 前端框架\n- React：生态丰富，社区活跃\n- Vue：学习曲线平缓\n- Angular：企业级框架\n\n**选择：React**\n\n### 后端框架\n- Spring Boot：成熟稳定\n- Go：高性能\n- Node.js：全栈统一\n\n**选择：Spring Boot**\n\n### 数据库\n- MySQL：关系型，成熟\n- PostgreSQL：功能强大\n- MongoDB：文档型\n\n**选择：MySQL**', DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_SUB(NOW(), INTERVAL 7 DAY)),
('ai-009', '迭代规划建议', 'requirement', 'completed', '张三', 2, '## 迭代规划建议\n\n### Sprint 5 建议\n\n#### 目标\n集成AI能力，提升用户体验\n\n#### 任务分解\n1. AI需求生成（8点）\n2. AI代码建议（13点）\n3. AI测试用例生成（8点）\n\n#### 风险评估\n- AI接口稳定性\n- 响应时间\n- 成本控制\n\n#### 建议\n- 先做MVP验证\n- 逐步迭代优化', DATE_SUB(NOW(), INTERVAL 8 DAY), DATE_SUB(NOW(), INTERVAL 8 DAY)),
('ai-010', '代码重构方案', 'code', 'completed', '王五', 4, '## 代码重构方案\n\n### 问题\n- 代码重复度高\n- 模块耦合严重\n- 缺少单元测试\n\n### 重构步骤\n\n1. 提取公共方法\n```java\npublic class CommonUtils {\n    public static String formatDate(Date date) {\n        return new SimpleDateFormat("yyyy-MM-dd").format(date);\n    }\n}\n```\n\n2. 接口抽象\n```java\npublic interface DataService<T> {\n    T getById(Long id);\n    List<T> list();\n    void save(T entity);\n}\n```', DATE_SUB(NOW(), INTERVAL 9 DAY), DATE_SUB(NOW(), INTERVAL 9 DAY));

-- =====================================================
-- 10. AI新闻 (ai_news)
-- 字段: id, title, summary, source, source_icon, publish_time, category, tags, url, is_starred, relevance, created_at
-- =====================================================
INSERT INTO ai_news (id, title, summary, source, source_icon, publish_time, category, tags, url, is_starred, relevance, created_at) VALUES
('news-001', 'GPT-5即将发布，性能提升显著', 'OpenAI宣布GPT-5将于下月发布，在推理能力、多模态理解等方面有重大突破，将为AI应用带来新的可能性。', 'AI科技评论', '🤖', '今天', 'AI模型', '["GPT-5", "OpenAI", "大模型"]', 'https://example.com/news/gpt5', 1, 95, NOW()),
('news-002', 'Claude 3.5发布，编程能力大幅提升', 'Anthropic发布Claude 3.5，在代码生成、bug修复、代码解释等方面表现出色，成为开发者的得力助手。', 'InfoQ', '📰', '昨天', 'AI模型', '["Claude", "Anthropic", "编程"]', 'https://example.com/news/claude35', 1, 92, DATE_SUB(NOW(), INTERVAL 1 DAY)),
('news-003', 'AI编程助手市场竞争加剧', 'GitHub Copilot、Amazon CodeWhisperer、Google Gemini Code等AI编程助手竞争激烈，开发者有了更多选择。', '36氪', '📊', '2天前', 'AI工具', '["Copilot", "编程助手", "开发工具"]', 'https://example.com/news/ai-coding', 0, 88, DATE_SUB(NOW(), INTERVAL 2 DAY)),
('news-004', '企业AI应用落地加速', '越来越多企业开始将AI技术应用于实际业务场景，包括智能客服、文档处理、代码审查等领域。', '机器之心', '🏢', '3天前', '企业应用', '["企业AI", "落地应用", "数字化"]', 'https://example.com/news/enterprise-ai', 0, 85, DATE_SUB(NOW(), INTERVAL 3 DAY)),
('news-005', 'AI安全与伦理问题引发关注', '随着AI技术的快速发展，数据隐私、算法偏见、AI安全等问题日益受到重视，各国纷纷出台相关法规。', '新智元', '🔒', '4天前', 'AI安全', '["AI安全", "伦理", "法规"]', 'https://example.com/news/ai-safety', 0, 80, DATE_SUB(NOW(), INTERVAL 4 DAY)),
('news-006', '开源大模型生态蓬勃发展', 'Llama、Mistral、Qwen等开源大模型不断涌现，为企业提供了更多自主可控的AI解决方案。', 'CSDN', '💻', '5天前', '开源', '["开源", "Llama", "大模型"]', 'https://example.com/news/open-source-llm', 1, 90, DATE_SUB(NOW(), INTERVAL 5 DAY)),
('news-007', 'AI Agent成为新热点', 'AI Agent能够自主完成复杂任务，被认为是AI发展的下一个重要方向，各大厂商纷纷布局。', '量子位', '🤖', '6天前', 'AI趋势', '["AI Agent", "自主AI", "未来趋势"]', 'https://example.com/news/ai-agent', 1, 93, DATE_SUB(NOW(), INTERVAL 6 DAY)),
('news-008', 'RAG技术提升AI准确性', '检索增强生成(RAG)技术通过结合外部知识库，有效提升了AI回答的准确性和时效性。', 'AI前线', '📚', '1周前', 'AI技术', '["RAG", "知识库", "准确性"]', 'https://example.com/news/rag', 0, 87, DATE_SUB(NOW(), INTERVAL 7 DAY)),
('news-009', 'AI辅助项目管理成趋势', 'AI技术正在改变项目管理方式，从需求分析、任务分配到风险预测，AI都能提供有力支持。', 'PM圈子', '📋', '1周前', '项目管理', '["项目管理", "AI辅助", "效率提升"]', 'https://example.com/news/ai-pm', 1, 96, DATE_SUB(NOW(), INTERVAL 8 DAY)),
('news-010', '多模态AI应用场景拓展', '多模态AI能够同时处理文本、图像、音频等多种数据，应用场景不断拓展，市场前景广阔。', '雷锋网', '🎯', '1周前', 'AI应用', '["多模态", "应用场景", "市场"]', 'https://example.com/news/multimodal-ai', 0, 82, DATE_SUB(NOW(), INTERVAL 9 DAY));

-- =====================================================
-- 完成
-- =====================================================
SELECT '测试数据导入完成！' AS message;
SELECT '用户数量：' AS info, COUNT(*) AS count FROM sys_user;
SELECT '项目数量：' AS info, COUNT(*) AS count FROM project;
SELECT '迭代数量：' AS info, COUNT(*) AS count FROM sprint;
SELECT '任务数量：' AS info, COUNT(*) AS count FROM issue;
SELECT '活动数量：' AS info, COUNT(*) AS count FROM activity;
SELECT '通知数量：' AS info, COUNT(*) AS count FROM notification;
SELECT 'Wiki文档数量：' AS info, COUNT(*) AS count FROM wiki_document;
SELECT 'AI历史数量：' AS info, COUNT(*) AS count FROM ai_history;
SELECT 'AI新闻数量：' AS info, COUNT(*) AS count FROM ai_news;