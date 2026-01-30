<template>
  <view class="message-container">
    <!-- 头部操作栏 -->
    <view class="header-bar">
      <view class="unread-badge">
        <text class="badge-text">{{ unreadCount }} 条未读</text>
      </view>
      <view class="header-actions">
        <text class="action-btn" @click="onMarkAllRead">全部已读</text>
        <text class="action-btn" @click="onClearAll">清空</text>
      </view>
    </view>

    <!-- 消息类型筛选 -->
    <scroll-view class="type-filter" scroll-x>
      <view
        v-for="type in messageTypes"
        :key="type.value"
        class="type-tab"
        :class="{ active: currentType === type.value }"
        @click="onTypeChange(type.value)"
      >
        <text class="type-icon">{{ type.icon }}</text>
        <text class="type-label">{{ type.label }}</text>
      </view>
    </scroll-view>

    <!-- 消息列表 -->
    <scroll-view
      class="message-list"
      scroll-y
      @scrolltolower="onLoadMore"
    >
      <view v-if="loading && messages.length === 0" class="loading-state">
        <text class="loading-text">加载中...</text>
      </view>

      <view v-else-if="messages.length === 0" class="empty-state">
        <text class="empty-icon">📭</text>
        <text class="empty-text">暂无消息</text>
      </view>

      <view v-else>
        <view
          v-for="message in messages"
          :key="message.id"
          class="message-item"
          :class="{ unread: message.status === 'unread' }"
          @click="onMessageClick(message)"
        >
          <view class="message-avatar">
            <image
              v-if="message.senderAvatar"
              :src="message.senderAvatar"
              class="avatar"
              mode="aspectFill"
            />
            <view v-else class="avatar-placeholder">
              {{ getMessageIcon(message.type) }}
            </view>
          </view>

          <view class="message-content">
            <view class="message-header">
              <text class="message-title">{{ message.title }}</text>
              <text class="message-time">{{ formatTime(message.createdAt) }}</text>
            </view>
            <text class="message-text">{{ message.content }}</text>
            <view v-if="message.senderName" class="message-meta">
              <text class="meta-text">来自: {{ message.senderName }}</text>
            </view>
          </view>

          <view v-if="message.status === 'unread'" class="unread-dot"></view>
        </view>

        <view v-if="hasMore" class="load-more">
          <text class="load-more-text">{{ loadingMore ? '加载中...' : '加载更多' }}</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { messageService, MessageType, MessageStatus } from '@/core/message'
import type { Message } from '@/core/message'

const messages = ref<Message[]>([])
const unreadCount = ref(0)
const loading = ref(false)
const loadingMore = ref(false)
const hasMore = ref(true)
const page = ref(1)
const pageSize = 20
const currentType = ref<string>('')

const messageTypes = [
  { label: '全部', value: '', icon: '📬' },
  { label: '系统', value: MessageType.SYSTEM, icon: '🔔' },
  { label: '任务', value: MessageType.TASK_ASSIGNED, icon: '✅' },
  { label: '项目', value: MessageType.PROJECT_INVITE, icon: '📁' },
  { label: '@我', value: MessageType.MENTION, icon: '💬' },
  { label: '审批', value: MessageType.APPROVAL, icon: '📝' }
]

onMounted(() => {
  loadMessages()
  loadUnreadCount()
})

