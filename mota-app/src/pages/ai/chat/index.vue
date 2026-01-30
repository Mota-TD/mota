<template>
  <view class="chat-container">
    <!-- 消息列表 -->
    <scroll-view
      class="message-list"
      scroll-y
      :scroll-into-view="scrollIntoView"
      :scroll-with-animation="true"
    >
      <view v-if="messages.length === 0" class="empty-state">
        <text class="empty-icon">💬</text>
        <text class="empty-text">开始与AI助手对话</text>
        <text class="empty-hint">我可以帮你分析项目、管理任务、预测进度...</text>
      </view>

      <view v-for="(message, index) in messages" :key="message.id" :id="`msg-${index}`">
        <ChatMessage
          :content="message.content"
          :is-user="message.role === 'user'"
          :timestamp="message.timestamp"
          :streaming="message.streaming"
          :user-avatar="userAvatar"
          @regenerate="onRegenerate(index)"
        />
      </view>

      <!-- 占位元素，用于滚动到底部 -->
      <view id="bottom-anchor" style="height: 1px;"></view>
    </scroll-view>

    <!-- 输入框 -->
    <view class="input-container">
      <view class="input-wrapper">
        <textarea
          v-model="inputText"
          class="input"
          placeholder="输入消息..."
          :auto-height="true"
          :maxlength="1000"
          :disabled="sending"
          @confirm="onSend"
        />
        <view class="input-actions">
          <text class="char-count">{{ inputText.length }}/1000</text>
          <button
            class="send-btn"
            :class="{ disabled: !canSend }"
            :disabled="!canSend"
            @click="onSend"
          >
            {{ sending ? '发送中...' : '发送' }}
          </button>
        </view>
      </view>

      <!-- 快捷操作 -->
      <view class="quick-actions">
        <view
          v-for="action in quickActions"
          :key="action.text"
          class="quick-action"
          @click="onQuickAction(action.text)"
        >
          <text class="action-icon">{{ action.icon }}</text>
          <text class="action-text">{{ action.text }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import ChatMessage from '@/components/ChatMessage/index.vue'
import { streamChat } from '@/core/ai/stream'
import { authService } from '@/core/auth'
import type { AIMessage, AIMessageRole } from '@/core/ai/types'

interface Message extends AIMessage {
  streaming?: boolean
}

const messages = ref<Message[]>([])
const inputText = ref('')
const sending = ref(false)
const scrollIntoView = ref('')
const conversationId = ref<string>()

const userAvatar = computed(() => {
  const user = authService.getUser()
  return user?.avatar || '/static/default-avatar.png'
})

const canSend = computed(() => {
  return inputText.value.trim().length > 0 && !sending.value
})

const quickActions = [
  { icon: '📊', text: '分析项目' },
  { icon: '✅', text: '任务建议' },
  { icon: '📈', text: '进度预测' },
  { icon: '⚠️', text: '风险评估' }
]

onLoad((options: any) => {
  conversationId.value = options.conversationId
  if (conversationId.value) {
    loadConversation()
  }
})

const loadConversation = async () => {
  // TODO: 加载历史对话
  uni.showToast({
    title: '加载对话中...',
    icon: 'loading'
  })
}

const onSend = async () => {
  if (!canSend.value) return

  const userMessage = inputText.value.trim()
  inputText.value = ''

  // 添加用户消息
  const userMsg: Message = {
    id: Date.now().toString(),
    role: 'user' as AIMessageRole,
    content: userMessage,
    timestamp: Date.now()
  }
  messages.value.push(userMsg)
  scrollToBottom()

  // 添加AI消息占位
  const aiMsg: Message = {
    id: (Date.now() + 1).toString(),
    role: 'assistant' as AIMessageRole,
    content: '',
    timestamp: Date.now(),
    streaming: true
  }
  messages.value.push(aiMsg)
  scrollToBottom()

  sending.value = true

  try {
    await streamChat(userMessage, {
      conversationId: conversationId.value,
      onChunk: (chunk: string) => {
        // 更新AI消息内容
        const lastMsg = messages.value[messages.value.length - 1]
        if (lastMsg && lastMsg.role === 'assistant') {
          lastMsg.content += chunk
          scrollToBottom()
        }
      },
      onComplete: () => {
        // 完成流式输出
        const lastMsg = messages.value[messages.value.length - 1]
        if (lastMsg && lastMsg.role === 'assistant') {
          lastMsg.streaming = false
        }
        sending.value = false
      },
      onError: (error: Error) => {
        uni.showToast({
          title: error.message || '发送失败',
          icon: 'none'
        })
        // 移除失败的AI消息
        messages.value.pop()
        sending.value = false
      }
    })
  } catch (error: any) {
    console.error('发送消息失败:', error)
  }
}

const onQuickAction = (text: string) => {
  inputText.value = text
  onSend()
}

const onRegenerate = async (index: number) => {
  if (index < 1) return

  // 获取上一条用户消息
  const userMsg = messages.value[index - 1]
  if (userMsg.role !== 'user') return

  // 移除当前AI消息
  messages.value.splice(index, 1)

  // 重新发送
  inputText.value = userMsg.content
  await onSend()
}

const scrollToBottom = () => {
  nextTick(() => {
    scrollIntoView.value = 'bottom-anchor'
  })
}
</script>

<style lang="scss" scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #ffffff;
}

.message-list {
  flex: 1;
  overflow-y: auto;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 48rpx;
  text-align: center;
}

.empty-icon {
  font-size: 120rpx;
  margin-bottom: 32rpx;
}

.empty-text {
  font-size: 32rpx;
  font-weight: 500;
  color: #1F2937;
  margin-bottom: 16rpx;
}

.empty-hint {
  font-size: 28rpx;
  color: #9CA3AF;
  line-height: 1.6;
}

.input-container {
  border-top: 1rpx solid #E5E7EB;
  background: #ffffff;
  padding: 16rpx 32rpx 32rpx;
}

.input-wrapper {
  background: #F9FAFB;
  border-radius: 16rpx;
  padding: 16rpx;
  margin-bottom: 16rpx;
}

.input {
  width: 100%;
  min-height: 80rpx;
  max-height: 200rpx;
  font-size: 28rpx;
  line-height: 1.6;
  color: #1F2937;
  background: transparent;
  border: none;
}

.input-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16rpx;
}

.char-count {
  font-size: 24rpx;
  color: #9CA3AF;
}

.send-btn {
  padding: 12rpx 32rpx;
  background: linear-gradient(90deg, #10B981 0%, #059669 100%);
  border-radius: 8rpx;
  font-size: 28rpx;
  font-weight: 500;
  color: #ffffff;
  border: none;

  &.disabled {
    opacity: 0.5;
  }
}

.quick-actions {
  display: flex;
  gap: 16rpx;
  overflow-x: auto;
  padding-bottom: 8rpx;

  &::-webkit-scrollbar {
    display: none;
  }
}

.quick-action {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 20rpx;
  background: #F3F4F6;
  border-radius: 24rpx;
  font-size: 24rpx;
  color: #6B7280;

  &:active {
    background: #E5E7EB;
  }
}

.action-icon {
  font-size: 28rpx;
}
</style>