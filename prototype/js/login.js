/**
 * 登录页 JavaScript 模块
 * 包含账号密码登录、手机验证码登录、扫码登录、第三方登录等功能
 */

// ==================== 登录数据模型 ====================
const LoginData = {
    // 模拟用户数据
    users: [
        { email: 'admin@example.com', phone: '13800138000', password: 'Admin123!', name: '管理员' },
        { email: 'zhangsan@example.com', phone: '13900139000', password: 'Zhang123!', name: '张三' },
        { email: 'lisi@example.com', phone: '13700137000', password: 'Lisi123!', name: '李四' }
    ],
    
    // 验证码相关
    verificationCode: null,
    codeExpireTime: null,
    codeCooldown: 60,
    
    // 扫码登录相关
    qrcodeStatus: 'pending', // pending, scanned, confirmed, expired
    qrcodeTimer: null,
    qrcodeExpireTime: 120, // 二维码有效期（秒）
    
    // 记住我
    rememberMe: true,
    
    // 登录尝试次数
    loginAttempts: 0,
    maxAttempts: 5,
    lockoutTime: null
};

// ==================== 工具函数 ====================

/**
 * 显示Toast提示
 */
function showToast(message, type = 'info') {
    // 移除现有的toast
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <span class="toast-icon">${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span>
            <span class="toast-message">${message}</span>
        </div>
    `;
    document.body.appendChild(toast);
    
    // 添加样式
    if (!document.getElementById('toast-styles')) {
        const style = document.createElement('style');
        style.id = 'toast-styles';
        style.textContent = `
            .toast {
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                padding: 12px 24px;
                border-radius: 8px;
                background: #333;
                color: #fff;
                font-size: 14px;
                z-index: 10000;
                animation: toastIn 0.3s ease;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            }
            .toast-success { background: #22c55e; }
            .toast-error { background: #ef4444; }
            .toast-info { background: #3b82f6; }
            .toast-content {
                display: flex;
                align-items: center;
                gap: 8px;
            }
            .toast-icon {
                font-weight: bold;
            }
            @keyframes toastIn {
                from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
                to { opacity: 1; transform: translateX(-50%) translateY(0); }
            }
        `;
        document.head.appendChild(style);
    }
    
    setTimeout(() => toast.remove(), 3000);
}

/**
 * 验证邮箱格式
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * 验证手机号格式
 */
function isValidPhone(phone) {
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(phone);
}

/**
 * 生成随机验证码
 */
function generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * 生成二维码
 */
function generateQRCode() {
    const qrcodeBox = document.querySelector('.qrcode-placeholder');
    if (!qrcodeBox) return;
    
    // 模拟生成新的二维码
    const timestamp = Date.now();
    qrcodeBox.innerHTML = `
        <svg width="160" height="160" viewBox="0 0 160 160" fill="none">
            <rect width="160" height="160" fill="#f5f7fa"/>
            <rect x="20" y="20" width="40" height="40" fill="#333"/>
            <rect x="100" y="20" width="40" height="40" fill="#333"/>
            <rect x="20" y="100" width="40" height="40" fill="#333"/>
            <rect x="70" y="70" width="20" height="20" fill="#333"/>
            <rect x="100" y="100" width="40" height="40" fill="#333"/>
            <rect x="30" y="30" width="20" height="20" fill="#fff"/>
            <rect x="110" y="30" width="20" height="20" fill="#fff"/>
            <rect x="30" y="110" width="20" height="20" fill="#fff"/>
            <rect x="110" y="110" width="20" height="20" fill="#fff"/>
            <text x="80" y="85" text-anchor="middle" font-size="8" fill="#666">${timestamp}</text>
        </svg>
    `;
    
    return timestamp;
}

// ==================== 登录方式切换 ====================

/**
 * 初始化登录方式切换
 */
function initLoginTabs() {
    const tabs = document.querySelectorAll('.auth-tab');
    const contents = document.querySelectorAll('.auth-tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.dataset.tab;
            
            // 移除所有active状态
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));
            
            // 添加当前active状态
            this.classList.add('active');
            const targetContent = document.getElementById('tab-' + tabName);
            if (targetContent) {
                targetContent.classList.add('active');
            }
            
            // 如果切换到扫码登录，启动扫码轮询
            if (tabName === 'qrcode') {
                startQRCodePolling();
            } else {
                stopQRCodePolling();
            }
        });
    });
}

// ==================== 账号密码登录 ====================

/**
 * 初始化账号密码登录表单
 */
function initAccountLoginForm() {
    const form = document.querySelector('#tab-account .auth-form');
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        handleAccountLogin();
    });
    
    // 记住我复选框
    const rememberCheckbox = form.querySelector('input[type="checkbox"]');
    if (rememberCheckbox) {
        rememberCheckbox.checked = LoginData.rememberMe;
        rememberCheckbox.addEventListener('change', function() {
            LoginData.rememberMe = this.checked;
        });
    }
    
    // 加载保存的账号
    loadSavedCredentials();
}

/**
 * 处理账号密码登录
 */
function handleAccountLogin() {
    const form = document.querySelector('#tab-account .auth-form');
    const accountInput = form.querySelector('input[type="text"]');
    const passwordInput = form.querySelector('input[type="password"]');
    const submitBtn = form.querySelector('button[type="submit"]');
    
    const account = accountInput.value.trim();
    const password = passwordInput.value;
    
    // 检查是否被锁定
    if (LoginData.lockoutTime && Date.now() < LoginData.lockoutTime) {
        const remainingTime = Math.ceil((LoginData.lockoutTime - Date.now()) / 1000 / 60);
        showToast(`账号已被锁定，请${remainingTime}分钟后再试`, 'error');
        return;
    }
    
    // 验证输入
    if (!account) {
        showToast('请输入邮箱或手机号', 'error');
        accountInput.focus();
        return;
    }
    
    if (!password) {
        showToast('请输入密码', 'error');
        passwordInput.focus();
        return;
    }
    
    // 验证账号格式
    if (!isValidEmail(account) && !isValidPhone(account)) {
        showToast('请输入正确的邮箱或手机号格式', 'error');
        return;
    }
    
    // 显示加载状态
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="loading-spinner"></span> 登录中...';
    
    // 模拟登录验证
    setTimeout(() => {
        const user = LoginData.users.find(u => 
            (u.email === account || u.phone === account) && u.password === password
        );
        
        if (user) {
            // 登录成功
            LoginData.loginAttempts = 0;
            
            // 保存凭据
            if (LoginData.rememberMe) {
                saveCredentials(account);
            } else {
                clearSavedCredentials();
            }
            
            showToast(`欢迎回来，${user.name}！`, 'success');
            
            // 跳转到控制台
            setTimeout(() => {
                window.location.href = 'console/dashboard.html';
            }, 1000);
        } else {
            // 登录失败
            LoginData.loginAttempts++;
            
            if (LoginData.loginAttempts >= LoginData.maxAttempts) {
                // 锁定账号15分钟
                LoginData.lockoutTime = Date.now() + 15 * 60 * 1000;
                showToast('登录失败次数过多，账号已被锁定15分钟', 'error');
            } else {
                const remaining = LoginData.maxAttempts - LoginData.loginAttempts;
                showToast(`邮箱/手机号或密码错误，还剩${remaining}次尝试机会`, 'error');
            }
            
            // 添加错误样式
            accountInput.classList.add('input-error');
            passwordInput.classList.add('input-error');
            
            setTimeout(() => {
                accountInput.classList.remove('input-error');
                passwordInput.classList.remove('input-error');
            }, 2000);
        }
        
        // 恢复按钮状态
        submitBtn.disabled = false;
        submitBtn.textContent = '登录';
    }, 1500);
}

/**
 * 保存登录凭据
 */
function saveCredentials(account) {
    try {
        localStorage.setItem('mota_saved_account', account);
    } catch (e) {
        console.warn('无法保存登录凭据');
    }
}

/**
 * 加载保存的凭据
 */
function loadSavedCredentials() {
    try {
        const savedAccount = localStorage.getItem('mota_saved_account');
        if (savedAccount) {
            const accountInput = document.querySelector('#tab-account input[type="text"]');
            if (accountInput) {
                accountInput.value = savedAccount;
            }
        }
    } catch (e) {
        console.warn('无法加载保存的凭据');
    }
}

/**
 * 清除保存的凭据
 */
function clearSavedCredentials() {
    try {
        localStorage.removeItem('mota_saved_account');
    } catch (e) {
        console.warn('无法清除保存的凭据');
    }
}

// ==================== 手机验证码登录 ====================

/**
 * 初始化手机验证码登录表单
 */
function initPhoneLoginForm() {
    const form = document.querySelector('#tab-phone .auth-form');
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        handlePhoneLogin();
    });
    
    // 获取验证码按钮
    const sendCodeBtn = form.querySelector('.btn-secondary');
    if (sendCodeBtn) {
        sendCodeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            handleSendVerificationCode();
        });
    }
}

/**
 * 发送验证码
 */
function handleSendVerificationCode() {
    const form = document.querySelector('#tab-phone .auth-form');
    const phoneInput = form.querySelector('input[type="tel"]');
    const sendCodeBtn = form.querySelector('.btn-secondary');
    
    const phone = phoneInput.value.trim();
    
    // 验证手机号
    if (!phone) {
        showToast('请输入手机号', 'error');
        phoneInput.focus();
        return;
    }
    
    if (!isValidPhone(phone)) {
        showToast('请输入正确的手机号格式', 'error');
        return;
    }
    
    // 检查是否在冷却中
    if (sendCodeBtn.disabled) {
        return;
    }
    
    // 生成验证码
    LoginData.verificationCode = generateVerificationCode();
    LoginData.codeExpireTime = Date.now() + 5 * 60 * 1000; // 5分钟有效期
    
    // 模拟发送验证码
    showToast(`验证码已发送到 ${phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')}，验证码：${LoginData.verificationCode}`, 'success');
    
    // 开始倒计时
    startCodeCooldown(sendCodeBtn);
}

/**
 * 开始验证码冷却倒计时
 */
function startCodeCooldown(btn) {
    let countdown = LoginData.codeCooldown;
    btn.disabled = true;
    btn.textContent = `${countdown}秒后重发`;
    
    const timer = setInterval(() => {
        countdown--;
        if (countdown <= 0) {
            clearInterval(timer);
            btn.disabled = false;
            btn.textContent = '获取验证码';
        } else {
            btn.textContent = `${countdown}秒后重发`;
        }
    }, 1000);
}

/**
 * 处理手机验证码登录
 */
function handlePhoneLogin() {
    const form = document.querySelector('#tab-phone .auth-form');
    const phoneInput = form.querySelector('input[type="tel"]');
    const codeInput = form.querySelector('input[type="text"]');
    const submitBtn = form.querySelector('button[type="submit"]');
    
    const phone = phoneInput.value.trim();
    const code = codeInput.value.trim();
    
    // 验证输入
    if (!phone) {
        showToast('请输入手机号', 'error');
        phoneInput.focus();
        return;
    }
    
    if (!isValidPhone(phone)) {
        showToast('请输入正确的手机号格式', 'error');
        return;
    }
    
    if (!code) {
        showToast('请输入验证码', 'error');
        codeInput.focus();
        return;
    }
    
    if (code.length !== 6) {
        showToast('请输入6位验证码', 'error');
        return;
    }
    
    // 显示加载状态
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="loading-spinner"></span> 登录中...';
    
    // 验证验证码
    setTimeout(() => {
        // 检查验证码是否过期
        if (!LoginData.verificationCode || Date.now() > LoginData.codeExpireTime) {
            showToast('验证码已过期，请重新获取', 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = '登录';
            return;
        }
        
        // 验证验证码是否正确
        if (code !== LoginData.verificationCode) {
            showToast('验证码错误', 'error');
            codeInput.classList.add('input-error');
            setTimeout(() => codeInput.classList.remove('input-error'), 2000);
            submitBtn.disabled = false;
            submitBtn.textContent = '登录';
            return;
        }
        
        // 查找用户
        const user = LoginData.users.find(u => u.phone === phone);
        
        if (user) {
            showToast(`欢迎回来，${user.name}！`, 'success');
        } else {
            // 新用户自动注册
            showToast('登录成功！', 'success');
        }
        
        // 清除验证码
        LoginData.verificationCode = null;
        LoginData.codeExpireTime = null;
        
        // 跳转到控制台
        setTimeout(() => {
            window.location.href = 'console/dashboard.html';
        }, 1000);
    }, 1500);
}

// ==================== 扫码登录 ====================

/**
 * 初始化扫码登录
 */
function initQRCodeLogin() {
    const refreshBtn = document.querySelector('.qrcode-download');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function(e) {
            e.preventDefault();
            refreshQRCode();
        });
    }
    
    // 添加刷新二维码按钮
    const qrcodeBox = document.querySelector('.qrcode-box');
    if (qrcodeBox) {
        const refreshOverlay = document.createElement('div');
        refreshOverlay.className = 'qrcode-refresh-overlay';
        refreshOverlay.innerHTML = `
            <button class="qrcode-refresh-btn" onclick="refreshQRCode()">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M23 4v6h-6"/>
                    <path d="M1 20v-6h6"/>
                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                </svg>
                <span>刷新二维码</span>
            </button>
        `;
        qrcodeBox.appendChild(refreshOverlay);
        
        // 添加样式
        addQRCodeStyles();
    }
}

/**
 * 添加二维码相关样式
 */
function addQRCodeStyles() {
    if (document.getElementById('qrcode-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'qrcode-styles';
    style.textContent = `
        .qrcode-box {
            position: relative;
        }
        .qrcode-refresh-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(255,255,255,0.9);
            display: none;
            align-items: center;
            justify-content: center;
            border-radius: 8px;
        }
        .qrcode-box.expired .qrcode-refresh-overlay {
            display: flex;
        }
        .qrcode-refresh-btn {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
            padding: 16px 24px;
            background: #2b7de9;
            color: #fff;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            transition: background 0.2s;
        }
        .qrcode-refresh-btn:hover {
            background: #1a6dd6;
        }
        .qrcode-status {
            text-align: center;
            margin-top: 12px;
            font-size: 14px;
            color: #666;
        }
        .qrcode-status.scanned {
            color: #22c55e;
        }
        .loading-spinner {
            display: inline-block;
            width: 16px;
            height: 16px;
            border: 2px solid #fff;
            border-radius: 50%;
            border-top-color: transparent;
            animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        .input-error {
            border-color: #ef4444 !important;
            animation: shake 0.3s ease;
        }
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
        }
    `;
    document.head.appendChild(style);
}

/**
 * 刷新二维码
 */
function refreshQRCode() {
    const qrcodeBox = document.querySelector('.qrcode-box');
    if (qrcodeBox) {
        qrcodeBox.classList.remove('expired');
    }
    
    LoginData.qrcodeStatus = 'pending';
    generateQRCode();
    updateQRCodeStatus();
    startQRCodePolling();
    
    showToast('二维码已刷新', 'success');
}

/**
 * 开始扫码轮询
 */
function startQRCodePolling() {
    stopQRCodePolling();
    
    let elapsedTime = 0;
    
    LoginData.qrcodeTimer = setInterval(() => {
        elapsedTime++;
        
        // 模拟扫码状态变化
        if (elapsedTime === 5 && Math.random() > 0.7) {
            LoginData.qrcodeStatus = 'scanned';
            updateQRCodeStatus();
        }
        
        if (elapsedTime === 8 && LoginData.qrcodeStatus === 'scanned' && Math.random() > 0.5) {
            LoginData.qrcodeStatus = 'confirmed';
            updateQRCodeStatus();
            stopQRCodePolling();
            
            // 登录成功
            showToast('扫码登录成功！', 'success');
            setTimeout(() => {
                window.location.href = 'console/dashboard.html';
            }, 1000);
        }
        
        // 二维码过期
        if (elapsedTime >= LoginData.qrcodeExpireTime) {
            LoginData.qrcodeStatus = 'expired';
            updateQRCodeStatus();
            stopQRCodePolling();
        }
    }, 1000);
}

/**
 * 停止扫码轮询
 */
function stopQRCodePolling() {
    if (LoginData.qrcodeTimer) {
        clearInterval(LoginData.qrcodeTimer);
        LoginData.qrcodeTimer = null;
    }
}

/**
 * 更新二维码状态显示
 */
function updateQRCodeStatus() {
    const qrcodeBox = document.querySelector('.qrcode-box');
    let statusEl = document.querySelector('.qrcode-status');
    
    if (!statusEl) {
        statusEl = document.createElement('div');
        statusEl.className = 'qrcode-status';
        const qrcodeLogin = document.querySelector('.qrcode-login');
        if (qrcodeLogin) {
            qrcodeLogin.insertBefore(statusEl, document.querySelector('.qrcode-tip'));
        }
    }
    
    switch (LoginData.qrcodeStatus) {
        case 'pending':
            statusEl.textContent = '等待扫码...';
            statusEl.className = 'qrcode-status';
            if (qrcodeBox) qrcodeBox.classList.remove('expired');
            break;
        case 'scanned':
            statusEl.textContent = '已扫码，请在手机上确认登录';
            statusEl.className = 'qrcode-status scanned';
            break;
        case 'confirmed':
            statusEl.textContent = '登录成功，正在跳转...';
            statusEl.className = 'qrcode-status scanned';
            break;
        case 'expired':
            statusEl.textContent = '二维码已过期';
            statusEl.className = 'qrcode-status';
            if (qrcodeBox) qrcodeBox.classList.add('expired');
            break;
    }
}

// ==================== 第三方登录 ====================

/**
 * 初始化第三方登录
 */
function initSocialLogin() {
    const socialBtns = document.querySelectorAll('.auth-social-btn');
    
    socialBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const title = this.getAttribute('title');
            handleSocialLogin(title);
        });
    });
}

/**
 * 处理第三方登录
 */
function handleSocialLogin(provider) {
    // 显示加载状态
    showToast(`正在跳转到${provider}...`, 'info');
    
    // 模拟第三方登录流程
    setTimeout(() => {
        // 模拟打开第三方登录窗口
        const width = 600;
        const height = 600;
        const left = (window.innerWidth - width) / 2;
        const top = (window.innerHeight - height) / 2;
        
        // 在实际应用中，这里会打开第三方OAuth窗口
        // window.open(oauthUrl, 'oauth', `width=${width},height=${height},left=${left},top=${top}`);
        
        // 模拟登录成功
        setTimeout(() => {
            showToast(`${provider}成功！`, 'success');
            setTimeout(() => {
                window.location.href = 'console/dashboard.html';
            }, 1000);
        }, 2000);
    }, 500);
}

// ==================== 密码显示切换 ====================

/**
 * 切换密码显示/隐藏
 */
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleBtn = passwordInput.parentElement.querySelector('.form-input-toggle');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
            </svg>
        `;
    } else {
        passwordInput.type = 'password';
        toggleBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
            </svg>
        `;
    }
}

