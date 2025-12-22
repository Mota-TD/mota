/**
 * 摩塔 Mota - 通知中心模块 JavaScript
 * 实现通知中心的所有交互功能
 */

// ==================== 通知数据模型 ====================
const NotificationsData = {
    // 通知列表
    notifications: [
        {
            id: 1,
            type: 'issue',
            title: '新问题分配给您',
            message: '张三 将问题 #123 "用户登录页面样式优化" 分配给了您',
            project: '摩塔前端',
            time: '5分钟前',
            timestamp: Date.now() - 5 * 60 * 1000,
            read: false,
            icon: 'issue',
            link: 'issue-detail.html?id=123'
        },
        {
            id: 2,
            type: 'merge_request',
            title: '合并请求需要审核',
            message: '李四 请求您审核合并请求 !45 "feat: 添加用户认证模块"',
            project: '摩塔后端',
            time: '15分钟前',
            timestamp: Date.now() - 15 * 60 * 1000,
            read: false,
            icon: 'merge',
            link: 'merge-request-detail.html?id=45'
        },
        {
            id: 3,
            type: 'build',
            title: '构建成功',
            message: '流水线 #789 构建成功，耗时 3分42秒',
            project: '摩塔前端',
            time: '30分钟前',
            timestamp: Date.now() - 30 * 60 * 1000,
            read: false,
            icon: 'build',
            link: 'build-detail.html?id=789'
        },
        {
            id: 4,
            type: 'deploy',
            title: '部署完成',
            message: '生产环境部署成功，版本 v1.2.3',
            project: '摩塔前端',
            time: '1小时前',
            timestamp: Date.now() - 60 * 60 * 1000,
            read: true,
            icon: 'deploy',
            link: 'deployment-detail.html?id=456'
        },
        {
            id: 5,
            type: 'comment',
            title: '新评论',
            message: '王五 在问题 #120 中评论："这个方案看起来不错，我们可以进一步讨论实现细节"',
            project: '摩塔前端',
            time: '2小时前',
            timestamp: Date.now() - 2 * 60 * 60 * 1000,
            read: true,
            icon: 'comment',
            link: 'issue-detail.html?id=120'
        },
        {
            id: 6,
            type: 'mention',
            title: '有人提到了您',
            message: '赵六 在 Wiki 文档 "API 设计规范" 中提到了您',
            project: '摩塔文档',
            time: '3小时前',
            timestamp: Date.now() - 3 * 60 * 60 * 1000,
            read: true,
            icon: 'mention',
            link: 'wiki.html?page=api-design'
        },
        {
            id: 7,
            type: 'build',
            title: '构建失败',
            message: '流水线 #788 构建失败，请检查错误日志',
            project: '摩塔后端',
            time: '4小时前',
            timestamp: Date.now() - 4 * 60 * 60 * 1000,
            read: true,
            icon: 'build-failed',
            link: 'build-detail.html?id=788'
        },
        {
            id: 8,
            type: 'team',
            title: '新成员加入',
            message: '钱七 加入了团队 "摩塔开发团队"',
            project: null,
            time: '1天前',
            timestamp: Date.now() - 24 * 60 * 60 * 1000,
            read: true,
            icon: 'team',
            link: 'members.html'
        },
        {
            id: 9,
            type: 'security',
            title: '安全提醒',
            message: '检测到您的账户在新设备上登录，如非本人操作请及时修改密码',
            project: null,
            time: '2天前',
            timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000,
            read: true,
            icon: 'security',
            link: 'profile-settings.html#security'
        },
        {
            id: 10,
            type: 'system',
            title: '系统维护通知',
            message: '系统将于本周六 02:00-06:00 进行维护升级，届时服务可能短暂中断',
            project: null,
            time: '3天前',
            timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000,
            read: true,
            icon: 'system',
            link: null
        }
    ],
    
    // 当前筛选
    currentFilter: 'all', // all, unread, issue, merge_request, build, deploy, comment, mention, team, security, system
    
    // 分页
    currentPage: 1,
    pageSize: 10,
    hasMore: true,
    
    // 统计
    unreadCount: 0
};

