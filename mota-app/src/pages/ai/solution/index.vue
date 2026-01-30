<template>
  <view class="solution-container">
    <!-- 头部 -->
    <view class="header">
      <text class="title">AI方案生成</text>
      <text class="subtitle">让AI帮你快速生成项目方案</text>
    </view>

    <!-- 表单 -->
    <view class="form-section">
      <view class="form-item">
        <text class="label">方案标题 *</text>
        <input
          v-model="formData.title"
          class="input"
          placeholder="请输入方案标题"
          maxlength="100"
        />
      </view>

      <view class="form-item">
        <text class="label">方案描述 *</text>
        <textarea
          v-model="formData.description"
          class="textarea"
          placeholder="请详细描述你的需求和目标..."
          :maxlength="1000"
          :auto-height="true"
        />
        <text class="char-count">{{ formData.description.length }}/1000</text>
      </view>

      <view class="form-item">
        <text class="label">关联项目</text>
        <view class="select-box" @click="showProjectPicker = true">
          <text class="select-text" :class="{ placeholder: !selectedProject }">
            {{ selectedProject ? selectedProject.name : '选择项目（可选）' }}
          </text>
          <text class="arrow">›</text>
        </view>
      </view>

      <view class="form-item">
        <view class="label-row">
          <text class="label">需求列表</text>
          <text class="add-btn" @click="addRequirement">+ 添加</text>
        </view>
        <view v-for="(req, index) in formData.requirements" :key="index" class="list-item">
          <input
            v-model="formData.requirements[index]"
            class="list-input"
            placeholder="输入需求..."
          />
          <text class="remove-btn" @click="removeRequirement(index)">×</text>
        </view>
      </view>

      <view class="form-item">
        <view class="label-row">
          <text class="label">约束条件</text>
          <text class="add-btn" @click="addConstraint">+ 添加</text>
        </view>
        <view v-for="(con, index) in formData.constraints" :key="index" class="list-item">
          <input
            v-model="formData.constraints[index]"
            class="list-input"
            placeholder="输入约束..."
          />
          <text class="remove-btn" @click="removeConstraint(index)">×</text>
        </view>
      </view>
    </view>

    <!-- 生成按钮 -->
    <view class="action-section">
      <button
        class="generate-btn"
        :class="{ disabled: !canGenerate || generating }"
        :disabled="!canGenerate || generating"
        @click="onGenerate"
      >
        {{ generating ? '生成中...' : '生成方案' }}
      </button>
    </view>

    <!-- 历史方案 -->
    <view class="history-section">
      <view class="section-header">
        <text class="section-title">历史方案</text>
        <text class="view-all" @click="viewAllSolutions">查看全部 ›</text>
      </view>

      <view v-if="solutions.length === 0" class="empty-state">
        <text class="empty-text">暂无历史方案</text>
      </view>

      <view v-else class="solution-list">
        <view
          v-for="solution in solutions"
          :key="solution.id"
          class="solution-card"
          @click="viewSolution(solution.id)"
        >
          <view class="card-header">
            <text class="card-title">{{ solution.title }}</text>
            <text class="card-time">{{ formatTime(solution.createdAt) }}</text>
          </view>
          <text class="card-summary">{{ solution.summary }}</text>
          <view class="card-footer">
            <view class="card-tags">
              <text v-if="solution.timeline" class="tag">📅 {{ solution.timeline.totalDuration }}</text>
              <text v-if="solution.sections" class="tag">📄 {{ solution.sections.length }} 章节</text>
            </view>
            <text class="card-action">查看详情 ›</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 项目选择器 -->
    <view v-if="showProjectPicker" class="picker-mask" @click="showProjectPicker = false">
      <view class="picker-content" @click.stop>
        <view class="picker-header">
          <text class="picker-title">选择项目</text>
          <text class="picker-close" @click="showProjectPicker = false">×</text>
        </view>
        <scroll-view class="picker-list" scroll-y>
          <view
            v-for="project in projects"
            :key="project.id"
            class="picker-item"
            @click="selectProject(project)"
          >
            <text class="picker-item-text">{{ project.name }}</text>
          </view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { aiService } from '@/core/ai'
import { projectService } from '@/core/project'
import type { AISolution, AISolutionRequest } from '@/core/ai/types'
import type { Project } from '@/core/project/types'

const formData = ref<AISolutionRequest>({
  title: '',
  description: '',
  requirements: [],
  constraints: []
})

const selectedProject = ref<Project | null>(null)
const projects = ref<Project[]>([])
const solutions = ref<AISolution[]>([])
const generating = ref(false)
const showProjectPicker = ref(false)

const canGenerate = computed(() => {
  return formData.value.title.trim().length > 0 &&
         formData.value.description.trim().length > 0
})

onMounted(() => {
  loadProjects()
  loadSolutions()
})

const loadProjects = async () => {
  try {
    const response = await projectService.getMyProjects({ pageSize: 100 })
    projects.value = response.list
  } catch (error) {
    console.error('加载项目失败:', error)
  }
}

const loadSolutions = async () => {
  try {
    const response = await aiService.getSolutions({ pageSize: 5 })
    solutions.value = response.data?.list || []
  } catch (error) {
    console.error('加载方案失败:', error)
  }
}

const selectProject = (project: Project) => {
  selectedProject.value = project
  formData.value.projectId = project.id
  showProjectPicker.value = false
}

