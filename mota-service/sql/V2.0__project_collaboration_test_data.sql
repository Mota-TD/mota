-- =====================================================
-- Mota 项目协同模块 V2.0 - 测试数据
-- 创建日期: 2025-12-23
-- =====================================================

-- =====================================================
-- 1. 部门数据 (department)
-- =====================================================
INSERT INTO department (id, org_id, name, description, manager_id, parent_id, sort_order, status, created_at, updated_at, created_by) VALUES
(1, 'ORG001', '市场部', '负责品牌推广、市场营销、活动策划等工作', 2, NULL, 1, 1, NOW(), NOW(), 1),
(2, 'ORG001', '技术部', '负责产品研发、技术架构、系统维护等工作', 3, NULL, 2, 1, NOW(), NOW(), 1),
(3, 'ORG001', '运营部', '负责产品运营、用户增长、数据分析等工作', 4, NULL, 3, 1, NOW(), NOW(), 1),
(4, 'ORG001', '财务部', '负责财务管理、预算控制、成本核算等工作', 5, NULL, 4, 1, NOW(), NOW(), 1),
(5, 'ORG001', '人力资源部', '负责人才招聘、培训发展、绩效管理等工作', 6, NULL, 5, 1, NOW(), NOW(), 1),
(6, 'ORG001', '设计部', '负责UI设计、视觉设计、品牌设计等工作', 7, NULL, 6, 1, NOW(), NOW(), 1);

-- =====================================================
-- 2. 更新项目数据 - 添加日期字段
-- =====================================================
UPDATE project SET 
    start_date = '2025-01-01',
    end_date = '2025-03-31',
    priority = 'high'
WHERE id = 1;

UPDATE project SET 
    start_date = '2025-03-01',
    end_date = '2025-06-30',
    priority = 'medium'
WHERE id = 2;

-- =====================================================
-- 3. 项目部门关联数据 (project_department)
-- =====================================================
INSERT INTO project_department (project_id, department_id, created_at) VALUES
-- Mota项目关联部门
(1, 1, NOW()),  -- 市场部
(1, 2, NOW()),  -- 技术部
(1, 3, NOW()),  -- 运营部
(1, 6, NOW()),  -- 设计部
-- 电商平台项目关联部门
(2, 2, NOW()),  -- 技术部
(2, 3, NOW()),  -- 运营部
(2, 4, NOW());  -- 财务部

-- =====================================================
-- 4. 部门任务数据 (department_task)
-- =====================================================
INSERT INTO department_task (id, project_id, department_id, manager_id, name, description, status, priority, start_date, end_date, progress, require_plan, require_approval, created_at, updated_at, created_by) VALUES
-- Mota项目 - 市场部任务
(1, 1, 1, 2, '品牌推广活动策划与执行', '负责Q1品牌推广项目的线上推广部分，包括：\n1. 制定线上推广方案\n2. 设计推广物料\n3. 执行推广活动\n4. 数据分析与复盘\n\n预期成果：线上曝光量达到100万+，转化率不低于5%', 'in_progress', 'high', '2025-01-05', '2025-03-15', 40, 1, 1, NOW(), NOW(), 1),

-- Mota项目 - 技术部任务
(2, 1, 2, 3, '活动页面开发', '负责品牌推广活动的技术支持，包括：\n1. 活动落地页开发\n2. 数据埋点实现\n3. 性能优化\n4. 系统稳定性保障', 'in_progress', 'high', '2025-01-10', '2025-02-10', 70, 1, 0, NOW(), NOW(), 1),

-- Mota项目 - 运营部任务
(3, 1, 3, 4, '活动运营支持', '负责活动期间的运营支持工作，包括：\n1. 用户引导和转化\n2. 活动数据监控\n3. 用户反馈收集\n4. 活动效果分析', 'pending', 'medium', '2025-02-15', '2025-03-20', 0, 1, 0, NOW(), NOW(), 1),

