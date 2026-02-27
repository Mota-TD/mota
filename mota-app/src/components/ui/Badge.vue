<template>
  <view :class="badgeClasses" :style="badgeStyle">
    <text class="badge-text">{{ content }}</text>
    <text v-if="dot" class="badge-dot"></text>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  content?: string | number
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'
  size?: 'sm' | 'md' | 'lg'
  dot?: boolean
  max?: number
  showZero?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  showZero: false
})

const badgeClasses = computed(() => {
  const classes = ['badge', `badge-${props.variant}`, `badge-${props.size}`]
  if (props.dot) classes.push('badge-dot')
  return classes.join(' ')
})

const badgeStyle = computed(() => {
  return {}
})

const displayContent = computed(() => {
  if (props.dot) return ''
  
  let content = props.content
  if (typeof content === 'number') {
    if (props.max && content > props.max) {
      return `${props.max}+`
    }
    if (content === 0 && !props.showZero) {
      return ''
    }
  }
  return content
})
</script>

<style lang="scss" scoped>
@import '../../styles/theme.scss';

.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: $border-radius-full;
  font-weight: $font-weight-medium;
  line-height: 1;
  white-space: nowrap;
}

.badge-sm {
  padding: 4rpx 8rpx;
  font-size: $font-size-xs;
  min-width: 32rpx;
  height: 32rpx;
}

.badge-md {
  padding: 6rpx 12rpx;
  font-size: $font-size-sm;
  min-width: 40rpx;
  height: 40rpx;
}

.badge-lg {
  padding: 8rpx 16rpx;
  font-size: $font-size-md;
  min-width: 48rpx;
  height: 48rpx;
}

.badge-primary {
  background: $primary-color;
  color: $text-white;
}

.badge-secondary {
  background: $secondary-color;
  color: $text-white;
}

.badge-success {
  background: $success-color;
  color: $text-white;
}

.badge-warning {
  background: $warning-color;
  color: $text-white;
}

.badge-error {
  background: $error-color;
  color: $text-white;
}

.badge-info {
  background: $info-color;
  color: $text-white;
}

.badge-dot {
  width: 16rpx;
  height: 16rpx;
  min-width: auto;
  padding: 0;
  
  &.badge-sm {
    width: 12rpx;
    height: 12rpx;
  }
  
  &.badge-lg {
    width: 20rpx;
    height: 20rpx;
  }
}
</style>