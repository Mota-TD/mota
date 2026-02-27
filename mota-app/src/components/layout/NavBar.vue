<template>
  <view class="navbar" :style="navbarStyle">
    <view class="navbar-left">
      <slot name="left">
        <view v-if="showBack" class="back-btn" @click="handleBack">
          <text class="back-icon">←</text>
          <text v-if="backText" class="back-text">{{ backText }}</text>
        </view>
        <text v-if="title" class="navbar-title">{{ title }}</text>
      </slot>
    </view>
    
    <view class="navbar-center">
      <slot name="center" />
    </view>
    
    <view class="navbar-right">
      <slot name="right" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  title?: string
  showBack?: boolean
  backText?: string
  fixed?: boolean
  transparent?: boolean
  backgroundColor?: string
  color?: string
  borderBottom?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showBack: false,
  fixed: true,
  transparent: false,
  borderBottom: true
})

const emit = defineEmits<{
  back: []
}>()

const navbarStyle = computed(() => {
  const style: any = {
    height: '88rpx'
  }
  
  if (props.backgroundColor) {
    style.backgroundColor = props.backgroundColor
  } else if (!props.transparent) {
    style.backgroundColor = 'var(--bg-primary, #FFFFFF)'
  }
  
  if (props.color) {
    style.color = props.color
  }
  
  if (props.fixed) {
    style.position = 'fixed'
    style.top = '0'
    style.left = '0'
    style.right = '0'
    style.zIndex = '1000'
  }
  
  if (props.borderBottom) {
    style.borderBottom = '1px solid var(--border-color, #E5E7EB)'
  }
  
  return style
})

const handleBack = () => {
  emit('back')
}
</script>

<style lang="scss" scoped>
@import '../../styles/theme.scss';

.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 $spacing-md;
  height: 88rpx;
  background: $bg-primary;
  border-bottom: 1px solid $border-color;
  
  &.fixed {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
  }
  
  &.transparent {
    background: transparent;
    border-bottom: none;
    backdrop-filter: blur(20px);
    background: rgba(15, 23, 42, 0.8);
  }
}

.navbar-left {
  display: flex;
  align-items: center;
  flex: 1;
  
  .back-btn {
    display: flex;
    align-items: center;
    padding: $spacing-xs;
    margin-right: $spacing-sm;
    cursor: pointer;
    
    .back-icon {
      font-size: $font-size-lg;
      font-weight: $font-weight-bold;
      margin-right: $spacing-xs;
    }
    
    .back-text {
      font-size: $font-size-md;
      color: $text-secondary;
    }
    
    &:active {
      opacity: 0.7;
    }
  }
  
  .navbar-title {
    font-size: $font-size-lg;
    font-weight: $font-weight-semibold;
    color: $text-primary;
  }
}

.navbar-center {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
}

.navbar-right {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex: 1;
  gap: $spacing-sm;
}

/* 安全区域适配 */
.safe-area-top {
  padding-top: constant(safe-area-inset-top);
  padding-top: env(safe-area-inset-top);
}
</style>