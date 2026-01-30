<template>
  <view class="analytics-page">
    <!-- 头部 -->
    <view class="header">
      <view class="title">数据分析</view>
      <view class="actions">
        <text class="action-btn" @click="showTypeModal = true">{{ getCurrentTypeName() }}</text>
        <text class="action-btn" @click="showTimeModal = true">{{ getCurrentTimeName() }}</text>
        <text class="action-btn" @click="exportReport">导出</text>
      </view>
    </view>

    <!-- 关键指标 -->
    <view v-if="reportData" class="metrics-section">
      <view
        v-for="metric in reportData.metrics"
        :key="metric.name"
        class="metric-card"
      >
        <view class="metric-header">
          <text class="metric-name">{{ metric.name }}</text>
          <text v-if="metric.trend" class="metric-trend" :class="metric.trend">
            {{ getTrendIcon(metric.trend) }}
          </text>
        </view>
        <view class="metric-value">
          <text class="value">{{ formatMetricValue(metric.value, metric.unit) }}</text>
          <text v-if="metric.change" class="change" :class="{ positive: metric.change > 0 }">
            {{ metric.change > 0 ? '+' : '' }}{{ metric.change.toFixed(1) }}%
          </text>
        </view>
        <view v-if="metric.target" class="metric-progress">
          <view class="progress-bar">
            <view
              class="progress-fill"
              :style="{ width: (metric.value / metric.target * 100) + '%' }"
            />
          </view>
          <text class="progress-text">目标: {{ formatMetricValue(metric.target, metric.unit) }}</text>
        </view>
      </view>
    </view>

    <!-- AI洞察 -->
    <view v-if="reportData && reportData.insights.length > 0" class="insights-section">
      <view class="section-title">AI洞察</view>
      <view
        v-for="insight in reportData.insights"
        :key="insight.id"
        class="insight-card"
        :class="insight.importance"
      >
        <view class="insight-header">
          <text class="insight-icon">{{ getInsightIcon(insight.type) }}</text>
          <text class="insight-title">{{ insight.title }}</text>
          <text class="insight-badge" :style="{ background: getImportanceColor(insight.importance) }">
            {{ getImportanceLabel(insight.importance) }}
          </text>
        </view>
        <text class="insight-desc">{{ insight.description }}</text>
        <view v-if="insight.actions && insight.actions.length > 0" class="insight-actions">
          <text
            v-for="(action, index) in insight.actions"
            :key="index"
            class="action-item"
          >
            • {{ action }}
          </text>
        </view>
      </view>
    </view>

    <!-- 图表展示 -->
    <view v-if="reportData && reportData.charts.length > 0" class="charts-section">
      <view class="section-title">数据图表</view>
      <view
        v-for="(chart, index) in reportData.charts"
        :key="index"
        class="chart-card"
      >
        <text class="chart-title">{{ chart.title }}</text>
        <view class="chart-placeholder">
          <text class="placeholder-text">{{ chart.type }}图表</text>
          <text class="placeholder-tip">数据可视化展示</text>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view v-if="!reportData && !loading" class="empty-state">
      <text class="empty-icon">📊</text>
      <text class="empty-text">暂无数据</text>
      <button class="load-btn" @click="loadReport">加载报表</button>
    </view>

    <!-- 类型选择弹窗 -->
    <view v-if="showTypeModal" class="modal-overlay" @click="showTypeModal = false">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">选择报表类型</text>
          <text class="modal-close" @click="showTypeModal = false">✕</text>
        </view>
        <view class="modal-body">
          <view
            v-for="type in reportTypes"
            :key="type.value"
            class="option-item"
            :class="{ active: selectedType === type.value }"
            @click="selectType(type.value)"
          >
            <text class="option-icon">{{ type.icon }}</text>
            <text class="option-label">{{ type.label }}</text>
            <text v-if="selectedType === type.value" class="option-check">✓</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 时间选择弹窗 -->
    <view v-if="showTimeModal" class="modal-overlay" @click="showTimeModal = false">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">选择时间范围</text>
          <text class="modal-close" @click="showTimeModal = false">✕</text>
        </view>
        <view class="modal-body">
          <view
            v-for="range in timeRanges"
            :key="range.value"
            class="option-item"
            :class="{ active: selectedTime === range.value }"
            @click="selectTime(range.value)"
          >
            <text class="option-label">{{ range.label }}</text>
            <text v-if="selectedTime === range.value" class="option-check">✓</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {
  analyticsService,
  ReportType,
  TimeRange,
  type ReportData
} from '@/core/analytics';

