/**
 * Mock 数据定义
 * 用于前端开发和演示
 */

// 用户数据
export const mockUsers = [
  { id: 1, name: '管理员', email: 'admin@mota.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin', role: 'admin' },
  { id: 2, name: '张三', email: 'zhangsan@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1', role: 'admin' },
  { id: 3, name: '李四', email: 'lisi@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2', role: 'developer' },
  { id: 4, name: '王五', email: 'wangwu@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3', role: 'tester' },
  { id: 5, name: '赵六', email: 'zhaoliu@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=4', role: 'developer' },
  { id: 6, name: '钱七', email: 'qianqi@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=5', role: 'pm' },
]

// 团队数据
export const mockTeams = [
  { id: 1, name: '示例团队', avatar: '示', color: '#2b7de9', memberCount: 12 },
  { id: 2, name: '开发团队', avatar: '开', color: '#10b981', memberCount: 8 },
  { id: 3, name: '产品团队', avatar: '产', color: '#f59e0b', memberCount: 5 },
]

// 项目数据
export const mockProjects = [
  {
    id: 1,
    name: '前端项目',
    key: 'FE',
    description: 'Web 前端应用开发，包括用户界面、交互逻辑等',
    status: 'active',
    owner: 1,
    memberCount: 5,
    issueCount: 45,
    color: '#2b7de9',
    starred: true,
    progress: 68,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15'
  },
  {
    id: 2,
    name: '后端服务',
    key: 'BE',
    description: 'API 服务开发，提供数据接口和业务逻辑处理',
    status: 'active',
    owner: 2,
    memberCount: 4,
    issueCount: 32,
    color: '#10b981',
    starred: false,
    progress: 45,
    createdAt: '2024-01-02',
    updatedAt: '2024-01-14'
  },
  {
    id: 3,
    name: '移动端项目',
    key: 'MB',
    description: 'iOS/Android 移动应用开发',
    status: 'active',
    owner: 1,
    memberCount: 3,
    issueCount: 28,
    color: '#f59e0b',
    starred: true,
    progress: 82,
    createdAt: '2024-01-03',
    updatedAt: '2024-01-13'
  },
  {
    id: 4,
    name: '数据平台',
    key: 'DP',
    description: '数据分析和可视化平台',
    status: 'archived',
    owner: 3,
    memberCount: 2,
    issueCount: 15,
    color: '#8b5cf6',
    starred: false,
    progress: 100,
    createdAt: '2023-12-01',
    updatedAt: '2024-01-10'
  },
]

// 事项数据
export const mockIssues = [
  { 
    id: 1, 
    key: 'FE-1024', 
    title: '登录页面在移动端显示异常', 
    type: 'bug', 
    status: 'open', 
    priority: 'high', 
    assignee: 1, 
    reporter: 2, 
    projectId: 1, 
    sprintId: 1, 
    storyPoints: 3, 
    description: '在 iPhone 12 上测试时发现登录按钮位置偏移，输入框样式异常',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15'
  },
  { 
    id: 2, 
    key: 'FE-1025', 
    title: '实现用户权限管理模块', 
    type: 'story', 
    status: 'in_progress', 
    priority: 'medium', 
    assignee: 2, 
    reporter: 1, 
    projectId: 1, 
    sprintId: 1, 
    storyPoints: 8,
    description: '需要实现基于角色的权限控制系统，包括角色管理、权限分配等功能',
    createdAt: '2024-01-14',
    updatedAt: '2024-01-15'
  },
  { 
    id: 3, 
    key: 'FE-1026', 
    title: '编写API接口文档', 
    type: 'task', 
    status: 'done', 
    priority: 'low', 
    assignee: 3, 
    reporter: 1, 
    projectId: 1, 
    sprintId: 1, 
    storyPoints: 2,
    description: '整理并编写前端调用的所有 API 接口文档',
    createdAt: '2024-01-13',
    updatedAt: '2024-01-14'
  },
  { 
    id: 4, 
    key: 'BE-1001', 
    title: '优化数据库查询性能', 
    type: 'task', 
    status: 'in_progress', 
    priority: 'high', 
    assignee: 2, 
    reporter: 2, 
    projectId: 2, 
    sprintId: 2, 
    storyPoints: 5,
    description: '对慢查询进行优化，添加必要的索引',
    createdAt: '2024-01-12',
    updatedAt: '2024-01-15'
  },
  { 
    id: 5, 
    key: 'BE-1002', 
    title: '实现缓存机制', 
    type: 'story', 
    status: 'open', 
    priority: 'medium', 
    assignee: 4, 
    reporter: 2, 
    projectId: 2, 
    sprintId: 2, 
    storyPoints: 8,
    description: '使用 Redis 实现数据缓存，提高系统响应速度',
    createdAt: '2024-01-11',
    updatedAt: '2024-01-11'
  },
  { 
    id: 6, 
    key: 'MB-501', 
    title: '首页加载速度优化', 
    type: 'task', 
    status: 'testing', 
    priority: 'high', 
    assignee: 1, 
    reporter: 3, 
    projectId: 3, 
    sprintId: 3, 
    storyPoints: 5,
    description: '优化首页资源加载，减少首屏渲染时间',
    createdAt: '2024-01-10',
    updatedAt: '2024-01-14'
  },
]

