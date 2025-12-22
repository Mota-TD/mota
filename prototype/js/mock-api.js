/**
 * 摩塔 Mota - Mock API 服务模块
 * 提供统一的模拟后端 API 接口，用于前端开发和演示
 */

// ==================== Mock API 配置 ====================
const MockAPI = {
    // 模拟网络延迟（毫秒）
    delay: 300,
    
    // 是否启用模拟延迟
    enableDelay: true,
    
    // 模拟请求成功率（用于测试错误处理）
    successRate: 1.0,
    
    // 模拟延迟函数
    async simulateDelay() {
        if (this.enableDelay) {
            await new Promise(resolve => setTimeout(resolve, this.delay));
        }
    },
    
    // 模拟请求结果
    async simulateRequest(data, errorMessage = '请求失败') {
        await this.simulateDelay();
        
        if (Math.random() > this.successRate) {
            throw new Error(errorMessage);
        }
        
        return {
            code: 200,
            message: 'success',
            data: data,
            timestamp: Date.now()
        };
    }
};

// ==================== Mock 数据存储 ====================
const MockData = {
    // 用户数据
    users: [
        { id: 1, name: '张三', email: 'zhangsan@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1', role: 'admin' },
        { id: 2, name: '李四', email: 'lisi@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2', role: 'developer' },
        { id: 3, name: '王五', email: 'wangwu@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3', role: 'tester' },
        { id: 4, name: '赵六', email: 'zhaoliu@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=4', role: 'developer' },
        { id: 5, name: '钱七', email: 'qianqi@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=5', role: 'pm' }
    ],
    
    // 团队数据
    teams: [
        { id: 1, name: '示例团队', avatar: '示', color: '#2b7de9', memberCount: 12 },
        { id: 2, name: '开发团队', avatar: '开', color: '#10b981', memberCount: 8 },
        { id: 3, name: '产品团队', avatar: '产', color: '#f59e0b', memberCount: 5 }
    ],
    
    // 项目数据
    projects: [
        { id: 1, name: '前端项目', key: 'FE', description: 'Web 前端应用开发', status: 'active', owner: 1, memberCount: 5, issueCount: 45, color: '#2b7de9' },
        { id: 2, name: '后端服务', key: 'BE', description: 'API 服务开发', status: 'active', owner: 2, memberCount: 4, issueCount: 32, color: '#10b981' },
        { id: 3, name: '移动端项目', key: 'MB', description: 'iOS/Android 应用', status: 'active', owner: 1, memberCount: 3, issueCount: 28, color: '#f59e0b' },
        { id: 4, name: '数据平台', key: 'DP', description: '数据分析平台', status: 'archived', owner: 3, memberCount: 2, issueCount: 15, color: '#8b5cf6' }
    ],
    
    // 事项数据
    issues: [
        { id: 1, key: 'FE-1024', title: '登录页面在移动端显示异常', type: 'bug', status: 'open', priority: 'high', assignee: 1, reporter: 2, projectId: 1, sprintId: 1, storyPoints: 3, createdAt: '2024-01-15' },
        { id: 2, key: 'FE-1025', title: '实现用户权限管理模块', type: 'story', status: 'in_progress', priority: 'medium', assignee: 2, reporter: 1, projectId: 1, sprintId: 1, storyPoints: 8, createdAt: '2024-01-14' },
        { id: 3, key: 'FE-1026', title: '编写API接口文档', type: 'task', status: 'done', priority: 'low', assignee: 3, reporter: 1, projectId: 1, sprintId: 1, storyPoints: 2, createdAt: '2024-01-13' },
        { id: 4, key: 'BE-1001', title: '优化数据库查询性能', type: 'task', status: 'in_progress', priority: 'high', assignee: 2, reporter: 2, projectId: 2, sprintId: 2, storyPoints: 5, createdAt: '2024-01-12' },
        { id: 5, key: 'BE-1002', title: '实现缓存机制', type: 'story', status: 'open', priority: 'medium', assignee: 4, reporter: 2, projectId: 2, sprintId: 2, storyPoints: 8, createdAt: '2024-01-11' },
        { id: 6, key: 'MB-501', title: '首页加载速度优化', type: 'task', status: 'testing', priority: 'high', assignee: 1, reporter: 3, projectId: 3, sprintId: 3, storyPoints: 5, createdAt: '2024-01-10' }
    ],
    
    // 迭代数据
    sprints: [
        { id: 1, name: 'Sprint 12', projectId: 1, status: 'active', startDate: '2024-01-01', endDate: '2024-01-14', goal: '完成用户模块重构' },
        { id: 2, name: 'Sprint 13', projectId: 1, status: 'planning', startDate: '2024-01-15', endDate: '2024-01-28', goal: '实现权限管理功能' },
        { id: 3, name: 'Sprint 8', projectId: 2, status: 'active', startDate: '2024-01-01', endDate: '2024-01-14', goal: '性能优化' },
        { id: 4, name: 'Sprint 5', projectId: 3, status: 'completed', startDate: '2023-12-18', endDate: '2023-12-31', goal: '首页改版' }
    ],
    
    // Wiki 页面数据
    wikiPages: [
        { id: 1, title: '产品需求文档', parentId: null, content: '# 产品需求文档\n\n## 概述\n\n这是产品需求文档的概述...', author: 1, updatedAt: '2024-01-15' },
        { id: 2, title: '技术架构设计', parentId: null, content: '# 技术架构设计\n\n## 系统架构\n\n...', author: 2, updatedAt: '2024-01-14' },
        { id: 3, title: 'API 接口文档', parentId: 2, content: '# API 接口文档\n\n## 用户接口\n\n...', author: 2, updatedAt: '2024-01-13' },
        { id: 4, title: '开发规范', parentId: null, content: '# 开发规范\n\n## 代码规范\n\n...', author: 1, updatedAt: '2024-01-12' }
    ],
    
    // 通知数据
    notifications: [
        { id: 1, type: 'issue', title: '李四 将事项 #1024 分配给了你', time: '5分钟前', read: false, link: 'issue-detail.html' },
        { id: 2, type: 'merge', title: '王五 请求你审核合并请求 !42', time: '15分钟前', read: false, link: 'merge-request-detail.html' },
        { id: 3, type: 'build', title: '构建 #1234 已完成', time: '1小时前', read: true, link: 'build-detail.html' },
        { id: 4, type: 'comment', title: '赵六 评论了你的事项 #1025', time: '2小时前', read: true, link: 'issue-detail.html' },
        { id: 5, type: 'system', title: '系统将于今晚 22:00 进行维护', time: '3小时前', read: false, link: '#' }
    ],
    
    // 活动动态数据
    activities: [
        { id: 1, user: 1, action: '创建了事项', target: 'FE-1024 登录页面在移动端显示异常', time: '10分钟前', type: 'issue' },
        { id: 2, user: 2, action: '完成了事项', target: 'FE-1023 优化首页加载速度', time: '30分钟前', type: 'issue' },
        { id: 3, user: 3, action: '提交了代码', target: 'feat: 添加用户权限管理功能', time: '1小时前', type: 'commit' },
        { id: 4, user: 1, action: '创建了合并请求', target: '!42 用户模块重构', time: '2小时前', type: 'merge' },
        { id: 5, user: 4, action: '评论了事项', target: 'BE-1001 优化数据库查询性能', time: '3小时前', type: 'comment' }
    ],
    
    // 效能指标数据
    metrics: {
        dora: {
            deploymentFrequency: { value: 4.2, unit: '次/周', trend: 12, level: 'elite' },
            leadTime: { value: 2.3, unit: '天', trend: -8, level: 'high' },
            changeFailureRate: { value: 3.2, unit: '%', trend: -15, level: 'elite' },
            mttr: { value: 1.5, unit: '小时', trend: -20, level: 'high' }
        },
        codeQuality: {
            coverage: 78.5,
            duplication: 4.2,
            technicalDebt: '3天2小时',
            codeSmells: 23
        },
        buildStats: {
            total: 156,
            success: 142,
            failed: 14,
            successRate: 91
        },
        issueStats: {
            completed: 45,
            inProgress: 23,
            pending: 12
        }
    }
};

