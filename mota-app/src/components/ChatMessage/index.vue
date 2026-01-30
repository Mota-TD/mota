<template>
  <view class="chat-message" :class="{ 'is-user': isUser }">
    <view class="message-avatar">
      <image v-if="isUser" :src="userAvatar" class="avatar" mode="aspectFill" />
      <view v-else class="ai-avatar">🤖</view>
    </view>
    
    <view class="message-content">
      <view class="message-header">
        <text class="message-name">{{ isUser ? '我' : 'AI助手' }}</text>
        <text class="message-time">{{ formattedTime }}</text>
      </view>
      
      <view class="message-body">
        <text class="message-text" :class="{ 'streaming': streaming }">{{ content }}</text>
        <view v-if="streaming" class="cursor">|</view>
      </view>
      
      <view v-if="!isUser && !streaming" class="message-actions">
        <view class="action-btn" @click="onCopy">
          <text class="icon">📋</text>
          <text class="label">复制</text>
        </view>
        <view class="action-btn" @click="onRegenerate">
          <text class="icon">🔄</text>
          <text class="label">重新生成</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  content: string
  isUser: boolean
  timestamp?: number
  streaming?: boolean
  userAvatar?: string
}

const props = withDefaults(defineProps<Props>(), {
  streaming: false,
  userAvatar: '/static/default-avatar.png'
})

const emit = defineEmits<{
  copy: []
  regenerate: []
}>()

const formattedTime = computed(() => {
  if (!props.timestamp) return ''
  const date = new Date(props.timestamp)
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
})

const onCopy = () => {
  uni.setClipboardData({
    data: props.content,
    success: () => {
      uni.showToast({
        title: '已复制',
        icon: 'success'
      })
    }
  })
  emit('copy')
}

const onRegenerate = () => {
  emit('regenerate')
}
</script>

<style lang="scss" scoped>
.chat-message {
  display: flex;
  padding: 24rpx 32rpx;
  gap: 16rpx;

  &.is-user {
    flex-direction: row-reverse;

    .message-content {
      align-items: flex-end;
    }

    .message-body {
      background: linear-gradient(135deg, #10B981 0%, #059669 100%);
      color: #ffffff;
    }
  }
}

.message-avatar {
  flex-shrink: 0;
}

.avatar {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
}

.ai-avatar {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
}

.message-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  min-width: 0;
}

.message-header {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.message-name {
  font-size: 24rpx;
  font-weight: 500;
  color: #6B7280;
}

.message-time {
  font-size: 20rpx;
  color: #9CA3AF;
}

.message-body {
  position: relative;
  background: #F3F4F6;
  border-radius: 16rpx;
  padding: 20rpx 24rpx;
  max-width: 80%;
  word-wrap: break-word;
  word-break: break-all;
}

.message-text {
  font-size: 28rpx;
  line-height: 1.6;
  color: #1F2937;
  white-space: pre-wrap;

  &.streaming {
    display: inline;
  }
}

.cursor {
  display: inline-block;
  width: 2rpx;
  height: 32rpx;
  background: #10B981;
  margin-left: 4rpx;
  animation: blink 1s infinite;
  vertical-align: middle;
}

@keyframes blink {
  0%, 50% {
    opacity: 1;
  }
  51%, 100% {
    opacity: 0;
  }
}

.message-actions {
  display: flex;
  gap: 24rpx;
  margin-top: 8rpx;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 8rpx 16rpx;
  background: #F9FAFB;
  border-radius: 8rpx;
  font-size: 24rpx;
  color: #6B7280;

  .icon {
    font-size: 28rpx;
  }

  &:active {
    background: #F3F4F6;
  }
}
</style>