const addRequirement = () => {
  formData.value.requirements = formData.value.requirements || []
  formData.value.requirements.push('')
}

const removeRequirement = (index: number) => {
  formData.value.requirements?.splice(index, 1)
}

const addConstraint = () => {
  formData.value.constraints = formData.value.constraints || []
  formData.value.constraints.push('')
}

const removeConstraint = (index: number) => {
  formData.value.constraints?.splice(index, 1)
}

const onGenerate = async () => {
  if (!canGenerate.value || generating.value) return

  generating.value = true

  try {
    // 过滤空值
    const request: AISolutionRequest = {
      ...formData.value,
      requirements: formData.value.requirements?.filter(r => r.trim()),
      constraints: formData.value.constraints?.filter(c => c.trim())
    }

    const response = await aiService.generateSolution(request)
    
    if (response.success && response.data) {
      uni.showToast({
        title: '方案生成成功',
        icon: 'success'
      })

      // 跳转到方案详情页
      setTimeout(() => {
        uni.navigateTo({
          url: `/pages/ai/solution/detail?id=${response.data.id}`
        })
      }, 1500)
    }
  } catch (error: any) {
    uni.showToast({
      title: error.message || '生成失败',
      icon: 'none'
    })
  } finally {
    generating.value = false
  }
}

const viewSolution = (solutionId: string) => {
  uni.navigateTo({
    url: `/pages/ai/solution/detail?id=${solutionId}`
  })
}

const viewAllSolutions = () => {
  uni.navigateTo({
    url: '/pages/ai/solution/list'
  })
}

const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp)
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${month}月${day}日`
}
</script>

<style lang="scss" scoped>
.solution-container {
  min-height: 100vh;
  background: #F9FAFB;
  padding-bottom: 120rpx;
}

.header {
  padding: 48rpx 32rpx 32rpx;
  background: linear-gradient(180deg, #10B981 0%, #ffffff 100%);
  text-align: center;
}

.title {
  display: block;
  font-size: 40rpx;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 16rpx;
}

.subtitle {
  display: block;
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.9);
}

.form-section {
  background: #ffffff;
  padding: 32rpx;
  margin-bottom: 24rpx;
}

.form-item {
  margin-bottom: 32rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.label {
  display: block;
  font-size: 28rpx;
  font-weight: 500;
  color: #1F2937;
  margin-bottom: 16rpx;
}

.label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.add-btn {
  font-size: 28rpx;
  color: #10B981;
}

.input,
.textarea {
  width: 100%;
  padding: 20rpx;
  background: #F9FAFB;
  border-radius: 12rpx;
  font-size: 28rpx;
  color: #1F2937;
  border: 2rpx solid transparent;

  &:focus {
    border-color: #10B981;
    background: #ffffff;
  }
}

.textarea {
  min-height: 200rpx;
}

.char-count {
  display: block;
  text-align: right;
  font-size: 24rpx;
  color: #9CA3AF;
  margin-top: 8rpx;
}

.select-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx;
  background: #F9FAFB;
  border-radius: 12rpx;
}

.select-text {
  flex: 1;
  font-size: 28rpx;
  color: #1F2937;

  &.placeholder {
    color: #9CA3AF;
  }
}

.arrow {
  font-size: 40rpx;
  color: #9CA3AF;
}

.list-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 16rpx;
}

.list-input {
  flex: 1;
  padding: 16rpx;
  background: #F9FAFB;
  border-radius: 8rpx;
  font-size: 28rpx;
  color: #1F2937;
}

.remove-btn {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #FEE2E2;
  border-radius: 50%;
  font-size: 32rpx;
  color: #EF4444;
}

.action-section {
  padding: 0 32rpx 32rpx;
}

.generate-btn {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(90deg, #10B981 0%, #059669 100%);
  border-radius: 12rpx;
  font-size: 32rpx;
  font-weight: bold;
  color: #ffffff;
  border: none;

  &.disabled {
    opacity: 0.5;
  }
}

.history-section {
  padding: 0 32rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #1F2937;
}

.view-all {
  font-size: 28rpx;
  color: #10B981;
}

.empty-state {
  padding: 80rpx 0;
  text-align: center;
}

.empty-text {
  font-size: 28rpx;
  color: #9CA3AF;
}

.solution-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.solution-card {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
}

.card-title {
  flex: 1;
  font-size: 30rpx;
  font-weight: 500;
  color: #1F2937;
}

.card-time {
  font-size: 24rpx;
  color: #9CA3AF;
}

.card-summary {
  font-size: 28rpx;
  color: #6B7280;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 16rpx;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-tags {
  display: flex;
  gap: 16rpx;
}

.tag {
  font-size: 24rpx;
  color: #6B7280;
}

.card-action {
  font-size: 28rpx;
  color: #10B981;
}

.picker-mask {
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

.picker-content {
  width: 100%;
  max-height: 70vh;
  background: #ffffff;
  border-radius: 32rpx 32rpx 0 0;
}

.picker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx;
  border-bottom: 1rpx solid #E5E7EB;
}

.picker-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #1F2937;
}

.picker-close {
  font-size: 48rpx;
  color: #9CA3AF;
}

.picker-list {
  max-height: 60vh;
}

.picker-item {
  padding: 32rpx;
  border-bottom: 1rpx solid #F3F4F6;

  &:active {
    background: #F9FAFB;
  }
}

.picker-item-text {
  font-size: 30rpx;
  color: #1F2937;
}
</style>