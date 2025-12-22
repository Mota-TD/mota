/**
 * 摩塔 Mota - 通用功能模块
 * 包含所有控制台页面共用的交互功能
 */

// ==================== 全局状态管理 ====================
const MotaApp = {
    // 当前用户信息
    currentUser: {
        id: 1,
        name: '张三',
        email: 'zhangsan@example.com',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user'
    },
    
    // 当前团队信息
    currentTeam: {
        id: 1,
        name: '示例团队',
        avatar: '示'
    },
    
    // 团队列表
    teams: [
        { id: 1, name: '示例团队', avatar: '示', color: '#2b7de9' },
        { id: 2, name: '开发团队', avatar: '开', color: '#10b981' },
        { id: 3, name: '产品团队', avatar: '产', color: '#f59e0b' }
    ],
    
    // 通知列表
    notifications: [
        { id: 1, type: 'issue', title: '李四 将事项 #1024 分配给了你', time: '5分钟前', read: false, link: 'issue-detail.html' },
        { id: 2, type: 'merge', title: '王五 请求你审核合并请求 !42', time: '15分钟前', read: false, link: 'merge-request-detail.html' },
        { id: 3, type: 'build', title: '构建 #1234 已完成', time: '1小时前', read: true, link: 'build-detail.html' }
    ],
    
    // 搜索历史
    searchHistory: [
        { type: 'project', title: '前端项目', link: 'project-detail.html' },
        { type: 'issue', title: '#1024 登录页面在移动端显示异常', link: 'issue-detail.html' },
        { type: 'iteration', title: 'Sprint 12', link: 'iteration-detail.html' }
    ]
};

// ==================== 下拉菜单管理 ====================
class DropdownManager {
    constructor() {
        this.activeDropdown = null;
        this.init();
    }
    
    init() {
        // 点击外部关闭所有下拉菜单
        document.addEventListener('click', (e) => {
            // 检查是否点击在下拉菜单触发器或下拉菜单内部
            const isDropdownTrigger = e.target.closest('[data-dropdown-trigger]') ||
                                      e.target.closest('.team-switcher-btn') ||
                                      e.target.closest('.header-action-btn') ||
                                      e.target.closest('.user-menu-btn');
            const isDropdownContent = e.target.closest('[data-dropdown]') ||
                                      e.target.closest('.team-dropdown') ||
                                      e.target.closest('.create-dropdown') ||
                                      e.target.closest('.notification-dropdown') ||
                                      e.target.closest('.user-dropdown') ||
                                      e.target.closest('.dropdown-menu');
            
            if (!isDropdownTrigger && !isDropdownContent) {
                this.closeAll();
            }
        });
        
        // ESC 键关闭下拉菜单
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAll();
            }
        });
    }
    
    toggle(dropdownId, e) {
        if (e) {
            e.stopPropagation();
        }
        
        const dropdown = document.getElementById(dropdownId);
        if (!dropdown) return;
        
        const isActive = dropdown.classList.contains('active');
        this.closeAll();
        
        if (!isActive) {
            dropdown.classList.add('active');
            this.activeDropdown = dropdown;
        }
    }
    
    closeAll() {
        // 关闭所有类型的下拉菜单
        const dropdownSelectors = [
            '[data-dropdown]',
            '.team-dropdown',
            '.create-dropdown',
            '.notification-dropdown',
            '.user-dropdown',
            '.dropdown-menu.active'
        ];
        
        dropdownSelectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(dropdown => {
                dropdown.classList.remove('active');
            });
        });
        
        this.activeDropdown = null;
    }
    
    close(dropdownId) {
        const dropdown = document.getElementById(dropdownId);
        if (dropdown) {
            dropdown.classList.remove('active');
        }
    }
}

// 创建全局下拉菜单管理器
const dropdownManager = new DropdownManager();

// ==================== 团队切换功能 ====================
function toggleTeamSwitcher(e) {
    dropdownManager.toggle('teamDropdown', e);
}

