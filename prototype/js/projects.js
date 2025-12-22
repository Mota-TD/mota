/**
 * 摩塔 Mota - 项目列表模块
 * 包含项目列表页面的所有交互功能
 */

// ==================== 项目数据 ====================
const ProjectsData = {
    // 项目列表
    projects: [
        {
            id: 1,
            name: '前端项目',
            key: 'FRONT',
            description: '摩塔平台前端Web应用，基于React + TypeScript开发',
            icon: 'monitor',
            color: 'linear-gradient(135deg, #2b7de9, #1a6dd6)',
            tags: ['React', 'TypeScript'],
            issueCount: 24,
            memberCount: 8,
            members: [1, 2, 3, 4, 5, 6, 7, 8],
            starred: true,
            archived: false,
            createdBy: 2,
            createdAt: '2024-01-15',
            updatedAt: '2024-12-20'
        },
        {
            id: 2,
            name: '后端服务',
            key: 'BACK',
            description: '摩塔平台后端API服务，基于Go + Gin框架开发',
            icon: 'server',
            color: 'linear-gradient(135deg, #10b981, #059669)',
            tags: ['Go', 'Gin', 'MySQL'],
            issueCount: 36,
            memberCount: 6,
            members: [1, 4, 5, 6, 9, 10],
            starred: false,
            archived: false,
            createdBy: 1,
            createdAt: '2024-01-10',
            updatedAt: '2024-12-19'
        },
        {
            id: 3,
            name: '移动端App',
            key: 'MOBILE',
            description: '摩塔移动端应用，支持iOS和Android平台',
            icon: 'smartphone',
            color: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
            tags: ['Flutter', 'Dart'],
            issueCount: 18,
            memberCount: 4,
            members: [2, 7, 8, 11],
            starred: true,
            archived: false,
            createdBy: 2,
            createdAt: '2024-02-01',
            updatedAt: '2024-12-18'
        },
        {
            id: 4,
            name: '产品文档',
            key: 'DOCS',
            description: '摩塔产品文档和用户手册',
            icon: 'book',
            color: 'linear-gradient(135deg, #f59e0b, #d97706)',
            tags: ['文档', 'Markdown'],
            issueCount: 12,
            memberCount: 3,
            members: [1, 3, 12],
            starred: false,
            archived: false,
            createdBy: 1,
            createdAt: '2024-02-15',
            updatedAt: '2024-12-17'
        },
        {
            id: 5,
            name: '设计系统',
            key: 'DESIGN',
            description: 'UI组件库和设计规范管理',
            icon: 'file-text',
            color: 'linear-gradient(135deg, #ec4899, #db2777)',
            tags: ['设计', 'Figma'],
            issueCount: 45,
            memberCount: 5,
            members: [4, 5, 6, 13, 14],
            starred: false,
            archived: true,
            createdBy: 1,
            createdAt: '2024-01-20',
            updatedAt: '2024-11-30'
        },
        {
            id: 6,
            name: '运维平台',
            key: 'OPS',
            description: '内部运维管理平台，包含监控、告警、日志等功能',
            icon: 'settings',
            color: 'linear-gradient(135deg, #ef4444, #dc2626)',
            tags: ['Python', 'Django', 'Prometheus'],
            issueCount: 28,
            memberCount: 4,
            members: [1, 9, 10, 15],
            starred: false,
            archived: false,
            createdBy: 1,
            createdAt: '2024-03-01',
            updatedAt: '2024-12-15'
        },
        {
            id: 7,
            name: '数据分析平台',
            key: 'DATA',
            description: '企业数据分析和可视化平台',
            icon: 'bar-chart',
            color: 'linear-gradient(135deg, #06b6d4, #0891b2)',
            tags: ['Python', 'Pandas', 'ECharts'],
            issueCount: 22,
            memberCount: 5,
            members: [1, 2, 5, 8, 16],
            starred: false,
            archived: false,
            createdBy: 2,
            createdAt: '2024-03-15',
            updatedAt: '2024-12-14'
        },
        {
            id: 8,
            name: '微服务网关',
            key: 'GATEWAY',
            description: 'API网关服务，负责路由、限流、认证等',
            icon: 'git-branch',
            color: 'linear-gradient(135deg, #84cc16, #65a30d)',
            tags: ['Go', 'Kong', 'Redis'],
            issueCount: 15,
            memberCount: 3,
            members: [4, 9, 10],
            starred: false,
            archived: true,
            createdBy: 1,
            createdAt: '2024-04-01',
            updatedAt: '2024-10-20'
        }
    ],
    
    // 项目模板
    templates: [
        { id: 'blank', name: '空白项目', description: '从零开始创建项目', icon: 'square' },
        { id: 'agile', name: '敏捷开发', description: '包含迭代、看板等敏捷功能', icon: 'refresh-cw' },
        { id: 'bugfix', name: '缺陷跟踪', description: '专注于Bug管理和修复', icon: 'check-circle' }
    ],
    
    // 项目图标选项
    iconOptions: [
        { icon: 'monitor', color: 'linear-gradient(135deg, #2b7de9, #1a6dd6)' },
        { icon: 'server', color: 'linear-gradient(135deg, #10b981, #059669)' },
        { icon: 'smartphone', color: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' },
        { icon: 'book', color: 'linear-gradient(135deg, #f59e0b, #d97706)' },
        { icon: 'file-text', color: 'linear-gradient(135deg, #ec4899, #db2777)' },
        { icon: 'settings', color: 'linear-gradient(135deg, #ef4444, #dc2626)' }
    ],
    
    // 当前用户ID（模拟）
    currentUserId: 1,
    
    // 分页配置
    pageSize: 6,
    currentPage: 1
};

// ==================== 项目模块类 ====================
class ProjectsModule {
    constructor() {
        this.currentFilter = 'all';
        this.currentSearch = '';
        this.currentView = 'grid';
        this.selectedIcon = 0;
        this.selectedTemplate = 'blank';
        this.filteredProjects = [];
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.renderProjects();
        this.updatePagination();
        console.log('Projects module initialized');
    }
    
    // ==================== 事件绑定 ====================
    bindEvents() {
        // 筛选标签切换
        document.querySelectorAll('.filter-tab').forEach((tab, index) => {
            tab.addEventListener('click', () => this.handleFilterChange(index));
        });
        
        // 搜索功能
        const searchInput = document.querySelector('.search-input input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        }
        
        // 视图切换
        document.querySelectorAll('.view-btn').forEach((btn, index) => {
            btn.addEventListener('click', () => this.handleViewChange(index));
        });
        
        // 图标选择
        document.querySelectorAll('.icon-option').forEach((option, index) => {
            option.addEventListener('click', () => this.selectIcon(index));
        });
        
        // 模板选择
        document.querySelectorAll('.template-option').forEach((option, index) => {
            option.addEventListener('click', () => this.selectTemplate(index));
        });
        
        // 点击外部关闭项目菜单
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.project-menu')) {
                document.querySelectorAll('.project-menu').forEach(el => {
                    el.classList.remove('active');
                });
            }
        });
    }
    
    // ==================== 筛选功能 ====================
    handleFilterChange(index) {
        const filters = ['all', 'participated', 'created', 'archived'];
        this.currentFilter = filters[index];
        
        // 更新标签样式
        document.querySelectorAll('.filter-tab').forEach((tab, i) => {
            tab.classList.toggle('active', i === index);
        });
        
        // 重置分页
        ProjectsData.currentPage = 1;
        
        this.renderProjects();
        this.updatePagination();
    }
    
    // ==================== 搜索功能 ====================
    handleSearch(query) {
        this.currentSearch = query.toLowerCase().trim();
        ProjectsData.currentPage = 1;
        this.renderProjects();
        this.updatePagination();
    }
    
    // ==================== 视图切换 ====================
    handleViewChange(index) {
        document.querySelectorAll('.view-btn').forEach((btn, i) => {
            btn.classList.toggle('active', i === index);
        });
        
        const projectGrid = document.getElementById('projectGrid');
        if (index === 0) {
            this.currentView = 'grid';
            projectGrid.classList.remove('list-view');
        } else {
            this.currentView = 'list';
            projectGrid.classList.add('list-view');
        }
    }
    
    // ==================== 获取筛选后的项目 ====================
    getFilteredProjects() {
        let projects = [...ProjectsData.projects];
        
        // 如果有搜索关键词，搜索所有项目
        if (this.currentSearch) {
            projects = projects.filter(p => {
                const searchText = `${p.name} ${p.description} ${p.tags.join(' ')} ${p.key}`.toLowerCase();
                return searchText.includes(this.currentSearch);
            });
        } else {
            // 没有搜索时，应用筛选逻辑
            switch (this.currentFilter) {
                case 'all':
                    projects = projects.filter(p => !p.archived);
                    break;
                case 'participated':
                    projects = projects.filter(p => !p.archived && p.members.includes(ProjectsData.currentUserId));
                    break;
                case 'created':
                    projects = projects.filter(p => p.createdBy === ProjectsData.currentUserId);
                    break;
                case 'archived':
                    projects = projects.filter(p => p.archived);
                    break;
            }
        }
        
        this.filteredProjects = projects;
        return projects;
    }
    
    // ==================== 获取分页后的项目 ====================
    getPaginatedProjects() {
        const projects = this.getFilteredProjects();
        const start = (ProjectsData.currentPage - 1) * ProjectsData.pageSize;
        const end = start + ProjectsData.pageSize;
        return projects.slice(start, end);
    }
    
    // ==================== 渲染项目列表 ====================
    renderProjects() {
        const projectGrid = document.getElementById('projectGrid');
        if (!projectGrid) return;
        
        const projects = this.getPaginatedProjects();
        
        let html = '';
        
        // 渲染项目卡片
        projects.forEach(project => {
            html += this.renderProjectCard(project);
        });
        
        // 添加新建项目卡片（非归档视图且无搜索时显示）
        if (this.currentFilter !== 'archived' && !this.currentSearch) {
            html += this.renderNewProjectCard();
        }
        
        // 如果没有项目，显示空状态
        if (projects.length === 0) {
            html = this.renderEmptyState();
        }
        
        projectGrid.innerHTML = html;
        
        // 重新绑定项目卡片事件
        this.bindProjectCardEvents();
    }
    
    // ==================== 渲染单个项目卡片 ====================
    renderProjectCard(project) {
        const iconSvg = this.getIconSvg(project.icon);
        const memberAvatars = this.renderMemberAvatars(project.members);
        const isArchived = project.archived;
        
        return `
            <div class="project-card ${isArchived ? 'archived' : ''}" 
                 data-project-id="${project.id}"
                 data-href="project-detail.html?id=${project.id}">
                <div class="project-card-header">
                    <div class="project-icon" style="background: ${project.color};">
                        ${iconSvg}
                    </div>
                    <div class="project-header-actions">
                        <button class="project-star-btn ${project.starred ? 'starred' : ''}" 
                                onclick="projectsModule.toggleStar(event, ${project.id})" 
                                title="${project.starred ? '取消收藏' : '收藏'}">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="${project.starred ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                            </svg>
                        </button>
                        <div class="project-menu">
                            <button class="project-menu-btn" onclick="projectsModule.toggleProjectMenu(event, this)">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="12" cy="12" r="1"/>
                                    <circle cx="19" cy="12" r="1"/>
                                    <circle cx="5" cy="12" r="1"/>
                                </svg>
                            </button>
                            <div class="project-dropdown">
                                <a href="project-detail.html?id=${project.id}" class="dropdown-item">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                        <circle cx="12" cy="12" r="3"/>
                                    </svg>
                                    查看详情
                                </a>
                                <a href="#" class="dropdown-item" onclick="projectsModule.editProject(event, ${project.id})">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                    </svg>
                                    编辑项目
                                </a>
                                <a href="#" class="dropdown-item" onclick="projectsModule.shareProject(event, ${project.id})">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <circle cx="18" cy="5" r="3"/>
                                        <circle cx="6" cy="12" r="3"/>
                                        <circle cx="18" cy="19" r="3"/>
                                        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                                        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                                    </svg>
                                    分享项目
                                </a>
                                <div class="dropdown-divider"></div>
                                ${isArchived ? `
                                    <a href="#" class="dropdown-item" onclick="projectsModule.restoreProject(event, ${project.id})">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <polyline points="23 4 23 10 17 10"/>
                                            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                                        </svg>
                                        恢复项目
                                    </a>
                                    <a href="#" class="dropdown-item text-danger" onclick="projectsModule.deleteProject(event, ${project.id})">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <polyline points="3 6 5 6 21 6"/>
                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                        </svg>
                                        永久删除
                                    </a>
                                ` : `
                                    <a href="#" class="dropdown-item" onclick="projectsModule.archiveProject(event, ${project.id})">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M21 8v13H3V8"/>
                                            <path d="M1 3h22v5H1z"/>
                                            <path d="M10 12h4"/>
                                        </svg>
                                        归档项目
                                    </a>
                                    <a href="#" class="dropdown-item text-danger" onclick="projectsModule.deleteProject(event, ${project.id})">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <polyline points="3 6 5 6 21 6"/>
                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                        </svg>
                                        删除项目
                                    </a>
                                `}
                            </div>
                        </div>
                    </div>
                </div>
                <div class="project-card-body" onclick="projectsModule.goToProject(${project.id})">
                    <h3 class="project-name">
                        ${project.name}
                        ${isArchived ? '<span class="archived-badge">已归档</span>' : ''}
                    </h3>
                    <p class="project-desc">${project.description}</p>
                    <div class="project-tags">
                        ${project.tags.map(tag => `<span class="project-tag">${tag}</span>`).join('')}
                    </div>
                </div>
                <div class="project-card-footer">
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
                                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                                <circle cx="8.5" cy="7" r="4"/>
                                <line x1="20" y1="8" x2="20" y2="14"/>
                                <line x1="23" y1="11" x2="17" y2="11"/>
                            </svg>
                            ${project.memberCount} 成员
                        </span>
                    </div>
                    <div class="project-members">
                        ${memberAvatars}
                    </div>
                </div>
            </div>
        `;
    }
    
    // ==================== 渲染成员头像 ====================
    renderMemberAvatars(memberIds) {
        const maxShow = 3;
        const showMembers = memberIds.slice(0, maxShow);
        const moreCount = memberIds.length - maxShow;
        
        let html = '<div class="member-avatars">';
        showMembers.forEach((id, index) => {
            html += `<img src="https://api.dicebear.com/7.x/avataaars/svg?seed=${id}" alt="">`;
        });
        if (moreCount > 0) {
            html += `<span class="member-more">+${moreCount}</span>`;
        }
        html += '</div>';
        
        return html;
    }
    
    // ==================== 渲染新建项目卡片 ====================
    renderNewProjectCard() {
        return `
            <div class="project-card project-card-new" onclick="openCreateProjectModal()">
                <div class="project-card-new-content">
                    <div class="project-card-new-icon">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="12" y1="5" x2="12" y2="19"/>
                            <line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                    </div>
                    <span>新建项目</span>
                </div>
            </div>
        `;
    }
    
    // ==================== 渲染空状态 ====================
    renderEmptyState() {
        let message = '没有找到项目';
        let description = '尝试调整筛选条件或搜索关键词';
        
        if (this.currentFilter === 'archived' && !this.currentSearch) {
            message = '没有已归档的项目';
            description = '归档的项目会显示在这里';
        } else if (this.currentFilter === 'created' && !this.currentSearch) {
            message = '您还没有创建过项目';
            description = '点击"新建项目"创建您的第一个项目';
        }
        
        return `
            <div class="empty-state">
                <div class="empty-state-icon">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                    </svg>
                </div>
                <div class="empty-state-title">${message}</div>
                <div class="empty-state-desc">${description}</div>
            </div>
        `;
    }
    
    // ==================== 更新分页 ====================
    updatePagination() {
        const totalProjects = this.filteredProjects.length;
        const totalPages = Math.ceil(totalProjects / ProjectsData.pageSize);
        
        let paginationContainer = document.getElementById('projectsPagination');
        
        // 如果只有一页或没有项目，隐藏分页
        if (totalPages <= 1) {
            if (paginationContainer) {
                paginationContainer.style.display = 'none';
            }
            return;
        }
        
        // 如果分页容器不存在，创建它
        if (!paginationContainer) {
            paginationContainer = document.createElement('div');
            paginationContainer.id = 'projectsPagination';
            paginationContainer.className = 'pagination';
            const projectGrid = document.getElementById('projectGrid');
            if (projectGrid) {
                projectGrid.parentNode.insertBefore(paginationContainer, projectGrid.nextSibling);
            }
        }
        
        paginationContainer.style.display = 'flex';
        
        let html = '';
        
        // 上一页按钮
        html += `
            <button class="pagination-btn ${ProjectsData.currentPage === 1 ? 'disabled' : ''}" 
                    onclick="projectsModule.goToPage(${ProjectsData.currentPage - 1})"
                    ${ProjectsData.currentPage === 1 ? 'disabled' : ''}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="15 18 9 12 15 6"/>
                </svg>
            </button>
        `;
        
        // 页码按钮
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= ProjectsData.currentPage - 1 && i <= ProjectsData.currentPage + 1)) {
                html += `
                    <button class="pagination-btn ${i === ProjectsData.currentPage ? 'active' : ''}" 
                            onclick="projectsModule.goToPage(${i})">
                        ${i}
                    </button>
                `;
            } else if (i === ProjectsData.currentPage - 2 || i === ProjectsData.currentPage + 2) {
                html += '<span class="pagination-ellipsis">...</span>';
            }
        }
        
        // 下一页按钮
        html += `
            <button class="pagination-btn ${ProjectsData.currentPage === totalPages ? 'disabled' : ''}" 
                    onclick="projectsModule.goToPage(${ProjectsData.currentPage + 1})"
                    ${ProjectsData.currentPage === totalPages ? 'disabled' : ''}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="9 18 15 12 9 6"/>
                </svg>
            </button>
        `;
        
        // 显示总数
        html += `<span class="pagination-info">共 ${totalProjects} 个项目</span>`;
        
        paginationContainer.innerHTML = html;
    }
    
    // ==================== 分页跳转 ====================
    goToPage(page) {
        const totalPages = Math.ceil(this.filteredProjects.length / ProjectsData.pageSize);
        if (page < 1 || page > totalPages) return;
        
        ProjectsData.currentPage = page;
        this.renderProjects();
        this.updatePagination();
        
        // 滚动到顶部
        document.querySelector('.console-content')?.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    // ==================== 绑定项目卡片事件 ====================
    bindProjectCardEvents() {
        // 项目卡片点击跳转（排除按钮区域）
        document.querySelectorAll('.project-card[data-project-id]').forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.closest('.project-menu') || 
                    e.target.closest('.project-star-btn') ||
                    e.target.closest('.project-header-actions')) {
                    return;
                }
                const projectId = card.dataset.projectId;
                this.goToProject(projectId);
            });
        });
    }
    
    // ==================== 跳转到项目详情 ====================
    goToProject(projectId) {
        window.location.href = `project-detail.html?id=${projectId}`;
    }
    
    // ==================== 切换项目菜单 ====================
    toggleProjectMenu(event, btn) {
        event.stopPropagation();
        event.preventDefault();
        
        const menu = btn.closest('.project-menu');
        const isActive = menu.classList.contains('active');
        
        // 关闭所有其他菜单
        document.querySelectorAll('.project-menu').forEach(el => {
            el.classList.remove('active');
        });
        
        // 切换当前菜单
        if (!isActive) {
            menu.classList.add('active');
        }
    }
    
    // ==================== 收藏/取消收藏 ====================
    toggleStar(event, projectId) {
        event.stopPropagation();
        event.preventDefault();
        
        const project = ProjectsData.projects.find(p => p.id === projectId);
        if (project) {
            project.starred = !project.starred;
            
            // 更新按钮样式
            const btn = event.currentTarget;
            btn.classList.toggle('starred', project.starred);
            const svg = btn.querySelector('svg');
            if (svg) {
                svg.setAttribute('fill', project.starred ? 'currentColor' : 'none');
            }
            
            showToast(project.starred ? '已收藏项目' : '已取消收藏', 'success');
        }
    }
    
    // ==================== 编辑项目 ====================
    editProject(event, projectId) {
        event.stopPropagation();
        event.preventDefault();
        
        const project = ProjectsData.projects.find(p => p.id === projectId);
        if (project) {
            // 填充表单
            document.getElementById('projectName').value = project.name;
            document.getElementById('projectKey').value = project.key;
            document.getElementById('projectKey').disabled = true; // 项目标识不可修改
            document.getElementById('projectDesc').value = project.description;
            
            // 更新弹窗标题
            const modalTitle = document.querySelector('#createProjectModal .modal-title');
            if (modalTitle) {
                modalTitle.textContent = '编辑项目';
            }
            
            // 存储编辑的项目ID
            document.getElementById('createProjectModal').dataset.editId = projectId;
            
            openCreateProjectModal();
        }
    }
    
    // ==================== 分享项目 ====================
    shareProject(event, projectId) {
        event.stopPropagation();
        event.preventDefault();
        
        const project = ProjectsData.projects.find(p => p.id === projectId);
        if (project) {
            // 复制项目链接到剪贴板
            const url = `${window.location.origin}/console/project-detail.html?id=${projectId}`;
            navigator.clipboard.writeText(url).then(() => {
                showToast('项目链接已复制到剪贴板', 'success');
            }).catch(() => {
                showToast('复制失败，请手动复制', 'error');
            });
        }
    }
    
    // ==================== 归档项目 ====================
    archiveProject(event, projectId) {
        event.stopPropagation();
        event.preventDefault();
        
        const project = ProjectsData.projects.find(p => p.id === projectId);
        if (project) {
            // 显示确认弹窗
            this.showConfirmModal(
                '归档项目',
                `确定要归档项目"${project.name}"吗？归档后项目将不会显示在项目列表中，但可以在"已归档"标签中找到。`,
                () => {
                    project.archived = true;
                    this.renderProjects();
                    this.updatePagination();
                    showToast('项目已归档', 'success');
                }
            );
        }
    }
    
    // ==================== 恢复项目 ====================
    restoreProject(event, projectId) {
        event.stopPropagation();
        event.preventDefault();
        
        const project = ProjectsData.projects.find(p => p.id === projectId);
        if (project) {
            project.archived = false;
            this.renderProjects();
            this.updatePagination();
            showToast('项目已恢复', 'success');
        }
    }
    
    // ==================== 删除项目 ====================
    deleteProject(event, projectId) {
        event.stopPropagation();
        event.preventDefault();
        
        const project = ProjectsData.projects.find(p => p.id === projectId);
        if (project) {
            const isArchived = project.archived;
            const title = isArchived ? '永久删除项目' : '删除项目';
            const message = isArchived 
                ? `确定要永久删除项目"${project.name}"吗？此操作不可恢复！`
                : `确定要删除项目"${project.name}"吗？删除后项目将移至回收站。`;
            
            this.showConfirmModal(title, message, () => {
                // 从列表中移除
                const index = ProjectsData.projects.findIndex(p => p.id === projectId);
                if (index > -1) {
                    ProjectsData.projects.splice(index, 1);
                }
                this.renderProjects();
                this.updatePagination();
                showToast('项目已删除', 'success');
            }, true);
        }
    }
    
    // ==================== 显示确认弹窗 ====================
    showConfirmModal(title, message, onConfirm, isDanger = false) {
        // 创建确认弹窗
        let confirmModal = document.getElementById('confirmModal');
        if (!confirmModal) {
            confirmModal = document.createElement('div');
            confirmModal.id = 'confirmModal';
            confirmModal.className = 'modal-overlay';
            confirmModal.innerHTML = `
                <div class="modal modal-sm">
                    <div class="modal-header">
                        <h2 class="modal-title" id="confirmModalTitle"></h2>
                        <button class="modal-close" onclick="projectsModule.closeConfirmModal()">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18"/>
                                <line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                        </button>
                    </div>
                    <div class="modal-body">
                        <p id="confirmModalMessage"></p>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="projectsModule.closeConfirmModal()">取消</button>
                        <button class="btn" id="confirmModalBtn">确定</button>
                    </div>
                </div>
            `;
            document.body.appendChild(confirmModal);
        }
        
        // 设置内容
        document.getElementById('confirmModalTitle').textContent = title;
        document.getElementById('confirmModalMessage').textContent = message;
        
        const confirmBtn = document.getElementById('confirmModalBtn');
        confirmBtn.className = isDanger ? 'btn btn-danger' : 'btn btn-primary';
        confirmBtn.textContent = isDanger ? '删除' : '确定';
        confirmBtn.onclick = () => {
            onConfirm();
            this.closeConfirmModal();
        };
        
        // 显示弹窗
        confirmModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    // ==================== 关闭确认弹窗 ====================
    closeConfirmModal() {
        const confirmModal = document.getElementById('confirmModal');
        if (confirmModal) {
            confirmModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
    
    // ==================== 选择图标 ====================
    selectIcon(index) {
        this.selectedIcon = index;
        document.querySelectorAll('.icon-option').forEach((opt, i) => {
            opt.classList.toggle('selected', i === index);
        });
    }
    
    // ==================== 选择模板 ====================
    selectTemplate(index) {
        const templates = ['blank', 'agile', 'bugfix'];
        this.selectedTemplate = templates[index];
        document.querySelectorAll('.template-option').forEach((opt, i) => {
            opt.classList.toggle('selected', i === index);
        });
    }
    
    // ==================== 获取图标SVG ====================
    getIconSvg(iconName) {
        const icons = {
            'monitor': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',
            'server': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>',
            'smartphone': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>',
            'book': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
            'file-text': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',
            'settings': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
            'bar-chart': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>',
            'git-branch': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/></svg>'
        };
        return icons[iconName] || icons['monitor'];
    }
    
    // ==================== 创建项目 ====================
    createProject() {
        const nameInput = document.getElementById('projectName');
        const keyInput = document.getElementById('projectKey');
        const descInput = document.getElementById('projectDesc');
        
        const name = nameInput?.value?.trim();
        const key = keyInput?.value?.trim().toUpperCase();
        const description = descInput?.value?.trim();
        
        // 表单验证
        if (!name) {
            this.showFieldError(nameInput, '请输入项目名称');
            return;
        }
        
        if (name.length < 2 || name.length > 50) {
            this.showFieldError(nameInput, '项目名称长度应在2-50个字符之间');
            return;
        }
        
        if (!key) {
            this.showFieldError(keyInput, '请输入项目标识');
            return;
        }
        
        if (!/^[A-Z][A-Z0-9]{1,9}$/.test(key)) {
            this.showFieldError(keyInput, '项目标识应为2-10位大写字母或数字，且以字母开头');
            return;
        }
        
        // 检查是否是编辑模式
        const editId = document.getElementById('createProjectModal').dataset.editId;
        
        // 检查项目标识是否已存在（排除当前编辑的项目）
        const existingProject = ProjectsData.projects.find(p => 
            p.key === key && (!editId || p.id !== parseInt(editId))
        );
        if (existingProject) {
            this.showFieldError(keyInput, '该项目标识已被使用');
            return;
        }
        
        if (editId) {
            // 编辑模式
            const project = ProjectsData.projects.find(p => p.id === parseInt(editId));
            if (project) {
                project.name = name;
                project.description = description || '';
                project.updatedAt = new Date().toISOString().split('T')[0];
                
                showToast('项目更新成功', 'success');
            }
        } else {
            // 创建模式
            const selectedIconOption = ProjectsData.iconOptions[this.selectedIcon];
            
            const newProject = {
                id: Math.max(...ProjectsData.projects.map(p => p.id)) + 1,
                name: name,
                key: key,
                description: description || '',
                icon: ['monitor', 'server', 'smartphone', 'book', 'file-text', 'settings'][this.selectedIcon],
                color: selectedIconOption.color,
                tags: [],
                issueCount: 0,
                memberCount: 1,
                members: [ProjectsData.currentUserId],
                starred: false,
                archived: false,
                createdBy: ProjectsData.currentUserId,
                createdAt: new Date().toISOString().split('T')[0],
                updatedAt: new Date().toISOString().split('T')[0]
            };
            
            ProjectsData.projects.unshift(newProject);
            showToast('项目创建成功', 'success');
        }
        
        // 关闭弹窗并刷新列表
        this.closeCreateProjectModal();
        this.renderProjects();
        this.updatePagination();
    }
    
    // ==================== 显示字段错误 ====================
    showFieldError(input, message) {
        if (!input) return;
        
        // 移除之前的错误提示
        const existingError = input.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
        
        // 添加错误样式
        input.classList.add('error');
        
        // 添加错误提示
        const errorEl = document.createElement('div');
        errorEl.className = 'field-error';
        errorEl.textContent = message;
        input.parentNode.appendChild(errorEl);
        
        // 聚焦到错误字段
        input.focus();
        
        // 输入时移除错误
        input.addEventListener('input', function handler() {
            input.classList.remove('error');
            const error = input.parentNode.querySelector('.field-error');
            if (error) error.remove();
            input.removeEventListener('input', handler);
        });
    }
    
    // ==================== 关闭创建项目弹窗 ====================
    closeCreateProjectModal() {
        const modal = document.getElementById('createProjectModal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
            
            // 重置表单
            const nameInput = document.getElementById('projectName');
            const keyInput = document.getElementById('projectKey');
            const descInput = document.getElementById('projectDesc');
            
            if (nameInput) nameInput.value = '';
            if (keyInput) {
                keyInput.value = '';
                keyInput.disabled = false;
            }
            if (descInput) descInput.value = '';
            
            // 移除错误状态
            document.querySelectorAll('.form-input.error, .form-textarea.error').forEach(el => {
                el.classList.remove('error');
            });
            document.querySelectorAll('.field-error').forEach(el => el.remove());
            
            // 重置选择状态
            this.selectedIcon = 0;
            this.selectedTemplate = 'blank';
            document.querySelectorAll('.icon-option').forEach((opt, i) => {
                opt.classList.toggle('selected', i === 0);
            });
            document.querySelectorAll('.template-option').forEach((opt, i) => {
                opt.classList.toggle('selected', i === 0);
            });
            
            // 重置弹窗标题
            const modalTitle = document.querySelector('#createProjectModal .modal-title');
            if (modalTitle) {
                modalTitle.textContent = '新建项目';
            }
            
            // 清除编辑ID
            delete modal.dataset.editId;
        }
    }
}

// ==================== 初始化模块 ====================
let projectsModule;

document.addEventListener('DOMContentLoaded', function() {
    projectsModule = new ProjectsModule();
    
    // 覆盖全局的 createProject 函数
    window.createProject = function() {
        projectsModule.createProject();
    };
    
    // 覆盖全局的 closeCreateProjectModal 函数
    window.closeCreateProjectModal = function() {
        projectsModule.closeCreateProjectModal();
    };
});

// ==================== 导出全局函数 ====================
window.ProjectsData = ProjectsData;
window.selectProjectIcon = function(element) {
    const index = Array.from(element.parentNode.children).indexOf(element);
    if (projectsModule) {
        projectsModule.selectIcon(index);
    }
};
window.selectTemplate = function(element) {
    const index = Array.from(element.parentNode.children).indexOf(element);
    if (projectsModule) {
        projectsModule.selectTemplate(index);
    }
};