// 通知类型配置
const notificationTypes = {
    issue: { label: '问题', color: '#3b82f6' },
    merge_request: { label: '合并请求', color: '#8b5cf6' },
    build: { label: '构建', color: '#22c55e' },
    'build-failed': { label: '构建失败', color: '#ef4444' },
    deploy: { label: '部署', color: '#06b6d4' },
    comment: { label: '评论', color: '#f59e0b' },
    mention: { label: '提及', color: '#ec4899' },
    team: { label: '团队', color: '#10b981' },
    security: { label: '安全', color: '#ef4444' },
    system: { label: '系统', color: '#6b7280' }
};

// ==================== 初始化 ====================
document.addEventListener('DOMContentLoaded', function() {
    initNotifications();
});

function initNotifications() {
    // 计算未读数量
    updateUnreadCount();
    
    // 渲染通知列表
    renderNotifications();
    
    // 绑定事件
    bindNotificationEvents();
    
    console.log('Notifications module initialized');
}

// ==================== 未读数量统计 ====================
function updateUnreadCount() {
    NotificationsData.unreadCount = NotificationsData.notifications.filter(n => !n.read).length;
    
    // 更新页面上的未读数量显示
    const unreadBadge = document.querySelector('.unread-count');
    if (unreadBadge) {
        unreadBadge.textContent = NotificationsData.unreadCount;
        unreadBadge.style.display = NotificationsData.unreadCount > 0 ? 'inline-flex' : 'none';
    }
    
    // 更新标签页上的未读数量
    const unreadTab = document.querySelector('.filter-tab[data-filter="unread"] .tab-count');
    if (unreadTab) {
        unreadTab.textContent = NotificationsData.unreadCount;
    }
    
    // 更新浏览器标题
    if (NotificationsData.unreadCount > 0) {
        document.title = `(${NotificationsData.unreadCount}) 通知中心 - 摩塔`;
    } else {
        document.title = '通知中心 - 摩塔';
    }
}

// ==================== 通知列表渲染 ====================
function renderNotifications() {
    const container = document.querySelector('.notifications-list');
    if (!container) return;
    
    // 获取过滤后的通知
    const filteredNotifications = getFilteredNotifications();
    
    if (filteredNotifications.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
                <h3>${NotificationsData.currentFilter === 'unread' ? '没有未读通知' : '暂无通知'}</h3>
                <p>${NotificationsData.currentFilter === 'unread' ? '所有通知都已读' : '当前没有任何通知'}</p>
            </div>
        `;
        return;
    }
    
    // 按日期分组
    const groupedNotifications = groupNotificationsByDate(filteredNotifications);
    
    let html = '';
    
    for (const [date, notifications] of Object.entries(groupedNotifications)) {
        html += `
            <div class="notification-group">
                <div class="group-header">
                    <span class="group-date">${date}</span>
                </div>
                <div class="group-items">
                    ${notifications.map(notification => renderNotificationItem(notification)).join('')}
                </div>
            </div>
        `;
    }
    
    // 添加加载更多按钮
    if (NotificationsData.hasMore) {
        html += `
            <div class="load-more">
                <button class="btn btn-outline" onclick="loadMoreNotifications()">加载更多</button>
            </div>
        `;
    }
    
    container.innerHTML = html;
}

function renderNotificationItem(notification) {
    const typeConfig = notificationTypes[notification.icon] || notificationTypes.system;
    
    return `
        <div class="notification-item ${notification.read ? 'read' : 'unread'}" 
             data-id="${notification.id}"
             onclick="handleNotificationClick(${notification.id})">
            <div class="notification-icon" style="background: ${typeConfig.color}15; color: ${typeConfig.color}">
                ${getNotificationIcon(notification.icon)}
            </div>
            <div class="notification-content">
                <div class="notification-header">
                    <span class="notification-title">${notification.title}</span>
                    <span class="notification-time">${notification.time}</span>
                </div>
                <p class="notification-message">${notification.message}</p>
                ${notification.project ? `<span class="notification-project">${notification.project}</span>` : ''}
            </div>
            <div class="notification-actions">
                ${!notification.read ? `
                    <button class="action-btn" title="标记为已读" onclick="markAsRead(${notification.id}, event)">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="20 6 9 17 4 12"/>
                        </svg>
                    </button>
                ` : ''}
                <button class="action-btn" title="删除" onclick="deleteNotification(${notification.id}, event)">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            </div>
        </div>
    `;
}

function getNotificationIcon(iconType) {
    const icons = {
        issue: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>`,
        merge: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="18" cy="18" r="3"/>
            <circle cx="6" cy="6" r="3"/>
            <path d="M6 21V9a9 9 0 0 0 9 9"/>
        </svg>`,
        build: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>`,
        'build-failed': `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
        </svg>`,
        deploy: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
        </svg>`,
        comment: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>`,
        mention: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="4"/>
            <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94"/>
        </svg>`,
        team: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>`,
        security: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>`,
        system: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>`
    };
    
    return icons[iconType] || icons.system;
}

