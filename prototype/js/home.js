/**
 * 首页 JavaScript 模块
 * 包含导航交互、移动端菜单、客户轮播、流水线动画、在线客服等功能
 */

// ==================== 首页数据模型 ====================
const HomeData = {
    // 客户Logo列表
    customers: [
        { name: '阿里巴巴', logo: 'alibaba' },
        { name: '腾讯', logo: 'tencent' },
        { name: '华为', logo: 'huawei' },
        { name: '字节跳动', logo: 'bytedance' },
        { name: '美团', logo: 'meituan' },
        { name: '京东', logo: 'jd' },
        { name: '网易', logo: 'netease' },
        { name: '百度', logo: 'baidu' },
        { name: '小米', logo: 'xiaomi' },
        { name: '滴滴', logo: 'didi' }
    ],
    
    // 流水线阶段
    pipelineStages: [
        { name: '代码提交', icon: 'code', status: 'completed' },
        { name: '代码检查', icon: 'check', status: 'completed' },
        { name: '单元测试', icon: 'test', status: 'completed' },
        { name: '构建打包', icon: 'build', status: 'running' },
        { name: '部署测试', icon: 'deploy', status: 'pending' },
        { name: '发布上线', icon: 'release', status: 'pending' }
    ],
    
    // 在线客服状态
    supportOnline: true,
    
    // 轮播定时器
    carouselTimer: null,
    carouselIndex: 0
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

// ==================== 导航栏交互 ====================

/**
 * 初始化导航栏
 */
function initNavbar() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    
    // 滚动时改变导航栏样式
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('navbar-scrolled');
        } else {
            navbar.classList.remove('navbar-scrolled');
        }
    });
    
    // 添加滚动样式
    addNavbarStyles();
}

/**
 * 添加导航栏样式
 */
function addNavbarStyles() {
    if (document.getElementById('navbar-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'navbar-styles';
    style.textContent = `
        .navbar {
            transition: all 0.3s ease;
        }
        .navbar-scrolled {
            background: rgba(255, 255, 255, 0.98) !important;
            box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
        }
    `;
    document.head.appendChild(style);
}

// ==================== 移动端菜单 ====================

/**
 * 初始化移动端菜单
 */
function initMobileMenu() {
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');
    
    if (!menuToggle) return;
    
    // 如果没有移动端菜单，创建一个
    if (!mobileMenu) {
        createMobileMenu();
    }
    
    menuToggle.addEventListener('click', function() {
        toggleMobileMenu();
    });
    
    // 点击遮罩关闭菜单
    document.addEventListener('click', function(e) {
        const mobileMenu = document.querySelector('.mobile-menu');
        if (mobileMenu && mobileMenu.classList.contains('active')) {
            if (!mobileMenu.contains(e.target) && !menuToggle.contains(e.target)) {
                closeMobileMenu();
            }
        }
    });
    
    // ESC键关闭菜单
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeMobileMenu();
        }
    });
}

/**
 * 创建移动端菜单
 */
function createMobileMenu() {
    const menu = document.createElement('div');
    menu.className = 'mobile-menu';
    menu.innerHTML = `
        <div class="mobile-menu-header">
            <a href="index.html" class="mobile-menu-logo">
                <span class="logo-text">Mota</span>
            </a>
            <button class="mobile-menu-close" onclick="closeMobileMenu()">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
            </button>
        </div>
        <nav class="mobile-menu-nav">
            <div class="mobile-menu-section">
                <div class="mobile-menu-title">产品</div>
                <a href="#" class="mobile-menu-item">项目协同</a>
                <a href="#" class="mobile-menu-item">知识管理</a>
                <a href="#" class="mobile-menu-item">效能洞察</a>
            </div>
            <div class="mobile-menu-section">
                <div class="mobile-menu-title">解决方案</div>
                <a href="#" class="mobile-menu-item">敏捷开发</a>
                <a href="#" class="mobile-menu-item">团队协作</a>
            </div>
            <div class="mobile-menu-section">
                <div class="mobile-menu-title">支持</div>
                <a href="#" class="mobile-menu-item">帮助中心</a>
                <a href="#" class="mobile-menu-item">API 文档</a>
                <a href="#" class="mobile-menu-item">社区论坛</a>
            </div>
            <a href="#pricing" class="mobile-menu-item">定价</a>
        </nav>
        <div class="mobile-menu-footer">
            <a href="login.html" class="btn btn-outline btn-block">登录</a>
            <a href="register.html" class="btn btn-primary btn-block">免费试用</a>
        </div>
    `;
    
    document.body.appendChild(menu);
    
    // 添加移动端菜单样式
    addMobileMenuStyles();
}