// 报表类型
const reportTypes = analyticsService.getReportTypes();
const selectedType = ref<ReportType>(ReportType.PROJECT_OVERVIEW);

// 时间范围
const timeRanges = analyticsService.getTimeRanges();
const selectedTime = ref<TimeRange>(TimeRange.THIS_WEEK);

// 报表数据
const reportData = ref<ReportData | null>(null);

// 加载状态
const loading = ref(false);

// 显示弹窗
const showTypeModal = ref(false);
const showTimeModal = ref(false);

/**
 * 加载报表
 */
async function loadReport() {
  try {
    loading.value = true;
    uni.showLoading({ title: '加载中...' });
    
    reportData.value = await analyticsService.getReport({
      type: selectedType.value,
      timeRange: selectedTime.value
    });
    
    uni.hideLoading();
  } catch (error: any) {
    uni.hideLoading();
    uni.showToast({ title: error.message || '加载失败', icon: 'none' });
  } finally {
    loading.value = false;
  }
}

/**
 * 选择类型
 */
function selectType(type: ReportType) {
  selectedType.value = type;
  showTypeModal.value = false;
  loadReport();
}

/**
 * 选择时间
 */
function selectTime(time: TimeRange) {
  selectedTime.value = time;
  showTimeModal.value = false;
  loadReport();
}

/**
 * 导出报表
 */
async function exportReport() {
  try {
    uni.showLoading({ title: '导出中...' });
    
    const url = await analyticsService.exportReport({
      type: selectedType.value,
      timeRange: selectedTime.value
    });
    
    uni.hideLoading();
    uni.showToast({ title: '导出成功', icon: 'success' });
  } catch (error: any) {
    uni.hideLoading();
    uni.showToast({ title: error.message || '导出失败', icon: 'none' });
  }
}

/**
 * 获取当前类型名称
 */
function getCurrentTypeName(): string {
  const type = reportTypes.find(t => t.value === selectedType.value);
  return type?.label || '报表类型';
}

/**
 * 获取当前时间名称
 */
function getCurrentTimeName(): string {
  const time = timeRanges.find(t => t.value === selectedTime.value);
  return time?.label || '时间范围';
}

/**
 * 格式化指标值
 */
function formatMetricValue(value: number, unit?: string): string {
  return analyticsService.formatMetricValue(value, unit);
}

/**
 * 获取趋势图标
 */
function getTrendIcon(trend: 'up' | 'down' | 'stable'): string {
  return analyticsService.getTrendIcon(trend);
}

/**
 * 获取洞察图标
 */
function getInsightIcon(type: string): string {
  const icons: Record<string, string> = {
    trend: '📈',
    anomaly: '⚠️',
    prediction: '🔮',
    recommendation: '💡'
  };
  return icons[type] || '💡';
}

/**
 * 获取重要度颜色
 */
function getImportanceColor(importance: 'high' | 'medium' | 'low'): string {
  return analyticsService.getImportanceColor(importance);
}

/**
 * 获取重要度标签
 */
function getImportanceLabel(importance: 'high' | 'medium' | 'low'): string {
  const labels = { high: '高', medium: '中', low: '低' };
  return labels[importance];
}

// 初始加载
loadReport();
</script>

<style scoped lang="scss">
.analytics-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20rpx;
}

.header {
  background: #fff;
  border-radius: 15rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  
  .title {
    font-size: 40rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 20rpx;
  }
  
  .actions {
    display: flex;
    gap: 15rpx;
    
    .action-btn {
      flex: 1;
      padding: 15rpx;
      background: #f5f5f5;
      border-radius: 10rpx;
      text-align: center;
      font-size: 26rpx;
      color: #666;
    }
  }
}

