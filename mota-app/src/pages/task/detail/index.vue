<template>
  <view class="task-detail-page">
    <!-- 顶部导航 -->
    <view class="nav-bar">
      <view class="nav-left">
        <view class="back-btn" @click="goBack">
          <text class="iconfont icon-arrow-left"></text>
        </view>
      </view>
      <view class="nav-title">任务详情</view>
      <view class="nav-right">
        <view class="action-btn" @click="showActionSheet">
          <text class="iconfont icon-more"></text>
        </view>
      </view>
    </view>

    <!-- 加载状态 -->
    <view v-if="isLoading" class="loading-container">
      <view class="loading-spinner"></view>
      <text class="loading-text">加载中...</text>
    </view>

    <!-- 任务详情 -->
    <view v-else-if="currentTask" class="task-content">
      <scroll-view scroll-y class="scroll-content">
        <!-- 任务标题和状态 -->
        <view class="task-header">
          <view class="status-badge" :class="getStatusClass(currentTask.status)">
            {{ getStatusText(currentTask.status) }}
          </view>
          <view class="task-title">{{ currentTask.title }}</view>
          <view class="priority-tag" :class="`priority-${currentTask.priority}`">
            {{ getPriorityText(currentTask.priority) }}
          </view>
        </view>

        <!-- 任务基本信息 -->
        <view class="info-section">
          <view class="section-title">基本信息</view>
          <view class="info-grid">
            <view class="info-item">
              <text class="info-label">负责人</text>
              <text class="info-value">{{ getAssigneeName(currentTask.assignee) }}</text>
            </view>
            <view class="info-item">
              <text class="info-label">截止时间</text>
              <text class="info-value" :class="{ 'overdue': isOverdue }">
                {{ formatDate(currentTask.dueDate) }}
                <text v-if="isOverdue" class="overdue-text">（已逾期）</text>
              </text>
            </view>
            <view class="info-item">
              <text class="info-label">预估工时</text>
              <text class="info-value">{{ currentTask.estimatedHours || 0 }} 小时</text>
            </view>
            <view class="info-item">
              <text class="info-label">实际工时</text>
              <text class="info-value">{{ currentTask.actualHours || 0 }} 小时</text>
            </view>
          </view>
        </view>

        <!-- 任务描述 -->
        <view v-if="currentTask.description" class="description-section">
          <view class="section-title">任务描述</view>
          <view class="description-content">
            {{ currentTask.description }}
          </view>
        </view>

        <!-- 标签 -->
        <view v-if="currentTask.tags.length > 0" class="tags-section">
          <view class="section-title">标签</view>
          <view class="tags-container">
            <view 
              v-for="tag in currentTask.tags" 
              :key="tag" 
              class="tag"
            >
              {{ tag }}
            </view>
          </view>
        </view>

        <!-- 附件 -->
        <view v-if="currentTask.attachments.length > 0" class="attachments-section">
          <view class="section-title">附件</view>
          <view class="attachments-container">
            <view 
              v-for="attachment in currentTask.attachments" 
              :key="attachment" 
              class="attachment-item"
              @click="previewAttachment(attachment)"
            >
              <text class="iconfont icon-attachment"></text>
              <text class="attachment-name">{{ getFileName(attachment) }}</text>
            </view>
          </view>
        </view>

        <!-- 评论区域 -->
        <view class="comments-section">
          <view class="section-title">
            评论 
            <text class="comment-count">({{ currentTask.comments.length }})</text>
          </view>
          
          <!-- 添加评论 -->
          <view class="add-comment">
            <textarea 
              v-model="newComment" 
              placeholder="添加评论..." 
              class="comment-input"
              maxlength="500"
            />
            <button 
              :disabled="!newComment.trim()" 
              class="comment-submit-btn"
              @click="addComment"
            >
              发送
            </button>
          </view>

          <!-- 评论列表 -->
          <view v-if="currentTask.comments.length > 0" class="comments-list">
            <view 
              v-for="comment in currentTask.comments" 
              :key="comment.id" 
              class="comment-item"
            >
              <view class="comment-header">
                <view class="comment-author">{{ getCommentAuthor(comment.userId) }}</view>
                <view class="comment-time">{{ formatTime(comment.timestamp) }}</view>
              </view>
              <view class="comment-content">{{ comment.content }}</view>
            </view>
          </view>
          
          <view v-else class="empty-comments">
            <text class="empty-text">暂无评论</text>
          </view>
        </view>
      </scroll-view>

      <!-- 底部操作栏 -->
      <view class="action-bar">
        <button 
          v-if="currentTask.status !== 'completed' && currentTask.status !== 'cancelled'"
          class="action-btn primary"
          @click="updateTaskStatus('completed')"
        >
          标记完成
        </button>
        
        <button 
          v-if="currentTask.status === 'todo'"
          class="action-btn secondary"
          @click="updateTaskStatus('inProgress')"
        >
          开始处理
        </button>
        
        <button 
          v-if="currentTask.status === 'inProgress'"
          class="action-btn secondary"
          @click="updateTaskStatus('review')"
        >
          提交审核
        </button>
        
        <button 
          v-if="currentTask.status === 'review'"
          class="action-btn secondary"
          @click="updateTaskStatus('inProgress')"
        >
          返回修改
        </button>
        
        <button 
          class="action-btn danger"
          @click="cancelTask"
        >
          取消任务
        </button>
      </view>
    </view>

    <!-- 空状态 -->
    <view v-else class="empty-state">
      <text class="empty-icon iconfont icon-task"></text>
      <text class="empty-text">任务不存在</text>
      <button class="empty-btn" @click="goBack">返回列表</button>
    </view>

    <!-- 操作菜单 -->
    <uni-popup ref="actionPopup" type="bottom">
      <view class="action-sheet">
        <view class="action-item" @click="editTask">编辑任务</view>
        <view class="action-item" @click="shareTask">分享任务</view>
        <view class="action-item danger" @click="deleteTask">删除任务</view>
        <view class="action-item cancel" @click="closeActionSheet">取消</view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useTaskStore } from '@/stores/task'
