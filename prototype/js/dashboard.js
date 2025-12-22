/**
 * 摩塔 Mota - 工作台模块
 * 包含工作台页面的所有交互功能
 */

// ==================== 工作台数据管理 ====================
const DashboardData = {
    // 待办事项列表
    todos: [
        { id: 1, title: '登录页面在移动端显示异常', type: 'bug', priority: 'high', project: '前端项目', status: 'processing', dueDate: '2024-01-15', assignee: '张三' },
        { id: 2, title: '实现用户权限管理模块', type: 'feature', priority: 'medium', project: '后端服务', status: 'pending', dueDate: '2024-01-20', assignee: '张三' },
        { id: 3, title: '编写API接口文档', type: 'task', priority: 'low', project: '文档项目', status: 'processing', dueDate: '2024-01-18', assignee: '张三' },
        { id: 4, title: '数据导出功能超时问题', type: 'bug', priority: 'high', project: '后端服务', status: 'pending', dueDate: '2024-01-16', assignee: '张三' },
        { id: 5, title: '优化首页加载性能', type: 'task', priority: 'medium', project: '前端项目', status: 'pending', dueDate: '2024-01-22', assignee: '张三' }
    ],
    
    // 最近项目
    recentProjects: [
        { id: 1, name: '前端项目', key: 'frontend', description: 'Web 前端应用', color: '#2b7de9', issueCount: 24, memberCount: 8, lastUpdated: '10分钟前' },
        { id: 2, name: '后端服务', key: 'backend', description: 'API 服务', color: '#10b981', issueCount: 18, memberCount: 6, lastUpdated: '30分钟前' },
        { id: 3, name: '移动端项目', key: 'mobile', description: 'iOS/Android 应用', color: '#f59e0b', issueCount: 12, memberCount: 5, lastUpdated: '1小时前' },
        { id: 4, name: '文档项目', key: 'docs', description: '产品文档', color: '#8b5cf6', issueCount: 6, memberCount: 3, lastUpdated: '2小时前' }
    ],
    
    // 活动动态
    activities: [
        { id: 1, user: { name: '李四', avatar: 'user1' }, action: 'merged', target: '分支 feature/login 到 main', time: '10分钟前', type: 'merge' },
        { id: 2, user: { name: '王五', avatar: 'user2' }, action: 'created', target: '事项 用户注册流程优化', link: 'issue-detail.html', time: '30分钟前', type: 'issue' },
        { id: 3, user: { name: '赵六', avatar: 'user3' }, action: 'completed', target: '构建 #1234', link: 'build-detail.html', status: 'success', time: '1小时前', type: 'build' },
        { id: 4, user: { name: '张三', avatar: 'user4' }, action: 'commented', target: '事项 登录页面在移动端显示异常', link: 'issue-detail.html', time: '2小时前', type: 'comment' },
        { id: 5, user: { name: '钱七', avatar: 'user5' }, action: 'deployed', target: '应用到 生产环境', time: '3小时前', type: 'deploy' },
        { id: 6, user: { name: '孙八', avatar: 'user6' }, action: 'created', target: '合并请求 !45', link: 'merge-request-detail.html', time: '4小时前', type: 'merge-request' }
    ],
    
    // 最近构建
    recentBuilds: [
        { id: 1234, branch: 'main', project: '前端项目', status: 'success', duration: '2分30秒', time: '5分钟前' },
        { id: 1233, branch: 'feature/api', project: '后端服务', status: 'failed', duration: '1分15秒', time: '15分钟前' },
        { id: 1235, branch: 'develop', project: '移动端项目', status: 'running', duration: '运行中...', time: '刚刚' },
        { id: 1232, branch: 'main', project: '后端服务', status: 'success', duration: '3分45秒', time: '1小时前' }
    ],
    
    // 统计数据
    statistics: {
        pendingIssues: { value: 24, trend: 12, trendDirection: 'up' },
        completedIssues: { value: 156, trend: 8, trendDirection: 'up' },
        pendingMerges: { value: 8, trend: 5, trendDirection: 'down' },
        todayBuilds: { value: 42, trend: 23, trendDirection: 'up' }
    },
    
    // 日历事件
    calendarEvents: [
        { id: 1, title: 'Sprint 12 评审会议', date: '2024-01-15', time: '14:00', type: 'meeting', color: '#2b7de9' },
        { id: 2, title: 'Sprint 13 规划会议', date: '2024-01-16', time: '10:00', type: 'meeting', color: '#10b981' },
        { id: 3, title: '版本 v2.0 发布', date: '2024-01-18', time: '18:00', type: 'release', color: '#f59e0b' },
        { id: 4, title: '代码审查', date: '2024-01-17', time: '15:00', type: 'review', color: '#8b5cf6' },
        { id: 5, title: '团队周会', date: '2024-01-19', time: '09:00', type: 'meeting', color: '#ec4899' }
    ],
    
    // 图表数据 - 事项趋势
    issuesTrend: {
        labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
        created: [5, 8, 12, 6, 10, 3, 2],
        completed: [4, 6, 8, 10, 12, 5, 3]
    },
    
    // 图表数据 - 构建统计
    buildStats: {
        labels: ['成功', '失败', '取消'],
        data: [85, 12, 3],
        colors: ['#10b981', '#ef4444', '#9ca3af']
    }
};

