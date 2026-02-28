<template>
  <view class="task-list-container">
    <!-- 顶部标签切换 -->
    <view class="top-tabs">
      <view
        class="top-tab"
        :class="{ active: currentTab === 'tasks' }"
        @click="switchTab('tasks')"
      >
        <text>我的任务</text>
      </view>
      <view
        class="top-tab"
        :class="{ active: currentTab === 'milestones' }"
        @click="switchTab('milestones')"
      >
        <text>我的里程碑</text>
        <view v-if="milestones.length > 0" class="badge">{{ milestones.length }}</view>
      </view>
    </view>

    <!-- 任务视图 -->
    <template v-if="currentTab === 'tasks'">
      <!-- 统计卡片 -->
      <view class="stats-section">
        <view class="stat-card" @click="filterByStatus('')">
          <text class="stat-value">{{ stats.total }}</text>
          <text class="stat-label">全部任务</text>
        </view>
        <view class="stat-card" @click="filterByStatus('todo')">
          <text class="stat-value">{{ stats.todo }}</text>
          <text class="stat-label">待处理</text>
        </view>
        <view class="stat-card" @click="filterByStatus('in_progress')">
          <text class="stat-value">{{ stats.inProgress }}</text>
          <text class="stat-label">进行中</text>
        </view>
        <view class="stat-card urgent" @click="showOverdueTasks">
          <text class="stat-value">{{ stats.overdue }}</text>
          <text class="stat-label">已逾期</text>
        </view>
      </view>

      <!-- 筛选栏 -->
      <view class="filter-bar">
        <scroll-view class="filter-tabs" scroll-x>
          <view
            v-for="tab in filterTabs"
            :key="tab.value"
            class="filter-tab"
            :class="{ active: currentFilter === tab.value }"
            @click="onFilterChange(tab.value)"
          >
            {{ tab.label }}
          </view>
        </scroll-view>
      </view>

      <!-- 任务列表 -->
      <scroll-view
        class="task-list"
        scroll-y
        @scrolltolower="onLoadMore"
      >
        <view v-if="loading && tasks.length === 0" class="loading-state">
          <text class="loading-text">加载中...</text>
        </view>

        <view v-else-if="tasks.length === 0" class="empty-state">
          <text class="empty-icon">📝</text>
          <text class="empty-text">暂无任务</text>
        </view>

        <view v-else>
          <view
            v-for="task in tasks"
            :key="task.id"
            class="task-card"
            @click="onTaskClick(task.id)"
          >
            <view class="task-header">
              <view class="task-priority" :class="`priority-${task.priority}`"></view>
              <text class="task-title">{{ task.title }}</text>
            </view>

            <view class="task-meta">
              <view class="meta-item">
                <text class="meta-icon">📁</text>
                <text class="meta-text">{{ task.projectName }}</text>
              </view>
              <view v-if="task.assigneeName" class="meta-item">
                <text class="meta-icon">👤</text>
                <text class="meta-text">{{ task.assigneeName }}</text>
              </view>
              <view v-if="task.dueDate" class="meta-item" :class="{ overdue: isOverdue(task.dueDate) }">
                <text class="meta-icon">📅</text>
                <text class="meta-text">{{ formatDate(task.dueDate) }}</text>
              </view>
            </view>

            <view class="task-footer">
              <view class="status-badge" :class="`status-${task.status}`">
                {{ getStatusText(task.status) }}
              </view>
              
              <view class="task-stats">
                <view v-if="task.subtaskCount > 0" class="stat-item">
                  <text class="icon">✓</text>
                  <text class="text">{{ task.completedSubtaskCount }}/{{ task.subtaskCount }}</text>
                </view>
                <view v-if="task.commentCount > 0" class="stat-item">
                  <text class="icon">💬</text>
                  <text class="text">{{ task.commentCount }}</text>
                </view>
              </view>
            </view>
          </view>

          <view v-if="hasMore" class="load-more">
            <text class="load-more-text">{{ loadingMore ? '加载中...' : '加载更多' }}</text>
          </view>
        </view>
      </scroll-view>
    </template>

    <!-- 里程碑视图 -->
    <template v-else>
      <scroll-view class="milestone-list" scroll-y>
        <view v-if="loadingMilestones" class="loading-state">
          <text class="loading-text">加载中...</text>
        </view>

        <view v-else-if="milestones.length === 0" class="empty-state">
          <text class="empty-icon">🎯</text>
          <text class="empty-text">暂无分配给您的里程碑</text>
        </view>

        <view v-else>
          <view
            v-for="milestone in milestones"
            :key="milestone.id"
            class="milestone-card"
            @click="onMilestoneClick(milestone.id)"
          >
            <view class="milestone-header">
              <view class="milestone-status" :class="`status-${milestone.status}`"></view>
              <text class="milestone-name">{{ milestone.name }}</text>
            </view>

            <view v-if="milestone.description" class="milestone-desc">
              {{ milestone.description }}
            </view>

            <view class="milestone-meta">
              <view v-if="milestone.targetDate" class="meta-item" :class="{ overdue: isOverdue(milestone.targetDate) }">
                <text class="meta-icon">📅</text>
                <text class="meta-text">目标: {{ formatDate(milestone.targetDate) }}</text>
              </view>
            </view>

            <view class="milestone-progress">
              <view class="progress-bar">
                <view class="progress-fill" :style="{ width: milestone.progress + '%' }"></view>
              </view>
              <text class="progress-text">{{ milestone.progress }}%</text>
            </view>

            <view class="milestone-footer">
              <view class="status-badge" :class="`status-${milestone.status}`">
                {{ getMilestoneStatusText(milestone.status) }}
              </view>
              <view class="task-count">
                <text>{{ milestone.completedDepartmentTaskCount || 0 }}/{{ milestone.departmentTaskCount || 0 }} 任务</text>
              </view>
            </view>
          </view>
        </view>
      </scroll-view>
    </template>

    <!-- 创建按钮 -->
    <view class="fab" @click="onCreateTask">
      <text class="fab-icon">+</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { taskService, TaskStatus } from '@/core/task'