const loadMessages = async (refresh = false) => {
  if (refresh) {
    page.value = 1
    messages.value = []
    hasMore.value = true
  }

  if (loading.value || loadingMore.value) return

  if (page.value === 1) {
    loading.value = true
  } else {
    loadingMore.value = true
  }

  try {
    const response = await messageService.getMessages({
      type: currentType.value as MessageType || undefined,
      page: page.value,
      pageSize
    })

    if (refresh) {
      messages.value = response.list
    } else {
      messages.value.push(...response.list)
    }

    unreadCount.value = response.unreadCount
    hasMore.value = messages.value.length < response.total
  } catch (error: any) {
    uni.showToast({
      title: error.message || '加载失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

const loadUnreadCount = async () => {
  try {
    unreadCount.value = await messageService.getUnreadCount()
  } catch (error) {
    console.error('加载未读数失败:', error)
  }
}

const onLoadMore = () => {
  if (hasMore.value && !loading.value && !loadingMore.value) {
    page.value++
    loadMessages()
  }
}

const onTypeChange = (type: string) => {
  currentType.value = type
  loadMessages(true)
}

const onMessageClick = async (message: Message) => {
  // 标记为已读
  if (message.status === MessageStatus.UNREAD) {
    try {
      await messageService.markAsRead(message.id)
      message.status = MessageStatus.READ
      unreadCount.value = Math.max(0, unreadCount.value - 1)
    } catch (error) {
      console.error('标记已读失败:', error)
    }
  }

  // 跳转到相关页面
  if (message.relatedType && message.relatedId) {
    const urlMap: Record<string, string> = {
      task: `/pages/task/detail/index?id=${message.relatedId}`,
      project: `/pages/project/detail/index?id=${message.relatedId}`
    }
    const url = urlMap[message.relatedType]
    if (url) {
      uni.navigateTo({ url })
    }
  }
}

const onMarkAllRead = async () => {
  uni.showModal({
    title: '确认',
    content: '确定要标记全部消息为已读吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await messageService.markAllAsRead()
          messages.value.forEach(msg => {
            msg.status = MessageStatus.READ
          })
          unreadCount.value = 0
          uni.showToast({
            title: '已全部标记为已读',
            icon: 'success'
          })
        } catch (error: any) {
          uni.showToast({
            title: error.message || '操作失败',
            icon: 'none'
          })
        }
      }
    }
  })
}

const onClearAll = () => {
  uni.showModal({
    title: '确认',
    content: '确定要清空所有消息吗？此操作不可恢复。',
    success: async (res) => {
      if (res.confirm) {
        try {
          await messageService.clearAll()
          messages.value = []
          unreadCount.value = 0
          uni.showToast({
            title: '已清空',
            icon: 'success'
          })
        } catch (error: any) {
          uni.showToast({
            title: error.message || '操作失败',
            icon: 'none'
          })
        }
      }
    }
  })
}

const getMessageIcon = (type: MessageType): string => {
  const iconMap: Record<MessageType, string> = {
    [MessageType.SYSTEM]: '🔔',
    [MessageType.TASK_ASSIGNED]: '✅',
    [MessageType.TASK_UPDATED]: '📝',
    [MessageType.TASK_COMMENT]: '💬',
    [MessageType.PROJECT_INVITE]: '📁',
    [MessageType.PROJECT_UPDATED]: '📊',
    [MessageType.MENTION]: '💬',
    [MessageType.APPROVAL]: '📝'
  }
  return iconMap[type] || '📬'
}

const formatTime = (dateStr: string): string => {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour

  if (diff < minute) {
    return '刚刚'
  } else if (diff < hour) {
    return `${Math.floor(diff / minute)}分钟前`
  } else if (diff < day) {
    return `${Math.floor(diff / hour)}小时前`
  } else if (diff < 7 * day) {
    return `${Math.floor(diff / day)}天前`
  } else {
    const month = date.getMonth() + 1
    const day = date.getDate()
    return `${month}月${day}日`
  }
}
</script>

<style lang="scss" scoped>
.message-container {
  min-height: 100vh;
  background: #F9FAFB;
}

.header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 32rpx;
  background: #ffffff;
  border-bottom: 1rpx solid #E5E7EB;
}

.unread-badge {
  padding: 8rpx 16rpx;
  background: #FEE2E2;
  border-radius: 24rpx;
}

.badge-text {
  font-size: 24rpx;
  color: #EF4444;
  font-weight: 500;
}

.header-actions {
  display: flex;
  gap: 24rpx;
}

.action-btn {
  font-size: 28rpx;
  color: #10B981;
}

.type-filter {
  white-space: nowrap;
  padding: 16rpx 32rpx;
  background: #ffffff;
  border-bottom: 1rpx solid #E5E7EB;
}

.type-tab {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 20rpx;
  margin-right: 16rpx;
  border-radius: 12rpx;

  &.active {
    background: #ECFDF5;

    .type-label {
      color: #10B981;
      font-weight: 500;
    }
  }
}

.type-icon {
  font-size: 32rpx;
}

.type-label {
  font-size: 24rpx;
  color: #6B7280;
}

.message-list {
  flex: 1;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 48rpx;
  text-align: center;
}

.loading-text {
  font-size: 28rpx;
  color: #9CA3AF;
}

.empty-icon {
  font-size: 120rpx;
  margin-bottom: 32rpx;
}

.empty-text {
  font-size: 32rpx;
  color: #6B7280;
}

.message-item {
  position: relative;
  display: flex;
  gap: 16rpx;
  padding: 24rpx 32rpx;
  background: #ffffff;
  border-bottom: 1rpx solid #F3F4F6;

  &.unread {
    background: #F0FDF4;
  }

  &:active {
    background: #F9FAFB;
  }
}

.message-avatar {
  flex-shrink: 0;
}

.avatar,
.avatar-placeholder {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
}

.avatar-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #10B981 0%, #059669 100%);
  font-size: 40rpx;
}

.message-content {
  flex: 1;
  min-width: 0;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8rpx;
}

.message-title {
  flex: 1;
  font-size: 30rpx;
  font-weight: 500;
  color: #1F2937;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.message-time {
  flex-shrink: 0;
  font-size: 24rpx;
  color: #9CA3AF;
  margin-left: 16rpx;
}

.message-text {
  font-size: 28rpx;
  color: #6B7280;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 8rpx;
}

.message-meta {
  font-size: 24rpx;
  color: #9CA3AF;
}

.unread-dot {
  position: absolute;
  top: 32rpx;
  right: 32rpx;
  width: 16rpx;
  height: 16rpx;
  background: #EF4444;
  border-radius: 50%;
}

.load-more {
  padding: 32rpx;
  text-align: center;
}

.load-more-text {
  font-size: 28rpx;
  color: #9CA3AF;
}
</style>