/**
 * 设计理念页面 JavaScript 模块
 * 包含页面交互、动画效果等功能
 */

// ==================== 滚动动画 ====================

/**
 * 初始化滚动动画
 */
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll(
        '.principle-card, .color-card, .component-group, .interaction-card, .value-card, .device'
    );
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // 添加延迟动画
                setTimeout(() => {
                    entry.target.classList.add('animate-in');
                }, index * 100);
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    animatedElements.forEach(el => {
        el.classList.add('animate-ready');
        observer.observe(el);
    });
    
    // 添加动画样式
    addAnimationStyles();
}

/**
 * 添加动画样式
 */
function addAnimationStyles() {
    if (document.getElementById('design-animation-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'design-animation-styles';
    style.textContent = `
        .animate-ready {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .animate-in {
            opacity: 1;
            transform: translateY(0);
        }
    `;
    document.head.appendChild(style);
}

// ==================== 拖拽排序 ====================

/**
 * 初始化拖拽排序
 */
function initDragAndDrop() {
    const dragItems = document.querySelectorAll('.drag-item');
    let draggedItem = null;
    
    dragItems.forEach(item => {
        item.addEventListener('dragstart', function(e) {
            draggedItem = this;
            this.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
        });
        
        item.addEventListener('dragend', function() {
            this.classList.remove('dragging');
            draggedItem = null;
        });
        
        item.addEventListener('dragover', function(e) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            
            if (this !== draggedItem) {
                const container = this.parentNode;
                const items = [...container.querySelectorAll('.drag-item:not(.dragging)')];
                const currentIndex = items.indexOf(this);
                const draggedIndex = [...container.children].indexOf(draggedItem);
                
                if (currentIndex > draggedIndex) {
                    this.after(draggedItem);
                } else {
                    this.before(draggedItem);
                }
            }
        });
    });
}

// ==================== 成功动画交互 ====================

/**
 * 初始化成功动画
 */
function initSuccessAnimation() {
    const successDemo = document.querySelector('.interaction-success');
    if (!successDemo) return;
    
    successDemo.addEventListener('click', function() {
        this.classList.toggle('active');
        
        // 自动重置
        if (this.classList.contains('active')) {
            setTimeout(() => {
                this.classList.remove('active');
            }, 2000);
        }
    });
}

// ==================== 平滑滚动到锚点 ====================

/**
 * 初始化平滑滚动
 */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
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
            }
        });
    });
}

// ==================== 视差效果 ====================

/**
 * 初始化视差效果
 */
function initParallax() {
    const shapes = document.querySelectorAll('.shape');
    
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        
        shapes.forEach((shape, index) => {
            const speed = (index + 1) * 0.1;
            shape.style.transform = `translateY(${scrollY * speed}px)`;
        });
    });
}

// ==================== 颜色卡片交互 ====================

/**
 * 初始化颜色卡片交互
 */
function initColorCards() {
    const colorCards = document.querySelectorAll('.color-card');
    
    colorCards.forEach(card => {
        const colorValue = card.querySelector('.color-value');
        if (!colorValue) return;
        
        // 点击复制颜色值
        card.addEventListener('click', function() {
            const color = colorValue.textContent;
            copyToClipboard(color);
            showToast(`已复制颜色值: ${color}`, 'success');
        });
        
        // 添加复制提示
        card.style.cursor = 'pointer';
        card.title = '点击复制颜色值';
    });
}

/**
 * 复制到剪贴板
 */
function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text);
    } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
    }
}

/**
 * 显示Toast提示
 */