function switchTeam(teamId) {
    const team = MotaApp.teams.find(t => t.id === teamId);
    if (team) {
        MotaApp.currentTeam = team;
        
        // 更新 UI
        const teamNameEl = document.querySelector('.team-switcher .team-name');
        const teamAvatarEl = document.querySelector('.team-switcher .team-avatar span');
        
        if (teamNameEl) teamNameEl.textContent = team.name;
        if (teamAvatarEl) {
            teamAvatarEl.textContent = team.avatar;
            teamAvatarEl.parentElement.style.background = team.color;
        }
        
        // 更新下拉菜单中的选中状态
        document.querySelectorAll('#teamDropdown .dropdown-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const activeItem = document.querySelector(`#teamDropdown .dropdown-item[data-team-id="${teamId}"]`);
        if (activeItem) {
            activeItem.classList.add('active');
        }
        
        dropdownManager.closeAll();
        showToast(`已切换到 ${team.name}`);
        
        // 这里可以添加实际的团队切换逻辑，如刷新页面数据
    }
}

function createNewTeam() {
    dropdownManager.closeAll();
    showToast('创建团队功能开发中');
    // 这里可以打开创建团队的弹窗
}

// ==================== 全局搜索功能 ====================
class SearchModal {
    constructor() {
        this.overlay = null;
        this.input = null;
        this.resultsContainer = null;
        this.searchTimeout = null;
        this.init();
    }
    
    init() {
        this.overlay = document.getElementById('searchModalOverlay');
        if (this.overlay) {
            this.input = document.getElementById('searchModalInput');
            this.resultsContainer = this.overlay.querySelector('.search-modal-body');
            
            // 输入事件
            if (this.input) {
                this.input.addEventListener('input', (e) => this.handleInput(e));
                this.input.addEventListener('keydown', (e) => this.handleKeydown(e));
            }
        }
    }
    
    open() {
        if (this.overlay) {
            this.overlay.classList.add('active');
            if (this.input) {
                this.input.focus();
                this.input.value = '';
            }
            this.showDefaultContent();
        }
    }
    
    close() {
        if (this.overlay) {
            this.overlay.classList.remove('active');
        }
    }
    
    handleInput(e) {
        const query = e.target.value.trim();
        
        // 防抖处理
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            if (query.length > 0) {
                this.search(query);
            } else {
                this.showDefaultContent();
            }
        }, 300);
    }
    
    handleKeydown(e) {
        if (e.key === 'Enter') {
            const query = this.input.value.trim();
            if (query) {
                this.executeSearch(query);
            }
        }
    }
    
    search(query) {
        // 模拟搜索结果
        const results = this.mockSearch(query);
        this.renderResults(results, query);
    }
    
    mockSearch(query) {
        const lowerQuery = query.toLowerCase();
        
        // 模拟搜索数据
        const allItems = [
            { type: 'project', title: '前端项目', desc: 'Web 前端应用', link: 'project-detail.html' },
            { type: 'project', title: '后端服务', desc: 'API 服务', link: 'project-detail.html' },
            { type: 'project', title: '移动端项目', desc: 'iOS/Android 应用', link: 'project-detail.html' },
            { type: 'issue', title: '#1024 登录页面在移动端显示异常', desc: '缺陷 · 高优先级', link: 'issue-detail.html' },
            { type: 'issue', title: '#1025 实现用户权限管理模块', desc: '需求 · 中优先级', link: 'issue-detail.html' },
            { type: 'issue', title: '#1026 编写API接口文档', desc: '任务 · 低优先级', link: 'issue-detail.html' },
            { type: 'iteration', title: 'Sprint 12', desc: '2024-01-01 ~ 2024-01-14', link: 'iteration-detail.html' },
            { type: 'iteration', title: 'Sprint 13', desc: '2024-01-15 ~ 2024-01-28', link: 'iteration-detail.html' },
            { type: 'member', title: '张三', desc: 'zhangsan@example.com', link: 'profile-settings.html' },
            { type: 'member', title: '李四', desc: 'lisi@example.com', link: 'members.html' },
            { type: 'repo', title: 'mota-frontend', desc: '前端代码仓库', link: 'repo-detail.html' },
            { type: 'repo', title: 'mota-backend', desc: '后端代码仓库', link: 'repo-detail.html' }
        ];
        
        return allItems.filter(item => 
            item.title.toLowerCase().includes(lowerQuery) || 
            item.desc.toLowerCase().includes(lowerQuery)
        );
    }
    
    renderResults(results, query) {
        if (!this.resultsContainer) return;
        
        if (results.length === 0) {
            this.resultsContainer.innerHTML = `
                <div class="search-empty">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <circle cx="11" cy="11" r="8"/>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                    <p>未找到与 "${query}" 相关的结果</p>
                </div>
            `;
            return;
        }
        
        // 按类型分组
        const grouped = {};
        results.forEach(item => {
            if (!grouped[item.type]) {
                grouped[item.type] = [];
            }
            grouped[item.type].push(item);
        });
        
        const typeLabels = {
            project: '项目',
            issue: '事项',
            iteration: '迭代',
            member: '成员',
            repo: '代码仓库'
        };
        
        const typeIcons = {
            project: '<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>',
            issue: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',
            iteration: '<polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>',
            member: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
            repo: '<path d="M16 18l6-6-6-6"/><path d="M8 6l-6 6 6 6"/>'
        };
        
        let html = '';
        for (const type in grouped) {
            html += `
                <div class="search-section">
                    <div class="search-section-title">${typeLabels[type] || type}</div>
                    ${grouped[type].map(item => `
                        <div class="search-item" onclick="window.location.href='${item.link}'">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                ${typeIcons[item.type] || ''}
                            </svg>
                            <div class="search-item-content">
                                <span class="search-item-title">${this.highlightMatch(item.title, query)}</span>
                                <span class="search-item-desc">${item.desc}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }
        
        this.resultsContainer.innerHTML = html;
    }
    
    highlightMatch(text, query) {
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }
    
    showDefaultContent() {
        if (!this.resultsContainer) return;
        
        this.resultsContainer.innerHTML = `
            <div class="search-section">
                <div class="search-section-title">快速操作</div>
                <div class="search-item" onclick="openCreateIssueModal(); searchModal.close();">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="12" y1="5" x2="12" y2="19"/>
                        <line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    <span>新建事项</span>
                    <kbd>N</kbd>
                </div>
                <div class="search-item" onclick="openCreateProjectModal(); searchModal.close();">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                    </svg>
                    <span>新建项目</span>
                    <kbd>P</kbd>
                </div>
            </div>
            <div class="search-section">
                <div class="search-section-title">最近访问</div>
                ${MotaApp.searchHistory.map(item => `
                    <div class="search-item" onclick="window.location.href='${item.link}'">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            ${this.getTypeIcon(item.type)}
                        </svg>
                        <span>${item.title}</span>
                        <span class="search-item-meta">${this.getTypeLabel(item.type)}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    getTypeIcon(type) {
        const icons = {
            project: '<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>',
            issue: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',
            iteration: '<polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>'
        };
        return icons[type] || '';
    }
    
    getTypeLabel(type) {
        const labels = {
            project: '项目',
            issue: '事项',
            iteration: '迭代'
        };
        return labels[type] || type;
    }
    
    executeSearch(query) {
        // 添加到搜索历史
        console.log('执行搜索:', query);
        showToast(`搜索: ${query}`);
    }
}

