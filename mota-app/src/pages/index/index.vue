<template>
  <view class="dashboard">
    <!-- 简约背景 -->
    <view class="minimal-background">
      <view class="bg-pattern"></view>
    </view>

    <!-- 顶部导航栏 -->
    <NavBar 
      title="工作台" 
      :fixed="true" 
      :border-bottom="true"
      :transparent="false"
    >
      <template #right>
        <view class="nav-actions">
          <BaseButton 
            variant="ghost" 
            size="sm" 
            icon="🔔" 
            @click="handleNotification"
          />
          <BaseButton 
            variant="ghost" 
            size="sm" 
            icon="⚙️" 
            @click="handleSettings"
          />
        </view>
      </template>
    </NavBar>

    <!-- 主要内容区域 -->
    <scroll-view 
      class="content" 
      scroll-y 
      :style="{ paddingTop: navBarHeight + 'px' }"
    >
      <!-- 简约欢迎横幅 -->
      <view class="welcome-banner">
        <view class="welcome-content">
          <text class="greeting">早上好，伙伴！</text>
          <text class="date">{{ currentDate }}</text>
        </view>
        <view class="weather-minimal">
          <text class="weather-temp">28°C</text>
          <text class="weather-desc">晴朗</text>
        </view>
      </view>

      <!-- 简约数据统计卡片 -->
      <Card class="stats-card" :hoverable="true">
        <template #header>
          <text class="card-title">今日概览</text>
        </template>
        
        <view class="stats-grid">
          <view class="stat-item" @click="navigateTo('/pages/project/list')">
            <view class="stat-icon">📁</view>
            <text class="stat-value">{{ stats.projects }}</text>
            <text class="stat-label">项目</text>
          </view>
          
          <view class="stat-item" @click="navigateTo('/pages/task/list')">
            <view class="stat-icon">✅</view>
            <text class="stat-value">{{ stats.tasks }}</text>
            <text class="stat-label">任务</text>
          </view>
          
          <view class="stat-item" @click="navigateTo('/pages/message/list')">
            <view class="stat-icon">💬</view>
            <text class="stat-value">{{ stats.messages }}</text>
            <text class="stat-label">消息</text>
          </view>
          
          <view class="stat-item" @click="navigateTo('/pages/calendar/index')">
            <view class="stat-icon">📅</view>
            <text class="stat-value">{{ stats.events }}</text>
            <text class="stat-label">日程</text>
          </view>
        </view>
      </Card>

      <!-- 快捷操作 -->
      <Card class="quick-actions-card" :hoverable="true">
        <template #header>
          <text class="card-title">快捷操作</text>
        </template>
        
        <view class="actions-grid">
          <view class="action-item" @click="quickAction('newProject')">
            <view class="action-icon">➕</view>
            <text class="action-label">新建项目</text>
          </view>
          
          <view class="action-item" @click="quickAction('newTask')">
            <view class="action-icon">📝</view>
            <text class="action-label">创建任务</text>
          </view>
          
          <view class="action-item" @click="quickAction('aiChat')">
            <view class="action-icon">🤖</view>
            <text class="action-label">AI助手</text>
          </view>
          
          <view class="action-item" @click="quickAction('calendar')">
            <view class="action-icon">📊</view>
            <text class="action-label">数据分析</text>
          </view>
        </view>
      </Card>

      <!-- 最近项目 -->
      <Card class="recent-projects-card" :hoverable="true">
        <template #header>
          <text class="card-title">最近项目</text>
          <BaseButton 
            variant="ghost" 
            size="sm" 
            text="查看全部" 
            @click="navigateTo('/pages/project/list')"
          />
        </template>
        
        <view class="projects-list">
          <view 
            v-for="project in recentProjects" 
            :key="project.id" 
            class="project-item"
            @click="openProject(project.id)"
          >
            <view class="project-avatar">{{ project.icon }}</view>
            <view class="project-info">
              <text class="project-name">{{ project.name }}</text>
              <text class="project-status">{{ project.status }}</text>
            </view>
            <view class="project-progress">
              <text class="progress-text">{{ project.progress }}%</text>
              <view class="progress-bar">
                <view 
                  class="progress-fill" 
                  :style="{ width: project.progress + '%' }"
                ></view>
              </view>
            </view>
          </view>
        </view>
      </Card>

      <!-- 待办任务 -->
      <Card class="todo-card" :hoverable="true">
        <template #header>
          <text class="card-title">待办任务</text>
          <BaseButton 
            variant="ghost" 
            size="sm" 
            text="查看全部" 
            @click="navigateTo('/pages/task/list')"
          />
        </template>
        
        <view class="todo-list">
          <view 
            v-for="task in pendingTasks" 
            :key="task.id" 
            class="todo-item"
            @click="completeTask(task.id)"
          >
            <view class="todo-checkbox">
              <text :class="['checkbox', { 'checked': task.completed }]">
                {{ task.completed ? '✓' : '' }}
              </text>
            </view>
            <view class="todo-content">
              <text :class="['todo-text', { 'completed': task.completed }]">
                {{ task.title }}
              </text>
              <text class="todo-due">{{ task.dueDate }}</text>
            </view>
            <view class="todo-priority" :class="task.priority">
              {{ task.priority }}
            </view>
          </view>
        </view>
      </Card>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import NavBar from '@/components/layout/NavBar.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import Card from '@/components/ui/Card.vue'

