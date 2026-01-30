<template>
  <view class="login-container">
    <view class="login-header">
      <image class="logo" src="/static/logo.png" mode="aspectFit" />
      <text class="title">摩塔 Mota</text>
      <text class="subtitle">AI驱动的项目管理平台</text>
    </view>

    <view class="login-form">
      <view class="form-item">
        <view class="input-wrapper">
          <text class="icon">👤</text>
          <input
            v-model="formData.username"
            class="input"
            type="text"
            placeholder="请输入用户名"
            placeholder-class="placeholder"
          />
        </view>
      </view>

      <view class="form-item">
        <view class="input-wrapper">
          <text class="icon">🔒</text>
          <input
            v-model="formData.password"
            class="input"
            :type="showPassword ? 'text' : 'password'"
            placeholder="请输入密码"
            placeholder-class="placeholder"
          />
          <text class="eye-icon" @click="togglePassword">
            {{ showPassword ? '👁️' : '👁️‍🗨️' }}
          </text>
        </view>
      </view>

      <view class="form-actions">
        <label class="remember">
          <checkbox :checked="rememberMe" @change="onRememberChange" />
          <text>记住密码</text>
        </label>
        <text class="forgot" @click="onForgotPassword">忘记密码？</text>
      </view>

      <button
        class="login-btn"
        :class="{ disabled: loading }"
        :disabled="loading"
        @click="onLogin"
      >
        {{ loading ? '登录中...' : '登录' }}
      </button>

      <view class="register-link">
        <text>还没有账号？</text>
        <text class="link" @click="onRegister">立即注册</text>
      </view>
    </view>

    <view class="login-footer">
      <text class="copyright">© 2024 Mota. All rights reserved.</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { authService } from '@/core/auth'

const formData = ref({
  username: '',
  password: ''
})

const showPassword = ref(false)
const rememberMe = ref(false)
const loading = ref(false)

const togglePassword = () => {
  showPassword.value = !showPassword.value
}

const onRememberChange = (e: any) => {
  rememberMe.value = e.detail.value.length > 0
}

const onLogin = async () => {
  if (!formData.value.username) {
    uni.showToast({
      title: '请输入用户名',
      icon: 'none'
    })
    return
  }

  if (!formData.value.password) {
    uni.showToast({
      title: '请输入密码',
      icon: 'none'
    })
    return
  }

  loading.value = true

  try {
    await authService.login({
      username: formData.value.username,
      password: formData.value.password
    })

    uni.showToast({
      title: '登录成功',
      icon: 'success'
    })

    // 跳转到首页
    setTimeout(() => {
      uni.switchTab({
        url: '/pages/index/index'
      })
    }, 1500)
  } catch (error: any) {
    uni.showToast({
      title: error.message || '登录失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

const onForgotPassword = () => {
  uni.showToast({
    title: '请联系管理员重置密码',
    icon: 'none'
  })
}

const onRegister = () => {
  uni.navigateTo({
    url: '/pages/register/index'
  })
}
</script>

<style lang="scss" scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #10B981 0%, #ffffff 50%);
  padding: 0 48rpx;
  display: flex;
  flex-direction: column;
}

.login-header {
  padding-top: 120rpx;
  text-align: center;
  margin-bottom: 80rpx;
}

.logo {
  width: 120rpx;
  height: 120rpx;
  margin-bottom: 24rpx;
}

.title {
  display: block;
  font-size: 48rpx;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 16rpx;
}

.subtitle {
  display: block;
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.9);
}

.login-form {
  background: #ffffff;
  border-radius: 24rpx;
  padding: 48rpx 32rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.08);
}

.form-item {
  margin-bottom: 32rpx;
}

.input-wrapper {
  display: flex;
  align-items: center;
  background: #F3F4F6;
  border-radius: 12rpx;
  padding: 24rpx 20rpx;
}

.icon {
  font-size: 36rpx;
  margin-right: 16rpx;
}

.input {
  flex: 1;
  font-size: 28rpx;
  color: #1F2937;
}

.placeholder {
  color: #9CA3AF;
}

.eye-icon {
  font-size: 36rpx;
  padding: 0 8rpx;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32rpx;
}

.remember {
  display: flex;
  align-items: center;
  font-size: 24rpx;
  color: #6B7280;

  checkbox {
    margin-right: 8rpx;
  }
}

.forgot {
  font-size: 24rpx;
  color: #10B981;
}

.login-btn {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(90deg, #10B981 0%, #059669 100%);
  border-radius: 12rpx;
  font-size: 32rpx;
  font-weight: bold;
  color: #ffffff;
  border: none;
  margin-bottom: 32rpx;

  &.disabled {
    opacity: 0.6;
  }
}

.register-link {
  text-align: center;
  font-size: 28rpx;
  color: #6B7280;

  .link {
    color: #10B981;
    margin-left: 8rpx;
  }
}

.login-footer {
  flex: 1;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 48rpx;
}

.copyright {
  font-size: 24rpx;
  color: #9CA3AF;
}
</style>