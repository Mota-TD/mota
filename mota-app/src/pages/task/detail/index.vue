<template>
  <view class="container">
    <text class="title">任务详情</text>
  </view>
</template>

<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app'

onLoad(() => {
  console.log('任务详情页加载')
})
</script>

<style lang="scss" scoped>
.container {
  padding: 32rpx;
}

.title {
  font-size: 32rpx;
  font-weight: bold;
}
</style>