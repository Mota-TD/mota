/**
 * 摩塔 Mota - 知识库管理模块 JavaScript
 * 实现 Wiki 页面的所有交互功能
 */

// ==================== Wiki 数据模型 ====================
const WikiData = {
    // 页面树结构
    pages: [
        {
            id: 1,
            title: '快速入门',
            type: 'folder',
            expanded: true,
            children: [
                { id: 2, title: '平台介绍', type: 'page', parentId: 1, content: '', updatedAt: '2024-01-10', author: '张三', views: 1234 },
                { id: 3, title: '创建第一个项目', type: 'page', parentId: 1, content: '', updatedAt: '2024-01-08', author: '李四', views: 856 },
                { id: 4, title: '团队协作指南', type: 'page', parentId: 1, content: '', updatedAt: '2024-01-05', author: '王五', views: 623 }
            ]
        },
        {
            id: 5,
            title: '开发规范',
            type: 'folder',
            expanded: false,
            children: [
                { id: 6, title: '代码规范', type: 'page', parentId: 5, content: '', updatedAt: '2024-01-03', author: '张三', views: 445 },
                { id: 7, title: 'Git 工作流', type: 'page', parentId: 5, content: '', updatedAt: '2024-01-02', author: '李四', views: 389 },
                { id: 8, title: '代码审查规范', type: 'page', parentId: 5, content: '', updatedAt: '2024-01-01', author: '王五', views: 267 }
            ]
        },
        {
            id: 9,
            title: 'API 文档',
            type: 'folder',
            expanded: false,
            children: [
                { id: 10, title: 'REST API 概述', type: 'page', parentId: 9, content: '', updatedAt: '2023-12-28', author: '张三', views: 512 },
                { id: 11, title: '认证与授权', type: 'page', parentId: 9, content: '', updatedAt: '2023-12-25', author: '李四', views: 423 },
                { id: 12, title: '接口列表', type: 'page', parentId: 9, content: '', updatedAt: '2023-12-20', author: '王五', views: 678 }
            ]
        },
        {
            id: 13,
            title: '部署指南',
            type: 'folder',
            expanded: false,
            children: [
                { id: 14, title: 'Docker 部署', type: 'page', parentId: 13, content: '', updatedAt: '2023-12-18', author: '张三', views: 334 },
                { id: 15, title: 'Kubernetes 部署', type: 'page', parentId: 13, content: '', updatedAt: '2023-12-15', author: '李四', views: 289 }
            ]
        },
        {
            id: 16,
            title: '常见问题',
            type: 'folder',
            expanded: false,
            children: [
                { id: 17, title: '登录问题', type: 'page', parentId: 16, content: '', updatedAt: '2023-12-10', author: '王五', views: 567 },
                { id: 18, title: '权限问题', type: 'page', parentId: 16, content: '', updatedAt: '2023-12-08', author: '张三', views: 445 }
            ]
        }
    ],
    
    // 当前选中的页面
    currentPage: null,
    
    // 编辑模式
    isEditing: false,
    
    // 页面历史版本
    pageHistory: [],
    
    // 搜索结果
    searchResults: []
};

// 页面内容模板
const pageContents = {
    2: `
        <h2>什么是摩塔 Mota？</h2>
        <p>摩塔 Mota 是一站式 DevOps 软件研发管理平台，提供从需求管理、代码托管、持续集成、制品管理到持续部署的全流程解决方案，帮助团队提升研发效能。</p>
        
        <h2>核心功能</h2>
        
        <h3>项目协同</h3>
        <p>提供敏捷开发和瀑布开发两种项目管理模式，支持需求、任务、缺陷的全生命周期管理。</p>
        <ul>
            <li>需求管理：支持需求分解、优先级设置、状态跟踪</li>
            <li>任务管理：支持任务分配、工时记录、进度跟踪</li>
            <li>缺陷管理：支持缺陷提交、分配、修复、验证的完整流程</li>
            <li>迭代管理：支持迭代规划、燃尽图、迭代回顾</li>
        </ul>
        
        <h3>代码托管</h3>
        <p>基于 Git 的代码托管服务，提供代码评审、分支管理、权限控制等功能。</p>
        
        <h3>持续集成</h3>
        <p>提供自动化构建、测试、代码检查能力，支持多种编程语言和构建工具。</p>
        
        <h3>制品管理</h3>
        <p>支持 Docker、npm、Maven 等多种制品类型的存储和管理。</p>
        
        <h3>持续部署</h3>
        <p>支持多环境部署、灰度发布、回滚等能力，确保应用安全稳定上线。</p>
        
        <h2>快速开始</h2>
        <ol>
            <li>注册账号并创建团队</li>
            <li>创建第一个项目</li>
            <li>邀请团队成员</li>
            <li>创建代码仓库</li>
            <li>配置 CI/CD 流水线</li>
        </ol>
    `,
    3: `
        <h2>创建第一个项目</h2>
        <p>本文档将指导您如何在摩塔平台上创建您的第一个项目。</p>
        
        <h3>步骤一：进入项目列表</h3>
        <p>登录后，点击左侧导航栏的"项目"菜单，进入项目列表页面。</p>
        
        <h3>步骤二：点击创建项目</h3>
        <p>点击页面右上角的"新建项目"按钮，打开创建项目弹窗。</p>
        
        <h3>步骤三：填写项目信息</h3>
        <ul>
            <li><strong>项目名称</strong>：输入项目的显示名称</li>
            <li><strong>项目标识</strong>：输入项目的唯一标识，用于 URL 和 API</li>
            <li><strong>项目描述</strong>：简要描述项目的目的和范围</li>
            <li><strong>项目模板</strong>：选择适合的项目模板</li>
        </ul>
        
        <h3>步骤四：完成创建</h3>
        <p>点击"创建"按钮，项目将被创建并跳转到项目详情页面。</p>
    `,
    4: `
        <h2>团队协作指南</h2>
        <p>高效的团队协作是项目成功的关键。本指南将帮助您了解如何在摩塔平台上进行团队协作。</p>
        
        <h3>邀请团队成员</h3>
        <p>进入团队设置 > 成员管理，点击"邀请成员"按钮，输入成员邮箱发送邀请。</p>
        
        <h3>分配角色和权限</h3>
        <p>摩塔支持多种角色：</p>
        <ul>
            <li><strong>所有者</strong>：拥有团队的所有权限</li>
            <li><strong>管理员</strong>：可以管理团队设置和成员</li>
            <li><strong>成员</strong>：可以参与项目开发</li>
        </ul>
        
        <h3>使用用户组</h3>
        <p>创建用户组可以更方便地管理权限，例如"开发组"、"测试组"等。</p>
    `
};