/**
 * 添加移动端菜单样式
 */
function addMobileMenuStyles() {
    if (document.getElementById('mobile-menu-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'mobile-menu-styles';
    style.textContent = `
        .mobile-menu {
            position: fixed;
            top: 0;
            right: -320px;
            width: 320px;
            height: 100vh;
            background: #fff;
            z-index: 10001;
            transition: right 0.3s ease;
            display: flex;
            flex-direction: column;
            box-shadow: -4px 0 20px rgba(0,0,0,0.1);
        }
        .mobile-menu.active {
            right: 0;
        }
        .mobile-menu-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            z-index: 10000;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
        }
        .mobile-menu-overlay.active {
            opacity: 1;
            visibility: visible;
        }
        .mobile-menu-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 16px 20px;
            border-bottom: 1px solid #e5e7eb;
        }
        .mobile-menu-logo {
            text-decoration: none;
        }
        .mobile-menu-logo .logo-text {
            font-size: 24px;
            font-weight: 700;
            color: #2b7de9;
        }
        .mobile-menu-close {
            background: none;
            border: none;
            cursor: pointer;
            color: #6b7280;
            padding: 8px;
            border-radius: 8px;
            transition: background 0.2s;
        }
        .mobile-menu-close:hover {
            background: #f3f4f6;
        }
        .mobile-menu-nav {
            flex: 1;
            overflow-y: auto;
            padding: 16px 0;
        }
        .mobile-menu-section {
            padding: 0 20px;
            margin-bottom: 16px;
        }
        .mobile-menu-title {
            font-size: 12px;
            font-weight: 600;
            color: #9ca3af;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
        }
        .mobile-menu-item {
            display: block;
            padding: 12px 0;
            color: #374151;
            text-decoration: none;
            font-size: 15px;
            border-bottom: 1px solid #f3f4f6;
            transition: color 0.2s;
        }
        .mobile-menu-item:hover {
            color: #2b7de9;
        }
        .mobile-menu-footer {
            padding: 20px;
            border-top: 1px solid #e5e7eb;
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        .btn-block {
            display: block;
            width: 100%;
            text-align: center;
        }
    `;
    document.head.appendChild(style);
}

/**
 * 切换移动端菜单
 */
function toggleMobileMenu() {
    const mobileMenu = document.querySelector('.mobile-menu');
    let overlay = document.querySelector('.mobile-menu-overlay');
    
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'mobile-menu-overlay';
        overlay.addEventListener('click', closeMobileMenu);
        document.body.appendChild(overlay);
    }
    
    if (mobileMenu.classList.contains('active')) {
        closeMobileMenu();
    } else {
        mobileMenu.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

/**
 * 关闭移动端菜单
 */
function closeMobileMenu() {
    const mobileMenu = document.querySelector('.mobile-menu');
    const overlay = document.querySelector('.mobile-menu-overlay');
    
    if (mobileMenu) {
        mobileMenu.classList.remove('active');
    }
    if (overlay) {
        overlay.classList.remove('active');
    }
    document.body.style.overflow = '';
}

// ==================== 下拉菜单交互 ====================

/**
 * 初始化下拉菜单
 */
function initDropdownMenus() {
    const dropdownTriggers = document.querySelectorAll('.nav-link.has-dropdown, .nav-item.has-dropdown > .nav-link');
    
    dropdownTriggers.forEach(trigger => {
        const parent = trigger.closest('.nav-item');
        const dropdown = parent.querySelector('.dropdown-menu, .mega-menu');
        
        if (!dropdown) return;
        
        // 鼠标悬停显示
        parent.addEventListener('mouseenter', function() {
            showDropdown(dropdown);
        });
        
        parent.addEventListener('mouseleave', function() {
            hideDropdown(dropdown);
        });
        
        // 点击切换（移动端）
        trigger.addEventListener('click', function(e) {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                toggleDropdown(dropdown);
            }
        });
    });
    
    // 添加下拉菜单样式
    addDropdownStyles();
}

/**
 * 添加下拉菜单样式
 */
function addDropdownStyles() {
    if (document.getElementById('dropdown-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'dropdown-styles';
    style.textContent = `
        .dropdown-menu, .mega-menu {
            opacity: 0;
            visibility: hidden;
            transform: translateY(10px);
            transition: all 0.2s ease;
        }
        .dropdown-menu.active, .mega-menu.active {
            opacity: 1;
            visibility: visible;
            transform: translateY(0);
        }
    `;
    document.head.appendChild(style);
}

/**
 * 显示下拉菜单
 */
function showDropdown(dropdown) {
    dropdown.classList.add('active');
}

/**
 * 隐藏下拉菜单
 */
function hideDropdown(dropdown) {
    dropdown.classList.remove('active');
}

/**
 * 切换下拉菜单
 */
function toggleDropdown(dropdown) {
    dropdown.classList.toggle('active');
}

// ==================== 平滑滚动 ====================

/**
 * 初始化平滑滚动
 */
function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                
                const navbarHeight = document.querySelector('.navbar')?.offsetHeight || 0;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navbarHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // 关闭移动端菜单
                closeMobileMenu();
            }
        });
    });
}