// 创建全局搜索模态框
let searchModal;
document.addEventListener('DOMContentLoaded', () => {
    searchModal = new SearchModal();
});

function openSearchModal() {
    if (searchModal) {
        searchModal.open();
    }
}

function closeSearchModal() {
    if (searchModal) {
        searchModal.close();
    }
}

// ==================== 通知中心功能 ====================
function toggleNotifications(e) {
    dropdownManager.toggle('notificationDropdown', e);
    // 标记为已查看
    updateNotificationBadge();
}

function updateNotificationBadge() {
    const unreadCount = MotaApp.notifications.filter(n => !n.read).length;
    const badge = document.querySelector('.notification-badge');
    if (badge) {
        if (unreadCount > 0) {
            badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    }
}

function markNotificationAsRead(notificationId) {
    const notification = MotaApp.notifications.find(n => n.id === notificationId);
    if (notification) {
        notification.read = true;
        updateNotificationBadge();
        
        // 更新 UI
        const notificationEl = document.querySelector(`.notification-item[data-notification-id="${notificationId}"]`);
        if (notificationEl) {
            notificationEl.classList.remove('unread');
        }
    }
}

function markAllNotificationsAsRead() {
    MotaApp.notifications.forEach(n => n.read = true);
    updateNotificationBadge();
    
    document.querySelectorAll('.notification-item.unread').forEach(el => {
        el.classList.remove('unread');
    });
    
    showToast('已全部标记为已读');
}

function clearAllNotifications() {
    MotaApp.notifications = [];
    updateNotificationBadge();
    
    const notificationList = document.querySelector('.notification-list');
    if (notificationList) {
        notificationList.innerHTML = `
            <div class="notification-empty">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
                <p>暂无通知</p>
            </div>
        `;
    }
    
    showToast('已清空所有通知');
}

// ==================== 用户菜单功能 ====================
function toggleUserMenu(e) {
    dropdownManager.toggle('userDropdown', e);
}

function logout() {
    if (confirm('确定要退出登录吗？')) {
        showToast('正在退出...');
        setTimeout(() => {
            window.location.href = '../login.html';
        }, 1000);
    }
}

// ==================== 新建菜单功能 ====================
function toggleCreateMenu(e) {
    dropdownManager.toggle('createDropdown', e);
}

// ==================== 弹窗管理 ====================
class ModalManager {
    constructor() {
        this.activeModals = [];
        this.init();
    }
    
    init() {
        // ESC 键关闭最上层弹窗
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.activeModals.length > 0) {
                this.close(this.activeModals[this.activeModals.length - 1]);
            }
        });
        
        // 点击遮罩层关闭弹窗
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.close(overlay.id);
                }
            });
        });
    }
    
    open(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            this.activeModals.push(modalId);
            document.body.style.overflow = 'hidden';
            
            // 聚焦第一个输入框
            const firstInput = modal.querySelector('input, textarea, select');
            if (firstInput) {
                setTimeout(() => firstInput.focus(), 100);
            }
        }
    }
    
    close(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            this.activeModals = this.activeModals.filter(id => id !== modalId);
            
            if (this.activeModals.length === 0) {
                document.body.style.overflow = '';
            }
        }
    }
    
    closeAll() {
        this.activeModals.forEach(modalId => {
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.classList.remove('active');
            }
        });
        this.activeModals = [];
        document.body.style.overflow = '';
    }
}

