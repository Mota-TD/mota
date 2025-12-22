/**
 * 注册页 JavaScript 模块
 * 包含邮箱注册、手机注册、表单验证、密码强度检测等功能
 */

// ==================== 注册数据模型 ====================
const RegisterData = {
    // 已存在的用户数据（用于唯一性检查）
    existingUsers: {
        emails: ['admin@example.com', 'zhangsan@example.com', 'lisi@example.com'],
        usernames: ['admin', 'zhangsan', 'lisi'],
        phones: ['13800138000', '13900139000', '13700137000']
    },
    
    // 验证码相关
    verificationCode: null,
    codeExpireTime: null,
    codeCooldown: 60,
    
    // 密码强度等级
    passwordStrength: 0, // 0-4
    
    // 表单验证状态
    validationState: {
        email: false,
        username: false,
        phone: false,
        password: false,
        confirmPassword: false,
        terms: false
    }
};

// ==================== 工具函数 ====================

/**
 * 显示Toast提示
 */
function showToast(message, type = 'info') {
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
 * 验证用户名格式
 */
function isValidUsername(username) {
    // 4-20位字母、数字、下划线，必须以字母开头
    const usernameRegex = /^[a-zA-Z][a-zA-Z0-9_]{3,19}$/;
    return usernameRegex.test(username);
}

/**
 * 生成随机验证码
 */
function generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * 防抖函数
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ==================== 注册方式切换 ====================

/**
 * 初始化注册方式切换
 */
function initRegisterTabs() {
    const tabs = document.querySelectorAll('.auth-tab');
    const contents = document.querySelectorAll('.auth-tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.dataset.tab;
            
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));
            
            this.classList.add('active');
            const targetContent = document.getElementById('tab-' + tabName);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });
}

// ==================== 邮箱注册 ====================

/**
 * 初始化邮箱注册表单
 */
function initEmailRegisterForm() {
    const form = document.querySelector('#tab-email .auth-form');
    if (!form) return;
    
    // 表单提交
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        handleEmailRegister();
    });
    
    // 邮箱输入验证
    const emailInput = form.querySelector('input[type="email"]');
    if (emailInput) {
        emailInput.addEventListener('blur', function() {
            validateEmail(this.value);
        });
        emailInput.addEventListener('input', debounce(function() {
            if (this.value.length > 5) {
                validateEmail(this.value);
            }
        }, 500));
    }
    
    // 用户名输入验证
    const usernameInput = form.querySelector('input[placeholder*="用户名"]');
    if (usernameInput) {
        usernameInput.addEventListener('blur', function() {
            validateUsername(this.value);
        });
        usernameInput.addEventListener('input', debounce(function() {
            if (this.value.length > 3) {
                validateUsername(this.value);
            }
        }, 500));
    }
    
    // 密码输入验证
    const passwordInput = form.querySelector('input[id="password"]');
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            checkPasswordStrength(this.value);
        });
    }
    
    // 确认密码验证
    const confirmPasswordInput = form.querySelector('input[id="confirm-password"]');
    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', function() {
            validateConfirmPassword(passwordInput.value, this.value);
        });
    }
    
    // 服务条款复选框
    const termsCheckbox = form.querySelector('input[type="checkbox"]');
    if (termsCheckbox) {
        termsCheckbox.addEventListener('change', function() {
            RegisterData.validationState.terms = this.checked;
        });
    }
}

/**
 * 验证邮箱
 */
function validateEmail(email) {
    const emailInput = document.querySelector('#tab-email input[type="email"]');
    const feedbackEl = getOrCreateFeedback(emailInput);
    
    if (!email) {
        setFieldError(emailInput, feedbackEl, '请输入邮箱地址');
        RegisterData.validationState.email = false;
        return false;
    }
    
    if (!isValidEmail(email)) {
        setFieldError(emailInput, feedbackEl, '请输入正确的邮箱格式');
        RegisterData.validationState.email = false;
        return false;
    }
    
    // 检查邮箱是否已存在
    if (RegisterData.existingUsers.emails.includes(email.toLowerCase())) {
        setFieldError(emailInput, feedbackEl, '该邮箱已被注册');
        RegisterData.validationState.email = false;
        return false;
    }
    
    setFieldSuccess(emailInput, feedbackEl, '邮箱可用');
    RegisterData.validationState.email = true;
    return true;
}

