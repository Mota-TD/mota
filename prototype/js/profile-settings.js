/**
 * 摩塔 Mota - 个人设置模块 JavaScript
 * 实现用户个人设置的所有交互功能
 */

// ==================== 用户数据模型 ====================
const ProfileData = {
    // 用户基本信息
    user: {
        id: 1,
        name: '张三',
        username: 'zhangsan',
        email: 'zhangsan@example.com',
        phone: '138****8888',
        avatar: 'zhangsan',
        bio: '全栈开发工程师，热爱开源技术',
        company: '摩塔科技',
        location: '北京',
        website: 'https://zhangsan.dev',
        github: 'zhangsan',
        createdAt: '2023-06-15',
        lastLogin: '2024-01-18 14:30'
    },
    
    // 安全设置
    security: {
        twoFactorEnabled: false,
        twoFactorMethod: null, // 'app' | 'sms'
        passwordLastChanged: '2023-12-01',
        loginHistory: [
            { id: 1, ip: '192.168.1.100', location: '北京', device: 'Chrome on Windows', time: '2024-01-18 14:30', status: 'success' },
            { id: 2, ip: '192.168.1.100', location: '北京', device: 'Chrome on Windows', time: '2024-01-17 09:15', status: 'success' },
            { id: 3, ip: '10.0.0.50', location: '上海', device: 'Safari on macOS', time: '2024-01-16 18:45', status: 'success' },
            { id: 4, ip: '172.16.0.1', location: '广州', device: 'Firefox on Linux', time: '2024-01-15 11:20', status: 'failed' },
            { id: 5, ip: '192.168.1.100', location: '北京', device: 'Chrome on Windows', time: '2024-01-14 08:00', status: 'success' }
        ],
        activeSessions: [
            { id: 1, device: 'Chrome on Windows', ip: '192.168.1.100', location: '北京', lastActive: '刚刚', current: true },
            { id: 2, device: 'Safari on macOS', ip: '10.0.0.50', location: '上海', lastActive: '2天前', current: false }
        ]
    },
    
    // SSH 密钥
    sshKeys: [
        { id: 1, name: '工作电脑', fingerprint: 'SHA256:abc123...', createdAt: '2023-07-20', lastUsed: '2024-01-18' },
        { id: 2, name: '家用笔记本', fingerprint: 'SHA256:def456...', createdAt: '2023-08-15', lastUsed: '2024-01-10' }
    ],
    
    // 访问令牌
    accessTokens: [
        { id: 1, name: 'CI/CD Pipeline', scopes: ['read_api', 'write_repository'], createdAt: '2023-09-01', lastUsed: '2024-01-18', expiresAt: '2024-09-01' },
        { id: 2, name: 'IDE 插件', scopes: ['read_api'], createdAt: '2023-10-15', lastUsed: '2024-01-17', expiresAt: null }
    ],
    
    // 偏好设置
    preferences: {
        theme: 'light', // 'light' | 'dark' | 'system'
        language: 'zh-CN',
        timezone: 'Asia/Shanghai',
        dateFormat: 'YYYY-MM-DD',
        codeEditor: {
            theme: 'vs-dark',
            fontSize: 14,
            tabSize: 4,
            wordWrap: true,
            minimap: true
        },
        notifications: {
            email: true,
            browser: true,
            mobile: false
        }
    },
    
    // 当前设置标签页
    currentTab: 'profile'
};

// ==================== 初始化 ====================
document.addEventListener('DOMContentLoaded', function() {
    initProfileSettings();
});

function initProfileSettings() {
    // 加载用户信息
    loadUserProfile();
    
    // 加载安全设置
    loadSecuritySettings();
    
    // 加载 SSH 密钥
    loadSSHKeys();
    
    // 加载访问令牌
    loadAccessTokens();
    
    // 加载偏好设置
    loadPreferences();
    
    // 绑定事件
    bindProfileEvents();
    
    // 初始化标签页
    initTabs();
    
    console.log('Profile settings module initialized');
}

// ==================== 标签页管理 ====================
function initTabs() {
    const tabs = document.querySelectorAll('.settings-nav-item');
    const sections = document.querySelectorAll('.settings-section');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href')?.replace('#', '') || this.dataset.tab;
            
            // 更新标签页状态
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // 更新内容区域
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === targetId) {
                    section.classList.add('active');
                }
            });
            
            ProfileData.currentTab = targetId;
        });
    });
}