// 创建全局弹窗管理器
const modalManager = new ModalManager();

// ==================== 创建事项弹窗 ====================
function openCreateIssueModal() {
    dropdownManager.closeAll();
    modalManager.open('createIssueModal');
}

function closeCreateIssueModal() {
    modalManager.close('createIssueModal');
    // 重置表单
    const form = document.querySelector('#createIssueModal form, #createIssueModal .modal-body');
    if (form) {
        form.querySelectorAll('input, textarea').forEach(el => el.value = '');
        form.querySelectorAll('select').forEach(el => el.selectedIndex = 0);
    }
}

function createIssue() {
    const title = document.getElementById('issueTitle')?.value;
    if (!title || !title.trim()) {
        showToast('请输入事项标题', 'error');
        return;
    }
    
    const type = document.getElementById('issueType')?.value || 'task';
    const priority = document.getElementById('issuePriority')?.value || 'medium';
    const project = document.getElementById('issueProject')?.value;
    const description = document.getElementById('issueDescription')?.value;
    
    // 模拟创建事项
    console.log('创建事项:', { title, type, priority, project, description });
    
    showToast('事项创建成功', 'success');
    closeCreateIssueModal();
}

// ==================== 创建项目弹窗 ====================
function openCreateProjectModal() {
    dropdownManager.closeAll();
    modalManager.open('createProjectModal');
}

function closeCreateProjectModal() {
    modalManager.close('createProjectModal');
    // 重置表单
    const form = document.querySelector('#createProjectModal form, #createProjectModal .modal-body');
    if (form) {
        form.querySelectorAll('input, textarea').forEach(el => el.value = '');
    }
}

function createProject() {
    const name = document.getElementById('projectName')?.value;
    const key = document.getElementById('projectKey')?.value;
    
    if (!name || !name.trim()) {
        showToast('请输入项目名称', 'error');
        return;
    }
    
    if (!key || !key.trim()) {
        showToast('请输入项目标识', 'error');
        return;
    }
    
    const description = document.getElementById('projectDescription')?.value;
    
    // 模拟创建项目
    console.log('创建项目:', { name, key, description });
    
    showToast('项目创建成功', 'success');
    closeCreateProjectModal();
}

// ==================== 创建迭代弹窗 ====================
function openCreateIterationModal() {
    dropdownManager.closeAll();
    modalManager.open('createIterationModal');
}

function closeCreateIterationModal() {
    modalManager.close('createIterationModal');
    // 重置表单
    const form = document.querySelector('#createIterationModal form, #createIterationModal .modal-body');
    if (form) {
        form.querySelectorAll('input, textarea').forEach(el => el.value = '');
    }
}

function createIteration() {
    const name = document.getElementById('iterationName')?.value;
    
    if (!name || !name.trim()) {
        showToast('请输入迭代名称', 'error');
        return;
    }
    
    const startDate = document.getElementById('iterationStartDate')?.value;
    const endDate = document.getElementById('iterationEndDate')?.value;
    const goal = document.getElementById('iterationGoal')?.value;
    
    // 模拟创建迭代
    console.log('创建迭代:', { name, startDate, endDate, goal });
    
    showToast('迭代创建成功', 'success');
    closeCreateIterationModal();
}