// ==================== 工作台模块类 ====================
class DashboardModule {
    constructor() {
        this.data = DashboardData;
        this.currentCalendarDate = new Date();
        this.init();
    }
    
    init() {
        this.renderTodoList();
        this.renderRecentProjects();
        this.renderActivityFeed();
        this.renderRecentBuilds();
        this.renderStatistics();
        this.renderCalendar();
        this.renderCharts();
        this.bindEvents();
        
        // 模拟实时更新
        this.startRealTimeUpdates();
    }
    
    // ==================== 待办事项 ====================
    renderTodoList() {
        const container = document.getElementById('todoList');
        if (!container) return;
        
        const todos = this.data.todos.filter(t => t.status !== 'done');
        
        if (todos.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                        <polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                    <p>太棒了！没有待办事项</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = todos.map(todo => this.renderTodoItem(todo)).join('');
    }
    
    renderTodoItem(todo) {
        const typeLabels = { bug: '缺陷', feature: '需求', task: '任务' };
        const priorityLabels = { high: '高优先级', medium: '中优先级', low: '低优先级' };
        const statusLabels = { pending: '待开始', processing: '进行中', done: '已完成' };
        
        return `
            <div class="issue-item" data-todo-id="${todo.id}" onclick="dashboardModule.openTodoDetail(${todo.id})">
                <div class="todo-checkbox" onclick="event.stopPropagation(); dashboardModule.toggleTodo(${todo.id})">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="3" width="18" height="18" rx="2"/>
                    </svg>
                </div>
                <span class="issue-type ${todo.type}">${typeLabels[todo.type]}</span>
                <div class="issue-content">
                    <a href="issue-detail.html" class="issue-title">${todo.title}</a>
                    <div class="issue-meta">
                        <span class="issue-project">${todo.project}</span>
                        <span class="issue-priority ${todo.priority}">${priorityLabels[todo.priority]}</span>
                        ${todo.dueDate ? `<span class="issue-due-date">截止: ${todo.dueDate}</span>` : ''}
                    </div>
                </div>
                <div class="issue-status">
                    <span class="status-badge ${todo.status}">${statusLabels[todo.status]}</span>
                </div>
                <div class="todo-actions">
                    <button class="todo-action-btn" onclick="event.stopPropagation(); dashboardModule.completeTodo(${todo.id})" title="完成">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="20 6 9 17 4 12"/>
                        </svg>
                    </button>
                    <button class="todo-action-btn" onclick="event.stopPropagation(); dashboardModule.deleteTodo(${todo.id})" title="删除">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;
    }
    
    toggleTodo(todoId) {
        const todo = this.data.todos.find(t => t.id === todoId);
        if (todo) {
            todo.status = todo.status === 'done' ? 'pending' : 'done';
            this.renderTodoList();
            this.updateStatistics();
            showToast(todo.status === 'done' ? '事项已完成' : '事项已恢复', 'success');
        }
    }
    
    completeTodo(todoId) {
        const todo = this.data.todos.find(t => t.id === todoId);
        if (todo) {
            todo.status = 'done';
            this.renderTodoList();
            this.updateStatistics();
            showToast('事项已完成', 'success');
        }
    }
    
    deleteTodo(todoId) {
        if (confirm('确定要删除这个待办事项吗？')) {
            this.data.todos = this.data.todos.filter(t => t.id !== todoId);
            this.renderTodoList();
            this.updateStatistics();
            showToast('事项已删除', 'success');
        }
    }
    
    openTodoDetail(todoId) {
        window.location.href = 'issue-detail.html?id=' + todoId;
    }
    
    // ==================== 最近项目 ====================
    renderRecentProjects() {
        const container = document.getElementById('recentProjects');
        if (!container) return;
        
        container.innerHTML = this.data.recentProjects.map(project => `
            <div class="project-card" onclick="window.location.href='project-detail.html?id=${project.id}'">
                <div class="project-header">
                    <div class="project-icon" style="background: ${project.color}">
                        ${project.name.charAt(0)}
                    </div>
                    <div class="project-info">
                        <h4 class="project-name">${project.name}</h4>
                        <p class="project-key">${project.key}</p>
                    </div>
                    <button class="project-star" onclick="event.stopPropagation(); dashboardModule.toggleProjectStar(${project.id})" title="收藏">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                        </svg>
                    </button>
                </div>
                <p class="project-desc">${project.description}</p>
                <div class="project-stats">
                    <span class="project-stat">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="12" y1="8" x2="12" y2="12"/>
                            <line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                        ${project.issueCount} 事项
                    </span>
                    <span class="project-stat">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                            <circle cx="9" cy="7" r="4"/>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                        </svg>
                        ${project.memberCount} 成员
                    </span>
                    <span class="project-stat">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                            <polyline points="12 6 12 12 16 14"/>
                        </svg>
                        ${project.lastUpdated}
                    </span>
                </div>
            </div>
        `).join('');
    }
    
    toggleProjectStar(projectId) {
        const project = this.data.recentProjects.find(p => p.id === projectId);
        if (project) {
            project.starred = !project.starred;
            showToast(project.starred ? '已收藏项目' : '已取消收藏', 'success');
        }
    }
    
    // ==================== 活动动态 ====================
    renderActivityFeed() {
        const container = document.getElementById('activityFeed');
        if (!container) return;
        
        container.innerHTML = this.data.activities.map(activity => `
            <div class="activity-item">
                <div class="activity-avatar">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=${activity.user.avatar}" alt="${activity.user.name}">
                </div>
                <div class="activity-content">
                    <p>${this.formatActivityMessage(activity)}</p>
                    <span class="activity-time">${activity.time}</span>
                </div>
            </div>
        `).join('');
    }
    
    formatActivityMessage(activity) {
        const actionLabels = {
            merged: '合并了',
            created: '创建了',
            completed: '完成了',
            commented: '评论了',
            deployed: '部署了',
            assigned: '分配了',
            closed: '关闭了'
        };
        
        let message = `<strong>${activity.user.name}</strong> ${actionLabels[activity.action] || activity.action} `;
        
        if (activity.link) {
            message += `<a href="${activity.link}">${activity.target}</a>`;
        } else {
            message += `<code>${activity.target}</code>`;
        }
        
        if (activity.status) {
            const statusClass = activity.status === 'success' ? 'success' : 'failed';
            message += ` <span class="activity-status ${statusClass}">(${activity.status === 'success' ? '成功' : '失败'})</span>`;
        }
        
        return message;
    }
    
    addActivity(activity) {
        this.data.activities.unshift(activity);
        if (this.data.activities.length > 20) {
            this.data.activities.pop();
        }
        this.renderActivityFeed();
    }
    
    // ==================== 最近构建 ====================
    renderRecentBuilds() {
        const container = document.getElementById('recentBuilds');
        if (!container) return;
        
        container.innerHTML = this.data.recentBuilds.map(build => `
            <div class="build-item" onclick="window.location.href='build-detail.html?id=${build.id}'">
                <div class="build-status ${build.status}">
                    ${this.getBuildStatusIcon(build.status)}
                </div>
                <div class="build-content">
                    <div class="build-title">
                        <a href="build-detail.html?id=${build.id}">#${build.id}</a>
                        <span class="build-branch">${build.branch}</span>
                    </div>
                    <div class="build-meta">
                        <span>${build.project}</span>
                        <span>•</span>
                        <span>${build.duration}</span>
                    </div>
                </div>
                <span class="build-time">${build.time}</span>
            </div>
        `).join('');
    }
    
    getBuildStatusIcon(status) {
        const icons = {
            success: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>',
            failed: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
            running: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spin"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
            cancelled: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/></svg>'
        };
        return icons[status] || icons.cancelled;
    }
    
    // ==================== 统计数据 ====================
    renderStatistics() {
        this.updateStatCard('pendingIssues', this.data.statistics.pendingIssues);
        this.updateStatCard('completedIssues', this.data.statistics.completedIssues);
        this.updateStatCard('pendingMerges', this.data.statistics.pendingMerges);
        this.updateStatCard('todayBuilds', this.data.statistics.todayBuilds);
    }
    
    updateStatCard(cardId, stat) {
        const card = document.querySelector(`[data-stat="${cardId}"]`);
        if (!card) return;
        
        const valueEl = card.querySelector('.stat-value');
        const trendEl = card.querySelector('.stat-trend');
        
        if (valueEl) {
            this.animateNumber(valueEl, stat.value);
        }
        
        if (trendEl) {
            trendEl.className = `stat-trend ${stat.trendDirection}`;
            trendEl.innerHTML = `
                ${stat.trendDirection === 'up' 
                    ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>'
                    : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>'
                }
                <span>${stat.trendDirection === 'up' ? '+' : '-'}${stat.trend}%</span>
            `;
        }
    }
    
    animateNumber(element, targetValue) {
        const startValue = parseInt(element.textContent) || 0;
        const duration = 500;
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const easeOutQuad = 1 - (1 - progress) * (1 - progress);
            const currentValue = Math.round(startValue + (targetValue - startValue) * easeOutQuad);
            
            element.textContent = currentValue;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }
    
    updateStatistics() {
        // 重新计算统计数据
        const pendingTodos = this.data.todos.filter(t => t.status !== 'done').length;
        const completedTodos = this.data.todos.filter(t => t.status === 'done').length;
        
        this.data.statistics.pendingIssues.value = pendingTodos;
        this.data.statistics.completedIssues.value = completedTodos;
        
        this.renderStatistics();
    }
    
    // ==================== 日历组件 ====================
    renderCalendar() {
        const container = document.getElementById('calendarWidget');
        if (!container) return;
        
        const year = this.currentCalendarDate.getFullYear();
        const month = this.currentCalendarDate.getMonth();
        
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDay = firstDay.getDay();
        const daysInMonth = lastDay.getDate();
        
        const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
        
        let calendarHTML = `
            <div class="calendar-header">
                <button class="calendar-nav" onclick="dashboardModule.prevMonth()">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="15 18 9 12 15 6"/>
                    </svg>
                </button>
                <span class="calendar-title">${year}年 ${monthNames[month]}</span>
                <button class="calendar-nav" onclick="dashboardModule.nextMonth()">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="9 18 15 12 9 6"/>
                    </svg>
                </button>
            </div>
            <div class="calendar-weekdays">
                <span>日</span><span>一</span><span>二</span><span>三</span><span>四</span><span>五</span><span>六</span>
            </div>
            <div class="calendar-days">
        `;
        
        // 填充上月的日期
        for (let i = 0; i < startDay; i++) {
            const prevMonthDay = new Date(year, month, -startDay + i + 1).getDate();
            calendarHTML += `<span class="calendar-day other-month">${prevMonthDay}</span>`;
        }
        
        // 填充当月的日期
        const today = new Date();
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const events = this.data.calendarEvents.filter(e => e.date === dateStr);
            const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
            
            let dayClass = 'calendar-day';
            if (isToday) dayClass += ' today';
            if (events.length > 0) dayClass += ' has-events';
            
            calendarHTML += `
                <span class="${dayClass}" onclick="dashboardModule.showDayEvents('${dateStr}')" data-date="${dateStr}">
                    ${day}
                    ${events.length > 0 ? `<span class="event-dot" style="background: ${events[0].color}"></span>` : ''}
                </span>
            `;
        }
        
        // 填充下月的日期
        const remainingDays = 42 - (startDay + daysInMonth);
        for (let i = 1; i <= remainingDays; i++) {
            calendarHTML += `<span class="calendar-day other-month">${i}</span>`;
        }
        
        calendarHTML += '</div>';
        
        // 显示今日事件
        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        const todayEvents = this.data.calendarEvents.filter(e => e.date === todayStr);
        
        if (todayEvents.length > 0) {
            calendarHTML += `
                <div class="calendar-events">
                    <div class="calendar-events-title">今日事件</div>
                    ${todayEvents.map(event => `
                        <div class="calendar-event" style="border-left-color: ${event.color}">
                            <span class="event-time">${event.time}</span>
                            <span class="event-title">${event.title}</span>
                        </div>
                    `).join('')}
                </div>
            `;
        }
        
        container.innerHTML = calendarHTML;
    }
    
    prevMonth() {
        this.currentCalendarDate.setMonth(this.currentCalendarDate.getMonth() - 1);
        this.renderCalendar();
    }
    
    nextMonth() {
        this.currentCalendarDate.setMonth(this.currentCalendarDate.getMonth() + 1);
        this.renderCalendar();
    }
    
    showDayEvents(dateStr) {
        const events = this.data.calendarEvents.filter(e => e.date === dateStr);
        
        if (events.length === 0) {
            showToast('该日期没有事件');
            return;
        }
        
        // 显示事件弹窗
        const modal = document.getElementById('eventModal');
        if (modal) {
            const eventList = modal.querySelector('.event-list');
            eventList.innerHTML = events.map(event => `
                <div class="event-item" style="border-left-color: ${event.color}">
                    <div class="event-time">${event.time}</div>
                    <div class="event-title">${event.title}</div>
                    <div class="event-type">${this.getEventTypeLabel(event.type)}</div>
                </div>
            `).join('');
            
            modal.querySelector('.modal-header h3').textContent = `${dateStr} 的事件`;
            modalManager.open('eventModal');
        }
    }
    
    getEventTypeLabel(type) {
        const labels = {
            meeting: '会议',
            release: '发布',
            review: '评审',
            deadline: '截止日期'
        };
        return labels[type] || type;
    }
    
    addCalendarEvent(event) {
        this.data.calendarEvents.push(event);
        this.renderCalendar();
        showToast('事件已添加', 'success');
    }
    
    openAddEventModal() {
        // 设置默认日期为今天
        const today = new Date();
        const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        
        const dateInput = document.getElementById('eventDate');
        if (dateInput) {
            dateInput.value = dateStr;
        }
        
        const timeInput = document.getElementById('eventTime');
        if (timeInput) {
            timeInput.value = '09:00';
        }
        
        modalManager.open('addEventModal');
    }
    
    saveEvent() {
        const title = document.getElementById('eventTitle')?.value;
        const date = document.getElementById('eventDate')?.value;
        const time = document.getElementById('eventTime')?.value;
        const type = document.getElementById('eventType')?.value;
        const color = document.querySelector('input[name="eventColor"]:checked')?.value || '#2b7de9';
        
        if (!title || !title.trim()) {
            showToast('请输入事件标题', 'error');
            return;
        }
        
        if (!date) {
            showToast('请选择日期', 'error');
            return;
        }
        
        const newEvent = {
            id: Date.now(),
            title: title.trim(),
            date: date,
            time: time || '00:00',
            type: type,
            color: color
        };
        
        this.addCalendarEvent(newEvent);
        modalManager.close('addEventModal');
        
        // 重置表单
        document.getElementById('eventTitle').value = '';
    }
    
    updateChartPeriod(period) {
        // 根据选择的时间段更新图表数据
        const periodData = {
            week: {
                labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
                created: [5, 8, 12, 6, 10, 3, 2],
                completed: [4, 6, 8, 10, 12, 5, 3]
            },
            month: {
                labels: ['第1周', '第2周', '第3周', '第4周'],
                created: [25, 32, 28, 35],
                completed: [22, 28, 30, 32]
            },
            quarter: {
                labels: ['1月', '2月', '3月'],
                created: [120, 135, 145],
                completed: [110, 125, 140]
            }
        };
        
        this.data.issuesTrend = periodData[period] || periodData.week;
        this.renderIssuesTrendChart();
        showToast(`已切换到${period === 'week' ? '本周' : period === 'month' ? '本月' : '本季度'}视图`);
    }
    
    // ==================== 图表渲染 ====================
    renderCharts() {
        this.renderIssuesTrendChart();
        this.renderBuildStatsChart();
    }
    
    renderIssuesTrendChart() {
        const container = document.getElementById('issuesTrendChart');
        if (!container) return;
        
        const data = this.data.issuesTrend;
        const maxValue = Math.max(...data.created, ...data.completed);
        const chartHeight = 120;
        
        let chartHTML = `
            <div class="chart-legend">
                <span class="legend-item"><span class="legend-color" style="background: #2b7de9"></span>新建</span>
                <span class="legend-item"><span class="legend-color" style="background: #10b981"></span>完成</span>
            </div>
            <div class="line-chart">
                <svg viewBox="0 0 300 ${chartHeight}" preserveAspectRatio="none">
        `;
        
        // 绘制网格线
        for (let i = 0; i <= 4; i++) {
            const y = (chartHeight / 4) * i;
            chartHTML += `<line x1="0" y1="${y}" x2="300" y2="${y}" stroke="#e5e7eb" stroke-width="1"/>`;
        }
        
        // 绘制新建事项折线
        const createdPoints = data.created.map((value, index) => {
            const x = (300 / (data.labels.length - 1)) * index;
            const y = chartHeight - (value / maxValue) * chartHeight;
            return `${x},${y}`;
        }).join(' ');
        
        chartHTML += `<polyline points="${createdPoints}" fill="none" stroke="#2b7de9" stroke-width="2"/>`;
        
        // 绘制完成事项折线
        const completedPoints = data.completed.map((value, index) => {
            const x = (300 / (data.labels.length - 1)) * index;
            const y = chartHeight - (value / maxValue) * chartHeight;
            return `${x},${y}`;
        }).join(' ');
        
        chartHTML += `<polyline points="${completedPoints}" fill="none" stroke="#10b981" stroke-width="2"/>`;
        
        // 绘制数据点
        data.created.forEach((value, index) => {
            const x = (300 / (data.labels.length - 1)) * index;
            const y = chartHeight - (value / maxValue) * chartHeight;
            chartHTML += `<circle cx="${x}" cy="${y}" r="4" fill="#2b7de9"/>`;
        });
        
        data.completed.forEach((value, index) => {
            const x = (300 / (data.labels.length - 1)) * index;
            const y = chartHeight - (value / maxValue) * chartHeight;
            chartHTML += `<circle cx="${x}" cy="${y}" r="4" fill="#10b981"/>`;
        });
        
        chartHTML += `
                </svg>
                <div class="chart-labels">
                    ${data.labels.map(label => `<span>${label}</span>`).join('')}
                </div>
            </div>
        `;
        
        container.innerHTML = chartHTML;
    }
    
    renderBuildStatsChart() {
        const container = document.getElementById('buildStatsChart');
        if (!container) return;
        
        const data = this.data.buildStats;
        const total = data.data.reduce((a, b) => a + b, 0);
        
        let chartHTML = `
            <div class="donut-chart">
                <svg viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" stroke-width="12"/>
        `;
        
        let currentAngle = -90;
        data.data.forEach((value, index) => {
            const percentage = (value / total) * 100;
            const angle = (percentage / 100) * 360;
            const largeArc = angle > 180 ? 1 : 0;
            
            const startX = 50 + 40 * Math.cos((currentAngle * Math.PI) / 180);
            const startY = 50 + 40 * Math.sin((currentAngle * Math.PI) / 180);
            const endX = 50 + 40 * Math.cos(((currentAngle + angle) * Math.PI) / 180);
            const endY = 50 + 40 * Math.sin(((currentAngle + angle) * Math.PI) / 180);
            
            chartHTML += `
                <path d="M ${startX} ${startY} A 40 40 0 ${largeArc} 1 ${endX} ${endY}" 
                      fill="none" stroke="${data.colors[index]}" stroke-width="12"/>
            `;
            
            currentAngle += angle;
        });
        
        chartHTML += `
                    <text x="50" y="50" text-anchor="middle" dominant-baseline="middle" class="chart-center-text">
                        <tspan x="50" dy="-5" font-size="16" font-weight="600">${total}</tspan>
                        <tspan x="50" dy="14" font-size="8" fill="#6b7280">总构建</tspan>
                    </text>
                </svg>
            </div>
            <div class="chart-legend vertical">
                ${data.labels.map((label, index) => `
                    <span class="legend-item">
                        <span class="legend-color" style="background: ${data.colors[index]}"></span>
                        ${label}: ${data.data[index]} (${Math.round((data.data[index] / total) * 100)}%)
                    </span>
                `).join('')}
            </div>
        `;
        
        container.innerHTML = chartHTML;
    }
    
    // ==================== 快捷操作 ====================
    bindEvents() {
        // 快捷操作按钮
        document.querySelectorAll('.quick-action').forEach(btn => {
            const action = btn.dataset.action;
            if (action) {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.handleQuickAction(action);
                });
            }
        });
        
        // 刷新按钮
        const refreshBtn = document.getElementById('refreshDashboard');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshDashboard());
        }
    }
    
    handleQuickAction(action) {
        switch (action) {
            case 'create-issue':
                openCreateIssueModal();
                break;
            case 'create-project':
                openCreateProjectModal();
                break;
            case 'create-repo':
                openCreateRepoModal();
                break;
            case 'trigger-build':
                this.triggerBuild();
                break;
            case 'create-doc':
                showToast('新建文档功能开发中');
                break;
            case 'invite-member':
                window.location.href = 'members.html';
                break;
            default:
                showToast('功能开发中');
        }
    }
    
    triggerBuild() {
        showToast('正在触发构建...', 'info');
        
        // 模拟构建触发
        setTimeout(() => {
            const newBuild = {
                id: 1236,
                branch: 'main',
                project: '前端项目',
                status: 'running',
                duration: '运行中...',
                time: '刚刚'
            };
            
            this.data.recentBuilds.unshift(newBuild);
            if (this.data.recentBuilds.length > 10) {
                this.data.recentBuilds.pop();
            }
            
            this.renderRecentBuilds();
            this.addActivity({
                id: Date.now(),
                user: { name: '张三', avatar: 'user' },
                action: 'triggered',
                target: `构建 #${newBuild.id}`,
                link: 'build-detail.html',
                time: '刚刚',
                type: 'build'
            });
            
