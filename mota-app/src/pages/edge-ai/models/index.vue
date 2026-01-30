<template>
  <view class="edge-ai-page">
    <!-- 头部 -->
    <view class="header">
      <view class="title">端侧AI模型</view>
      <view class="subtitle">离线AI能力，保护隐私</view>
    </view>

    <!-- 统计信息 -->
    <view class="stats-card">
      <view class="stat-item">
        <text class="stat-value">{{ localModels.length }}</text>
        <text class="stat-label">已下载</text>
      </view>
      <view class="stat-item">
        <text class="stat-value">{{ formatSize(cacheSize) }}</text>
        <text class="stat-label">缓存大小</text>
      </view>
      <view class="stat-item">
        <text class="stat-value">{{ availableModels.length }}</text>
        <text class="stat-label">可用模型</text>
      </view>
    </view>

    <!-- 配置选项 -->
    <view class="config-section">
      <view class="config-item">
        <view class="config-info">
          <text class="config-label">启用端侧AI</text>
          <text class="config-desc">使用本地模型进行推理</text>
        </view>
        <switch :checked="config.enabled" @change="onConfigChange('enabled', $event)" />
      </view>
      <view class="config-item">
        <view class="config-info">
          <text class="config-label">自动下载模型</text>
          <text class="config-desc">首次使用时自动下载</text>
        </view>
        <switch :checked="config.autoDownload" @change="onConfigChange('autoDownload', $event)" />
      </view>
      <view class="config-item">
        <view class="config-info">
          <text class="config-label">仅WiFi下载</text>
          <text class="config-desc">避免消耗移动数据</text>
        </view>
        <switch :checked="config.wifiOnly" @change="onConfigChange('wifiOnly', $event)" />
      </view>
    </view>

    <!-- 模型列表 -->
    <view class="models-section">
      <view class="section-header">
        <text class="section-title">可用模型</text>
        <text class="section-action" @click="refreshModels">刷新</text>
      </view>
      
      <view
        v-for="model in availableModels"
        :key="model.id"
        class="model-card"
      >
        <view class="model-header">
          <text class="model-icon">{{ getModelIcon(model.type) }}</text>
          <view class="model-info">
            <text class="model-name">{{ model.name }}</text>
            <text class="model-desc">{{ model.description }}</text>
          </view>
        </view>
        
        <view class="model-meta">
          <text class="meta-item">v{{ model.version }}</text>
          <text class="meta-item">{{ formatSize(model.size) }}</text>
          <text v-if="model.accuracy" class="meta-item">
            准确率 {{ (model.accuracy * 100).toFixed(1) }}%
          </text>
        </view>
        
        <!-- 下载进度 -->
        <view v-if="model.status === 'downloading'" class="download-progress">
          <view class="progress-bar">
            <view
              class="progress-fill"
              :style="{ width: (model.progress || 0) + '%' }"
            />
          </view>
          <text class="progress-text">{{ (model.progress || 0).toFixed(0) }}%</text>
        </view>
        
        <!-- 状态标签 -->
        <view class="model-status">
          <text
            class="status-badge"
            :style="{ background: getStatusColor(model.status) }"
          >
            {{ getStatusText(model.status) }}
          </text>
        </view>
        
        <!-- 操作按钮 -->
        <view class="model-actions">
          <button
            v-if="model.status === 'not_downloaded'"
            class="action-btn primary"
            @click="downloadModel(model)"
          >
            下载
          </button>
          <button
            v-else-if="model.status === 'downloading'"
            class="action-btn secondary"
            @click="cancelDownload(model)"
          >
            取消
          </button>
          <button
            v-else-if="model.status === 'downloaded'"
            class="action-btn primary"
            @click="loadModel(model)"
          >
            加载
          </button>
          <button
            v-else-if="model.status === 'loaded'"
            class="action-btn secondary"
            @click="unloadModel(model)"
          >
            卸载
          </button>
          
          <button
            v-if="model.status !== 'not_downloaded' && model.status !== 'downloading'"
            class="action-btn danger"
            @click="deleteModel(model)"
          >
            删除
          </button>
        </view>
      </view>
    </view>

    <!-- 缓存管理 -->
    <view class="cache-section">
      <view class="section-header">
        <text class="section-title">缓存管理</text>
      </view>
      <view class="cache-info">
        <text class="cache-text">当前缓存: {{ formatSize(cacheSize) }}</text>
        <text class="cache-text">最大缓存: {{ formatSize(config.maxCacheSize) }}</text>
      </view>
      <button class="clear-btn" @click="clearCache">清理缓存</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import {
  edgeAIService,
  ModelStatus,
  type ModelInfo,
  type ModelConfig,
  type DownloadProgress
} from '@/core/edge-ai';

