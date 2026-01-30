<template>
  <view class="container">
    <view class="header">
      <text class="title">摩塔 Mota</text>
      <text class="subtitle">AI驱动的项目管理</text>
    </view>

    <view class="stats">
      <view class="stat-item">
        <text class="stat-value">0</text>
        <text class="stat-label">项目</text>
      </view>
      <view class="stat-item">
        <text class="stat-value">0</text>
        <text class="stat-label">任务</text>
      </view>
      <view class="stat-item">
        <text class="stat-value">0</text>
        <text class="stat-label">消息</text>
      </view>
    </view>

    <view class="welcome-card">
      <text class="welcome-text">欢迎使用摩塔移动端</text>
      <text class="welcome-desc">项目初始化完成，开始您的高效协作之旅</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app'

onLoad(() => {
  console.log('首页加载')
})
</script>

<style lang="scss" scoped>
.container {
  padding: 32rpx;
  min-height: 100vh;
  background: linear-gradient(180deg, #10B981 0%, #ffffff 40%);
}

.header {
  text-align: center;
  padding: 80rpx 0 60rpx;
}

.title {
  display: block;
  font-size: 48rpx;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 16rpx;
}

.subtitle {
  display: block;
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.9);
}

.stats {
  display: flex;
  justify-content: space-around;
  background: #ffffff;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 40rpx;
  font-weight: bold;
  color: #10B981;
  margin-bottom: 8rpx;
}

.stat-label {
  font-size: 24rpx;
  color: #6B7280;
}

.welcome-card {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
}

.welcome-text {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  color: #1F2937;
  margin-bottom: 16rpx;
}

.welcome-desc {
  display: block;
  font-size: 28rpx;
  color: #6B7280;
  line-height: 1.6;
}
</style>