-- Mota项目 - 设计部任务
(4, 1, 6, 7, '视觉设计支持', '负责品牌推广活动的视觉设计工作，包括：\n1. 主视觉设计\n2. 推广物料设计\n3. 落地页UI设计\n4. 社交媒体配图设计', 'plan_approved', 'high', '2025-01-05', '2025-01-30', 60, 1, 1, NOW(), NOW(), 1),

-- 电商平台项目 - 技术部任务
(5, 2, 2, 3, '支付系统重构', '对现有支付系统进行重构，包括：\n1. 支付接口优化\n2. 多渠道支付接入\n3. 支付安全加固\n4. 对账系统完善', 'in_progress', 'urgent', '2025-03-01', '2025-04-30', 45, 1, 1, NOW(), NOW(), 1);

-- =====================================================
-- 5. 工作计划数据 (work_plan)
-- =====================================================
INSERT INTO work_plan (id, department_task_id, summary, resource_requirement, status, submitted_by, submitted_at, reviewed_by, reviewed_at, review_comment, version, created_at, updated_at, created_by) VALUES
-- 市场部工作计划
(1, 1, '本次线上推广活动将分为三个阶段执行：\n\n第一阶段（1月5日-1月20日）：方案策划与物料准备\n- 完成推广方案设计\n- 设计制作推广物料\n- 确定推广渠道和预算\n\n第二阶段（1月21日-2月28日）：活动执行\n- 各渠道推广投放\n- 实时监控数据\n- 优化投放策略\n\n第三阶段（3月1日-3月15日）：数据分析与复盘\n- 汇总推广数据\n- 分析效果\n- 输出复盘报告', '人力: 5人\n预算: ¥50,000\n其他: 需要技术部支持落地页开发', 'approved', 2, '2025-01-06 10:00:00', 1, '2025-01-06 14:00:00', '方案整体可行，注意控制预算，及时汇报进度。', 1, NOW(), NOW(), 2),

-- 设计部工作计划
(2, 4, '视觉设计工作计划：\n\n1. 主视觉设计（1月5日-1月10日）\n- 确定设计风格\n- 完成主视觉稿\n- 内部评审修改\n\n2. 推广物料设计（1月11日-1月20日）\n- 海报设计\n- Banner设计\n- 社交媒体配图\n\n3. 落地页UI设计（1月15日-1月25日）\n- 页面结构设计\n- 交互设计\n- 视觉稿输出\n\n4. 设计验收（1月26日-1月30日）\n- 设计走查\n- 问题修复\n- 最终交付', '人力: 3人\n设计软件: Figma、PS、AI\n其他: 需要市场部提供文案内容', 'approved', 7, '2025-01-05 16:00:00', 1, '2025-01-05 18:00:00', '同意，请按计划执行。', 1, NOW(), NOW(), 7),

-- 技术部工作计划
(3, 2, '活动页面开发计划：\n\n1. 需求分析（1月10日-1月12日）\n- 与设计部对接UI稿\n- 确定技术方案\n- 评估开发工作量\n\n2. 开发实现（1月13日-1月30日）\n- 前端页面开发\n- 后端接口开发\n- 数据埋点实现\n\n3. 测试优化（1月31日-2月5日）\n- 功能测试\n- 性能优化\n- Bug修复\n\n4. 上线部署（2月6日-2月10日）\n- 预发布验证\n- 正式上线\n- 监控保障', '人力: 4人\n服务器资源: 需要申请活动专用服务器\n其他: 需要运维支持', 'submitted', 3, '2025-01-10 09:00:00', NULL, NULL, NULL, 1, NOW(), NOW(), 3);

-- =====================================================
-- 6. 工作计划附件数据 (work_plan_attachment)
-- =====================================================
INSERT INTO work_plan_attachment (id, work_plan_id, file_name, file_url, file_size, file_type, uploaded_by, created_at) VALUES
(1, 1, 'Q1线上推广工作计划.docx', '/uploads/plans/q1_promotion_plan.docx', 1024000, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 2, NOW()),
(2, 1, '推广预算明细.xlsx', '/uploads/plans/promotion_budget.xlsx', 512000, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 2, NOW()),
(3, 1, '推广渠道分析.pdf', '/uploads/plans/channel_analysis.pdf', 2048000, 'application/pdf', 2, NOW()),
(4, 2, '视觉设计工作计划.pdf', '/uploads/plans/design_plan.pdf', 1536000, 'application/pdf', 7, NOW());

