<template>
  <view class="project-list-container">
    <!-- 搜索栏 -->
    <view class="search-bar">
      <view class="search-input">
        <text class="search-icon">🔍</text>
        <input
          v-model="searchKeyword"
          class="input"
          type="text"
          placeholder="搜索项目..."
          @confirm="onSearch"
        />
      </view>
      <view class="filter-btn" @click="showFilterPopup = true">
        <text class="icon">⚙️</text>
      </view>
    </view>

    <!-- 统计卡片 -->
    <view class="stats-cards">
      <view class="stat-card">
        <text class="stat-value">{{ stats.total }}</text>
        <text class="stat-label">全部项目</text>
      </view>
      <view class="stat-card">
        <text class="stat-value">{{ stats.inProgress }}</text>
        <text class="stat-label">进行中</text>
      </view>
      <view class="stat-card">
        <text class="stat-value">{{ stats.completed }}</text>
        <text class="stat-label">已完成</text>
      </view>
    </view>

    <!-- 项目列表 -->
    <scroll-view
      class="project-list"
      scroll-y
      @scrolltolower="onLoadMore"
    >
      <view v-if="loading && projects.length === 0" class="loading-state">
        <text class="loading-text">加载中...</text>
      </view>

      <view v-else-if="projects.length === 0" class="empty-state">
        <text class="empty-icon">📁</text>
        <text class="empty-text">暂无项目</text>
        <button class="create-btn" @click="onCreateProject">创建项目</button>
      </view>

      <view v-else>
        <view
          v-for="project in projects"
          :key="project.id"
          class="project-card"
          @click="onProjectClick(project.id)"
        >
          <view class="card-header">
            <text class="project-name">{{ project.name }}</text>
            <view class="status-badge" :class="`status-${project.status}`">
              {{ getStatusText(project.status) }}
            </view>
          </view>

          <text v-if="project.description" class="project-desc">
            {{ project.description }}
          </text>

          <view class="project-meta">
            <view class="meta-item">
              <text class="meta-icon">👤</text>
              <text class="meta-text">{{ project.ownerName }}</text>
            </view>
            <view class="meta-item">
              <text class="meta-icon">👥</text>
              <text class="meta-text">{{ project.memberCount }} 人</text>
            </view>
            <view class="meta-item">
              <text class="meta-icon">✅</text>
              <text class="meta-text">
                {{ project.completedTaskCount }}/{{ project.taskCount }}
              </text>
            </view>
          </view>

          <view class="progress-bar">
            <view class="progress-fill" :style="{ width: project.progress + '%' }"></view>
          </view>
          <text class="progress-text">{{ project.progress }}%</text>
        </view>

        <view v-if="hasMore" class="load-more">
          <text class="load-more-text">{{ loadingMore ? '加载中...' : '加载更多' }}</text>
        </view>
      </view>
    </scroll-view>

    <!-- 创建按钮 -->
    <view class="fab" @click="onCreateProject">
      <text class="fab-icon">+</text>
    </view>

    <!-- 筛选弹窗 -->
    <view v-if="showFilterPopup" class="popup-mask" @click="showFilterPopup = false">
      <view class="popup-content" @click.stop>
        <view class="popup-header">
          <text class="popup-title">筛选</text>
          <text class="popup-close" @click="showFilterPopup = false">✕</text>
        </view>
        
        <view class="filter-section">
          <text class="filter-label">状态</text>
          <view class="filter-options">
            <view
              v-for="status in statusOptions"
              :key="status.value"
              class="filter-option"
              :class="{ active: filterStatus === status.value }"
              @click="filterStatus = status.value"
            >
              {{ status.label }}
            </view>
          </view>
        </view>

        <view class="filter-section">
          <text class="filter-label">优先级</text>
          <view class="filter-options">
            <view
              v-for="priority in priorityOptions"
              :key="priority.value"
              class="filter-option"
              :class="{ active: filterPriority === priority.value }"
              @click="filterPriority = priority.value"
            >
              {{ priority.label }}
            </view>
          </view>
        </view>

        <view class="popup-actions">
          <button class="action-btn reset" @click="onResetFilter">重置</button>
          <button class="action-btn confirm" @click="onConfirmFilter">确定</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { projectService, ProjectStatus } from '@/core/project'
import type { Project } from '@/core/project'

const projects = ref<Project[]>([])
const loading = ref(false)
const loadingMore = ref(false)
const hasMore = ref(true)
const page = ref(1)
const pageSize = 20

const searchKeyword = ref('')
const showFilterPopup = ref(false)
const filterStatus = ref<string>('')
const filterPriority = ref<string>('')

const stats = computed(() => ({
  total: projects.value.length,
  inProgress: projects.value.filter(p => p.status === ProjectStatus.IN_PROGRESS).length,
  completed: projects.value.filter(p => p.status === ProjectStatus.COMPLETED).length
}))

const statusOptions = [
  { label: '全部', value: '' },
  { label: '规划中', value: ProjectStatus.PLANNING },
  { label: '进行中', value: ProjectStatus.IN_PROGRESS },
  { label: '已完成', value: ProjectStatus.COMPLETED },
  { label: '已暂停', value: ProjectStatus.ON_HOLD }
]

const priorityOptions = [
  { label: '全部', value: '' },
  { label: '低', value: 'low' },
  { label: '中', value: 'medium' },
  { label: '高', value: 'high' },
  { label: '紧急', value: 'urgent' }
]

onMounted(() => {
  loadProjects()
})

