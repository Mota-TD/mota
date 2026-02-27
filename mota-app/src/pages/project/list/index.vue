<template>
  <view class="project-list">
    <!-- 导航栏 -->
    <NavBar 
      title="项目管理" 
      :show-back="false"
    >
      <template #right>
        <BaseButton 
          variant="primary" 
          size="sm" 
          icon="➕" 
          text="新建" 
          @click="createProject"
        />
      </template>
    </NavBar>

    <!-- 搜索和筛选 -->
    <view class="filters">
      <view class="search-box">
        <text class="search-icon">🔍</text>
        <input 
          v-model="searchQuery" 
          class="search-input" 
          placeholder="搜索项目..."
          @input="handleSearch"
        />
        <BaseButton 
          v-if="searchQuery" 
          variant="ghost" 
          size="sm" 
          icon="✕" 
          @click="clearSearch"
        />
      </view>

      <view class="filter-tabs">
        <view 
          v-for="tab in tabs" 
          :key="tab.value"
          :class="['tab-item', { 'active': activeTab === tab.value }]"
          @click="setActiveTab(tab.value)"
        >
          <text class="tab-text">{{ tab.label }}</text>
          <Badge 
            v-if="tab.count > 0" 
            :content="tab.count" 
            size="sm" 
            variant="primary"
          />
        </view>
      </view>
    </view>

    <!-- 项目列表 -->
    <scroll-view class="content" scroll-y>
      <!-- 加载状态 -->
      <view v-if="projectStore.isLoading" class="loading-state">
        <view class="loading-spinner"></view>
        <text class="loading-text">加载中...</text>
      </view>

      <!-- 空状态 -->
      <view v-else-if="filteredProjects.length === 0" class="empty-state">
        <text class="empty-icon">📁</text>
        <text class="empty-text">暂无项目</text>
        <text class="empty-desc">创建您的第一个项目开始协作</text>
        <BaseButton 
          variant="primary" 
          text="创建项目" 
          @click="createProject"
          class="mt-md"
        />
      </view>

      <!-- 项目列表 -->
      <view v-else class="projects-grid">
        <Card 
          v-for="project in filteredProjects" 
          :key="project.id"
          class="project-card"
          :hoverable="true"
          :clickable="true"
          @click="openProject(project.id)"
        >
          <view class="project-header">
            <view class="project-avatar">{{ project.icon }}</view>
            <view class="project-info">
              <text class="project-name">{{ project.name }}</text>
              <view class="project-meta">
                <Badge 
                  :variant="getStatusVariant(project.status)"
                  :content="getStatusText(project.status)"
                  size="sm"
                />
                <text class="project-date">{{ formatDate(project.updatedAt) }}</text>
              </view>
            </view>
          </view>

          <view class="project-description">
            <text>{{ project.description }}</text>
          </view>

          <view class="project-footer">
            <view class="project-progress">
              <text class="progress-label">进度</text>
              <view class="progress-bar">
                <view 
                  class="progress-fill" 
                  :style="{ width: project.progress + '%' }"
                ></view>
              </view>
              <text class="progress-value">{{ project.progress }}%</text>
            </view>

            <view class="project-actions">
              <BaseButton 
                variant="ghost" 
                size="sm" 
                icon="⋯" 
                @click.stop="showProjectMenu(project)"
              />
            </view>
          </view>
        </Card>
      </view>

      <!-- 底部统计 -->
      <view class="stats-footer">
        <text class="stats-text">
          共 {{ projectStore.projectStats.total }} 个项目，
          {{ projectStore.projectStats.active }} 个进行中
        </text>
      </view>
    </scroll-view>

    <!-- 项目操作菜单 -->
    <view 
      v-if="showMenu" 
      class="action-menu"
      @click="hideProjectMenu"
    >
      <view class="menu-content" @click.stop>
        <view class="menu-item" @click="editProject">
          <text class="menu-icon">✏️</text>
          <text class="menu-text">编辑项目</text>
        </view>
        <view class="menu-item" @click="archiveProject">
          <text class="menu-icon">📁</text>
          <text class="menu-text">归档项目</text>
        </view>
        <view class="menu-item danger" @click="deleteProject">
          <text class="menu-icon">🗑️</text>
          <text class="menu-text">删除项目</text>
        </view>
        <view class="menu-divider"></view>
        <view class="menu-item" @click="hideProjectMenu">
          <text class="menu-text">取消</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useProjectStore } from '@/stores/project'
import { useOffline } from '@/services/offline'
import { useNotification } from '@/services/notification'
import NavBar from '@/components/layout/NavBar.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import Card from '@/components/ui/Card.vue'
import Badge from '@/components/ui/Badge.vue'

const projectStore = useProjectStore()

// 离线功能
const { addOperation, isOnline } = useOffline()

// 通知服务
const { sendNotification, sendProjectNotification } = useNotification()

// 响应式数据
const searchQuery = ref('')
const activeTab = ref<'all' | 'active' | 'completed' | 'overdue'>('all')
const showMenu = ref(false)
const selectedProject = ref<any>(null)

