/**
 * 摩塔 Mota - 成员管理模块 JavaScript
 * 实现团队成员管理的所有交互功能
 */

// ==================== 成员数据模型 ====================
const MembersData = {
    // 成员列表
    members: [
        { id: 1, name: '张三', email: 'zhangsan@example.com', role: 'owner', groups: ['开发组'], joinedAt: '2023-06-15', avatar: 'owner', status: 'active', lastActive: '刚刚' },
        { id: 2, name: '李四', email: 'lisi@example.com', role: 'admin', groups: ['开发组', '运维组'], joinedAt: '2023-07-20', avatar: 'admin', status: 'active', lastActive: '5分钟前' },
        { id: 3, name: '王五', email: 'wangwu@example.com', role: 'member', groups: ['开发组'], joinedAt: '2023-08-10', avatar: 'dev1', status: 'active', lastActive: '1小时前' },
        { id: 4, name: '赵六', email: 'zhaoliu@example.com', role: 'member', groups: ['测试组'], joinedAt: '2023-09-05', avatar: 'test1', status: 'active', lastActive: '2小时前' },
        { id: 5, name: '钱七', email: 'qianqi@example.com', role: 'member', groups: ['产品组'], joinedAt: '2023-10-12', avatar: 'pm1', status: 'active', lastActive: '1天前' },
        { id: 6, name: '孙八', email: 'sunba@example.com', role: 'member', groups: ['运维组'], joinedAt: '2023-11-08', avatar: 'ops1', status: 'active', lastActive: '3天前' },
        { id: 7, name: '周九', email: 'zhoujiu@example.com', role: 'member', groups: ['开发组'], joinedAt: '2023-12-01', avatar: 'dev2', status: 'active', lastActive: '1周前' },
        { id: 8, name: '吴十', email: 'wushi@example.com', role: 'member', groups: ['测试组'], joinedAt: '2023-12-15', avatar: 'test2', status: 'active', lastActive: '2周前' },
        { id: 9, name: '郑十一', email: 'zheng11@example.com', role: 'member', groups: ['开发组'], joinedAt: '2024-01-05', avatar: 'dev3', status: 'active', lastActive: '刚刚' },
        { id: 10, name: '王十二', email: 'wang12@example.com', role: 'member', groups: ['产品组'], joinedAt: '2024-01-10', avatar: 'pm2', status: 'active', lastActive: '30分钟前' },
        { id: 11, name: '李十三', email: 'li13@example.com', role: 'member', groups: ['运维组'], joinedAt: '2024-01-12', avatar: 'ops2', status: 'active', lastActive: '2小时前' },
        { id: 12, name: '张十四', email: 'zhang14@example.com', role: 'member', groups: ['开发组'], joinedAt: '2024-01-15', avatar: 'dev4', status: 'active', lastActive: '5小时前' }
    ],
    
    // 待接受邀请
    pendingInvites: [
        { id: 101, email: 'newuser1@example.com', role: 'member', groups: ['开发组'], invitedAt: '2024-01-18', invitedBy: '张三' },
        { id: 102, email: 'newuser2@example.com', role: 'member', groups: ['测试组'], invitedAt: '2024-01-17', invitedBy: '李四' },
        { id: 103, email: 'newuser3@example.com', role: 'admin', groups: [], invitedAt: '2024-01-16', invitedBy: '张三' }
    ],
    
    // 用户组
    groups: [
        { id: 1, name: '开发组', color: '#3b82f6', memberCount: 6 },
        { id: 2, name: '测试组', color: '#22c55e', memberCount: 2 },
        { id: 3, name: '运维组', color: '#f59e0b', memberCount: 3 },
        { id: 4, name: '产品组', color: '#8b5cf6', memberCount: 2 }
    ],
    
    // 当前状态
    currentTab: 'all', // all, groups, pending
    currentPage: 1,
    pageSize: 6,
    searchQuery: '',
    roleFilter: '',
    groupFilter: '',
    selectedMemberId: null
};

// 角色标签映射
const roleLabels = {
    owner: '所有者',
    admin: '管理员',
    member: '成员'
};

// ==================== 初始化 ====================
document.addEventListener('DOMContentLoaded', function() {
    initMembers();
});

function initMembers() {
    // 渲染成员列表
    renderMemberList();
    
    // 更新统计数据
    updateStats();
    
    // 绑定事件
    bindMemberEvents();
    
    console.log('Members module initialized');
}

// ==================== 统计数据更新 ====================
function updateStats() {
    const stats = {
        total: MembersData.members.length,
        admins: MembersData.members.filter(m => m.role === 'admin' || m.role === 'owner').length,
        pending: MembersData.pendingInvites.length,
        groups: MembersData.groups.length
    };
    
    // 更新统计卡片
    const statCards = document.querySelectorAll('.stat-card');
    if (statCards.length >= 4) {
        statCards[0].querySelector('.stat-value').textContent = stats.total;
        statCards[1].querySelector('.stat-value').textContent = stats.admins;
        statCards[2].querySelector('.stat-value').textContent = stats.pending;
        statCards[3].querySelector('.stat-value').textContent = stats.groups;
    }
}