-- =====================================================
-- 7. 执行任务数据 (task)
-- =====================================================
INSERT INTO task (id, department_task_id, project_id, name, description, assignee_id, status, priority, start_date, end_date, progress, progress_note, sort_order, completed_at, created_at, updated_at, created_by) VALUES
-- 市场部执行任务
(1, 1, 1, '制定推广方案', '根据项目目标制定详细的线上推广方案，包括推广策略、渠道选择、预算分配等', 2, 'completed', 'high', '2025-01-05', '2025-01-15', 100, '推广方案已完成并通过评审', 1, '2025-01-14 17:00:00', NOW(), NOW(), 2),
(2, 1, 1, '设计推广物料', '根据推广方案设计以下物料：\n1. 主视觉海报 (3张)\n2. 社交媒体配图 (10张)\n3. 活动落地页设计\n4. 广告Banner (5个尺寸)', 8, 'in_progress', 'high', '2025-01-16', '2025-01-25', 60, '已完成主视觉海报设计，社交媒体配图完成6张，落地页设计进行中', 2, NULL, NOW(), NOW(), 2),
(3, 1, 1, '确定推广渠道', '分析各推广渠道的效果和成本，确定最终的推广渠道组合', 2, 'in_progress', 'medium', '2025-01-10', '2025-01-20', 40, '已完成渠道初步筛选，正在进行成本效益分析', 3, NULL, NOW(), NOW(), 2),
(4, 1, 1, '执行推广投放', '按照推广方案在各渠道执行推广投放，监控投放效果', 8, 'pending', 'high', '2025-01-26', '2025-02-28', 0, NULL, 4, NULL, NOW(), NOW(), 2),
(5, 1, 1, '数据分析与复盘', '汇总推广数据，分析推广效果，输出复盘报告', 2, 'pending', 'medium', '2025-03-01', '2025-03-15', 0, NULL, 5, NULL, NOW(), NOW(), 2),

-- 技术部执行任务
(6, 2, 1, '前端页面开发', '根据设计稿开发活动落地页前端页面', 3, 'in_progress', 'high', '2025-01-13', '2025-01-25', 80, '页面主体开发完成，正在进行响应式适配', 1, NULL, NOW(), NOW(), 3),
(7, 2, 1, '后端接口开发', '开发活动相关的后端接口，包括用户参与、数据统计等', 4, 'in_progress', 'high', '2025-01-13', '2025-01-28', 60, '核心接口已完成，正在开发数据统计接口', 2, NULL, NOW(), NOW(), 3),
(8, 2, 1, '数据埋点实现', '实现活动页面的数据埋点，用于后续数据分析', 3, 'pending', 'medium', '2025-01-26', '2025-01-30', 0, NULL, 3, NULL, NOW(), NOW(), 3),
(9, 2, 1, '性能优化', '对活动页面进行性能优化，确保高并发下的稳定性', 4, 'pending', 'medium', '2025-01-31', '2025-02-05', 0, NULL, 4, NULL, NOW(), NOW(), 3),

-- 设计部执行任务
(10, 4, 1, '主视觉设计', '设计活动主视觉，确定整体设计风格', 7, 'completed', 'high', '2025-01-05', '2025-01-10', 100, '主视觉设计已完成并通过评审', 1, '2025-01-10 16:00:00', NOW(), NOW(), 7),
(11, 4, 1, '海报设计', '设计3张活动宣传海报', 7, 'completed', 'high', '2025-01-11', '2025-01-15', 100, '3张海报设计完成', 2, '2025-01-15 14:00:00', NOW(), NOW(), 7),
(12, 4, 1, '落地页UI设计', '设计活动落地页的UI界面', 8, 'in_progress', 'high', '2025-01-15', '2025-01-25', 70, '主要页面设计完成，正在设计细节和交互', 3, NULL, NOW(), NOW(), 7),
(13, 4, 1, '社交媒体配图设计', '设计10张社交媒体推广配图', 8, 'in_progress', 'medium', '2025-01-16', '2025-01-22', 60, '已完成6张配图设计', 4, NULL, NOW(), NOW(), 7);

