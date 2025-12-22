/**
 * Kanban Module - 看板模块
 * Handles kanban board functionality including:
 * - Data loading and rendering
 * - Card drag and drop (within column and cross-column)
 * - Quick create card
 * - Card detail popup
 * - Swimlane switching
 * - Column customization
 * - WIP limits
 */

// Kanban Data
const KanbanData = {
    // Current filters
    filters: {
        project: 'frontend',
        iteration: 'sprint-12',
        type: 'all',
        assignee: 'all',
        search: ''
    },
    
    // Current swimlane mode
    swimlaneMode: 'none', // 'none', 'assignee', 'type'
    
    // Column configuration
    columns: [
        { id: 'pending', name: '待处理', color: '#6b7280', wipLimit: 0, order: 1 },
        { id: 'processing', name: '进行中', color: '#2b7de9', wipLimit: 5, order: 2 },
        { id: 'testing', name: '测试中', color: '#f59e0b', wipLimit: 3, order: 3 },
        { id: 'completed', name: '已完成', color: '#10b981', wipLimit: 0, order: 4 }
    ],
    
    // Projects
    projects: [
        { id: 'frontend', name: '前端项目' },
        { id: 'backend', name: '后端服务' },
        { id: 'mobile', name: '移动端App' }
    ],
    
    // Iterations
    iterations: [
        { id: 'sprint-12', name: 'Sprint 12', status: 'active' },
        { id: 'sprint-13', name: 'Sprint 13', status: 'planned' },
        { id: 'sprint-14', name: 'Sprint 14', status: 'planned' }
    ],
    
    // Team members
    members: [
        { id: 1, name: '张三', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1' },
        { id: 2, name: '李四', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2' },
        { id: 3, name: '王五', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3' },
        { id: 4, name: '赵六', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=4' },
        { id: 5, name: '钱七', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=5' },
        { id: 6, name: '孙八', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=6' }
    ],
    
    // Cards data
    cards: [
        {
            id: 1024,
            title: '新增数据导出功能',
            description: '支持将报表数据导出为Excel、CSV、PDF等格式',
            type: 'requirement',
            status: 'pending',
            priority: 'high',
            storyPoints: 5,
            assigneeId: 1,
            dueDate: '2024-01-15',
            tags: ['功能', '报表'],
            subtasks: { completed: 0, total: 0 },
            order: 1
        },
        {
            id: 1025,
            title: '优化首页加载性能',
            description: '减少首页加载时间，优化资源加载顺序',
            type: 'task',
            status: 'pending',
            priority: 'medium',
            storyPoints: 3,
            assigneeId: 2,
            dueDate: '2024-01-20',
            tags: ['性能'],
            subtasks: { completed: 0, total: 0 },
            order: 2
        },
        {
            id: 1026,
            title: '修复表格排序功能异常',
            description: '表格点击排序后数据显示不正确',
            type: 'bug',
            status: 'pending',
            priority: 'high',
            storyPoints: 2,
            assigneeId: 3,
            dueDate: null,
            tags: ['缺陷'],
            subtasks: { completed: 0, total: 0 },
            order: 3
        },
        {
            id: 1020,
            title: '用户登录功能优化',
            description: '优化登录流程，增加记住密码和自动登录功能',
            type: 'requirement',
            status: 'processing',
            priority: 'high',
            storyPoints: 8,
            assigneeId: 2,
            dueDate: '2024-01-18',
            tags: ['功能', '用户体验'],
            subtasks: { completed: 3, total: 5 },
            order: 1
        },
        {
            id: 1022,
            title: '编写API接口文档',
            description: '完善所有API接口的文档说明',
            type: 'task',
            status: 'processing',
            priority: 'medium',
            storyPoints: 3,
            assigneeId: 3,
            dueDate: '2024-01-22',
            tags: ['文档'],
            subtasks: { completed: 0, total: 0 },
            order: 2
        },
        {
            id: 1023,
            title: '登录页面在Safari浏览器显示异常',
            description: 'Safari浏览器下登录按钮样式错乱',
            type: 'bug',
            status: 'processing',
            priority: 'high',
            storyPoints: 2,
            assigneeId: 4,
            dueDate: '2024-01-16',
            tags: ['兼容性'],
            subtasks: { completed: 0, total: 0 },
            order: 3
        },
        {
            id: 1027,
            title: '实现用户头像上传功能',
            description: '支持用户上传和裁剪头像',
            type: 'task',
            status: 'processing',
            priority: 'low',
            storyPoints: 3,
            assigneeId: 5,
            dueDate: '2024-01-25',
            tags: ['功能'],
            subtasks: { completed: 0, total: 0 },
            order: 4
        },
        {
            id: 1018,
            title: '实现登录表单验证',
            description: '添加前端表单验证逻辑',
            type: 'task',
            status: 'testing',
            priority: 'medium',
            storyPoints: 3,
            assigneeId: 2,
            dueDate: '2024-01-17',
            tags: ['功能'],
            subtasks: { completed: 0, total: 0 },
            order: 1
        },
        {
            id: 1019,
            title: '添加记住密码功能',
            description: '实现记住密码的本地存储',
            type: 'task',
            status: 'testing',
            priority: 'low',
            storyPoints: 2,
            assigneeId: 3,
            dueDate: '2024-01-19',
            tags: ['功能'],
            subtasks: { completed: 0, total: 0 },
            order: 2
        },
        {
            id: 1015,
            title: '设计登录页面UI',
            description: '完成登录页面的UI设计稿',
            type: 'task',
            status: 'completed',
            priority: 'medium',
            storyPoints: 3,
            assigneeId: 5,
            dueDate: '2024-01-10',
            tags: ['设计'],
            subtasks: { completed: 0, total: 0 },
            order: 1
        },
        {
            id: 1016,
            title: '实现登录API接口',
            description: '后端登录接口开发',
            type: 'task',
            status: 'completed',
            priority: 'high',
            storyPoints: 5,
            assigneeId: 6,
            dueDate: '2024-01-12',
            tags: ['后端'],
            subtasks: { completed: 0, total: 0 },
            order: 2
        },
        {
            id: 1017,
            title: '集成第三方登录',
            description: '支持微信、QQ等第三方登录',
            type: 'task',
            status: 'completed',
            priority: 'medium',
            storyPoints: 5,
            assigneeId: 2,
            dueDate: '2024-01-14',
            tags: ['功能', '第三方'],
            subtasks: { completed: 0, total: 0 },
            order: 3
        }
    ]
};

// Kanban Module Class
class KanbanModule {
    constructor() {
        this.draggedCard = null;
        this.dragPlaceholder = null;
        this.init();
    }
    
    init() {
        this.loadKanbanData();
        this.initDragAndDrop();
        this.initFilters();
        this.initSwimlanes();
        this.initSearch();
        this.initQuickCreate();
        this.initColumnSettings();
        this.updateWipIndicators();
    }
    
    // Load and render kanban data
    loadKanbanData() {
        this.renderKanban();
        this.updateColumnCounts();
    }
    
    // Render the entire kanban board
    renderKanban() {
        const swimlaneMode = KanbanData.swimlaneMode;
        
        if (swimlaneMode === 'none') {
            this.renderStandardKanban();
        } else if (swimlaneMode === 'assignee') {
            this.renderSwimlanesByAssignee();
        } else if (swimlaneMode === 'type') {
            this.renderSwimlanesByType();
        }
    }
    
    // Render standard kanban (no swimlanes)
    renderStandardKanban() {
        const kanbanBoard = document.querySelector('.kanban-board');
        if (!kanbanBoard) return;
        
        // Clear existing swimlane structure if any
        kanbanBoard.classList.remove('swimlane-mode');
        
        // Render each column
        KanbanData.columns.forEach(column => {
            const columnBody = document.querySelector(`.kanban-column-body[data-status="${column.id}"]`);
            if (columnBody) {
                this.renderColumnCards(columnBody, column.id);
            }
        });
    }
    
    // Render cards in a column
    renderColumnCards(columnBody, status) {
        const cards = this.getFilteredCards().filter(card => card.status === status);
        cards.sort((a, b) => a.order - b.order);
        
        // Keep quick add button
        const quickAddBtn = columnBody.querySelector('.quick-add-card');
        
        // Clear existing cards
        columnBody.querySelectorAll('.kanban-card').forEach(card => card.remove());
        
        // Render cards
        cards.forEach(card => {
            const cardEl = this.createCardElement(card);
            if (quickAddBtn) {
                columnBody.insertBefore(cardEl, quickAddBtn);
            } else {
                columnBody.appendChild(cardEl);
            }
        });
    }
    
    // Get filtered cards based on current filters
    getFilteredCards() {
        return KanbanData.cards.filter(card => {
            // Type filter
            if (KanbanData.filters.type !== 'all' && card.type !== KanbanData.filters.type) {
                return false;
            }
            
            // Assignee filter
            if (KanbanData.filters.assignee !== 'all' && card.assigneeId !== parseInt(KanbanData.filters.assignee)) {
                return false;
            }
            
            // Search filter
            if (KanbanData.filters.search) {
                const query = KanbanData.filters.search.toLowerCase();
                const matchTitle = card.title.toLowerCase().includes(query);
                const matchId = `#${card.id}`.includes(query);
                if (!matchTitle && !matchId) {
                    return false;
                }
            }
            
            return true;
        });
    }
    
    // Create card element
    createCardElement(card) {
        const member = KanbanData.members.find(m => m.id === card.assigneeId);
        const isOverdue = card.dueDate && new Date(card.dueDate) < new Date();
        const isCompleted = card.status === 'completed';
        
        const cardEl = document.createElement('div');
        cardEl.className = `kanban-card${isCompleted ? ' completed' : ''}`;
        cardEl.draggable = true;
        cardEl.dataset.id = card.id;
        
        cardEl.innerHTML = `
            <div class="card-header">
                <span class="issue-type-icon ${card.type}">
                    ${this.getTypeIcon(card.type)}
                </span>
                <span class="issue-id">#${card.id}</span>
                ${isCompleted ? `
                    <span class="completed-check">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="20 6 9 17 4 12"/>
                        </svg>
                    </span>
                ` : `
                    <div class="card-actions">
                        <button class="card-action-btn" onclick="KanbanModule.openCardMenu(event, ${card.id})">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="1"/>
                                <circle cx="19" cy="12" r="1"/>
                                <circle cx="5" cy="12" r="1"/>
                            </svg>
                        </button>
                    </div>
                `}
            </div>
            <a href="issue-detail.html?id=${card.id}" class="card-title" onclick="KanbanModule.openCardDetail(event, ${card.id})">${card.title}</a>
            ${card.description ? `<p class="card-description">${card.description}</p>` : ''}
            ${card.tags && card.tags.length > 0 ? `
                <div class="card-tags">
                    ${card.tags.map(tag => `<span class="card-tag">${tag}</span>`).join('')}
                </div>
            ` : ''}
            ${card.subtasks.total > 0 ? `
                <div class="card-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${(card.subtasks.completed / card.subtasks.total) * 100}%"></div>
                    </div>
                    <span class="progress-text">${card.subtasks.completed}/${card.subtasks.total} 子任务</span>
                </div>
            ` : ''}
            <div class="card-meta">
                ${!isCompleted ? `<span class="priority-badge ${card.priority}">${this.getPriorityText(card.priority)}</span>` : ''}
                <span class="story-points">${card.storyPoints} SP</span>
            </div>
            <div class="card-footer">
                ${card.dueDate ? `
                    <div class="card-due-date${isOverdue && !isCompleted ? ' overdue' : ''}">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                            <line x1="16" y1="2" x2="16" y2="6"/>
                            <line x1="8" y1="2" x2="8" y2="6"/>
                            <line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                        ${this.formatDate(card.dueDate)}
                    </div>
                ` : '<div></div>'}
                ${member ? `
                    <img src="${member.avatar}" alt="${member.name}" class="assignee-avatar" title="${member.name}">
                ` : ''}
            </div>
        `;
        
        // Add drag event listeners
        this.addCardDragListeners(cardEl);
        
        return cardEl;
    }
    
    // Get type icon SVG
    getTypeIcon(type) {
        const icons = {
            requirement: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>`,
            task: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>`,
            bug: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>`
        };
        return icons[type] || icons.task;
    }
    
    // Get priority text
    getPriorityText(priority) {
        const texts = { high: '高', medium: '中', low: '低' };
        return texts[priority] || priority;
    }
    
    // Format date
    formatDate(dateStr) {
        const date = new Date(dateStr);
        return `${date.getMonth() + 1}月${date.getDate()}日`;
    }
    
    // Initialize drag and drop
    initDragAndDrop() {
        // Add listeners to existing cards
        document.querySelectorAll('.kanban-card').forEach(card => {
            this.addCardDragListeners(card);
        });
        
        // Add listeners to columns
        document.querySelectorAll('.kanban-column-body').forEach(column => {
            this.addColumnDropListeners(column);
        });
    }
    
    // Add drag listeners to a card
    addCardDragListeners(card) {
        card.addEventListener('dragstart', (e) => {
            this.draggedCard = card;
            card.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
            
            // Create placeholder
            this.dragPlaceholder = document.createElement('div');
            this.dragPlaceholder.className = 'drag-placeholder';
            this.dragPlaceholder.style.height = card.offsetHeight + 'px';
        });
        
        card.addEventListener('dragend', () => {
            card.classList.remove('dragging');
            this.draggedCard = null;
            
            if (this.dragPlaceholder && this.dragPlaceholder.parentNode) {
                this.dragPlaceholder.parentNode.removeChild(this.dragPlaceholder);
            }
            this.dragPlaceholder = null;
            
            document.querySelectorAll('.kanban-column-body').forEach(col => {
                col.classList.remove('drag-over');
            });
        });
    }
    
    // Add drop listeners to a column
    addColumnDropListeners(column) {
        column.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            column.classList.add('drag-over');
            
            if (this.dragPlaceholder && this.draggedCard) {
                const afterElement = this.getDragAfterElement(column, e.clientY);
                if (afterElement == null) {
                    const quickAddBtn = column.querySelector('.quick-add-card');
                    if (quickAddBtn) {
                        column.insertBefore(this.dragPlaceholder, quickAddBtn);
                    } else {
                        column.appendChild(this.dragPlaceholder);
                    }
                } else {
                    column.insertBefore(this.dragPlaceholder, afterElement);
                }
            }
        });
        
        column.addEventListener('dragleave', (e) => {
            if (!column.contains(e.relatedTarget)) {
                column.classList.remove('drag-over');
            }
        });
        
        column.addEventListener('drop', (e) => {
            e.preventDefault();
            column.classList.remove('drag-over');
            
            if (this.draggedCard) {
                const cardId = parseInt(this.draggedCard.dataset.id);
                const newStatus = column.dataset.status;
                const oldStatus = this.getCardStatus(cardId);
                
                // Check WIP limit
                if (!this.checkWipLimit(newStatus, cardId)) {
                    this.showToast('已达到WIP限制，无法添加更多卡片', 'warning');
                    return;
                }
                
                // Insert card at placeholder position
                if (this.dragPlaceholder && this.dragPlaceholder.parentNode === column) {
                    column.insertBefore(this.draggedCard, this.dragPlaceholder);
                } else {
                    const quickAddBtn = column.querySelector('.quick-add-card');
                    if (quickAddBtn) {
                        column.insertBefore(this.draggedCard, quickAddBtn);
                    } else {
                        column.appendChild(this.draggedCard);
                    }
                }
                
                // Update card data
                this.updateCardStatus(cardId, newStatus);
                this.updateCardOrder(column);
                
                // Update UI
                this.updateColumnCounts();
                this.updateWipIndicators();
                
                // Show notification
                if (oldStatus !== newStatus) {
                    const columnName = KanbanData.columns.find(c => c.id === newStatus)?.name || newStatus;
                    this.showToast(`事项已移动到 ${columnName}`);
                }
            }
        });
    }
    
    // Get element after which to insert during drag
    getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.kanban-card:not(.dragging)')];
        
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }
    
    // Get card status
    getCardStatus(cardId) {
        const card = KanbanData.cards.find(c => c.id === cardId);
        return card ? card.status : null;
    }
    
    // Update card status
    updateCardStatus(cardId, newStatus) {
        const card = KanbanData.cards.find(c => c.id === cardId);
        if (card) {
            card.status = newStatus;
        }
    }
    
    // Update card order in a column
    updateCardOrder(column) {
        const cards = column.querySelectorAll('.kanban-card');
        cards.forEach((cardEl, index) => {
            const cardId = parseInt(cardEl.dataset.id);
            const card = KanbanData.cards.find(c => c.id === cardId);
            if (card) {
                card.order = index + 1;
            }
        });
    }
    
    // Check WIP limit
    checkWipLimit(status, excludeCardId = null) {
        const column = KanbanData.columns.find(c => c.id === status);
        if (!column || column.wipLimit === 0) return true;
        
        const cardsInColumn = KanbanData.cards.filter(c => 
            c.status === status && c.id !== excludeCardId
        ).length;
        
        return cardsInColumn < column.wipLimit;
    }
    
    // Update WIP indicators
    updateWipIndicators() {
        KanbanData.columns.forEach(column => {
            const columnEl = document.querySelector(`.kanban-column[data-status="${column.id}"]`);
            if (!columnEl) return;
            
            const headerEl = columnEl.querySelector('.kanban-column-header');
            const cardsCount = KanbanData.cards.filter(c => c.status === column.id).length;
            
            // Remove existing WIP indicator
            const existingWip = headerEl.querySelector('.wip-indicator');
            if (existingWip) existingWip.remove();
            
            if (column.wipLimit > 0) {
                const wipIndicator = document.createElement('span');
                wipIndicator.className = 'wip-indicator';
                wipIndicator.textContent = `${cardsCount}/${column.wipLimit}`;
                
                if (cardsCount >= column.wipLimit) {
                    wipIndicator.classList.add('at-limit');
                } else if (cardsCount >= column.wipLimit * 0.8) {
                    wipIndicator.classList.add('near-limit');
                }
                
                const titleEl = headerEl.querySelector('.column-title');
                if (titleEl) {
                    titleEl.appendChild(wipIndicator);
                }
            }
        });
    }
    
    // Update column counts
    updateColumnCounts() {
        document.querySelectorAll('.kanban-column').forEach(column => {
            const status = column.dataset.status;
            const count = this.getFilteredCards().filter(c => c.status === status).length;
            const countEl = column.querySelector('.column-count');
            if (countEl) {
                countEl.textContent = count;
            }
        });
    }
    
    // Initialize filters
    initFilters() {
        // Type filter
        document.querySelectorAll('.filter-option[data-type]').forEach(option => {
            option.addEventListener('click', (e) => {
                e.preventDefault();
                KanbanData.filters.type = option.dataset.type;
                this.renderKanban();
                this.updateColumnCounts();
            });
        });
        
        // Assignee filter
        document.querySelectorAll('.filter-option[data-assignee]').forEach(option => {
            option.addEventListener('click', (e) => {
                e.preventDefault();
                KanbanData.filters.assignee = option.dataset.assignee;
                this.renderKanban();
                this.updateColumnCounts();
            });
        });
    }
    
    // Initialize swimlanes
    initSwimlanes() {
        document.querySelectorAll('.toggle-btn[data-swimlane]').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                KanbanData.swimlaneMode = btn.dataset.swimlane;
                this.renderKanban();
            });
        });
    }
    
    // Render swimlanes by assignee
    renderSwimlanesByAssignee() {
        const kanbanBoard = document.querySelector('.kanban-board');
        if (!kanbanBoard) return;
        
        kanbanBoard.classList.add('swimlane-mode');
        
        // Group cards by assignee
        const assigneeGroups = {};
        KanbanData.members.forEach(member => {
            assigneeGroups[member.id] = {
                member: member,
                cards: this.getFilteredCards().filter(c => c.assigneeId === member.id)
            };
        });
        
        // Add unassigned group
        assigneeGroups['unassigned'] = {
            member: { id: 'unassigned', name: '未分配', avatar: null },
            cards: this.getFilteredCards().filter(c => !c.assigneeId)
        };
        
        // Render swimlanes
        this.renderSwimlanes(assigneeGroups, 'assignee');
    }
    
    // Render swimlanes by type
    renderSwimlanesByType() {
        const kanbanBoard = document.querySelector('.kanban-board');
        if (!kanbanBoard) return;
        
        kanbanBoard.classList.add('swimlane-mode');
        
        const types = [
            { id: 'requirement', name: '需求' },
            { id: 'task', name: '任务' },
            { id: 'bug', name: '缺陷' }
        ];
        
        const typeGroups = {};
        types.forEach(type => {
            typeGroups[type.id] = {
                type: type,
                cards: this.getFilteredCards().filter(c => c.type === type.id)
            };
        });
        
        this.renderSwimlanes(typeGroups, 'type');
    }
    
    // Render swimlanes
    renderSwimlanes(groups, groupBy) {
        // For now, just filter cards in existing columns
        // A full swimlane implementation would restructure the DOM
        Object.values(groups).forEach(group => {
            if (group.cards.length > 0) {
                // Highlight cards belonging to this group
            }
        });
        
        // Simplified: just re-render with current structure
        this.renderStandardKanban();
    }
    
    // Initialize search
    initSearch() {
        const searchInput = document.querySelector('.kanban-search input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                KanbanData.filters.search = e.target.value;
                this.renderKanban();
                this.updateColumnCounts();
            });
        }
    }
    
    // Initialize quick create
    initQuickCreate() {
        document.querySelectorAll('.quick-add-card').forEach(btn => {
            btn.addEventListener('click', () => {
                const column = btn.closest('.kanban-column-body');
                const status = column?.dataset.status || 'pending';
                this.openQuickCreateModal(status);
            });
        });
        
        // Column header add buttons
        document.querySelectorAll('.column-action-btn[title="添加事项"]').forEach(btn => {
            btn.addEventListener('click', () => {
                const column = btn.closest('.kanban-column');
                const status = column?.dataset.status || 'pending';
                this.openQuickCreateModal(status);
            });
        });
    }
    
    // Open quick create modal
    openQuickCreateModal(status) {
        const modal = document.getElementById('createIssueModal');
        if (modal) {
            modal.classList.add('active');
            // Pre-select status if possible
        }
    }
    
    // Initialize column settings
    initColumnSettings() {
        // Column settings button
        document.querySelectorAll('.column-action-btn[title="更多"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const column = btn.closest('.kanban-column');
                const status = column?.dataset.status;
                this.openColumnSettingsMenu(btn, status);
            });
        });
    }
    
    // Open column settings menu
    openColumnSettingsMenu(btn, status) {
        // Remove existing menu
        const existingMenu = document.querySelector('.column-settings-menu');
        if (existingMenu) existingMenu.remove();
        
        const column = KanbanData.columns.find(c => c.id === status);
        if (!column) return;
        
        const menu = document.createElement('div');
        menu.className = 'column-settings-menu';
        menu.innerHTML = `
            <div class="menu-item" onclick="kanbanModule.setWipLimit('${status}')">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="16"/>
                    <line x1="8" y1="12" x2="16" y2="12"/>
                </svg>
                设置WIP限制 ${column.wipLimit > 0 ? `(当前: ${column.wipLimit})` : ''}
            </div>
            <div class="menu-item" onclick="kanbanModule.renameColumn('${status}')">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                重命名列
            </div>
            <div class="menu-item" onclick="kanbanModule.changeColumnColor('${status}')">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                </svg>
                更改颜色
            </div>
            <div class="menu-divider"></div>
            <div class="menu-item text-danger" onclick="kanbanModule.clearColumn('${status}')">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
                清空列
            </div>
        `;
        
        // Position menu
        const rect = btn.getBoundingClientRect();
        menu.style.position = 'fixed';
        menu.style.top = (rect.bottom + 4) + 'px';
        menu.style.left = (rect.left - 150) + 'px';
        
        document.body.appendChild(menu);
        
        // Close on click outside
        setTimeout(() => {
            document.addEventListener('click', function closeMenu(e) {
                if (!menu.contains(e.target)) {
                    menu.remove();
                    document.removeEventListener('click', closeMenu);
                }
            });
        }, 0);
    }
    
    // Set WIP limit
    setWipLimit(status) {
        const column = KanbanData.columns.find(c => c.id === status);
        if (!column) return;
        
        const limit = prompt(`设置 "${column.name}" 的WIP限制 (0表示无限制):`, column.wipLimit);
        if (limit !== null) {
            const newLimit = parseInt(limit) || 0;
            column.wipLimit = newLimit;
            this.updateWipIndicators();
            this.showToast(`WIP限制已设置为 ${newLimit === 0 ? '无限制' : newLimit}`);
        }
        
        // Close menu
        document.querySelector('.column-settings-menu')?.remove();
    }
    
    // Rename column
    renameColumn(status) {
        const column = KanbanData.columns.find(c => c.id === status);
        if (!column) return;
        
        const newName = prompt('输入新的列名:', column.name);
        if (newName && newName.trim()) {
            column.name = newName.trim();
            
            // Update UI
            const columnEl = document.querySelector(`.kanban-column[data-status="${status}"]`);
            const titleSpan = columnEl?.querySelector('.column-title > span:not(.column-status-dot):not(.column-count)');
            if (titleSpan) {
                titleSpan.textContent = newName.trim();
            }
            
            this.showToast('列名已更新');
        }
        
        document.querySelector('.column-settings-menu')?.remove();
    }
    
    // Change column color
    changeColumnColor(status) {
        const colors = ['#6b7280', '#2b7de9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
        const column = KanbanData.columns.find(c => c.id === status);
        if (!column) return;
        
        // Simple color picker
        const currentIndex = colors.indexOf(column.color);
        const nextIndex = (currentIndex + 1) % colors.length;
        column.color = colors[nextIndex];
        
        // Update UI
        const columnEl = document.querySelector(`.kanban-column[data-status="${status}"]`);
        const dot = columnEl?.querySelector('.column-status-dot');
        if (dot) {
            dot.style.background = column.color;
        }
        
        this.showToast('列颜色已更新');
        document.querySelector('.column-settings-menu')?.remove();
    }
    
    // Clear column
    clearColumn(status) {
        const column = KanbanData.columns.find(c => c.id === status);
        if (!column) return;
        
        if (confirm(`确定要清空 "${column.name}" 列中的所有卡片吗？`)) {
            // Move cards to backlog or delete
            KanbanData.cards = KanbanData.cards.filter(c => c.status !== status);
            this.renderKanban();
            this.updateColumnCounts();
            this.showToast('列已清空');
        }
        
        document.querySelector('.column-settings-menu')?.remove();
    }
    
    // Show toast notification
    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast-notification ${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 24px;
            left: 50%;
            transform: translateX(-50%);
            background: ${type === 'warning' ? '#f59e0b' : '#333'};
            color: #fff;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 14px;
            z-index: 3000;
            animation: fadeInUp 0.3s ease;
        `;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'fadeOutDown 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }
    
    // Static methods for global access
    static openCardDetail(e, cardId) {
        e.preventDefault();
        e.stopPropagation();
        
        const card = KanbanData.cards.find(c => c.id === cardId);
        if (!card) return;
        
        // Open card detail modal
        kanbanModule.showCardDetailModal(card);
    }
    
    static openCardMenu(e, cardId) {
        e.preventDefault();
        e.stopPropagation();
        
        kanbanModule.showCardContextMenu(e, cardId);
    }
    
    // Show card detail modal
    showCardDetailModal(card) {
        const member = KanbanData.members.find(m => m.id === card.assigneeId);
        const column = KanbanData.columns.find(c => c.id === card.status);
        
        // Create modal
        const modal = document.createElement('div');
        modal.className = 'card-detail-modal-overlay';
        modal.innerHTML = `
            <div class="card-detail-modal">
                <div class="card-detail-header">
                    <div class="card-detail-type">
                        <span class="issue-type-icon ${card.type}">
                            ${this.getTypeIcon(card.type)}
                        </span>
                        <span class="issue-id">#${card.id}</span>
                    </div>
                    <button class="modal-close" onclick="this.closest('.card-detail-modal-overlay').remove()">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>
                <div class="card-detail-body">
                    <h2 class="card-detail-title">${card.title}</h2>
                    ${card.description ? `<p class="card-detail-description">${card.description}</p>` : ''}
                    
                    <div class="card-detail-meta">
                        <div class="meta-item">
                            <span class="meta-label">状态</span>
                            <span class="status-badge ${card.status}">${column?.name || card.status}</span>
                        </div>
                        <div class="meta-item">
                            <span class="meta-label">优先级</span>
                            <span class="priority-badge ${card.priority}">${this.getPriorityText(card.priority)}</span>
                        </div>
                        <div class="meta-item">
                            <span class="meta-label">故事点</span>
                            <span>${card.storyPoints} SP</span>
                        </div>
                        <div class="meta-item">
                            <span class="meta-label">负责人</span>
                            ${member ? `
                                <div class="assignee-info">
                                    <img src="${member.avatar}" alt="${member.name}" class="assignee-avatar">
                                    <span>${member.name}</span>
                                </div>
                            ` : '<span class="text-secondary">未分配</span>'}
                        </div>
                        ${card.dueDate ? `
                            <div class="meta-item">
                                <span class="meta-label">截止日期</span>
                                <span>${card.dueDate}</span>
                            </div>
                        ` : ''}
                    </div>
                    
                    ${card.tags && card.tags.length > 0 ? `
                        <div class="card-detail-tags">
                            <span class="meta-label">标签</span>
                            <div class="tags-list">
                                ${card.tags.map(tag => `<span class="card-tag">${tag}</span>`).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
                <div class="card-detail-footer">
                    <a href="issue-detail.html?id=${card.id}" class="btn btn-primary">查看详情</a>
                    <button class="btn btn-secondary" onclick="this.closest('.card-detail-modal-overlay').remove()">关闭</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Close on overlay click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
        // Close on Escape
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                modal.remove();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
    }
    
    // Show card context menu
    showCardContextMenu(e, cardId) {
        // Remove existing menu
        document.querySelector('.card-context-menu')?.remove();
        
        const card = KanbanData.cards.find(c => c.id === cardId);
        if (!card) return;
        
        const menu = document.createElement('div');
        menu.className = 'card-context-menu';
        menu.innerHTML = `
            <div class="menu-item" onclick="kanbanModule.editCard(${cardId})">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                编辑
            </div>
            <div class="menu-item" onclick="kanbanModule.copyCard(${cardId})">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
                复制
            </div>
            <div class="menu-divider"></div>
            <div class="menu-submenu">
                <div class="menu-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="9 18 15 12 9 6"/>
                    </svg>
                    移动到
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-left: auto;">
                        <polyline points="9 18 15 12 9 6"/>
                    </svg>
                </div>
                <div class="submenu">
                    ${KanbanData.columns.filter(c => c.id !== card.status).map(col => `
                        <div class="menu-item" onclick="kanbanModule.moveCard(${cardId}, '${col.id}')">${col.name}</div>
                    `).join('')}
                </div>
            </div>
            <div class="menu-divider"></div>
            <div class="menu-item text-danger" onclick="kanbanModule.deleteCard(${cardId})">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
                删除
            </div>
        `;
        
        // Position menu
        menu.style.position = 'fixed';
        menu.style.top = e.clientY + 'px';
        menu.style.left = e.clientX + 'px';
        
        document.body.appendChild(menu);
        
        // Adjust position if off screen
        const rect = menu.getBoundingClientRect();
        if (rect.right > window.innerWidth) {
            menu.style.left = (window.innerWidth - rect.width - 10) + 'px';
        }
        if (rect.bottom > window.innerHeight) {
            menu.style.top = (window.innerHeight - rect.height - 10) + 'px';
        }
        
        // Close on click outside
        setTimeout(() => {
            document.addEventListener('click', function closeMenu(e) {
                if (!menu.contains(e.target)) {
                    menu.remove();
                    document.removeEventListener('click', closeMenu);
                }
            });
        }, 0);
    }
    
    // Edit card
    editCard(cardId) {
        document.querySelector('.card-context-menu')?.remove();
        window.location.href = `issue-detail.html?id=${cardId}&edit=true`;
    }
    
    // Copy card
    copyCard(cardId) {
        document.querySelector('.card-context-menu')?.remove();
        const card = KanbanData.cards.find(c => c.id === cardId);
        if (!card) return;
        
        const newCard = {
            ...card,
            id: Math.max(...KanbanData.cards.map(c => c.id)) + 1,
            title: card.title + ' (副本)',
            order: KanbanData.cards.filter(c => c.status === card.status).length + 1
        };
        
        KanbanData.cards.push(newCard);
        this.renderKanban();
        this.updateColumnCounts();
        this.showToast('卡片已复制');
    }
    
    // Move card to column
    moveCard(cardId, newStatus) {
        document.querySelector('.card-context-menu')?.remove();
        
        if (!this.checkWipLimit(newStatus, cardId)) {
            this.showToast('已达到WIP限制，无法移动', 'warning');
            return;
        }
        
        const card = KanbanData.cards.find(c => c.id === cardId);
        if (card) {
            card.status = newStatus;
            card.order = KanbanData.cards.filter(c => c.status === newStatus).length;
            this.renderKanban();
            this.updateColumnCounts();
            this.updateWipIndicators();
            
            const columnName = KanbanData.columns.find(c => c.id === newStatus)?.name;
            this.showToast(`已移动到 ${columnName}`);
        }
    }
    
    // Delete card
    deleteCard(cardId) {
        document.querySelector('.card-context-menu')?.remove();
        
        if (confirm('确定要删除这个卡片吗？')) {
            KanbanData.cards = KanbanData.cards.filter(c => c.id !== cardId);
            this.renderKanban();
            this.updateColumnCounts();
            this.showToast('卡片已删除');
        }
    }
}

// Initialize kanban module
let kanbanModule;
document.addEventListener('DOMContentLoaded', () => {
    kanbanModule = new KanbanModule();
    window.kanbanModule = kanbanModule;
});

// Add styles for new components
const kanbanStyles = document.createElement('style');
kanbanStyles.textContent = `
    /* WIP Indicator */
    .wip-indicator {
        margin-left: 8px;
        padding: 2px 6px;
        background: var(--bg-light);
        border-radius: 4px;
        font-size: 11px;
        font-weight: 500;
        color: var(--text-secondary);
    }
    
    .wip-indicator.near-limit {
        background: rgba(245, 158, 11, 0.1);
        color: #f59e0b;
    }
    
    .wip-indicator.at-limit {
        background: rgba(239, 68, 68, 0.1);
        color: #ef4444;
    }
    
    /* Column Settings Menu */
    .column-settings-menu {
        min-width: 180px;
        background: #fff;
        border: 1px solid var(--border-light);
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-lg);
        z-index: 1000;
        overflow: hidden;
    }
    
    .column-settings-menu .menu-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 14px;
        font-size: 13px;
        color: var(--text-primary);
        cursor: pointer;
        transition: background 0.15s ease;
    }
    
    .column-settings-menu .menu-item:hover {
        background: var(--bg-light);
    }
    
    .column-settings-menu .menu-item.text-danger {
        color: var(--error-color);
    }
    
    .column-settings-menu .menu-divider {
        height: 1px;
        background: var(--border-light);
        margin: 4px 0;
    }
    
    /* Card Context Menu */
    .card-context-menu {
        min-width: 160px;
        background: #fff;
        border: 1px solid var(--border-light);
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-lg);
        z-index: 1000;
        overflow: hidden;
    }
    
    .card-context-menu .menu-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 14px;
        font-size: 13px;
        color: var(--text-primary);
        cursor: pointer;
        transition: background 0.15s ease;
    }
    
    .card-context-menu .menu-item:hover {
        background: var(--bg-light);
    }
    
    .card-context-menu .menu-item.text-danger {
        color: var(--error-color);
    }
    
    .card-context-menu .menu-divider {
        height: 1px;
        background: var(--border-light);
        margin: 4px 0;
    }
    
    .card-context-menu .menu-submenu {
        position: relative;
    }
    
    .card-context-menu .submenu {
        display: none;
        position: absolute;
        left: 100%;
        top: 0;
        min-width: 120px;
        background: #fff;
        border: 1px solid var(--border-light);
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-lg);
    }
    
    .card-context-menu .menu-submenu:hover .submenu {
        display: block;
    }
    
    /* Card Detail Modal */
    .card-detail-modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
    }
    
    .card-detail-modal {
        background: #fff;
        border-radius: var(--radius-lg);
        width: 100%;
        max-width: 600px;
        max-height: 80vh;
        overflow: hidden;
        display: flex;
        flex-direction: column;
    }
    
    .card-detail-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 20px;
        border-bottom: 1px solid var(--border-light);
    }
    
    .card-detail-type {
        display: flex;
        align-items: center;
        gap: 8px;
    }
    
    .card-detail-body {
        flex: 1;
        overflow-y: auto;
        padding: 20px;
    }
    
    .card-detail-title {
        font-size: 20px;
        font-weight: 600;
        color: var(--text-primary);
        margin: 0 0 12px 0;
    }
    
    .card-detail-description {
        font-size: 14px;
        color: var(--text-secondary);
        line-height: 1.6;
        margin: 0 0 20px 0;
    }
    
    .card-detail-meta {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 16px;
        margin-bottom: 20px;
    }
    
    .card-detail-meta .meta-item {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }
    
    .card-detail-meta .meta-label {
        font-size: 12px;
        color: var(--text-secondary);
    }
    
    .card-detail-meta .assignee-info {
        display: flex;
        align-items: center;
        gap: 8px;
    }
    
    .card-detail-meta .assignee-avatar {
        width: 24px;
        height: 24px;
        border-radius: 50%;
    }
    
    .card-detail-meta .status-badge {
        display: inline-block;
        padding: 4px 10px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 500;
    }
    
    .card-detail-meta .status-badge.pending {
        background: rgba(107, 114, 128, 0.1);
        color: #6b7280;
    }
    
    .card-detail-meta .status-badge.processing {
        background: rgba(43, 125, 233, 0.1);
        color: #2b7de9;
    }
    
    .card-detail-meta .status-badge.testing {
        background: rgba(245, 158, 11, 0.1);
        color: #f59e0b;
    }
    
    .card-detail-meta .status-badge.completed {
        background: rgba(16, 185, 129, 0.1);
        color: #10b981;
    }
    
    .card-detail-tags {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
    
    .card-detail-tags .tags-list {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
    }
    
    .card-detail-footer {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        padding: 16px 20px;
        border-top: 1px solid var(--border-light);
    }
    
    /* Drag placeholder */
    .drag-placeholder {
        background: rgba(43, 125, 233, 0.1);
        border: 2px dashed var(--primary-color);
        border-radius: var(--radius-md);
        margin-bottom: 12px;
    }
    
    /* Swimlane mode */
    .kanban-board.swimlane-mode {
        flex-direction: column;
    }
`;
document.head.appendChild(kanbanStyles);