-- Test Data for Mota Project
-- UTF-8 Encoding

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- Projects
INSERT INTO project (id, org_id, name, `key`, description, status, owner_id, color, starred, progress, member_count, issue_count) VALUES
(1, 'default', 'Mota Platform', 'MOTA', 'Mota AI Platform Development', 'active', 1, '#1677ff', 1, 65, 5, 24),
(2, 'default', 'Website Redesign', 'WEB', 'Company Website Redesign Project', 'active', 2, '#52c41a', 0, 40, 3, 12),
(3, 'default', 'Mobile App', 'APP', 'Mobile Application Development', 'active', 3, '#722ed1', 1, 25, 4, 18),
(4, 'default', 'Data Analytics', 'DATA', 'Data Analytics Platform', 'completed', 1, '#fa8c16', 0, 100, 3, 8);

-- Project Members
INSERT INTO project_member (project_id, user_id, role) VALUES
(1, 1, 'owner'), (1, 2, 'developer'), (1, 3, 'developer'), (1, 4, 'tester'), (1, 5, 'designer'),
(2, 2, 'owner'), (2, 3, 'developer'), (2, 5, 'designer'),
(3, 3, 'owner'), (3, 1, 'developer'), (3, 2, 'developer'), (3, 4, 'tester'),
(4, 1, 'owner'), (4, 2, 'developer'), (4, 4, 'tester');

-- Sprints
INSERT INTO sprint (id, project_id, name, goal, status, start_date, end_date, total_points, completed_points) VALUES
(1, 1, 'Sprint 1', 'Basic Architecture', 'completed', '2024-01-01', '2024-01-14', 40, 40),
(2, 1, 'Sprint 2', 'AI Features', 'active', '2024-01-15', '2024-01-28', 35, 20),
(3, 1, 'Sprint 3', 'Optimization', 'planning', '2024-01-29', '2024-02-11', 30, 0),
(4, 2, 'Sprint 1', 'Design Phase', 'active', '2024-01-10', '2024-01-24', 25, 15),
(5, 3, 'Sprint 1', 'Prototype', 'active', '2024-01-08', '2024-01-22', 30, 10);

-- Issues
INSERT INTO issue (id, project_id, issue_key, type, title, description, status, priority, assignee_id, reporter_id, sprint_id, story_points, due_date) VALUES
(1, 1, 'MOTA-1', 'story', 'User Login Feature', 'Implement user login and registration', 'done', 'high', 2, 1, 1, 5, '2024-01-10'),
(2, 1, 'MOTA-2', 'story', 'Project Management', 'Project CRUD and member management', 'done', 'high', 3, 1, 1, 8, '2024-01-12'),
(3, 1, 'MOTA-3', 'story', 'Task Management', 'Task CRUD and status workflow', 'done', 'high', 2, 1, 1, 8, '2024-01-14'),
(4, 1, 'MOTA-4', 'story', 'AI Solution Generator', 'AI-powered solution generation', 'in_progress', 'highest', 2, 1, 2, 13, '2024-01-25'),
(5, 1, 'MOTA-5', 'story', 'AI PPT Generator', 'AI-powered PPT generation', 'in_progress', 'high', 3, 1, 2, 13, '2024-01-26'),
(6, 1, 'MOTA-6', 'task', 'Database Optimization', 'Optimize database schema and indexes', 'done', 'medium', 2, 1, 1, 5, '2024-01-08'),
(7, 1, 'MOTA-7', 'bug', 'Login Page Style Issue', 'Mobile login page layout broken', 'done', 'medium', 5, 4, 1, 2, '2024-01-09'),
(8, 1, 'MOTA-8', 'task', 'API Documentation', 'Write API documentation', 'in_progress', 'low', 2, 1, 2, 3, '2024-01-28'),
(9, 1, 'MOTA-9', 'story', 'News Tracking', 'AI news tracking feature', 'open', 'medium', 3, 1, 3, 8, '2024-02-10'),
(10, 1, 'MOTA-10', 'bug', 'Generation Timeout', 'Large text generation timeout', 'open', 'high', 2, 4, 2, 3, '2024-01-27'),
(11, 2, 'WEB-1', 'story', 'Homepage Design', 'Design new homepage', 'done', 'high', 5, 2, 4, 5, '2024-01-18'),
(12, 2, 'WEB-2', 'story', 'Product Page Design', 'Design product pages', 'in_progress', 'high', 5, 2, 4, 5, '2024-01-22'),
(13, 2, 'WEB-3', 'task', 'Responsive Layout', 'Implement responsive design', 'open', 'medium', 3, 2, 4, 8, '2024-01-24'),
(14, 3, 'APP-1', 'story', 'App Framework', 'Setup React Native project', 'done', 'high', 2, 3, 5, 5, '2024-01-15'),
(15, 3, 'APP-2', 'story', 'Login Module', 'Implement app login', 'in_progress', 'high', 2, 3, 5, 5, '2024-01-20'),
(16, 3, 'APP-3', 'story', 'Home Screen', 'Develop home screen', 'open', 'medium', 1, 3, 5, 8, '2024-01-22');