// ==================== 成员列表渲染 ====================
function renderMemberList() {
    const tbody = document.querySelector('.member-table tbody');
    if (!tbody) return;
    
    // 获取过滤后的成员
    let filteredMembers = getFilteredMembers();
    
    // 分页
    const startIndex = (MembersData.currentPage - 1) * MembersData.pageSize;
    const endIndex = startIndex + MembersData.pageSize;
    const paginatedMembers = filteredMembers.slice(startIndex, endIndex);
    
    // 渲染表格
    tbody.innerHTML = paginatedMembers.map(member => `
        <tr data-member-id="${member.id}">
            <td class="col-member">
                <div class="member-info">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=${member.avatar}" alt="">
                    <div class="member-detail">
                        <span class="member-name">
                            ${member.name}
                            ${member.role === 'owner' ? '<span class="badge owner">所有者</span>' : ''}
                        </span>
                        <span class="member-email">${member.email}</span>
                    </div>
                </div>
            </td>
            <td class="col-role">
                <span class="role-badge ${member.role}">${roleLabels[member.role]}</span>
            </td>
            <td class="col-groups">
                ${member.groups.map(g => {
                    const group = MembersData.groups.find(grp => grp.name === g);
                    const color = group ? group.color : '#3b82f6';
                    return `<span class="group-tag" style="background: ${color}15; color: ${color}">${g}</span>`;
                }).join('')}
            </td>
            <td class="col-joined">${member.joinedAt}</td>
            <td class="col-actions">
                <button class="action-btn" title="更多" onclick="showMemberActionMenu(${member.id}, event)">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="1"/>
                        <circle cx="19" cy="12" r="1"/>
                        <circle cx="5" cy="12" r="1"/>
                    </svg>
                </button>
            </td>
        </tr>
    `).join('');
    
    // 更新分页信息
    updatePagination(filteredMembers.length);
}

function getFilteredMembers() {
    let members = [...MembersData.members];
    
    // 搜索过滤
    if (MembersData.searchQuery) {
        const query = MembersData.searchQuery.toLowerCase();
        members = members.filter(m => 
            m.name.toLowerCase().includes(query) ||
            m.email.toLowerCase().includes(query)
        );
    }
    
    // 角色过滤
    if (MembersData.roleFilter) {
        members = members.filter(m => m.role === MembersData.roleFilter);
    }
    
    // 用户组过滤
    if (MembersData.groupFilter) {
        const groupName = MembersData.groups.find(g => g.id === parseInt(MembersData.groupFilter))?.name;
        if (groupName) {
            members = members.filter(m => m.groups.includes(groupName));
        }
    }
    
    return members;
}

function updatePagination(totalCount) {
    const paginationInfo = document.querySelector('.pagination-info');
    const paginationControls = document.querySelector('.pagination-controls');
    
    if (!paginationInfo || !paginationControls) return;
    
    const startIndex = (MembersData.currentPage - 1) * MembersData.pageSize + 1;
    const endIndex = Math.min(MembersData.currentPage * MembersData.pageSize, totalCount);
    const totalPages = Math.ceil(totalCount / MembersData.pageSize);
    
    paginationInfo.textContent = `显示 ${startIndex}-${endIndex} 共 ${totalCount} 条`;
    
    // 渲染分页按钮
    let paginationHtml = `
        <button class="pagination-btn" ${MembersData.currentPage === 1 ? 'disabled' : ''} onclick="goToPage(${MembersData.currentPage - 1})">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="15 18 9 12 15 6"/>
            </svg>
        </button>
    `;
    
    for (let i = 1; i <= totalPages; i++) {
        paginationHtml += `
            <button class="pagination-btn ${i === MembersData.currentPage ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>
        `;
    }
    
    paginationHtml += `
        <button class="pagination-btn" ${MembersData.currentPage === totalPages ? 'disabled' : ''} onclick="goToPage(${MembersData.currentPage + 1})">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"/>
            </svg>
        </button>
    `;
    
    paginationControls.innerHTML = paginationHtml;
}

function goToPage(page) {
    const totalPages = Math.ceil(getFilteredMembers().length / MembersData.pageSize);
    if (page < 1 || page > totalPages) return;
    
    MembersData.currentPage = page;
    renderMemberList();
}

// ==================== 标签页切换 ====================
function switchTab(tabName) {
    MembersData.currentTab = tabName;
    MembersData.currentPage = 1;
    
    // 更新标签页样式
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // 根据标签页显示不同内容
    const memberList = document.querySelector('.member-list');
    
    if (tabName === 'all') {
        renderMemberList();
    } else if (tabName === 'groups') {
        renderGroupsList();
    } else if (tabName === 'pending') {
        renderPendingInvites();
    }
}