// ==================== 客户Logo轮播 ====================

/**
 * 初始化客户Logo轮播
 */
function initCustomerCarousel() {
    const carousel = document.querySelector('.customers-carousel, .customer-logos');
    if (!carousel) return;
    
    // 添加轮播样式
    addCarouselStyles();
    
    // 如果是静态展示，添加无限滚动效果
    if (carousel.classList.contains('customer-logos')) {
        initInfiniteScroll(carousel);
    }
}

/**
 * 添加轮播样式
 */
function addCarouselStyles() {
    if (document.getElementById('carousel-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'carousel-styles';
    style.textContent = `
        .customer-logos {
            display: flex;
            animation: scroll 30s linear infinite;
        }
        .customer-logos:hover {
            animation-play-state: paused;
        }
        @keyframes scroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
        }
        .customer-logo {
            flex-shrink: 0;
            transition: transform 0.3s, opacity 0.3s;
        }
        .customer-logo:hover {
            transform: scale(1.1);
            opacity: 1 !important;
        }
    `;
    document.head.appendChild(style);
}

/**
 * 初始化无限滚动
 */
function initInfiniteScroll(carousel) {
    // 复制一份内容实现无限滚动
    const items = carousel.innerHTML;
    carousel.innerHTML = items + items;
}

// ==================== 流水线动画 ====================

/**
 * 初始化流水线动画
 */
function initPipelineAnimation() {
    const pipelineDemo = document.querySelector('.pipeline-demo, .pipeline-animation');
    if (!pipelineDemo) return;
    
    // 添加动画样式
    addPipelineStyles();
    
    // 开始动画
    startPipelineAnimation();
}

/**
 * 添加流水线样式
 */
function addPipelineStyles() {
    if (document.getElementById('pipeline-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'pipeline-styles';
    style.textContent = `
        .pipeline-stage {
            transition: all 0.5s ease;
        }
        .pipeline-stage.completed .stage-icon {
            background: #22c55e;
            color: #fff;
        }
        .pipeline-stage.running .stage-icon {
            background: #3b82f6;
            color: #fff;
            animation: pulse 1.5s infinite;
        }
        .pipeline-stage.pending .stage-icon {
            background: #e5e7eb;
            color: #9ca3af;
        }
        .pipeline-connector {
            transition: background 0.5s ease;
        }
        .pipeline-connector.completed {
            background: linear-gradient(90deg, #22c55e, #22c55e);
        }
        .pipeline-connector.running {
            background: linear-gradient(90deg, #22c55e, #3b82f6);
            animation: flow 1s linear infinite;
        }
        @keyframes pulse {
            0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
            50% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
        }
        @keyframes flow {
            0% { background-position: 0% 50%; }
            100% { background-position: 100% 50%; }
        }
    `;
    document.head.appendChild(style);
}

/**
 * 开始流水线动画
 */
function startPipelineAnimation() {
    const stages = document.querySelectorAll('.pipeline-stage');
    const connectors = document.querySelectorAll('.pipeline-connector');
    
    if (stages.length === 0) return;
    
    let currentStage = 0;
    
    // 重置所有阶段
    stages.forEach(stage => {
        stage.classList.remove('completed', 'running');
        stage.classList.add('pending');
    });
    connectors.forEach(conn => {
        conn.classList.remove('completed', 'running');
    });
    
    // 动画循环
    function animateStage() {
        if (currentStage > 0) {
            stages[currentStage - 1].classList.remove('running');
            stages[currentStage - 1].classList.add('completed');
            if (connectors[currentStage - 1]) {
                connectors[currentStage - 1].classList.remove('running');
                connectors[currentStage - 1].classList.add('completed');
            }
        }
        
        if (currentStage < stages.length) {
            stages[currentStage].classList.remove('pending');
            stages[currentStage].classList.add('running');
            if (connectors[currentStage]) {
                connectors[currentStage].classList.add('running');
            }
            currentStage++;
            setTimeout(animateStage, 2000);
        } else {
            // 动画完成，3秒后重新开始
            setTimeout(() => {
                currentStage = 0;
                stages.forEach(stage => {
                    stage.classList.remove('completed', 'running');
                    stage.classList.add('pending');
                });
                connectors.forEach(conn => {
                    conn.classList.remove('completed', 'running');
                });
                animateStage();
            }, 3000);
        }
    }
    
    // 当元素进入视口时开始动画
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateStage();
                observer.disconnect();
            }
        });
    }, { threshold: 0.5 });
    
    const pipelineSection = document.querySelector('.pipeline-demo, .pipeline-animation, .pipeline-section');
    if (pipelineSection) {
        observer.observe(pipelineSection);
    }
}