// ==================== API 服务接口 ====================

// 用户相关 API
const UserAPI = {
    async getCurrentUser() {
        return MockAPI.simulateRequest(MockData.users[0]);
    },
    
    async getUsers() {
        return MockAPI.simulateRequest(MockData.users);
    },
    
    async getUserById(id) {
        const user = MockData.users.find(u => u.id === id);
        if (!user) {
            throw new Error('用户不存在');
        }
        return MockAPI.simulateRequest(user);
    },
    
    async login(email, password) {
        await MockAPI.simulateDelay();
        // 模拟登录验证
        const user = MockData.users.find(u => u.email === email);
        if (user && password === '123456') {
            return {
                code: 200,
                message: 'success',
                data: {
                    token: 'mock-jwt-token-' + Date.now(),
                    user: user
                }
            };
        }
        throw new Error('用户名或密码错误');
    },
    
    async register(data) {
        await MockAPI.simulateDelay();
        const newUser = {
            id: MockData.users.length + 1,
            name: data.name,
            email: data.email,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`,
            role: 'member'
        };
        MockData.users.push(newUser);
        return MockAPI.simulateRequest(newUser);
    }
};

// 团队相关 API
const TeamAPI = {
    async getTeams() {
        return MockAPI.simulateRequest(MockData.teams);
    },
    
    async getTeamById(id) {
        const team = MockData.teams.find(t => t.id === id);
        if (!team) {
            throw new Error('团队不存在');
        }
        return MockAPI.simulateRequest(team);
    },
    
    async createTeam(data) {
        const newTeam = {
            id: MockData.teams.length + 1,
            name: data.name,
            avatar: data.name.charAt(0),
            color: data.color || '#2b7de9',
            memberCount: 1
        };
        MockData.teams.push(newTeam);
        return MockAPI.simulateRequest(newTeam);
    }
};

// 项目相关 API
const ProjectAPI = {
    async getProjects(params = {}) {
        let projects = [...MockData.projects];
        
        // 筛选
        if (params.status) {
            projects = projects.filter(p => p.status === params.status);
        }
        if (params.search) {
            const search = params.search.toLowerCase();
            projects = projects.filter(p => 
                p.name.toLowerCase().includes(search) || 
                p.key.toLowerCase().includes(search)
            );
        }
        
        // 分页
        const page = params.page || 1;
        const pageSize = params.pageSize || 10;
        const total = projects.length;
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        
        return MockAPI.simulateRequest({
            list: projects.slice(start, end),
            total: total,
            page: page,
            pageSize: pageSize
        });
    },
    
    async getProjectById(id) {
        const project = MockData.projects.find(p => p.id === id);
        if (!project) {
            throw new Error('项目不存在');
        }
        return MockAPI.simulateRequest(project);
    },
    
    async createProject(data) {
        const newProject = {
            id: MockData.projects.length + 1,
            name: data.name,
            key: data.key,
            description: data.description || '',
            status: 'active',
            owner: 1,
            memberCount: 1,
            issueCount: 0,
            color: data.color || '#2b7de9'
        };
        MockData.projects.push(newProject);
        return MockAPI.simulateRequest(newProject);
    },
    
    async updateProject(id, data) {
        const index = MockData.projects.findIndex(p => p.id === id);
        if (index === -1) {
            throw new Error('项目不存在');
        }
        MockData.projects[index] = { ...MockData.projects[index], ...data };
        return MockAPI.simulateRequest(MockData.projects[index]);
    },
    
    async deleteProject(id) {
        const index = MockData.projects.findIndex(p => p.id === id);
        if (index === -1) {
            throw new Error('项目不存在');
        }
        MockData.projects.splice(index, 1);
        return MockAPI.simulateRequest({ success: true });
    }
};

// 事项相关 API
const IssueAPI = {
    async getIssues(params = {}) {
        let issues = [...MockData.issues];
        
        // 筛选
        if (params.projectId) {
            issues = issues.filter(i => i.projectId === params.projectId);
        }
        if (params.sprintId) {
            issues = issues.filter(i => i.sprintId === params.sprintId);
        }
        if (params.status) {
            issues = issues.filter(i => i.status === params.status);
        }
        if (params.type) {
            issues = issues.filter(i => i.type === params.type);
        }
        if (params.assignee) {
            issues = issues.filter(i => i.assignee === params.assignee);
        }
        if (params.search) {
            const search = params.search.toLowerCase();
            issues = issues.filter(i => 
                i.title.toLowerCase().includes(search) || 
                i.key.toLowerCase().includes(search)
            );
        }
        
        // 分页
        const page = params.page || 1;
        const pageSize = params.pageSize || 20;
        const total = issues.length;
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        
        return MockAPI.simulateRequest({
            list: issues.slice(start, end),
            total: total,
            page: page,
            pageSize: pageSize
        });
    },
    
    async getIssueById(id) {
        const issue = MockData.issues.find(i => i.id === id);
        if (!issue) {
            throw new Error('事项不存在');
        }
        return MockAPI.simulateRequest(issue);
    },
    
    async createIssue(data) {
        const project = MockData.projects.find(p => p.id === data.projectId);
        const newIssue = {
            id: MockData.issues.length + 1,
            key: `${project ? project.key : 'ISSUE'}-${1000 + MockData.issues.length + 1}`,
            title: data.title,
            type: data.type || 'task',
            status: 'open',
            priority: data.priority || 'medium',
            assignee: data.assignee || null,
            reporter: 1,
            projectId: data.projectId,
            sprintId: data.sprintId || null,
            storyPoints: data.storyPoints || 0,
            createdAt: new Date().toISOString().split('T')[0]
        };
        MockData.issues.push(newIssue);
        return MockAPI.simulateRequest(newIssue);
    },
    
    async updateIssue(id, data) {
        const index = MockData.issues.findIndex(i => i.id === id);
        if (index === -1) {
            throw new Error('事项不存在');
        }
        MockData.issues[index] = { ...MockData.issues[index], ...data };
        return MockAPI.simulateRequest(MockData.issues[index]);
    },
    
    async deleteIssue(id) {
        const index = MockData.issues.findIndex(i => i.id === id);
        if (index === -1) {
            throw new Error('事项不存在');
        }
        MockData.issues.splice(index, 1);
        return MockAPI.simulateRequest({ success: true });
    }
};

// 迭代相关 API
const SprintAPI = {
    async getSprints(params = {}) {
        let sprints = [...MockData.sprints];
        
        if (params.projectId) {
            sprints = sprints.filter(s => s.projectId === params.projectId);
        }
        if (params.status) {
            sprints = sprints.filter(s => s.status === params.status);
        }
        
        return MockAPI.simulateRequest(sprints);
    },
    
    async getSprintById(id) {
        const sprint = MockData.sprints.find(s => s.id === id);
        if (!sprint) {
            throw new Error('迭代不存在');
        }
        return MockAPI.simulateRequest(sprint);
    },
    
    async createSprint(data) {
        const newSprint = {
            id: MockData.sprints.length + 1,
            name: data.name,
            projectId: data.projectId,
            status: 'planning',
            startDate: data.startDate,
            endDate: data.endDate,
            goal: data.goal || ''
        };
        MockData.sprints.push(newSprint);
        return MockAPI.simulateRequest(newSprint);
    },
    
    async updateSprint(id, data) {
        const index = MockData.sprints.findIndex(s => s.id === id);
        if (index === -1) {
            throw new Error('迭代不存在');
        }
        MockData.sprints[index] = { ...MockData.sprints[index], ...data };
        return MockAPI.simulateRequest(MockData.sprints[index]);
    }
};

// Wiki 相关 API
const WikiAPI = {
    async getWikiPages(params = {}) {
        let pages = [...MockData.wikiPages];
        
        if (params.parentId !== undefined) {
            pages = pages.filter(p => p.parentId === params.parentId);
        }
        if (params.search) {
            const search = params.search.toLowerCase();
            pages = pages.filter(p => 
                p.title.toLowerCase().includes(search) || 
                p.content.toLowerCase().includes(search)
            );
        }
        
        return MockAPI.simulateRequest(pages);
    },
    
    async getWikiPageById(id) {
        const page = MockData.wikiPages.find(p => p.id === id);
        if (!page) {
            throw new Error('页面不存在');
        }
        return MockAPI.simulateRequest(page);
    },
    
    async createWikiPage(data) {
        const newPage = {
            id: MockData.wikiPages.length + 1,
            title: data.title,
            parentId: data.parentId || null,
            content: data.content || '',
            author: 1,
            updatedAt: new Date().toISOString().split('T')[0]
        };
        MockData.wikiPages.push(newPage);
        return MockAPI.simulateRequest(newPage);
    },
    
    async updateWikiPage(id, data) {
        const index = MockData.wikiPages.findIndex(p => p.id === id);
        if (index === -1) {
            throw new Error('页面不存在');
        }
        MockData.wikiPages[index] = { 
            ...MockData.wikiPages[index], 
            ...data,
            updatedAt: new Date().toISOString().split('T')[0]
        };
        return MockAPI.simulateRequest(MockData.wikiPages[index]);
    },
    
    async deleteWikiPage(id) {
        const index = MockData.wikiPages.findIndex(p => p.id === id);
        if (index === -1) {
            throw new Error('页面不存在');
        }
        MockData.wikiPages.splice(index, 1);
        return MockAPI.simulateRequest({ success: true });
    }
};

// 通知相关 API
const NotificationAPI = {
    async getNotifications(params = {}) {
        let notifications = [...MockData.notifications];
        
        if (params.unreadOnly) {
            notifications = notifications.filter(n => !n.read);
        }
        if (params.type) {
            notifications = notifications.filter(n => n.type === params.type);
        }
        
        return MockAPI.simulateRequest(notifications);
    },
    
    async markAsRead(id) {
        const notification = MockData.notifications.find(n => n.id === id);
        if (notification) {
            notification.read = true;
        }
        return MockAPI.simulateRequest({ success: true });
    },
    
    async markAllAsRead() {
        MockData.notifications.forEach(n => n.read = true);
        return MockAPI.simulateRequest({ success: true });
    },
    
    async clearAll() {
        MockData.notifications = [];
        return MockAPI.simulateRequest({ success: true });
    }
};

// 活动动态相关 API
const ActivityAPI = {
    async getActivities(params = {}) {
        let activities = [...MockData.activities];
        
        if (params.type) {
            activities = activities.filter(a => a.type === params.type);
        }
        if (params.userId) {
            activities = activities.filter(a => a.user === params.userId);
        }
        
        // 添加用户信息
        activities = activities.map(a => ({
            ...a,
            userInfo: MockData.users.find(u => u.id === a.user)
        }));
        
        return MockAPI.simulateRequest(activities);
    }
};

// 效能指标相关 API
const MetricsAPI = {
    async getDORAMetrics() {
        return MockAPI.simulateRequest(MockData.metrics.dora);
    },
    
    async getCodeQualityMetrics() {
        return MockAPI.simulateRequest(MockData.metrics.codeQuality);
    },
    
    async getBuildStats() {
        return MockAPI.simulateRequest(MockData.metrics.buildStats);
    },
    
    async getIssueStats() {
        return MockAPI.simulateRequest(MockData.metrics.issueStats);
    },
    
    async getAllMetrics() {
        return MockAPI.simulateRequest(MockData.metrics);
    }
};

// ==================== 导出 API ====================
window.MockAPI = MockAPI;
window.MockData = MockData;
window.UserAPI = UserAPI;
window.TeamAPI = TeamAPI;
window.ProjectAPI = ProjectAPI;
window.IssueAPI = IssueAPI;
window.SprintAPI = SprintAPI;
window.WikiAPI = WikiAPI;
window.NotificationAPI = NotificationAPI;
window.ActivityAPI = ActivityAPI;
window.MetricsAPI = MetricsAPI;

console.log('摩塔 Mock API 服务模块已加载');