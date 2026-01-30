<template>
  <view class="search-page">
    <view class="search-header">
      <view class="search-box">
        <text>🔍</text>
        <input v-model="keyword" placeholder="搜索..." />
      </view>
    </view>
    <view class="search-content">
      <text>搜索功能开发中...</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const keyword = ref('')
</script>

<style scoped>
.search-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.search-header {
  padding: 20rpx;
  background: #fff;
}

.search-box {
  display: flex;
  align-items: center;
  background: #f5f5f5;
  border-radius: 50rpx;
  padding: 0 30rpx;
}

.search-content {
  padding: 40rpx;
  text-align: center;
}
</style>