// ==================== 创建仓库弹窗 ====================
function openCreateRepoModal() {
    dropdownManager.closeAll();
    modalManager.open('createRepoModal');
}

function closeCreateRepoModal() {
    modalManager.close('createRepoModal');
    // 重置表单
    const form = document.querySelector('#createRepoModal form, #createRepoModal .modal-body');
    if (form) {
        form.querySelectorAll('input[type="text"], textarea').forEach(el => el.value = '');
        form.querySelectorAll('input[type="checkbox"]').forEach(el => {
            if (el.id === 'initReadme') {
                el.checked = true;
            } else {
                el.checked = false;
            }
        });
        form.querySelectorAll('input[type="radio"][value="private"]').forEach(el => el.checked = true);
    }
}

function createRepo() {
    const name = document.getElementById('repoName')?.value;
    
    if (!name || !name.trim()) {
        showToast('请输入仓库名称', 'error');
        return;
    }
    
    // 验证仓库名称格式
    if (!/^[a-zA-Z0-9_-]+$/.test(name)) {
        showToast('仓库名称只能包含英文、数字、下划线和连字符', 'error');
        return;
    }
    
    const description = document.getElementById('repoDesc')?.value;
    const visibility = document.querySelector('input[name="repoVisibility"]:checked')?.value || 'private';
    const initReadme = document.getElementById('initReadme')?.checked;
    const initGitignore = document.getElementById('initGitignore')?.checked;
    const initLicense = document.getElementById('initLicense')?.checked;
    
    // 模拟创建仓库
    console.log('创建仓库:', { name, description, visibility, initReadme, initGitignore, initLicense });
    
    showToast('仓库创建成功', 'success');
    closeCreateRepoModal();
}

// ==================== Toast 通知 ====================
function showToast(message, type = 'info') {
    // 移除现有的 toast
    const existingToast = document.querySelector('.toast.visible');
    if (existingToast) {
        existingToast.classList.remove('visible');
    }
    
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    
    // 设置类型样式
    toast.className = `toast ${type}`;
    
    // 设置图标
    const icons = {
        success: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
        error: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
        warning: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
        info: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
    };
    
    toast.innerHTML = `${icons[type] || icons.info}<span>${message}</span>`;
    
    // 显示 toast
    requestAnimationFrame(() => {
        toast.classList.add('visible');
    });
    
    // 自动隐藏
    setTimeout(() => {
        toast.classList.remove('visible');
    }, 3000);
}

// ==================== 键盘快捷键 ====================
document.addEventListener('keydown', function(e) {
    // Cmd/Ctrl + K 打开搜索
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        openSearchModal();
    }
    
    // Cmd/Ctrl + N 新建事项（在非输入状态下）
    if ((e.metaKey || e.ctrlKey) && e.key === 'n' && !isInputFocused()) {
        e.preventDefault();
        openCreateIssueModal();
    }
    
    // Cmd/Ctrl + P 新建项目（在非输入状态下）
    if ((e.metaKey || e.ctrlKey) && e.key === 'p' && !isInputFocused()) {
        e.preventDefault();
        openCreateProjectModal();
    }
});

function isInputFocused() {
    const activeElement = document.activeElement;
    return activeElement && (
        activeElement.tagName === 'INPUT' || 
        activeElement.tagName === 'TEXTAREA' || 
        activeElement.isContentEditable
    );
}

// ==================== 隐藏菜单项功能 ====================
// 需要隐藏的菜单项（代码托管和持续集成相关）
const hiddenMenuItems = [
    // 代码托管相关
    'repos.html',
    'repo-detail.html',
    'files.html',
    'branches.html',
    'commit-detail.html',
    'compare.html',
    'code-search.html',
    'merge-requests.html',
    'merge-request-detail.html',
    // 持续集成相关
    'pipelines.html',
    'pipeline-config.html',
    'builds.html',
    'build-detail.html',
    // 制品管理相关
    'artifacts.html',
    'artifact-detail.html',
    // 持续部署相关
    'deployments.html',
    'deployment-detail.html',
    'environments.html'
];

// 需要隐藏的侧边栏菜单分类
const hiddenSidebarSections = [
    '代码托管',
    '持续集成',
    '制品管理',
    '持续部署'
];