// 计算属性
const tabs = computed(() => [
  { label: '全部', value: 'all', count: projectStore.projectStats.total },
  { label: '进行中', value: 'active', count: projectStore.projectStats.active },
  { label: '已完成', value: 'completed', count: projectStore.projectStats.completed },
  { label: '已逾期', value: 'overdue', count: projectStore.projectStats.overdue }
])

const filteredProjects = computed(() => {
  let projects = projectStore.filteredProjects
  
  // 标签筛选
  if (activeTab.value !== 'all') {
    if (activeTab.value === 'overdue') {
      projects = projects.filter(project => {
        if (!project.endDate) return false
        return new Date(project.endDate) < new Date() && project.status !== 'completed'
      })
    } else {
      projects = projects.filter(project => project.status === activeTab.value)
    }
  }
  
  return projects
})

// 生命周期
onLoad(() => {
  console.log('项目列表页面加载')
  loadProjects()
})

onMounted(() => {
  // 设置搜索查询
  projectStore.setSearchQuery(searchQuery.value)
})

// 方法
const loadProjects = async () => {
  await projectStore.loadProjects()
}

const handleSearch = () => {
  projectStore.setSearchQuery(searchQuery.value)
}

const clearSearch = () => {
  searchQuery.value = ''
  projectStore.setSearchQuery('')
}

const setActiveTab = (tab: 'all' | 'active' | 'completed' | 'overdue') => {
  activeTab.value = tab
  
  // 设置状态筛选
  if (tab === 'all') {
    projectStore.setFilterStatus('all')
  } else if (tab === 'overdue') {
    projectStore.setFilterStatus('all')
  } else {
    projectStore.setFilterStatus(tab)
  }
}

const createProject = () => {
  uni.navigateTo({ url: '/pages/project/create' })
}

const openProject = (projectId: string) => {
  uni.navigateTo({ url: `/pages/project/detail?id=${projectId}` })
}

const showProjectMenu = (project: any) => {
  selectedProject.value = project
  showMenu.value = true
}

const hideProjectMenu = () => {
  showMenu.value = false
  selectedProject.value = null
}

const editProject = () => {
  if (selectedProject.value) {
    uni.navigateTo({ 
      url: `/pages/project/edit?id=${selectedProject.value.id}` 
    })
    hideProjectMenu()
  }
}

const archiveProject = async () => {
  if (selectedProject.value) {
    try {
      // 如果离线，添加到离线队列
      if (!isOnline.value) {
        const operationId = addOperation('update', 'project', {
          id: selectedProject.value.id,
          status: 'completed'
        })
        
        // 立即更新本地状态
        projectStore.updateProject(selectedProject.value.id, { 
          status: 'completed' 
        })
        
        sendNotification({
          title: '归档操作已保存',
          message: '网络恢复后将自动同步到服务器',
          type: 'info',
          priority: 'normal',
          category: 'system'
        })
      } else {
        // 在线状态下直接更新
        await projectStore.updateProject(selectedProject.value.id, { 
          status: 'completed' 
        })
        
        sendProjectNotification(selectedProject.value.id, 'completed')
      }
      
      uni.showToast({ title: '项目已归档', icon: 'success' })
    } catch (error) {
      console.error('归档项目失败:', error)
      uni.showToast({ title: '操作失败', icon: 'error' })
    }
    hideProjectMenu()
  }
}

const deleteProject = async () => {
  if (selectedProject.value) {
    uni.showModal({
      title: '确认删除',
      content: `确定要删除项目"${selectedProject.value.name}"吗？此操作不可恢复。`,
      success: async (res) => {
        if (res.confirm) {
          try {
            // 如果离线，添加到离线队列
            if (!isOnline.value) {
              const operationId = addOperation('delete', 'project', {
                id: selectedProject.value.id
              })
              
              // 立即从本地移除
              projectStore.deleteProject(selectedProject.value.id)
              
              sendNotification({
                title: '删除操作已保存',
                message: '网络恢复后将自动同步到服务器',
                type: 'info',
                priority: 'normal',
                category: 'system'
              })
            } else {
              // 在线状态下直接删除
              await projectStore.deleteProject(selectedProject.value.id)
              
              sendNotification({
                title: '项目已删除',
                message: `项目"${selectedProject.value.name}"已删除`,
                type: 'success',
                priority: 'normal',
                category: 'project'
              })
            }
            
            uni.showToast({ title: '项目已删除', icon: 'success' })
          } catch (error) {
            console.error('删除项目失败:', error)
            uni.showToast({ title: '删除失败', icon: 'error' })
          }
        }
        hideProjectMenu()
      }
    })
  }
}

const getStatusVariant = (status: string) => {
  const variants = {
    'planning': 'info',
    'active': 'primary',
    'paused': 'warning',
    'completed': 'success',
    'cancelled': 'error'
  }
  return variants[status as keyof typeof variants] || 'info'
}

const getStatusText = (status: string) => {
  const texts = {
    'planning': '规划中',
    'active': '进行中',
    'paused': '已暂停',
    'completed': '已完成',
    'cancelled': '已取消'
  }
  return texts[status as keyof typeof texts] || status
}

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('zh-CN')
}
</script>