// 迭代数据
export const mockSprints = [
  { 
    id: 1, 
    name: 'Sprint 12', 
    projectId: 1, 
    status: 'active', 
    startDate: '2024-01-01', 
    endDate: '2024-01-14', 
    goal: '完成用户模块重构',
    totalPoints: 21,
    completedPoints: 13
  },
  { 
    id: 2, 
    name: 'Sprint 13', 
    projectId: 1, 
    status: 'planning', 
    startDate: '2024-01-15', 
    endDate: '2024-01-28', 
    goal: '实现权限管理功能',
    totalPoints: 0,
    completedPoints: 0
  },
  { 
    id: 3, 
    name: 'Sprint 8', 
    projectId: 2, 
    status: 'active', 
    startDate: '2024-01-01', 
    endDate: '2024-01-14', 
    goal: '性能优化',
    totalPoints: 18,
    completedPoints: 8
  },
  { 
    id: 4, 
    name: 'Sprint 5', 
    projectId: 3, 
    status: 'completed', 
    startDate: '2023-12-18', 
    endDate: '2023-12-31', 
    goal: '首页改版',
    totalPoints: 24,
    completedPoints: 24
  },
]

// Wiki 页面数据
export const mockWikiPages = [
  { id: 1, title: '产品需求文档', parentId: null, content: '# 产品需求文档\n\n## 概述\n\n这是产品需求文档的概述...', author: 1, updatedAt: '2024-01-15' },
  { id: 2, title: '技术架构设计', parentId: null, content: '# 技术架构设计\n\n## 系统架构\n\n...', author: 2, updatedAt: '2024-01-14' },
  { id: 3, title: 'API 接口文档', parentId: 2, content: '# API 接口文档\n\n## 用户接口\n\n...', author: 2, updatedAt: '2024-01-13' },
  { id: 4, title: '开发规范', parentId: null, content: '# 开发规范\n\n## 代码规范\n\n...', author: 1, updatedAt: '2024-01-12' },
]

// 通知数据
export const mockNotifications = [
  { id: 1, type: 'issue', title: '李四 将事项 #1024 分配给了你', time: '5分钟前', read: false, link: '/issues/1' },
  { id: 2, type: 'merge', title: '王五 请求你审核合并请求 !42', time: '15分钟前', read: false, link: '/merge-requests/42' },
  { id: 3, type: 'build', title: '构建 #1234 已完成', time: '1小时前', read: true, link: '/builds/1234' },
  { id: 4, type: 'comment', title: '赵六 评论了你的事项 #1025', time: '2小时前', read: true, link: '/issues/2' },
  { id: 5, type: 'system', title: '系统将于今晚 22:00 进行维护', time: '3小时前', read: false, link: '#' },
]

// 活动动态数据
export const mockActivities = [
  { id: 1, userId: 1, action: '创建了事项', target: 'FE-1024 登录页面在移动端显示异常', time: '10分钟前', type: 'issue' },
  { id: 2, userId: 2, action: '完成了事项', target: 'FE-1023 优化首页加载速度', time: '30分钟前', type: 'issue' },
  { id: 3, userId: 3, action: '提交了代码', target: 'feat: 添加用户权限管理功能', time: '1小时前', type: 'commit' },
  { id: 4, userId: 1, action: '创建了合并请求', target: '!42 用户模块重构', time: '2小时前', type: 'merge' },
  { id: 5, userId: 4, action: '评论了事项', target: 'BE-1001 优化数据库查询性能', time: '3小时前', type: 'comment' },
]

// 效能指标数据
export const mockMetrics = {
  dora: {
    deploymentFrequency: { value: 4.2, unit: '次/周', trend: 12, level: 'elite' },
    leadTime: { value: 2.3, unit: '天', trend: -8, level: 'high' },
    changeFailureRate: { value: 3.2, unit: '%', trend: -15, level: 'elite' },
    mttr: { value: 1.5, unit: '小时', trend: -20, level: 'high' },
  },
  codeQuality: {
    coverage: 78.5,
    duplication: 4.2,
    technicalDebt: '3天2小时',
    codeSmells: 23,
  },
  buildStats: {
    total: 156,
    success: 142,
    failed: 14,
    successRate: 91,
  },
  issueStats: {
    completed: 45,
    inProgress: 23,
    pending: 12,
  },
}

// 仪表盘统计数据
export const mockDashboardStats = {
  pendingIssues: 24,
  completedIssues: 156,
  activeIterations: 3,
  teamMembers: 12,
}