// ==================== 初始化 ====================
document.addEventListener('DOMContentLoaded', function() {
    initWiki();
});

function initWiki() {
    // 渲染页面树
    renderPageTree();
    
    // 加载默认页面
    loadPage(2);
    
    // 绑定事件
    bindWikiEvents();
    
    // 初始化搜索
    initWikiSearch();
    
    console.log('Wiki module initialized');
}

// ==================== 页面树渲染 ====================
function renderPageTree() {
    const treeContainer = document.querySelector('.wiki-tree');
    if (!treeContainer) return;
    
    treeContainer.innerHTML = WikiData.pages.map(folder => renderTreeItem(folder)).join('');
    
    // 绑定树节点事件
    bindTreeEvents();
}

function renderTreeItem(item) {
    if (item.type === 'folder') {
        return `
            <div class="tree-item ${item.expanded ? 'expanded' : ''}" data-id="${item.id}" data-type="folder">
                <div class="tree-item-header" onclick="toggleFolder(${item.id})">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        ${item.expanded ? '<polyline points="6 9 12 15 18 9"/>' : '<polyline points="9 18 15 12 9 6"/>'}
                    </svg>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                    </svg>
                    <span>${item.title}</span>
                    <button class="tree-action-btn" onclick="event.stopPropagation(); showFolderMenu(${item.id}, event)" title="更多操作">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="1"/>
                            <circle cx="19" cy="12" r="1"/>
                            <circle cx="5" cy="12" r="1"/>
                        </svg>
                    </button>
                </div>
                <div class="tree-children">
                    ${item.children ? item.children.map(child => renderTreeItem(child)).join('') : ''}
                </div>
            </div>
        `;
    } else {
        const isActive = WikiData.currentPage && WikiData.currentPage.id === item.id;
        return `
            <div class="tree-item ${isActive ? 'active' : ''}" data-id="${item.id}" data-type="page">
                <div class="tree-item-header" onclick="loadPage(${item.id})">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                    </svg>
                    <span>${item.title}</span>
                </div>
            </div>
        `;
    }
}

function bindTreeEvents() {
    // 树节点右键菜单
    document.querySelectorAll('.tree-item[data-type="page"] .tree-item-header').forEach(header => {
        header.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            const pageId = parseInt(this.parentElement.dataset.id);
            showPageContextMenu(pageId, e);
        });
    });
}

// ==================== 文件夹操作 ====================
function toggleFolder(folderId) {
    const folder = findPageById(folderId);
    if (folder && folder.type === 'folder') {
        folder.expanded = !folder.expanded;
        renderPageTree();
    }
}

function showFolderMenu(folderId, event) {
    event.preventDefault();
    
    // 移除已有菜单
    removeContextMenu();
    
    const menu = document.createElement('div');
    menu.className = 'context-menu wiki-context-menu';
    menu.innerHTML = `
        <div class="context-menu-item" onclick="createPageInFolder(${folderId})">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="12" y1="18" x2="12" y2="12"/>
                <line x1="9" y1="15" x2="15" y2="15"/>
            </svg>
            <span>新建页面</span>
        </div>
        <div class="context-menu-item" onclick="createSubFolder(${folderId})">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                <line x1="12" y1="11" x2="12" y2="17"/>
                <line x1="9" y1="14" x2="15" y2="14"/>
            </svg>
            <span>新建子目录</span>
        </div>
        <div class="context-menu-divider"></div>
        <div class="context-menu-item" onclick="renameFolder(${folderId})">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            <span>重命名</span>
        </div>
        <div class="context-menu-item danger" onclick="deleteFolder(${folderId})">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
            <span>删除目录</span>
        </div>
    `;
    
    menu.style.left = `${event.clientX}px`;
    menu.style.top = `${event.clientY}px`;
    document.body.appendChild(menu);
    
    // 点击其他地方关闭菜单
    setTimeout(() => {
        document.addEventListener('click', removeContextMenu, { once: true });
    }, 0);
}