function showToast(message, type = 'info') {
    const existingToast = document.querySelector('.design-toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    const toast = document.createElement('div');
    toast.className = `design-toast design-toast-${type}`;
    toast.innerHTML = `
        <span class="toast-icon">${type === 'success' ? '✓' : 'ℹ'}</span>
        <span class="toast-message">${message}</span>
    `;
    document.body.appendChild(toast);
    
    // 添加样式
    if (!document.getElementById('design-toast-styles')) {
        const style = document.createElement('style');
        style.id = 'design-toast-styles';
        style.textContent = `
            .design-toast {
                position: fixed;
                bottom: 24px;
                left: 50%;
                transform: translateX(-50%);
                padding: 12px 24px;
                border-radius: 8px;
                background: #333;
                color: #fff;
                font-size: 14px;
                z-index: 10000;
                display: flex;
                align-items: center;
                gap: 8px;
                animation: toastSlideUp 0.3s ease;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            }
            .design-toast-success { background: #10b981; }
            @keyframes toastSlideUp {
                from { opacity: 0; transform: translateX(-50%) translateY(20px); }
                to { opacity: 1; transform: translateX(-50%) translateY(0); }
            }
        `;
        document.head.appendChild(style);
    }
    
    setTimeout(() => toast.remove(), 3000);
}

// ==================== 组件演示交互 ====================

/**
 * 初始化组件演示
 */
function initComponentDemos() {
    // 按钮点击效果
    const demoButtons = document.querySelectorAll('.component-demo .btn');
    demoButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            // 创建涟漪效果
            const ripple = document.createElement('span');
            ripple.className = 'btn-ripple';
            
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255,255,255,0.3);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s ease-out;
                pointer-events: none;
            `;
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
        });
    });
    
    // 添加涟漪动画样式
    if (!document.getElementById('ripple-styles')) {
        const style = document.createElement('style');
        style.id = 'ripple-styles';
        style.textContent = `
            @keyframes ripple {
                to { transform: scale(2); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
}

// ==================== 数字计数动画 ====================

/**
 * 初始化数字计数动画
 */
function initCountAnimation() {
    const numbers = document.querySelectorAll('.principle-number');
    
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
    const target = parseInt(element.textContent);
    const duration = 1000;
    const start = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - start;
        const progress = Math.min(elapsed / duration, 1);
        const current = Math.floor(target * progress);
        
        element.textContent = String(current).padStart(2, '0');
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
}

// ==================== 滚动进度指示器 ====================

/**
 * 初始化滚动进度指示器
 */
function initScrollProgress() {
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    document.body.appendChild(progressBar);
    
    // 添加样式
    if (!document.getElementById('scroll-progress-styles')) {
        const style = document.createElement('style');
        style.id = 'scroll-progress-styles';
        style.textContent = `
            .scroll-progress {
                position: fixed;
                top: 0;
                left: 0;
                height: 3px;
                background: linear-gradient(90deg, #2b7de9, #06b6d4);
                z-index: 10000;
                transition: width 0.1s ease;
            }
        `;
        document.head.appendChild(style);
    }
    
    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (scrollTop / docHeight) * 100;
        progressBar.style.width = `${progress}%`;
    });
}

// ==================== 键盘导航 ====================

/**
 * 初始化键盘导航
 */
function initKeyboardNav() {
    const sections = document.querySelectorAll('section');
    let currentSection = 0;
    
    document.addEventListener('keydown', (e) => {
        // 按下 J 或向下箭头滚动到下一个区块
        if (e.key === 'j' || e.key === 'ArrowDown') {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            
            currentSection = Math.min(currentSection + 1, sections.length - 1);
            scrollToSection(sections[currentSection]);
        }
        
        // 按下 K 或向上箭头滚动到上一个区块
        if (e.key === 'k' || e.key === 'ArrowUp') {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            
            currentSection = Math.max(currentSection - 1, 0);
            scrollToSection(sections[currentSection]);
        }
    });
}

/**
 * 滚动到指定区块
 */
function scrollToSection(section) {
    const navbarHeight = document.querySelector('.navbar')?.offsetHeight || 0;
    const targetPosition = section.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
    
    window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
    });
}

// ==================== 初始化 ====================

/**
 * 页面加载完成后初始化
 */
document.addEventListener('DOMContentLoaded', function() {
    // 初始化滚动动画
    initScrollAnimations();
    
    // 初始化拖拽排序
    initDragAndDrop();
    
    // 初始化成功动画
    initSuccessAnimation();
    
    // 初始化平滑滚动
    initSmoothScroll();
    
    // 初始化视差效果
    initParallax();
    
    // 初始化颜色卡片交互
    initColorCards();
    
    // 初始化组件演示
    initComponentDemos();
    
    // 初始化数字计数动画
    initCountAnimation();
    
    // 初始化滚动进度指示器
    initScrollProgress();
    
    // 初始化键盘导航
    initKeyboardNav();
    
    console.log('设计理念页面初始化完成');
});