// 可用模型列表
const availableModels = ref<ModelInfo[]>([]);

// 配置
const config = ref<ModelConfig>(edgeAIService.getConfig());

// 缓存大小
const cacheSize = ref(0);

// 本地模型
const localModels = computed(() => {
  return availableModels.value.filter(m => 
    m.status === ModelStatus.DOWNLOADED || m.status === ModelStatus.LOADED
  );
});

/**
 * 刷新模型列表
 */
async function refreshModels() {
  try {
    uni.showLoading({ title: '加载中...' });
    availableModels.value = await edgeAIService.getAvailableModels();
    cacheSize.value = edgeAIService.getCacheSize();
    uni.hideLoading();
  } catch (error: any) {
    uni.hideLoading();
    uni.showToast({ title: error.message || '加载失败', icon: 'none' });
  }
}

/**
 * 下载模型
 */
async function downloadModel(model: ModelInfo) {
  try {
    // 检查WiFi设置
    if (config.value.wifiOnly) {
      // TODO: 检查网络类型
    }
    
    uni.showToast({ title: '开始下载', icon: 'none' });
    
    await edgeAIService.downloadModel(model.id, (progress: DownloadProgress) => {
      // 更新进度
      const index = availableModels.value.findIndex(m => m.id === model.id);
      if (index !== -1) {
        availableModels.value[index].progress = progress.progress;
      }
    });
    
    uni.showToast({ title: '下载完成', icon: 'success' });
    await refreshModels();
  } catch (error: any) {
    uni.showToast({ title: error.message || '下载失败', icon: 'none' });
  }
}

/**
 * 取消下载
 */
function cancelDownload(model: ModelInfo) {
  uni.showModal({
    title: '提示',
    content: '确定取消下载吗？',
    success: (res) => {
      if (res.confirm) {
        // TODO: 实现取消下载逻辑
        uni.showToast({ title: '已取消', icon: 'none' });
      }
    }
  });
}

/**
 * 加载模型
 */
async function loadModel(model: ModelInfo) {
  try {
    uni.showLoading({ title: '加载中...' });
    await edgeAIService.loadModel(model.id);
    uni.hideLoading();
    uni.showToast({ title: '加载成功', icon: 'success' });
    await refreshModels();
  } catch (error: any) {
    uni.hideLoading();
    uni.showToast({ title: error.message || '加载失败', icon: 'none' });
  }
}

/**
 * 卸载模型
 */
async function unloadModel(model: ModelInfo) {
  try {
    await edgeAIService.unloadModel(model.id);
    uni.showToast({ title: '已卸载', icon: 'success' });
    await refreshModels();
  } catch (error: any) {
    uni.showToast({ title: error.message || '卸载失败', icon: 'none' });
  }
}

/**
 * 删除模型
 */
function deleteModel(model: ModelInfo) {
  uni.showModal({
    title: '提示',
    content: `确定删除模型"${model.name}"吗？`,
    success: async (res) => {
      if (res.confirm) {
        try {
          await edgeAIService.deleteModel(model.id);
          uni.showToast({ title: '删除成功', icon: 'success' });
          await refreshModels();
        } catch (error: any) {
          uni.showToast({ title: error.message || '删除失败', icon: 'none' });
        }
      }
    }
  });
}

/**
 * 清理缓存
 */
function clearCache() {
  uni.showModal({
    title: '提示',
    content: '确定清理所有缓存吗？这将删除所有已下载的模型。',
    success: async (res) => {
      if (res.confirm) {
        try {
          await edgeAIService.clearCache();
          uni.showToast({ title: '清理成功', icon: 'success' });
          await refreshModels();
        } catch (error: any) {
          uni.showToast({ title: error.message || '清理失败', icon: 'none' });
        }
      }
    }
  });
}

/**
 * 配置变化
 */
function onConfigChange(key: keyof ModelConfig, event: any) {
  const value = event.detail.value;
  config.value[key] = value as any;
  edgeAIService.updateConfig({ [key]: value });
}

/**
 * 获取模型图标
 */
function getModelIcon(type: string): string {
  const icons: Record<string, string> = {
    text_classification: '📝',
    sentiment_analysis: '😊',
    keyword_extraction: '🔑',
    text_summarization: '📄',
    image_classification: '🖼️'
  };
  return icons[type] || '🤖';
}

/**
 * 获取状态颜色
 */