<style lang="scss" scoped>
@import '@/styles/theme.scss';

.project-list {
  min-height: 100vh;
  background: $bg-secondary;
}

.filters {
  background: $bg-primary;
  padding: $spacing-md;
  border-bottom: 1px solid $border-color;
}

.search-box {
  display: flex;
  align-items: center;
  background: $bg-tertiary;
  border-radius: $border-radius-md;
  padding: $spacing-sm $spacing-md;
  margin-bottom: $spacing-md;
  
  .search-icon {
    margin-right: $spacing-sm;
    font-size: $font-size-lg;
    color: $text-placeholder;
  }
  
  .search-input {
    flex: 1;
    border: none;
    outline: none;
    background: transparent;
    font-size: $font-size-md;
    color: $text-primary;
    
    &::placeholder {
      color: $text-placeholder;
    }
  }
}

.filter-tabs {
  display: flex;
  gap: $spacing-md;
  
  .tab-item {
    display: flex;
    align-items: center;
    gap: $spacing-xs;
    padding: $spacing-xs $spacing-md;
    border-radius: $border-radius-full;
    background: $bg-tertiary;
    color: $text-secondary;
    font-size: $font-size-sm;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &.active {
      background: $primary-color;
      color: $text-white;
    }
    
    &:active {
      opacity: 0.7;
    }
  }
}

.content {
  height: calc(100vh - 200rpx);
  padding: $spacing-md;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0;
  
  .loading-spinner {
    width: 60rpx;
    height: 60rpx;
    border: 4rpx solid $neutral-200;
    border-top: 4rpx solid $primary-color;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: $spacing-md;
  }
  
  .loading-text {
    color: $text-secondary;
    font-size: $font-size-md;
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx $spacing-md;
  text-align: center;
  
  .empty-icon {
    font-size: 120rpx;
    margin-bottom: $spacing-lg;
    opacity: 0.3;
  }
  
  .empty-text {
    font-size: $font-size-lg;
    color: $text-secondary;
    margin-bottom: $spacing-sm;
  }
  
  .empty-desc {
    font-size: $font-size-md;
    color: $text-placeholder;
    line-height: 1.6;
    margin-bottom: $spacing-lg;
  }
}

.projects-grid {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

.project-card {
  .project-header {
    display: flex;
    align-items: center;
    margin-bottom: $spacing-md;
    
    .project-avatar {
      width: 80rpx;
      height: 80rpx;
      border-radius: $border-radius-lg;
      background: linear-gradient(135deg, $primary-color, $primary-light);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: $font-size-2xl;
      margin-right: $spacing-md;
    }
    
    .project-info {
      flex: 1;
      
      .project-name {
        display: block;
        font-size: $font-size-lg;
        font-weight: $font-weight-semibold;
        color: $text-primary;
        margin-bottom: $spacing-xs;
      }
      
      .project-meta {
        display: flex;
        align-items: center;
        gap: $spacing-sm;
        
        .project-date {
          font-size: $font-size-sm;
          color: $text-placeholder;
        }
      }
    }
  }
  
  .project-description {
    color: $text-secondary;
    font-size: $font-size-md;
    line-height: 1.5;
    margin-bottom: $spacing-md;
  }
  
  .project-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    
    .project-progress {
      flex: 1;
      
      .progress-label {
        display: block;
        font-size: $font-size-sm;
        color: $text-secondary;
        margin-bottom: $spacing-xs;
      }
      
      .progress-bar {
        width: 100%;
        height: 8rpx;
        background: $neutral-200;
        border-radius: $border-radius-full;
        overflow: hidden;
        margin-bottom: $spacing-xs;
        
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, $primary-color, $primary-light);
          border-radius: $border-radius-full;
          transition: width 0.3s ease;
        }
      }
      
      .progress-value {
        font-size: $font-size-sm;
        color: $text-secondary;
      }
    }
    
    .project-actions {
      margin-left: $spacing-md;
    }
  }
}

.stats-footer {
  text-align: center;
  padding: $spacing-lg 0;
  
  .stats-text {
    font-size: $font-size-sm;
    color: $text-placeholder;
  }
}

.action-menu {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  z-index: 1000;
  
  .menu-content {
    background: $bg-primary;
    border-radius: $border-radius-lg $border-radius-lg 0 0;
    padding: $spacing-md;
    width: 100%;
    
    .menu-item {
      display: flex;
      align-items: center;
      padding: $spacing-lg $spacing-md;
      border-radius: $border-radius-md;
      cursor: pointer;
      transition: background 0.2s ease;
      
      &:active {
        background: $neutral-100;
      }
      
      &.danger {
        color: $error-color;
      }
      
      .menu-icon {
        margin-right: $spacing-md;
        font-size: $font-size-lg;
      }
      
      .menu-text {
        font-size: $font-size-md;
        font-weight: $font-weight-medium;
      }
    }
    
    .menu-divider {
      height: 1px;
      background: $border-color;
      margin: $spacing-sm 0;
    }
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>