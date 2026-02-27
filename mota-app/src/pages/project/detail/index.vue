<template>
  <view class="project-detail-page">
    <!-- 顶部导航 -->
    <view class="nav-bar">
      <view class="nav-left">
        <view class="back-btn" @click="goBack">
          <text class="iconfont icon-arrow-left"></text>
        </view>
      </view>
      <view class="nav-title">{{ currentProject?.name || '项目详情' }}</view>
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

    <!-- 项目详情 -->
    <view v-else-if="currentProject" class="project-content">
      <scroll-view scroll-y class="scroll-content">
        <!-- 项目概览 -->
        <view class="overview-section">
          <view class="project-header">
            <view class="status-badge" :class="getStatusClass(currentProject.status)">
              {{ getStatusText(currentProject.status) }}
            </view>
            <view class="project-name">{{ currentProject.name }}</view>
            <view class="project-code">#{{ currentProject.code }}</view>
          </view>

          <view class="progress-section">
            <view class="progress-header">
              <text class="progress-label">项目进度</text>
              <text class="progress-percent">{{ progress }}%</text>
            </view>
            <view class="progress-bar">
              <view class="progress-fill" :style="{ width: progress + '%' }"></view>
            </view>
          </view>

          <view class="stats-grid">
            <view class="stat-item">
              <text class="stat-value">{{ taskStats.total }}</text>
              <text class="stat-label">总任务</text>
            </view>
            <view class="stat-item">
              <text class="stat-value">{{ taskStats.completed }}</text>
              <text class="stat-label">已完成</text>
            </view>
            <view class="stat-item">
              <text class="stat-value">{{ taskStats.overdue }}</text>
              <text class="stat-label">已逾期</text>
            </view>
            <view class="stat-item">
              <text class="stat-value">{{ currentProject.members.length }}</text>
              <text class="stat-label">成员</text>
            </view>
          </view>
        </view>

        <!-- 项目信息 -->
        <view class="info-section">
          <view class="section-title">项目信息</view>
          <view class="info-grid">
            <view class="info-item">
              <text class="info-label">负责人</text>
              <text class="info-value">{{ getManagerName(currentProject.manager) }}</text>
            </view>
            <view class="info-item">
              <text class="info-label">开始时间</text>
              <text class="info-value">{{ formatDate(currentProject.startDate) }}</text>
            </view>
            <view class="info-item">
              <text class="info-label">截止时间</text>
              <text class="info-value" :class="{ 'overdue': isOverdue }">
                {{ formatDate(currentProject.endDate) }}
                <text v-if="isOverdue" class="overdue-text">（已逾期）</text>
              </text>
            </view>
            <view class="info-item">
              <text class="info-label">预算</text>
              <text class="info-value">{{ formatBudget(currentProject.budget) }}</text>
            </view>
            <view class="info-item full-width">
              <text class="info-label">客户</text>
              <text class="info-value">{{ currentProject.client || '未设置' }}</text>
            </view>
          </view>
        </view>

        <!-- 项目描述 -->
        <view v-if="currentProject.description" class="description-section">
          <view class="section-title">项目描述</view>
          <view class="description-content">
            {{ currentProject.description }}
          </view>
        </view>

        <!-- 项目成员 -->
        <view class="members-section">
          <view class="section-title">
            项目成员
            <text class="member-count">({{ currentProject.members.length }})</text>
          </view>
          <view class="members-list">
            <view 
              v-for="member in currentProject.members" 
              :key="member" 
              class="member-item"
            >
              <view class="member-avatar">
                {{ getMemberInitial(member) }}
              </view>
              <view class="member-info">
                <text class="member-name">{{ getMemberName(member) }}</text>
                <text class="member-role">{{ getMemberRole(member) }}</text>
              </view>
              <view v-if="member === currentProject.manager" class="manager-badge">
                负责人
              </view>
            </view>
          </view>
        </view>

        <!-- 最近任务 -->
        <view class="tasks-section">
          <view class="section-header">
            <view class="section-title">最近任务</view>
            <view class="view-all" @click="viewAllTasks">查看全部</view>
          </view>
          
          <view v-if="recentTasks.length > 0" class="tasks-list">
            <view 
              v-for="task in recentTasks" 
              :key="task.id" 
              class="task-item"
              @click="viewTask(task.id)"
            >
              <view class="task-main">
                <view class="task-title">{{ task.title }}</view>
                <view class="task-meta">
                  <view class="task-priority" :class="`priority-${task.priority}`">
                    {{ getPriorityText(task.priority) }}
                  </view>
                  <view class="task-assignee">{{ getAssigneeName(task.assignee) }}</view>
                  <view class="task-due" :class="{ 'overdue': isTaskOverdue(task) }">
                    {{ formatDate(task.dueDate) }}
                  </view>
                </view>
              </view>
              <view class="task-status" :class="getStatusClass(task.status)">
                {{ getStatusText(task.status) }}
              </view>
            </view>
          </view>
          
          <view v-else class="empty-tasks">
            <text class="empty-text">暂无任务</text>
            <button class="add-task-btn" @click="createTask">创建任务</button>
          </view>
        </view>

        <!-- 项目文档 -->
        <view v-if="currentProject.documents.length > 0" class="documents-section">
          <view class="section-title">项目文档</view>
          <view class="documents-list">
            <view 
              v-for="doc in currentProject.documents" 
              :key="doc.id" 
              class="document-item"
              @click="previewDocument(doc)"
            >
              <view class="doc-icon">
                <text class="iconfont icon-document"></text>
              </view>
              <view class="doc-info">
                <text class="doc-name">{{ doc.name }}</text>
                <text class="doc-meta">{{ formatFileSize(doc.size) }} • {{ formatDate(doc.uploadDate) }}</text>
              </view>
            </view>
          </view>
        </view>
      </scroll-view>

      <!-- 底部操作栏 -->
      <view class="action-bar">
        <button class="action-btn primary" @click="createTask">
          <text class="iconfont icon-plus"></text>
          新建任务
        </button>
        
        <button class="action-btn secondary" @click="editProject">
          <text class="iconfont icon-edit"></text>
          编辑项目
        </button>
        
        <button v-if="currentProject.status === 'active'" class="action-btn success" @click="completeProject">
          <text class="iconfont icon-check"></text>
          完成项目
        </button>
      </view>
    </view>

    <!-- 空状态 -->
    <view v-else class="empty-state">
      <text class="empty-icon iconfont icon-project"></text>
      <text class="empty-text">项目不存在</text>
      <button class="empty-btn" @click="goBack">返回列表</button>
    </view>

    <!-- 操作菜单 -->
    <uni-popup ref="actionPopup" type="bottom">
      <view class="action-sheet">
        <view class="action-item" @click="shareProject">分享项目</view>
        <view class="action-item" @click="exportProject">导出数据</view>
        <view class="action-item" @click="archiveProject">
          {{ currentProject?.status === 'archived' ? '取消归档' : '归档项目' }}
        </view>
        <view class="action-item danger" @click="deleteProject">删除项目</view>
        <view class="action-item cancel" @click="closeActionSheet">取消</view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useProjectStore } from '@/stores/project'