// 响应式数据
const navBarHeight = 88 // 导航栏高度
const stats = ref({
  projects: 12,
  tasks: 47,
  messages: 8,
  events: 3
})

const recentProjects = ref([
  { id: 1, name: 'MOTA系统重构', icon: '🚀', status: '进行中', progress: 75 },
  { id: 2, name: 'AI助手优化', icon: '🤖', status: '待开始', progress: 0 },
  { id: 3, name: '移动端开发', icon: '📱', status: '已完成', progress: 100 }
])

const pendingTasks = ref([
  { id: 1, title: '完成用户界面设计', dueDate: '今天', priority: '高', completed: true },
  { id: 2, title: '添加推送通知集成', dueDate: '今天', priority: '中', completed: true },
  { id: 3, title: '测试移动端功能', dueDate: '明天', priority: '低', completed: true }
])

// 计算属性
const currentDate = computed(() => {
  const now = new Date()
  const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' } as const
  return now.toLocaleDateString('zh-CN', options)
})

// 生命周期
onLoad(() => {
  console.log('工作台页面加载')
})

onMounted(() => {
  loadDashboardData()
})

// 方法
const loadDashboardData = async () => {
  // 模拟数据加载
  setTimeout(() => {
    // 这里可以替换为实际的API调用
    console.log('加载工作台数据')
  }, 1000)
}

const navigateTo = (url: string) => {
  uni.navigateTo({ url })
}

const handleNotification = () => {
  uni.navigateTo({ url: '/pages/notification/list' })
}

const handleSettings = () => {
  uni.navigateTo({ url: '/pages/settings/index' })
}

const quickAction = (action: string) => {
  const actions = {
    newProject: () => uni.navigateTo({ url: '/pages/project/create' }),
    newTask: () => uni.navigateTo({ url: '/pages/task/create' }),
    aiChat: () => uni.navigateTo({ url: '/pages/ai/chat' }),
    calendar: () => uni.navigateTo({ url: '/pages/analytics/dashboard' })
  }
  
  if (actions[action as keyof typeof actions]) {
    actions[action as keyof typeof actions]()
  }
}

const openProject = (projectId: number) => {
  uni.navigateTo({ url: `/pages/project/detail?id=${projectId}` })
}

