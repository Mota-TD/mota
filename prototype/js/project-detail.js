/**
 * Project Detail Module
 * Handles all project detail page functionality
 */

// Project Detail Data
const ProjectDetailData = {
    // Current project data
    project: {
        id: 1,
        name: '前端项目',
        key: 'FRONTEND',
        description: '摩塔平台前端Web应用，基于React + TypeScript开发',
        icon: 'monitor',
        color: '#2b7de9',
        tags: ['React', 'TypeScript', 'Vite'],
        createdAt: '2024-01-01',
        updatedAt: '2024-01-15',
        owner: { id: 1, name: '张三', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1' },
        isStarred: true,
        isArchived: false
    },
    
    // Project statistics
    stats: {
        totalIssues: 24,
        completedIssues: 16,
        inProgressIssues: 5,
        bugCount: 3,
        requirementCount: 10,
        taskCount: 11
    },
    
    // Current iteration
    currentIteration: {
        id: 12,
        name: 'Sprint 12',
        startDate: '2024-01-08',
        endDate: '2024-01-21',
        progress: 65,
        totalIssues: 12,
        completedIssues: 8,
        inProgressIssues: 3,
        pendingIssues: 1
    },
    
    // Project members
    members: [
        { id: 1, name: '张三', role: '项目负责人', email: 'zhangsan@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1', issueCount: 5 },
        { id: 2, name: '李四', role: '前端开发', email: 'lisi@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2', issueCount: 8 },
        { id: 3, name: '王五', role: '前端开发', email: 'wangwu@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3', issueCount: 6 },
        { id: 4, name: '赵六', role: 'UI设计师', email: 'zhaoliu@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=4', issueCount: 3 },
        { id: 5, name: '钱七', role: '运维工程师', email: 'qianqi@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=5', issueCount: 4 },
        { id: 6, name: '孙八', role: '后端开发', email: 'sunba@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=6', issueCount: 2 },
        { id: 7, name: '周九', role: '产品经理', email: 'zhoujiu@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=7', issueCount: 1 },
        { id: 8, name: '吴十', role: '运维工程师', email: 'wushi@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=8', issueCount: 0 }
    ],
    
    // Recent issues
    recentIssues: [
        { id: 1, type: 'requirement', title: '用户登录功能优化', status: 'processing', priority: 'high', assignee: { id: 1, name: '张三', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1' }, updatedAt: '2小时前' },
        { id: 2, type: 'task', title: '实现登录表单验证', status: 'completed', priority: 'medium', assignee: { id: 2, name: '李四', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2' }, updatedAt: '5小时前' },
        { id: 3, type: 'bug', title: '登录页面在Safari浏览器显示异常', status: 'pending', priority: 'high', assignee: { id: 3, name: '王五', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3' }, updatedAt: '1天前' },
        { id: 4, type: 'requirement', title: '新增数据导出功能', status: 'pending', priority: 'low', assignee: { id: 1, name: '张三', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1' }, updatedAt: '2天前' },
        { id: 5, type: 'task', title: '编写API接口文档', status: 'processing', priority: 'medium', assignee: { id: 4, name: '赵六', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=4' }, updatedAt: '3天前' }
    ],
    
    // All issues for the issues tab
    allIssues: [
        { id: 1, type: 'requirement', title: '用户登录功能优化', status: 'processing', priority: 'high', assignee: { id: 1, name: '张三', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1' }, updatedAt: '2小时前' },
        { id: 2, type: 'task', title: '实现登录表单验证', status: 'completed', priority: 'medium', assignee: { id: 2, name: '李四', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2' }, updatedAt: '5小时前' },
        { id: 3, type: 'bug', title: '登录页面在Safari浏览器显示异常', status: 'pending', priority: 'high', assignee: { id: 3, name: '王五', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3' }, updatedAt: '1天前' },
        { id: 4, type: 'requirement', title: '新增数据导出功能', status: 'pending', priority: 'low', assignee: { id: 1, name: '张三', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1' }, updatedAt: '2天前' },
        { id: 5, type: 'task', title: '编写API接口文档', status: 'processing', priority: 'medium', assignee: { id: 4, name: '赵六', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=4' }, updatedAt: '3天前' },
        { id: 6, type: 'task', title: '优化首页加载性能', status: 'pending', priority: 'medium', assignee: { id: 2, name: '李四', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2' }, updatedAt: '4天前' },
        { id: 7, type: 'task', title: '实现用户头像上传功能', status: 'testing', priority: 'medium', assignee: { id: 5, name: '钱七', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=5' }, updatedAt: '5天前' },
        { id: 8, type: 'requirement', title: '用户注册流程优化', status: 'completed', priority: 'high', assignee: { id: 1, name: '张三', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1' }, updatedAt: '1周前' }
    ],
    
    // Kanban columns
    kanbanColumns: [
        { id: 'pending', name: '待处理', issues: [] },
        { id: 'processing', name: '进行中', issues: [] },
        { id: 'testing', name: '测试中', issues: [] },
        { id: 'completed', name: '已完成', issues: [] }
    ],
    
    // Iterations
    iterations: [
        { id: 12, name: 'Sprint 12', status: 'current', startDate: '2024-01-08', endDate: '2024-01-21', progress: 65, totalIssues: 12, completedIssues: 8, inProgressIssues: 3, pendingIssues: 1 },
        { id: 11, name: 'Sprint 11', status: 'completed', startDate: '2023-12-25', endDate: '2024-01-07', progress: 100, totalIssues: 15, completedIssues: 15, inProgressIssues: 0, pendingIssues: 0 },
        { id: 10, name: 'Sprint 10', status: 'completed', startDate: '2023-12-11', endDate: '2023-12-24', progress: 100, totalIssues: 10, completedIssues: 10, inProgressIssues: 0, pendingIssues: 0 }
    ],
    
    // Recent activities
    activities: [
        { id: 1, user: { name: '李四', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2' }, action: '完成了任务', target: '实现登录表单验证', targetUrl: 'issue-detail.html', time: '2小时前' },
        { id: 2, user: { name: '张三', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1' }, action: '创建了需求', target: '用户登录功能优化', targetUrl: 'issue-detail.html', time: '5小时前' },
        { id: 3, user: { name: '王五', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3' }, action: '提交了缺陷', target: '登录页面在Safari浏览器显示异常', targetUrl: 'issue-detail.html', time: '1天前' },
        { id: 4, user: { name: '赵六', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=4' }, action: '上传了设计稿', target: '登录页面设计稿.png', targetUrl: '#', time: '2天前' },
        { id: 5, user: { name: '钱七', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=5' }, action: '开始测试', target: '实现用户头像上传功能', targetUrl: 'issue-detail.html', time: '3天前' }
    ],
    
    // Available team members for adding
    availableMembers: [
        { id: 9, name: '郑十一', email: 'zheng11@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=9' },
        { id: 10, name: '王十二', email: 'wang12@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=10' },
        { id: 11, name: '李十三', email: 'li13@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=11' }
    ],
    
    // Role options
    roles: [
        { id: 'developer', name: '开发人员' },
        { id: 'designer', name: '设计师' },
        { id: 'devops', name: '运维工程师' },
        { id: 'pm', name: '产品经理' },
        { id: 'owner', name: '项目负责人' }
    ],
    
    // Icon colors
    iconColors: [
        { color: '#2b7de9', gradient: 'linear-gradient(135deg, #2b7de9, #1a6dd6)' },
        { color: '#10b981', gradient: 'linear-gradient(135deg, #10b981, #059669)' },
        { color: '#8b5cf6', gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' },
        { color: '#f59e0b', gradient: 'linear-gradient(135deg, #f59e0b, #d97706)' },
        { color: '#ef4444', gradient: 'linear-gradient(135deg, #ef4444, #dc2626)' }
    ]
};

// Project Detail Module Class
class ProjectDetailModule {
    constructor() {
        this.data = ProjectDetailData;
        this.currentTab = 'overview';
        this.issueSearchQuery = '';
        this.memberSearchQuery = '';
        this.selectedMemberToAdd = null;
        this.init();
    }
    
    init() {
        this.renderProjectHeader();
        this.renderStats();
        this.renderOverviewContent();
        this.renderIssuesContent();
        this.renderKanbanContent();
        this.renderIterationsContent();
        this.renderMembersContent();
        this.renderSettingsContent();
        this.bindEvents();
        this.initKanbanDragDrop();
    }
    
    // Render project header
    renderProjectHeader() {
        const project = this.data.project;
        const headerInfo = document.querySelector('.project-header-info');
        if (headerInfo) {
            headerInfo.innerHTML = `
                <h1 class="project-title">${project.name}</h1>
                <p class="project-description">${project.description}</p>
                <div class="project-tags">
                    ${project.tags.map(tag => `<span class="project-tag">${tag}</span>`).join('')}
                </div>
            `;
        }
        
        // Update breadcrumb
        const breadcrumbCurrent = document.querySelector('.breadcrumb-current');
        if (breadcrumbCurrent) {
            breadcrumbCurrent.textContent = project.name;
        }
        
        // Update page title
        document.title = `${project.name} - 摩塔 Mota`;
    }
    
    // Render statistics cards
    renderStats() {
        const stats = this.data.stats;
        const statsGrid = document.querySelector('.project-stats-grid');
        if (statsGrid) {
            statsGrid.innerHTML = `
                <div class="project-stat-card">
                    <div class="stat-card-icon" style="background: rgba(43, 125, 233, 0.1); color: #2b7de9;">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="12" y1="8" x2="12" y2="12"/>
                            <line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                    </div>
                    <div class="stat-card-content">
                        <span class="stat-card-value">${stats.totalIssues}</span>
                        <span class="stat-card-label">总事项</span>
                    </div>
                </div>
                <div class="project-stat-card">
                    <div class="stat-card-icon" style="background: rgba(16, 185, 129, 0.1); color: #10b981;">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                            <polyline points="22 4 12 14.01 9 11.01"/>
                        </svg>
                    </div>
                    <div class="stat-card-content">
                        <span class="stat-card-value">${stats.completedIssues}</span>
                        <span class="stat-card-label">已完成</span>
                    </div>
                </div>
                <div class="project-stat-card">
                    <div class="stat-card-icon" style="background: rgba(245, 158, 11, 0.1); color: #f59e0b;">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                            <polyline points="12 6 12 12 16 14"/>
                        </svg>
                    </div>
                    <div class="stat-card-content">
                        <span class="stat-card-value">${stats.inProgressIssues}</span>
                        <span class="stat-card-label">进行中</span>
                    </div>
                </div>
                <div class="project-stat-card">
                    <div class="stat-card-icon" style="background: rgba(239, 68, 68, 0.1); color: #ef4444;">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="12" y1="8" x2="12" y2="12"/>
                            <line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                    </div>
                    <div class="stat-card-content">
                        <span class="stat-card-value">${stats.bugCount}</span>
                        <span class="stat-card-label">缺陷</span>
                    </div>
                </div>
            `;
        }
    }
    
    // Render overview content
    renderOverviewContent() {
        this.renderCurrentIteration();
        this.renderRecentIssues();
        this.renderProjectMembers();
        this.renderRecentActivities();
    }
    
    // Render current iteration card
    renderCurrentIteration() {
        const iteration = this.data.currentIteration;
        const container = document.querySelector('#overview-content .current-iteration');
        if (container) {
            container.innerHTML = `
                <div class="iteration-info">
                    <h4 class="iteration-name">${iteration.name}</h4>
                    <p class="iteration-date">${iteration.startDate} ~ ${iteration.endDate}</p>
                </div>
                <div class="iteration-progress-section">
                    <div class="progress-header">
                        <span>完成进度</span>
                        <span class="progress-percent">${iteration.progress}%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${iteration.progress}%"></div>
                    </div>
                </div>
                <div class="iteration-mini-stats">
                    <div class="mini-stat">
                        <span class="mini-stat-value">${iteration.totalIssues}</span>
                        <span class="mini-stat-label">总事项</span>
                    </div>
                    <div class="mini-stat">
                        <span class="mini-stat-value completed">${iteration.completedIssues}</span>
                        <span class="mini-stat-label">已完成</span>
                    </div>
                    <div class="mini-stat">
                        <span class="mini-stat-value processing">${iteration.inProgressIssues}</span>
                        <span class="mini-stat-label">进行中</span>
                    </div>
                    <div class="mini-stat">
                        <span class="mini-stat-value pending">${iteration.pendingIssues}</span>
                        <span class="mini-stat-label">待处理</span>
                    </div>
                </div>
            `;
        }
    }
    
    // Render recent issues
    renderRecentIssues() {
        const issues = this.data.recentIssues;
        const container = document.querySelector('#overview-content .recent-issues-list');
        if (container) {
            container.innerHTML = issues.map(issue => `
                <div class="recent-issue-item" onclick="window.location='issue-detail.html?id=${issue.id}'">
                    <span class="issue-type-badge ${issue.type}">${this.getIssueTypeName(issue.type)}</span>
                    <a href="issue-detail.html?id=${issue.id}" class="issue-title">${issue.title}</a>
                    <span class="status-badge ${issue.status}">${this.getStatusName(issue.status)}</span>
                </div>
            `).join('');
        }
    }
    
    // Render project members in overview
    renderProjectMembers() {
        const members = this.data.members.slice(0, 5);
        const container = document.querySelector('#overview-content .member-list');
        if (container) {
            container.innerHTML = members.map(member => `
                <div class="member-item">
                    <img src="${member.avatar}" alt="" class="member-avatar">
                    <div class="member-info">
                        <span class="member-name">${member.name}</span>
                        <span class="member-role">${member.role}</span>
                    </div>
                </div>
            `).join('');
        }
        
        // Update member count link
        const memberMore = document.querySelector('#overview-content .member-more a');
        if (memberMore) {
            memberMore.textContent = `查看全部 ${this.data.members.length} 名成员`;
        }
    }
    
    // Render recent activities
    renderRecentActivities() {
        const activities = this.data.activities;
        const container = document.querySelector('#overview-content .activity-timeline');
        if (container) {
            container.innerHTML = activities.map(activity => `
                <div class="activity-item">
                    <div class="activity-avatar">
                        <img src="${activity.user.avatar}" alt="">
                    </div>
                    <div class="activity-content">
                        <p><strong>${activity.user.name}</strong> ${activity.action} <a href="${activity.targetUrl}">${activity.target}</a></p>
                        <span class="activity-time">${activity.time}</span>
                    </div>
                </div>
            `).join('');
        }
    }
    
    // Render issues content
    renderIssuesContent() {
        const issues = this.filterIssues();
        const container = document.querySelector('#issues-content .issues-table tbody');
        if (container) {
            container.innerHTML = issues.map(issue => `
                <tr onclick="window.location='issue-detail.html?id=${issue.id}'">
                    <td><span class="issue-type-badge ${issue.type}">${this.getIssueTypeName(issue.type)}</span></td>
                    <td class="issue-title-cell">${issue.title}</td>
                    <td><span class="status-badge ${issue.status}">${this.getStatusName(issue.status)}</span></td>
                    <td><span class="priority-badge ${issue.priority}">${this.getPriorityName(issue.priority)}</span></td>
                    <td>
                        <div class="assignee">
                            <img src="${issue.assignee.avatar}" alt="">
                            <span>${issue.assignee.name}</span>
                        </div>
                    </td>
                    <td class="time-cell">${issue.updatedAt}</td>
                </tr>
            `).join('');
        }
        
        // Update issue count in tab
        const issueTabCount = document.querySelector('.project-nav-tab[data-tab="issues"] .nav-tab-count');
        if (issueTabCount) {
            issueTabCount.textContent = this.data.allIssues.length;
        }
    }
    
    // Filter issues based on search query
    filterIssues() {
        let issues = [...this.data.allIssues];
        if (this.issueSearchQuery) {
            const query = this.issueSearchQuery.toLowerCase();
            issues = issues.filter(issue => 
                issue.title.toLowerCase().includes(query) ||
                issue.assignee.name.toLowerCase().includes(query)
            );
        }
        return issues;
    }
    
    // Render kanban content
    renderKanbanContent() {
        // Organize issues by status
        const columns = {
            pending: [],
            processing: [],
            testing: [],
            completed: []
        };
        
        this.data.allIssues.forEach(issue => {
            if (columns[issue.status]) {
                columns[issue.status].push(issue);
            }
        });
        
        const kanbanBoard = document.querySelector('#kanban-content .kanban-board');
        if (kanbanBoard) {
            kanbanBoard.innerHTML = `
                ${this.renderKanbanColumn('pending', '待处理', columns.pending)}
                ${this.renderKanbanColumn('processing', '进行中', columns.processing)}
                ${this.renderKanbanColumn('testing', '测试中', columns.testing)}
                ${this.renderKanbanColumn('completed', '已完成', columns.completed)}
            `;
        }
    }
    
    // Render a single kanban column
    renderKanbanColumn(status, title, issues) {
        return `
            <div class="kanban-column" data-status="${status}">
                <div class="kanban-column-header">
                    <span class="column-title">${title}</span>
                    <span class="column-count">${issues.length}</span>
                </div>
                <div class="kanban-column-body" data-status="${status}">
                    ${issues.map(issue => this.renderKanbanCard(issue)).join('')}
                </div>
            </div>
        `;
    }
    
    // Render a single kanban card
    renderKanbanCard(issue) {
        return `
            <div class="kanban-card" draggable="true" data-issue-id="${issue.id}" onclick="window.location='issue-detail.html?id=${issue.id}'">
                <div class="kanban-card-header">
                    <span class="issue-type-badge ${issue.type}">${this.getIssueTypeName(issue.type)}</span>
                    <span class="priority-badge ${issue.priority}">${this.getPriorityName(issue.priority)}</span>
                </div>
                <h4 class="kanban-card-title">${issue.title}</h4>
                <div class="kanban-card-footer">
                    <img src="${issue.assignee.avatar}" alt="" class="card-assignee">
                </div>
            </div>
        `;
    }
    
    // Initialize kanban drag and drop
    initKanbanDragDrop() {
        const kanbanBoard = document.querySelector('#kanban-content .kanban-board');
        if (!kanbanBoard) return;
        
        // Use event delegation for drag events
        kanbanBoard.addEventListener('dragstart', (e) => {
            if (e.target.classList.contains('kanban-card')) {
                e.target.classList.add('dragging');
                e.dataTransfer.setData('text/plain', e.target.dataset.issueId);
            }
        });
        
        kanbanBoard.addEventListener('dragend', (e) => {
            if (e.target.classList.contains('kanban-card')) {
                e.target.classList.remove('dragging');
            }
        });
        
        kanbanBoard.addEventListener('dragover', (e) => {
            e.preventDefault();
            const columnBody = e.target.closest('.kanban-column-body');
            if (columnBody) {
                columnBody.classList.add('drag-over');
            }
        });
        
        kanbanBoard.addEventListener('dragleave', (e) => {
            const columnBody = e.target.closest('.kanban-column-body');
            if (columnBody && !columnBody.contains(e.relatedTarget)) {
                columnBody.classList.remove('drag-over');
            }
        });
        
        kanbanBoard.addEventListener('drop', (e) => {
            e.preventDefault();
            const columnBody = e.target.closest('.kanban-column-body');
            if (columnBody) {
                columnBody.classList.remove('drag-over');
                const issueId = parseInt(e.dataTransfer.getData('text/plain'));
                const newStatus = columnBody.dataset.status;
                this.moveIssueToStatus(issueId, newStatus);
            }
        });
    }
    
    // Move issue to new status
    moveIssueToStatus(issueId, newStatus) {
        const issue = this.data.allIssues.find(i => i.id === issueId);
        if (issue && issue.status !== newStatus) {
            const oldStatus = issue.status;
            issue.status = newStatus;
            
            // Update stats
            this.updateStatsAfterStatusChange(oldStatus, newStatus);
            
            // Re-render kanban
            this.renderKanbanContent();
            this.initKanbanDragDrop();
            
            // Re-render issues table
            this.renderIssuesContent();
            
            // Re-render stats
            this.renderStats();
            
            // Show toast
            if (typeof showToast === 'function') {
                showToast(`事项已移动到"${this.getStatusName(newStatus)}"`, 'success');
            }
        }
    }
    
    // Update stats after status change
    updateStatsAfterStatusChange(oldStatus, newStatus) {
        const stats = this.data.stats;
        
        // Decrease old status count
        if (oldStatus === 'completed') {
            stats.completedIssues--;
        } else if (oldStatus === 'processing' || oldStatus === 'testing') {
            stats.inProgressIssues--;
        }
        
        // Increase new status count
        if (newStatus === 'completed') {
            stats.completedIssues++;
        } else if (newStatus === 'processing' || newStatus === 'testing') {
            stats.inProgressIssues++;
        }
    }
    
    // Render iterations content
    renderIterationsContent() {
        const iterations = this.data.iterations;
        const container = document.querySelector('#iterations-content .iterations-list');
        if (container) {
            container.innerHTML = iterations.map(iteration => `
                <div class="iteration-card ${iteration.status === 'current' ? 'current' : ''}" onclick="window.location='iteration-detail.html?id=${iteration.id}'">
                    <div class="iteration-card-header">
                        <div class="iteration-card-title">
                            <span class="iteration-status-badge ${iteration.status}">${this.getIterationStatusName(iteration.status)}</span>
                            <h3>${iteration.name}</h3>
                        </div>
                        <span class="iteration-date">${iteration.startDate} ~ ${iteration.endDate}</span>
                    </div>
                    <div class="iteration-card-body">
                        <div class="iteration-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${iteration.progress}%"></div>
                            </div>
                            <span class="progress-text">${iteration.progress}% 完成</span>
                        </div>
                        <div class="iteration-stats">
                            <span>${iteration.totalIssues} 事项</span>
                            <span>${iteration.completedIssues} 已完成</span>
                            ${iteration.inProgressIssues > 0 ? `<span>${iteration.inProgressIssues} 进行中</span>` : ''}
                            ${iteration.pendingIssues > 0 ? `<span>${iteration.pendingIssues} 待处理</span>` : ''}
                        </div>
                    </div>
                </div>
            `).join('');
        }
    }
    
    // Render members content
    renderMembersContent() {
        const members = this.filterMembers();
        const container = document.querySelector('#members-content .members-grid');
        if (container) {
            container.innerHTML = members.map(member => `
                <div class="member-card" data-member-id="${member.id}">
                    <img src="${member.avatar}" alt="" class="member-card-avatar">
                    <div class="member-card-info">
                        <h4>${member.name}</h4>
                        <span class="member-card-role">${member.role}</span>
                        <span class="member-card-email">${member.email}</span>
                    </div>
                    <div class="member-card-stats">
                        <span>负责 ${member.issueCount} 个事项</span>
                    </div>
                    <div class="member-card-actions">
                        <button class="btn btn-text btn-sm" onclick="projectDetailModule.editMemberRole(${member.id}); event.stopPropagation();">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                        </button>
                        <button class="btn btn-text btn-sm text-danger" onclick="projectDetailModule.removeMember(${member.id}); event.stopPropagation();">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            </svg>
                        </button>
                    </div>
                </div>
            `).join('');
        }
        
        // Update member count in tab
        const memberTabCount = document.querySelector('.project-nav-tab[data-tab="members"] .nav-tab-count');
        if (memberTabCount) {
            memberTabCount.textContent = this.data.members.length;
        }
    }
    
    // Filter members based on search query
    filterMembers() {
        let members = [...this.data.members];
        if (this.memberSearchQuery) {
            const query = this.memberSearchQuery.toLowerCase();
            members = members.filter(member => 
                member.name.toLowerCase().includes(query) ||
                member.email.toLowerCase().includes(query) ||
                member.role.toLowerCase().includes(query)
            );
        }
        return members;
    }
    
    // Render settings content
    renderSettingsContent() {
        const project = this.data.project;
        const settingsForm = document.querySelector('#settings-content .settings-form');
        if (settingsForm) {
            const nameInput = settingsForm.querySelector('input[type="text"]');
            const descTextarea = settingsForm.querySelector('textarea');
            const tagsInput = settingsForm.querySelectorAll('input[type="text"]')[1];
            
            if (nameInput) nameInput.value = project.name;
            if (descTextarea) descTextarea.value = project.description;
            if (tagsInput) tagsInput.value = project.tags.join(', ');
        }
    }
    
    // Bind events
    bindEvents() {
        // Issue search
        const issueSearchInput = document.querySelector('#issues-content .search-input input');
        if (issueSearchInput) {
            issueSearchInput.addEventListener('input', (e) => {
                this.issueSearchQuery = e.target.value;
                this.renderIssuesContent();
            });
        }
        
        // Member search
        const memberSearchInput = document.querySelector('#members-content .search-input input');
        if (memberSearchInput) {
            memberSearchInput.addEventListener('input', (e) => {
                this.memberSearchQuery = e.target.value;
                this.renderMembersContent();
            });
        }
        
        // Add member modal search
        const addMemberSearchInput = document.querySelector('#addMemberModal .form-input');
        if (addMemberSearchInput) {
            addMemberSearchInput.addEventListener('input', (e) => {
                this.searchAvailableMembers(e.target.value);
            });
        }
        
        // Settings save button
        const settingsSaveBtn = document.querySelector('#settings-content .btn-primary');
        if (settingsSaveBtn) {
            settingsSaveBtn.addEventListener('click', () => this.saveProjectSettings());
        }
        
        // Archive project button
        const archiveBtn = document.querySelector('#settings-content .danger-item:first-child .btn-secondary');
        if (archiveBtn) {
            archiveBtn.addEventListener('click', () => this.archiveProject());
        }
        
        // Delete project button
        const deleteBtn = document.querySelector('#settings-content .danger-item:last-child .btn-danger');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => this.deleteProject());
        }
        
        // Edit project modal save
        const editProjectSaveBtn = document.querySelector('#editProjectModal .btn-primary');
        if (editProjectSaveBtn) {
            editProjectSaveBtn.addEventListener('click', () => this.saveEditProject());
        }
        
        // Add member modal save
        const addMemberSaveBtn = document.querySelector('#addMemberModal .btn-primary');
        if (addMemberSaveBtn) {
            addMemberSaveBtn.addEventListener('click', () => this.addSelectedMember());
        }
        
        // Create issue modal save
        const createIssueSaveBtn = document.querySelector('#createIssueModal .btn-primary');
        if (createIssueSaveBtn) {
            createIssueSaveBtn.addEventListener('click', () => this.createIssue());
        }
        
        // Create iteration modal save
        const createIterationSaveBtn = document.querySelector('#createIterationModal .btn-primary');
        if (createIterationSaveBtn) {
            createIterationSaveBtn.addEventListener('click', () => this.createIteration());
        }
        
        // Icon color selection in edit modal
        this.bindIconColorSelection();
        
        // Member selection in add member modal
        this.bindMemberSelection();
    }
    
    // Bind icon color selection
    bindIconColorSelection() {
        const colorOptions = document.querySelectorAll('#editProjectModal .form-group:last-child > div > div');
        colorOptions.forEach((option, index) => {
            option.addEventListener('click', () => {
                // Remove selection from all
                colorOptions.forEach(o => o.style.border = 'none');
                // Add selection to clicked
                option.style.border = '2px solid var(--primary-color)';
                this.selectedIconColor = this.data.iconColors[index];
            });
        });
    }
    
    // Bind member selection in add member modal
    bindMemberSelection() {
        const memberItems = document.querySelectorAll('#addMemberModal .member-search-results .member-item');
        memberItems.forEach(item => {
            item.addEventListener('click', () => {
                // Remove selection from all
                memberItems.forEach(i => i.style.background = 'var(--bg-light)');
                // Add selection to clicked
                item.style.background = 'var(--primary-light)';
                // Store selected member
                const memberName = item.querySelector('.member-name').textContent;
                this.selectedMemberToAdd = this.data.availableMembers.find(m => m.name === memberName);
            });
        });
    }
    
    // Search available members
    searchAvailableMembers(query) {
        const container = document.querySelector('#addMemberModal .member-search-results');
        if (!container) return;
        
        let members = this.data.availableMembers;
        if (query) {
            const q = query.toLowerCase();
            members = members.filter(m => 
                m.name.toLowerCase().includes(q) ||
                m.email.toLowerCase().includes(q)
            );
        }
        
        container.innerHTML = members.map(member => `
            <div class="member-item" style="padding: 12px; background: var(--bg-light); border-radius: var(--radius-md); margin-bottom: 8px; cursor: pointer;">
                <img src="${member.avatar}" alt="" class="member-avatar">
                <div class="member-info">
                    <span class="member-name">${member.name}</span>
                    <span class="member-role">${member.email}</span>
                </div>
            </div>
        `).join('');
        
        // Re-bind selection events
        this.bindMemberSelection();
    }
    
    // Save project settings
    saveProjectSettings() {
        const settingsForm = document.querySelector('#settings-content .settings-form');
        if (!settingsForm) return;
        
        const nameInput = settingsForm.querySelector('input[type="text"]');
        const descTextarea = settingsForm.querySelector('textarea');
        const tagsInput = settingsForm.querySelectorAll('input[type="text"]')[1];
        
        if (nameInput) this.data.project.name = nameInput.value;
        if (descTextarea) this.data.project.description = descTextarea.value;
        if (tagsInput) this.data.project.tags = tagsInput.value.split(',').map(t => t.trim()).filter(t => t);
        
        // Re-render header
        this.renderProjectHeader();
        
        if (typeof showToast === 'function') {
            showToast('项目设置已保存', 'success');
        }
    }
    
    // Save edit project from modal
    saveEditProject() {
        const modal = document.getElementById('editProjectModal');
        if (!modal) return;
        
        const nameInput = modal.querySelector('input[type="text"]');
        const descTextarea = modal.querySelector('textarea');
        const tagsInput = modal.querySelectorAll('input[type="text"]')[1];
        
        if (nameInput) this.data.project.name = nameInput.value;
        if (descTextarea) this.data.project.description = descTextarea.value;
        if (tagsInput) this.data.project.tags = tagsInput.value.split(',').map(t => t.trim()).filter(t => t);
        
        if (this.selectedIconColor) {
            this.data.project.color = this.selectedIconColor.color;
            // Update icon in header
            const iconElement = document.querySelector('.project-icon-large');
            if (iconElement) {
                iconElement.style.background = this.selectedIconColor.gradient;
            }
        }
        
        // Re-render header
        this.renderProjectHeader();
        
        // Close modal
        modal.classList.remove('active');
        
        if (typeof showToast === 'function') {
            showToast('项目信息已更新', 'success');
        }
    }
    
    // Archive project
    archiveProject() {
        if (confirm('确定要归档此项目吗？归档后项目将变为只读状态。')) {
            this.data.project.isArchived = true;
            if (typeof showToast === 'function') {
                showToast('项目已归档', 'success');
            }
            // Redirect to projects list
            setTimeout(() => {
                window.location.href = 'projects.html';
            }, 1000);
        }
    }
    
    // Delete project
    deleteProject() {
        if (confirm('确定要删除此项目吗？删除后数据将无法恢复！')) {
            if (typeof showToast === 'function') {
                showToast('项目已删除', 'success');
            }
            // Redirect to projects list
            setTimeout(() => {
                window.location.href = 'projects.html';
            }, 1000);
        }
    }
    
    // Add selected member
    addSelectedMember() {
        if (!this.selectedMemberToAdd) {
            if (typeof showToast === 'function') {
                showToast('请先选择要添加的成员', 'error');
            }
            return;
        }
        
        const roleSelect = document.querySelector('#addMemberModal select');
        const role = roleSelect ? this.data.roles.find(r => r.id === roleSelect.value)?.name || '开发人员' : '开发人员';
        
        // Add to members list
        const newMember = {
            id: this.selectedMemberToAdd.id,
            name: this.selectedMemberToAdd.name,
            email: this.selectedMemberToAdd.email,
            avatar: this.selectedMemberToAdd.avatar,
            role: role,
            issueCount: 0
        };
        
        this.data.members.push(newMember);
        
        // Remove from available members
        this.data.availableMembers = this.data.availableMembers.filter(m => m.id !== this.selectedMemberToAdd.id);
        
        // Re-render members
        this.renderMembersContent();
        this.renderProjectMembers();
        
        // Close modal
        document.getElementById('addMemberModal').classList.remove('active');
        
        // Reset selection
        this.selectedMemberToAdd = null;
        
        if (typeof showToast === 'function') {
            showToast(`已添加成员 ${newMember.name}`, 'success');
        }
    }
    
    // Edit member role
    editMemberRole(memberId) {
        const member = this.data.members.find(m => m.id === memberId);
        if (!member) return;
        
        const newRole = prompt('请输入新角色:', member.role);
        if (newRole && newRole !== member.role) {
            member.role = newRole;
            this.renderMembersContent();
            this.renderProjectMembers();
            
            if (typeof showToast === 'function') {
                showToast(`已更新 ${member.name} 的角色`, 'success');
            }
        }
    }
    
    // Remove member
    removeMember(memberId) {
        const member = this.data.members.find(m => m.id === memberId);
        if (!member) return;
        
        if (confirm(`确定要移除成员 ${member.name} 吗？`)) {
            // Remove from members
            this.data.members = this.data.members.filter(m => m.id !== memberId);
            
            // Add back to available members
            this.data.availableMembers.push({
                id: member.id,
                name: member.name,
                email: member.email,
                avatar: member.avatar
            });
            
            // Re-render
            this.renderMembersContent();
            this.renderProjectMembers();
            
            if (typeof showToast === 'function') {
                showToast(`已移除成员 ${member.name}`, 'success');
            }
        }
    }
    
    // Create issue
    createIssue() {
        const modal = document.getElementById('createIssueModal');
        if (!modal) return;
        
        const typeSelect = modal.querySelector('select');
        const titleInput = modal.querySelector('input[type="text"]');
        const descTextarea = modal.querySelector('textarea');
        const prioritySelect = modal.querySelectorAll('select')[1];
        const assigneeSelect = modal.querySelectorAll('select')[2];
        
        const title = titleInput?.value?.trim();
        if (!title) {
            if (typeof showToast === 'function') {
                showToast('请输入事项标题', 'error');
            }
            return;
        }
        
        const type = typeSelect?.value || 'task';
        const priority = prioritySelect?.value || 'medium';
        const assigneeId = assigneeSelect?.value ? parseInt(assigneeSelect.value) : 1;
        const assignee = this.data.members.find(m => m.id === assigneeId) || this.data.members[0];
        
        // Create new issue
        const newIssue = {
            id: this.data.allIssues.length + 1,
            type: type,
            title: title,
            status: 'pending',
            priority: priority,
            assignee: {
                id: assignee.id,
                name: assignee.name,
                avatar: assignee.avatar
            },
            updatedAt: '刚刚'
        };
        
        // Add to issues
        this.data.allIssues.unshift(newIssue);
        this.data.recentIssues.unshift(newIssue);
        if (this.data.recentIssues.length > 5) {
            this.data.recentIssues.pop();
        }
        
        // Update stats
        this.data.stats.totalIssues++;
        if (type === 'bug') this.data.stats.bugCount++;
        else if (type === 'requirement') this.data.stats.requirementCount++;
        else this.data.stats.taskCount++;
        
        // Update assignee issue count
        const memberToUpdate = this.data.members.find(m => m.id === assignee.id);
        if (memberToUpdate) memberToUpdate.issueCount++;
        
        // Re-render
        this.renderStats();
        this.renderRecentIssues();
        this.renderIssuesContent();
        this.renderKanbanContent();
        this.initKanbanDragDrop();
        this.renderMembersContent();
        
        // Close modal and reset form
        modal.classList.remove('active');
        if (titleInput) titleInput.value = '';
        if (descTextarea) descTextarea.value = '';
        
        if (typeof showToast === 'function') {
            showToast('事项创建成功', 'success');
        }
    }
    
    // Create iteration
    createIteration() {
        const modal = document.getElementById('createIterationModal');
        if (!modal) return;
        
        const nameInput = modal.querySelector('input[type="text"]');
        const startDateInput = modal.querySelectorAll('input[type="date"]')[0];
        const endDateInput = modal.querySelectorAll('input[type="date"]')[1];
        
        const name = nameInput?.value?.trim();
        if (!name) {
            if (typeof showToast === 'function') {
                showToast('请输入迭代名称', 'error');
            }
            return;
        }
        
        const startDate = startDateInput?.value || new Date().toISOString().split('T')[0];
        const endDate = endDateInput?.value || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        // Create new iteration
        const newIteration = {
            id: this.data.iterations.length + 10,
            name: name,
            status: 'planned',
            startDate: startDate,
            endDate: endDate,
            progress: 0,
            totalIssues: 0,
            completedIssues: 0,
            inProgressIssues: 0,
            pendingIssues: 0
        };
        
        // Add to iterations
        this.data.iterations.unshift(newIteration);
        
        // Re-render
        this.renderIterationsContent();
        
        // Close modal and reset form
        modal.classList.remove('active');
        if (nameInput) nameInput.value = '';
        if (startDateInput) startDateInput.value = '';
        if (endDateInput) endDateInput.value = '';
        
        if (typeof showToast === 'function') {
            showToast('迭代创建成功', 'success');
        }
    }
    
    // Helper methods
    getIssueTypeName(type) {
        const types = {
            requirement: '需求',
            task: '任务',
            bug: '缺陷'
        };
        return types[type] || type;
    }
    
    getStatusName(status) {
        const statuses = {
            pending: '待处理',
            processing: '进行中',
            testing: '测试中',
            completed: '已完成'
        };
        return statuses[status] || status;
    }
    
    getPriorityName(priority) {
        const priorities = {
            high: '高',
            medium: '中',
            low: '低'
        };
        return priorities[priority] || priority;
    }
    
    getIterationStatusName(status) {
        const statuses = {
            planned: '计划中',
            current: '进行中',
            completed: '已完成'
        };
        return statuses[status] || status;
    }
}

// Initialize module when DOM is ready
let projectDetailModule;
document.addEventListener('DOMContentLoaded', function() {
    projectDetailModule = new ProjectDetailModule();
});

// Export for global access
window.projectDetailModule = projectDetailModule;