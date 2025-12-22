/**
 * Backlog Module - 需求池模块
 * Handles backlog functionality including:
 * - Data loading and rendering
 * - Requirement drag sorting
 * - Drag to iteration
 * - Batch planning
 * - Priority adjustment
 * - Filtering
 * - Story point estimation
 */

// Backlog Data
const BacklogData = {
    // Current filters
    filters: {
        project: 'all',
        type: 'all',
        priority: 'all',
        search: ''
    },
    
    // Projects
    projects: [
        { id: 'frontend', name: '前端项目' },
        { id: 'backend', name: '后端项目' },
        { id: 'mobile', name: '移动端项目' }
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
    
    // Iterations
    iterations: [
        { 
            id: 12, 
            name: 'Sprint 12', 
            status: 'active',
            startDate: '2024-01-08',
            endDate: '2024-01-21',
            items: 12,
            points: 26,
            progress: 65
        },
        { 
            id: 13, 
            name: 'Sprint 13', 
            status: 'upcoming',
            startDate: '2024-01-22',
            endDate: '2024-02-04',
            items: 6,
            points: 18,
            progress: 0
        },
        { 
            id: 14, 
            name: 'Sprint 14', 
            status: 'planned',
            startDate: '2024-02-05',
            endDate: '2024-02-18',
            items: 0,
            points: 0,
            progress: 0
        }
    ],
    
    // Backlog items
    items: [
        {
            id: 1030,
            title: '实现多语言国际化支持',
            description: '支持中文、英文、日文等多语言切换',
            type: 'requirement',
            priority: 'high',
            storyPoints: 8,
            project: 'frontend',
            assigneeId: 1,
            order: 1,
            iterationId: null
        },
        {
            id: 1031,
            title: '用户权限管理系统重构',
            description: '重构现有权限系统，支持更细粒度的权限控制',
            type: 'requirement',
            priority: 'high',
            storyPoints: 13,
            project: 'backend',
            assigneeId: 2,
            order: 2,
            iterationId: null
        },
        {
            id: 1032,
            title: '新增数据可视化仪表盘',
            description: '使用ECharts实现数据可视化仪表盘',
            type: 'requirement',
            priority: 'medium',
            storyPoints: 5,
            project: 'frontend',
            assigneeId: 3,
            order: 3,
            iterationId: null
        },
        {
            id: 1033,
            title: '优化数据库查询性能',
            description: '优化慢查询，添加索引，提升查询效率',
            type: 'task',
            priority: 'medium',
            storyPoints: 5,
            project: 'backend',
            assigneeId: 4,
            order: 4,
            iterationId: null
        },
        {
            id: 1034,
            title: '移动端响应式适配',
            description: '优化移动端显示效果，支持各种屏幕尺寸',
            type: 'requirement',
            priority: 'medium',
            storyPoints: 8,
            project: 'frontend',
            assigneeId: null,
            order: 5,
            iterationId: null
        },
        {
            id: 1035,
            title: '修复文件上传大小限制问题',
            description: '当前文件上传限制为10MB，需要支持更大文件',
            type: 'bug',
            priority: 'low',
            storyPoints: 2,
            project: 'backend',
            assigneeId: 5,
            order: 6,
            iterationId: null
        },
        {
            id: 1036,
            title: '编写技术文档',
            description: '为核心模块编写技术文档，提高代码可维护性',
            type: 'task',
            priority: 'low',
            storyPoints: 3,
            project: 'frontend',
            assigneeId: null,
            order: 7,
            iterationId: null
        }
    ],
    
    // Selected items for batch operations
    selectedItems: new Set()
};

// Backlog Module Class
class BacklogModule {
    constructor() {
        this.draggedItem = null;
        this.dragPlaceholder = null;
        this.init();
    }
    
    init() {
        this.loadBacklogData();
        this.initDragAndDrop();
        this.initFilters();
        this.initSearch();
        this.initBulkActions();
        this.initSprintCards();
        this.initStoryPointEstimation();
        this.initPriorityAdjustment();
    }
    
    // Load and render backlog data
    loadBacklogData() {
        this.renderBacklogList();
        this.updateStats();
        this.updateSprintStats();
    }
    
    // Render backlog list
    renderBacklogList() {
        const backlogList = document.getElementById('backlogList');
        if (!backlogList) return;
        
        const filteredItems = this.getFilteredItems();
        
        // Keep quick add button
        const quickAddItem = backlogList.querySelector('.quick-add-item');
        const dragPlaceholder = backlogList.querySelector('.drag-placeholder');
        
        // Clear existing items
        backlogList.querySelectorAll('.backlog-item').forEach(item => item.remove());
        
        // Render items
        filteredItems.forEach(item => {
            const itemEl = this.createBacklogItemElement(item);
            if (dragPlaceholder) {
                backlogList.insertBefore(itemEl, dragPlaceholder);
            } else if (quickAddItem) {
                backlogList.insertBefore(itemEl, quickAddItem);
            } else {
                backlogList.appendChild(itemEl);
            }
        });
        
        // Re-initialize drag and drop for new items
        this.initDragAndDrop();
    }
    
    // Get filtered items
    getFilteredItems() {
        return BacklogData.items
            .filter(item => item.iterationId === null) // Only show unplanned items
            .filter(item => {
                // Project filter
                if (BacklogData.filters.project !== 'all' && item.project !== BacklogData.filters.project) {
                    return false;
                }
                
                // Type filter
                if (BacklogData.filters.type !== 'all' && item.type !== BacklogData.filters.type) {
                    return false;
                }
                
                // Priority filter
                if (BacklogData.filters.priority !== 'all' && item.priority !== BacklogData.filters.priority) {
                    return false;
                }
                
                // Search filter
                if (BacklogData.filters.search) {
                    const query = BacklogData.filters.search.toLowerCase();
                    const matchTitle = item.title.toLowerCase().includes(query);
                    const matchId = `#${item.id}`.includes(query);
                    if (!matchTitle && !matchId) {
                        return false;
                    }
                }
                
                return true;
            })
            .sort((a, b) => a.order - b.order);
    }
    
    // Create backlog item element
    createBacklogItemElement(item) {
        const member = BacklogData.members.find(m => m.id === item.assigneeId);
        const project = BacklogData.projects.find(p => p.id === item.project);
        
        const itemEl = document.createElement('div');
        itemEl.className = 'backlog-item';
        itemEl.draggable = true;
        itemEl.dataset.id = item.id;
        itemEl.dataset.type = item.type;
        itemEl.dataset.priority = item.priority;
        itemEl.dataset.project = item.project;
        
        itemEl.innerHTML = `
            <div class="drag-handle">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="9" cy="5" r="1"/>
                    <circle cx="9" cy="12" r="1"/>
                    <circle cx="9" cy="19" r="1"/>
                    <circle cx="15" cy="5" r="1"/>
                    <circle cx="15" cy="12" r="1"/>
                    <circle cx="15" cy="19" r="1"/>
                </svg>
            </div>
            <div class="item-checkbox">
                <input type="checkbox" id="item-${item.id}" ${BacklogData.selectedItems.has(item.id) ? 'checked' : ''}>
            </div>
            <span class="issue-type-icon ${item.type}">
                ${this.getTypeIcon(item.type)}
            </span>
            <span class="item-id">#${item.id}</span>
            <a href="issue-detail.html?id=${item.id}" class="item-title">${item.title}</a>
            <span class="priority-badge ${item.priority}" onclick="backlogModule.openPriorityMenu(event, ${item.id})">${this.getPriorityText(item.priority)}</span>
            <span class="story-points" data-points="${item.storyPoints}" onclick="backlogModule.openStoryPointModal(${item.id})">${item.storyPoints} SP</span>
            <span class="item-project">${project?.name || item.project}</span>
            ${member ? `
                <img src="${member.avatar}" alt="${member.name}" class="assignee-avatar" title="${member.name}">
            ` : `
                <div class="unassigned-avatar" title="未分配" onclick="backlogModule.openAssigneeMenu(event, ${item.id})">?</div>
            `}
            <button class="item-menu-btn" onclick="backlogModule.openItemMenu(event, ${item.id})">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="1"/>
                    <circle cx="19" cy="12" r="1"/>
                    <circle cx="5" cy="12" r="1"/>
                </svg>
            </button>
        `;
        
        // Add checkbox event listener
        const checkbox = itemEl.querySelector('input[type="checkbox"]');
        checkbox.addEventListener('change', () => {
            if (checkbox.checked) {
                BacklogData.selectedItems.add(item.id);
            } else {
                BacklogData.selectedItems.delete(item.id);
            }
            this.updateBulkActionsBar();
        });
        
        return itemEl;
    }
    
    // Get type icon SVG
    getTypeIcon(type) {
        const icons = {
            requirement: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
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
    
    // Update stats
    updateStats() {
        const filteredItems = this.getFilteredItems();
        const totalPoints = filteredItems.reduce((sum, item) => sum + (item.storyPoints || 0), 0);
        
        const countEl = document.getElementById('backlogItemCount');
        const sectionCountEl = document.getElementById('sectionCount');
        const pointsEl = document.getElementById('totalStoryPoints');
        
        if (countEl) countEl.textContent = filteredItems.length;
        if (sectionCountEl) sectionCountEl.textContent = filteredItems.length;
        if (pointsEl) pointsEl.textContent = totalPoints;
    }
    
    // Update sprint stats
    updateSprintStats() {
        BacklogData.iterations.forEach(iteration => {
            const itemsEl = document.getElementById(`sprint${iteration.id}Items`);
            const pointsEl = document.getElementById(`sprint${iteration.id}Points`);
            
            if (itemsEl) itemsEl.textContent = iteration.items;
            if (pointsEl) pointsEl.textContent = iteration.points;
        });
    }
    
    // Initialize drag and drop
    initDragAndDrop() {
        const backlogList = document.getElementById('backlogList');
        if (!backlogList) return;
        
        // Add drag listeners to items
        document.querySelectorAll('.backlog-item').forEach(item => {
            item.addEventListener('dragstart', (e) => {
                this.draggedItem = item;
                item.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
                
                // Show placeholder
                const placeholder = document.getElementById('dragPlaceholder');
                if (placeholder) placeholder.classList.add('visible');
            });
            
            item.addEventListener('dragend', () => {
                item.classList.remove('dragging');
                this.draggedItem = null;
                
                const placeholder = document.getElementById('dragPlaceholder');
                if (placeholder) placeholder.classList.remove('visible');
                
                document.querySelectorAll('.sprint-drop-zone').forEach(zone => {
                    zone.classList.remove('drag-over');
                });
            });
        });
        
        // Backlog list reordering
        backlogList.addEventListener('dragover', (e) => {
            e.preventDefault();
            const afterElement = this.getDragAfterElement(backlogList, e.clientY);
            const draggable = document.querySelector('.dragging');
            
            if (draggable) {
                if (afterElement == null) {
                    const quickAdd = backlogList.querySelector('.quick-add-item');
                    if (quickAdd) {
                        backlogList.insertBefore(draggable, quickAdd);
                    } else {
                        backlogList.appendChild(draggable);
                    }
                } else {
                    backlogList.insertBefore(draggable, afterElement);
                }
            }
        });
        
        backlogList.addEventListener('drop', (e) => {
            e.preventDefault();
            if (this.draggedItem) {
                this.updateItemOrder();
                this.showToast('优先级已更新');
            }
        });
        
        // Sprint drop zones
        document.querySelectorAll('.sprint-drop-zone').forEach(zone => {
            zone.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                zone.classList.add('drag-over');
            });
            
            zone.addEventListener('dragleave', () => {
                zone.classList.remove('drag-over');
            });
            
            zone.addEventListener('drop', (e) => {
                e.preventDefault();
                zone.classList.remove('drag-over');
                
                if (this.draggedItem) {
                    const sprintId = parseInt(zone.dataset.sprint);
                    const itemId = parseInt(this.draggedItem.dataset.id);
                    this.moveItemToSprint(itemId, sprintId);
                }
            });
        });
    }
    
    // Get element after which to insert during drag
    getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.backlog-item:not(.dragging)')];
        
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
    
    // Update item order after drag
    updateItemOrder() {
        const items = document.querySelectorAll('.backlog-item');
        items.forEach((itemEl, index) => {
            const itemId = parseInt(itemEl.dataset.id);
            const item = BacklogData.items.find(i => i.id === itemId);
            if (item) {
                item.order = index + 1;
            }
        });
    }
    
    // Move item to sprint
    moveItemToSprint(itemId, sprintId) {
        const item = BacklogData.items.find(i => i.id === itemId);
        const iteration = BacklogData.iterations.find(i => i.id === sprintId);
        
        if (item && iteration) {
            item.iterationId = sprintId;
            iteration.items++;
            iteration.points += item.storyPoints || 0;
            
            this.renderBacklogList();
            this.updateStats();
            this.updateSprintStats();
            
            this.showToast(`已将 "${item.title}" 添加到 ${iteration.name}`);
        }
    }
    
    // Initialize filters
    initFilters() {
        // Filter menu items
        document.querySelectorAll('.filter-menu-item').forEach(menuItem => {
            menuItem.addEventListener('click', (e) => {
                const dropdown = menuItem.closest('.filter-dropdown');
                const filterType = this.getFilterType(dropdown);
                const value = this.getFilterValue(menuItem, filterType);
                
                // Update filter
                BacklogData.filters[filterType] = value;
                
                // Update active state
                dropdown.querySelectorAll('.filter-menu-item').forEach(item => {
                    item.classList.remove('active');
                });
                menuItem.classList.add('active');
                
                // Close dropdown
                dropdown.classList.remove('active');
                
                // Re-render
                this.renderBacklogList();
                this.updateStats();
            });
        });
    }
    
    // Get filter type from dropdown
    getFilterType(dropdown) {
        const dropdowns = document.querySelectorAll('.filter-dropdown');
        const index = Array.from(dropdowns).indexOf(dropdown);
        return ['project', 'type', 'priority'][index] || 'project';
    }
    
    // Get filter value from menu item
    getFilterValue(menuItem, filterType) {
        const text = menuItem.textContent.trim();
        
        if (text.includes('全部')) return 'all';
        
        const valueMap = {
            project: { '前端项目': 'frontend', '后端项目': 'backend', '移动端项目': 'mobile' },
            type: { '需求': 'requirement', '任务': 'task', '缺陷': 'bug' },
            priority: { '高': 'high', '中': 'medium', '低': 'low' }
        };
        
        return valueMap[filterType]?.[text] || 'all';
    }
    
    // Initialize search
    initSearch() {
        const searchInput = document.getElementById('backlogSearchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                BacklogData.filters.search = e.target.value;
                this.renderBacklogList();
                this.updateStats();
            });
        }
    }
    
    // Initialize bulk actions
    initBulkActions() {
        const clearBtn = document.getElementById('clearSelection');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                BacklogData.selectedItems.clear();
                document.querySelectorAll('.item-checkbox input').forEach(cb => {
                    cb.checked = false;
                });
                this.updateBulkActionsBar();
            });
        }
    }
    
    // Update bulk actions bar
    updateBulkActionsBar() {
        const bar = document.getElementById('bulkActionsBar');
        const countEl = bar?.querySelector('.selected-count strong');
        
        if (bar && countEl) {
            countEl.textContent = BacklogData.selectedItems.size;
            
            if (BacklogData.selectedItems.size > 0) {
                bar.classList.add('active');
            } else {
                bar.classList.remove('active');
            }
        }
    }
    
    // Bulk move to sprint
    bulkMoveToSprint(sprintId) {
        const iteration = BacklogData.iterations.find(i => i.id === sprintId);
        if (!iteration) return;
        
        let movedCount = 0;
        BacklogData.selectedItems.forEach(itemId => {
            const item = BacklogData.items.find(i => i.id === itemId);
            if (item && item.iterationId === null) {
                item.iterationId = sprintId;
                iteration.items++;
                iteration.points += item.storyPoints || 0;
                movedCount++;
            }
        });
        
        BacklogData.selectedItems.clear();
        this.renderBacklogList();
        this.updateStats();
        this.updateSprintStats();
        this.updateBulkActionsBar();
        
        this.showToast(`已将 ${movedCount} 个事项移入 ${iteration.name}`);
    }
    
    // Bulk assign
    bulkAssign(assigneeId) {
        const member = BacklogData.members.find(m => m.id === assigneeId);
        
        BacklogData.selectedItems.forEach(itemId => {
            const item = BacklogData.items.find(i => i.id === itemId);
            if (item) {
                item.assigneeId = assigneeId;
            }
        });
        
        BacklogData.selectedItems.clear();
        this.renderBacklogList();
        this.updateBulkActionsBar();
        
        this.showToast(`已为 ${BacklogData.selectedItems.size} 个事项分配负责人: ${member?.name || '未分配'}`);
    }
    
    // Bulk delete
    bulkDelete() {
        const count = BacklogData.selectedItems.size;
        
        if (confirm(`确定要删除 ${count} 个事项吗？`)) {
            BacklogData.items = BacklogData.items.filter(item => !BacklogData.selectedItems.has(item.id));
            BacklogData.selectedItems.clear();
            
            this.renderBacklogList();
            this.updateStats();
            this.updateBulkActionsBar();
            
            this.showToast(`已删除 ${count} 个事项`);
        }
    }
    
    // Initialize sprint cards
    initSprintCards() {
        document.querySelectorAll('.sprint-card-header').forEach(header => {
            header.addEventListener('click', () => {
                const card = header.closest('.sprint-card');
                card.classList.toggle('collapsed');
            });
        });
    }
    
    // Initialize story point estimation
    initStoryPointEstimation() {
        // Story points are clickable to open estimation modal
    }
    
    // Open story point modal
    openStoryPointModal(itemId) {
        const item = BacklogData.items.find(i => i.id === itemId);
        if (!item) return;
        
        // Create modal
        const modal = document.createElement('div');
        modal.className = 'story-point-modal-overlay';
        modal.innerHTML = `
            <div class="story-point-modal">
                <div class="modal-header">
                    <h3>估算故事点</h3>
                    <button class="modal-close" onclick="this.closest('.story-point-modal-overlay').remove()">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>
                <div class="modal-body">
                    <p class="item-title-preview">#${item.id} ${item.title}</p>
                    <div class="story-point-options">
                        ${[0, 1, 2, 3, 5, 8, 13, 21].map(points => `
                            <button class="sp-option ${item.storyPoints === points ? 'active' : ''}" 
                                    onclick="backlogModule.setStoryPoints(${itemId}, ${points})">${points}</button>
                        `).join('')}
                    </div>
                    <div class="custom-points">
                        <label>自定义:</label>
                        <input type="number" id="customPoints" value="${item.storyPoints}" min="0" max="100">
                        <button class="btn btn-primary btn-sm" onclick="backlogModule.setStoryPoints(${itemId}, parseInt(document.getElementById('customPoints').value))">确定</button>
                    </div>
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
    }
    
    // Set story points
    setStoryPoints(itemId, points) {
        const item = BacklogData.items.find(i => i.id === itemId);
        if (item) {
            item.storyPoints = points;
            this.renderBacklogList();
            this.updateStats();
            this.showToast(`故事点已更新为 ${points}`);
        }
        
        document.querySelector('.story-point-modal-overlay')?.remove();
    }
    
    // Initialize priority adjustment
    initPriorityAdjustment() {
        // Priority badges are clickable to open priority menu
    }
    
    // Open priority menu
    openPriorityMenu(e, itemId) {
        e.preventDefault();
        e.stopPropagation();
        
        // Remove existing menu
        document.querySelector('.priority-menu')?.remove();
        
        const item = BacklogData.items.find(i => i.id === itemId);
        if (!item) return;
        
        const menu = document.createElement('div');
        menu.className = 'priority-menu';
        menu.innerHTML = `
            <div class="menu-item ${item.priority === 'high' ? 'active' : ''}" onclick="backlogModule.setPriority(${itemId}, 'high')">
                <span class="priority-dot high"></span>高
            </div>
            <div class="menu-item ${item.priority === 'medium' ? 'active' : ''}" onclick="backlogModule.setPriority(${itemId}, 'medium')">
                <span class="priority-dot medium"></span>中
            </div>
            <div class="menu-item ${item.priority === 'low' ? 'active' : ''}" onclick="backlogModule.setPriority(${itemId}, 'low')">
                <span class="priority-dot low"></span>低
            </div>
        `;
        
        // Position menu
        const rect = e.target.getBoundingClientRect();
        menu.style.position = 'fixed';
        menu.style.top = (rect.bottom + 4) + 'px';
        menu.style.left = rect.left + 'px';
        
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
    
    // Set priority
    setPriority(itemId, priority) {
        const item = BacklogData.items.find(i => i.id === itemId);
        if (item) {
            item.priority = priority;
            this.renderBacklogList();
            this.showToast(`优先级已更新为 ${this.getPriorityText(priority)}`);
        }
        
        document.querySelector('.priority-menu')?.remove();
    }
    
    // Open assignee menu
    openAssigneeMenu(e, itemId) {
        e.preventDefault();
        e.stopPropagation();
        
        // Remove existing menu
        document.querySelector('.assignee-menu')?.remove();
        
        const item = BacklogData.items.find(i => i.id === itemId);
        if (!item) return;
        
        const menu = document.createElement('div');
        menu.className = 'assignee-menu';
        menu.innerHTML = `
            <div class="menu-item ${item.assigneeId === null ? 'active' : ''}" onclick="backlogModule.setAssignee(${itemId}, null)">
                <div class="unassigned-avatar-small">?</div>未分配
            </div>
            ${BacklogData.members.map(member => `
                <div class="menu-item ${item.assigneeId === member.id ? 'active' : ''}" onclick="backlogModule.setAssignee(${itemId}, ${member.id})">
                    <img src="${member.avatar}" alt="${member.name}" class="avatar-small">
                    ${member.name}
                </div>
            `).join('')}
        `;
        
        // Position menu
        const rect = e.target.getBoundingClientRect();
        menu.style.position = 'fixed';
        menu.style.top = (rect.bottom + 4) + 'px';
        menu.style.left = (rect.left - 100) + 'px';
        
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
    
    // Set assignee
    setAssignee(itemId, assigneeId) {
        const item = BacklogData.items.find(i => i.id === itemId);
        const member = BacklogData.members.find(m => m.id === assigneeId);
        
        if (item) {
            item.assigneeId = assigneeId;
            this.renderBacklogList();
            this.showToast(`负责人已更新为 ${member?.name || '未分配'}`);
        }
        
        document.querySelector('.assignee-menu')?.remove();
    }
    
    // Open item menu
    openItemMenu(e, itemId) {
        e.preventDefault();
        e.stopPropagation();
        
        // Remove existing menu
        document.querySelector('.item-context-menu')?.remove();
        
        const item = BacklogData.items.find(i => i.id === itemId);
        if (!item) return;
        
        const menu = document.createElement('div');
        menu.className = 'item-context-menu';
        menu.innerHTML = `
            <div class="menu-item" onclick="window.location.href='issue-detail.html?id=${itemId}'">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                </svg>
                查看详情
            </div>
            <div class="menu-item" onclick="backlogModule.openStoryPointModal(${itemId}); document.querySelector('.item-context-menu').remove();">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="16"/>
                    <line x1="8" y1="12" x2="16" y2="12"/>
                </svg>
                估算故事点
            </div>
            <div class="menu-divider"></div>
            <div class="menu-submenu">
                <div class="menu-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="23 4 23 10 17 10"/>
                        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                    </svg>
                    移入迭代
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-left: auto;">
                        <polyline points="9 18 15 12 9 6"/>
                    </svg>
                </div>
                <div class="submenu">
                    ${BacklogData.iterations.map(iteration => `
                        <div class="menu-item" onclick="backlogModule.moveItemToSprint(${itemId}, ${iteration.id}); document.querySelector('.item-context-menu').remove();">
                            ${iteration.name}
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="menu-divider"></div>
            <div class="menu-item text-danger" onclick="backlogModule.deleteItem(${itemId})">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
                删除
            </div>
        `;
        
        // Position menu
        const rect = e.target.getBoundingClientRect();
        menu.style.position = 'fixed';
        menu.style.top = rect.bottom + 'px';
        menu.style.left = (rect.left - 150) + 'px';
        
        document.body.appendChild(menu);
        
        // Adjust position if off screen
        const menuRect = menu.getBoundingClientRect();
        if (menuRect.right > window.innerWidth) {
            menu.style.left = (window.innerWidth - menuRect.width - 10) + 'px';
        }
        if (menuRect.bottom > window.innerHeight) {
            menu.style.top = (window.innerHeight - menuRect.height - 10) + 'px';
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
    
    // Delete item
    deleteItem(itemId) {
        const item = BacklogData.items.find(i => i.id === itemId);
        if (!item) return;
        
        if (confirm(`确定要删除 "${item.title}" 吗？`)) {
            BacklogData.items = BacklogData.items.filter(i => i.id !== itemId);
            this.renderBacklogList();
            this.updateStats();
            this.showToast('事项已删除');
        }
        
        document.querySelector('.item-context-menu')?.remove();
    }
    
    // Show toast notification
    showToast(message) {
        const toast = document.getElementById('toast') || document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        toast.textContent = message;
        
        if (!document.getElementById('toast')) {
            document.body.appendChild(toast);
        }
        
        // Show toast
        setTimeout(() => toast.classList.add('visible'), 10);
        
        // Hide after 2 seconds
        setTimeout(() => {
            toast.classList.remove('visible');
        }, 2000);
    }
}

// Initialize backlog module
let backlogModule;
document.addEventListener('DOMContentLoaded', () => {
    backlogModule = new BacklogModule();
    window.backlogModule = backlogModule;
});

// Global functions for bulk actions
function bulkMoveToSprint() {
    // Show sprint selection modal
    const modal = document.createElement('div');
    modal.className = 'sprint-select-modal-overlay';
    modal.innerHTML = `
        <div class="sprint-select-modal">
            <div class="modal-header">
                <h3>选择迭代</h3>
                <button class="modal-close" onclick="this.closest('.sprint-select-modal-overlay').remove()">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            </div>
            <div class="modal-body">
                ${BacklogData.iterations.map(iteration => `
                    <div class="sprint-option" onclick="backlogModule.bulkMoveToSprint(${iteration.id}); this.closest('.sprint-select-modal-overlay').remove();">
                        <span class="sprint-status ${iteration.status}">${iteration.status === 'active' ? '进行中' : iteration.status === 'upcoming' ? '待开始' : '已规划'}</span>
                        <span class="sprint-name">${iteration.name}</span>
                        <span class="sprint-info">${iteration.items} 事项 · ${iteration.points} SP</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

function bulkAssign() {
    // Show assignee selection modal
    const modal = document.createElement('div');
    modal.className = 'assignee-select-modal-overlay';
    modal.innerHTML = `
        <div class="assignee-select-modal">
            <div class="modal-header">
                <h3>选择负责人</h3>
                <button class="modal-close" onclick="this.closest('.assignee-select-modal-overlay').remove()">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            </div>
            <div class="modal-body">
                <div class="assignee-option" onclick="backlogModule.bulkAssign(null); this.closest('.assignee-select-modal-overlay').remove();">
                    <div class="unassigned-avatar-small">?</div>
                    <span>未分配</span>
                </div>
                ${BacklogData.members.map(member => `
                    <div class="assignee-option" onclick="backlogModule.bulkAssign(${member.id}); this.closest('.assignee-select-modal-overlay').remove();">
                        <img src="${member.avatar}" alt="${member.name}" class="avatar-small">
                        <span>${member.name}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

function bulkDelete() {
    if (backlogModule) {
        backlogModule.bulkDelete();
    }
}

// Add styles for new components
const backlogStyles = document.createElement('style');
backlogStyles.textContent = `
    /* Item menu button */
    .item-menu-btn {
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: none;
        border: none;
        border-radius: var(--radius-md);
        color: var(--text-secondary);
        cursor: pointer;
        opacity: 0;
        transition: all var(--transition-fast);
    }
    
    .backlog-item:hover .item-menu-btn {
        opacity: 1;
    }
    
    .item-menu-btn:hover {
        background: var(--bg-light);
        color: var(--text-primary);
    }
    
    /* Priority menu */
    .priority-menu,
    .assignee-menu,
    .item-context-menu {
        min-width: 140px;
        background: #fff;
        border: 1px solid var(--border-light);
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-lg);
        z-index: 1000;
        overflow: hidden;
    }
    
    .priority-menu .menu-item,
    .assignee-menu .menu-item,
    .item-context-menu .menu-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 14px;
        font-size: 13px;
        color: var(--text-primary);
        cursor: pointer;
        transition: background 0.15s ease;
    }
    
    .priority-menu .menu-item:hover,
    .assignee-menu .menu-item:hover,
    .item-context-menu .menu-item:hover {
        background: var(--bg-light);
    }
    
    .priority-menu .menu-item.active,
    .assignee-menu .menu-item.active {
        color: var(--primary-color);
        background: var(--primary-light);
    }
    
    .item-context-menu .menu-item.text-danger {
        color: var(--error-color);
    }
    
    .item-context-menu .menu-divider {
        height: 1px;
        background: var(--border-light);
        margin: 4px 0;
    }
    
    .item-context-menu .menu-submenu {
        position: relative;
    }
    
    .item-context-menu .submenu {
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
    
    .item-context-menu .menu-submenu:hover .submenu {
        display: block;
    }
    
    .priority-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
    }
    
    .priority-dot.high { background: var(--error-color); }
    .priority-dot.medium { background: var(--warning-color); }
    .priority-dot.low { background: var(--text-secondary); }
    
    .avatar-small {
        width: 24px;
        height: 24px;
        border-radius: 50%;
    }
    
    .unassigned-avatar-small {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: var(--bg-light);
        border: 1px dashed var(--border-light);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        color: var(--text-placeholder);
    }
    
    /* Story point modal */
    .story-point-modal-overlay {
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
    
    .story-point-modal {
        background: #fff;
        border-radius: var(--radius-lg);
        width: 100%;
        max-width: 400px;
        overflow: hidden;
    }
    
    .story-point-modal .modal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 20px;
        border-bottom: 1px solid var(--border-light);
    }
    
    .story-point-modal .modal-header h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
    }
    
    .story-point-modal .modal-body {
        padding: 20px;
    }
    
    .item-title-preview {
        font-size: 13px;
        color: var(--text-secondary);
        margin: 0 0 16px 0;
        padding: 10px;
        background: var(--bg-light);
        border-radius: var(--radius-md);
    }
    
    .story-point-options {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-bottom: 16px;
    }
    
    .sp-option {
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--bg-light);
        border: 2px solid transparent;
        border-radius: var(--radius-md);
        font-size: 16px;
        font-weight: 600;
        color: var(--text-primary);
        cursor: pointer;
        transition: all var(--transition-fast);
    }
    
    .sp-option:hover {
        border-color: var(--primary-color);
    }
    
    .sp-option.active {
        background: var(--primary-light);
        border-color: var(--primary-color);
        color: var(--primary-color);
    }
    
    .custom-points {
        display: flex;
        align-items: center;
        gap: 12px;
    }
    
    .custom-points label {
        font-size: 13px;
        color: var(--text-secondary);
    }
    
    .custom-points input {
        width: 80px;
        padding: 8px 12px;
        border: 1px solid var(--border-light);
        border-radius: var(--radius-md);
        font-size: 14px;
    }
    
    /* Sprint select modal */
    .sprint-select-modal-overlay,
    .assignee-select-modal-overlay {
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
    
    .sprint-select-modal,
    .assignee-select-modal {
        background: #fff;
        border-radius: var(--radius-lg);
        width: 100%;
        max-width: 360px;
        overflow: hidden;
    }
    
    .sprint-select-modal .modal-header,
    .assignee-select-modal .modal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 20px;
        border-bottom: 1px solid var(--border-light);
    }
    
    .sprint-select-modal .modal-header h3,
    .assignee-select-modal .modal-header h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
    }
    
    .sprint-select-modal .modal-body,
    .assignee-select-modal .modal-body {
        padding: 8px;
    }
    
    .sprint-option {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        border-radius: var(--radius-md);
        cursor: pointer;
        transition: background var(--transition-fast);
    }
    
    .sprint-option:hover {
        background: var(--bg-light);
    }
    
    .sprint-option .sprint-status {
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: 600;
    }
    
    .sprint-option .sprint-status.active {
        background: rgba(16, 185, 129, 0.1);
        color: var(--success-color);
    }
    
    .sprint-option .sprint-status.upcoming {
        background: rgba(43, 125, 233, 0.1);
        color: var(--primary-color);
    }
    
    .sprint-option .sprint-status.planned {
        background: rgba(107, 114, 128, 0.1);
        color: var(--text-secondary);
    }
    
    .sprint-option .sprint-name {
        font-weight: 500;
        color: var(--text-primary);
    }
    
    .sprint-option .sprint-info {
        margin-left: auto;
        font-size: 12px;
        color: var(--text-secondary);
    }
    
    .assignee-option {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        border-radius: var(--radius-md);
        cursor: pointer;
        transition: background var(--transition-fast);
    }
    
    .assignee-option:hover {
        background: var(--bg-light);
    }
    
    /* Clickable story points */
    .story-points {
        cursor: pointer;
    }
    
    .story-points:hover {
        background: var(--primary-light);
        color: var(--primary-color);
    }
    
    /* Clickable priority badge */
    .priority-badge {
        cursor: pointer;
    }
    
    .priority-badge:hover {
        opacity: 0.8;
    }
`;
document.head.appendChild(backlogStyles);