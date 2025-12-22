/**
 * Iteration Detail Module - 迭代详情模块
 * Handles all iteration detail functionality including:
 * - Iteration info dynamic loading
 * - Iteration editing and saving
 * - Burndown chart data calculation and rendering
 * - Issue statistics dynamic update
 * - Add issues to iteration
 * - Remove issues from iteration
 * - Complete/close iteration
 */

// Mock data for iteration detail
const IterationDetailData = {
    iteration: {
        id: 1,
        name: 'Sprint 12',
        status: 'current',
        startDate: '2024-01-08',
        endDate: '2024-01-21',
        goal: '完成用户登录功能的开发和测试',
        project: '前端项目',
        projectId: 1,
        totalIssues: 12,
        completedIssues: 8,
        processingIssues: 3,
        pendingIssues: 1,
        testingIssues: 2,
        storyPoints: 26,
        completedPoints: 17,
        createdAt: '2024-01-05',
        createdBy: '张三'
    },
    issues: [
        { id: 1024, title: '新增数据导出功能', type: 'requirement', status: 'pending', priority: 'high', assignee: { id: 1, name: '张三', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1' }, storyPoints: 5 },
        { id: 1020, title: '用户登录功能优化', type: 'requirement', status: 'processing', priority: 'high', assignee: { id: 2, name: '李四', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2' }, storyPoints: 8 },
        { id: 1022, title: '编写API接口文档', type: 'task', status: 'processing', priority: 'medium', assignee: { id: 3, name: '王五', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3' }, storyPoints: 3 },
        { id: 1023, title: '登录页面在Safari浏览器显示异常', type: 'bug', status: 'processing', priority: 'high', assignee: { id: 4, name: '赵六', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=4' }, storyPoints: 2 },
        { id: 1018, title: '实现登录表单验证', type: 'task', status: 'testing', priority: 'medium', assignee: { id: 2, name: '李四', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2' }, storyPoints: 3 },
        { id: 1019, title: '添加记住密码功能', type: 'task', status: 'testing', priority: 'low', assignee: { id: 3, name: '王五', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3' }, storyPoints: 2 },
        { id: 1015, title: '设计登录页面UI', type: 'task', status: 'completed', priority: 'medium', assignee: { id: 5, name: '钱七', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=5' }, storyPoints: 3 },
        { id: 1016, title: '实现登录API接口', type: 'task', status: 'completed', priority: 'high', assignee: { id: 6, name: '孙八', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=6' }, storyPoints: 5 },
        { id: 1017, title: '集成第三方登录', type: 'task', status: 'completed', priority: 'medium', assignee: { id: 2, name: '李四', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2' }, storyPoints: 5 },
        { id: 1014, title: '登录功能需求分析', type: 'requirement', status: 'completed', priority: 'high', assignee: { id: 1, name: '张三', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1' }, storyPoints: 2 },
        { id: 1013, title: '登录模块技术方案', type: 'task', status: 'completed', priority: 'high', assignee: { id: 2, name: '李四', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2' }, storyPoints: 3 },
        { id: 1012, title: '登录安全测试', type: 'task', status: 'completed', priority: 'medium', assignee: { id: 4, name: '赵六', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=4' }, storyPoints: 2 }
    ],
    burndownData: [
        { date: '2024-01-08', day: 1, ideal: 26, actual: 26 },
        { date: '2024-01-09', day: 2, ideal: 24.1, actual: 25 },
        { date: '2024-01-10', day: 3, ideal: 22.3, actual: 23 },
        { date: '2024-01-11', day: 4, ideal: 20.4, actual: 21 },
        { date: '2024-01-12', day: 5, ideal: 18.6, actual: 18 },
        { date: '2024-01-13', day: 6, ideal: 16.7, actual: 16 },
        { date: '2024-01-14', day: 7, ideal: 14.9, actual: 14 },
        { date: '2024-01-15', day: 8, ideal: 13, actual: 11 },
        { date: '2024-01-16', day: 9, ideal: 11.1, actual: 9 }
    ],
    availableIssues: [
        { id: 1025, title: '用户权限管理功能', type: 'requirement', priority: 'high', storyPoints: 8 },
        { id: 1026, title: '优化数据库查询性能', type: 'task', priority: 'medium', storyPoints: 5 },
        { id: 1027, title: '修复导出功能异常', type: 'bug', priority: 'high', storyPoints: 3 },
        { id: 1028, title: '添加数据统计报表', type: 'requirement', priority: 'medium', storyPoints: 5 },
        { id: 1029, title: '实现消息通知功能', type: 'requirement', priority: 'low', storyPoints: 5 },
        { id: 1030, title: '优化前端加载速度', type: 'task', priority: 'medium', storyPoints: 3 }
    ],
    retrospective: {
        good: [
            '团队协作效率提升，每日站会准时进行',
            '代码评审质量提高，发现问题更及时',
            '需求拆分更加合理，任务粒度适中'
        ],
        improve: [
            '代码审查覆盖率需要提高',
            '文档更新不够及时',
            '跨团队沟通需要加强'
        ],
        action: [
            '下个迭代增加测试任务的故事点',
            '每个需求完成后立即更新文档',
            '每周增加一次跨团队同步会议'
        ]
    },
    members: [
        { id: 1, name: '张三', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1', role: '产品经理' },
        { id: 2, name: '李四', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2', role: '前端开发' },
        { id: 3, name: '王五', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3', role: '前端开发' },
        { id: 4, name: '赵六', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=4', role: '运维工程师' },
        { id: 5, name: '钱七', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=5', role: 'UI设计师' },
        { id: 6, name: '孙八', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=6', role: '后端开发' },
        { id: 7, name: '周九', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=7', role: '后端开发' }
    ]
};

// Iteration Detail Module Class
class IterationDetailModule {
    constructor() {
        this.iteration = { ...IterationDetailData.iteration };
        this.issues = [...IterationDetailData.issues];
        this.burndownData = [...IterationDetailData.burndownData];
        this.availableIssues = [...IterationDetailData.availableIssues];
        this.retrospective = { ...IterationDetailData.retrospective };
        this.members = [...IterationDetailData.members];
        this.currentView = 'kanban';
        this.draggedCard = null;
        
        this.init();
    }
    
    init() {
        this.loadIterationData();
        this.bindEvents();
        this.initKanbanDragDrop();
    }
    
    // Load iteration data
    loadIterationData() {
        this.updateIterationHeader();
        this.updateIterationStats();
        this.renderBurndownChart();
    }
    
    // Update iteration header
    updateIterationHeader() {
        const titleEl = document.querySelector('.iteration-title');
        if (titleEl) {
            titleEl.textContent = this.iteration.name;
        }
        
        const dateEl = document.querySelector('.iteration-date');
        if (dateEl) {
            const daysRemaining = this.calculateDaysRemaining(this.iteration.endDate);
            dateEl.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                ${this.formatDate(this.iteration.startDate)} ~ ${this.formatDate(this.iteration.endDate)} (${daysRemaining > 0 ? `剩余 ${daysRemaining} 天` : '已结束'})
            `;
        }
        
        // Update status badge
        const statusBadge = document.querySelector('.iteration-status-badge');
        if (statusBadge) {
            const statusText = this.iteration.status === 'current' ? '进行中' : 
                              this.iteration.status === 'upcoming' ? '未开始' : '已完成';
            statusBadge.textContent = statusText;
            statusBadge.className = `iteration-status-badge ${this.iteration.status === 'current' ? 'active' : this.iteration.status}`;
        }
        
        // Update page title
        document.title = `${this.iteration.name} - 迭代详情 - 摩塔 Mota`;
    }
    
    // Update iteration statistics
    updateIterationStats() {
        // Calculate stats from issues
        const stats = this.calculateStats();
        
        // Update stat values
        const statItems = document.querySelectorAll('.iteration-stat-item');
        statItems.forEach(item => {
            const label = item.querySelector('.stat-label')?.textContent;
            const valueEl = item.querySelector('.stat-value');
            
            if (!valueEl) return;
            
            switch (label) {
                case '总事项':
                    valueEl.textContent = stats.total;
                    break;
                case '已完成':
                    valueEl.textContent = stats.completed;
                    break;
                case '进行中':
                    valueEl.textContent = stats.processing;
                    break;
                case '待处理':
                    valueEl.textContent = stats.pending;
                    break;
                case '故事点':
                    valueEl.textContent = stats.storyPoints;
                    break;
            }
        });
        
        // Update progress bar
        const progress = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
        const progressPercent = document.querySelector('.progress-percent');
        const progressFill = document.querySelector('.iteration-progress-bar .progress-fill');
        
        if (progressPercent) {
            progressPercent.textContent = `${progress}%`;
        }
        if (progressFill) {
            progressFill.style.width = `${progress}%`;
        }
        
        // Update column counts in kanban
        this.updateKanbanCounts();
    }
    
    // Calculate statistics from issues
    calculateStats() {
        const stats = {
            total: this.issues.length,
            completed: this.issues.filter(i => i.status === 'completed').length,
            processing: this.issues.filter(i => i.status === 'processing').length,
            pending: this.issues.filter(i => i.status === 'pending').length,
            testing: this.issues.filter(i => i.status === 'testing').length,
            storyPoints: this.issues.reduce((sum, i) => sum + (i.storyPoints || 0), 0),
            completedPoints: this.issues.filter(i => i.status === 'completed').reduce((sum, i) => sum + (i.storyPoints || 0), 0)
        };
        return stats;
    }
    
    // Update kanban column counts
    updateKanbanCounts() {
        const columns = document.querySelectorAll('.kanban-column');
        columns.forEach(column => {
            const status = column.dataset.status;
            const count = this.issues.filter(i => i.status === status).length;
            const countEl = column.querySelector('.column-count');
            if (countEl) {
                countEl.textContent = count;
            }
        });
    }
    
    // Render burndown chart
    renderBurndownChart() {
        const chartContainer = document.querySelector('#burndown-view .burndown-chart');
        if (!chartContainer) return;
        
        const data = this.burndownData;
        const maxPoints = this.iteration.storyPoints;
        const totalDays = 14; // 2 weeks sprint
        
        // Chart dimensions
        const width = 800;
        const height = 400;
        const padding = { left: 60, right: 40, top: 50, bottom: 50 };
        const innerWidth = width - padding.left - padding.right;
        const innerHeight = height - padding.top - padding.bottom;
        
        // Calculate scales
        const xStep = innerWidth / (totalDays - 1);
        const yScale = innerHeight / maxPoints;
        
        // Generate ideal line points
        const idealPoints = [];
        for (let i = 0; i < totalDays; i++) {
            const x = padding.left + i * xStep;
            const y = padding.top + (i * maxPoints / (totalDays - 1)) * yScale;
            idealPoints.push(`${x},${padding.top + innerHeight - (maxPoints - i * maxPoints / (totalDays - 1)) * yScale}`);
        }
        
        // Generate actual line points
        const actualPoints = data.map((d, i) => {
            const x = padding.left + i * xStep;
            const y = padding.top + innerHeight - d.actual * yScale;
            return `${x},${y}`;
        }).join(' ');
        
        // Generate grid lines
        let gridLines = '';
        for (let i = 0; i <= 5; i++) {
            const y = padding.top + (i * innerHeight / 5);
            gridLines += `<line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" stroke="#f3f4f6" stroke-width="1"/>`;
        }
        
        // Generate Y-axis labels
        let yLabels = '';
        for (let i = 0; i <= 5; i++) {
            const value = Math.round(maxPoints - (i * maxPoints / 5));
            const y = padding.top + (i * innerHeight / 5) + 4;
            yLabels += `<text x="${padding.left - 10}" y="${y}" text-anchor="end" font-size="12" fill="#6b7280">${value}</text>`;
        }
        
        // Generate X-axis labels
        let xLabels = '';
        const startDate = new Date(this.iteration.startDate);
        for (let i = 0; i < totalDays; i += 2) {
            const date = new Date(startDate);
            date.setDate(date.getDate() + i);
            const x = padding.left + i * xStep;
            const label = `${date.getMonth() + 1}/${date.getDate()}`;
            xLabels += `<text x="${x}" y="${height - padding.bottom + 20}" text-anchor="middle" font-size="12" fill="#6b7280">${label}</text>`;
        }
        
        // Today marker
        const today = new Date();
        const daysSinceStart = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
        const todayX = padding.left + daysSinceStart * xStep;
        const todayMarker = daysSinceStart >= 0 && daysSinceStart < totalDays ? `
            <line x1="${todayX}" y1="${padding.top}" x2="${todayX}" y2="${padding.top + innerHeight}" stroke="#f59e0b" stroke-width="2" stroke-dasharray="4,4"/>
            <text x="${todayX}" y="${padding.top - 10}" fill="#f59e0b" font-size="12" text-anchor="middle">今日</text>
        ` : '';
        
        // Data points
        const dataPoints = data.map((d, i) => {
            const x = padding.left + i * xStep;
            const y = padding.top + innerHeight - d.actual * yScale;
            return `<circle cx="${x}" cy="${y}" r="5" fill="#2b7de9"/>`;
        }).join('');
        
        const svg = `
            <svg viewBox="0 0 ${width} ${height}" class="chart-svg">
                <!-- Grid lines -->
                <g class="grid-lines">
                    <line x1="${padding.left}" y1="${padding.top}" x2="${padding.left}" y2="${padding.top + innerHeight}" stroke="#e5e7eb" stroke-width="1"/>
                    <line x1="${padding.left}" y1="${padding.top + innerHeight}" x2="${width - padding.right}" y2="${padding.top + innerHeight}" stroke="#e5e7eb" stroke-width="1"/>
                    ${gridLines}
                </g>
                
                <!-- Y-axis labels -->
                <g class="y-labels">${yLabels}</g>
                
                <!-- X-axis labels -->
                <g class="x-labels">${xLabels}</g>
                
                <!-- Ideal line -->
                <line x1="${padding.left}" y1="${padding.top}" x2="${width - padding.right}" y2="${padding.top + innerHeight}" stroke="#94a3b8" stroke-width="2" stroke-dasharray="8,4"/>
                
                <!-- Actual line -->
                <polyline points="${actualPoints}" fill="none" stroke="#2b7de9" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                
                <!-- Data points -->
                <g class="data-points">${dataPoints}</g>
                
                <!-- Today marker -->
                ${todayMarker}
            </svg>
        `;
        
        chartContainer.innerHTML = svg;
        
        // Update burndown stats
        this.updateBurndownStats();
    }
    
    // Update burndown statistics
    updateBurndownStats() {
        const stats = this.calculateStats();
        const remainingPoints = stats.storyPoints - stats.completedPoints;
        
        // Calculate estimated completion date
        const completedDays = this.burndownData.length;
        const avgPointsPerDay = stats.completedPoints / completedDays;
        const daysToComplete = avgPointsPerDay > 0 ? Math.ceil(remainingPoints / avgPointsPerDay) : 0;
        
        const today = new Date();
        const estimatedDate = new Date(today);
        estimatedDate.setDate(estimatedDate.getDate() + daysToComplete);
        
        const burndownStats = document.querySelectorAll('.burndown-stat-item');
        burndownStats.forEach(item => {
            const label = item.querySelector('.stat-label')?.textContent;
            const valueEl = item.querySelector('.stat-value');
            
            if (!valueEl) return;
            
            switch (label) {
                case '计划故事点':
                    valueEl.textContent = `${stats.storyPoints} SP`;
                    break;
                case '已完成故事点':
                    valueEl.textContent = `${stats.completedPoints} SP`;
                    break;
                case '剩余故事点':
                    valueEl.textContent = `${remainingPoints} SP`;
                    break;
                case '预计完成日期':
                    valueEl.textContent = `${estimatedDate.getMonth() + 1}月${estimatedDate.getDate()}日`;
                    break;
            }
        });
    }
    
    // Bind events
    bindEvents() {
        // View tab switching
        document.querySelectorAll('.view-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const view = e.currentTarget.dataset.view;
                this.switchView(view);
            });
        });
        
        // Edit button
        const editBtn = document.querySelector('.iteration-header-actions .btn-secondary');
        if (editBtn) {
            editBtn.addEventListener('click', () => this.openEditModal());
        }
        
        // Add issue button
        const addIssueBtn = document.querySelector('.iteration-header-actions .btn-primary');
        if (addIssueBtn) {
            addIssueBtn.addEventListener('click', () => this.openAddIssueModal());
        }
        
        // Column add buttons
        document.querySelectorAll('.column-add-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const column = e.currentTarget.closest('.kanban-column');
                const status = column?.dataset.status;
                this.quickCreateIssue(status);
            });
        });
        
        // Search in add issue modal
        const searchInput = document.querySelector('#addIssueModal .search-input-wrapper input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.filterAvailableIssues(e.target.value));
        }
    }
    
    // Switch view
    switchView(view) {
        this.currentView = view;
        
        // Update tab active state
        document.querySelectorAll('.view-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.view === view);
        });
        
        // Update view content
        document.querySelectorAll('.view-content').forEach(content => {
            content.classList.remove('active');
        });
        
        const viewContent = document.getElementById(`${view}-view`);
        if (viewContent) {
            viewContent.classList.add('active');
        }
        
        // Re-render burndown chart if switching to burndown view
        if (view === 'burndown') {
            this.renderBurndownChart();
        }
    }
    
    // Initialize kanban drag and drop
    initKanbanDragDrop() {
        const cards = document.querySelectorAll('.kanban-card');
        const columns = document.querySelectorAll('.kanban-column-body');
        
        cards.forEach(card => {
            card.addEventListener('dragstart', (e) => {
                this.draggedCard = card;
                card.style.opacity = '0.5';
                card.classList.add('dragging');
            });
            
            card.addEventListener('dragend', (e) => {
                card.style.opacity = '1';
                card.classList.remove('dragging');
                this.draggedCard = null;
                
                // Remove all drag-over states
                columns.forEach(col => col.classList.remove('drag-over'));
            });
        });
        
        columns.forEach(column => {
            column.addEventListener('dragover', (e) => {
                e.preventDefault();
                column.classList.add('drag-over');
            });
            
            column.addEventListener('dragleave', (e) => {
                column.classList.remove('drag-over');
            });
            
            column.addEventListener('drop', (e) => {
                e.preventDefault();
                column.classList.remove('drag-over');
                
                if (this.draggedCard) {
                    const newStatus = column.closest('.kanban-column')?.dataset.status;
                    const issueId = this.getIssueIdFromCard(this.draggedCard);
                    
                    if (newStatus && issueId) {
                        this.updateIssueStatus(issueId, newStatus);
                        column.appendChild(this.draggedCard);
                        
                        // Update card completed state
                        if (newStatus === 'completed') {
                            this.draggedCard.classList.add('completed');
                        } else {
                            this.draggedCard.classList.remove('completed');
                        }
                    }
                }
            });
        });
    }
    
    // Get issue ID from card element
    getIssueIdFromCard(card) {
        const idEl = card.querySelector('.issue-id');
        if (idEl) {
            const match = idEl.textContent.match(/#(\d+)/);
            return match ? parseInt(match[1]) : null;
        }
        return null;
    }
    
    // Update issue status
    updateIssueStatus(issueId, newStatus) {
        const issue = this.issues.find(i => i.id === issueId);
        if (issue) {
            const oldStatus = issue.status;
            issue.status = newStatus;
            
            // Update statistics
            this.updateIterationStats();
            
            // Update burndown data if completing an issue
            if (newStatus === 'completed' && oldStatus !== 'completed') {
                const lastData = this.burndownData[this.burndownData.length - 1];
                if (lastData) {
                    lastData.actual -= issue.storyPoints || 0;
                }
                this.renderBurndownChart();
            }
            
            showToast(`事项 #${issueId} 状态已更新为 ${this.getStatusText(newStatus)}`, 'success');
        }
    }
    
    // Get status text
    getStatusText(status) {
        const statusMap = {
            pending: '待处理',
            processing: '进行中',
            testing: '测试中',
            completed: '已完成'
        };
        return statusMap[status] || status;
    }
    
    // Open edit modal
    openEditModal() {
        // Populate form
        const nameInput = document.querySelector('#editIterationModal input[type="text"]');
        const startDateInput = document.querySelector('#editIterationModal input[type="date"]:first-of-type');
        const endDateInput = document.querySelector('#editIterationModal input[type="date"]:last-of-type');
        const goalTextarea = document.querySelector('#editIterationModal textarea');
        const statusSelect = document.querySelector('#editIterationModal select');
        
        if (nameInput) nameInput.value = this.iteration.name;
        if (startDateInput) startDateInput.value = this.iteration.startDate;
        if (endDateInput) endDateInput.value = this.iteration.endDate;
        if (goalTextarea) goalTextarea.value = this.iteration.goal || '';
        if (statusSelect) statusSelect.value = this.iteration.status;
        
        openModal('editIterationModal');
    }
    
    // Save iteration
    saveIteration() {
        const nameInput = document.querySelector('#editIterationModal input[type="text"]');
        const startDateInput = document.querySelector('#editIterationModal input[type="date"]:first-of-type');
        const endDateInput = document.querySelector('#editIterationModal input[type="date"]:last-of-type');
        const goalTextarea = document.querySelector('#editIterationModal textarea');
        const statusSelect = document.querySelector('#editIterationModal select');
        
        const name = nameInput?.value.trim();
        const startDate = startDateInput?.value;
        const endDate = endDateInput?.value;
        const goal = goalTextarea?.value.trim();
        const status = statusSelect?.value;
        
        // Validation
        if (!name) {
            showToast('请输入迭代名称', 'error');
            return;
        }
        
        if (!startDate || !endDate) {
            showToast('请选择开始和结束日期', 'error');
            return;
        }
        
        if (new Date(startDate) >= new Date(endDate)) {
            showToast('结束日期必须晚于开始日期', 'error');
            return;
        }
        
        // Update iteration
        this.iteration.name = name;
        this.iteration.startDate = startDate;
        this.iteration.endDate = endDate;
        this.iteration.goal = goal;
        this.iteration.status = status;
        
        closeModal('editIterationModal');
        this.updateIterationHeader();
        showToast('迭代信息已更新', 'success');
    }
    
    // Open add issue modal
    openAddIssueModal() {
        this.renderAvailableIssues();
        openModal('addIssueModal');
    }
    
    // Render available issues
    renderAvailableIssues() {
        const container = document.querySelector('#addIssueModal .available-issues');
        if (!container) return;
        
        container.innerHTML = this.availableIssues.map(issue => `
            <div class="issue-checkbox-item">
                <input type="checkbox" id="add-issue-${issue.id}" data-id="${issue.id}">
                <label for="add-issue-${issue.id}">
                    <span class="issue-type ${issue.type}">${this.getTypeText(issue.type)}</span>
                    <span class="issue-id">#${issue.id}</span>
                    <span class="issue-title">${issue.title}</span>
                    <span class="issue-points">${issue.storyPoints} SP</span>
                </label>
            </div>
        `).join('');
    }
    
    // Filter available issues
    filterAvailableIssues(query) {
        const items = document.querySelectorAll('#addIssueModal .issue-checkbox-item');
        const lowerQuery = query.toLowerCase();
        
        items.forEach(item => {
            const title = item.querySelector('.issue-title')?.textContent.toLowerCase() || '';
            const id = item.querySelector('.issue-id')?.textContent.toLowerCase() || '';
            const matches = title.includes(lowerQuery) || id.includes(lowerQuery);
            item.style.display = matches ? 'flex' : 'none';
        });
    }
    
    // Add selected issues to iteration
    addSelectedIssues() {
        const checkboxes = document.querySelectorAll('#addIssueModal .issue-checkbox-item input:checked');
        const selectedIds = Array.from(checkboxes).map(cb => parseInt(cb.dataset.id));
        
        if (selectedIds.length === 0) {
            showToast('请选择要添加的事项', 'warning');
            return;
        }
        
        // Add issues to iteration
        selectedIds.forEach(id => {
            const issue = this.availableIssues.find(i => i.id === id);
            if (issue) {
                this.issues.push({
                    ...issue,
                    status: 'pending',
                    assignee: null
                });
                this.availableIssues = this.availableIssues.filter(i => i.id !== id);
            }
        });
        
        closeModal('addIssueModal');
        this.updateIterationStats();
        this.renderKanbanColumn('pending');
        showToast(`已添加 ${selectedIds.length} 个事项到迭代`, 'success');
    }
    
    // Remove issue from iteration
    removeIssueFromIteration(issueId) {
        const issue = this.issues.find(i => i.id === issueId);
        if (!issue) return;
        
        if (confirm(`确定要从迭代中移除事项 #${issueId} 吗？`)) {
            // Move back to available issues
            this.availableIssues.push({
                id: issue.id,
                title: issue.title,
                type: issue.type,
                priority: issue.priority,
                storyPoints: issue.storyPoints
            });
            
            // Remove from iteration
            this.issues = this.issues.filter(i => i.id !== issueId);
            
            // Remove card from DOM
            const card = document.querySelector(`.kanban-card[data-id="${issueId}"]`);
            if (card) {
                card.remove();
            }
            
            this.updateIterationStats();
            showToast(`事项 #${issueId} 已从迭代中移除`, 'success');
        }
    }
    
    // Render kanban column
    renderKanbanColumn(status) {
        const column = document.querySelector(`.kanban-column[data-status="${status}"] .kanban-column-body`);
        if (!column) return;
        
        const issues = this.issues.filter(i => i.status === status);
        
        issues.forEach(issue => {
            // Check if card already exists
            if (!column.querySelector(`[data-id="${issue.id}"]`)) {
                const card = this.createKanbanCard(issue);
                column.appendChild(card);
            }
        });
    }
    
    // Create kanban card element
    createKanbanCard(issue) {
        const card = document.createElement('div');
        card.className = `kanban-card ${issue.status === 'completed' ? 'completed' : ''}`;
        card.draggable = true;
        card.dataset.id = issue.id;
        
        card.innerHTML = `
            <div class="card-header">
                <span class="issue-type-icon ${issue.type}">
                    ${this.getTypeIcon(issue.type)}
                </span>
                <span class="issue-id">#${issue.id}</span>
            </div>
            <a href="issue-detail.html?id=${issue.id}" class="card-title">${issue.title}</a>
            <div class="card-meta">
                ${issue.priority ? `<span class="priority-badge ${issue.priority}">${this.getPriorityText(issue.priority)}</span>` : ''}
                <span class="story-points">${issue.storyPoints} SP</span>
            </div>
            <div class="card-footer">
                ${issue.assignee ? `<img src="${issue.assignee.avatar}" alt="${issue.assignee.name}" class="assignee-avatar" title="${issue.assignee.name}">` : ''}
            </div>
        `;
        
        // Add drag events
        card.addEventListener('dragstart', (e) => {
            this.draggedCard = card;
            card.style.opacity = '0.5';
            card.classList.add('dragging');
        });
        
        card.addEventListener('dragend', (e) => {
            card.style.opacity = '1';
            card.classList.remove('dragging');
            this.draggedCard = null;
        });
        
        return card;
    }
    
    // Quick create issue
    quickCreateIssue(status) {
        const title = prompt('请输入事项标题：');
        if (!title || !title.trim()) return;
        
        const newId = Math.max(...this.issues.map(i => i.id), ...this.availableIssues.map(i => i.id)) + 1;
        const newIssue = {
            id: newId,
            title: title.trim(),
            type: 'task',
            status: status || 'pending',
            priority: 'medium',
            assignee: null,
            storyPoints: 1
        };
        
        this.issues.push(newIssue);
        this.renderKanbanColumn(status || 'pending');
        this.updateIterationStats();
        showToast(`事项 #${newId} 创建成功`, 'success');
    }
    
    // Complete iteration
    completeIteration() {
        const incompleteCount = this.issues.filter(i => i.status !== 'completed').length;
        
        if (incompleteCount > 0) {
            if (!confirm(`还有 ${incompleteCount} 个未完成的事项，确定要完成迭代吗？未完成的事项将被移回需求池。`)) {
                return;
            }
        }
        
        this.iteration.status = 'completed';
        this.updateIterationHeader();
        showToast('迭代已完成', 'success');
        
        // Redirect to iterations list after a delay
        setTimeout(() => {
            window.location.href = 'iterations.html';
        }, 1500);
    }
    
    // Helper methods
    calculateDaysRemaining(endDate) {
        const end = new Date(endDate);
        const today = new Date();
        return Math.ceil((end - today) / (1000 * 60 * 60 * 24));
    }
    
    formatDate(dateStr) {
        const date = new Date(dateStr);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }
    
    getTypeText(type) {
        const typeMap = { requirement: '需求', task: '任务', bug: '缺陷' };
        return typeMap[type] || type;
    }
    
    getPriorityText(priority) {
        const priorityMap = { high: '高', medium: '中', low: '低' };
        return priorityMap[priority] || priority;
    }
    
    getTypeIcon(type) {
        const icons = {
            requirement: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',
            task: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
            bug: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>'
        };
        return icons[type] || icons.task;
    }
}

// Global functions for modal actions
function addSelectedIssues() {
    if (window.iterationDetailModule) {
        window.iterationDetailModule.addSelectedIssues();
    }
}

function saveIterationChanges() {
    if (window.iterationDetailModule) {
        window.iterationDetailModule.saveIteration();
    }
}

function completeIteration() {
    if (window.iterationDetailModule) {
        window.iterationDetailModule.completeIteration();
    }
}

// Initialize module when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.iterationDetailModule = new IterationDetailModule();
});