.metrics-section {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
  margin-bottom: 20rpx;
  
  .metric-card {
    background: #fff;
    border-radius: 15rpx;
    padding: 30rpx;
    
    .metric-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20rpx;
      
      .metric-name {
        font-size: 26rpx;
        color: #999;
      }
      
      .metric-trend {
        font-size: 32rpx;
        
        &.up { color: #10B981; }
        &.down { color: #EF4444; }
        &.stable { color: #999; }
      }
    }
    
    .metric-value {
      margin-bottom: 15rpx;
      
      .value {
        display: block;
        font-size: 40rpx;
        font-weight: bold;
        color: #333;
        margin-bottom: 10rpx;
      }
      
      .change {
        font-size: 24rpx;
        color: #EF4444;
        
        &.positive {
          color: #10B981;
        }
      }
    }
    
    .metric-progress {
      .progress-bar {
        height: 8rpx;
        background: #f0f0f0;
        border-radius: 4rpx;
        overflow: hidden;
        margin-bottom: 10rpx;
        
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #3B82F6, #10B981);
          border-radius: 4rpx;
        }
      }
      
      .progress-text {
        font-size: 22rpx;
        color: #999;
      }
    }
  }
}

.insights-section,
.charts-section {
  margin-bottom: 20rpx;
  
  .section-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 20rpx;
  }
  
  .insight-card {
    background: #fff;
    border-radius: 15rpx;
    padding: 30rpx;
    margin-bottom: 20rpx;
    border-left: 4rpx solid #3B82F6;
    
    &.high { border-left-color: #EF4444; }
    &.medium { border-left-color: #F59E0B; }
    &.low { border-left-color: #10B981; }
    
    .insight-header {
      display: flex;
      align-items: center;
      margin-bottom: 15rpx;
      
      .insight-icon {
        font-size: 32rpx;
        margin-right: 15rpx;
      }
      
      .insight-title {
        flex: 1;
        font-size: 28rpx;
        font-weight: bold;
        color: #333;
      }
      
      .insight-badge {
        padding: 5rpx 15rpx;
        border-radius: 20rpx;
        font-size: 22rpx;
        color: #fff;
      }
    }
    
    .insight-desc {
      font-size: 26rpx;
      color: #666;
      line-height: 1.6;
      margin-bottom: 15rpx;
    }
    
    .insight-actions {
      .action-item {
        display: block;
        font-size: 24rpx;
        color: #3B82F6;
        line-height: 1.8;
      }
    }
  }
  
  .chart-card {
    background: #fff;
    border-radius: 15rpx;
    padding: 30rpx;
    margin-bottom: 20rpx;
    
    .chart-title {
      display: block;
      font-size: 28rpx;
      font-weight: bold;
      color: #333;
      margin-bottom: 20rpx;
    }
    
    .chart-placeholder {
      height: 400rpx;
      background: #f9f9f9;
      border-radius: 10rpx;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      
      .placeholder-text {
        font-size: 32rpx;
        color: #999;
        margin-bottom: 10rpx;
      }
      
      .placeholder-tip {
        font-size: 24rpx;
        color: #ccc;
      }
    }
  }
}

.empty-state {
  padding: 150rpx 20rpx;
  text-align: center;
  
  .empty-icon {
    display: block;
    font-size: 120rpx;
    margin-bottom: 30rpx;
  }
  
  .empty-text {
    display: block;
    font-size: 32rpx;
    color: #999;
    margin-bottom: 40rpx;
  }
  
  .load-btn {
    width: 300rpx;
    height: 80rpx;
    line-height: 80rpx;
    background: #3B82F6;
    color: #fff;
    border-radius: 40rpx;
    font-size: 28rpx;
  }
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  z-index: 1000;
  
  .modal-content {
    width: 100%;
    max-height: 70vh;
    background: #fff;
    border-radius: 20rpx 20rpx 0 0;
    
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 30rpx;
      border-bottom: 1rpx solid #f0f0f0;
      
      .modal-title {
        font-size: 32rpx;
        font-weight: bold;
        color: #333;
      }
      
      .modal-close {
        font-size: 40rpx;
        color: #999;
      }
    }
    
    .modal-body {
      padding: 20rpx;
      max-height: 60vh;
      overflow-y: auto;
      
      .option-item {
        display: flex;
        align-items: center;
        padding: 30rpx 20rpx;
        border-bottom: 1rpx solid #f0f0f0;
        
        &.active {
          background: #f5f9ff;
          
          .option-label {
            color: #3B82F6;
          }
        }
        
        .option-icon {
          font-size: 32rpx;
          margin-right: 20rpx;
        }
        
        .option-label {
          flex: 1;
          font-size: 28rpx;
          color: #333;
        }
        
        .option-check {
          font-size: 32rpx;
          color: #3B82F6;
        }
      }
    }
  }
}
</style>