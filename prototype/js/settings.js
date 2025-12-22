/**
 * 摩塔 Mota - 团队设置模块 JavaScript
 * 实现团队设置的所有交互功能
 */

// ==================== 团队设置数据模型 ====================
const SettingsData = {
    // 团队基本信息
    team: {
        id: 1,
        name: '摩塔开发团队',
        slug: 'mota-dev',
        description: '摩塔 DevOps 平台开发团队，致力于打造一站式研发协作平台。',
        avatar: 'team-avatar',
        website: 'https://mota.example.com',
        email: 'team@mota.example.com',
        location: '中国 · 北京',
        createdAt: '2023-06-15',
        plan: 'enterprise',
        memberLimit: 100,
        storageLimit: '100GB',
        storageUsed: '45.2GB'
    },
    
    // 通知设置
    notifications: {
        email: {
            projectUpdates: true,
            issueAssigned: true,
            issueComments: true,
            mergeRequests: true,
            buildStatus: true,
            deployments: true,
            securityAlerts: true,
            weeklyDigest: true
        },
        inApp: {
            projectUpdates: true,
            issueAssigned: true,
            issueComments: true,
            mergeRequests: true,
            buildStatus: true,
            deployments: true,
            securityAlerts: true
        }
    },
    
    // 安全设置
    security: {
        twoFactorRequired: false,
        ssoEnabled: false,
        ssoProvider: '',
        ipWhitelist: [],
        sessionTimeout: 24, // hours
        passwordPolicy: {
            minLength: 8,
            requireUppercase: true,
            requireLowercase: true,
            requireNumbers: true,
            requireSpecialChars: false
        }
    },
    
    // 集成设置
    integrations: [
        { id: 1, name: 'GitHub', type: 'code', status: 'connected', icon: 'github', connectedAt: '2023-07-20' },
        { id: 2, name: 'GitLab', type: 'code', status: 'disconnected', icon: 'gitlab', connectedAt: null },
        { id: 3, name: 'Slack', type: 'notification', status: 'connected', icon: 'slack', connectedAt: '2023-08-15' },
        { id: 4, name: '钉钉', type: 'notification', status: 'disconnected', icon: 'dingtalk', connectedAt: null },
        { id: 5, name: '企业微信', type: 'notification', status: 'connected', icon: 'wechat-work', connectedAt: '2023-09-10' },
        { id: 6, name: 'Jenkins', type: 'ci', status: 'connected', icon: 'jenkins', connectedAt: '2023-07-25' },
        { id: 7, name: 'Kubernetes', type: 'deploy', status: 'connected', icon: 'kubernetes', connectedAt: '2023-08-01' },
        { id: 8, name: 'Jira', type: 'project', status: 'disconnected', icon: 'jira', connectedAt: null }
    ],
    
    // Webhook 设置
    webhooks: [
        { id: 1, name: '构建通知', url: 'https://hooks.example.com/build', events: ['build.success', 'build.failed'], status: 'active', lastTriggered: '2024-01-18 14:30' },
        { id: 2, name: '部署通知', url: 'https://hooks.example.com/deploy', events: ['deploy.success', 'deploy.failed'], status: 'active', lastTriggered: '2024-01-17 10:15' },
        { id: 3, name: '代码审查', url: 'https://hooks.example.com/review', events: ['mr.created', 'mr.merged'], status: 'inactive', lastTriggered: null }
    ],
    
    // 当前设置标签页
    currentTab: 'general'
};

// ==================== 初始化 ====================
document.addEventListener('DOMContentLoaded', function() {
    initSettings();
});

function initSettings() {
    // 加载团队信息
    loadTeamInfo();
    
    // 绑定事件
    bindSettingsEvents();
    
    // 初始化标签页
    initTabs();
    
    console.log('Settings module initialized');
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
            
            SettingsData.currentTab = targetId;
        });
    });
}

function switchSettingsTab(tabName) {
    const tab = document.querySelector(`.settings-nav-item[href="#${tabName}"], .settings-nav-item[data-tab="${tabName}"]`);
    if (tab) {
        tab.click();
    }
}

// ==================== 团队信息管理 ====================
function loadTeamInfo() {
    const team = SettingsData.team;
    
    // 填充表单
    const nameInput = document.getElementById('teamName');
    const slugInput = document.getElementById('teamSlug');
    const descInput = document.getElementById('teamDescription');
    const websiteInput = document.getElementById('teamWebsite');
    const emailInput = document.getElementById('teamEmail');
    const locationInput = document.getElementById('teamLocation');
    
    if (nameInput) nameInput.value = team.name;
    if (slugInput) slugInput.value = team.slug;
    if (descInput) descInput.value = team.description;
    if (websiteInput) websiteInput.value = team.website;
    if (emailInput) emailInput.value = team.email;
    if (locationInput) locationInput.value = team.location;
    
    // 更新头像
    const avatarImg = document.querySelector('.team-avatar img');
    if (avatarImg) {
        avatarImg.src = `https://api.dicebear.com/7.x/identicon/svg?seed=${team.slug}`;
    }
    
    // 更新存储使用情况
    updateStorageUsage();
}