function renderGroupsList() {
    const memberList = document.querySelector('.member-list');
    if (!memberList) return;
    
    memberList.innerHTML = `
        <div class="groups-grid">
            ${MembersData.groups.map(group => `
                <div class="group-card" data-group-id="${group.id}">
                    <div class="group-header">
                        <div class="group-icon" style="background: ${group.color}20; color: ${group.color}">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                                <circle cx="9" cy="7" r="4"/>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                            </svg>
                        </div>
                        <div class="group-info">
                            <h4>${group.name}</h4>
                            <span>${group.memberCount} 名成员</span>
                        </div>
                        <button class="group-menu-btn" onclick="showGroupMenu(${group.id}, event)">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="1"/>
                                <circle cx="19" cy="12" r="1"/>
                                <circle cx="5" cy="12" r="1"/>
                            </svg>
                        </button>
                    </div>
                    <div class="group-members">
                        ${getGroupMembers(group.name).slice(0, 5).map(m => `
                            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=${m.avatar}" alt="${m.name}" title="${m.name}">
                        `).join('')}
                        ${getGroupMembers(group.name).length > 5 ? `<span class="more-members">+${getGroupMembers(group.name).length - 5}</span>` : ''}
                    </div>
                    <div class="group-actions">
                        <button class="btn btn-sm btn-outline" onclick="editGroup(${group.id})">编辑</button>
                        <button class="btn btn-sm btn-outline" onclick="manageGroupMembers(${group.id})">管理成员</button>
                    </div>
                </div>
            `).join('')}
            <div class="group-card add-group" onclick="showCreateGroupModal()">
                <div class="add-group-content">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="12" y1="5" x2="12" y2="19"/>
                        <line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    <span>创建用户组</span>
                </div>
            </div>
        </div>
    `;
}

function getGroupMembers(groupName) {
    return MembersData.members.filter(m => m.groups.includes(groupName));
}