import { useUserStore } from '@/stores/user'
import { notificationService } from '@/services/notification'

// 状态
const taskId = ref('')
const newComment = ref('')
const isLoading = ref(false)
const actionPopup = ref()

// Store
const taskStore = useTaskStore()
const userStore = useUserStore()

// 离线功能
const { addOperation, isOnline } = useOffline()

// 通知服务
const { sendNotification, sendTaskNotification } = useNotification()

// 计算属性
const currentTask = computed(() => taskStore.currentTask)

const isOverdue = computed(() => {
  if (!currentTask.value?.dueDate || currentTask.value.status === 'completed' || currentTask.value.status === 'cancelled') {
    return false
  }
  return new Date(currentTask.value.dueDate) < new Date()
})

// 生命周期
onLoad((options) => {
  if (options.id) {
    taskId.value = options.id
    loadTaskDetail()
  }
})

onMounted(() => {
  if (!taskId.value) {
    uni.showToast({
      title: '任务ID不存在',
      icon: 'error'
    })
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  }
})

// 方法
const loadTaskDetail = async () => {
  isLoading.value = true
  
  try {
    taskStore.setCurrentTask(taskId.value)
    
    // 如果当前任务不存在，尝试从列表加载
    if (!taskStore.currentTask) {
      await taskStore.loadTasks()
      taskStore.setCurrentTask(taskId.value)
    }
    
    if (!taskStore.currentTask) {
      uni.showToast({
        title: '任务不存在',
        icon: 'error'
      })
    }
    
  } catch (error) {
    console.error('加载任务详情失败:', error)
    uni.showToast({
      title: '加载失败',
      icon: 'error'
    })
  } finally {
    isLoading.value = false
  }
}

const goBack = () => {
  uni.navigateBack()
}

const showActionSheet = () => {
  actionPopup.value.open()
}

const closeActionSheet = () => {
  actionPopup.value.close()
}

const editTask = () => {
  closeActionSheet()
  uni.navigateTo({
    url: `/pages/task/edit/index?id=${taskId.value}`
  })
}