function groupNotificationsByDate(notifications) {
    const groups = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());
    
    notifications.forEach(notification => {
        const notifDate = new Date(notification.timestamp);
        notifDate.setHours(0, 0, 0, 0);
        
        let dateLabel;
        
        if (notifDate.getTime() === today.getTime()) {
            dateLabel = '今天';
        } else if (notifDate.getTime() === yesterday.getTime()) {
            dateLabel = '昨天';
        } else if (notifDate >= thisWeekStart) {
            dateLabel = '本周';
        } else {
            dateLabel = '更早';
        }
        
        if (!groups[dateLabel]) {
            groups[dateLabel] = [];
        }
        groups[dateLabel].push(notification);
    });
    
    return groups;
}

function getFilteredNotifications() {
    let notifications = [...NotificationsData.notifications];
    
    if (NotificationsData.currentFilter === 'unread') {
        notifications = notifications.filter(n => !n.read);
    } else if (NotificationsData.currentFilter !== 'all') {
        notifications = notifications.filter(n => n.type === NotificationsData.currentFilter);
    }
    
    // 按时间排序（最新的在前）
    notifications.sort((a, b) => b.timestamp - a.timestamp);
    
    return notifications;
}

// ==================== 通知操作 ====================
function handleNotificationClick(notificationId) {
    const notification = NotificationsData.notifications.find(n => n.id === notificationId);
    if (!notification) return;
    
    // 标记为已读
    if (!notification.read) {
        notification.read = true;
        updateUnreadCount();
        
        // 更新 UI
        const item = document.querySelector(`.notification-item[data-id="${notificationId}"]`);
        if (item) {
            item.classList.remove('unread');
            item.classList.add('read');
            const markReadBtn = item.querySelector('.action-btn[title="标记为已读"]');
            if (markReadBtn) {
                markReadBtn.remove();
            }
        }
    }
    
    // 跳转到相关页面
    if (notification.link) {
        window.location.href = notification.link;
    }
}

function markAsRead(notificationId, event) {
    event.stopPropagation();
    
    const notification = NotificationsData.notifications.find(n => n.id === notificationId);
    if (!notification || notification.read) return;
    
    notification.read = true;
    updateUnreadCount();
    
    // 更新 UI
    const item = document.querySelector(`.notification-item[data-id="${notificationId}"]`);
    if (item) {
        item.classList.remove('unread');
        item.classList.add('read');
        const markReadBtn = item.querySelector('.action-btn[title="标记为已读"]');
        if (markReadBtn) {
            markReadBtn.remove();
        }
    }
    
    showToast('已标记为已读', 'success');
}

function markAllAsRead() {
    const unreadNotifications = NotificationsData.notifications.filter(n => !n.read);
    
    if (unreadNotifications.length === 0) {
        showToast('没有未读通知', 'info');
        return;
    }
    
    unreadNotifications.forEach(n => {
        n.read = true;
    });
    
    updateUnreadCount();
    renderNotifications();
    
    showToast(`已将 ${unreadNotifications.length} 条通知标记为已读`, 'success');
}

function deleteNotification(notificationId, event) {
    event.stopPropagation();
    
    const notification = NotificationsData.notifications.find(n => n.id === notificationId);
    if (!notification) return;
    
    // 从列表中移除
    NotificationsData.notifications = NotificationsData.notifications.filter(n => n.id !== notificationId);
    
    // 更新未读数量
    if (!notification.read) {
        updateUnreadCount();
    }
    
    // 更新 UI
    const item = document.querySelector(`.notification-item[data-id="${notificationId}"]`);
    if (item) {
        item.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            renderNotifications();
        }, 300);
    }
    
    showToast('通知已删除', 'success');
}