// ==================== 用户资料管理 ====================
function loadUserProfile() {
    const user = ProfileData.user;
    
    // 填充表单
    setInputValue('userName', user.name);
    setInputValue('userUsername', user.username);
    setInputValue('userEmail', user.email);
    setInputValue('userPhone', user.phone);
    setInputValue('userBio', user.bio);
    setInputValue('userCompany', user.company);
    setInputValue('userLocation', user.location);
    setInputValue('userWebsite', user.website);
    setInputValue('userGithub', user.github);
    
    // 更新头像
    const avatarImg = document.querySelector('.profile-avatar img');
    if (avatarImg) {
        avatarImg.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.avatar}`;
    }
    
    // 更新用户名显示
    const usernameDisplay = document.querySelector('.profile-username');
    if (usernameDisplay) {
        usernameDisplay.textContent = `@${user.username}`;
    }
}

function setInputValue(id, value) {
    const input = document.getElementById(id);
    if (input) {
        input.value = value || '';
    }
}

function saveUserProfile() {
    const user = ProfileData.user;
    
    // 获取表单值
    const name = document.getElementById('userName')?.value.trim();
    const username = document.getElementById('userUsername')?.value.trim();
    const email = document.getElementById('userEmail')?.value.trim();
    const phone = document.getElementById('userPhone')?.value.trim();
    const bio = document.getElementById('userBio')?.value.trim();
    const company = document.getElementById('userCompany')?.value.trim();
    const location = document.getElementById('userLocation')?.value.trim();
    const website = document.getElementById('userWebsite')?.value.trim();
    const github = document.getElementById('userGithub')?.value.trim();
    
    // 验证必填字段
    if (!name) {
        showToast('请输入姓名', 'error');
        return;
    }
    
    if (!username) {
        showToast('请输入用户名', 'error');
        return;
    }
    
    // 验证用户名格式
    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!usernameRegex.test(username)) {
        showToast('用户名只能包含字母、数字、下划线和连字符', 'error');
        return;
    }
    
    if (!email) {
        showToast('请输入邮箱', 'error');
        return;
    }
    
    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showToast('邮箱格式不正确', 'error');
        return;
    }
    
    // 更新数据
    user.name = name;
    user.username = username;
    user.email = email;
    user.phone = phone;
    user.bio = bio;
    user.company = company;
    user.location = location;
    user.website = website;
    user.github = github;
    
    showToast('个人资料已保存', 'success');
}

function uploadAvatar() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        // 验证文件大小
        if (file.size > 2 * 1024 * 1024) {
            showToast('图片大小不能超过 2MB', 'error');
            return;
        }
        
        // 验证文件类型
        if (!file.type.startsWith('image/')) {
            showToast('请选择图片文件', 'error');
            return;
        }
        
        // 预览图片
        const reader = new FileReader();
        reader.onload = function(e) {
            const avatarImg = document.querySelector('.profile-avatar img');
            if (avatarImg) {
                avatarImg.src = e.target.result;
            }
            showToast('头像已更新', 'success');
        };
        reader.readAsDataURL(file);
    };
    
    input.click();
}

function removeAvatar() {
    const avatarImg = document.querySelector('.profile-avatar img');
    if (avatarImg) {
        avatarImg.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=default`;
    }
    showToast('头像已移除', 'success');
}

// ==================== 安全设置 ====================
function loadSecuritySettings() {
    const security = ProfileData.security;
    
    // 双因素认证状态
    const twoFactorStatus = document.querySelector('.two-factor-status');
    if (twoFactorStatus) {
        twoFactorStatus.innerHTML = security.twoFactorEnabled
            ? '<span class="status-badge enabled">已启用</span>'
            : '<span class="status-badge disabled">未启用</span>';
    }
    
    // 密码最后修改时间
    const passwordInfo = document.querySelector('.password-last-changed');
    if (passwordInfo) {
        passwordInfo.textContent = `上次修改: ${security.passwordLastChanged}`;
    }
    
    // 加载登录历史
    renderLoginHistory();
    
    // 加载活跃会话
    renderActiveSessions();
}

function renderLoginHistory() {
    const container = document.querySelector('.login-history-list');
    if (!container) return;
    
    container.innerHTML = ProfileData.security.loginHistory.map(record => `
        <div class="login-record ${record.status}">
            <div class="record-info">
                <span class="record-device">${record.device}</span>
                <span class="record-location">${record.location} · ${record.ip}</span>
            </div>
            <div class="record-time">${record.time}</div>
            <div class="record-status">
                ${record.status === 'success' 
                    ? '<span class="status-badge success">成功</span>' 
                    : '<span class="status-badge failed">失败</span>'}
            </div>
        </div>
    `).join('');
}

function renderActiveSessions() {
    const container = document.querySelector('.active-sessions-list');
    if (!container) return;
    
    container.innerHTML = ProfileData.security.activeSessions.map(session => `
        <div class="session-item ${session.current ? 'current' : ''}">
            <div class="session-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                    <line x1="8" y1="21" x2="16" y2="21"/>
                    <line x1="12" y1="17" x2="12" y2="21"/>
                </svg>
            </div>
            <div class="session-info">
                <span class="session-device">${session.device}</span>
                <span class="session-location">${session.location} · ${session.ip}</span>
                <span class="session-time">最后活跃: ${session.lastActive}</span>
            </div>
            ${session.current 
                ? '<span class="current-badge">当前设备</span>' 
                : `<button class="btn btn-sm btn-text danger" onclick="revokeSession(${session.id})">撤销</button>`}
        </div>
    `).join('');
}

function showChangePasswordModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.id = 'changePasswordModal';
    modal.innerHTML = `
        <div class="modal" style="width: 400px;">
            <div class="modal-header">
                <h3>修改密码</h3>
                <button class="modal-close" onclick="document.getElementById('changePasswordModal').remove()">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label>当前密码 <span class="required">*</span></label>
                    <input type="password" id="currentPassword" placeholder="输入当前密码">
                </div>
                <div class="form-group">
                    <label>新密码 <span class="required">*</span></label>
                    <input type="password" id="newPassword" placeholder="输入新密码">
                    <p class="form-hint">至少 8 个字符，包含大小写字母和数字</p>
                </div>
                <div class="form-group">
                    <label>确认新密码 <span class="required">*</span></label>
                    <input type="password" id="confirmPassword" placeholder="再次输入新密码">
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-outline" onclick="document.getElementById('changePasswordModal').remove()">取消</button>
                <button class="btn btn-primary" onclick="changePassword()">确认修改</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function changePassword() {
    const currentPassword = document.getElementById('currentPassword')?.value;
    const newPassword = document.getElementById('newPassword')?.value;
    const confirmPassword = document.getElementById('confirmPassword')?.value;
    
    if (!currentPassword) {
        showToast('请输入当前密码', 'error');
        return;
    }
    
    if (!newPassword) {
        showToast('请输入新密码', 'error');
        return;
    }
    
    if (newPassword.length < 8) {
        showToast('新密码至少需要 8 个字符', 'error');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showToast('两次输入的密码不一致', 'error');
        return;
    }
    
    // 模拟密码修改
    ProfileData.security.passwordLastChanged = new Date().toISOString().split('T')[0];
    
    document.getElementById('changePasswordModal')?.remove();
    loadSecuritySettings();
    showToast('密码修改成功', 'success');
}

function enableTwoFactor() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.id = 'twoFactorModal';
    modal.innerHTML = `
        <div class="modal" style="width: 450px;">
            <div class="modal-header">
                <h3>启用双因素认证</h3>
                <button class="modal-close" onclick="document.getElementById('twoFactorModal').remove()">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            </div>
            <div class="modal-body">
                <div class="two-factor-steps">
                    <div class="step active" data-step="1">
                        <div class="step-number">1</div>
                        <div class="step-content">
                            <h4>选择验证方式</h4>
                            <div class="method-options">
                                <label class="method-option selected">
                                    <input type="radio" name="twoFactorMethod" value="app" checked>
                                    <div class="method-icon">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
                                            <line x1="12" y1="18" x2="12.01" y2="18"/>
                                        </svg>
                                    </div>
                                    <div class="method-info">
                                        <span class="method-title">身份验证器应用</span>
                                        <span class="method-desc">使用 Google Authenticator 等应用</span>
                                    </div>
                                </label>
                                <label class="method-option">
                                    <input type="radio" name="twoFactorMethod" value="sms">
                                    <div class="method-icon">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                                        </svg>
                                    </div>
                                    <div class="method-info">
                                        <span class="method-title">短信验证</span>
                                        <span class="method-desc">通过短信接收验证码</span>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-outline" onclick="document.getElementById('twoFactorModal').remove()">取消</button>
                <button class="btn btn-primary" onclick="proceedTwoFactorSetup()">下一步</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // 绑定方法选择
    modal.querySelectorAll('.method-option').forEach(option => {
        option.addEventListener('click', function() {
            modal.querySelectorAll('.method-option').forEach(o => o.classList.remove('selected'));
            this.classList.add('selected');
            this.querySelector('input').checked = true;
        });
    });
}

function proceedTwoFactorSetup() {
    const method = document.querySelector('input[name="twoFactorMethod"]:checked')?.value;
    
    if (method === 'app') {
        showQRCodeStep();
    } else {
        showSMSVerificationStep();
    }
}

function showQRCodeStep() {
    const modal = document.getElementById('twoFactorModal');
    if (!modal) return;
    
    modal.querySelector('.modal-body').innerHTML = `
        <div class="two-factor-steps">
            <div class="step active" data-step="2">
                <div class="step-content">
                    <h4>扫描二维码</h4>
                    <p>使用身份验证器应用扫描以下二维码：</p>
                    <div class="qr-code-container">
                        <div class="qr-code-placeholder">
                            <svg width="150" height="150" viewBox="0 0 150 150">
                                <rect width="150" height="150" fill="#f0f0f0"/>
                                <text x="75" y="75" text-anchor="middle" fill="#999">QR Code</text>
                            </svg>
                        </div>
                        <p class="secret-key">密钥: ABCD-EFGH-IJKL-MNOP</p>
                    </div>
                    <div class="form-group">
                        <label>输入验证码</label>
                        <input type="text" id="verificationCode" placeholder="6 位数字验证码" maxlength="6">
                    </div>
                </div>
            </div>
        </div>
    `;
    
    modal.querySelector('.modal-footer').innerHTML = `
        <button class="btn btn-outline" onclick="document.getElementById('twoFactorModal').remove()">取消</button>
        <button class="btn btn-primary" onclick="verifyTwoFactor()">验证并启用</button>
    `;
}