const shareTask = () => {
  closeActionSheet()
  uni.showToast({
    title: '分享功能开发中',
    icon: 'none'
  })
}

const deleteTask = async () => {
  closeActionSheet()
  
  uni.showModal({
    title: '确认删除',
    content: '确定要删除这个任务吗？此操作不可撤销。',
    success: async (res) => {
      if (res.confirm) {
        try {
          // 如果离线，添加到离线队列
          if (!isOnline.value) {
            const operationId = addOperation('delete', 'task', {
              id: taskId.value
            })
            
            sendNotification({
              title: '删除操作已保存',
              message: '网络恢复后将自动同步到服务器',
              type: 'info',
              priority: 'normal',
              category: 'system'
            })
            
            // 立即从本地移除任务
            taskStore.deleteTask(taskId.value)
          } else {
            // 在线状态下直接删除
            const result = await taskStore.deleteTask(taskId.value)
            
            if (result.success) {
              sendNotification({
                title: '任务已删除',
                message: `任务 "${currentTask.value?.title}" 已删除`,
                type: 'success',
                priority: 'normal',
                category: 'task'
              })
            } else {
              throw new Error(result.error)
            }
          }
          
          uni.showToast({
            title: '删除成功',
            icon: 'success'
          })
          
          setTimeout(() => {
            uni.navigateBack()
          }, 1500)
          
        } catch (error) {
          console.error('删除任务失败:', error)
          uni.showToast({
            title: '删除失败',
            icon: 'error'
          })
        }
      }
    }
  })
}

const updateTaskStatus = async (status: string) => {
  try {
    // 如果离线，添加到离线队列
    if (!isOnline.value) {
      const operationId = addOperation('update', 'task', {
        id: taskId.value,
        status: status
      })
      
      sendNotification({
        title: '操作已保存',
        message: '网络恢复后将自动同步到服务器',
        type: 'info',
        priority: 'normal',
        category: 'system'
      })
    } else {
      // 在线状态下直接更新
      const result = await taskStore.setTaskStatus(taskId.value, status as any)
      
      if (result.success) {
        sendTaskNotification(taskId.value, 'updated', { status })
      } else {
        throw new Error(result.error)
      }
    }
    
    uni.showToast({
      title: '状态更新成功',
      icon: 'success'
    })
    
  } catch (error) {
    console.error('更新任务状态失败:', error)
    uni.showToast({
      title: '更新失败',
      icon: 'error'
    })
  }
}

const cancelTask = async () => {
  uni.showModal({
    title: '确认取消',
    content: '确定要取消这个任务吗？',
    success: async (res) => {
      if (res.confirm) {
        await updateTaskStatus('cancelled')
      }
    }
  })
}

const addComment = async () => {
  if (!newComment.value.trim()) return
  
  try {
    const commentData = {
      userId: userStore.currentUser?.id || 'anonymous',
      content: newComment.value.trim()
    }
    
    // 如果离线，添加到离线队列
    if (!isOnline.value) {
      const operationId = addOperation('create', 'comment', {
        taskId: taskId.value,
        comment: commentData.content
      })
      
      // 立即添加到本地
      taskStore.addComment(taskId.value, commentData)
      
      sendNotification({
        title: '评论已保存',
        message: '网络恢复后将自动同步到服务器',
        type: 'info',
        priority: 'low',
        category: 'system'
      })
    } else {
      // 在线状态下直接添加
      const result = await taskStore.addComment(taskId.value, commentData)
      
      if (!result.success) {
        throw new Error('添加评论失败')
      }
    }
    
    newComment.value = ''
    uni.showToast({
      title: '评论成功',
      icon: 'success'
    })
    
  } catch (error) {
    console.error('添加评论失败:', error)
    uni.showToast({
      title: '评论失败',
      icon: 'error'
    })
  }
}

const previewAttachment = (url: string) => {
  uni.showToast({
    title: '预览功能开发中',
    icon: 'none'
  })
}

