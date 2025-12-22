/**
 * Issues Module
 * Handles all issues list page functionality
 */

// Issues Data
const IssuesData = {
    // All issues
    issues: [
        { id: 'REQ-001', type: 'requirement', title: '用户登录功能优化', status: 'processing', priority: 'high', assignee: { id: 1, name: '张三', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1' }, iteration: 'Sprint 12', dueDate: '2024-01-15', subTasks: 3, createdAt: '2024-01-01', updatedAt: '2024-01-10' },
        { id: 'TASK-001', type: 'task', title: '实现登录表单验证', status: 'completed', priority: 'medium', assignee: { id: 2, name: '李四', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2' }, iteration: 'Sprint 12', dueDate: '2024-01-10', subTasks: 0, createdAt: '2024-01-02', updatedAt: '2024-01-08' },
        { id: 'BUG-001', type: 'bug', title: '登录页面在Safari浏览器显示异常', status: 'pending', priority: 'high', assignee: { id: 3, name: '王五', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3' }, iteration: 'Sprint 12', dueDate: '2024-01-08', subTasks: 0, createdAt: '2024-01-03', updatedAt: '2024-01-05' },
        { id: 'REQ-002', type: 'requirement', title: '新增数据导出功能', status: 'pending', priority: 'medium', assignee: null, iteration: 'Sprint 13', dueDate: '2024-01-25', subTasks: 5, createdAt: '2024-01-04', updatedAt: '2024-01-04' },
        { id: 'TASK-002', type: 'task', title: '编写API接口文档', status: 'processing', priority: 'low', assignee: { id: 4, name: '赵六', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=4' }, iteration: 'Sprint 12', dueDate: '2024-01-20', subTasks: 0, createdAt: '2024-01-05', updatedAt: '2024-01-09' },
        { id: 'BUG-002', type: 'bug', title: '数据分页加载时偶发性报错', status: 'processing', priority: 'medium', assignee: { id: 5, name: '钱七', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=5' }, iteration: 'Sprint 12', dueDate: '2024-01-12', subTasks: 0, createdAt: '2024-01-06', updatedAt: '2024-01-10' },
        { id: 'REQ-003', type: 'requirement', title: '支持多语言国际化', status: 'pending', priority: 'low', assignee: { id: 6, name: '孙八', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=6' }, iteration: null, dueDate: '2024-02-28', subTasks: 8, createdAt: '2024-01-07', updatedAt: '2024-01-07' },
        { id: 'TASK-003', type: 'task', title: '优化首页加载性能', status: 'completed', priority: 'high', assignee: { id: 1, name: '张三', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1' }, iteration: 'Sprint 11', dueDate: '2024-01-05', subTasks: 0, createdAt: '2023-12-20', updatedAt: '2024-01-05' },
        { id: 'REQ-004', type: 'requirement', title: '用户权限管理系统', status: 'processing', priority: 'high', assignee: { id: 2, name: '李四', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2' }, iteration: 'Sprint 12', dueDate: '2024-01-18', subTasks: 4, createdAt: '2024-01-08', updatedAt: '2024-01-11' },
        { id: 'TASK-004', type: 'task', title: '实现用户头像上传', status: 'testing', priority: 'medium', assignee: { id: 3, name: '王五', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3' }, iteration: 'Sprint 12', dueDate: '2024-01-14', subTasks: 0, createdAt: '2024-01-09', updatedAt: '2024-01-12' },
        { id: 'BUG-003', type: 'bug', title: '表格排序功能失效', status: 'pending', priority: 'low', assignee: { id: 4, name: '赵六', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=4' }, iteration: 'Sprint 13', dueDate: '2024-01-22', subTasks: 0, createdAt: '2024-01-10', updatedAt: '2024-01-10' },
        { id: 'REQ-005', type: 'requirement', title: '消息通知中心', status: 'pending', priority: 'medium', assignee: { id: 5, name: '钱七', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=5' }, iteration: 'Sprint 13', dueDate: '2024-01-28', subTasks: 6, createdAt: '2024-01-11', updatedAt: '2024-01-11' },
        { id: 'TASK-005', type: 'task', title: '重构用户模块代码', status: 'completed', priority: 'medium', assignee: { id: 6, name: '孙八', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=6' }, iteration: 'Sprint 11', dueDate: '2024-01-03', subTasks: 0, createdAt: '2023-12-25', updatedAt: '2024-01-03' },
        { id: 'BUG-004', type: 'bug', title: '移动端样式错乱', status: 'processing', priority: 'high', assignee: { id: 1, name: '张三', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1' }, iteration: 'Sprint 12', dueDate: '2024-01-11', subTasks: 0, createdAt: '2024-01-09', updatedAt: '2024-01-11' },
        { id: 'REQ-006', type: 'requirement', title: '数据可视化报表', status: 'pending', priority: 'low', assignee: null, iteration: null, dueDate: '2024-03-15', subTasks: 10, createdAt: '2024-01-12', updatedAt: '2024-01-12' },
        { id: 'TASK-006', type: 'task', title: '添加单元测试', status: 'pending', priority: 'medium', assignee: { id: 2, name: '李四', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2' }, iteration: 'Sprint 13', dueDate: '2024-01-30', subTasks: 0, createdAt: '2024-01-12', updatedAt: '2024-01-12' },
        { id: 'BUG-005', type: 'bug', title: '文件上传大小限制无效', status: 'completed', priority: 'medium', assignee: { id: 3, name: '王五', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3' }, iteration: 'Sprint 11', dueDate: '2024-01-02', subTasks: 0, createdAt: '2023-12-28', updatedAt: '2024-01-02' },
        { id: 'REQ-007', type: 'requirement', title: '工作流自动化', status: 'processing', priority: 'high', assignee: { id: 4, name: '赵六', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=4' }, iteration: 'Sprint 12', dueDate: '2024-01-19', subTasks: 7, createdAt: '2024-01-08', updatedAt: '2024-01-13' },
        { id: 'TASK-007', type: 'task', title: '优化数据库查询', status: 'completed', priority: 'high', assignee: { id: 5, name: '钱七', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=5' }, iteration: 'Sprint 11', dueDate: '2024-01-04', subTasks: 0, createdAt: '2023-12-22', updatedAt: '2024-01-04' },
        { id: 'BUG-006', type: 'bug', title: '日期选择器时区问题', status: 'pending', priority: 'medium', assignee: { id: 6, name: '孙八', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=6' }, iteration: 'Sprint 13', dueDate: '2024-01-24', subTasks: 0, createdAt: '2024-01-11', updatedAt: '2024-01-11' }
    ],
    
    // Team members for assignee selection
    members: [
        { id: 1, name: '张三', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1' },
        { id: 2, name: '李四', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2' },
        { id: 3, name: '王五', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3' },
        { id: 4, name: '赵六', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=4' },
        { id: 5, name: '钱七', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=5' },
        { id: 6, name: '孙八', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=6' }
    ],
    
    // Iterations
    iterations: [
        { id: 'sprint11', name: 'Sprint 11', status: 'completed' },
        { id: 'sprint12', name: 'Sprint 12', status: 'current' },
        { id: 'sprint13', name: 'Sprint 13', status: 'planned' }
    ],
    
    // Projects
    projects: [
        { id: 1, name: '前端项目' },
        { id: 2, name: '后端服务' },
        { id: 3, name: '移动端App' }
    ]
};

// Issues Module Class
class IssuesModule {
    constructor() {
        this.data = IssuesData;
        this.currentPage = 1;
        this.pageSize = 10;
        this.currentType = 'all';
        this.searchQuery = '';
        this.filters = {
            status: 'all',
            priority: 'all',
            assignee: 'all'
        };
        this.selectedIssues = new Set();
        this.sortField = 'updatedAt';
        this.sortOrder = 'desc';
        this.init();
    }
    
    init() {
        this.updateTabCounts();
        this.renderIssues();
        this.renderPagination();
        this.bindEvents();
    }
    
    // Update tab counts
    updateTabCounts() {
        const counts = {
            all: this.data.issues.length,
            requirement: this.data.issues.filter(i => i.type === 'requirement').length,
            task: this.data.issues.filter(i => i.type === 'task').length,
            bug: this.data.issues.filter(i => i.type === 'bug').length
        };
        
        document.querySelectorAll('.issue-tab').forEach(tab => {
            const type = tab.dataset.type;
            const countEl = tab.querySelector('.tab-count');
            if (countEl && counts[type] !== undefined) {
                countEl.textContent = counts[type];
            }
        });
    }
    
    // Get filtered issues
    getFilteredIssues() {
        let issues = [...this.data.issues];
        
        // Filter by type
        if (this.currentType !== 'all') {
            issues = issues.filter(i => i.type === this.currentType);
        }
        
        // Filter by search query
        if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            issues = issues.filter(i => 
                i.id.toLowerCase().includes(query) ||
                i.title.toLowerCase().includes(query) ||
                (i.assignee && i.assignee.name.toLowerCase().includes(query))
            );
        }
        
        // Filter by status
        if (this.filters.status !== 'all') {
            issues = issues.filter(i => i.status === this.filters.status);
        }
        
        // Filter by priority
        if (this.filters.priority !== 'all') {
            issues = issues.filter(i => i.priority === this.filters.priority);
        }
        
        // Filter by assignee
        if (this.filters.assignee === 'mine') {
            issues = issues.filter(i => i.assignee && i.assignee.id === 1); // Current user
        } else if (this.filters.assignee === 'unassigned') {
            issues = issues.filter(i => !i.assignee);
        }
        
        // Sort
        issues.sort((a, b) => {
            let aVal = a[this.sortField];
            let bVal = b[this.sortField];
            
            if (this.sortField === 'priority') {
                const priorityOrder = { high: 3, medium: 2, low: 1 };
                aVal = priorityOrder[aVal] || 0;
                bVal = priorityOrder[bVal] || 0;
            }
            
            if (this.sortOrder === 'asc') {
                return aVal > bVal ? 1 : -1;
            } else {
                return aVal < bVal ? 1 : -1;
            }
        });
        
        return issues;
    }
    
    // Get paginated issues
    getPaginatedIssues() {
        const filtered = this.getFilteredIssues();
        const start = (this.currentPage - 1) * this.pageSize;
        const end = start + this.pageSize;
        return {
            issues: filtered.slice(start, end),
            total: filtered.length
        };
    }
    
    // Render issues table
    renderIssues() {
        const { issues, total } = this.getPaginatedIssues();
        const tbody = document.querySelector('.issues-table tbody');
        
        if (!tbody) return;
        
        if (issues.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="9" class="empty-state">
                        <div class="empty-content">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                <circle cx="12" cy="12" r="10"/>
                                <line x1="12" y1="8" x2="12" y2="12"/>
                                <line x1="12" y1="16" x2="12.01" y2="16"/>
                            </svg>
                            <p>暂无事项</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = issues.map(issue => this.renderIssueRow(issue)).join('');
        
        // Update pagination info
        const paginationInfo = document.querySelector('.pagination-info');
        if (paginationInfo) {
            paginationInfo.innerHTML = `
                共 <strong>${total}</strong> 条记录，每页显示
                <select class="page-size-select" id="pageSizeSelect">
                    <option value="10" ${this.pageSize === 10 ? 'selected' : ''}>10</option>
                    <option value="20" ${this.pageSize === 20 ? 'selected' : ''}>20</option>
                    <option value="50" ${this.pageSize === 50 ? 'selected' : ''}>50</option>
                    <option value="100" ${this.pageSize === 100 ? 'selected' : ''}>100</option>
                </select>
                条
            `;
            
            // Bind page size change
            document.getElementById('pageSizeSelect')?.addEventListener('change', (e) => {
                this.pageSize = parseInt(e.target.value);
                this.currentPage = 1;
                this.renderIssues();
                this.renderPagination();
            });
        }
        
        // Update select all checkbox
        const selectAll = document.getElementById('selectAll');
        if (selectAll) {
            selectAll.checked = issues.length > 0 && issues.every(i => this.selectedIssues.has(i.id));
        }
    }
    
    // Render single issue row
    renderIssueRow(issue) {
        const isSelected = this.selectedIssues.has(issue.id);
        const isOverdue = this.isOverdue(issue.dueDate);
        const isUrgent = this.isUrgent(issue.dueDate);
        
        return `
            <tr class="issue-row ${isSelected ? 'selected' : ''}" data-id="${issue.id}">
                <td class="col-checkbox">
                    <input type="checkbox" ${isSelected ? 'checked' : ''} onchange="issuesModule.toggleIssueSelection('${issue.id}')">
                </td>
                <td class="col-id">
                    <a href="issue-detail.html?id=${issue.id}">${issue.id}</a>
                </td>
                <td class="col-type">
                    <span class="issue-type-badge ${issue.type}">${this.getTypeName(issue.type)}</span>
                </td>
                <td class="col-title">
                    <a href="issue-detail.html?id=${issue.id}" class="issue-title-link">
                        ${issue.title}
                        ${issue.subTasks > 0 ? `<span class="issue-sub-count">${issue.subTasks} 子任务</span>` : ''}
                    </a>
                </td>
                <td class="col-status">
                    <span class="status-badge ${issue.status}">${this.getStatusName(issue.status)}</span>
                </td>
                <td class="col-priority">
                    <span class="priority-badge ${issue.priority}">${this.getPriorityName(issue.priority)}</span>
                </td>
                <td class="col-assignee">
                    ${issue.assignee ? `
                        <div class="assignee">
                            <img src="${issue.assignee.avatar}" alt="">
                            <span>${issue.assignee.name}</span>
                        </div>
                    ` : `
                        <div class="assignee unassigned">
                            <span>待分配</span>
                        </div>
                    `}
                </td>
                <td class="col-iteration">
                    ${issue.iteration ? `
                        <span class="iteration-badge">${issue.iteration}</span>
                    ` : `
                        <span class="iteration-badge future">待规划</span>
                    `}
                </td>
                <td class="col-date">
                    <span class="date-text ${isOverdue ? 'overdue' : ''} ${isUrgent ? 'urgent' : ''}">${issue.dueDate}</span>
                </td>
            </tr>
        `;
    }
    
    // Render pagination
    renderPagination() {
        const { total } = this.getPaginatedIssues();
        const totalPages = Math.ceil(total / this.pageSize);
        const controls = document.querySelector('.pagination-controls');
        
        if (!controls) return;
        
        let html = '';
        
        // Previous button
        html += `
            <button class="pagination-btn" ${this.currentPage === 1 ? 'disabled' : ''} onclick="issuesModule.goToPage(${this.currentPage - 1})">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="15 18 9 12 15 6"/>
                </svg>
            </button>
        `;
        
        // Page numbers
        const maxVisiblePages = 5;
        let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        
        if (endPage - startPage < maxVisiblePages - 1) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }
        
        if (startPage > 1) {
            html += `<button class="pagination-btn" onclick="issuesModule.goToPage(1)">1</button>`;
            if (startPage > 2) {
                html += `<span class="pagination-ellipsis">...</span>`;
            }
        }
        
        for (let i = startPage; i <= endPage; i++) {
            html += `
                <button class="pagination-btn ${i === this.currentPage ? 'active' : ''}" onclick="issuesModule.goToPage(${i})">${i}</button>
            `;
        }
        
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                html += `<span class="pagination-ellipsis">...</span>`;
            }
            html += `<button class="pagination-btn" onclick="issuesModule.goToPage(${totalPages})">${totalPages}</button>`;
        }
        
        // Next button
        html += `
            <button class="pagination-btn" ${this.currentPage === totalPages || totalPages === 0 ? 'disabled' : ''} onclick="issuesModule.goToPage(${this.currentPage + 1})">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="9 18 15 12 9 6"/>
                </svg>
            </button>
        `;
        
        controls.innerHTML = html;
    }
    
    // Go to page
    goToPage(page) {
        const { total } = this.getPaginatedIssues();
        const totalPages = Math.ceil(total / this.pageSize);
        
        if (page < 1 || page > totalPages) return;
        
        this.currentPage = page;
        this.renderIssues();
        this.renderPagination();
    }
    
    // Toggle issue selection
    toggleIssueSelection(issueId) {
        if (this.selectedIssues.has(issueId)) {
            this.selectedIssues.delete(issueId);
        } else {
            this.selectedIssues.add(issueId);
        }
        
        this.updateBatchActions();
        this.renderIssues();
    }
    
    // Toggle all selection
    toggleAllSelection(checked) {
        const { issues } = this.getPaginatedIssues();
        
        if (checked) {
            issues.forEach(i => this.selectedIssues.add(i.id));
        } else {
            issues.forEach(i => this.selectedIssues.delete(i.id));
        }
        
        this.updateBatchActions();
        this.renderIssues();
    }
    
    // Update batch actions visibility
    updateBatchActions() {
        let batchBar = document.querySelector('.batch-actions-bar');
        
        if (this.selectedIssues.size > 0) {
            if (!batchBar) {
                batchBar = document.createElement('div');
                batchBar.className = 'batch-actions-bar';
                batchBar.innerHTML = `
                    <span class="batch-count">已选择 <strong>${this.selectedIssues.size}</strong> 项</span>
                    <div class="batch-actions">
                        <button class="btn btn-secondary btn-sm" onclick="issuesModule.batchUpdateStatus()">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="20 6 9 17 4 12"/>
                            </svg>
                            批量更新状态
                        </button>
                        <button class="btn btn-secondary btn-sm" onclick="issuesModule.batchAssign()">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                <circle cx="12" cy="7" r="4"/>
                            </svg>
                            批量分配
                        </button>
                        <button class="btn btn-secondary btn-sm" onclick="issuesModule.batchMoveToIteration()">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="23 4 23 10 17 10"/>
                                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                            </svg>
                            移入迭代
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="issuesModule.batchDelete()">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            </svg>
                            删除
                        </button>
                    </div>
                    <button class="btn btn-text btn-sm" onclick="issuesModule.clearSelection()">取消选择</button>
                `;
                document.querySelector('.filter-bar').after(batchBar);
            } else {
                batchBar.querySelector('.batch-count strong').textContent = this.selectedIssues.size;
            }
        } else if (batchBar) {
            batchBar.remove();
        }
    }
    
    // Clear selection
    clearSelection() {
        this.selectedIssues.clear();
        this.updateBatchActions();
        this.renderIssues();
    }
    
    // Batch update status
    batchUpdateStatus() {
        const status = prompt('请输入新状态 (pending/processing/testing/completed):');
        if (status && ['pending', 'processing', 'testing', 'completed'].includes(status)) {
            this.selectedIssues.forEach(id => {
                const issue = this.data.issues.find(i => i.id === id);
                if (issue) issue.status = status;
            });
            
            this.clearSelection();
            this.renderIssues();
            
            if (typeof showToast === 'function') {
                showToast(`已更新 ${this.selectedIssues.size} 个事项的状态`, 'success');
            }
        }
    }
    
    // Batch assign
    batchAssign() {
        const memberNames = this.data.members.map(m => m.name).join(', ');
        const name = prompt(`请输入负责人姓名 (${memberNames}):`);
        const member = this.data.members.find(m => m.name === name);
        
        if (member) {
            this.selectedIssues.forEach(id => {
                const issue = this.data.issues.find(i => i.id === id);
                if (issue) issue.assignee = { ...member };
            });
            
            const count = this.selectedIssues.size;
            this.clearSelection();
            this.renderIssues();
            
            if (typeof showToast === 'function') {
                showToast(`已将 ${count} 个事项分配给 ${name}`, 'success');
            }
        }
    }
    
    // Batch move to iteration
    batchMoveToIteration() {
        const iterationNames = this.data.iterations.map(i => i.name).join(', ');
        const name = prompt(`请输入迭代名称 (${iterationNames}):`);
        const iteration = this.data.iterations.find(i => i.name === name);
        
        if (iteration) {
            this.selectedIssues.forEach(id => {
                const issue = this.data.issues.find(i => i.id === id);
                if (issue) issue.iteration = iteration.name;
            });
            
            const count = this.selectedIssues.size;
            this.clearSelection();
            this.renderIssues();
            
            if (typeof showToast === 'function') {
                showToast(`已将 ${count} 个事项移入 ${name}`, 'success');
            }
        }
    }
    
    // Batch delete
    batchDelete() {
        if (confirm(`确定要删除选中的 ${this.selectedIssues.size} 个事项吗？`)) {
            const count = this.selectedIssues.size;
            this.selectedIssues.forEach(id => {
                const index = this.data.issues.findIndex(i => i.id === id);
                if (index !== -1) {
                    this.data.issues.splice(index, 1);
                }
            });
            
            this.clearSelection();
            this.updateTabCounts();
            this.renderIssues();
            this.renderPagination();
            
            if (typeof showToast === 'function') {
                showToast(`已删除 ${count} 个事项`, 'success');
            }
        }
    }
    
    // Set filter
    setFilter(filterType, value) {
        this.filters[filterType] = value;
        this.currentPage = 1;
        this.renderIssues();
        this.renderPagination();
        this.updateFilterTags();
    }
    
    // Update filter tags
    updateFilterTags() {
        const container = document.querySelector('.filter-tags');
        if (!container) return;
        
        let html = '';
        
        if (this.filters.status !== 'all') {
            html += `
                <span class="filter-tag">
                    状态: ${this.getStatusName(this.filters.status)}
                    <button class="filter-tag-remove" onclick="issuesModule.removeFilter('status')">×</button>
                </span>
            `;
        }
        
        if (this.filters.priority !== 'all') {
            html += `
                <span class="filter-tag">
                    优先级: ${this.getPriorityName(this.filters.priority)}
                    <button class="filter-tag-remove" onclick="issuesModule.removeFilter('priority')">×</button>
                </span>
            `;
        }
        
        if (this.filters.assignee !== 'all') {
            const assigneeText = this.filters.assignee === 'mine' ? '我负责的' : '未分配';
            html += `
                <span class="filter-tag">
                    处理人: ${assigneeText}
                    <button class="filter-tag-remove" onclick="issuesModule.removeFilter('assignee')">×</button>
                </span>
            `;
        }
        
        container.innerHTML = html;
    }
    
    // Remove filter
    removeFilter(filterType) {
        this.filters[filterType] = 'all';
        this.currentPage = 1;
        this.renderIssues();
        this.renderPagination();
        this.updateFilterTags();
    }
    
    // Search issues
    search(query) {
        this.searchQuery = query;
        this.currentPage = 1;
        this.renderIssues();
        this.renderPagination();
    }
    
    // Set type filter
    setType(type) {
        this.currentType = type;
        this.currentPage = 1;
        
        // Update tab UI
        document.querySelectorAll('.issue-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.type === type);
        });
        
        this.renderIssues();
        this.renderPagination();
    }
    
    // Create issue
    createIssue(issueData) {
        const typePrefix = {
            requirement: 'REQ',
            task: 'TASK',
            bug: 'BUG'
        };
        
        const prefix = typePrefix[issueData.type] || 'ISSUE';
        const existingIds = this.data.issues
            .filter(i => i.id.startsWith(prefix))
            .map(i => parseInt(i.id.split('-')[1]) || 0);
        const nextNum = Math.max(0, ...existingIds) + 1;
        const newId = `${prefix}-${String(nextNum).padStart(3, '0')}`;
        
        const newIssue = {
            id: newId,
            type: issueData.type,
            title: issueData.title,
            status: 'pending',
            priority: issueData.priority || 'medium',
            assignee: issueData.assigneeId ? this.data.members.find(m => m.id === parseInt(issueData.assigneeId)) : null,
            iteration: issueData.iteration || null,
            dueDate: issueData.dueDate || null,
            subTasks: 0,
            createdAt: new Date().toISOString().split('T')[0],
            updatedAt: new Date().toISOString().split('T')[0]
        };
        
        this.data.issues.unshift(newIssue);
        this.updateTabCounts();
        this.currentPage = 1;
        this.renderIssues();
        this.renderPagination();
        
        return newIssue;
    }
    
    // Export issues
    exportIssues() {
        const issues = this.getFilteredIssues();
        const csv = this.convertToCSV(issues);
        this.downloadCSV(csv, 'issues.csv');
        
        if (typeof showToast === 'function') {
            showToast(`已导出 ${issues.length} 个事项`, 'success');
        }
    }
    
    // Convert to CSV
    convertToCSV(issues) {
        const headers = ['ID', '类型', '标题', '状态', '优先级', '处理人', '迭代', '截止日期'];
        const rows = issues.map(i => [
            i.id,
            this.getTypeName(i.type),
            i.title,
            this.getStatusName(i.status),
            this.getPriorityName(i.priority),
            i.assignee ? i.assignee.name : '待分配',
            i.iteration || '待规划',
            i.dueDate || ''
        ]);
        
        return [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    }
    
    // Download CSV
    downloadCSV(csv, filename) {
        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
    }
    
    // Bind events
    bindEvents() {
        // Tab switching
        document.querySelectorAll('.issue-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                this.setType(tab.dataset.type);
            });
        });
        
        // Search input
        const searchInput = document.querySelector('.filter-right .search-input input');
        if (searchInput) {
            let debounceTimer;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => {
                    this.search(e.target.value);
                }, 300);
            });
        }
        
        // Select all checkbox
        const selectAll = document.getElementById('selectAll');
        if (selectAll) {
            selectAll.addEventListener('change', (e) => {
                this.toggleAllSelection(e.target.checked);
            });
        }
        
        // Create issue form submission
        const createBtn = document.querySelector('#createIssueModal .modal-footer .btn-primary');
        if (createBtn) {
            createBtn.addEventListener('click', () => {
                this.handleCreateIssue();
            });
        }
        
        // Filter dropdown
        this.initFilterDropdown();
    }
    
    // Initialize filter dropdown
    initFilterDropdown() {
        const filterBtn = document.querySelector('.filter-btn');
        if (!filterBtn) return;
        
        filterBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const filterDropdown = filterBtn.closest('.filter-dropdown');
            let menu = filterDropdown?.querySelector('.filter-dropdown-menu');
            
            if (!menu) {
                menu = document.createElement('div');
                menu.className = 'filter-dropdown-menu';
                menu.innerHTML = `
                    <div class="filter-section">
                        <div class="filter-section-title">状态</div>
                        <div class="filter-options" data-filter="status">
                            <span class="filter-option ${this.filters.status === 'all' ? 'active' : ''}" data-value="all">全部</span>
                            <span class="filter-option ${this.filters.status === 'pending' ? 'active' : ''}" data-value="pending">待处理</span>
                            <span class="filter-option ${this.filters.status === 'processing' ? 'active' : ''}" data-value="processing">进行中</span>
                            <span class="filter-option ${this.filters.status === 'testing' ? 'active' : ''}" data-value="testing">测试中</span>
                            <span class="filter-option ${this.filters.status === 'completed' ? 'active' : ''}" data-value="completed">已完成</span>
                        </div>
                    </div>
                    <div class="filter-section">
                        <div class="filter-section-title">优先级</div>
                        <div class="filter-options" data-filter="priority">
                            <span class="filter-option ${this.filters.priority === 'all' ? 'active' : ''}" data-value="all">全部</span>
                            <span class="filter-option ${this.filters.priority === 'high' ? 'active' : ''}" data-value="high">高</span>
                            <span class="filter-option ${this.filters.priority === 'medium' ? 'active' : ''}" data-value="medium">中</span>
                            <span class="filter-option ${this.filters.priority === 'low' ? 'active' : ''}" data-value="low">低</span>
                        </div>
                    </div>
                    <div class="filter-section">
                        <div class="filter-section-title">处理人</div>
                        <div class="filter-options" data-filter="assignee">
                            <span class="filter-option ${this.filters.assignee === 'all' ? 'active' : ''}" data-value="all">全部</span>
                            <span class="filter-option ${this.filters.assignee === 'mine' ? 'active' : ''}" data-value="mine">我负责的</span>
                            <span class="filter-option ${this.filters.assignee === 'unassigned' ? 'active' : ''}" data-value="unassigned">未分配</span>
                        </div>
                    </div>
                `;
                filterDropdown.appendChild(menu);
                
                // Add click handlers for filter options
                menu.querySelectorAll('.filter-option').forEach(opt => {
                    opt.addEventListener('click', () => {
                        const section = opt.closest('.filter-options');
                        const filterType = section.dataset.filter;
                        const value = opt.dataset.value;
                        
                        section.querySelectorAll('.filter-option').forEach(o => o.classList.remove('active'));
                        opt.classList.add('active');
                        
                        this.setFilter(filterType, value);
                    });
                });
            }
            
            if (typeof closeAllDropdowns === 'function') {
                closeAllDropdowns();
            }
            menu.classList.toggle('active');
        });
    }
    
    // Handle create issue
    handleCreateIssue() {
        const modal = document.getElementById('createIssueModal');
        if (!modal) return;
        
        const typeOption = modal.querySelector('.type-option.active');
        const titleInput = modal.querySelector('.form-group.full-width .form-input');
        const prioritySelect = modal.querySelectorAll('.form-select')[0];
        const assigneeSelect = modal.querySelectorAll('.form-select')[1];
        const iterationSelect = modal.querySelectorAll('.form-select')[2];
        const dueDateInput = modal.querySelector('input[type="date"]');
        
        const title = titleInput?.value?.trim();
        if (!title) {
            if (typeof showToast === 'function') {
                showToast('请输入事项标题', 'error');
            }
            return;
        }
        
        const issueData = {
            type: typeOption?.dataset.type || 'task',
            title: title,
            priority: prioritySelect?.value || 'medium',
            assigneeId: assigneeSelect?.value || null,
            iteration: iterationSelect?.value ? this.data.iterations.find(i => i.id === iterationSelect.value)?.name : null,
            dueDate: dueDateInput?.value || null
        };
        
        const newIssue = this.createIssue(issueData);
        
        // Close modal and reset form
        modal.classList.remove('active');
        if (titleInput) titleInput.value = '';
        
        if (typeof showToast === 'function') {
            showToast(`事项 ${newIssue.id} 创建成功`, 'success');
        }
    }
    
    // Helper methods
    getTypeName(type) {
        const types = { requirement: '需求', task: '任务', bug: '缺陷' };
        return types[type] || type;
    }
    
    getStatusName(status) {
        const statuses = { pending: '待处理', processing: '进行中', testing: '测试中', completed: '已完成' };
        return statuses[status] || status;
    }
    
    getPriorityName(priority) {
        const priorities = { high: '高', medium: '中', low: '低' };
        return priorities[priority] || priority;
    }
    
    isOverdue(dateStr) {
        if (!dateStr) return false;
        const date = new Date(dateStr);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date < today;
    }
    
    isUrgent(dateStr) {
        if (!dateStr) return false;
        const date = new Date(dateStr);
        const today = new Date();
        const threeDaysLater = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);
        return date >= today && date <= threeDaysLater;
    }
}

// Initialize module when DOM is ready
let issuesModule;
document.addEventListener('DOMContentLoaded', function() {
    issuesModule = new IssuesModule();
});

// Export for global access
window.issuesModule = issuesModule;