function showSMSVerificationStep() {
    const modal = document.getElementById('twoFactorModal');
    if (!modal) return;
    
    modal.querySelector('.modal-body').innerHTML = `
        <div class="two-factor-steps">
            <div class="step active" data-step="2">
                <div class="step-content">
                    <h4>短信验证</h4>
                    <p>我们将向您的手机号 ${ProfileData.user.phone} 发送验证码</p>
                    <div class="form-group">
                        <label>验证码</label>
                        <div class="verification-input">
                            <input type="text" id="smsCode" placeholder="6 位数字验证码" maxlength="6">
                            <button class="btn btn-outline" onclick="sendSMSCode()">发送验证码</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    modal.querySelector('.modal-footer').innerHTML = `
        <button class="btn btn-outline" onclick="document.getElementById('twoFactorModal').remove()">取消</button>
        <button class="btn btn-primary" onclick="verifyTwoFactor()">验证并启用</button>
    `;
}

function sendSMSCode() {
    showToast('验证码已发送', 'success');
}

function verifyTwoFactor() {
    const code = document.getElementById('verificationCode')?.value || document.getElementById('smsCode')?.value;
    
    if (!code || code.length !== 6) {
        showToast('请输入 6 位验证码', 'error');
        return;
    }
    
    // 模拟验证
    ProfileData.security.twoFactorEnabled = true;
    ProfileData.security.twoFactorMethod = document.querySelector('input[name="twoFactorMethod"]:checked')?.value || 'app';
    
    document.getElementById('twoFactorModal')?.remove();
    loadSecuritySettings();
    showToast('双因素认证已启用', 'success');
}

function disableTwoFactor() {
    if (!confirm('确定要禁用双因素认证吗？这将降低您账户的安全性。')) {
        return;
    }
    
    ProfileData.security.twoFactorEnabled = false;
    ProfileData.security.twoFactorMethod = null;
    loadSecuritySettings();
    showToast('双因素认证已禁用', 'info');
}

function revokeSession(sessionId) {
    if (!confirm('确定要撤销此会话吗？该设备将被强制登出。')) {
        return;
    }
    
    ProfileData.security.activeSessions = ProfileData.security.activeSessions.filter(s => s.id !== sessionId);
    renderActiveSessions();
    showToast('会话已撤销', 'success');
}

function revokeAllSessions() {
    if (!confirm('确定要撤销所有其他会话吗？所有其他设备将被强制登出。')) {
        return;
    }
    
    ProfileData.security.activeSessions = ProfileData.security.activeSessions.filter(s => s.current);
    renderActiveSessions();
    showToast('所有其他会话已撤销', 'success');
}

// ==================== SSH 密钥管理 ====================
function loadSSHKeys() {
    const container = document.querySelector('.ssh-keys-list');
    if (!container) return;
    
    if (ProfileData.sshKeys.length === 0) {
        container.innerHTML = '<p class="empty-text">暂无 SSH 密钥</p>';
        return;
    }
    
    container.innerHTML = ProfileData.sshKeys.map(key => `
        <div class="ssh-key-item" data-id="${key.id}">
            <div class="key-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
                </svg>
            </div>
            <div class="key-info">
                <span class="key-name">${key.name}</span>
                <span class="key-fingerprint">${key.fingerprint}</span>
                <span class="key-meta">添加于 ${key.createdAt} · 最后使用 ${key.lastUsed}</span>
            </div>
            <button class="btn btn-sm btn-text danger" onclick="deleteSSHKey(${key.id})">删除</button>
        </div>
    `).join('');
}

function showAddSSHKeyModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.id = 'sshKeyModal';
    modal.innerHTML = `
        <div class="modal" style="width: 500px;">
            <div class="modal-header">
                <h3>添加 SSH 密钥</h3>
                <button class="modal-close" onclick="document.getElementById('sshKeyModal').remove()">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label>名称 <span class="required">*</span></label>
                    <input type="text" id="sshKeyName" placeholder="例如：工作电脑">
                </div>
                <div class="form-group">
                    <label>公钥 <span class="required">*</span></label>
                    <textarea id="sshKeyContent" rows="6" placeholder="以 ssh-rsa, ssh-ed25519 等开头的公钥内容"></textarea>
                    <p class="form-hint">通常位于 ~/.ssh/id_rsa.pub 或 ~/.ssh/id_ed25519.pub</p>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-outline" onclick="document.getElementById('sshKeyModal').remove()">取消</button>
                <button class="btn btn-primary" onclick="addSSHKey()">添加</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function addSSHKey() {
    const name = document.getElementById('sshKeyName')?.value.trim();
    const content = document.getElementById('sshKeyContent')?.value.trim();
    
    if (!name) {
        showToast('请输入密钥名称', 'error');
        return;
    }
    
    if (!content) {
        showToast('请输入公钥内容', 'error');
        return;
    }
    
    // 简单验证公钥格式
    if (!content.startsWith('ssh-')) {
        showToast('公钥格式不正确', 'error');
        return;
    }
    
    const newKey = {
        id: Math.max(...ProfileData.sshKeys.map(k => k.id), 0) + 1,
        name: name,
        fingerprint: `SHA256:${Math.random().toString(36).substr(2, 10)}...`,
        createdAt: new Date().toISOString().split('T')[0],
        lastUsed: '从未'
    };
    
    ProfileData.sshKeys.push(newKey);
    
    document.getElementById('sshKeyModal')?.remove();
    loadSSHKeys();
    showToast('SSH 密钥已添加', 'success');
}

function deleteSSHKey(keyId) {
    const key = ProfileData.sshKeys.find(k => k.id === keyId);
    if (!key) return;
    
    if (!confirm(`确定要删除 SSH 密钥 "${key.name}" 吗？`)) {
        return;
    }
    
    ProfileData.sshKeys = ProfileData.sshKeys.filter(k => k.id !== keyId);
    loadSSHKeys();
    showToast('SSH 密钥已删除', 'success');
}

// ==================== 访问令牌管理 ====================
function loadAccessTokens() {
    const container = document.querySelector('.access-tokens-list');
    if (!container) return;
    
    if (ProfileData.accessTokens.length === 0) {
        container.innerHTML = '<p class="empty-text">暂无访问令牌</p>';
        return;
    }
    
    container.innerHTML = ProfileData.accessTokens.map(token => `
        <div class="token-item" data-id="${token.id}">
            <div class="token-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
            </div>
            <div class="token-info">
                <span class="token-name">${token.name}</span>
                <div class="token-scopes">
                    ${token.scopes.map(s => `<span class="scope-tag">${s}</span>`).join('')}
                </div>
                <span class="token-meta">
                    创建于 ${token.createdAt} · 最后使用 ${token.lastUsed}
                    ${token.expiresAt ? ` · 过期时间 ${token.expiresAt}` : ' · 永不过期'}
                </span>
            </div>
            <button class="btn btn-sm btn-text danger" onclick="revokeAccessToken(${token.id})">撤销</button>
        </div>
    `).join('');
}

function showCreateTokenModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.id = 'tokenModal';
    modal.innerHTML = `
        <div class="modal" style="width: 500px;">
            <div class="modal-header">
                <h3>创建访问令牌</h3>
                <button class="modal-close" onclick="document.getElementById('tokenModal').remove()">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label>名称 <span class="required">*</span></label>
                    <input type="text" id="tokenName" placeholder="例如：CI/CD Pipeline">
                </div>
                <div class="form-group">
                    <label>过期时间</label>
                    <select id="tokenExpiry">
                        <option value="30">30 天</option>
                        <option value="90">90 天</option>
                        <option value="365">1 年</option>
                        <option value="0">永不过期</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>权限范围</label>
                    <div class="checkbox-group vertical">
                        <label class="checkbox-item">
                            <input type="checkbox" value="read_api" checked>
                            <span>read_api - 读取 API</span>
                        </label>
                        <label class="checkbox-item">
                            <input type="checkbox" value="write_repository">
                            <span>write_repository - 写入代码仓库</span>
                        </label>
                        <label class="checkbox-item">
                            <input type="checkbox" value="read_repository">
                            <span>read_repository - 读取代码仓库</span>
                        </label>
                        <label class="checkbox-item">
                            <input type="checkbox" value="write_registry">
                            <span>write_registry - 写入制品仓库</span>
                        </label>
                        <label class="checkbox-item">
                            <input type="checkbox" value="read_registry">
                            <span>read_registry - 读取制品仓库</span>
                        </label>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-outline" onclick="document.getElementById('tokenModal').remove()">取消</button>
                <button class="btn btn-primary" onclick="createAccessToken()">创建</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function createAccessToken() {
    const name = document.getElementById('tokenName')?.value.trim();
    const expiry = document.getElementById('tokenExpiry')?.value;
    
    if (!name) {
        showToast('请输入令牌名称', 'error');
        return;
    }
    
    // 收集选中的权限
    const scopes = [];
    document.querySelectorAll('#tokenModal .checkbox-item input:checked').forEach(checkbox => {
        scopes.push(checkbox.value);
    });
    
    if (scopes.length === 0) {
        showToast('请至少选择一个权限', 'error');
        return;
    }
    
    // 计算过期时间
    let expiresAt = null;
    if (expiry && expiry !== '0') {
        const date = new Date();
        date.setDate(date.getDate() + parseInt(expiry));
        expiresAt = date.toISOString().split('T')[0];
    }
    
    const newToken = {
        id: Math.max(...ProfileData.accessTokens.map(t => t.id), 0) + 1,
        name: name,
        scopes: scopes,
        createdAt: new Date().toISOString().split('T')[0],
        lastUsed: '从未',
        expiresAt: expiresAt
    };
    
    ProfileData.accessTokens.push(newToken);
    
    // 显示生成的令牌
    const generatedToken = `mota_${Math.random().toString(36).substr(2, 32)}`;
    
    document.getElementById('tokenModal').querySelector('.modal-body').innerHTML = `
        <div class="token-generated">
            <div class="success-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
            </div>
            <h4>令牌创建成功</h4>
            <p>请立即复制并保存此令牌，它只会显示一次：</p>
            <div class="token-display">
                <code>${generatedToken}</code>
                <button class="btn btn-sm btn-outline" onclick="copyToken('${generatedToken}')">复制</button>
            </div>
        </div>
    `;
    
    document.getElementById('tokenModal').querySelector('.modal-footer').innerHTML = `
        <button class="btn btn-primary" onclick="document.getElementById('tokenModal').remove(); loadAccessTokens();">完成</button>
    `;
}

function copyToken(token) {
    navigator.clipboard.writeText(token).then(() => {
        showToast('令牌已复制到剪贴板', 'success');
    });
}

function revokeAccessToken(tokenId) {
    const token = ProfileData.accessTokens.find(t => t.id === tokenId);
    if (!token) return;
    
    if (!confirm(`确定要撤销访问令牌 "${token.name}" 吗？使用此令牌的应用将无法继续访问。`)) {
        return;
    }
    
    ProfileData.accessTokens = ProfileData.accessTokens.filter(t => t.id !== tokenId);
    loadAccessTokens();
    showToast('访问令牌已撤销', 'success');
}

// ==================== 偏好设置 ====================
function loadPreferences() {
    const prefs = ProfileData.preferences;
    
    // 主题设置
    const themeSelect = document.getElementById('themePreference');
    if (themeSelect) {
        themeSelect.value = prefs.theme;
    }
    
    // 语言设置
    const languageSelect = document.getElementById('languagePreference');
    if (languageSelect) {
        languageSelect.value = prefs.language;
    }
    
    // 时区设置
    const timezoneSelect = document.getElementById('timezonePreference');
    if (timezoneSelect) {
        timezoneSelect.value = prefs.timezone;
    }
    
    // 日期格式
    const dateFormatSelect = document.getElementById('dateFormatPreference');
    if (dateFormatSelect) {
        dateFormatSelect.value = prefs.dateFormat;
    }
    
    // 代码编辑器设置
    const editorThemeSelect = document.getElementById('editorTheme');
    if (editorThemeSelect) {
        editorThemeSelect.value = prefs.codeEditor.theme;
    }
    
    const fontSizeInput = document.getElementById('editorFontSize');
    if (fontSizeInput) {
        fontSizeInput.value = prefs.codeEditor.fontSize;
    }
    
    const tabSizeSelect = document.getElementById('editorTabSize');
    if (tabSizeSelect) {
        tabSizeSelect.value = prefs.codeEditor.tabSize;
    }
    
    // 通知偏好
    const emailNotifToggle = document.getElementById('emailNotifications');
    if (emailNotifToggle) {
        emailNotifToggle.checked = prefs.notifications.email;
    }
    
    const browserNotifToggle = document.getElementById('browserNotifications');
    if (browserNotifToggle) {
        browserNotifToggle.checked = prefs.notifications.browser;
    }
    
    const mobileNotifToggle = document.getElementById('mobileNotifications');
    if (mobileNotifToggle) {
        mobileNotifToggle.checked = prefs.notifications.mobile;
    }
}

function savePreferences() {
    const prefs = ProfileData.preferences;
    
    // 收集设置
    prefs.theme = document.getElementById('themePreference')?.value || 'light';
    prefs.language = document.getElementById('languagePreference')?.value || 'zh-CN';
    prefs.timezone = document.getElementById('timezonePreference')?.value || 'Asia/Shanghai';
    prefs.dateFormat = document.getElementById('dateFormatPreference')?.value || 'YYYY-MM-DD';
    
    prefs.codeEditor.theme = document.getElementById('editorTheme')?.value || 'vs-dark';
    prefs.codeEditor.fontSize = parseInt(document.getElementById('editorFontSize')?.value) || 14;
    prefs.codeEditor.tabSize = parseInt(document.getElementById('editorTabSize')?.value) || 4;
    
    prefs.notifications.email = document.getElementById('emailNotifications')?.checked ?? true;
    prefs.notifications.browser = document.getElementById('browserNotifications')?.checked ?? true;
    prefs.notifications.mobile = document.getElementById('mobileNotifications')?.checked ?? false;
    
    // 应用主题
    applyTheme(prefs.theme);
    
    showToast('偏好设置已保存', 'success');
}

function applyTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
    } else if (theme === 'light') {
        document.body.classList.remove('dark-theme');
    } else {
        // 跟随系统
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.body.classList.add('dark-theme');
        } else {
            document.body.classList.remove('dark-theme');
        }
    }
}

function requestBrowserNotificationPermission() {
    if ('Notification' in window) {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                showToast('浏览器通知已启用', 'success');
            } else {
                showToast('浏览器通知权限被拒绝', 'error');
                document.getElementById('browserNotifications').checked = false;
            }
        });
    } else {
        showToast('您的浏览器不支持通知功能', 'error');
    }
}

// ==================== 账户操作 ====================
function exportAccountData() {
    showToast('正在准备导出数据...', 'info');
    
    setTimeout(() => {
        const data = {
            user: ProfileData.user,
            preferences: ProfileData.preferences,
            exportedAt: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mota-account-data-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        showToast('账户数据已导出', 'success');
    }, 1000);
}

function deleteAccount() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.id = 'deleteAccountModal';
    modal.innerHTML = `
        <div class="modal" style="width: 450px;">
            <div class="modal-header">
                <h3>删除账户</h3>
                <button class="modal-close" onclick="document.getElementById('deleteAccountModal').remove()">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            </div>
            <div class="modal-body">
                <div class="danger-box">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="15" y1="9" x2="9" y2="15"/>
                        <line x1="9" y1="9" x2="15" y2="15"/>
                    </svg>
                    <div>
                        <h4>此操作不可恢复！</h4>
                        <p>删除账户将永久删除您的所有数据，包括个人资料、项目贡献记录等。</p>
                    </div>
                </div>
                <div class="form-group">
                    <label>输入您的用户名 <strong>${ProfileData.user.username}</strong> 确认删除</label>
                    <input type="text" id="confirmDeleteUsername" placeholder="${ProfileData.user.username}">
                </div>
                <div class="form-group">
                    <label>输入密码确认</label>
                    <input type="password" id="confirmDeletePassword" placeholder="输入您的密码">
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-outline" onclick="document.getElementById('deleteAccountModal').remove()">取消</button>
                <button class="btn btn-danger" onclick="confirmDeleteAccount()">永久删除账户</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function confirmDeleteAccount() {
    const username = document.getElementById('confirmDeleteUsername')?.value;
    const password = document.getElementById('confirmDeletePassword')?.value;
    
    if (username !== ProfileData.user.username) {
        showToast('用户名不匹配', 'error');
        return;
    }
    
    if (!password) {
        showToast('请输入密码', 'error');
        return;
    }
    
    document.getElementById('deleteAccountModal')?.remove();
    showToast('账户已删除', 'success');
    
    // 模拟跳转到首页
    setTimeout(() => {
        window.location.href = '../index.html';
    }, 1500);
}

// ==================== 事件绑定 ====================
function bindProfileEvents() {
    // 保存个人资料按钮
    const saveProfileBtn = document.getElementById('saveProfile');
    if (saveProfileBtn) {
        saveProfileBtn.addEventListener('click', saveUserProfile);
    }
    
    // 上传头像按钮
    const uploadAvatarBtn = document.querySelector('.upload-avatar-btn');
    if (uploadAvatarBtn) {
        uploadAvatarBtn.addEventListener('click', uploadAvatar);
    }
    
    // 移除头像按钮
    const removeAvatarBtn = document.querySelector('.remove-avatar-btn');
    if (removeAvatarBtn) {
        removeAvatarBtn.addEventListener('click', removeAvatar);
    }
    
    // 修改密码按钮
    const changePasswordBtn = document.querySelector('.change-password-btn');
    if (changePasswordBtn) {
        changePasswordBtn.addEventListener('click', showChangePasswordModal);
    }
    
    // 双因素认证按钮
    const enableTwoFactorBtn = document.querySelector('.enable-two-factor-btn');
    if (enableTwoFactorBtn) {
        enableTwoFactorBtn.addEventListener('click', enableTwoFactor);
    }
    
    const disableTwoFactorBtn = document.querySelector('.disable-two-factor-btn');
    if (disableTwoFactorBtn) {
        disableTwoFactorBtn.addEventListener('click', disableTwoFactor);
    }
    
    // 撤销所有会话按钮
    const revokeAllBtn = document.querySelector('.revoke-all-sessions-btn');
    if (revokeAllBtn) {
        revokeAllBtn.addEventListener('click', revokeAllSessions);
    }
    
    // 添加 SSH 密钥按钮
    const addSSHKeyBtn = document.querySelector('.add-ssh-key-btn');
    if (addSSHKeyBtn) {
        addSSHKeyBtn.addEventListener('click', showAddSSHKeyModal);
    }
    
    // 创建访问令牌按钮
    const createTokenBtn = document.querySelector('.create-token-btn');
    if (createTokenBtn) {
        createTokenBtn.addEventListener('click', showCreateTokenModal);
    }
    
    // 保存偏好设置按钮
    const savePreferencesBtn = document.getElementById('savePreferences');
    if (savePreferencesBtn) {
        savePreferencesBtn.addEventListener('click', savePreferences);
    }
    
    // 浏览器通知权限
    const browserNotifToggle = document.getElementById('browserNotifications');
    if (browserNotifToggle) {
        browserNotifToggle.addEventListener('change', function() {
            if (this.checked) {
                requestBrowserNotificationPermission();
            }
        });
    }
    
    // 导出数据按钮
    const exportDataBtn = document.querySelector('.export-data-btn');
    if (exportDataBtn) {
        exportDataBtn.addEventListener('click', exportAccountData);
    }
    
    // 删除账户按钮
    const deleteAccountBtn = document.querySelector('.delete-account-btn');
    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener('click', deleteAccount);
    }
}

