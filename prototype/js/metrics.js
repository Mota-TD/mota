/**
 * 摩塔 Mota - 效能洞察模块
 * 效能度量页面的交互功能
 */

// ==================== 数据模型 ====================
const MetricsData = {
    // 当前选中的日期范围
    currentDateRange: '7d',
    
    // 当前选中的迭代
    currentIteration: 'sprint-12',
    
    // 迭代列表
    iterations: [
        { id: 'sprint-12', name: 'Sprint 12 (当前)', startDate: '2024-01-08', endDate: '2024-01-21', status: 'active' },
        { id: 'sprint-11', name: 'Sprint 11', startDate: '2023-12-25', endDate: '2024-01-07', status: 'completed' },
        { id: 'sprint-10', name: 'Sprint 10', startDate: '2023-12-11', endDate: '2023-12-24', status: 'completed' }
    ],
    
    // DORA 指标数据
    doraMetrics: {
        '7d': {
            deploymentFrequency: { value: 12.5, unit: '次/天', trend: 15, level: 'elite' },
            leadTime: { value: 2.3, unit: '小时', trend: -20, level: 'elite' },
            changeFailRate: { value: 3.2, unit: '%', trend: -8, level: 'high' },
            mttr: { value: 45, unit: '分钟', trend: -30, level: 'elite' }
        },
        '30d': {
            deploymentFrequency: { value: 10.8, unit: '次/天', trend: 8, level: 'elite' },
            leadTime: { value: 3.1, unit: '小时', trend: -15, level: 'high' },
            changeFailRate: { value: 4.5, unit: '%', trend: -5, level: 'high' },
            mttr: { value: 52, unit: '分钟', trend: -18, level: 'elite' }
        },
        '90d': {
            deploymentFrequency: { value: 8.2, unit: '次/天', trend: 12, level: 'high' },
            leadTime: { value: 4.2, unit: '小时', trend: -10, level: 'high' },
            changeFailRate: { value: 5.8, unit: '%', trend: -12, level: 'medium' },
            mttr: { value: 68, unit: '分钟', trend: -22, level: 'high' }
        }
    },
    
    // 代码质量数据
    codeQuality: {
        '7d': {
            coverage: { value: 78.5, target: 80, status: 'warning' },
            duplication: { value: 4.2, target: 5, status: 'good' },
            technicalDebt: { value: 12.3, unit: '天', status: 'warning' },
            codeSmells: { value: 156, status: 'warning' }
        },
        '30d': {
            coverage: { value: 75.2, target: 80, status: 'warning' },
            duplication: { value: 5.1, target: 5, status: 'warning' },
            technicalDebt: { value: 15.8, unit: '天', status: 'warning' },
            codeSmells: { value: 189, status: 'warning' }
        },
        '90d': {
            coverage: { value: 72.8, target: 80, status: 'bad' },
            duplication: { value: 6.3, target: 5, status: 'bad' },
            technicalDebt: { value: 22.5, unit: '天', status: 'bad' },
            codeSmells: { value: 245, status: 'bad' }
        }
    },
    
    // 构建统计数据
    buildStats: {
        '7d': {
            total: 342,
            success: 312,
            failed: 30,
            successRate: 91.2,
            avgDuration: 4.5,
            dailyData: [
                { day: '周一', success: 85, failed: 15 },
                { day: '周二', success: 92, failed: 8 },
                { day: '周三', success: 88, failed: 12 },
                { day: '周四', success: 95, failed: 5 },
                { day: '周五', success: 90, failed: 10 },
                { day: '周六', success: 45, failed: 5 },
                { day: '周日', success: 38, failed: 2 }
            ]
        },
        '30d': {
            total: 1256,
            success: 1123,
            failed: 133,
            successRate: 89.4,
            avgDuration: 5.2,
            dailyData: [
                { day: '第1周', success: 280, failed: 32 },
                { day: '第2周', success: 295, failed: 28 },
                { day: '第3周', success: 268, failed: 38 },
                { day: '第4周', success: 280, failed: 35 }
            ]
        },
        '90d': {
            total: 3845,
            success: 3412,
            failed: 433,
            successRate: 88.7,
            avgDuration: 5.8,
            dailyData: [
                { day: '第1月', success: 1050, failed: 125 },
                { day: '第2月', success: 1180, failed: 148 },
                { day: '第3月', success: 1182, failed: 160 }
            ]
        }
    },
    
    // 事项统计数据
    issueStats: {
        '7d': {
            total: 156,
            completed: 78,
            inProgress: 47,
            pending: 31,
            byType: {
                requirement: 45,
                task: 68,
                bug: 43
            },
            avgCycleTime: 3.2
        },
        '30d': {
            total: 423,
            completed: 245,
            inProgress: 112,
            pending: 66,
            byType: {
                requirement: 128,
                task: 185,
                bug: 110
            },
            avgCycleTime: 4.1
        },
        '90d': {
            total: 1256,
            completed: 892,
            inProgress: 234,
            pending: 130,
            byType: {
                requirement: 378,
                task: 545,
                bug: 333
            },
            avgCycleTime: 4.8
        }
    },
    
    // 团队贡献数据
    teamContribution: {
        '7d': [
            { id: 1, name: '张三', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1', commits: 45, additions: 2345, deletions: 567, reviews: 12 },
            { id: 2, name: '李四', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2', commits: 38, additions: 1890, deletions: 423, reviews: 8 },
            { id: 3, name: '王五', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3', commits: 32, additions: 1567, deletions: 289, reviews: 15 },
            { id: 4, name: '赵六', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=4', commits: 28, additions: 1234, deletions: 156, reviews: 6 },
            { id: 5, name: '钱七', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=5', commits: 22, additions: 987, deletions: 234, reviews: 10 }
        ],
        '30d': [
            { id: 1, name: '张三', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1', commits: 156, additions: 8234, deletions: 2345, reviews: 45 },
            { id: 2, name: '李四', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2', commits: 142, additions: 7123, deletions: 1890, reviews: 38 },
            { id: 3, name: '王五', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3', commits: 128, additions: 6234, deletions: 1567, reviews: 52 },
            { id: 4, name: '赵六', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=4', commits: 98, additions: 4567, deletions: 987, reviews: 28 },
            { id: 5, name: '钱七', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=5', commits: 85, additions: 3890, deletions: 756, reviews: 35 }
        ],
        '90d': [
            { id: 1, name: '张三', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1', commits: 456, additions: 24567, deletions: 8234, reviews: 128 },
            { id: 2, name: '李四', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2', commits: 412, additions: 21234, deletions: 7123, reviews: 112 },
            { id: 3, name: '王五', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3', commits: 378, additions: 18567, deletions: 6234, reviews: 145 },
            { id: 4, name: '赵六', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=4', commits: 298, additions: 13456, deletions: 4567, reviews: 85 },
            { id: 5, name: '钱七', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=5', commits: 256, additions: 11234, deletions: 3890, reviews: 98 }
        ]
    },
    
    // 燃尽图数据
    burndownData: {
        'sprint-12': {
            totalPoints: 100,
            dates: ['1/8', '1/9', '1/10', '1/11', '1/12', '1/13', '1/14', '1/15', '1/16', '1/17', '1/18', '1/19', '1/20', '1/21'],
            ideal: [100, 92.86, 85.71, 78.57, 71.43, 64.29, 57.14, 50, 42.86, 35.71, 28.57, 21.43, 14.29, 0],
            actual: [100, 95, 88, 82, 75, 68, 62, 55, null, null, null, null, null, null],
            remaining: 55
        },
        'sprint-11': {
            totalPoints: 85,
            dates: ['12/25', '12/26', '12/27', '12/28', '12/29', '12/30', '12/31', '1/1', '1/2', '1/3', '1/4', '1/5', '1/6', '1/7'],
            ideal: [85, 78.93, 72.86, 66.79, 60.71, 54.64, 48.57, 42.5, 36.43, 30.36, 24.29, 18.21, 12.14, 0],
            actual: [85, 80, 72, 65, 58, 52, 45, 38, 32, 25, 18, 12, 5, 0],
            remaining: 0
        },
        'sprint-10': {
            totalPoints: 92,
            dates: ['12/11', '12/12', '12/13', '12/14', '12/15', '12/16', '12/17', '12/18', '12/19', '12/20', '12/21', '12/22', '12/23', '12/24'],
            ideal: [92, 85.43, 78.86, 72.29, 65.71, 59.14, 52.57, 46, 39.43, 32.86, 26.29, 19.71, 13.14, 0],
            actual: [92, 88, 82, 75, 68, 60, 52, 45, 38, 30, 22, 15, 8, 3],
            remaining: 3
        }
    }
};

// ==================== 页面初始化 ====================
document.addEventListener('DOMContentLoaded', function() {
    initMetricsPage();
});

function initMetricsPage() {
    // 初始化日期范围选择器
    initDateRangePicker();
    
    // 初始化迭代选择器
    initIterationSelector();
    
    // 加载所有数据
    loadAllMetrics();
    
    // 初始化导出功能
    initExportButton();
    
    // 初始化刷新功能
    initRefreshButton();
    
    // 初始化图表交互
    initChartInteractions();
    
    // 初始化自定义日期选择器
    initCustomDatePicker();
    
    console.log('效能洞察模块已加载');
}

// ==================== 日期范围选择 ====================
function initDateRangePicker() {
    const dateButtons = document.querySelectorAll('.date-range-picker .date-btn:not(.custom)');
    
    dateButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            // 移除其他按钮的 active 状态
            dateButtons.forEach(b => b.classList.remove('active'));
            // 添加当前按钮的 active 状态
            this.classList.add('active');
            
            // 获取日期范围
            const text = this.textContent.trim();
            let range = '7d';
            if (text.includes('30')) range = '30d';
            else if (text.includes('90')) range = '90d';
            
            MetricsData.currentDateRange = range;
            
            // 重新加载数据
            loadAllMetrics();
            
            showToast(`已切换到${text}数据`);
        });
    });
}

function initCustomDatePicker() {
    const customBtn = document.querySelector('.date-range-picker .date-btn.custom');
    if (customBtn) {
        customBtn.addEventListener('click', function() {
            openCustomDateModal();
        });
    }
}

function openCustomDateModal() {
    // 创建自定义日期选择弹窗
    let modal = document.getElementById('customDateModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'customDateModal';
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal" style="max-width: 400px;">
                <div class="modal-header">
                    <h3>自定义日期范围</h3>
                    <button class="modal-close" onclick="closeCustomDateModal()">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>开始日期</label>
                        <input type="date" id="customStartDate" class="form-input">
                    </div>
                    <div class="form-group">
                        <label>结束日期</label>
                        <input type="date" id="customEndDate" class="form-input">
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="closeCustomDateModal()">取消</button>
                    <button class="btn btn-primary" onclick="applyCustomDateRange()">应用</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    // 设置默认日期
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    document.getElementById('customEndDate').value = today.toISOString().split('T')[0];
    document.getElementById('customStartDate').value = weekAgo.toISOString().split('T')[0];
    
    modal.classList.add('active');
}

function closeCustomDateModal() {
    const modal = document.getElementById('customDateModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

function applyCustomDateRange() {
    const startDate = document.getElementById('customStartDate').value;
    const endDate = document.getElementById('customEndDate').value;
    
    if (!startDate || !endDate) {
        showToast('请选择开始和结束日期', 'error');
        return;
    }
    
    if (new Date(startDate) > new Date(endDate)) {
        showToast('开始日期不能晚于结束日期', 'error');
        return;
    }
    
    // 更新按钮状态
    document.querySelectorAll('.date-range-picker .date-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector('.date-range-picker .date-btn.custom').classList.add('active');
    
    closeCustomDateModal();
    showToast(`已应用自定义日期范围: ${startDate} 至 ${endDate}`);
    
    // 这里可以根据自定义日期范围加载数据
    loadAllMetrics();
}

// ==================== 迭代选择 ====================
function initIterationSelector() {
    const iterationSelect = document.querySelector('.iteration-select');
    if (iterationSelect) {
        // 清空并重新填充选项
        iterationSelect.innerHTML = '';
        MetricsData.iterations.forEach(iteration => {
            const option = document.createElement('option');
            option.value = iteration.id;
            option.textContent = iteration.name;
            if (iteration.id === MetricsData.currentIteration) {
                option.selected = true;
            }
            iterationSelect.appendChild(option);
        });
        
        iterationSelect.addEventListener('change', function() {
            MetricsData.currentIteration = this.value;
            loadBurndownChart();
            showToast(`已切换到 ${this.options[this.selectedIndex].text}`);
        });
    }
}

// ==================== 加载所有指标 ====================
function loadAllMetrics() {
    loadDORAMetrics();
    loadCodeQuality();
    loadBuildStats();
    loadIssueStats();
    loadTeamContribution();
    loadBurndownChart();
}

// ==================== DORA 指标 ====================
function loadDORAMetrics() {
    const range = MetricsData.currentDateRange;
    const data = MetricsData.doraMetrics[range];
    
    if (!data) return;
    
    // 更新部署频率
    updateDORACard('deployment', data.deploymentFrequency);
    
    // 更新变更前置时间
    updateDORACard('leadtime', data.leadTime);
    
    // 更新变更失败率
    updateDORACard('changefail', data.changeFailRate);
    
    // 更新平均恢复时间
    updateDORACard('mttr', data.mttr);
}

function updateDORACard(type, data) {
    const card = document.querySelector(`.dora-icon.${type}`)?.closest('.dora-card');
    if (!card) return;
    
    const valueEl = card.querySelector('.dora-value');
    const trendEl = card.querySelector('.dora-trend');
    const levelEl = card.querySelector('.dora-level');
    
    if (valueEl) {
        animateNumber(valueEl, parseFloat(data.value), data.unit);
    }
    
    if (trendEl) {
        const trendValue = data.trend;
        const isPositive = trendValue > 0;
        const isGood = (type === 'deployment' && isPositive) || 
                       (type !== 'deployment' && !isPositive);
        
        trendEl.className = `dora-trend ${isGood ? 'down' : 'up'}`;
        trendEl.innerHTML = `
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                ${isPositive ? 
                    '<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>' :
                    '<polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/>'
                }
            </svg>
            ${isPositive ? '+' : ''}${trendValue}% 较上周
        `;
    }
    
    if (levelEl) {
        const levelLabels = { elite: '精英', high: '高效', medium: '中等', low: '低效' };
        levelEl.className = `dora-level ${data.level}`;
        levelEl.textContent = levelLabels[data.level] || data.level;
    }
}

// ==================== 代码质量 ====================
function loadCodeQuality() {
    const range = MetricsData.currentDateRange;
    const data = MetricsData.codeQuality[range];
    
    if (!data) return;
    
    const qualityItems = document.querySelectorAll('.quality-item');
    const metrics = [
        { label: '代码覆盖率', value: data.coverage.value, unit: '%', barWidth: data.coverage.value, color: getStatusColor(data.coverage.status) },
        { label: '代码重复率', value: data.duplication.value, unit: '%', barWidth: data.duplication.value * 10, color: getStatusColor(data.duplication.status) },
        { label: '技术债务', value: data.technicalDebt.value, unit: ' 天', barWidth: Math.min(data.technicalDebt.value * 4, 100), color: getStatusColor(data.technicalDebt.status) },
        { label: '代码异味', value: data.codeSmells.value, unit: ' 个', barWidth: Math.min(data.codeSmells.value / 5, 100), color: getStatusColor(data.codeSmells.status) }
    ];
    
    qualityItems.forEach((item, index) => {
        if (metrics[index]) {
            const valueEl = item.querySelector('.quality-value');
            const barFill = item.querySelector('.bar-fill');
            
            if (valueEl) {
                valueEl.textContent = metrics[index].value + metrics[index].unit;
            }
            
            if (barFill) {
                barFill.style.width = metrics[index].barWidth + '%';
                barFill.style.background = metrics[index].color;
            }
        }
    });
}

function getStatusColor(status) {
    const colors = {
        good: '#22c55e',
        warning: '#f59e0b',
        bad: '#ef4444'
    };
    return colors[status] || colors.warning;
}

// ==================== 构建统计 ====================
function loadBuildStats() {
    const range = MetricsData.currentDateRange;
    const data = MetricsData.buildStats[range];
    
    if (!data) return;
    
    // 更新汇总数据
    const summaryItems = document.querySelectorAll('.build-summary .summary-item');
    if (summaryItems.length >= 3) {
        animateNumber(summaryItems[0].querySelector('.summary-value'), data.total, '');
        animateNumber(summaryItems[1].querySelector('.summary-value'), data.success, '');
        animateNumber(summaryItems[2].querySelector('.summary-value'), data.failed, '');
    }
    
    // 更新图表
    const chartContainer = document.querySelector('.build-chart');
    if (chartContainer) {
        chartContainer.innerHTML = data.dailyData.map(item => `
            <div class="chart-row">
                <span class="chart-label">${item.day}</span>
                <div class="chart-bar-wrapper">
                    <div class="chart-bar success" style="width: ${(item.success / (item.success + item.failed)) * 100}%"></div>
                    <div class="chart-bar failed" style="width: ${(item.failed / (item.success + item.failed)) * 100}%"></div>
                </div>
                <span class="chart-value" style="font-size: 11px; color: var(--text-secondary); margin-left: 8px;">${item.success + item.failed}</span>
            </div>
        `).join('');
    }
}

// ==================== 事项统计 ====================
function loadIssueStats() {
    const range = MetricsData.currentDateRange;
    const data = MetricsData.issueStats[range];
    
    if (!data) return;
    
    // 更新环形图中心数据
    const donutValue = document.querySelector('.donut-value');
    if (donutValue) {
        animateNumber(donutValue, data.total, '');
    }
    
    // 更新图例数据
    const legendItems = document.querySelectorAll('.issue-legend .legend-item');
    const legendData = [
        { value: data.completed, color: '#22c55e' },
        { value: data.inProgress, color: '#3b82f6' },
        { value: data.pending, color: '#f59e0b' }
    ];
    
    legendItems.forEach((item, index) => {
        if (legendData[index]) {
            const valueEl = item.querySelector('.legend-value');
            if (valueEl) {
                animateNumber(valueEl, legendData[index].value, '');
            }
        }
    });
    
    // 更新环形图 SVG
    updateDonutChart(data);
}

function updateDonutChart(data) {
    const svg = document.querySelector('.issue-donut svg');
    if (!svg) return;
    
    const total = data.total;
    const completed = data.completed;
    const inProgress = data.inProgress;
    const pending = data.pending;
    
    const circumference = 2 * Math.PI * 40; // r = 40
    
    const completedDash = (completed / total) * circumference;
    const inProgressDash = (inProgress / total) * circumference;
    const pendingDash = (pending / total) * circumference;
    
    const circles = svg.querySelectorAll('circle');
    if (circles.length >= 4) {
        // 已完成
        circles[1].setAttribute('stroke-dasharray', `${completedDash} ${circumference}`);
        circles[1].setAttribute('stroke-dashoffset', '0');
        
        // 进行中
        circles[2].setAttribute('stroke-dasharray', `${inProgressDash} ${circumference}`);
        circles[2].setAttribute('stroke-dashoffset', `-${completedDash}`);
        
        // 待处理
        circles[3].setAttribute('stroke-dasharray', `${pendingDash} ${circumference}`);
        circles[3].setAttribute('stroke-dashoffset', `-${completedDash + inProgressDash}`);
    }
}

// ==================== 团队贡献 ====================
function loadTeamContribution() {
    const range = MetricsData.currentDateRange;
    const data = MetricsData.teamContribution[range];
    
    if (!data) return;
    
    const contributionList = document.querySelector('.contribution-list');
    if (!contributionList) return;
    
    contributionList.innerHTML = data.slice(0, 5).map((member, index) => `
        <div class="contribution-item" data-member-id="${member.id}" onclick="showMemberDetail(${member.id})">
            <div class="contributor-info">
                <span class="rank-badge" style="
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    font-size: 11px;
                    font-weight: 600;
                    margin-right: 8px;
                    ${index === 0 ? 'background: #fef3c7; color: #d97706;' : 
                      index === 1 ? 'background: #e5e7eb; color: #6b7280;' : 
                      index === 2 ? 'background: #fed7aa; color: #c2410c;' : 
                      'background: var(--bg-light); color: var(--text-secondary);'}
                ">${index + 1}</span>
                <img src="${member.avatar}" alt="${member.name}">
                <span class="contributor-name">${member.name}</span>
            </div>
            <div class="contribution-stats">
                <span class="stat commits">${member.commits} 提交</span>
                <span class="stat additions">+${formatNumber(member.additions)}</span>
                <span class="stat deletions">-${formatNumber(member.deletions)}</span>
            </div>
        </div>
    `).join('');
}

function showMemberDetail(memberId) {
    const range = MetricsData.currentDateRange;
    const member = MetricsData.teamContribution[range].find(m => m.id === memberId);
    
    if (!member) return;
    
    // 创建成员详情弹窗
    let modal = document.getElementById('memberDetailModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'memberDetailModal';
        modal.className = 'modal-overlay';
        document.body.appendChild(modal);
    }
    
    modal.innerHTML = `
        <div class="modal" style="max-width: 500px;">
            <div class="modal-header">
                <h3>成员贡献详情</h3>
                <button class="modal-close" onclick="closeMemberDetailModal()">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            </div>
            <div class="modal-body">
                <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 24px;">
                    <img src="${member.avatar}" alt="${member.name}" style="width: 64px; height: 64px; border-radius: 50%;">
                    <div>
                        <h4 style="font-size: 18px; font-weight: 600; margin-bottom: 4px;">${member.name}</h4>
                        <p style="color: var(--text-secondary); font-size: 14px;">团队成员</p>
                    </div>
                </div>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">
                    <div style="padding: 16px; background: var(--bg-light); border-radius: var(--radius-md);">
                        <div style="font-size: 24px; font-weight: 600; color: var(--text-primary);">${member.commits}</div>
                        <div style="font-size: 13px; color: var(--text-secondary);">代码提交</div>
                    </div>
                    <div style="padding: 16px; background: var(--bg-light); border-radius: var(--radius-md);">
                        <div style="font-size: 24px; font-weight: 600; color: #22c55e;">+${formatNumber(member.additions)}</div>
                        <div style="font-size: 13px; color: var(--text-secondary);">新增代码行</div>
                    </div>
                    <div style="padding: 16px; background: var(--bg-light); border-radius: var(--radius-md);">
                        <div style="font-size: 24px; font-weight: 600; color: #ef4444;">-${formatNumber(member.deletions)}</div>
                        <div style="font-size: 13px; color: var(--text-secondary);">删除代码行</div>
                    </div>
                    <div style="padding: 16px; background: var(--bg-light); border-radius: var(--radius-md);">
                        <div style="font-size: 24px; font-weight: 600; color: #3b82f6;">${member.reviews}</div>
                        <div style="font-size: 13px; color: var(--text-secondary);">代码审查</div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeMemberDetailModal()">关闭</button>
                <button class="btn btn-primary" onclick="window.location.href='members.html'">查看成员主页</button>
            </div>
        </div>
    `;
    
    modal.classList.add('active');
}

function closeMemberDetailModal() {
    const modal = document.getElementById('memberDetailModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// ==================== 燃尽图 ====================
function loadBurndownChart() {
    const iterationId = MetricsData.currentIteration;
    const data = MetricsData.burndownData[iterationId];
    
    if (!data) return;
    
    const chartArea = document.querySelector('.chart-area');
    const xAxis = document.querySelector('.chart-x-axis');
    
    if (!chartArea || !xAxis) return;
    
    // 更新 X 轴标签
    xAxis.innerHTML = data.dates.map(date => `<span>${date}</span>`).join('');
    
    // 计算 SVG 路径
    const width = 400;
    const height = 200;
    const padding = 10;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    
    const pointCount = data.dates.length;
    const xStep = chartWidth / (pointCount - 1);
    const yScale = chartHeight / data.totalPoints;
    
    // 理想线路径
    let idealPath = '';
    data.ideal.forEach((value, index) => {
        const x = padding + index * xStep;
        const y = padding + (data.totalPoints - value) * yScale;
        idealPath += index === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
    });
    
    // 实际线路径和数据点
    let actualPath = '';
    let actualPoints = '';
    let lastValidIndex = -1;
    
    data.actual.forEach((value, index) => {
        if (value !== null) {
            const x = padding + index * xStep;
            const y = padding + (data.totalPoints - value) * yScale;
            actualPath += lastValidIndex === -1 ? `M ${x} ${y}` : ` L ${x} ${y}`;
            actualPoints += `<circle cx="${x}" cy="${y}" r="4" fill="#2b7de9" class="data-point" data-value="${value}" data-date="${data.dates[index]}"/>`;
            lastValidIndex = index;
        }
    });
    
    // 更新 SVG
    chartArea.innerHTML = `
        <svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">
            <!-- 网格线 -->
            <g class="grid-lines" stroke="#e5e7eb" stroke-width="0.5">
                ${[0, 25, 50, 75, 100].map(percent => {
                    const y = padding + (100 - percent) / 100 * chartHeight;
                    return `<line x1="${padding}" y1="${y}" x2="${width - padding}" y2="${y}" stroke-dasharray="2,2"/>`;
                }).join('')}
            </g>
            <!-- 理想线 -->
            <path d="${idealPath}" fill="none" stroke="#e5e7eb" stroke-width="2" stroke-dasharray="5,5"/>
            <!-- 实际线 -->
            <path d="${actualPath}" fill="none" stroke="#2b7de9" stroke-width="3"/>
            <!-- 数据点 -->
            ${actualPoints}
        </svg>
    `;
    
    // 添加数据点悬停效果
    initDataPointHover();
}

function initDataPointHover() {
    const dataPoints = document.querySelectorAll('.data-point');
    
    dataPoints.forEach(point => {
        point.addEventListener('mouseenter', function(e) {
            const value = this.getAttribute('data-value');
            const date = this.getAttribute('data-date');
            
            showTooltip(e, `${date}: 剩余 ${value} 点`);
        });
        
        point.addEventListener('mouseleave', function() {
            hideTooltip();
        });
    });
}

// ==================== 工具提示 ====================
function showTooltip(event, text) {
    let tooltip = document.getElementById('chartTooltip');
    if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.id = 'chartTooltip';
        tooltip.style.cssText = `
            position: fixed;
            padding: 8px 12px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            font-size: 12px;
            border-radius: 4px;
            pointer-events: none;
            z-index: 1000;
            white-space: nowrap;
        `;
        document.body.appendChild(tooltip);
    }
    
    tooltip.textContent = text;
    tooltip.style.left = event.pageX + 10 + 'px';
    tooltip.style.top = event.pageY - 30 + 'px';
    tooltip.style.display = 'block';
}

function hideTooltip() {
    const tooltip = document.getElementById('chartTooltip');
    if (tooltip) {
        tooltip.style.display = 'none';
    }
}

// ==================== 导出功能 ====================
function initExportButton() {
    const exportBtn = document.querySelector('.header-actions .btn-outline');
    if (exportBtn && exportBtn.textContent.includes('导出')) {
        exportBtn.addEventListener('click', exportReport);
    }
}

function exportReport() {
    // 创建导出选项弹窗
    let modal = document.getElementById('exportModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'exportModal';
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal" style="max-width: 400px;">
                <div class="modal-header">
                    <h3>导出报告</h3>
                    <button class="modal-close" onclick="closeExportModal()">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>导出格式</label>
                        <div class="export-options" style="display: flex; flex-direction: column; gap: 12px; margin-top: 8px;">
                            <label class="radio-option" style="display: flex; align-items: center; gap: 12px; padding: 12px; border: 1px solid var(--border-light); border-radius: var(--radius-md); cursor: pointer;">
                                <input type="radio" name="exportFormat" value="pdf" checked>
                                <div>
                                    <div style="font-weight: 500;">PDF 报告</div>
                                    <div style="font-size: 12px; color: var(--text-secondary);">包含图表和详细数据的完整报告</div>
                                </div>
                            </label>
                            <label class="radio-option" style="display: flex; align-items: center; gap: 12px; padding: 12px; border: 1px solid var(--border-light); border-radius: var(--radius-md); cursor: pointer;">
                                <input type="radio" name="exportFormat" value="excel">
                                <div>
                                    <div style="font-weight: 500;">Excel 数据</div>
                                    <div style="font-size: 12px; color: var(--text-secondary);">原始数据表格，便于进一步分析</div>
                                </div>
                            </label>
                            <label class="radio-option" style="display: flex; align-items: center; gap: 12px; padding: 12px; border: 1px solid var(--border-light); border-radius: var(--radius-md); cursor: pointer;">
                                <input type="radio" name="exportFormat" value="png">
                                <div>
                                    <div style="font-weight: 500;">PNG 图片</div>
                                    <div style="font-size: 12px; color: var(--text-secondary);">仅导出图表为图片格式</div>
                                </div>
                            </label>
                        </div>
                    </div>
                    <div class="form-group" style="margin-top: 16px;">
                        <label>
                            <input type="checkbox" id="includeDetails" checked>
                            包含详细数据
                        </label>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="closeExportModal()">取消</button>
                    <button class="btn btn-primary" onclick="doExport()">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="7 10 12 15 17 10"/>
                            <line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                        导出
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    modal.classList.add('active');
}

function closeExportModal() {
    const modal = document.getElementById('exportModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

function doExport() {
    const format = document.querySelector('input[name="exportFormat"]:checked')?.value || 'pdf';
    const includeDetails = document.getElementById('includeDetails')?.checked;
    
    closeExportModal();
    
    // 模拟导出过程
    showToast('正在生成报告...', 'info');
    
    setTimeout(() => {
        const formatLabels = { pdf: 'PDF', excel: 'Excel', png: 'PNG' };
        showToast(`${formatLabels[format]} 报告已生成，开始下载`, 'success');
        
        // 模拟下载
        const filename = `效能报告_${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : format}`;
        console.log('下载文件:', filename, { format, includeDetails });
    }, 1500);
}

// ==================== 刷新功能 ====================
function initRefreshButton() {
    // 添加刷新按钮到页面头部
    const headerActions = document.querySelector('.metrics-header .header-actions');
    if (headerActions && !headerActions.querySelector('.refresh-btn')) {
        const refreshBtn = document.createElement('button');
        refreshBtn.className = 'btn btn-outline refresh-btn';
        refreshBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="23 4 23 10 17 10"/>
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
            </svg>
            刷新
        `;
        refreshBtn.addEventListener('click', refreshData);
        headerActions.insertBefore(refreshBtn, headerActions.firstChild);
    }
}

function refreshData() {
    const refreshBtn = document.querySelector('.refresh-btn');
    if (refreshBtn) {
        refreshBtn.disabled = true;
        refreshBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spin">
                <polyline points="23 4 23 10 17 10"/>
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
            </svg>
            刷新中...
        `;
    }
    
    // 模拟数据刷新
    setTimeout(() => {
        loadAllMetrics();
        
        if (refreshBtn) {
            refreshBtn.disabled = false;
            refreshBtn.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="23 4 23 10 17 10"/>
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                </svg>
                刷新
            `;
        }
        
        showToast('数据已刷新', 'success');
    }, 1000);
}

// ==================== 图表交互 ====================
function initChartInteractions() {
    // DORA 卡片点击钻取
    document.querySelectorAll('.dora-card').forEach(card => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', function() {
            const iconEl = this.querySelector('.dora-icon');
            let metricType = '';
            
            if (iconEl.classList.contains('deployment')) metricType = 'deployment';
            else if (iconEl.classList.contains('leadtime')) metricType = 'leadtime';
            else if (iconEl.classList.contains('changefail')) metricType = 'changefail';
            else if (iconEl.classList.contains('mttr')) metricType = 'mttr';
            
            showDORADetail(metricType);
        });
    });
    
    // 代码质量卡片点击
    const codeQualityCard = document.querySelector('.metric-card:has(.quality-metrics)');
    if (codeQualityCard) {
        const viewMore = codeQualityCard.querySelector('.view-more');
        if (viewMore) {
            viewMore.addEventListener('click', function(e) {
                e.preventDefault();
                showCodeQualityDetail();
            });
        }
    }
}

function showDORADetail(metricType) {
    const range = MetricsData.currentDateRange;
    const data = MetricsData.doraMetrics[range];
    
    const metricLabels = {
        deployment: '部署频率',
        leadtime: '变更前置时间',
        changefail: '变更失败率',
        mttr: '平均恢复时间'
    };
    
    const metricDescriptions = {
        deployment: '衡量团队部署代码到生产环境的频率。精英团队通常每天多次部署。',
        leadtime: '从代码提交到成功部署到生产环境的时间。精英团队通常在一小时内完成。',
        changefail: '导致生产环境故障或需要回滚的变更百分比。精英团队通常低于 5%。',
        mttr: '从生产环境故障到恢复服务的平均时间。精英团队通常在一小时内恢复。'
    };
    
    const metricData = data[metricType === 'deployment' ? 'deploymentFrequency' : 
                           metricType === 'leadtime' ? 'leadTime' :
                           metricType === 'changefail' ? 'changeFailRate' : 'mttr'];
    
    let modal = document.getElementById('doraDetailModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'doraDetailModal';
        modal.className = 'modal-overlay';
        document.body.appendChild(modal);
    }
    
    modal.innerHTML = `
        <div class="modal" style="max-width: 600px;">
            <div class="modal-header">
                <h3>${metricLabels[metricType]} 详情</h3>
                <button class="modal-close" onclick="closeDORADetailModal()">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            </div>
            <div class="modal-body">
                <p style="color: var(--text-secondary); margin-bottom: 24px;">${metricDescriptions[metricType]}</p>
                
                <div style="display: flex; align-items: center; gap: 24px; margin-bottom: 24px;">
                    <div style="flex: 1; padding: 20px; background: var(--bg-light); border-radius: var(--radius-md); text-align: center;">
                        <div style="font-size: 32px; font-weight: 600; color: var(--text-primary);">${metricData.value}${metricData.unit}</div>
                        <div style="font-size: 13px; color: var(--text-secondary);">当前值</div>
                    </div>
                    <div style="flex: 1; padding: 20px; background: var(--bg-light); border-radius: var(--radius-md); text-align: center;">
                        <div style="font-size: 32px; font-weight: 600; color: ${metricData.trend > 0 ? '#22c55e' : '#ef4444'};">${metricData.trend > 0 ? '+' : ''}${metricData.trend}%</div>
                        <div style="font-size: 13px; color: var(--text-secondary);">较上周变化</div>
                    </div>
                </div>
                
                <h4 style="font-size: 14px; font-weight: 600; margin-bottom: 12px;">DORA 等级标准</h4>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    <div style="display: flex; align-items: center; gap: 12px; padding: 12px; background: ${metricData.level === 'elite' ? 'rgba(34, 197, 94, 0.1)' : 'var(--bg-light)'}; border-radius: var(--radius-sm); ${metricData.level === 'elite' ? 'border: 1px solid #22c55e;' : ''}">
                        <span style="padding: 2px 8px; background: rgba(34, 197, 94, 0.1); color: #22c55e; border-radius: 4px; font-size: 12px;">精英</span>
                        <span style="flex: 1; font-size: 13px;">${getDoraStandard(metricType, 'elite')}</span>
                        ${metricData.level === 'elite' ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>' : ''}
                    </div>
                    <div style="display: flex; align-items: center; gap: 12px; padding: 12px; background: ${metricData.level === 'high' ? 'rgba(59, 130, 246, 0.1)' : 'var(--bg-light)'}; border-radius: var(--radius-sm); ${metricData.level === 'high' ? 'border: 1px solid #3b82f6;' : ''}">
                        <span style="padding: 2px 8px; background: rgba(59, 130, 246, 0.1); color: #3b82f6; border-radius: 4px; font-size: 12px;">高效</span>
                        <span style="flex: 1; font-size: 13px;">${getDoraStandard(metricType, 'high')}</span>
                        ${metricData.level === 'high' ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>' : ''}
                    </div>
                    <div style="display: flex; align-items: center; gap: 12px; padding: 12px; background: ${metricData.level === 'medium' ? 'rgba(245, 158, 11, 0.1)' : 'var(--bg-light)'}; border-radius: var(--radius-sm); ${metricData.level === 'medium' ? 'border: 1px solid #f59e0b;' : ''}">
                        <span style="padding: 2px 8px; background: rgba(245, 158, 11, 0.1); color: #f59e0b; border-radius: 4px; font-size: 12px;">中等</span>
                        <span style="flex: 1; font-size: 13px;">${getDoraStandard(metricType, 'medium')}</span>
                        ${metricData.level === 'medium' ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>' : ''}
                    </div>
                    <div style="display: flex; align-items: center; gap: 12px; padding: 12px; background: ${metricData.level === 'low' ? 'rgba(239, 68, 68, 0.1)' : 'var(--bg-light)'}; border-radius: var(--radius-sm); ${metricData.level === 'low' ? 'border: 1px solid #ef4444;' : ''}">
                        <span style="padding: 2px 8px; background: rgba(239, 68, 68, 0.1); color: #ef4444; border-radius: 4px; font-size: 12px;">低效</span>
                        <span style="flex: 1; font-size: 13px;">${getDoraStandard(metricType, 'low')}</span>
                        ${metricData.level === 'low' ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>' : ''}
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeDORADetailModal()">关闭</button>
            </div>
        </div>
    `;
    
    modal.classList.add('active');
}

function getDoraStandard(metricType, level) {
    const standards = {
        deployment: {
            elite: '每天多次部署',
            high: '每天至每周部署',
            medium: '每周至每月部署',
            low: '每月至每半年部署'
        },
        leadtime: {
            elite: '小于 1 小时',
            high: '1 天至 1 周',
            medium: '1 周至 1 个月',
            low: '1 个月至 6 个月'
        },
        changefail: {
            elite: '0-5%',
            high: '5-10%',
            medium: '10-15%',
            low: '15% 以上'
        },
        mttr: {
            elite: '小于 1 小时',
            high: '小于 1 天',
            medium: '1 天至 1 周',
            low: '超过 1 周'
        }
    };
    
    return standards[metricType]?.[level] || '';
}

function closeDORADetailModal() {
    const modal = document.getElementById('doraDetailModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

function showCodeQualityDetail() {
    showToast('代码质量详情页面开发中');
}

// ==================== 工具函数 ====================
function animateNumber(element, targetValue, unit) {
    if (!element) return;
    
    const startValue = parseFloat(element.textContent) || 0;
    const duration = 500;
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // 使用 easeOutQuad 缓动函数
        const easeProgress = 1 - (1 - progress) * (1 - progress);
        const currentValue = startValue + (targetValue - startValue) * easeProgress;
        
        if (Number.isInteger(targetValue)) {
            element.textContent = Math.round(currentValue) + unit;
        } else {
            element.textContent = currentValue.toFixed(1) + unit;
        }
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
}

function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

// ==================== 添加样式 ====================
function addMetricsStyles() {
    const style = document.createElement('style');
    style.textContent = `
        /* 刷新按钮旋转动画 */
        .refresh-btn .spin {
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        
        /* DORA 卡片悬停效果 */
        .dora-card {
            transition: all 0.2s ease;
        }
        
        .dora-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        /* 贡献列表悬停效果 */
        .contribution-item {
            cursor: pointer;
            transition: all 0.2s ease;
        }
        
        .contribution-item:hover {
            background: var(--bg-hover);
        }
        
        /* 数据点悬停效果 */
        .data-point {
            cursor: pointer;
            transition: all 0.2s ease;
        }
        
        .data-point:hover {
            r: 6;
            fill: #1d4ed8;
        }
        
        /* 单选按钮样式 */
        .radio-option input[type="radio"] {
            width: 18px;
            height: 18px;
            accent-color: var(--primary-color);
        }
        
        .radio-option:hover {
            background: var(--bg-light);
        }
        
        /* 图表值标签 */
        .chart-value {
            min-width: 30px;
            text-align: right;
        }
        
        /* 排名徽章 */
        .rank-badge {
            flex-shrink: 0;
        }
        
        /* DORA 等级样式补充 */
        .dora-level.medium {
            background: rgba(245, 158, 11, 0.1);
            color: #f59e0b;
        }
        
        .dora-level.low {
            background: rgba(239, 68, 68, 0.1);
            color: #ef4444;
        }
    `;
    document.head.appendChild(style);
}

// 初始化样式
document.addEventListener('DOMContentLoaded', addMetricsStyles);

// ==================== 导出全局函数 ====================
window.MetricsData = MetricsData;
window.loadAllMetrics = loadAllMetrics;
window.refreshData = refreshData;
window.exportReport = exportReport;
window.closeExportModal = closeExportModal;
window.doExport = doExport;
window.openCustomDateModal = openCustomDateModal;
window.closeCustomDateModal = closeCustomDateModal;
window.applyCustomDateRange = applyCustomDateRange;
window.showMemberDetail = showMemberDetail;
window.closeMemberDetailModal = closeMemberDetailModal;
window.showDORADetail = showDORADetail;
window.closeDORADetailModal = closeDORADetailModal;