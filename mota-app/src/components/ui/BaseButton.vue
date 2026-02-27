<template>
  <button 
    :class="buttonClasses" 
    :style="buttonStyle"
    @click="handleClick"
    :disabled="disabled"
  >
    <view v-if="loading" class="loading-spinner">
      <text class="spinner">⏳</text>
    </view>
    <view v-else-if="icon" class="icon">
      <text>{{ icon }}</text>
    </view>
    <text :class="textClasses">{{ text }}</text>
    <text v-if="badge" class="badge">{{ badge }}</text>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  text?: string
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'glass'
  size?: 'sm' | 'md' | 'lg'
  icon?: string
  badge?: string | number
  loading?: boolean
  disabled?: boolean
  fullWidth?: boolean
  rounded?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  fullWidth: false,
  rounded: false
})

const emit = defineEmits<{
  click: [event: Event]
}>()

const buttonClasses = computed(() => {
  const classes = ['btn', `btn-${props.variant}`, `btn-${props.size}`]
  
  if (props.fullWidth) classes.push('btn-full')
  if (props.rounded) classes.push('rounded-full')
  if (props.disabled) classes.push('disabled')
  
  return classes.join(' ')
})

const textClasses = computed(() => {
  const classes = ['btn-text']
  if (props.icon || props.loading) classes.push('ml-sm')
  return classes.join(' ')
})

const buttonStyle = computed(() => {
  return {
    width: props.fullWidth ? '100%' : 'auto'
  }
})

const handleClick = (event: Event) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<style lang="scss" scoped>
@import '../../styles/theme.scss';

.btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  outline: none;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  user-select: none;
  
  &.btn-full {
    width: 100%;
  }
  
  &:active {
    transform: scale(0.98);
  }
  
  &.disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }
}

.btn-primary {
  background: linear-gradient(135deg, $primary-color 0%, $primary-light 100%);
  color: $text-white;
  box-shadow: 0 2rpx 8rpx rgba($primary-color, 0.3);
  
  &:active {
    background: linear-gradient(135deg, $primary-dark 0%, $primary-color 100%);
    box-shadow: 0 1rpx 4rpx rgba($primary-color, 0.5);
  }
}

.btn-secondary {
  background: linear-gradient(135deg, $secondary-color 0%, $secondary-light 100%);
  color: $text-white;
  box-shadow: 0 2rpx 8rpx rgba($secondary-color, 0.3);
  
  &:active {
    background: linear-gradient(135deg, $secondary-dark 0%, $secondary-color 100%);
  }
}

.btn-outline {
  background: transparent;
  border: 1px solid $border-color;
  color: $text-primary;
  
  &:active {
    background: $neutral-100;
    border-color: $neutral-300;
  }
}

.btn-ghost {
  background: transparent;
  color: $text-primary;
  
  &:active {
    background: $neutral-100;
  }
}

.btn-glass {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: $text-white;
  box-shadow: 0 4rpx 15rpx rgba(0, 0, 0, 0.2);
  
  &:active {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
  }
}

.btn-sm {
  padding: $spacing-xs $spacing-md;
  font-size: $font-size-sm;
  border-radius: $border-radius-sm;
  min-height: 64rpx;
}

.btn-md {
  padding: $spacing-sm $spacing-lg;
  font-size: $font-size-md;
  border-radius: $border-radius-md;
  min-height: 80rpx;
}

.btn-lg {
  padding: $spacing-md $spacing-xl;
  font-size: $font-size-lg;
  border-radius: $border-radius-lg;
  min-height: 96rpx;
}

.btn-text {
  font-weight: $font-weight-medium;
  line-height: 1;
}

.icon {
  display: flex;
  align-items: center;
  font-size: $font-size-lg;
}

.loading-spinner {
  display: flex;
  align-items: center;
  
  .spinner {
    animation: spin 1s linear infinite;
  }
}

.badge {
  background: $error-color;
  color: $text-white;
  border-radius: $border-radius-full;
  padding: 2rpx 8rpx;
  font-size: $font-size-xs;
  margin-left: $spacing-xs;
  min-width: 32rpx;
  height: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>