const completeTask = (taskId: number) => {
  const task = pendingTasks.value.find(t => t.id === taskId)
  if (task) {
    task.completed = !task.completed
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/theme.scss';

.dashboard {
  min-height: 100vh;
  background: $bg-primary;
  position: relative;
  overflow-x: hidden;
}

/* 雪白色背景 */
.minimal-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
  
  .bg-pattern {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: $bg-primary;
  }
}

.nav-actions {
  display: flex;
  gap: $spacing-sm;
}

.content {
  min-height: 100vh;
  padding: $spacing-lg;
  position: relative;
  z-index: 1;
}

.welcome-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: $spacing-xl;
  padding: $spacing-2xl;
  background: $bg-primary;
  border-radius: $border-radius-lg;
  box-shadow: $shadow-sm;
  border: 1px solid $border-color;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4rpx;
    height: 100%;
    background: $primary-color;
  }
  
  .welcome-content {
    .greeting {
      display: block;
      font-size: $font-size-2xl;
      font-weight: $font-weight-semibold;
      color: $text-primary;
      margin-bottom: $spacing-xs;
      letter-spacing: -0.02em;
    }
    
    .date {
      font-size: $font-size-sm;
      color: $text-tertiary;
      font-weight: $font-weight-medium;
    }
  }
  
  .weather-minimal {
    text-align: right;
    
    .weather-temp {
      display: block;
      font-size: $font-size-xl;
      font-weight: $font-weight-bold;
      color: $primary-color;
      margin-bottom: 4rpx;
      letter-spacing: -0.02em;
    }
    
    .weather-desc {
      font-size: $font-size-sm;
      color: $text-tertiary;
      font-weight: $font-weight-medium;
    }
  }
}

.stats-card {
  margin-bottom: $spacing-lg;
  
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: $spacing-md;
    
    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: $spacing-xl $spacing-lg;
      border-radius: $border-radius-lg;
      background: $bg-primary;
      border: 1px solid $border-color;
      cursor: pointer;
      transition: all 0.2s ease;
      
      &:active {
        transform: scale(0.98);
        box-shadow: $shadow-sm;
        border-color: $primary-color;
      }
      
      .stat-icon {
        font-size: $font-size-2xl;
        margin-bottom: $spacing-md;
        width: 64rpx;
        height: 64rpx;
        border-radius: $border-radius-full;
        background: $primary-color;
        display: flex;
        align-items: center;
        justify-content: center;
        color: $text-white;
        box-shadow: 0 2rpx 8rpx rgba($primary-color, 0.3);
      }
      
      .stat-value {
        font-size: $font-size-2xl;
        font-weight: $font-weight-bold;
        color: $text-primary;
        margin-bottom: $spacing-xs;
        letter-spacing: -0.02em;
      }
      
      .stat-label {
        font-size: $font-size-sm;
        color: $text-tertiary;
        font-weight: $font-weight-medium;
      }
    }
  }
}

.quick-actions-card {
  margin-bottom: $spacing-lg;
  
  .actions-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: $spacing-md;
    
    .action-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: $spacing-xl $spacing-md;
      border-radius: $border-radius-lg;
      background: $bg-primary;
      border: 1px solid $border-color;
      cursor: pointer;
      transition: all 0.2s ease;
      
      &:active {
        transform: scale(0.98);
        box-shadow: $shadow-sm;
        border-color: $primary-color;
      }
      
      .action-icon {
        font-size: $font-size-2xl;
        margin-bottom: $spacing-md;
        width: 56rpx;
        height: 56rpx;
        border-radius: $border-radius-full;
        background: $neutral-200;
        display: flex;
        align-items: center;
        justify-content: center;
        color: $neutral-600;
        transition: all 0.2s ease;
      }
      
      &:active .action-icon {
        background: $primary-color;
        color: $text-white;
        transform: scale(1.05);
      }
      
      .action-label {
        font-size: $font-size-sm;
        color: $neutral-600;
        font-weight: $font-weight-medium;
        text-align: center;
        transition: color 0.3s ease;
      }
      
      &:active .action-label {
        color: $primary-color;
      }
    }
  }
}