function saveTeamInfo() {
    const nameInput = document.getElementById('teamName');
    const slugInput = document.getElementById('teamSlug');
    const descInput = document.getElementById('teamDescription');
    const websiteInput = document.getElementById('teamWebsite');
    const emailInput = document.getElementById('teamEmail');
    const locationInput = document.getElementById('teamLocation');
    
    // 验证必填字段
    if (!nameInput?.value.trim()) {
        showToast('请输入团队名称', 'error');
        nameInput?.focus();
        return;
    }
    
    if (!slugInput?.value.trim()) {
        showToast('请输入团队标识', 'error');
        slugInput?.focus();
        return;
    }
    
    // 验证 slug 格式
    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(slugInput.value)) {
        showToast('团队标识只能包含小写字母、数字和连字符', 'error');
        slugInput?.focus();
        return;
    }
    
    // 更新数据
    SettingsData.team.name = nameInput.value.trim();
    SettingsData.team.slug = slugInput.value.trim();
    SettingsData.team.description = descInput?.value.trim() || '';
    SettingsData.team.website = websiteInput?.value.trim() || '';
    SettingsData.team.email = emailInput?.value.trim() || '';
    SettingsData.team.location = locationInput?.value.trim() || '';
    
    showToast('团队信息已保存', 'success');
}

function uploadTeamAvatar() {
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
        
        // 预览图片
        const reader = new FileReader();
        reader.onload = function(e) {
            const avatarImg = document.querySelector('.team-avatar img');
            if (avatarImg) {
                avatarImg.src = e.target.result;
            }
            showToast('头像已更新', 'success');
        };
        reader.readAsDataURL(file);
    };
    
    input.click();
}

function removeTeamAvatar() {
    const avatarImg = document.querySelector('.team-avatar img');
    if (avatarImg) {
        avatarImg.src = `https://api.dicebear.com/7.x/identicon/svg?seed=${SettingsData.team.slug}`;
    }
    showToast('头像已移除', 'success');
}

function updateStorageUsage() {
    const progressBar = document.querySelector('.storage-progress .progress-fill');
    const usageText = document.querySelector('.storage-info .usage-text');
    
    if (progressBar) {
        const usedGB = parseFloat(SettingsData.team.storageUsed);
        const limitGB = parseFloat(SettingsData.team.storageLimit);
        const percentage = (usedGB / limitGB) * 100;
        progressBar.style.width = `${percentage}%`;
    }
    
    if (usageText) {
        usageText.textContent = `${SettingsData.team.storageUsed} / ${SettingsData.team.storageLimit}`;
    }
}

// ==================== 通知设置 ====================
function loadNotificationSettings() {
    const emailSettings = SettingsData.notifications.email;
    const inAppSettings = SettingsData.notifications.inApp;
    
    // 设置邮件通知开关
    Object.keys(emailSettings).forEach(key => {
        const toggle = document.querySelector(`#email-${key}`);
        if (toggle) {
            toggle.checked = emailSettings[key];
        }
    });
    
    // 设置应用内通知开关
    Object.keys(inAppSettings).forEach(key => {
        const toggle = document.querySelector(`#inapp-${key}`);
        if (toggle) {
            toggle.checked = inAppSettings[key];
        }
    });
}

function toggleNotification(type, key, value) {
    if (type === 'email') {
        SettingsData.notifications.email[key] = value;
    } else if (type === 'inapp') {
        SettingsData.notifications.inApp[key] = value;
    }
    
    showToast('通知设置已更新', 'success');
}

function saveNotificationSettings() {
    // 收集所有通知设置
    document.querySelectorAll('.notification-toggle').forEach(toggle => {
        const [type, key] = toggle.id.split('-');
        if (type === 'email') {
            SettingsData.notifications.email[key] = toggle.checked;
        } else if (type === 'inapp') {
            SettingsData.notifications.inApp[key] = toggle.checked;
        }
    });
    
    showToast('通知设置已保存', 'success');
}