// 工具函数
const getStatusClass = (status: string) => {
  const statusClasses = {
    todo: 'status-todo',
    inProgress: 'status-progress',
    review: 'status-review',
    completed: 'status-completed',
    cancelled: 'status-cancelled'
  }
  return statusClasses[status as keyof typeof statusClasses] || 'status-todo'
}

const getStatusText = (status: string) => {
  const statusTexts = {
    todo: '待处理',
    inProgress: '进行中',
    review: '审核中',
    completed: '已完成',
    cancelled: '已取消'
  }
  return statusTexts[status as keyof typeof statusTexts] || '未知状态'
}

const getPriorityText = (priority: string) => {
  const priorityTexts = {
    low: '低',
    medium: '中',
    high: '高'
  }
  return priorityTexts[priority as keyof typeof priorityTexts] || '未知'
}

const getAssigneeName = (assigneeId?: string) => {
  if (!assigneeId) return '未分配'
  const user = userStore.users.find(u => u.id === assigneeId)
  return user?.name || '未知用户'
}

const getCommentAuthor = (userId: string) => {
  const user = userStore.users.find(u => u.id === userId)
  return user?.name || '匿名用户'
}

const formatDate = (date?: Date) => {
  if (!date) return '未设置'
  return new Date(date).toLocaleDateString('zh-CN')
}

const formatTime = (date: Date) => {
  return new Date(date).toLocaleString('zh-CN')
}

const getFileName = (url: string) => {
  return url.split('/').pop() || '未知文件'
}
</script>

<style lang="scss" scoped>
.task-detail-page {
  min-height: 100vh;
  background-color: #f8fafc;
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 30rpx;
  background: white;
  border-bottom: 1rpx solid #e5e7eb;
  
  .nav-left, .nav-right {
    flex: 1;
  }
  
  .nav-title {
    font-size: 36rpx;
    font-weight: 600;
    color: #1f2937;
  }
  
  .back-btn, .action-btn {
    padding: 20rpx;
    .iconfont {
      font-size: 36rpx;
      color: #6b7280;
    }
  }
  
  .nav-right {
    text-align: right;
  }
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 200rpx 0;
  
  .loading-spinner {
    width: 60rpx;
    height: 60rpx;
    border: 6rpx solid #f3f3f3;
    border-top: 6rpx solid #10b981;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 30rpx;
  }
  
  .loading-text {
    font-size: 28rpx;
    color: #6b7280;
  }
}

.task-content {
  flex: 1;
  
  .scroll-content {
    height: calc(100vh - 200rpx);
    padding-bottom: 160rpx;
  }
}