const loadProjects = async (refresh = false) => {
  if (refresh) {
    page.value = 1
    projects.value = []
    hasMore.value = true
  }

  if (loading.value || loadingMore.value) return

  if (page.value === 1) {
    loading.value = true
  } else {
    loadingMore.value = true
  }

  try {
    const response = await projectService.getMyProjects({
      status: filterStatus.value || undefined,
      page: page.value,
      pageSize
    })

    if (refresh) {
      projects.value = response.list
    } else {
      projects.value.push(...response.list)
    }

    hasMore.value = projects.value.length < response.total
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
    loadProjects()
  }
}

const onSearch = () => {
  loadProjects(true)
}

const onResetFilter = () => {
  filterStatus.value = ''
  filterPriority.value = ''
}

const onConfirmFilter = () => {
  showFilterPopup.value = false
  loadProjects(true)
}

const onProjectClick = (projectId: string) => {
  uni.navigateTo({
    url: `/pages/project/detail/index?id=${projectId}`
  })
}

const onCreateProject = () => {
  uni.navigateTo({
    url: '/pages/project/create/index'
  })
}

const getStatusText = (status: ProjectStatus): string => {
  const map: Record<ProjectStatus, string> = {
    [ProjectStatus.PLANNING]: '规划中',
    [ProjectStatus.IN_PROGRESS]: '进行中',
    [ProjectStatus.ON_HOLD]: '已暂停',
    [ProjectStatus.COMPLETED]: '已完成',
    [ProjectStatus.CANCELLED]: '已取消'
  }
  return map[status] || status
}
</script>

<style lang="scss" scoped>
.project-list-container {
  min-height: 100vh;
  background: #F9FAFB;
  padding-bottom: 120rpx;
}

.search-bar {
  display: flex;
  gap: 16rpx;
  padding: 24rpx 32rpx;
  background: #ffffff;
}

.search-input {
  flex: 1;
  display: flex;
  align-items: center;
  background: #F3F4F6;
  border-radius: 12rpx;
  padding: 16rpx 20rpx;
}

.search-icon {
  font-size: 32rpx;
  margin-right: 12rpx;
}

.input {
  flex: 1;
  font-size: 28rpx;
  color: #1F2937;
}

.filter-btn {
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #F3F4F6;
  border-radius: 12rpx;
  font-size: 32rpx;
}

.stats-cards {
  display: flex;
  gap: 16rpx;
  padding: 0 32rpx 24rpx;
  background: #ffffff;
}

.stat-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24rpx;
  background: linear-gradient(135deg, #10B981 0%, #059669 100%);
  border-radius: 16rpx;
  color: #ffffff;
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

.project-list {
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
  margin-bottom: 32rpx;
}

.create-btn {
  padding: 16rpx 48rpx;
  background: linear-gradient(90deg, #10B981 0%, #059669 100%);
  border-radius: 12rpx;
  font-size: 28rpx;
  color: #ffffff;
  border: none;
}

.project-card {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.project-name {
  flex: 1;
  font-size: 32rpx;
  font-weight: bold;
  color: #1F2937;
}

.status-badge {
  padding: 8rpx 16rpx;
  border-radius: 8rpx;
  font-size: 24rpx;
  color: #ffffff;

  &.status-planning {
    background: #6B7280;
  }

  &.status-in_progress {
    background: #10B981;
  }

  &.status-completed {
    background: #3B82F6;
  }

  &.status-on_hold {
    background: #F59E0B;
  }
}

.project-desc {
  font-size: 28rpx;
  color: #6B7280;
  line-height: 1.6;
  margin-bottom: 16rpx;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.project-meta {
  display: flex;
  gap: 24rpx;
  margin-bottom: 16rpx;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: 24rpx;
  color: #9CA3AF;
}

.meta-icon {
  font-size: 28rpx;
}

.progress-bar {
  height: 8rpx;
  background: #E5E7EB;
  border-radius: 4rpx;
  overflow: hidden;
  margin-bottom: 8rpx;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #10B981 0%, #059669 100%);
  transition: width 0.3s;
}

.progress-text {
  font-size: 24rpx;
  color: #9CA3AF;
  text-align: right;
  display: block;
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

.popup-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  z-index: 1000;
}

.popup-content {
  width: 100%;
  max-height: 80vh;
  background: #ffffff;
  border-radius: 32rpx 32rpx 0 0;
  padding: 32rpx;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32rpx;
}

.popup-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #1F2937;
}

.popup-close {
  font-size: 48rpx;
  color: #9CA3AF;
}

.filter-section {
  margin-bottom: 32rpx;
}

.filter-label {
  display: block;
  font-size: 28rpx;
  font-weight: 500;
  color: #6B7280;
  margin-bottom: 16rpx;
}

.filter-options {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.filter-option {
  padding: 12rpx 24rpx;
  background: #F3F4F6;
  border-radius: 8rpx;
  font-size: 28rpx;
  color: #6B7280;

  &.active {
    background: #10B981;
    color: #ffffff;
  }
}

.popup-actions {
  display: flex;
  gap: 16rpx;
  margin-top: 32rpx;
}

.action-btn {
  flex: 1;
  height: 88rpx;
  border-radius: 12rpx;
  font-size: 32rpx;
  font-weight: 500;
  border: none;

  &.reset {
    background: #F3F4F6;
    color: #6B7280;
  }

  &.confirm {
    background: linear-gradient(90deg, #10B981 0%, #059669 100%);
    color: #ffffff;
  }
}
</style>