/**
 * 摩塔 Mota - 事项详情模块
 * 实现事项详情页面的所有交互功能
 */

// 事项详情数据
const IssueDetailData = {
    // 当前事项
    currentIssue: {
        id: 'REQ-001',
        type: 'requirement',
        title: '用户登录功能优化',
        description: `## 背景

当前登录功能存在以下问题：

- 登录表单验证不够完善，用户体验较差
- 密码强度检测功能缺失
- 没有记住登录状态的功能
- 登录失败的错误提示不够友好

## 目标

优化登录功能，提升用户体验，具体包括：

1. 完善表单验证，实时提示输入错误
2. 添加密码强度检测
3. 支持"记住我"功能
4. 优化错误提示信息
5. 支持第三方登录（微信、GitHub）

## 验收标准

- 所有表单字段都有实时验证
- 密码强度显示为弱/中/强三个等级
- 记住登录状态有效期为7天
- 错误提示清晰明确`,
        status: 'processing',
        priority: 'high',
        assigneeId: '1',
        iterationId: '12',
        projectId: '1',
        dueDate: '2024-01-15',
        estimatedHours: 16,
        tags: ['用户体验', '登录'],
        creatorId: '3',
        createdAt: '2024-01-05 14:30',
        updatedAt: '2024-01-12 10:15',
        watchers: ['1', '2', '3']
    },
    
    // 成员列表
    members: [
        { id: '1', name: '张三', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1', role: 'developer' },
        { id: '2', name: '李四', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2', role: 'developer' },
        { id: '3', name: '王五', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3', role: 'pm' },
        { id: '4', name: '赵六', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=4', role: 'tester' },
        { id: '5', name: '钱七', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=5', role: 'designer' }
    ],
    
    // 迭代列表
    iterations: [
        { id: '11', name: 'Sprint 11', status: 'completed' },
        { id: '12', name: 'Sprint 12', status: 'active' },
        { id: '13', name: 'Sprint 13', status: 'planned' }
    ],
    
    // 项目列表
    projects: [
        { id: '1', name: '前端项目', color: 'linear-gradient(135deg, #2b7de9, #1a6dd6)' },
        { id: '2', name: '后端项目', color: 'linear-gradient(135deg, #10b981, #059669)' },
        { id: '3', name: '移动端项目', color: 'linear-gradient(135deg, #f59e0b, #d97706)' }
    ],
    
    // 子任务列表
    subtasks: [
        { id: 'TASK-001', type: 'task', title: '实现登录表单验证', status: 'completed', assigneeId: '2' },
        { id: 'TASK-004', type: 'task', title: '添加密码强度检测功能', status: 'processing', assigneeId: '1' },
        { id: 'TASK-005', type: 'task', title: '实现"记住我"功能', status: 'pending', assigneeId: null }
    ],
    
    // 关联资源
    relatedResources: {
        mergeRequests: [
            { id: '23', title: 'feat: 优化登录表单验证', status: 'merged', source: 'feature/login-validation', target: 'main' }
        ],
        commits: [
            { hash: 'a1b2c3d', message: 'feat: add form validation', author: '张三', time: '2小时前' },
            { hash: 'e4f5g6h', message: 'fix: validation error message', author: '张三', time: '1天前' }
        ],
        relatedIssues: [
            { id: 'REQ-002', title: '用户注册功能优化', type: 'requirement', status: 'pending' },
            { id: 'BUG-003', title: '登录页面样式问题', type: 'bug', status: 'completed' }
        ]
    },
    
    // 附件列表
    attachments: [
        { id: '1', name: '登录页面设计稿.png', type: 'image', size: '1.2 MB', uploader: '张三', uploadedAt: '2024-01-10' },
        { id: '2', name: '需求说明文档.docx', type: 'doc', size: '256 KB', uploader: '李四', uploadedAt: '2024-01-08' }
    ],
    
    // 工时记录
    workLogs: [
        { id: '1', userId: '1', hours: 4, description: '完成表单验证功能开发', date: '2024-01-12' },
        { id: '2', userId: '1', hours: 2, description: '修复验证逻辑bug', date: '2024-01-11' },
        { id: '3', userId: '2', hours: 3, description: '代码review和测试', date: '2024-01-10' }
    ],
    
    // 评论列表
    comments: [
        {
            id: '1',
            userId: '2',
            content: '表单验证功能已经完成，请 @张三 帮忙review一下代码。',
            createdAt: '2小时前',
            likes: 2,
            likedBy: ['1', '3']
        },
        {
            id: '2',
            userId: '1',
            content: '好的，我来负责这个需求。预计本周内完成表单验证和密码强度检测功能。',
            createdAt: '1天前',
            likes: 1,
            likedBy: ['3']
        }
    ],
    
    // 活动历史
    activities: [
        { type: 'comment', userId: '2', content: '表单验证功能已经完成，请 @张三 帮忙review一下代码。', time: '2小时前' },
        { type: 'link_mr', userId: '2', mrId: '23', mrTitle: 'feat: 优化登录表单验证', time: '3小时前' },
        { type: 'change_assignee', userId: '1', oldValue: '未分配', newValue: '张三', time: '1天前' },
        { type: 'change_status', userId: '1', oldValue: '待处理', newValue: '进行中', time: '1天前' },
        { type: 'comment', userId: '1', content: '好的，我来负责这个需求。预计本周内完成表单验证和密码强度检测功能。', time: '1天前' },
        { type: 'create', userId: '3', time: '3天前' }
    ],
    
    // 状态配置
    statusConfig: {
        pending: { label: '待处理', color: '#6b7280' },
        processing: { label: '进行中', color: '#2b7de9' },
        testing: { label: '测试中', color: '#f59e0b' },
        completed: { label: '已完成', color: '#10b981' },
        closed: { label: '已关闭', color: '#6b7280' }
    },
    
    // 优先级配置
    priorityConfig: {
        urgent: { label: '紧急', color: '#dc2626' },
        high: { label: '高', color: '#ef4444' },
        medium: { label: '中', color: '#f59e0b' },
        low: { label: '低', color: '#6b7280' }
    },
    
    // 类型配置
    typeConfig: {
        requirement: { label: '需求', abbr: '需', color: '#2b7de9' },
        task: { label: '任务', abbr: '任', color: '#10b981' },
        bug: { label: '缺陷', abbr: '缺', color: '#ef4444' }
    }
};

// 事项详情模块
class IssueDetailModule {
    constructor() {
        this.issue = { ...IssueDetailData.currentIssue };
        this.subtasks = [...IssueDetailData.subtasks];
        this.comments = [...IssueDetailData.comments];
        this.activities = [...IssueDetailData.activities];
        this.attachments = [...IssueDetailData.attachments];
        this.workLogs = [...IssueDetailData.workLogs];
        this.relatedResources = JSON.parse(JSON.stringify(IssueDetailData.relatedResources));
        this.activityFilter = 'all'; // all, comments, history
        this.isEditing = false;
        this.init();
    }
    
    init() {
        this.parseUrlParams();
        this.loadIssueData();
        this.bindEvents();
        this.renderSubtasks();
        this.renderActivities();
        this.renderAttachments();
        this.renderRelatedResources();
        this.renderWorkLogs();
    }
    
    parseUrlParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const issueId = urlParams.get('id');
        if (issueId) {
            this.issue.id = issueId;
        }
    }
    
    loadIssueData() {
        // 更新页面标题
        document.title = `${this.issue.id} ${this.issue.title} - 摩塔 Mota`;
        
        // 更新面包屑
        const breadcrumbCurrent = document.querySelector('.breadcrumb-current');
        if (breadcrumbCurrent) {
            breadcrumbCurrent.textContent = this.issue.id;
        }
        
        // 更新事项ID
        const issueId = document.querySelector('.issue-id');
        if (issueId) {
            issueId.textContent = this.issue.id;
        }
        
        // 更新事项标题
        const issueTitle = document.querySelector('.issue-title-main');
        if (issueTitle) {
            issueTitle.textContent = this.issue.title;
        }
        
        // 更新类型徽章
        const typeBadge = document.querySelector('.issue-type-badge');
        if (typeBadge) {
            const typeConfig = IssueDetailData.typeConfig[this.issue.type];
            typeBadge.textContent = typeConfig.label;
            typeBadge.className = `issue-type-badge ${this.issue.type}`;
        }
        
        // 更新状态
        this.updateStatusDisplay();
        
        // 更新优先级
        this.updatePriorityDisplay();
        
        // 更新处理人
        this.updateAssigneeDisplay();
        
        // 更新迭代
        this.updateIterationDisplay();
        
        // 更新项目
        this.updateProjectDisplay();
        
        // 更新截止日期
        this.updateDueDateDisplay();
        
        // 更新工时
        this.updateEstimatedHoursDisplay();
        
        // 更新标签
        this.updateTagsDisplay();
        
        // 更新创建信息
        this.updateCreatorDisplay();
        
        // 更新关注者
        this.updateWatchersDisplay();
    }
    
    bindEvents() {
        // 活动筛选按钮
        document.querySelectorAll('.activity-filter .filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.activity-filter .filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.activityFilter = e.target.textContent === '全部' ? 'all' : 
                                      e.target.textContent === '评论' ? 'comments' : 'history';
                this.renderActivities();
            });
        });
        
        // 评论发送按钮
        const commentSendBtn = document.querySelector('.comment-editor .btn-primary');
        if (commentSendBtn) {
            commentSendBtn.addEventListener('click', () => this.addComment());
        }
        
        // 评论输入框回车发送
        const commentTextarea = document.querySelector('.comment-editor textarea');
        if (commentTextarea) {
            commentTextarea.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                    this.addComment();
                }
            });
            
            // @ 提及功能
            commentTextarea.addEventListener('input', (e) => {
                this.handleMentionInput(e);
            });
        }
        
        // 标题编辑
        const issueTitle = document.querySelector('.issue-title-main');
        if (issueTitle) {
            issueTitle.addEventListener('dblclick', () => this.enableTitleEdit());
        }
        
        // 关注按钮
        const watchBtn = document.querySelector('.issue-header-actions .btn-icon[title="关注"]');
        if (watchBtn) {
            watchBtn.addEventListener('click', () => this.toggleWatch());
        }
        
        // 分享按钮
        const shareBtn = document.querySelector('.issue-header-actions .btn-icon[title="分享"]');
        if (shareBtn) {
            shareBtn.addEventListener('click', () => this.shareIssue());
        }
        
        // 更多按钮
        const moreBtn = document.querySelector('.issue-header-actions .btn-icon[title="更多"]');
        if (moreBtn) {
            moreBtn.addEventListener('click', (e) => this.showMoreMenu(e));
        }
        
        // 上传附件按钮
        const uploadBtn = document.querySelector('.attachment-list')?.closest('.issue-section')?.querySelector('.btn-text');
        if (uploadBtn) {
            uploadBtn.addEventListener('click', () => this.showUploadDialog());
        }
        
        // 添加关联按钮
        const addRelationBtn = document.querySelector('.related-resources')?.closest('.issue-section')?.querySelector('.btn-text');
        if (addRelationBtn) {
            addRelationBtn.addEventListener('click', () => this.showAddRelationModal());
        }
        
        // 标签添加按钮
        const tagAddBtn = document.querySelector('.tag-add');
        if (tagAddBtn) {
            tagAddBtn.addEventListener('click', () => this.showAddTagModal());
        }
        
        // 截止日期点击
        const dateValue = document.querySelector('.date-value');
        if (dateValue) {
            dateValue.style.cursor = 'pointer';
            dateValue.addEventListener('click', () => this.showDatePicker());
        }
        
        // 工时点击
        const workloadValue = document.querySelector('.workload-value');
        if (workloadValue) {
            workloadValue.style.cursor = 'pointer';
            workloadValue.addEventListener('click', () => this.showWorkLogModal());
        }
    }
    
    // 更新状态显示
    updateStatusDisplay() {
        const statusBtn = document.querySelector('.status-selector .status-btn');
        if (statusBtn) {
            const statusConfig = IssueDetailData.statusConfig[this.issue.status];
            statusBtn.className = `status-btn ${this.issue.status}`;
            statusBtn.querySelector('.status-text').textContent = statusConfig.label;
        }
    }
    
    // 更新优先级显示
    updatePriorityDisplay() {
        const priorityBtn = document.querySelector('.priority-btn');
        if (priorityBtn) {
            const priorityConfig = IssueDetailData.priorityConfig[this.issue.priority];
            priorityBtn.className = `priority-btn ${this.issue.priority}`;
            priorityBtn.querySelector('.priority-text').textContent = priorityConfig.label;
        }
    }
    
    // 更新处理人显示
    updateAssigneeDisplay() {
        const assigneeAvatar = document.getElementById('assigneeAvatar');
        const assigneeName = document.getElementById('assigneeName');
        
        if (this.issue.assigneeId) {
            const member = IssueDetailData.members.find(m => m.id === this.issue.assigneeId);
            if (member && assigneeAvatar && assigneeName) {
                assigneeAvatar.src = member.avatar;
                assigneeAvatar.style.display = 'block';
                assigneeName.textContent = member.name;
            }
        } else {
            if (assigneeAvatar) assigneeAvatar.style.display = 'none';
            if (assigneeName) assigneeName.textContent = '未分配';
        }
    }
    
    // 更新迭代显示
    updateIterationDisplay() {
        const iterationName = document.getElementById('iterationName');
        if (iterationName) {
            if (this.issue.iterationId) {
                const iteration = IssueDetailData.iterations.find(i => i.id === this.issue.iterationId);
                iterationName.textContent = iteration ? iteration.name : '未规划';
            } else {
                iterationName.textContent = '未规划';
            }
        }
    }
    
    // 更新项目显示
    updateProjectDisplay() {
        const projectIcon = document.getElementById('projectIcon');
        const projectName = document.getElementById('projectName');
        
        if (this.issue.projectId) {
            const project = IssueDetailData.projects.find(p => p.id === this.issue.projectId);
            if (project) {
                if (projectIcon) projectIcon.style.background = project.color;
                if (projectName) projectName.textContent = project.name;
            }
        }
    }
    
    // 更新截止日期显示
    updateDueDateDisplay() {
        const dateValue = document.querySelector('.date-value');
        if (dateValue && this.issue.dueDate) {
            const today = new Date();
            const dueDate = new Date(this.issue.dueDate);
            const isOverdue = dueDate < today && this.issue.status !== 'completed' && this.issue.status !== 'closed';
            
            dateValue.className = `date-value ${isOverdue ? 'overdue' : ''}`;
            dateValue.innerHTML = `
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                ${this.issue.dueDate}
                ${isOverdue ? '<span class="overdue-tag">已逾期</span>' : ''}
            `;
        }
    }
    
    // 更新预估工时显示
    updateEstimatedHoursDisplay() {
        const workloadValue = document.querySelector('.workload-value');
        if (workloadValue) {
            const loggedHours = this.workLogs.reduce((sum, log) => sum + log.hours, 0);
            workloadValue.innerHTML = `${loggedHours} / ${this.issue.estimatedHours} 小时`;
        }
    }
    
    // 更新标签显示
    updateTagsDisplay() {
        const tagList = document.querySelector('.tag-list');
        if (tagList) {
            tagList.innerHTML = this.issue.tags.map(tag => `
                <span class="tag" data-tag="${tag}">
                    ${tag}
                    <button class="tag-remove" onclick="issueDetailModule.removeTag('${tag}')" title="移除">×</button>
                </span>
            `).join('') + '<button class="tag-add">+</button>';
            
            // 重新绑定添加标签按钮
            const tagAddBtn = tagList.querySelector('.tag-add');
            if (tagAddBtn) {
                tagAddBtn.addEventListener('click', () => this.showAddTagModal());
            }
        }
    }
    
    // 更新创建者显示
    updateCreatorDisplay() {
        const creator = IssueDetailData.members.find(m => m.id === this.issue.creatorId);
        if (creator) {
            // 使用标准选择器遍历查找创建人标签
            document.querySelectorAll('.property-label').forEach(label => {
                if (label.textContent === '创建人') {
                    const userInfo = label.parentElement.querySelector('.user-info-small');
                    if (userInfo) {
                        userInfo.innerHTML = `
                            <img src="${creator.avatar}" alt="">
                            <span>${creator.name}</span>
                        `;
                    }
                }
            });
        }
    }
    
    // 更新关注者显示
    updateWatchersDisplay() {
        const watcherAvatars = document.querySelector('.watcher-avatars');
        const watcherCount = document.querySelector('.watcher-count');
        
        if (watcherAvatars && watcherCount) {
            const watchers = this.issue.watchers.map(id => IssueDetailData.members.find(m => m.id === id)).filter(Boolean);
            
            watcherAvatars.innerHTML = watchers.slice(0, 5).map(w => `
                <img src="${w.avatar}" alt="" title="${w.name}">
            `).join('');
            
            watcherCount.textContent = `${watchers.length}人关注`;
        }
    }
    
    // 渲染子任务列表
    renderSubtasks() {
        const subtaskList = document.getElementById('subtaskList');
        if (!subtaskList) return;
        
        subtaskList.innerHTML = this.subtasks.map(subtask => {
            const assignee = subtask.assigneeId ? IssueDetailData.members.find(m => m.id === subtask.assigneeId) : null;
            const typeConfig = IssueDetailData.typeConfig[subtask.type];
            const statusConfig = IssueDetailData.statusConfig[subtask.status];
            
            return `
                <div class="subtask-item" data-id="${subtask.id}">
                    <input type="checkbox" ${subtask.status === 'completed' ? 'checked' : ''} onchange="issueDetailModule.toggleSubtaskStatus('${subtask.id}', this.checked)">
                    <span class="subtask-type ${subtask.type}">${typeConfig.abbr}</span>
                    <a href="issue-detail.html?id=${subtask.id}" class="subtask-title">${subtask.title}</a>
                    <span class="subtask-status ${subtask.status}">${statusConfig.label}</span>
                    <div class="subtask-assignee ${assignee ? '' : 'unassigned'}" onclick="issueDetailModule.changeSubtaskAssignee('${subtask.id}')">
                        ${assignee ? `<img src="${assignee.avatar}" alt="">` : '<span>?</span>'}
                    </div>
                    <button class="subtask-delete-btn" onclick="issueDetailModule.deleteSubtask('${subtask.id}')" title="删除">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>
            `;
        }).join('');
        
        // 更新计数
        const subtaskCount = document.getElementById('subtaskCount');
        if (subtaskCount) {
            subtaskCount.textContent = this.subtasks.length;
        }
    }
    
    // 渲染活动列表
    renderActivities() {
        const timeline = document.querySelector('.activity-timeline');
        if (!timeline) return;
        
        let filteredActivities = this.activities;
        if (this.activityFilter === 'comments') {
            filteredActivities = this.activities.filter(a => a.type === 'comment');
        } else if (this.activityFilter === 'history') {
            filteredActivities = this.activities.filter(a => a.type !== 'comment');
        }
        
        timeline.innerHTML = filteredActivities.map(activity => {
            const user = IssueDetailData.members.find(m => m.id === activity.userId);
            if (!user) return '';
            
            if (activity.type === 'comment') {
                const comment = this.comments.find(c => c.content === activity.content);
                return `
                    <div class="activity-item comment" data-id="${comment?.id || ''}">
                        <div class="activity-avatar">
                            <img src="${user.avatar}" alt="">
                        </div>
                        <div class="activity-content">
                            <div class="activity-header">
                                <span class="activity-author">${user.name}</span>
                                <span class="activity-time">${activity.time}</span>
                            </div>
                            <div class="activity-body">
                                <p>${this.formatMentions(activity.content)}</p>
                            </div>
                            <div class="activity-actions">
                                <button class="action-btn" onclick="issueDetailModule.replyToComment('${comment?.id || ''}')">回复</button>
                                <button class="action-btn" onclick="issueDetailModule.toggleCommentLike('${comment?.id || ''}')">👍 ${comment?.likes || 0}</button>
                                ${comment?.userId === '1' ? `<button class="action-btn" onclick="issueDetailModule.editComment('${comment?.id || ''}')">编辑</button>` : ''}
                                ${comment?.userId === '1' ? `<button class="action-btn" onclick="issueDetailModule.deleteComment('${comment?.id || ''}')">删除</button>` : ''}
                            </div>
                        </div>
                    </div>
                `;
            } else if (activity.type === 'link_mr') {
                return `
                    <div class="activity-item history">
                        <div class="activity-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="18" cy="18" r="3"/>
                                <circle cx="6" cy="6" r="3"/>
                                <path d="M6 21V9a9 9 0 0 0 9 9"/>
                            </svg>
                        </div>
                        <div class="activity-content">
                            <div class="activity-header">
                                <span class="activity-author">${user.name}</span>
                                <span class="activity-action">关联了合并请求</span>
                                <a href="merge-request-detail.html?id=${activity.mrId}">!${activity.mrId} ${activity.mrTitle}</a>
                                <span class="activity-time">${activity.time}</span>
                            </div>
                        </div>
                    </div>
                `;
            } else if (activity.type === 'change_assignee') {
                return `
                    <div class="activity-item history">
                        <div class="activity-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                                <circle cx="8.5" cy="7" r="4"/>
                                <line x1="20" y1="8" x2="20" y2="14"/>
                                <line x1="23" y1="11" x2="17" y2="11"/>
                            </svg>
                        </div>
                        <div class="activity-content">
                            <div class="activity-header">
                                <span class="activity-author">${user.name}</span>
                                <span class="activity-action">将处理人从</span>
                                <span class="activity-value old">${activity.oldValue}</span>
                                <span class="activity-action">改为</span>
                                <span class="activity-value new">${activity.newValue}</span>
                                <span class="activity-time">${activity.time}</span>
                            </div>
                        </div>
                    </div>
                `;
            } else if (activity.type === 'change_status') {
                return `
                    <div class="activity-item history">
                        <div class="activity-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"/>
                                <polyline points="12 6 12 12 16 14"/>
                            </svg>
                        </div>
                        <div class="activity-content">
                            <div class="activity-header">
                                <span class="activity-author">${user.name}</span>
                                <span class="activity-action">将状态从</span>
                                <span class="activity-value old">${activity.oldValue}</span>
                                <span class="activity-action">改为</span>
                                <span class="activity-value new">${activity.newValue}</span>
                                <span class="activity-time">${activity.time}</span>
                            </div>
                        </div>
                    </div>
                `;
            } else if (activity.type === 'create') {
                return `
                    <div class="activity-item history">
                        <div class="activity-icon create">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="12" y1="5" x2="12" y2="19"/>
                                <line x1="5" y1="12" x2="19" y2="12"/>
                            </svg>
                        </div>
                        <div class="activity-content">
                            <div class="activity-header">
                                <span class="activity-author">${user.name}</span>
                                <span class="activity-action">创建了此${IssueDetailData.typeConfig[this.issue.type].label}</span>
                                <span class="activity-time">${activity.time}</span>
                            </div>
                        </div>
                    </div>
                `;
            }
            return '';
        }).join('');
    }
    
    // 渲染附件列表
    renderAttachments() {
        const attachmentList = document.querySelector('.attachment-list');
        if (!attachmentList) return;
        
        attachmentList.innerHTML = this.attachments.map(attachment => {
            const isImage = attachment.type === 'image';
            return `
                <div class="attachment-item" data-id="${attachment.id}">
                    <div class="attachment-icon ${isImage ? '' : 'doc'}">
                        ${isImage ? `
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                                <circle cx="8.5" cy="8.5" r="1.5"/>
                                <polyline points="21 15 16 10 5 21"/>
                            </svg>
                        ` : `
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                <polyline points="14 2 14 8 20 8"/>
                                <line x1="16" y1="13" x2="8" y2="13"/>
                                <line x1="16" y1="17" x2="8" y2="17"/>
                            </svg>
                        `}
                    </div>
                    <div class="attachment-info">
                        <span class="attachment-name">${attachment.name}</span>
                        <span class="attachment-meta">${attachment.size} · ${attachment.uploader}上传于 ${attachment.uploadedAt}</span>
                    </div>
                    <div class="attachment-actions">
                        <button class="btn btn-icon" title="预览" onclick="issueDetailModule.previewAttachment('${attachment.id}')">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                <circle cx="12" cy="12" r="3"/>
                            </svg>
                        </button>
                        <button class="btn btn-icon" title="下载" onclick="issueDetailModule.downloadAttachment('${attachment.id}')">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                <polyline points="7 10 12 15 17 10"/>
                                <line x1="12" y1="15" x2="12" y2="3"/>
                            </svg>
                        </button>
                        <button class="btn btn-icon" title="删除" onclick="issueDetailModule.deleteAttachment('${attachment.id}')">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            </svg>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
        
        // 更新附件计数
        const attachmentSection = attachmentList.closest('.issue-section');
        if (attachmentSection) {
            const countBadge = attachmentSection.querySelector('.count-badge');
            if (countBadge) {
                countBadge.textContent = this.attachments.length;
            }
        }
    }
    
    // 渲染关联资源
    renderRelatedResources() {
        const resourcesContainer = document.querySelector('.related-resources');
        if (!resourcesContainer) return;
        
        let html = '';
        
        // 合并请求
        if (this.relatedResources.mergeRequests.length > 0) {
            html += `
                <div class="resource-group">
                    <div class="resource-group-title">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="18" cy="18" r="3"/>
                            <circle cx="6" cy="6" r="3"/>
                            <path d="M6 21V9a9 9 0 0 0 9 9"/>
                        </svg>
                        合并请求
                    </div>
                    ${this.relatedResources.mergeRequests.map(mr => `
                        <div class="resource-item" data-type="mr" data-id="${mr.id}">
                            <span class="resource-status ${mr.status}">${mr.status === 'merged' ? '已合并' : mr.status === 'open' ? '开放' : '已关闭'}</span>
                            <a href="merge-request-detail.html?id=${mr.id}">!${mr.id} ${mr.title}</a>
                            <span class="resource-meta">${mr.target} ← ${mr.source}</span>
                            <button class="resource-remove" onclick="issueDetailModule.removeRelation('mr', '${mr.id}')" title="移除关联">×</button>
                        </div>
                    `).join('')}
                </div>
            `;
        }
        
        // 代码提交
        if (this.relatedResources.commits.length > 0) {
            html += `
                <div class="resource-group">
                    <div class="resource-group-title">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="16 18 22 12 16 6"/>
                            <polyline points="8 6 2 12 8 18"/>
                        </svg>
                        代码提交
                    </div>
                    ${this.relatedResources.commits.map(commit => `
                        <div class="resource-item" data-type="commit" data-id="${commit.hash}">
                            <code class="commit-hash">${commit.hash}</code>
                            <a href="commit-detail.html?hash=${commit.hash}">${commit.message}</a>
                            <span class="resource-meta">${commit.author} · ${commit.time}</span>
                            <button class="resource-remove" onclick="issueDetailModule.removeRelation('commit', '${commit.hash}')" title="移除关联">×</button>
                        </div>
                    `).join('')}
                </div>
            `;
        }
        
        // 关联事项
        if (this.relatedResources.relatedIssues.length > 0) {
            html += `
                <div class="resource-group">
                    <div class="resource-group-title">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="12" y1="8" x2="12" y2="12"/>
                            <line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                        关联事项
                    </div>
                    ${this.relatedResources.relatedIssues.map(issue => {
                        const typeConfig = IssueDetailData.typeConfig[issue.type];
                        const statusConfig = IssueDetailData.statusConfig[issue.status];
                        return `
                            <div class="resource-item" data-type="issue" data-id="${issue.id}">
                                <span class="issue-type-icon ${issue.type}">${typeConfig.abbr}</span>
                                <a href="issue-detail.html?id=${issue.id}">${issue.id} ${issue.title}</a>
                                <span class="resource-status-tag ${issue.status}">${statusConfig.label}</span>
                                <button class="resource-remove" onclick="issueDetailModule.removeRelation('issue', '${issue.id}')" title="移除关联">×</button>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
        }
        
        if (html === '') {
            html = '<div class="empty-state">暂无关联资源</div>';
        }
        
        resourcesContainer.innerHTML = html;
    }
    
    // 渲染工时记录
    renderWorkLogs() {
        // 工时记录在工时弹窗中显示
        this.updateEstimatedHoursDisplay();
    }
    
    // 格式化 @ 提及
    formatMentions(content) {
        return content.replace(/@(\S+)/g, '<a href="#" class="mention">@$1</a>');
    }
    
    // 处理 @ 提及输入
    handleMentionInput(e) {
        const textarea = e.target;
        const value = textarea.value;
        const cursorPos = textarea.selectionStart;
        
        // 检查是否刚输入了 @
        const textBeforeCursor = value.substring(0, cursorPos);
        const atMatch = textBeforeCursor.match(/@(\w*)$/);
        
        if (atMatch) {
            const searchTerm = atMatch[1].toLowerCase();
            const matchedMembers = IssueDetailData.members.filter(m => 
                m.name.toLowerCase().includes(searchTerm)
            );
            
            if (matchedMembers.length > 0) {
                this.showMentionSuggestions(matchedMembers, textarea, atMatch.index);
            } else {
                this.hideMentionSuggestions();
            }
        } else {
            this.hideMentionSuggestions();
        }
    }
    
    // 显示 @ 提及建议
    showMentionSuggestions(members, textarea, atIndex) {
        let suggestions = document.getElementById('mentionSuggestions');
        if (!suggestions) {
            suggestions = document.createElement('div');
            suggestions.id = 'mentionSuggestions';
            suggestions.className = 'mention-suggestions';
            textarea.parentElement.appendChild(suggestions);
        }
        
        suggestions.innerHTML = members.map(m => `
            <div class="mention-option" data-name="${m.name}">
                <img src="${m.avatar}" alt="">
                <span>${m.name}</span>
            </div>
        `).join('');
        
        suggestions.style.display = 'block';
        
        // 绑定点击事件
        suggestions.querySelectorAll('.mention-option').forEach(option => {
            option.addEventListener('click', () => {
                const name = option.dataset.name;
                const value = textarea.value;
                const beforeAt = value.substring(0, atIndex);
                const afterCursor = value.substring(textarea.selectionStart);
                textarea.value = beforeAt + '@' + name + ' ' + afterCursor;
                textarea.focus();
                this.hideMentionSuggestions();
            });
        });
    }
    
    // 隐藏 @ 提及建议
    hideMentionSuggestions() {
        const suggestions = document.getElementById('mentionSuggestions');
        if (suggestions) {
            suggestions.style.display = 'none';
        }
    }
    
    // 添加评论
    addComment() {
        const textarea = document.querySelector('.comment-editor textarea');
        const content = textarea.value.trim();
        
        if (!content) {
            alert('请输入评论内容');
            return;
        }
        
        const newComment = {
            id: String(Date.now()),
            userId: '1', // 当前用户
            content: content,
            createdAt: '刚刚',
            likes: 0,
            likedBy: []
        };
        
        this.comments.unshift(newComment);
        
        // 添加到活动历史
        this.activities.unshift({
            type: 'comment',
            userId: '1',
            content: content,
            time: '刚刚'
        });
        
        // 清空输入框
        textarea.value = '';
        
        // 重新渲染
        this.renderActivities();
        
        this.showToast('评论已发送');
    }
    
    // 回复评论
    replyToComment(commentId) {
        const comment = this.comments.find(c => c.id === commentId);
        if (comment) {
            const user = IssueDetailData.members.find(m => m.id === comment.userId);
            const textarea = document.querySelector('.comment-editor textarea');
            if (textarea && user) {
                textarea.value = `@${user.name} `;
                textarea.focus();
            }
        }
    }
    
    // 切换评论点赞
    toggleCommentLike(commentId) {
        const comment = this.comments.find(c => c.id === commentId);
        if (comment) {
            const currentUserId = '1';
            const likedIndex = comment.likedBy.indexOf(currentUserId);
            
            if (likedIndex > -1) {
                comment.likedBy.splice(likedIndex, 1);
                comment.likes--;
            } else {
                comment.likedBy.push(currentUserId);
                comment.likes++;
            }
            
            this.renderActivities();
        }
    }
    
    // 编辑评论
    editComment(commentId) {
        const comment = this.comments.find(c => c.id === commentId);
        if (comment) {
            const newContent = prompt('编辑评论:', comment.content);
            if (newContent && newContent.trim()) {
                comment.content = newContent.trim();
                
                // 更新活动历史中的评论
                const activity = this.activities.find(a => a.type === 'comment' && a.content === comment.content);
                if (activity) {
                    activity.content = newContent.trim();
                }
                
                this.renderActivities();
                this.showToast('评论已更新');
            }
        }
    }
    
    // 删除评论
    deleteComment(commentId) {
        if (confirm('确定要删除这条评论吗？')) {
            const commentIndex = this.comments.findIndex(c => c.id === commentId);
            if (commentIndex > -1) {
                const comment = this.comments[commentIndex];
                this.comments.splice(commentIndex, 1);
                
                // 从活动历史中移除
                const activityIndex = this.activities.findIndex(a => a.type === 'comment' && a.content === comment.content);
                if (activityIndex > -1) {
                    this.activities.splice(activityIndex, 1);
                }
                
                this.renderActivities();
                this.showToast('评论已删除');
            }
        }
    }
    
    // 切换子任务状态
    toggleSubtaskStatus(subtaskId, completed) {
        const subtask = this.subtasks.find(s => s.id === subtaskId);
        if (subtask) {
            subtask.status = completed ? 'completed' : 'pending';
            this.renderSubtasks();
            
            // 添加活动记录
            this.addActivityRecord('子任务状态', completed ? '已完成' : '待处理');
        }
    }
    
    // 删除子任务
    deleteSubtask(subtaskId) {
        if (confirm('确定要删除这个子任务吗？')) {
            const index = this.subtasks.findIndex(s => s.id === subtaskId);
            if (index > -1) {
                const subtask = this.subtasks[index];
                this.subtasks.splice(index, 1);
                this.renderSubtasks();
                this.addActivityRecord('子任务', `删除了 "${subtask.title}"`);
            }
        }
    }
    
    // 修改子任务处理人
    changeSubtaskAssignee(subtaskId) {
        const subtask = this.subtasks.find(s => s.id === subtaskId);
        if (!subtask) return;
        
        // 创建选择弹窗
        const modal = document.createElement('div');
        modal.className = 'quick-modal';
        modal.innerHTML = `
            <div class="quick-modal-content">
                <div class="quick-modal-header">选择处理人</div>
                <div class="quick-modal-body">
                    <div class="member-option" data-id="">
                        <div class="member-avatar unassigned"><span>?</span></div>
                        <span>未分配</span>
                    </div>
                    ${IssueDetailData.members.map(m => `
                        <div class="member-option ${subtask.assigneeId === m.id ? 'selected' : ''}" data-id="${m.id}">
                            <img src="${m.avatar}" alt="">
                            <span>${m.name}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // 绑定事件
        modal.querySelectorAll('.member-option').forEach(option => {
            option.addEventListener('click', () => {
                subtask.assigneeId = option.dataset.id || null;
                this.renderSubtasks();
                modal.remove();
            });
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }
    
    // 启用标题编辑
    enableTitleEdit() {
        const titleEl = document.querySelector('.issue-title-main');
        if (!titleEl) return;
        
        const currentTitle = titleEl.textContent;
        titleEl.innerHTML = `<input type="text" class="title-edit-input" value="${currentTitle}">`;
        
        const input = titleEl.querySelector('input');
        input.focus();
        input.select();
        
        input.addEventListener('blur', () => this.saveTitleEdit(input.value));
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.saveTitleEdit(input.value);
            } else if (e.key === 'Escape') {
                titleEl.textContent = currentTitle;
            }
        });
    }
    
    // 保存标题编辑
    saveTitleEdit(newTitle) {
        const titleEl = document.querySelector('.issue-title-main');
        if (!titleEl) return;
        
        if (newTitle.trim() && newTitle !== this.issue.title) {
            const oldTitle = this.issue.title;
            this.issue.title = newTitle.trim();
            titleEl.textContent = this.issue.title;
            document.title = `${this.issue.id} ${this.issue.title} - 摩塔 Mota`;
            
            this.addActivityRecord('标题', `从 "${oldTitle}" 改为 "${this.issue.title}"`);
            this.showToast('标题已更新');
        } else {
            titleEl.textContent = this.issue.title;
        }
    }
    
    // 切换关注
    toggleWatch() {
        const currentUserId = '1';
        const watchIndex = this.issue.watchers.indexOf(currentUserId);
        
        if (watchIndex > -1) {
            this.issue.watchers.splice(watchIndex, 1);
            this.showToast('已取消关注');
        } else {
            this.issue.watchers.push(currentUserId);
            this.showToast('已关注此事项');
        }
        
        this.updateWatchersDisplay();
    }
    
    // 分享事项
    shareIssue() {
        const url = window.location.href;
        navigator.clipboard.writeText(url).then(() => {
            this.showToast('链接已复制到剪贴板');
        }).catch(() => {
            prompt('复制以下链接:', url);
        });
    }
    
    // 显示更多菜单
    showMoreMenu(e) {
        e.stopPropagation();
        
        let menu = document.getElementById('issueMoreMenu');
        if (menu) {
            menu.remove();
            return;
        }
        
        menu = document.createElement('div');
        menu.id = 'issueMoreMenu';
        menu.className = 'dropdown-menu show';
        menu.innerHTML = `
            <a href="#" class="dropdown-item" onclick="issueDetailModule.copyIssueId(); return false;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
                <span>复制事项ID</span>
            </a>
            <a href="#" class="dropdown-item" onclick="issueDetailModule.duplicateIssue(); return false;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
                <span>复制事项</span>
            </a>
            <a href="#" class="dropdown-item" onclick="issueDetailModule.moveIssue(); return false;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                </svg>
                <span>移动到其他项目</span>
            </a>
            <div class="dropdown-divider"></div>
            <a href="#" class="dropdown-item text-danger" onclick="issueDetailModule.deleteIssue(); return false;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
                <span>删除事项</span>
            </a>
        `;
        
        const btn = e.target.closest('.btn-icon');
        const rect = btn.getBoundingClientRect();
        menu.style.position = 'fixed';
        menu.style.top = `${rect.bottom + 4}px`;
        menu.style.right = `${window.innerWidth - rect.right}px`;
        
        document.body.appendChild(menu);
        
        // 点击外部关闭
        setTimeout(() => {
            document.addEventListener('click', function closeMenu() {
                menu.remove();
                document.removeEventListener('click', closeMenu);
            });
        }, 0);
    }
    
    // 复制事项ID
    copyIssueId() {
        navigator.clipboard.writeText(this.issue.id).then(() => {
            this.showToast('事项ID已复制');
        });
    }
    
    // 复制事项
    duplicateIssue() {
        this.showToast('事项已复制，正在创建...');
        setTimeout(() => {
            window.location.href = `issues.html?action=create&copy=${this.issue.id}`;
        }, 500);
    }
    
    // 移动事项
    moveIssue() {
        const modal = document.createElement('div');
        modal.className = 'quick-modal';
        modal.innerHTML = `
            <div class="quick-modal-content">
                <div class="quick-modal-header">移动到其他项目</div>
                <div class="quick-modal-body">
                    ${IssueDetailData.projects.filter(p => p.id !== this.issue.projectId).map(p => `
                        <div class="project-option" data-id="${p.id}">
                            <span class="project-icon" style="background: ${p.color};"></span>
                            <span>${p.name}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.querySelectorAll('.project-option').forEach(option => {
            option.addEventListener('click', () => {
                const project = IssueDetailData.projects.find(p => p.id === option.dataset.id);
                if (project) {
                    this.issue.projectId = project.id;
                    this.updateProjectDisplay();
                    this.addActivityRecord('项目', project.name);
                    this.showToast(`已移动到 ${project.name}`);
                }
                modal.remove();
            });
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }
    
    // 删除事项
    deleteIssue() {
        if (confirm(`确定要删除事项 ${this.issue.id} 吗？此操作不可恢复。`)) {
            this.showToast('事项已删除');
            setTimeout(() => {
                window.location.href = 'issues.html';
            }, 500);
        }
    }
    
    // 显示上传对话框
    showUploadDialog() {
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.accept = '*/*';
        
        input.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            files.forEach(file => {
                const attachment = {
                    id: String(Date.now() + Math.random()),
                    name: file.name,
                    type: file.type.startsWith('image/') ? 'image' : 'doc',
                    size: this.formatFileSize(file.size),
                    uploader: '当前用户',
                    uploadedAt: new Date().toISOString().split('T')[0]
                };
                this.attachments.push(attachment);
            });
            
            this.renderAttachments();
            this.showToast(`已上传 ${files.length} 个文件`);
        });
        
        input.click();
    }
    
    // 格式化文件大小
    formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }
    
    // 预览附件
    previewAttachment(attachmentId) {
        const attachment = this.attachments.find(a => a.id === attachmentId);
        if (attachment) {
            if (attachment.type === 'image') {
                // 显示图片预览弹窗
                const modal = document.createElement('div');
                modal.className = 'image-preview-modal';
                modal.innerHTML = `
                    <div class="image-preview-content">
                        <img src="https://via.placeholder.com/800x600?text=${encodeURIComponent(attachment.name)}" alt="${attachment.name}">
                        <button class="close-btn" onclick="this.parentElement.parentElement.remove()">×</button>
                    </div>
                `;
                document.body.appendChild(modal);
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) modal.remove();
                });
            } else {
                this.showToast('正在打开文件预览...');
            }
        }
    }
    
    // 下载附件
    downloadAttachment(attachmentId) {
        const attachment = this.attachments.find(a => a.id === attachmentId);
        if (attachment) {
            this.showToast(`正在下载 ${attachment.name}...`);
        }
    }
    
    // 删除附件
    deleteAttachment(attachmentId) {
        if (confirm('确定要删除这个附件吗？')) {
            const index = this.attachments.findIndex(a => a.id === attachmentId);
            if (index > -1) {
                const attachment = this.attachments[index];
                this.attachments.splice(index, 1);
                this.renderAttachments();
                this.addActivityRecord('附件', `删除了 "${attachment.name}"`);
            }
        }
    }
    
    // 显示添加关联弹窗
    showAddRelationModal() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal add-relation-modal">
                <div class="modal-header">
                    <h3>添加关联</h3>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
                </div>
                <div class="modal-body">
                    <div class="relation-type-tabs">
                        <button class="tab-btn active" data-type="issue">关联事项</button>
                        <button class="tab-btn" data-type="mr">合并请求</button>
                        <button class="tab-btn" data-type="commit">代码提交</button>
                    </div>
                    <div class="relation-search">
                        <input type="text" placeholder="搜索事项ID或标题..." id="relationSearchInput">
                    </div>
                    <div class="relation-results" id="relationResults">
                        <div class="relation-item" data-id="REQ-003">
                            <span class="issue-type-icon requirement">需</span>
                            <span>REQ-003 用户个人中心优化</span>
                        </div>
                        <div class="relation-item" data-id="TASK-010">
                            <span class="issue-type-icon task">任</span>
                            <span>TASK-010 优化页面加载速度</span>
                        </div>
                        <div class="relation-item" data-id="BUG-005">
                            <span class="issue-type-icon bug">缺</span>
                            <span>BUG-005 表单提交失败问题</span>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">取消</button>
                    <button class="btn btn-primary" id="addRelationBtn">添加</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // 绑定事件
        modal.querySelectorAll('.relation-item').forEach(item => {
            item.addEventListener('click', () => {
                item.classList.toggle('selected');
            });
        });
        
        modal.querySelector('#addRelationBtn').addEventListener('click', () => {
            const selected = modal.querySelectorAll('.relation-item.selected');
            selected.forEach(item => {
                const id = item.dataset.id;
                const title = item.querySelector('span:last-child').textContent;
                const type = id.startsWith('REQ') ? 'requirement' : id.startsWith('TASK') ? 'task' : 'bug';
                
                this.relatedResources.relatedIssues.push({
                    id: id,
                    title: title,
                    type: type,
                    status: 'pending'
                });
            });
            
            this.renderRelatedResources();
            modal.remove();
            this.showToast(`已添加 ${selected.length} 个关联`);
        });
    }
    
    // 移除关联
    removeRelation(type, id) {
        if (confirm('确定要移除这个关联吗？')) {
            if (type === 'mr') {
                const index = this.relatedResources.mergeRequests.findIndex(mr => mr.id === id);
                if (index > -1) this.relatedResources.mergeRequests.splice(index, 1);
            } else if (type === 'commit') {
                const index = this.relatedResources.commits.findIndex(c => c.hash === id);
                if (index > -1) this.relatedResources.commits.splice(index, 1);
            } else if (type === 'issue') {
                const index = this.relatedResources.relatedIssues.findIndex(i => i.id === id);
                if (index > -1) this.relatedResources.relatedIssues.splice(index, 1);
            }
            
            this.renderRelatedResources();
            this.showToast('关联已移除');
        }
    }
    
    // 显示添加标签弹窗
    showAddTagModal() {
        const existingTags = ['前端', '后端', '设计', 'UI', 'API', '性能', '安全', '文档', '测试', '重构'];
        
        const modal = document.createElement('div');
        modal.className = 'quick-modal';
        modal.innerHTML = `
            <div class="quick-modal-content">
                <div class="quick-modal-header">添加标签</div>
                <div class="quick-modal-body">
                    <input type="text" class="tag-input" placeholder="输入新标签或选择已有标签...">
                    <div class="existing-tags">
                        ${existingTags.filter(t => !this.issue.tags.includes(t)).map(t => `
                            <span class="tag-option" data-tag="${t}">${t}</span>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        const input = modal.querySelector('.tag-input');
        input.focus();
        
        // 选择已有标签
        modal.querySelectorAll('.tag-option').forEach(option => {
            option.addEventListener('click', () => {
                this.issue.tags.push(option.dataset.tag);
                this.updateTagsDisplay();
                modal.remove();
            });
        });
        
        // 输入新标签
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && input.value.trim()) {
                this.issue.tags.push(input.value.trim());
                this.updateTagsDisplay();
                modal.remove();
            }
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }
    
    // 移除标签
    removeTag(tag) {
        const index = this.issue.tags.indexOf(tag);
        if (index > -1) {
            this.issue.tags.splice(index, 1);
            this.updateTagsDisplay();
        }
    }
    
    // 显示日期选择器
    showDatePicker() {
        const currentDate = this.issue.dueDate || new Date().toISOString().split('T')[0];
        const newDate = prompt('设置截止日期 (YYYY-MM-DD):', currentDate);
        
        if (newDate && /^\d{4}-\d{2}-\d{2}$/.test(newDate)) {
            this.issue.dueDate = newDate;
            this.updateDueDateDisplay();
            this.addActivityRecord('截止日期', newDate);
        }
    }
    
    // 显示工时记录弹窗
    showWorkLogModal() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal worklog-modal">
                <div class="modal-header">
                    <h3>工时记录</h3>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
                </div>
                <div class="modal-body">
                    <div class="worklog-summary">
                        <div class="summary-item">
                            <span class="label">预估工时</span>
                            <span class="value">${this.issue.estimatedHours} 小时</span>
                        </div>
                        <div class="summary-item">
                            <span class="label">已记录</span>
                            <span class="value">${this.workLogs.reduce((sum, log) => sum + log.hours, 0)} 小时</span>
                        </div>
                        <div class="summary-item">
                            <span class="label">剩余</span>
                            <span class="value">${Math.max(0, this.issue.estimatedHours - this.workLogs.reduce((sum, log) => sum + log.hours, 0))} 小时</span>
                        </div>
                    </div>
                    <div class="worklog-form">
                        <h4>添加工时</h4>
                        <div class="form-row">
                            <label>工时（小时）</label>
                            <input type="number" id="worklogHours" min="0.5" step="0.5" value="1">
                        </div>
                        <div class="form-row">
                            <label>日期</label>
                            <input type="date" id="worklogDate" value="${new Date().toISOString().split('T')[0]}">
                        </div>
                        <div class="form-row">
                            <label>描述</label>
                            <textarea id="worklogDesc" placeholder="工作内容描述..."></textarea>
                        </div>
                        <button class="btn btn-primary" onclick="issueDetailModule.addWorkLog()">添加工时</button>
                    </div>
                    <div class="worklog-list">
                        <h4>工时历史</h4>
                        ${this.workLogs.map(log => {
                            const user = IssueDetailData.members.find(m => m.id === log.userId);
                            return `
                                <div class="worklog-item">
                                    <div class="worklog-info">
                                        <img src="${user?.avatar || ''}" alt="">
                                        <span class="user-name">${user?.name || '未知'}</span>
                                        <span class="hours">${log.hours}小时</span>
                                        <span class="date">${log.date}</span>
                                    </div>
                                    <div class="worklog-desc">${log.description}</div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }
    
    // 添加工时记录
    addWorkLog() {
        const hours = parseFloat(document.getElementById('worklogHours').value);
        const date = document.getElementById('worklogDate').value;
        const description = document.getElementById('worklogDesc').value.trim();
        
        if (!hours || hours <= 0) {
            alert('请输入有效的工时');
            return;
        }
        
        if (!description) {
            alert('请输入工作描述');
            return;
        }
        
        const workLog = {
            id: String(Date.now()),
            userId: '1',
            hours: hours,
            description: description,
            date: date
        };
        
        this.workLogs.unshift(workLog);
        this.updateEstimatedHoursDisplay();
        
        // 关闭弹窗并重新打开以刷新列表
        document.querySelector('.modal-overlay')?.remove();
        this.showWorkLogModal();
        
        this.showToast('工时已记录');
    }
    
    // 添加活动记录
    addActivityRecord(field, newValue) {
        const activity = {
            type: 'change_' + field.toLowerCase().replace(/\s/g, '_'),
            userId: '1',
            field: field,
            newValue: newValue,
            time: '刚刚'
        };
        
        this.activities.unshift(activity);
        
        // 更新时间线显示
        const timeline = document.querySelector('.activity-timeline');
        if (timeline) {
            const user = IssueDetailData.members.find(m => m.id === '1');
            const activityHtml = `
                <div class="activity-item history">
                    <div class="activity-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                            <polyline points="12 6 12 12 16 14"/>
                        </svg>
                    </div>
                    <div class="activity-content">
                        <div class="activity-header">
                            <span class="activity-author">${user?.name || '当前用户'}</span>
                            <span class="activity-action">将${field}改为</span>
                            <span class="activity-value new">${newValue}</span>
                            <span class="activity-time">刚刚</span>
                        </div>
                    </div>
                </div>
            `;
            
            timeline.insertAdjacentHTML('afterbegin', activityHtml);
        }
    }
    
    // 显示提示消息
    showToast(message) {
        let toast = document.getElementById('toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'toast';
            toast.className = 'toast';
            document.body.appendChild(toast);
        }
        
        toast.textContent = message;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

// 全局函数 - 供 HTML 中的 onclick 调用
function showAddSubtaskForm() {
    document.getElementById('addSubtaskForm').style.display = 'block';
    document.getElementById('newSubtaskTitle').focus();
}

function hideAddSubtaskForm() {
    document.getElementById('addSubtaskForm').style.display = 'none';
    document.getElementById('newSubtaskTitle').value = '';
}

function addSubtask() {
    const type = document.getElementById('newSubtaskType').value;
    const title = document.getElementById('newSubtaskTitle').value.trim();
    const assigneeId = document.getElementById('newSubtaskAssignee').value || null;
    
    if (!title) {
        alert('请输入子任务标题');
        return;
    }
    
    const subtaskId = (type === 'task' ? 'TASK-' : 'BUG-') + String(Math.floor(Math.random() * 900) + 100);
    
    issueDetailModule.subtasks.push({
        id: subtaskId,
        type: type,
        title: title,
        status: 'pending',
        assigneeId: assigneeId
    });
    
    issueDetailModule.renderSubtasks();
    hideAddSubtaskForm();
    issueDetailModule.addActivityRecord('子任务', `添加了 "${title}"`);
}

// 初始化模块
let issueDetailModule;
document.addEventListener('DOMContentLoaded', function() {
    issueDetailModule = new IssueDetailModule();
});