import { useTaskStore } from '@/stores/task'
import { useUserStore } from '@/stores/user'
import { notificationService } from '@/services/notification'

// 状态
const projectId = ref('')
const isLoading = ref(false)
const actionPopup = ref()

// Store
const projectStore = useProjectStore()
const taskStore = useTaskStore()
const userStore = useUserStore()

// 计算属性
const currentProject = computed(() => projectStore.currentProject)

const progress = computed(() => {
  if (!currentProject.value) return 0
  return Math.round((currentProject.value.completedTasks / currentProject.value.totalTasks) * 100)
})

const isOverdue = computed(() => {
  if (!currentProject.value?.endDate || currentProject.value.status === 'completed') {
    return false
  }
  return new Date(currentProject.value.endDate) < new Date()
})

const recentTasks = computed(() => {
  return taskStore.tasks
    .filter(task => task.projectId === projectId.value)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5)
})

const taskStats = computed(() => {
  const projectTasks = taskStore.tasks.filter(task => task.projectId === projectId.value)
  
  return {
    total: projectTasks.length,
    completed: projectTasks.filter(t => t.status === 'completed').length,
    overdue: projectTasks.filter(t => {
      if (!t.dueDate || t.status === 'completed' || t.status === 'cancelled') return false
      return new Date(t.dueDate) < new Date()
    }).length
  }
})

