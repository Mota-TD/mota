<template>
  <view :class="cardClasses" :style="cardStyle">
    <view v-if="$slots.header || header" class="card-header">
      <slot name="header">
        <text class="card-title">{{ header }}</text>
        <view v-if="$slots.extra" class="card-extra">
          <slot name="extra" />
        </view>
      </slot>
    </view>
    
    <view class="card-body">
      <slot />
    </view>
    
    <view v-if="$slots.footer" class="card-footer">
      <slot name="footer" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  header?: string
  size?: 'sm' | 'md' | 'lg'
  shadow?: 'sm' | 'md' | 'lg' | 'xl'
  bordered?: boolean
  hoverable?: boolean
  clickable?: boolean
  loading?: boolean
  glass?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  shadow: 'sm',
  bordered: true,
  hoverable: false,
  clickable: false,
  loading: false
})

const emit = defineEmits<{
  click: [event: Event]
}>()

const cardClasses = computed(() => {
  const classes = ['card', `card-${props.size}`, `shadow-${props.shadow}`]
  
  if (props.bordered) classes.push('bordered')
  if (props.hoverable) classes.push('hoverable')
  if (props.clickable) classes.push('clickable')
  if (props.loading) classes.push('loading')
  if (props.glass) classes.push('glass-card')
  
  return classes.join(' ')
})

const cardStyle = computed(() => {
  return {
    cursor: props.clickable ? 'pointer' : 'default'
  }
})

const handleClick = (event: Event) => {
  if (props.clickable) {
    emit('click', event)
  }
}
</script>

<style lang="scss" scoped>
@import '../../styles/theme.scss';

.card {
  background: $bg-primary;
  border-radius: $border-radius-lg;
  overflow: hidden;
  transition: all 0.3s ease-in-out;
  
  &.bordered {
    border: 1px solid $border-color;
  }
  
  &.hoverable {
    &:hover {
      transform: translateY(-2rpx);
      box-shadow: $shadow-lg !important;
    }
  }
  
  &.clickable {
    cursor: pointer;
    
    &:active {
      transform: scale(0.98);
    }
  }
  
  &.glass-card {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.3);
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, rgba($primary-color, 0.1), rgba($secondary-color, 0.05));
      z-index: -1;
      border-radius: $border-radius-lg;
    }
    
    &.hoverable:hover {
      transform: translateY(-4rpx);
      box-shadow: 0 12rpx 40rpx rgba(0, 0, 0, 0.4);
    }
  }
}

.card-sm {
  border-radius: $border-radius-md;
}

.card-md {
  border-radius: $border-radius-lg;
}

.card-lg {
  border-radius: $border-radius-xl;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $spacing-lg $spacing-lg $spacing-md;
  border-bottom: 1px solid $border-light;
  
  .card-title {
    font-size: $font-size-lg;
    font-weight: $font-weight-semibold;
    color: $text-primary;
    flex: 1;
  }
  
  .card-extra {
    flex-shrink: 0;
  }
}

.card-body {
  padding: $spacing-lg;
  
  .card-sm & {
    padding: $spacing-md;
  }
  
  .card-lg & {
    padding: $spacing-xl;
  }
}

.card-footer {
  padding: $spacing-md $spacing-lg $spacing-lg;
  border-top: 1px solid $border-light;
  
  .card-sm & {
    padding: $spacing-sm $spacing-md $spacing-md;
  }
  
  .card-lg & {
    padding: $spacing-lg $spacing-xl $spacing-xl;
  }
}

.loading {
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
    animation: loading 1.5s infinite;
  }
}

@keyframes loading {
  0% { left: -100%; }
  100% { left: 100%; }
}
</style>