.recent-projects-card {
  margin-bottom: $spacing-lg;
  
  .projects-list {
    .project-item {
      display: flex;
      align-items: center;
      padding: $spacing-lg;
      border-radius: $border-radius-lg;
      margin-bottom: $spacing-md;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      background: linear-gradient(135deg, $bg-primary 0%, $bg-green-lighter 100%);
      border: 1px solid rgba($primary-color, 0.1);
      
      &:last-child {
        margin-bottom: 0;
      }
      
      &:active {
        transform: scale(0.98);
        box-shadow: $shadow-sm;
        background: linear-gradient(135deg, $bg-green-lighter, rgba($primary-color, 0.05));
      }
      
      .project-avatar {
        width: 72rpx;
        height: 72rpx;
        border-radius: $border-radius-lg;
        background: linear-gradient(135deg, $primary-color, $primary-lighter);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: $font-size-xl;
        margin-right: $spacing-lg;
        color: $text-white;
        box-shadow: 0 4rpx 12rpx rgba($primary-color, 0.2);
      }
      
      .project-info {
        flex: 1;
        
        .project-name {
          display: block;
          font-size: $font-size-lg;
          font-weight: $font-weight-semibold;
          color: $text-primary;
          margin-bottom: $spacing-xs;
          letter-spacing: -0.01em;
        }
        
        .project-status {
          font-size: $font-size-sm;
          color: $text-tertiary;
          font-weight: $font-weight-medium;
        }
      }
      
      .project-progress {
        text-align: right;
        
        .progress-text {
          display: block;
          font-size: $font-size-sm;
          color: $text-tertiary;
          margin-bottom: $spacing-xs;
          font-weight: $font-weight-medium;
        }
        
        .progress-bar {
          width: 140rpx;
          height: 8rpx;
          background: rgba($neutral-300, 0.5);
          border-radius: $border-radius-full;
          overflow: hidden;
          position: relative;
          
          .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, $primary-color, $primary-lighter);
            border-radius: $border-radius-full;
            transition: width 0.3s ease;
            box-shadow: 0 2rpx 8rpx rgba($primary-color, 0.3);
          }
        }
      }
    }
  }
}

.todo-card {
  .todo-list {
    .todo-item {
      display: flex;
      align-items: center;
      padding: $spacing-lg;
      border-radius: $border-radius-lg;
      margin-bottom: $spacing-md;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      background: linear-gradient(135deg, $bg-primary 0%, $bg-gray-lighter 100%);
      border: 1px solid rgba($neutral-300, 0.3);
      
      &:last-child {
        margin-bottom: 0;
      }
      
      &:active {
        transform: scale(0.98);
        box-shadow: $shadow-sm;
        background: linear-gradient(135deg, $bg-gray-lighter, rgba($neutral-400, 0.05));
      }
      
      .todo-checkbox {
        margin-right: $spacing-lg;
        
        .checkbox {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48rpx;
          height: 48rpx;
          border: 2px solid $neutral-400;
          border-radius: $border-radius-full;
          font-size: $font-size-sm;
          color: transparent;
          transition: all 0.3s ease;
          position: relative;
          
          &::before {
            content: '';
            position: absolute;
            width: 100%;
            height: 100%;
            border-radius: $border-radius-full;
            background: linear-gradient(135deg, $primary-color, $primary-lighter);
            opacity: 0;
            transition: opacity 0.3s ease;
          }
          
          &.checked {
            border-color: $primary-color;
            color: $text-white;
            
            &::before {
              opacity: 1;
            }
          }
        }
      }
      
      .todo-content {
        flex: 1;
        
        .todo-text {
          display: block;
          font-size: $font-size-lg;
          font-weight: $font-weight-medium;
          color: $neutral-800;
          margin-bottom: $spacing-xs;
          letter-spacing: -0.01em;
          transition: all 0.3s ease;
          
          &.completed {
            text-decoration: line-through;
            color: $neutral-500;
          }
        }
        
        .todo-due {
          font-size: $font-size-sm;
          color: $neutral-600;
          font-weight: $font-weight-medium;
        }
      }
      
      .todo-priority {
        font-size: $font-size-xs;
        padding: 8rpx 16rpx;
        border-radius: $border-radius-full;
        font-weight: $font-weight-semibold;
        letter-spacing: 0.02em;
        
        &.高 {
          background: linear-gradient(135deg, $error-color, #F87171);
          color: $text-white;
          box-shadow: 0 2rpx 8rpx rgba($error-color, 0.2);
        }
        
        &.中 {
          background: linear-gradient(135deg, $warning-color, #FBBF24);
          color: $text-white;
          box-shadow: 0 2rpx 8rpx rgba($warning-color, 0.2);
        }
        
        &.低 {
          background: linear-gradient(135deg, $success-color, $primary-lighter);
          color: $text-white;
          box-shadow: 0 2rpx 8rpx rgba($success-color, 0.2);
        }
      }
    }
  }
}

.card-title {
  font-size: $font-size-lg;
  font-weight: $font-weight-semibold;
  color: $text-primary;
}
</style>