/**
 * 验证用户名
 */
function validateUsername(username) {
    const usernameInput = document.querySelector('#tab-email input[placeholder*="用户名"]');
    const feedbackEl = getOrCreateFeedback(usernameInput);
    
    if (!username) {
        setFieldError(usernameInput, feedbackEl, '请输入用户名');
        RegisterData.validationState.username = false;
        return false;
    }
    
    if (username.length < 4) {
        setFieldError(usernameInput, feedbackEl, '用户名至少4个字符');
        RegisterData.validationState.username = false;
        return false;
    }
    
    if (username.length > 20) {
        setFieldError(usernameInput, feedbackEl, '用户名最多20个字符');
        RegisterData.validationState.username = false;
        return false;
    }
    
    if (!isValidUsername(username)) {
        setFieldError(usernameInput, feedbackEl, '用户名只能包含字母、数字、下划线，且以字母开头');
        RegisterData.validationState.username = false;
        return false;
    }
    
    // 检查用户名是否已存在
    if (RegisterData.existingUsers.usernames.includes(username.toLowerCase())) {
        setFieldError(usernameInput, feedbackEl, '该用户名已被使用');
        RegisterData.validationState.username = false;
        return false;
    }
    
    setFieldSuccess(usernameInput, feedbackEl, '用户名可用');
    RegisterData.validationState.username = true;
    return true;
}

/**
 * 检查密码强度
 */