function clearAllNotifications() {
    if (NotificationsData.notifications.length === 0) {
        showToast('没有通知可清除', 'info');
        return;
    }
    
    if (!confirm('确定要清除所有通知吗？此操作不可恢复。')) {
        return;
    }
    
    NotificationsData.notifications = [];
    updateUnreadCount();
    renderNotifications();
    
    showToast('所有通知已清除', 'success');
}

// ==================== 筛选功能 ====================
function filterNotifications(filter) {
    NotificationsData.currentFilter = filter;
    
    // 更新标签页状态
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.filter === filter) {
            tab.classList.add('active');
        }
    });
    
    renderNotifications();
}

// ==================== 加载更多 ====================
function loadMoreNotifications() {
    // 模拟加载更多通知
    const loadMoreBtn = document.querySelector('.load-more button');
    if (loadMoreBtn) {
        loadMoreBtn.textContent = '加载中...';
        loadMoreBtn.disabled = true;
    }
    
    setTimeout(() => {
        // 模拟添加更多通知
        const newNotifications = [
            {
                id: NotificationsData.notifications.length + 1,
                type: 'issue',
                title: '问题状态更新',
                message: '问题 #115 "性能优化" 已被标记为已解决',
                project: '摩塔前端',
                time: '1周前',
                timestamp: Date.now() - 7 * 24 * 60 * 60 * 1000,
                read: true,
                icon: 'issue',
                link: 'issue-detail.html?id=115'
            },
            {
                id: NotificationsData.notifications.length + 2,
                type: 'merge_request',
                title: '合并请求已合并',
                message: '合并请求 !40 "refactor: 重构用户模块" 已被合并',
                project: '摩塔后端',
                time: '1周前',
                timestamp: Date.now() - 8 * 24 * 60 * 60 * 1000,
                read: true,
                icon: 'merge',
                link: 'merge-request-detail.html?id=40'
            }
        ];
        
        NotificationsData.notifications.push(...newNotifications);
        NotificationsData.hasMore = false; // 模拟没有更多数据
        
        renderNotifications();
        showToast('已加载更多通知', 'success');
    }, 1000);
}