import { milestoneService, MilestoneStatus } from '@/core/milestone'
import type { Task, TaskStats as ITaskStats } from '@/core/task'
import type { Milestone } from '@/core/milestone'

const currentTab = ref<'tasks' | 'milestones'>('tasks')
const tasks = ref<Task[]>([])
const milestones = ref<Milestone[]>([])
const stats = ref<ITaskStats>({
  total: 0,
  todo: 0,
  inProgress: 0,
  inReview: 0,
  done: 0,
  overdue: 0
})
const loading = ref(false)
const loadingMore = ref(false)
const loadingMilestones = ref(false)
const hasMore = ref(true)
const page = ref(1)
const pageSize = 20
const currentFilter = ref('')

const filterTabs = [
  { label: '全部', value: '' },
  { label: '待处理', value: TaskStatus.TODO },
  { label: '进行中', value: TaskStatus.IN_PROGRESS },
  { label: '待审核', value: TaskStatus.IN_REVIEW },
  { label: '已完成', value: TaskStatus.DONE }
]

onMounted(() => {
  loadStats()
  loadTasks()
  loadMilestones()
})

const switchTab = (tab: 'tasks' | 'milestones') => {
  currentTab.value = tab
}

const loadMilestones = async () => {
  loadingMilestones.value = true
  try {
    milestones.value = await milestoneService.getMyMilestones()
  } catch (error: any) {
    console.error('加载里程碑失败:', error)
  } finally {
    loadingMilestones.value = false
  }
}

const loadStats = async () => {
  try {
    stats.value = await taskService.getTaskStats()
  } catch (error: any) {
    console.error('加载统计失败:', error)
  }
}