-- Activities
INSERT INTO activity (id, type, action, target, target_id, user_id, project_id, time, created_at) VALUES
(1, 'issue_created', 'Created task', 'MOTA-10', 10, 4, 1, '10 min ago', NOW()),
(2, 'issue_updated', 'Updated task status', 'MOTA-4', 4, 2, 1, '30 min ago', NOW()),
(3, 'comment_added', 'Commented on task', 'MOTA-5', 5, 3, 1, '1 hour ago', NOW()),
(4, 'issue_completed', 'Completed task', 'MOTA-7', 7, 5, 1, '2 hours ago', NOW()),
(5, 'member_joined', 'Joined project', 'Mota Platform', 1, 5, 1, '3 hours ago', NOW()),
(6, 'sprint_started', 'Started sprint', 'Sprint 2', 2, 1, 1, '1 day ago', NOW()),
(7, 'project_created', 'Created project', 'Mobile App', 3, 3, 3, '2 days ago', NOW()),
(8, 'issue_created', 'Created task', 'WEB-3', 13, 2, 2, '2 days ago', NOW());

-- Notifications
INSERT INTO notification (id, type, title, content, user_id, is_read, related_id, related_type, created_at) VALUES
(1, 'task_assigned', 'New Task Assigned', 'You have been assigned task MOTA-4', 2, 0, 4, 'issue', NOW()),
(2, 'comment', 'New Comment', 'Zhang San commented on your task MOTA-5', 3, 0, 5, 'issue', NOW()),
(3, 'mention', 'You were mentioned', 'Li Si mentioned you in task MOTA-8', 2, 1, 8, 'issue', NOW()),
(4, 'sprint_start', 'Sprint Started', 'Sprint 2 has started', 2, 1, 2, 'sprint', NOW()),
(5, 'task_completed', 'Task Completed', 'Task MOTA-7 has been completed', 1, 0, 7, 'issue', NOW()),
(6, 'project_invite', 'Project Invitation', 'You have been invited to Mobile App project', 4, 0, 3, 'project', NOW()),
(7, 'deadline_reminder', 'Deadline Reminder', 'Task MOTA-4 is due in 2 days', 2, 0, 4, 'issue', NOW()),
(8, 'system', 'System Notice', 'System maintenance scheduled for tonight', 1, 1, NULL, NULL, NOW());

-- Wiki Documents
INSERT INTO wiki_document (id, project_id, title, content, parent_id, sort, created_by, created_at, updated_at) VALUES
(1, 1, 'Project Overview', '# Mota Platform\n\n## Introduction\nMota is an AI-powered enterprise solution platform...', NULL, 1, 1, NOW(), NOW()),
(2, 1, 'Technical Architecture', '# Technical Architecture\n\n## Frontend\n- React 18\n- TypeScript\n- Ant Design\n\n## Backend\n- Spring Boot 3\n- MySQL 8\n- Redis', NULL, 2, 1, NOW(), NOW()),
(3, 1, 'API Documentation', '# API Documentation\n\n## Authentication\n\n### Login\n```\nPOST /api/v1/auth/login\n```', NULL, 3, 1, NOW(), NOW()),
(4, 1, 'Development Guide', '# Development Guide\n\n## Code Standards\n- Use ESLint for code checking\n- Use Prettier for formatting', 1, 1, 1, NOW(), NOW()),
(5, 2, 'Design Guidelines', '# Design Guidelines\n\n## Colors\nPrimary: #1677ff\nSecondary: #52c41a', NULL, 1, 2, NOW(), NOW());

-- AI History
INSERT INTO ai_history (id, title, type, status, creator, creator_id, content, created_at, updated_at) VALUES
('SOL-001', 'Business Proposal', 'solution', 'completed', 'Admin', 1, '# Business Proposal\n\n## Background\n...', NOW(), NOW()),
('PPT-001', 'Product Introduction PPT', 'ppt', 'completed', 'Admin', 1, 'PPT content...', NOW(), NOW()),
('MKT-001', 'Marketing Campaign', 'marketing', 'completed', 'Zhang San', 2, '# Marketing Campaign\n\n## Goals\n...', NOW(), NOW()),
('SOL-002', 'Technical Architecture', 'solution', 'completed', 'Li Si', 3, '# Technical Architecture\n\n## System Design\n...', NOW(), NOW()),
('NEWS-001', 'Industry News Weekly', 'news', 'completed', 'Admin', 1, '# Industry News\n\n## Headlines\n...', NOW(), NOW());

-- AI News
INSERT INTO ai_news (id, title, summary, source, publish_time, category, tags, url, is_starred, relevance, created_at) VALUES
('1', 'GPT-5 Released with Major Improvements', 'OpenAI released GPT-5 with significant improvements in reasoning and multimodal understanding...', '36Kr', '2 hours ago', 'AI Technology', '["GPT-5", "OpenAI", "LLM"]', '#', 1, 95, NOW()),
('2', 'Enterprise Digital Transformation Report', 'Latest research shows 80% of enterprises consider AI as core driver for digital transformation...', 'Yiou', '4 hours ago', 'Industry Trends', '["Digital Transformation", "Enterprise", "AI"]', '#', 0, 88, NOW()),
('3', 'SaaS Industry AI Revolution', 'AI technology is transforming the SaaS industry, with automation becoming the main trend...', 'Huxiu', '6 hours ago', 'Industry Trends', '["SaaS", "Automation", "AI"]', '#', 1, 92, NOW()),
('4', 'Chinese Tech Giants Race in AI', 'Baidu, Alibaba, and Tencent are intensifying competition in AI large models...', 'TMT Post', '8 hours ago', 'AI Technology', '["LLM", "Baidu", "Alibaba", "Tencent"]', '#', 0, 85, NOW()),
('5', 'AI Marketing Tools Market Exceeds 10 Billion', 'AI marketing tools market has exceeded 10 billion yuan with 30% annual growth expected...', 'iResearch', '1 day ago', 'Market Analysis', '["AI Marketing", "Market Size", "Growth"]', '#', 0, 90, NOW());