// 生命周期
onLoad((options) => {
  if (options.id) {
    projectId.value = options.id
    loadProjectDetail()
  }
})

onMounted(() => {
  if (!projectId.value) {
    uni.showToast({
      title: '项目ID不存在',
      icon: 'error'
    })
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  }
})

// 方法
const loadProjectDetail = async () => {
  isLoading.value = true
  
  try {
    projectStore.setCurrentProject(projectId.value)
    
    // 如果当前项目不存在，尝试从列表加载
    if (!projectStore.currentProject) {
      await projectStore.loadProjects()
      projectStore.setCurrentProject(projectId.value)
    }
    
    // 加载任务数据
    await taskStore.loadTasks()
    
    if (!projectStore.currentProject) {
      uni.showToast({
        title: '项目不存在',
        icon: 'error'
      })
    }
    
  } catch (error) {
    console.error('加载项目详情失败:', error)
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

const editProject = () => {
  closeActionSheet()
  uni.navigateTo({
    url: `/pages/project/edit/index?id=${projectId.value}`
  })
}

const shareProject = () => {
  closeActionSheet()
  uni.showToast({
    title: '分享功能开发中',
    icon: 'none'
  })
}

const exportProject = () => {
  closeActionSheet()
  uni.showToast({
    title: '导出功能开发中',
    icon: 'none'
  })
}

const archiveProject = async () => {
  closeActionSheet()
  
  const newStatus = currentProject.value?.status === 'archived' ? 'active' : 'archived'
  const action = newStatus === 'archived' ? '归档' : '取消归档'
  
  uni.showModal({
    title: `确认${action}`,
    content: `确定要${action}这个项目吗？`,
    success: async (res) => {
      if (res.confirm) {
        try {
          const result = await projectStore.updateProject(projectId.value, { status: newStatus })
          
          if (result.success) {
            notificationService.sendProjectNotification(projectId.value, 'updated', { status: newStatus })
            
            uni.showToast({
              title: `${action}成功`,
              icon: 'success'
            })
          } else {
            throw new Error(result.error)
          }
          
        } catch (error) {
          console.error(`${action}项目失败:`, error)
          uni.showToast({
            title: `${action}失败`,
            icon: 'error'
          })
        }
      }
    }
  })
}

const deleteProject = async () => {
  closeActionSheet()
  
  uni.showModal({
    title: '确认删除',
    content: '确定要删除这个项目吗？此操作将删除所有相关任务，且不可撤销。',
    success: async (res) => {
      if (res.confirm) {
        try {
          const result = await projectStore.deleteProject(projectId.value)
          
          if (result.success) {
            notificationService.sendNotification({
              title: '项目已删除',
              message: `项目 "${currentProject.value?.name}" 已删除`,
              type: 'success',
              priority: 'normal',
              category: 'project'
            })
            
            uni.showToast({
              title: '删除成功',
              icon: 'success'
            })
            
            setTimeout(() => {
              uni.navigateBack()
            }, 1500)
          } else {
            throw new Error(result.error)
          }
          
        } catch (error) {
          console.error('删除项目失败:', error)
          uni.showToast({
            title: '删除失败',
            icon: 'error'
          })
        }
      }
    }
  })
}

const createTask = () => {
  uni.navigateTo({
    url: `/pages/task/create/index?projectId=${projectId.value}`
  })
}

const viewAllTasks = () => {
  uni.navigateTo({
    url: `/pages/task/list/index?projectId=${projectId.value}`
  })
}

const viewTask = (taskId: string) => {
  uni.navigateTo({
    url: `/pages/task/detail/index?id=${taskId}`
  })
}

const completeProject = async () => {
  uni.showModal({
    title: '确认完成',
    content: '确定要标记这个项目为已完成吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          const result = await projectStore.updateProject(projectId.value, { status: 'completed' })
          
          if (result.success) {
            notificationService.sendProjectNotification(projectId.value, 'completed')
            
            uni.showToast({
              title: '项目已完成',
              icon: 'success'
            })
          } else {
            throw new Error(result.error)
          }
          
        } catch (error) {
          console.error('完成项目失败:', error)
          uni.showToast({
            title: '操作失败',
            icon: 'error'
          })
        }
      }
    }
  })
}

