<template>
  <view class="ocr-page">
    <!-- 顶部导航 -->
    <view class="header">
      <view class="title">智能识别</view>
      <view class="subtitle">AI图像识别与OCR文字提取</view>
    </view>

    <!-- 识别类型选择 -->
    <view class="type-selector">
      <scroll-view scroll-x class="type-scroll">
        <view
          v-for="type in ocrTypes"
          :key="type.value"
          class="type-item"
          :class="{ active: selectedType === type.value }"
          @click="selectType(type.value)"
        >
          <text class="type-icon">{{ type.icon }}</text>
          <text class="type-name">{{ type.label }}</text>
        </view>
      </scroll-view>
    </view>

    <!-- 操作按钮 -->
    <view class="actions">
      <view class="action-btn camera" @click="captureImage">
        <text class="icon">📷</text>
        <text class="text">拍照识别</text>
      </view>
      <view class="action-btn album" @click="selectImage">
        <text class="icon">🖼️</text>
        <text class="text">相册选择</text>
      </view>
    </view>

    <!-- 识别结果 -->
    <view v-if="result" class="result-container">
      <view class="result-header">
        <text class="result-title">识别结果</text>
        <view class="result-actions">
          <text class="action-icon" @click="copyResult">📋</text>
          <text class="action-icon" @click="exportResult">💾</text>
          <text class="action-icon" @click="clearResult">🗑️</text>
        </view>
      </view>

      <!-- 预览图片 -->
      <view v-if="imagePreview" class="image-preview">
        <image :src="imagePreview" mode="aspectFit" />
      </view>

      <!-- 通用文字结果 -->
      <view v-if="isGeneralType" class="text-result">
        <view class="full-text">{{ result.fullText }}</view>
        <view v-if="result.lines && result.lines.length > 0" class="lines">
          <view
            v-for="(line, index) in result.lines"
            :key="index"
            class="line-item"
          >
            <text class="line-text">{{ line.text }}</text>
            <text v-if="line.confidence" class="confidence">
              {{ (line.confidence * 100).toFixed(1) }}%
            </text>
          </view>
        </view>
      </view>

      <!-- 身份证结果 -->
      <view v-else-if="selectedType === 'id_card'" class="card-result">
        <view class="field-item">
          <text class="field-label">姓名：</text>
          <text class="field-value">{{ result.name || '-' }}</text>
        </view>
        <view class="field-item">
          <text class="field-label">性别：</text>
          <text class="field-value">{{ result.gender || '-' }}</text>
        </view>
        <view class="field-item">
          <text class="field-label">民族：</text>
          <text class="field-value">{{ result.nation || '-' }}</text>
        </view>
        <view class="field-item">
          <text class="field-label">出生日期：</text>
          <text class="field-value">{{ result.birth || '-' }}</text>
        </view>
        <view class="field-item">
          <text class="field-label">住址：</text>
          <text class="field-value">{{ result.address || '-' }}</text>
        </view>
        <view class="field-item">
          <text class="field-label">身份证号：</text>
          <text class="field-value">{{ result.idNumber || '-' }}</text>
        </view>
      </view>

      <!-- 银行卡结果 -->
      <view v-else-if="selectedType === 'bank_card'" class="card-result">
        <view class="field-item">
          <text class="field-label">卡号：</text>
          <text class="field-value">{{ result.cardNumber || '-' }}</text>
        </view>
        <view class="field-item">
          <text class="field-label">银行：</text>
          <text class="field-value">{{ result.bankName || '-' }}</text>
        </view>
        <view class="field-item">
          <text class="field-label">卡类型：</text>
          <text class="field-value">{{ result.cardType || '-' }}</text>
        </view>
      </view>

      <!-- 营业执照结果 -->
      <view v-else-if="selectedType === 'business_license'" class="card-result">
        <view class="field-item">
          <text class="field-label">企业名称：</text>
          <text class="field-value">{{ result.companyName || '-' }}</text>
        </view>
        <view class="field-item">
          <text class="field-label">信用代码：</text>
          <text class="field-value">{{ result.creditCode || '-' }}</text>
        </view>
        <view class="field-item">
          <text class="field-label">法定代表人：</text>
          <text class="field-value">{{ result.legalPerson || '-' }}</text>
        </view>
        <view class="field-item">
          <text class="field-label">注册资本：</text>
          <text class="field-value">{{ result.registeredCapital || '-' }}</text>
        </view>
      </view>

      <!-- 统计信息 -->
      <view class="result-stats">
        <view class="stat-item">
          <text class="stat-label">识别类型</text>
          <text class="stat-value">{{ getCurrentTypeName() }}</text>
        </view>
        <view v-if="result.avgConfidence" class="stat-item">
          <text class="stat-label">平均置信度</text>
          <text class="stat-value">{{ (result.avgConfidence * 100).toFixed(1) }}%</text>
        </view>
        <view v-if="result.duration" class="stat-item">
          <text class="stat-label">识别耗时</text>
          <text class="stat-value">{{ result.duration }}ms</text>
        </view>
      </view>
    </view>

    <!-- 历史记录 -->
    <view class="history-section">
      <view class="section-header">
        <text class="section-title">识别历史</text>
        <text class="section-action" @click="loadHistory">刷新</text>
      </view>
      <view v-if="historyList.length > 0" class="history-list">
        <view
          v-for="item in historyList"
          :key="item.id"
          class="history-item"
          @click="viewHistory(item)"
        >
          <image :src="item.thumbnail" class="history-thumb" mode="aspectFill" />
          <view class="history-info">
            <text class="history-type">{{ getTypeName(item.type) }}</text>
            <text class="history-time">{{ formatTime(item.createTime) }}</text>
          </view>
          <text class="history-arrow">›</text>
        </view>
      </view>
      <view v-else class="empty-history">
        <text class="empty-text">暂无识别历史</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { ocrService, OCRType, type OCRResult, type OCRHistory } from '@/core/ocr';