// ==================== 在线客服 ====================

/**
 * 初始化在线客服
 */
function initOnlineSupport() {
    // 创建客服按钮
    createSupportWidget();
}

/**
 * 创建客服小部件
 */
function createSupportWidget() {
    const widget = document.createElement('div');
    widget.className = 'support-widget';
    widget.innerHTML = `
        <button class="support-btn" onclick="toggleSupportChat()">
            <svg class="support-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <svg class="close-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:none;">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
            <span class="support-badge">1</span>
        </button>
        <div class="support-chat">
            <div class="support-chat-header">
                <div class="support-chat-title">
                    <span class="support-status ${HomeData.supportOnline ? 'online' : ''}"></span>
                    在线客服
                </div>
                <button class="support-chat-close" onclick="toggleSupportChat()">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            </div>
            <div class="support-chat-body">
                <div class="support-chat-messages">
                    <div class="support-message support-message-bot">
                        <div class="support-message-avatar">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"/>
                                <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                                <line x1="9" y1="9" x2="9.01" y2="9"/>
                                <line x1="15" y1="9" x2="15.01" y2="9"/>
                            </svg>
                        </div>
                        <div class="support-message-content">
                            您好！欢迎使用 Mota DevOps 平台，请问有什么可以帮助您的？
                        </div>
                    </div>
                </div>
            </div>
            <div class="support-chat-footer">
                <div class="support-quick-actions">
                    <button class="support-quick-btn" onclick="sendQuickMessage('产品咨询')">产品咨询</button>
                    <button class="support-quick-btn" onclick="sendQuickMessage('技术支持')">技术支持</button>
                    <button class="support-quick-btn" onclick="sendQuickMessage('价格方案')">价格方案</button>
                </div>
                <div class="support-input-wrapper">
                    <input type="text" class="support-input" placeholder="输入消息..." onkeypress="handleSupportKeypress(event)">
                    <button class="support-send-btn" onclick="sendSupportMessage()">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="22" y1="2" x2="11" y2="13"/>
                            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(widget);
    
    // 添加客服样式
    addSupportStyles();
}

/**
 * 添加客服样式
 */
function addSupportStyles() {
    if (document.getElementById('support-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'support-styles';
    style.textContent = `
        .support-widget {
            position: fixed;
            bottom: 24px;
            right: 24px;
            z-index: 9999;
        }
        .support-btn {
            width: 56px;
            height: 56px;
            border-radius: 50%;
            background: linear-gradient(135deg, #2b7de9, #1a6dd6);
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
            box-shadow: 0 4px 20px rgba(43, 125, 233, 0.4);
            transition: all 0.3s ease;
            position: relative;
        }
        .support-btn:hover {
            transform: scale(1.1);
            box-shadow: 0 6px 30px rgba(43, 125, 233, 0.5);
        }
        .support-badge {
            position: absolute;
            top: -4px;
            right: -4px;
            width: 20px;
            height: 20px;
            background: #ef4444;
            border-radius: 50%;
            font-size: 12px;
            font-weight: 600;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 2px solid #fff;
        }
        .support-chat {
            position: absolute;
            bottom: 70px;
            right: 0;
            width: 360px;
            height: 480px;
            background: #fff;
            border-radius: 16px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.15);
            display: none;
            flex-direction: column;
            overflow: hidden;
        }
        .support-chat.active {
            display: flex;
            animation: chatIn 0.3s ease;
        }
        @keyframes chatIn {
            from { opacity: 0; transform: translateY(20px) scale(0.95); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .support-chat-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 16px 20px;
            background: linear-gradient(135deg, #2b7de9, #1a6dd6);
            color: #fff;
        }
        .support-chat-title {
            display: flex;
            align-items: center;
            gap: 8px;
            font-weight: 600;
        }
        .support-status {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #9ca3af;
        }
        .support-status.online {
            background: #22c55e;
        }
        .support-chat-close {
            background: none;
            border: none;
            color: #fff;
            cursor: pointer;
            padding: 4px;
            border-radius: 4px;
            transition: background 0.2s;
        }
        .support-chat-close:hover {
            background: rgba(255,255,255,0.2);
        }
        .support-chat-body {
            flex: 1;
            overflow-y: auto;
            padding: 16px;
            background: #f9fafb;
        }
        .support-chat-messages {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        .support-message {
            display: flex;
            gap: 8px;
            max-width: 85%;
        }
        .support-message-bot {
            align-self: flex-start;
        }
        .support-message-user {
            align-self: flex-end;
            flex-direction: row-reverse;
        }
        .support-message-avatar {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: #e5e7eb;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }
        .support-message-bot .support-message-avatar {
            background: #2b7de9;
            color: #fff;
        }
        .support-message-content {
            padding: 10px 14px;
            border-radius: 12px;
            font-size: 14px;
            line-height: 1.5;
        }
        .support-message-bot .support-message-content {
            background: #fff;
            color: #374151;
            border-bottom-left-radius: 4px;
        }
        .support-message-user .support-message-content {
            background: #2b7de9;
            color: #fff;
            border-bottom-right-radius: 4px;
        }
        .support-chat-footer {
            padding: 12px 16px;
            border-top: 1px solid #e5e7eb;
            background: #fff;
        }
        .support-quick-actions {
            display: flex;
            gap: 8px;
            margin-bottom: 12px;
            flex-wrap: wrap;
        }
        .support-quick-btn {
            padding: 6px 12px;
            background: #f3f4f6;
            border: 1px solid #e5e7eb;
            border-radius: 16px;
            font-size: 12px;
            color: #374151;
            cursor: pointer;
            transition: all 0.2s;
        }
        .support-quick-btn:hover {
            background: #e5e7eb;
            border-color: #d1d5db;
        }
        .support-input-wrapper {
            display: flex;
            gap: 8px;
        }
        .support-input {
            flex: 1;
            padding: 10px 14px;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            font-size: 14px;
            outline: none;
            transition: border-color 0.2s;
        }
        .support-input:focus {
            border-color: #2b7de9;
        }
        .support-send-btn {
            width: 40px;
            height: 40px;
            background: #2b7de9;
            border: none;
            border-radius: 8px;
            color: #fff;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background 0.2s;
        }
        .support-send-btn:hover {
            background: #1a6dd6;
        }
    `;
    document.head.appendChild(style);
}

/**
 * 切换客服聊天窗口
 */
function toggleSupportChat() {
    const chat = document.querySelector('.support-chat');
    const btn = document.querySelector('.support-btn');
    const supportIcon = btn.querySelector('.support-icon');
    const closeIcon = btn.querySelector('.close-icon');
    const badge = btn.querySelector('.support-badge');
    
    chat.classList.toggle('active');
    
    if (chat.classList.contains('active')) {
        supportIcon.style.display = 'none';
        closeIcon.style.display = 'block';
        badge.style.display = 'none';
    } else {
        supportIcon.style.display = 'block';
        closeIcon.style.display = 'none';
    }
}

/**
 * 发送快捷消息
 */
function sendQuickMessage(message) {
    const input = document.querySelector('.support-input');
    input.value = message;
    sendSupportMessage();
}

/**
 * 处理客服输入框按键
 */
function handleSupportKeypress(event) {
    if (event.key === 'Enter') {
        sendSupportMessage();
    }
}

/**
 * 发送客服消息
 */
function sendSupportMessage() {
    const input = document.querySelector('.support-input');
    const message = input.value.trim();
    
    if (!message) return;
    
    const messagesContainer = document.querySelector('.support-chat-messages');
    
    // 添加用户消息
    const userMessage = document.createElement('div');
    userMessage.className = 'support-message support-message-user';
    userMessage.innerHTML = `
        <div class="support-message-avatar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
            </svg>
        </div>
        <div class="support-message-content">${message}</div>
    `;
    messagesContainer.appendChild(userMessage);
    
    // 清空输入框
    input.value = '';
    
    // 滚动到底部
    const chatBody = document.querySelector('.support-chat-body');
    chatBody.scrollTop = chatBody.scrollHeight;
    
    // 模拟机器人回复
    setTimeout(() => {
        const botReply = getBotReply(message);
        const botMessage = document.createElement('div');
        botMessage.className = 'support-message support-message-bot';
        botMessage.innerHTML = `
            <div class="support-message-avatar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                    <line x1="9" y1="9" x2="9.01" y2="9"/>
                    <line x1="15" y1="9" x2="15.01" y2="9"/>
                </svg>
            </div>
            <div class="support-message-content">${botReply}</div>
        `;
        messagesContainer.appendChild(botMessage);
        chatBody.scrollTop = chatBody.scrollHeight;
    }, 1000);
}

/**
 * 获取机器人回复
 */
function getBotReply(message) {
    const replies = {
        '产品咨询': 'Mota DevOps 是一站式研发效能平台，提供项目管理、代码托管、CI/CD、制品管理等全流程服务。您想了解哪个功能模块呢？',
        '技术支持': '我们提供 7x24 小时技术支持服务。您可以描述一下遇到的问题，我会尽力帮您解决。',
        '价格方案': '我们提供免费版、专业版和企业版三种方案。免费版支持5人团队，专业版支持50人团队，企业版支持无限人数。需要我为您详细介绍吗？'
    };
    
    if (replies[message]) {
        return replies[message];
    }
    
    // 关键词匹配
    if (message.includes('价格') || message.includes('费用') || message.includes('多少钱')) {
        return replies['价格方案'];
    }
    if (message.includes('问题') || message.includes('错误') || message.includes('bug')) {
        return replies['技术支持'];
    }
    if (message.includes('功能') || message.includes('介绍') || message.includes('什么')) {
        return replies['产品咨询'];
    }
    
    return '感谢您的咨询！我已记录您的问题，稍后会有专业客服与您联系。您也可以拨打客服热线：400-888-8888';
}

// ==================== 预约演示表单 ====================

/**
 * 初始化预约演示表单
 */
function initDemoForm() {
    const demoBtn = document.querySelector('.btn-demo, [href*="demo"]');
    if (demoBtn) {
        demoBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showDemoModal();
        });
    }
}

/**
 * 显示预约演示弹窗
 */
function showDemoModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'demoModal';
    modal.innerHTML = `
        <div class="modal demo-modal">
            <div class="modal-header">
                <h3>预约产品演示</h3>
                <button class="modal-close" onclick="closeDemoModal()">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            </div>
            <div class="modal-body">
                <p class="modal-desc">请填写以下信息，我们的产品专家将在1个工作日内与您联系。</p>
                <form class="demo-form" onsubmit="handleDemoSubmit(event)">
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">姓名 <span class="required">*</span></label>
                            <input type="text" class="form-input" id="demoName" placeholder="请输入姓名" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">公司 <span class="required">*</span></label>
                            <input type="text" class="form-input" id="demoCompany" placeholder="请输入公司名称" required>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">邮箱 <span class="required">*</span></label>
                            <input type="email" class="form-input" id="demoEmail" placeholder="请输入邮箱" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">手机 <span class="required">*</span></label>
                            <input type="tel" class="form-input" id="demoPhone" placeholder="请输入手机号" required>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">团队规模</label>
                        <select class="form-input" id="demoTeamSize">
                            <option value="">请选择</option>
                            <option value="1-10">1-10人</option>
                            <option value="11-50">11-50人</option>
                            <option value="51-200">51-200人</option>
                            <option value="201-500">201-500人</option>
                            <option value="500+">500人以上</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">需求描述</label>
                        <textarea class="form-input form-textarea" id="demoMessage" placeholder="请简要描述您的需求" rows="3"></textarea>
                    </div>
                    <button type="submit" class="btn btn-primary btn-block">提交预约</button>
                </form>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    addFormModalStyles();
    
    setTimeout(() => modal.classList.add('active'), 10);
    document.getElementById('demoName').focus();
}

/**
 * 关闭预约演示弹窗
 */
function closeDemoModal() {
    const modal = document.getElementById('demoModal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    }
}

/**
 * 处理预约演示提交
 */
function handleDemoSubmit(event) {
    event.preventDefault();
    
    const name = document.getElementById('demoName').value.trim();
    const company = document.getElementById('demoCompany').value.trim();
    const email = document.getElementById('demoEmail').value.trim();
    const phone = document.getElementById('demoPhone').value.trim();
    
    if (!name || !company || !email || !phone) {
        showToast('请填写所有必填项', 'error');
        return;
    }
    
    if (!isValidEmail(email)) {
        showToast('请输入正确的邮箱格式', 'error');
        return;
    }
    
    if (!isValidPhone(phone)) {
        showToast('请输入正确的手机号格式', 'error');
        return;
    }
    
    // 模拟提交
    const submitBtn = document.querySelector('.demo-form button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="loading-spinner"></span> 提交中...';
    
    setTimeout(() => {
        showToast('预约成功！我们将尽快与您联系', 'success');
        closeDemoModal();
    }, 1500);
}

// ==================== 联系销售表单 ====================

/**
 * 初始化联系销售表单
 */
function initContactForm() {
    const contactBtn = document.querySelector('.btn-contact, [href*="contact"]');
    if (contactBtn) {
        contactBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showContactModal();
        });
    }
}

/**
 * 显示联系销售弹窗
 */
function showContactModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'contactModal';
    modal.innerHTML = `
        <div class="modal contact-modal">
            <div class="modal-header">
                <h3>联系销售</h3>
                <button class="modal-close" onclick="closeContactModal()">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            </div>
            <div class="modal-body">
                <div class="contact-info">
                    <div class="contact-item">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                        </svg>
                        <span>400-888-8888</span>
                    </div>
                    <div class="contact-item">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                            <polyline points="22,6 12,13 2,6"/>
                        </svg>
                        <span>sales@mota.dev</span>
                    </div>
                </div>
                <div class="contact-divider">
                    <span>或留下您的联系方式</span>
                </div>
                <form class="contact-form" onsubmit="handleContactSubmit(event)">
                    <div class="form-group">
                        <label class="form-label">姓名 <span class="required">*</span></label>
                        <input type="text" class="form-input" id="contactName" placeholder="请输入姓名" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">手机 <span class="required">*</span></label>
                        <input type="tel" class="form-input" id="contactPhone" placeholder="请输入手机号" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">留言</label>
                        <textarea class="form-input form-textarea" id="contactMessage" placeholder="请输入留言内容" rows="3"></textarea>
                    </div>
                    <button type="submit" class="btn btn-primary btn-block">提交</button>
                </form>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    addFormModalStyles();
    
    setTimeout(() => modal.classList.add('active'), 10);
    document.getElementById('contactName').focus();
}

/**
 * 关闭联系销售弹窗
 */
function closeContactModal() {
    const modal = document.getElementById('contactModal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    }
}

/**
 * 处理联系销售提交
 */
function handleContactSubmit(event) {
    event.preventDefault();
    
    const name = document.getElementById('contactName').value.trim();
    const phone = document.getElementById('contactPhone').value.trim();
    
    if (!name || !phone) {
        showToast('请填写所有必填项', 'error');
        return;
    }
    
    if (!isValidPhone(phone)) {
        showToast('请输入正确的手机号格式', 'error');
        return;
    }
    
    // 模拟提交
    const submitBtn = document.querySelector('.contact-form button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="loading-spinner"></span> 提交中...';
    
    setTimeout(() => {
        showToast('提交成功！我们将尽快与您联系', 'success');
        closeContactModal();
    }, 1500);
}

/**
 * 添加表单弹窗样式
 */
function addFormModalStyles() {
    if (document.getElementById('form-modal-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'form-modal-styles';
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
            max-width: 480px;
            max-height: 90vh;
            overflow-y: auto;
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
        .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
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
        .form-label .required {
            color: #ef4444;
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
        .form-textarea {
            resize: vertical;
            min-height: 80px;
        }
        .btn {
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
            border: none;
        }
        .btn-primary {
            background: #2b7de9;
            color: #fff;
        }
        .btn-primary:hover {
            background: #1a6dd6;
        }
        .btn-primary:disabled {
            background: #9ca3af;
            cursor: not-allowed;
        }
        .btn-block {
            display: block;
            width: 100%;
        }
        .contact-info {
            display: flex;
            flex-direction: column;
            gap: 12px;
            padding: 16px;
            background: #f9fafb;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        .contact-item {
            display: flex;
            align-items: center;
            gap: 12px;
            color: #374151;
        }
        .contact-item svg {
            color: #2b7de9;
        }
        .contact-divider {
            text-align: center;
            margin: 20px 0;
            position: relative;
        }
        .contact-divider::before {
            content: '';
            position: absolute;
            left: 0;
            top: 50%;
            width: 100%;
            height: 1px;
            background: #e5e7eb;
        }
        .contact-divider span {
            position: relative;
            background: #fff;
            padding: 0 16px;
            color: #9ca3af;
            font-size: 14px;
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
    `;
    document.head.appendChild(style);
}

// ==================== 数字动画 ====================

/**
 * 初始化数字动画
 */
function initNumberAnimation() {
    const numbers = document.querySelectorAll('.stat-number, .metric-value');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateNumber(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    numbers.forEach(num => observer.observe(num));
}

/**
 * 数字动画
 */
function animateNumber(element) {
    const text = element.textContent;
    const match = text.match(/(\d+)/);
    if (!match) return;
    
    const target = parseInt(match[1]);
    const suffix = text.replace(match[1], '');
    const duration = 2000;
    const start = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - start;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(target * easeProgress);
        
        element.textContent = current + suffix;
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
}

// ==================== 初始化 ====================

/**
 * 页面加载完成后初始化
 */
document.addEventListener('DOMContentLoaded', function() {
    // 初始化导航栏
    initNavbar();
    
    // 初始化移动端菜单
    initMobileMenu();
    
    // 初始化下拉菜单
    initDropdownMenus();
    
    // 初始化平滑滚动
    initSmoothScroll();
    
    // 初始化客户轮播
    initCustomerCarousel();
    
    // 初始化流水线动画
    initPipelineAnimation();
    
    // 初始化在线客服
    initOnlineSupport();
    
    // 初始化预约演示表单
    initDemoForm();
    
    // 初始化联系销售表单
    initContactForm();
    
    // 初始化数字动画
    initNumberAnimation();
    
    console.log('首页初始化完成');
});

// 导出全局函数
window.toggleMobileMenu = toggleMobileMenu;
window.closeMobileMenu = closeMobileMenu;
window.toggleSupportChat = toggleSupportChat;
window.sendQuickMessage = sendQuickMessage;
window.handleSupportKeypress = handleSupportKeypress;
window.sendSupportMessage = sendSupportMessage;
window.closeDemoModal = closeDemoModal;
window.handleDemoSubmit = handleDemoSubmit;
window.closeContactModal = closeContactModal;
window.handleContactSubmit = handleContactSubmit;