-- =====================================================
-- 8. 任务交付物数据 (deliverable)
-- =====================================================
INSERT INTO deliverable (id, task_id, name, file_name, file_url, file_size, file_type, description, uploaded_by, created_at) VALUES
(1, 1, '推广方案文档', 'Q1推广方案_终版.pdf', '/uploads/deliverables/q1_promotion_plan_final.pdf', 3072000, 'application/pdf', 'Q1品牌推广方案终版，包含推广策略、渠道选择、预算分配等内容', 2, NOW()),
(2, 10, '主视觉设计稿', '主视觉设计稿_v3.psd', '/uploads/deliverables/main_visual_v3.psd', 52428800, 'image/vnd.adobe.photoshop', '活动主视觉设计稿，包含源文件', 7, NOW()),
(3, 11, '海报设计稿', '活动海报_1-3.zip', '/uploads/deliverables/posters_1-3.zip', 15728640, 'application/zip', '3张活动宣传海报设计稿', 7, NOW()),
(4, 2, '社交媒体配图', '社交媒体配图_1-6.zip', '/uploads/deliverables/social_media_1-6.zip', 10485760, 'application/zip', '已完成的6张社交媒体配图', 8, NOW());

-- =====================================================
-- 9. 项目里程碑数据 (milestone)
-- =====================================================
INSERT INTO milestone (id, project_id, name, description, target_date, status, completed_at, sort_order, created_at, updated_at, created_by) VALUES
(1, 1, '方案确定', '完成推广方案设计和评审', '2025-01-15', 'completed', '2025-01-14 17:00:00', 1, NOW(), NOW(), 1),
(2, 1, '物料准备完成', '完成所有推广物料的设计和制作', '2025-02-01', 'pending', NULL, 2, NOW(), NOW(), 1),
(3, 1, '活动上线', '推广活动正式上线', '2025-02-15', 'pending', NULL, 3, NOW(), NOW(), 1),
(4, 1, '项目复盘', '完成项目复盘和总结报告', '2025-03-31', 'pending', NULL, 4, NOW(), NOW(), 1);

-- =====================================================
-- 10. 更新项目成员数据 - 添加部门信息
-- =====================================================
UPDATE project_member SET department_id = 1, role = 'department_manager' WHERE project_id = 1 AND user_id = 2;
UPDATE project_member SET department_id = 2, role = 'department_manager' WHERE project_id = 1 AND user_id = 3;
UPDATE project_member SET department_id = 2, role = 'member' WHERE project_id = 1 AND user_id = 4;
UPDATE project_member SET department_id = 3, role = 'member' WHERE project_id = 1 AND user_id = 5;
UPDATE project_member SET department_id = 2, role = 'member' WHERE project_id = 1 AND user_id = 6;
UPDATE project_member SET department_id = 6, role = 'department_manager' WHERE project_id = 1 AND user_id = 7;

-- =====================================================
-- 11. 任务评论数据 (task_comment)
-- =====================================================
INSERT INTO task_comment (id, task_id, parent_id, user_id, content, mentioned_users, like_count, created_at, updated_at) VALUES
(1, 2, NULL, 2, '@小李 海报设计的整体风格很好，但是有几点建议：\n1. 主色调可以再鲜艳一些，突出品牌特色\n2. 文案部分字体可以再大一点\n3. 建议增加一个二维码入口', '[8]', 2, '2025-01-18 09:30:00', '2025-01-18 09:30:00'),
(2, 2, 1, 8, '收到，我会按照您的建议修改，预计今天下午完成。', NULL, 1, '2025-01-18 10:15:00', '2025-01-18 10:15:00'),
(3, 2, 1, 2, '好的，辛苦了！', NULL, 0, '2025-01-18 10:20:00', '2025-01-18 10:20:00'),
(4, 2, NULL, 3, '我这边推广方案已经定稿了，@小李 可以参考方案中的视觉风格要求来设计物料。', '[8]', 3, '2025-01-17 16:45:00', '2025-01-17 16:45:00'),
(5, 6, NULL, 7, '@李四 前端开发进度如何？设计稿有什么问题可以随时沟通。', '[3]', 1, '2025-01-20 14:00:00', '2025-01-20 14:00:00'),
(6, 6, 5, 3, '进度正常，有几个交互细节想和你确认一下，下午开个会讨论？', NULL, 1, '2025-01-20 14:30:00', '2025-01-20 14:30:00');