function checkPasswordStrength(password) {
    const strengthBar = document.querySelector('.password-strength-bar');
    const strengthText = document.querySelector('.password-strength-text');
    
    if (!strengthBar || !strengthText) return;
    
    let strength = 0;
    const checks = {
        length: password.length >= 8,
        lowercase: /[a-z]/.test(password),
        uppercase: /[A-Z]/.test(password),
        number: /\d/.test(password),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    
    strength = Object.values(checks).filter(Boolean).length;
    RegisterData.passwordStrength = strength;
    
    // 更新强度条
    const strengthLevels = ['', 'weak', 'fair', 'good', 'strong', 'excellent'];
    const strengthLabels = ['', '弱', '一般', '良好', '强', '非常强'];
    const strengthColors = ['#e5e7eb', '#ef4444', '#f59e0b', '#eab308', '#22c55e', '#10b981'];
    
    strengthBar.style.width = `${strength * 20}%`;
    strengthBar.style.backgroundColor = strengthColors[strength];
    strengthText.textContent = strengthLabels[strength] || '';
    strengthText.style.color = strengthColors[strength];
    
    // 验证密码
    const passwordInput = document.getElementById('password');
    const feedbackEl = getOrCreateFeedback(passwordInput);
    
    if (!password) {
        setFieldNeutral(passwordInput, feedbackEl);
        RegisterData.validationState.password = false;
        return false;
    }
    
    if (password.length < 8) {
        setFieldError(passwordInput, feedbackEl, '密码至少8个字符');
        RegisterData.validationState.password = false;
        return false;
    }
    
    if (strength < 3) {
        setFieldError(passwordInput, feedbackEl, '密码强度不足，请包含大小写字母、数字');
        RegisterData.validationState.password = false;
        return false;
    }
    
    setFieldSuccess(passwordInput, feedbackEl, '密码强度良好');
    RegisterData.validationState.password = true;
    return true;
}

/**
 * 验证确认密码
 */
function validateConfirmPassword(password, confirmPassword) {
    const confirmInput = document.getElementById('confirm-password');
    const feedbackEl = getOrCreateFeedback(confirmInput);
    
    if (!confirmPassword) {
        setFieldNeutral(confirmInput, feedbackEl);
        RegisterData.validationState.confirmPassword = false;
        return false;
    }
    
    if (password !== confirmPassword) {
        setFieldError(confirmInput, feedbackEl, '两次输入的密码不一致');
        RegisterData.validationState.confirmPassword = false;
        return false;
    }
    
    setFieldSuccess(confirmInput, feedbackEl, '密码一致');
    RegisterData.validationState.confirmPassword = true;
    return true;
}

/**
 * 处理邮箱注册
 */
function handleEmailRegister() {
    const form = document.querySelector('#tab-email .auth-form');
    const emailInput = form.querySelector('input[type="email"]');
    const usernameInput = form.querySelector('input[placeholder*="用户名"]');
    const passwordInput = form.querySelector('#password');
    const confirmPasswordInput = form.querySelector('#confirm-password');
    const termsCheckbox = form.querySelector('input[type="checkbox"]');
    const submitBtn = form.querySelector('button[type="submit"]');
    
    // 验证所有字段
    const emailValid = validateEmail(emailInput.value);
    const usernameValid = validateUsername(usernameInput.value);
    const passwordValid = checkPasswordStrength(passwordInput.value);
    const confirmValid = validateConfirmPassword(passwordInput.value, confirmPasswordInput.value);
    
    if (!emailValid || !usernameValid || !passwordValid || !confirmValid) {
        showToast('请正确填写所有必填项', 'error');
        return;
    }
    
    if (!termsCheckbox.checked) {
        showToast('请阅读并同意服务条款和隐私政策', 'error');
        termsCheckbox.parentElement.classList.add('shake');
        setTimeout(() => termsCheckbox.parentElement.classList.remove('shake'), 500);
        return;
    }
    
    // 显示加载状态
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="loading-spinner"></span> 注册中...';
    
    // 模拟注册请求
    setTimeout(() => {
        // 添加到已存在用户列表
        RegisterData.existingUsers.emails.push(emailInput.value.toLowerCase());
        RegisterData.existingUsers.usernames.push(usernameInput.value.toLowerCase());
        
        showToast('注册成功！正在跳转到登录页...', 'success');
        
        // 跳转到登录页
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
    }, 2000);
}

// ==================== 手机注册 ====================

/**
 * 初始化手机注册表单
 */
function initPhoneRegisterForm() {
    const form = document.querySelector('#tab-phone .auth-form');
    if (!form) return;
    
    // 表单提交
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        handlePhoneRegister();
    });
    
    // 获取验证码按钮
    const sendCodeBtn = form.querySelector('.btn-secondary');
    if (sendCodeBtn) {
        sendCodeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            handleSendPhoneCode();
        });
    }
    
    // 手机号输入验证
    const phoneInput = form.querySelector('input[type="tel"]');
    if (phoneInput) {
        phoneInput.addEventListener('blur', function() {
            validatePhone(this.value);
        });
    }
    
    // 密码输入验证
    const passwordInput = form.querySelector('input[type="password"]');
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            checkPhonePasswordStrength(this.value);
        });
    }
    
    // 服务条款复选框
    const termsCheckbox = form.querySelector('input[type="checkbox"]');
    if (termsCheckbox) {
        termsCheckbox.addEventListener('change', function() {
            RegisterData.validationState.terms = this.checked;
        });
    }
}

/**
 * 验证手机号
 */
function validatePhone(phone) {
    const phoneInput = document.querySelector('#tab-phone input[type="tel"]');
    const feedbackEl = getOrCreateFeedback(phoneInput);
    
    if (!phone) {
        setFieldError(phoneInput, feedbackEl, '请输入手机号');
        RegisterData.validationState.phone = false;
        return false;
    }
    
    if (!isValidPhone(phone)) {
        setFieldError(phoneInput, feedbackEl, '请输入正确的手机号格式');
        RegisterData.validationState.phone = false;
        return false;
    }
    
    // 检查手机号是否已存在
    if (RegisterData.existingUsers.phones.includes(phone)) {
        setFieldError(phoneInput, feedbackEl, '该手机号已被注册');
        RegisterData.validationState.phone = false;
        return false;
    }
    
    setFieldSuccess(phoneInput, feedbackEl, '手机号可用');
    RegisterData.validationState.phone = true;
    return true;
}