// ==================== 工具函数 ====================
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
const profileStyles = document.createElement('style');
profileStyles.textContent = `
    /* 登录历史 */
    .login-history-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
    
    .login-record {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 12px;
        background: #fff;
        border: 1px solid var(--border-light);
        border-radius: var(--radius-md);
    }
    
    .login-record.failed {
        border-left: 3px solid var(--danger-color);
    }
    
    .record-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 4px;
    }
    
    .record-device {
        font-size: 14px;
        font-weight: 500;
        color: var(--text-primary);
    }
    
    .record-location {
        font-size: 12px;
        color: var(--text-secondary);
    }
    
    .record-time {
        font-size: 12px;
        color: var(--text-secondary);
    }
    
    .status-badge {
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 500;
    }
    
    .status-badge.success {
        background: var(--success-light);
        color: var(--success-color);
    }
    
    .status-badge.failed {
        background: #fee2e2;
        color: var(--danger-color);
    }
    
    .status-badge.enabled {
        background: var(--success-light);
        color: var(--success-color);
    }
    
    .status-badge.disabled {
        background: var(--bg-light);
        color: var(--text-secondary);
    }
    
    /* 活跃会话 */
    .active-sessions-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }
    
    .session-item {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 16px;
        background: #fff;
        border: 1px solid var(--border-light);
        border-radius: var(--radius-md);
    }
    
    .session-item.current {
        border-color: var(--primary-color);
        background: var(--primary-light);
    }
    
    .session-icon {
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--bg-light);
        border-radius: var(--radius-md);
        color: var(--text-secondary);
    }
    
    .session-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 4px;
    }
    
    .session-device {
        font-size: 14px;
        font-weight: 500;
        color: var(--text-primary);
    }
    
    .session-location, .session-time {
        font-size: 12px;
        color: var(--text-secondary);
    }
    
    .current-badge {
        padding: 4px 8px;
        background: var(--primary-color);
        color: white;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 500;
    }
    
    /* SSH 密钥和访问令牌 */
    .ssh-keys-list, .access-tokens-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }
    
    .ssh-key-item, .token-item {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 16px;
        background: #fff;
        border: 1px solid var(--border-light);
        border-radius: var(--radius-md);
    }
    
    .key-icon, .token-icon {
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--bg-light);
        border-radius: var(--radius-md);
        color: var(--text-secondary);
    }
    
    .key-info, .token-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 4px;
    }
    
    .key-name, .token-name {
        font-size: 14px;
        font-weight: 500;
        color: var(--text-primary);
    }
    
    .key-fingerprint {
        font-size: 12px;
        font-family: monospace;
        color: var(--text-secondary);
    }
    
    .key-meta, .token-meta {
        font-size: 12px;
        color: var(--text-placeholder);
    }
    
    .token-scopes {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
    }
    
    .scope-tag {
        padding: 2px 6px;
        background: var(--bg-light);
        border-radius: 4px;
        font-size: 11px;
        color: var(--text-secondary);
    }
    
    /* 双因素认证设置 */
    .method-options {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }
    
    .method-option {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 16px;
        border: 1px solid var(--border-light);
        border-radius: var(--radius-md);
        cursor: pointer;
        transition: all 0.2s;
    }
    
    .method-option:hover {
        border-color: var(--primary-color);
    }
    
    .method-option.selected {
        border-color: var(--primary-color);
        background: var(--primary-light);
    }
    
    .method-option input {
        display: none;
    }
    
    .method-icon {
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--bg-light);
        border-radius: var(--radius-md);
        color: var(--text-secondary);
    }
    
    .method-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 4px;
    }
    
    .method-title {
        font-size: 14px;
        font-weight: 500;
        color: var(--text-primary);
    }
    
    .method-desc {
        font-size: 12px;
        color: var(--text-secondary);
    }
    
    /* 二维码容器 */
    .qr-code-container {
        text-align: center;
        padding: 20px;
        margin-bottom: 20px;
    }
    
    .qr-code-placeholder {
        display: inline-block;
        padding: 10px;
        background: #fff;
        border: 1px solid var(--border-light);
        border-radius: var(--radius-md);
        margin-bottom: 12px;
    }
    
    .secret-key {
        font-family: monospace;
        font-size: 14px;
        color: var(--text-secondary);
    }
    
    /* 验证码输入 */
    .verification-input {
        display: flex;
        gap: 8px;
    }
    
    .verification-input input {
        flex: 1;
    }
    
    /* 令牌生成成功 */
    .token-generated {
        text-align: center;
        padding: 20px;
    }
    
    .success-icon {
        color: var(--success-color);
        margin-bottom: 16px;
    }
    
    .token-generated h4 {
        font-size: 18px;
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 8px;
    }
    
    .token-generated p {
        font-size: 14px;
        color: var(--text-secondary);
        margin-bottom: 16px;
    }
    
    .token-display {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px;
        background: var(--bg-light);
        border-radius: var(--radius-md);
    }
    
    .token-display code {
        flex: 1;
        font-family: monospace;
        font-size: 13px;
        word-break: break-all;
    }
    
    /* 危险框 */
    .danger-box {
        display: flex;
        gap: 12px;
        padding: 16px;
        background: #fee2e2;
        border-radius: var(--radius-md);
        margin-bottom: 20px;
        color: #991b1b;
    }
    
    .danger-box h4 {
        font-size: 14px;
        font-weight: 600;
        margin-bottom: 4px;
    }
    
    .danger-box p {
        font-size: 13px;
    }
    
    /* 垂直复选框组 */
    .checkbox-group.vertical {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
    
    .checkbox-item {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
    }
    
    .checkbox-item input {
        width: 16px;
        height: 16px;
    }
    
    /* 空文本 */
    .empty-text {
        font-size: 13px;
        color: var(--text-secondary);
        text-align: center;
        padding: 20px;
    }
`;
document.head.appendChild(profileStyles);