// ==================== 安全设置 ====================
function loadSecuritySettings() {
    const security = SettingsData.security;
    
    // 双因素认证
    const twoFactorToggle = document.getElementById('twoFactorRequired');
    if (twoFactorToggle) {
        twoFactorToggle.checked = security.twoFactorRequired;
    }
    
    // SSO 设置
    const ssoToggle = document.getElementById('ssoEnabled');
    if (ssoToggle) {
        ssoToggle.checked = security.ssoEnabled;
    }
    
    // 会话超时
    const sessionTimeoutSelect = document.getElementById('sessionTimeout');
    if (sessionTimeoutSelect) {
        sessionTimeoutSelect.value = security.sessionTimeout;
    }
    
    // 密码策略
    const minLengthInput = document.getElementById('passwordMinLength');
    if (minLengthInput) {
        minLengthInput.value = security.passwordPolicy.minLength;
    }
}

function toggleTwoFactor(enabled) {
    SettingsData.security.twoFactorRequired = enabled;
    
    if (enabled) {
        showToast('已启用强制双因素认证', 'success');
    } else {
        showToast('已关闭强制双因素认证', 'info');
    }
}

function toggleSSO(enabled) {
    SettingsData.security.ssoEnabled = enabled;
    
    const ssoConfig = document.querySelector('.sso-config');
    if (ssoConfig) {
        ssoConfig.style.display = enabled ? 'block' : 'none';
    }
    
    if (enabled) {
        showToast('已启用 SSO 单点登录', 'success');
    } else {
        showToast('已关闭 SSO 单点登录', 'info');
    }
}

function saveSecuritySettings() {
    const sessionTimeoutSelect = document.getElementById('sessionTimeout');
    const minLengthInput = document.getElementById('passwordMinLength');
    
    if (sessionTimeoutSelect) {
        SettingsData.security.sessionTimeout = parseInt(sessionTimeoutSelect.value);
    }
    
    if (minLengthInput) {
        SettingsData.security.passwordPolicy.minLength = parseInt(minLengthInput.value);
    }
    
    showToast('安全设置已保存', 'success');
}

function addIPWhitelist() {
    const ip = prompt('请输入 IP 地址或 CIDR 范围：');
    if (!ip) return;
    
    // 简单验证 IP 格式
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/;
    if (!ipRegex.test(ip)) {
        showToast('IP 地址格式不正确', 'error');
        return;
    }
    
    SettingsData.security.ipWhitelist.push(ip);
    renderIPWhitelist();
    showToast('IP 白名单已添加', 'success');
}

function removeIPWhitelist(ip) {
    SettingsData.security.ipWhitelist = SettingsData.security.ipWhitelist.filter(i => i !== ip);
    renderIPWhitelist();
    showToast('IP 白名单已移除', 'success');
}

function renderIPWhitelist() {
    const container = document.querySelector('.ip-whitelist-list');
    if (!container) return;
    
    if (SettingsData.security.ipWhitelist.length === 0) {
        container.innerHTML = '<p class="empty-text">暂无 IP 白名单</p>';
        return;
    }
    
    container.innerHTML = SettingsData.security.ipWhitelist.map(ip => `
        <div class="ip-item">
            <span>${ip}</span>
            <button class="btn btn-sm btn-text danger" onclick="removeIPWhitelist('${ip}')">移除</button>
        </div>
    `).join('');
}

// ==================== 集成设置 ====================
function loadIntegrations() {
    const container = document.querySelector('.integrations-grid');
    if (!container) return;
    
    container.innerHTML = SettingsData.integrations.map(integration => `
        <div class="integration-card ${integration.status}" data-id="${integration.id}">
            <div class="integration-icon">
                ${getIntegrationIcon(integration.icon)}
            </div>
            <div class="integration-info">
                <h4>${integration.name}</h4>
                <span class="integration-type">${getIntegrationType(integration.type)}</span>
            </div>
            <div class="integration-status">
                ${integration.status === 'connected' 
                    ? `<span class="status-badge connected">已连接</span>
                       <button class="btn btn-sm btn-outline" onclick="configureIntegration(${integration.id})">配置</button>
                       <button class="btn btn-sm btn-text danger" onclick="disconnectIntegration(${integration.id})">断开</button>`
                    : `<button class="btn btn-sm btn-primary" onclick="connectIntegration(${integration.id})">连接</button>`
                }
            </div>
        </div>
    `).join('');
}