const loadTasks = async (refresh = false) => {
  if (refresh) {
    page.value = 1
    tasks.value = []
    hasMore.value = true
  }

  if (loading.value || loadingMore.value) return

  if (page.value === 1) {
    loading.value = true
  } else {
    loadingMore.value = true
  }

  try {
    const response = await taskService.getMyTasks({
      status: currentFilter.value || undefined,
      page: page.value,
      pageSize
    })

    if (refresh) {
      tasks.value = response.list
    } else {
      tasks.value.push(...response.list)
    }

    hasMore.value = tasks.value.length < response.total
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

const onLoadMore = () => {
  if (hasMore.value && !loading.value && !loadingMore.value) {
    page.value++
    loadTasks()
  }
}

const onFilterChange = (value: string) => {
  currentFilter.value = value
  loadTasks(true)
}

const filterByStatus = (status: string) => {
  currentFilter.value = status
  loadTasks(true)
}

const showOverdueTasks = () => {
  // TODO: 实现逾期任务筛选
  uni.showToast({
    title: '功能开发中',
    icon: 'none'
  })
}

const onTaskClick = (taskId: string) => {
  uni.navigateTo({
    url: `/pages/task/detail/index?id=${taskId}`
  })
}

const onMilestoneClick = (milestoneId: string) => {
  uni.navigateTo({
    url: `/pages/project/detail/index?milestoneId=${milestoneId}`
  })
}

const onCreateTask = () => {
  uni.navigateTo({
    url: '/pages/task/create/index'
  })
}

const getStatusText = (status: TaskStatus): string => {
  const map: Record<TaskStatus, string> = {
    [TaskStatus.TODO]: '待处理',
    [TaskStatus.IN_PROGRESS]: '进行中',
    [TaskStatus.IN_REVIEW]: '待审核',
    [TaskStatus.DONE]: '已完成',
    [TaskStatus.CANCELLED]: '已取消'
  }
  return map[status] || status
}

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr)
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${month}月${day}日`
}

const isOverdue = (dueDate: string): boolean => {
  return new Date(dueDate) < new Date()
}

const getMilestoneStatusText = (status: string): string => {
  const map: Record<string, string> = {
    'pending': '待开始',
    'in_progress': '进行中',
    'completed': '已完成',
    'delayed': '已延期'
  }
  return map[status] || status
}
</script>

<style lang="scss" scoped>
.task-list-container {
  min-height: 100vh;
  background: #F9FAFB;
  padding-bottom: 120rpx;
}

.top-tabs {
  display: flex;
  background: #ffffff;
  padding: 16rpx 32rpx;
  border-bottom: 1rpx solid #E5E7EB;
}

.top-tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  padding: 16rpx 0;
  font-size: 30rpx;
  color: #6B7280;
  position: relative;

  &.active {
    color: #10B981;
    font-weight: 500;
    
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 48rpx;
      height: 4rpx;
      background: #10B981;
      border-radius: 2rpx;
    }
  }

  .badge {
    background: #EF4444;
    color: #ffffff;
    font-size: 20rpx;
    padding: 4rpx 12rpx;
    border-radius: 20rpx;
    min-width: 32rpx;
    text-align: center;
  }
}

.stats-section {
  display: flex;
  gap: 16rpx;
  padding: 24rpx 32rpx;
  background: #ffffff;
}

.stat-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24rpx 16rpx;
  background: linear-gradient(135deg, #10B981 0%, #059669 100%);
  border-radius: 16rpx;
  color: #ffffff;

  &.urgent {
    background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
  }
}

.stat-value {
  font-size: 40rpx;
  font-weight: bold;
  margin-bottom: 8rpx;
}

.stat-label {
  font-size: 24rpx;
  opacity: 0.9;
}

.filter-bar {
  background: #ffffff;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #E5E7EB;
}

.filter-tabs {
  white-space: nowrap;
  padding: 0 32rpx;
}

.filter-tab {
  display: inline-block;
  padding: 12rpx 24rpx;
  margin-right: 16rpx;
  background: #F3F4F6;
  border-radius: 24rpx;
  font-size: 28rpx;
  color: #6B7280;

  &.active {
    background: #10B981;
    color: #ffffff;
  }
}

.task-list {
  flex: 1;
  padding: 24rpx 32rpx;
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

.task-card {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
}

.task-header {
  display: flex;
  align-items: flex-start;
  gap: 12rpx;
  margin-bottom: 16rpx;
}

.task-priority {
  width: 8rpx;
  height: 32rpx;
  border-radius: 4rpx;
  flex-shrink: 0;
  margin-top: 4rpx;

  &.priority-low {
    background: #9CA3AF;
  }

  &.priority-medium {
    background: #3B82F6;
  }

  &.priority-high {
    background: #F59E0B;
  }

  &.priority-urgent {
    background: #EF4444;
  }
}

.task-title {
  flex: 1;
  font-size: 30rpx;
  font-weight: 500;
  color: #1F2937;
  line-height: 1.5;
}

.task-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 24rpx;
  margin-bottom: 16rpx;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: 24rpx;
  color: #6B7280;

  &.overdue {
    color: #EF4444;
  }
}

.meta-icon {
  font-size: 28rpx;
}

.task-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-badge {
  padding: 8rpx 16rpx;
  border-radius: 8rpx;
  font-size: 24rpx;
  color: #ffffff;

  &.status-todo {
    background: #6B7280;
  }

  &.status-in_progress {
    background: #10B981;
  }

  &.status-in_review {
    background: #F59E0B;
  }

  &.status-done {
    background: #3B82F6;
  }
}

.task-stats {
  display: flex;
  gap: 16rpx;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4rpx;
  font-size: 24rpx;
  color: #9CA3AF;

  .icon {
    font-size: 24rpx;
  }
}

.load-more {
  padding: 32rpx;
  text-align: center;
}

.load-more-text {
  font-size: 28rpx;
  color: #9CA3AF;
}

.fab {
  position: fixed;
  right: 48rpx;
  bottom: 48rpx;
  width: 112rpx;
  height: 112rpx;
  background: linear-gradient(135deg, #10B981 0%, #059669 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(16, 185, 129, 0.4);
}

.fab-icon {
  font-size: 64rpx;
  font-weight: 300;
  color: #ffffff;
}

// 里程碑样式
.milestone-list {
  flex: 1;
  padding: 24rpx 32rpx;
}

.milestone-card {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
}

.milestone-header {
  display: flex;
  align-items: flex-start;
  gap: 12rpx;
  margin-bottom: 12rpx;
}

.milestone-status {
  width: 8rpx;
  height: 32rpx;
  border-radius: 4rpx;
  flex-shrink: 0;
  margin-top: 4rpx;

  &.status-pending {
    background: #9CA3AF;
  }

  &.status-in_progress {
    background: #3B82F6;
  }

  &.status-completed {
    background: #10B981;
  }

  &.status-delayed {
    background: #EF4444;
  }
}

.milestone-name {
  flex: 1;
  font-size: 32rpx;
  font-weight: 500;
  color: #1F2937;
  line-height: 1.4;
}

.milestone-desc {
  font-size: 26rpx;
  color: #6B7280;
  margin-bottom: 16rpx;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.milestone-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 24rpx;
  margin-bottom: 16rpx;
}

.milestone-progress {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 16rpx;
}

.progress-bar {
  flex: 1;
  height: 12rpx;
  background: #E5E7EB;
  border-radius: 6rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #10B981 0%, #059669 100%);
  border-radius: 6rpx;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 24rpx;
  color: #6B7280;
  min-width: 60rpx;
  text-align: right;
}

.milestone-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.task-count {
  font-size: 24rpx;
  color: #9CA3AF;
}
</style>