.task-header {
  background: white;
  padding: 40rpx 30rpx;
  border-bottom: 1rpx solid #e5e7eb;
  
  .status-badge {
    display: inline-block;
    padding: 8rpx 16rpx;
    border-radius: 20rpx;
    font-size: 24rpx;
    font-weight: 500;
    margin-bottom: 20rpx;
    
    &.status-todo { background: #f3f4f6; color: #6b7280; }
    &.status-progress { background: #dbeafe; color: #1d4ed8; }
    &.status-review { background: #fef3c7; color: #d97706; }
    &.status-completed { background: #d1fae5; color: #065f46; }
    &.status-cancelled { background: #f3f4f6; color: #6b7280; }
  }
  
  .task-title {
    font-size: 40rpx;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 20rpx;
    line-height: 1.4;
  }
  
  .priority-tag {
    display: inline-block;
    padding: 8rpx 16rpx;
    border-radius: 20rpx;
    font-size: 24rpx;
    font-weight: 500;
    
    &.priority-low { background: #d1fae5; color: #065f46; }
    &.priority-medium { background: #fef3c7; color: #d97706; }
    &.priority-high { background: #fee2e2; color: #dc2626; }
  }
}

.info-section, .description-section, .tags-section, .attachments-section, .comments-section {
  background: white;
  margin-top: 20rpx;
  padding: 30rpx;
  
  .section-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 20rpx;
    
    .comment-count {
      font-size: 28rpx;
      color: #6b7280;
      font-weight: normal;
    }
  }
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20rpx;
  
  .info-item {
    .info-label {
      display: block;
      font-size: 28rpx;
      color: #6b7280;
      margin-bottom: 8rpx;
    }
    
    .info-value {
      font-size: 28rpx;
      color: #1f2937;
      font-weight: 500;
      
      &.overdue {
        color: #dc2626;
        
        .overdue-text {
          font-size: 24rpx;
          color: #dc2626;
        }
      }
    }
  }
}

.description-content {
  font-size: 28rpx;
  line-height: 1.6;
  color: #4b5563;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  
  .tag {
    padding: 12rpx 20rpx;
    background: #f3f4f6;
    color: #6b7280;
    border-radius: 20rpx;
    font-size: 24rpx;
  }
}

.attachments-container {
  .attachment-item {
    display: flex;
    align-items: center;
    padding: 20rpx;
    background: #f8fafc;
    border-radius: 12rpx;
    margin-bottom: 16rpx;
    
    .iconfont {
      font-size: 32rpx;
      color: #6b7280;
      margin-right: 16rpx;
    }
    
    .attachment-name {
      font-size: 28rpx;
      color: #4b5563;
    }
  }
}

.add-comment {
  background: #f8fafc;
  border-radius: 12rpx;
  padding: 20rpx;
  margin-bottom: 30rpx;
  
  .comment-input {
    width: 100%;
    min-height: 120rpx;
    background: white;
    border: 1rpx solid #e5e7eb;
    border-radius: 8rpx;
    padding: 20rpx;
    font-size: 28rpx;
    margin-bottom: 20rpx;
  }
  
  .comment-submit-btn {
    background: #10b981;
    color: white;
    border: none;
    border-radius: 8rpx;
    padding: 20rpx 40rpx;
    font-size: 28rpx;
    
    &:disabled {
      background: #9ca3af;
      opacity: 0.6;
    }
  }
}

.comments-list {
  .comment-item {
    padding: 20rpx 0;
    border-bottom: 1rpx solid #f3f4f6;
    
    &:last-child {
      border-bottom: none;
    }
    
    .comment-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12rpx;
      
      .comment-author {
        font-size: 28rpx;
        font-weight: 500;
        color: #1f2937;
      }
      
      .comment-time {
        font-size: 24rpx;
        color: #9ca3af;
      }
    }
    
    .comment-content {
      font-size: 28rpx;
      line-height: 1.5;
      color: #4b5563;
    }
  }
}

.empty-comments {
  text-align: center;
  padding: 60rpx 0;
  color: #9ca3af;
  font-size: 28rpx;
}

.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  padding: 20rpx 30rpx;
  border-top: 1rpx solid #e5e7eb;
  display: flex;
  gap: 20rpx;
  
  .action-btn {
    flex: 1;
    padding: 24rpx;
    border: none;
    border-radius: 8rpx;
    font-size: 28rpx;
    font-weight: 500;
    
    &.primary {
      background: #10b981;
      color: white;
    }
    
    &.secondary {
      background: #3b82f6;
      color: white;
    }
    
    &.danger {
      background: #ef4444;
      color: white;
    }
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 200rpx 40rpx;
  text-align: center;
  
  .empty-icon {
    font-size: 120rpx;
    color: #d1d5db;
    margin-bottom: 40rpx;
  }
  
  .empty-text {
    font-size: 32rpx;
    color: #6b7280;
    margin-bottom: 40rpx;
  }
  
  .empty-btn {
    background: #10b981;
    color: white;
    border: none;
    border-radius: 8rpx;
    padding: 20rpx 40rpx;
    font-size: 28rpx;
  }
}

.action-sheet {
  background: white;
  border-radius: 24rpx 24rpx 0 0;
  padding: 20rpx 0;
  
  .action-item {
    padding: 30rpx 40rpx;
    font-size: 32rpx;
    text-align: center;
    border-bottom: 1rpx solid #f3f4f6;
    
    &:last-child {
      border-bottom: none;
    }
    
    &.danger {
      color: #ef4444;
    }
    
    &.cancel {
      color: #6b7280;
      margin-top: 10rpx;
    }
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>