function getIntegrationIcon(icon) {
    const icons = {
        github: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>',
        gitlab: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M22.65 14.39L12 22.13 1.35 14.39a.84.84 0 0 1-.3-.94l1.22-3.78 2.44-7.51A.42.42 0 0 1 4.82 2a.43.43 0 0 1 .58 0 .42.42 0 0 1 .11.18l2.44 7.49h8.1l2.44-7.51A.42.42 0 0 1 18.6 2a.43.43 0 0 1 .58 0 .42.42 0 0 1 .11.18l2.44 7.51L23 13.45a.84.84 0 0 1-.35.94z"/></svg>',
        slack: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/></svg>',
        dingtalk: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 14.957l-1.39-.457c-.14-.046-.29-.07-.44-.07h-2.88c-.15 0-.3.024-.44.07l-1.39.457c-.28.092-.47.352-.47.647v.396c0 .295.19.555.47.647l1.39.457c.14.046.29.07.44.07h2.88c.15 0 .3-.024.44-.07l1.39-.457c.28-.092.47-.352.47-.647v-.396c0-.295-.19-.555-.47-.647z"/></svg>',
        'wechat-work': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>',
        jenkins: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>',
        kubernetes: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M10.204 14.35l.007.01-.999 2.413a5.171 5.171 0 0 1-2.075-2.597l2.578-.437.004.005a.44.44 0 0 1 .484.606zm-.833-2.129a.44.44 0 0 0 .173-.756l.002-.011L7.585 9.7a5.143 5.143 0 0 0-.73 3.255l2.514-.725.002-.009zm1.145-1.98a.44.44 0 0 0 .699-.337l.01-.005.15-2.62a5.144 5.144 0 0 0-3.01 1.442l2.147 1.523.004-.002zm2.369 1.98a.44.44 0 0 0 .173.756l.002.01 2.514.724a5.143 5.143 0 0 0-.73-3.255l-1.96 1.765zm-.833 2.129a.44.44 0 0 0 .484-.606l.004-.004 2.578.437a5.171 5.171 0 0 1-2.075 2.597l-.999-2.413.008-.01zm.484-4.109a.44.44 0 0 0 .699.337l.004.002 2.147-1.523a5.144 5.144 0 0 0-3.01-1.442l.15 2.62.01.006z"/></svg>',
        jira: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.571 11.513H0a5.218 5.218 0 0 0 5.232 5.215h2.13v2.057A5.215 5.215 0 0 0 12.575 24V12.518a1.005 1.005 0 0 0-1.005-1.005zm5.723-5.756H5.736a5.215 5.215 0 0 0 5.215 5.214h2.129v2.058a5.218 5.218 0 0 0 5.215 5.214V6.758a1.001 1.001 0 0 0-1.001-1.001zM23.013 0H11.455a5.215 5.215 0 0 0 5.215 5.215h2.129v2.057A5.215 5.215 0 0 0 24 12.483V1.005A1.005 1.005 0 0 0 23.013 0z"/></svg>'
    };
    
    return icons[icon] || '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>';
}

function getIntegrationType(type) {
    const types = {
        code: '代码托管',
        notification: '通知服务',
        ci: '持续集成',
        deploy: '部署服务',
        project: '项目管理'
    };
    return types[type] || type;
}

function connectIntegration(integrationId) {
    const integration = SettingsData.integrations.find(i => i.id === integrationId);
    if (!integration) return;
    
    // 模拟连接过程
    showToast(`正在连接 ${integration.name}...`, 'info');
    
    setTimeout(() => {
        integration.status = 'connected';
        integration.connectedAt = new Date().toISOString().split('T')[0];
        loadIntegrations();
        showToast(`${integration.name} 连接成功`, 'success');
    }, 1500);
}

function disconnectIntegration(integrationId) {
    const integration = SettingsData.integrations.find(i => i.id === integrationId);
    if (!integration) return;
    
    if (!confirm(`确定要断开 ${integration.name} 连接吗？`)) return;
    
    integration.status = 'disconnected';
    integration.connectedAt = null;
    loadIntegrations();
    showToast(`${integration.name} 已断开连接`, 'success');
}