/**
 * 检查手机注册密码强度
 */
function checkPhonePasswordStrength(password) {
    const form = document.querySelector('#tab-phone .auth-form');
    const passwordInput = form.querySelector('input[type="password"]');
    const feedbackEl = getOrCreateFeedback(passwordInput);
    
    if (!password) {
        setFieldNeutral(passwordInput, feedbackEl);
        return false;
    }
    
    if (password.length < 8) {
        setFieldError(passwordInput, feedbackEl, '密码至少8个字符');
        return false;
    }
    
    let strength = 0;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;
    
    if (strength < 2) {
        setFieldError(passwordInput, feedbackEl, '密码强度不足');
        return false;
    }
    
    setFieldSuccess(passwordInput, feedbackEl, '密码强度良好');
    return true;
}

/**
 * 发送手机验证码
 */
function handleSendPhoneCode() {
    const form = document.querySelector('#tab-phone .auth-form');
    const phoneInput = form.querySelector('input[type="tel"]');
    const sendCodeBtn = form.querySelector('.btn-secondary');
    
    const phone = phoneInput.value.trim();
    
    if (!validatePhone(phone)) {
        return;
    }
    
    if (sendCodeBtn.disabled) {
        return;
    }
    
    // 生成验证码
    RegisterData.verificationCode = generateVerificationCode();
    RegisterData.codeExpireTime = Date.now() + 5 * 60 * 1000;
    
    // 模拟发送验证码
    showToast(`验证码已发送到 ${phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')}，验证码：${RegisterData.verificationCode}`, 'success');
    
    // 开始倒计时
    startCodeCooldown(sendCodeBtn);
}

/**
 * 开始验证码冷却倒计时
 */
function startCodeCooldown(btn) {
    let countdown = RegisterData.codeCooldown;
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
 * 处理手机注册
 */
function handlePhoneRegister() {
    const form = document.querySelector('#tab-phone .auth-form');
    const phoneInput = form.querySelector('input[type="tel"]');
    const codeInput = form.querySelector('input[placeholder*="验证码"]');
    const passwordInput = form.querySelector('input[type="password"]');
    const termsCheckbox = form.querySelector('input[type="checkbox"]');
    const submitBtn = form.querySelector('button[type="submit"]');
    
    const phone = phoneInput.value.trim();
    const code = codeInput.value.trim();
    const password = passwordInput.value;
    
    // 验证手机号
    if (!validatePhone(phone)) {
        return;
    }
    
    // 验证验证码
    if (!code) {
        showToast('请输入验证码', 'error');
        codeInput.focus();
        return;
    }
    
    if (code.length !== 6) {
        showToast('请输入6位验证码', 'error');
        return;
    }
    
    // 验证密码
    if (!password) {
        showToast('请设置密码', 'error');
        passwordInput.focus();
        return;
    }
    
    if (password.length < 8) {
        showToast('密码至少8个字符', 'error');
        return;
    }
    
    // 验证服务条款
    if (!termsCheckbox.checked) {
        showToast('请阅读并同意服务条款和隐私政策', 'error');
        return;
    }
    
    // 显示加载状态
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="loading-spinner"></span> 注册中...';
    
    // 验证验证码
    setTimeout(() => {
        if (!RegisterData.verificationCode || Date.now() > RegisterData.codeExpireTime) {
            showToast('验证码已过期，请重新获取', 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = '注册';
            return;
        }
        
        if (code !== RegisterData.verificationCode) {
            showToast('验证码错误', 'error');
            codeInput.classList.add('input-error');
            setTimeout(() => codeInput.classList.remove('input-error'), 2000);
            submitBtn.disabled = false;
            submitBtn.textContent = '注册';
            return;
        }
        
        // 注册成功
        RegisterData.existingUsers.phones.push(phone);
        RegisterData.verificationCode = null;
        RegisterData.codeExpireTime = null;
        
        showToast('注册成功！正在跳转到登录页...', 'success');
        
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
    }, 1500);
}

// ==================== 第三方注册 ====================

/**
 * 初始化第三方注册
 */
function initSocialRegister() {
    const socialBtns = document.querySelectorAll('.auth-social-btn');
    
    socialBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const title = this.getAttribute('title');
            handleSocialRegister(title);
        });
    });
}