function showPageContextMenu(pageId, event) {
    removeContextMenu();
    
    const menu = document.createElement('div');
    menu.className = 'context-menu wiki-context-menu';
    menu.innerHTML = `
        <div class="context-menu-item" onclick="loadPage(${pageId})">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
            </svg>
            <span>查看页面</span>
        </div>
        <div class="context-menu-item" onclick="editPage(${pageId})">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            <span>编辑页面</span>
        </div>
        <div class="context-menu-divider"></div>
        <div class="context-menu-item" onclick="copyPageLink(${pageId})">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
            </svg>
            <span>复制链接</span>
        </div>
        <div class="context-menu-item" onclick="showPageHistory(${pageId})">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
            </svg>
            <span>历史版本</span>
        </div>
        <div class="context-menu-item" onclick="exportPage(${pageId})">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            <span>导出页面</span>
        </div>
        <div class="context-menu-divider"></div>
        <div class="context-menu-item danger" onclick="deletePage(${pageId})">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
            <span>删除页面</span>
        </div>
    `;
    
    menu.style.left = `${event.clientX}px`;
    menu.style.top = `${event.clientY}px`;
    document.body.appendChild(menu);
    
    setTimeout(() => {
        document.addEventListener('click', removeContextMenu, { once: true });
    }, 0);
}

function removeContextMenu() {
    const menu = document.querySelector('.wiki-context-menu');
    if (menu) {
        menu.remove();
    }
}

// ==================== 页面加载 ====================
function loadPage(pageId) {
    const page = findPageById(pageId);
    if (!page || page.type === 'folder') return;
    
    WikiData.currentPage = page;
    
    // 更新树的选中状态
    document.querySelectorAll('.tree-item').forEach(item => {
        item.classList.remove('active');
    });
    const treeItem = document.querySelector(`.tree-item[data-id="${pageId}"]`);
    if (treeItem) {
        treeItem.classList.add('active');
    }
    
    // 更新面包屑
    updateBreadcrumb(page);
    
    // 更新页面标题
    updatePageTitle(page);
    
    // 更新页面内容
    updatePageContent(page);
    
    // 更新目录
    updateTableOfContents();
    
    // 更新导航
    updatePageNavigation(page);
    
    // 增加浏览次数
    page.views = (page.views || 0) + 1;
    
    removeContextMenu();
}

function findPageById(id, pages = WikiData.pages) {
    for (const page of pages) {
        if (page.id === id) return page;
        if (page.children) {
            const found = findPageById(id, page.children);
            if (found) return found;
        }
    }
    return null;
}

function findParentFolder(pageId, pages = WikiData.pages) {
    for (const page of pages) {
        if (page.children) {
            for (const child of page.children) {
                if (child.id === pageId) return page;
            }
            const found = findParentFolder(pageId, page.children);
            if (found) return found;
        }
    }
    return null;
}

function updateBreadcrumb(page) {
    const breadcrumb = document.querySelector('.wiki-breadcrumb');
    if (!breadcrumb) return;
    
    const parent = findParentFolder(page.id);
    
    breadcrumb.innerHTML = `
        <a href="#" onclick="event.preventDefault();">知识库</a>
        <span>/</span>
        ${parent ? `<a href="#" onclick="event.preventDefault(); toggleFolder(${parent.id})">${parent.title}</a><span>/</span>` : ''}
        <span>${page.title}</span>
    `;
}

function updatePageTitle(page) {
    const titleSection = document.querySelector('.wiki-title-section');
    if (!titleSection) return;
    
    titleSection.innerHTML = `
        <h1 class="wiki-page-title" ondblclick="enableTitleEdit()">${page.title}</h1>
        <div class="wiki-meta">
            <span class="wiki-author">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=${page.author}" alt="">
                ${page.author} 创建
            </span>
            <span class="wiki-updated">更新于 ${page.updatedAt}</span>
            <span class="wiki-views">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                </svg>
                ${page.views.toLocaleString()} 次浏览
            </span>
        </div>
    `;
}

function updatePageContent(page) {
    const contentBody = document.querySelector('.wiki-body');
    if (!contentBody) return;
    
    // 使用预定义内容或默认内容
    const content = pageContents[page.id] || `
        <h2>${page.title}</h2>
        <p>这是 "${page.title}" 页面的内容。点击右上角的"编辑"按钮可以编辑此页面。</p>
    `;
    
    contentBody.innerHTML = content;
    
    // 绑定代码复制按钮
    bindCodeCopyButtons();
}

function updateTableOfContents() {
    const tocList = document.querySelector('.toc-list');
    if (!tocList) return;
    
    const contentBody = document.querySelector('.wiki-body');
    if (!contentBody) return;
    
    const headings = contentBody.querySelectorAll('h2, h3');
    
    tocList.innerHTML = Array.from(headings).map((heading, index) => {
        const id = `heading-${index}`;
        heading.id = id;
        const isH3 = heading.tagName === 'H3';
        return `
            <a href="#${id}" class="toc-item ${isH3 ? 'sub' : ''}" onclick="scrollToHeading('${id}')">${heading.textContent}</a>
        `;
    }).join('');
    
    // 监听滚动更新目录高亮
    bindTocScrollSpy();
}