            showToast('构建已触发', 'success');
        }, 1000);
    }
    
    refreshDashboard() {
        showToast('正在刷新...', 'info');
        
        // 模拟数据刷新
        setTimeout(() => {
            this.renderTodoList();
            this.renderRecentProjects();
            this.renderActivityFeed();
            this.renderRecentBuilds();
            this.renderStatistics();
            this.renderCalendar();
            this.renderCharts();
            
            showToast('刷新完成', 'success');
        }, 500);
    }
    
    // ==================== 实时更新 ====================
    startRealTimeUpdates() {
        // 每30秒更新一次活动动态
        setInterval(() => {
            this.simulateNewActivity();
        }, 30000);
        
        // 每60秒更新一次统计数据
        setInterval(() => {
            this.simulateStatisticsUpdate();
        }, 60000);
    }
    
    simulateNewActivity() {
        const activities = [
            { user: { name: '李四', avatar: 'user1' }, action: 'created', target: '事项 新功能开发', link: 'issue-detail.html', type: 'issue' },
            { user: { name: '王五', avatar: 'user2' }, action: 'merged', target: '分支 feature/new 到 develop', type: 'merge' },
            { user: { name: '赵六', avatar: 'user3' }, action: 'completed', target: '构建 #1237', link: 'build-detail.html', status: 'success', type: 'build' }
        ];
        
        const randomActivity = activities[Math.floor(Math.random() * activities.length)];
        randomActivity.id = Date.now();
        randomActivity.time = '刚刚';
        
        this.addActivity(randomActivity);
    }
    
    simulateStatisticsUpdate() {
        // 随机更新统计数据
        const stats = this.data.statistics;
        
        if (Math.random() > 0.5) {
            stats.pendingIssues.value += Math.floor(Math.random() * 3) - 1;
            stats.pendingIssues.value = Math.max(0, stats.pendingIssues.value);
        }
        
        if (Math.random() > 0.5) {
            stats.todayBuilds.value += Math.floor(Math.random() * 2);
        }
        
        this.renderStatistics();
    }
}

// ==================== 初始化 ====================
let dashboardModule;

document.addEventListener('DOMContentLoaded', function() {
    dashboardModule = new DashboardModule();
    console.log('工作台模块已加载');
});

// 导出全局变量
window.dashboardModule = dashboardModule;
window.DashboardData = DashboardData;