/**
 * 处理第三方注册
 */
function handleSocialRegister(provider) {
    showToast(`正在跳转到${provider}...`, 'info');
    
    setTimeout(() => {
        // 模拟第三方注册成功
        setTimeout(() => {
            showToast(`${provider}成功！`, 'success');
            setTimeout(() => {
                window.location.href = 'console/dashboard.html';
            }, 1000);
        }, 2000);
    }, 500);
}

// ==================== 表单验证辅助函数 ====================

/**
 * 获取或创建反馈元素
 */
function getOrCreateFeedback(input) {
    let feedback = input.parentElement.querySelector('.field-feedback');
    if (!feedback) {
        feedback = document.createElement('div');
        feedback.className = 'field-feedback';
        input.parentElement.appendChild(feedback);
    }
    return feedback;
}

/**
 * 设置字段错误状态
 */
function setFieldError(input, feedback, message) {
    input.classList.remove('input-success');
    input.classList.add('input-error');
    feedback.className = 'field-feedback error';
    feedback.textContent = message;
}

/**
 * 设置字段成功状态
 */
function setFieldSuccess(input, feedback, message) {
    input.classList.remove('input-error');
    input.classList.add('input-success');
    feedback.className = 'field-feedback success';
    feedback.textContent = message;
}

/**
 * 设置字段中性状态
 */
function setFieldNeutral(input, feedback) {
    input.classList.remove('input-error', 'input-success');
    feedback.className = 'field-feedback';
    feedback.textContent = '';
}

/**
 * 添加表单验证样式
 */