function scrollToHeading(id) {
    const heading = document.getElementById(id);
    if (heading) {
        heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function bindTocScrollSpy() {
    const contentBody = document.querySelector('.wiki-body');
    if (!contentBody) return;
    
    contentBody.addEventListener('scroll', function() {
        const headings = contentBody.querySelectorAll('h2, h3');
        const tocItems = document.querySelectorAll('.toc-item');
        
        let currentIndex = 0;
        headings.forEach((heading, index) => {
            if (heading.getBoundingClientRect().top < 100) {
                currentIndex = index;
            }
        });
        
        tocItems.forEach((item, index) => {
            item.classList.toggle('active', index === currentIndex);
        });
    });
}

function updatePageNavigation(page) {
    const parent = findParentFolder(page.id);
    if (!parent || !parent.children) return;
    
    const siblings = parent.children;
    const currentIndex = siblings.findIndex(p => p.id === page.id);
    
    const prevPage = currentIndex > 0 ? siblings[currentIndex - 1] : null;
    const nextPage = currentIndex < siblings.length - 1 ? siblings[currentIndex + 1] : null;
    
    const navPrev = document.querySelector('.wiki-nav-prev');
    const navNext = document.querySelector('.wiki-nav-next');
    
    if (navPrev) {
        if (prevPage) {
            navPrev.style.visibility = 'visible';
            navPrev.onclick = () => loadPage(prevPage.id);
            navPrev.querySelector('.nav-title').textContent = prevPage.title;
        } else {
            navPrev.style.visibility = 'hidden';
        }
    }
    
    if (navNext) {
        if (nextPage) {
            navNext.style.visibility = 'visible';
            navNext.onclick = () => loadPage(nextPage.id);
            navNext.querySelector('.nav-title').textContent = nextPage.title;
        } else {
            navNext.style.visibility = 'hidden';
        }
    }
}

// ==================== 页面编辑 ====================
function editPage(pageId) {
    const page = findPageById(pageId || WikiData.currentPage?.id);
    if (!page) return;
    
    WikiData.isEditing = true;
    
    // 显示编辑器
    showEditor(page);
    
    removeContextMenu();
}

function showEditor(page) {
    const contentPanel = document.querySelector('.wiki-content-panel');
    if (!contentPanel) return;
    
    const content = pageContents[page.id] || '';
    
    // 保存原始内容用于取消
    WikiData.originalContent = content;
    
    contentPanel.innerHTML = `
        <div class="wiki-editor">
            <div class="editor-header">
                <div class="editor-title">
                    <input type="text" class="editor-title-input" value="${page.title}" id="editorTitle">
                </div>
                <div class="editor-actions">
                    <button class="btn btn-outline" onclick="cancelEdit()">取消</button>
                    <button class="btn btn-primary" onclick="savePage()">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                            <polyline points="17 21 17 13 7 13 7 21"/>
                            <polyline points="7 3 7 8 15 8"/>
                        </svg>
                        保存
                    </button>
                </div>
            </div>
            <div class="editor-toolbar">
                <button class="toolbar-btn" onclick="formatText('bold')" title="粗体">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/>
                        <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/>
                    </svg>
                </button>
                <button class="toolbar-btn" onclick="formatText('italic')" title="斜体">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="19" y1="4" x2="10" y2="4"/>
                        <line x1="14" y1="20" x2="5" y2="20"/>
                        <line x1="15" y1="4" x2="9" y2="20"/>
                    </svg>
                </button>
                <button class="toolbar-btn" onclick="formatText('underline')" title="下划线">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"/>
                        <line x1="4" y1="21" x2="20" y2="21"/>
                    </svg>
                </button>
                <div class="toolbar-divider"></div>
                <button class="toolbar-btn" onclick="formatText('h2')" title="标题2">H2</button>
                <button class="toolbar-btn" onclick="formatText('h3')" title="标题3">H3</button>
                <div class="toolbar-divider"></div>
                <button class="toolbar-btn" onclick="formatText('ul')" title="无序列表">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="8" y1="6" x2="21" y2="6"/>
                        <line x1="8" y1="12" x2="21" y2="12"/>
                        <line x1="8" y1="18" x2="21" y2="18"/>
                        <line x1="3" y1="6" x2="3.01" y2="6"/>
                        <line x1="3" y1="12" x2="3.01" y2="12"/>
                        <line x1="3" y1="18" x2="3.01" y2="18"/>
                    </svg>
                </button>
                <button class="toolbar-btn" onclick="formatText('ol')" title="有序列表">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="10" y1="6" x2="21" y2="6"/>
                        <line x1="10" y1="12" x2="21" y2="12"/>
                        <line x1="10" y1="18" x2="21" y2="18"/>
                        <path d="M4 6h1v4"/>
                        <path d="M4 10h2"/>
                        <path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/>
                    </svg>
                </button>
                <div class="toolbar-divider"></div>
                <button class="toolbar-btn" onclick="formatText('code')" title="代码块">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="16 18 22 12 16 6"/>
                        <polyline points="8 6 2 12 8 18"/>
                    </svg>
                </button>
                <button class="toolbar-btn" onclick="formatText('link')" title="链接">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                    </svg>
                </button>
                <button class="toolbar-btn" onclick="formatText('image')" title="图片">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21 15 16 10 5 21"/>
                    </svg>
                </button>
            </div>
            <div class="editor-content">
                <textarea id="editorContent" class="editor-textarea" placeholder="开始编写内容...">${htmlToMarkdown(content)}</textarea>
            </div>
            <div class="editor-footer">
                <span class="editor-hint">支持 Markdown 语法</span>
                <span class="editor-stats">字数：<span id="wordCount">0</span></span>
            </div>
        </div>
    `;
    
    // 初始化编辑器
    initEditor();
}

function initEditor() {
    const textarea = document.getElementById('editorContent');
    if (!textarea) return;
    
    // 更新字数统计
    updateWordCount();
    textarea.addEventListener('input', updateWordCount);
    
    // 自动保存
    let autoSaveTimer;
    textarea.addEventListener('input', function() {
        clearTimeout(autoSaveTimer);
        autoSaveTimer = setTimeout(() => {
            autoSave();
        }, 30000); // 30秒自动保存
    });
}

function updateWordCount() {
    const textarea = document.getElementById('editorContent');
    const wordCount = document.getElementById('wordCount');
    if (textarea && wordCount) {
        const text = textarea.value.replace(/\s/g, '');
        wordCount.textContent = text.length;
    }
}

function formatText(format) {
    const textarea = document.getElementById('editorContent');
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    
    let formattedText = '';
    
    switch (format) {
        case 'bold':
            formattedText = `**${selectedText || '粗体文本'}**`;
            break;
        case 'italic':
            formattedText = `*${selectedText || '斜体文本'}*`;
            break;
        case 'underline':
            formattedText = `<u>${selectedText || '下划线文本'}</u>`;
            break;
        case 'h2':
            formattedText = `\n## ${selectedText || '标题'}\n`;
            break;
        case 'h3':
            formattedText = `\n### ${selectedText || '标题'}\n`;
            break;
        case 'ul':
            formattedText = `\n- ${selectedText || '列表项'}\n`;
            break;
        case 'ol':
            formattedText = `\n1. ${selectedText || '列表项'}\n`;
            break;
        case 'code':
            formattedText = selectedText.includes('\n') 
                ? `\n\`\`\`\n${selectedText || '代码'}\n\`\`\`\n`
                : `\`${selectedText || '代码'}\``;
            break;
        case 'link':
            formattedText = `[${selectedText || '链接文本'}](url)`;
            break;
        case 'image':
            formattedText = `![${selectedText || '图片描述'}](url)`;
            break;
    }
    
    textarea.value = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
    textarea.focus();
    textarea.setSelectionRange(start + formattedText.length, start + formattedText.length);
    
    updateWordCount();
}

function htmlToMarkdown(html) {
    // 简单的 HTML 转 Markdown
    return html
        .replace(/<h2>(.*?)<\/h2>/g, '## $1\n')
        .replace(/<h3>(.*?)<\/h3>/g, '### $1\n')
        .replace(/<p>(.*?)<\/p>/g, '$1\n\n')
        .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
        .replace(/<em>(.*?)<\/em>/g, '*$1*')
        .replace(/<ul>(.*?)<\/ul>/gs, '$1')
        .replace(/<ol>(.*?)<\/ol>/gs, '$1')
        .replace(/<li>(.*?)<\/li>/g, '- $1\n')
        .replace(/<code>(.*?)<\/code>/g, '`$1`')
        .replace(/<[^>]+>/g, '')
        .trim();
}

function markdownToHtml(markdown) {
    // 简单的 Markdown 转 HTML
    return markdown
        .replace(/^### (.*$)/gm, '<h3>$1</h3>')
        .replace(/^## (.*$)/gm, '<h2>$1</h2>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/^- (.*$)/gm, '<li>$1</li>')
        .replace(/^(\d+)\. (.*$)/gm, '<li>$2</li>')
        .replace(/`(.*?)`/g, '<code>$1</code>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/^(.+)$/gm, '<p>$1</p>')
        .replace(/<p><h/g, '<h')
        .replace(/<\/h(\d)><\/p>/g, '</h$1>')
        .replace(/<p><li>/g, '<li>')
        .replace(/<\/li><\/p>/g, '</li>');
}

function savePage() {
    const page = WikiData.currentPage;
    if (!page) return;
    
    const titleInput = document.getElementById('editorTitle');
    const contentTextarea = document.getElementById('editorContent');
    
    if (!titleInput || !contentTextarea) return;
    
    const newTitle = titleInput.value.trim();
    const newContent = contentTextarea.value;
    
    if (!newTitle) {
        showToast('请输入页面标题', 'error');
        return;
    }
    
    // 更新页面数据
    page.title = newTitle;
    page.updatedAt = new Date().toISOString().split('T')[0];
    pageContents[page.id] = markdownToHtml(newContent);
    
    // 保存到历史版本
    WikiData.pageHistory.push({
        pageId: page.id,
        title: newTitle,
        content: newContent,
        savedAt: new Date().toISOString(),
        author: '张三'
    });
    
    WikiData.isEditing = false;
    
    // 重新渲染页面
    renderPageTree();
    loadPage(page.id);
    
    showToast('页面已保存', 'success');
}

function cancelEdit() {
    if (WikiData.isEditing) {
        if (confirm('确定要取消编辑吗？未保存的更改将丢失。')) {
            WikiData.isEditing = false;
            loadPage(WikiData.currentPage.id);
        }
    }
}

function autoSave() {
    const contentTextarea = document.getElementById('editorContent');
    if (contentTextarea) {
        localStorage.setItem(`wiki_draft_${WikiData.currentPage.id}`, contentTextarea.value);
        showToast('草稿已自动保存', 'info');
    }
}

// ==================== 页面创建 ====================
function createPageInFolder(folderId) {
    removeContextMenu();
    
    const folder = findPageById(folderId);
    if (!folder) return;
    
    showCreatePageModal(folderId);
}

function showCreatePageModal(folderId) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'createPageModal';
    modal.innerHTML = `
        <div class="modal">
            <div class="modal-header">
                <h3>新建页面</h3>
                <button class="modal-close" onclick="closeCreatePageModal()">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label>页面标题 <span class="required">*</span></label>
                    <input type="text" id="newPageTitle" placeholder="请输入页面标题" autofocus>
                </div>
                <div class="form-group">
                    <label>页面模板</label>
                    <select id="newPageTemplate">
                        <option value="blank">空白页面</option>
                        <option value="doc">文档模板</option>
                        <option value="api">API 文档模板</option>
                        <option value="guide">指南模板</option>
                    </select>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-outline" onclick="closeCreatePageModal()">取消</button>
                <button class="btn btn-primary" onclick="confirmCreatePage(${folderId})">创建</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.classList.add('active');
    
    // 聚焦输入框
    setTimeout(() => {
        document.getElementById('newPageTitle')?.focus();
    }, 100);
}

function closeCreatePageModal() {
    const modal = document.getElementById('createPageModal');
    if (modal) {
        modal.remove();
    }
}

function confirmCreatePage(folderId) {
    const titleInput = document.getElementById('newPageTitle');
    const templateSelect = document.getElementById('newPageTemplate');
    
    const title = titleInput?.value.trim();
    const template = templateSelect?.value;
    
    if (!title) {
        showToast('请输入页面标题', 'error');
        return;
    }
    
    // 生成新页面 ID
    const newId = Math.max(...getAllPageIds()) + 1;
    
    // 创建新页面
    const newPage = {
        id: newId,
        title: title,
        type: 'page',
        parentId: folderId,
        content: '',
        updatedAt: new Date().toISOString().split('T')[0],
        author: '张三',
        views: 0
    };
    
    // 添加到文件夹
    const folder = findPageById(folderId);
    if (folder && folder.children) {
        folder.children.push(newPage);
    }
    
    // 设置模板内容
    pageContents[newId] = getTemplateContent(template, title);
    
    closeCreatePageModal();
    
    // 展开文件夹并加载新页面
    folder.expanded = true;
    renderPageTree();
    loadPage(newId);
    
    showToast('页面创建成功', 'success');
}

function getAllPageIds(pages = WikiData.pages) {
    let ids = [];
    for (const page of pages) {
        ids.push(page.id);
        if (page.children) {
            ids = ids.concat(getAllPageIds(page.children));
        }
    }
    return ids;
}

function getTemplateContent(template, title) {
    switch (template) {
        case 'doc':
            return `
                <h2>概述</h2>
                <p>在这里描述文档的主要内容...</p>
                
                <h2>详细说明</h2>
                <p>详细的说明内容...</p>
                
                <h2>相关链接</h2>
                <ul>
                    <li>链接1</li>
                    <li>链接2</li>
                </ul>
            `;
        case 'api':
            return `
                <h2>接口说明</h2>
                <p>接口的基本描述...</p>
                
                <h2>请求参数</h2>
                <table>
                    <tr><th>参数名</th><th>类型</th><th>必填</th><th>说明</th></tr>
                    <tr><td>param1</td><td>string</td><td>是</td><td>参数说明</td></tr>
                </table>
                
                <h2>响应示例</h2>
                <pre><code>{
    "code": 0,
    "message": "success",
    "data": {}
}</code></pre>
            `;
        case 'guide':
            return `
                <h2>前提条件</h2>
                <p>在开始之前，请确保...</p>
                
                <h2>步骤一</h2>
                <p>第一步的操作说明...</p>
                
                <h2>步骤二</h2>
                <p>第二步的操作说明...</p>
                
                <h2>常见问题</h2>
                <p>可能遇到的问题及解决方案...</p>
            `;
        default:
            return `<h2>${title}</h2><p>开始编写内容...</p>`;
    }
}

function createSubFolder(parentId) {
    removeContextMenu();
    
    const folderName = prompt('请输入目录名称：');
    if (!folderName || !folderName.trim()) return;
    
    const newId = Math.max(...getAllPageIds()) + 1;
    
    const newFolder = {
        id: newId,
        title: folderName.trim(),
        type: 'folder',
        expanded: false,
        children: []
    };
    
    const parent = findPageById(parentId);
    if (parent && parent.children) {
        parent.children.push(newFolder);
    }
    
    parent.expanded = true;
    renderPageTree();
    
    showToast('目录创建成功', 'success');
}

// ==================== 页面删除 ====================
function deletePage(pageId) {
    removeContextMenu();
    
    const page = findPageById(pageId);
    if (!page) return;
    
    if (!confirm(`确定要删除页面 "${page.title}" 吗？此操作不可恢复。`)) {
        return;
    }
    
    // 从父文件夹中移除
    const parent = findParentFolder(pageId);
    if (parent && parent.children) {
        parent.children = parent.children.filter(p => p.id !== pageId);
    }
    
    // 删除内容
    delete pageContents[pageId];
    
    // 如果删除的是当前页面，加载其他页面
    if (WikiData.currentPage && WikiData.currentPage.id === pageId) {
        WikiData.currentPage = null;
        const firstPage = findFirstPage();
        if (firstPage) {
            loadPage(firstPage.id);
        }
    }
    
    renderPageTree();
    showToast('页面已删除', 'success');
}

function deleteFolder(folderId) {
    removeContextMenu();
    
    const folder = findPageById(folderId);
    if (!folder) return;
    
    const childCount = folder.children ? folder.children.length : 0;
    
    if (!confirm(`确定要删除目录 "${folder.title}" 吗？${childCount > 0 ? `该目录下有 ${childCount} 个页面也将被删除。` : ''}此操作不可恢复。`)) {
        return;
    }
    
    // 从顶层移除
    WikiData.pages = WikiData.pages.filter(p => p.id !== folderId);
    
    // 删除所有子页面内容
    if (folder.children) {
        folder.children.forEach(child => {
            delete pageContents[child.id];
        });
    }
    
    renderPageTree();
    
    // 如果当前页面在被删除的目录中，加载其他页面
    if (WikiData.currentPage && folder.children?.some(c => c.id === WikiData.currentPage.id)) {
        WikiData.currentPage = null;
        const firstPage = findFirstPage();
        if (firstPage) {
            loadPage(firstPage.id);
        }
    }
    
    showToast('目录已删除', 'success');
}

function renameFolder(folderId) {
    removeContextMenu();
    
    const folder = findPageById(folderId);
    if (!folder) return;
    
    const newName = prompt('请输入新的目录名称：', folder.title);
    if (!newName || !newName.trim() || newName.trim() === folder.title) return;
    
    folder.title = newName.trim();
    renderPageTree();
    
    showToast('目录已重命名', 'success');
}

function findFirstPage(pages = WikiData.pages) {
    for (const page of pages) {
        if (page.type === 'page') return page;
        if (page.children) {
            const found = findFirstPage(page.children);
            if (found) return found;
        }
    }
    return null;
}

// ==================== 搜索功能 ====================
function initWikiSearch() {
    const searchInput = document.querySelector('.wiki-search input');
    if (!searchInput) return;
    
    searchInput.addEventListener('input', debounce(function() {
        const query = this.value.trim().toLowerCase();
        if (query.length < 2) {
            renderPageTree();
            return;
        }
        
        searchPages(query);
    }, 300));
}

function searchPages(query) {
    const results = [];
    
    function searchInPages(pages) {
        for (const page of pages) {
            if (page.title.toLowerCase().includes(query)) {
                results.push(page);
            }
            if (page.children) {
                searchInPages(page.children);
            }
        }
    }
    
    searchInPages(WikiData.pages);
    
    WikiData.searchResults = results;
    renderSearchResults(results, query);
}

function renderSearchResults(results, query) {
    const treeContainer = document.querySelector('.wiki-tree');
    if (!treeContainer) return;
    
    if (results.length === 0) {
        treeContainer.innerHTML = `
            <div class="search-empty">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                    <circle cx="11" cy="11" r="8"/>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <p>未找到匹配 "${query}" 的页面</p>
            </div>
        `;
        return;
    }
    
    treeContainer.innerHTML = `
        <div class="search-results-header">
            找到 ${results.length} 个结果
        </div>
        ${results.map(page => `
            <div class="tree-item search-result" data-id="${page.id}" data-type="page">
                <div class="tree-item-header" onclick="loadPage(${page.id})">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                    </svg>
                    <span>${highlightText(page.title, query)}</span>
                </div>
            </div>
        `).join('')}
    `;
}

function highlightText(text, query) {
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
}

// ==================== 其他功能 ====================
function copyPageLink(pageId) {
    removeContextMenu();
    
    const page = findPageById(pageId);
    if (!page) return;
    
    const link = `${window.location.origin}/wiki/${pageId}`;
    
    navigator.clipboard.writeText(link).then(() => {
        showToast('链接已复制到剪贴板', 'success');
    }).catch(() => {
        showToast('复制失败，请手动复制', 'error');
    });
}

function showPageHistory(pageId) {
    removeContextMenu();
    
    const history = WikiData.pageHistory.filter(h => h.pageId === pageId);
    
    if (history.length === 0) {
        showToast('暂无历史版本', 'info');
        return;
    }
    
    // 显示历史版本弹窗
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'historyModal';
    modal.innerHTML = `
        <div class="modal">
            <div class="modal-header">
                <h3>历史版本</h3>
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            </div>
            <div class="modal-body">
                <div class="history-list">
                    ${history.map((h, index) => `
                        <div class="history-item">
                            <div class="history-info">
                                <span class="history-version">版本 ${history.length - index}</span>
                                <span class="history-time">${new Date(h.savedAt).toLocaleString()}</span>
                                <span class="history-author">${h.author}</span>
                            </div>
                            <button class="btn btn-sm btn-outline" onclick="restoreVersion(${pageId}, ${index})">恢复</button>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.classList.add('active');
}

function restoreVersion(pageId, historyIndex) {
    const history = WikiData.pageHistory.filter(h => h.pageId === pageId);
    const version = history[historyIndex];
    
    if (!version) return;
    
    if (confirm('确定要恢复到此版本吗？当前内容将被覆盖。')) {
        pageContents[pageId] = markdownToHtml(version.content);
        
        document.getElementById('historyModal')?.remove();
        loadPage(pageId);
        
        showToast('已恢复到历史版本', 'success');
    }
}

function exportPage(pageId) {
    removeContextMenu();
    
    const page = findPageById(pageId);
    if (!page) return;
    
    const content = pageContents[pageId] || '';
    const markdown = htmlToMarkdown(content);
    
    // 创建下载
    const blob = new Blob([`# ${page.title}\n\n${markdown}`], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${page.title}.md`;
    a.click();
    URL.revokeObjectURL(url);
    
    showToast('页面已导出', 'success');
}

function enableTitleEdit() {
    if (!WikiData.currentPage) return;
    
    const titleElement = document.querySelector('.wiki-page-title');
    if (!titleElement) return;
    
    const currentTitle = WikiData.currentPage.title;
    
    titleElement.innerHTML = `<input type="text" class="title-edit-input" value="${currentTitle}" onblur="saveTitleEdit(this)" onkeydown="if(event.key==='Enter')this.blur()">`;
    
    const input = titleElement.querySelector('input');
    input.focus();
    input.select();
}

function saveTitleEdit(input) {
    const newTitle = input.value.trim();
    
    if (newTitle && newTitle !== WikiData.currentPage.title) {
        WikiData.currentPage.title = newTitle;
        WikiData.currentPage.updatedAt = new Date().toISOString().split('T')[0];
        
        renderPageTree();
        updateBreadcrumb(WikiData.currentPage);
        
        showToast('标题已更新', 'success');
    }
    
    updatePageTitle(WikiData.currentPage);
}

// ==================== 反馈功能 ====================
function bindWikiEvents() {
    // 反馈按钮
    document.querySelectorAll('.feedback-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const isHelpful = this.querySelector('svg path[d*="14 9"]') !== null;
            
            document.querySelectorAll('.feedback-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            showToast(isHelpful ? '感谢您的反馈！' : '感谢您的反馈，我们会继续改进！', 'success');
        });
    });
    
    // 新建文档按钮
    const newDocBtn = document.querySelector('.panel-header .btn');
    if (newDocBtn) {
        newDocBtn.addEventListener('click', function() {
            // 在第一个文件夹中创建
            if (WikiData.pages.length > 0) {
                showCreatePageModal(WikiData.pages[0].id);
            }
        });
    }
    
    // 编辑按钮
    const editBtn = document.querySelector('.wiki-actions .btn');
    if (editBtn) {
        editBtn.addEventListener('click', function() {
            if (WikiData.currentPage) {
                editPage(WikiData.currentPage.id);
            }
        });
    }
}

function bindCodeCopyButtons() {
    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const codeBlock = this.closest('.wiki-code-block');
            const code = codeBlock?.querySelector('code')?.textContent;
            
            if (code) {
                navigator.clipboard.writeText(code).then(() => {
                    this.textContent = '已复制';
                    setTimeout(() => {
                        this.textContent = '复制';
                    }, 2000);
                });
            }
        });
    });
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
    // 使用全局 showToast 或创建简单版本
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
const wikiStyles = document.createElement('style');
wikiStyles.textContent = `
    /* 树节点操作按钮 */
    .tree-action-btn {
        opacity: 0;
        padding: 4px;
        background: none;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        color: var(--text-secondary);
        transition: all 0.2s;
    }
    
    .tree-item-header:hover .tree-action-btn {
        opacity: 1;
    }
    
    .tree-action-btn:hover {
        background: var(--bg-light);
        color: var(--primary-color);
    }
    
    /* 右键菜单 */
    .wiki-context-menu {
        position: fixed;
        background: #fff;
        border: 1px solid var(--border-light);
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        padding: 8px 0;
        min-width: 180px;
        z-index: 10000;
    }
    
    .context-menu-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 16px;
        font-size: 13px;
        color: var(--text-primary);
        cursor: pointer;
        transition: background 0.2s;
    }
    
    .context-menu-item:hover {
        background: var(--bg-light);
    }
    
    .context-menu-item.danger {
        color: #ef4444;
    }
    
    .context-menu-item.danger:hover {
        background: rgba(239, 68, 68, 0.1);
    }
    
    .context-menu-divider {
        height: 1px;
        background: var(--border-light);
        margin: 8px 0;
    }
    
    /* 编辑器样式 */
    .wiki-editor {
        display: flex;
        flex-direction: column;
        height: 100%;
    }
    
    .editor-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 24px;
        border-bottom: 1px solid var(--border-light);
    }
    
    .editor-title-input {
        font-size: 24px;
        font-weight: 600;
        border: none;
        outline: none;
        width: 100%;
        max-width: 500px;
    }
    
    .editor-actions {
        display: flex;
        gap: 12px;
    }
    
    .editor-toolbar {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 12px 24px;
        border-bottom: 1px solid var(--border-light);
        background: var(--bg-light);
    }
    
    .toolbar-btn {
        padding: 8px;
        background: none;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        color: var(--text-secondary);
        font-size: 12px;
        font-weight: 600;
        transition: all 0.2s;
    }
    
    .toolbar-btn:hover {
        background: #fff;
        color: var(--primary-color);
    }
    
    .toolbar-divider {
        width: 1px;
        height: 20px;
        background: var(--border-light);
        margin: 0 8px;
    }
    
    .editor-content {
        flex: 1;
        padding: 24px;
        overflow: hidden;
    }
    
    .editor-textarea {
        width: 100%;
        height: 100%;
        border: none;
        outline: none;
        resize: none;
        font-family: 'JetBrains Mono', monospace;
        font-size: 14px;
        line-height: 1.8;
    }
    
    .editor-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 24px;
        border-top: 1px solid var(--border-light);
        font-size: 12px;
        color: var(--text-secondary);
    }
    
    /* 搜索结果 */
    .search-empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 40px 20px;
        color: var(--text-secondary);
    }
    
    .search-empty svg {
        margin-bottom: 16px;
        opacity: 0.5;
    }
    
    .search-results-header {
        padding: 8px 12px;
        font-size: 12px;
        color: var(--text-secondary);
        border-bottom: 1px solid var(--border-light);
        margin-bottom: 8px;
    }
    
    .search-result mark {
        background: rgba(43, 125, 233, 0.2);
        color: var(--primary-color);
        padding: 0 2px;
        border-radius: 2px;
    }
    
    /* 历史版本 */
    .history-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }
    
    .history-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 16px;
        background: var(--bg-light);
        border-radius: 8px;
    }
    
    .history-info {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }
    
    .history-version {
        font-weight: 500;
        color: var(--text-primary);
    }
    
    .history-time,
    .history-author {
        font-size: 12px;
        color: var(--text-secondary);
    }
    
    /* 标题编辑 */
    .title-edit-input {
        font-size: 28px;
        font-weight: 700;
        border: none;
        border-bottom: 2px solid var(--primary-color);
        outline: none;
        width: 100%;
        padding: 4px 0;
    }
    
    /* 反馈按钮激活状态 */
    .feedback-btn.active {
        background: var(--primary-light);
        border-color: var(--primary-color);
        color: var(--primary-color);
    }
    
    /* 模态框激活 */
    .modal-overlay.active {
        display: flex;
    }
`;
document.head.appendChild(wikiStyles);