// ==================== 通知设置 ====================
function openNotificationSettings() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.id = 'notificationSettingsModal';
    modal.innerHTML = `
        <div class="modal" style="width: 500px;">
            <div class="modal-header">
                <h3>通知设置</h3>
                <button class="modal-close" onclick="document.getElementById('notificationSettingsModal').remove()">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            </div>
            <div class="modal-body">
                <div class="settings-section">
                    <h4>通知渠道</h4>
                    <div class="setting-item">
                        <div class="setting-info">
                            <span class="setting-label">邮件通知</span>
                            <span class="setting-desc">通过邮件接收重要通知</span>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" id="emailNotif" checked>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                    <div class="setting-item">
                        <div class="setting-info">
                            <span class="setting-label">浏览器通知</span>
                            <span class="setting-desc">在浏览器中显示桌面通知</span>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" id="browserNotif" checked>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                    <div class="setting-item">
                        <div class="setting-info">
                            <span class="setting-label">移动端推送</span>
                            <span class="setting-desc">在移动设备上接收推送通知</span>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" id="mobileNotif">
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                </div>
                
                <div class="settings-section">
                    <h4>通知类型</h4>
                    <div class="setting-item">
                        <div class="setting-info">
                            <span class="setting-label">问题更新</span>
                            <span class="setting-desc">问题分配、状态变更等</span>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" checked>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                    <div class="setting-item">
                        <div class="setting-info">
                            <span class="setting-label">合并请求</span>
                            <span class="setting-desc">审核请求、合并通知等</span>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" checked>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                    <div class="setting-item">
                        <div class="setting-info">
                            <span class="setting-label">构建状态</span>
                            <span class="setting-desc">构建成功或失败通知</span>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" checked>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                    <div class="setting-item">
                        <div class="setting-info">
                            <span class="setting-label">部署通知</span>
                            <span class="setting-desc">部署完成或失败通知</span>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" checked>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                    <div class="setting-item">
                        <div class="setting-info">
                            <span class="setting-label">评论和提及</span>
                            <span class="setting-desc">有人评论或提及您时通知</span>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" checked>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                    <div class="setting-item">
                        <div class="setting-info">
                            <span class="setting-label">安全提醒</span>
                            <span class="setting-desc">账户安全相关通知</span>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" checked>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                </div>
                
                <div class="settings-section">
                    <h4>免打扰</h4>
                    <div class="setting-item">
                        <div class="setting-info">
                            <span class="setting-label">启用免打扰模式</span>
                            <span class="setting-desc">在指定时间段内不接收通知</span>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" id="dndMode">
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                    <div class="dnd-time-range" style="display: none;">
                        <div class="time-inputs">
                            <div class="form-group">
                                <label>开始时间</label>
                                <input type="time" value="22:00">
                            </div>
                            <div class="form-group">
                                <label>结束时间</label>
                                <input type="time" value="08:00">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-outline" onclick="document.getElementById('notificationSettingsModal').remove()">取消</button>
                <button class="btn btn-primary" onclick="saveNotificationSettings()">保存设置</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // 绑定免打扰模式切换
    const dndToggle = modal.querySelector('#dndMode');
    const dndTimeRange = modal.querySelector('.dnd-time-range');
    
    dndToggle.addEventListener('change', function() {
        dndTimeRange.style.display = this.checked ? 'block' : 'none';
    });
}

function saveNotificationSettings() {
    document.getElementById('notificationSettingsModal')?.remove();
    showToast('通知设置已保存', 'success');
}

// ==================== 事件绑定 ====================
function bindNotificationEvents() {
    // 全部已读按钮
    const markAllReadBtn = document.querySelector('.mark-all-read-btn');
    if (markAllReadBtn) {
        markAllReadBtn.addEventListener('click', markAllAsRead);
    }
    
    // 清除所有按钮
    const clearAllBtn = document.querySelector('.clear-all-btn');
    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', clearAllNotifications);
    }
    
    // 设置按钮
    const settingsBtn = document.querySelector('.notification-settings-btn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', openNotificationSettings);
    }
    
    // 筛选标签页
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            filterNotifications(this.dataset.filter);
        });
    });
    
    // 搜索输入
    const searchInput = document.querySelector('.notification-search input');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(function() {
            searchNotifications(this.value.trim());
        }, 300));
    }
}

// ==================== 搜索功能 ====================
function searchNotifications(query) {
    if (!query) {
        renderNotifications();
        return;
    }
    
    const lowerQuery = query.toLowerCase();
    const searchResults = NotificationsData.notifications.filter(n => 
        n.title.toLowerCase().includes(lowerQuery) ||
        n.message.toLowerCase().includes(lowerQuery) ||
        (n.project && n.project.toLowerCase().includes(lowerQuery))
    );
    
    const container = document.querySelector('.notifications-list');
    if (!container) return;
    
    if (searchResults.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                    <circle cx="11" cy="11" r="8"/>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <h3>未找到匹配的通知</h3>
                <p>尝试使用其他关键词搜索</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = searchResults.map(notification => renderNotificationItem(notification)).join('');
}

// ==================== 工具函数 ====================
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func.apply(this, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function showToast(message, type = 'info') {
    if (typeof window.showToast === 'function') {
        window.showToast(message, type);
    } else {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 12px 20px;
            background: ${type === 'success' ? '#22c55e' : type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#3b82f6'};
            color: white;
            border-radius: 8px;
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
}

// 添加样式
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    /* 通知列表 */
    .notifications-list {
        display: flex;
        flex-direction: column;
        gap: 24px;
    }
    
    /* 通知分组 */
    .notification-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
    
    .group-header {
        padding: 8px 0;
    }
    
    .group-date {
        font-size: 13px;
        font-weight: 600;
        color: var(--text-secondary);
        text-transform: uppercase;
    }
    
    .group-items {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
    
    /* 通知项 */
    .notification-item {
        display: flex;
        align-items: flex-start;
        gap: 16px;
        padding: 16px;
        background: #fff;
        border: 1px solid var(--border-light);
        border-radius: var(--radius-md);
        cursor: pointer;
        transition: all 0.2s;
    }
    
    .notification-item:hover {
        border-color: var(--primary-color);
        box-shadow: var(--shadow-sm);
    }
    
    .notification-item.unread {
        background: var(--primary-light);
        border-left: 3px solid var(--primary-color);
    }
    
    .notification-item.read {
        opacity: 0.8;
    }
    
    .notification-icon {
        width: 40px;
        height: 40px;
        border-radius: var(--radius-md);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
    }
    
    .notification-content {
        flex: 1;
        min-width: 0;
    }
    
    .notification-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 4px;
    }
    
    .notification-title {
        font-size: 14px;
        font-weight: 600;
        color: var(--text-primary);
    }
    
    .notification-time {
        font-size: 12px;
        color: var(--text-placeholder);
        flex-shrink: 0;
    }
    
    .notification-message {
        font-size: 13px;
        color: var(--text-secondary);
        line-height: 1.5;
        margin-bottom: 8px;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
    
    .notification-project {
        display: inline-block;
        padding: 2px 8px;
        background: var(--bg-light);
        border-radius: 4px;
        font-size: 12px;
        color: var(--text-secondary);
    }
    
    .notification-actions {
        display: flex;
        gap: 4px;
        opacity: 0;
        transition: opacity 0.2s;
    }
    
    .notification-item:hover .notification-actions {
        opacity: 1;
    }
    
    .action-btn {
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: none;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        color: var(--text-secondary);
        transition: all 0.2s;
    }
    
    .action-btn:hover {
        background: var(--bg-light);
        color: var(--primary-color);
    }
    
    /* 空状态 */
    .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 60px 20px;
        color: var(--text-secondary);
    }
    
    .empty-state svg {
        margin-bottom: 20px;
        opacity: 0.5;
    }
    
    .empty-state h3 {
        font-size: 18px;
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 8px;
    }
    
    .empty-state p {
        font-size: 14px;
    }
    
    /* 加载更多 */
    .load-more {
        display: flex;
        justify-content: center;
        padding: 20px;
    }
    
    /* 筛选标签页 */
    .filter-tabs {
        display: flex;
        gap: 8px;
        margin-bottom: 20px;
        flex-wrap: wrap;
    }
    
    .filter-tab {
        padding: 8px 16px;
        background: var(--bg-light);
        border: none;
        border-radius: var(--radius-md);
        font-size: 13px;
        color: var(--text-secondary);
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        gap: 6px;
    }
    
    .filter-tab:hover {
        background: var(--border-light);
    }
    
    .filter-tab.active {
        background: var(--primary-color);
        color: white;
    }
    
    .tab-count {
        padding: 2px 6px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 10px;
        font-size: 11px;
    }
    
    .filter-tab.active .tab-count {
        background: rgba(255, 255, 255, 0.3);
    }
    
    /* 设置弹窗 */
    .settings-section {
        margin-bottom: 24px;
    }
    
    .settings-section:last-child {
        margin-bottom: 0;
    }
    
    .settings-section h4 {
        font-size: 14px;
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 12px;
    }
    
    .setting-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 0;
        border-bottom: 1px solid var(--border-light);
    }
    
    .setting-item:last-child {
        border-bottom: none;
    }
    
    .setting-info {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }
    
    .setting-label {
        font-size: 14px;
        font-weight: 500;
        color: var(--text-primary);
    }
    
    .setting-desc {
        font-size: 12px;
        color: var(--text-secondary);
    }
    
    /* 开关样式 */
    .toggle-switch {
        position: relative;
        display: inline-block;
        width: 44px;
        height: 24px;
    }
    
    .toggle-switch input {
        opacity: 0;
        width: 0;
        height: 0;
    }
    
    .toggle-slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: var(--border-light);
        transition: 0.3s;
        border-radius: 24px;
    }
    
    .toggle-slider:before {
        position: absolute;
        content: "";
        height: 18px;
        width: 18px;
        left: 3px;
        bottom: 3px;
        background-color: white;
        transition: 0.3s;
        border-radius: 50%;
    }
    
    .toggle-switch input:checked + .toggle-slider {
        background-color: var(--primary-color);
    }
    
    .toggle-switch input:checked + .toggle-slider:before {
        transform: translateX(20px);
    }
    
    /* 免打扰时间范围 */
    .dnd-time-range {
        padding: 16px;
        background: var(--bg-light);
        border-radius: var(--radius-md);
        margin-top: 12px;
    }
    
    .time-inputs {
        display: flex;
        gap: 16px;
    }
    
    .time-inputs .form-group {
        flex: 1;
    }
    
    /* 动画 */
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(notificationStyles);