const previewDocument = (doc: any) => {
  uni.showToast({
    title: '预览功能开发中',
    icon: 'none'
  })
}

// 工具函数
const getStatusClass = (status: string) => {
  const statusClasses = {
    active: 'status-active',
    completed: 'status-completed',
    archived: 'status-archived',
    cancelled: 'status-cancelled'
  }
  return statusClasses[status as keyof typeof statusClasses] || 'status-active'
}

const getStatusText = (status: string) => {
  const statusTexts = {
    active: '进行中',
    completed: '已完成',
    archived: '已归档',
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

const getManagerName = (managerId?: string) => {
  if (!managerId) return '未分配'
  const user = userStore.users.find(u => u.id === managerId)
  return user?.name || '未知用户'
}

const getMemberName = (memberId: string) => {
  const user = userStore.users.find(u => u.id === memberId)
  return user?.name || '未知用户'
}

const getMemberInitial = (memberId: string) => {
  const name = getMemberName(memberId)
  return name.charAt(0).toUpperCase()
}

const getMemberRole = (memberId: string) => {
  // 简化处理，实际项目中应该有更复杂的角色管理
  return memberId === currentProject.value?.manager ? '项目经理' : '成员'
}

const getAssigneeName = (assigneeId?: string) => {
  if (!assigneeId) return '未分配'
  const user = userStore.users.find(u => u.id === assigneeId)
  return user?.name || '未知用户'
}

const formatDate = (date?: Date) => {
  if (!date) return '未设置'
  return new Date(date).toLocaleDateString('zh-CN')
}

const formatBudget = (budget?: number) => {
  if (!budget) return '未设置'
  return `¥${budget.toLocaleString()}`
}

const formatFileSize = (size?: number) => {
  if (!size) return '未知大小'
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

const isTaskOverdue = (task: any) => {
  if (!task.dueDate || task.status === 'completed' || task.status === 'cancelled') {
    return false
  }
  return new Date(task.dueDate) < new Date()
}
</script>

<style lang="scss" scoped>
.project-detail-page {
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
    text-align: center;
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

.project-content {
  flex: 1;
  
  .scroll-content {
    height: calc(100vh - 200rpx);
    padding-bottom: 160rpx;
  }
}

.overview-section {
  background: white;
  padding: 40rpx 30rpx;
  border-bottom: 1rpx solid #e5e7eb;
}

.project-header {
  margin-bottom: 40rpx;
  
  .status-badge {
    display: inline-block;
    padding: 8rpx 16rpx;
    border-radius: 20rpx;
    font-size: 24rpx;
    font-weight: 500;
    margin-bottom: 20rpx;
    
    &.status-active { background: #dbeafe; color: #1d4ed8; }
    &.status-completed { background: #d1fae5; color: #065f46; }
    &.status-archived { background: #f3f4f6; color: #6b7280; }
    &.status-cancelled { background: #f3f4f6; color: #6b7280; }
  }
  
  .project-name {
    font-size: 40rpx;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 8rpx;
    line-height: 1.4;
  }
  
  .project-code {
    font-size: 28rpx;
    color: #6b7280;
  }
}

.progress-section {
  margin-bottom: 40rpx;
  
  .progress-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16rpx;
    
    .progress-label {
      font-size: 28rpx;
      color: #6b7280;
    }
    
    .progress-percent {
      font-size: 28rpx;
      font-weight: 600;
      color: #10b981;
    }
  }
  
  .progress-bar {
    height: 8rpx;
    background: #f3f4f6;
    border-radius: 4rpx;
    overflow: hidden;
    
    .progress-fill {
      height: 100%;
      background: #10b981;
      border-radius: 4rpx;
      transition: width 0.3s ease;
    }
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20rpx;
  
  .stat-item {
    text-align: center;
    
    .stat-value {
      display: block;
      font-size: 32rpx;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 8rpx;
    }
    
    .stat-label {
      font-size: 24rpx;
      color: #6b7280;
    }
  }
}

.info-section, .description-section, .members-section, .tasks-section, .documents-section {
  background: white;
  margin-top: 20rpx;
  padding: 30rpx;
  
  .section-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 20rpx;
    
    .member-count {
      font-size: 28rpx;
      color: #6b7280;
      font-weight: normal;
    }
  }
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
  
  .view-all {
    font-size: 28rpx;
    color: #3b82f6;
    padding: 8rpx 16rpx;
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
    
    &.full-width {
      grid-column: 1 / -1;
    }
  }
}

.description-content {
  font-size: 28rpx;
  line-height: 1.6;
  color: #4b5563;
}

.members-list {
  .member-item {
    display: flex;
    align-items: center;
    padding: 20rpx 0;
    border-bottom: 1rpx solid #f3f4f6;
    
    &:last-child {
      border-bottom: none;
    }
    
    .member-avatar {
      width: 80rpx;
      height: 80rpx;
      border-radius: 50%;
      background: #3b82f6;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32rpx;
      font-weight: 600;
      margin-right: 20rpx;
    }
    
    .member-info {
      flex: 1;
      
      .member-name {
        display: block;
        font-size: 28rpx;
        font-weight: 500;
        color: #1f2937;
        margin-bottom: 4rpx;
      }
      
      .member-role {
        font-size: 24rpx;
        color: #6b7280;
      }
    }
    
    .manager-badge {
      padding: 8rpx 16rpx;
      background: #d1fae5;
      color: #065f46;
      border-radius: 20rpx;
      font-size: 24rpx;
      font-weight: 500;
    }
  }
}

.tasks-list {
  .task-item {
    display: flex;
    align-items: center;
    padding: 20rpx 0;
    border-bottom: 1rpx solid #f3f4f6;
    
    &:last-child {
      border-bottom: none;
    }
    
    .task-main {
      flex: 1;
      
      .task-title {
        font-size: 28rpx;
        color: #1f2937;
        margin-bottom: 8rpx;
        line-height: 1.4;
      }
      
      .task-meta {
        display: flex;
        align-items: center;
        gap: 16rpx;
        
        .task-priority {
          padding: 4rpx 12rpx;
          border-radius: 12rpx;
          font-size: 22rpx;
          
          &.priority-low { background: #d1fae5; color: #065f46; }
          &.priority-medium { background: #fef3c7; color: #d97706; }
          &.priority-high { background: #fee2e2; color: #dc2626; }
        }
        
        .task-assignee, .task-due {
          font-size: 24rpx;
          color: #6b7280;
        }
        
        .task-due.overdue {
          color: #dc2626;
        }
      }
    }
    
    .task-status {
      padding: 8rpx 16rpx;
      border-radius: 20rpx;
      font-size: 24rpx;
      font-weight: 500;
      
      &.status-todo { background: #f3f4f6; color: #6b7280; }
      &.status-progress { background: #dbeafe; color: #1d4ed8; }
      &.status-review { background: #fef3c7; color: #d97706; }
      &.status-completed { background: #d1fae5; color: #065f46; }
      &.status-cancelled { background: #f3f4f6; color: #6b7280; }
    }
  }
}

.empty-tasks {
  text-align: center;
  padding: 60rpx 0;
  
  .empty-text {
    display: block;
    color: #9ca3af;
    font-size: 28rpx;
    margin-bottom: 30rpx;
  }
  
  .add-task-btn {
    background: #10b981;
    color: white;
    border: none;
    border-radius: 8rpx;
    padding: 20rpx 40rpx;
    font-size: 28rpx;
  }
}

.documents-list {
  .document-item {
    display: flex;
    align-items: center;
    padding: 20rpx 0;
    border-bottom: 1rpx solid #f3f4f6;
    
    &:last-child {
      border-bottom: none;
    }
    
    .doc-icon {
      margin-right: 20rpx;
      
      .iconfont {
        font-size: 40rpx;
        color: #6b7280;
      }
    }
    
    .doc-info {
      flex: 1;
      
      .doc-name {
        display: block;
        font-size: 28rpx;
        color: #1f2937;
        margin-bottom: 4rpx;
      }
      
      .doc-meta {
        font-size: 24rpx;
        color: #6b7280;
      }
    }
  }
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
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8rpx;
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
    
    &.success {
      background: #059669;
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