function configureIntegration(integrationId) {
    const integration = SettingsData.integrations.find(i => i.id === integrationId);
    if (!integration) return;
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.id = 'integrationConfigModal';
    modal.innerHTML = `
        <div class="modal" style="width: 500px;">
            <div class="modal-header">
                <h3>配置 ${integration.name}</h3>
                <button class="modal-close" onclick="document.getElementById('integrationConfigModal').remove()">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label>API Token</label>
                    <input type="password" value="••••••••••••••••" placeholder="输入 API Token">
                </div>
                <div class="form-group">
                    <label>Webhook URL</label>
                    <input type="text" value="https://mota.example.com/webhooks/${integration.name.toLowerCase()}" readonly>
                </div>
                <div class="form-group">
                    <label>同步设置</label>
                    <div class="checkbox-group vertical">
                        <label class="checkbox-item">
                            <input type="checkbox" checked>
                            <span>自动同步代码仓库</span>
                        </label>
                        <label class="checkbox-item">
                            <input type="checkbox" checked>
                            <span>同步问题和任务</span>
                        </label>
                        <label class="checkbox-item">
                            <input type="checkbox">
                            <span>同步用户信息</span>
                        </label>
                    </div>
                </div>
                <div class="integration-info-box">
                    <p><strong>连接时间：</strong>${integration.connectedAt}</p>
                    <p><strong>状态：</strong><span class="status-badge connected">正常</span></p>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-outline" onclick="document.getElementById('integrationConfigModal').remove()">取消</button>
                <button class="btn btn-primary" onclick="saveIntegrationConfig(${integrationId})">保存</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function saveIntegrationConfig(integrationId) {
    document.getElementById('integrationConfigModal')?.remove();
    showToast('集成配置已保存', 'success');
}

// ==================== Webhook 设置 ====================
function loadWebhooks() {
    const container = document.querySelector('.webhooks-list');
    if (!container) return;
    
    if (SettingsData.webhooks.length === 0) {
        container.innerHTML = '<p class="empty-text">暂无 Webhook 配置</p>';
        return;
    }
    
    container.innerHTML = SettingsData.webhooks.map(webhook => `
        <div class="webhook-item ${webhook.status}" data-id="${webhook.id}">
            <div class="webhook-info">
                <h4>${webhook.name}</h4>
                <p class="webhook-url">${webhook.url}</p>
                <div class="webhook-events">
                    ${webhook.events.map(e => `<span class="event-tag">${e}</span>`).join('')}
                </div>
            </div>
            <div class="webhook-meta">
                <span class="status-badge ${webhook.status}">${webhook.status === 'active' ? '活跃' : '已禁用'}</span>
                ${webhook.lastTriggered ? `<span class="last-triggered">最后触发: ${webhook.lastTriggered}</span>` : ''}
            </div>
            <div class="webhook-actions">
                <button class="btn btn-sm btn-outline" onclick="editWebhook(${webhook.id})">编辑</button>
                <button class="btn btn-sm btn-outline" onclick="testWebhook(${webhook.id})">测试</button>
                <button class="btn btn-sm btn-text danger" onclick="deleteWebhook(${webhook.id})">删除</button>
            </div>
        </div>
    `).join('');
}

function showCreateWebhookModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.id = 'webhookModal';
    modal.innerHTML = `
        <div class="modal" style="width: 500px;">
            <div class="modal-header">
                <h3>创建 Webhook</h3>
                <button class="modal-close" onclick="document.getElementById('webhookModal').remove()">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label>名称 <span class="required">*</span></label>
                    <input type="text" id="webhookName" placeholder="例如：构建通知">
                </div>
                <div class="form-group">
                    <label>URL <span class="required">*</span></label>
                    <input type="url" id="webhookUrl" placeholder="https://example.com/webhook">
                </div>
                <div class="form-group">
                    <label>Secret（可选）</label>
                    <input type="password" id="webhookSecret" placeholder="用于验证请求的密钥">
                </div>
                <div class="form-group">
                    <label>触发事件</label>
                    <div class="checkbox-group vertical">
                        <label class="checkbox-item">
                            <input type="checkbox" value="build.success">
                            <span>构建成功</span>
                        </label>
                        <label class="checkbox-item">
                            <input type="checkbox" value="build.failed">
                            <span>构建失败</span>
                        </label>
                        <label class="checkbox-item">
                            <input type="checkbox" value="deploy.success">
                            <span>部署成功</span>
                        </label>
                        <label class="checkbox-item">
                            <input type="checkbox" value="deploy.failed">
                            <span>部署失败</span>
                        </label>
                        <label class="checkbox-item">
                            <input type="checkbox" value="mr.created">
                            <span>合并请求创建</span>
                        </label>
                        <label class="checkbox-item">
                            <input type="checkbox" value="mr.merged">
                            <span>合并请求合并</span>
                        </label>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-outline" onclick="document.getElementById('webhookModal').remove()">取消</button>
                <button class="btn btn-primary" onclick="createWebhook()">创建</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function createWebhook() {
    const nameInput = document.getElementById('webhookName');
    const urlInput = document.getElementById('webhookUrl');
    
    if (!nameInput?.value.trim()) {
        showToast('请输入 Webhook 名称', 'error');
        return;
    }
    
    if (!urlInput?.value.trim()) {
        showToast('请输入 Webhook URL', 'error');
        return;
    }
    
    // 收集选中的事件
    const events = [];
    document.querySelectorAll('#webhookModal .checkbox-item input:checked').forEach(checkbox => {
        events.push(checkbox.value);
    });
    
    if (events.length === 0) {
        showToast('请至少选择一个触发事件', 'error');
        return;
    }
    
    const newWebhook = {
        id: Math.max(...SettingsData.webhooks.map(w => w.id), 0) + 1,
        name: nameInput.value.trim(),
        url: urlInput.value.trim(),
        events: events,
        status: 'active',
        lastTriggered: null
    };
    
    SettingsData.webhooks.push(newWebhook);
    
    document.getElementById('webhookModal')?.remove();
    loadWebhooks();
    showToast('Webhook 创建成功', 'success');
}

function editWebhook(webhookId) {
    const webhook = SettingsData.webhooks.find(w => w.id === webhookId);
    if (!webhook) return;
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.id = 'webhookModal';
    modal.innerHTML = `
        <div class="modal" style="width: 500px;">
            <div class="modal-header">
                <h3>编辑 Webhook</h3>
                <button class="modal-close" onclick="document.getElementById('webhookModal').remove()">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label>名称 <span class="required">*</span></label>
                    <input type="text" id="webhookName" value="${webhook.name}">
                </div>
                <div class="form-group">
                    <label>URL <span class="required">*</span></label>
                    <input type="url" id="webhookUrl" value="${webhook.url}">
                </div>
                <div class="form-group">
                    <label>状态</label>
                    <select id="webhookStatus">
                        <option value="active" ${webhook.status === 'active' ? 'selected' : ''}>活跃</option>
                        <option value="inactive" ${webhook.status === 'inactive' ? 'selected' : ''}>已禁用</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>触发事件</label>
                    <div class="checkbox-group vertical">
                        <label class="checkbox-item">
                            <input type="checkbox" value="build.success" ${webhook.events.includes('build.success') ? 'checked' : ''}>
                            <span>构建成功</span>
                        </label>
                        <label class="checkbox-item">
                            <input type="checkbox" value="build.failed" ${webhook.events.includes('build.failed') ? 'checked' : ''}>
                            <span>构建失败</span>
                        </label>
                        <label class="checkbox-item">
                            <input type="checkbox" value="deploy.success" ${webhook.events.includes('deploy.success') ? 'checked' : ''}>
                            <span>部署成功</span>
                        </label>
                        <label class="checkbox-item">
                            <input type="checkbox" value="deploy.failed" ${webhook.events.includes('deploy.failed') ? 'checked' : ''}>
                            <span>部署失败</span>
                        </label>
                        <label class="checkbox-item">
                            <input type="checkbox" value="mr.created" ${webhook.events.includes('mr.created') ? 'checked' : ''}>
                            <span>合并请求创建</span>
                        </label>
                        <label class="checkbox-item">
                            <input type="checkbox" value="mr.merged" ${webhook.events.includes('mr.merged') ? 'checked' : ''}>
                            <span>合并请求合并</span>
                        </label>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-outline" onclick="document.getElementById('webhookModal').remove()">取消</button>
                <button class="btn btn-primary" onclick="updateWebhook(${webhookId})">保存</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function updateWebhook(webhookId) {
    const webhook = SettingsData.webhooks.find(w => w.id === webhookId);
    if (!webhook) return;
    
    const nameInput = document.getElementById('webhookName');
    const urlInput = document.getElementById('webhookUrl');
    const statusSelect = document.getElementById('webhookStatus');
    
    if (!nameInput?.value.trim() || !urlInput?.value.trim()) {
        showToast('请填写必填字段', 'error');
        return;
    }
    
    // 收集选中的事件
    const events = [];
    document.querySelectorAll('#webhookModal .checkbox-item input:checked').forEach(checkbox => {
        events.push(checkbox.value);
    });
    
    webhook.name = nameInput.value.trim();
    webhook.url = urlInput.value.trim();
    webhook.status = statusSelect?.value || 'active';
    webhook.events = events;
    
    document.getElementById('webhookModal')?.remove();
    loadWebhooks();
    showToast('Webhook 已更新', 'success');
}

function testWebhook(webhookId) {
    const webhook = SettingsData.webhooks.find(w => w.id === webhookId);
    if (!webhook) return;
    
    showToast(`正在测试 ${webhook.name}...`, 'info');
    
    setTimeout(() => {
        webhook.lastTriggered = new Date().toLocaleString('zh-CN');
        loadWebhooks();
        showToast('Webhook 测试成功', 'success');
    }, 1500);
}

function deleteWebhook(webhookId) {
    const webhook = SettingsData.webhooks.find(w => w.id === webhookId);
    if (!webhook) return;
    
    if (!confirm(`确定要删除 Webhook "${webhook.name}" 吗？`)) return;
    
    SettingsData.webhooks = SettingsData.webhooks.filter(w => w.id !== webhookId);
    loadWebhooks();
    showToast('Webhook 已删除', 'success');
}

// ==================== 危险操作 ====================
function transferTeam() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.id = 'transferModal';
    modal.innerHTML = `
        <div class="modal" style="width: 450px;">
            <div class="modal-header">
                <h3>转让团队</h3>
                <button class="modal-close" onclick="document.getElementById('transferModal').remove()">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            </div>
            <div class="modal-body">
                <div class="warning-box">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                        <line x1="12" y1="9" x2="12" y2="13"/>
                        <line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                    <p>转让团队后，您将失去团队所有者权限。此操作不可撤销。</p>
                </div>
                <div class="form-group">
                    <label>选择新所有者</label>
                    <select id="newOwner">
                        <option value="">请选择...</option>
                        <option value="2">李四 (lisi@example.com)</option>
                        <option value="3">王五 (wangwu@example.com)</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>输入团队名称确认</label>
                    <input type="text" id="confirmTeamName" placeholder="${SettingsData.team.name}">
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-outline" onclick="document.getElementById('transferModal').remove()">取消</button>
                <button class="btn btn-danger" onclick="confirmTransferTeam()">确认转让</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function confirmTransferTeam() {
    const newOwnerSelect = document.getElementById('newOwner');
    const confirmInput = document.getElementById('confirmTeamName');
    
    if (!newOwnerSelect?.value) {
        showToast('请选择新所有者', 'error');
        return;
    }
    
    if (confirmInput?.value !== SettingsData.team.name) {
        showToast('团队名称不匹配', 'error');
        return;
    }
    
    document.getElementById('transferModal')?.remove();
    showToast('团队已转让', 'success');
    
    // 模拟跳转
    setTimeout(() => {
        window.location.href = 'dashboard.html';
    }, 1500);
}

function deleteTeam() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.id = 'deleteTeamModal';
    modal.innerHTML = `
        <div class="modal" style="width: 450px;">
            <div class="modal-header">
                <h3>删除团队</h3>
                <button class="modal-close" onclick="document.getElementById('deleteTeamModal').remove()">
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
                        <p>删除团队将永久删除所有项目、代码仓库、构建记录和其他数据。</p>
                    </div>
                </div>
                <div class="form-group">
                    <label>输入 <strong>${SettingsData.team.slug}</strong> 确认删除</label>
                    <input type="text" id="confirmDeleteSlug" placeholder="${SettingsData.team.slug}">
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-outline" onclick="document.getElementById('deleteTeamModal').remove()">取消</button>
                <button class="btn btn-danger" onclick="confirmDeleteTeam()">永久删除</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function confirmDeleteTeam() {
    const confirmInput = document.getElementById('confirmDeleteSlug');
    
    if (confirmInput?.value !== SettingsData.team.slug) {
        showToast('团队标识不匹配', 'error');
        return;
    }
    
    document.getElementById('deleteTeamModal')?.remove();
    showToast('团队已删除', 'success');
    
    // 模拟跳转
    setTimeout(() => {
        window.location.href = '../index.html';
    }, 1500);
}

// ==================== 事件绑定 ====================
function bindSettingsEvents() {
    // 保存团队信息按钮
    const saveTeamBtn = document.getElementById('saveTeamInfo');
    if (saveTeamBtn) {
        saveTeamBtn.addEventListener('click', saveTeamInfo);
    }
    
    // 上传头像按钮
    const uploadAvatarBtn = document.querySelector('.upload-avatar-btn');
    if (uploadAvatarBtn) {
        uploadAvatarBtn.addEventListener('click', uploadTeamAvatar);
    }
    
    // 移除头像按钮
    const removeAvatarBtn = document.querySelector('.remove-avatar-btn');
    if (removeAvatarBtn) {
        removeAvatarBtn.addEventListener('click', removeTeamAvatar);
    }
    
    // 通知设置开关
    document.querySelectorAll('.notification-toggle').forEach(toggle => {
        toggle.addEventListener('change', function() {
            const [type, key] = this.id.split('-');
            toggleNotification(type, key, this.checked);
        });
    });
    
    // 双因素认证开关
    const twoFactorToggle = document.getElementById('twoFactorRequired');
    if (twoFactorToggle) {
        twoFactorToggle.addEventListener('change', function() {
            toggleTwoFactor(this.checked);
        });
    }
    
    // SSO 开关
    const ssoToggle = document.getElementById('ssoEnabled');
    if (ssoToggle) {
        ssoToggle.addEventListener('change', function() {
            toggleSSO(this.checked);
        });
    }
    
    // 添加 IP 白名单按钮
    const addIPBtn = document.querySelector('.add-ip-btn');
    if (addIPBtn) {
        addIPBtn.addEventListener('click', addIPWhitelist);
    }
    
    // 创建 Webhook 按钮
    const createWebhookBtn = document.querySelector('.create-webhook-btn');
    if (createWebhookBtn) {
        createWebhookBtn.addEventListener('click', showCreateWebhookModal);
    }
    
    // 转让团队按钮
    const transferBtn = document.querySelector('.transfer-team-btn');
    if (transferBtn) {
        transferBtn.addEventListener('click', transferTeam);
    }
    
    // 删除团队按钮
    const deleteBtn = document.querySelector('.delete-team-btn');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', deleteTeam);
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
const settingsStyles = document.createElement('style');
settingsStyles.textContent = `
    /* 集成卡片网格 */
    .integrations-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 16px;
    }
    
    .integration-card {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 16px;
        background: #fff;
        border: 1px solid var(--border-light);
        border-radius: var(--radius-md);
        transition: all 0.2s;
    }
    
    .integration-card:hover {
        border-color: var(--primary-color);
    }
    
    .integration-card.connected {
        border-left: 3px solid var(--success-color);
    }
    
    .integration-icon {
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--text-secondary);
    }
    
    .integration-icon svg {
        width: 32px;
        height: 32px;
    }
    
    .integration-info {
        flex: 1;
    }
    
    .integration-info h4 {
        font-size: 14px;
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 4px;
    }
    
    .integration-type {
        font-size: 12px;
        color: var(--text-secondary);
    }
    
    .integration-status {
        display: flex;
        align-items: center;
        gap: 8px;
    }
    
    .status-badge {
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 500;
    }
    
    .status-badge.connected {
        background: var(--success-light);
        color: var(--success-color);
    }
    
    .status-badge.active {
        background: var(--success-light);
        color: var(--success-color);
    }
    
    .status-badge.inactive {
        background: var(--bg-light);
        color: var(--text-secondary);
    }
    
    /* Webhook 列表 */
    .webhooks-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }
    
    .webhook-item {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 16px;
        background: #fff;
        border: 1px solid var(--border-light);
        border-radius: var(--radius-md);
    }
    
    .webhook-item.active {
        border-left: 3px solid var(--success-color);
    }
    
    .webhook-item.inactive {
        opacity: 0.7;
    }
    
    .webhook-info {
        flex: 1;
    }
    
    .webhook-info h4 {
        font-size: 14px;
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 4px;
    }
    
    .webhook-url {
        font-size: 12px;
        color: var(--text-secondary);
        font-family: monospace;
        margin-bottom: 8px;
    }
    
    .webhook-events {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
    }
    
    .event-tag {
        padding: 2px 6px;
        background: var(--bg-light);
        border-radius: 4px;
        font-size: 11px;
        color: var(--text-secondary);
    }
    
    .webhook-meta {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 4px;
    }
    
    .last-triggered {
        font-size: 11px;
        color: var(--text-placeholder);
    }
    
    .webhook-actions {
        display: flex;
        gap: 8px;
    }
    
    /* 警告和危险框 */
    .warning-box, .danger-box {
        display: flex;
        gap: 12px;
        padding: 16px;
        border-radius: var(--radius-md);
        margin-bottom: 20px;
    }
    
    .warning-box {
        background: #fef3c7;
        color: #92400e;
    }
    
    .danger-box {
        background: #fee2e2;
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
    
    /* 集成配置信息框 */
    .integration-info-box {
        padding: 12px;
        background: var(--bg-light);
        border-radius: var(--radius-md);
        margin-top: 16px;
    }
    
    .integration-info-box p {
        font-size: 13px;
        color: var(--text-secondary);
        margin-bottom: 4px;
    }
    
    .integration-info-box p:last-child {
        margin-bottom: 0;
    }
    
    /* IP 白名单 */
    .ip-whitelist-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
    
    .ip-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 12px;
        background: var(--bg-light);
        border-radius: var(--radius-md);
    }
    
    .ip-item span {
        font-family: monospace;
        font-size: 13px;
    }
    
    /* 存储进度条 */
    .storage-progress {
        height: 8px;
        background: var(--bg-light);
        border-radius: 4px;
        overflow: hidden;
        margin-bottom: 8px;
    }
    
    .storage-progress .progress-fill {
        height: 100%;
        background: var(--primary-color);
        border-radius: 4px;
        transition: width 0.3s;
    }
    
    .storage-info {
        display: flex;
        justify-content: space-between;
        font-size: 12px;
        color: var(--text-secondary);
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
document.head.appendChild(settingsStyles);