function getStatusColor(status: ModelStatus): string {
  return edgeAIService.getStatusColor(status);
}

/**
 * 获取状态文本
 */
function getStatusText(status: ModelStatus): string {
  return edgeAIService.getStatusText(status);
}

/**
 * 格式化大小
 */
function formatSize(bytes: number): string {
  return edgeAIService.formatSize(bytes);
}

// 初始化
onMounted(() => {
  refreshModels();
});
</script>

<style scoped lang="scss">
.edge-ai-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20rpx;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20rpx;
  padding: 40rpx 30rpx;
  margin-bottom: 20rpx;
  
  .title {
    font-size: 40rpx;
    font-weight: bold;
    color: #fff;
    margin-bottom: 10rpx;
  }
  
  .subtitle {
    font-size: 26rpx;
    color: rgba(255, 255, 255, 0.8);
  }
}

.stats-card {
  display: flex;
  background: #fff;
  border-radius: 15rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  
  .stat-item {
    flex: 1;
    text-align: center;
    
    .stat-value {
      display: block;
      font-size: 40rpx;
      font-weight: bold;
      color: #667eea;
      margin-bottom: 10rpx;
    }
    
    .stat-label {
      display: block;
      font-size: 24rpx;
      color: #999;
    }
  }
}

.config-section {
  background: #fff;
  border-radius: 15rpx;
  padding: 20rpx 30rpx;
  margin-bottom: 20rpx;
  
  .config-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 25rpx 0;
    border-bottom: 1rpx solid #f0f0f0;
    
    &:last-child {
      border-bottom: none;
    }
    
    .config-info {
      flex: 1;
      
      .config-label {
        display: block;
        font-size: 28rpx;
        color: #333;
        margin-bottom: 8rpx;
      }
      
      .config-desc {
        display: block;
        font-size: 24rpx;
        color: #999;
      }
    }
  }
}

.models-section,
.cache-section {
  margin-bottom: 20rpx;
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;
    
    .section-title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
    }
    
    .section-action {
      font-size: 26rpx;
      color: #667eea;
    }
  }
  
  .model-card {
    background: #fff;
    border-radius: 15rpx;
    padding: 30rpx;
    margin-bottom: 20rpx;
    
    .model-header {
      display: flex;
      align-items: flex-start;
      margin-bottom: 20rpx;
      
      .model-icon {
        font-size: 48rpx;
        margin-right: 20rpx;
      }
      
      .model-info {
        flex: 1;
        
        .model-name {
          display: block;
          font-size: 30rpx;
          font-weight: bold;
          color: #333;
          margin-bottom: 10rpx;
        }
        
        .model-desc {
          display: block;
          font-size: 24rpx;
          color: #999;
          line-height: 1.5;
        }
      }
    }
    
    .model-meta {
      display: flex;
      gap: 20rpx;
      margin-bottom: 20rpx;
      
      .meta-item {
        font-size: 22rpx;
        color: #999;
      }
    }
    
    .download-progress {
      margin-bottom: 20rpx;
      
      .progress-bar {
        height: 8rpx;
        background: #f0f0f0;
        border-radius: 4rpx;
        overflow: hidden;
        margin-bottom: 10rpx;
        
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #667eea, #764ba2);
          border-radius: 4rpx;
          transition: width 0.3s;
        }
      }
      
      .progress-text {
        font-size: 22rpx;
        color: #667eea;
      }
    }
    
    .model-status {
      margin-bottom: 20rpx;
      
      .status-badge {
        display: inline-block;
        padding: 8rpx 20rpx;
        border-radius: 20rpx;
        font-size: 22rpx;
        color: #fff;
      }
    }
    
    .model-actions {
      display: flex;
      gap: 15rpx;
      
      .action-btn {
        flex: 1;
        height: 70rpx;
        line-height: 70rpx;
        border-radius: 10rpx;
        font-size: 26rpx;
        
        &.primary {
          background: #667eea;
          color: #fff;
        }
        
        &.secondary {
          background: #f5f5f5;
          color: #666;
        }
        
        &.danger {
          background: #EF4444;
          color: #fff;
        }
      }
    }
  }
}

.cache-section {
  background: #fff;
  border-radius: 15rpx;
  padding: 30rpx;
  
  .cache-info {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20rpx;
    
    .cache-text {
      font-size: 26rpx;
      color: #666;
    }
  }
  
  .clear-btn {
    width: 100%;
    height: 80rpx;
    line-height: 80rpx;
    background: #EF4444;
    color: #fff;
    border-radius: 10rpx;
    font-size: 28rpx;
  }
}
</style>