function addValidationStyles() {
    if (document.getElementById('validation-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'validation-styles';
    style.textContent = `
        .field-feedback {
            font-size: 12px;
            margin-top: 4px;
            min-height: 18px;
        }
        .field-feedback.error {
            color: #ef4444;
        }
        .field-feedback.success {
            color: #22c55e;
        }
        .input-error {
            border-color: #ef4444 !important;
        }
        .input-success {
            border-color: #22c55e !important;
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
        .shake {
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

// ==================== 服务条款弹窗 ====================

/**
 * 初始化服务条款链接
 */
function initTermsLinks() {
    const termsLinks = document.querySelectorAll('.form-link');
    
    termsLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const text = this.textContent;
            if (text.includes('服务条款')) {
                showTermsModal('服务条款');
            } else if (text.includes('隐私政策')) {
                showTermsModal('隐私政策');
            }
        });
    });
}

/**
 * 显示服务条款弹窗
 */
function showTermsModal(title) {
    const content = title === '服务条款' ? getTermsContent() : getPrivacyContent();
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'termsModal';
    modal.innerHTML = `
        <div class="modal terms-modal">
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="modal-close" onclick="closeTermsModal()">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            </div>
            <div class="modal-body terms-content">
                ${content}
            </div>
            <div class="modal-footer">
                <button class="btn btn-primary" onclick="closeTermsModal()">我已阅读</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    addModalStyles();
    
    setTimeout(() => modal.classList.add('active'), 10);
}

/**
 * 关闭服务条款弹窗
 */
function closeTermsModal() {
    const modal = document.getElementById('termsModal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    }
}

/**
 * 获取服务条款内容
 */
function getTermsContent() {
    return `
        <h4>1. 服务说明</h4>
        <p>Mota DevOps 平台（以下简称"本平台"）是一个一站式研发效能平台，为用户提供项目管理、代码托管、持续集成、持续部署等服务。</p>
        
        <h4>2. 用户注册</h4>
        <p>用户在注册时应提供真实、准确、完整的个人信息，并在信息发生变化时及时更新。</p>
        
        <h4>3. 用户行为规范</h4>
        <p>用户在使用本平台服务时，应遵守相关法律法规，不得利用本平台从事任何违法违规活动。</p>
        
        <h4>4. 知识产权</h4>
        <p>本平台的所有内容，包括但不限于文字、图片、软件、音频、视频等，均受知识产权法律保护。</p>
        
        <h4>5. 免责声明</h4>
        <p>本平台不对因不可抗力或非本平台原因导致的服务中断或数据丢失承担责任。</p>
        
        <h4>6. 协议修改</h4>
        <p>本平台有权根据需要修改本协议，修改后的协议将在平台上公布。</p>
    `;
}

/**
 * 获取隐私政策内容
 */
function getPrivacyContent() {
    return `
        <h4>1. 信息收集</h4>
        <p>我们收集您在注册和使用服务过程中提供的个人信息，包括但不限于邮箱、手机号、用户名等。</p>
        
        <h4>2. 信息使用</h4>
        <p>我们使用收集的信息来提供、维护和改进我们的服务，以及与您进行沟通。</p>
        
        <h4>3. 信息保护</h4>
        <p>我们采取适当的技术和组织措施来保护您的个人信息安全。</p>
        
        <h4>4. 信息共享</h4>
        <p>除法律要求或您明确同意外，我们不会与第三方共享您的个人信息。</p>
        
        <h4>5. Cookie 使用</h4>
        <p>我们使用 Cookie 和类似技术来提供和支持我们的服务，并提供个性化体验。</p>
        
        <h4>6. 您的权利</h4>
        <p>您有权访问、更正或删除您的个人信息，也可以随时撤回您的同意。</p>
    `;
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
            max-width: 520px;
            max-height: 80vh;
            box-shadow: 0 20px 60px rgba(0,0,0,0.2);
            transform: translateY(-20px);
            transition: transform 0.3s;
            display: flex;
            flex-direction: column;
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
            flex-shrink: 0;
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
            overflow-y: auto;
            flex: 1;
        }
        .terms-content h4 {
            font-size: 14px;
            font-weight: 600;
            color: #1f2937;
            margin: 16px 0 8px;
        }
        .terms-content h4:first-child {
            margin-top: 0;
        }
        .terms-content p {
            font-size: 14px;
            color: #6b7280;
            line-height: 1.6;
            margin: 0;
        }
        .modal-footer {
            display: flex;
            justify-content: flex-end;
            gap: 12px;
            padding: 16px 24px;
            border-top: 1px solid #e5e7eb;
            flex-shrink: 0;
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
    `;
    document.head.appendChild(style);
}

// ==================== 密码显示切换 ====================

/**
 * 切换密码显示/隐藏
 */
function togglePassword(inputId) {
    const passwordInput = document.getElementById(inputId);
    if (!passwordInput) return;
    
    const toggleBtn = passwordInput.parentElement.querySelector('.form-input-toggle');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        if (toggleBtn) {
            toggleBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
            `;
        }
    } else {
        passwordInput.type = 'password';
        if (toggleBtn) {
            toggleBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                </svg>
            `;
        }
    }
}

// ==================== 键盘快捷键 ====================

/**
 * 初始化键盘快捷键
 */
function initKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Escape键关闭弹窗
        if (e.key === 'Escape') {
            closeTermsModal();
        }
    });
}

// ==================== 初始化 ====================

/**
 * 页面加载完成后初始化
 */
document.addEventListener('DOMContentLoaded', function() {
    // 添加验证样式
    addValidationStyles();
    
    // 初始化注册方式切换
    initRegisterTabs();
    
    // 初始化邮箱注册表单
    initEmailRegisterForm();
    
    // 初始化手机注册表单
    initPhoneRegisterForm();
    
    // 初始化第三方注册
    initSocialRegister();
    
    // 初始化服务条款链接
    initTermsLinks();
    
    // 初始化键盘快捷键
    initKeyboardShortcuts();
    
    console.log('注册页面初始化完成');
});

// 导出全局函数
window.togglePassword = togglePassword;
window.closeTermsModal = closeTermsModal;