function hideMenuItems() {
    // 隐藏侧边栏中的菜单项
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    sidebarItems.forEach(item => {
        const href = item.getAttribute('href');
        if (href) {
            const filename = href.split('/').pop();
            if (hiddenMenuItems.includes(filename)) {
                item.style.display = 'none';
            }
        }
    });
    
    // 隐藏侧边栏分类标题
    const sectionTitles = document.querySelectorAll('.sidebar-section-title');
    sectionTitles.forEach(title => {
        const titleText = title.textContent.trim();
        if (hiddenSidebarSections.includes(titleText)) {
            // 隐藏整个分类区域
            const section = title.closest('.sidebar-section');
            if (section) {
                section.style.display = 'none';
            }
        }
    });
    
    // 隐藏新建菜单中的仓库选项
    const createDropdown = document.getElementById('createDropdown');
    if (createDropdown) {
        const dropdownItems = createDropdown.querySelectorAll('.dropdown-item');
        dropdownItems.forEach(item => {
            const text = item.textContent.trim();
            if (text.includes('仓库') || text.includes('流水线') || text.includes('构建')) {
                item.style.display = 'none';
            }
        });
    }
    
    // 更新搜索结果中隐藏相关类型
    const originalMockSearch = SearchModal.prototype.mockSearch;
    if (originalMockSearch) {
        SearchModal.prototype.mockSearch = function(query) {
            const results = originalMockSearch.call(this, query);
            return results.filter(item => item.type !== 'repo');
        };
    }
}

// ==================== 页面初始化 ====================
document.addEventListener('DOMContentLoaded', function() {
    // 初始化通知徽章
    updateNotificationBadge();
    
    // 初始化搜索模态框
    searchModal = new SearchModal();
    
    // 隐藏代码托管和集成相关菜单
    hideMenuItems();
    
    console.log('摩塔通用功能模块已加载');
});

// ==================== 侧边栏切换功能 ====================
function toggleSidebar() {
    const sidebar = document.querySelector('.console-sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    
    if (sidebar) {
        sidebar.classList.toggle('active');
        
        // 创建或切换遮罩层
        if (!overlay) {
            const newOverlay = document.createElement('div');
            newOverlay.className = 'sidebar-overlay';
            newOverlay.onclick = toggleSidebar;
            document.body.appendChild(newOverlay);
            // 触发重绘以启用过渡动画
            requestAnimationFrame(() => {
                newOverlay.classList.add('active');
            });
        } else {
            overlay.classList.toggle('active');
        }
    }
}

// 关闭侧边栏（点击链接后）
function closeSidebarOnNavigation() {
    const sidebar = document.querySelector('.console-sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    
    if (sidebar && sidebar.classList.contains('active')) {
        sidebar.classList.remove('active');
        if (overlay) {
            overlay.classList.remove('active');
        }
    }
}

// 为侧边栏链接添加点击事件
document.addEventListener('DOMContentLoaded', function() {
    const sidebarLinks = document.querySelectorAll('.sidebar-item');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', closeSidebarOnNavigation);
    });
});

// ==================== 导出全局函数 ====================
window.MotaApp = MotaApp;
window.dropdownManager = dropdownManager;
window.modalManager = modalManager;
window.toggleTeamSwitcher = toggleTeamSwitcher;
window.switchTeam = switchTeam;
window.createNewTeam = createNewTeam;
window.openSearchModal = openSearchModal;
window.closeSearchModal = closeSearchModal;
window.toggleNotifications = toggleNotifications;
window.markNotificationAsRead = markNotificationAsRead;
window.markAllNotificationsAsRead = markAllNotificationsAsRead;
window.clearAllNotifications = clearAllNotifications;
window.toggleUserMenu = toggleUserMenu;
window.logout = logout;
window.toggleCreateMenu = toggleCreateMenu;
window.openCreateIssueModal = openCreateIssueModal;
window.closeCreateIssueModal = closeCreateIssueModal;
window.createIssue = createIssue;
window.openCreateProjectModal = openCreateProjectModal;
window.closeCreateProjectModal = closeCreateProjectModal;
window.createProject = createProject;
window.openCreateIterationModal = openCreateIterationModal;
window.closeCreateIterationModal = closeCreateIterationModal;
window.createIteration = createIteration;
window.openCreateRepoModal = openCreateRepoModal;
window.closeCreateRepoModal = closeCreateRepoModal;
window.createRepo = createRepo;
window.showToast = showToast;
window.closeModal = function(modalId) { modalManager.close(modalId); };
window.toggleSidebar = toggleSidebar;
window.closeSidebarOnNavigation = closeSidebarOnNavigation;