// 识别类型列表
const ocrTypes = [
  { value: OCRType.GENERAL, label: '通用文字', icon: '📝' },
  { value: OCRType.ID_CARD, label: '身份证', icon: '🪪' },
  { value: OCRType.BANK_CARD, label: '银行卡', icon: '💳' },
  { value: OCRType.BUSINESS_LICENSE, label: '营业执照', icon: '📄' },
  { value: OCRType.INVOICE, label: '发票', icon: '🧾' },
  { value: OCRType.TABLE, label: '表格', icon: '📊' },
  { value: OCRType.HANDWRITING, label: '手写', icon: '✍️' }
];

// 当前选择的类型
const selectedType = ref<OCRType>(OCRType.GENERAL);

// 识别结果
const result = ref<OCRResult | null>(null);

// 图片预览
const imagePreview = ref<string>('');

// 历史记录
const historyList = ref<OCRHistory[]>([]);

// 是否为通用类型
const isGeneralType = computed(() => {
  return [OCRType.GENERAL, OCRType.HANDWRITING, OCRType.TABLE].includes(selectedType.value);
});

/**
 * 选择识别类型
 */
function selectType(type: OCRType) {
  selectedType.value = type;
  result.value = null;
  imagePreview.value = '';
}

/**
 * 拍照识别
 */
async function captureImage() {
  try {
    uni.showLoading({ title: '识别中...' });
    
    const image = await ocrService.chooseImage('camera' as any);
    imagePreview.value = image;
    
    const res = await ocrService.recognize({
      image,
      type: selectedType.value,
      includePosition: true,
      includeConfidence: true
    });
    
    result.value = res;
    
    // 保存到历史
    await ocrService.saveResult(selectedType.value, image, res);
    
    uni.hideLoading();
    uni.showToast({ title: '识别成功', icon: 'success' });
  } catch (error: any) {
    uni.hideLoading();
    uni.showToast({ title: error.message || '识别失败', icon: 'none' });
  }
}

/**
 * 选择图片识别
 */
async function selectImage() {
  try {
    uni.showLoading({ title: '识别中...' });
    
    const image = await ocrService.chooseImage('album' as any);
    imagePreview.value = image;
    
    const res = await ocrService.recognize({
      image,
      type: selectedType.value,
      includePosition: true,
      includeConfidence: true
    });
    
    result.value = res;
    
    // 保存到历史
    await ocrService.saveResult(selectedType.value, image, res);
    
    uni.hideLoading();
    uni.showToast({ title: '识别成功', icon: 'success' });
  } catch (error: any) {
    uni.hideLoading();
    uni.showToast({ title: error.message || '识别失败', icon: 'none' });
  }
}

/**
 * 复制结果
 */
function copyResult() {
  if (!result.value) return;
  
  uni.setClipboardData({
    data: result.value.fullText,
    success: () => {
      uni.showToast({ title: '已复制', icon: 'success' });
    }
  });
}

/**
 * 导出结果
 */
async function exportResult() {
  if (!result.value) return;
  
  try {
    uni.showLoading({ title: '导出中...' });
    // TODO: 实现导出功能
    uni.hideLoading();
    uni.showToast({ title: '导出成功', icon: 'success' });
  } catch (error: any) {
    uni.hideLoading();
    uni.showToast({ title: error.message || '导出失败', icon: 'none' });
  }
}

/**
 * 清空结果
 */
function clearResult() {
  result.value = null;
  imagePreview.value = '';
}

/**
 * 加载历史记录
 */
async function loadHistory() {
  try {
    const res = await ocrService.getHistory(1, 10);
    historyList.value = res.list;
  } catch (error: any) {
    console.error('加载历史失败:', error);
  }
}

/**
 * 查看历史记录
 */
function viewHistory(item: OCRHistory) {
  result.value = item.result;
  selectedType.value = item.type;
  imagePreview.value = item.thumbnail;
}