-- =====================================================
-- 12. 工作反馈数据 (work_feedback)
-- =====================================================
INSERT INTO work_feedback (id, project_id, task_id, feedback_type, from_user_id, to_user_id, title, content, rating, require_reply, status, reply_content, replied_at, created_at, updated_at) VALUES
(1, 1, 2, 'evaluation', 2, 8, '海报设计工作评价', '本次海报设计整体完成度较高，有以下亮点：\n1. 色彩搭配协调，符合品牌调性\n2. 排版清晰，信息层次分明\n\n改进建议：\n1. 可以尝试更多创意元素\n2. 注意不同尺寸的适配效果', 4, 0, 'read', NULL, NULL, '2025-01-18 11:00:00', '2025-01-18 11:00:00'),
(2, 1, 2, 'guidance', 2, 8, '设计工作指导', '设计时注意以下几点：\n1. 保持品牌视觉一致性\n2. 注意文字可读性\n3. 预留足够的安全边距\n4. 考虑不同平台的展示效果', NULL, 1, 'replied', '收到，我会注意这些要点，感谢指导！', '2025-01-15 16:00:00', '2025-01-15 14:00:00', '2025-01-15 16:00:00'),
(3, 1, 6, 'problem', 3, 7, '设计稿问题反馈', '关于落地页设计有个问题想请教：\n页面底部的按钮在移动端显示时会被遮挡，是否可以调整一下位置？', NULL, 1, 'replied', '好的，我调整一下设计，把按钮位置上移，稍后发你新版设计稿。', '2025-01-19 11:00:00', '2025-01-19 10:00:00', '2025-01-19 11:00:00');

-- =====================================================
-- 13. 进度汇报数据 (progress_report)
-- =====================================================
INSERT INTO progress_report (id, project_id, department_task_id, report_type, reporter_id, report_period_start, report_period_end, completed_work, planned_work, issues_risks, support_needed, task_progress, recipients, status, submitted_at, created_at, updated_at) VALUES
(1, 1, 1, 'weekly', 2, '2025-01-13', '2025-01-19', '1. 完成推广方案初稿设计\n2. 完成3张主视觉海报设计\n3. 完成6张社交媒体配图\n4. 与技术部对接落地页需求', '1. 完成剩余推广物料设计\n2. 确定最终推广渠道\n3. 准备推广投放素材', '1. 落地页开发进度可能影响整体上线时间\n2. 部分渠道报价超出预算，需要协调', '希望能协调技术部加快落地页开发进度', '{"task_1": 100, "task_2": 60, "task_3": 40}', '[1, 2]', 'submitted', '2025-01-19 18:00:00', NOW(), NOW()),
(2, 1, 2, 'weekly', 3, '2025-01-13', '2025-01-19', '1. 完成前端页面主体开发\n2. 完成核心后端接口开发\n3. 与设计部完成设计稿对接', '1. 完成响应式适配\n2. 完成数据统计接口\n3. 开始数据埋点实现', '前端开发人员本周有一天请假，进度略有延迟', '无', '{"task_6": 80, "task_7": 60}', '[1, 3]', 'submitted', '2025-01-19 17:30:00', NOW(), NOW());

-- =====================================================
-- 完成
-- =====================================================
SELECT 'V2.0 项目协同模块测试数据导入完成！' AS message;