function renderPendingInvites() {
    const memberList = document.querySelector('.member-list');
    if (!memberList) return;
    
    if (MembersData.pendingInvites.length === 0) {
        memberList.innerHTML = `
            <div class="empty-state">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="8.5" cy="7" r="4"/>
                    <line x1="20" y1="8" x2="20" y2="14"/>
                    <line x1="23" y1="11" x2="17" y2="11"/>
                </svg>
                <h3>暂无待接受的邀请</h3>
                <p>点击"邀请成员"按钮邀请新成员加入团队</p>
            </div>
        `;
        return;
    }
    
    memberList.innerHTML = `
        <table class="member-table">
            <thead>
                <tr>
                    <th class="col-member">邮箱</th>
                    <th class="col-role">角色</th>
                    <th class="col-groups">用户组</th>
                    <th class="col-joined">邀请时间</th>
                    <th class="col-actions"></th>
                </tr>
            </thead>
            <tbody>
                ${MembersData.pendingInvites.map(invite => `
                    <tr data-invite-id="${invite.id}">
                        <td class="col-member">
                            <div class="member-info">
                                <div class="pending-avatar">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <circle cx="12" cy="12" r="10"/>
                                        <polyline points="12 6 12 12 16 14"/>
                                    </svg>
                                </div>
                                <div class="member-detail">
                                    <span class="member-email">${invite.email}</span>
                                    <span class="invite-by">由 ${invite.invitedBy} 邀请</span>
                                </div>
                            </div>
                        </td>
                        <td class="col-role">
                            <span class="role-badge ${invite.role}">${roleLabels[invite.role]}</span>
                        </td>
                        <td class="col-groups">
                            ${invite.groups.length > 0 ? invite.groups.map(g => `<span class="group-tag">${g}</span>`).join('') : '<span class="no-group">未分配</span>'}
                        </td>
                        <td class="col-joined">${invite.invitedAt}</td>
                        <td class="col-actions">
                            <button class="btn btn-sm btn-outline" onclick="resendInvite(${invite.id})">重新发送</button>
                            <button class="btn btn-sm btn-text danger" onclick="cancelInvite(${invite.id})">取消</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// ==================== 邀请成员 ====================
function openInviteModal() {
    const modal = document.getElementById('inviteModal');
    if (modal) {
        modal.classList.add('active');
    }
}

function closeInviteModal() {
    const modal = document.getElementById('inviteModal');
    if (modal) {
        modal.classList.remove('active');
        // 清空表单
        const textarea = modal.querySelector('.form-textarea');
        if (textarea) textarea.value = '';
    }
}

function switchInviteTab(tabName) {
    document.querySelectorAll('.invite-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');
    
    const inviteContent = document.querySelector('.invite-content');
    
    if (tabName === 'email') {
        inviteContent.innerHTML = `
            <div class="form-group">
                <label>邮箱地址</label>
                <textarea class="form-textarea" rows="4" placeholder="输入邮箱地址，多个邮箱用换行或逗号分隔" id="inviteEmails"></textarea>
                <p class="form-hint">支持一次邀请多个成员</p>
            </div>
            
            <div class="form-group">
                <label>角色</label>
                <select class="form-select" id="inviteRole">
                    <option value="member">普通成员</option>
                    <option value="admin">管理员</option>
                </select>
            </div>
            
            <div class="form-group">
                <label>用户组（可选）</label>
                <div class="checkbox-group">
                    ${MembersData.groups.map(g => `
                        <label class="checkbox-item">
                            <input type="checkbox" value="${g.id}">
                            <span>${g.name}</span>
                        </label>
                    `).join('')}
                </div>
            </div>
            
            <div class="form-group">
                <label>邀请消息（可选）</label>
                <textarea class="form-textarea" rows="2" placeholder="添加一条欢迎消息..." id="inviteMessage"></textarea>
            </div>
        `;
    } else if (tabName === 'link') {
        const inviteLink = `https://mota.example.com/invite/abc123xyz`;
        inviteContent.innerHTML = `
            <div class="invite-link-section">
                <p>分享以下链接邀请成员加入团队：</p>
                <div class="invite-link-box">
                    <input type="text" value="${inviteLink}" readonly id="inviteLinkInput">
                    <button class="btn btn-primary" onclick="copyInviteLink()">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                        </svg>
                        复制
                    </button>
                </div>
                <div class="link-settings">
                    <div class="form-group">
                        <label>链接有效期</label>
                        <select class="form-select">
                            <option value="7">7 天</option>
                            <option value="30">30 天</option>
                            <option value="0">永不过期</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>默认角色</label>
                        <select class="form-select">
                            <option value="member">普通成员</option>
                            <option value="admin">管理员</option>
                        </select>
                    </div>
                </div>
                <button class="btn btn-outline" onclick="regenerateInviteLink()">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="23 4 23 10 17 10"/>
                        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                    </svg>
                    重新生成链接
                </button>
            </div>
        `;
    }
}

function sendInvite() {
    const emailsTextarea = document.getElementById('inviteEmails');
    const roleSelect = document.getElementById('inviteRole');
    const messageTextarea = document.getElementById('inviteMessage');
    
    if (!emailsTextarea) return;
    
    const emails = emailsTextarea.value.trim();
    if (!emails) {
        showToast('请输入邮箱地址', 'error');
        return;
    }
    
    // 解析邮箱
    const emailList = emails.split(/[,\n]/).map(e => e.trim()).filter(e => e);
    
    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidEmails = emailList.filter(e => !emailRegex.test(e));
    
    if (invalidEmails.length > 0) {
        showToast(`邮箱格式不正确: ${invalidEmails.join(', ')}`, 'error');
        return;
    }
    
    // 获取选中的用户组
    const selectedGroups = [];
    document.querySelectorAll('.checkbox-group input:checked').forEach(checkbox => {
        const group = MembersData.groups.find(g => g.id === parseInt(checkbox.value));
        if (group) selectedGroups.push(group.name);
    });
    
    // 添加到待邀请列表
    emailList.forEach(email => {
        const newInvite = {
            id: Math.max(...MembersData.pendingInvites.map(i => i.id), 100) + 1,
            email: email,
            role: roleSelect?.value || 'member',
            groups: selectedGroups,
            invitedAt: new Date().toISOString().split('T')[0],
            invitedBy: '张三'
        };
        MembersData.pendingInvites.push(newInvite);
    });
    
    closeInviteModal();
    updateStats();
    
    showToast(`已发送 ${emailList.length} 封邀请`, 'success');
}

function copyInviteLink() {
    const input = document.getElementById('inviteLinkInput');
    if (input) {
        input.select();
        navigator.clipboard.writeText(input.value).then(() => {
            showToast('链接已复制到剪贴板', 'success');
        });
    }
}

function regenerateInviteLink() {
    const input = document.getElementById('inviteLinkInput');
    if (input) {
        const newLink = `https://mota.example.com/invite/${Math.random().toString(36).substr(2, 12)}`;
        input.value = newLink;
        showToast('已生成新的邀请链接', 'success');
    }
}

function resendInvite(inviteId) {
    const invite = MembersData.pendingInvites.find(i => i.id === inviteId);
    if (invite) {
        showToast(`已重新发送邀请到 ${invite.email}`, 'success');
    }
}

function cancelInvite(inviteId) {
    if (!confirm('确定要取消此邀请吗？')) return;
    
    MembersData.pendingInvites = MembersData.pendingInvites.filter(i => i.id !== inviteId);
    renderPendingInvites();
    updateStats();
    
    showToast('邀请已取消', 'success');
}

// ==================== 成员操作菜单 ====================
function showMemberActionMenu(memberId, event) {
    event.stopPropagation();
    
    MembersData.selectedMemberId = memberId;
    const member = MembersData.members.find(m => m.id === memberId);
    
    // 移除已有菜单
    removeActionMenu();
    
    const menu = document.createElement('div');
    menu.className = 'member-action-menu active';
    menu.id = 'memberActionMenu';
    
    const isOwner = member?.role === 'owner';
    
    menu.innerHTML = `
        <div class="dropdown-item" onclick="viewMemberProfile(${memberId})">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
            </svg>
            <span>查看资料</span>
        </div>
        ${!isOwner ? `
            <div class="dropdown-item" onclick="showChangeRoleModal(${memberId})">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                <span>更改角色</span>
            </div>
        ` : ''}
        <div class="dropdown-item" onclick="showManageGroupsModal(${memberId})">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="7" height="7"/>
                <rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/>
            </svg>
            <span>管理用户组</span>
        </div>
        ${!isOwner ? `
            <div class="dropdown-divider"></div>
            <div class="dropdown-item danger" onclick="removeMember(${memberId})">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
                <span>移除成员</span>
            </div>
        ` : ''}
    `;
    
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    
    menu.style.top = `${rect.bottom + 4}px`;
    menu.style.left = `${rect.left - 120}px`;
    
    document.body.appendChild(menu);
    
    // 点击其他地方关闭菜单
    setTimeout(() => {
        document.addEventListener('click', removeActionMenu, { once: true });
    }, 0);
}

function removeActionMenu() {
    const menu = document.getElementById('memberActionMenu');
    if (menu) {
        menu.remove();
    }
}

function viewMemberProfile(memberId) {
    removeActionMenu();
    const member = MembersData.members.find(m => m.id === memberId);
    if (member) {
        showToast(`查看 ${member.name} 的资料`, 'info');
        // 可以跳转到成员详情页或显示弹窗
    }
}

function showChangeRoleModal(memberId) {
    removeActionMenu();
    
    const member = MembersData.members.find(m => m.id === memberId);
    if (!member) return;
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.id = 'changeRoleModal';
    modal.innerHTML = `
        <div class="modal" style="width: 400px;">
            <div class="modal-header">
                <h3>更改角色</h3>
                <button class="modal-close" onclick="document.getElementById('changeRoleModal').remove()">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            </div>
            <div class="modal-body">
                <p style="margin-bottom: 16px;">为 <strong>${member.name}</strong> 选择新角色：</p>
                <div class="role-options">
                    <label class="role-option ${member.role === 'admin' ? 'selected' : ''}">
                        <input type="radio" name="newRole" value="admin" ${member.role === 'admin' ? 'checked' : ''}>
                        <div class="role-option-content">
                            <span class="role-option-title">管理员</span>
                            <span class="role-option-desc">可以管理团队设置和成员</span>
                        </div>
                    </label>
                    <label class="role-option ${member.role === 'member' ? 'selected' : ''}">
                        <input type="radio" name="newRole" value="member" ${member.role === 'member' ? 'checked' : ''}>
                        <div class="role-option-content">
                            <span class="role-option-title">普通成员</span>
                            <span class="role-option-desc">可以参与项目开发</span>
                        </div>
                    </label>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-outline" onclick="document.getElementById('changeRoleModal').remove()">取消</button>
                <button class="btn btn-primary" onclick="confirmChangeRole(${memberId})">确认更改</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // 绑定选项点击事件
    modal.querySelectorAll('.role-option').forEach(option => {
        option.addEventListener('click', function() {
            modal.querySelectorAll('.role-option').forEach(o => o.classList.remove('selected'));
            this.classList.add('selected');
            this.querySelector('input').checked = true;
        });
    });
}

function confirmChangeRole(memberId) {
    const selectedRole = document.querySelector('input[name="newRole"]:checked')?.value;
    if (!selectedRole) return;
    
    const member = MembersData.members.find(m => m.id === memberId);
    if (member) {
        member.role = selectedRole;
        renderMemberList();
        updateStats();
        showToast(`已将 ${member.name} 的角色更改为${roleLabels[selectedRole]}`, 'success');
    }
    
    document.getElementById('changeRoleModal')?.remove();
}

function showManageGroupsModal(memberId) {
    removeActionMenu();
    
    const member = MembersData.members.find(m => m.id === memberId);
    if (!member) return;
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.id = 'manageGroupsModal';
    modal.innerHTML = `
        <div class="modal" style="width: 400px;">
            <div class="modal-header">
                <h3>管理用户组</h3>
                <button class="modal-close" onclick="document.getElementById('manageGroupsModal').remove()">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            </div>
            <div class="modal-body">
                <p style="margin-bottom: 16px;">为 <strong>${member.name}</strong> 选择用户组：</p>
                <div class="checkbox-group vertical">
                    ${MembersData.groups.map(g => `
                        <label class="checkbox-item">
                            <input type="checkbox" value="${g.name}" ${member.groups.includes(g.name) ? 'checked' : ''}>
                            <span style="display: flex; align-items: center; gap: 8px;">
                                <span class="group-color" style="width: 12px; height: 12px; border-radius: 50%; background: ${g.color}"></span>
                                ${g.name}
                            </span>
                        </label>
                    `).join('')}
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-outline" onclick="document.getElementById('manageGroupsModal').remove()">取消</button>
                <button class="btn btn-primary" onclick="confirmManageGroups(${memberId})">保存</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function confirmManageGroups(memberId) {
    const member = MembersData.members.find(m => m.id === memberId);
    if (!member) return;
    
    const selectedGroups = [];
    document.querySelectorAll('#manageGroupsModal .checkbox-item input:checked').forEach(checkbox => {
        selectedGroups.push(checkbox.value);
    });
    
    member.groups = selectedGroups;
    renderMemberList();
    
    // 更新用户组成员数
    MembersData.groups.forEach(g => {
        g.memberCount = MembersData.members.filter(m => m.groups.includes(g.name)).length;
    });
    
    showToast(`已更新 ${member.name} 的用户组`, 'success');
    document.getElementById('manageGroupsModal')?.remove();
}

function removeMember(memberId) {
    removeActionMenu();
    
    const member = MembersData.members.find(m => m.id === memberId);
    if (!member) return;
    
    if (member.role === 'owner') {
        showToast('无法移除团队所有者', 'error');
        return;
    }
    
    if (!confirm(`确定要移除成员 ${member.name} 吗？此操作不可恢复。`)) {
        return;
    }
    
    MembersData.members = MembersData.members.filter(m => m.id !== memberId);
    
    // 更新用户组成员数
    MembersData.groups.forEach(g => {
        g.memberCount = MembersData.members.filter(m => m.groups.includes(g.name)).length;
    });
    
    renderMemberList();
    updateStats();
    
    showToast(`已移除成员 ${member.name}`, 'success');
}

// ==================== 用户组操作 ====================
function showCreateGroupModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.id = 'createGroupModal';
    modal.innerHTML = `
        <div class="modal" style="width: 400px;">
            <div class="modal-header">
                <h3>创建用户组</h3>
                <button class="modal-close" onclick="document.getElementById('createGroupModal').remove()">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label>用户组名称 <span class="required">*</span></label>
                    <input type="text" id="newGroupName" placeholder="例如：前端组">
                </div>
                <div class="form-group">
                    <label>颜色</label>
                    <div class="color-picker">
                        <button class="color-option selected" data-color="#3b82f6" style="background: #3b82f6"></button>
                        <button class="color-option" data-color="#22c55e" style="background: #22c55e"></button>
                        <button class="color-option" data-color="#f59e0b" style="background: #f59e0b"></button>
                        <button class="color-option" data-color="#8b5cf6" style="background: #8b5cf6"></button>
                        <button class="color-option" data-color="#ef4444" style="background: #ef4444"></button>
                        <button class="color-option" data-color="#06b6d4" style="background: #06b6d4"></button>
                    </div>
                </div>
                <div class="form-group">
                    <label>描述（可选）</label>
                    <textarea id="newGroupDesc" rows="2" placeholder="用户组描述..."></textarea>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-outline" onclick="document.getElementById('createGroupModal').remove()">取消</button>
                <button class="btn btn-primary" onclick="confirmCreateGroup()">创建</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // 绑定颜色选择
    modal.querySelectorAll('.color-option').forEach(option => {
        option.addEventListener('click', function() {
            modal.querySelectorAll('.color-option').forEach(o => o.classList.remove('selected'));
            this.classList.add('selected');
        });
    });
}

function confirmCreateGroup() {
    const nameInput = document.getElementById('newGroupName');
    const name = nameInput?.value.trim();
    
    if (!name) {
        showToast('请输入用户组名称', 'error');
        return;
    }
    
    // 检查名称是否已存在
    if (MembersData.groups.some(g => g.name === name)) {
        showToast('用户组名称已存在', 'error');
        return;
    }
    
    const selectedColor = document.querySelector('.color-option.selected')?.dataset.color || '#3b82f6';
    
    const newGroup = {
        id: Math.max(...MembersData.groups.map(g => g.id)) + 1,
        name: name,
        color: selectedColor,
        memberCount: 0
    };
    
    MembersData.groups.push(newGroup);
    
    document.getElementById('createGroupModal')?.remove();
    renderGroupsList();
    updateStats();
    
    showToast(`用户组 "${name}" 创建成功`, 'success');
}

function editGroup(groupId) {
    const group = MembersData.groups.find(g => g.id === groupId);
    if (!group) return;
    
    const newName = prompt('请输入新的用户组名称：', group.name);
    if (!newName || !newName.trim() || newName.trim() === group.name) return;
    
    // 更新成员中的用户组名称
    MembersData.members.forEach(m => {
        const index = m.groups.indexOf(group.name);
        if (index !== -1) {
            m.groups[index] = newName.trim();
        }
    });
    
    group.name = newName.trim();
    renderGroupsList();
    
    showToast('用户组已更新', 'success');
}

function manageGroupMembers(groupId) {
    const group = MembersData.groups.find(g => g.id === groupId);
    if (!group) return;
    
    const groupMembers = getGroupMembers(group.name);
    const otherMembers = MembersData.members.filter(m => !m.groups.includes(group.name));
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.id = 'groupMembersModal';
    modal.innerHTML = `
        <div class="modal" style="width: 500px;">
            <div class="modal-header">
                <h3>管理 ${group.name} 成员</h3>
                <button class="modal-close" onclick="document.getElementById('groupMembersModal').remove()">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            </div>
            <div class="modal-body">
                <div class="group-members-section">
                    <h4>当前成员 (${groupMembers.length})</h4>
                    <div class="members-list">
                        ${groupMembers.map(m => `
                            <div class="member-item">
                                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=${m.avatar}" alt="">
                                <span>${m.name}</span>
                                <button class="btn btn-sm btn-text danger" onclick="removeFromGroup(${m.id}, '${group.name}')">移除</button>
                            </div>
                        `).join('')}
                        ${groupMembers.length === 0 ? '<p class="empty-text">暂无成员</p>' : ''}
                    </div>
                </div>
                <div class="group-members-section">
                    <h4>添加成员</h4>
                    <div class="members-list">
                        ${otherMembers.map(m => `
                            <div class="member-item">
                                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=${m.avatar}" alt="">
                                <span>${m.name}</span>
                                <button class="btn btn-sm btn-outline" onclick="addToGroup(${m.id}, '${group.name}')">添加</button>
                            </div>
                        `).join('')}
                        ${otherMembers.length === 0 ? '<p class="empty-text">所有成员都已在此用户组中</p>' : ''}
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-primary" onclick="document.getElementById('groupMembersModal').remove()">完成</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function addToGroup(memberId, groupName) {
    const member = MembersData.members.find(m => m.id === memberId);
    if (member && !member.groups.includes(groupName)) {
        member.groups.push(groupName);
        
        // 更新用户组成员数
        const group = MembersData.groups.find(g => g.name === groupName);
        if (group) group.memberCount++;
        
        // 刷新弹窗
        document.getElementById('groupMembersModal')?.remove();
        manageGroupMembers(MembersData.groups.find(g => g.name === groupName)?.id);
        
        showToast(`已将 ${member.name} 添加到 ${groupName}`, 'success');
    }
}

function removeFromGroup(memberId, groupName) {
    const member = MembersData.members.find(m => m.id === memberId);
    if (member) {
        member.groups = member.groups.filter(g => g !== groupName);
        
        // 更新用户组成员数
        const group = MembersData.groups.find(g => g.name === groupName);
        if (group) group.memberCount--;
        
        // 刷新弹窗
        document.getElementById('groupMembersModal')?.remove();
        manageGroupMembers(MembersData.groups.find(g => g.name === groupName)?.id);
        
        showToast(`已将 ${member.name} 从 ${groupName} 移除`, 'success');
    }
}

function showGroupMenu(groupId, event) {
    event.stopPropagation();
    
    removeActionMenu();
    
    const group = MembersData.groups.find(g => g.id === groupId);
    if (!group) return;
    
    const menu = document.createElement('div');
    menu.className = 'member-action-menu active';
    menu.id = 'memberActionMenu';
    menu.innerHTML = `
        <div class="dropdown-item" onclick="editGroup(${groupId})">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            <span>编辑用户组</span>
        </div>
        <div class="dropdown-item" onclick="manageGroupMembers(${groupId})">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <span>管理成员</span>
        </div>
        <div class="dropdown-divider"></div>
        <div class="dropdown-item danger" onclick="deleteGroup(${groupId})">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
            <span>删除用户组</span>
        </div>
    `;
    
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    
    menu.style.top = `${rect.bottom + 4}px`;
    menu.style.left = `${rect.left - 120}px`;
    
    document.body.appendChild(menu);
    
    setTimeout(() => {
        document.addEventListener('click', removeActionMenu, { once: true });
    }, 0);
}

function deleteGroup(groupId) {
    removeActionMenu();
    
    const group = MembersData.groups.find(g => g.id === groupId);
    if (!group) return;
    
    if (!confirm(`确定要删除用户组 "${group.name}" 吗？成员将从此用户组中移除。`)) {
        return;
    }
    
    // 从成员中移除此用户组
    MembersData.members.forEach(m => {
        m.groups = m.groups.filter(g => g !== group.name);
    });
    
    // 删除用户组
    MembersData.groups = MembersData.groups.filter(g => g.id !== groupId);
    
    renderGroupsList();
    updateStats();
    
    showToast(`用户组 "${group.name}" 已删除`, 'success');
}

// ==================== 搜索和筛选 ====================
function searchMembers(query) {
    MembersData.searchQuery = query;
    MembersData.currentPage = 1;
    renderMemberList();
}

function filterByRole(role) {
    MembersData.roleFilter = role;
    MembersData.currentPage = 1;
    renderMemberList();
}

function filterByGroup(groupId) {
    MembersData.groupFilter = groupId;
    MembersData.currentPage = 1;
    renderMemberList();
}

// ==================== 事件绑定 ====================
function bindMemberEvents() {
    // 邀请按钮
    const inviteBtn = document.getElementById('inviteBtn');
    if (inviteBtn) {
        inviteBtn.addEventListener('click', openInviteModal);
    }
    
    // 关闭邀请模态框
    const closeInviteModalBtn = document.getElementById('closeInviteModal');
    if (closeInviteModalBtn) {
        closeInviteModalBtn.addEventListener('click', closeInviteModal);
    }
    
    const cancelInviteBtn = document.getElementById('cancelInvite');
    if (cancelInviteBtn) {
        cancelInviteBtn.addEventListener('click', closeInviteModal);
    }
    
    // 发送邀请按钮
    const sendInviteBtn = document.querySelector('#inviteModal .modal-footer .btn-primary');
    if (sendInviteBtn) {
        sendInviteBtn.addEventListener('click', sendInvite);
    }
    
    // 标签页切换
    document.querySelectorAll('.tab-btn').forEach((btn, index) => {
        btn.addEventListener('click', function(e) {
            const tabs = ['all', 'groups', 'pending'];
            switchTab(tabs[index]);
        });
    });
    
    // 邀请标签页切换
    document.querySelectorAll('.invite-tab').forEach((tab, index) => {
        tab.addEventListener('click', function() {
            const tabs = ['email', 'link'];
            switchInviteTab(tabs[index]);
        });
    });
    
    // 搜索输入
    const searchInput = document.querySelector('.member-toolbar .search-box input');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(function() {
            searchMembers(this.value.trim());
        }, 300));
    }
    
    // 角色筛选
    const roleSelect = document.querySelector('.filter-group select:first-child');
    if (roleSelect) {
        roleSelect.addEventListener('change', function() {
            filterByRole(this.value);
        });
    }
    
    // 用户组筛选
    const groupSelect = document.querySelector('.filter-group select:last-child');
    if (groupSelect) {
        // 填充用户组选项
        groupSelect.innerHTML = `
            <option value="">所有用户组</option>
            ${MembersData.groups.map(g => `<option value="${g.id}">${g.name}</option>`).join('')}
        `;
        
        groupSelect.addEventListener('change', function() {
            filterByGroup(this.value);
        });
    }
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
            background: ${type === 'success' ? '#22c55e' : type === 'error' ? '#ef4444' : '#3b82f6'};
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
const membersStyles = document.createElement('style');
membersStyles.textContent = `
    /* 用户组网格 */
    .groups-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 20px;
        padding: 20px 0;
    }
    
    .group-card {
        background: #fff;
        border: 1px solid var(--border-light);
        border-radius: var(--radius-lg);
        padding: 20px;
        transition: all 0.2s;
    }
    
    .group-card:hover {
        border-color: var(--primary-color);
        box-shadow: var(--shadow-sm);
    }
    
    .group-header {
        display: flex;
        align-items: flex-start;
        gap: 16px;
        margin-bottom: 16px;
    }
    
    .group-icon {
        width: 48px;
        height: 48px;
        border-radius: var(--radius-md);
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .group-info {
        flex: 1;
    }
    
    .group-info h4 {
        font-size: 16px;
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 4px;
    }
    
    .group-info span {
        font-size: 13px;
        color: var(--text-secondary);
    }
    
    .group-menu-btn {
        padding: 4px;
        background: none;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        color: var(--text-secondary);
        opacity: 0;
        transition: all 0.2s;
    }
    
    .group-card:hover .group-menu-btn {
        opacity: 1;
    }
    
    .group-menu-btn:hover {
        background: var(--bg-light);
        color: var(--primary-color);
    }
    
    .group-members {
        display: flex;
        align-items: center;
        margin-bottom: 16px;
    }
    
    .group-members img {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 2px solid #fff;
        margin-left: -8px;
    }
    
    .group-members img:first-child {
        margin-left: 0;
    }
    
    .more-members {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: var(--bg-light);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        color: var(--text-secondary);
        margin-left: -8px;
    }
    
    .group-actions {
        display: flex;
        gap: 8px;
    }
    
    .group-card.add-group {
        border-style: dashed;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 180px;
    }
    
    .add-group-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        color: var(--text-secondary);
    }
    
    .add-group-content svg {
        opacity: 0.5;
    }
    
    .group-card.add-group:hover {
        border-color: var(--primary-color);
        color: var(--primary-color);
    }
    
    .group-card.add-group:hover .add-group-content {
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
    
    /* 待邀请样式 */
    .pending-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: var(--bg-light);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--text-secondary);
    }
    
    .invite-by {
        font-size: 12px;
        color: var(--text-placeholder);
    }
    
    .no-group {
        font-size: 12px;
        color: var(--text-placeholder);
    }
    
    /* 邀请链接 */
    .invite-link-section {
        text-align: center;
    }
    
    .invite-link-section > p {
        margin-bottom: 16px;
        color: var(--text-secondary);
    }
    
    .invite-link-box {
        display: flex;
        gap: 8px;
        margin-bottom: 20px;
    }
    
    .invite-link-box input {
        flex: 1;
        padding: 10px 14px;
        border: 1px solid var(--border-light);
        border-radius: var(--radius-md);
        font-size: 13px;
        background: var(--bg-light);
    }
    
    .link-settings {
        display: flex;
        gap: 16px;
        margin-bottom: 20px;
    }
    
    .link-settings .form-group {
        flex: 1;
    }
    
    /* 角色选项 */
    .role-options {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }
    
    .role-option {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        padding: 16px;
        border: 1px solid var(--border-light);
        border-radius: var(--radius-md);
        cursor: pointer;
        transition: all 0.2s;
    }
    
    .role-option:hover {
        border-color: var(--primary-color);
    }
    
    .role-option.selected {
        border-color: var(--primary-color);
        background: var(--primary-light);
    }
    
    .role-option input {
        margin-top: 2px;
    }
    
    .role-option-content {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }
    
    .role-option-title {
        font-weight: 500;
        color: var(--text-primary);
    }
    
    .role-option-desc {
        font-size: 12px;
        color: var(--text-secondary);
    }
    
    /* 颜色选择器 */
    .color-picker {
        display: flex;
        gap: 8px;
    }
    
    .color-option {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 2px solid transparent;
        cursor: pointer;
        transition: all 0.2s;
    }
    
    .color-option:hover {
        transform: scale(1.1);
    }
    
    .color-option.selected {
        border-color: var(--text-primary);
        box-shadow: 0 0 0 2px #fff, 0 0 0 4px var(--text-primary);
    }
    
    /* 用户组成员管理 */
    .group-members-section {
        margin-bottom: 24px;
    }
    
    .group-members-section:last-child {
        margin-bottom: 0;
    }
    
    .group-members-section h4 {
        font-size: 14px;
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 12px;
    }
    
    .members-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
        max-height: 200px;
        overflow-y: auto;
    }
    
    .member-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 8px 12px;
        background: var(--bg-light);
        border-radius: var(--radius-md);
    }
    
    .member-item img {
        width: 32px;
        height: 32px;
        border-radius: 50%;
    }
    
    .member-item span {
        flex: 1;
        font-size: 14px;
        color: var(--text-primary);
    }
    
    .empty-text {
        font-size: 13px;
        color: var(--text-secondary);
        text-align: center;
        padding: 20px;
    }
    
    /* 垂直复选框组 */
    .checkbox-group.vertical {
        flex-direction: column;
    }
    
    .checkbox-group.vertical .checkbox-item {
        padding: 8px 0;
    }
`;
document.head.appendChild(membersStyles);