/**
 * Iterations Module - 迭代列表模块
 * Handles all iteration list functionality including:
 * - Iteration list data loading
 * - Create iteration modal validation
 * - Create iteration submission
 * - Iteration status filter
 * - Iteration search
 * - Iteration archive
 */

// Mock data for iterations
const IterationsData = {
    iterations: [
        {
            id: 1,
            name: 'Sprint 12',
            status: 'current',
            startDate: '2024-01-08',
            endDate: '2024-01-21',
            goal: '完成用户登录功能的开发和测试',
            project: '前端项目',
            projectId: 1,
            totalIssues: 24,
            completedIssues: 16,
            processingIssues: 5,
            pendingIssues: 3,
            storyPoints: 26,
            completedPoints: 17,
            members: [
                { id: 1, name: '张三', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1' },
                { id: 2, name: '李四', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2' },
                { id: 3, name: '王五', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3' },
                { id: 4, name: '赵六', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=4' },
                { id: 5, name: '钱七', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=5' },
                { id: 6, name: '孙八', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=6' },
                { id: 7, name: '周九', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=7' }
            ],
            burndownData: [
                { day: 1, ideal: 26, actual: 26 },
                { day: 2, ideal: 24, actual: 25 },
                { day: 3, ideal: 22, actual: 23 },
                { day: 4, ideal: 20, actual: 21 },
                { day: 5, ideal: 18, actual: 18 },
                { day: 6, ideal: 16, actual: 16 },
                { day: 7, ideal: 14, actual: 14 },
                { day: 8, ideal: 12, actual: 11 }
            ],
            archived: false,
            createdAt: '2024-01-05'
        },
        {
            id: 2,
            name: 'Sprint 13',
            status: 'upcoming',
            startDate: '2024-01-22',
            endDate: '2024-02-04',
            goal: '实现数据导出和报表功能',
            project: '前端项目',
            projectId: 1,
            totalIssues: 18,
            completedIssues: 0,
            processingIssues: 0,
            pendingIssues: 18,
            storyPoints: 21,
            completedPoints: 0,
            requirements: 5,
            tasks: 10,
            bugs: 3,
            members: [],
            archived: false,
            createdAt: '2024-01-10'
        },
        {
            id: 3,
            name: 'Sprint 14',
            status: 'upcoming',
            startDate: '2024-02-05',
            endDate: '2024-02-18',
            goal: '优化系统性能和用户体验',
            project: '前端项目',
            projectId: 1,
            totalIssues: 12,
            completedIssues: 0,
            processingIssues: 0,
            pendingIssues: 12,
            storyPoints: 15,
            completedPoints: 0,
            requirements: 3,
            tasks: 7,
            bugs: 2,
            members: [],
            archived: false,
            createdAt: '2024-01-12'
        },
        {
            id: 4,
            name: 'Sprint 11',
            status: 'completed',
            startDate: '2023-12-25',
            endDate: '2024-01-07',
            goal: '完成用户注册和权限管理功能',
            project: '前端项目',
            projectId: 1,
            totalIssues: 26,
            completedIssues: 24,
            processingIssues: 0,
            pendingIssues: 2,
            storyPoints: 30,
            completedPoints: 28,
            completionRate: 92,
            members: [
                { id: 1, name: '张三', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1' },
                { id: 2, name: '李四', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2' }
            ],
            archived: false,
            createdAt: '2023-12-20'
        },
        {
            id: 5,
            name: 'Sprint 10',
            status: 'completed',
            startDate: '2023-12-11',
            endDate: '2023-12-24',
            goal: '实现基础框架和核心模块',
            project: '前端项目',
            projectId: 1,
            totalIssues: 22,
            completedIssues: 22,
            processingIssues: 0,
            pendingIssues: 0,
            storyPoints: 25,
            completedPoints: 25,
            completionRate: 100,
            members: [],
            archived: false,
            createdAt: '2023-12-05'
        },
        {
            id: 6,
            name: 'Sprint 9',
            status: 'completed',
            startDate: '2023-11-27',
            endDate: '2023-12-10',
            goal: '项目初始化和技术选型',
            project: '前端项目',
            projectId: 1,
            totalIssues: 25,
            completedIssues: 22,
            processingIssues: 0,
            pendingIssues: 3,
            storyPoints: 28,
            completedPoints: 24,
            completionRate: 88,
            members: [],
            archived: false,
            createdAt: '2023-11-20'
        },
        {
            id: 7,
            name: 'Sprint 8',
            status: 'completed',
            startDate: '2023-11-13',
            endDate: '2023-11-26',
            goal: '需求分析和原型设计',
            project: '后端服务',
            projectId: 2,
            totalIssues: 20,
            completedIssues: 18,
            processingIssues: 0,
            pendingIssues: 2,
            storyPoints: 22,
            completedPoints: 20,
            completionRate: 90,
            members: [],
            archived: true,
            createdAt: '2023-11-08'
        },
        {
            id: 8,
            name: 'Sprint 7',
            status: 'completed',
            startDate: '2023-10-30',
            endDate: '2023-11-12',
            goal: '项目规划和团队组建',
            project: '后端服务',
            projectId: 2,
            totalIssues: 15,
            completedIssues: 15,
            processingIssues: 0,
            pendingIssues: 0,
            storyPoints: 18,
            completedPoints: 18,
            completionRate: 100,
            members: [],
            archived: true,
            createdAt: '2023-10-25'
        }
    ],
    projects: [
        { id: 1, name: '前端项目' },
        { id: 2, name: '后端服务' },
        { id: 3, name: '移动端App' }
    ]
};

// Iterations Module Class
class IterationsModule {
    constructor() {
        this.iterations = [...IterationsData.iterations];
        this.filteredIterations = [...this.iterations];
        this.currentFilter = 'all';
        this.searchQuery = '';
        this.showArchived = false;
        
        this.init();
    }
    
    init() {
        this.loadIterations();
        this.bindEvents();
        this.updateTabCounts();
    }
    
    // Load and render iterations
    loadIterations() {
        this.applyFilters();
        this.renderIterations();
    }
    
    // Apply filters based on current state
    applyFilters() {
        let filtered = [...this.iterations];
        
        // Filter by archived status
        if (!this.showArchived) {
            filtered = filtered.filter(iter => !iter.archived);
        }
        
        // Filter by status
        if (this.currentFilter !== 'all') {
            filtered = filtered.filter(iter => iter.status === this.currentFilter);
        }
        
        // Filter by search query
        if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            filtered = filtered.filter(iter => 
                iter.name.toLowerCase().includes(query) ||
                iter.goal?.toLowerCase().includes(query) ||
                iter.project?.toLowerCase().includes(query)
            );
        }
        
        this.filteredIterations = filtered;
    }
    
    // Render iterations grouped by status
    renderIterations() {
        const currentIterations = this.filteredIterations.filter(i => i.status === 'current');
        const upcomingIterations = this.filteredIterations.filter(i => i.status === 'upcoming');
        const completedIterations = this.filteredIterations.filter(i => i.status === 'completed');
        
        // Render current iterations section
        this.renderIterationSection('current', currentIterations, '进行中的迭代');
        
        // Render upcoming iterations section
        this.renderIterationSection('upcoming', upcomingIterations, '未开始的迭代');
        
        // Render completed iterations section
        this.renderIterationSection('completed', completedIterations, '已完成的迭代');
    }
    
    // Render a section of iterations
    renderIterationSection(status, iterations, title) {
        const sectionId = `${status}-section`;
        let section = document.getElementById(sectionId);
        
        // Create section if it doesn't exist
        if (!section) {
            section = document.createElement('div');
            section.id = sectionId;
            section.className = 'iteration-section';
            section.setAttribute('data-status', status);
            
            const container = document.querySelector('.console-content');
            if (container) {
                const loadMore = container.querySelector('.load-more');
                if (loadMore && loadMore.parentNode === container) {
                    container.insertBefore(section, loadMore);
                } else {
                    container.appendChild(section);
                }
            }
        }
        
        // Hide section if no iterations and not showing all
        if (iterations.length === 0 && this.currentFilter !== 'all') {
            section.style.display = 'none';
            return;
        }
        
        section.style.display = iterations.length > 0 ? 'block' : 'none';
        
        if (iterations.length === 0) return;
        
        const statusIndicatorClass = status === 'current' ? 'current' : 
                                     status === 'upcoming' ? 'upcoming' : 'completed';
        
        section.innerHTML = `
            <h3 class="section-title">
                <span class="status-indicator ${statusIndicatorClass}"></span>
                ${title}
            </h3>
            ${status === 'current' ? this.renderCurrentIterations(iterations) : ''}
            ${status !== 'current' ? `<div class="iteration-list">${iterations.map(iter => this.renderIterationCard(iter, status)).join('')}</div>` : ''}
        `;
        
        // Bind card events
        this.bindCardEvents(section);
    }
    
    // Render current iteration with full details
    renderCurrentIterations(iterations) {
        return iterations.map(iter => {
            const progress = Math.round((iter.completedIssues / iter.totalIssues) * 100);
            const daysRemaining = this.calculateDaysRemaining(iter.endDate);
            
            return `
                <div class="iteration-card current" data-id="${iter.id}">
                    <div class="iteration-card-header">
                        <div class="iteration-info">
                            <h4 class="iteration-name">
                                <a href="iteration-detail.html?id=${iter.id}">${iter.name}</a>
                            </h4>
                            <div class="iteration-meta">
                                <span class="iteration-date">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                        <line x1="16" y1="2" x2="16" y2="6"/>
                                        <line x1="8" y1="2" x2="8" y2="6"/>
                                        <line x1="3" y1="10" x2="21" y2="10"/>
                                    </svg>
                                    ${this.formatDate(iter.startDate)} ~ ${this.formatDate(iter.endDate)}
                                </span>
                                <span class="iteration-days">${daysRemaining > 0 ? `剩余 ${daysRemaining} 天` : '已结束'}</span>
                            </div>
                        </div>
                        <div class="iteration-actions">
                            <button class="btn btn-secondary btn-sm" onclick="IterationsModule.planIssues(${iter.id})">规划事项</button>
                            <button class="btn btn-icon iteration-more-btn" title="更多" data-id="${iter.id}">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="12" cy="12" r="1"/>
                                    <circle cx="19" cy="12" r="1"/>
                                    <circle cx="5" cy="12" r="1"/>
                                </svg>
                            </button>
                            <div class="iteration-dropdown-menu" id="iteration-menu-${iter.id}">
                                <a href="iteration-detail.html?id=${iter.id}" class="dropdown-item">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                        <circle cx="12" cy="12" r="3"/>
                                    </svg>
                                    查看详情
                                </a>
                                <a href="#" class="dropdown-item" onclick="IterationsModule.editIteration(${iter.id}); return false;">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                    </svg>
                                    编辑迭代
                                </a>
                                <a href="#" class="dropdown-item" onclick="IterationsModule.completeIteration(${iter.id}); return false;">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                        <polyline points="22 4 12 14.01 9 11.01"/>
                                    </svg>
                                    完成迭代
                                </a>
                                <div class="dropdown-divider"></div>
                                <a href="#" class="dropdown-item text-danger" onclick="IterationsModule.archiveIteration(${iter.id}); return false;">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <polyline points="21 8 21 21 3 21 3 8"/>
                                        <rect x="1" y="3" width="22" height="5"/>
                                        <line x1="10" y1="12" x2="14" y2="12"/>
                                    </svg>
                                    归档迭代
                                </a>
                            </div>
                        </div>
                    </div>
                    
                    <div class="iteration-card-body">
                        <div class="iteration-progress">
                            <div class="progress-header">
                                <span class="progress-label">完成进度</span>
                                <span class="progress-value">${progress}%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${progress}%"></div>
                            </div>
                        </div>
                        
                        <div class="iteration-stats">
                            <div class="stat-item">
                                <span class="stat-value">${iter.totalIssues}</span>
                                <span class="stat-label">总事项</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-value completed">${iter.completedIssues}</span>
                                <span class="stat-label">已完成</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-value processing">${iter.processingIssues}</span>
                                <span class="stat-label">进行中</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-value pending">${iter.pendingIssues}</span>
                                <span class="stat-label">待处理</span>
                            </div>
                        </div>
                        
                        ${this.renderBurndownChart(iter)}
                    </div>
                    
                    <div class="iteration-card-footer">
                        <div class="iteration-members">
                            <span class="members-label">参与成员</span>
                            <div class="member-avatars">
                                ${iter.members.slice(0, 4).map(m => `<img src="${m.avatar}" alt="${m.name}" title="${m.name}">`).join('')}
                                ${iter.members.length > 4 ? `<span class="member-more">+${iter.members.length - 4}</span>` : ''}
                            </div>
                        </div>
                        <a href="iteration-detail.html?id=${iter.id}" class="view-detail-link">
                            查看详情
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="9 18 15 12 9 6"/>
                            </svg>
                        </a>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    // Render iteration card for upcoming/completed
    renderIterationCard(iter, status) {
        if (status === 'upcoming') {
            return `
                <div class="iteration-card upcoming" data-id="${iter.id}">
                    <div class="iteration-card-header">
                        <div class="iteration-info">
                            <h4 class="iteration-name">
                                <a href="iteration-detail.html?id=${iter.id}">${iter.name}</a>
                            </h4>
                            <div class="iteration-meta">
                                <span class="iteration-date">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                        <line x1="16" y1="2" x2="16" y2="6"/>
                                        <line x1="8" y1="2" x2="8" y2="6"/>
                                        <line x1="3" y1="10" x2="21" y2="10"/>
                                    </svg>
                                    ${this.formatDate(iter.startDate)} ~ ${this.formatDate(iter.endDate)}
                                </span>
                            </div>
                        </div>
                        <div class="iteration-actions">
                            <button class="btn btn-text btn-sm" onclick="IterationsModule.startIteration(${iter.id})">开始迭代</button>
                            <button class="btn btn-icon iteration-more-btn" title="更多" data-id="${iter.id}">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="12" cy="12" r="1"/>
                                    <circle cx="19" cy="12" r="1"/>
                                    <circle cx="5" cy="12" r="1"/>
                                </svg>
                            </button>
                            <div class="iteration-dropdown-menu" id="iteration-menu-${iter.id}">
                                <a href="iteration-detail.html?id=${iter.id}" class="dropdown-item">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                        <circle cx="12" cy="12" r="3"/>
                                    </svg>
                                    查看详情
                                </a>
                                <a href="#" class="dropdown-item" onclick="IterationsModule.editIteration(${iter.id}); return false;">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                    </svg>
                                    编辑迭代
                                </a>
                                <a href="#" class="dropdown-item" onclick="IterationsModule.planIssues(${iter.id}); return false;">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <line x1="12" y1="5" x2="12" y2="19"/>
                                        <line x1="5" y1="12" x2="19" y2="12"/>
                                    </svg>
                                    规划事项
                                </a>
                                <div class="dropdown-divider"></div>
                                <a href="#" class="dropdown-item text-danger" onclick="IterationsModule.deleteIteration(${iter.id}); return false;">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <polyline points="3 6 5 6 21 6"/>
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                    </svg>
                                    删除迭代
                                </a>
                            </div>
                        </div>
                    </div>
                    <div class="iteration-card-body compact">
                        <div class="iteration-stats">
                            <div class="stat-item">
                                <span class="stat-value">${iter.totalIssues}</span>
                                <span class="stat-label">规划事项</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-value">${iter.requirements || 0}</span>
                                <span class="stat-label">需求</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-value">${iter.tasks || 0}</span>
                                <span class="stat-label">任务</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-value">${iter.bugs || 0}</span>
                                <span class="stat-label">缺陷</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } else {
            // Completed iteration
            return `
                <div class="iteration-card completed ${iter.archived ? 'archived' : ''}" data-id="${iter.id}">
                    <div class="iteration-card-header">
                        <div class="iteration-info">
                            <h4 class="iteration-name">
                                <a href="iteration-detail.html?id=${iter.id}">${iter.name}</a>
                                ${iter.archived ? '<span class="archived-badge">已归档</span>' : ''}
                            </h4>
                            <div class="iteration-meta">
                                <span class="iteration-date">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                        <line x1="16" y1="2" x2="16" y2="6"/>
                                        <line x1="8" y1="2" x2="8" y2="6"/>
                                        <line x1="3" y1="10" x2="21" y2="10"/>
                                    </svg>
                                    ${this.formatDate(iter.startDate)} ~ ${this.formatDate(iter.endDate)}
                                </span>
                                <span class="completion-rate">完成率 ${iter.completionRate || Math.round((iter.completedIssues / iter.totalIssues) * 100)}%</span>
                            </div>
                        </div>
                        <div class="iteration-actions">
                            <button class="btn btn-icon iteration-more-btn" title="更多" data-id="${iter.id}">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="12" cy="12" r="1"/>
                                    <circle cx="19" cy="12" r="1"/>
                                    <circle cx="5" cy="12" r="1"/>
                                </svg>
                            </button>
                            <div class="iteration-dropdown-menu" id="iteration-menu-${iter.id}">
                                <a href="iteration-detail.html?id=${iter.id}" class="dropdown-item">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                        <circle cx="12" cy="12" r="3"/>
                                    </svg>
                                    查看详情
                                </a>
                                ${!iter.archived ? `
                                <a href="#" class="dropdown-item" onclick="IterationsModule.archiveIteration(${iter.id}); return false;">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <polyline points="21 8 21 21 3 21 3 8"/>
                                        <rect x="1" y="3" width="22" height="5"/>
                                        <line x1="10" y1="12" x2="14" y2="12"/>
                                    </svg>
                                    归档迭代
                                </a>
                                ` : `
                                <a href="#" class="dropdown-item" onclick="IterationsModule.unarchiveIteration(${iter.id}); return false;">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <polyline points="21 8 21 21 3 21 3 8"/>
                                        <rect x="1" y="3" width="22" height="5"/>
                                        <line x1="10" y1="12" x2="14" y2="12"/>
                                    </svg>
                                    取消归档
                                </a>
                                `}
                            </div>
                        </div>
                    </div>
                    <div class="iteration-card-body compact">
                        <div class="iteration-stats">
                            <div class="stat-item">
                                <span class="stat-value">${iter.totalIssues}</span>
                                <span class="stat-label">总事项</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-value completed">${iter.completedIssues}</span>
                                <span class="stat-label">已完成</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-value pending">${iter.totalIssues - iter.completedIssues}</span>
                                <span class="stat-label">未完成</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
    }
    
    // Render burndown chart for current iteration
    renderBurndownChart(iter) {
        if (!iter.burndownData || iter.burndownData.length === 0) return '';
        
        const data = iter.burndownData;
        const maxPoints = iter.storyPoints;
        const chartWidth = 340;
        const chartHeight = 90;
        const padding = { left: 30, right: 10, top: 10, bottom: 20 };
        const innerWidth = chartWidth - padding.left - padding.right;
        const innerHeight = chartHeight - padding.top - padding.bottom;
        
        // Calculate points for polyline
        const xStep = innerWidth / (data.length - 1 || 1);
        const yScale = innerHeight / maxPoints;
        
        const actualPoints = data.map((d, i) => 
            `${padding.left + i * xStep},${padding.top + (maxPoints - d.actual) * yScale}`
        ).join(' ');
        
        const idealLine = `${padding.left},${padding.top} ${padding.left + innerWidth},${padding.top + innerHeight}`;
        
        return `
            <div class="iteration-burndown">
                <div class="burndown-header">
                    <span class="burndown-title">燃尽图</span>
                    <a href="iteration-detail.html?id=${iter.id}#burndown" class="burndown-link">查看详情</a>
                </div>
                <div class="burndown-chart">
                    <svg viewBox="0 0 ${chartWidth} ${chartHeight}" class="chart-svg">
                        <!-- Grid lines -->
                        <line x1="${padding.left}" y1="${padding.top}" x2="${padding.left}" y2="${chartHeight - padding.bottom}" stroke="#e5e7eb" stroke-width="1"/>
                        <line x1="${padding.left}" y1="${chartHeight - padding.bottom}" x2="${chartWidth - padding.right}" y2="${chartHeight - padding.bottom}" stroke="#e5e7eb" stroke-width="1"/>
                        <line x1="${padding.left}" y1="${padding.top + innerHeight/2}" x2="${chartWidth - padding.right}" y2="${padding.top + innerHeight/2}" stroke="#e5e7eb" stroke-width="1" stroke-dasharray="4"/>
                        
                        <!-- Ideal line -->
                        <line x1="${padding.left}" y1="${padding.top}" x2="${padding.left + innerWidth}" y2="${chartHeight - padding.bottom}" stroke="#d1d5db" stroke-width="2" stroke-dasharray="6"/>
                        
                        <!-- Actual line -->
                        <polyline points="${actualPoints}" fill="none" stroke="#2b7de9" stroke-width="2"/>
                        
                        <!-- Data points -->
                        ${data.map((d, i) => `<circle cx="${padding.left + i * xStep}" cy="${padding.top + (maxPoints - d.actual) * yScale}" r="3" fill="#2b7de9"/>`).join('')}
                        
                        <!-- Y-axis labels -->
                        <text x="${padding.left - 5}" y="${padding.top + 4}" text-anchor="end" font-size="9" fill="#6b7280">${maxPoints}</text>
                        <text x="${padding.left - 5}" y="${padding.top + innerHeight/2 + 3}" text-anchor="end" font-size="9" fill="#6b7280">${Math.round(maxPoints/2)}</text>
                        <text x="${padding.left - 5}" y="${chartHeight - padding.bottom + 3}" text-anchor="end" font-size="9" fill="#6b7280">0</text>
                    </svg>
                </div>
            </div>
        `;
    }
    
    // Bind events
    bindEvents() {
        // Tab click events
        document.querySelectorAll('.iteration-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const status = e.currentTarget.dataset.status;
                this.filterByStatus(status);
            });
        });
        
        // Search input (if exists)
        this.addSearchInput();
        
        // Load more button
        const loadMoreBtn = document.querySelector('.load-more .btn-text');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => this.loadMore());
        }
    }
    
    // Add search input to the page
    addSearchInput() {
        const tabsContainer = document.querySelector('.iteration-tabs');
        if (!tabsContainer) return;
        
        // Check if search already exists
        if (document.querySelector('.iteration-search')) return;
        
        const searchWrapper = document.createElement('div');
        searchWrapper.className = 'iteration-search';
        searchWrapper.innerHTML = `
            <div class="search-input-wrapper">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="11" cy="11" r="8"/>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input type="text" class="search-input" placeholder="搜索迭代..." id="iterationSearchInput">
            </div>
            <label class="show-archived-label">
                <input type="checkbox" id="showArchivedCheckbox">
                <span>显示已归档</span>
            </label>
        `;
        
        tabsContainer.parentNode.insertBefore(searchWrapper, tabsContainer.nextSibling);
        
        // Bind search input event
        const searchInput = document.getElementById('iterationSearchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value;
                this.loadIterations();
            });
        }
        
        // Bind show archived checkbox
        const archivedCheckbox = document.getElementById('showArchivedCheckbox');
        if (archivedCheckbox) {
            archivedCheckbox.addEventListener('change', (e) => {
                this.showArchived = e.target.checked;
                this.loadIterations();
                this.updateTabCounts();
            });
        }
    }
    
    // Bind card events
    bindCardEvents(container) {
        // More button click
        container.querySelectorAll('.iteration-more-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                this.toggleIterationMenu(id);
            });
        });
    }
    
    // Toggle iteration dropdown menu
    toggleIterationMenu(id) {
        // Close all other menus
        document.querySelectorAll('.iteration-dropdown-menu.active').forEach(menu => {
            if (menu.id !== `iteration-menu-${id}`) {
                menu.classList.remove('active');
            }
        });
        
        const menu = document.getElementById(`iteration-menu-${id}`);
        if (menu) {
            menu.classList.toggle('active');
        }
    }
    
    // Filter by status
    filterByStatus(status) {
        this.currentFilter = status;
        
        // Update tab active state
        document.querySelectorAll('.iteration-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.status === status);
        });
        
        this.loadIterations();
    }
    
    // Update tab counts
    updateTabCounts() {
        const iterations = this.showArchived ? this.iterations : this.iterations.filter(i => !i.archived);
        
        const counts = {
            all: iterations.length,
            current: iterations.filter(i => i.status === 'current').length,
            upcoming: iterations.filter(i => i.status === 'upcoming').length,
            completed: iterations.filter(i => i.status === 'completed').length
        };
        
        document.querySelectorAll('.iteration-tab').forEach(tab => {
            const status = tab.dataset.status;
            const countEl = tab.querySelector('.tab-count');
            if (countEl && counts[status] !== undefined) {
                countEl.textContent = counts[status];
            }
        });
    }
    
    // Calculate days remaining
    calculateDaysRemaining(endDate) {
        const end = new Date(endDate);
        const today = new Date();
        const diff = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
        return diff;
    }
    
    // Format date
    formatDate(dateStr) {
        const date = new Date(dateStr);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }
    
    // Load more iterations
    loadMore() {
        showToast('已加载更多迭代', 'success');
    }
    
    // ==================== Static Methods for Actions ====================
    
    // Start iteration
    static startIteration(id) {
        const module = window.iterationsModule;
        const iteration = module.iterations.find(i => i.id === id);
        if (!iteration) return;
        
        // Check if there's already a current iteration
        const currentIteration = module.iterations.find(i => i.status === 'current');
        if (currentIteration) {
            showToast(`请先完成当前迭代 "${currentIteration.name}"`, 'warning');
            return;
        }
        
        iteration.status = 'current';
        module.loadIterations();
        module.updateTabCounts();
        showToast(`迭代 "${iteration.name}" 已开始`, 'success');
    }
    
    // Complete iteration
    static completeIteration(id) {
        const module = window.iterationsModule;
        const iteration = module.iterations.find(i => i.id === id);
        if (!iteration) return;
        
        // Calculate completion rate
        iteration.completionRate = Math.round((iteration.completedIssues / iteration.totalIssues) * 100);
        iteration.status = 'completed';
        
        module.loadIterations();
        module.updateTabCounts();
        showToast(`迭代 "${iteration.name}" 已完成`, 'success');
    }
    
    // Archive iteration
    static archiveIteration(id) {
        const module = window.iterationsModule;
        const iteration = module.iterations.find(i => i.id === id);
        if (!iteration) return;
        
        if (iteration.status === 'current') {
            showToast('无法归档进行中的迭代', 'error');
            return;
        }
        
        iteration.archived = true;
        module.loadIterations();
        module.updateTabCounts();
        showToast(`迭代 "${iteration.name}" 已归档`, 'success');
    }
    
    // Unarchive iteration
    static unarchiveIteration(id) {
        const module = window.iterationsModule;
        const iteration = module.iterations.find(i => i.id === id);
        if (!iteration) return;
        
        iteration.archived = false;
        module.loadIterations();
        module.updateTabCounts();
        showToast(`迭代 "${iteration.name}" 已取消归档`, 'success');
    }
    
    // Delete iteration
    static deleteIteration(id) {
        const module = window.iterationsModule;
        const iteration = module.iterations.find(i => i.id === id);
        if (!iteration) return;
        
        if (iteration.status === 'current') {
            showToast('无法删除进行中的迭代', 'error');
            return;
        }
        
        if (confirm(`确定要删除迭代 "${iteration.name}" 吗？此操作不可恢复。`)) {
            module.iterations = module.iterations.filter(i => i.id !== id);
            module.loadIterations();
            module.updateTabCounts();
            showToast(`迭代 "${iteration.name}" 已删除`, 'success');
        }
    }
    
    // Edit iteration
    static editIteration(id) {
        const module = window.iterationsModule;
        const iteration = module.iterations.find(i => i.id === id);
        if (!iteration) return;
        
        // Populate edit modal
        document.getElementById('editIterationId').value = iteration.id;
        document.getElementById('editIterationName').value = iteration.name;
        document.getElementById('editIterationStartDate').value = iteration.startDate;
        document.getElementById('editIterationEndDate').value = iteration.endDate;
        document.getElementById('editIterationGoal').value = iteration.goal || '';
        document.getElementById('editIterationProject').value = iteration.projectId || '';
        
        // Open modal
        openModal('editIterationModal');
    }
    
    // Save edited iteration
    static saveIteration() {
        const id = parseInt(document.getElementById('editIterationId').value);
        const name = document.getElementById('editIterationName').value.trim();
        const startDate = document.getElementById('editIterationStartDate').value;
        const endDate = document.getElementById('editIterationEndDate').value;
        const goal = document.getElementById('editIterationGoal').value.trim();
        const projectId = document.getElementById('editIterationProject').value;
        
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
        
        const module = window.iterationsModule;
        const iteration = module.iterations.find(i => i.id === id);
        if (!iteration) return;
        
        iteration.name = name;
        iteration.startDate = startDate;
        iteration.endDate = endDate;
        iteration.goal = goal;
        iteration.projectId = projectId ? parseInt(projectId) : null;
        
        const project = IterationsData.projects.find(p => p.id === iteration.projectId);
        iteration.project = project ? project.name : '';
        
        closeModal('editIterationModal');
        module.loadIterations();
        showToast('迭代已更新', 'success');
    }
    
    // Plan issues for iteration
    static planIssues(id) {
        window.location.href = `backlog.html?iteration=${id}`;
    }
}

// Create iteration function (called from modal)
function createIteration() {
    const name = document.getElementById('iterationName').value.trim();
    const startDate = document.getElementById('iterationStartDate').value;
    const endDate = document.getElementById('iterationEndDate').value;
    const goal = document.getElementById('iterationGoal').value.trim();
    const projectId = document.getElementById('iterationProject').value;
    
    // Validation
    if (!name) {
        showToast('请输入迭代名称', 'error');
        document.getElementById('iterationName').focus();
        return;
    }
    
    if (!startDate) {
        showToast('请选择开始日期', 'error');
        document.getElementById('iterationStartDate').focus();
        return;
    }
    
    if (!endDate) {
        showToast('请选择结束日期', 'error');
        document.getElementById('iterationEndDate').focus();
        return;
    }
    
    if (new Date(startDate) >= new Date(endDate)) {
        showToast('结束日期必须晚于开始日期', 'error');
        return;
    }
    
    // Check for duplicate name
    const module = window.iterationsModule;
    if (module.iterations.some(i => i.name.toLowerCase() === name.toLowerCase())) {
        showToast('迭代名称已存在', 'error');
        return;
    }
    
    // Create new iteration
    const newId = Math.max(...module.iterations.map(i => i.id)) + 1;
    const project = IterationsData.projects.find(p => p.id === parseInt(projectId));
    
    const newIteration = {
        id: newId,
        name: name,
        status: 'upcoming',
        startDate: startDate,
        endDate: endDate,
        goal: goal,
        project: project ? project.name : '',
        projectId: projectId ? parseInt(projectId) : null,
        totalIssues: 0,
        completedIssues: 0,
        processingIssues: 0,
        pendingIssues: 0,
        storyPoints: 0,
        completedPoints: 0,
        requirements: 0,
        tasks: 0,
        bugs: 0,
        members: [],
        archived: false,
        createdAt: new Date().toISOString().split('T')[0]
    };
    
    module.iterations.unshift(newIteration);
    
    // Close modal and reset form
    closeModal('createIterationModal');
    document.getElementById('iterationName').value = '';
    document.getElementById('iterationStartDate').value = '';
    document.getElementById('iterationEndDate').value = '';
    document.getElementById('iterationGoal').value = '';
    document.getElementById('iterationProject').value = '';
    
    // Reload iterations
    module.loadIterations();
    module.updateTabCounts();
    
    showToast(`迭代 "${name}" 创建成功`, 'success');
}

// Close dropdown menus when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.iteration-more-btn') && !e.target.closest('.iteration-dropdown-menu')) {
        document.querySelectorAll('.iteration-dropdown-menu.active').forEach(menu => {
            menu.classList.remove('active');
        });
    }
});

// Initialize module when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.iterationsModule = new IterationsModule();
});