// ==================== 忘记密码 ====================

/**
 * 初始化忘记密码链接
 */
function initForgotPassword() {
    const forgotLink = document.querySelector('.form-link[href*="forgot"]');
    if (forgotLink) {
        forgotLink.addEventListener('click', function(e) {
            e.preventDefault();
            showForgotPasswordModal();
        });
    }
}

/**
 * 显示忘记密码弹窗
 */
function showForgotPasswordModal() {
    // 创建弹窗
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'forgotPasswordModal';
    modal.innerHTML = `
        <div class="modal forgot-password-modal">
            <div class="modal-header">
                <h3>找回密码</h3>
                <button class="modal-close" onclick="closeForgotPasswordModal()">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            </div>
            <div class="modal-body">
                <p class="modal-desc">请输入您的邮箱地址，我们将发送密码重置链接到您的邮箱。</p>
                <div class="form-group">
                    <label class="form-label">邮箱地址</label>
                    <input type="email" class="form-input" id="resetEmail" placeholder="请输入邮箱地址">
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-outline" onclick="closeForgotPasswordModal()">取消</button>
                <button class="btn btn-primary" onclick="handleResetPassword()">发送重置链接</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // 添加样式
    addModalStyles();
    
    // 显示弹窗
    setTimeout(() => modal.classList.add('active'), 10);
    
    // 聚焦输入框
    document.getElementById('resetEmail').focus();
}

/**
 * 关闭忘记密码弹窗
 */
function closeForgotPasswordModal() {
    const modal = document.getElementById('forgotPasswordModal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    }
}

/**
 * 处理密码重置
 */
function handleResetPassword() {
    const emailInput = document.getElementById('resetEmail');
    const email = emailInput.value.trim();
    
    if (!email) {
        showToast('请输入邮箱地址', 'error');
        emailInput.focus();
        return;
    }
    
    if (!isValidEmail(email)) {
        showToast('请输入正确的邮箱格式', 'error');
        return;
    }
    
    // 模拟发送重置邮件
    showToast('密码重置链接已发送到您的邮箱', 'success');
    closeForgotPasswordModal();
}

/**
 * 添加弹窗样式
 */
function addModalStyles() {
    if (document.getElementById('modal-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'modal-styles';
    style.textContent = `
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            opacity: 0;
            transition: opacity 0.3s;
        }
        .modal-overlay.active {
            opacity: 1;
        }
        .modal {
            background: #fff;
            border-radius: 12px;
            width: 100%;
            max-width: 420px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.2);
            transform: translateY(-20px);
            transition: transform 0.3s;
        }
        .modal-overlay.active .modal {
            transform: translateY(0);
        }
        .modal-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 20px 24px;
            border-bottom: 1px solid #e5e7eb;
        }
        .modal-header h3 {
            font-size: 18px;
            font-weight: 600;
            color: #1f2937;
        }
        .modal-close {
            background: none;
            border: none;
            cursor: pointer;
            color: #6b7280;
            padding: 4px;
            border-radius: 4px;
            transition: background 0.2s;
        }
        .modal-close:hover {
            background: #f3f4f6;
        }
        .modal-body {
            padding: 24px;
        }
        .modal-desc {
            font-size: 14px;
            color: #6b7280;
            margin-bottom: 20px;
        }
        .modal-footer {
            display: flex;
            justify-content: flex-end;
            gap: 12px;
            padding: 16px 24px;
            border-top: 1px solid #e5e7eb;
        }
        .form-group {
            margin-bottom: 16px;
        }
        .form-label {
            display: block;
            font-size: 14px;
            font-weight: 500;
            color: #374151;
            margin-bottom: 8px;
        }
        .form-input {
            width: 100%;
            padding: 10px 14px;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            font-size: 14px;
            transition: border-color 0.2s, box-shadow 0.2s;
        }
        .form-input:focus {
            outline: none;
            border-color: #2b7de9;
            box-shadow: 0 0 0 3px rgba(43,125,233,0.1);
        }
        .btn {
            padding: 10px 20px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
        }
        .btn-primary {
            background: #2b7de9;
            color: #fff;
            border: none;
        }
        .btn-primary:hover {
            background: #1a6dd6;
        }
        .btn-outline {
            background: #fff;
            color: #374151;
            border: 1px solid #d1d5db;
        }
        .btn-outline:hover {
            background: #f9fafb;
        }
    `;
    document.head.appendChild(style);
}

// ==================== 键盘快捷键 ====================

/**
 * 初始化键盘快捷键
 */
function initKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Enter键提交表单
        if (e.key === 'Enter' && !e.shiftKey) {
            const activeTab = document.querySelector('.auth-tab-content.active');
            if (activeTab) {
                const form = activeTab.querySelector('.auth-form');
                if (form) {
                    const submitBtn = form.querySelector('button[type="submit"]');
                    if (submitBtn && !submitBtn.disabled) {
                        submitBtn.click();
                    }
                }
            }
        }
        
        // Escape键关闭弹窗
        if (e.key === 'Escape') {
            closeForgotPasswordModal();
        }
    });
}

// ==================== 初始化 ====================

/**
 * 页面加载完成后初始化
 */
document.addEventListener('DOMContentLoaded', function() {
    // 初始化登录方式切换
    initLoginTabs();
    
    // 初始化账号密码登录
    initAccountLoginForm();
    
    // 初始化手机验证码登录
    initPhoneLoginForm();
    
    // 初始化扫码登录
    initQRCodeLogin();
    
    // 初始化第三方登录
    initSocialLogin();
    
    // 初始化忘记密码
    initForgotPassword();
    
    // 初始化键盘快捷键
    initKeyboardShortcuts();
    
    console.log('登录页面初始化完成');
});

// 导出全局函数
window.togglePassword = togglePassword;
window.refreshQRCode = refreshQRCode;
window.closeForgotPasswordModal = closeForgotPasswordModal;
window.handleResetPassword = handleResetPassword;