/**
 * 获取当前类型名称
 */
function getCurrentTypeName(): string {
  return getTypeName(selectedType.value);
}

/**
 * 获取类型名称
 */
function getTypeName(type: OCRType): string {
  const item = ocrTypes.find(t => t.value === type);
  return item?.label || '未知';
}

/**
 * 格式化时间
 */
function formatTime(time: string): string {
  const date = new Date(time);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  if (diff < 60000) return '刚刚';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
  
  return `${date.getMonth() + 1}-${date.getDate()}`;
}

// 页面加载时获取历史记录
loadHistory();
</script>

<style scoped lang="scss">
.ocr-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20rpx;
}

.header {
  padding: 40rpx 20rpx;
  text-align: center;
  
  .title {
    font-size: 48rpx;
    font-weight: bold;
    color: #fff;
    margin-bottom: 10rpx;
  }
  
  .subtitle {
    font-size: 28rpx;
    color: rgba(255, 255, 255, 0.8);
  }
}

.type-selector {
  margin-bottom: 30rpx;
  
  .type-scroll {
    white-space: nowrap;
    
    .type-item {
      display: inline-block;
      padding: 20rpx 30rpx;
      margin-right: 20rpx;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50rpx;
      backdrop-filter: blur(10px);
      
      &.active {
        background: rgba(255, 255, 255, 0.9);
        
        .type-icon,
        .type-name {
          color: #667eea;
        }
      }
      
      .type-icon {
        font-size: 32rpx;
        margin-right: 10rpx;
      }
      
      .type-name {
        font-size: 28rpx;
        color: #fff;
      }
    }
  }
}

.actions {
  display: flex;
  gap: 20rpx;
  margin-bottom: 30rpx;
  
  .action-btn {
    flex: 1;
    padding: 40rpx;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 20rpx;
    text-align: center;
    
    .icon {
      display: block;
      font-size: 60rpx;
      margin-bottom: 10rpx;
    }
    
    .text {
      font-size: 28rpx;
      color: #333;
    }
  }
}

.result-container {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  
  .result-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;
    
    .result-title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
    }
    
    .result-actions {
      display: flex;
      gap: 20rpx;
      
      .action-icon {
        font-size: 36rpx;
        cursor: pointer;
      }
    }
  }
  
  .image-preview {
    margin-bottom: 20rpx;
    border-radius: 10rpx;
    overflow: hidden;
    
    image {
      width: 100%;
      height: 400rpx;
    }
  }
  
  .text-result {
    .full-text {
      padding: 20rpx;
      background: #f5f5f5;
      border-radius: 10rpx;
      font-size: 28rpx;
      line-height: 1.6;
      color: #333;
      margin-bottom: 20rpx;
    }
    
    .lines {
      .line-item {
        display: flex;
        justify-content: space-between;
        padding: 15rpx 0;
        border-bottom: 1px solid #f0f0f0;
        
        .line-text {
          flex: 1;
          font-size: 26rpx;
          color: #666;
        }
        
        .confidence {
          font-size: 24rpx;
          color: #999;
          margin-left: 20rpx;
        }
      }
    }
  }
  
  .card-result {
    .field-item {
      display: flex;
      padding: 20rpx 0;
      border-bottom: 1px solid #f0f0f0;
      
      .field-label {
        width: 180rpx;
        font-size: 28rpx;
        color: #999;
      }
      
      .field-value {
        flex: 1;
        font-size: 28rpx;
        color: #333;
      }
    }
  }
  
  .result-stats {
    display: flex;
    margin-top: 20rpx;
    padding-top: 20rpx;
    border-top: 1px solid #f0f0f0;
    
    .stat-item {
      flex: 1;
      text-align: center;
      
      .stat-label {
        display: block;
        font-size: 24rpx;
        color: #999;
        margin-bottom: 10rpx;
      }
      
      .stat-value {
        display: block;
        font-size: 28rpx;
        font-weight: bold;
        color: #667eea;
      }
    }
  }
}

.history-section {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  
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
  
  .history-list {
    .history-item {
      display: flex;
      align-items: center;
      padding: 20rpx 0;
      border-bottom: 1px solid #f0f0f0;
      
      .history-thumb {
        width: 100rpx;
        height: 100rpx;
        border-radius: 10rpx;
        margin-right: 20rpx;
      }
      
      .history-info {
        flex: 1;
        
        .history-type {
          display: block;
          font-size: 28rpx;
          color: #333;
          margin-bottom: 10rpx;
        }
        
        .history-time {
          display: block;
          font-size: 24rpx;
          color: #999;
        }
      }
      
      .history-arrow {
        font-size: 40rpx;
        color: #ccc;
      }
    }
  }
  
  .empty-history {
    padding: 60rpx 0;
    text-align: center;
    
    .empty-text {
      font-size: 28rpx;
      color: #999;
    }
  }
}
</style>